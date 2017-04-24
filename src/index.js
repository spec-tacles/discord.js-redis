const redis = require('redis');
const bluebird = require('bluebird');

bluebird.promisifyAll(redis.redisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

module.exports = (options) => {
  const redisClient = redis.createClient(options);

  return (discordClient) => {
    function init() {
      const q = redisClient.multi();
      discordClient.users.forEach(u => q.hmset(`user:${u.id}`, u));
      discordClient.guilds.forEach(g => q.hmset(`guild:${g.id}`, g));
      discordClient.emojis.forEach(e => q.hmset(`emoji:${e.id}`, e));
      discordClient.channels.forEach(c => q.hmset(`channel:${c.id}`, c));
      return q.execAsync();
    }

    function channelUpdate(channel) {
      return redisClient.hmsetAsync(`channel:${channel.id}`, channel);
    }

    function channelDelete(channel) {
      return redisClient.hdel(`channel:${channel.id}`);
    }

    discordClient.once('ready', init);
    discordClient.on('channelCreate', channelUpdate);
    discordClient.on('channelUpdate', (o, n) => channelUpdate(n));
    discordClient.on('channelDelete', channelDelete);
  };
};
