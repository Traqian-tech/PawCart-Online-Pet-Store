/**
 * Update Single Product Image
 * Updates the image for Cat Freeze-Dried Treats
 */

import { Product } from '@shared/models';
import mongoose from 'mongoose';

async function updateProductImage() {
  try {
    console.log('🔧 Updating product image...\n');
    
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
    
    // Use a reliable placeholder with a cat treat theme
    // Using placeholder.com with a custom color and text
    const newImage = 'https://via.placeholder.com/400x400/FFA500/FFFFFF?text=Cat+Freeze-Dried+Treats';
    
    product.image = newImage;
    await product.save();
    
    console.log(`✅ Updated image to: ${newImage}\n`);
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




