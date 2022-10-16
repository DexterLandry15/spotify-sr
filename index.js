require('dotenv').config()
const SpotifyWebApi = require('spotify-web-api-node');
const TwitchBot = require('twitch-bot')
const start_server = require('./server')
const { spotifyApi } = require('./spotify')

start_server()

const Bot = new TwitchBot({
    username: 'crdbot',
    oauth: process.env.TWITCH_TOKEN,
    channels: ['dexter_landry']
  })

async function get_current() {
  let data;
    await spotifyApi.getMyCurrentPlayingTrack()
    .then(function(res) {
      data = `${res.body.item.artists[0].name} - ${res.body.item.name}`;
  });
    return data;
};


/* async function song_request(name) {
    spotifyApi.searchTracks(name)
    .then(function(data) {
      console.log(data.body);
    }, function(err) {
      console.error(err);
    });
} */



Bot.on('join', async channel => {
  console.log(`Joined channel: ${channel}`)
})

Bot.on('error', err => {
  console.log(err)
})

Bot.on('message', async chatter => {
  const command = chatter.message.toLowerCase()

  switch(command) {
    case "!np":
      Bot.say(await get_current());
      break
    case "!cr":
      Bot.say(await get_current());
      break
    }


})
