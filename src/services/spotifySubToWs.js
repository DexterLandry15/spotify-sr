import c from 'centra';

export class SpotifyWsSub {

    constructor(connectionId, token) {
        this.connectionId = connectionId;
        this.token = token;
        this.timeout = 2000;
    }

    async start() {
        console.log('[WS] Starting...')

        return (await this.#putDevice(this.connectionId, this.token)).statusCode == 200
            &&  (await this.#registerDevice(this.connectionId, this.token)).statusCode == 200

    }

    async #putDevice(connectionId, token) {
        await this.#timeout(this.timeout);
        return await c('https://guc-spclient.spotify.com/track-playback/v1/devices', 'POST')
        .header({
            "authorization": `Bearer ${token}`,
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36"
        })
        .body({
            "device": {
                "brand": "spotify",
                "capabilities": {
                    "change_volume": true,
                    "enable_play_token": true,
                    "supports_file_media_type": true,
                    "play_token_lost_behavior": "pause",
                    "disable_connect": false,
                    "audio_podcasts": true,
                    "video_playback": true,
                    "manifest_formats": [
                        "file_ids_mp3",
                        "file_urls_mp3",
                        "manifest_ids_video",
                        "file_urls_external",
                        "file_ids_mp4",
                        "file_ids_mp4_dual"
                    ]
                },
                "device_id": "81c22a719931f692017eefdb66094c5f3f88ae7e",
                "device_type": "computer",
                "metadata": {},
                "model": "web_player",
                "name": "Web Player (Chrome)",
                "platform_identifier": "web_player windows 10;chrome 114.0.0.0;desktop",
                "is_group": false
            },
            "outro_endcontent_snooping": false,
            "connection_id": connectionId,
            "client_version": "harmony:4.35.0-a9ad4560",
            "volume": 65535
        })
        .send()
        .then((res) => {
            return res;
        })

    }
    async #registerDevice(connectionId, token) {
        await this.#timeout(this.timeout);
        return await c('https://guc-spclient.spotify.com/connect-state/v1/devices/hobs_busetinha', 'PUT')
        .header({
            "authorization": `Bearer ${token}`,
            "x-spotify-connection-id": connectionId,
            "user-agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36",
            "sec-fetch-site": "same-site",
            "sec-fetch-mode": "cors",
            "sec-fetch-dest": "empty",
        })
        .body({
            "member_type": "CONNECT_STATE",
            "device": {
                "device_info": {
                    "capabilities": {
                        "can_be_player": false,
                        "hidden": true,
                        "needs_full_player_state": true
                    }
                }
            }
        })
        .send()
        .then((res) => {
            return res;
        })
    }
    #timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}