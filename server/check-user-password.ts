import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../shared/models';

dotenv.config();

async function checkUserPassword() {
  try {
    console.log('🔍 Checking User Password Hash...\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/meowmeowpetshop';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Email to check
    const email = '1374033928@qq.com';

    // Find user by email (case-insensitive)
    let user = await User.findOne({ email: email });
    
    if (!user) {
      // Try case-insensitive search
      const allUsers = await User.find({});
      user = allUsers.find(u => u.email?.toLowerCase() === email.toLowerCase());
    }

    if (!user) {
      console.log(`❌ User not found with email: ${email}`);
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
    console.log('\n🔑 Password Hash Information:');
    console.log('═'.repeat(80));
    
    if (!user.password) {
      console.log('❌ No password stored (user uses external authentication)');
    } else {
      console.log(`Password Hash Length: ${user.password.length} characters`);
      console.log(`Password Hash Prefix: ${user.password.substring(0, 20)}...`);
      console.log(`Password Hash Suffix: ...${user.password.substring(user.password.length - 20)}`);
      console.log(`Full Password Hash: ${user.password}`);
      
      // Check if it's a bcrypt hash
      const isBcrypt = user.password.startsWith('$2a$') || 
                       user.password.startsWith('$2b$') || 
                       user.password.startsWith('$2y$');
      
      if (isBcrypt) {
        console.log('\n✅ Password is stored as bcrypt hash');
        const parts = user.password.split('$');
        if (parts.length >= 4) {
          console.log(`   Bcrypt Version: ${parts[1]}`);
          console.log(`   Cost Factor: ${parts[2]}`);
        }
      } else {
        console.log('\n⚠️  Password does NOT appear to be a bcrypt hash!');
        console.log('   This might be the issue - password should be hashed with bcrypt.');
      }
    }

    console.log('\n' + '═'.repeat(80));
    console.log('✅ Check complete');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUserPassword();

