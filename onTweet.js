const Twit = require('twit');
const config = require('./config.js');
const T = new Twit(config.twitter);
const G = new Twit(config.twitterRead);
const { promisify } = require("es6-promisify");
const takeScreenshots = require('./takeScreenshots.js');
const sendEmail = require('./sendEmail.js');
const uploadMedia = promisify(T.postMediaChunked.bind(T));

const triesPerTweet = {};

const onTweet = async tweet => {
  console.log(`I recieved a tweet from ${tweet.user.screen_name}`);
  console.log(`It says: "${tweet.text}"`);
  console.log(`TweetId: ${tweet.id_str}`);
  
  if (triesPerTweet[tweet.id_str] >= 5) {
    console.error('Tried this tweet too many times. Aborting...');
    try {
      await T.post('statuses/update', {
          in_reply_to_status_id: tweet.id_str,
          auto_populate_reply_metadata: true,
          status: '[🤖] Intenté entrar varias veces y no pude. Parece que se pusieron la gorra y nos bloquearon (🚔). Vamos a intentar solucionarlo. Intentá nuevamente!'
        });
    }
    catch(error) {
      console.error('Something happened while posting:', error.message);
    }
    
    return;
  }

  if (!tweet.in_reply_to_status_id_str) {
    console.error('There is no parent id');
    return;
  }
  
  // Search the parent tweet
  console.log('Getting parent tweet');
  let parentTweet;
  try {
  parentTweet = await G.get(`statuses/show`, { id: tweet.in_reply_to_status_id_str, tweet_mode: 'extended' });
  }
  catch (error) {
    if (error.code === 136) {
      console.error('User has blocked us');
      await T.post('statuses/update', {
        in_reply_to_status_id: tweet.id_str,
        auto_populate_reply_metadata: true,
        status: 'Ese usuario se puso la gorra (🚔) y nos bloqueó. Estamos trabajando para corregirlo'
      });
    }
    
    console.log('Something happened:', error.message);
    return;
  }
  
  console.log(`Got it. It says '${parentTweet.data.full_text}'`);
  
  if (parentTweet.data.entities.urls.length === 0) {
    console.error('No urls to go to');
    return;
  }
  
  triesPerTweet[tweet.id_str] = triesPerTweet[tweet.id_str] 
  ? (triesPerTweet[tweet.id_str] + 1) 
  : 1;
  
  // Get the url
  const url = parentTweet.data.entities.urls[0].expanded_url;
  
  // Take the screenshot
  console.log(`Taking screenshots from ${url}`);
  const screenshots = await takeScreenshots(url, triesPerTweet[tweet.id_str]);
  
  // Upload screenshots
  const filePath1 = __dirname + '/.data/screenshot1.png';
  const filePath2 = __dirname + '/.data/screenshot2.png';  
  const filePath3 = __dirname + '/.data/screenshot3.png';

  console.log('Uploading media...');

  await Promise.all([
    uploadMedia({ file_path: filePath1 }),
    uploadMedia({ file_path: filePath2 }),
    uploadMedia({ file_path: filePath3 }),
  ]).then(async ([m1, m2, m3]) => {
    console.log('Media uploaded');
    console.log('Tweeting photo');
    try {
      await T.post('statuses/update', { 
        media_ids: [m1.media_id_string, m2.media_id_string, m3.media_id_string], 
        in_reply_to_status_id: tweet.id_str,
        auto_populate_reply_metadata: true
      });
    }
    catch(error){
      console.log(error);
      console.error('Could not answer tweet.');
      return;
    }

    console.log(`All done.`);
    console.log(`Original poster was ${parentTweet.data.user.screen_name}`);
  });
}



module.exports = onTweet;