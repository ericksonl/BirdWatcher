const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const setupSchema = require('../mongooseSchema/Setup.js')
const chalk = require('chalk')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('view') //name of command (displayed in discord)
        .setDescription('View the first X followers of a watched user') //description of command (displayed in discord)
        .addStringOption((option) =>
            option.setName('username')
                .setDescription("Specify the twitter user you wish to Bird-Watch")
                .setRequired(true)) //add required string arg for Twitter Username
        .addIntegerOption((option) =>
            option.setName('value')
                .setDescription("Specify the number of users you would like to view")
                .setRequired(true)), //add required string arg for Twitter Username

    async execute(interaction) {
        const { options } = interaction

        const userName = options.getString("username")
        const num = options.getInteger("value")

        const guildID = interaction.guild.id

        var outStr = ""

        const embed = new EmbedBuilder()
        .setColor(0x7289DA)
        .setTitle("@" + userName)
        .setTitle("Showing " + num + "followers")

        setupSchema.findOne({ Guild: guildID, UserName: userName }, async (err, data) => {
            if (!data) {
                await interaction.reply({ content: 'BirdWatcher is not currently tracking `' + userName + "`" })
            } else {
                let Baseline = data.Baseline
                let numFollowers = Baseline.length

                console.log(Baseline)
                if (num <= 0) {
                    await interaction.reply({ content: 'Please enter a positive number' })
                } else if (num > numFollowers) {
                    await interaction.reply({ content: 'Sorry, there are currently only ' + Baseline.length + ' users stored.' })
                } else if (num <= 35) {
                    for (var i = numFollowers - 1; i > (numFollowers - num) -1; i--) {
                        outStr += "@`" + Baseline[i] + "\n`"
                    }
                    await interaction.reply({ content: outStr })
                } else {
                    for (var i = numFollowers - 1; i > (numFollowers - num) -1; i--) {
                        if (i % 35) {
                            
                        }
                        outStr += "@`" + Baseline[i] + "\n`"
                    }
                    await interaction.reply({ content: outStr })
                }
            }
        })
    }
}