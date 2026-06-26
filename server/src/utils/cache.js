const redis = require("../config/redis");

const ensureRedisConnected = async () => {
  if (!redis) return false;

  if (redis.status === "ready") return true;

  if (redis.status === "wait" || redis.status === "end") {
    try {
      await redis.connect();
      return true;
    } catch (error) {
      console.error("Redis connect failed:", error.message);
      return false;
    }
  }

  return redis.status === "ready";
};

const getCache = async (key) => {
  try {
    const connected = await ensureRedisConnected();
    if (!connected) return null;

    const cached = await redis.get(key);
    if (!cached) return null;

    console.log(`✅ Cache Hit: ${key}`);
    return JSON.parse(cached);
  } catch (error) {
    console.error("Redis get failed:", error.message);
    return null;
  }
};

const setCache = async (key, data, ttlSeconds = 60) => {
  try {
    const connected = await ensureRedisConnected();
    if (!connected) return;

    await redis.set(key, JSON.stringify(data), "EX", ttlSeconds);
    console.log(`💾 Cache Set: ${key}`);
  } catch (error) {
    console.error("Redis set failed:", error.message);
  }
};

const deleteCache = async (key) => {
  try {
    const connected = await ensureRedisConnected();
    if (!connected) return;

    await redis.del(key);
    console.log(`🧹 Cache Deleted: ${key}`);
  } catch (error) {
    console.error("Redis delete failed:", error.message);
  }
};

const deletePattern = async (pattern) => {
  try {
    const connected = await ensureRedisConnected();
    if (!connected) return;

    const stream = redis.scanStream({
      match: pattern,
      count: 100,
    });

    const keys = [];

    for await (const resultKeys of stream) {
      keys.push(...resultKeys);
    }

    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`🧹 Cache Deleted Pattern: ${pattern}`);
    }
  } catch (error) {
    console.error("Redis pattern delete failed:", error.message);
  }
};

module.exports = {
  getCache,
  setCache,
  deleteCache,
  deletePattern,
};