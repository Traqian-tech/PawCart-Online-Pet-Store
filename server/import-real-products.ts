/**
 * Batch Import Real Pet Products
 * Imports real pet products from Amazon/Chewy-inspired data into MongoDB
 */

import { Product, Category, Brand } from '@shared/models';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ProductData {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  brandId: string;
  stockQuantity: number;
  subcategory?: string;
  isNew?: boolean;
  isBestseller?: boolean;
  isOnSale?: boolean;
  image: string;
}

/**
 * Generate unique slug for product
 */
async function generateUniqueSlug(name: string): Promise<string> {
  let baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  let slug = baseSlug;
  let counter = 1;
  
  // Check if slug exists
  while (await Product.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

/**
 * Find or create category
 */
async function findOrCreateCategory(categorySlug: string): Promise<any> {
  let category = await Category.findOne({ slug: categorySlug });
  
  if (!category) {
    // Create category with proper name
    const categoryNames: { [key: string]: string } = {
      'cat-food': 'Cat Food',
      'dog-food': 'Dog Food',
      'cat-toys': 'Cat Toys',
      'cat-litter': 'Cat Litter',
      'cat-care-health': 'Cat Care & Health',
      'cat-accessories': 'Cat Accessories',
      'clothing-beds-carrier': 'Clothing, Beds & Carrier',
      'dog-health-accessories': 'Dog Health & Accessories',
      'rabbit-food-accessories': 'Rabbit Food & Accessories',
      'bird-food-accessories': 'Bird Food & Accessories',
    };
    
    category = new Category({
      name: categoryNames[categorySlug] || categorySlug,
      slug: categorySlug,
    });
    await category.save();
    console.log(`✅ Created category: ${category.name}`);
  }
  
  return category;
}

/**
 * Find or create brand
 */
async function findOrCreateBrand(brandSlug: string): Promise<any> {
  let brand = await Brand.findOne({ slug: brandSlug });
  
  if (!brand) {
    // Create brand with proper name
    const brandNames: { [key: string]: string } = {
      'royal-canin': 'Royal Canin',
      'purina': 'Purina',
      'nekko': 'NEKKO',
      'sheba': 'Sheba',
      'one': 'ONE',
      'reflex': 'Reflex',
      'reflex-plus': 'Reflex Plus',
    };
    
    brand = new Brand({
      name: brandNames[brandSlug] || brandSlug.toUpperCase(),
      slug: brandSlug,
    });
    await brand.save();
    console.log(`✅ Created brand: ${brand.name}`);
  }
  
  return brand;
}

/**
 * Main import function
 */
async function importRealProducts() {
  try {
    console.log('🚀 Starting real product import...\n');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/petshop';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');
    
    // Read products data
    const dataPath = path.join(__dirname, 'real-products-data.json');
    const jsonData = fs.readFileSync(dataPath, 'utf-8');
    const { products } = JSON.parse(jsonData) as { products: ProductData[] };
    
    console.log(`📦 Found ${products.length} products to import\n`);
    
    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Import each product
    for (const productData of products) {
      try {
        // Check if product already exists
        const existingProduct = await Product.findOne({ name: productData.name });
        if (existingProduct) {
          console.log(`⏭️  Skipped (already exists): ${productData.name}`);
          skippedCount++;
          continue;
        }
        
        // Find or create category
        const category = await findOrCreateCategory(productData.categoryId);
        
        // Find or create brand
        const brand = await findOrCreateBrand(productData.brandId);
        
        // Generate unique slug
        const slug = await generateUniqueSlug(productData.name);
        
        // Prepare tags
        const tags: string[] = [];
        if (productData.subcategory && productData.subcategory !== 'none') {
          tags.push(productData.subcategory);
        }
        if (productData.isBestseller) {
          tags.push('bestseller');
        }
        if (productData.isNew) {
          tags.push('new-arrival');
        }
        
        // Create product
        const newProduct = new Product({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          originalPrice: productData.originalPrice,
          categoryId: category._id.toString(),
          brandId: brand._id.toString(),
          image: productData.image,
          stockQuantity: productData.stockQuantity,
          slug: slug,
          subcategory: productData.subcategory && productData.subcategory !== 'none' ? productData.subcategory : '',
          tags: tags,
          isNew: productData.isNew || false,
          isBestseller: productData.isBestseller || false,
          isOnSale: productData.isOnSale || false,
          isActive: true,
          rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
          reviews: Math.floor(Math.random() * 300) + 50, // Random reviews 50-350
        });
        
        await newProduct.save();
        
        console.log(`✅ Imported: ${productData.name}`);
        console.log(`   Category: ${category.name} | Brand: ${brand.name}`);
        console.log(`   Price: HK$${(productData.price / 100).toFixed(2)} | Stock: ${productData.stockQuantity}`);
        console.log('');
        
        importedCount++;
      } catch (error: any) {
        console.error(`❌ Error importing ${productData.name}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('🎉 Import Complete!');
    console.log('='.repeat(70));
    console.log(`✅ Imported: ${importedCount} products`);
    console.log(`⏭️  Skipped: ${skippedCount} products (already exist)`);
    console.log(`❌ Errors: ${errorCount} products`);
    console.log(`📊 Total processed: ${products.length} products`);
    console.log('='.repeat(70) + '\n');
    
    // Disconnect
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Fatal Error:', error);
    process.exit(1);
  }
}

// Run import
importRealProducts();

