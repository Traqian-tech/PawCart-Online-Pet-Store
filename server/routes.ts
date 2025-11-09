import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { User, Product, Category, Brand, Announcement, Cart, Order, Invoice, BlogPost, Coupon, PaymentTransaction, PaymentWebhook, Request, Address, ChatMessage, ChatConversation, UserBehavior } from "@shared/models";
import { recommendationService } from "./recommendation-service";
import { generateUniqueProductSlug, findProductBySlug, migrateProductSlugs } from "./slug-utils";
import type { IUser, ICart, ICartItem, IOrder, IInvoice, IBlogPost, ICoupon, IRequest, IAddress } from "@shared/models";
import { z } from "zod";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";
import sharp from "sharp";
import { sendMembershipRenewedEmail } from "./email-service";
import { registerWalletRoutes, getOrCreateWallet, addWalletTransaction } from "./wallet-routes";
import { getSupabaseClient } from "./supabase-client";
// EmailJS handles email sending on the client side

// In-memory OTP storage (in production, use Redis or database)
interface OTPRecord {
  code: string;
  email: string;
  expiresAt: number;
  attempts: number;
}

const otpStore = new Map<string, OTPRecord>();

// Clean up expired OTPs every minute
setInterval(() => {
  const now = Date.now();
  Array.from(otpStore.entries()).forEach(([key, record]) => {
    if (record.expiresAt < now) {
      otpStore.delete(key);
    }
  });
}, 60000);

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure multer for file uploads
  const uploadDir = path.join(process.cwd(), 'uploads');

  // Ensure upload directory exists
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }

  // Use memory storage for Sharp processing
  const upload = multer({
    storage:multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
      // Check if file is an image
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'));
      }
    }
  });

  // Image upload endpoint with WebP conversion
  app.post('/api/upload/image', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Generate unique filename with .webp extension
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const webpFilename = `${req.file.fieldname}-${uniqueSuffix}.webp`;
      const outputPath = path.join(uploadDir, webpFilename);

      // Convert image to WebP format using Sharp with optimized compression
      await sharp(req.file.buffer)
        .resize(800, 600, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({
          quality: 75,    // Optimized quality for smaller size
          effort: 6,      // Maximum compression effort
          lossless: false // Use lossy compression for smaller files
        })
        .toFile(outputPath);

      // Get file size information
      const stats = await fs.stat(outputPath);

      const imageUrl = `/api/uploads/${webpFilename}`;
      res.json({
        message: 'Image uploaded and converted to WebP successfully',
        imageUrl: imageUrl,
        filename: webpFilename,
        originalFormat: req.file.mimetype,
        convertedFormat: 'image/webp',
        originalSize: req.file.size,
        compressedSize: stats.size,
        compressionRatio: `${Math.round((1 - stats.size / req.file.size) * 100)}%`
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Upload failed' });
    }
  });

  // Serve uploaded images with proper WebP headers
  app.get('/api/uploads/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(uploadDir, filename);

    // Set proper content type for WebP images
    if (filename.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }

    res.sendFile(filepath);
  });

  // Diagnostic endpoint to check avatar upload setup
  app.get('/api/upload/avatar/test', async (req, res) => {
    try {
      const testUserId = req.query.userId as string;
      
      const diagnostics = {
        uploadsDir: uploadDir,
        uploadsDirExists: await fs.access(uploadDir).then(() => true).catch(() => false),
        mongooseConnected: User.db.readyState === 1,
        mongooseState: User.db.readyState, // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
        testUserId: testUserId || 'not provided',
        userExists: false
      };
      
      if (testUserId) {
        try {
          const user = await User.findById(testUserId);
          diagnostics.userExists = !!user;
        } catch (error) {
          diagnostics.userExists = false;
        }
      }
      
      res.json(diagnostics);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Upload user avatar
  app.post('/api/upload/avatar', upload.single('avatar'), async (req, res) => {
    try {
      console.log('Avatar upload request received');
      console.log('File:', req.file ? 'Present' : 'Missing');
      console.log('Body:', req.body);
      console.log('Mongoose connection state:', User.db.readyState);

      if (!req.file) {
        console.error('No file in request');
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const userId = req.body.userId;
      const userEmail = req.body.userEmail;
      
      if (!userId && !userEmail) {
        console.error('No userId or userEmail in request body');
        return res.status(401).json({ message: 'User ID or email required' });
      }

      console.log('Processing avatar upload for:', { userId, userEmail });
      
      // Check if mongoose is connected
      if (User.db.readyState !== 1) {
        throw new Error('Database not connected. Connection state: ' + User.db.readyState);
      }

      // Generate unique filename for avatar
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const safeUserId = (userId || userEmail || 'user').replace(/[^a-zA-Z0-9]/g, '-').substring(0, 20);
      const webpFilename = `avatar-${safeUserId}-${uniqueSuffix}.webp`;
      const outputPath = path.join(uploadDir, webpFilename);

      console.log('Converting image to WebP...');

      // Convert and optimize avatar image
      await sharp(req.file.buffer)
        .resize(200, 200, {
          fit: 'cover',
          position: 'center'
        })
        .webp({
          quality: 80,
          effort: 6
        })
        .toFile(outputPath);

      console.log('Image converted successfully:', webpFilename);

      const avatarUrl = `/api/uploads/${webpFilename}`;

      // Update user's profilePicture in database
      console.log('Updating user profile picture in database...');
      
      // Try to find user by email first (for Supabase users), then by MongoDB _id
      let user;
      if (userEmail) {
        user = await User.findOneAndUpdate(
          { email: userEmail },
          { profilePicture: avatarUrl },
          { new: true }
        );
        console.log('User lookup by email:', userEmail, user ? 'Found' : 'Not found');
      }
      
      // If not found by email and userId looks like a MongoDB ObjectId, try that
      if (!user && userId && /^[0-9a-fA-F]{24}$/.test(userId)) {
        user = await User.findByIdAndUpdate(
          userId,
          { profilePicture: avatarUrl },
          { new: true }
        );
        console.log('User lookup by ObjectId:', userId, user ? 'Found' : 'Not found');
      }

      if (!user) {
        console.warn('User not found in MongoDB database, but avatar uploaded successfully');
        console.warn('This is normal for Supabase-authenticated users');
        
        // Return success with avatar URL even if user not in MongoDB
        // The avatar URL will still work and can be displayed
        res.json({
          message: 'Avatar uploaded successfully (user not in MongoDB)',
          avatarUrl: avatarUrl,
          warning: 'User profile not updated in database - using external authentication'
        });
        return;
      }

      console.log('Avatar updated successfully for user:', user.email);

      // Return user data without password
      const { password, ...userResponse } = user.toObject();

      res.json({
        message: 'Avatar uploaded successfully',
        avatarUrl: avatarUrl,
        user: userResponse
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // Send detailed error information to client
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';
      
      console.error('Full error details:', {
        message: errorMessage,
        stack: errorStack,
        type: error?.constructor?.name
      });
      
      res.status(500).json({ 
        message: 'Avatar upload failed',
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined
      });
    }
  });

  // Categories API
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Admin endpoint to seed missing categories
  app.post("/api/admin/seed-categories", async (req, res) => {
    try {
      const newCategories = [
        { name: 'Cat Food', slug: 'cat-food' },
        { name: 'Dog Food', slug: 'dog-food' },
        { name: 'Cat Toys', slug: 'cat-toys' },
        { name: 'Cat Litter', slug: 'cat-litter' },
        { name: 'Cat Care & Health', slug: 'cat-care' },
        { name: 'Clothing, Beds & Carrier', slug: 'clothing-beds-carrier' },
        { name: 'Cat Accessories', slug: 'cat-accessories' },
        { name: 'Dog Health & Accessories', slug: 'dog-accessories' },
        { name: 'Rabbit Food & Accessories', slug: 'rabbit' },
        { name: 'Bird Food & Accessories', slug: 'bird' }
      ];

      const createdCategories = [];
      for (const categoryData of newCategories) {
        const existingCategory = await Category.findOne({ slug: categoryData.slug });
        if (!existingCategory) {
          const newCategory = new Category(categoryData);
          await newCategory.save();
          createdCategories.push(newCategory);
        }
      }

      res.json({
        message: "Categories seeded successfully",
        created: createdCategories.length,
        categories: createdCategories
      });
    } catch (error) {
      console.error("Error seeding categories:", error);
      res.status(500).json({ message: "Failed to seed categories" });
    }
  });

  // Brands API
  app.get("/api/brands", async (req, res) => {
    try {
      const brands = await storage.getBrands();
      res.json(brands);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch brands" });
    }
  });

  // Delete Brand API
  app.delete("/api/brands/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`Attempting to delete brand with ID: ${id}`);

      const result = await Brand.findByIdAndDelete(id);
      if (result) {
        console.log(`Successfully deleted brand: ${result.name}`);
        res.json({ message: "Brand deleted successfully" });
      } else {
        res.status(404).json({ message: "Brand not found" });
      }
    } catch (error) {
      console.error("Error deleting brand:", error);
      res.status(500).json({ message: "Failed to delete brand" });
    }
  });

  // Products API - Now includes repack products so they appear in category pages
  app.get("/api/products", async (req, res) => {
    try {
      // Fetch all data in parallel to avoid N+1 queries
      const [dbProducts, allCategories, allBrands] = await Promise.all([
        Product.find({
          isActive: true
        }),
        Category.find({}),
        Brand.find({})
      ]);

      // Create lookup maps for fast O(1) access
      const categoryByIdMap = new Map();
      const categoryBySlugMap = new Map();
      const categoryByNameMap = new Map();

      for (const cat of allCategories) {
        if (cat._id) categoryByIdMap.set(cat._id.toString(), cat);
        if (cat.slug) categoryBySlugMap.set(cat.slug, cat);
        if (cat.name) categoryByNameMap.set(cat.name, cat);
      }

      const brandByIdMap = new Map();
      const brandBySlugMap = new Map();
      const brandByNameMap = new Map();

      for (const br of allBrands) {
        if (br._id) brandByIdMap.set(br._id.toString(), br);
        if (br.slug) brandBySlugMap.set(br.slug, br);
        if (br.name) brandByNameMap.set(br.name, br);
      }

      // Process products using in-memory lookups
      const products = [];

      for (const product of dbProducts) {
        try {
          // Fast category lookup using Maps
          let category = null;
          if (product.categoryId) {
            category = categoryByIdMap.get(product.categoryId.toString()) ||
                      categoryBySlugMap.get(product.categoryId) ||
                      categoryByNameMap.get(product.categoryId);
          }

          // Fast brand lookup using Maps
          let brand = null;
          if (product.brandId) {
            brand = brandByIdMap.get(product.brandId.toString()) ||
                   brandBySlugMap.get(product.brandId) ||
                   brandByNameMap.get(product.brandId);
          }

          products.push({
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            originalPrice: product.originalPrice || null,
            category: category?.slug || 'uncategorized',
            categoryName: category?.name || 'Uncategorized',
            subcategory: product.subcategory || '',
            brandId: product.brandId,
            brandName: brand?.name || 'No Brand',
            brandSlug: brand?.slug || 'no-brand',
            image: product.image,
            images: product.images || [],
            rating: product.rating || 0,
            reviews: product.reviews || 0,
            stock: product.stockQuantity || 0,
            stockStatus: product.stockStatus || 'In Stock',
            tags: product.tags || [],
            features: product.features || [],
            isNew: product.isNew || false,
            isBestseller: product.isBestseller || false,
            isOnSale: product.isOnSale || false,
            discount: product.discount || 0,
            description: product.description || '',
            specifications: product.specifications || {}
          });
        } catch (err: any) {
          // Skip products with invalid data or bulk products that might have slipped through
          console.warn('Skipping product with invalid data:', product.name || 'Unknown', err.message);
        }
      }

      console.log(`Successfully fetched ${products.length} products (including repack products)`);
      res.json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get all products for admin management (includes inactive products)
  app.get("/api/admin/products", async (req, res) => {
    try {
      // Fetch all data in parallel to avoid N+1 queries
      const [dbProducts, allCategories, allBrands] = await Promise.all([
        Product.find({
          tags: {
            $not: {
              $in: ['repack-food', 'repack', 'bulk-save', 'bulk']
            }
          }
          // Note: Don't filter by isActive for admin - they need to see all products
        }),
        Category.find({}),
        Brand.find({})
      ]);

      // Create lookup maps for fast O(1) access
      const categoryByIdMap = new Map();
      const categoryBySlugMap = new Map();
      const categoryByNameMap = new Map();

      for (const cat of allCategories) {
        if (cat._id) categoryByIdMap.set(cat._id.toString(), cat);
        if (cat.slug) categoryBySlugMap.set(cat.slug, cat);
        if (cat.name) categoryByNameMap.set(cat.name, cat);
      }

      const brandByIdMap = new Map();
      const brandBySlugMap = new Map();
      const brandByNameMap = new Map();

      for (const br of allBrands) {
        if (br._id) brandByIdMap.set(br._id.toString(), br);
        if (br.slug) brandBySlugMap.set(br.slug, br);
        if (br.name) brandByNameMap.set(br.name, br);
      }

      // Process products using in-memory lookups
      const products = [];

      for (const product of dbProducts) {
        try {
          // Fast category lookup using Maps
          let category = null;
          if (product.categoryId) {
            category = categoryByIdMap.get(product.categoryId.toString()) ||
                      categoryBySlugMap.get(product.categoryId) ||
                      categoryByNameMap.get(product.categoryId);
          }

          // Fast brand lookup using Maps
          let brand = null;
          if (product.brandId) {
            brand = brandByIdMap.get(product.brandId.toString()) ||
                   brandBySlugMap.get(product.brandId) ||
                   brandByNameMap.get(product.brandId);
          }

          products.push({
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            originalPrice: product.originalPrice || null,
            category: category?.slug || 'uncategorized',
            categoryId: product.categoryId,
            categoryName: category?.name || 'Uncategorized',
            brandId: product.brandId,
            brandName: brand?.name || 'No Brand',
            brandSlug: brand?.slug || 'no-brand',
            image: product.image,
            images: product.images || [],
            rating: product.rating || 0,
            reviews: product.reviews || 0,
            stock: product.stockQuantity || 0,
            stockQuantity: product.stockQuantity || 0,
            stockStatus: product.stockStatus || 'In Stock',
            tags: product.tags || [],
            features: product.features || [],
            isNew: product.isNew || false,
            isBestseller: product.isBestseller || false,
            isOnSale: product.isOnSale || false,
            discount: product.discount || 0,
            description: product.description || '',
            specifications: product.specifications || {},
            isActive: product.isActive !== false,
            subcategory: product.subcategory || ''
          });
        } catch (err: any) {
          console.warn('Skipping product with invalid data:', product.name || 'Unknown', err.message);
        }
      }

      console.log(`Successfully fetched ${products.length} products for admin (including inactive)`);
      res.json(products);
    } catch (error) {
      console.error('Error fetching admin products:', error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Resolve category and brand information
      let category = null;
      if (product.categoryId) {
        try {
          category = await Category.findById(product.categoryId);
        } catch (categoryError) {
          category = await Category.findOne({ slug: product.categoryId });
        }
        if (!category) {
          category = await Category.findOne({ name: product.categoryId });
        }
      }

      let brand = null;
      if (product.brandId) {
        try {
          brand = await Brand.findById(product.brandId);
        } catch (brandError) {
          brand = await Brand.findOne({ slug: product.brandId });
        }
        if (!brand) {
          brand = await Brand.findOne({ name: product.brandId });
        }
      }

      const enrichedProduct = {
        ...product.toObject(),
        categoryName: category?.name || 'Uncategorized',
        categorySlug: category?.slug || 'uncategorized',
        brandName: brand?.name || 'No Brand',
        brandSlug: brand?.slug || 'no-brand'
      };

      res.json(enrichedProduct);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = req.body;
      console.log('Received product data:', productData);

      // Parse tags if they exist (comma-separated string to array)
      const tags = productData.tags ? productData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0) : [];

      // Category mapping for proper slug creation
      const categoryMappings: { [key: string]: { name: string; slug: string } } = {
        'cat-food': { name: 'Cat Food', slug: 'cat-food' },
        'dog-food': { name: 'Dog Food', slug: 'dog-food' },
        'cat-toys': { name: 'Cat Toys', slug: 'cat-toys' },
        'cat-litter': { name: 'Cat Litter', slug: 'cat-litter' },
        'cat-care': { name: 'Cat Care & Health', slug: 'cat-care' },
        'clothing-beds-carrier': { name: 'Clothing, Beds & Carrier', slug: 'clothing-beds-carrier' },
        'cat-accessories': { name: 'Cat Accessories', slug: 'cat-accessories' },
        'dog-accessories': { name: 'Dog Health & Accessories', slug: 'dog-accessories' },
        'rabbit': { name: 'Rabbit Food & Accessories', slug: 'rabbit' },
        'bird': { name: 'Bird Food & Accessories', slug: 'bird' }
      };

      // Brand mapping for proper slug creation
      const brandMappings: { [key: string]: { name: string; slug: string } } = {
        'default-brand': { name: 'Default Brand', slug: 'default-brand' },
        'nekko': { name: 'Nekko', slug: 'nekko' },
        'purina': { name: 'Purina', slug: 'purina' },
        'purina-one': { name: 'Purina One', slug: 'one' },
        'one': { name: 'Purina One', slug: 'one' },
        'reflex': { name: 'Reflex', slug: 'reflex' },
        'reflex-plus': { name: 'Reflex Plus', slug: 'reflex-plus' },
        'royal-canin': { name: 'Royal Canin', slug: 'royal-canin' },
        'sheba': { name: 'Sheba', slug: 'sheba' }
      };

      // Find category and brand by their IDs/names/slugs
      let categoryRecord = null;

      // First try to find existing category
      if (productData.categoryId) {
        // Check if it's a valid ObjectId first
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(productData.categoryId);

        if (isValidObjectId) {
          categoryRecord = await Category.findById(productData.categoryId);
        } else {
          // Look up by slug or name
          categoryRecord = await Category.findOne({
            $or: [
              { slug: productData.categoryId },
              { name: productData.categoryId }
            ]
          });
        }
      }

      if (!categoryRecord) {
        // Create category if it doesn't exist using proper mapping
        const categoryMapping = categoryMappings[productData.categoryId];
        categoryRecord = new Category({
          name: categoryMapping ? categoryMapping.name : productData.categoryId,
          slug: categoryMapping ? categoryMapping.slug : productData.categoryId.toLowerCase().replace(/\s+/g, '-'),
        });
        await categoryRecord.save();
        console.log(`Created new category: ${categoryRecord.name} with slug: ${categoryRecord.slug}`);
      }

      let brandRecord = null;

      // First try to find existing brand
      if (productData.brandId) {
        // Check if it's a valid ObjectId first
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(productData.brandId);

        if (isValidObjectId) {
          brandRecord = await Brand.findById(productData.brandId);
        } else {
          // Look up by slug or name
          brandRecord = await Brand.findOne({
            $or: [
              { slug: productData.brandId },
              { name: productData.brandId }
            ]
          });
        }
      }

      if (!brandRecord) {
        // Create brand if it doesn't exist using proper mapping
        const brandMapping = brandMappings[productData.brandId];
        brandRecord = new Brand({
          name: brandMapping ? brandMapping.name : productData.brandId,
          slug: brandMapping ? brandMapping.slug : productData.brandId.toLowerCase().replace(/\s+/g, '-'),
        });
        await brandRecord.save();
        console.log(`Created new brand: ${brandRecord.name} with slug: ${brandRecord.slug}`);
      }

      // Generate unique slug for the product
      const productSlug = await generateUniqueProductSlug(productData.name);

      // Handle subcategory - convert 'none' to empty string and convert to slug format
      let subcategory = productData.subcategory === 'none' ? '' : (productData.subcategory || '');
      // Convert subcategory to slug format (e.g., "Adult Food" -> "adult-food")
      if (subcategory) {
        subcategory = subcategory.toLowerCase().trim().replace(/\s+/g, '-');
      }

      // Combine tags from request and subcategory
      let finalTags = [...tags];
      if (subcategory && !finalTags.includes(subcategory)) {
        finalTags.push(subcategory);
      }

      // Debug: Check if category and brand records exist
      console.log('Category record:', categoryRecord);
      console.log('Brand record:', brandRecord);
      
      if (!categoryRecord) {
        throw new Error('Category record is null or undefined');
      }
      
      if (!brandRecord) {
        throw new Error('Brand record is null or undefined');
      }

      // Create product directly in database with all fields
      const product = new Product({
        name: productData.name,
        description: productData.description,
        price: parseFloat(productData.price),
        originalPrice: productData.originalPrice ? parseFloat(productData.originalPrice) : undefined,
        categoryId: categoryRecord._id.toString(),
        categoryName: categoryRecord.name,
        brandId: brandRecord._id.toString(),
        brandName: brandRecord.name,
        image: productData.image,
        stockQuantity: productData.stockQuantity || 0,
        stock: productData.stockQuantity || 0,
        subcategory: subcategory,
        tags: finalTags,
        isNew: productData.isNew || false,
        isBestseller: productData.isBestseller || false,
        isOnSale: productData.isOnSale || false,
        isActive: productData.isActive !== false,
        slug: productSlug,
      });

      await product.save();

      console.log('Created product:', product);
      res.status(201).json(product);
    } catch (error) {
      console.error('Create product error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error details:', {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        productData: req.body
      });
      res.status(500).json({ 
        message: "Failed to create product", 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const productData = req.body;
      console.log('Updating product with data:', productData);

      // Parse tags if they exist (comma-separated string to array)
      const tags = productData.tags ? productData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0) : [];

      // Category mapping for proper slug creation
      const categoryMappings: { [key: string]: { name: string; slug: string } } = {
        'cat-food': { name: 'Cat Food', slug: 'cat-food' },
        'dog-food': { name: 'Dog Food', slug: 'dog-food' },
        'cat-toys': { name: 'Cat Toys', slug: 'cat-toys' },
        'cat-litter': { name: 'Cat Litter', slug: 'cat-litter' },
        'cat-care': { name: 'Cat Care & Health', slug: 'cat-care' },
        'cat-care-health': { name: 'Cat Care & Health', slug: 'cat-care' },
        'clothing-beds-carrier': { name: 'Clothing, Beds & Carrier', slug: 'clothing-beds-carrier' },
        'cat-accessories': { name: 'Cat Accessories', slug: 'cat-accessories' },
        'dog-accessories': { name: 'Dog Health & Accessories', slug: 'dog-accessories' },
        'dog-health-accessories': { name: 'Dog Health & Accessories', slug: 'dog-accessories' },
        'rabbit': { name: 'Rabbit Food & Accessories', slug: 'rabbit' },
        'rabbit-food-accessories': { name: 'Rabbit Food & Accessories', slug: 'rabbit' },
        'bird': { name: 'Bird Food & Accessories', slug: 'bird' },
        'bird-food-accessories': { name: 'Bird Food & Accessories', slug: 'bird' }
      };

      // Brand mapping for proper slug creation
      const brandMappings: { [key: string]: { name: string; slug: string } } = {
        'default-brand': { name: 'Default Brand', slug: 'default-brand' },
        'nekko': { name: 'Nekko', slug: 'nekko' },
        'purina': { name: 'Purina', slug: 'purina' },
        'purina-one': { name: 'Purina One', slug: 'one' },
        'one': { name: 'Purina One', slug: 'one' },
        'reflex': { name: 'Reflex', slug: 'reflex' },
        'reflex-plus': { name: 'Reflex Plus', slug: 'reflex-plus' },
        'royal-canin': { name: 'Royal Canin', slug: 'royal-canin' },
        'sheba': { name: 'Sheba', slug: 'sheba' }
      };

      // Find category and brand by their IDs/names/slugs
      let categoryRecord = null;

      // First try to find existing category
      if (productData.categoryId) {
        console.log('Looking up category with ID:', productData.categoryId);
        // Check if it's a valid ObjectId first
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(productData.categoryId);

        if (isValidObjectId) {
          categoryRecord = await Category.findById(productData.categoryId);
          console.log('Found category by ObjectId:', categoryRecord?.name);
        } else {
          // Look up by slug or name
          categoryRecord = await Category.findOne({
            $or: [
              { slug: productData.categoryId },
              { name: productData.categoryId }
            ]
          });
          console.log('Found category by slug/name:', categoryRecord?.name);
        }
      }

      if (!categoryRecord) {
        // Create category if it doesn't exist using proper mapping
        const categoryMapping = categoryMappings[productData.categoryId];
        categoryRecord = new Category({
          name: categoryMapping ? categoryMapping.name : productData.categoryId,
          slug: categoryMapping ? categoryMapping.slug : productData.categoryId.toLowerCase().replace(/\s+/g, '-'),
        });
        await categoryRecord.save();
        console.log(`Created new category: ${categoryRecord.name} with slug: ${categoryRecord.slug}`);
      }

      let brandRecord = null;

      // First try to find existing brand
      if (productData.brandId) {
        // Check if it's a valid ObjectId first
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(productData.brandId);

        if (isValidObjectId) {
          brandRecord = await Brand.findById(productData.brandId);
        } else {
          // Look up by slug or name
          brandRecord = await Brand.findOne({
            $or: [
              { slug: productData.brandId },
              { name: productData.brandId }
            ]
          });
        }
      }

      if (!brandRecord) {
        // Create brand if it doesn't exist using proper mapping
        const brandMapping = brandMappings[productData.brandId];
        brandRecord = new Brand({
          name: brandMapping ? brandMapping.name : productData.brandId,
          slug: brandMapping ? brandMapping.slug : productData.brandId.toLowerCase().replace(/\s+/g, '-'),
        });
        await brandRecord.save();
        console.log(`Created new brand: ${brandRecord.name} with slug: ${brandRecord.slug}`);
      }

      // Generate unique slug if name changed
      const currentProduct = await Product.findById(id);
      let productSlug = currentProduct?.slug;

      if (!productSlug || (currentProduct && currentProduct.name !== productData.name)) {
        productSlug = await generateUniqueProductSlug(productData.name, id);
      }

      // Handle subcategory - convert 'none' to empty string and convert to slug format
      let subcategory = productData.subcategory === 'none' ? '' : (productData.subcategory || '');
      // Convert subcategory to slug format (e.g., "Adult Food" -> "adult-food")
      if (subcategory) {
        subcategory = subcategory.toLowerCase().trim().replace(/\s+/g, '-');
      }

      // Build tags array - include subcategory if it exists
      const productTags = subcategory ? [subcategory] : [];

      // Update product directly in database with all fields
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        {
          name: productData.name,
          description: productData.description,
          price: parseFloat(productData.price),
          originalPrice: productData.originalPrice ? parseFloat(productData.originalPrice) : undefined,
          category: categoryRecord._id,
          categoryId: categoryRecord._id.toString(),
          categoryName: categoryRecord.name,
          brand: brandRecord._id,
          brandId: brandRecord._id.toString(),
          brandName: brandRecord.name,
          image: productData.image,
          stockQuantity: productData.stockQuantity || 0,
          stock: productData.stockQuantity || 0,
          subcategory: subcategory,
          tags: productTags,
          isNew: productData.isNew || false,
          isBestseller: productData.isBestseller || false,
          isOnSale: productData.isOnSale || false,
          isActive: productData.isActive !== false,
          slug: productSlug,
        },
        { new: true }
      );

      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }

      console.log('Updated product:', updatedProduct);
      res.json(updatedProduct);
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deletedProduct = await Product.findByIdAndDelete(id);
      if (!deletedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Migration endpoint to add slugs to existing products
  app.post("/api/admin/migrate-product-slugs", async (req, res) => {
    try {
      await migrateProductSlugs();
      res.json({ message: "Product slug migration completed successfully" });
    } catch (error) {
      console.error('Migration error:', error);
      res.status(500).json({ message: "Failed to migrate product slugs" });
    }
  });

  // Get product by slug endpoint
  app.get("/api/products/slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const product = await findProductBySlug(slug);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Resolve category and brand information
      let category = null;
      if (product.categoryId) {
        try {
          category = await Category.findById(product.categoryId);
        } catch (categoryError) {
          category = await Category.findOne({ slug: product.categoryId });
        }
        if (!category) {
          category = await Category.findOne({ name: product.categoryId });
        }
      }

      let brand = null;
      if (product.brandId) {
        try {
          brand = await Brand.findById(product.brandId);
        } catch (brandError) {
          brand = await Brand.findOne({ slug: product.brandId });
        }
        if (!brand) {
          brand = await Brand.findOne({ name: product.brandId });
        }
      }

      const enrichedProduct = {
        ...product.toObject(),
        categoryName: category?.name || 'Uncategorized',
        categorySlug: category?.slug || 'uncategorized',
        brandName: brand?.name || 'No Brand',
        brandSlug: brand?.slug || 'no-brand'
      };

      res.json(enrichedProduct);
    } catch (error) {
      console.error('Error fetching product by slug:', error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // ==================== Product Recommendation API ====================
  
  // Get personalized recommendations
  app.get("/api/recommendations/personalized", async (req, res) => {
    try {
      const userId = req.query.userId as string | undefined;
      const sessionId = req.query.sessionId as string | undefined;
      const limit = parseInt(req.query.limit as string) || 12;
      const excludeProductIds = req.query.exclude ? (req.query.exclude as string).split(',') : [];

      const recommendations = await recommendationService.getPersonalizedRecommendations({
        userId,
        sessionId,
        limit,
        excludeProductIds
      });

      // Format products for frontend
      const [allCategories, allBrands] = await Promise.all([
        Category.find({}),
        Brand.find({})
      ]);

      const categoryMap = new Map();
      const brandMap = new Map();
      allCategories.forEach(cat => {
        if (cat._id) categoryMap.set(cat._id.toString(), cat);
        if (cat.slug) categoryMap.set(cat.slug, cat);
      });
      allBrands.forEach(brand => {
        if (brand._id) brandMap.set(brand._id.toString(), brand);
        if (brand.slug) brandMap.set(brand.slug, brand);
      });

      const formattedProducts = recommendations.map((rec) => {
        const product = rec.product;
        const category = product.categoryId 
          ? (categoryMap.get(product.categoryId.toString()) || 
             categoryMap.get(product.categoryId) ||
             categoryMap.get(product.categoryId?.toString()))
          : null;
        const brand = product.brandId
          ? (brandMap.get(product.brandId.toString()) ||
             brandMap.get(product.brandId) ||
             brandMap.get(product.brandId?.toString()))
          : null;

        return {
          id: product._id?.toString() || product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          originalPrice: product.originalPrice || null,
          category: category?.slug || 'uncategorized',
          categoryName: category?.name || 'Uncategorized',
          subcategory: product.subcategory || '',
          brandId: product.brandId,
          brandName: brand?.name || 'No Brand',
          brandSlug: brand?.slug || 'no-brand',
          image: product.image,
          images: product.images || [],
          rating: product.rating || 0,
          reviews: product.reviews || 0,
          stock: product.stockQuantity || 0,
          stockStatus: product.stockStatus || 'In Stock',
          tags: product.tags || [],
          features: product.features || [],
          isNew: product.isNew || false,
          isBestseller: product.isBestseller || false,
          isOnSale: product.isOnSale || false,
          discount: product.discount || 0,
          description: product.description || '',
          specifications: product.specifications || {},
          recommendationScore: rec.score,
          recommendationReason: rec.reason
        };
      });

      res.json({ products: formattedProducts });
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      res.status(500).json({ message: "Failed to get recommendations" });
    }
  });

  // Get similar products
  app.get("/api/recommendations/similar/:productId", async (req, res) => {
    try {
      const { productId } = req.params;
      const limit = parseInt(req.query.limit as string) || 12;
      const excludeProductIds = req.query.exclude ? (req.query.exclude as string).split(',') : [];

      const recommendations = await recommendationService.getSimilarProducts({
        productId,
        limit,
        excludeProductIds
      });

      // Format products (same as above)
      const [allCategories, allBrands] = await Promise.all([
        Category.find({}),
        Brand.find({})
      ]);

      const categoryMap = new Map();
      const brandMap = new Map();
      allCategories.forEach(cat => {
        if (cat._id) categoryMap.set(cat._id.toString(), cat);
        if (cat.slug) categoryMap.set(cat.slug, cat);
      });
      allBrands.forEach(brand => {
        if (brand._id) brandMap.set(brand._id.toString(), brand);
        if (brand.slug) brandMap.set(brand.slug, brand);
      });

      const formattedProducts = recommendations.map((rec) => {
        const product = rec.product;
        const category = product.categoryId 
          ? (categoryMap.get(product.categoryId.toString()) || 
             categoryMap.get(product.categoryId))
          : null;
        const brand = product.brandId
          ? (brandMap.get(product.brandId.toString()) ||
             brandMap.get(product.brandId))
          : null;

        return {
          id: product._id?.toString() || product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          originalPrice: product.originalPrice || null,
          category: category?.slug || 'uncategorized',
          categoryName: category?.name || 'Uncategorized',
          subcategory: product.subcategory || '',
          brandId: product.brandId,
          brandName: brand?.name || 'No Brand',
          brandSlug: brand?.slug || 'no-brand',
          image: product.image,
          images: product.images || [],
          rating: product.rating || 0,
          reviews: product.reviews || 0,
          stock: product.stockQuantity || 0,
          stockStatus: product.stockStatus || 'In Stock',
          tags: product.tags || [],
          features: product.features || [],
          isNew: product.isNew || false,
          isBestseller: product.isBestseller || false,
          isOnSale: product.isOnSale || false,
          discount: product.discount || 0,
          description: product.description || '',
          specifications: product.specifications || {},
          recommendationScore: rec.score,
          recommendationReason: rec.reason
        };
      });

      res.json({ products: formattedProducts });
    } catch (error) {
      console.error('Error getting similar products:', error);
      res.status(500).json({ message: "Failed to get similar products" });
    }
  });

  // Get frequently bought together
  app.get("/api/recommendations/frequently-bought-together/:productId", async (req, res) => {
    try {
      const { productId } = req.params;
      const limit = parseInt(req.query.limit as string) || 6;
      const excludeProductIds = req.query.exclude ? (req.query.exclude as string).split(',') : [];

      const recommendations = await recommendationService.getFrequentlyBoughtTogether({
        productId,
        limit,
        excludeProductIds
      });

      // Format products (same as above)
      const [allCategories, allBrands] = await Promise.all([
        Category.find({}),
        Brand.find({})
      ]);

      const categoryMap = new Map();
      const brandMap = new Map();
      allCategories.forEach(cat => {
        if (cat._id) categoryMap.set(cat._id.toString(), cat);
        if (cat.slug) categoryMap.set(cat.slug, cat);
      });
      allBrands.forEach(brand => {
        if (brand._id) brandMap.set(brand._id.toString(), brand);
        if (brand.slug) brandMap.set(brand.slug, brand);
      });

      const formattedProducts = recommendations.map((rec) => {
        const product = rec.product;
        const category = product.categoryId 
          ? (categoryMap.get(product.categoryId.toString()) || 
             categoryMap.get(product.categoryId))
          : null;
        const brand = product.brandId
          ? (brandMap.get(product.brandId.toString()) ||
             brandMap.get(product.brandId))
          : null;

        return {
          id: product._id?.toString() || product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          originalPrice: product.originalPrice || null,
          category: category?.slug || 'uncategorized',
          categoryName: category?.name || 'Uncategorized',
          subcategory: product.subcategory || '',
          brandId: product.brandId,
          brandName: brand?.name || 'No Brand',
          brandSlug: brand?.slug || 'no-brand',
          image: product.image,
          images: product.images || [],
          rating: product.rating || 0,
          reviews: product.reviews || 0,
          stock: product.stockQuantity || 0,
          stockStatus: product.stockStatus || 'In Stock',
          tags: product.tags || [],
          features: product.features || [],
          isNew: product.isNew || false,
          isBestseller: product.isBestseller || false,
          isOnSale: product.isOnSale || false,
          discount: product.discount || 0,
          description: product.description || '',
          specifications: product.specifications || {},
          recommendationScore: rec.score,
          recommendationReason: rec.reason
        };
      });

      res.json({ products: formattedProducts });
    } catch (error) {
      console.error('Error getting frequently bought together:', error);
      res.status(500).json({ message: "Failed to get frequently bought together" });
    }
  });

  // Get trending products
  app.get("/api/recommendations/trending", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 12;

      const recommendations = await recommendationService.getTrendingProducts(limit);

      // Format products (same as above)
      const [allCategories, allBrands] = await Promise.all([
        Category.find({}),
        Brand.find({})
      ]);

      const categoryMap = new Map();
      const brandMap = new Map();
      allCategories.forEach(cat => {
        if (cat._id) categoryMap.set(cat._id.toString(), cat);
        if (cat.slug) categoryMap.set(cat.slug, cat);
      });
      allBrands.forEach(brand => {
        if (brand._id) brandMap.set(brand._id.toString(), brand);
        if (brand.slug) brandMap.set(brand.slug, brand);
      });

      const formattedProducts = recommendations.map((rec) => {
        const product = rec.product;
        const category = product.categoryId 
          ? (categoryMap.get(product.categoryId.toString()) || 
             categoryMap.get(product.categoryId))
          : null;
        const brand = product.brandId
          ? (brandMap.get(product.brandId.toString()) ||
             brandMap.get(product.brandId))
          : null;

        return {
          id: product._id?.toString() || product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          originalPrice: product.originalPrice || null,
          category: category?.slug || 'uncategorized',
          categoryName: category?.name || 'Uncategorized',
          subcategory: product.subcategory || '',
          brandId: product.brandId,
          brandName: brand?.name || 'No Brand',
          brandSlug: brand?.slug || 'no-brand',
          image: product.image,
          images: product.images || [],
          rating: product.rating || 0,
          reviews: product.reviews || 0,
          stock: product.stockQuantity || 0,
          stockStatus: product.stockStatus || 'In Stock',
          tags: product.tags || [],
          features: product.features || [],
          isNew: product.isNew || false,
          isBestseller: product.isBestseller || false,
          isOnSale: product.isOnSale || false,
          discount: product.discount || 0,
          description: product.description || '',
          specifications: product.specifications || {},
          recommendationScore: rec.score,
          recommendationReason: rec.reason
        };
      });

      res.json({ products: formattedProducts });
    } catch (error) {
      console.error('Error getting trending products:', error);
      res.status(500).json({ message: "Failed to get trending products" });
    }
  });

  // Track user behavior
  app.post("/api/recommendations/track", async (req, res) => {
    try {
      const { userId, sessionId, productId, behaviorType } = req.body;

      if (!sessionId || !productId || !behaviorType) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      await recommendationService.trackBehavior(
        userId,
        sessionId,
        productId,
        behaviorType,
        req.body.metadata
      );

      res.json({ success: true });
    } catch (error) {
      console.error('Error tracking behavior:', error);
      res.status(500).json({ message: "Failed to track behavior" });
    }
  });

  // ==================== End Product Recommendation API ====================

  // Initialize repack food products
  app.post("/api/init-repack-products", async (req, res) => {
    try {
      // Check if repack products already exist
      const existingRepackProducts = await Product.find({
        tags: { $in: ['repack-food'] }
      });

      if (existingRepackProducts.length > 0) {
        return res.json({ message: "Repack products already exist", count: existingRepackProducts.length });
      }

      // Find or create "Repack Food" category
      let repackCategory = await Category.findOne({ name: "Repack Food" });
      if (!repackCategory) {
        repackCategory = new Category({
          name: "Repack Food",
          slug: "repack-food",
        });
        await repackCategory.save();
      }

      // Find or create "Meow Meow" brand
      let meowMeowBrand = await Brand.findOne({ name: "Meow Meow" });
      if (!meowMeowBrand) {
        meowMeowBrand = new Brand({
          name: "Meow Meow",
          slug: "meow-meow",
        });
        await meowMeowBrand.save();
      }

      // Create the 3 repack food products
      const repackProducts = [
        {
          name: 'Bulk Cat Food Repack (20kg)',
          description: 'Premium quality, repackaged for savings',
          price: 6400,
          originalPrice: 8000,
          categoryId: repackCategory._id,
          brandId: meowMeowBrand._id,
          image: 'https://images.unsplash.com/photo-1615497001839-b0a0eac3274c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
          stockQuantity: 15,
          tags: ['repack-food', 'bulk-save', 'cat-food'],
          isNew: false,
          isBestseller: true,
          isOnSale: true,
          isActive: true,
          rating: 4.5,
        },
        {
          name: 'Bulk Dog Food Repack (25kg)',
          description: 'Economical choice for multiple dogs',
          price: 7200,
          originalPrice: 9600,
          categoryId: repackCategory._id,
          brandId: meowMeowBrand._id,
          image: 'https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
          stockQuantity: 12,
          tags: ['repack-food', 'combo-deal', 'dog-food'],
          isNew: false,
          isBestseller: true,
          isOnSale: true,
          isActive: true,
          rating: 4.5,
        },
        {
          name: 'Mixed Pet Treats (5kg)',
          description: 'Assorted treats for cats and dogs',
          price: 2800,
          originalPrice: 3500,
          categoryId: repackCategory._id,
          brandId: meowMeowBrand._id,
          image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300',
          stockQuantity: 25,
          tags: ['repack-food', 'bulk-save', 'treats'],
          isNew: false,
          isBestseller: false,
          isOnSale: true,
          isActive: true,
          rating: 4.5,
        }
      ];

      const createdProducts = await Product.insertMany(repackProducts);
      console.log('Created repack products:', createdProducts.length);

      res.status(201).json({
        message: "Repack products initialized successfully",
        count: createdProducts.length,
        products: createdProducts
      });
    } catch (error) {
      console.error('Init repack products error:', error);
      res.status(500).json({ message: "Failed to initialize repack products" });
    }
  });

  // Get repack food products specifically (for public display)
  app.get("/api/repack-products", async (req, res) => {
    try {
      // Set cache headers for better performance
      res.set('Cache-Control', 'public, max-age=300'); // 5 minutes cache

      const repackProducts = await Product.find({
        $or: [
          { tags: { $in: ['repack-food', 'repack'] } },
          { name: { $regex: /repack/i } },
          { description: { $regex: /repack/i } }
        ],
        isActive: true
      }).select('name price originalPrice image rating stockQuantity tags description isNew isBestseller isOnSale discount').lean();

      console.log(`Successfully fetched ${repackProducts.length} repack products`);
      res.json(repackProducts);
    } catch (error) {
      console.error('Get repack products error:', error);
      res.status(500).json({ message: "Failed to fetch repack products" });
    }
  });

  // Get repack food products for admin management (includes all fields and inactive products)
  app.get("/api/admin/repack-products", async (req, res) => {
    try {
      const repackProducts = await Product.find({
        $or: [
          { tags: { $in: ['repack-food', 'repack', 'bulk-save', 'bulk'] } },
          { name: { $regex: /repack/i } },
          { description: { $regex: /repack/i } }
        ]
        // Note: Don't filter by isActive for admin - they need to see all products
      });

      // Resolve category and brand information for admin display
      const productsWithDetails = [];
      for (const product of repackProducts) {
        try {
          let category = null;
          if (product.categoryId) {
            try {
              category = await Category.findById(product.categoryId);
            } catch (categoryError) {
              category = await Category.findOne({ slug: product.categoryId });
            }
            if (!category) {
              category = await Category.findOne({ name: product.categoryId });
            }
          }

          let brand = null;
          if (product.brandId) {
            try {
              brand = await Brand.findById(product.brandId);
            } catch (brandError) {
              brand = await Brand.findOne({ slug: product.brandId });
            }
            if (!brand) {
              brand = await Brand.findOne({ name: product.brandId });
            }
          }

          productsWithDetails.push({
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice || null,
            category: category?.slug || 'uncategorized',
            categoryName: category?.name || 'Uncategorized',
            brandId: product.brandId,
            brandName: brand?.name || 'No Brand',
            brandSlug: brand?.slug || 'no-brand',
            image: product.image,
            images: product.images || [],
            rating: product.rating || 0,
            reviews: product.reviews || 0,
            stock: product.stockQuantity || 0,
            stockStatus: product.stockStatus || 'In Stock',
            tags: product.tags || [],
            features: product.features || [],
            isNew: product.isNew || false,
            isBestseller: product.isBestseller || false,
            isOnSale: product.isOnSale || false,
            discount: product.discount || 0,
            description: product.description || '',
            specifications: product.specifications || {},
            isActive: product.isActive
          });
        } catch (err) {
          console.warn('Error processing repack product:', product.name || 'Unknown', err.message);
        }
      }

      console.log(`Successfully fetched ${productsWithDetails.length} repack products for admin`);
      res.json(productsWithDetails);
    } catch (error) {
      console.error('Get admin repack products error:', error);
      res.status(500).json({ message: "Failed to fetch repack products for admin" });
    }
  });

  // Middleware to check admin access
  const requireAdmin = async (req: any, res: any, next: any) => {
    const { userId } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = await User.findById(userId);

      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      req.adminUser = user;
      next();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };

  // Authentication Routes
  const registerSchema = z.object({
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Valid email is required").optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional()
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });

  // Register new user
  app.post("/api/auth/register", async (req, res) => {
    try {
      const result = registerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten().fieldErrors
        });
      }

      const { confirmPassword, ...userData } = result.data;

      // Check if user already exists
      const existingUser = userData.email ? await storage.getUserByEmail(userData.email) : null;
      if (existingUser) {
        return res.status(409).json({ message: "User already exists with this email" });
      }

      // Check if username is taken
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(409).json({ message: "Username is already taken" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Convert to plain object if it's a Mongoose document
      const userObj = user.toObject ? user.toObject() : user;
      
      // Get the MongoDB _id
      const userId = userObj._id?.toString() || user._id?.toString();
      
      // Remove password from response and add id field
      const { password, _id, ...userResponse } = userObj;

      res.status(201).json({
        message: "User created successfully",
        user: {
          ...userResponse,
          id: userId,
          _id: userId
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Login user
  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten().fieldErrors
        });
      }

      const { email, password } = result.data;

      console.log('🔐 Login attempt:', { email: email.trim(), passwordLength: password?.length });

      // Find user by email or username (for admin account)
      let user = await storage.getUserByEmail(email.trim());

      console.log('📧 User lookup by email:', user ? `Found: ${user.email}` : 'Not found');

      // If not found by email, try username (for admin login)
      if (!user) {
        user = await User.findOne({ username: email.trim() }) || undefined;
        console.log('👤 User lookup by username:', user ? `Found: ${user.username}` : 'Not found');
      }

      // If still not found, try case-insensitive email search
      if (!user) {
        const allUsers = await User.find({});
        user = allUsers.find(u => u.email?.toLowerCase() === email.toLowerCase().trim());
        console.log('🔍 Case-insensitive email search:', user ? `Found: ${user.email}` : 'Not found');
        if (user) {
          console.log('⚠️  Email case mismatch detected!');
          console.log('   Requested:', email.trim());
          console.log('   Found in DB:', user.email);
        }
      }

      if (!user) {
        console.error('❌ User not found for email:', email.trim());
        const sampleUsers = await User.find({}).limit(5).select('email username');
        console.log('📋 Sample users in database:', sampleUsers.map(u => ({ email: u.email, username: u.username })));
        return res.status(401).json({ message: "Invalid email or password" });
      }

      console.log('✅ User found:', { id: user._id, email: user.email, username: user.username });

      // Check password
      if (!user.password) {
        console.error('❌ No password stored for user:', user.email);
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Debug: Check password hash format
      const passwordHashPrefix = user.password.substring(0, 10);
      const passwordHashLength = user.password.length;
      console.log('🔐 Password hash info:', { 
        prefix: passwordHashPrefix, 
        length: passwordHashLength,
        isBcrypt: user.password.startsWith('$2')
      });

      // Debug: Check input password
      console.log('🔑 Input password info:', { 
        length: password?.length,
        firstChar: password?.[0] || 'empty',
        lastChar: password?.[password?.length - 1] || 'empty'
      });

      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log('🔑 Password validation:', isValidPassword ? '✅ Valid' : '❌ Invalid');
      
      if (!isValidPassword) {
        console.error('❌ Invalid password for user:', user.email);
        console.error('   Password hash exists:', !!user.password);
        console.error('   Password hash length:', user.password?.length);
        console.error('   Input password length:', password?.length);
        
        // Try to verify if the hash is valid bcrypt format
        try {
          const testCompare = await bcrypt.compare('test', user.password);
          console.log('   Bcrypt hash format test:', testCompare !== undefined ? 'Valid format' : 'Invalid format');
        } catch (err) {
          console.error('   Bcrypt hash format error:', err);
        }
        
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Convert to plain object if it's a Mongoose document
      const userObj = user.toObject ? user.toObject() : user;
      
      // Get the MongoDB _id
      const userId = userObj._id?.toString() || user._id?.toString();
      
      // Remove password from response and add id field
      const { password: _, _id, ...userResponse } = userObj;

      console.log('Login successful - User ID:', userId, 'Username:', userObj.username);

      res.json({
        message: "Login successful",
        user: {
          ...userResponse,
          id: userId,
          _id: userId
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user profile
  app.get("/api/auth/profile/:id", async (req, res) => {
    try {
      const { id } = req.params;
      console.log('[Profile API] Looking up user:', id);
      
      const user = await storage.getUser(id);

      if (!user) {
        console.log('[Profile API] User not found');
        return res.status(404).json({ message: "User not found" });
      }

      console.log('[Profile API] User found, preparing response');
      
      // Convert Mongoose document to plain object if needed
      const userObj = user.toObject ? user.toObject() : user;
      
      // Remove password from response
      const { password, ...userResponse } = userObj;
      
      console.log('[Profile API] Membership info:', userResponse.membership || 'None');
      res.json(userResponse);
    } catch (error) {
      console.error("[Profile API] Error:", error);
      res.status(500).json({ message: "Internal server error", error: String(error) });
    }
  });

  // Update user profile
  app.patch("/api/auth/profile/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      console.log('Profile update request:', { id, updateData });

      // Don't allow password updates through this endpoint
      delete updateData.password;
      delete updateData.id;

      // Check if this is a Supabase UUID (contains dashes) or MongoDB ObjectId
      const isSupabaseUser = id.includes('-');
      
      let user;
      
      if (isSupabaseUser) {
        // Supabase users are not stored in MongoDB, they're in Supabase
        // For Supabase users, we can try to find them by email and update, or just return the update data
        console.log('Supabase user profile update requested');
        
        // Try to find by email if provided in updateData
        if (updateData.email) {
          const existingUser = await User.findOne({ email: updateData.email });
          if (existingUser) {
            // Update the existing MongoDB record
            const updatedUser = await User.findByIdAndUpdate(
              existingUser._id,
              { ...updateData, updatedAt: new Date() },
              { new: true }
            );
            
            if (updatedUser) {
              const userObj = updatedUser.toObject();
              const { password, ...userResponse } = userObj;
              console.log('Updated MongoDB record for Supabase user by email');
              
              return res.json({
                message: "Profile updated successfully",
                user: {
                  ...userResponse,
                  id,  // Keep the Supabase UUID as id
                  _id: id
                }
              });
            }
          }
        }
        
        // If no MongoDB record found, return success with the updated data
        // The frontend will handle storing this in localStorage
        console.log('No MongoDB record found for Supabase user - returning update data');
        return res.json({
          message: "Profile updated successfully",
          user: {
            id,
            _id: id,
            ...updateData
          }
        });
      } else {
        // MongoDB user - update in database
        user = await storage.updateUser(id, updateData);
        if (!user) {
          console.log('User not found for profile update:', id);
          return res.status(404).json({ message: "User not found" });
        }

        // Convert to plain object if it's a Mongoose document
        const userObj = user.toObject ? user.toObject() : user;
        
        // Get the MongoDB _id
        const userId = userObj._id?.toString() || user._id?.toString();
        
        // Remove password from response and add id field
        const { password, _id, ...userResponse } = userObj;

        console.log('Profile updated successfully for MongoDB user:', userId);

        res.json({
          message: "Profile updated successfully",
          user: {
            ...userResponse,
            id: userId,
            _id: userId
          }
        });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ 
        message: "Internal server error",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Change password endpoint
  app.post("/api/auth/change-password", async (req, res) => {
    let userId: string | undefined;
    let userEmail: string | undefined;
    
    try {
      console.log('Change password endpoint called');
      userId = req.body.userId;
      userEmail = req.body.userEmail;
      const { currentPassword, newPassword } = req.body;

      if ((!userId && !userEmail) || !currentPassword || !newPassword) {
        return res.status(400).json({ 
          message: "User ID or email, current password, and new password are required" 
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ 
          message: "New password must be at least 6 characters long" 
        });
      }

      console.log('Attempting to find user with ID:', userId, 'Email:', userEmail);

      // Check if userId is a UUID (Supabase format) - detect this early to avoid ObjectId casting errors
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const isUUID = userId && uuidPattern.test(userId);
      
      if (isUUID) {
        console.log('User ID is UUID format (likely Supabase user), redirecting to Supabase authentication');
        return res.status(400).json({ 
          message: "Supabase users should change password through Supabase authentication. Please use the Supabase password reset feature." 
        });
      }

      // Try to find user in MongoDB
      // MongoDB ObjectId is 24 hex characters
      let user = null;
      
      // First, try findById (only for valid ObjectId format)
      if (userId) {
        // Check if userId is a valid ObjectId format (24 hex characters, no dashes)
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(userId);
        if (isObjectId) {
          try {
            user = await User.findById(userId);
            console.log('User found by _id:', user ? 'Yes' : 'No');
          } catch (e: any) {
            console.log('findById failed:', e.message);
            // Don't throw, continue with alternative lookup methods
          }
        } else {
          // If not ObjectId format, skip _id lookup completely
          console.log('userId is not ObjectId format, skipping _id lookup');
        }
      }
      
      // If still not found, try finding by custom id field, username, or email
      // IMPORTANT: Do NOT use _id in this query to avoid ObjectId casting errors
      if (!user && userId) {
        console.log('User not found by _id, trying alternative methods with userId');
        try {
          user = await User.findOne({
            $or: [
              { id: userId },  // Custom id field (if exists)
              { username: userId },
              { email: userId }
            ]
          });
          console.log('User found by alternative methods:', user ? 'Yes' : 'No');
        } catch (e: any) {
          console.log('findOne with alternative methods failed:', e.message);
        }
      }
      
      // If still not found and we have an email, try finding by email
      if (!user && userEmail) {
        console.log('User not found by ID, trying to find by email:', userEmail);
        try {
          user = await User.findOne({ email: userEmail });
          console.log('User found by email:', user ? 'Yes' : 'No');
        } catch (e: any) {
          console.log('findOne by email failed:', e.message);
        }
      }
      
      if (!user) {
        console.log('User not found in MongoDB');
        return res.status(404).json({ 
          message: "User not found. Please ensure you are logged in with a valid MongoDB account." 
        });
      }

      console.log('User found, verifying password');
      console.log('User details:', {
        id: user._id,
        username: user.username,
        email: user.email,
        hasPassword: !!user.password,
        passwordType: typeof user.password
      });

      // Check if user has a password field (MongoDB users should have this)
      if (!user.password) {
        console.log('User does not have a password field - likely a Supabase user');
        return res.status(400).json({ 
          message: "This account does not have a password set. Please use Supabase authentication to change your password." 
        });
      }

      // Verify current password
      console.log('Comparing current password...');
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        console.log('Current password is incorrect');
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      console.log('Current password verified, hashing new password...');
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password by directly modifying and saving the user object
      // This avoids ObjectId casting issues with UUID format IDs
      console.log('Updating user password...');
      
      try {
        // Directly update the user object and save it
        // This works regardless of whether _id is ObjectId or UUID string
        user.password = hashedPassword;
        user.updatedAt = new Date();
        
        const updatedUser = await user.save();

        if (!updatedUser) {
          console.error('Failed to update user - save returned null');
          return res.status(500).json({ 
            message: "Failed to update password. User not found." 
          });
        }

        console.log('Password updated successfully for user:', userId || userEmail);

        res.json({
          message: "Password updated successfully"
        });
      } catch (saveError: any) {
        console.error("Error updating user password:", saveError);
        console.error("Save error details:", {
          name: saveError?.name,
          message: saveError?.message,
          code: saveError?.code,
          keyPattern: saveError?.keyPattern,
          keyValue: saveError?.keyValue
        });
        
        // Handle specific Mongoose errors
        if (saveError?.name === 'ValidationError') {
          return res.status(400).json({ 
            message: "Validation error",
            error: saveError.message
          });
        }
        
        if (saveError?.code === 11000) {
          return res.status(409).json({ 
            message: "Duplicate key error. Please contact support.",
            error: saveError.message
          });
        }
        
        throw saveError; // Re-throw to be caught by outer catch
      }
    } catch (error) {
      console.error("Password change error:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      console.error("Error details:", {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        userId,
        userEmail
      });
      res.status(500).json({ 
        message: "Internal server error",
        error: error instanceof Error ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : String(error)) : undefined
      });
    }
  });

  // Send password change OTP endpoint
  app.post("/api/auth/send-password-change-otp", async (req, res) => {
    let email: string | undefined;
    try {
      email = req.body?.email;

      if (!email) {
        return res.status(400).json({ 
          message: "Email is required" 
        });
      }

      console.log('📧 Request to send password change OTP for email:', email);

      // Find user by email
      let user;
      try {
        user = await User.findOne({ email });
      } catch (dbError) {
        console.error('❌ Database error finding user:', dbError);
        return res.status(500).json({ 
          message: "Database error. Please try again later." 
        });
      }

      if (!user) {
        // Don't reveal if email exists for security
        console.log('⚠️ User not found for email:', email);
        return res.status(200).json({ 
          message: "If the email exists, a verification code has been sent." 
        });
      }

      // Check if user has a password (MongoDB users only)
      if (!user.password) {
        console.log('⚠️ User has no password (external auth):', email);
        return res.status(400).json({ 
          message: "This account uses external authentication. Please use the appropriate password reset method." 
        });
      }

      // Use Supabase to send OTP email
      console.log('🔍 Checking Supabase configuration before sending OTP...');
      const supabase = getSupabaseClient();
      if (!supabase) {
        const hasUrl = !!process.env.VITE_SUPABASE_URL;
        const hasKey = !!process.env.VITE_SUPABASE_ANON_KEY;
        console.error('❌ Supabase client not available.');
        console.error('   VITE_SUPABASE_URL exists:', hasUrl);
        console.error('   VITE_SUPABASE_ANON_KEY exists:', hasKey);
        console.error('   Please check your .env file contains both variables.');
        
        return res.status(500).json({ 
          message: "Email service not configured. Please contact support.",
          ...(process.env.NODE_ENV === 'development' && {
            debug: {
              hasSupabaseUrl: hasUrl,
              hasSupabaseKey: hasKey,
              hint: "Check your .env file for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
            }
          })
        });
      }

      try {
        // Use Supabase's signInWithOtp to send verification code
        // This will send an email with a verification code (same as login)
        console.log('📤 Attempting to send OTP via Supabase for:', email);
        const { data, error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: false, // Don't create user if doesn't exist
            // Customize email template if needed
            emailRedirectTo: undefined, // We don't need redirect for password change
          }
        });

        if (error) {
          console.error('❌ Supabase OTP send error:', {
            message: error.message,
            status: error.status,
            name: error.name,
            email: email
          });
          
          // Handle rate limiting
          if (error.message?.includes('rate limit') || error.message?.includes('too many')) {
            return res.status(429).json({ 
              message: "Too many requests. Please wait a few minutes before trying again." 
            });
          }

          // Handle user not found in Supabase
          if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
            console.warn('⚠️ User may not exist in Supabase:', email);
            // Still return success to not reveal if user exists
            return res.status(200).json({ 
              message: "If the email exists, a verification code has been sent." 
            });
          }

          return res.status(500).json({ 
            message: "Failed to send verification email. Please try again later.",
            ...(process.env.NODE_ENV === 'development' && {
              details: error.message,
              errorType: error.name,
              errorStatus: error.status
            })
          });
        }

        // Store email for verification (we'll use Supabase's OTP verification)
        // Set expiration to 10 minutes (Supabase default is 60 minutes, but we'll use 10 for security)
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
        otpStore.set(email, {
          code: 'SUPABASE_OTP', // Marker to indicate we're using Supabase OTP
          email: email,
          expiresAt: expiresAt,
          attempts: 0
        });

        console.log('✅ Password change OTP sent via Supabase to:', email);

        res.json({
          message: "Verification code sent to your email"
        });
      } catch (supabaseError) {
        console.error('❌ Error sending Supabase OTP:', {
          error: supabaseError,
          message: supabaseError instanceof Error ? supabaseError.message : String(supabaseError),
          stack: supabaseError instanceof Error ? supabaseError.stack : undefined,
          email: email
        });
        return res.status(500).json({ 
          message: "Failed to send verification email. Please try again later.",
          ...(process.env.NODE_ENV === 'development' && {
            details: supabaseError instanceof Error ? supabaseError.message : String(supabaseError),
            stack: supabaseError instanceof Error ? supabaseError.stack : undefined
          })
        });
      }
    } catch (error) {
      console.error("❌ Send password change OTP error:", {
        error: error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        email: email
      });
      res.status(500).json({ 
        message: "Internal server error",
        ...(process.env.NODE_ENV === 'development' && {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : String(error),
          hint: "Check server console logs for more details"
        })
      });
    }
  });

  // Verify OTP and change password endpoint
  app.post("/api/auth/verify-password-change-otp", async (req, res) => {
    try {
      const { email, otpCode, newPassword } = req.body;

      console.log('🔍 Verify password change OTP request:', {
        email: email,
        otpCodeLength: otpCode?.length,
        newPasswordLength: newPassword?.length,
        timestamp: new Date().toISOString()
      });

      if (!email || !otpCode || !newPassword) {
        console.error('❌ Missing required fields:', { email: !!email, otpCode: !!otpCode, newPassword: !!newPassword });
        return res.status(400).json({ 
          message: "Email, verification code, and new password are required" 
        });
      }

      if (newPassword.length < 6) {
        console.error('❌ Password too short:', newPassword.length);
        return res.status(400).json({ 
          message: "New password must be at least 6 characters long" 
        });
      }

      // Verify OTP using Supabase
      const otpRecord = otpStore.get(email);
      if (!otpRecord) {
        console.error('❌ OTP record not found for email:', email);
        return res.status(400).json({ 
          message: "Invalid or expired verification code. Please request a new one." 
        });
      }

      console.log('📋 OTP record found:', {
        email: otpRecord.email,
        expiresAt: new Date(otpRecord.expiresAt).toISOString(),
        attempts: otpRecord.attempts,
        now: new Date().toISOString()
      });

      // Check expiration
      if (otpRecord.expiresAt < Date.now()) {
        console.error('❌ OTP expired:', {
          expiresAt: new Date(otpRecord.expiresAt).toISOString(),
          now: new Date().toISOString()
        });
        otpStore.delete(email);
        return res.status(400).json({ 
          message: "Verification code has expired. Please request a new one." 
        });
      }

      // Check attempts
      if (otpRecord.attempts >= 5) {
        console.error('❌ Too many attempts:', otpRecord.attempts);
        otpStore.delete(email);
        return res.status(400).json({ 
          message: "Too many failed attempts. Please request a new verification code." 
        });
      }

      // Verify code using Supabase
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.error('❌ Supabase client not available');
        return res.status(500).json({ 
          message: "Verification service not configured. Please contact support." 
        });
      }

      try {
        console.log('🔐 Attempting to verify OTP with Supabase:', {
          email: email,
          tokenLength: otpCode.length,
          tokenPrefix: otpCode.substring(0, 2) + '****'
        });

        // Verify OTP with Supabase
        const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
          email,
          token: otpCode,
          type: 'email'
        });

        if (verifyError || !verifyData) {
          otpRecord.attempts += 1;
          console.error('❌ Supabase OTP verification error:', {
            error: verifyError,
            message: verifyError?.message,
            status: verifyError?.status,
            name: verifyError?.name,
            attempts: otpRecord.attempts
          });
          
          // Handle specific error cases
          if (verifyError?.message?.includes('expired') || verifyError?.message?.includes('invalid')) {
            return res.status(400).json({ 
              message: "Invalid or expired verification code. Please try again.",
              ...(process.env.NODE_ENV === 'development' && {
                details: verifyError.message
              })
            });
          }

          return res.status(400).json({ 
            message: verifyError?.message || "Invalid verification code. Please try again.",
            ...(process.env.NODE_ENV === 'development' && {
              details: verifyError?.message,
              errorType: verifyError?.name
            })
          });
        }

        // OTP verified successfully by Supabase
        // Note: Supabase may create a session, but we'll ignore it and just update the password
        console.log('✅ OTP verified successfully via Supabase for:', email, {
          hasSession: !!verifyData.session,
          hasUser: !!verifyData.user
        });
      } catch (error) {
        console.error('❌ Error verifying Supabase OTP:', {
          error: error,
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        otpRecord.attempts += 1;
        return res.status(400).json({ 
          message: "Failed to verify code. Please try again.",
          ...(process.env.NODE_ENV === 'development' && {
            details: error instanceof Error ? error.message : String(error)
          })
        });
      }

      // Find user
      console.log('🔍 Looking for user in MongoDB:', email);
      const user = await User.findOne({ email });
      if (!user) {
        console.error('❌ User not found in MongoDB:', email);
        otpStore.delete(email);
        return res.status(404).json({ 
          message: "User not found" 
        });
      }

      console.log('✅ User found:', {
        userId: user._id,
        email: user.email,
        hasPassword: !!user.password
      });

      // Check if user has a password field
      if (!user.password) {
        console.warn('⚠️ User has no password field (external auth):', email);
        otpStore.delete(email);
        return res.status(400).json({ 
          message: "This account uses external authentication. Please use the appropriate password reset method." 
        });
      }

      // Hash new password
      console.log('🔐 Hashing new password...');
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      console.log('💾 Updating password in MongoDB...');
      user.password = hashedPassword;
      user.updatedAt = new Date();
      await user.save();

      console.log('✅ Password updated successfully for:', email);

      // Delete OTP after successful password change
      otpStore.delete(email);

      res.json({
        message: "Password changed successfully"
      });
    } catch (error) {
      console.error("❌ Verify password change OTP error:", {
        error: error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        email: req.body?.email
      });
      res.status(500).json({ 
        message: "Internal server error",
        ...(process.env.NODE_ENV === 'development' && {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        })
      });
    }
  });

  // Sync password from Supabase to MongoDB
  // This endpoint is called after a user successfully resets their password via Supabase
  app.post("/api/auth/sync-password-from-supabase", async (req, res) => {
    try {
      const { email, newPassword } = req.body;

      console.log('🔄 Syncing password from Supabase to MongoDB');
      console.log('Email:', email);
      console.log('Password length:', newPassword?.length);

      if (!email || !newPassword) {
        console.error('❌ Missing email or password');
        return res.status(400).json({ 
          message: "Email and new password are required" 
        });
      }

      if (newPassword.length < 6) {
        console.error('❌ Password too short');
        return res.status(400).json({ 
          message: "New password must be at least 6 characters long" 
        });
      }

      // Find user by email using the same method as login
      let user = await storage.getUserByEmail(email.trim());
      
      // If not found, try case-insensitive search
      if (!user) {
        user = await User.findOne({ email: email.toLowerCase().trim() });
      }
      
      // If still not found, try case-sensitive search
      if (!user) {
        user = await User.findOne({ email: email.trim() });
      }

      // If still not found, try finding by any case variation
      if (!user) {
        const allUsers = await User.find({});
        user = allUsers.find(u => u.email?.toLowerCase() === email.toLowerCase().trim());
      }

      if (!user) {
        console.error('❌ User not found in MongoDB for email:', email);
        console.log('Available emails in database:', (await User.find({})).map(u => u.email).slice(0, 10));
        return res.status(404).json({ 
          message: `User not found with email: ${email}` 
        });
      }

      console.log('✅ User found in MongoDB:', user.email);

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password in MongoDB
      user.password = hashedPassword;
      user.updatedAt = new Date();
      await user.save();

      console.log('✅ Password synced from Supabase to MongoDB for:', email);

      // Verify the password was saved correctly by comparing
      const verifyPassword = await bcrypt.compare(newPassword, user.password);
      if (!verifyPassword) {
        console.error('❌ Password verification failed after save!');
        return res.status(500).json({ 
          message: "Password was saved but verification failed. Please try again." 
        });
      }

      console.log('✅ Password verified successfully after save');

      res.json({
        message: "Password synced successfully"
      });
    } catch (error) {
      console.error("❌ Sync password error:", error);
      res.status(500).json({ 
        message: "Internal server error",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Membership Routes
  // Purchase membership
  app.post("/api/membership/purchase", async (req, res) => {
    try {
      const { userId, tier, userEmail, paymentDetails, paymentMethod, amount } = req.body;

      console.log('=== Membership Purchase Request ===');
      console.log('Request body:', { userId, tier, userEmail, paymentDetails, paymentMethod, amount });

      if ((!userId && !userEmail) || !tier) {
        console.log('ERROR: Missing userId/userEmail or tier');
        return res.status(400).json({ message: "User ID/Email and tier are required" });
      }

      // Validate tier
      const validTiers = ['Silver Paw', 'Golden Paw', 'Diamond Paw'];
      if (!validTiers.includes(tier)) {
        console.log('ERROR: Invalid tier:', tier);
        return res.status(400).json({ message: "Invalid membership tier" });
      }

      // Get tier price
      const tierPrices: Record<string, number> = {
        'Silver Paw': 29,
        'Golden Paw': 59,
        'Diamond Paw': 99
      };

      // Get user - Always use email to avoid ObjectId issues
      let user = null;
      
      if (userEmail) {
        console.log('Searching user by email:', userEmail);
        user = await User.findOne({ email: userEmail });
        console.log('User found by email?', !!user);
      }
      
      if (!user && userId) {
        console.log('Searching user by ID or username:', userId);
        // Try to find by username if it's not an ObjectId format
        try {
          user = await User.findOne({ 
            $or: [
              { _id: userId },
              { username: userId },
              { id: userId }
            ]
          });
        } catch (e) {
          // If _id cast fails, try username only
          user = await User.findOne({ 
            $or: [
              { username: userId },
              { id: userId }
            ]
          });
        }
        console.log('User found by ID/username?', !!user);
      }
      
      if (!user) {
        console.log('ERROR: User not found');
        return res.status(404).json({ message: "User not found" });
      }

      console.log('SUCCESS: User found -', user.email || user.username);

      // Handle wallet payment if specified
      const membershipPrice = tierPrices[tier];
      if (paymentMethod === 'my-wallet') {
        console.log('Processing wallet payment for membership');
        const { getOrCreateWallet, addWalletTransaction } = await import('./wallet-routes');
        const wallet = await getOrCreateWallet(userId || user.id || user._id.toString());

        if (wallet.balance < membershipPrice) {
          console.log('ERROR: Insufficient wallet balance');
          return res.status(400).json({ 
            message: "Insufficient wallet balance",
            required: membershipPrice,
            available: wallet.balance
          });
        }

        // Deduct from wallet
        await addWalletTransaction(
          wallet._id.toString(),
          userId || user.id || user._id.toString(),
          'SPEND',
          'MEMBERSHIP_PURCHASE',
          membershipPrice,
          wallet,
          `Purchase ${tier} membership`,
          { tier, duration: '30 days' }
        );
        console.log('Wallet payment successful');
      }

      // Update user with membership using storage
      const membershipData = {
        membership: {
          tier: tier as 'Silver Paw' | 'Golden Paw' | 'Diamond Paw',
          startDate: new Date(),
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          autoRenew: false
        }
      };

      console.log('Updating user with membership:', membershipData);

      // Update using MongoDB directly to ensure it works
      // Use email or username only to avoid ObjectId conversion issues
      let updateQuery: any;
      if (userEmail) {
        updateQuery = { email: userEmail };
      } else if (user.username) {
        updateQuery = { username: user.username };
      } else {
        // Last resort - try id field (not _id)
        updateQuery = { id: userId };
      }
      
      console.log('Update query:', updateQuery);
      
      const updatedUser = await User.findOneAndUpdate(
        updateQuery,
        { $set: membershipData },
        { new: true }
      );

      if (!updatedUser) {
        console.log('ERROR: Failed to update user');
        return res.status(500).json({ message: "Failed to update user membership" });
      }

      console.log('SUCCESS: Membership updated!');

      // Create membership order record
      const invoiceNumber = `MEM-INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Ensure we use the correct userId format - use the original userId from request, fallback to user document fields
      const orderUserId = userId || user.id || (user._id ? user._id.toString() : null) || user.username;
      console.log('Creating order with userId:', orderUserId);
      
      const orderPaymentMethod = paymentMethod || paymentDetails?.paymentMethod || 'Unknown';
      
      const membershipOrder = new Order({
        userId: orderUserId,
        status: 'Completed',
        total: membershipPrice,
        items: [{
          productId: `membership-${tier.toLowerCase().replace(/\s+/g, '-')}`,
          name: `${tier} Membership`,
          quantity: 1,
          price: membershipPrice,
          image: '/logo.png', // Use shop logo for membership
          type: 'membership',
          duration: '30 days'
        }],
        customerInfo: {
          name: user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.username,
          email: user.email,
          phone: user.phone || 'N/A', // Required field
        },
        invoiceNumber,
        paymentMethod: orderPaymentMethod,
        paymentStatus: 'Paid',
        shippingAddress: null // Membership doesn't need shipping
      });

      await membershipOrder.save();
      console.log('Membership order created:', membershipOrder._id);

      // Create invoice for membership
      const membershipInvoice = new Invoice({
        invoiceNumber,
        orderId: membershipOrder._id.toString(),
        userId: orderUserId,
        customerInfo: {
          name: user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.username,
          email: user.email,
          phone: user.phone || 'N/A', // Required field, use N/A if not available
        },
        items: [{
          productId: `membership-${tier.toLowerCase().replace(/\s+/g, '-')}`,
          name: `${tier} Membership`,
          quantity: 1,
          price: membershipPrice,
          image: '/logo.png', // Use shop logo for membership
          type: 'membership',
          duration: '30 days'
        }],
        subtotal: membershipPrice,
        total: membershipPrice,
        paymentMethod: orderPaymentMethod,
        paymentStatus: 'Paid'
      });

      await membershipInvoice.save();
      console.log('Membership invoice created:', invoiceNumber);

      // Update order with invoiceId
      membershipOrder.invoiceId = membershipInvoice._id.toString();
      await membershipOrder.save();
      console.log('Order updated with invoiceId:', membershipInvoice._id);

      // Send membership confirmation email (async, don't wait for it)
      sendMembershipRenewedEmail(updatedUser, new Date(expiryDate))
        .then((success) => {
          if (success) {
            console.log('✅ Membership confirmation email sent');
          } else {
            console.log('⚠️ Failed to send membership confirmation email');
          }
        })
        .catch((error) => {
          console.error('❌ Error sending membership email:', error);
        });

      // Remove password from response
      const { password, ...userResponse } = updatedUser.toObject();
      
      res.json({
        message: "Membership purchased successfully!",
        user: userResponse,
        order: membershipOrder,
        invoice: membershipInvoice
      });
    } catch (error: any) {
      console.error("=== ERROR in membership purchase ===");
      console.error("Error:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      
      // Ensure we return a proper error response
      return res.status(500).json({ 
        message: "Failed to purchase membership",
        error: error.message || "Unknown error occurred",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // Get membership details
  app.get("/api/membership/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.membership || new Date() > user.membership.expiryDate) {
        return res.json({ membership: null });
      }

      res.json({ membership: user.membership });
    } catch (error) {
      console.error("Get membership error:", error);
      res.status(500).json({ message: "Failed to fetch membership" });
    }
  });

  // Toggle auto-renew for membership
  app.post("/api/membership/toggle-autorenew", async (req, res) => {
    try {
      const { userId, autoRenew } = req.body;

      if (!userId || typeof autoRenew !== 'boolean') {
        return res.status(400).json({ message: "User ID and autoRenew status are required" });
      }

      // Try to find user by MongoDB _id, email, or username
      let user;
      try {
        user = await User.findById(userId);
      } catch (e) {
        // If findById fails, try alternative methods
        user = await User.findOne({
          $or: [
            { id: userId },
            { username: userId },
            { email: userId }
          ]
        });
      }

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!user.membership) {
        return res.status(400).json({ message: "User does not have an active membership" });
      }

      // Update autoRenew status
      user.membership.autoRenew = autoRenew;
      await user.save();

      console.log(`Auto-renew ${autoRenew ? 'enabled' : 'disabled'} for user ${user.email || user.username}`);

      const { password, ...userResponse } = user.toObject();
      
      res.json({
        message: `Auto-renew ${autoRenew ? 'enabled' : 'disabled'} successfully`,
        user: userResponse
      });
    } catch (error: any) {
      console.error("Toggle auto-renew error:", error);
      res.status(500).json({ message: "Failed to update auto-renew setting", error: error.message });
    }
  });

  // Cancel membership
  app.post("/api/membership/cancel", async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.membership = undefined;
      await user.save();

      const { password, ...userResponse } = user.toObject();
      
      res.json({
        message: "Membership cancelled successfully",
        user: userResponse
      });
    } catch (error) {
      console.error("Membership cancel error:", error);
      res.status(500).json({ message: "Failed to cancel membership" });
    }
  });

  // Get membership statistics
  app.get("/api/membership/statistics/:userId", async (req, res) => {
    try {
      const { userId } = req.params;

      // Find user by various methods
      let user = await User.findById(userId);
      if (!user) {
        user = await User.findOne({
          $or: [
            { id: userId },
            { username: userId },
            { email: userId }
          ]
        });
      }

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user has active membership
      if (!user.membership || new Date() > new Date(user.membership.expiryDate)) {
        return res.json({
          hasActiveMembership: false,
          statistics: null
        });
      }

      // Get membership discount rate based on tier
      const discountRates: Record<string, number> = {
        'Silver Paw': 0.05,
        'Golden Paw': 0.10,
        'Diamond Paw': 0.15
      };

      const discountRate = discountRates[user.membership.tier] || 0;

      // Find all orders from this user
      const userIdStr = user._id.toString();
      const orders = await Order.find({
        userId: { $in: [userIdStr, user.id, user.username, user.email] },
        status: { $nin: ['Cancelled', 'Refunded'] } // Exclude cancelled orders
      });

      // Calculate statistics
      let totalSaved = 0;
      let exclusiveProductsPurchased = 0;
      const recentPurchases: any[] = [];

      // Get all member-exclusive products for checking
      const exclusiveProducts = await Product.find({ isMemberExclusive: true });
      const exclusiveProductIds = new Set(exclusiveProducts.map(p => p._id.toString()));

      for (const order of orders) {
        // Use saved membershipDiscount if available (more accurate)
        // Otherwise calculate based on current discount rate (for legacy orders)
        let membershipSavings = 0;
        
        if (order.membershipDiscount !== undefined && order.membershipDiscount > 0) {
          // Use the actual discount that was applied at time of purchase
          membershipSavings = order.membershipDiscount;
        } else if (order.membershipTier) {
          // Calculate based on tier that was active at time of purchase
          const orderDiscountRate = discountRates[order.membershipTier] || 0;
          const orderSubtotal = order.items.reduce((sum: number, item: any) => 
            sum + (item.price * item.quantity), 0
          );
          membershipSavings = orderSubtotal * orderDiscountRate;
        }
        // If no membership info saved, don't count any savings (user wasn't a member)
        
        totalSaved += membershipSavings;

        // Count exclusive products in this order
        for (const item of order.items) {
          if (exclusiveProductIds.has(item.productId)) {
            exclusiveProductsPurchased += item.quantity;
            
            // Add to recent purchases (limit to 5 most recent)
            if (recentPurchases.length < 5) {
              recentPurchases.push({
                name: item.name,
                image: item.image,
                price: item.price,
                quantity: item.quantity,
                orderDate: order.createdAt
              });
            }
          }
        }
      }

      console.log(`📊 Membership Statistics for ${user.username}:`);
      console.log(`   - Orders analyzed: ${orders.length}`);
      console.log(`   - Total Saved: $${totalSaved.toFixed(2)}`);
      console.log(`   - Exclusive Products: ${exclusiveProductsPurchased}`);

      // Update user's membership statistics if they've changed
      if (!user.membership.statistics || 
          user.membership.statistics.totalSaved !== totalSaved ||
          user.membership.statistics.exclusiveProductsPurchased !== exclusiveProductsPurchased) {
        
        user.membership.statistics = {
          totalSaved,
          exclusiveProductsPurchased,
          lastRenewDate: user.membership.statistics?.lastRenewDate || user.membership.startDate
        };
        await user.save();
        console.log(`   ✅ Statistics updated in database`);
      }

      res.json({
        hasActiveMembership: true,
        statistics: {
          tier: user.membership.tier,
          discountRate: `${(discountRate * 100).toFixed(0)}%`,
          totalSaved: totalSaved.toFixed(2),
          exclusiveProductsPurchased,
          memberSince: user.membership.startDate,
          expiryDate: user.membership.expiryDate,
          recentExclusivePurchases: recentPurchases.sort((a, b) => 
            new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
          )
        }
      });
    } catch (error) {
      console.error("Get membership statistics error:", error);
      res.status(500).json({ message: "Failed to fetch membership statistics" });
    }
  });

  // Admin Routes
  app.post("/api/admin/stats", async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await User.findById(userId);

      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const allUsers = await User.find();

      res.json({
        totalUsers: allUsers.length,
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 4
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // GET all users (admin only)
  app.get("/api/admin/users", async (req, res) => {
    try {
      // In a real app, verify admin authentication via session/token
      // For now, fetch all users excluding passwords
      const allUsers = await User.find()
        .select('-password')
        .sort({ createdAt: -1 }); // Newest first
      
      res.json(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await User.findById(userId);

      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      const allUsers = await User.find().select('-password');
      res.json(allUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.delete("/api/admin/users/:userId", async (req, res) => {
    try {
      const { userId: targetUserId } = req.params;
      const { userId } = req.body;

      console.log('Delete user request:', { targetUserId, adminUserId: userId });

      if (!userId) {
        console.log('No userId in request body');
        return res.status(401).json({ message: "Unauthorized" });
      }

      const adminUser = await User.findById(userId);
      console.log('Admin user found:', adminUser?._id, 'Role:', adminUser?.role);

      if (!adminUser || adminUser.role !== "admin") {
        console.log('Admin user not found or not admin role');
        return res.status(403).json({ message: "Admin access required" });
      }

      // Prevent deleting admin account
      const userToDelete = await User.findById(targetUserId);
      console.log('User to delete:', userToDelete?._id, 'Role:', userToDelete?.role);
      
      if (!userToDelete) {
        console.log('User to delete not found');
        return res.status(404).json({ message: "User not found" });
      }
      
      if (userToDelete?.role === "admin") {
        console.log('Attempted to delete admin account');
        return res.status(403).json({ message: "Cannot delete admin account" });
      }

      await User.findByIdAndDelete(targetUserId);
      console.log('User deleted successfully:', targetUserId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: "Failed to delete user", error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Image placeholder API
  app.get("/api/placeholder/:width/:height", (req, res) => {
    const { width, height } = req.params;
    const imageUrl = `https://via.placeholder.com/${width}x${height}/26732d/ffffff?text=Pet+Shop`;
    res.redirect(imageUrl);
  });

  // Announcements API
  app.get("/api/announcements", async (req, res) => {
    try {
      const announcements = await Announcement.find({ isActive: true })
        .sort({ priority: -1, createdAt: -1 })
        .limit(1);
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  // Get all announcements for admin (including inactive)
  app.get("/api/admin/announcements", async (req, res) => {
    try {
      const announcements = await Announcement.find({})
        .sort({ priority: -1, createdAt: -1 });
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });


  app.post("/api/announcements", async (req, res) => {
    try {
      const { text, isActive } = req.body;

      if (!text) {
        return res.status(400).json({ message: "Announcement text is required" });
      }

      const announcement = new Announcement({
        text,
        isActive: isActive ?? true
      });

      await announcement.save();
      res.json(announcement);
    } catch (error) {
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  app.put("/api/announcements/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { text, isActive } = req.body;

      const announcement = await Announcement.findByIdAndUpdate(
        id,
        { text, isActive, updatedAt: new Date() },
        { new: true }
      );

      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }

      res.json(announcement);
    } catch (error) {
      res.status(500).json({ message: "Failed to update announcement" });
    }
  });

  app.delete("/api/announcements/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const announcement = await Announcement.findByIdAndDelete(id);

      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }

      res.json({ message: "Announcement deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete announcement" });
    }
  });

  // Cart API endpoints
  app.get("/api/cart/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      let cart = await Cart.findOne({ userId });

      if (!cart) {
        cart = new Cart({ userId, items: [], total: 0 });
        await cart.save();
      }

      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart/add", async (req, res) => {
    try {
      const { userId, productId, name, price, image, quantity = 1 } = req.body;

      let cart = await Cart.findOne({ userId });

      if (!cart) {
        cart = new Cart({ userId, items: [], total: 0 });
      }

      const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, name, price, image, quantity });
      }

      cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      await cart.save();

      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  app.put("/api/cart/update", async (req, res) => {
    try {
      const { userId, productId, quantity } = req.body;

      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      if (quantity <= 0) {
        cart.items = cart.items.filter(item => item.productId !== productId);
      } else {
        const itemIndex = cart.items.findIndex(item => item.productId === productId);
        if (itemIndex > -1) {
          cart.items[itemIndex].quantity = quantity;
        }
      }

      cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      await cart.save();

      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart" });
    }
  });

  app.delete("/api/cart/clear/:userId", async (req, res) => {
    try {
      const { userId } = req.params;

      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      cart.items = [];
      cart.total = 0;
      await cart.save();

      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Order API endpoints
  app.post("/api/orders", async (req, res) => {
    try {
      const {
        userId,
        customerInfo,
        items,
        discountCode = null,
        freeDeliveryCode = null,
        shippingFee = 0,
        paymentMethod,
        shippingAddress,
        orderNotes,
        membershipDiscount = 0,
        membershipTier = null,
        memberExclusiveItemsCount = 0
      } = req.body;

      // Validate required fields
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Order items are required" });
      }

      if (!customerInfo || !customerInfo.name || !customerInfo.phone || !customerInfo.email) {
        return res.status(400).json({ message: "Customer information is required" });
      }

      // SERVER-SIDE SECURITY: Recompute subtotal based on current product prices
      let serverSubtotal = 0;
      const validatedItems = [];

      for (const item of items) {
        try {
          // Fetch current product price from database
          const product = await Product.findById(item.productId);
          if (!product) {
            return res.status(400).json({ message: `Product ${item.productId} not found` });
          }

          if (!product.isActive) {
            return res.status(400).json({ message: `Product ${product.name} is no longer available` });
          }

          if (product.stockQuantity < item.quantity) {
            return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
          }

          // Use current database price, not client-provided price
          const itemTotal = product.price * item.quantity;
          serverSubtotal += itemTotal;

          validatedItems.push({
            productId: item.productId,
            name: product.name,
            price: product.price, // Use current price from database
            quantity: item.quantity,
            image: item.image || product.image
          });
        } catch (error) {
          console.error(`Error validating product ${item.productId}:`, error);
          return res.status(400).json({ message: `Invalid product: ${item.productId}` });
        }
      }

      // SERVER-SIDE SECURITY: Revalidate coupon and calculate discount
      let serverDiscount = 0;
      let validatedCouponCode = null;

      if (discountCode) {
        try {
          const coupon = await Coupon.findOne({ 
            code: discountCode.toUpperCase(),
            isActive: true
          });

          if (!coupon) {
            return res.status(400).json({ message: "Invalid coupon code" });
          }

          const now = new Date();
          if (now < coupon.validFrom || now > coupon.validUntil) {
            return res.status(400).json({ message: "Coupon has expired or is not yet valid" });
          }

          if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ message: "Coupon usage limit reached" });
          }

          if (coupon.minOrderAmount && serverSubtotal < coupon.minOrderAmount) {
            return res.status(400).json({ 
              message: `Minimum order amount of $${coupon.minOrderAmount} required` 
            });
          }

          // Calculate discount server-side
          if (coupon.discountType === 'percentage') {
            serverDiscount = Math.round((serverSubtotal * coupon.discountValue) / 100);
            if (coupon.maxDiscountAmount) {
              serverDiscount = Math.min(serverDiscount, coupon.maxDiscountAmount);
            }
          } else {
            serverDiscount = coupon.discountValue;
          }

          validatedCouponCode = coupon.code;

          // ATOMIC COUPON USAGE TRACKING: Increment usage count
          const newUsedCount = coupon.usedCount + 1;
          const updateData: any = { $inc: { usedCount: 1 } };
          
          // If usage limit reached, mark coupon as inactive
          if (coupon.usageLimit && newUsedCount >= coupon.usageLimit) {
            updateData.isActive = false;
            console.log(`Coupon ${coupon.code} has reached usage limit (${coupon.usageLimit}). Marking as inactive.`);
          }
          
          await Coupon.findByIdAndUpdate(
            coupon._id,
            updateData,
            { new: true }
          );
        } catch (error) {
          console.error('Error validating coupon:', error);
          return res.status(400).json({ message: "Failed to validate coupon" });
        }
      }

      // VALIDATE AND TRACK FREE DELIVERY VOUCHER USAGE
      if (freeDeliveryCode) {
        try {
          const freeDeliveryVoucher = await Coupon.findOne({
            code: freeDeliveryCode.toUpperCase(),
            isActive: true,
            discountType: 'free_delivery'
          });

          if (!freeDeliveryVoucher) {
            return res.status(400).json({ message: "Invalid free delivery voucher code" });
          }

          const now = new Date();
          if (now < freeDeliveryVoucher.validFrom || now > freeDeliveryVoucher.validUntil) {
            return res.status(400).json({ message: "Free delivery voucher has expired or is not yet valid" });
          }

          if (freeDeliveryVoucher.usageLimit && freeDeliveryVoucher.usedCount >= freeDeliveryVoucher.usageLimit) {
            return res.status(400).json({ message: "Free delivery voucher usage limit reached" });
          }

          // ATOMIC FREE DELIVERY VOUCHER USAGE TRACKING: Increment usage count
          const newUsedCount = freeDeliveryVoucher.usedCount + 1;
          const updateData: any = { $inc: { usedCount: 1 } };

          // If usage limit reached, mark voucher as inactive
          if (freeDeliveryVoucher.usageLimit && newUsedCount >= freeDeliveryVoucher.usageLimit) {
            updateData.isActive = false;
            console.log(`Free delivery voucher ${freeDeliveryVoucher.code} has reached usage limit (${freeDeliveryVoucher.usageLimit}). Marking as inactive.`);
          }

          await Coupon.findByIdAndUpdate(
            freeDeliveryVoucher._id,
            updateData,
            { new: true }
          );

          console.log(`Free delivery voucher ${freeDeliveryVoucher.code} usage updated: ${freeDeliveryVoucher.usedCount} -> ${newUsedCount}`);
        } catch (error) {
          console.error('Error validating free delivery voucher:', error);
          return res.status(400).json({ message: "Failed to validate free delivery voucher" });
        }
      }

      // SERVER-SIDE SECURITY: Validate and recalculate membership discount
      let serverMembershipDiscount = 0;
      let serverMembershipTier = null;
      let membershipUser = null;

      // Try to find user with active membership
      // 1. First try by userId (for logged-in users)
      // 2. Then try by email (for guest checkout with registered member account)
      try {
        // Check if userId is a valid MongoDB ObjectId (logged-in user)
        // Guest UUIDs contain hyphens, MongoDB ObjectIds don't
        const isValidUserId = userId && userId !== 'guest' && !userId.includes('-') && userId.length === 24;
        
        if (isValidUserId) {
          // Logged-in user: find by userId
          membershipUser = await User.findById(userId);
          console.log(`Checking membership for logged-in user: ${userId}`);
        } else if (customerInfo?.email) {
          // Guest checkout or invalid userId: try to find registered user by email
          membershipUser = await User.findOne({ email: customerInfo.email });
          if (membershipUser) {
            console.log(`Found registered user account for guest email: ${customerInfo.email}`);
          } else {
            console.log(`No registered user found for guest email: ${customerInfo.email}`);
          }
        }

        // Apply membership discount if user has active membership
        if (membershipUser?.membership && new Date() <= new Date(membershipUser.membership.expiryDate)) {
          const discountRates: Record<string, number> = {
            'Silver Paw': 0.05,
            'Golden Paw': 0.10,
            'Diamond Paw': 0.15
          };

          const discountRate = discountRates[membershipUser.membership.tier] || 0;
          // Calculate discount based on subtotal AFTER coupon discount
          const afterCouponTotal = Math.max(0, serverSubtotal - serverDiscount);
          serverMembershipDiscount = afterCouponTotal * discountRate;
          serverMembershipTier = membershipUser.membership.tier;

          console.log(`✅ Membership discount applied: ${membershipUser.membership.tier} (${(discountRate * 100).toFixed(0)}%) - Discount: $${serverMembershipDiscount.toFixed(2)}`);
        } else if (membershipUser) {
          console.log(`User found but no active membership (expired or not subscribed)`);
        } else {
          console.log(`No user found for membership validation`);
        }
      } catch (error) {
        console.error('Error validating membership:', error);
        // Continue without membership discount if validation fails
      }

      // SERVER-SIDE SECURITY: Calculate final total server-side
      const serverTotal = Math.max(0, serverSubtotal - serverDiscount - serverMembershipDiscount + shippingFee);

      // Generate unique invoice number
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create order with server-computed values
      const order = new Order({
        userId,
        status: 'Processing',
        invoiceNumber, // Add invoice number to order
        subtotal: serverSubtotal, // Use server-computed subtotal
        discount: serverDiscount, // Use server-computed discount
        discountCode: validatedCouponCode, // Add discount code
        total: serverTotal, // Use server-computed total (includes shipping)
        items: validatedItems,
        shippingAddress,
        customerInfo, // Add customer info to order
        shippingFee,
        freeDeliveryCode,
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
        orderNotes,
        membershipDiscount: serverMembershipDiscount, // Use server-computed value
        membershipTier: serverMembershipTier, // Use server-computed value
        memberExclusiveItemsCount
      });

      await order.save();

      // Create invoice with server-computed values
      const invoice = new Invoice({
        invoiceNumber,
        orderId: order._id?.toString() || order.id,
        userId,
        customerInfo,
        items: validatedItems,
        subtotal: serverSubtotal, // Use server-computed subtotal
        discount: serverDiscount, // Use server-computed discount
        discountCode: validatedCouponCode,
        membershipDiscount: serverMembershipDiscount, // Use server-computed value
        membershipTier: serverMembershipTier, // Use server-computed value
        shippingFee,
        freeDeliveryCode,
        total: serverTotal, // Use server-computed total (includes shipping)
        paymentMethod,
        paymentStatus: order.paymentStatus
      });

      await invoice.save();

      // Update order with invoice ID for easy reference
      order.invoiceId = invoice._id?.toString() || invoice.id;
      await order.save();

      // Clear user's cart
      await Cart.findOneAndUpdate(
        { userId },
        { items: [], total: 0 }
      );

      console.log(`Order created: Subtotal=$${serverSubtotal}, Discount=$${serverDiscount}, ShippingFee=$${shippingFee}, Total=$${serverTotal}, MembershipDiscount=$${serverMembershipDiscount}, MembershipTier=${serverMembershipTier}`);
      res.json({ order, invoice });
    } catch (error) {
      console.error('Order creation error:', error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get("/api/orders/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Try to find orders with the exact userId match
      // Also try to match if userId is stored as ObjectId or string
      let orders = await Order.find({ 
        $or: [
          { userId: userId },
          { userId: userId.toString() }
        ]
      }).sort({ createdAt: -1 });
      
      // If no orders found, try to find by converting to ObjectId if it's a valid ObjectId format
      if (orders.length === 0 && userId.match(/^[0-9a-fA-F]{24}$/)) {
        const mongoose = require('mongoose');
        try {
          const objectId = new mongoose.Types.ObjectId(userId);
          orders = await Order.find({ userId: objectId }).sort({ createdAt: -1 });
        } catch (e) {
          // If conversion fails, just return empty array
        }
      }
      
      res.json(orders);
    } catch (error) {
      console.error('Error fetching user orders:', error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Pay for order using wallet
  app.post("/api/orders/:orderId/pay-with-wallet", async (req, res) => {
    try {
      console.log('=== WALLET PAYMENT REQUEST ===');
      const { orderId } = req.params;
      const { userId } = req.body;
      console.log('Order ID:', orderId);
      console.log('User ID:', userId);

      if (!userId) {
        console.log('ERROR: User ID is missing');
        return res.status(400).json({ message: "User ID is required" });
      }

      // Find the invoice
      console.log('Looking for invoice...');
      const invoice = await Invoice.findById(orderId);
      if (!invoice) {
        console.log('ERROR: Invoice not found');
        return res.status(404).json({ message: "Invoice not found" });
      }
      console.log('Invoice found:', invoice.invoiceNumber, 'Total:', invoice.total);

      // Get or create wallet
      console.log('Getting wallet for user:', userId);
      const { getOrCreateWallet, addWalletTransaction } = await import('./wallet-routes');
      const wallet = await getOrCreateWallet(userId);
      console.log('===== WALLET DATA FROM DB =====');
      console.log('Wallet ID:', wallet._id);
      console.log('Wallet balance:', wallet.balance);
      console.log('Wallet balance type:', typeof wallet.balance);
      console.log('Wallet object:', JSON.stringify(wallet, null, 2));
      console.log('==============================');

      // ===== CURRENCY NOTE =====
      // All monetary amounts in the database are stored in USD (base currency)
      // - wallet.balance is in USD
      // - invoice.total is in USD
      // Frontend converts for display only, not for storage/calculation
      // ========================
      
      console.log('Invoice total raw value:', invoice.total);
      console.log('Invoice total type:', typeof invoice.total);
      
      // Parse total amount with validation
      let totalAmount = Number(invoice.total);
      if (isNaN(totalAmount) || !invoice.total) {
        // Try grandTotal as fallback
        totalAmount = Number((invoice as any).grandTotal);
        console.log('Tried grandTotal fallback:', totalAmount);
      }
      
      console.log('Total amount (USD):', totalAmount);
      console.log('Is totalAmount NaN?', isNaN(totalAmount));
      console.log('Wallet balance (USD):', wallet.balance);
      console.log('Wallet balance type:', typeof wallet.balance);
      
      if (!totalAmount || isNaN(totalAmount) || totalAmount <= 0) {
        console.log('ERROR: Invalid invoice total');
        return res.status(400).json({ 
          message: "Invalid invoice total",
          invoiceTotal: invoice.total,
          grandTotal: (invoice as any).grandTotal
        });
      }
      
      // Ensure wallet balance is a number (should always be in USD)
      const walletBalance = Number(wallet.balance);
      console.log('Wallet balance as number (USD):', walletBalance);
      
      // Compare amounts (both in USD)
      console.log(`Comparing: wallet balance ($${walletBalance}) vs invoice total ($${totalAmount})`);
      
      if (walletBalance < totalAmount) {
        console.log(`ERROR: Insufficient balance. Required: $${totalAmount} USD, Available: $${walletBalance} USD`);
        return res.status(400).json({ 
          message: "Insufficient wallet balance",
          required: totalAmount,
          available: walletBalance,
          currency: "USD",
          note: "All amounts are in USD. Your wallet balance is less than the order total."
        });
      }
      
      console.log(`✅ Sufficient balance. Proceeding with wallet payment of $${totalAmount} USD`);

      // Deduct from wallet
      console.log('Processing wallet transaction...');
      console.log('Wallet ID:', wallet._id);
      console.log('Amount to deduct:', totalAmount);
      
      await addWalletTransaction(
        wallet._id.toString(),
        userId,
        'SPEND',
        'ORDER_PAYMENT',
        totalAmount,
        wallet,
        `Payment for order ${invoice.invoiceNumber}`,
        { orderId: invoice._id?.toString() || orderId, invoiceNumber: invoice.invoiceNumber }
      );
      console.log('Wallet transaction completed');

      // Update invoice and order status
      console.log('Updating invoice status...');
      invoice.paymentStatus = 'Paid';
      invoice.paymentMethod = 'my-wallet';
      await invoice.save();
      console.log('Invoice updated');

      console.log('Updating order status...');
      const order = await Order.findOne({ _id: invoice.orderId });
      if (order) {
        order.status = 'confirmed';
        order.paymentStatus = 'Paid';
        order.paymentMethod = 'my-wallet';
        await order.save();
        console.log('Order updated');
      } else {
        console.log('WARNING: Order not found for invoice');
      }

      console.log('=== PAYMENT SUCCESS ===');
      res.json({
        success: true,
        message: "Payment successful",
        newBalance: wallet.balance,
        invoice,
        order
      });
    } catch (error) {
      console.error('Wallet payment error details:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ 
        message: "Failed to process wallet payment",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Fix orders missing invoiceId
  app.post("/api/orders/fix-invoice-ids", async (req, res) => {
    try {
      const ordersWithoutInvoiceId = await Order.find({ 
        $or: [
          { invoiceId: { $exists: false } },
          { invoiceId: null },
          { invoiceId: '' }
        ]
      });

      let fixed = 0;
      let notFound = 0;

      for (const order of ordersWithoutInvoiceId) {
        const orderId = order._id.toString();
        const invoice = await Invoice.findOne({ orderId: orderId });
        
        if (invoice) {
          order.invoiceId = invoice._id.toString();
          await order.save();
          fixed++;
          console.log(`Fixed order ${orderId} with invoiceId ${invoice._id}`);
        } else {
          notFound++;
          console.log(`No invoice found for order ${orderId}`);
        }
      }

      res.json({
        message: "Invoice IDs fixed",
        fixed,
        notFound,
        total: ordersWithoutInvoiceId.length
      });
    } catch (error) {
      console.error('Error fixing invoice IDs:', error);
      res.status(500).json({ message: "Failed to fix invoice IDs" });
    }
  });

  // Get all orders (admin only)
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await Order.find({}).sort({ createdAt: -1 });

      // Enhance orders with customer info and invoice numbers from invoices when missing
      const enhancedOrders = await Promise.all(orders.map(async (order) => {
        const orderObj = order.toObject();

        const orderId = order._id.toString();
        console.log(`Processing order ${orderId}, customerInfo exists:`, !!orderObj.customerInfo);

        // Try to get invoice info for this order
        try {
          const invoice = await Invoice.findOne({ orderId: orderId });
          if (invoice) {
            console.log(`Found invoice:`, !!invoice, `with customerInfo: ${!!invoice.customerInfo}`);

            // Add invoice number if missing
            if (!orderObj.invoiceNumber && invoice.invoiceNumber) {
              orderObj.invoiceNumber = invoice.invoiceNumber;
            }

            // Add customer info if missing
            if ((!orderObj.customerInfo || !orderObj.customerInfo.name) && invoice.customerInfo) {
              console.log(`Enhancing order ${orderId} with customer info:`, invoice.customerInfo.name);
              orderObj.customerInfo = invoice.customerInfo;
            }

            // Add invoice ID if missing (runtime only, not persisted)
            if (!orderObj.invoiceId) {
              orderObj.invoiceId = invoice._id?.toString();
            }
          }
        } catch (invoiceError) {
          console.log(`Could not fetch invoice for order ${orderId}:`, (invoiceError as Error).message);
        }

        return orderObj;
      }));

      res.json(enhancedOrders);
    } catch (error) {
      console.error('Error fetching all orders:', error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Update order status
  app.put("/api/orders/:orderId/status", async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const order = await Order.findByIdAndUpdate(
        orderId,
        { 
          status: status,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json({ message: "Order status updated successfully", order });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Delete order (admin only)
  app.delete("/api/orders/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;

      const order = await Order.findByIdAndDelete(orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json({ message: "Order deleted successfully" });
    } catch (error) {
      console.error('Error deleting order:', error);
      res.status(500).json({ message: "Failed to delete order" });
    }
  });

  // Request API endpoints
  // Create a new request
  app.post("/api/requests", async (req, res) => {
    try {
      const { userId, type, subject, description, priority, orderId } = req.body;

      if (!userId || !type || !subject || !description) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const request = new Request({
        userId,
        type,
        subject,
        description,
        priority: priority || 'medium',
        status: 'pending',
        orderId,
      });

      await request.save();
      res.status(201).json(request);
    } catch (error) {
      console.error('Error creating request:', error);
      res.status(500).json({ message: "Failed to create request" });
    }
  });

  // Get requests by user ID
  app.get("/api/requests/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const requests = await Request.find({ userId }).sort({ createdAt: -1 });
      res.json(requests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      res.status(500).json({ message: "Failed to fetch requests" });
    }
  });

  // Get a single request by ID
  app.get("/api/requests/:requestId", async (req, res) => {
    try {
      const { requestId } = req.params;
      const request = await Request.findById(requestId);

      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      res.json(request);
    } catch (error) {
      console.error('Error fetching request:', error);
      res.status(500).json({ message: "Failed to fetch request" });
    }
  });

  // Update request status and response (admin only)
  app.put("/api/requests/:requestId", async (req, res) => {
    try {
      const { requestId } = req.params;
      const { status, response, priority } = req.body;

      const updateData: any = {};
      if (status) updateData.status = status;
      if (response !== undefined) updateData.response = response;
      if (priority) updateData.priority = priority;

      const request = await Request.findByIdAndUpdate(
        requestId,
        updateData,
        { new: true }
      );

      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      res.json(request);
    } catch (error) {
      console.error('Error updating request:', error);
      res.status(500).json({ message: "Failed to update request" });
    }
  });

  // Delete request
  app.delete("/api/requests/:requestId", async (req, res) => {
    try {
      const { requestId } = req.params;
      const request = await Request.findByIdAndDelete(requestId);

      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }

      res.json({ message: "Request deleted successfully" });
    } catch (error) {
      console.error('Error deleting request:', error);
      res.status(500).json({ message: "Failed to delete request" });
    }
  });

  // Get all requests (admin only)
  app.get("/api/requests", async (req, res) => {
    try {
      const requests = await Request.find({}).sort({ createdAt: -1 });
      res.json(requests);
    } catch (error) {
      console.error('Error fetching all requests:', error);
      res.status(500).json({ message: "Failed to fetch requests" });
    }
  });

  // ==================== ADDRESS ROUTES ====================
  
  // Get all addresses for a user
  app.get("/api/addresses/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const addresses = await Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
      res.json(addresses);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      res.status(500).json({ message: "Failed to fetch addresses" });
    }
  });

  // Create a new address
  app.post("/api/addresses", async (req, res) => {
    try {
      const { userId, fullName, phone, addressLine1, addressLine2, city, region, province, postCode, country, isDefault, label } = req.body;

      console.log('Creating address for user:', userId);
      console.log('Address data:', { fullName, phone, addressLine1, city, region, province, postCode, country });

      // Validate required fields
      if (!userId || !fullName || !phone || !addressLine1 || !city || !postCode || !country) {
        const missingFields = [];
        if (!userId) missingFields.push('userId');
        if (!fullName) missingFields.push('fullName');
        if (!phone) missingFields.push('phone');
        if (!addressLine1) missingFields.push('addressLine1');
        if (!city) missingFields.push('city');
        if (!postCode) missingFields.push('postCode');
        if (!country) missingFields.push('country');
        
        console.error('Missing required fields:', missingFields);
        return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
      }

      // If this address is set as default, unset all other default addresses for this user
      if (isDefault) {
        await Address.updateMany({ userId }, { isDefault: false });
      }

      const newAddress = new Address({
        userId,
        fullName,
        phone,
        addressLine1,
        addressLine2,
        city,
        region,
        province,
        postCode,
        country,
        isDefault: isDefault || false,
        label: label || 'Home'
      });

      await newAddress.save();
      console.log('Address created successfully:', newAddress._id);
      res.status(201).json(newAddress);
    } catch (error) {
      console.error('Error creating address:', error);
      res.status(500).json({ 
        message: "Failed to create address",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Update an address
  app.put("/api/addresses/:addressId", async (req, res) => {
    try {
      const { addressId } = req.params;
      const { fullName, phone, addressLine1, addressLine2, city, region, province, postCode, country, isDefault, label } = req.body;

      const address = await Address.findById(addressId);
      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }

      // If this address is being set as default, unset all other default addresses for this user
      if (isDefault && !address.isDefault) {
        await Address.updateMany({ userId: address.userId }, { isDefault: false });
      }

      const updatedAddress = await Address.findByIdAndUpdate(
        addressId,
        {
          fullName,
          phone,
          addressLine1,
          addressLine2,
          city,
          region,
          province,
          postCode,
          country,
          isDefault: isDefault !== undefined ? isDefault : address.isDefault,
          label: label || address.label
        },
        { new: true }
      );

      res.json(updatedAddress);
    } catch (error) {
      console.error('Error updating address:', error);
      res.status(500).json({ message: "Failed to update address" });
    }
  });

  // Delete an address
  app.delete("/api/addresses/:addressId", async (req, res) => {
    try {
      const { addressId } = req.params;
      const address = await Address.findByIdAndDelete(addressId);

      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }

      // If deleted address was default, set first remaining address as default
      if (address.isDefault) {
        const firstAddress = await Address.findOne({ userId: address.userId });
        if (firstAddress) {
          firstAddress.isDefault = true;
          await firstAddress.save();
        }
      }

      res.json({ message: "Address deleted successfully" });
    } catch (error) {
      console.error('Error deleting address:', error);
      res.status(500).json({ message: "Failed to delete address" });
    }
  });

  // Set an address as default
  app.put("/api/addresses/:addressId/set-default", async (req, res) => {
    try {
      const { addressId } = req.params;
      const address = await Address.findById(addressId);

      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }

      // Unset all other default addresses for this user
      await Address.updateMany({ userId: address.userId }, { isDefault: false });

      // Set this address as default
      address.isDefault = true;
      await address.save();

      res.json(address);
    } catch (error) {
      console.error('Error setting default address:', error);
      res.status(500).json({ message: "Failed to set default address" });
    }
  });

  // Contact form submission endpoint (EmailJS handles email sending)
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, phone, email, subject, message } = req.body;

      // Validate required fields
      if (!name || !phone || !subject || !message) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Log the contact submission for record keeping
      console.log('Contact form submission:', {
        name,
        phone,
        email: email || 'Not provided',
        subject,
        timestamp: new Date().toISOString()
      });

      res.json({
        message: "Message sent successfully! We'll get back to you within 24 hours.",
        success: true
      });
    } catch (error) {
      console.error('Contact form error:', error);
      res.status(500).json({
        message: "Failed to send message. Please try again later.",
        success: false
      });
    }
  });

  // Invoice API endpoints
  app.get("/api/invoices/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const invoices = await Invoice.find({ userId }).sort({ createdAt: -1 });
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/:invoiceId", async (req, res) => {
    try {
      const { invoiceId } = req.params;
      console.log('Looking for invoice with ID:', invoiceId);
      
      // Try to find invoice by _id first
      let invoice = await Invoice.findById(invoiceId);
      
      // If not found, try to find by orderId
      if (!invoice) {
        console.log('Invoice not found by _id, trying orderId...');
        invoice = await Invoice.findOne({ orderId: invoiceId });
      }

      if (!invoice) {
        console.log('Invoice not found by either _id or orderId');
        return res.status(404).json({ message: "Invoice not found" });
      }

      console.log('Invoice found:', invoice.invoiceNumber);
      res.json(invoice);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.get("/api/invoices/download/:invoiceId", async (req, res) => {
    try {
      const { invoiceId } = req.params;
      
      // Try to find invoice by _id first
      let invoice = await Invoice.findById(invoiceId);
      
      // If not found, try to find by orderId
      if (!invoice) {
        invoice = await Invoice.findOne({ orderId: invoiceId });
      }

      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      // Backward compatibility: Calculate missing fields for old invoices
      const invoiceDiscount = invoice.discount || 0;
      const invoiceMembershipDiscount = invoice.membershipDiscount || 0;
      let invoiceShippingFee = invoice.shippingFee;
      
      // If shippingFee is missing (old invoice), calculate it from total
      if (invoiceShippingFee === undefined || invoiceShippingFee === null) {
        // Formula: shippingFee = total - subtotal + discount + membershipDiscount
        invoiceShippingFee = Math.max(0, invoice.total - invoice.subtotal + invoiceDiscount + invoiceMembershipDiscount);
        console.log(`Old invoice ${invoice.invoiceNumber}: Calculated shippingFee = ${invoiceShippingFee} (total=${invoice.total}, subtotal=${invoice.subtotal}, discount=${invoiceDiscount}, membershipDiscount=${invoiceMembershipDiscount})`);
      }

      // Format address
      let addressHTML = '';
      if (invoice.customerInfo.address) {
        if (typeof invoice.customerInfo.address === 'string') {
          addressHTML = `<p>${invoice.customerInfo.address}</p>`;
        } else {
          const addr = invoice.customerInfo.address;
          const addressLine = addr.address || '';
          const locationParts = [addr.city, addr.province, addr.region, addr.country].filter(Boolean);
          addressHTML = `
            <p>${addressLine}</p>
            ${locationParts.length > 0 ? `<p>${locationParts.join(', ')}${addr.postCode ? ` - ${addr.postCode}` : ''}</p>` : ''}
          `;
        }
      }

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
              background: #f9fafb;
              padding: 20px;
              color: #333;
            }
            
            .invoice-card {
              background: white;
              max-width: 900px;
              margin: 0 auto;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              overflow: hidden;
            }
            
            .card-header {
              border-bottom: 1px solid #e5e7eb;
              padding: 24px;
            }
            
            .header-content {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            
            .logo-section {
              display: flex;
              align-items: center;
              margin-bottom: 12px;
            }
            
            .logo-img {
              width: 48px;
              height: 48px;
              margin-right: 12px;
            }
            
            .company-name {
              font-size: 28px;
              font-weight: bold;
              color: #26732d;
            }
            
            .company-details {
              color: #6b7280;
              margin-top: 8px;
              line-height: 1.5;
            }
            
            .invoice-info {
              text-align: right;
            }
            
            .invoice-title {
              font-size: 24px;
              font-weight: bold;
              color: #111827;
            }
            
            .invoice-number {
              font-size: 18px;
              font-weight: 600;
              color: #26732d;
            }
            
            .invoice-date {
              color: #6b7280;
            }
            
            .card-content {
              padding: 24px;
            }
            
            .customer-section {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
              margin-bottom: 32px;
            }
            
            .info-block h3 {
              font-weight: bold;
              font-size: 18px;
              margin-bottom: 12px;
            }
            
            .info-block p {
              margin-bottom: 4px;
              line-height: 1.5;
            }
            
            .info-block .address {
              color: #6b7280;
            }
            
            .info-block .font-semibold {
              font-weight: 600;
            }
            
            .info-block .font-medium {
              font-weight: 500;
            }
            
            .badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 500;
              margin-left: 8px;
            }
            
            .badge-default {
              background: #26732d;
              color: white;
            }
            
            .badge-secondary {
              background: #e5e7eb;
              color: #374151;
            }
            
            .items-section {
              margin-bottom: 32px;
            }
            
            .items-section h3 {
              font-weight: bold;
              font-size: 18px;
              margin-bottom: 16px;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              border: 1px solid #d1d5db;
            }
            
            th {
              background: #f9fafb;
              border: 1px solid #d1d5db;
              padding: 12px;
              text-align: left;
              font-weight: 600;
            }
            
            th.text-center {
              text-align: center;
            }
            
            th.text-right {
              text-align: right;
            }
            
            td {
              border: 1px solid #d1d5db;
              padding: 12px;
            }
            
            td.text-center {
              text-align: center;
            }
            
            td.text-right {
              text-align: right;
            }
            
            tr:hover {
              background: #f9fafb;
            }
            
            .product-cell {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            
            .product-img {
              width: 48px;
              height: 48px;
              object-fit: cover;
              border-radius: 4px;
            }
            
            .product-name {
              font-weight: 500;
            }
            
            .totals-section {
              display: flex;
              justify-content: flex-end;
            }
            
            .totals-box {
              width: 100%;
              max-width: 400px;
            }
            
            .separator {
              height: 1px;
              background: #e5e7eb;
              margin: 8px 0;
            }
            
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 8px 0;
            }
            
            .total-final {
              font-size: 18px;
              font-weight: bold;
              border-top: 1px solid #e5e7eb;
              padding-top: 8px;
              margin-top: 8px;
            }
            
            .total-final .amount {
              color: #26732d;
            }
            
            .footer {
              margin-top: 32px;
              padding-top: 24px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
            }
            
            .footer p {
              margin-bottom: 8px;
            }
            
            .footer .text-sm {
              font-size: 14px;
            }
            
            @media print {
              body {
                background: white;
                padding: 0;
              }
              
              .invoice-card {
                box-shadow: none;
                border: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-card">
            <div class="card-header">
              <div class="header-content">
                <div>
                  <div class="logo-section">
                    <div class="company-name">PawCart Online Pet Store</div>
                  </div>
                  <p class="company-details">
                    11 Yuk Choi Road, Hung Hom<br>
                    Kowloon, Hong Kong<br>
                    Email: boqianjlu@gmail.com<br>
                    Phone: 852-6214-6811
                  </p>
                </div>
                <div class="invoice-info">
                  <h2 class="invoice-title">INVOICE</h2>
                  <p class="invoice-number">#${invoice.invoiceNumber}</p>
                  <p class="invoice-date">Date: ${new Date(invoice.orderDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div class="card-content">
              <!-- Customer Information -->
              <div class="customer-section">
                <div class="info-block">
                  <h3>Bill To:</h3>
                  <div>
                    <p class="font-semibold">${invoice.customerInfo.name}</p>
                    <p>${invoice.customerInfo.email}</p>
                    <p>${invoice.customerInfo.phone}</p>
                    ${invoice.customerInfo.address ? (
                      typeof invoice.customerInfo.address === 'string' 
                        ? `<p class="address">${invoice.customerInfo.address}</p>`
                        : `
                          <div class="address">
                            <p>${invoice.customerInfo.address.address || ''}</p>
                            <p>${[
                              invoice.customerInfo.address.city,
                              invoice.customerInfo.address.province,
                              invoice.customerInfo.address.region,
                              invoice.customerInfo.address.country
                            ].filter(Boolean).join(', ')}${invoice.customerInfo.address.postCode ? ` - ${invoice.customerInfo.address.postCode}` : ''}</p>
                          </div>
                        `
                    ) : ''}
                  </div>
                </div>
                
                <div class="info-block">
                  <h3>Order Details:</h3>
                  <div>
                    <p><span class="font-medium">Order ID:</span> ${invoice.orderId}</p>
                    <p><span class="font-medium">Payment Method:</span> ${invoice.paymentMethod}</p>
                    <p>
                      <span class="font-medium">Payment Status:</span>
                      <span class="badge ${invoice.paymentStatus === 'Paid' ? 'badge-default' : 'badge-secondary'}">
                        ${invoice.paymentStatus}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Items Table -->
              <div class="items-section">
                <h3>Items Ordered:</h3>
                <div>
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th class="text-center">Quantity</th>
                        <th class="text-right">Price</th>
                        <th class="text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${invoice.items.map((item: any) => `
                        <tr>
                          <td>
                            <div class="product-cell">
                              <img src="${item.image}" alt="${item.name}" class="product-img">
                              <span class="product-name">${item.name}</span>
                            </div>
                          </td>
                          <td class="text-center">${item.quantity}</td>
                          <td class="text-right">$${item.price.toFixed(2)}</td>
                          <td class="text-right product-name">$${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Totals -->
              <div class="totals-section">
                <div class="totals-box">
                  <div class="separator"></div>
                  <div class="total-row">
                    <span>Subtotal:</span>
                    <span>$${invoice.subtotal.toFixed(2)}</span>
                  </div>
                  ${invoiceDiscount > 0 ? `
                  <div class="total-row" style="color: #16a34a;">
                    <span>Discount ${invoice.discountCode ? `(${invoice.discountCode})` : ''}:</span>
                    <span>-$${invoiceDiscount.toFixed(2)}</span>
                  </div>
                  ` : ''}
                  ${invoiceMembershipDiscount > 0 ? `
                  <div class="total-row" style="color: #26732d;">
                    <span>👑 Membership Discount ${invoice.membershipTier ? `(${invoice.membershipTier})` : ''}:</span>
                    <span>-$${invoiceMembershipDiscount.toFixed(2)}</span>
                  </div>
                  ` : ''}
                  <div class="total-row">
                    <span>Shipping Fee${invoice.freeDeliveryCode ? ` <span style="color: #16a34a; font-size: 12px;">(FREE: ${invoice.freeDeliveryCode})</span>` : ''}:</span>
                    <span style="${invoiceShippingFee === 0 ? 'color: #16a34a; font-weight: 500;' : ''}">${invoiceShippingFee === 0 ? 'FREE' : `$${invoiceShippingFee.toFixed(2)}`}</span>
                  </div>
                  <div class="total-row total-final">
                    <span>Total:</span>
                    <span class="amount">$${invoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="footer">
                <p>Thank you for shopping with PawCart Online Pet Store!</p>
                <p class="text-sm">For any queries, please contact us at boqianjlu@gmail.com</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}.html"`);
      res.send(html);
    } catch (error) {
      console.error('Error generating invoice:', error);
      res.status(500).json({ message: "Failed to generate invoice" });
    }
  });

  // Blog API endpoints
  // Get all blog posts
  app.get("/api/blog", async (req, res) => {
    try {
      const blogPosts = await storage.getBlogPosts();
      res.json(blogPosts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  // Get published blog posts only
  app.get("/api/blog/published", async (req, res) => {
    try {
      const { category } = req.query;
      const allPosts = await storage.getBlogPosts();
      let publishedPosts = allPosts.filter(post => post.isPublished);

      // Filter by category if provided
      if (category && category !== 'All') {
        publishedPosts = publishedPosts.filter(post =>
          post.category && post.category === category
        );
      }

      res.json(publishedPosts);
    } catch (error) {
      console.error('Error fetching published blog posts:', error);
      res.status(500).json({ message: "Failed to fetch published blog posts" });
    }
  });

  // Get single blog post by ID
  app.get("/api/blog/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const blogPost = await storage.getBlogPost(id);

      if (!blogPost) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      res.json(blogPost);
    } catch (error) {
      console.error('Error fetching blog post:', error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // Get blog post by slug
  app.get("/api/blog/slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const blogPost = await storage.getBlogPostBySlug(slug);

      if (!blogPost) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      res.json(blogPost);
    } catch (error) {
      console.error('Error fetching blog post by slug:', error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  // Create new blog post
  app.post("/api/blog", async (req, res) => {
    try {
      const blogPostSchema = z.object({
        title: z.string().min(1, "Title is required"),
        slug: z.string().min(1, "Slug is required"),
        excerpt: z.string().optional(),
        content: z.string().min(1, "Content is required"),
        image: z.string().optional(),
        author: z.string().min(1, "Author is required"),
        publishedAt: z.string().datetime().optional(),
        category: z.string().optional(),
        isPublished: z.boolean().optional()
      });

      const validatedData = blogPostSchema.parse(req.body);

      // Convert publishedAt string to Date if provided
      const blogPostData = {
        ...validatedData,
        publishedAt: validatedData.publishedAt ? new Date(validatedData.publishedAt) : undefined
      };

      const newBlogPost = await storage.createBlogPost(blogPostData);
      res.status(201).json(newBlogPost);
    } catch (error) {
      console.error('Error creating blog post:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  // Update blog post
  app.put("/api/blog/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const updateSchema = z.object({
        title: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        excerpt: z.string().optional(),
        content: z.string().min(1).optional(),
        image: z.string().optional(),
        author: z.string().min(1).optional(),
        publishedAt: z.string().datetime().optional(),
        category: z.string().optional(),
        isPublished: z.boolean().optional()
      });

      const validatedData = updateSchema.parse(req.body);

      // Convert publishedAt string to Date if provided
      const updateData = {
        ...validatedData,
        publishedAt: validatedData.publishedAt ? new Date(validatedData.publishedAt) : undefined
      };

      const updatedBlogPost = await storage.updateBlogPost(id, updateData);

      if (!updatedBlogPost) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      res.json(updatedBlogPost);
    } catch (error) {
      console.error('Error updating blog post:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });

  // Delete blog post
  app.delete("/api/blog/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteBlogPost(id);

      if (!deleted) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      res.json({ message: "Blog post deleted successfully" });
    } catch (error) {
      console.error('Error deleting blog post:', error);
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  // Banner API routes
  app.get("/api/banners", async (req, res) => {
    try {
      const banners = await storage.getBanners();
      res.json(banners);
    } catch (error) {
      console.error('Error fetching banners:', error);
      res.status(500).json({ message: "Failed to fetch banners" });
    }
  });

  app.get("/api/banners/active", async (req, res) => {
    try {
      const banners = await storage.getActiveBanners();
      res.json(banners);
    } catch (error) {
      console.error('Error fetching active banners:', error);
      res.status(500).json({ message: "Failed to fetch active banners" });
    }
  });

  app.post("/api/banners", async (req, res) => {
    try {
      const bannerSchema = z.object({
        imageUrl: z.string().url().min(1, 'Image URL is required'),
        title: z.string().optional(),
        order: z.number().optional()
      });

      const validatedData = bannerSchema.parse(req.body);
      const newBanner = await storage.createBanner(validatedData);
      res.json(newBanner);
    } catch (error) {
      console.error('Error creating banner:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create banner" });
    }
  });

  app.put("/api/banners/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateSchema = z.object({
        imageUrl: z.string().url().optional(),
        title: z.string().optional(),
        order: z.number().optional(),
        isActive: z.boolean().optional()
      });

      const validatedData = updateSchema.parse(req.body);
      const updatedBanner = await storage.updateBanner(id, validatedData);

      if (!updatedBanner) {
        return res.status(404).json({ message: "Banner not found" });
      }

      res.json(updatedBanner);
    } catch (error) {
      console.error('Error updating banner:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      if (error instanceof Error && error.message.includes('Maximum 3 banners')) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to update banner" });
    }
  });

  app.delete("/api/banners/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteBanner(id);

      if (!deleted) {
        return res.status(404).json({ message: "Banner not found" });
      }

      res.json({ message: "Banner deleted successfully" });
    } catch (error) {
      console.error('Error deleting banner:', error);
      res.status(500).json({ message: "Failed to delete banner" });
    }
  });

  // Popup Poster API routes
  app.get("/api/popup-posters", async (req, res) => {
    try {
      const posters = await storage.getPopupPosters();
      res.json(posters);
    } catch (error) {
      console.error('Error fetching popup posters:', error);
      res.status(500).json({ message: "Failed to fetch popup posters" });
    }
  });

  app.get("/api/popup-posters/active", async (req, res) => {
    try {
      const poster = await storage.getActivePopupPoster();
      res.json(poster || null);
    } catch (error) {
      console.error('Error fetching active popup poster:', error);
      res.status(500).json({ message: "Failed to fetch active popup poster" });
    }
  });

  app.post("/api/popup-posters", async (req, res) => {
    try {
      const posterSchema = z.object({
        imageUrl: z.string().url().min(1, 'Image URL is required'),
        title: z.string().optional()
      });

      const validatedData = posterSchema.parse(req.body);
      const newPoster = await storage.createPopupPoster(validatedData);
      res.json(newPoster);
    } catch (error) {
      console.error('Error creating popup poster:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create popup poster" });
    }
  });

  app.put("/api/popup-posters/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateSchema = z.object({
        imageUrl: z.string().url().optional(),
        title: z.string().optional(),
        isActive: z.boolean().optional()
      });

      const validatedData = updateSchema.parse(req.body);
      const updatedPoster = await storage.updatePopupPoster(id, validatedData);

      if (!updatedPoster) {
        return res.status(404).json({ message: "Popup poster not found" });
      }

      res.json(updatedPoster);
    } catch (error) {
      console.error('Error updating popup poster:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update popup poster" });
    }
  });

  app.delete("/api/popup-posters/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deletePopupPoster(id);

      if (!deleted) {
        return res.status(404).json({ message: "Popup poster not found" });
      }

      res.json({ message: "Popup poster deleted successfully" });
    } catch (error) {
      console.error('Error deleting popup poster:', error);
      res.status(500).json({ message: "Failed to delete popup poster" });
    }
  });

  // Coupon API routes
  app.get("/api/coupons", async (req, res) => {
    try {
      const coupons = await Coupon.find({}).sort({ createdAt: -1 });
      console.log(`[API] Fetching ${coupons.length} coupons`);
      
      // Add status field to each coupon based on its state
      const couponsWithStatus = coupons.map(coupon => {
        const couponObj = coupon.toObject();
        const now = new Date();
        
        // Determine status
        let status = 'available';
        
        // Check if expired
        if (now > coupon.validUntil) {
          status = 'expired';
        }
        // Check if usage limit reached (fully used)
        else if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          status = 'used';
        }
        // Check if not yet valid
        else if (now < coupon.validFrom) {
          status = 'pending';
        }
        // Check if inactive
        else if (!coupon.isActive) {
          status = 'inactive';
        }
        
        console.log(`[API] Coupon ${coupon.code}: status=${status}, usedCount=${coupon.usedCount}, usageLimit=${coupon.usageLimit}, isActive=${coupon.isActive}`);
        
        return {
          ...couponObj,
          status
        };
      });
      
      console.log(`[API] Returning ${couponsWithStatus.length} coupons with status`);
      res.json(couponsWithStatus);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      res.status(500).json({ message: "Failed to fetch coupons" });
    }
  });

  app.get("/api/coupons/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const coupon = await Coupon.findById(id);

      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }

      res.json(coupon);
    } catch (error) {
      console.error('Error fetching coupon:', error);
      res.status(500).json({ message: "Failed to fetch coupon" });
    }
  });

  app.post("/api/coupons", async (req, res) => {
    try {
      console.log('📥 Creating coupon with data:', JSON.stringify(req.body, null, 2));
      
      const couponSchema = z.object({
        code: z.string().min(1).toUpperCase(),
        description: z.string().optional(),
        discountType: z.enum(['percentage', 'fixed', 'free_delivery']),
        discountValue: z.number().min(0),
        minOrderAmount: z.number().min(0).optional(),
        maxDiscountAmount: z.number().min(0).optional(),
        usageLimit: z.number().min(1).optional(),
        validFrom: z.string().datetime(),
        validUntil: z.string().datetime(),
        isActive: z.boolean().optional()
      });

      console.log('🔍 Validating coupon data...');
      const validatedData = couponSchema.parse(req.body);
      console.log('✅ Validation passed:', validatedData);

      // Check if coupon code already exists
      const existingCoupon = await Coupon.findOne({ code: validatedData.code });
      if (existingCoupon) {
        return res.status(400).json({ message: "Coupon code already exists" });
      }

      // Validate dates
      const validFrom = new Date(validatedData.validFrom);
      const validUntil = new Date(validatedData.validUntil);

      if (validUntil <= validFrom) {
        return res.status(400).json({ message: "Valid until date must be after valid from date" });
      }

      const newCoupon = new Coupon({
        ...validatedData,
        validFrom,
        validUntil,
        usedCount: 0,
        isActive: validatedData.isActive !== false
      });

      await newCoupon.save();
      res.status(201).json(newCoupon);
    } catch (error) {
      console.error('Error creating coupon:', error);
      if (error instanceof z.ZodError) {
        console.error('Zod validation errors:', error.errors);
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      if (error instanceof Error) {
        console.error('Error details:', error.message, error.stack);
        return res.status(500).json({ message: "Failed to create coupon", error: error.message });
      }
      res.status(500).json({ message: "Failed to create coupon" });
    }
  });

  app.put("/api/coupons/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const updateSchema = z.object({
        code: z.string().min(1).toUpperCase().optional(),
        description: z.string().optional(),
        discountType: z.enum(['percentage', 'fixed']).optional(),
        discountValue: z.number().min(0.01).optional(),
        minOrderAmount: z.number().min(0).optional(),
        maxDiscountAmount: z.number().min(0).optional(),
        usageLimit: z.number().min(1).optional(),
        validFrom: z.string().datetime().optional(),
        validUntil: z.string().datetime().optional(),
        isActive: z.boolean().optional()
      });

      const validatedData = updateSchema.parse(req.body);

      // If updating code, check for duplicates
      if (validatedData.code) {
        const existingCoupon = await Coupon.findOne({ 
          code: validatedData.code, 
          _id: { $ne: id } 
        });
        if (existingCoupon) {
          return res.status(400).json({ message: "Coupon code already exists" });
        }
      }

      // Validate dates if both are provided
      if (validatedData.validFrom && validatedData.validUntil) {
        const validFrom = new Date(validatedData.validFrom);
        const validUntil = new Date(validatedData.validUntil);

        if (validUntil <= validFrom) {
          return res.status(400).json({ message: "Valid until date must be after valid from date" });
        }
      }

      // Convert date strings to Date objects if provided
      const updateData: any = { ...validatedData };
      if (validatedData.validFrom) {
        updateData.validFrom = new Date(validatedData.validFrom);
      }
      if (validatedData.validUntil) {
        updateData.validUntil = new Date(validatedData.validUntil);
      }

      const updatedCoupon = await Coupon.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );

      if (!updatedCoupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }

      res.json(updatedCoupon);
    } catch (error) {
      console.error('Error updating coupon:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update coupon" });
    }
  });

  app.delete("/api/coupons/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deletedCoupon = await Coupon.findByIdAndDelete(id);

      if (!deletedCoupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }

      res.json({ message: "Coupon deleted successfully" });
    } catch (error) {
      console.error('Error deleting coupon:', error);
      res.status(500).json({ message: "Failed to delete coupon" });
    }
  });

  // Validate coupon endpoint (for frontend use)
  app.post("/api/coupons/validate", async (req, res) => {
    try {
      const { code, orderAmount } = req.body;

      if (!code) {
        return res.status(400).json({ message: "Coupon code is required" });
      }

      const coupon = await Coupon.findOne({ 
        code: code.toUpperCase(),
        isActive: true
      });

      if (!coupon) {
        return res.status(404).json({ message: "Invalid coupon code" });
      }

      const now = new Date();
      if (now < coupon.validFrom || now > coupon.validUntil) {
        return res.status(400).json({ message: "Coupon has expired or is not yet valid" });
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({ message: "Coupon usage limit reached" });
      }

      if (coupon.minOrderAmount && orderAmount < coupon.minOrderAmount) {
        return res.status(400).json({ 
          message: `Minimum order amount of $${coupon.minOrderAmount} required` 
        });
      }

      // Calculate discount
      let discountAmount = 0;
      if (coupon.discountType === 'percentage') {
        discountAmount = Math.round((orderAmount * coupon.discountValue) / 100);
        if (coupon.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
        }
      } else {
        discountAmount = coupon.discountValue;
      }

      res.json({
        valid: true,
        coupon: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountAmount
        }
      });
    } catch (error) {
      console.error('Error validating coupon:', error);
      res.status(500).json({ message: "Failed to validate coupon" });
    }
  });

  // ===== PAYMENT ENDPOINTS (RupantorPay Integration) =====

  // Debug endpoint to check API configuration
  app.get("/api/payments/debug", async (req, res) => {
    try {
      const hasApiKey = !!process.env.RUPANTORPAY_API_KEY;
      const apiKeyLength = process.env.RUPANTORPAY_API_KEY?.length || 0;

      res.json({
        hasApiKey,
        apiKeyLength,
        environment: process.env.NODE_ENV || 'development',
        host: req.get('host'),
        protocol: req.get('x-forwarded-proto') || 'http'
      });
    } catch (error) {
      res.status(500).json({ error: 'Debug endpoint failed' });
    }
  });

  // Test RupantorPay API endpoint
  app.post("/api/payments/test", async (req, res) => {
    try {
      const apiKey = process.env.RUPANTORPAY_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "API key not configured" });
      }

      const host = req.get('host') || 'localhost:5000';
      const protocol = req.get('x-forwarded-proto') || (host.includes('replit.dev') ? 'https' : 'http');
      const baseUrl = `${protocol}://${host}`;

      const testData = {
        fullname: "Test User",
        email: "test@example.com",
        amount: 10,
        success_url: `${baseUrl}/payment/success`,
        cancel_url: `${baseUrl}/payment/cancel`,
        webhook_url: `${baseUrl}/api/payments/webhook`,
        metadata: JSON.stringify({ test: true })
      };

      console.log('Testing RupantorPay API with:', testData);

      const response = await fetch('https://payment.rupantorpay.com/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey,
          'X-CLIENT': host,
          'Accept': 'application/json'
        },
        body: JSON.stringify(testData)
      });

      const data = await response.json();

      res.json({
        httpStatus: response.status,
        responseData: data,
        success: response.ok && (data.payment_url || data.checkout_url)
      });

    } catch (error) {
      console.error('RupantorPay test error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Test failed' 
      });
    }
  });

  // Payment Schemas
  const createPaymentSchema = z.object({
    orderId: z.string().min(1, "Order ID is required"),
    amount: z.number().min(0.1, "Amount must be greater than 0"),
    customerInfo: z.object({
      fullname: z.string().min(1, "Customer name is required"),
      email: z.string().email("Valid email is required"),
      phone: z.string().optional(),
    }),
    metadata: z.any().optional(),
  });

  const verifyPaymentSchema = z.object({
    transactionId: z.string().min(1, "Transaction ID is required"),
  });

  // Create Payment (Initialize payment with RupantorPay)
  app.post("/api/payments/create", async (req, res) => {
    try {
      console.log('Payment creation request received:', req.body);

      const result = createPaymentSchema.safeParse(req.body);
      if (!result.success) {
        console.error('Validation failed:', result.error.flatten().fieldErrors);
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten().fieldErrors
        });
      }

      const { orderId, amount, customerInfo, metadata } = result.data;
      console.log('Processing payment for order:', orderId, 'Amount:', amount);

      // Check if payment already exists for this order
      const existingPayment = await PaymentTransaction.findOne({ orderId });
      if (existingPayment && existingPayment.status === 'pending') {
        console.log('Existing payment found, returning existing URL');
        return res.json({
          success: true,
          message: "Payment already initialized",
          paymentUrl: existingPayment.paymentUrl,
          orderId: orderId
        });
      }

      // Validate API key
      const apiKey = process.env.RUPANTORPAY_API_KEY;
      if (!apiKey || apiKey.trim() === '') {
        console.error('RupantorPay API key not configured');
        return res.status(500).json({
          message: "Payment gateway not configured",
          error: "API key missing"
        });
      }

      console.log('API Key configured:', !!apiKey, 'Length:', apiKey.length);

      // Get domain for URLs
      const host = req.get('host') || 'localhost:5000';
      const protocol = req.get('x-forwarded-proto') || (host.includes('replit.dev') ? 'https' : 'http');
      const baseUrl = `${protocol}://${host}`;

      console.log('Using base URL:', baseUrl);

      // Prepare RupantorPay request according to documentation
      const paymentData = {
        fullname: customerInfo.fullname.trim(),
        email: customerInfo.email.trim(),
        amount: Math.round(amount), // Keep as number, not string
        success_url: `${baseUrl}/payment/success`,
        cancel_url: `${baseUrl}/payment/cancel`,
        webhook_url: `${baseUrl}/api/payments/webhook`,
        metadata: {
          orderId,
          customerPhone: customerInfo.phone || '',
          ...metadata
        }
      };

      console.log('Sending payment request to RupantorPay:', {
        ...paymentData,
        apiKeyPresent: !!apiKey,
        host: host
      });

      // Make request to RupantorPay with proper error handling
      const rupantorPayResponse = await fetch('https://payment.rupantorpay.com/api/payment/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey,
          'X-CLIENT': host,
          'Accept': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      console.log('RupantorPay response status:', rupantorPayResponse.status);

      let responseData;
      try {
        responseData = await rupantorPayResponse.json();
        console.log('RupantorPay response data:', responseData);
      } catch (parseError) {
        console.error('Failed to parse RupantorPay response:', parseError);
        const responseText = await rupantorPayResponse.text();
        console.error('Raw response:', responseText);

        return res.status(500).json({
          message: "Payment gateway error",
          error: "Invalid response from payment provider"
        });
      }

      // Check if response indicates success
      if (!rupantorPayResponse.ok) {
        console.error('RupantorPay API HTTP error:', rupantorPayResponse.status, responseData);
        return res.status(400).json({
          message: "Payment initialization failed",
          error: responseData?.message || responseData?.error || "Payment gateway rejected the request"
        });
      }

      // Check if RupantorPay returned error status
      if (responseData && (responseData.status === false || responseData.error)) {
        console.error('RupantorPay API business error:', responseData);
        return res.status(400).json({
          message: "Payment initialization failed",
          error: responseData.message || responseData.error || "Payment gateway error"
        });
      }

      // Validate required response fields - check for both payment_url and checkout_url
      if (!responseData || (!responseData.payment_url && !responseData.checkout_url)) {
        console.error('Missing payment URL in response:', responseData);
        return res.status(500).json({
          message: "Payment initialization failed",
          error: "Payment URL not provided by gateway",
          debug: responseData
        });
      }

      // Use payment_url or checkout_url whichever is available
      const paymentUrl = responseData.payment_url || responseData.checkout_url;

      // Save payment transaction to database
      const paymentTransaction = new PaymentTransaction({
        orderId,
        paymentUrl: paymentUrl,
        transactionId: responseData.transaction_id || undefined, // Use undefined instead of null
        amount,
        currency: 'BDT',
        customerInfo,
        status: 'pending',
        metadata,
        successUrl: paymentData.success_url,
        cancelUrl: paymentData.cancel_url,
        webhookUrl: paymentData.webhook_url,
        gatewayResponse: responseData
      });

      await paymentTransaction.save();
      console.log('Payment transaction saved with ID:', paymentTransaction._id);

      res.json({
        success: true,
        message: "Payment initialized successfully",
        paymentUrl: paymentUrl,
        orderId: orderId,
        transactionId: responseData.transaction_id || null
      });

    } catch (error) {
      console.error('Payment creation error:', error);

      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return res.status(500).json({ 
          message: "Unable to connect to payment gateway",
          error: "Network connection failed"
        });
      }

      if (error instanceof SyntaxError) {
        return res.status(500).json({ 
          message: "Invalid response from payment gateway",
          error: "Response parsing failed"
        });
      }

      res.status(500).json({ 
        message: "Failed to initialize payment",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Verify Payment Status
  app.post("/api/payments/verify", async (req, res) => {
    try {
      const result = verifyPaymentSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: result.error.flatten().fieldErrors
        });
      }

      const { transactionId } = result.data;

      // Make verification request to RupantorPay
      const verificationResponse = await fetch('https://payment.rupantorpay.com/api/payment/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.RUPANTORPAY_API_KEY!,
        },
        body: JSON.stringify({ transaction_id: transactionId }),
      });

      const verificationData = await verificationResponse.json();

      if (!verificationData.status) {
        return res.status(400).json({
          message: "Payment verification failed",
          error: verificationData.message
        });
      }

      // Update payment transaction in database
      const paymentTransaction = await PaymentTransaction.findOne({ transactionId });
      if (paymentTransaction) {
        paymentTransaction.status = verificationData.payment_status === 'COMPLETED' ? 'completed' : 'failed';
        paymentTransaction.verifiedAt = new Date();
        paymentTransaction.callbackData = verificationData;
        await paymentTransaction.save();
      }

      res.json({
        success: true,
        transactionId,
        status: verificationData.payment_status,
        amount: verificationData.amount,
        paymentMethod: verificationData.payment_method
      });

    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({ 
        message: "Failed to verify payment",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Payment Webhook (for real-time payment status updates)
  app.post("/api/payments/webhook", async (req, res) => {
    try {
      const webhookData = req.body;

      // Log webhook for debugging
      const webhook = new PaymentWebhook({
        transactionId: webhookData.transactionId || 'unknown',
        paymentStatus: webhookData.status || 'unknown',
        rawData: webhookData,
        processed: false,
      });

      try {
        await webhook.save();

        // Process the webhook
        if (webhookData.transactionId) {
          const paymentTransaction = await PaymentTransaction.findOne({ 
            transactionId: webhookData.transactionId 
          });

          if (paymentTransaction) {
            paymentTransaction.status = webhookData.status === 'COMPLETED' ? 'completed' : 
                                      webhookData.status === 'FAILED' ? 'failed' : 
                                      'processing';
            paymentTransaction.paymentMethod = webhookData.paymentMethod;
            paymentTransaction.paymentFee = webhookData.paymentFee;
            paymentTransaction.callbackData = webhookData;

            if (webhookData.status === 'COMPLETED') {
              paymentTransaction.verifiedAt = new Date();
            }

            await paymentTransaction.save();

            // Update order status if payment is completed
            if (webhookData.status === 'COMPLETED') {
              await Order.findOneAndUpdate(
                { _id: paymentTransaction.orderId },
                { 
                  status: 'confirmed',
                  paymentMethod: webhookData.paymentMethod || 'rupantorpay'
                }
              );
            }
          }

          webhook.processed = true;
          await webhook.save();
        }

      } catch (processingError) {
        webhook.errorMessage = processingError instanceof Error ? processingError.message : 'Unknown error';
        await webhook.save();
        console.error('Webhook processing error:', processingError);
      }

      // Always respond with 200 to acknowledge receipt
      res.status(200).json({ received: true });

    } catch (error) {
      console.error('Webhook error:', error);
      res.status(200).json({ received: true }); // Still acknowledge to avoid retries
    }
  });

  // Get Payment Status by Order ID
  app.get("/api/payments/status/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;

      const paymentTransaction = await PaymentTransaction.findOne({ orderId });
      if (!paymentTransaction) {
        return res.status(404).json({ message: "Payment not found" });
      }

      res.json({
        orderId: paymentTransaction.orderId,
        transactionId: paymentTransaction.transactionId,
        status: paymentTransaction.status,
        amount: paymentTransaction.amount,
        currency: paymentTransaction.currency,
        paymentMethod: paymentTransaction.paymentMethod,
        createdAt: paymentTransaction.createdAt,
        verifiedAt: paymentTransaction.verifiedAt,
      });

    } catch (error) {
      console.error('Payment status error:', error);
      res.status(500).json({ message: "Failed to get payment status" });
    }
  });

  // Handle Payment Success/Cancel callbacks (for frontend redirects)
  app.get("/api/payment/success", async (req, res) => {
    const { transactionId, paymentMethod, paymentAmount, status } = req.query;

    console.log('Payment success callback received:', req.query);

    if (transactionId && status === 'COMPLETED') {
      // Update payment status
      try {
        const paymentTransaction = await PaymentTransaction.findOne({ transactionId });
        if (paymentTransaction) {
          console.log('Updating payment transaction:', paymentTransaction.orderId);

          paymentTransaction.status = 'completed';
          paymentTransaction.transactionId = transactionId as string;
          paymentTransaction.paymentMethod = paymentMethod as string;
          paymentTransaction.verifiedAt = new Date();
          paymentTransaction.callbackData = req.query;
          await paymentTransaction.save();

          // Update order status to confirmed and payment status to paid
          const updatedOrder = await Order.findOneAndUpdate(
            { _id: paymentTransaction.orderId },
            { 
              status: 'confirmed',
              paymentStatus: 'Paid',
              paymentMethod: paymentMethod as string || 'rupantorpay'
            },
            { new: true }
          );

          // Also update the invoice payment status
          await Invoice.findOneAndUpdate(
            { orderId: paymentTransaction.orderId },
            { 
              paymentStatus: 'Paid',
              paymentMethod: paymentMethod as string || 'rupantorpay'
            }
          );

          console.log('Payment and order updated successfully for order:', paymentTransaction.orderId);
        }
      } catch (error) {
        console.error('Payment success callback error:', error);
      }
    }

    // Redirect to dedicated payment success page
    res.redirect(`/payment-success?transactionId=${transactionId}&amount=${paymentAmount}&status=COMPLETED`);
  });

  app.get("/api/payment/cancel", async (req, res) => {
    const { transactionId } = req.query;

    if (transactionId) {
      try {
        await PaymentTransaction.findOneAndUpdate(
          { transactionId },
          { 
            status: 'cancelled',
            callbackData: req.query 
          }
        );
      } catch (error) {
        console.error('Payment cancel callback error:', error);
      }
    }

    // Redirect to frontend cancel page
    res.redirect(`/?payment=cancelled&transactionId=${transactionId}`);
  });

  // Backward compatibility for payment callbacks
  // Third-party providers might still be configured to use the old URLs
  app.get("/payment/success", (req, res) => {
    // Redirect to the API endpoint for actual processing
    const queryString = new URLSearchParams(req.query as any).toString()
    res.redirect(`/api/payment/success${queryString ? '?' + queryString : ''}`)
  })

  app.get("/payment/cancel", (req, res) => {
    // Redirect to the API endpoint for actual processing
    const queryString = new URLSearchParams(req.query as any).toString()
    res.redirect(`/api/payment/cancel${queryString ? '?' + queryString : ''}`)
  })

  // Register wallet routes
  registerWalletRoutes(app);

  // AI Chat Routes
  const { chatWithAI, getRecommendedProducts, searchProducts } = await import('./ai-chat-service');

  // AI Chat API
  app.post('/api/ai-chat', async (req, res) => {
    try {
      const { message, conversationHistory } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Please provide a valid message' });
      }

      const response = await chatWithAI({
        message,
        conversationHistory: conversationHistory || []
      });

      res.json(response);
    } catch (error) {
      console.error('AI聊天错误:', error);
      res.status(500).json({ 
        error: '抱歉，AI服务暂时不可用。请稍后再试或联系人工客服。',
        fallback: true 
      });
    }
  });

  // 获取推荐产品
  app.get('/api/ai-chat/recommended-products', async (req, res) => {
    try {
      const { category, limit } = req.query;
      const products = await getRecommendedProducts(
        category as string,
        limit ? parseInt(limit as string) : 5
      );
      res.json({ products });
    } catch (error) {
      console.error('获取推荐产品错误:', error);
      res.status(500).json({ error: '无法获取推荐产品' });
    }
  });

  // 智能产品搜索
  app.get('/api/ai-chat/search-products', async (req, res) => {
    try {
      const { q, limit } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: '请提供搜索关键词' });
      }

      const products = await searchProducts(
        q,
        limit ? parseInt(limit as string) : 10
      );
      
      res.json({ products, query: q });
    } catch (error) {
      console.error('产品搜索错误:', error);
      res.status(500).json({ error: '搜索失败' });
    }
  });

  // Chat History Routes

  // 获取或创建会话ID
  app.post('/api/chat/session', async (req, res) => {
    try {
      const { userId, sessionId } = req.body;
      
      let conversation = null;
      
      // 如果提供了 sessionId，尝试查找现有会话
      if (sessionId) {
        conversation = await ChatConversation.findOne({ sessionId });
      }
      
      // 如果提供了 userId 且没有找到会话，尝试通过 userId 查找（最近24小时内的）
      if (!conversation && userId) {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        conversation = await ChatConversation.findOne({
          userId,
          lastMessageAt: { $gte: oneDayAgo }
        }).sort({ lastMessageAt: -1 });
      }

      // 如果没有找到，创建新会话
      if (!conversation) {
        const newSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        conversation = await ChatConversation.create({
          userId: userId || undefined,
          sessionId: newSessionId,
          lastMessageAt: new Date(),
          messageCount: 0
        });
      }

      res.json({ 
        sessionId: conversation.sessionId,
        conversationId: conversation._id.toString()
      });
    } catch (error) {
      console.error('创建会话错误:', error);
      res.status(500).json({ error: '无法创建会话' });
    }
  });

  // 保存聊天消息
  app.post('/api/chat/messages', async (req, res) => {
    try {
      const { conversationId, sessionId, userId, text, sender, status, products } = req.body;

      if (!conversationId || !text || !sender) {
        return res.status(400).json({ error: '缺少必要参数' });
      }

      const message = await ChatMessage.create({
        conversationId,
        sessionId,
        userId: userId || undefined,
        text,
        sender,
        status: status || 'sent',
        products: products || [],
        timestamp: new Date()
      });

      // 更新会话信息
      await ChatConversation.findByIdAndUpdate(conversationId, {
        lastMessageAt: new Date(),
        $inc: { messageCount: 1 }
      });

      res.json({ success: true, messageId: message._id.toString() });
    } catch (error) {
      console.error('保存消息错误:', error);
      res.status(500).json({ error: '无法保存消息' });
    }
  });

  // 加载聊天历史
  app.get('/api/chat/messages', async (req, res) => {
    try {
      const { sessionId, userId, conversationId } = req.query;

      let query: any = {};
      
      if (conversationId) {
        query.conversationId = conversationId;
      } else if (sessionId) {
        // 通过 sessionId 查找会话
        const conversation = await ChatConversation.findOne({ sessionId });
        if (conversation) {
          query.conversationId = conversation._id.toString();
        } else {
          return res.json({ messages: [] });
        }
      } else if (userId) {
        // 通过 userId 查找最近的会话
        const conversation = await ChatConversation.findOne({ userId })
          .sort({ lastMessageAt: -1 });
        if (conversation) {
          query.conversationId = conversation._id.toString();
        } else {
          return res.json({ messages: [] });
        }
      } else {
        return res.status(400).json({ error: '请提供 sessionId、userId 或 conversationId' });
      }

      const messages = await ChatMessage.find(query)
        .sort({ timestamp: 1 })
        .lean();

      res.json({ messages });
    } catch (error) {
      console.error('加载消息错误:', error);
      res.status(500).json({ error: '无法加载消息' });
    }
  });

  // 清除聊天历史
  app.delete('/api/chat/messages', async (req, res) => {
    try {
      const { sessionId, userId, conversationId } = req.query;

      let query: any = {};
      
      if (conversationId) {
        query.conversationId = conversationId;
      } else if (sessionId) {
        // 通过 sessionId 查找会话
        const conversation = await ChatConversation.findOne({ sessionId });
        if (conversation) {
          query.conversationId = conversation._id.toString();
        } else {
          return res.json({ success: true, deletedCount: 0 });
        }
      } else if (userId) {
        // 通过 userId 查找最近的会话
        const conversation = await ChatConversation.findOne({ userId })
          .sort({ lastMessageAt: -1 });
        if (conversation) {
          query.conversationId = conversation._id.toString();
        } else {
          return res.json({ success: true, deletedCount: 0 });
        }
      } else {
        return res.status(400).json({ error: '请提供 sessionId、userId 或 conversationId' });
      }

      // 删除所有相关消息
      const deleteResult = await ChatMessage.deleteMany(query);

      // 更新会话信息
      if (conversationId) {
        await ChatConversation.findByIdAndUpdate(conversationId, {
          lastMessageAt: new Date(),
          messageCount: 0
        });
      } else if (sessionId) {
        const conversation = await ChatConversation.findOne({ sessionId });
        if (conversation) {
          await ChatConversation.findByIdAndUpdate(conversation._id, {
            lastMessageAt: new Date(),
            messageCount: 0
          });
        }
      } else if (userId) {
        const conversation = await ChatConversation.findOne({ userId })
          .sort({ lastMessageAt: -1 });
        if (conversation) {
          await ChatConversation.findByIdAndUpdate(conversation._id, {
            lastMessageAt: new Date(),
            messageCount: 0
          });
        }
      }

      res.json({ 
        success: true, 
        deletedCount: deleteResult.deletedCount 
      });
    } catch (error) {
      console.error('清除消息错误:', error);
      res.status(500).json({ error: '无法清除消息' });
    }
  });

  const server = createServer(app);
  return server;
}