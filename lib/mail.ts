import nodemailer from 'nodemailer'
const tr = nodemailer.createTransport({ service:'gmail', auth:{ user:process.env.GMAIL_USER, pass:process.env.GMAIL_PASS } })

const twilio = require('twilio')
const getTwilioClient = () => {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token) throw new Error('TWILIO_NOT_CONFIGURED')
  return twilio(sid, token)
}

export async function sendOTP(email:string, otp:string, name='', type:'reset_password'|'email_verification' = 'reset_password') {
  const isResetPassword = type === 'reset_password'
  const subject = isResetPassword ? '🔑 Kode OTP Reset Password - FX Comunity' : '✅ Kode OTP Verifikasi Email - FX Comunity'
  const title = isResetPassword ? 'Reset Password' : 'Verifikasi Email'
  const message = isResetPassword
    ? `Kamu minta reset password. Gunakan kode OTP di bawah ini:`
    : `Terima kasih telah mendaftar! Gunakan kode OTP di bawah ini untuk verifikasi email kamu:`

  await tr.sendMail({
    from:`"FX Comunity 📚" <${process.env.GMAIL_USER}>`, to:email,
    subject,
    html:`<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#0d0d1a;border-radius:16px;overflow:hidden;border:1px solid #1F4788">
<div style="background:linear-gradient(135deg,#1F4788,#C720E6);padding:30px;text-align:center">
<div style="font-size:36px">${isResetPassword ? '🔑' : '✅'}</div>
<h1 style="color:#fff;margin:8px 0 0;font-size:22px;letter-spacing:2px">FX COMUNITY</h1>
<p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:12px">Trading Knowledge Platform</p>
</div>
<div style="padding:28px">
<p style="color:#c0c0e0;font-size:15px">Halo <b style="color:#FF6B35">${name||email}</b>,</p>
<p style="color:#a0a0c0;font-size:14px">${message}</p>
<div style="background:#1a1a2e;border:2px dashed #C720E6;border-radius:12px;padding:24px;text-align:center;margin:20px 0">
<p style="color:#a0a0c0;margin:0 0 8px;font-size:12px">KODE OTP KAMU</p>
<h2 style="color:#FF6B35;font-size:42px;letter-spacing:12px;margin:0;font-family:monospace">${otp}</h2>
<p style="color:#e04040;margin:10px 0 0;font-size:12px">⏱ Berlaku ${isResetPassword ? '5 menit' : '24 jam'} saja</p>
</div>
<p style="color:#606080;font-size:12px">${isResetPassword ? 'Jika bukan kamu yang minta, abaikan email ini.' : 'Verifikasi email diperlukan untuk mengakses semua fitur.'}</p>
</div>
</div>`
  })
}

export async function sendWhatsAppOTP(phoneNumber: string, otp: string, name = '') {
  try {
    const twilioClient = getTwilioClient()
    // Format nomor WhatsApp (pastikan dimulai dengan +62 untuk Indonesia)
    const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+62${phoneNumber.replace(/^0/, '')}`

    const message = `🔑 *FX COMUNITY - RESET PASSWORD*

Halo ${name || 'User'}!

Kode OTP untuk reset password Anda: *${otp}*

⏱ Berlaku 5 menit saja

Jika bukan Anda yang meminta, abaikan pesan ini.

*FX Community - Trading Knowledge Platform*`

    await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedNumber}`,
      body: message
    })

    console.log(`[WhatsApp OTP] Sent to ${formattedNumber}`)
  } catch (error) {
    console.error('[WhatsApp OTP] Error:', error)
    throw error
  }
}
