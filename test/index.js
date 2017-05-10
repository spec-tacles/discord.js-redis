const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const assert = require('assert');
const { RedisClient, RedisInterface } = require('../src/index.js');
const discord = require('discord.js');

let redis;
let redisClient;
let discordClient;

describe('data storage', function() {
  const connectErrorListener = e => { throw e; };
  before('initializes the redis interface', function() {
    redisClient = new RedisClient(new discord.Client());
    discordClient = redisClient.discordClient;
    redis = redisClient.redisClient;
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

  it('contains client data', function() {
    return redis.hgetallAsync('me').then(data => {
      assert.deepEqual(data, RedisInterface.clean({
        id: discordClient.user.id,
        username: discordClient.user.username,
        disciminator: discordClient.user.discriminator,
        avatar: discordClient.user.avatar,
        bot: discordClient.user.bot,
      }));
    });
  });

  it('contains client presence (non-sharded)', function() {
    return redis.hgetallAsync('presences').then(data => {
      assert.deepEqual(JSON.parse(data[0]), RedisInterface.flatten(discordClient.user.presence));
    });
  });
});
