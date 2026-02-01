import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { env } from '../config/env';

/**
 * ===========================================
 * CORS CONFIGURATION
 * ===========================================
 *
 * CORS (Cross-Origin Resource Sharing) controls which domains
 * can access your API. Without this, any website could make
 * requests to your API, potentially leading to:
 * - Data theft
 * - CSRF attacks
 * - Unauthorized API usage
 */

// Define allowed origins based on environment
const getAllowedOrigins = (): string[] => {
  if (env.nodeEnv === 'development') {
    return [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ];
  }

  // In production, only allow your actual frontend domain
  // Add your production domain here
  return [
    process.env.FRONTEND_URL || 'https://your-production-domain.com',
  ];
};

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();

    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Log blocked origins in development for debugging
    if (env.nodeEnv === 'development') {
      console.warn(`CORS blocked origin: ${origin}`);
    }

    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400, // Cache preflight requests for 24 hours
});

/**
 * ===========================================
 * HELMET CONFIGURATION
 * ===========================================
 *
 * Helmet sets various HTTP headers to protect against
 * common web vulnerabilities:
 *
 * - X-Content-Type-Options: Prevents MIME type sniffing
 * - X-Frame-Options: Prevents clickjacking attacks
 * - X-XSS-Protection: Enables browser XSS filtering
 * - Strict-Transport-Security: Enforces HTTPS
 * - Content-Security-Policy: Controls resource loading
 */

export const helmetMiddleware = helmet({
  // Content Security Policy - controls what resources can be loaded
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  // Prevent clickjacking - don't allow site to be embedded in iframes
  frameguard: { action: 'deny' },
  // Hide X-Powered-By header (hides that we're using Express)
  hidePoweredBy: true,
  // Prevent MIME type sniffing
  noSniff: true,
  // Enable XSS filter in browsers
  xssFilter: true,
});

/**
 * ===========================================
 * RATE LIMITING
 * ===========================================
 *
 * Rate limiting prevents abuse by limiting how many requests
 * a client can make in a given time window.
 *
 * Why it matters:
 * - Prevents brute force attacks (password guessing)
 * - Prevents DoS (Denial of Service) attacks
 * - Prevents API abuse and scraping
 * - Protects server resources
 *
 * How it works:
 * 1. Each client is identified by IP address
 * 2. We track request count in a time window
 * 3. If limit exceeded, return 429 (Too Many Requests)
 * 4. After window expires, counter resets
 */

// Store for rate limit data (in production, use Redis for distributed systems)
// For now, we use in-memory store which works for single-server deployments

// General API rate limit: 100 requests per 15 minutes
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes in milliseconds
  max: 100, // Max 100 requests per window
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true, // Return rate limit info in headers (RateLimit-*)
  legacyHeaders: false, // Disable X-RateLimit-* headers
  // Uses default keyGenerator which properly handles IPv4 and IPv6
});

// Stricter rate limit for authentication endpoints: 5 requests per 15 minutes
// This prevents brute force password attacks
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 attempts
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again in 15 minutes.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Add a custom handler for when limit is exceeded
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for auth from IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts. Please try again in 15 minutes.',
    });
  },
});

// Rate limit for file uploads: 10 uploads per hour
// Prevents abuse of storage and processing resources
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: {
    success: false,
    error: 'Upload limit reached. Please try again later.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limit for sensitive operations: 20 per hour
// For operations like bulk delete, data export, etc.
export const sensitiveRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: {
    success: false,
    error: 'Rate limit exceeded for sensitive operations.',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * ===========================================
 * REQUEST VALIDATION MIDDLEWARE
 * ===========================================
 *
 * Validates common request parameters like UUIDs
 * to prevent invalid data from reaching the database.
 */

// UUID v4 regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Middleware to validate UUID route parameters
export const validateUuidParam = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const paramValue = req.params[paramName];
    // Handle case where param could be string or string[]
    const id = Array.isArray(paramValue) ? paramValue[0] : paramValue;

    if (id && !UUID_REGEX.test(id)) {
      return res.status(400).json({
        success: false,
        error: `Invalid ${paramName} format. Expected UUID.`,
      });
    }

    next();
  };
};

/**
 * ===========================================
 * REQUEST SIZE LIMITS
 * ===========================================
 *
 * Limits the size of incoming request bodies to prevent:
 * - Memory exhaustion attacks
 * - Denial of Service via large payloads
 */

// Export size limits as constants so they can be used in express.json()
export const REQUEST_SIZE_LIMITS = {
  json: '1mb',      // For regular JSON requests
  urlencoded: '1mb', // For form data
  upload: 10,        // For file uploads in MB (handled by multer)
};

/**
 * ===========================================
 * SECURITY HEADERS MIDDLEWARE
 * ===========================================
 *
 * Additional custom security headers
 */

export const additionalSecurityHeaders = (_req: Request, res: Response, next: NextFunction) => {
  // Prevent caching of sensitive data
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

  next();
};

/**
 * ===========================================
 * REQUEST LOGGING FOR SECURITY
 * ===========================================
 *
 * Logs suspicious activities for security monitoring
 */

export const securityLogger = (req: Request, _res: Response, next: NextFunction) => {
  // Log requests with suspicious patterns
  const suspiciousPatterns = [
    /(\.\.|\/\/)/, // Path traversal attempts
    /<script/i,    // XSS attempts
    /union.*select/i, // SQL injection attempts
  ];

  const url = req.url;
  const body = JSON.stringify(req.body);

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url) || pattern.test(body)) {
      console.warn(`[SECURITY] Suspicious request detected from ${req.ip}:`, {
        method: req.method,
        url: req.url,
        headers: req.headers,
        timestamp: new Date().toISOString(),
      });
      break;
    }
  }

  next();
};
