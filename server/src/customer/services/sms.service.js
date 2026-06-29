const axios = require("axios");
const ApiError = require("../../utils/apiError");

const sendSms = async ({ to, message }) => {
  if (process.env.NODE_ENV === "development" && !process.env.SMS_PROVIDER_URL) {
    console.log("=================================");
    console.log("DEV SMS OTP MESSAGE:", message);
    console.log("Phone:", to);
    console.log("=================================");
    return true;
  }

  if (!process.env.SMS_PROVIDER_URL) {
    throw new ApiError(503, "SMS provider is not configured");
  }

  await axios.post(
    process.env.SMS_PROVIDER_URL,
    {
      to,
      message,
      sender: process.env.SMS_SENDER_ID,
    },
    {
      headers: {
        ...(process.env.SMS_PROVIDER_TOKEN && {
          Authorization: `Bearer ${process.env.SMS_PROVIDER_TOKEN}`,
        }),
      },
      timeout: 10000,
    }
  );

  return true;
};

module.exports = {
  sendSms,
};
