const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const assert = require('assert');
const redis = require('../src/index.js')();
const discord = require('discord.js');

const client = new discord.Client();
describe('initialization', function() {
  it('should initialize the redis interface without errors', function() {
    redis(client);
  });
  it('should login without errors', function() {
    return client.login(process.env.DISCORD_TOKEN);
  });
});
