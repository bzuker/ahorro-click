require('dotenv').load();

// init project
const express = require('express');
const app = express();
const axios = require('axios');
const Twit = require('twit');
const config = require('./config.js');
console.log(config);
let T = new Twit(config.twitter);
const onTweet = require('./onTweet.js');
const getUnanswered = require('./getUnanswered.js');
const topFollowers = require('./topFollowers.js');
const sendEmail = require('./sendEmail.js');
const getTokens = require('./renew-token/getTokens.js');

let queue = [];
let streamHasStarted = false;
let isRunning = false;
let updatingKeys = false;

const processQueue = async _ => {
  if (isRunning) {
    console.log('There is a tweet being processed');
    return;
  }

  if (queue.length === 0 || updatingKeys) {
    return;
  }

  isRunning = true;

  const tweet = queue.shift();

  try {
    await onTweet(tweet);
  } catch (error) {
    if (error.code === 89) {
      console.log('Invalid token, stopping process');
      checkConnection();
      return;
    }

    console.error('There was an error:', error.message);
    queue.push(tweet);
    console.log('Retrying everything');
  }

  isRunning = false;

  processQueue();
};

const processUnanswered = async _ => {
  isRunning = true;

  try {
    const unanswered = await getUnanswered();
    queue = queue.concat(unanswered);
  } catch (error) {
    console.log(error);
  }

  isRunning = false;
  processQueue();
};

const checkConnection = async _ => {
  try {
    console.log('Checking connection..');
    const tweet = await T.get('statuses/show', { id: '1027869816542175232' });
    console.log('Connection Ok');
  } catch (error) {
    queue = [];
    console.error('Connection error, trying to update keys...');
    await updateT();
  }
};

const updateT = async _ => {
  if (updatingKeys) {
    console.log('Already updating keys');
    return;
  }
  try {
    axios.get(`https://ahorro-click-telegram-bot.glitch.me/?message=Actualizando las claves`);
    updatingKeys = true;
    const tokens = await getTokens();
    updatingKeys = false;
    let keys = config.twitter;
    keys.access_token = tokens.accessToken;
    keys.access_token_secret = tokens.tokenSecret;
    config.setTwitterKeys(keys);
    T = new Twit(config.getTwitterKeys());
    streamHasStarted = false;
    processUnanswered();
    startStream();
  } catch (error) {
    axios.get(`https://ahorro-click-telegram-bot.glitch.me/?message=No pude`);
    console.log('Could not update keys. Aborting..');
    console.log(error);
    updatingKeys = false;
    return;
  }
};

const startStream = async _ => {
  try {
    const stream = T.stream('statuses/filter', { track: ['@AhorroClick'] });
    streamHasStarted = true;
    console.log('Stream started');
    stream.on('error', error => {
      console.log(error.message);
      checkConnection();
    });
    stream.on('tweet', async tweet => {
      queue = [tweet, ...queue];

      try {
        processQueue();
      } catch (error) {
        console.error('We broke everything:', error);
      }
    });
  } catch (error) {
    console.log(error);
    await updateT();
  }
};

app.get('/', async function(req, res) {
  if (streamHasStarted) {
    console.log('I already had a stream running');
    checkConnection();
    res.send('OK, already running');
    return;
  }

  startStream();

  res.send('OK');
});

app.get('/processUnanswered', async (req, res) => {
  const pwd = req.query.pwd;
  if (pwd !== process.env.PASSWORD) {
    return;
  }

  await processUnanswered();

  res.send('Unanswered tweets were processed');
});

app.get('/topFollowers', async (req, res) => {
  const pwd = req.query.pwd;

  if (pwd !== process.env.PASSWORD) {
    console.error('An attempt to post without password was made');
    res.send('WRONG PASSWORD');
    return;
  }

  try {
    const status = await topFollowers();
    console.log('Posting Top Followers: ', status);
    await T.post('statuses/update', { status: status });
    console.log('Posted');
  } catch (error) {
    console.error(`Couldn't post top followers`, error);
  }

  res.send('Top followers posted');
});

app.get('/renewToken', async (req, res) => {
  const tokens = await getTokens();
  console.log({ tokens });
  res.send('done');
});

app.get('/queue', (req, res) => {
  res.send(`Quedan ${queue.length} para procesar`);
});

app.get('/resetQueue', (req, res) => {
  console.log('Resetting queue');
  queue = [];
});

const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
