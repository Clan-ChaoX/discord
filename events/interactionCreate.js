module.exports = {
  name: "interactionCreate",
  async execute(interaction) {
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.log(error);
      await interaction.reply({
        context: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
};
