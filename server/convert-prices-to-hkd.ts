import mongoose from 'mongoose';
import { Product } from '@shared/models';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Script to convert all product prices from BDT to HKD in the database
 * Conversion rate: 1 BDT = 0.069 HKD
 */

const BDT_TO_HKD_RATE = 0.069;

async function convertPricesToHKD() {
  try {
    console.log('\n🔄 Starting price conversion from BDT to HKD...\n');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/petshop';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Fetch all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products to convert\n`);

    let convertedCount = 0;
    let skippedCount = 0;

    for (const product of products) {
      const oldPrice = product.price;
      const oldOriginalPrice = product.originalPrice;

      // Convert price from BDT to HKD
      const newPrice = Math.round(oldPrice * BDT_TO_HKD_RATE * 100) / 100; // Round to 2 decimal places
      
      // Convert originalPrice if it exists
      let newOriginalPrice = oldOriginalPrice;
      if (oldOriginalPrice && oldOriginalPrice > 0) {
        newOriginalPrice = Math.round(oldOriginalPrice * BDT_TO_HKD_RATE * 100) / 100;
      }

      // Only update if prices are different (i.e., haven't been converted yet)
      // Prices in BDT are typically > 100, prices in HKD are typically < 50
      if (oldPrice > 50) {
        product.price = newPrice;
        
        if (oldOriginalPrice && oldOriginalPrice > 50) {
          product.originalPrice = newOriginalPrice;
        }

        await product.save();
        
        console.log(`✅ Converted: ${product.name}`);
        console.log(`   Price: ${oldPrice} BDT → ${newPrice} HKD`);
        if (oldOriginalPrice && oldOriginalPrice > 50) {
          console.log(`   Original Price: ${oldOriginalPrice} BDT → ${newOriginalPrice} HKD`);
        }
        console.log('');
        
        convertedCount++;
      } else {
        console.log(`⏭️  Skipped: ${product.name} (already in HKD: ${oldPrice})`);
        skippedCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Price Conversion Complete!');
    console.log('='.repeat(60));
    console.log(`✅ Converted: ${convertedCount} products`);
    console.log(`⏭️  Skipped: ${skippedCount} products (already in HKD)`);
    console.log(`📊 Total processed: ${products.length} products`);
    console.log(`💱 Conversion rate: 1 BDT = ${BDT_TO_HKD_RATE} HKD`);
    console.log('='.repeat(60) + '\n');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal Error:', error);
    process.exit(1);
  }
}

convertPricesToHKD();



