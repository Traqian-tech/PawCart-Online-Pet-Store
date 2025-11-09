import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Order } from '../shared/models';

dotenv.config();

async function checkSpecificOrder() {
  try {
    console.log('🔍 Checking Specific Order...\n');

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/meowmeowpetshop';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Order ID from the invoice
    const orderId = '690d203b8995a9ace501e7af';
    
    console.log(`📦 Looking for order: ${orderId}\n`);
    console.log('═'.repeat(80));

    const order = await Order.findById(orderId);

    if (!order) {
      console.log(`❌ Order not found: ${orderId}`);
      process.exit(1);
    }

    console.log('✅ Order Found!\n');
    console.log('Order Information:');
    console.log('─'.repeat(80));
    console.log(`Order ID: ${order._id}`);
    console.log(`User ID: ${order.userId}`);
    console.log(`Created: ${new Date(order.createdAt).toLocaleString()}`);
    console.log(`Status: ${order.status}`);
    console.log(`Payment Method: ${order.paymentMethod}`);
    console.log(`Payment Status: ${order.paymentStatus}`);

    console.log('\n💰 Financial Details:');
    console.log('─'.repeat(80));
    
    // Calculate subtotal from items
    const subtotal = order.items.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    );
    
    console.log(`Subtotal (calculated): $${subtotal.toFixed(2)}`);
    console.log(`Membership Discount: $${(order.membershipDiscount || 0).toFixed(2)}`);
    console.log(`Membership Tier: ${order.membershipTier || 'N/A'}`);
    console.log(`Shipping Fee: $${order.shippingFee || 0}`);
    console.log(`Total: $${order.total.toFixed(2)}`);

    console.log('\n🎁 Items:');
    console.log('─'.repeat(80));
    order.items.forEach((item: any, index: number) => {
      console.log(`${index + 1}. ${item.name}`);
      console.log(`   Quantity: ${item.quantity} × $${item.price.toFixed(2)} = $${(item.price * item.quantity).toFixed(2)}`);
    });

    console.log('\n🔍 Membership Discount Analysis:');
    console.log('═'.repeat(80));

    if (order.membershipDiscount && order.membershipDiscount > 0) {
      console.log(`✅ Order HAS membership discount saved: $${order.membershipDiscount.toFixed(2)}`);
      console.log(`✅ Membership tier saved: ${order.membershipTier}`);
      
      // Verify the discount calculation
      const discountRates: Record<string, number> = {
        'Silver Paw': 0.05,
        'Golden Paw': 0.10,
        'Diamond Paw': 0.15
      };
      
      const expectedRate = discountRates[order.membershipTier] || 0;
      const expectedDiscount = subtotal * expectedRate;
      
      console.log(`\n📊 Verification:`);
      console.log(`   Expected rate for ${order.membershipTier}: ${(expectedRate * 100).toFixed(0)}%`);
      console.log(`   Expected discount: $${expectedDiscount.toFixed(2)}`);
      console.log(`   Actual discount: $${order.membershipDiscount.toFixed(2)}`);
      
      if (Math.abs(expectedDiscount - order.membershipDiscount) < 0.01) {
        console.log(`   ✅ Discount calculation is CORRECT!`);
      } else {
        console.log(`   ⚠️  Discount calculation differs by $${Math.abs(expectedDiscount - order.membershipDiscount).toFixed(2)}`);
      }
    } else {
      console.log(`❌ Order DOES NOT have membership discount saved`);
      console.log(`   membershipDiscount: ${order.membershipDiscount}`);
      console.log(`   membershipTier: ${order.membershipTier}`);
      console.log(`\n⚠️  This means the order was likely created BEFORE the membership`);
      console.log(`    discount tracking feature was implemented.`);
    }

    // Find the user
    console.log('\n👤 User Information:');
    console.log('═'.repeat(80));
    
    let user = await User.findById(order.userId);
    if (!user) {
      user = await User.findOne({
        $or: [
          { id: order.userId },
          { username: order.userId },
          { email: order.userId }
        ]
      });
    }

    if (user) {
      console.log(`Name: ${user.firstName} ${user.lastName}`);
      console.log(`Email: ${user.email}`);
      console.log(`Username: ${user.username}`);
      
      if (user.membership) {
        console.log(`\nMembership: ${user.membership.tier}`);
        console.log(`Status: ${new Date() <= new Date(user.membership.expiryDate) ? '✅ Active' : '❌ Expired'}`);
        console.log(`Expires: ${new Date(user.membership.expiryDate).toLocaleDateString()}`);
        
        if (user.membership.statistics) {
          console.log(`\n📈 User's Current Statistics:`);
          console.log(`   Total Saved: $${(user.membership.statistics.totalSaved || 0).toFixed(2)}`);
          console.log(`   Exclusive Products: ${user.membership.statistics.exclusiveProductsPurchased || 0}`);
        }
      } else {
        console.log(`Membership: None`);
      }

      // Check all user's orders
      console.log(`\n📦 All Orders for This User:`);
      console.log('─'.repeat(80));
      
      const userIdStr = user._id.toString();
      const allOrders = await Order.find({
        userId: { $in: [userIdStr, user.id, user.username, user.email] },
        status: { $nin: ['Cancelled', 'Refunded'] }
      }).sort({ createdAt: -1 });

      console.log(`Total orders: ${allOrders.length}\n`);
      
      let totalSavedFromAllOrders = 0;
      allOrders.forEach((ord, index) => {
        const discount = ord.membershipDiscount || 0;
        const isCurrent = ord._id.toString() === orderId;
        const marker = isCurrent ? '👉' : '  ';
        const status = discount > 0 ? '✅' : '❌';
        
        console.log(`${marker} ${index + 1}. ${status} ${new Date(ord.createdAt).toLocaleDateString()} | $${ord.total.toFixed(2)} | Saved: $${discount.toFixed(2)}`);
        
        if (discount > 0) {
          totalSavedFromAllOrders += discount;
        }
      });

      console.log(`\n📊 Total Saved (from all orders): $${totalSavedFromAllOrders.toFixed(2)}`);
      
      const storedSaved = user.membership?.statistics?.totalSaved || 0;
      if (Math.abs(totalSavedFromAllOrders - storedSaved) > 0.01) {
        console.log(`⚠️  User's stored statistics ($${storedSaved.toFixed(2)}) don't match!`);
        console.log(`💡 Visit Dashboard to refresh statistics.`);
      } else {
        console.log(`✅ User's statistics are up to date!`);
      }
    } else {
      console.log(`❌ User not found: ${order.userId}`);
    }

    console.log('\n' + '═'.repeat(80));
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkSpecificOrder();





