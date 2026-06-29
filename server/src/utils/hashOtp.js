const crypto = require("crypto");

const hashOtp = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

module.exports = hashOtp;