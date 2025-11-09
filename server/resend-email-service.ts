// Resend Email Service - Simple email sending without SMTP configuration
// Get your free API key at https://resend.com

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev'; // Use your verified domain

/**
 * Send email using Resend API
 * @param options Email options (to, subject, html)
 * @returns Promise<boolean> - true if sent successfully
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Check if Resend API key is configured
    if (!RESEND_API_KEY || RESEND_API_KEY === '') {
      console.error('❌ Resend API key not configured. Set RESEND_API_KEY in your .env file');
      console.error('📝 Get your free API key at https://resend.com');
      return false;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Resend API error:', error);
      return false;
    }

    const result = await response.json();
    console.log(`✅ Email sent successfully to ${options.to} (ID: ${result.id})`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send email via Resend:', error);
    return false;
  }
}

/**
 * Send password change OTP email
 */
export async function sendPasswordChangeOtpEmail(email: string, otpCode: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 40px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 40px; }
        .otp-box { background: #fef3c7; border: 2px solid #fbbf24; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
        .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #92400e; font-family: 'Courier New', monospace; }
        .info-box { background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        .warning { color: #dc2626; font-weight: 500; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Change Verification</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>You requested to change your password. Please use the verification code below to complete the process:</p>
          
          <div class="otp-box">
            <div style="color: #92400e; font-size: 14px; margin-bottom: 10px;">Your Verification Code</div>
            <div class="otp-code">${otpCode}</div>
          </div>
          
          <div class="info-box">
            <strong>📋 How to use:</strong>
            <ol style="margin: 10px 0;">
              <li>Return to the password change dialog</li>
              <li>Enter this 6-digit code</li>
              <li>Enter your new password</li>
              <li>Click "Update Password"</li>
            </ol>
          </div>
          
          <p><strong>⏱️ This code will expire in 10 minutes.</strong></p>
          
          <p class="warning">⚠️ If you didn't request this password change, please ignore this email and ensure your account is secure.</p>
          
          <p>Best regards,<br><strong>MeowMeow PetShop Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>&copy; ${new Date().getFullYear()} MeowMeow PetShop. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: '🔐 Password Change Verification Code - MeowMeow PetShop',
    html,
  });
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration(): Promise<boolean> {
  console.log('🧪 Testing Resend email configuration...');
  
  if (!RESEND_API_KEY || RESEND_API_KEY === '') {
    console.error('❌ RESEND_API_KEY is not set');
    return false;
  }
  
  console.log('✅ RESEND_API_KEY is configured');
  console.log(`📧 FROM_EMAIL: ${FROM_EMAIL}`);
  
  return true;
}









