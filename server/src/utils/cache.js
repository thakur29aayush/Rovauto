const redis = require("../config/redis");

const getCache = async (key) => {
  if (!redis) return null;

  const cached = await redis.get(key);
  if (!cached) return null;

  return JSON.parse(cached);
};

const setCache = async (key, data, ttlSeconds = 60) => {
  if (!redis) return;

  await redis.set(key, JSON.stringify(data), "EX", ttlSeconds);
};

const deleteCache = async (key) => {
  if (!redis) return;

  await redis.del(key);
};

const deletePattern = async (pattern) => {
  if (!redis) return;

  const keys = await redis.keys(pattern);

  if (keys.length > 0) {
    await redis.del(keys);
  }
};

module.exports = {
  getCache,
  setCache,
  deleteCache,
  deletePattern,
};