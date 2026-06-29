const ApiError = require("../utils/apiError");

const buckets = new Map();

const rateLimit = ({
  windowMs = 60 * 1000,
  max = 30,
  keyGenerator = (req) => req.ip,
} = {}) => {
  return (req, res, next) => {
    const now = Date.now();
    const key = keyGenerator(req);
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return next();
    }

    if (bucket.count >= max) {
      return next(new ApiError(429, "Too many requests. Please try again later."));
    }

    bucket.count += 1;
    return next();
  };
};

module.exports = rateLimit;
