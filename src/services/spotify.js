require("dotenv").config();
const { code } = require("../../code.json");
const { spotifyApi } = require("../config");

let authorizationCode = code;

exports.get_token = async () => {
	spotifyApi
		.authorizationCodeGrant(authorizationCode)
		.then(function (data) {
			spotifyApi.setAccessToken(data.body["access_token"]);
		})
		.catch(function (err) {
			console.log("Something went wrong:", err.message);
		});
};
