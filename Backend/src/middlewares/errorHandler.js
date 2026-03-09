import { createResponse } from "../utils/response.js";

export function notFoundHandler(req, res, next) {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = Number(err?.statusCode || err?.status || 500);
  const isServerError = statusCode >= 500;
  const errorMessage = isServerError
    ? "Internal server error"
    : err?.message || "Request failed";

  if (isServerError) {
    console.error("Unhandled error:", {
      method: req.method,
      path: req.originalUrl,
      message: err?.message,
      stack: err?.stack,
    });
  }

  return createResponse(res, false, null, errorMessage, statusCode);
}

export default errorHandler;
