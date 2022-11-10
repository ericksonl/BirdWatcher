const { SlashCommandBuilder } = require('discord.js')
const setupSchema = require('../mongooseSchema/Setup.js')
const chalk = require('chalk')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove') //name of command (displayed in discord)
        .setDescription('Remove one of the users being watched') //description of command (displayed in discord)
        .addStringOption((option) =>
            option.setName('username')
                .setDescription("Specify the twitter user you wish to Bird-Watch")
                .setRequired(true)), //add required string arg for Twitter Username

    async execute(interaction) {
        const { options } = interaction

        const userName = options.getString("username")
        const guildID = interaction.guild.id

        setupSchema.findOne({ Guild: guildID, UserName: userName }, async (err, data) => {
            if (!data) {
                await interaction.reply({ content: 'BirdWatcher is not currently tracking `' + userName + "`" })
            } else {
                console.log(data)
                setupSchema.deleteOne({ Guild: guildID, UserName: userName }, async (err, data) => {
                    if (!err) {
                        await interaction.reply({ content: "`" + userName + '` is no longer being tracked!' })
                    } else {
                        console.log(err)
                        await interaction.reply({ content: 'Sorry, there was an error when trying to execute this command' })
                    }
                })
            }
        })
    }
}