require("dotenv").config();
const { spotifyApi, client } = require("../config");
const { getToken } = require("./spotify");

async function get_current() {
	let data;
	await spotifyApi.getMyCurrentPlayingTrack().then(function (res) {
		if (Object.keys(res.body).length == 0) {
			data = "nothing"
		} else {
			let track_info = res.body.item;
				data = `${track_info.artists
					.map((e) => {
						return e.name;
					})
					.join(", ")} - ${track_info.name}`;
		}
	});
	return data;
}

async function song_request(name) {
	let res;
	if (!name) {
		res = "ok";
	} else {
		await spotifyApi.searchTracks(name, { limit: 1 }).then(
			function (data) {
				let track_info = data.body.tracks.items[0];
				if (!!track_info) {
					res = `added to queue: ${track_info.artists
						.map((e) => {
							return e.name;
						})
						.join(", ")} - ${track_info.name}`;
					spotifyApi.addToQueue(track_info.external_urls.spotify);
				} else {
					res = "not found";
				}
			},
			function (err) {
				console.error(err);
			}
		);
	}
	return res;
}
async function skip() {
	await spotifyApi.skipToNext();
}

exports.connect_client = () => {
	client.connect().then(() => {
		getToken()
	});
};
let player = false;

//player
client.on("message", async (channel, tags, message, self) => {
	if (self || !message.startsWith("!")) return;
	tags[""]
	const args = message.slice(1).split(" ");
	const command = args.shift().toLowerCase();

	switch (command) {
		case "np":
		case "cr":
			client.say(channel, await get_current());
			break;
		case "sr":
			if (!player) {
				client.say(channel, "disabled");
			} else {
				client.say(channel, await song_request(args.join(" ")));
			}
			break;
		case "skip":
			if (tags["mod"] && player === true) {
				await skip();
				client.say(channel, "skipped");
			} else {
				client.say(channel, "ligma balls");
			}
			break;
		case "p":
		case "player":
			if (!args[0]) {
				client.say(channel, `${player}`);
			}
			if (tags["display-name"] === "dexter_landry") {
				switch (args[0]) {
					case "e":
					case "enable":
						player = true;
						break;
					case "d":
					case "disable":
						player = false;
						break;
				}
			} else {
				client.say(channel, "ligma balls");
			}
			break;
	}
});
