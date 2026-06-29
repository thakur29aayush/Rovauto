const { deletePattern } = require("./cache");

const invalidateCustomerCache = async (userId) => {
  if (!userId) return false;

  return deletePattern(`customer:${userId}:*`);
};

module.exports = invalidateCustomerCache;