module.exports = (redis, options) => {
  const m = redis.client.multi();
  m.set('website', options.website);
  m.hmset('prefixes', options.prefixes);
  m.set('oauth', options.oauth);
  m.set('guild', options.guild);
  m.set('description', options.description);
  return m.execAsync();
};
