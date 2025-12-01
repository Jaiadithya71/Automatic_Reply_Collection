const express = require('express');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const emailRouter = require('./routes/emails'); // Add email router
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/emails', emailRouter); // Add email route

// 404 handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handler
app.use(errorHandler);

module.exports = app;