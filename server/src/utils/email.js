const nodemailer = require('nodemailer');

let transporter = null;

function initializeEmailTransporter() {
  if (transporter) return transporter;

  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  if (!emailUser || !emailPassword) {
    console.warn('[EMAIL] Email credentials not configured. Password reset emails will not be sent.');
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

    console.log('[EMAIL] ✓ Email transporter initialized');
    return transporter;
  } catch (err) {
    console.error('[EMAIL] ✗ Failed to initialize email transporter:', err.message);
    return null;
  }
}

async function sendPasswordResetEmail(userEmail, resetToken) {
  const emailTransporter = initializeEmailTransporter();

  if (!emailTransporter) {
    console.warn('[EMAIL] Email not configured. Skipping password reset email.');
    return false;
  }

  try {
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

    const info = await emailTransporter.sendMail(mailOptions);
    console.log('[EMAIL] ✓ Password reset email sent to', userEmail);
    return true;
  } catch (err) {
    console.error('[EMAIL] ✗ Failed to send password reset email:', err.message);
    return false;
  }
}

module.exports = {
  initializeEmailTransporter,
  sendPasswordResetEmail,
};
