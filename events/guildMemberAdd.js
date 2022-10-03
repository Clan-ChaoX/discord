const { api } = require("../services/api.js");
const { Config } = require("../config.json");

const config = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${Config.api.auth_token}`,
  },
};

module.exports = {
  name: "guildMemberAdd",
  async execute(member) {
    api
      .get(`visitors/${member.id}`, config)
      .then((result) => {})
      .catch((error) => {
        if (error.response.data.status === 404) {
          api
            .post(
              "visitors/",
              {
                discord_id: member.id,
                name: member.displayName,
              },
              config
            )
            .then((result) => {
              // Do nothing
            })
            .catch((error) => {
              console.log(error.response);
            });
        }
      });
  },
};
