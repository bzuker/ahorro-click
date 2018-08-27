const Twit = require('twit');
const config = require('./config.js');
const T = new Twit(config.twitter);
const onTweet = require('./onTweet.js');

const getUnanswered = async _ => {
  // Obtengo las últimas respuestas que di
  const userTimeline = await T.get('statuses/user_timeline', { screen_name: 'AhorroClick', count: 200 });
  const answers = userTimeline.data;
  const repliedIds = answers.map(a => a.in_reply_to_status_id_str);

  // Obtengo los últimos tweets que me pidieron
  const timeline = await T.get('statuses/mentions_timeline', { screen_name: 'AhorroClick', count: 200 });
  const requests = timeline.data;
  const unanswered = requests.filter(r => !repliedIds.includes(r.id_str));
  
  return unanswered;
};


module.exports = getUnanswered;