module.exports = class RedisInterface {
  constructor(client) {
    this.client = client;
  }

  init(client) {
    const q = this.client.multi();
    client.users.forEach(u => q.hmset(`user:${u.id}`, u));
    client.guilds.forEach(g => q.hmset(`guild:${g.id}`, g));
    client.emojis.forEach(e => q.hmset(`emoji:${e.id}`, e));
    client.channels.forEach(c => q.hmset(`channel:${c.id}`, c));
    return q.execAsync();
  }

  setChannel(channel) {
    return this._setData('channel', channel);
  }

  deleteChannel(channel) {
    return this._deleteData('channel', channel.id);
  }

  setUser(user) {
    return this._setData('user', user);
  }

  deleteUser(user) {
    return this._deleteData('user', user.id);
  }

  setGuild(guild) {
    return this._setData('guild', guild);
  }

  deleteGuild(guild) {
    return this._deleteData('guild', guild);
  }

  setEmoji(emoji) {
    return this._setData('emoji', emoji);
  }

  deleteEmoji(emoji) {
    return this._setData('emoji', emoji);
  }

  _setData(type, data) {
    return this.client.hmsetAsync(`${type}:${data.id}`, data).then(
      result => this.client.publish(`${type}Set`, data.id).then(() => result));
  }

  _deleteData(type, id) {
    return this.client.hdelAsync(`${type}:${id}`).then(
      result => this.client.publish(`${type}Delete`, id).then(() => result));
  }
};
