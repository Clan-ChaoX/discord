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
    .setName("game_types")
    .setDescription("Register as a runner for Clan ChX.")
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription("Action to be taken")
        .setRequired(true)
        .addChoices(
          { name: "List", value: "list" },
          { name: "Add", value: "add" },
          { name: "Modify", value: "modify" },
          { name: "Delete", value: "delete" }
        )
    )
    .addIntegerOption((option) =>
      option.setName("id").setDescription("Game Type Name.").setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Game Type Name.")
        .setRequired(false)
    ),
  async execute(interaction) {
    const action = interaction.options.getString("action");
    const game_type = interaction.options.getString("name");
    const game_type_id = interaction.options.getInteger("id");
    if (action === "list") {
      const game_types = await api.get("game_types");
      const game_type_fields = [];
      for (type of game_types.data) {
        game_type_fields.push({
          name: type.name,
          value: `ID: ${type.id}`,
        });
      }
      const gtEmbed = {
        color: 0x0099ff,
        title: "Game Types",
        author: {
          name: "ChaoX",
        },
        description: "List of available Game Types.",
        fields: game_type_fields,
        footer: {
          text: "To request a game type added contact an admin.",
        },
      };

      await interaction.reply({
        embeds: [gtEmbed],
        ephemeral: true,
      });
    }
    if (action === "add") {
      if (!game_type) {
        await interaction.reply({
          content: `[Error]: name is required`,
          ephemeral: true,
        });
      } else {
        try {
          api
            .post(
              "game_types/",
              {
                name: game_type,
              },
              config
            )
            .then(async (result) => {
              if (result.data.status === 201) {
                await interaction.reply({
                  content: `Successfully created game type: ${result.data.result.name}`,
                  ephemeral: true,
                });
              }
            })
            .catch(async (error) => {
              if (error.response) {
                await interaction.reply({
                  content: `Failed to create the game type! Game Type names must be unique.`,
                  ephemeral: true,
                });
              } else if (error.request) {
                console.log(error.request);
              } else {
                console.log("Error", error.message);
              }
            });
        } catch {
          console.log("error");
        }
      }
    } else if (action === "modify") {
      if (!game_type || !game_type_id) {
        await interaction.reply({
          content: `[Error]: name and id are required`,
          ephemeral: true,
        });
      } else {
        api
          .put(
            `game_types/${game_type_id}/`,
            {
              name: game_type,
            },
            config
          )
          .then(async (result) => {
            if (result.data.status === 200) {
              await interaction.reply({
                content: `Successfully updated game type: ${result.data.result.name}`,
                ephemeral: true,
              });
            }
          })
          .catch(async (error) => {
            if (error.response) {
              await interaction.reply({
                content: `Failed to update game type: ${game_type_id}. Game Type names must be unique.`,
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
      if (!game_type_id) {
        await interaction.reply({
          content: `[Error]: id is required`,
          ephemeral: true,
        });
      } else {
        api
          .delete(`game_types/${game_type_id}/`, config)
          .then(async (result) => {
            console.log(result.data);
            await interaction.reply({
              content: `Successfully deleted the game type with the ID of ${game_type_id}`,
              ephemeral: true,
            });
          })
          .catch(async (error) => {
            if (error.response) {
              console.log(error.response.data);
              console.log(error.response.status);
              console.log(error.response.headers);
              await interaction.reply({
                content: `Failed to delete game type.`,
                ephemeral: true,
              });
            } else if (error.request) {
              console.log(error.request);
            } else {
              console.log("Error", error.message);
            }
            console.log(error.config);
          });
      }
    }
  },
};
