require("dotenv").config();
const { spotifyApi } = require("../config");
let executed = false
exports.get_token = async (authorizationCode) => {
	if (executed === false) {
		executed = true;
		let expiration_time;
		await spotifyApi
			.authorizationCodeGrant(authorizationCode)
			.then(function (data) {
				console.log("ok");
				spotifyApi.setAccessToken(data.body["access_token"]);
				spotifyApi.setRefreshToken(data.body["refresh_token"]);
				expiration_time = data.body["expires_in"];
			})
			.catch(function (err) {
				console.log("Something went wrong:", err.message);
			});
		setInterval(async () => {
			console.log("refreshed");
			spotifyApi
				.refreshAccessToken()
				.then((data) => {
					spotifyApi.setAccessToken(data.body["access_token"]);
					expiration_time = data.body["expires_in"];
				})
				.catch(function (err) {
					console.log("Something went wrong:", err.message);
				});
		}, expiration_time * 1000);

	}
};
