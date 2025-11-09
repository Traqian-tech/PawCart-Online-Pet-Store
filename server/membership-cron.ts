/**
 * Membership Cron Job
 * 
 * This script runs daily to:
 * 1. Check for memberships expiring in 7 days
 * 2. Send expiring notification emails
 * 3. Process auto-renew memberships
 * 4. Send renewal confirmation emails
 * 
 * Usage:
 * - Run manually: npx tsx server/membership-cron.ts
 * - Schedule with cron: Add to crontab or use node-cron
 */

import mongoose from 'mongoose';
import { User } from '@shared/models';
import { 
  sendMembershipExpiringEmail, 
  sendMembershipRenewedEmail,
  sendAutoRenewFailedEmail,
  testEmailConfiguration
} from './email-service';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Connect to MongoDB
async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/petshop';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Check for expiring memberships and send notifications
async function checkExpiringMemberships() {
  console.log('\n🔍 Checking for expiring memberships...');

  try {
    // Calculate date 7 days from now
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    sevenDaysFromNow.setHours(23, 59, 59, 999);

    const sixDaysFromNow = new Date();
    sixDaysFromNow.setDate(sixDaysFromNow.getDate() + 6);
    sixDaysFromNow.setHours(0, 0, 0, 0);

    // Find users with memberships expiring in exactly 7 days
    const expiringUsers = await User.find({
      'membership.expiryDate': {
        $gte: sixDaysFromNow,
        $lte: sevenDaysFromNow
      },
      email: { $exists: true, $ne: null }
    });

    console.log(`📋 Found ${expiringUsers.length} memberships expiring in 7 days`);

    let successCount = 0;
    let failCount = 0;

    for (const user of expiringUsers) {
      const daysLeft = Math.ceil(
        (new Date(user.membership!.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      console.log(`\n📧 Sending expiring notification to ${user.email} (${user.membership?.tier}, ${daysLeft} days left)`);

      const success = await sendMembershipExpiringEmail(user, daysLeft);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }

      // Add a small delay to avoid overwhelming the email server
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n✅ Successfully sent: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);

    return { total: expiringUsers.length, success: successCount, failed: failCount };
  } catch (error) {
    console.error('❌ Error checking expiring memberships:', error);
    throw error;
  }
}

// Process auto-renew memberships
async function processAutoRenewals() {
  console.log('\n🔄 Processing auto-renewal memberships...');

  try {
    // Find memberships expiring today or tomorrow with auto-renew enabled
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const autoRenewUsers = await User.find({
      'membership.expiryDate': {
        $gte: today,
        $lte: tomorrow
      },
      'membership.autoRenew': true,
      email: { $exists: true, $ne: null }
    });

    console.log(`📋 Found ${autoRenewUsers.length} memberships to auto-renew`);

    let successCount = 0;
    let failCount = 0;

    for (const user of autoRenewUsers) {
      console.log(`\n🔄 Processing auto-renewal for ${user.email} (${user.membership?.tier})`);

      try {
        // Calculate new expiry date (1 year from original expiry)
        const newExpiryDate = new Date(user.membership!.expiryDate);
        newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);

        // Update membership expiry date
        user.membership!.expiryDate = newExpiryDate;
        
        // Update last renew date
        if (user.membership!.statistics) {
          user.membership!.statistics.lastRenewDate = new Date();
        }

        await user.save();

        // Send renewal confirmation email
        const emailSent = await sendMembershipRenewedEmail(user, newExpiryDate);

        if (emailSent) {
          console.log(`✅ Auto-renewed ${user.membership?.tier} for ${user.email} until ${newExpiryDate.toLocaleDateString()}`);
          successCount++;
        } else {
          console.log(`⚠️ Renewed but email failed for ${user.email}`);
          successCount++; // Still count as success since membership was renewed
        }

        // NOTE: In production with Stripe integration, you would:
        // 1. Charge the saved payment method
        // 2. Handle payment failures
        // 3. Send failure notifications
        // For now, we're just extending the membership

      } catch (error) {
        console.error(`❌ Failed to auto-renew for ${user.email}:`, error);
        
        // Send failure notification
        await sendAutoRenewFailedEmail(
          user, 
          'Payment processing failed. Please update your payment method and renew manually.'
        );
        
        failCount++;
      }

      // Add a small delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n✅ Successfully renewed: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);

    return { total: autoRenewUsers.length, success: successCount, failed: failCount };
  } catch (error) {
    console.error('❌ Error processing auto-renewals:', error);
    throw error;
  }
}

// Main function
async function main() {
  console.log('🚀 Starting Membership Cron Job');
  console.log(`📅 Current time: ${new Date().toLocaleString()}`);

  try {
    // Connect to database
    await connectDB();

    // Test email configuration
    console.log('\n📧 Testing email configuration...');
    const emailReady = await testEmailConfiguration();
    if (!emailReady) {
      console.warn('⚠️ Email server not properly configured. Emails will not be sent.');
      console.warn('   Please set EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD in .env file');
    }

    // Check for expiring memberships
    const expiringResults = await checkExpiringMemberships();

    // Process auto-renewals
    const renewalResults = await processAutoRenewals();

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 CRON JOB SUMMARY');
    console.log('='.repeat(50));
    console.log(`Expiring Notifications: ${expiringResults.success}/${expiringResults.total} sent`);
    console.log(`Auto-Renewals: ${renewalResults.success}/${renewalResults.total} processed`);
    console.log('='.repeat(50));

    console.log('\n✅ Membership cron job completed successfully');
  } catch (error) {
    console.error('\n❌ Cron job failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
}

// Run the cron job
main();






