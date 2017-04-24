const ClientDataManager = require('./ClientDataManagerExtension');
const RedisInterface = require('./RedisInterface');

module.exports = (options) => {
  const r = new RedisInterface(options);
  return (discordClient) => {
    // eslint-disable-next-line no-param-reassign
    discordClient.dataManager = new ClientDataManager(discordClient, r);
  };
};
