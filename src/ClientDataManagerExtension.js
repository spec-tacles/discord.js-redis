const DataManager = require('discord.js/src/client/ClientDataManager');

class ClientDataManagerExtension extends DataManager {
  constructor(client, redisInterface) {
    super(client);
    this.redis = redisInterface;
  }

  newUser(data) {
    const user = super.addUser(data);
    if (this.pastReady) this.redis.setUser(user);
    return user;
  }

  killUser(user) {
    this.redis.removeUser(user);
    return super.killUser(user);
  }
}

module.exports = ClientDataManagerExtension;
