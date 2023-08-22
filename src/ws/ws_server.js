import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import crypto from 'crypto';
import {SpotifyWs} from './ws_client.js';
import { DB } from '../services/db.js';
import { SpotifyApi } from '../services/spotifyApi.js';


const api = new SpotifyApi();
const wsDb = new DB('ws_users');
export const app = Fastify({
    logger: {
        transport: {
            target: 'pino-pretty',
            options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
            },
        }
    }
})

export function initWsDb() {
    const db = wsDb.getAll();
    for (let user of db) {
        wsDb.set('username', user.username, {connections: 0});
        if (!user.token) {
            wsDb.set('username', user.username, {token: crypto.randomBytes(32).toString('hex')});
        }
    }
}


await app.register(websocket);


app.get('/', {websocket: true}, (conn, req) => {

    app.log.info('[WS] Connected')

    let ws = new SpotifyWs()

    conn.socket.on('message', async message => {
        message = message.toString()
        try {
            message = JSON.parse(message);
        } catch {
            conn.socket.send('пошёл нахуй');
            conn.destroy();
        }
/*         if(message.token) {
            ws.init(message.token).then(async () => await ws.start(conn))
        } */
        console.log(message)
         if (message.username && message.token) {
            const userWsData = await wsDb.getRow('username', message.username);
            if (message.token == userWsData.token) {
                await api._checkToken(message.username).then((token) => {
                    ws.init(token).then(async () => await ws.start(conn));
                })
            } else {
                conn.socket.send('пошёл нахуй');
                conn.destroy();
            }
        } 
/*         conn.socket.send('hi from server') */
    })


    conn.socket.on('close', () => {
        app.log.info('[WS] Disconected')
        ws.stop();
    })

})
/* 
await app.listen({port: 3000}) */