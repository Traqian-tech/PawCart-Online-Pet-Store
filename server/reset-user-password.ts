import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { User } from '../shared/models';
import readline from 'readline';

dotenv.config();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function resetUserPassword() {
  try {
    console.log('🔐 Password Reset Tool\n');
    console.log('═'.repeat(80));

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/meowmeowpetshop';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get email from user input
    const email = await question('Enter email address: ');
    
    if (!email.trim()) {
      console.log('❌ Email is required');
      process.exit(1);
    }

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

    console.log('\n👤 User Information:');
    console.log('═'.repeat(80));
    console.log(`ID: ${user._id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Username: ${user.username}`);
    console.log(`Name: ${user.firstName} ${user.lastName}`);
    console.log(`Role: ${user.role}`);
    console.log(`Is Active: ${user.isActive}`);

    // Get new password from user input
    console.log('\n🔑 Password Reset:');
    console.log('═'.repeat(80));
    const newPassword = await question('Enter new password (min 6 characters): ');
    
    if (!newPassword || newPassword.length < 6) {
      console.log('❌ Password must be at least 6 characters long');
      process.exit(1);
    }

    const confirmPassword = await question('Confirm new password: ');
    
    if (newPassword !== confirmPassword) {
      console.log('❌ Passwords do not match');
      process.exit(1);
    }

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
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    rl.close();
    process.exit(1);
  }
}

resetUserPassword();









