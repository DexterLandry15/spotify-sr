import Websocket from 'ws';
import c from 'centra';
import {SpotifyWsSub} from '../services/spotifySubToWs.js';


export class SpotifyWs {

    #token;
    #ws;
    #pingInterval;

    async init(token) {
        if (this.#ws) return;
        this.#token = token
        this.#ws = new Websocket(`wss://${await this.#getDealer()}/?access_token=${this.#token}`);
    }
    async start(conn) {

        this.#ws.on('open', ()=>{
            console.log('[WS] Connected to spotify websocket');
            this.#pingInterval = setInterval(this.#ping, 1000 * 30, this.#ws);
        })

        this.#ws.on('message', async (data) =>{
            data = JSON.parse(data.toString());
            console.log(data);
            if (
                data.type == 'message' &&
                data.uri.startsWith("hm://pusher/v1/connections")
            ) {
                const sub = new SpotifyWsSub(data.headers["Spotify-Connection-Id"], this.#token);

                await sub.start().then((res)=>{
                    if (!res) conn.socket.send(JSON.stringify({"ws": "error"}));
                    console.log('[WS] Subscribed to notifications!')
                    conn.socket.send(JSON.stringify({"ws": "subscribed"}));
                }).catch((e) => {
                    console.error(e)
                });
            } else if (data.payloads?.[0]?.update_reason == "DEVICE_STATE_CHANGED") {

                conn.socket.send(await this.#processMessage(data))
            }
        })

        this.#ws.on('error', (err) => {
            console.error(err)
        })

        this.#ws.on('close', () => {
            clearInterval(this.#pingInterval)
            conn.socket.send('pizdec')
        })

    }



    async stop(){
        if (!this.#ws) return;
        if(this.#ws.readyState === 3) return this.#ws = null;
        this.#ws.close();
        clearInterval(this.#pingInterval);

    }

    async #processMessage(data) {
        const playerState = data.payloads[0].cluster.player_state;

        let queue = [];
        const nextTracks = playerState.next_tracks.slice(0,5)
        await this.#getTracks(await nextTracks.map((e) => { return e.uri })).then((data) => {
            for(const i in nextTracks) {
                queue.push({
                     track: {
                        artists: data.tracks[i].artists.map((e) => {
                            return e.name;
                        }),
                        name: data.tracks[i].name,
                        album: data.tracks[i].album.name,
                        covers: data.tracks[i].album.images
                     },
                     provider: nextTracks[i].provider,

                 })
             }
        })


        return await this.#getTracks(playerState.track.uri).then((data) => {
            if(!data) return ")";
            return JSON.stringify({
                update_reason: "DEVICE_STATE_CHANGED",
                is_paused: data.is_paused,
                track: {
                    artists: data.tracks[0].artists.map((e) => {
                                return e.name;
                            }),
                    name: data.tracks[0].name,
                    album: data.tracks[0].album.name,
                    covers: data.tracks[0].album.images
                    },
                queue: queue
            })
        })
    }

    #ping(ws) {
        ws.send(JSON.stringify({"type": "ping"}));
        console.log('ping')
    }

    async #getTracks(uri) {
        let ids = [];
        if (Array.isArray(uri)) {
            for (const el of uri) {
                if(!el.startsWith('spotify:track:')) return;
                ids.push(el.replace('spotify:track:', ''));
            };
        } else {
            ids.push(uri.replace('spotify:track:', ''));
        }
        return await c(`https://api.spotify.com/v1/tracks`)
                    .query('ids', ids.join(','))
                    .header({
                        'authorization': `Bearer ${this.#token}`,
                    })
                    .send()
                    .then((res) => {
                        if(res.statusCode !=200) return;
                        return JSON.parse(res.body.toString());
                    });
        }

    async #getDealer(){
        return await c('https://apresolve.spotify.com/?type=dealer')
        .send()
        .then((res) => {
            const dealers = JSON.parse(res.body.toString()).dealer
            return dealers[Math.floor(Math.random() * (dealers.length - 1))]
        })
    }
}