import { createTransport } from 'nodemailer';
import type { IUser } from '@shared/models';
import type { Transporter } from 'nodemailer';

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
};

// Create reusable transporter
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = createTransport(EMAIL_CONFIG);
  }
  return transporter;
}

// Email templates
const emailTemplates = {
  membershipExpiring: (user: IUser, daysLeft: number) => ({
    subject: `⏰ Your ${user.membership?.tier} Membership Expires in ${daysLeft} Days!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .stats { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .stat-item { display: flex; justify-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .footer { text-align: center; color: #6b7280; margin-top: 30px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>👑 Membership Expiring Soon!</h1>
          </div>
          <div class="content">
            <p>Hi ${user.firstName || user.username},</p>
            
            <p>Your <strong>${user.membership?.tier}</strong> membership will expire in <strong>${daysLeft} days</strong> on <strong>${new Date(user.membership?.expiryDate!).toLocaleDateString()}</strong>.</p>
            
            <div class="stats">
              <h3>🎉 Your Membership Benefits</h3>
              <div class="stat-item">
                <span>Membership Tier:</span>
                <strong>${user.membership?.tier}</strong>
              </div>
              <div class="stat-item">
                <span>Discount Rate:</span>
                <strong>${user.membership?.tier === 'Diamond Paw' ? '15%' : user.membership?.tier === 'Golden Paw' ? '10%' : '5%'}</strong>
              </div>
              <div class="stat-item">
                <span>Member Since:</span>
                <strong>${new Date(user.membership?.startDate!).toLocaleDateString()}</strong>
              </div>
            </div>
            
            <p>Don't lose your exclusive benefits! Renew now to continue enjoying:</p>
            <ul>
              <li>💰 Special member discounts on all products</li>
              <li>👑 Access to exclusive member-only products</li>
              <li>🚚 Priority shipping and support</li>
              <li>🎁 Birthday special offers</li>
            </ul>
            
            <center>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/privilege-club" class="button">
                Renew Membership Now
              </a>
            </center>
            
            <p>If you have auto-renew enabled, we'll automatically renew your membership before it expires.</p>
            
            <p>Best regards,<br>
            <strong>MeowMeow PetShop Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
            <p>© 2025 MeowMeow PetShop. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  membershipRenewed: (user: IUser, newExpiryDate: Date) => ({
    subject: `✅ Your ${user.membership?.tier} Membership Has Been Renewed!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; color: #6b7280; margin-top: 30px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Membership Renewed Successfully!</h1>
          </div>
          <div class="content">
            <p>Hi ${user.firstName || user.username},</p>
            
            <div class="success-box">
              <h3>🎉 Great News!</h3>
              <p>Your <strong>${user.membership?.tier}</strong> membership has been successfully renewed!</p>
            </div>
            
            <p><strong>Renewal Details:</strong></p>
            <ul>
              <li>Membership Tier: <strong>${user.membership?.tier}</strong></li>
              <li>New Expiry Date: <strong>${newExpiryDate.toLocaleDateString()}</strong></li>
              <li>Discount Rate: <strong>${user.membership?.tier === 'Diamond Paw' ? '15%' : user.membership?.tier === 'Golden Paw' ? '10%' : '5%'}</strong></li>
              <li>Auto-Renew: <strong>${user.membership?.autoRenew ? 'Enabled ✓' : 'Disabled'}</strong></li>
            </ul>
            
            <p>You can continue enjoying all your exclusive membership benefits:</p>
            <ul>
              <li>💰 Member discounts on all products</li>
              <li>👑 Access to exclusive member-only products</li>
              <li>🚚 Priority shipping and support</li>
              <li>🎁 Special birthday offers</li>
            </ul>
            
            <center>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/dashboard" class="button">
                View Dashboard
              </a>
            </center>
            
            <p>Thank you for being a valued member!</p>
            
            <p>Best regards,<br>
            <strong>MeowMeow PetShop Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
            <p>© 2025 MeowMeow PetShop. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  autoRenewFailed: (user: IUser, reason: string) => ({
    subject: `❌ Auto-Renew Failed for ${user.membership?.tier} Membership`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; color: #6b7280; margin-top: 30px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Auto-Renew Failed</h1>
          </div>
          <div class="content">
            <p>Hi ${user.firstName || user.username},</p>
            
            <div class="warning-box">
              <h3>⚠️ Action Required</h3>
              <p>We were unable to automatically renew your <strong>${user.membership?.tier}</strong> membership.</p>
            </div>
            
            <p><strong>Reason:</strong> ${reason}</p>
            
            <p><strong>Membership Details:</strong></p>
            <ul>
              <li>Current Tier: <strong>${user.membership?.tier}</strong></li>
              <li>Expiry Date: <strong>${new Date(user.membership?.expiryDate!).toLocaleDateString()}</strong></li>
              <li>Days Remaining: <strong>${Math.ceil((new Date(user.membership?.expiryDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days</strong></li>
            </ul>
            
            <p>To avoid losing your membership benefits, please:</p>
            <ol>
              <li>Check your payment method</li>
              <li>Ensure sufficient funds are available</li>
              <li>Update your payment information if needed</li>
              <li>Renew manually if auto-renew continues to fail</li>
            </ol>
            
            <center>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/privilege-club" class="button">
                Renew Membership Now
              </a>
            </center>
            
            <p>If you need assistance, please contact our support team.</p>
            
            <p>Best regards,<br>
            <strong>MeowMeow PetShop Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
            <p>© 2025 MeowMeow PetShop. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  passwordChangeOtp: (email: string, otpCode: string) => ({
    subject: `🔐 Password Change Verification Code`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; border: 2px dashed #667eea; padding: 30px; margin: 20px 0; text-align: center; border-radius: 8px; }
          .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace; }
          .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; color: #6b7280; margin-top: 30px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Change Verification</h1>
          </div>
          <div class="content">
            <p>Hi there,</p>
            
            <p>You requested to change your password. Please use the following verification code to complete the process:</p>
            
            <div class="otp-box">
              <p style="margin: 0 0 10px 0; color: #6b7280;">Your verification code:</p>
              <div class="otp-code">${otpCode}</div>
            </div>
            
            <div class="warning-box">
              <p style="margin: 0;"><strong>⚠️ Security Notice:</strong></p>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>This code will expire in 10 minutes</li>
                <li>Do not share this code with anyone</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>
            
            <p>Enter this code in the password change form to proceed with setting your new password.</p>
            
            <p>Best regards,<br>
            <strong>MeowMeow PetShop Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
            <p>© 2025 MeowMeow PetShop. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Email sending functions
export async function sendMembershipExpiringEmail(user: IUser, daysLeft: number): Promise<boolean> {
  try {
    if (!user.email) {
      console.error('User does not have an email address');
      return false;
    }

    const template = emailTemplates.membershipExpiring(user, daysLeft);

    await getTransporter().sendMail({
      from: `"MeowMeow PetShop" <${EMAIL_CONFIG.auth.user}>`,
      to: user.email,
      subject: template.subject,
      html: template.html
    });

    console.log(`✅ Expiring notification email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send membership expiring email:', error);
    return false;
  }
}

export async function sendMembershipRenewedEmail(user: IUser, newExpiryDate: Date): Promise<boolean> {
  try {
    if (!user.email) {
      console.error('User does not have an email address');
      return false;
    }

    const template = emailTemplates.membershipRenewed(user, newExpiryDate);

    await getTransporter().sendMail({
      from: `"MeowMeow PetShop" <${EMAIL_CONFIG.auth.user}>`,
      to: user.email,
      subject: template.subject,
      html: template.html
    });

    console.log(`✅ Renewal confirmation email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send membership renewed email:', error);
    return false;
  }
}

export async function sendAutoRenewFailedEmail(user: IUser, reason: string): Promise<boolean> {
  try {
    if (!user.email) {
      console.error('User does not have an email address');
      return false;
    }

    const template = emailTemplates.autoRenewFailed(user, reason);

    await getTransporter().sendMail({
      from: `"MeowMeow PetShop" <${EMAIL_CONFIG.auth.user}>`,
      to: user.email,
      subject: template.subject,
      html: template.html
    });

    console.log(`✅ Auto-renew failed email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send auto-renew failed email:', error);
    return false;
  }
}

export async function sendPasswordChangeOtpEmail(email: string, otpCode: string): Promise<boolean> {
  try {
    if (!email) {
      console.error('Email address is required');
      return false;
    }

    // Check if email is configured
    if (EMAIL_CONFIG.auth.user === 'your-email@gmail.com' || EMAIL_CONFIG.auth.pass === 'your-app-password') {
      console.error('❌ Email service not configured. Please set EMAIL_USER and EMAIL_PASSWORD in your environment variables.');
      console.error('Refer to EMAIL_SETUP_GUIDE.md for configuration instructions.');
      return false;
    }

    const template = emailTemplates.passwordChangeOtp(email, otpCode);

    await getTransporter().sendMail({
      from: `"MeowMeow PetShop" <${EMAIL_CONFIG.auth.user}>`,
      to: email,
      subject: template.subject,
      html: template.html
    });

    console.log(`✅ Password change OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send password change OTP email:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Check your email configuration in .env file');
    }
    return false;
  }
}

// Test email configuration
export async function testEmailConfiguration(): Promise<boolean> {
  try {
    await getTransporter().verify();
    console.log('✅ Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return false;
  }
}

