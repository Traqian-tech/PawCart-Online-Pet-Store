import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Order } from '../shared/models';

dotenv.config();

async function checkMembershipStats() {
  try {
    console.log('🔍 Checking Membership Statistics...\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/meowmeowpetshop';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get user email or ID from command line
    const userIdentifier = process.argv[2];
    if (!userIdentifier) {
      console.log('❌ Please provide a user email or ID');
      console.log('Usage: npx ts-node server/check-membership-stats.ts <email-or-id>');
      process.exit(1);
    }

    // Find user
    let user = await User.findById(userIdentifier);
    if (!user) {
      user = await User.findOne({ email: userIdentifier });
    }
    if (!user) {
      user = await User.findOne({ username: userIdentifier });
    }

    if (!user) {
      console.log(`❌ User not found: ${userIdentifier}`);
      process.exit(1);
    }

    console.log('👤 User Information:');
    console.log('═'.repeat(80));
    console.log(`Name: ${user.firstName} ${user.lastName}`);
    console.log(`Email: ${user.email}`);
    console.log(`Username: ${user.username}`);
    console.log(`ID: ${user._id}`);

    if (user.membership && new Date() <= new Date(user.membership.expiryDate)) {
      console.log(`Membership: ${user.membership.tier} ✅ Active`);
      console.log(`Expires: ${new Date(user.membership.expiryDate).toLocaleDateString()}`);
      console.log(`Member Since: ${new Date(user.membership.startDate).toLocaleDateString()}`);
    } else if (user.membership) {
      console.log(`Membership: ${user.membership.tier} ❌ Expired`);
      console.log(`Expired: ${new Date(user.membership.expiryDate).toLocaleDateString()}`);
    } else {
      console.log(`Membership: None`);
    }

    // Find all orders
    const userIdStr = user._id.toString();
    const orders = await Order.find({
      userId: { $in: [userIdStr, user.id, user.username, user.email] },
      status: { $nin: ['Cancelled', 'Refunded'] }
    }).sort({ createdAt: -1 });

    console.log(`\n📦 Orders: ${orders.length} total\n`);

    if (orders.length === 0) {
      console.log('No orders found.');
      process.exit(0);
    }

    // Analyze orders
    console.log('📊 Order Analysis:');
    console.log('═'.repeat(80));

    let totalSavedFromOrders = 0;
    let ordersWithMembershipDiscount = 0;
    let ordersWithoutMembershipDiscount = 0;

    orders.forEach((order, index) => {
      const orderDate = new Date(order.createdAt).toLocaleDateString();
      const membershipDiscount = order.membershipDiscount || 0;
      const membershipTier = order.membershipTier || 'N/A';
      const status = membershipDiscount > 0 ? '✅' : '❌';

      console.log(`${index + 1}. ${status} ${orderDate} | Total: $${order.total.toFixed(2)} | Saved: $${membershipDiscount.toFixed(2)} | Tier: ${membershipTier}`);

      if (membershipDiscount > 0) {
        totalSavedFromOrders += membershipDiscount;
        ordersWithMembershipDiscount++;
      } else {
        ordersWithoutMembershipDiscount++;
      }
    });

    console.log('\n' + '─'.repeat(80));
    console.log('📈 Summary:');
    console.log('─'.repeat(80));
    console.log(`Orders with membership discount: ${ordersWithMembershipDiscount}`);
    console.log(`Orders without membership discount: ${ordersWithoutMembershipDiscount}`);
    console.log(`Total Saved (from orders): $${totalSavedFromOrders.toFixed(2)}`);

    // Check user's stored statistics
    const storedTotalSaved = user.membership?.statistics?.totalSaved || 0;
    console.log(`Total Saved (from user stats): $${storedTotalSaved.toFixed(2)}`);

    if (Math.abs(totalSavedFromOrders - storedTotalSaved) > 0.01) {
      console.log(`\n⚠️  MISMATCH DETECTED!`);
      console.log(`    Expected: $${totalSavedFromOrders.toFixed(2)}`);
      console.log(`    Stored:   $${storedTotalSaved.toFixed(2)}`);
      console.log(`    Difference: $${Math.abs(totalSavedFromOrders - storedTotalSaved).toFixed(2)}`);
      console.log(`\n💡 Solution: Visit the Dashboard to trigger a statistics refresh.`);
      console.log(`   Or call the API: GET /api/membership/statistics/${user._id}`);
    } else {
      console.log(`\n✅ Statistics are up to date!`);
    }

    console.log('\n' + '═'.repeat(80));

    // Additional insights
    if (ordersWithoutMembershipDiscount > 0) {
      console.log(`\n💡 Insight: ${ordersWithoutMembershipDiscount} orders don't have membership discount info.`);
      console.log(`   These orders were likely placed before you became a member,`);
      console.log(`   or before the membership discount feature was implemented.`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkMembershipStats();





