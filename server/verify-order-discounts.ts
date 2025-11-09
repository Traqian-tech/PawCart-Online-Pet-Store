/**
 * Verify Order Membership Discounts
 * 
 * This script checks if orders have membership discount information saved.
 * Run this to debug "Total Saved = $0.00" issue.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Order } from '../shared/models';

// Load environment variables
dotenv.config();

async function verifyOrderDiscounts() {
  try {
    console.log('🔍 Verifying Order Membership Discounts...\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/meowmeowpetshop';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Find all users with active memberships
    const users = await User.find({
      'membership.tier': { $exists: true },
      'membership.expiryDate': { $gte: new Date() }
    });

    console.log(`👥 Found ${users.length} users with active memberships\n`);
    console.log('='.repeat(80));

    for (const user of users) {
      console.log(`\n👤 User: ${user.username} (${user.membership?.tier})`);
      console.log(`   Membership expires: ${user.membership?.expiryDate?.toISOString().split('T')[0]}`);

      // Find all orders for this user
      const userIdStr = user._id.toString();
      const orders = await Order.find({
        userId: { $in: [userIdStr, user.id, user.username, user.email] },
        status: { $nin: ['Cancelled', 'Refunded'] }
      }).sort({ createdAt: -1 });

      console.log(`   📦 Total orders: ${orders.length}`);

      if (orders.length === 0) {
        console.log('   ⚠️  No orders found');
        continue;
      }

      let ordersWithDiscount = 0;
      let ordersWithoutDiscount = 0;
      let totalSavedFromOrders = 0;

      console.log('\n   Recent Orders:');
      console.log('   ' + '-'.repeat(76));

      for (const order of orders.slice(0, 5)) { // Show last 5 orders
        const orderDate = order.createdAt.toISOString().split('T')[0];
        const orderTotal = order.total;
        const discount = order.membershipDiscount || 0;
        const tier = order.membershipTier || 'N/A';

        if (discount > 0) {
          ordersWithDiscount++;
          totalSavedFromOrders += discount;
          console.log(`   ✅ ${orderDate} | Total: $${orderTotal.toFixed(2)} | Saved: $${discount.toFixed(2)} | Tier: ${tier}`);
        } else {
          ordersWithoutDiscount++;
          console.log(`   ❌ ${orderDate} | Total: $${orderTotal.toFixed(2)} | Saved: $0.00 | Tier: ${tier}`);
        }
      }

      console.log('   ' + '-'.repeat(76));
      console.log(`   📊 Summary:`);
      console.log(`      - Orders with discount info: ${ordersWithDiscount}`);
      console.log(`      - Orders without discount info: ${ordersWithoutDiscount}`);
      console.log(`      - Total saved (from order records): $${totalSavedFromOrders.toFixed(2)}`);
      
      // Compare with user statistics
      const userTotalSaved = user.membership?.statistics?.totalSaved || 0;
      console.log(`      - Total saved (from user stats): $${userTotalSaved.toFixed(2)}`);

      if (Math.abs(totalSavedFromOrders - userTotalSaved) > 0.01) {
        console.log(`      ⚠️  Mismatch detected! Consider refreshing statistics.`);
      } else {
        console.log(`      ✅ Statistics match order records.`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Verification complete!\n');

    // Recommendations
    console.log('📋 Recommendations:');
    console.log('   1. If you see "❌" orders with no discount, those were placed before the fix.');
    console.log('   2. New orders (after fix) should show "✅" with saved discount amount.');
    console.log('   3. Test by placing a new order with an active membership.');
    console.log('   4. Check Dashboard after placing order - Total Saved should update.');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the script
verifyOrderDiscounts();






