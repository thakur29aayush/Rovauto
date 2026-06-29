const ApiError = require("./apiError");

const normalizePhone = (phone) => {
  const raw = String(phone || "")
    .trim()
    .replace(/[\s().-]/g, "");
  const digits = raw.replace(/\D/g, "");
  const mobile = digits.startsWith("91") ? digits.slice(2) : digits;
  const cleaned = `+91${mobile}`;

  if (!/^\+91[6-9]\d{9}$/.test(cleaned)) {
    throw new ApiError(400, "Phone number must be a valid Indian mobile number, for example +919812345678");
  }

  return cleaned;
};

module.exports = {
  normalizePhone,
};
