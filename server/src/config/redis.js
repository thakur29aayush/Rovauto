const Redis = require("ioredis");

let redis = null;

if (process.env.REDIS_URL) {
  const isTlsRedis =
    process.env.REDIS_URL.includes("upstash.io") ||
    process.env.REDIS_URL.startsWith("rediss://");

  redis = new Redis(process.env.REDIS_URL, {
    tls: isTlsRedis ? {} : undefined,

    lazyConnect: true,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
    connectTimeout: 10000,
    commandTimeout: 5000,

    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 300, 1500);
    },

    reconnectOnError(error) {
      const message = error.message || "";

      if (
        message.includes("READONLY") ||
        message.includes("ETIMEDOUT") ||
        message.includes("EPIPE") ||
        message.includes("ECONNRESET")
      ) {
        return true;
      }

      return false;
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

  redis.on("close", () => {
    console.warn("Redis connection closed");
  });

  redis.on("end", () => {
    console.warn("Redis connection ended");
  });
} else {
  console.warn("REDIS_URL missing. Redis cache disabled.");
}

module.exports = redis;