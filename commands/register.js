const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("Register as a runner for Clan ChX.")
    .addStringOption((option) =>
      option
        .setName("password")
        .setDescription("Password used access CRU and Website.")
        .setRequired(true)
    ),
  async execute(interaction) {
    // Register user as a runner -> Input string not required
    await interaction.reply({
      content: interaction.options.getString("password"),
      ephemeral: true,
    });
  },
};
