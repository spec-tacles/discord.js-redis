const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const assert = require('assert');
const dRedis = require('../src/index.js');
const discord = require('discord.js');

let redis;
let redisClient;
let discordClient;

describe('data storage', function() {
  const connectErrorListener = e => { throw e; };
  before('initializes the redis interface', function() {
    redisClient = new dRedis.RedisClient(new discord.Client());
    discordClient = redisClient.discordClient;
    redis = redisClient.client;
    redis.once('error', connectErrorListener);
  });

  before('logs in to Discord', function() {
    return discordClient.login(process.env.DISCORD_TOKEN);
  });

  before('connects to redis', function(done) {
    if(redisClient.ready) handleEnd()
    else redisClient.once('ready', handleEnd);

    function handleEnd() {
      redis.removeListener('error', connectErrorListener);
      done();
    }
  });

  it('contains all users', function() {
    return redis.smembersAsync('users').then(list => {
      assert.deepEqual(list.sort(), discordClient.users.map(u => u.id).sort());
    });
  });

  it('contains all guilds', function() {
    return redis.smembersAsync('guilds').then(list => {
      assert.deepEqual(list.sort(), discordClient.guilds.map(g => g.id).sort());
    });
  });

  it('contains all channels', function() {
    return redis.smembersAsync('channels').then(list => {
      assert.deepEqual(list.sort(), discordClient.channels.map(c => c.id).sort());
    });
  });

  it('contains all emojis', function() {
    return redis.smembersAsync('emojis').then(list => {
      assert.deepEqual(list.sort(), discordClient.emojis.map(e => e.id).sort());
    });
  });
});
