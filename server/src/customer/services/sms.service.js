const axios = require("axios");
const ApiError = require("../../utils/apiError");

const FAST2SMS_QUICK_URL = "https://www.fast2sms.com/dev/bulkV2";

const toIndianMobileNumber = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  const mobile = digits.slice(-10);

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    throw new ApiError(
      400,
      "Fast2SMS Quick SMS supports Indian 10-digit mobile numbers only"
    );
  }

  return mobile;
};

const sendFast2SmsQuick = async ({ to, message }) => {
  if (!process.env.FAST2SMS_API_KEY) {
    throw new ApiError(503, "Fast2SMS API key is not configured");
  }

  const params = {
    authorization: process.env.FAST2SMS_API_KEY,
    route: "q",
    message,
    numbers: toIndianMobileNumber(to),
  };

  const response = await axios.get(FAST2SMS_QUICK_URL, {
    params,
    headers: {
      Accept: "application/json",
    },
    timeout: 10000,
  });

  if (response.data?.return === false) {
    throw new ApiError(
      502,
      response.data?.message || "Fast2SMS could not send the OTP"
    );
  }

  return true;
};

const sendSms = async ({ to, message }) => {
  const provider = process.env.SMS_PROVIDER || "fast2sms_quick";

  if (
    process.env.NODE_ENV === "development" &&
    provider !== "fast2sms_quick" &&
    !process.env.SMS_PROVIDER_URL
  ) {
    console.log("=================================");
    console.log("DEV SMS OTP MESSAGE:", message);
    console.log("Phone:", to);
    console.log("=================================");
    return true;
  }

  if (provider === "fast2sms_quick") {
    return sendFast2SmsQuick({ to, message });
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
