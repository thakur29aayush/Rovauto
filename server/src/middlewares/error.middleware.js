const errorMiddleware = (err, req, res, next) => {
  const isMulterError = err.name === "MulterError";
  const statusCode = err.statusCode || (isMulterError ? 400 : 500);

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message: err.message || "Internal server error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = errorMiddleware;
