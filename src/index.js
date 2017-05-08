const ClientDataManager = require('./ClientDataManagerExtension');
const RedisInterface = require('./RedisInterface');

module.exports = (options) => {
  const r = new RedisInterface(options);
  return Object.assign((client) => {
    // eslint-disable-next-line no-param-reassign
    client.dataManager = new ClientDataManager(client, r);
    client.once('ready', () => {
      const q = r.client.multi();
      const queries = client.users.map(u => q.hmsetAsync(`user:${u.id}`, RedisInterface.clean(u)));
      queries.push(...client.channels.map(c => q.hmsetAsync(`channel:${c.id}`, RedisInterface.clean(c))));
      queries.push(...client.guilds.map(g => q.hmsetAsync(`guild:${g.id}`, RedisInterface.clean(g))));
      queries.push(...client.emojis.map(e => q.hmsetAsync(`emoji:${e.id}`, RedisInterface.clean(e))));
      return Promise.all(queries).then(() => q.execAsync());
    });
    client.on('message', r.setMessage.bind(this));
    client.on('messageDelete', r.deleteMessage.bind(this));
    client.on('messageUpdate', (o, n) => r.setMessage(n));
    client.on('messageDeleteBulk', (messages) => {
      const q = r.client.multi();
      return Promise.all(messages.map(m => q.hdelAsync(`message:${m.id}`)))
        .then(() => q.execAsync());
    });

    client.on('userUpdate', (o, n) => r.setUser(n));
    
    client.on('channelCreate', c => r.setChannel(c));
    client.on('channelUpdate', (o, n) => r.setChannel(n));
    client.on('channelDelete', c => r.deleteChannel(c));

    client.on('emojiCreate', e => r.setEmoji(e));
    client.on('emojiUpdate', (o, n) => r.setEmoji(n));
    client.on('emojiDelete', e => r.deleteEmoji(e));

    client.on('guildCreate', g => r.setGuild(g));
    client.on('guildUpdate', (o, n) => r.setGuild(n));
    client.on('guildDelete', g => r.deleteGuild(g));

    return r;
  }, { redis: r });
};
