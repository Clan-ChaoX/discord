const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { api } = require("../services/api.js");
const { Config } = require("../config.json");

const config = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${Config.api.auth_token}`,
  },
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("options")
    .setDescription("List and Update Discord Options.")
    .setDMPermission(false)
    .setDefaultMemberPermissions(
      PermissionFlagsBits.KickMembers | PermissionFlagsBits.BanMembers
    )
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription("Action to be taken")
        .setRequired(true)
        .addChoices(
          { name: "List", value: "list" },
          { name: "Modify", value: "modify" }
        )
    )
    .addBooleanOption((option) =>
      option
        .setName("inline")
        .setDescription("Display Inline? (Default: false)")
    )
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Setting Name.")
        .setRequired(false)
        .addChoices(
          { name: "Announcement Channel", value: "ANNOUNCE_CHANNEL" },
          { name: "Leader Board Message ID", value: "BOT_MESSAGE" },
          { name: "Chaos Leecher Role", value: "CHAOS_ROLE" },
          { name: "Chaos Runner Role", value: "CHAOS_RUNNER_ROLE" },
          { name: "Baal Leecher Role", value: "BAAL_ROLE" },
          { name: "Baal Runner Role", value: "BAAL_RUNNER_ROLE" },
          { name: "New Game Message Duration", value: "NEW_GAME_DELETE_DELAY" }
        )
    )
    .addStringOption((option) =>
      option.setName("value").setDescription("Setting Value").setRequired(false)
    ),
  async execute(interaction) {
    const action = interaction.options.getString("action");
    const setting = interaction.options.getString("name");
    const value = interaction.options.getString("value");
    const inline = interaction.options.getBoolean("inline")
      ? interaction.options.getBoolean("inline")
      : false;

    if (action === "list") {
      const options = await api.get(`/discord/${interaction.guild.id}`, config);
      const option_fields = [];
      for (const option of options.data) {
        const optionValue = option.value ? option.value : "Not Set";

        option_fields.push({
          name: option.name,
          value: optionValue,
          inline: inline,
        });
      }
      const gtEmbed = {
        color: 0x0099ff,
        title: "Discord Options",
        author: {
          name: "ChaoX",
        },
        description: "List of discord options.",
        fields: option_fields,
      };

      await interaction.reply({
        embeds: [gtEmbed],
        ephemeral: true,
      });
    } else if (action === "modify") {
      if (!setting || !value) {
        await interaction.reply({
          content: `[Error]: setting and value are required`,
          ephemeral: true,
        });
      } else {
        api
          .put(
            `/discord/${interaction.guild.id}/${setting}`,
            {
              value: value,
            },
            config
          )
          .then(async (result) => {
            if (result.data.status === 200) {
              await interaction.reply({
                content: `Updated option: ${setting}\nValue: ${value}`,
                ephemeral: true,
              });
            }
          })
          .catch(async (error) => {
            if (error.response) {
              await interaction.reply({
                content: `Failed to update option: ${setting}.`,
                ephemeral: true,
              });
            } else if (error.request) {
              console.log(error.request);
            } else {
              console.log("Error", error.message);
            }
          });
      }
    } else {
      console.log("Invalid Action");
    }
  },
};
