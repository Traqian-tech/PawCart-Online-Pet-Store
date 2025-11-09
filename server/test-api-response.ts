/**
 * Test API Response
 * Tests what the API actually returns for the product
 */

import { Product } from '@shared/models';
import mongoose from 'mongoose';

async function testAPIResponse() {
  try {
    console.log('🔍 Testing API response...\n');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/petshop';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');
    
    // Find the product by name
    const product = await Product.findOne({ 
      name: { $regex: 'Freeze-Dried Treats Chicken', $options: 'i' } 
    });
    
    if (!product) {
      console.log('❌ Product not found');
      process.exit(1);
    }
    
    console.log('📦 Database Product Data:');
    console.log('='.repeat(60));
    console.log(`Name: ${product.name}`);
    console.log(`Slug: ${product.slug}`);
    console.log(`Image: ${product.image}`);
    console.log(`Images Array: ${JSON.stringify(product.images)}`);
    console.log('='.repeat(60));
    
    // Also check if there are multiple products with similar names
    const allFreezeProducts = await Product.find({ 
      name: { $regex: 'Freeze.*Dried.*Treats', $options: 'i' } 
    });
    
    console.log(`\n📋 Found ${allFreezeProducts.length} Freeze-Dried products:\n`);
    allFreezeProducts.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   Slug: ${p.slug}`);
      console.log(`   Image: ${p.image}\n`);
    });
    
    // Disconnect
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run test
testAPIResponse();




