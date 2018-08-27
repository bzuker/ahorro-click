let twitterKeys = {
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
};

let twitterReadKeys = {
    consumer_key: process.env.CONSUMER_KEY_READ,
    consumer_secret: process.env.CONSUMER_SECRET_READ,
    access_token: process.env.ACCESS_TOKEN_READ,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET_READ
};

module.exports = {
  twitter: twitterKeys,
  twitterRead: twitterReadKeys,
  setTwitterKeys: keys => {
    twitterKeys = keys
  },
  getTwitterKeys: _ => twitterKeys
};