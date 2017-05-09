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
    client.users.forEach(u => q.sadd('user', u.id));
    client.guilds.forEach(g => q.sadd('guild', g.id));
    client.emojis.forEach(e => q.sadd('emoji', e.id));
    client.channels.forEach(c => q.sadd('channel', c.id));
    q.set('me', client.user.id);
    return q.execAsync();
  }

  addChannel(channel) {
    return this._addData('channel', channel.id);
  }

  removeChannel(channel) {
    return this._removeData('channel', channel.id);
  }

  addUser(user) {
    return this._addData('user', user.id);
  }

  removeUser(user) {
    return this._removeData('user', user.id);
  }

  addGuild(guild) {
    return this._addData('guild', guild.id);
  }

  removeGuild(guild) {
    return this._removeData('guild', guild.id);
  }

  addEmoji(emoji) {
    return this._addData('emoji', emoji.id);
  }

  removeEmoji(emoji) {
    return this._removeData('emoji', emoji.id);
  }

  addMessage(message) {
    return this._addData('message', message.id).then((res) => {
      const cache = message.client.options.messageCacheLifetime;
      if (cache) setTimeout(() => this.removeMessage(message), cache);
      return res;
    });
  }

  removeMessage(message) {
    return this._removeData('message', message.id);
  }

  _addData(type, id) {
    return this.client.saddAsync(type, id).then(
      result => this.client.publish(`${type}add`, id).then(() => result));
  }

  _removeData(type, id) {
    return this.client.sremAsync(type, id).then(
      result => this.client.publish(`${type}remove`, id).then(() => result));
  }

  static clean(obj) {
    const out = {};
    Object.keys(obj).forEach((key) => {
      if (!(obj[key] instanceof Object) && obj[key] !== null && typeof obj[key] !== 'undefined') out[key] = obj[key];
    });
    return out;
  }
};
