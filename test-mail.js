
const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testMail() {
  console.log('Testing email with:', process.env.GMAIL_USER);
  const tr = nodemailer.createTransport({ 
    service: 'gmail', 
    auth: { 
      user: process.env.GMAIL_USER, 
      pass: process.env.GMAIL_PASS 
    } 
  });

  try {
    await tr.sendMail({
      from: `"Test" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: 'Test Email from Zencoder',
      text: 'This is a test email to verify SMTP settings.'
    });
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

testMail();
