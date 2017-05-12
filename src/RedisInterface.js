const redis = require('redis');
const tsubaki = require('tsubaki');

tsubaki.promisifyAll(redis.RedisClient.prototype);
tsubaki.promisifyAll(redis.Multi.prototype);

module.exports = class RedisInterface {
  constructor(options = {}) {
    this.client = redis.createClient(options);
  }

  init(client) {
    const q = this.client.multi();

    client.users.forEach(u => q.sadd('users', u.id));
    client.guilds.forEach(g => q.sadd('guilds', g.id));
    client.emojis.forEach(e => q.sadd('emojis', e.id));
    client.channels.forEach(c => q.sadd('channels', c.id));

    return this.client.flushallAsync().then(() => q.execAsync());
  }

  addChannel(channel) {
    return this._addData('channels', channel.id);
  }

  removeChannel(channel) {
    return this._removeData('channels', channel.id);
  }

  addUser(user) {
    return this._addData('users', user.id);
  }

  removeUser(user) {
    return this._removeData('users', user.id);
  }

  addGuild(guild) {
    return this._addData('guilds', guild.id);
  }

  removeGuild(guild) {
    return this._removeData('guilds', guild.id);
  }

  addEmoji(emoji) {
    return this._addData('emojis', emoji.id);
  }

  removeEmoji(emoji) {
    return this._removeData('emojis', emoji.id);
  }

  addMessage(message) {
    return this._addData('messages', message.id).then((res) => {
      const cache = message.client.options.messageCacheLifetime;
      if (cache) setTimeout(() => this.removeMessage(message), cache);
      return res;
    });
  }

  removeMessage(message) {
    return this._removeData('messages', message.id);
  }

  _addData(type, id) {
    return this.client.saddAsync(type, id).then(
      result => this.client.publish(`${type}Add`, id).then(() => result));
  }

  _removeData(type, id) {
    return this.client.sremAsync(type, id).then(
      result => this.client.publish(`${type}Remove`, id).then(() => result));
  }

  static clean(obj) {
    const out = {};
    Object.keys(obj).forEach((key) => {
      if (!(obj[key] instanceof Object) && obj[key] !== null && typeof obj[key] !== 'undefined') out[key] = `${obj[key]}`;
    });
    return out;
  }
};
