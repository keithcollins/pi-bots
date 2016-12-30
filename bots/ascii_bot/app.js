var fs = require('fs');
var d3 = require('d3');
var Twit = require('twit');

var T = new Twit({
  consumer_key: '',
  consumer_secret: '',
  access_token: '',
  access_token_secret: ''
});

var tweetsRaw = fs.readFileSync("/home/pi/pi-bots/example_bots/ascii_bot/tweets.json", 'utf8');
var tweets = JSON.parse(tweetsRaw);

var charpairsRaw = fs.readFileSync("/home/pi/pi-bots/example_bots/ascii_bot/charpairs.json", 'utf8');
var charpairs = JSON.parse(charpairsRaw);

var dictionaryRaw = fs.readFileSync("/home/pi/pi-bots/example_bots/ascii_bot/dictionary.json", 'utf8');
var dictionary = JSON.parse(dictionaryRaw);

var lines = Math.floor(Math.random()*(10-5+1)+5);
var chars = Math.floor(140/lines);
var art = [];
var startchars;
var charpairs;

getCorpus(function(error,data){
  startchars = data[0];
  charpairs = data[1];
  var newLine;
  while (newLine = createLine()) {
    art.push(newLine);
    if (art.length == lines) break;
  }
  var str = art.join("\n");
  T.post('statuses/update', { status: str }, function(error, data, response) {
    if (error) {
      console.log(error);
      if (error.code == 187) doTweet("@collinskeith ?");
    } else {
      console.log("tweeted: "+str);
    }
  });
});

function getCorpus(callback) {
  var charpairs = [];
  var startchars = [];
  T.get('statuses/user_timeline', { screen_name: 'tw1tt3rart', exclude_replies: true, include_rts: false, count: 3200 }, function(err, data, response) {
    data.forEach(function(d){
      d.text.split("\n").forEach(function(line,l){
        startchars.push(line[0]);
        line.split("").forEach(function(character,i){
          var next_char = (line[i+1]) ? line[i+1] : "";
          var prev_char = (line[i-1]) ? line[i-1] : "";
          var next_next_char = (line[i+2]) ? line[i+2] : "";
          var above_char = (l > 0) ? d.text.split("\n")[l-1][i] : null;
          var below_char = (l < d.text.split("\n").length-1) ? d.text.split("\n")[l+1][i] : null;
          var charpair = {
            first_char: character,
            char_pair: character+' '+next_char,
            char_pair_array: [character, next_char],
            next_char: next_char,
            next_next_char: next_next_char,
            prev_char: prev_char,
            position: i,
            above_char: above_char,
            below_char: below_char
          };
          charpairs.push(charpair);
        });
      });
    });
    callback(err,[startchars,charpairs]);
  });
}

function searchPairs(prop, value) {
  var results = charpairs.filter(function(obj) {
    return obj[prop] == value;
  });
  return results;
}

function scoreResults(results) {
  var aboveNest = d3.nest()
    .key(function(d) { return d.above_char; })
    .map(results);

  var nextNest = d3.nest()
    .key(function(d) { return d.next_next_char; })
    .map(results);

  return results.sort(function(a,b){
    // what is the most common character to come after current one?
    // charpair.next_next_char
    var nexta = nextNest[a.next_next_char].length;
    var nextb = nextNest[b.next_next_char].length;
    // what is the most common character to appear above current one?
    // charpair.above_char
    var abovea = aboveNest[a.above_char].length;
    var aboveb = aboveNest[b.above_char].length;
    return (nextb+aboveb) - (nexta+abovea) })[0];
}

function choosePairs(firstChar, secondChar) {
  var result = {};
  var resultWordPair = null;
  var getResult;
  var prop;
  var val;
  if (firstChar && !secondChar) {
    prop = 'first_char';
    val = firstChar;
  } else if (firstChar && secondChar) {
    prop = 'char_pair';
    val = firstChar+" "+secondChar;
  }
  getResult = searchPairs(prop,val);

  // resultWordPair = scoreResults(getResult);
  resultWordPair = getResult[Math.floor(Math.random() * getResult.length)];

  if (typeof resultWordPair === "undefined") {
    result.error = 'end';
    return result;
  }
  result.next_char = (resultWordPair.next_char) ? resultWordPair.next_char : "";
  result.next_next_char = (resultWordPair.next_next_char) ? resultWordPair.next_next_char : "";
  return result;
}

function createLine() {
  var startChar = startchars[Math.floor(Math.random() * startchars.length)];

  // Choose initial word pair by searching this.charpairs for first_word = startWord
  var line = [startChar];
  var initialChars = choosePairs(startChar,null);
  line.push(initialChars.next_char);
  line.push(initialChars.next_next_char);

  var getNewChars;

  // Keep returning more word pairs until not
  while (newChars = choosePairs(line[line.length-2],line[line.length-1])) {
    if (newChars.error === 'end') break;
    line.push(newChars.next_next_char);
    if (line.length == chars) break;
  }
  return line.join("");
}