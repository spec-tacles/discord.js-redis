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

    this.interface = new RedisInterface(this.options);
    this.client = this.interface.client;
    this.initialize();
  }

  initialize() {
    const c = this.discordClient;
    // eslint-disable-next-line no-param-reassign
    c.dataManager = new ClientDataManagerExtension(c, this.interface);

    if (c.readyTimestamp) this._ready();
    else c.once('ready', this._ready.bind(this));

    c.on('message', this.interface.addMessage.bind(this));
    c.on('messageDelete', this.interface.removeMessage.bind(this));
    c.on('messageDeleteBulk', (messages) => {
      const q = this.client.multi();
      messages.forEach(m => q.sremAsync('message', m.id));
      return q.execAsync();
    });

    c.on('emojiCreate', this.interface.addEmoji.bind(this));
    c.on('emojiDelete', this.interface.removeEmoji.bind(this));

    c.on('channelCreate', this.interface.addChannel.bind(this));
    c.on('channelDelete', this.interface.removeChannel.bind(this));

    c.on('guildCreate', this.interface.addGuild.bind(this));
    c.on('guildDelete', this.interface.removeGuild.bind(this));
  }

  _ready() {
    this.interface.init(this.discordClient).then(() => this.emit('ready', this));
  }
}

module.exports = { Client: RedisClient, RedisInterface };
