require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

// Internal Modules
const { connectDB } = require('./server/config/db');
const store = require('./server/data/store');

// Routes
const authRoutes = require('./server/routes/authRoutes');
const alertRoutes = require('./server/routes/alertRoutes');
const incidentRoutes = require('./server/routes/incidentRoutes');
const shelterRoutes = require('./server/routes/shelterRoutes');
const dashboardRoutes = require('./server/routes/dashboardRoutes');
const mapRoutes = require('./server/routes/mapRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Custom basic security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Static Folders
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/shelters', shelterRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/map', mapRoutes);

// Health & Status Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    system: 'DisasterGuard Emergency Management Platform',
    timestamp: new Date().toISOString(),
    storage: store.getStorageMode()
  });
});

// Fallback 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[DisasterGuard Error]:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected server error occurred.' 
      : err.message || 'Internal server error'
  });
});

// Server Initialization
async function startServer() {
  try {
    // 1. Attempt MongoDB connection if configured
    const mongoConnected = await connectDB();

    // 2. Initialize storage repository (MongoDB or persistent JSON)
    await store.init(mongoConnected);

    // 3. Start Express HTTP Listener
    app.listen(PORT, () => {
      console.log('====================================================');
      console.log('  DisasterGuard — Disaster Management System');
      console.log('====================================================');
      console.log(`  🚀 Server Running:    http://localhost:${PORT}`);
      console.log(`  💾 Storage Mode:      ${store.getStorageMode().description}`);
      console.log(`  🔑 Demo Admin Login:  ${process.env.DEMO_ADMIN_EMAIL || 'admin@disasterguard.org'}`);
      console.log(`  🔒 Demo Password:     ${process.env.DEMO_ADMIN_PASSWORD || 'admin123'}`);
      console.log('====================================================');
    });
  } catch (error) {
    console.error('Fatal initialization error:', error);
    process.exit(1);
  }
}

startServer();
