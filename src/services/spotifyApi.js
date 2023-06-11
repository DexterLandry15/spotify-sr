import p from 'phin';
import * as dotenv from 'dotenv';
import { DB } from './db.js';

dotenv.config({ path: "../../.env" });
const db = new DB('users');

export class SpotifyApi {

    spotifyApiUrl = `https://api.spotify.com/v1`;


    async nowPlaying(channel) {
        return await this._checkToken(channel).then(async (token) => {
            let res = await p({
                url: `${this.spotifyApiUrl}/me/player`,
                headers: this._headers(token)
            });
            if (!res.body.toString()) {
                return false
            } else  {
                return JSON.parse(res.body.toString());

            }
        });
    };

    async skip(channel) {
        return await this._checkToken(channel).then(async (token) => {
            return await p({
                url: `${this.spotifyApiUrl}/me/player/next`,
                method: 'POST',
                headers: this._headers(token)
            })
        })
    }

    async addToQueue(channel, query) {
        let data = await this.searchTrack(channel, query)
        if (!data) return false;
        return await this._checkToken(channel).then(async (token) => {
            await p({
                url: `${this.spotifyApiUrl}/me/player/queue?uri=${data.track.uri}`,
                method: 'POST',
                headers: this._headers(token)
            })
            return data.track;
        });
    }

    async searchTrack(channel, query) {
        return await this._checkToken(channel).then(async (token) => {
            const res = await p({
                url: `${this.spotifyApiUrl}/search?q=${query}&type=track&limit=1`,
                headers: this._headers(token)
            });
            const data = JSON.parse(res.body.toString())
            if (!data.tracks.items[0]) return false;
            return {token: token, track: data.tracks.items[0]};
        });
    };

    async getQueue(channel) {
        return this._checkToken(channel).then(async (token) => {
            const res = await p({
                url: `${this.spotifyApiUrl}/me/player/queue`,
                headers: this._headers(token)
            });
            return res.body.toString()
        });
    };

    async _checkToken(channel) {
        const userData = db.getRow('user', channel);
        if (userData.expiration_time > Date.now()) {
            return userData.token
        } else {
            return await this._updateToken(channel, userData.sp_dc).then((token) => {
                return token
            });

        }
    };

    async _updateToken(channel, sp_dc) {
        const res = await p({
            url: 'https://open.spotify.com/get_access_token?reason=transport&productType=web_player',
            headers: {
                'Content-Type': 'application/json',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36',
                'cookie': `sp_dc=${sp_dc}`
            },
        });
        const data = JSON.parse(res.body.toString());
        db.set('user', channel, {token: data.accessToken, expiration_time: data.accessTokenExpirationTimestampMs});
        return data.accessToken;
    }

    _headers(token) {
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

}