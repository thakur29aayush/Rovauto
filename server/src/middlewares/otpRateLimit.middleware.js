const rateLimit = require("./rateLimit.middleware");

const normalizeOtpIdentifier = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const otpKeyGenerator = (req) => {
  const identifier =
    req.body?.email ||
    req.body?.phone ||
    req.body?.identifier ||
    "otp";

  return `${req.ip}:${normalizeOtpIdentifier(identifier)}`;
};

const otpCooldownRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  keyGenerator: otpKeyGenerator,
});

const otpHourlyRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 500,
  keyGenerator: otpKeyGenerator,
});

const otpDailyRateLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 1000,
  keyGenerator: otpKeyGenerator,
});

const otpSendRateLimits = [
  otpCooldownRateLimit,
  otpHourlyRateLimit,
  otpDailyRateLimit,
];

module.exports = {
  otpSendRateLimits,
};
