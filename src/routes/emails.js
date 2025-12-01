// src/routes/emails.js
const express = require('express');
const router = express.Router();
const path = require('path');
const { sendMailsFromCSV } = require('../services/emailService');

// Endpoint to trigger email sending
router.post('/send', async (req, res, next) => {
  try {
    // Get parameters from request body or use defaults
    const csvPath = req.body.csvPath || path.join(__dirname, '../../emails.csv');
    const subject = req.body.subject || 'Your subject here';
    const body = req.body.body || 'Hi,\n\nThis is a test email sent from Node.js.\n\nThanks';
    
    // Get credentials from environment variables
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    
    // Debug logging
    console.log('Email credentials check:', {
      emailUser: emailUser ? 'Set' : 'NOT SET',
      emailPass: emailPass ? 'Set' : 'NOT SET'
    });
    
    const result = await sendMailsFromCSV(csvPath, subject, body, emailUser, emailPass);
    
    res.json({ 
      success: true, 
      message: `Successfully sent ${result.sent} emails out of ${result.total} total`,
      details: {
        total: result.total,
        sent: result.sent,
        failed: result.failed
      }
    });
  } catch (err) {
    next(err);
  }
});

// Health check endpoint
router.get('/status', (req, res) => {
  const configured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
  res.json({ 
    emailServiceConfigured: configured,
    message: configured 
      ? 'Email service is configured' 
      : 'Email service not configured. Set EMAIL_USER and EMAIL_PASS in .env'
  });
});

module.exports = router;