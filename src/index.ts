import express from 'express';
import { env, validateEnv } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import {
  corsMiddleware,
  helmetMiddleware,
  generalRateLimiter,
  additionalSecurityHeaders,
  securityLogger,
  REQUEST_SIZE_LIMITS,
} from './middleware/security.middleware';

// Validate environment variables before starting
validateEnv();

const app = express();

/**
 * ===========================================
 * SECURITY MIDDLEWARE (Order matters!)
 * ===========================================
 *
 * 1. Helmet - Sets security headers first
 * 2. CORS - Handles cross-origin requests
 * 3. Rate Limiting - Prevents abuse
 * 4. Body Parsers - With size limits
 * 5. Security Logger - Logs suspicious activity
 */

// 1. Security headers (Helmet)
app.use(helmetMiddleware);
app.use(additionalSecurityHeaders);

// 2. CORS - Cross-Origin Resource Sharing
app.use(corsMiddleware);

// 3. Rate limiting - Applied globally
// More specific rate limits are applied at route level
app.use(generalRateLimiter);

// 4. Body parsers with size limits to prevent large payload attacks
app.use(express.json({ limit: REQUEST_SIZE_LIMITS.json }));
app.use(express.urlencoded({ extended: true, limit: REQUEST_SIZE_LIMITS.urlencoded }));

// 5. Security logger for suspicious activity detection
app.use(securityLogger);

// 6. Request logger - log all incoming requests
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Trust proxy if behind reverse proxy (for accurate IP in rate limiting)
// Only enable this if you're behind a proxy like nginx or load balancer
if (env.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

/**
 * ===========================================
 * API ROUTES
 * ===========================================
 */

// API Routes - versioned for future compatibility
app.use('/api/v1', routes);

// Root endpoint - API info
app.get('/', (_req, res) => {
  res.json({
    name: 'Income Tracker API',
    version: '1.0.0',
    status: 'healthy',
    docs: '/api/v1/health',
    security: {
      rateLimit: `${env.rateLimitMax} requests per ${env.rateLimitWindowMs / 60000} minutes`,
      cors: env.nodeEnv === 'development' ? 'localhost allowed' : 'restricted',
    },
  });
});

/**
 * ===========================================
 * ERROR HANDLING (Must be last)
 * ===========================================
 */

app.use(errorHandler);

/**
 * ===========================================
 * SERVER STARTUP
 * ===========================================
 */

const server = app.listen(env.port, () => {
  console.log('========================================');
  console.log(`  Income Tracker API`);
  console.log('========================================');
  console.log(`  Status:      Running`);
  console.log(`  Port:        ${env.port}`);
  console.log(`  Environment: ${env.nodeEnv}`);
  console.log(`  Rate Limit:  ${env.rateLimitMax} req/${env.rateLimitWindowMs / 60000}min`);
  console.log('========================================');
  console.log(`  URL: http://localhost:${env.port}`);
  console.log('========================================\n');
});

/**
 * ===========================================
 * GRACEFUL SHUTDOWN
 * ===========================================
 *
 * Handle process termination signals to:
 * - Close database connections
 * - Finish processing current requests
 * - Clean up resources
 */

const gracefulShutdown = (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  server.close(() => {
    console.log('HTTP server closed.');
    console.log('Graceful shutdown completed.');
    process.exit(0);
  });

  // Force shutdown after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default app;
