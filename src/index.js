// src/index.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const emailRouter = require('./routes/emails');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.send('Hello — server is working! 🎉');
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Debug route - remove after testing
app.get('/api/debug-env', (req, res) => {
  res.json({
    EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'NOT SET',
    EMAIL_PASS: process.env.EMAIL_PASS ? 'Set (hidden)' : 'NOT SET',
    PORT: process.env.PORT
  });
});

// Email routes
app.use('/api/emails', emailRouter);

// 404 handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});