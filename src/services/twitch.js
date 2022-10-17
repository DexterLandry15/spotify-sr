require("dotenv").config();
const { spotifyApi, client } = require("../config");

async function get_current() {
	let data;
	await spotifyApi.getMyCurrentPlayingTrack().then(function (res) {
    let track_info = res.body.item;
		data = `${track_info.artists.map((e) => {return e.name}).join(', ')} - ${track_info.name}`;
	});

	return data;
}

async function song_request(name) {
	let res;
	await spotifyApi.searchTracks(name, { limit: 1 }).then(
		function (data) {
      let track_info = data.body.tracks.items[0];
			if (!!track_info) {

				res = `added to queue: ${track_info.artists.map((e) => {return e.name}).join(', ')} - ${track_info.name}`;
				spotifyApi.addToQueue(track_info.external_urls.spotify);
			} else {
				res = "not found";
			}
		},
		function (err) {
			console.error(err);
		}
	);

	return res;
}
async function skip() {
	await spotifyApi.skipToNext();
}

exports.connect_client = () => {
	client.connect();
};

client.on("message", async (channel, tags, message, self) => {
	if (self || !message.startsWith("!")) return;

	const args = message.slice(1).split(" ");
	const command = args.shift().toLowerCase();

	switch (command) {
		case "np":
		case "cr":
			client.say(channel, await get_current());
			break;
		case "sr":
			client.say(channel, await song_request(args.join(" ")));
			break;
		case "skip":
			if (tags["mod"] || tags["badges"]["broadcaster"]) {
				await skip();
				client.say(channel, "skipped");
			} else {
				client.say(channel, "ligma balls");
			}
	}
});
