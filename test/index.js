const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const assert = require('assert');
let redis = require('../src/index.js');
const discord = require('discord.js');

const client = new discord.Client();

describe('initialization', function() {
  it('should connect to redis', function() {
    redis = redis();
  });
  it('should initialize the redis interface', function() {
    redis(client);
  });
  it('should login to Discord', function() {
    return client.login(process.env.DISCORD_TOKEN);
  });
});
