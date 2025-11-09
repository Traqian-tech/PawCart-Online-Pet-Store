import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Order, Invoice, User } from '../shared/models';

dotenv.config();

async function fixLatestOrders() {
  try {
    console.log('🔧 Fixing Latest Orders with Missing Membership Discount...\n');

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/meowmeowpetshop';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Find the registered user by their email
    const guestUUID = '04419c9c-0fb5-49cd-be17-0d4a99bb584b';
    
    // Get user's membership info
    const user = await User.findById('69065268b28ad299dffbfe64');
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log(`👤 User: ${user.username}`);
    console.log(`📧 Email: ${user.email}`);
    
    if (!user.membership) {
      console.log('❌ User has no membership');
      process.exit(1);
    }

    console.log(`💎 Membership: ${user.membership.tier}`);
    console.log(`📅 Expiry: ${new Date(user.membership.expiryDate).toLocaleDateString()}`);

    // Check if membership is active
    if (new Date() > new Date(user.membership.expiryDate)) {
      console.log('❌ Membership has expired');
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
    console.log('🔍 Finding Orders with Missing Membership Discount...\n');

    // Find all orders by guest UUID that don't have membership discount
    const orders = await Order.find({
      userId: guestUUID,
      $or: [
        { membershipDiscount: { $exists: false } },
        { membershipDiscount: 0 },
        { membershipDiscount: null }
      ]
    }).sort({ createdAt: -1 });

    console.log(`Found ${orders.length} orders to fix\n`);

    let fixedCount = 0;

    for (const order of orders) {
      console.log('─'.repeat(80));
      console.log(`\n📦 Order ID: ${order._id}`);
      console.log(`Created: ${new Date(order.createdAt).toLocaleString()}`);
      
      // Calculate subtotal
      const subtotal = order.items.reduce((sum: any, item: any) => 
        sum + (item.price * item.quantity), 0
      );

      console.log(`Subtotal: HK$${subtotal.toFixed(2)}`);
      
      // Calculate membership discount (applied after coupon discount)
      const couponDiscount = order.discount || 0;
      const afterCouponTotal = Math.max(0, subtotal - couponDiscount);
      const membershipDiscount = afterCouponTotal * discountRate;
      
      // Calculate new total
      const newTotal = Math.max(0, subtotal - couponDiscount - membershipDiscount + (order.shippingFee || 0));

      console.log(`\n💵 Financial Changes:`);
      console.log(`  OLD Total: HK$${order.total.toFixed(2)}`);
      console.log(`  Membership Discount: -HK$${membershipDiscount.toFixed(2)} (${user.membership.tier} ${(discountRate * 100)}%)`);
      console.log(`  NEW Total: HK$${newTotal.toFixed(2)}`);
      console.log(`  You Save: HK$${membershipDiscount.toFixed(2)}`);

      // Update order
      order.membershipDiscount = membershipDiscount;
      order.membershipTier = user.membership.tier;
      order.total = newTotal;
      await order.save();

      console.log(`\n✅ Order updated`);

      // Update invoice
      const invoice = await Invoice.findOne({ orderId: order._id.toString() });
      
      if (invoice) {
        invoice.membershipDiscount = membershipDiscount;
        invoice.membershipTier = user.membership.tier;
        invoice.total = newTotal;
        await invoice.save();
        
        console.log(`✅ Invoice ${invoice.invoiceNumber} updated`);
      } else {
        console.log(`⚠️  No invoice found for this order`);
      }

      fixedCount++;
    }

    console.log('\n' + '═'.repeat(80));
    console.log(`\n🎉 Fixed ${fixedCount} orders and their invoices!`);
    
    if (fixedCount > 0) {
      const totalSaved = orders.reduce((sum, order) => {
        const subtotal = order.items.reduce((s: any, item: any) => s + (item.price * item.quantity), 0);
        const couponDiscount = order.discount || 0;
        const afterCouponTotal = Math.max(0, subtotal - couponDiscount);
        return sum + (afterCouponTotal * discountRate);
      }, 0);

      console.log(`💎 Total savings: HK$${totalSaved.toFixed(2)}`);
    }

    console.log('\n✨ All done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixLatestOrders();





