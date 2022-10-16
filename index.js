require('dotenv').config()
const SpotifyWebApi = require('spotify-web-api-node');
const TwitchBot = require('twitch-bot')

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENTID,
  clientSecret: process.env.SPOTIFY_CLIENTSECRET,
  redirectUri: 'http://localhost/callback'
});


const authorizationCode = process.env.SPOTIFY_CODE;

// When our access token will expire
let tokenExpirationEpoch;

// First retrieve an access token
spotifyApi.authorizationCodeGrant(authorizationCode).then(
  function(data) {
    // Set the access token and refresh token
    spotifyApi.setAccessToken(data.body['access_token']);
    spotifyApi.setRefreshToken(data.body['refresh_token']);

    // Save the amount of seconds until the access token expired
    tokenExpirationEpoch =
      new Date().getTime() / 1000 + data.body['expires_in'];
    console.log(
      'Retrieved token. It expires in ' +
        Math.floor(tokenExpirationEpoch - new Date().getTime() / 1000) +
        ' seconds!'
    );
  },
  function(err) {
    console.log(
      'Something went wrong when retrieving the access token!',
      err.message
    );
  }
);

// Continually print out the time left until the token expires..
let numberOfTimesUpdated = 0;

setInterval(function() {
  console.log(
    'Time left: ' +
      Math.floor(tokenExpirationEpoch - new Date().getTime() / 1000) +
      ' seconds left!'
  );

  // OK, we need to refresh the token. Stop printing and refresh.
  if (++numberOfTimesUpdated > 5) {
    clearInterval(this);

    // Refresh token and print the new time to expiration.
    spotifyApi.refreshAccessToken().then(
      function(data) {
        tokenExpirationEpoch =
          new Date().getTime() / 1000 + data.body['expires_in'];
        console.log(
          'Refreshed token. It now expires in ' +
            Math.floor(tokenExpirationEpoch - new Date().getTime() / 1000) +
            ' seconds!'
        );
      },
      function(err) {
        console.log('Could not refresh the token!', err.message);
      }
    );
  }
}, 1000);



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


async function song_request(name) {
    spotifyApi.searchTracks(name)
    .then(function(data) {
      console.log(data.body);
    }, function(err) {
      console.error(err);
    });
}



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
