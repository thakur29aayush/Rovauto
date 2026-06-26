const Redis = require("ioredis");

let redis = null;

if (process.env.REDIS_URL) {
  const isTlsRedis =
    process.env.REDIS_URL.includes("upstash.io") ||
    process.env.REDIS_URL.startsWith("rediss://");

  redis = new Redis(process.env.REDIS_URL, {
    tls: isTlsRedis ? {} : undefined,

    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,

    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 300, 1500);
    },
  });

  redis.on("connect", () => {
    console.log("Redis connected successfully");
  });

  redis.on("ready", () => {
    console.log("Redis ready");
  });

  redis.on("error", (error) => {
    console.error("Redis error:", error.message);
  });

  redis.on("end", () => {
    console.warn("Redis connection ended");
  });
}

module.exports = redis;