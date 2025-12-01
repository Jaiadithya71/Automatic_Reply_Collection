// src/sendEmails.js
require("dotenv").config();
const fs = require("fs");
const csv = require("csv-parser");
const nodemailer = require("nodemailer");

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// 1. Configure the mail transporter (example: Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// 2. Function to send one email
async function sendMail(to, subject, text) {
  const mailOptions = {
    from: EMAIL_USER,
    to,
    subject,
    text,           // plain text body
    // html: "<p>...</p>"  // optional HTML body
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to: ${to}`);
  } catch (err) {
    console.error(`❌ Failed for ${to}:`, err.message);
  }
}

// 3. Read CSV and send emails
function sendMailsFromCSV(csvPath) {
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

      const subject = "Your subject here";
      const body =
        "Hi,\n\nThis is a test email sent from Node.js.\n\nThanks";

      for (const email of recipients) {
        await sendMail(email, subject, body);
      }

      console.log("🎉 Done sending all emails");
    })
    .on("error", (err) => {
      console.error("Error reading CSV:", err);
    });
}

// call the function with your CSV file
sendMailsFromCSV("emails.csv");
