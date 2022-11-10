const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help') //name of command (displayed in discord)
    .setDescription('Support for BirdWatcher commands and abilities') //description of command (displayed in discord)
    .addStringOption((option) =>
      option.setName('command')
        .setDescription("Specify the command you would like help with")), //add required string arg for Twitter Username

  async execute(interaction) {
    const { options } = interaction

    const targetCommand = options.getString("command")

    const embed = new EmbedBuilder()

    if (targetCommand === null) {
      embed.setTitle("BirdWatcher | Help Menu")
        .setDescription("Do `/help <command>` for more information about a command")
        .setColor(0x7289DA)
        .addFields(
          { name: "Configuration Commands", value: "`/add`, `/remove`" },
          { name: "Extra Commands", value: "`/help`, `/tracked`, `/request`" },
        )
      await interaction.reply({ embeds: [embed] })
    } else if (targetCommand === "add" || targetCommand === "/add") {
      embed.setTitle("add")
        .setDescription("Adds a user to be Bird-Watched!")
        .setColor(0x7289DA)
        .addFields(
          { name: "• Arguments", value: "channel (The text channel BirdWatcher will send updates in) [Required: Yes]\nusername (The username of the twitter account you wish to track) [Required: Yes]\n\nusage: `/add general elonmusk`" },
          { name: "• Requirements", value: "Must be a valid text channel\nMust be a valid twitter username **(Case sensitive)**" },
        )
        .setFooter({
          text: "Do /help <command> for more information about a command"
        })
      await interaction.reply({ embeds: [embed] })
    } else if (targetCommand === "remove" || targetCommand === "/remove") {
      embed.setTitle("remove")
        .setDescription("Removes one of the users being watched")
        .setColor(0x7289DA)
        .addFields(
          { name: "• Arguments", value: "username (The username of the account you want to stop tracking) [Required: Yes]\n\nusage: `/remove Oprah`" },
          { name: "• Requirements", value: "-Must be a user that is currently being tracked **(Case sensitive)**" },
        )
        .setFooter({
          text: "Do /help <command> for more information about a command"
        })
      await interaction.reply({ embeds: [embed] })
    } else if (targetCommand === "help" || targetCommand === "/help") {
      embed.setTitle("help")
        .setDescription("Displays all the commands of the bot. If you provide the name of a command, it will return all available information about that command.")
        .setColor(0x7289DA)
        .addFields(
          { name: "• Arguments", value: "command (Specific command help) [Required: No]\n\nusages: `/help`, `/help command`" },
          { name: "• Requirements", value: "No requirements!" },
        )
        .setFooter({
          text: "Do /help <command> for more information about a command"
        })
      await interaction.reply({ embeds: [embed] })
    } else if (targetCommand === "tracked" || targetCommand === "/tracked") {
      embed.setTitle("tracked")
        .setDescription("Displays all users currently being tracked.")
        .setColor(0x7289DA)
        .addFields(
          { name: "• Arguments", value: "No arguments!\n\nusage: `/tracked`" },
          { name: "• Requirements", value: "No requirements!" },
        )
        .setFooter({
          text: "Do /help <command> for more information about a command"
        })
      await interaction.reply({ embeds: [embed] })
    } else if (targetCommand === "request" || targetCommand === "/request") {
      embed.setTitle("request")
        .setDescription("Request BirdWatcher to send an update for a tracked user")
        .setColor(0x7289DA)
        .addFields(
          { name: "• Arguments", value: "username (The username of a twitter account that is being tracked) [Required: Yes]\n\nusage: `/request Oprah`" },
          { name: "• Requirements", value: "-Must be a user that is currently being tracked **(Case sensitive)**" },
        )
        .setFooter({
          text: "Do /help <command> for more information about a command"
        })
      await interaction.reply({ embeds: [embed] })
    } else {
      await interaction.reply({ content: "Sorry! `/" + targetCommand + "` is not a command! Maybe it will be someday..." })
    }
  }
}