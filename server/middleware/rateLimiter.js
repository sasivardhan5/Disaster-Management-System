// Lightweight in-memory rate limiter to avoid abuse on public incident report submissions & login
const requestCounts = new Map();

function rateLimiter({ windowMs = 60 * 1000, max = 30, message = 'Too many requests, please slow down.' }) {
  // Periodically clean up old buckets
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of requestCounts.entries()) {
      if (now - record.startTime > windowMs) {
        requestCounts.delete(key);
      }
    }
  }, 2 * windowMs);

  return function (req, res, next) {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const routeKey = `${ip}:${req.baseUrl || req.path}`;
    const now = Date.now();

    const record = requestCounts.get(routeKey);

    if (!record) {
      requestCounts.set(routeKey, { count: 1, startTime: now });
      return next();
    }

    if (now - record.startTime < windowMs) {
      record.count++;
      if (record.count > max) {
        return res.status(429).json({
          success: false,
          message: message
        });
      }
      return next();
    }

    // Reset window
    record.count = 1;
    record.startTime = now;
    next();
  };
}

module.exports = rateLimiter;
