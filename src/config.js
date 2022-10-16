const SpotifyWebApi = require("spotify-web-api-node");
const { Client, GatewayIntentBits } = require("discord.js");
const tmi = require("tmi.js");

exports.bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent,     GatewayIntentBits.GuildMessages], allowedMentions: { parse: ['users', 'roles'], repliedUser: true } });

exports.spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENTID,
    clientSecret: process.env.SPOTIFY_CLIENTSECRET,
    redirectUri: "http://localhost/callback",
  });


exports.client = new tmi.Client({
    options: { debug: true },
    identity: {
      username: "crdbot",
      password: process.env.TWITCH_TOKEN,
    },
    channels: ["dexter_landry"],
  });