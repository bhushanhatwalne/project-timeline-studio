const nodemailer = require('nodemailer');

let transporter = null;

function initializeEmailTransporter() {
  if (transporter) return transporter;

  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  console.log('[EMAIL] Checking email configuration...');
  console.log('[EMAIL] EMAIL_SERVICE:', emailService);
  console.log('[EMAIL] EMAIL_USER configured:', !!emailUser);
  console.log('[EMAIL] EMAIL_PASSWORD configured:', !!emailPassword);

  if (!emailUser || !emailPassword) {
    console.warn('[EMAIL] ⚠️ Email credentials not configured. Set EMAIL_USER and EMAIL_PASSWORD in environment variables.');
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      service: emailService,
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });

    console.log('[EMAIL] ✓ Email transporter initialized successfully');
    return transporter;
  } catch (err) {
    console.error('[EMAIL] ✗ Failed to initialize email transporter:', err.message);
    return null;
  }
}

async function sendPasswordResetEmail(userEmail, resetToken) {
  const emailTransporter = initializeEmailTransporter();

  if (!emailTransporter) {
    console.warn('[EMAIL] ⚠️ Email not configured. Password reset code will be displayed in browser.');
    return false;
  }

  try {
    console.log('[EMAIL] Attempting to send reset email to:', userEmail);
    console.log('[EMAIL] Email from:', process.env.EMAIL_USER);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Timeline Studio - Password Reset Code',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your Timeline Studio password.</p>
        <p><strong>Your reset code is:</strong></p>
        <h1 style="background:#f0f0f0;padding:20px;border-radius:8px;text-align:center;font-family:monospace;letter-spacing:5px;">${resetToken}</h1>
        <p>This code will expire in <strong>15 minutes</strong>.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr>
        <p style="font-size:12px;color:#666;">Timeline Studio - Project Planning & Gantt Charts</p>
      `,
      text: `Password Reset Code: ${resetToken}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this, please ignore this email.`,
    };

    console.log('[EMAIL] Calling sendMail()...');
    const startTime = Date.now();

    const info = await Promise.race([
      emailTransporter.sendMail(mailOptions),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Email send timeout after 10 seconds')), 10000)
      )
    ]);

    const duration = Date.now() - startTime;
    console.log(`[EMAIL] ✓ Email sent successfully in ${duration}ms`);
    console.log('[EMAIL] MessageID:', info.messageId);
    return true;
  } catch (err) {
    console.error('[EMAIL] ✗ Failed to send password reset email to', userEmail);
    console.error('[EMAIL] Error type:', err.name);
    console.error('[EMAIL] Error message:', err.message);
    console.error('[EMAIL] Error code:', err.code);
    if (err.response) {
      console.error('[EMAIL] SMTP response:', err.response);
    }
    return false;
  }
}

module.exports = {
  initializeEmailTransporter,
  sendPasswordResetEmail,
};
