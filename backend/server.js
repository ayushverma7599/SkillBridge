// backend/server.js
// Enhanced SmartHub API Server with complete middleware & setup

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Database & Firebase
const { sequelize } = require('./models');
const { initializeFirebase } = require('./config/firebase');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user.routes');
const projectRoutes = require('./routes/projects');
const milestoneRoutes = require('./routes/milestones');
const paymentRoutes = require('./routes/payments');
const messageRoutes = require('./routes/messages');

// App initialization
const app = express();
const PORT = process.env.PORT || 5000;

// ===== DATABASE CONNECTION =====
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Sync models with database
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database schema synced');
    } else {
      await sequelize.sync();
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
};

// ===== MIDDLEWARE =====

// Security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: ['http://localhost:8081', 'http://localhost:3000', 'http://127.0.0.1:8081'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: '⚠️ Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use('/api/', limiter);

// Request logging middleware (custom)
app.use((req, res, next) => {
  const startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '🚀 SmartHub API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API Health OK',
    timestamp: new Date().toISOString(),
  });
});

// ===== API ROUTES =====
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/milestones', milestoneRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/messages', messageRoutes);

// Root API endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'SmartHub API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      projects: '/api/v1/projects',
      milestones: '/api/v1/milestones',
      payments: '/api/v1/payments',
      messages: '/api/v1/messages',
    },
  });
});

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  });
});

// ===== GLOBAL ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error('❌ Error occurred:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  });

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: 'error',
    message: message,
    error: process.env.NODE_ENV === 'development' ? err : {},
    timestamp: new Date().toISOString(),
  });
});

// ===== SERVER INITIALIZATION =====
const startServer = async () => {
  try {
    console.log('\n🔧 Starting SmartHub API Server...\n');

    // Test database connection
    await testConnection();

    // Initialize Firebase
    initializeFirebase();
    console.log('✅ Firebase initialized');

    // Start server
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log('🚀 SmartHub API Server Successfully Started');
      console.log('='.repeat(60));
      console.log(`📍 Local URL: http://localhost:${PORT}`);
      console.log(`🌍 API Base: http://localhost:${PORT}/api/v1`);
      console.log(`💻 Health Check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
      console.log('='.repeat(60) + '\n');

      // Log available endpoints
      console.log('📋 Available Endpoints:');
      console.log('   ✓ /api/v1/auth      (Authentication & Authorization)');
      console.log('   ✓ /api/v1/users     (User Management)');
      console.log('   ✓ /api/v1/projects  (Project Management)');
      console.log('   ✓ /api/v1/milestones(Milestone Tracking)');
      console.log('   ✓ /api/v1/payments  (Payment Processing)');
      console.log('   ✓ /api/v1/messages  (Messaging & Chat)\n');
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      app.close(() => {
        console.log('HTTP server closed');
        sequelize.close().then(() => {
          console.log('Database connection closed');
          process.exit(0);
        });
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error(error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

module.exports = app;