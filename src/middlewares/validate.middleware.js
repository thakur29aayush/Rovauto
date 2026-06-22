const { validationResult } = require("express-validator");
const ApiError = require("../utils/apiError");

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const message = errors
    .array()
    .map((error) => error.msg)
    .join(", ");

  return next(new ApiError(400, message));
};

module.exports = validate;