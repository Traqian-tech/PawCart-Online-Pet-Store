import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { User } from '../shared/models';

dotenv.config();

async function resetPasswordDirect() {
  try {
    // Get email and password from command line arguments
    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
      console.log('❌ Usage: npx tsx server/reset-password-direct.ts <email> <new-password>');
      console.log('   Example: npx tsx server/reset-password-direct.ts 1374033928@qq.com mynewpassword123');
      process.exit(1);
    }

    if (newPassword.length < 6) {
      console.log('❌ Password must be at least 6 characters long');
      process.exit(1);
    }

    console.log('🔐 Direct Password Reset Tool\n');
    console.log('═'.repeat(80));

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/meowmeowpetshop';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Find user by email (case-insensitive)
    let user = await User.findOne({ email: email.trim() });
    
    if (!user) {
      // Try case-insensitive search
      const allUsers = await User.find({});
      user = allUsers.find(u => u.email?.toLowerCase() === email.toLowerCase().trim());
    }

    if (!user) {
      console.log(`\n❌ User not found with email: ${email}`);
      console.log('\n📋 Available users in database:');
      const allUsers = await User.find({}).select('email username').limit(10);
      allUsers.forEach(u => {
        console.log(`  - Email: ${u.email}, Username: ${u.username}`);
      });
      process.exit(1);
    }

    console.log('👤 User Information:');
    console.log('═'.repeat(80));
    console.log(`ID: ${user._id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Username: ${user.username}`);
    console.log(`Name: ${user.firstName} ${user.lastName}`);
    console.log(`Role: ${user.role}`);
    console.log(`Is Active: ${user.isActive}`);

    // Hash new password
    console.log('\n🔄 Hashing new password...');
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password in MongoDB
    console.log('💾 Updating password in database...');
    user.password = hashedPassword;
    user.updatedAt = new Date();
    await user.save();

    // Verify the password was saved correctly
    const verifyPassword = await bcrypt.compare(newPassword, user.password);
    if (!verifyPassword) {
      console.error('❌ Password verification failed after save!');
      process.exit(1);
    }

    console.log('\n✅ Password reset successful!');
    console.log('═'.repeat(80));
    console.log(`Email: ${user.email}`);
    console.log(`New password hash: ${user.password.substring(0, 20)}...`);
    console.log(`Updated at: ${user.updatedAt}`);
    console.log('\n✅ You can now log in with the new password.');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetPasswordDirect();









