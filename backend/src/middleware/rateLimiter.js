import rateLimit from 'express-rate-limit';

// General API rate limiter: 100 requests per 15 minutes per IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Terlalu banyak request dari IP ini, silakan coba lagi nanti',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  skip: (req) => {
    // Don't count health checks atau internal requests
    return req.path === '/api/health' || req.path === '/health';
  }
});

// Strict login rate limiter: 5 attempts per 15 minutes per IP
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Terlalu banyak percobaan login gagal, silakan coba lagi dalam 15 menit',
  skip: (req) => {
    // Only apply for login endpoint
    return !req.path.includes('/login');
  }
});

// Scheduling endpoint limiter: 10 requests per hour per IP
export const schedulingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Terlalu banyak request penjadwalan, silakan coba lagi nanti',
  skip: (req) => {
    // Only apply for scheduling endpoints
    return !req.path.includes('/schedule');
  }
});

export default {
  apiLimiter,
  loginLimiter,
  schedulingLimiter
};
