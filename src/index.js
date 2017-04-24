const ClientDataManager = require('./ClientDataManagerExtension');
const RedisInterface = require('./RedisInterface');

function cleanObject(obj) {
  const out = {};
  Object.keys(obj).forEach((key) => {
    if (!(obj[key] instanceof Object) && obj[key] !== null && typeof obj[key] !== 'undefined') out[key] = obj[key];
  });
  return out;
}

module.exports = (options) => {
  const r = new RedisInterface(options);
  return (client) => {
    // eslint-disable-next-line no-param-reassign
    client.dataManager = new ClientDataManager(client, r);
    client.once('ready', () => {
      const q = r.client.multi();
      client.users.map(u => q.hmsetAsync(`user:${u.id}`, cleanObject(u)));
      client.channels.map(c => q.hmsetAsync(`channel:${c.id}`, cleanObject(c)));
      client.guilds.map(g => q.hmsetAsync(`guild:${g.id}`, cleanObject(g)));
      client.emojis.map(e => q.hmsetAsync(`emoji:${e.id}`, cleanObject(e)));
      q.execAsync();
    });
  };
};
