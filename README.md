# discord.js-redis

[![Build Status](https://travis-ci.org/some-plebs/discord.js-redis.svg?branch=master)](https://travis-ci.org/some-plebs/discord.js-redis)

Integrates Discord.js caching with Redis.  Stores users, guilds, channels, messages, and emojis in a hash map keyed by `[type]:[id]`.  You can subscribe to channels named `[type]Set` and `[type]Delete` which will contain a payload of the resource ID.
