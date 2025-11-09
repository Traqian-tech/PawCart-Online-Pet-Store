import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Order, Invoice } from '../shared/models';

dotenv.config();

async function find137Order() {
  try {
    console.log('🔍 Finding Order with HK$137.53 subtotal...\n');

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/meowmeowpetshop';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Calculate what quantity would give us 137.53
    // If price is 5.87, then 137.53 / 5.87 = 23.43... doesn't match
    // Let me search for orders with this amount

    console.log('🔍 Method 1: Search by total amount around 137.53...\n');
    const ordersByTotal = await Order.find({
      $or: [
        { total: { $gte: 137, $lte: 138 } },
        { total: { $gte: 116, $lte: 117 } } // After 15% discount
      ]
    }).sort({ createdAt: -1 }).limit(5);

    console.log(`Found ${ordersByTotal.length} orders with total around 137.53 or 116.90:\n`);
    
    for (const order of ordersByTotal) {
      const subtotal = order.items.reduce((sum: any, item: any) => 
        sum + (item.price * item.quantity), 0
      );
      
      console.log('─'.repeat(80));
      console.log(`Order ID: ${order._id}`);
      console.log(`Created: ${new Date(order.createdAt).toLocaleString()}`);
      console.log(`Items: ${order.items.map((i: any) => `${i.name} × ${i.quantity}`).join(', ')}`);
      console.log(`Subtotal: HK$${subtotal.toFixed(2)}`);
      console.log(`Membership Discount: HK$${(order.membershipDiscount || 0).toFixed(2)}`);
      console.log(`Total: HK$${order.total.toFixed(2)}`);
      
      if (Math.abs(subtotal - 137.53) < 0.01) {
        console.log('✅ FOUND IT! This order has subtotal HK$137.53');
      }
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n🔍 Method 2: Search all recent Sheba orders...\n');

    const shebaOrders = await Order.find({
      'items.name': { $regex: /Sheba/i }
    }).sort({ createdAt: -1 }).limit(10);

    console.log(`Found ${shebaOrders.length} Sheba orders:\n`);

    for (const order of shebaOrders) {
      const subtotal = order.items.reduce((sum: any, item: any) => 
        sum + (item.price * item.quantity), 0
      );
      
      console.log('─'.repeat(80));
      console.log(`Order ID: ${order._id}`);
      console.log(`Created: ${new Date(order.createdAt).toLocaleString()}`);
      console.log(`Status: ${order.status}`);
      
      order.items.forEach((item: any) => {
        if (item.name.includes('Sheba')) {
          console.log(`  - ${item.name} × ${item.quantity} @ HK$${item.price.toFixed(2)} = HK$${(item.price * item.quantity).toFixed(2)}`);
        }
      });
      
      console.log(`Subtotal: HK$${subtotal.toFixed(2)}`);
      console.log(`Membership Discount: HK$${(order.membershipDiscount || 0).toFixed(2)}`);
      console.log(`Membership Tier: ${order.membershipTier || 'N/A'}`);
      console.log(`Total: HK$${order.total.toFixed(2)}`);

      if (Math.abs(subtotal - 137.53) < 0.01 || Math.abs(order.total - 116.90) < 0.01) {
        console.log('\n🎯 THIS IS THE ORDER YOU\'RE LOOKING FOR!');
        
        // Check invoice
        const invoice = await Invoice.findOne({ orderId: order._id.toString() });
        if (invoice) {
          console.log('\n📄 Invoice Details:');
          console.log(`   Invoice Number: ${invoice.invoiceNumber}`);
          console.log(`   Membership Discount: HK$${(invoice.membershipDiscount || 0).toFixed(2)}`);
          console.log(`   Total: HK$${invoice.total.toFixed(2)}`);
          
          if (order.membershipDiscount && !invoice.membershipDiscount) {
            console.log('\n   ❌ Order has discount but Invoice doesn\'t!');
          } else if (!order.membershipDiscount && !invoice.membershipDiscount) {
            console.log('\n   ❌ BOTH missing membership discount!');
          }
        }
      }
    }

    console.log('\n' + '═'.repeat(80));
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

find137Order();





