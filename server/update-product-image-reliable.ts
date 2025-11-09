/**
 * Update Product Image with Reliable Source
 * Uses multiple reliable image services
 */

import { Product } from '@shared/models';
import mongoose from 'mongoose';

async function updateProductImage() {
  try {
    console.log('🔧 Updating product image with reliable source...\n');
    
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
    
    // Option 1: Use placehold.co (very reliable)
    const newImage = 'https://placehold.co/400x400/orange/white?text=Cat+Treats';
    
    // Option 2: Use dummyimage.com (backup)
    // const newImage = 'https://dummyimage.com/400x400/ff9800/ffffff&text=Cat+Treats';
    
    // Option 3: Use a simple SVG Data URI (always works, no external dependency)
    // const newImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23FFA500" width="400" height="400"/%3E%3Ctext fill="%23FFFFFF" font-size="24" font-family="Arial" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ECat Freeze-Dried Treats%3C/text%3E%3C/svg%3E';
    
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




