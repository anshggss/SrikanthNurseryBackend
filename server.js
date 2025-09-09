const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();
const cookieParser = require('cookie-parser');





require('dotenv').config();
const connectDB = require('./config/database');
connectDB(); // Connect to MongoDB at startup


// Import routes
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cookieParser()); // before your routes

app.use(
  cors({
    origin: "http://localhost:5173", // your React app
    credentials: true,               // allow cookies to be sent
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Srikanth Nursery API is running',
    timestamp: new Date().toISOString()
  });
});

// Serve React Admin Panel at /login
// Serve static files from Vite build
app.use(express.static(path.join(__dirname, "Admin/dist")));

// React entry point for /login
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "Admin/dist", "index.html"));
});

// React router fallback for /login/*
app.get("/login/*", (req, res) => {
  res.sendFile(path.join(__dirname, "Admin/dist", "index.html"));
});


// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: 'The requested endpoint does not exist'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌱 Srikanth Nursery API server running on port ${PORT}`);
  console.log(`🌐 Health check available at https://api-srikanth-nursery.onrender.com/health`);
  console.log(`📊 API endpoints available at https://api-srikanth-nursery.onrender.com/api`);
});
