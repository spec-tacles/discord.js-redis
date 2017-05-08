const {
  Constants,
  Util,
  Guild,
  User,
  DMChannel,
  Emoji,
  TextChannel,
  VoiceChannel,
  GuildChannel,
  GroupDMChannel,
} = require('discord.js');

const DataManager = require('discord.js/src/client/ClientDataManager');

class ClientDataManagerExtension extends DataManager {
  constructor(client, redisInterface) {
    super(client);
    this.redis = redisInterface;
  }

  newUser(data) {
    const user = super.newUser(data);
    if (this.pastReady) this.redis.setUser(user);
    return user;
  }

  killUser(user) {
    this.redis.deleteUser(user);
    return super.killUser(user);
  }
}

module.exports = ClientDataManagerExtension;
