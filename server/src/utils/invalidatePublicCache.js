const { deletePattern } = require("./cache");

const invalidatePublicCache = async () => {
  await Promise.all([
    deletePattern("services:*"),
    deletePattern("vehicle-meta:*"),
    deletePattern("garages:*"),
  ]);
};

module.exports = invalidatePublicCache;