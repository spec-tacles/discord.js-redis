require('dotenv').config();
const redis = require('../src/index.js')();
const discord = require('discord.js');

const client = new discord.Client();
redis(client);
client.login(process.env.DISCORD_TOKEN);
