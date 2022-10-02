const axios = require("axios").default;
const { Config } = require("../config.json");

const api = axios.create({
  baseURL: Config.api.root_path,
});

module.exports = { api };
