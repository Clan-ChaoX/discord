const later = require("later");
const { api } = require("../services/api.js");
const { Config } = require("../config.json");

const config = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${Config.api.auth_token}`,
  },
};

later.date.localTime();
const schedule = later.parse.text("every 1 min");

module.exports = (client) => {
  const timer = later.setInterval(pullGames, schedule);
  pullGames();

  async function pullGames() {
    const announcement_channel_id = (
      await api.get("discord/909279119894798346/ANNOUNCE_CHANNEL", config)
    ).data.result.value;

    const bot_message = (
      await api.get("discord/909279119894798346/BOT_MESSAGE", config)
    ).data.result.value;

    const season = (
      await api.get("discord/909279119894798346/CURRENT_SEASON", config)
    ).data.result.value;

    const guild = await client.guilds.fetch("909279119894798346");

    const announcement_channel = await guild.channels.fetch(
      announcement_channel_id
    );

    const leaderboard = await getGameData(season);

    if (!bot_message) {
      // Post Leaderboard
      // Set bot_message setting
    } else {
      // Edit Leaderboard
      // Set bot_message setting
    }
  }
};

// Runner ID Index 2
async function getGameData(season) {
  const currentGames = (await api.get(`games/active`)).data;
  const seasonalGames = (await api.get(`games/season/${season}`)).data;

  const chaosRunnerGames = [],
    baalRunnerGames = [],
    terrorZoneRunnerGames = [];

  for (game of seasonalGames) {
    const runnerId = game.RunnerId;
    if (game.is_active) {
      continue;
    }

    if (game.GameType.name === "Chaos") {
      if (chaosRunnerGames[runnerId]) {
        chaosRunnerGames[runnerId][0]++;
        chaosRunnerGames[runnerId][1] += getSecondsDiff(
          game.createdAt,
          game.updatedAt
        );
      } else {
        chaosRunnerGames[runnerId] = [];
        chaosRunnerGames[runnerId][0] = 1;
        chaosRunnerGames[runnerId][1] = getSecondsDiff(
          game.createdAt,
          game.updatedAt
        );
        chaosRunnerGames[runnerId][2] = runnerId;
      }
    } else if (game.GameType.name === "Baal") {
      if (baalRunnerGames[runnerId]) {
        baalRunnerGames[runnerId][0]++;
        baalRunnerGames[runnerId][1] += getSecondsDiff(
          game.createdAt,
          game.updatedAt
        );
      } else {
        baalRunnerGames[runnerId] = [];
        baalRunnerGames[runnerId][0] = 1;
        baalRunnerGames[runnerId][1] = getSecondsDiff(
          game.createdAt,
          game.updatedAt
        );
        baalRunnerGames[runnerId][2] = runnerId;
      }
    } else if (game.GameType.name === "Terror Zones") {
      if (terrorZoneRunnerGames[runnerId]) {
        terrorZoneRunnerGames[runnerId][0]++;
        terrorZoneRunnerGames[runnerId][1] += getSecondsDiff(
          game.createdAt,
          game.updatedAt
        );
      } else {
        terrorZoneRunnerGames[runnerId] = [];
        terrorZoneRunnerGames[runnerId][0] = 1;
        terrorZoneRunnerGames[runnerId][1] = getSecondsDiff(
          game.createdAt,
          game.updatedAt
        );
        terrorZoneRunnerGames[runnerId][2] = runnerId;
      }
    }
  }

  // console.log(`Chaos Games by runner: ${chaosRunnerGames.length}`);
  console.table(chaosRunnerGames.sort(sortRunnerGames));
  console.table(baalRunnerGames.sort(sortRunnerGames));
  console.table(terrorZoneRunnerGames.sort(sortRunnerGames));

  const chaosLeaderBoard = [],
    baalLeaderBoard = [],
    tzLeaderBoard = [],
    currentGameList = [];

  for (const [i, runner] of chaosRunnerGames.sort(sortRunnerGames)) {
    if (i >= 5) {
      break;
    }

    chaosLeaderBoard.push({
      name: `${i + 1}.`,
      value: `${runner[0]} runs - ${Math.round(runner[1] / runner[0])} sec avg`,
      inline: false,
    });
  }

  for (const [i, runner] of baalRunnerGames.sort(sortRunnerGames)) {
    if (i >= 5) {
      break;
    }

    baalLeaderBoard.push({
      name: `${i + 1}.`,
      value: `${runner[0]} runs - ${Math.round(runner[1] / runner[0])} sec avg`,
      inline: false,
    });
  }

  for (const [i, runner] of terrorZoneRunnerGames.sort(sortRunnerGames)) {
    if (i >= 5) {
      break;
    }

    tzLeaderBoard.push({
      name: `${i + 1}.`,
      value: `${runner[0]} runs - ${Math.round(runner[1] / runner[0])} sec avg`,
      inline: false,
    });
  }

  const leaderboard = [
    {
      color: 0xff0000,
      title: "Chaos",
      author: {
        name: "ChaoX",
      },
      description: "Top Chaos Runners",
      fields: chaosLeaderBoard,
    },
    {
      color: 0xffffff,
      title: "Baal",
      author: {
        name: "ChaoX",
      },
      description: "Top Baal Runners",
      fields: baalLeaderBoard,
    },
    {
      color: 0x0000ff,
      title: "Terror Zones",
      author: {
        name: "ChaoX",
      },
      description: "Top Terror Zone Runners",
      fields: tzLeaderBoard,
    },
    {
      color: 0xff0000,
      title: "Current Games",
      author: {
        name: "ChaoX",
      },
      description: "List of available Game Types.",
      fields: game_type_fields,
      footer: {
        text: "To request a game type added contact an admin.",
      },
    },
  ];

  return null;
}

function getSecondsDiff(start, end) {
  const msInSecond = 1000;

  const startDate = new Date(start);
  const endDate = new Date(end);

  return Math.round(Math.abs(endDate - startDate) / msInSecond);
}

function sortRunnerGames(a, b) {
  if (a[0] === b[0]) {
    return 0;
  } else {
    return a[0] > b[0] ? -1 : 1;
  }
}
