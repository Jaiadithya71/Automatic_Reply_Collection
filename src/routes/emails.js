const express = require('express');
const router = express.Router();
const { sendMailsFromCSV } = require('../services/emailService');

// Endpoint to trigger email sending
router.post('/send', async (req, res, next) => {
  try {
    const csvPath = req.body.csvPath || 'emails.csv';
    const subject = req.body.subject || 'Your subject here';
    const body = req.body.body || 'Hi,\n\nThis is a test email sent from Node.js.\n\nThanks';
    
    const result = await sendMailsFromCSV(csvPath, subject, body);
    
    res.json({ 
      success: true, 
      message: `Sent emails to ${result.sent} recipients`,
      details: result
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;