require("dotenv").config({ path: "../../.env" });
const fetch = require("node-fetch");
const { spotifyApi } = require("../config");

exports.getToken = async () => {
	let res = await fetch(
		"https://open.spotify.com/get_access_token?reason=transport&productType=web_player",
		{
			headers: {
				cookie: `sp_dc=${process.env.SP_DC}`,
			},
		}
	);
	let body = await res.json();

	let expirationTime = body.accessTokenExpirationTimestampMs - Date.now();
	let token = body.accessToken;

	spotifyApi.setAccessToken(token);

	setInterval(() => {
		getToken();
	}, expirationTime);
};
