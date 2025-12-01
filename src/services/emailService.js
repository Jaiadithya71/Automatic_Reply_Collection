// src/services/emailService.js
const fs = require("fs");
const csv = require("csv-parser");
const nodemailer = require("nodemailer");

// Function to send one email
async function sendMail(transporter, to, subject, text, from) {
  const mailOptions = {
    from: from,
    to,
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to: ${to}`);
    return { success: true, email: to };
  } catch (err) {
    console.error(`❌ Failed for ${to}:`, err.message);
    return { success: false, email: to, error: err.message };
  }
}

// Read CSV and send emails
function sendMailsFromCSV(csvPath, subject, body, emailUser, emailPass) {
  return new Promise((resolve, reject) => {
    // Debug logging
    console.log('sendMailsFromCSV called with:', {
      csvPath,
      subject,
      body: body.substring(0, 20) + '...',
      emailUser: emailUser || 'UNDEFINED',
      emailPass: emailPass ? '***SET***' : 'UNDEFINED'
    });
    
    // Validate credentials
    if (!emailUser || !emailPass) {
      console.error('Validation failed - credentials missing');
      return reject(new Error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS in .env file'));
    }

    // Configure the mail transporter with TLS options to handle certificate issues
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      tls: {
        // Don't fail on invalid certificates
        rejectUnauthorized: false
      },
      // Alternative: use direct SMTP configuration
      // host: 'smtp.gmail.com',
      // port: 587,
      // secure: false, // use STARTTLS
    });

    const recipients = [];

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (row) => {
        if (row.email) {
          recipients.push(row.email.trim());
        }
      })
      .on("end", async () => {
        if (recipients.length === 0) {
          return reject(new Error('No email addresses found in CSV'));
        }

        console.log(`Found ${recipients.length} emails in CSV`);

        const results = [];
        for (const email of recipients) {
          const result = await sendMail(transporter, email, subject, body, emailUser);
          results.push(result);
          // Add a small delay between emails to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const sent = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;

        console.log(`🎉 Done: ${sent} sent, ${failed} failed`);
        
        resolve({ 
          total: recipients.length, 
          sent, 
          failed, 
          results 
        });
      })
      .on("error", (err) => {
        console.error("Error reading CSV:", err);
        reject(err);
      });
  });
}

module.exports = { sendMailsFromCSV };