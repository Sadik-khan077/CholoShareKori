const express = require('express');
const cors = require('cors');
require('dotenv').config();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const db = require('./db');
const authRoutes = require('./routes/authRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const statsRoutes = require('./routes/statsRoutes');

const uploadRoutes = require('./routes/uploadRoutes');
const path = require('path');

const app = express();
const port = parseInt(process.env.PORT, 10) || 5005;

// ==========================================
// 1. SECURITY & PARSING MIDDLEWARE
// ==========================================
// Helmet protects your app by setting various HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false, // Allows your frontend to fetch local /uploads images
}));

// Rate limiting specifically for authentication routes to prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per `window` (here, per 15 minutes)
  message: { success: false, message: 'Too many authentication attempts, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply the rate limiter strictly to auth routes
app.use('/api/auth', authLimiter);

// Existing CORS and body parsing middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==========================================
// 2. ROOT & HEALTH DIAGNOSTICS
// ==========================================
app.get('/api/health', async (req, res) => {
  const dbHealth = await db.healthCheck();
  const memory = process.memoryUsage();

  return res.status(dbHealth.healthy ? 200 : 503).json({
    status: dbHealth.healthy ? 'healthy' : 'degraded',
    service: 'CholoShareKori (চলো শেয়ার করি) Campus API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbHealth,
    system: {
      heapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
      rssMb: Math.round(memory.rss / 1024 / 1024)
    }
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'CholoShareKori (চলো শেয়ার করি) Campus API is active and healthy.',
    version: '2.0.0',
    documentation: '/api/health',
    active_pillars: ['lend', 'borrow', 'buy', 'sell', 'free']
  });
});

// ==========================================
// 3. API ROUTE MOUNTING
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/upload', uploadRoutes);

// Direct shortcuts for locations and categories
app.get('/api/locations', async (req, res) => {
  const [locations] = await db.query('SELECT name, type, landmark FROM locations ORDER BY name ASC');
  res.json({ success: true, data: locations });
});

app.get('/api/categories', async (req, res) => {
  const [categories] = await db.query('SELECT name, label, icon FROM categories ORDER BY id ASC');
  res.json({ success: true, data: categories });
});

// Backward compatibility helper for legacy /users query
app.get('/users', async (req, res) => {
  try {
    const [results] = await db.query('SELECT id, name, email, location FROM users');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. 404 NOT FOUND HANDLER
// ==========================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.method} ${req.originalUrl}' does not exist on this server.`
  });
});

// ==========================================
// 5. GLOBAL ERROR HANDLING MIDDLEWARE
// ==========================================
app.use((err, req, res, next) => {
  console.error('Unhandled Server Exception:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ==========================================
// 6. SERVER START & GRACEFUL SHUTDOWN
// ==========================================
let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(port, () => {
    console.log(`\n=========================================================`);
    console.log(`🚀 CholoShareKori Backend v2.0 running on http://localhost:${port}`);
    console.log(`🩺 Health check available at http://localhost:${port}/api/health`);
    console.log(`=========================================================\n`);
  });
}

const handleShutdown = (signal) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      console.log('HTTP server closed cleanly.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }

  setTimeout(() => {
    console.error('Forcefully exiting after timeout.');
    process.exit(1);
  }, 5000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

module.exports = app;
