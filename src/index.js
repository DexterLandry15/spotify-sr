const {connect_client} = require('./services/twitch');
const { start_server } = require('./services/server')
connect_client()
start_server()