const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const setupSchema = require('../mongooseSchema/Setup.js')
const chalk = require('chalk')


module.exports = {
    data: new SlashCommandBuilder()
        .setName('tracked') //name of command (displayed in discord)
        .setDescription('Sends a list of the current tracked users'), //description of command (displayed in discord)

    async execute(interaction) {
        const guildID = interaction.guild.id

        var descriptionStr = ""

        try {
            setupSchema.find({ Guild: guildID }, async (err, data) => {
                #DEBUG:
                if (!data) {
                    await interaction.reply({ content: "No users currently being Bird-Watched!\nUse `/add` to Bird-Watch someone" })
                } else {
                    for (var i = 0; i < data.length; i++) {
                        descriptionStr += "\@" + data[i].UserName + "\n"
                    }

                    console.log("foo")
                    const trackedEmbed = new EmbedBuilder()
                        .setColor(0x7289DA)
                        .setTitle("Tracked Users")
                        .setDescription(descriptionStr)

                    await interaction.reply({ embeds: [trackedEmbed] })
                }
                #DEBUG:
            })
        } catch (error) {
            console.log(error)
        }
    }
}