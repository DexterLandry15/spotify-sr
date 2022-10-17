const SpotifyWebApi = require("spotify-web-api-node");
const tmi = require("tmi.js");

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
