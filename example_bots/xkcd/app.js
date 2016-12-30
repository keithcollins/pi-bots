var fs = require('fs');
var Twit = require('twit');

var T = new Twit({
  consumer_key: '',
  consumer_secret: '',
  access_token: '',
  access_token_secret: ''
});

var xkcd = [

  {f:"allegedly",r:"kinda probably"},
  {f:"new study",r:"tumblr post"},
  {f:"space",r:"spaaace"},
  {f:"google glass",r:"virtual boy"},
  {f:"senator",r:"elf-lord"},
  {f:"election",r:"eating contest"},
  {f:"congressional leaders",r:"river spirits"},
  {f:"could not be reached for comment",r:"is guilty and everyone knows it"},
  {f:"debate",r:"dance-off"},
  {f:"self-driving",r:"uncontrollably swerving"},
  {f:"poll",r:"psychic reading"},
  {f:"candidate",r:"airbender"},
  {f:"vows to",r:"probably won't"},
  {f:"at large",r:"very large"},
  {f:"expands",r:"physically expands"},
  {f:"first-degree",r:"friggin' awful"},
  {f:"second-degree",r:"friggin' awful"},
  {f:"third-degree",r:"friggin' awful"},
  {f:"an unknown number",r:"like hundreds"},
  {f:"front runner",r:"blade runner"},
  {f:"front-runner",r:"blade runner"},
  {f:"frontrunner",r:"blade runner"},
  {f:"global",r:"spherical"},
  {f:"urged restraint",r:"drunkenly egged on"},
  {f:"horsepower",r:"tons of horsemeat"},
  {f:"gaffe",r:"magic spell"},
  {f:"ancient",r:"haunted"},
  {f:"remains to be seen",r:"will never be known"},
  {f:"silver bullet",r:"way to kill werewolves"},
  {f:"subway system",r:"tunnels I found"},
  {f:"war of words",r:"interplanetary war"},
  {f:"tension",r:"sexual tension"},
  {f:"cautiously optimistic",r:"delusional"},
  {f:"win votes",r:"find pokémon"},
  {f:"win the votes",r:"find the pokémon"},
  {f:"get the votes",r:"find the pokémon"},
  {f:"behind the headlines",r:"beyond the grave"},
  {f:"facebook ceo",r:"this guy"},
  {f:"meeting",r:"ménage à trois"},
  {f:"scientists",r:"Channing Tatum and his friends"},
  {f:"you won't believe",r:"I'm really sad about"}
];

// removed
// {f:"car",r:"cat"},
// {f:"drone",r:"dog"},
// {f:"years",r:"minutes"},
// {f:"minutes",r:"years"},
// {f:"surprising",r:"surprising (but not to me)"},
// {f:"doctor who",r:"the big bang theory"},
// {f:"latest",r:"final"},
// {f:"disrupt",r:"destroy"},
// {f:"no indication",r:"lots of signs"},
// {f:"successfully",r:"suddenly"},
// {f:"witnesses",r:"dudes i know"},
// {f:"rebuild",r:"avenge"},
// {f:"smartphone",r:"pokédex"},
// {f:"electric",r:"atomic"},
// {f:"homeland security",r:"homestar runner"},
// {f:"star-studded",r:"blood-soaked"},
// {f:"email",r:"poem"},
// {f:"facebook post",r:"poem"},
// {f:"tweet",r:"poem"},

var tries = 0;
doTweet(getFr());

function decodeHTMLEntities(text) {
  var entities = [
    ['apos', '\''],
    ['amp', '&'],
    ['lt', '<'],
    ['gt', '>']
  ];
  for (var i = 0, max = entities.length; i < max; ++i)
    text = text.replace(new RegExp('&'+entities[i][0]+';', 'g'), entities[i][1]);
  return text;
}

function getFr() {
  var min = 0;
  var max = xkcd.length-1;
  return xkcd[Math.floor(Math.random()*(max-min+1)+min)];
}

function doTweet(fr) {
  if (tries >= 40) {
    console.log("failed: too many tries, quitting");
    return;
  }
  tries++;
  var re = new RegExp(fr.f,"gi");
  T.get('search/tweets', {q: fr.f, result_type: "popular", count: 100, lang: "en"})
    .catch(function (err) {
      console.log('caught error', err.stack);
      doTweet(getFr());
    })
    .then(function (result) {
      // data.statuses.sort(function(a,b){ return (+b.retweet_count)-(+a.retweet_count) });
      var data = result.data;
      var index = Math.floor(Math.random() * data.statuses.length-1) + 0;

      if (data.statuses[index]) {
        var tweetObj = data.statuses[index];
        // remove URLs, RT, MT from source tweet
        var text = tweetObj.text
          .replace(/(?:https?|ftp):\/\/[\n\S]+/gi,"")
          .replace(/\bRT\b|\bMT\b/g,"")
          .trim()
          .toLowerCase();
        // create tweet with replaced text, trimmed, lower case
        var newText = decodeHTMLEntities(text)
          .replace(re,fr.r)
          .trim()
          .toLowerCase();
        // add . if tweet starts with @
        if (newText[0] == "@") newTweet = "."+newText;
        // make sure outgoing tweet still contains match, is short enough
        if (re.test(text) && newText.length <= 116) {
          var url = "https://twitter.com/"+tweetObj.user.screen_name+"/status/"+tweetObj.id_str;
          var str = newText+" "+url;
          T.post('statuses/update', { status: str }, function(error, data, response) {
            if (error) {
              console.log(error);
              if (error.code == 187) doTweet("@collinskeith ?");
            } else {
              console.log("tweeted: "+str);
            }
          });
        } else {
          console.log("failed: no match or too long, trying again");
          doTweet(getFr());
        }
      } else {
        console.log("failed: no result, trying again");
        doTweet(getFr());
      }
    });
}