import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Order, Invoice } from '../shared/models';

dotenv.config();

async function fixMyOrders() {
  try {
    console.log('🔧 Fixing Orders with Missing Membership Discount\n');
    console.log('═'.repeat(80));

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/meowmeowpetshop';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // The known member user ID and guest UUID
    const memberUserId = '69065268b28ad299dffbfe64';
    const guestUUID = '04419c9c-0fb5-49cd-be17-0d4a99bb584b';

    // Get member info
    const user = await User.findById(memberUserId);
    if (!user) {
      console.log('❌ Member user not found');
      process.exit(1);
    }

    console.log(`👤 Member: ${user.username}`);
    console.log(`📧 Email: ${user.email}`);
    
    if (!user.membership) {
      console.log('❌ No membership found');
      process.exit(1);
    }

    console.log(`💎 Membership: ${user.membership.tier}`);
    console.log(`📅 Expiry: ${new Date(user.membership.expiryDate).toLocaleDateString()}`);
    
    const isActive = new Date() <= new Date(user.membership.expiryDate);
    if (!isActive) {
      console.log('❌ Membership expired');
      process.exit(1);
    }

    const discountRates: Record<string, number> = {
      'Silver Paw': 0.05,
      'Golden Paw': 0.10,
      'Diamond Paw': 0.15
    };

    const discountRate = discountRates[user.membership.tier] || 0;
    console.log(`💰 Discount Rate: ${(discountRate * 100)}%\n`);

    console.log('═'.repeat(80));
    console.log('🔍 Finding Orders to Fix...\n');

    // Find orders by:
    // 1. Guest UUID (orders placed while not logged in)
    // 2. Member user ID (orders placed while logged in)
    // 3. Customer email matching the member's email
    // All without proper membership discount
    const query = {
      $or: [
        { userId: guestUUID },
        { userId: memberUserId },
        { 'customerInfo.email': user.email }
      ],
      $and: [
        {
          $or: [
            { membershipDiscount: { $exists: false } },
            { membershipDiscount: 0 },
            { membershipDiscount: null }
          ]
        }
      ]
    };

    const ordersToFix = await Order.find(query).sort({ createdAt: -1 });

    console.log(`Found ${ordersToFix.length} orders to fix\n`);

    if (ordersToFix.length === 0) {
      console.log('✅ No orders need fixing!\n');
      process.exit(0);
    }

    let fixedCount = 0;
    let totalSavings = 0;

    for (let i = 0; i < ordersToFix.length; i++) {
      const order = ordersToFix[i];
      
      console.log('─'.repeat(80));
      console.log(`\n📦 Order ${i + 1}/${ordersToFix.length}`);
      console.log(`   ID: ${order._id}`);
      console.log(`   Date: ${new Date(order.createdAt).toLocaleString()}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   User ID: ${order.userId}`);
      
      // Show items
      console.log(`\n   📋 Items:`);
      order.items.forEach((item: any) => {
        console.log(`      - ${item.name} × ${item.quantity} @ HK$${item.price.toFixed(2)}`);
      });

      // Calculate values
      const subtotal = order.items.reduce((sum: any, item: any) => 
        sum + (item.price * item.quantity), 0
      );
      const couponDiscount = order.discount || 0;
      const afterCouponTotal = Math.max(0, subtotal - couponDiscount);
      const membershipDiscount = afterCouponTotal * discountRate;
      const shippingFee = order.shippingFee || 0;
      const newTotal = Math.max(0, subtotal - couponDiscount - membershipDiscount + shippingFee);

      console.log(`\n   💰 Financial Breakdown:`);
      console.log(`      Subtotal: HK$${subtotal.toFixed(2)}`);
      
      if (couponDiscount > 0) {
        console.log(`      Coupon Discount: -HK$${couponDiscount.toFixed(2)}`);
        console.log(`      After Coupon: HK$${afterCouponTotal.toFixed(2)}`);
      }
      
      console.log(`      Membership Discount: -HK$${membershipDiscount.toFixed(2)} (${user.membership.tier})`);
      
      if (shippingFee > 0) {
        console.log(`      Shipping Fee: +HK$${shippingFee.toFixed(2)}`);
      }
      
      console.log(`\n      ❌ OLD Total: HK$${order.total.toFixed(2)}`);
      console.log(`      ✅ NEW Total: HK$${newTotal.toFixed(2)}`);
      console.log(`      💎 You Save: HK$${membershipDiscount.toFixed(2)}`);

      // Update order
      order.membershipDiscount = membershipDiscount;
      order.membershipTier = user.membership.tier;
      order.total = newTotal;
      await order.save();
      
      console.log(`\n   ✅ Order updated`);

      // Update invoice
      const invoice = await Invoice.findOne({ orderId: order._id.toString() });
      if (invoice) {
        const oldInvoiceTotal = invoice.total;
        invoice.membershipDiscount = membershipDiscount;
        invoice.membershipTier = user.membership.tier;
        invoice.total = newTotal;
        await invoice.save();
        
        console.log(`   ✅ Invoice ${invoice.invoiceNumber} updated`);
        console.log(`      Invoice OLD: HK$${oldInvoiceTotal.toFixed(2)} → NEW: HK$${newTotal.toFixed(2)}`);
      } else {
        console.log(`   ⚠️  No invoice found for this order`);
      }

      fixedCount++;
      totalSavings += membershipDiscount;
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n🎉 SUCCESS! Fixed All Orders\n');
    console.log(`📊 Summary:`);
    console.log(`   Orders Fixed: ${fixedCount}`);
    console.log(`   Total Savings: HK$${totalSavings.toFixed(2)}`);
    console.log(`   Average Savings per Order: HK$${(totalSavings / fixedCount).toFixed(2)}\n`);
    
    console.log('✨ All orders and invoices now show correct membership discounts!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixMyOrders();





