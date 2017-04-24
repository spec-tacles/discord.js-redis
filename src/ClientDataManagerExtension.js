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

class ClientDataManagerExtension {
  constructor(client, redisInterface) {
    this.client = client;
    this.redis = redisInterface;
  }

  get pastReady() {
    return this.client.ws.status === Constants.Status.READY;
  }

  newGuild(data) {
    const already = this.client.guilds.has(data.id);
    const guild = new Guild(this.client, data);
    this.client.guilds.set(guild.id, guild);
    if (this.pastReady && !already) {
      this.redis.setGuild(guild);
      /**
       * Emitted whenever the client joins a guild.
       * @event Client#guildCreate
       * @param {Guild} guild The created guild
       */
      if (this.client.options.fetchAllMembers) {
        guild.fetchMembers().then(() => {
          this.client.emit(Constants.Events.GUILD_CREATE, guild);
        });
      } else {
        this.client.emit(Constants.Events.GUILD_CREATE, guild);
      }
    }

    return guild;
  }

  newUser(data) {
    if (this.client.users.has(data.id)) return this.client.users.get(data.id);
    const user = new User(this.client, data);
    if (this.pastReady) this.redis.setUser(user);
    this.client.users.set(user.id, user);
    return user;
  }

  newChannel(data, g) {
    let guild = g;
    const already = this.client.channels.has(data.id);
    let channel;
    if (data.type === Constants.ChannelTypes.DM) {
      channel = new DMChannel(this.client, data);
    } else if (data.type === Constants.ChannelTypes.GROUP_DM) {
      channel = new GroupDMChannel(this.client, data);
    } else {
      guild = guild || this.client.guilds.get(data.guild_id);
      if (guild) {
        if (data.type === Constants.ChannelTypes.TEXT) {
          channel = new TextChannel(guild, data);
          guild.channels.set(channel.id, channel);
        } else if (data.type === Constants.ChannelTypes.VOICE) {
          channel = new VoiceChannel(guild, data);
          guild.channels.set(channel.id, channel);
        }
      }
    }

    if (channel) {
      if (this.pastReady && !already) {
        this.client.emit(Constants.Events.CHANNEL_CREATE, channel);
        this.redis.setChannel(channel);
      }

      this.client.channels.set(channel.id, channel);
      return channel;
    }

    return null;
  }

  newEmoji(data, guild) {
    const already = guild.emojis.has(data.id);
    if (data && !already) {
      const emoji = new Emoji(guild, data);
      this.client.emit(Constants.Events.GUILD_EMOJI_CREATE, emoji);
      this.redis.setEmoji(emoji);
      guild.emojis.set(emoji.id, emoji);
      return emoji;
    } else if (already) {
      return guild.emojis.get(data.id);
    }

    return null;
  }

  killEmoji(emoji) {
    if (!(emoji instanceof Emoji && emoji.guild)) return;
    this.client.emit(Constants.Events.GUILD_EMOJI_DELETE, emoji);
    this.redis.deleteEmoji(emoji);
    emoji.guild.emojis.delete(emoji.id);
  }

  killGuild(guild) {
    const already = this.client.guilds.has(guild.id);
    this.client.guilds.delete(guild.id);
    if (already && this.pastReady) {
      this.redis.deleteGuild(guild);
      this.client.emit(Constants.Events.GUILD_DELETE, guild);
    }
  }

  killUser(user) {
    this.redis.deleteUser(user);
    this.client.users.delete(user.id);
  }

  killChannel(channel) {
    this.redis.deleteChannel(channel);
    this.client.channels.delete(channel.id);
    if (channel instanceof GuildChannel) channel.guild.channels.delete(channel.id);
  }

  updateGuild(currentGuild, newData) {
    const oldGuild = Util.cloneObject(currentGuild);
    currentGuild.setup(newData);
    this.redis.setGuild(currentGuild);
    if (this.pastReady) this.client.emit(Constants.Events.GUILD_UPDATE, oldGuild, currentGuild);
  }

  updateChannel(currentChannel, newData) { // eslint-disable-line class-methods-use-this
    currentChannel.setup(newData);
    this.redis.setChannel(currentChannel);
  }

  updateEmoji(currentEmoji, newData) {
    const oldEmoji = Util.cloneObject(currentEmoji);
    currentEmoji.setup(newData);
    this.redis.setEmoji(currentEmoji);
    this.client.emit(Constants.Events.GUILD_EMOJI_UPDATE, oldEmoji, currentEmoji);
    return currentEmoji;
  }
}

module.exports = ClientDataManagerExtension;
