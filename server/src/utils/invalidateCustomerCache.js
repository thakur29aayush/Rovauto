const { deletePattern } = require("./cache");

const invalidateCustomerCache = async (userId) => {
  await deletePattern(`customer:${userId}:*`);
};

module.exports = invalidateCustomerCache;