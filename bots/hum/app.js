var fs = require('fs');
var d3 = require('d3');
var Twit = require('twit');

var T = new Twit({
  consumer_key: '',
  consumer_secret: '',
  access_token: '',
  access_token_secret: ''
});

var csv = fs.readFileSync("/home/pi/pi-bots/bots/hum/data.csv", 'utf8');
var csvdata = d3.csv.parse(csv);

var fields = Object.keys(csvdata[0]);

makeTweet();

function makeTweet() {
  var field = fields[randRange(1,fields.length-1)];
  var rowIndex = randRange(0,csvdata.length-1);
  if (typeof csvdata[rowIndex][field] !== "undefined") {
    var val = csvdata[rowIndex][field];
    if (val.length > 0) {
      var tweet = "> "+field+"\n"+"> "+val;
      if (tweet.length <= 140) {
        // console.log(tweet);
        doTweet(tweet);
        return;
      }
    }
  }
  makeTweet();
}

function doTweet(tweet) {
  T.post('statuses/update', { status: tweet }, function(error, data, response) {
    if (error) {
      console.log(error);
      makeTweet();
    } else {
      console.log("tweeted: "+tweet);
    }
  });
}

function randRange(min,max) {
  return Math.floor(Math.random()*(max-min+1)+min);
}