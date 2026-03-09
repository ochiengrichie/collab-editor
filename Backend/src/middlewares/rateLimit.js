import { rateLimit } from "express-rate-limit";

function limiterMessage(message) {
  return {
    success: false,
    data: null,
    error: message,
  };
}

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (_req, res) => {
    return res.status(429).json(limiterMessage("Too many requests. Please try again later."));
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (_req, res) => {
    return res
      .status(429)
      .json(limiterMessage("Too many authentication attempts. Please try again later."));
  },
});
