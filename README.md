# discord.js-redis

[![Build Status](https://travis-ci.org/spec-tacles/discord.js-redis.svg?branch=master)](https://travis-ci.org/spec-tacles/discord.js-redis)

Integrates Discord.js caching with Redis.  Stores users, guilds, channels, messages, and emojis in a hash map keyed by `[type]:[id]`.  You can subscribe to channels named `[type]Set` and `[type]Delete` which will contain a payload of the resource ID.

## Example
```js
const discord = require('discord.js');
const redis = require('discord.js-redis')({
  host: '1.3.3.7' // these options can be found on redis.js.org
});

const client = new discord.Client();
redis(client);

client.login('token');
```
