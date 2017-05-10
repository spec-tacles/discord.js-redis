const EventEmitter = require('events');
const ClientDataManagerExtension = require('./ClientDataManagerExtension');
const RedisInterface = require('./RedisInterface');

class RedisClient extends EventEmitter {
  constructor(client, options) {
    super();

    this.discordClient = client;
    this.options = options;

    this.ready = false;
    this.on('ready', () => { this.ready = true; });

    this.r = new RedisInterface(this.options);
    this.redisClient = this.r.client;
    this.redisClient.once('ready', () => this.initialize());
  }

  initialize() {
    const c = this.discordClient;
    // eslint-disable-next-line no-param-reassign
    c.dataManager = new ClientDataManagerExtension(c, this.r);

    if (c.readyTimestamp) this._ready();
    else c.once('ready', this._ready.bind(this));

    c.on('message', this.r.addMessage.bind(this));
    c.on('messageDelete', this.r.removeMessage.bind(this));
    c.on('messageDeleteBulk', (messages) => {
      const q = this.redisClient.multi();
      messages.forEach(m => q.sremAsync('message', m.id));
      return q.execAsync();
    });

    c.on('emojiCreate', this.r.addEmoji.bind(this));
    c.on('emojiDelete', this.r.removeEmoji.bind(this));

    c.on('channelCreate', this.r.addChannel.bind(this));
    c.on('channelDelete', this.r.removeChannel.bind(this));

    c.on('guildCreate', this.r.addGuild.bind(this));
    c.on('guildDelete', this.r.removeGuild.bind(this));
  }

  _ready() {
    this.r.init(this.discordClient).then(() => this.emit('ready', this));
  }
}

module.exports = { RedisClient, RedisInterface };
