/**
 * Update Product Image to Embedded SVG
 * Uses Data URI - 100% guaranteed to work, no external dependencies
 */

import { Product } from '@shared/models';
import mongoose from 'mongoose';

async function updateProductImage() {
  try {
    console.log('🔧 Updating product image to embedded SVG (100% reliable)...\n');
    
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
    
    // Use embedded SVG as Data URI - this ALWAYS works, no network required
    const svgImage = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Cdefs%3E%3ClinearGradient id='grad1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23FF6B35;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23F7931E;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='400' fill='url(%23grad1)'/%3E%3Ccircle cx='200' cy='150' r='60' fill='%23FFF' opacity='0.9'/%3E%3Cpath d='M 180 140 Q 190 130 200 140 Q 210 130 220 140' stroke='%23333' stroke-width='3' fill='none'/%3E%3Ccircle cx='190' cy='145' r='5' fill='%23333'/%3E%3Ccircle cx='210' cy='145' r='5' fill='%23333'/%3E%3Cpath d='M 190 155 Q 200 160 210 155' stroke='%23333' stroke-width='2' fill='none'/%3E%3Ctext x='200' y='250' font-family='Arial, sans-serif' font-size='28' font-weight='bold' fill='%23FFF' text-anchor='middle'%3ECat Treats%3C/text%3E%3Ctext x='200' y='280' font-family='Arial, sans-serif' font-size='18' fill='%23FFF' text-anchor='middle'%3EFreeze-Dried%3C/text%3E%3Ctext x='200' y='305' font-family='Arial, sans-serif' font-size='18' fill='%23FFF' text-anchor='middle'%3EChicken Flavor%3C/text%3E%3Ctext x='200' y='340' font-family='Arial, sans-serif' font-size='22' font-weight='bold' fill='%23FFF' text-anchor='middle'%3E50g%3C/text%3E%3C/svg%3E`;
    
    product.image = svgImage;
    await product.save();
    
    console.log(`✅ Updated image to embedded SVG`);
    console.log(`   Image type: Data URI (no external dependencies)`);
    console.log(`   This will ALWAYS work - guaranteed!\n`);
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




