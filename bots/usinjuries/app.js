var fs = require('fs');
var d3 = require('d3');
var Twit = require('twit')

var T = new Twit({
  consumer_key: '',
  consumer_secret: '',
  access_token: '',
  access_token_secret: ''
});

// Note: the data file is not supplied in this example
var csv = fs.readFileSync("/home/pi/pi-bots/bots/usinjuries/descs2.csv", 'utf8');
var csvdata = d3.csv.parse(csv);

function getNarrative(count) {
  var str = csvdata[count].narrative
    .replace(/\W+/g, " ")
    .replace("  "," ")
    .replace(" YOF","-YR-OLD FEMALE")
    .replace(" YOM","-YR-OLD MALE")
    .replace("YOF","-YR-OLD FEMALE")
    .replace("YOM","-YR-OLD MALE");
  var str2 = "";
  str.split("").forEach(function(chr,i){
    if (i < 140) str2 += chr;
  });
  doTweet(str2,csvdata[count].date);
}

function doTweet(narrative,date) {
  T.post('statuses/update', { status: narrative }, function(error, data, response) {
    if (error) {
      console.log(error);
      if (error.code == 187) doTweet("@collinskeith check at count on "+date,date);
    } else {
      console.log("tweeted: "+narrative);
    }
  });
}

T.get('statuses/user_timeline', { screen_name: 'usinjuries', count: 1 }, function(err, data, response) {
  var prevTweets = +data[0].user.statuses_count;
  var count = (prevTweets >= 71) ? prevTweets - 71 : prevTweets;
  getNarrative(count);
});
