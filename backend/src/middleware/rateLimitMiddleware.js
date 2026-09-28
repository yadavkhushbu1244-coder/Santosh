const rateLimit = require('express-rate-limit');

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 mins default
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX || '100', 10);
const authMaxRequests = parseInt(process.env.AUTH_RATE_LIMIT_MAX || '20', 10);

/**
 * General API Rate Limiter
 */
const apiLimiter = rateLimit({
  windowMs,
  max: maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
    errors: ['Rate limit exceeded']
  }
});

/**
 * Strict Auth Rate Limiter to prevent brute force
 */
const authLimiter = rateLimit({
  windowMs,
  max: authMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    errors: ['Auth rate limit exceeded']
  }
});

module.exports = {
  apiLimiter,
  authLimiter
};
