import mongoose from 'mongoose';
import { Wallet, Invoice } from '@shared/models';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/pet-shop";
const USER_ID = '04419c9c-0fb5-49cd-be17-0d4a99bb584b';

async function checkData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Check wallet
    const wallet = await Wallet.findOne({ userId: USER_ID });
    if (wallet) {
      console.log('=== WALLET DATA ===');
      console.log('Balance:', wallet.balance);
      console.log('Balance type:', typeof wallet.balance);
      console.log('Total Earned:', wallet.totalEarned);
      console.log('Total Spent:', wallet.totalSpent);
    } else {
      console.log('No wallet found for user');
    }

    console.log('\n=== RECENT INVOICES ===');
    const invoices = await Invoice.find({ userId: USER_ID }).sort({ createdAt: -1 }).limit(3);
    console.log('Found', invoices.length, 'invoices');
    for (const invoice of invoices) {
      console.log(`\nInvoice: ${invoice.invoiceNumber}`);
      console.log('Total:', invoice.total);
      console.log('Total type:', typeof invoice.total);
      console.log('Subtotal:', invoice.subtotal);
      console.log('Discount:', invoice.discount);
      console.log('Shipping Fee:', invoice.shippingFee);
      console.log('Payment Status:', invoice.paymentStatus);
      console.log('Created:', invoice.createdAt);
    }

    // Also check any invoices (not user-specific)
    console.log('\n=== ALL RECENT INVOICES ===');
    const allInvoices = await Invoice.find({}).sort({ createdAt: -1 }).limit(5);
    console.log('Found', allInvoices.length, 'total invoices');
    for (const invoice of allInvoices) {
      console.log(`\nInvoice: ${invoice.invoiceNumber}`);
      console.log('User ID:', invoice.userId);
      console.log('Total:', invoice.total);
      console.log('Payment Method:', invoice.paymentMethod);
      console.log('Payment Status:', invoice.paymentStatus);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkData();

