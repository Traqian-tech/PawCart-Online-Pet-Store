import mongoose, { Schema, Document } from 'mongoose';

// User Schema
export interface IUser extends Document {
  username: string;
  password: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: any;
  profilePicture?: string;
  role: string;
  isActive: boolean;
  membership?: {
    tier: 'Silver Paw' | 'Golden Paw' | 'Diamond Paw';
    startDate: Date;
    expiryDate: Date;
    autoRenew: boolean;
    statistics?: {
      totalSaved: number; // Total money saved through membership discounts
      exclusiveProductsPurchased: number; // Count of exclusive products purchased
      lastRenewDate?: Date; // Last time membership was renewed
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  firstName: String,
  lastName: String,
  phone: String,
  address: Schema.Types.Mixed,
  profilePicture: String,
  role: { type: String, default: 'user' },
  isActive: { type: Boolean, default: true },
  membership: {
    tier: { type: String, enum: ['Silver Paw', 'Golden Paw', 'Diamond Paw'] },
    startDate: Date,
    expiryDate: Date,
    autoRenew: { type: Boolean, default: false },
    statistics: {
      totalSaved: { type: Number, default: 0 },
      exclusiveProductsPurchased: { type: Number, default: 0 },
      lastRenewDate: Date
    }
  },
}, { timestamps: true });

// Category Schema
export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  image: String,
  parentId: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Brand Schema
export interface IBrand extends Document {
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const brandSchema = new Schema<IBrand>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  logo: String,
  description: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Product Schema
export interface IProduct extends Document {
  name: string;
  slug: string;
  description?: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  brandId: string;
  image: string;
  images?: string[];
  rating: number;
  reviews: number;
  stockStatus: string;
  stockQuantity: number;
  subcategory?: string;
  tags?: string[];
  features?: string[];
  specifications?: any;
  isNew: boolean;
  isBestseller: boolean;
  isOnSale: boolean;
  discount: number;
  isActive: boolean;
  isMemberExclusive?: boolean; // Member-only product flag
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  price: { type: Number, required: true },
  originalPrice: Number,
  categoryId: { type: String, required: true },
  brandId: { type: String, required: true },
  image: { type: String, required: true },
  images: [String],
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  stockStatus: { type: String, default: 'In Stock' },
  stockQuantity: { type: Number, default: 0 },
  subcategory: { type: String, default: '' },
  tags: [String],
  features: [String],
  specifications: Schema.Types.Mixed,
  isNew: { type: Boolean, default: false },
  isBestseller: { type: Boolean, default: false },
  isOnSale: { type: Boolean, default: false },
  discount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isMemberExclusive: { type: Boolean, default: false },
}, { 
  timestamps: true,
  suppressReservedKeysWarning: true 
});

// Blog Post Schema
export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image?: string;
  author: string;
  publishedAt?: Date;
  category?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const blogPostSchema = new Schema<IBlogPost>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: String,
  content: { type: String, required: true },
  image: String,
  author: { type: String, required: true },
  publishedAt: Date,
  category: String,
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

// Order Schema
export interface IOrder extends Document {
  userId: string;
  status: string;
  subtotal: number; // Subtotal before discounts and shipping
  discount?: number; // Coupon discount amount
  discountCode?: string; // Coupon code used
  total: number;
  items: any[];
  shippingAddress?: any;
  customerInfo?: any;
  invoiceId?: string;
  invoiceNumber?: string; // Added invoiceNumber field
  shippingFee?: number;
  freeDeliveryCode?: string;
  paymentMethod?: string;
  paymentStatus: string;
  orderNotes?: string;
  membershipDiscount?: number; // Discount applied due to membership
  membershipTier?: string; // Membership tier at time of purchase
  memberExclusiveItemsCount?: number; // Count of member-exclusive items in order
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>({
  userId: { type: String, required: true },
  status: { type: String, default: 'Processing' },
  subtotal: { type: Number, required: true }, // Subtotal before discounts and shipping
  discount: { type: Number, default: 0 }, // Coupon discount amount
  discountCode: { type: String }, // Coupon code used
  total: { type: Number, required: true },
  items: [{ type: Schema.Types.Mixed }],
  shippingAddress: Schema.Types.Mixed,
  customerInfo: Schema.Types.Mixed,
  invoiceId: String,
  invoiceNumber: { type: String }, // Add invoice number field
  shippingFee: { type: Number, default: 0 },
  freeDeliveryCode: { type: String },
  paymentMethod: String,
  paymentStatus: { type: String, default: 'Pending' },
  orderNotes: { type: String },
  membershipDiscount: { type: Number, default: 0 },
  membershipTier: { type: String },
  memberExclusiveItemsCount: { type: Number, default: 0 },
}, { timestamps: true });

// Request Schema
export interface IRequest extends Document {
  userId: string;
  type: 'product_inquiry' | 'return_refund' | 'custom_order' | 'complaint' | 'other';
  subject: string;
  description: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  orderId?: string;
  attachments?: string[];
  response?: string;
  createdAt: Date;
  updatedAt: Date;
}

const requestSchema = new Schema<IRequest>({
  userId: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['product_inquiry', 'return_refund', 'custom_order', 'complaint', 'other']
  },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  status: { 
    type: String, 
    default: 'pending',
    enum: ['pending', 'in_progress', 'resolved', 'closed']
  },
  priority: {
    type: String,
    default: 'medium',
    enum: ['low', 'medium', 'high']
  },
  orderId: { type: String },
  attachments: [{ type: String }],
  response: { type: String },
}, { timestamps: true });

// Announcement Schema
export interface IAnnouncement extends Document {
  text: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>({
  text: { type: String, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Cart Item Schema
export interface ICartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

// Cart Schema
export interface ICart extends Document {
  userId?: string;
  sessionId?: string;
  items: ICartItem[];
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

const cartSchema = new Schema<ICart>({
  userId: String,
  sessionId: String,
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    image: { type: String, required: true }
  }],
  total: { type: Number, default: 0 }
}, { timestamps: true });

// Invoice Schema
export interface IInvoice extends Document {
  invoiceNumber: string;
  orderId: string;
  userId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address?: any;
  };
  items: ICartItem[];
  subtotal: number;
  discount?: number;
  discountCode?: string;
  membershipDiscount?: number; // Membership discount applied
  membershipTier?: string; // Membership tier at time of purchase
  shippingFee?: number;
  freeDeliveryCode?: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceSchema = new Schema<IInvoice>({
  invoiceNumber: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  userId: { type: String, required: true },
  customerInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: Schema.Types.Mixed
  },
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, required: true }
  }],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  discountCode: { type: String },
  membershipDiscount: { type: Number, default: 0 },
  membershipTier: { type: String },
  shippingFee: { type: Number, default: 0 },
  freeDeliveryCode: { type: String },
  total: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, default: 'Pending' },
  orderDate: { type: Date, default: Date.now }
}, { timestamps: true });

// Coupon Schema
export interface ICoupon extends Document {
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed' | 'free_delivery';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>({
  code: { type: String, required: true, unique: true, uppercase: true },
  description: String,
  discountType: { type: String, enum: ['percentage', 'fixed', 'free_delivery'], required: true },
  discountValue: { type: Number, required: true, min: 0 },
  minOrderAmount: { type: Number, min: 0 },
  maxDiscountAmount: { type: Number, min: 0 },
  usageLimit: { type: Number, min: 1 },
  usedCount: { type: Number, default: 0 },
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Payment Transaction Schema (for RupantorPay integration)
export interface IPaymentTransaction extends Document {
  orderId: string;
  transactionId?: string; // RupantorPay transaction ID
  paymentUrl?: string; // Generated payment URL from RupantorPay
  amount: number;
  currency: string;
  customerInfo: {
    fullname: string;
    email: string;
    phone?: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  paymentMethod?: string; // Received from RupantorPay callback
  paymentFee?: number; // Transaction fee
  metadata?: any; // Additional data
  successUrl: string;
  cancelUrl: string;
  webhookUrl?: string;
  verifiedAt?: Date;
  callbackData?: any; // Data received from RupantorPay callback
  createdAt: Date;
  updatedAt: Date;
}

const paymentTransactionSchema = new Schema<IPaymentTransaction>({
  orderId: { type: String, required: true, unique: true },
  transactionId: { type: String, sparse: true },
  paymentUrl: String,
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'BDT' },
  customerInfo: {
    fullname: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
  },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'], 
    default: 'pending' 
  },
  paymentMethod: String,
  paymentFee: { type: Number, min: 0 },
  metadata: Schema.Types.Mixed,
  successUrl: { type: String, required: true },
  cancelUrl: { type: String, required: true },
  webhookUrl: String,
  verifiedAt: Date,
  callbackData: Schema.Types.Mixed,
}, { timestamps: true });

// Payment Webhook Log Schema (for debugging and audit)
export interface IPaymentWebhook extends Document {
  transactionId: string;
  paymentStatus: string;
  rawData: any; // Complete webhook payload
  processed: boolean;
  errorMessage?: string;
  createdAt: Date;
}

const paymentWebhookSchema = new Schema<IPaymentWebhook>({
  transactionId: { type: String, required: true },
  paymentStatus: { type: String, required: true },
  rawData: { type: Schema.Types.Mixed, required: true },
  processed: { type: Boolean, default: false },
  errorMessage: String,
}, { timestamps: true });

// Banner Schema (Home Screen Banners)
export interface IBanner extends Document {
  imageUrl: string;
  title?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBanner>({
  imageUrl: { type: String, required: true },
  title: String,
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Popup Poster Schema
export interface IPopupPoster extends Document {
  imageUrl: string;
  title?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const popupPosterSchema = new Schema<IPopupPoster>({
  imageUrl: { type: String, required: true },
  title: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Address Schema
export interface IAddress extends Document {
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region?: string;
  province?: string;
  postCode: string;
  country: string;
  isDefault: boolean;
  label?: string; // e.g., "Home", "Work", "Other"
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>({
  userId: { type: String, required: true },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  region: { type: String },
  province: { type: String },
  postCode: { type: String, required: true },
  country: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
  label: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' },
}, { timestamps: true });

// Export Models
export const User = mongoose.model<IUser>('User', userSchema);
export const Category = mongoose.model<ICategory>('Category', categorySchema);
export const Brand = mongoose.model<IBrand>('Brand', brandSchema);
export const Product = mongoose.model<IProduct>('Product', productSchema);
export const BlogPost = mongoose.model<IBlogPost>('BlogPost', blogPostSchema);
export const Order = mongoose.model<IOrder>('Order', orderSchema);
export const Request = mongoose.model<IRequest>('Request', requestSchema);
export const Announcement = mongoose.model<IAnnouncement>('Announcement', announcementSchema);
export const Cart = mongoose.model<ICart>('Cart', cartSchema);
export const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);
export const Coupon = mongoose.model<ICoupon>('Coupon', couponSchema);
export const PaymentTransaction = mongoose.model<IPaymentTransaction>('PaymentTransaction', paymentTransactionSchema);
export const PaymentWebhook = mongoose.model<IPaymentWebhook>('PaymentWebhook', paymentWebhookSchema);
export const Banner = mongoose.model<IBanner>('Banner', bannerSchema);
export const PopupPoster = mongoose.model<IPopupPoster>('PopupPoster', popupPosterSchema);
export const Address = mongoose.model<IAddress>('Address', addressSchema);

// Wallet Schema
export interface IWallet extends Document {
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  frozenBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

const walletSchema = new Schema<IWallet>({
  userId: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  frozenBalance: { type: Number, default: 0 },
}, { timestamps: true });

// Wallet Transaction Schema
export interface IWalletTransaction extends Document {
  walletId: string;
  userId: string;
  type: 'EARN' | 'SPEND' | 'REFUND' | 'FREEZE' | 'UNFREEZE';
  source: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  metadata?: any;
  createdAt: Date;
}

const walletTransactionSchema = new Schema<IWalletTransaction>({
  walletId: { type: String, required: true },
  userId: { type: String, required: true },
  type: { type: String, required: true, enum: ['EARN', 'SPEND', 'REFUND', 'FREEZE', 'UNFREEZE'] },
  source: { type: String, required: true },
  amount: { type: Number, required: true },
  balanceBefore: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  description: String,
  metadata: Schema.Types.Mixed,
}, { timestamps: true });

// Game Record Schema
export interface IGameRecord extends Document {
  userId: string;
  gameType: 'FEED_PET' | 'MATCH_THREE' | 'LUCKY_WHEEL' | 'QUIZ';
  score: number;
  reward: number;
  metadata?: any;
  playedAt: Date;
}

const gameRecordSchema = new Schema<IGameRecord>({
  userId: { type: String, required: true },
  gameType: { type: String, required: true, enum: ['FEED_PET', 'MATCH_THREE', 'LUCKY_WHEEL', 'QUIZ'] },
  score: { type: Number, default: 0 },
  reward: { type: Number, default: 0 },
  metadata: Schema.Types.Mixed,
  playedAt: { type: Date, default: Date.now },
});

// Daily Check-in Schema
export interface IDailyCheckIn extends Document {
  userId: string;
  checkInDate: Date;
  consecutiveDays: number;
  reward: number;
  createdAt: Date;
}

const dailyCheckInSchema = new Schema<IDailyCheckIn>({
  userId: { type: String, required: true },
  checkInDate: { type: Date, default: Date.now },
  consecutiveDays: { type: Number, default: 1 },
  reward: { type: Number, required: true },
}, { timestamps: true });

// User Task Schema
export interface IUserTask extends Document {
  userId: string;
  taskType: string;
  completed: boolean;
  reward: number;
  metadata?: any;
  completedAt?: Date;
  createdAt: Date;
}

const userTaskSchema = new Schema<IUserTask>({
  userId: { type: String, required: true },
  taskType: { type: String, required: true },
  completed: { type: Boolean, default: false },
  reward: { type: Number, default: 0 },
  metadata: Schema.Types.Mixed,
  completedAt: Date,
}, { timestamps: true });

// Chat Message Schema
export interface IChatMessage extends Document {
  conversationId: string;
  userId?: string;
  sessionId?: string; // For anonymous users
  text: string;
  sender: 'user' | 'support' | 'ai';
  status?: 'sent' | 'delivered' | 'read';
  products?: any[];
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>({
  conversationId: { type: String, required: true, index: true },
  userId: { type: String, index: true },
  sessionId: { type: String, index: true },
  text: { type: String, required: true },
  sender: { 
    type: String, 
    required: true, 
    enum: ['user', 'support', 'ai'] 
  },
  status: { 
    type: String, 
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  products: [{ type: Schema.Types.Mixed }],
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

// Chat Conversation Schema (to track conversation metadata)
export interface IChatConversation extends Document {
  userId?: string;
  sessionId: string; // Unique session ID for anonymous users
  lastMessageAt: Date;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const chatConversationSchema = new Schema<IChatConversation>({
  userId: { type: String, index: true },
  sessionId: { type: String, required: true, unique: true, index: true },
  lastMessageAt: { type: Date, default: Date.now },
  messageCount: { type: Number, default: 0 },
}, { timestamps: true });

// Pet Profile Schema
export interface IPet extends Document {
  userId: string;
  name: string;
  species: 'cat' | 'dog' | 'rabbit' | 'bird' | 'hamster' | 'other';
  breed?: string; // Breed
  age?: number; // Age (months)
  weight?: number; // Weight (kg)
  gender?: 'male' | 'female' | 'unknown';
  photo?: string; // Pet photo URL
  birthday?: Date; // Birthday
  healthStatus?: 'excellent' | 'good' | 'fair' | 'poor'; // Health status
  healthNotes?: string; // Health notes
  specialNeeds?: string[]; // Special needs (e.g., allergies, diseases, etc.)
  preferences?: {
    foodType?: string[]; // Preferred food types
    activityLevel?: 'low' | 'medium' | 'high'; // Activity level
    favoriteToys?: string[]; // Favorite toys
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const petSchema = new Schema<IPet>({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  species: { 
    type: String, 
    required: true, 
    enum: ['cat', 'dog', 'rabbit', 'bird', 'hamster', 'other'],
    index: true
  },
  breed: String,
  age: Number,
  weight: Number,
  gender: { type: String, enum: ['male', 'female', 'unknown'] },
  photo: String,
  birthday: Date,
  healthStatus: { 
    type: String, 
    enum: ['excellent', 'good', 'fair', 'poor'] 
  },
  healthNotes: String,
  specialNeeds: [String],
  preferences: {
    foodType: [String],
    activityLevel: { type: String, enum: ['low', 'medium', 'high'] },
    favoriteToys: [String]
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Pet Health Record Schema
export interface IPetHealthRecord extends Document {
  petId: string;
  userId: string;
  recordType: 'vaccination' | 'checkup' | 'medication' | 'surgery' | 'grooming' | 'other';
  title: string;
  description?: string;
  date: Date;
  veterinarian?: string; // Veterinarian name
  location?: string; // Location
  cost?: number; // Cost
  attachments?: string[]; // Attachments (e.g., check reports, photos, etc.)
  nextDueDate?: Date; // Next due date (e.g., vaccination, checkup, etc.)
  notes?: string;
  weight?: number; // Weight
  temperature?: number; // Temperature
  healthScore?: number; // Health score (0-100)
  createdAt: Date;
  updatedAt: Date;
}

const petHealthRecordSchema = new Schema<IPetHealthRecord>({
  petId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  recordType: {
    type: String,
    required: true,
    enum: ['vaccination', 'checkup', 'medication', 'surgery', 'grooming', 'other'],
    index: true
  },
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true, index: true },
  veterinarian: String,
  location: String,
  cost: Number,
  attachments: [String],
  nextDueDate: Date,
  notes: String,
  weight: { type: Number, min: 0, max: 200 },
  temperature: { type: Number, min: 20, max: 45 },
  healthScore: { type: Number, min: 0, max: 100 },
}, { timestamps: true });

// Pet Care Plan Schema
export interface IPetCarePlan extends Document {
  petId: string;
  userId: string;
  title: string;
  description?: string;
  category: 'nutrition' | 'exercise' | 'grooming' | 'medication' | 'wellness' | 'other';
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'custom';
  customIntervalDays?: number;
  startDate: Date;
  nextDueDate: Date;
  remindersEnabled: boolean;
  reminderLeadDays?: number;
  status: 'upcoming' | 'completed' | 'overdue';
  lastCompletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const petCarePlanSchema = new Schema<IPetCarePlan>({
  petId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: String,
  category: {
    type: String,
    enum: ['nutrition', 'exercise', 'grooming', 'medication', 'wellness', 'other'],
    default: 'wellness',
    index: true,
  },
  frequency: {
    type: String,
    enum: ['once', 'daily', 'weekly', 'monthly', 'custom'],
    default: 'once',
    index: true,
  },
  customIntervalDays: { type: Number, min: 1, max: 365 },
  startDate: { type: Date, required: true },
  nextDueDate: { type: Date, required: true, index: true },
  remindersEnabled: { type: Boolean, default: true },
  reminderLeadDays: { type: Number, min: 0, max: 30, default: 1 },
  status: {
    type: String,
    enum: ['upcoming', 'completed', 'overdue'],
    default: 'upcoming',
    index: true,
  },
  lastCompletedAt: Date,
}, { timestamps: true });

// Export Models
export const Wallet = mongoose.model<IWallet>('Wallet', walletSchema);
export const WalletTransaction = mongoose.model<IWalletTransaction>('WalletTransaction', walletTransactionSchema);
export const GameRecord = mongoose.model<IGameRecord>('GameRecord', gameRecordSchema);
export const DailyCheckIn = mongoose.model<IDailyCheckIn>('DailyCheckIn', dailyCheckInSchema);
export const UserTask = mongoose.model<IUserTask>('UserTask', userTaskSchema);
export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
export const ChatConversation = mongoose.model<IChatConversation>('ChatConversation', chatConversationSchema);
export const Pet = mongoose.model<IPet>('Pet', petSchema);
export const PetHealthRecord = mongoose.model<IPetHealthRecord>('PetHealthRecord', petHealthRecordSchema);
export const PetCarePlan = mongoose.model<IPetCarePlan>('PetCarePlan', petCarePlanSchema);

// User Behavior Tracking Schema (for recommendation system)
export interface IUserBehavior extends Document {
  userId?: string;
  sessionId: string; // For anonymous users
  productId: string;
  behaviorType: 'view' | 'click' | 'add_to_cart' | 'purchase' | 'wishlist';
  categoryId?: string;
  brandId?: string;
  metadata?: any;
  createdAt: Date;
}

const userBehaviorSchema = new Schema<IUserBehavior>({
  userId: { type: String, index: true },
  sessionId: { type: String, required: true, index: true },
  productId: { type: String, required: true, index: true },
  behaviorType: { 
    type: String, 
    required: true, 
    enum: ['view', 'click', 'add_to_cart', 'purchase', 'wishlist'],
    index: true
  },
  categoryId: { type: String, index: true },
  brandId: { type: String, index: true },
  metadata: Schema.Types.Mixed,
}, { timestamps: true });

// Product Recommendation Cache Schema (for performance optimization)
export interface IProductRecommendation extends Document {
  userId?: string;
  sessionId?: string;
  recommendationType: 'personalized' | 'trending' | 'similar' | 'frequently_bought_together';
  productIds: string[];
  scores?: number[]; // Recommendation scores
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const productRecommendationSchema = new Schema<IProductRecommendation>({
  userId: { type: String, index: true },
  sessionId: { type: String, index: true },
  recommendationType: { 
    type: String, 
    required: true, 
    enum: ['personalized', 'trending', 'similar', 'frequently_bought_together'],
    index: true
  },
  productIds: [{ type: String }],
  scores: [{ type: Number }],
  expiresAt: { type: Date, required: true, index: true },
}, { timestamps: true });

// Export Models
export const UserBehavior = mongoose.model<IUserBehavior>('UserBehavior', userBehaviorSchema);
export const ProductRecommendation = mongoose.model<IProductRecommendation>('ProductRecommendation', productRecommendationSchema);

// Export types for compatibility with existing code
export type UserType = IUser;
export type CategoryType = ICategory;
export type BrandType = IBrand;
export type ProductType = IProduct;
export type BlogPostType = IBlogPost;
export type OrderType = IOrder;
export type AnnouncementType = IAnnouncement;
export type CartType = ICart;
export type CartItemType = ICartItem;
export type InvoiceType = IInvoice;
export type CouponType = ICoupon;
export type PaymentTransactionType = IPaymentTransaction;
export type PaymentWebhookType = IPaymentWebhook;
export type BannerType = IBanner;
export type PopupPosterType = IPopupPoster;
export type AddressType = IAddress;
export type WalletType = IWallet;
export type WalletTransactionType = IWalletTransaction;
export type GameRecordType = IGameRecord;
export type DailyCheckInType = IDailyCheckIn;
export type UserTaskType = IUserTask;
export type ChatMessageType = IChatMessage;
export type ChatConversationType = IChatConversation;
export type UserBehaviorType = IUserBehavior;
export type ProductRecommendationType = IProductRecommendation;
export type PetType = IPet;
export type PetHealthRecordType = IPetHealthRecord;
export type PetCarePlanType = IPetCarePlan;