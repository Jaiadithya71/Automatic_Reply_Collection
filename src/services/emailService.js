require("dotenv").config();
const fs = require("fs");
const csv = require("csv-parser");
const nodemailer = require("nodemailer");

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// Configure the mail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Function to send one email
async function sendMail(to, subject, text) {
  const mailOptions = {
    from: EMAIL_USER,
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

// Read CSV and send emails (now returns a promise)
function sendMailsFromCSV(csvPath, subject, body) {
  return new Promise((resolve, reject) => {
    const recipients = [];

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (row) => {
        if (row.email) {
          recipients.push(row.email.trim());
        }
      })
      .on("end", async () => {
        console.log(`Found ${recipients.length} emails in CSV`);

        const results = [];
        for (const email of recipients) {
          const result = await sendMail(email, subject, body);
          results.push(result);
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

module.exports = { sendMail, sendMailsFromCSV };