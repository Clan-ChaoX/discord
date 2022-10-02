const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { api } = require("../services/api");
const { Config } = require("../config.json");

const config = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${Config.api.auth_token}`,
  },
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("Register as a runner for Clan ChX."),
  async execute(interaction) {
    const user_id = interaction.user.id;
    api
      .get(`runners/${user_id}/`, config)
      .then(async (result) => {
        if (result.data.status === 200) {
          await interaction.reply({
            content: `Discord ID: ${user_id}\nChaoX ID: ${result.data.result.chaox_id}`,
            ephemeral: true,
          });
        }
      })
      .catch(async (error) => {
        if (error.response.status === 404) {
          api
            .post(`runners/${user_id}/`, {}, config)
            .then(async (result) => {
              await interaction.reply({
                content: `Discord ID: ${user_id}\nChaoX ID: ${result.data.result.chaox_id}`,
                ephemeral: true,
              });
            })
            .catch(async (error) => {
              console.log(error);
              await interaction.reply({
                content: `SumTingWong`,
                ephemeral: true,
              });
            });
        } else {
          console.log(error.response.status);
          await interaction.reply({
            content: `SumTingWong`,
            ephemeral: true,
          });
        }
      });
  },
};
