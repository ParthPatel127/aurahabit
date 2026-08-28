import nodemailer from "nodemailer";

export async function sendOtpEmail(toEmail: string, otpCode: string) {
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
  const smtpUser = process.env.SMTP_USER || "aurahabitwebapp@gmail.com";
  const smtpPass = process.env.SMTP_PASS;
  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM || `AuraHabit Support <${smtpUser}>`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #090d16; color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 520px; margin: 0 auto; background: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
        .header { text-align: center; margin-bottom: 24px; }
        .logo-badge { width: 56px; height: 56px; background: #10b981; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; color: #ffffff; line-height: 56px; margin-bottom: 12px; }
        .title { font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 6px 0; }
        .subtitle { font-size: 13px; color: #94a3b8; margin: 0; }
        .otp-box { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 14px; padding: 20px; text-align: center; margin: 28px 0; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #10b981; margin: 0; }
        .expiry-text { font-size: 12px; color: #10b981; margin-top: 8px; font-weight: 600; }
        .info-text { font-size: 13px; color: #cbd5e1; line-height: 1.6; margin-bottom: 20px; }
        .footer { font-size: 11px; color: #64748b; text-align: center; margin-top: 32px; border-top: 1px solid #1e293b; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-badge">⚡</div>
          <h1 class="title">Password Reset Security Code</h1>
          <p class="subtitle">AuraHabit Account Security</p>
        </div>
        
        <p class="info-text">Hello,</p>
        <p class="info-text">We received a request to reset the password for your AuraHabit account (<strong>${toEmail}</strong>). Use the 6-digit OTP code below to verify your identity:</p>
        
        <div class="otp-box">
          <p class="otp-code">${otpCode}</p>
          <p class="expiry-text">⏰ Valid for 15 minutes</p>
        </div>

        <p class="info-text">If you did not request this password reset, please ignore this email. Your password will remain unchanged.</p>

        <div class="footer">
          <p>&copy; 2026 AuraHabit SaaS Inc. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Option A: Send via Resend API if RESEND_API_KEY is present
  if (resendApiKey) {
    try {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "AuraHabit <onboarding@resend.dev>",
          to: [toEmail],
          subject: `🔐 ${otpCode} is your AuraHabit Password Reset Security Code`,
          html: htmlContent,
        }),
      });

      const resendData = await resendRes.json();
      if (resendRes.ok) {
        console.log(`[Email Service - Resend] OTP sent to ${toEmail}. ID: ${resendData.id}`);
        return { sent: true, messageId: resendData.id };
      } else {
        console.error(`[Email Service - Resend Error]`, resendData);
      }
    } catch (err: any) {
      console.error(`[Email Service - Resend Exception]`, err);
    }
  }

  // Option B: Send via Gmail SMTP if SMTP_PASS is present
  if (smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: emailFrom,
        to: toEmail,
        subject: `🔐 ${otpCode} is your AuraHabit Password Reset Security Code`,
        html: htmlContent,
      });

      console.log(`[Email Service - SMTP] OTP sent to ${toEmail} from ${smtpUser}. ID: ${info.messageId}`);
      return { sent: true, messageId: info.messageId };
    } catch (err: any) {
      console.error(`[Email Service - SMTP Error]`, err);
      return { sent: false, reason: err.message };
    }
  }

  console.warn(`[Email Service - Pending Config] Attempted to send OTP ${otpCode} to ${toEmail}, but neither RESEND_API_KEY nor SMTP_PASS is set in environment variables.`);
  return {
    sent: false,
    reason: "Neither RESEND_API_KEY nor SMTP_PASS is set in environment variables.",
  };
}
