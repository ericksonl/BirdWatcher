const { SlashCommandBuilder } = require('discord.js')
const setupSchema = require('../mongooseSchema/Setup.js')
const chalk = require('chalk')
const { initRequest } = require('../initDatabase/initRequest.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add') //name of command (displayed in discord)
        .setDescription('Add a Twitter user to Bird-Watch') //description of command (displayed in discord)
        .addChannelOption((option) =>
            option.setName('channel')
                .setDescription("Specify the channel where BirdWatcher will send updates")
                .setRequired(true)) //add a required channel arg for Channel ID
        .addStringOption((option) =>
            option.setName('username')
                .setDescription("Specify the twitter user you wish to Bird-Watch")
                .setRequired(true)), //add required string arg for Twitter Username

    async execute(interaction) {
        const { options } = interaction

        const targetChannel = options.getChannel("channel")
        const userName = options.getString("username")

        if (userName.length > 15) {
            console.log(chalk.red("error with setup\nUsername > 15 characters"))
            await interaction.reply("Setup Failed! A twitter username *must* be **15 or less** characters!")
            return
        } else if (targetChannel.type !== 0) {
            console.log(chalk.red("Target channel is not of the type Text. Type provided: " + targetChannel.type))
            await interaction.reply("This is not a text channel! BirdWatcher needs a text channel to provide updates.\nPlease re-run `/add`")
            return
        }

        await interaction.reply({ content: 'BirdWatcher is thinking, this may take some time. Feel free to grab a cup of coffee while you wait ☕' })

        //run initial config for database
        let outArr = await initRequest(interaction.channel, userName)

        if (outArr === -1) {
            interaction.followUp("Sorry, " + userName + " has over 10,000 followers. Support for an account with 10,000+ followers is not currently supported.\n"
                + "To increase this limit, complain to Twitter about their rate limits until they increase it.\nPlease re-run `/add`")
        } else if (outArr === -2) {
            interaction.followUp("Sorry, " + userName + " does not exist or is suspended.\nPlease re-run `/add`")
        } else {
            initSchema(outArr, interaction.guild.id, targetChannel.id, userName, interaction)
        }
    }
}

async function initSchema(inArray, guildID, channelID, userName, interaction) {
    //first see if there already exists a database for GuildID
    setupSchema.findOne({ Guild: guildID, UserName: userName }, async (err, data) => {
        if (!data) {
            //if not, create a new one
            await setupSchema.create({
                Guild: guildID,
                Channel: channelID,
                UserName: userName,
                Baseline: inArray
            })
            await interaction.followUp({ content: 'BirdWatcher is now watching ' + userName + '.' })
        } else {
            await interaction.followUp({ content: 'BirdWatcher already configured to watch ' + userName })
        }
    })
}
