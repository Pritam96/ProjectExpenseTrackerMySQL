const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // Log to console for dev
  console.log("Error from Middleware:", err);

  // Validation Error - required fields missing
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((error) => error.message);
    error = new ErrorResponse(messages, 400);
  }

  // Cast Error - Mongoose bad objectId
  if (err.name === "CastError") {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // E11000 duplicate key error collection - Mongoose duplicate key
  if (err.code === 11000) {
    // const message = 'Duplicate field value entered.';
    const message = `This ${Object.keys(err.keyPattern)[0]} is already exists.`;
    error = new ErrorResponse(message, 400);
  }

  res
    .status(error.statusCode || 500)
    .json({ success: false, error: error.message || "Server Error" });
};

module.exports = errorHandler;
