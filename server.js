const path = require("path");
const fs = require("fs");
require('dotenv').config()
const app = require('fastify')({});
const querystring = require('node:querystring');
const {refresh_token} = require('./spotify');


app.get('/', async (req, res) => {
    var scope = 'user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-email user-read-private';

    res.redirect('https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENTID,
        scope: scope,
        redirect_uri: 'http://localhost/callback',
      }));
  });

app.get('/callback:code', async (req, res) =>{
    var code = req.query.code
    let json = {"code": code}
    //json = JSON.stringify(json)
    fs.writeFile('./code.json', JSON.stringify(json), function() {
        refresh_token()
        });
    res.send('ok')
})


async function start_server() {
    try {
    app.listen({ port: 80 }, () => {
        console.log('server started')
      })
    } catch (err) {
        console.log(err)
    }
}

module.exports = start_server