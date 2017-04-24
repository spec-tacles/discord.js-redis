const ClientDataManager = require('./ClientDataManagerExtension');
const RedisInterface = require('./RedisInterface');

module.exports = (options) => {
  const r = new RedisInterface(options);
  return (client) => {
    // eslint-disable-next-line no-param-reassign
    client.dataManager = new ClientDataManager(client, r);
    client.once('ready', () => {
      const q = r.client.multi();
      client.users.map(u => q.hmsetAsync(`user:${u.id}`, RedisInterface.clean(u)));
      client.channels.map(c => q.hmsetAsync(`channel:${c.id}`, RedisInterface.clean(c)));
      client.guilds.map(g => q.hmsetAsync(`guild:${g.id}`, RedisInterface.clean(g)));
      client.emojis.map(e => q.hmsetAsync(`emoji:${e.id}`, RedisInterface.clean(e)));
      q.execAsync();
    });
  };
};
