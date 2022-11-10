const { SlashCommandBuilder } = require('discord.js')
const setupSchema = require('../mongooseSchema/Setup.js')
const chalk = require('chalk')
const { requestData } = require('../functions/requestData')
require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('request') //name of command (displayed in discord)
    .setDescription('Request follower data ahead of schedule') //description of command (displayed in discord)
    .addStringOption((option) =>
      option.setName('username')
        .setDescription("Specify the user you're requesting data for")
        .setRequired(true)), //add required string arg for Twitter Username

  async execute(interaction) {
    const { options } = interaction

    const guildID = interaction.guild.id
    const channel = interaction.channel
    const userName = options.getString("username")

    setupSchema.findOne({ Guild: guildID, UserName: userName}, async (err, data) => {
      if (!data) {
        console.log(chalk.red("no data found"))
        interaction.reply(userName + " is not currently being tracked!")
        return
      }
      let UserName = data.UserName
      let Baseline = data.Baseline

      console.log(chalk.blue("Begining request...\n"))

      await interaction.reply({ content: 'BirdWatcher is thinking, this may take some time. Feel free to grab a cup of coffee while you wait ☕' })

      await requestData(channel, UserName, Baseline, guildID)
    })
  }
}