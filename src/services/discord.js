const { bot } = require('../config')


bot.once("ready", () => {
  console.log("bot started");
});

bot.on('messageCreate', async interaction => {
    const command = interaction.content.toLocaleLowerCase()
    console.log()
    switch (command){
        case "!start":
            if (interaction.author.id === '312580050237128725') {

                start_twitch().then(() => {
                    start_server()
                    interaction.reply({ content:"twitch bot and server started" })
            })
            } else{
            interaction.reply({ content:"=)" })
        }
            break
        case "!stop":
            if (interaction.author.id === '312580050237128725') {

                stop_twitch().then(() => {
                    stop_server()
                    interaction.reply({ content:"twitch bot and server stoped" })
                })
            } else{
            interaction.reply({ content:"=)" })
        }
            break
    }
});
exports.start_discord = async function () {
  bot.login(process.env.DISCORD_TOKEN);
}
