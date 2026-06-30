const GARAGE_MINIMUM_ACTIVATION_RECHARGE = 1000;

const calculatePlatformFee = (totalServiceAmount, requestType = "NORMAL") => {
  if (requestType === "SOS") return 50;

  const amount = Number(totalServiceAmount) || 0;

  if (amount >= 300 && amount < 1000) return 30;
  if (amount >= 1000 && amount < 5000) return 99;
  if (amount >= 5000 && amount < 20000) return 249;
  if (amount >= 20000) return 500;

  return 99;
};

module.exports = {
  GARAGE_MINIMUM_ACTIVATION_RECHARGE,
  calculatePlatformFee,
};
