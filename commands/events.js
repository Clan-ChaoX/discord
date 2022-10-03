const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const moment = require("moment");
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
    .setName("events")
    .setDescription("List, Add, Modify & Remove Events.")
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
      option.setName("id").setDescription("Event ID.").setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("event_name")
        .setDescription("Event Name.")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("start_date")
        .setDescription("Start Date. (Format: YYYY-MM-DD)")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("end_date")
        .setDescription("End Date.  (Format: YYYY-MM-DD)")
        .setRequired(false)
    ),
  async execute(interaction) {
    const action = interaction.options.getString("action");
    const event_name = interaction.options.getString("event_name");
    const start_date = interaction.options.getString("start_date");
    const end_date = interaction.options.getString("end_date");
    const event_id = interaction.options.getInteger("id");
    const inline = interaction.options.getBoolean("inline")
      ? interaction.options.getBoolean("inline")
      : false;

    if (action === "list") {
      const events = await api.get("game_events");
      const event_fields = [];

      for (const event of events.data) {
        const start_date_obj = new Date(event.start_date);
        const end_date_obj = new Date(event.end_date);

        console.log(`DB: ${event.start_date}\nDate Obj: ${start_date_obj}\n\n`);
        console.log(`DB: ${event.end_date}\nDate Obj: ${end_date_obj}\n\n`);

        event_fields.push({
          name: `ID: ${event.id}`,
          value: `${
            event.name
          }\n${start_date_obj.toDateString()} - ${end_date_obj.toDateString()}`,
          inline: inline,
        });
      }
      const gtEmbed = {
        color: 0x0099ff,
        title: "Event List",
        author: {
          name: "ChaoX",
        },
        description: "List of events.",
        fields: event_fields,
      };

      await interaction.reply({
        embeds: [gtEmbed],
        ephemeral: true,
      });
    } else if (action === "add") {
      if (!event_name || !start_date || !end_date) {
        await interaction.reply({
          content: `[Error]: Name, Start Date and End Date are required`,
          ephemeral: true,
        });
      } else {
        try {
          const start_date_obj = new Date(start_date);
          start_date_obj.setDate(start_date_obj.getDate() + 1);

          const end_date_obj = new Date(end_date);
          end_date_obj.setDate(end_date_obj.getDate() + 1);

          api
            .post(
              "game_events/",
              {
                name: event_name,
                start_date: start_date_obj.toLocaleString("en-US", {
                  timeZone: "America/Los_Angeles",
                }),
                end_date: end_date_obj.toLocaleString("en-US", {
                  timeZone: "America/Los_Angeles",
                }),
              },
              config
            )
            .then(async (result) => {
              if (result.data.status === 201) {
                const start_date_obj = new Date(result.data.result.start_date);
                const end_date_obj = new Date(result.data.result.end_date);

                await interaction.reply({
                  content: `Successfully Created: Name ${
                    result.data.result.name
                  }\n${start_date_obj.toDateString()} - ${end_date_obj.toDateString()}`,
                  ephemeral: true,
                });
              }
            })
            .catch(async (error) => {
              if (error.response) {
                await interaction.reply({
                  content: `Failed to create the event! Event names must be unique.`,
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
      if (!event_name || !start_date || !end_date || !event_id) {
        await interaction.reply({
          content: `[Error]: Name, Start Date, End Date, ID are required`,
          ephemeral: true,
        });
      } else {
        const start_date_obj = new Date(start_date);
        start_date_obj.setDate(start_date_obj.getDate() + 1);

        const end_date_obj = new Date(end_date);
        end_date_obj.setDate(end_date_obj.getDate() + 1);

        api
          .put(
            `game_events/${event_id}/`,
            {
              name: event_name,
              start_date: start_date_obj,
              end_date: end_date_obj,
            },
            config
          )
          .then(async (result) => {
            if (result.data.status === 200) {
              await interaction.reply({
                content: `Successfully Updated: Name ${event_name}\n${start_date_obj.toDateString()} - ${end_date_obj.toDateString()}`,
                ephemeral: true,
              });
            }
          })
          .catch(async (error) => {
            console.log(error.response);
            if (error.response) {
              await interaction.reply({
                content: `Failed to update event: ${event_id}. Event names must be unique.`,
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
      if (!event_id) {
        await interaction.reply({
          content: `[Error]: Event ID is required`,
          ephemeral: true,
        });
      } else {
        api
          .delete(`game_events/${event_id}/`, config)
          .then(async (result) => {
            await interaction.reply({
              content: `Successfully deleted the event with the ID of ${event_id}`,
              ephemeral: true,
            });
          })
          .catch(async (error) => {
            if (error.response) {
              console.log(error.response.data);
              console.log(error.response.status);
              console.log(error.response.headers);
              await interaction.reply({
                content: `Failed to delete event.`,
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
