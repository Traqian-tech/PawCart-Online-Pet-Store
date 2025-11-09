import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Order, Invoice } from '../shared/models';

dotenv.config();

async function checkShebaOrder() {
  try {
    console.log('🔍 Checking Sheba Order...\n');

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/meowmeowpetshop';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Find the Sheba order
    const order = await Order.findOne({
      'items.name': { $regex: /Sheba.*12-Pack/i }
    }).sort({ createdAt: -1 });

    if (!order) {
      console.log('❌ No Sheba 12-Pack order found');
      process.exit(1);
    }

    console.log('═'.repeat(80));
    console.log('📦 ORDER DETAILS\n');
    console.log(`Order ID: ${order._id}`);
    console.log(`Created: ${new Date(order.createdAt).toLocaleString()}`);
    console.log(`Status: ${order.status}`);
    console.log(`User ID: ${order.userId}\n`);

    console.log('📦 Items:');
    order.items.forEach((item: any) => {
      console.log(`  - ${item.name} × ${item.quantity} @ HK$${item.price.toFixed(2)}`);
    });

    const subtotal = order.items.reduce((sum: any, item: any) => 
      sum + (item.price * item.quantity), 0
    );

    console.log('\n💰 ORDER Financial Breakdown:');
    console.log(`  Subtotal: HK$${subtotal.toFixed(2)}`);
    console.log(`  Coupon Discount: HK$${(order.discount || 0).toFixed(2)}`);
    console.log(`  Membership Discount: HK$${(order.membershipDiscount || 0).toFixed(2)}`);
    console.log(`  Membership Tier: ${order.membershipTier || 'N/A'}`);
    console.log(`  Shipping Fee: HK$${order.shippingFee || 0}`);
    console.log(`  Total: HK$${order.total.toFixed(2)}`);

    // Find invoice
    const invoice = await Invoice.findOne({ orderId: order._id.toString() });

    if (invoice) {
      console.log('\n═'.repeat(80));
      console.log('📄 INVOICE DETAILS\n');
      console.log(`Invoice Number: ${invoice.invoiceNumber}`);
      console.log(`Created: ${new Date(invoice.createdAt).toLocaleString()}\n`);

      console.log('📦 Invoice Items:');
      invoice.items.forEach((item: any) => {
        console.log(`  - ${item.name} × ${item.quantity} @ HK$${item.price.toFixed(2)}`);
      });

      const invoiceSubtotal = invoice.items.reduce((sum: any, item: any) => 
        sum + (item.price * item.quantity), 0
      );

      console.log('\n💰 INVOICE Financial Breakdown:');
      console.log(`  Subtotal: HK$${invoiceSubtotal.toFixed(2)}`);
      console.log(`  Coupon Discount: HK$${(invoice.discount || 0).toFixed(2)}`);
      console.log(`  Membership Discount: HK$${(invoice.membershipDiscount || 0).toFixed(2)}`);
      console.log(`  Membership Tier: ${invoice.membershipTier || 'N/A'}`);
      console.log(`  Shipping Fee: HK$${invoice.shippingFee || 0}`);
      console.log(`  Total: HK$${invoice.total.toFixed(2)}`);

      console.log('\n═'.repeat(80));
      console.log('🔍 COMPARISON\n');

      if (order.membershipDiscount && !invoice.membershipDiscount) {
        console.log('❌ PROBLEM FOUND:');
        console.log(`   Order has membership discount: HK$${order.membershipDiscount.toFixed(2)}`);
        console.log(`   Invoice is missing membership discount!`);
        console.log(`\n   This means the invoice was created WITHOUT the membership discount.`);
      } else if (!order.membershipDiscount && !invoice.membershipDiscount) {
        console.log('❌ PROBLEM FOUND:');
        console.log(`   BOTH Order and Invoice are missing membership discount!`);
        console.log(`   Expected discount: HK$${(subtotal * 0.15).toFixed(2)} (15%)`);
      } else {
        console.log('✅ Order and Invoice match!');
      }

      console.log('\n📋 Raw Data:');
      console.log('\nOrder:', JSON.stringify({
        _id: order._id,
        total: order.total,
        membershipDiscount: order.membershipDiscount,
        membershipTier: order.membershipTier,
        discount: order.discount
      }, null, 2));

      console.log('\nInvoice:', JSON.stringify({
        _id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total,
        membershipDiscount: invoice.membershipDiscount,
        membershipTier: invoice.membershipTier,
        discount: invoice.discount
      }, null, 2));

    } else {
      console.log('\n❌ No invoice found for this order!');
    }

    console.log('\n' + '═'.repeat(80));
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkShebaOrder();





