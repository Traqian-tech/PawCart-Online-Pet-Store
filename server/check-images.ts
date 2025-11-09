/**
 * Check Product Images Script
 * Checks all products in the database for missing or invalid images
 */

import { Product } from '@shared/models';
import mongoose from 'mongoose';

async function checkProductImages() {
  try {
    console.log('🔍 Checking product images...\n');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/petshop';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');
    
    // Get all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products\n`);
    
    let missingImageCount = 0;
    let invalidImageCount = 0;
    let validImageCount = 0;
    
    // Check each product
    for (const product of products) {
      const hasImage = product.image && product.image.trim() !== '';
      const isValidImage = hasImage && (
        product.image.startsWith('http') || 
        product.image.startsWith('/') ||
        product.image.startsWith('data:')
      );
      
      if (!hasImage) {
        console.log(`❌ Missing image:`);
        console.log(`   ID: ${product._id}`);
        console.log(`   Name: ${product.name}`);
        console.log(`   Image: "${product.image}"`);
        console.log('');
        missingImageCount++;
      } else if (!isValidImage) {
        console.log(`⚠️  Invalid image URL:`);
        console.log(`   ID: ${product._id}`);
        console.log(`   Name: ${product.name}`);
        console.log(`   Image: "${product.image}"`);
        console.log('');
        invalidImageCount++;
      } else {
        validImageCount++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Image Check Summary');
    console.log('='.repeat(60));
    console.log(`✅ Valid images: ${validImageCount}`);
    console.log(`❌ Missing images: ${missingImageCount}`);
    console.log(`⚠️  Invalid image URLs: ${invalidImageCount}`);
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

// Run check
checkProductImages();

