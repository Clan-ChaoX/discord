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
    .setName("build_types")
    .setDescription("List, Add, Modify & Remove Build Types.")
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
    .addBooleanOption((option) =>
      option
        .setName("inline")
        .setDescription("Display Inline? (Default: false)")
    )
    .addIntegerOption((option) =>
      option.setName("id").setDescription("Build ID.").setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("build_name")
        .setDescription("Build Name.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("class_name")
        .setDescription("Class Name.")
        .setRequired(false)
        .addChoices(
          { name: "Assassin", value: "Assassin" },
          { name: "Amazon", value: "Amazon" },
          { name: "Barbarian", value: "Barbarian" },
          { name: "Druid", value: "Druid" },
          { name: "Necromancer", value: "Necromancer" },
          { name: "Paladin", value: "Paladin" },
          { name: "Sorceress", value: "Sorceress" }
        )
    ),
  async execute(interaction) {
    const action = interaction.options.getString("action");
    const class_name = interaction.options.getString("class_name");
    const build_name = interaction.options.getString("build_name");
    const build_id = interaction.options.getInteger("id");
    const inline = interaction.options.getBoolean("inline")
      ? interaction.options.getBoolean("inline")
      : false;

    if (action === "list") {
      const builds = await api.get("build_types");
      const build_fields = [];

      for (const build of builds.data) {
        build_fields.push({
          name: `ID: ${build.id}`,
          value: `Class: ${build.class_name}\nBuild: ${build.name}`,
          inline: inline,
        });
      }
      const gtEmbed = {
        color: 0x0099ff,
        title: "Build List",
        author: {
          name: "ChaoX",
        },
        description: "List of available Builds.",
        fields: build_fields,
        footer: {
          text: "To request a build to be added contact an admin.",
        },
      };

      await interaction.reply({
        embeds: [gtEmbed],
        ephemeral: true,
      });
    } else if (action === "add") {
      if (!class_name || !build_name) {
        await interaction.reply({
          content: `[Error]: Class name & Build name are required`,
          ephemeral: true,
        });
      } else {
        try {
          api
            .post(
              "build_types/",
              {
                class_name: class_name,
                name: build_name,
              },
              config
            )
            .then(async (result) => {
              if (result.data.status === 201) {
                await interaction.reply({
                  content: `Successfully Created: Class ${result.data.result.class_name} Build ${result.data.result.name}`,
                  ephemeral: true,
                });
              }
            })
            .catch(async (error) => {
              if (error.response) {
                await interaction.reply({
                  content: `Failed to create the build! Build names must be unique.`,
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
      if (!build_name || !build_id || !class_name) {
        await interaction.reply({
          content: `[Error]: Build Name, Class Name and id are required`,
          ephemeral: true,
        });
      } else {
        api
          .put(
            `build_types/${build_id}/`,
            {
              class_name: class_name,
              name: build_name,
            },
            config
          )
          .then(async (result) => {
            if (result.data.status === 200) {
              await interaction.reply({
                content: `Successfully Updated: Class ${result.data.result.class_name} Build ${result.data.result.name}`,
                ephemeral: true,
              });
            }
          })
          .catch(async (error) => {
            if (error.response) {
              await interaction.reply({
                content: `Failed to update build: ${build_id}. Build names must be unique.`,
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
      if (!build_id) {
        await interaction.reply({
          content: `[Error]: Build ID is required`,
          ephemeral: true,
        });
      } else {
        api
          .delete(`build_types/${build_id}/`, config)
          .then(async (result) => {
            await interaction.reply({
              content: `Successfully deleted the build with the ID of ${build_id}`,
              ephemeral: true,
            });
          })
          .catch(async (error) => {
            if (error.response) {
              console.log(error.response.data);
              console.log(error.response.status);
              console.log(error.response.headers);
              await interaction.reply({
                content: `Failed to delete build.`,
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
