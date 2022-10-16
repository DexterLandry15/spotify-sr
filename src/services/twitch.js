require("dotenv").config();
const { spotifyApi, client } = require("../config");

async function get_current() {
  let data;
  await spotifyApi.getMyCurrentPlayingTrack().then(function (res) {
    data = `${res.body.item.artists[0].name} - ${res.body.item.name}`;
  });
  return data;
}

async function song_request(name) {
  let res;
  await spotifyApi.searchTracks(name, { limit: 1 }).then(
    function (data) {
      let song_url = data.body.tracks.items[0].external_urls.spotify;
      res = `added to queue: ${data.body.tracks.items[0].artists[0].name} - ${data.body.tracks.items[0].name}`;
      spotifyApi.addToQueue(song_url);
    },
    function (err) {
      console.error(err);
    }
  );
  return res;
}
async function skip() {
  spotifyApi.skipToNext()
  .then(function() {
  }, function(err) {
    //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
    console.log(err);
  });
}


exports.connect_client = () => {client.connect();}

client.on("message", async (channel, tags, message, self) => {
  if (self || !message.startsWith("!")) return;

  const args = message.slice(1).split(" ");
  const command = args.shift().toLowerCase();

  switch (command) {
    case "np":
      client.say(channel, await get_current());
      break;
    case "cr":
      client.say(channel, await get_current());
      break;
    case "sr":
      client.say(channel, await song_request(args.join(" ")));
      break;
    case "skip": tags["badges"]
      if (tags["mod"] || tags["badges"]["broadcaster"]) {
        await skip()
        client.say(channel, 'ok')

      } else {
        client.say(channel, 'ligma balls')

      }
  }
});


