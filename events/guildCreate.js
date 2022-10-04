const { api } = require("../services/api.js");
const { Config } = require("../config.json");

const config = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${Config.api.auth_token}`,
  },
};

const Options = [
  "ANNOUNCE_CHANNEL", // Channel to announce the games in
  "BOT_MESSAGE", // Leaderboards message
  "CHAOS_ROLE", // Role to announce on new Chaos Game
  "CHAOS_RUNNER_ROLE", // Role assigned to runners
  "BAAL_ROLE", // Role to announce on new Baal Games
  "BAAL_RUNNER_ROLE", // Role assigned to runners
  "NEW_GAME_DELETE_DELAY", // Delay before deleting the new game message
];

module.exports = {
  name: "guildCreate",
  async execute(guild) {
    const members = await guild.members.fetch({ withPresences: true });
    for await (const option of Options) {
      await api.post(
        "/discord/",
        {
          guild: guild.id,
          name: option,
        },
        config
      );
    }
  },
};
