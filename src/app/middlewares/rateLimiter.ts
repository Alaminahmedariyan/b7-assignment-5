import rateLimit from "express-rate-limit";
import { StatusCodes } from "http-status-codes";

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // 10 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: StatusCodes.TOO_MANY_REQUESTS,
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
});