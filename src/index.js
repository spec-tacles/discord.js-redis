const redis = require('redis');
const bluebird = require('bluebird');
const ClientDataManager = require('./ClientDataManagerExtension');
const RedisInterface = require('./RedisInterface');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

module.exports = (options) => {
  const redisClient = redis.createClient(options);
  const r = new RedisInterface(redisClient);

  return (discordClient) => {
    // eslint-disable-next-line no-param-reassign
    discordClient.dataManager = new ClientDataManager(discordClient, r);
  };
};
