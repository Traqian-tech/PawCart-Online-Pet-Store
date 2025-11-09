/**
 * Fix Product Images Script
 * Replaces broken image URLs with placeholder images
 */

import { Product } from '@shared/models';
import mongoose from 'mongoose';

// Placeholder image generator
function getPlaceholderImage(productName: string): string {
  // Use a reliable placeholder service with product-relevant imagery
  const encoded = encodeURIComponent(productName.substring(0, 30));
  
  // Using placeholder.com which is more reliable than Unsplash for placeholders
  // Alternative: Use picsum.photos which provides random images
  const randomSeed = Math.floor(Math.random() * 1000);
  return `https://picsum.photos/seed/${randomSeed}/400/400`;
}

async function fixProductImages() {
  try {
    console.log('🔧 Fixing product images...\n');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/petshop';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');
    
    // Get all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products\n`);
    
    let fixedCount = 0;
    
    // Update each product with a new placeholder image
    for (const product of products) {
      const oldImage = product.image;
      
      // Check if image is from Unsplash (which might be broken)
      if (oldImage && oldImage.includes('unsplash.com')) {
        // Generate a deterministic seed based on product ID for consistency
        const seed = product._id.toString().substring(0, 8);
        product.image = `https://picsum.photos/seed/${seed}/400/400`;
        
        await product.save();
        
        console.log(`✅ Fixed image for: ${product.name}`);
        console.log(`   Old: ${oldImage}`);
        console.log(`   New: ${product.image}\n`);
        
        fixedCount++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Image Fix Complete!');
    console.log('='.repeat(60));
    console.log(`✅ Fixed: ${fixedCount} products`);
    console.log(`⏭️  Skipped: ${products.length - fixedCount} products (no Unsplash images)`);
    console.log(`📊 Total: ${products.length} products`);
    console.log('='.repeat(60) + '\n');
    
    // Disconnect
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run fix
fixProductImages();

