
const nodemailer = require('nodemailer');
const fs = require('fs');

async function testSendOTP() {
  const env = fs.readFileSync('.env.local', 'utf8');
  const userMatch = env.match(/GMAIL_USER=(.*)/);
  const passMatch = env.match(/GMAIL_PASS=(.*)/);
  if (!userMatch || !passMatch) {
    console.error('GMAIL credentials not found');
    return;
  }
  const GMAIL_USER = userMatch[1].trim();
  const GMAIL_PASS = passMatch[1].trim();

  console.log('Testing with GMAIL_USER:', GMAIL_USER);

  const tr = nodemailer.createTransport({ 
    service: 'gmail', 
    auth: { 
      user: GMAIL_USER, 
      pass: GMAIL_PASS 
    } 
  });

  const email = GMAIL_USER; // Send to self
  const otp = '123456';
  const name = 'Test User';
  const type = 'reset_password';

  try {
    await tr.sendMail({
      from: `"FX Comunity 📚" <${GMAIL_USER}>`,
      to: email,
      subject: '🔑 Kode OTP Reset Password - FX Comunity',
      html: `<h1>Test OTP: ${otp}</h1>`
    });
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

testSendOTP();
