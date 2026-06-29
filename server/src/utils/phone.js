const ApiError = require("./apiError");

const normalizePhone = (phone) => {
  const cleaned = String(phone || "")
    .trim()
    .replace(/[\s().-]/g, "");

  if (!/^\+[1-9]\d{7,14}$/.test(cleaned)) {
    throw new ApiError(400, "Phone number must be in E.164 format, for example +9779812345678");
  }

  return cleaned;
};

module.exports = {
  normalizePhone,
};
