/**
 * Update Product Image to Real Pet Product Image
 * Uses actual product image from Petco
 */

import { Product } from '@shared/models';
import mongoose from 'mongoose';

async function updateProductImage() {
  try {
    console.log('🔧 Updating product image to real pet product image...\n');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/petshop';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');
    
    // Find the specific product
    const product = await Product.findOne({ 
      name: { $regex: 'Freeze-Dried Treats Chicken', $options: 'i' } 
    });
    
    if (!product) {
      console.log('❌ Product not found');
      process.exit(1);
    }
    
    console.log(`📦 Found product: ${product.name}`);
    console.log(`   Current image: ${product.image}\n`);
    
    // Use real Petco product image
    const newImage = 'https://assets.petco.com/petco/image/upload/f_auto,q_auto/3127701-center-1';
    
    product.image = newImage;
    await product.save();
    
    console.log(`✅ Updated image to: ${newImage}`);
    console.log(`   This is a real cat treat product image from Petco\n`);
    console.log('✅ Image updated successfully!\n');
    
    // Disconnect
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run update
updateProductImage();




