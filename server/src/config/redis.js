const Redis = require("ioredis");

let redis = null;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 2,
    enableReadyCheck: true,
  });

  redis.on("connect", () => {
    console.log("Redis connected successfully");
  });

  redis.on("error", (error) => {
    console.error("Redis error:", error.message);
  });
}

module.exports = redis;