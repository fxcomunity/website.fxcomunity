import nodemailer from 'nodemailer'
import twilio from 'twilio'

// ─── Transporter ────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
})

// ─── Twilio ──────────────────────────────────────────────────────────────────

const getTwilioClient = () => {
  const sid   = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token) throw new Error('TWILIO_NOT_CONFIGURED')
  return twilio(sid, token)
}

// ─── Email HTML Template ─────────────────────────────────────────────────────

type OTPType = 'reset_password' | 'email_verification'

function buildEmailHTML(opts: {
  name:     string
  otp:      string
  type:     OTPType
  validity: string
}): string {
  const { name, otp, type, validity } = opts
  const isReset = type === 'reset_password'

  const icon    = isReset ? '🔑' : '✅'
  const heading = isReset ? 'Reset Password' : 'Verifikasi Email'
  const message = isReset
    ? 'Kami menerima permintaan untuk mereset password akun kamu. Gunakan kode di bawah ini untuk melanjutkan.'
    : 'Terima kasih telah bergabung di FX Comunity! Verifikasi email kamu dengan kode di bawah ini untuk mulai trading.'
  const footer  = isReset
    ? 'Jika kamu tidak meminta reset password, abaikan email ini. Password kamu tetap aman.'
    : 'Verifikasi diperlukan agar kamu bisa mengakses seluruh fitur platform.'

  return /* html */`
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${heading} – FX Comunity</title>
</head>
<body style="margin:0;padding:0;background:#08081a;font-family:'Segoe UI',sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#08081a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
          style="max-width:520px;width:100%;border-radius:20px;overflow:hidden;
                 border:1px solid rgba(199,32,230,0.25);
                 box-shadow:0 0 60px rgba(199,32,230,0.12);">

          <!-- ── Header ── -->
          <tr>
            <td style="
              background:linear-gradient(135deg,#0e1e4a 0%,#1a0a2e 60%,#2a0a3e 100%);
              padding:36px 32px 28px;
              text-align:center;
              position:relative;
              border-bottom:1px solid rgba(199,32,230,0.2);
            ">
              <!-- glow blob -->
              <div style="
                position:absolute;top:-30px;left:50%;transform:translateX(-50%);
                width:220px;height:100px;border-radius:50%;
                background:radial-gradient(ellipse,rgba(199,32,230,0.3),transparent 70%);
                pointer-events:none;
              "></div>

              <!-- logo icon -->
              <div style="
                display:inline-flex;align-items:center;justify-content:center;
                width:56px;height:56px;border-radius:14px;
                background:linear-gradient(135deg,#1F4788,#C720E6);
                font-size:26px;margin-bottom:14px;
                box-shadow:0 8px 24px rgba(199,32,230,0.4);
              ">${icon}</div>

              <!-- wordmark -->
              <div>
                <h1 style="
                  margin:0;color:#ffffff;font-size:22px;
                  font-weight:700;letter-spacing:4px;
                ">FX COMUNITY</h1>
                <p style="
                  margin:5px 0 0;color:rgba(255,255,255,0.45);
                  font-size:11px;letter-spacing:2px;text-transform:uppercase;
                ">Trading Knowledge Platform</p>
              </div>

              <!-- badge -->
              <div style="
                display:inline-block;margin-top:18px;
                padding:5px 14px;border-radius:20px;
                background:rgba(199,32,230,0.15);
                border:1px solid rgba(199,32,230,0.35);
                color:#d47fe8;font-size:11px;letter-spacing:1px;
              ">${heading}</div>
            </td>
          </tr>

          <!-- ── Body ── -->
          <tr>
            <td style="background:#0d0d1e;padding:32px;">

              <!-- greeting -->
              <p style="
                margin:0 0 6px;color:#a0a0cc;font-size:14px;line-height:1.5;
              ">Halo, <span style="color:#FF6B35;font-weight:600;">${name}</span> 👋</p>
              <p style="
                margin:0 0 28px;color:#70709a;font-size:13px;line-height:1.7;
              ">${message}</p>

              <!-- OTP block -->
              <table width="100%" cellpadding="0" cellspacing="0" style="
                background:linear-gradient(135deg,#12122a,#1a0d2e);
                border-radius:16px;
                border:1px solid rgba(199,32,230,0.3);
                margin-bottom:24px;
              ">
                <tr>
                  <td style="padding:28px;text-align:center;">
                    <p style="
                      margin:0 0 12px;color:rgba(255,255,255,0.35);
                      font-size:10px;letter-spacing:3px;text-transform:uppercase;
                    ">Kode OTP Kamu</p>

                    <!-- digit display -->
                    <div style="
                      display:inline-block;
                      background:rgba(0,0,0,0.35);
                      border-radius:12px;
                      padding:16px 24px;
                      margin-bottom:16px;
                    ">
                      <span style="
                        font-family:'Courier New',Courier,monospace;
                        font-size:44px;
                        font-weight:700;
                        letter-spacing:14px;
                        color:#FF6B35;
                        text-shadow:0 0 20px rgba(255,107,53,0.5);
                      ">${otp}</span>
                    </div>

                    <!-- validity -->
                    <div style="
                      display:inline-flex;align-items:center;gap:6px;
                      background:rgba(255,80,80,0.08);
                      border:1px solid rgba(255,80,80,0.2);
                      border-radius:20px;padding:6px 14px;
                    ">
                      <span style="font-size:13px;">⏱</span>
                      <span style="color:#e06060;font-size:12px;font-weight:500;">
                        Berlaku <strong>${validity}</strong> saja
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- security tips -->
              <table width="100%" cellpadding="0" cellspacing="0" style="
                background:rgba(31,71,136,0.1);
                border-radius:12px;
                border:1px solid rgba(31,71,136,0.25);
                margin-bottom:28px;
              ">
                <tr>
                  <td style="padding:16px 18px;">
                    <p style="
                      margin:0 0 10px;color:#6080b0;
                      font-size:10px;letter-spacing:2px;text-transform:uppercase;
                    ">🛡️ Tips Keamanan</p>
                    <ul style="margin:0;padding-left:18px;color:#505080;font-size:12px;line-height:1.9;">
                      <li>Jangan bagikan kode ini kepada siapapun</li>
                      <li>FX Comunity tidak akan pernah meminta kode OTP kamu</li>
                      <li>Kode hanya berlaku untuk satu kali penggunaan</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <!-- footer note -->
              <p style="
                margin:0;color:#404060;font-size:12px;
                line-height:1.7;text-align:center;
                border-top:1px solid rgba(255,255,255,0.05);
                padding-top:20px;
              ">${footer}</p>
            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td style="
              background:#080816;
              padding:20px 32px;
              text-align:center;
              border-top:1px solid rgba(255,255,255,0.04);
            ">
              <p style="margin:0 0 4px;color:#2a2a4a;font-size:11px;">
                © ${new Date().getFullYear()} FX Comunity · Trading Knowledge Platform
              </p>
              <p style="margin:0;color:#1e1e38;font-size:10px;">
                Email ini dikirim otomatis, mohon tidak membalas.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`
}

// ─── Send Email OTP ───────────────────────────────────────────────────────────

export async function sendOTP(
  email: string,
  otp:   string,
  name   = '',
  type:  OTPType = 'reset_password',
) {
  const isReset  = type === 'reset_password'
  const validity = isReset ? '5 menit' : '24 jam'
  const subject  = isReset
    ? '🔑 Kode OTP Reset Password – FX Comunity'
    : '✅ Kode OTP Verifikasi Email – FX Comunity'

  await transporter.sendMail({
    from:    `"FX Comunity 📚" <${process.env.GMAIL_USER}>`,
    to:      email,
    subject,
    html:    buildEmailHTML({ name: name || email, otp, type, validity }),
  })
}

// ─── Send WhatsApp OTP ────────────────────────────────────────────────────────

export async function sendWhatsAppOTP(
  phoneNumber: string,
  otp:         string,
  name         = '',
  type:        OTPType = 'reset_password',
) {
  const isReset    = type === 'reset_password'
  const validity   = isReset ? '5 menit' : '24 jam'
  const actionText = isReset
    ? 'untuk mereset password akun kamu'
    : 'untuk verifikasi email kamu'
  const footerNote = isReset
    ? 'Jika bukan kamu yang meminta, abaikan pesan ini.'
    : 'Verifikasi diperlukan agar kamu bisa mengakses semua fitur.'

  const formatted = phoneNumber.startsWith('+')
    ? phoneNumber
    : `+62${phoneNumber.replace(/^0/, '')}`

  const body = [
    isReset ? '🔑 *FX COMUNITY — RESET PASSWORD*' : '✅ *FX COMUNITY — VERIFIKASI EMAIL*',
    '',
    `Halo, *${name || 'User'}*!`,
    `Berikut kode OTP ${actionText}:`,
    '',
    `┌─────────────────┐`,
    `│   *${otp}*   │`,
    `└─────────────────┘`,
    '',
    `⏱ Berlaku *${validity}* saja`,
    '🔒 Jangan bagikan kode ini kepada siapapun.',
    '',
    footerNote,
    '',
    '━━━━━━━━━━━━━━━━━━',
    '_FX Comunity – Trading Knowledge Platform_',
  ].join('\n')

  try {
    const client = getTwilioClient()
    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to:   `whatsapp:${formatted}`,
      body,
    })
    console.log(`[WhatsApp OTP] ✓ Sent to ${formatted}`)
  } catch (err) {
    console.error('[WhatsApp OTP] ✗ Error:', err)
    throw err
  }
}