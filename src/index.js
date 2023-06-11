import tmi from 'tmi.js';
import * as dotenv from 'dotenv';
import { SpotifyApi } from './services/spotifyApi.js';
import { DB } from './services/db.js';

dotenv.config();

const restrictedMsg = "you don't have rights to use this command";
const db = new DB('users');
const api = new SpotifyApi();
const client = new tmi.Client({
        options: { debug: true },
        identity: {
            username: "crdbot",
            password: process.env.TWITCH_TOKEN,
        },
        channels: await db.getCol('user'),
});
client.connect();
client.on('message', async (channel, tags, message, self) => {
    if (self || !message.startsWith("!")) return;
	const args = message.slice(1).split(" ");
	const command = args.shift().toLowerCase();
    const channelName = channel.replace('#', '')
    let player = await db.getRow('user', channelName).player;

    switch (command) {
        case "p":
		case "player":
			if (tags["badges"] && tags["badges"]["broadcaster"]) {
				switch (args[0]) {
					case "e":
					case "enable":
						db.set('user', channelName, {player: 1})
                        client.say(channel, 'player has been enabled on this channel!')
						break;
					case "d":
					case "disable":
                        db.set('user', channelName, {player: 0})
                        client.say(channel, 'player has been disabled on this channel!')
						break;
                    default:
                        client.say(channel, (player ? 'enabled' : 'disabled'));
                        break;
            }
        } else {
            client.say(channel, restrictedMsg);
        }
    }

    if (!player) return;
    switch (command) {
        case 'np':
        case 'cr':
            client.say(channel, await api.nowPlaying(channelName).then((data) => {
                if (!data) {
                    return "nothing";
                } else {
                        return `${data.item.artists.map((e) => {
                                return e.name;
                            }).join(", ")} - ${data.item.name}`;
                };
            })
            );
        break;
        case 'skip':
            if ((tags["mod"] || (tags["badges"] && tags["badges"]["broadcaster"]))) {
                    await api.skip(channelName);
                    client.say(channel, 'skipped');
                } else {
                    client.say(channel, restrictedMsg);
                }
        break;
        case 'sr':
            client.say(channel, 'added to queue: ' + await api.addToQueue(channelName, args).then((data) => {
                if (!data) return 'нихуя не аддед я не нашол';
                return `${data.artists.map((e) => {
                    return e.name;
                }).join(", ")} - ${data.name}`;
            }));
        break;
    }
    if (channelName === 'dexter_landry') {
        switch (command) {
            case 'test':{
                client.say(channel, 'ok');
                console.log(await api.getQueue(channelName))
                break;
                }
        }
    }
})