const Twit = require('twit');
const config = require('./config.js');
const T = new Twit(config.twitter);

const topFollowers = async _ => {
  console.log('Getting all tweets..');
  const tweets = await getTweetsForToday();
  //console.log({tweets});
  
  const countByUser = tweets.reduce((prev, curr) => {
    const currentUser = curr.in_reply_to_screen_name;
    if (!prev[currentUser]) {
     return Object.assign({}, prev, { [currentUser]: 1 })
    }
    
    prev[currentUser]++;
    return prev;
    
  }, {});
  console.log(countByUser);
  
  const excludedUsers = ['_SisiOk', '__brianz'];
  const sortedUsersDesc = Object.keys(countByUser)
    .sort((a, b) => countByUser[b] - countByUser[a])
    .filter(x => x !== '_SisiOk' && x !== '__brianz');
  const topThree = sortedUsersDesc.slice(0, 3);
  const userCount = Object.keys(countByUser).length;
  
  let text = `🔔 Usuarios que más clicks ahorraron hoy 🔔
🥇 @${topThree[0]} (${countByUser[topThree[0]]})
🥈 @${topThree[1]} (${countByUser[topThree[1]]})
🥉 @${topThree[2]} (${countByUser[topThree[2]]})

👥 Usuarios totales: ${userCount}
🔗 Total Ahorrado: ${tweets.length}`;
  
  return text;
}

const getTweetsForToday = async _ => {
  let tweets = [];
  let lastTweet = {}
  while(true) {
    const timeline = await T.get('statuses/user_timeline', { screen_name: 'AhorroClick', count: 200, max_id: lastTweet.id_str });
    tweets = [...tweets, ...timeline.data];
    lastTweet = tweets[tweets.length - 1];
    const lastDate = new Date(lastTweet.created_at);
    const today = new Date();
    
    if (lastDate.getUTCDate() !== today.getUTCDate()) {
      console.log('All tweets:', tweets);
      const tweetsForToday = tweets.filter(t => (new Date(t.created_at)).getUTCDate() === today.getUTCDate());
      return tweetsForToday;
    }
  }
}

module.exports = topFollowers;