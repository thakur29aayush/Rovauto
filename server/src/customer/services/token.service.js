const { generateToken } = require("../../utils/jwt");

const createAuthToken = (user) => {
  return generateToken({
    id: user.id,
    role: user.role,
  });
};

module.exports = {
  createAuthToken,
};
