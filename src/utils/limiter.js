const rateLimit = require('express-rate-limit');

/**
 * Create a rate limiter instance
 * @param {Object} options - Rate limiter options
 * @returns {Function} Express middleware
 */
function createRateLimiter(options = {}) {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each key to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // Rate limit by API key if provided, otherwise by IP
      return req.headers['x-api-key'] || req.ip;
    },
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests',
        message: options.message || 'Rate limit exceeded, please try again later.',
        retryAfter: Math.ceil(options.windowMs / 1000)
      });
    }
  };

  return rateLimit({ ...defaultOptions, ...options });
}

/**
 * Create different rate limiters for different scenarios
 */
const strictLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many requests, please slow down.'
});

const standardLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per 15 minutes
});

module.exports = {
  createRateLimiter,
  strictLimiter,
  standardLimiter
};