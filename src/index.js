const ClientDataManagerExtension = require('./ClientDataManagerExtension');
const RedisInterface = require('./RedisInterface');

module.exports = (client, options) => {
  const r = new RedisInterface(options);

  // eslint-disable-next-line no-param-reassign
  client.dataManager = new ClientDataManagerExtension(client, r);

  client.once('ready', () => {
    const q = r.client.multi();
    const queries = client.users.map(u => q.saddAsync('user', u.id));
    queries.push(...client.channels.map(c => q.saddAsync('channel', c.id)));
    queries.push(...client.guilds.map(g => q.saddAsync('guild', g.id)));
    queries.push(...client.emojis.map(e => q.saddAsync('emoji', e.id)));
    return Promise.all(queries).then(() => q.execAsync());
  });

  client.on('message', r.addMessage.bind(this));
  client.on('messageDelete', r.removeMessage.bind(this));
  client.on('messageDeleteBulk', (messages) => {
    const q = r.client.multi();
    return Promise.all(messages.map(m => q.sremAsync('message', m.id)))
      .then(() => q.execAsync());
  });

  client.on('emojiCreate', r.addEmoji.bind(this));
  client.on('emojiDelete', r.removeEmoji.bind(this));

  client.on('channelCreate', r.addChannel.bind(this));
  client.on('channelDelete', r.removeChannel.bind(this));

  client.on('guildCreate', r.addGuild.bind(this));
  client.on('guildDelete', r.removeGuild.bind(this));

  return r.client;
};
