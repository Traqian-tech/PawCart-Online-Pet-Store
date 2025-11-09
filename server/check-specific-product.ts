/**
 * Check Specific Product Script
 * Checks the details of a specific product
 */

import { Product } from '@shared/models';
import mongoose from 'mongoose';

async function checkSpecificProduct() {
  try {
    console.log('🔍 Checking specific product...\n');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/petshop';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');
    
    // Search for the product
    const searchName = 'Freeze-Dried Treats Chicken';
    const product = await Product.findOne({ 
      name: { $regex: searchName, $options: 'i' } 
    });
    
    if (product) {
      console.log('📦 Product found:');
      console.log('='.repeat(60));
      console.log(`ID: ${product._id}`);
      console.log(`Name: ${product.name}`);
      console.log(`Slug: ${product.slug}`);
      console.log(`Description: ${product.description}`);
      console.log(`Price: ${product.price}`);
      console.log(`Image: ${product.image}`);
      console.log(`Images: ${JSON.stringify(product.images)}`);
      console.log(`Stock Status: ${product.stockStatus}`);
      console.log(`Stock Quantity: ${product.stockQuantity}`);
      console.log('='.repeat(60));
    } else {
      console.log(`❌ Product not found with name containing: "${searchName}"`);
      
      // Try to find similar products
      const similarProducts = await Product.find({
        $or: [
          { name: { $regex: 'Freeze', $options: 'i' } },
          { name: { $regex: 'Chicken', $options: 'i' } },
          { name: { $regex: 'Treats', $options: 'i' } }
        ]
      }).limit(5);
      
      if (similarProducts.length > 0) {
        console.log('\n📋 Similar products found:');
        similarProducts.forEach((p, i) => {
          console.log(`\n${i + 1}. ${p.name}`);
          console.log(`   Image: ${p.image}`);
        });
      }
    }
    
    // Disconnect
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run check
checkSpecificProduct();

