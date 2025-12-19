# PawCart - Online Pet Store E-commerce Platform
## Project Report

**Project Name:** PawCart - Online Pet Store E-commerce Platform  
**Project Type:** Full-Stack Web Application  
**Development Period:** 2024-2025  
**Version:** 1.0.0

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Detailed Design](#detailed-design)
3. [System Structure](#system-structure)
4. [Components and Functionalities](#components-and-functionalities)
5. [Class Diagrams](#class-diagrams)
6. [Database Design](#database-design)
7. [Programming Languages and Tools](#programming-languages-and-tools)
8. [Testing Strategies and Results](#testing-strategies-and-results)
9. [User Manual](#user-manual)
10. [Team Member Roles](#team-member-roles)
11. [Source Code Package](#source-code-package)
12. [Conclusion](#conclusion)

---

## 1. Executive Summary

PawCart is a comprehensive full-stack e-commerce platform designed specifically for pet products. The application provides a complete online shopping experience with advanced features including membership systems, gamified wallet rewards, AI-powered customer support, and comprehensive order management.

### Key Features
- **Complete E-commerce Functionality**: Product browsing, search, filtering, cart management, and secure checkout
- **Three-Tier Membership System**: Silver Paw (5%), Golden Paw (10%), and Diamond Paw (15%) discount tiers
- **Gamified Wallet System**: Daily check-ins, mini-games, and reward mechanisms
- **AI-Powered Customer Support**: Intelligent chatbot with multiple AI provider support
- **Advanced Order Management**: Order tracking, invoice generation, and payment processing
- **Responsive Design**: Mobile-first approach with cross-platform compatibility

### Technology Stack
- **Frontend**: React 18 with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js with Express.js, TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Supabase Auth
- **Additional Services**: Email service (Resend/SMTP), AI chat integration

---

## 2. Detailed Design

### 2.1 Architecture Overview

The application follows a **monorepo architecture** with clear separation between client and server code:

```
PawCart-Online-Pet-Store/
├── client/          # Frontend React application
├── server/          # Backend Express server
├── shared/          # Shared TypeScript types and models
└── docs/            # Comprehensive documentation
```

### 2.2 Design Patterns

#### 2.2.1 Frontend Architecture
- **Component-Based Architecture**: Modular React components with reusable UI elements
- **Context API**: Global state management for cart, wallet, authentication, and theme
- **Custom Hooks**: Reusable logic for authentication, mobile detection, and cart management
- **Provider Pattern**: Multiple context providers for different feature domains

#### 2.2.2 Backend Architecture
- **RESTful API Design**: Standard HTTP methods for resource operations
- **MVC Pattern**: Separation of routes, models, and business logic
- **Middleware Pattern**: Authentication, error handling, and request logging
- **Service Layer**: Dedicated services for email, AI chat, and recommendations

### 2.3 System Flow

#### 2.3.1 User Authentication Flow
```
User Registration/Login
    ↓
Supabase Authentication
    ↓
Session Management (Express-session)
    ↓
User Context Initialization
    ↓
Protected Route Access
```

#### 2.3.2 Order Processing Flow
```
Product Selection
    ↓
Add to Cart
    ↓
Checkout Process
    ↓
Address Selection
    ↓
Payment Method Selection
    ↓
Order Creation (with membership discount calculation)
    ↓
Invoice Generation
    ↓
Order Confirmation
```

#### 2.3.3 Wallet System Flow
```
User Action (Check-in, Game, Purchase)
    ↓
Reward Calculation (with membership multiplier)
    ↓
Wallet Transaction Creation
    ↓
Balance Update
    ↓
Transaction History Logging
```

---

## 3. System Structure

### 3.1 Frontend Structure

```
client/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── admin/          # Admin dashboard components
│   │   ├── auth/           # Authentication components
│   │   ├── layout/         # Layout components (header, footer)
│   │   ├── product/        # Product-related components
│   │   ├── ui/             # shadcn/ui base components
│   │   └── sections/      # Page sections
│   ├── contexts/           # React Context providers
│   │   ├── cart-context.tsx
│   │   ├── wallet-context.tsx
│   │   ├── language-context.tsx
│   │   └── currency-context.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── use-auth.tsx
│   │   ├── use-cart.tsx
│   │   └── use-mobile.tsx
│   ├── pages/              # Page components (67 pages)
│   │   ├── home.tsx
│   │   ├── products.tsx
│   │   ├── dashboard.tsx
│   │   ├── wallet.tsx
│   │   └── games/
│   ├── lib/                # Utility functions
│   │   ├── utils.ts
│   │   ├── queryClient.ts
│   │   └── url-utils.ts
│   └── App.tsx             # Main application component
└── public/                 # Static assets
```

### 3.2 Backend Structure

```
server/
├── index.ts                # Server entry point
├── routes.ts               # Main API routes (7,396 lines)
├── wallet-routes.ts        # Wallet system routes
├── mongodb.ts              # Database connection
├── supabase-client.ts      # Supabase integration
├── email-service.ts        # Email sending service
├── ai-chat-service.ts      # AI chat integration
├── recommendation-service.ts # Product recommendations
├── storage.ts              # File upload handling
└── [utility scripts]       # Various utility scripts
```

### 3.3 Shared Code Structure

```
shared/
├── models.ts               # MongoDB schemas and TypeScript interfaces
└── schema.ts               # Drizzle ORM schema (alternative)
```

---

## 4. Components and Functionalities

### 4.1 Core E-commerce Components

#### 4.1.1 Product Management
- **Product Listing**: Grid/list view with filtering and sorting
- **Product Detail**: Comprehensive product information with images, reviews, and specifications
- **Product Search**: Full-text search with category and brand filters
- **Product Recommendations**: AI-powered personalized recommendations

#### 4.1.2 Shopping Cart
- **Cart Management**: Add, remove, update quantities
- **Persistent Cart**: Session and user-based cart persistence
- **Floating Cart**: Quick access cart widget
- **Cart Validation**: Stock checking and price updates

#### 4.1.3 Checkout System
- **Multi-step Checkout**: Address selection, payment method, order review
- **Address Management**: Multiple saved addresses with default selection
- **Payment Methods**: Cash on delivery, wallet payment, QR code payments
- **Discount Application**: Automatic membership and coupon discounts

### 4.2 Membership System

#### 4.2.1 Membership Tiers
- **Silver Paw** (HK$29/month): 5% discount, free shipping
- **Golden Paw** (HK$59/month): 10% discount, free shipping, exclusive products
- **Diamond Paw** (HK$99/month): 15% discount, free shipping, exclusive products, auto-renewal

#### 4.2.2 Membership Features
- **Auto-Renewal**: Toggle automatic membership renewal
- **Expiry Reminders**: Dashboard banners and email notifications
- **Statistics Tracking**: Total savings and exclusive product purchases
- **Member-Exclusive Products**: Special badge and access control

### 4.3 Wallet & Rewards System

#### 4.3.1 Earning Mechanisms
- **Daily Check-in**: Base $1.00 HKD + membership bonuses
- **Feed Pet Game**: $0.50 - $2.00 HKD per play
- **Match Three Game**: Up to $10.00 HKD based on score
- **Lucky Wheel**: $1 - $50 HKD (weekly)
- **Pet Quiz**: Up to $5.00 HKD (daily)
- **First Purchase Bonus**: $50.00 HKD
- **Product Reviews**: $3.00 - $5.00 HKD

#### 4.3.2 Spending Mechanisms
- **Order Payment**: Up to 30-70% of order total (based on membership tier)
- **Transaction History**: Complete audit trail
- **Balance Management**: Real-time balance updates

### 4.4 Customer Support

#### 4.4.1 AI Chat System
- **Multiple AI Providers**: DeepSeek, OpenAI, Groq, Kimi support
- **Rule-Based Fallback**: Intelligent responses when AI unavailable
- **Conversation History**: Persistent chat sessions
- **Product Recommendations**: AI suggests relevant products

#### 4.4.2 Support Features
- **Help Center**: Comprehensive FAQ and articles
- **Contact Form**: Direct messaging to support team
- **Track Requests**: Order inquiry and support ticket system
- **Live Support**: Real-time chat interface

### 4.5 Admin Dashboard

#### 4.5.1 Management Features
- **User Management**: View, edit, delete users
- **Product Management**: CRUD operations for products
- **Order Management**: View and update order status
- **Analytics**: User statistics and sales reports
- **Content Management**: Blog posts, announcements, banners

### 4.6 Additional Features

- **Wishlist**: Save favorite products
- **Product Reviews**: Rating and review system
- **Blog System**: Content management for pet care articles
- **Multi-language Support**: Internationalization framework
- **Multi-currency**: Currency conversion and display
- **Theme Customization**: Light/dark mode support
- **Responsive Design**: Mobile-first responsive layout

---

## 5. Class Diagrams

### 5.1 Data Models (MongoDB Schemas)

```
┌─────────────────────────────────────────────────────────┐
│                        User                             │
├─────────────────────────────────────────────────────────┤
│ - _id: ObjectId                                         │
│ - username: string                                      │
│ - email: string                                         │
│ - password: string                                      │
│ - role: string (user/admin)                             │
│ - membership: Membership                                 │
│ - createdAt: Date                                       │
│ - updatedAt: Date                                       │
└─────────────────────────────────────────────────────────┘
                            │
                            │
┌───────────────────────────┴─────────────────────────────┐
│                    Membership                            │
├──────────────────────────────────────────────────────────┤
│ - tier: 'Silver Paw' | 'Golden Paw' | 'Diamond Paw'     │
│ - startDate: Date                                        │
│ - expiryDate: Date                                       │
│ - autoRenew: boolean                                     │
│ - statistics: MembershipStatistics                        │
└──────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                      Product                             │
├─────────────────────────────────────────────────────────┤
│ - _id: ObjectId                                         │
│ - name: string                                          │
│ - slug: string                                          │
│ - price: number                                          │
│ - categoryId: string                                     │
│ - brandId: string                                        │
│ - image: string                                          │
│ - isMemberExclusive: boolean                            │
│ - stockQuantity: number                                  │
│ - rating: number                                         │
│ - reviews: number                                        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                       Order                              │
├─────────────────────────────────────────────────────────┤
│ - _id: ObjectId                                         │
│ - userId: string                                         │
│ - items: CartItem[]                                      │
│ - subtotal: number                                       │
│ - discount: number                                       │
│ - membershipDiscount: number                              │
│ - shippingFee: number                                    │
│ - total: number                                          │
│ - status: string                                         │
│ - paymentMethod: string                                  │
│ - shippingAddress: Address                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                       Wallet                             │
├─────────────────────────────────────────────────────────┤
│ - _id: ObjectId                                         │
│ - userId: string                                         │
│ - balance: number                                        │
│ - totalEarned: number                                    │
│ - totalSpent: number                                     │
│ - frozenBalance: number                                   │
└─────────────────────────────────────────────────────────┘
                            │
                            │
┌───────────────────────────┴─────────────────────────────┐
│              WalletTransaction                           │
├──────────────────────────────────────────────────────────┤
│ - walletId: string                                      │
│ - userId: string                                         │
│ - type: 'EARN' | 'SPEND' | 'REFUND'                     │
│ - source: string                                        │
│ - amount: number                                        │
│ - balanceBefore: number                                  │
│ - balanceAfter: number                                  │
│ - description: string                                     │
└──────────────────────────────────────────────────────────┘
```

### 5.2 Frontend Component Hierarchy

```
App
├── QueryClientProvider
│   ├── ThemeProvider
│   │   ├── LanguageProvider
│   │   │   ├── CurrencyProvider
│   │   │   │   ├── AuthProvider
│   │   │   │   │   ├── WalletProvider
│   │   │   │   │   │   ├── CartProvider
│   │   │   │   │   │   │   ├── ChatProvider
│   │   │   │   │   │   │   │   ├── SidebarProvider
│   │   │   │   │   │   │   │   │   ├── AppRoutes
│   │   │   │   │   │   │   │   │   │   ├── Home
│   │   │   │   │   │   │   │   │   │   ├── ProductsPage
│   │   │   │   │   │   │   │   │   │   ├── Dashboard
│   │   │   │   │   │   │   │   │   │   ├── Wallet
│   │   │   │   │   │   │   │   │   │   └── [Other Pages]
│   │   │   │   │   │   │   │   │   ├── FloatingCart
│   │   │   │   │   │   │   │   │   └── MobileBottomNav
│   │   │   │   │   │   │   │   └── FloatingSupportButton
│   │   │   │   │   │   │   └── Toaster
```

### 5.3 Backend Service Architecture

```
Express App
├── Middleware
│   ├── CORS
│   ├── Session
│   ├── Body Parser
│   └── Error Handler
├── Routes
│   ├── /api/products
│   ├── /api/orders
│   ├── /api/wallet
│   ├── /api/membership
│   ├── /api/auth
│   └── /api/admin
├── Services
│   ├── EmailService
│   ├── AIChatService
│   ├── RecommendationService
│   └── StorageService
└── Database
    └── MongoDB (via Mongoose)
```

---

## 6. Database Design

### 6.1 Database System
- **Primary Database**: MongoDB (NoSQL document database)
- **ODM**: Mongoose for schema definition and validation
- **Connection**: MongoDB Atlas (cloud) or local MongoDB instance

### 6.2 Collections (Tables)

#### 6.2.1 Core Collections

**Users Collection**
```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, sparse),
  password: String (hashed),
  role: String (default: 'user'),
  membership: {
    tier: String (enum: ['Silver Paw', 'Golden Paw', 'Diamond Paw']),
    startDate: Date,
    expiryDate: Date,
    autoRenew: Boolean,
    statistics: {
      totalSaved: Number,
      exclusiveProductsPurchased: Number,
      lastRenewDate: Date
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Products Collection**
```javascript
{
  _id: ObjectId,
  name: String (required),
  slug: String (unique, required),
  price: Number (required),
  categoryId: String (required),
  brandId: String (required),
  image: String (required),
  images: [String],
  isMemberExclusive: Boolean (default: false),
  stockQuantity: Number (default: 0),
  rating: Number (default: 0),
  reviews: Number (default: 0),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

**Orders Collection**
```javascript
{
  _id: ObjectId,
  userId: String (required),
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  subtotal: Number (required),
  discount: Number (default: 0),
  discountCode: String,
  membershipDiscount: Number (default: 0),
  membershipTier: String,
  shippingFee: Number (default: 0),
  total: Number (required),
  status: String (default: 'Processing'),
  paymentMethod: String,
  paymentStatus: String (default: 'Pending'),
  shippingAddress: Object,
  createdAt: Date,
  updatedAt: Date
}
```

**Wallets Collection**
```javascript
{
  _id: ObjectId,
  userId: String (unique, required),
  balance: Number (default: 0),
  totalEarned: Number (default: 0),
  totalSpent: Number (default: 0),
  frozenBalance: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

**WalletTransactions Collection**
```javascript
{
  _id: ObjectId,
  walletId: String (required),
  userId: String (required),
  type: String (enum: ['EARN', 'SPEND', 'REFUND', 'FREEZE', 'UNFREEZE']),
  source: String (required),
  amount: Number (required),
  balanceBefore: Number (required),
  balanceAfter: Number (required),
  description: String,
  metadata: Object,
  createdAt: Date
}
```

#### 6.2.2 Supporting Collections

- **Categories**: Product categories with hierarchical structure
- **Brands**: Product brand information
- **Carts**: Shopping cart data (session and user-based)
- **Invoices**: Order invoice records
- **Coupons**: Discount coupon management
- **Addresses**: User shipping addresses
- **GameRecords**: Wallet game play records
- **DailyCheckIns**: Daily check-in records
- **ChatMessages**: AI chat conversation history
- **ChatConversations**: Chat session metadata
- **Pets**: User pet profiles
- **PetHealthRecords**: Pet health tracking
- **PetCarePlans**: Pet care scheduling
- **UserBehavior**: Recommendation system data
- **ProductRecommendations**: Cached recommendations
- **ContactMessages**: Support contact form submissions
- **Requests**: Support ticket system
- **Announcements**: Site-wide announcements
- **Banners**: Home page banners
- **PopupPosters**: Popup advertisement management
- **BlogPosts**: Blog content management

### 6.3 Database Relationships

- **One-to-Many**: User → Orders, User → Addresses, User → WalletTransactions
- **Many-to-One**: Products → Category, Products → Brand
- **One-to-One**: User → Wallet
- **Embedded Documents**: User.membership, Order.items

### 6.4 Indexes

Key indexes for performance:
- `users.username` (unique)
- `users.email` (unique, sparse)
- `products.slug` (unique)
- `products.categoryId` (indexed)
- `orders.userId` (indexed)
- `walletTransactions.userId` (indexed)
- `walletTransactions.createdAt` (indexed for sorting)

---

## 7. Programming Languages and Tools

### 7.1 Programming Languages

#### 7.1.1 TypeScript
- **Version**: 5.6.3
- **Usage**: Primary language for both frontend and backend
- **Benefits**: Type safety, better IDE support, improved maintainability
- **Configuration**: `tsconfig.json` with strict mode enabled

#### 7.1.2 JavaScript
- **Usage**: Configuration files, build scripts
- **Files**: `package.json`, `vite.config.ts`, utility scripts

### 7.2 Frontend Technologies

#### 7.2.1 Core Framework
- **React**: 18.3.1 - UI library
- **React DOM**: 18.3.1 - DOM rendering
- **Wouter**: 3.3.5 - Lightweight routing

#### 7.2.2 State Management
- **TanStack Query**: 5.60.5 - Server state management
- **Zustand**: 5.0.8 - Client state management
- **React Context API**: Built-in context providers

#### 7.2.3 UI Framework & Styling
- **Tailwind CSS**: 3.4.17 - Utility-first CSS framework
- **shadcn/ui**: Component library built on Radix UI
- **Radix UI**: Accessible component primitives
- **Framer Motion**: 11.13.1 - Animation library
- **Lucide React**: 0.453.0 - Icon library

#### 7.2.4 Forms & Validation
- **React Hook Form**: 7.55.0 - Form management
- **Zod**: 3.24.2 - Schema validation

#### 7.2.5 Build Tools
- **Vite**: 5.4.19 - Build tool and dev server
- **ESBuild**: 0.25.0 - Fast bundler for production

### 7.3 Backend Technologies

#### 7.3.1 Runtime & Framework
- **Node.js**: 18+ - JavaScript runtime
- **Express.js**: 4.21.2 - Web framework
- **TypeScript**: 5.6.3 - Type-safe development

#### 7.3.2 Database
- **MongoDB**: Document database
- **Mongoose**: 8.18.0 - MongoDB ODM

#### 7.3.3 Authentication & Security
- **Supabase**: 2.52.1 - Authentication service
- **bcrypt**: 6.0.0 - Password hashing
- **express-session**: 1.18.1 - Session management
- **memorystore**: 1.6.7 - Session storage

#### 7.3.4 File Handling
- **Multer**: 2.0.2 - File upload middleware
- **Sharp**: 0.34.3 - Image processing

#### 7.3.5 Email Service
- **Nodemailer**: 7.0.6 - Email sending
- **Resend API**: Email service integration

### 7.4 Development Tools

#### 7.4.1 Code Quality
- **TypeScript Compiler**: Type checking
- **ESLint**: Code linting (implicit)
- **Prettier**: Code formatting (implicit)

#### 7.4.2 Development Utilities
- **tsx**: 4.20.5 - TypeScript execution
- **cross-env**: 10.1.0 - Cross-platform environment variables
- **dotenv**: 17.2.1 - Environment variable management

### 7.5 Additional Libraries

#### 7.5.1 UI Components
- **Recharts**: 2.15.2 - Chart library
- **Swiper**: 11.2.10 - Carousel component
- **Embla Carousel**: 8.6.0 - Carousel library
- **React Day Picker**: 8.10.1 - Date picker
- **React Countdown**: 2.3.6 - Countdown timer

#### 7.5.2 Utilities
- **date-fns**: 3.6.0 - Date manipulation
- **nanoid**: 5.1.5 - Unique ID generation
- **memoizee**: 0.4.17 - Function memoization
- **country-state-city**: 3.2.1 - Location data

### 7.6 Development Environment

- **Node.js**: 18+ required
- **npm**: Package manager
- **Git**: Version control
- **MongoDB Atlas**: Cloud database (or local MongoDB)
- **Supabase**: Authentication service

### 7.7 Deployment Tools

- **Vercel**: Frontend deployment (optional)
- **Render**: Full-stack deployment
- **Railway**: Alternative deployment platform
- **Fly.io**: Global edge deployment

---

## 8. Testing Strategies and Results

### 8.1 Testing Approach

The project employs a **manual testing strategy** with comprehensive test scenarios documented for each feature module.

### 8.2 Testing Categories

#### 8.2.1 Functional Testing

**Authentication Testing**
- User registration and login
- Password reset functionality
- Session management
- Protected route access
- Supabase integration

**E-commerce Testing**
- Product browsing and search
- Cart management (add, remove, update)
- Checkout process
- Order creation and tracking
- Payment processing
- Invoice generation

**Membership System Testing**
- Membership purchase
- Discount calculation
- Auto-renewal toggle
- Expiry reminders
- Member-exclusive product access
- Statistics tracking

**Wallet System Testing**
- Daily check-in functionality
- Game reward calculations
- Transaction recording
- Balance updates
- Membership multiplier application
- Payment integration

#### 8.2.2 Integration Testing

**API Integration**
- Frontend-backend communication
- Database operations
- External service integration (Supabase, Email, AI)
- File upload handling
- Session persistence

**Third-Party Service Integration**
- Supabase authentication
- Email service (Resend/SMTP)
- AI chat providers (DeepSeek, OpenAI, Groq, Kimi)
- MongoDB Atlas connection

#### 8.2.3 User Interface Testing

**Responsive Design**
- Mobile device compatibility
- Tablet layout verification
- Desktop experience
- Cross-browser testing

**User Experience**
- Navigation flow
- Form validation
- Error handling
- Loading states
- Toast notifications

### 8.3 Test Accounts

Pre-configured test accounts for different scenarios:

| Username | Password | Membership Tier | Purpose |
|----------|----------|-----------------|---------|
| `silvermember` | `password123` | Silver Paw | 5% discount testing |
| `goldenmember` | `password123` | Golden Paw | 10% discount + exclusive products |
| `diamondmember` | `password123` | Diamond Paw | 15% discount + all features |
| `admin@petshop.com` | `admin123` | Admin | Admin dashboard testing |

### 8.4 Test Scripts

NPM scripts for testing and verification:

```bash
# Development
npm run dev                    # Start development server

# Data Management
npm run mark-member-products   # Mark products as member-exclusive
npm run verify-order-discounts # Verify order discount calculations
npm run check-users           # Check user data integrity

# Email Testing
npm run membership-cron       # Test membership email notifications

# Environment
npm run check:env             # Verify environment variables
```

### 8.5 Test Results Summary

#### 8.5.1 Core Features ✅
- ✅ User authentication and authorization
- ✅ Product browsing and search
- ✅ Shopping cart functionality
- ✅ Checkout and order processing
- ✅ Payment method selection
- ✅ Invoice generation

#### 8.5.2 Membership System ✅
- ✅ Three-tier membership purchase
- ✅ Discount calculation (5%, 10%, 15%)
- ✅ Free shipping for members
- ✅ Auto-renewal toggle
- ✅ Expiry reminders (dashboard + email)
- ✅ Member-exclusive product access
- ✅ Statistics tracking

#### 8.5.3 Wallet System ✅
- ✅ Daily check-in with consecutive day tracking
- ✅ Feed Pet game rewards
- ✅ Lucky Wheel weekly rewards
- ✅ Match Three game (API ready)
- ✅ Pet Quiz game (API ready)
- ✅ Transaction history
- ✅ Balance management
- ✅ Membership multiplier application

#### 8.5.4 Customer Support ✅
- ✅ AI chat integration (multiple providers)
- ✅ Rule-based fallback chat
- ✅ Help center and FAQ
- ✅ Contact form
- ✅ Track requests system

#### 8.5.5 Admin Features ✅
- ✅ User management
- ✅ Product management
- ✅ Order management
- ✅ Analytics dashboard
- ✅ Content management

### 8.6 Known Limitations

1. **Automated Testing**: No unit tests or integration test suites (manual testing only)
2. **Performance Testing**: No formal load testing performed
3. **Security Testing**: Basic security measures implemented, no penetration testing
4. **Accessibility Testing**: WCAG compliance not formally verified

### 8.7 Testing Documentation

Comprehensive testing guides available in `docs/`:
- `docs/quick-start/QUICK_TEST_GUIDE.md` - Quick testing scenarios
- `docs/features/COMPLETE_FEATURES_SUMMARY.md` - Feature testing checklist
- `docs/membership/README_MEMBERSHIP_FEATURES.md` - Membership testing guide
- `docs/wallet/WALLET_SYSTEM_SUMMARY.md` - Wallet system testing

---

## 9. User Manual

### 9.1 Getting Started

#### 9.1.1 Account Creation
1. Navigate to the homepage
2. Click "Sign Up" in the header
3. Fill in registration form:
   - Username (required, unique)
   - Email (optional, unique)
   - Password (minimum 8 characters)
4. Click "Create Account"
5. Verify email (if email provided)

#### 9.1.2 Login
1. Click "Sign In" in the header
2. Enter username and password
3. Click "Sign In"
4. You'll be redirected to your dashboard

### 9.2 Shopping Guide

#### 9.2.1 Browsing Products
1. Use the main navigation to browse categories:
   - Cat Food, Dog Food
   - Cat Toys, Cat Litter
   - Accessories, etc.
2. Use the search bar to find specific products
3. Apply filters:
   - Price range
   - Brand
   - In stock
   - On sale
   - Member exclusive (for members)

#### 9.2.2 Product Details
1. Click on any product to view details
2. View product images, description, specifications
3. Check reviews and ratings
4. Select quantity
5. Click "Add to Cart" or "Buy Now"

#### 9.2.3 Shopping Cart
1. Click the cart icon in the header
2. Review items in your cart
3. Update quantities or remove items
4. Click "Checkout" to proceed

### 9.3 Checkout Process

#### 9.3.1 Address Selection
1. Select a saved address or add a new one
2. Verify shipping information
3. Click "Continue to Payment"

#### 9.3.2 Payment
1. Choose payment method:
   - Cash on Delivery
   - Wallet Payment (if balance available)
   - QR Code Payment
2. Apply coupon code (if available)
3. Review order summary:
   - Subtotal
   - Membership discount (if applicable)
   - Shipping fee
   - Total
4. Click "Place Order"

#### 9.3.3 Order Confirmation
1. View order confirmation page
2. Receive order number
3. Access invoice via "View Invoice" button
4. Track order status in Dashboard

### 9.4 Membership System

#### 9.4.1 Joining Privilege Club
1. Navigate to "Privilege Club" from main menu
2. Choose membership tier:
   - **Silver Paw** (HK$29/month): 5% discount
   - **Golden Paw** (HK$59/month): 10% discount + exclusive products
   - **Diamond Paw** (HK$99/month): 15% discount + all features
3. Click "Join Now"
4. Complete payment
5. Membership activates immediately

#### 9.4.2 Membership Benefits
- **Discounts**: Automatic discount on all products
- **Free Shipping**: All orders ship free
- **Exclusive Products**: Access to member-only products (Golden/Diamond)
- **Wallet Bonuses**: Higher rewards from games and activities
- **Statistics**: Track your savings and exclusive purchases

#### 9.4.3 Managing Membership
1. Go to Dashboard
2. View membership card
3. Toggle "Auto-Renew" switch (Diamond Paw only)
4. View membership statistics
5. Renew membership before expiry

### 9.5 Wallet System

#### 9.5.1 Accessing Wallet
1. Click "Wallet" button in header (green button)
2. View current balance and statistics
3. Navigate to different sections:
   - Overview: Balance and recent transactions
   - Transactions: Complete transaction history
   - Earn More: Ways to earn rewards

#### 9.5.2 Daily Check-in
1. Go to Wallet → "Daily Check-in"
2. Click "Check In Today"
3. Earn base reward ($1.00 HKD)
4. Bonus rewards for consecutive days:
   - 7 days: +$5.00
   - 30 days: +$30.00
5. Membership bonuses apply

#### 9.5.3 Playing Games
1. Go to Wallet → "Play Games"
2. Choose a game:
   - **Feed Pet**: Earn $0.50 - $2.00 (60s cooldown)
   - **Lucky Wheel**: Earn $1 - $50 (weekly)
   - **Match Three**: Earn up to $10.00 (score-based)
   - **Pet Quiz**: Earn up to $5.00 (daily)
3. Play and earn rewards
4. Rewards automatically added to wallet

#### 9.5.4 Using Wallet Balance
1. During checkout, select "Wallet Payment"
2. Maximum usage based on membership:
   - Non-member: 30% of order
   - Silver Paw: 40%
   - Golden Paw: 50%
   - Diamond Paw: 70%
3. Remaining balance paid via other methods

### 9.6 Dashboard Features

#### 9.6.1 Profile Management
1. Go to Dashboard → Profile
2. Update personal information:
   - Name, email, phone
   - Profile picture
   - Password
3. Save changes

#### 9.6.2 Order History
1. Go to Dashboard → Orders
2. View all past orders
3. Click order to view details
4. Track order status
5. Download invoice

#### 9.6.3 Address Management
1. Go to Dashboard → Addresses
2. Add new address
3. Set default address
4. Edit or delete addresses

#### 9.6.4 Wishlist
1. Click heart icon on products to add to wishlist
2. Access wishlist from Dashboard
3. Add items to cart directly from wishlist

### 9.7 Customer Support

#### 9.7.1 AI Chat
1. Click floating support button (bottom right)
2. Start conversation with AI assistant
3. Ask questions about products, orders, or policies
4. Get product recommendations
5. View conversation history

#### 9.7.2 Help Center
1. Navigate to "Help Center" from footer
2. Browse FAQ categories
3. Search for specific topics
4. Read detailed articles

#### 9.7.3 Contact Support
1. Go to "Contact" page
2. Fill out contact form
3. Select inquiry type
4. Submit and wait for response
5. Track request status in Dashboard

### 9.8 Mobile App Usage

The application is fully responsive and works on mobile browsers. For native app experience:
1. Build Android APK using Capacitor (see `docs/mobile/ANDROID_APK_BUILD_GUIDE.md`)
2. Install APK on Android device
3. Use same features as web version

### 9.9 Troubleshooting

#### Common Issues

**Login Problems**
- Verify username and password
- Check if account is active
- Try password reset

**Cart Issues**
- Clear browser cache
- Ensure you're logged in
- Check product availability

**Payment Problems**
- Verify payment method
- Check wallet balance (if using wallet)
- Contact support if issue persists

**Membership Issues**
- Check membership expiry date
- Verify payment was successful
- Contact support for renewal

**Wallet Issues**
- Check transaction history
- Verify game cooldown periods
- Contact support for balance disputes

---

## 10. Team Member Roles

### 10.1 Project Overview

This project was developed as a **solo project** by a single developer. All aspects of the application - from initial design to final implementation - were completed by one individual.

### 10.2 Development Roles Performed

The developer assumed multiple roles throughout the project lifecycle:

#### 10.2.1 Project Manager
- **Responsibilities**:
  - Project planning and timeline management
  - Feature prioritization
  - Documentation organization
  - Deployment coordination

#### 10.2.2 System Architect
- **Responsibilities**:
  - System architecture design
  - Technology stack selection
  - Database schema design
  - API structure planning

#### 10.2.3 Frontend Developer
- **Responsibilities**:
  - React component development (96 components)
  - UI/UX design and implementation
  - State management setup
  - Responsive design implementation
  - Client-side routing
  - Form handling and validation

#### 10.2.4 Backend Developer
- **Responsibilities**:
  - Express.js server setup
  - RESTful API development
  - Database integration (MongoDB)
  - Authentication implementation
  - Business logic development
  - File upload handling
  - Email service integration

#### 10.2.5 Database Administrator
- **Responsibilities**:
  - MongoDB schema design
  - Database optimization
  - Data migration scripts
  - Query optimization

#### 10.2.6 DevOps Engineer
- **Responsibilities**:
  - Deployment configuration
  - Environment setup
  - Build process optimization
  - Server configuration

#### 10.2.7 Quality Assurance Tester
- **Responsibilities**:
  - Manual testing of all features
  - Bug identification and reporting
  - User acceptance testing
  - Cross-browser testing

#### 10.2.8 Technical Writer
- **Responsibilities**:
  - Comprehensive documentation (100+ markdown files)
  - User manual creation
  - API documentation
  - Deployment guides

### 10.3 Development Timeline

While specific dates are not documented, the project demonstrates:
- **Initial Setup**: Project structure, dependencies, basic configuration
- **Core Features**: E-commerce functionality, authentication, database
- **Advanced Features**: Membership system, wallet system, AI chat
- **Polish & Documentation**: UI improvements, comprehensive documentation
- **Deployment**: Production deployment configuration

### 10.4 Skills Demonstrated

The project showcases proficiency in:
- **Frontend**: React, TypeScript, Tailwind CSS, modern UI frameworks
- **Backend**: Node.js, Express.js, RESTful API design
- **Database**: MongoDB, Mongoose ODM, schema design
- **Authentication**: Supabase integration, session management
- **DevOps**: Deployment platforms, environment configuration
- **Project Management**: Documentation, organization, feature planning

### 10.5 Project Statistics

- **Total Files**: 200+ source files
- **Lines of Code**: ~15,000+ (estimated)
- **Components**: 96 React components
- **Pages**: 67 page components
- **API Endpoints**: 50+ RESTful endpoints
- **Database Collections**: 25+ MongoDB collections
- **Documentation**: 100+ markdown documentation files

---

## 11. Source Code Package

### 11.1 Project Structure

The complete source code is organized as follows:

```
PawCart-Online-Pet-Store/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/        # 96 React components
│   │   ├── contexts/          # Context providers
│   │   ├── hooks/             # Custom hooks
│   │   ├── lib/               # Utility functions
│   │   ├── pages/             # 67 page components
│   │   └── App.tsx            # Main app component
│   ├── public/                # Static assets
│   └── index.html             # HTML entry point
│
├── server/                     # Backend Express server
│   ├── index.ts               # Server entry point
│   ├── routes.ts              # Main API routes (7,396 lines)
│   ├── wallet-routes.ts       # Wallet system routes
│   ├── mongodb.ts             # Database connection
│   ├── supabase-client.ts     # Supabase integration
│   ├── email-service.ts       # Email service
│   ├── ai-chat-service.ts     # AI chat service
│   ├── recommendation-service.ts # Recommendations
│   └── [utility scripts]      # Various utility scripts
│
├── shared/                     # Shared code
│   ├── models.ts              # MongoDB schemas
│   └── schema.ts              # Alternative schema
│
├── docs/                       # Documentation (100+ files)
│   ├── address/
│   ├── ai-chat/
│   ├── configuration/
│   ├── deployment/
│   ├── features/
│   ├── fixes/
│   ├── membership/
│   ├── mobile/
│   ├── password/
│   ├── quick-start/
│   ├── wallet/
│   └── README.md
│
├── attached_assets/            # Product images
├── uploads/                    # User uploads
├── dist/                       # Build output
│
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite build configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── README.md                   # Main project README
└── PROJECT_REPORT.md           # This document
```

### 11.2 Key Files

#### 11.2.1 Configuration Files
- `package.json` - All dependencies and NPM scripts
- `tsconfig.json` - TypeScript compiler configuration
- `vite.config.ts` - Build tool configuration
- `tailwind.config.ts` - CSS framework configuration
- `.env` - Environment variables (not in repo, see docs)

#### 11.2.2 Entry Points
- `server/index.ts` - Backend server entry
- `client/src/main.tsx` - Frontend entry
- `client/src/App.tsx` - Main React component

#### 11.2.3 Core Backend Files
- `server/routes.ts` - All API endpoints
- `server/wallet-routes.ts` - Wallet system APIs
- `shared/models.ts` - Database models

#### 11.2.4 Core Frontend Files
- `client/src/App.tsx` - Routing and providers
- `client/src/contexts/` - Global state management
- `client/src/components/` - Reusable components
- `client/src/pages/` - Page components

### 11.3 Dependencies

#### 11.3.1 Production Dependencies (107 packages)
Key dependencies include:
- React ecosystem (React, React DOM, React Router)
- UI libraries (Radix UI, shadcn/ui, Tailwind CSS)
- Backend (Express, Mongoose, Supabase)
- Utilities (Zod, date-fns, bcrypt)

#### 11.3.2 Development Dependencies (12 packages)
- TypeScript
- Vite and plugins
- Build tools (ESBuild, tsx)

### 11.4 Installation Instructions

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd PawCart-Online-Pet-Store
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   - Create `.env` file in root directory
   - Add required environment variables (see `docs/configuration/ENV_VARIABLES.md`)

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

### 11.5 Source Code Organization

The codebase follows best practices:
- **Modular Structure**: Clear separation of concerns
- **Type Safety**: Full TypeScript implementation
- **Component Reusability**: Shared UI components
- **Code Documentation**: Inline comments and JSDoc
- **Consistent Naming**: Clear, descriptive names
- **Error Handling**: Comprehensive error handling

### 11.6 Version Control

The project uses Git for version control. Key branches:
- `main` - Production-ready code
- Feature branches for development

### 11.7 Build Output

Production build creates:
- `dist/public/` - Frontend static files
- `dist/index.js` - Backend server bundle

---

## 12. Conclusion

### 12.1 Project Summary

PawCart is a comprehensive, production-ready e-commerce platform for pet products that demonstrates advanced full-stack development capabilities. The application successfully integrates multiple complex systems including membership management, gamified rewards, AI-powered support, and comprehensive order processing.

### 12.2 Key Achievements

1. **Complete E-commerce Solution**: Full shopping experience from browsing to order fulfillment
2. **Advanced Membership System**: Three-tier system with automatic discounts and exclusive products
3. **Gamified Wallet System**: Engaging reward mechanisms with multiple earning opportunities
4. **AI Integration**: Intelligent customer support with multiple provider support
5. **Comprehensive Documentation**: 100+ documentation files covering all aspects
6. **Production Ready**: Fully deployable with proper configuration

### 12.3 Technical Highlights

- **Modern Tech Stack**: Latest versions of React, Node.js, TypeScript
- **Type Safety**: Full TypeScript implementation
- **Scalable Architecture**: Modular, maintainable code structure
- **Responsive Design**: Mobile-first, cross-platform compatibility
- **Security**: Proper authentication, session management, password hashing
- **Performance**: Optimized queries, code splitting, lazy loading

### 12.4 Future Enhancements

Potential improvements for future iterations:
1. **Automated Testing**: Unit tests, integration tests, E2E tests
2. **Payment Gateway**: Stripe/PayPal integration for real payments
3. **Mobile Apps**: Native iOS and Android applications
4. **Advanced Analytics**: User behavior tracking and business intelligence
5. **Performance Optimization**: Caching, CDN, database optimization
6. **Accessibility**: WCAG compliance improvements
7. **Internationalization**: Multi-language support implementation

### 12.5 Learning Outcomes

This project demonstrates:
- Full-stack development capabilities
- Complex system integration
- Modern web development practices
- Database design and optimization
- API design and development
- User experience design
- Project management and documentation

### 12.6 Final Notes

The PawCart project represents a complete, professional-grade e-commerce solution. All core features are implemented, tested, and documented. The codebase is well-organized, maintainable, and ready for production deployment with proper environment configuration.

---

## Appendices

### Appendix A: Environment Variables

Required environment variables (see `docs/configuration/ENV_VARIABLES.md` for details):

```env
# Database
MONGODB_URI=mongodb+srv://...

# Authentication
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...

# Session
SESSION_SECRET=...

# Email (Optional)
RESEND_API_KEY=...
FROM_EMAIL=...

# AI Chat (Optional)
DEEPSEEK_API_KEY=...
OPENAI_API_KEY=...
GROQ_API_KEY=...
KIMI_API_KEY=...
```

### Appendix B: API Endpoints

Key API endpoints (see `server/routes.ts` for complete list):

- `GET /api/products` - List products
- `GET /api/products/:id` - Get product details
- `POST /api/cart` - Add to cart
- `POST /api/orders` - Create order
- `GET /api/wallet` - Get wallet balance
- `POST /api/wallet/check-in` - Daily check-in
- `POST /api/membership/purchase` - Purchase membership
- `GET /api/membership/statistics/:userId` - Membership stats

### Appendix C: Database Collections

Complete list of MongoDB collections:
1. users
2. products
3. categories
4. brands
5. orders
6. carts
7. invoices
8. coupons
9. wallets
10. walletTransactions
11. gameRecords
12. dailyCheckIns
13. addresses
14. chatMessages
15. chatConversations
16. pets
17. petHealthRecords
18. petCarePlans
19. userBehavior
20. productRecommendations
21. contactMessages
22. requests
23. announcements
24. banners
25. popupPosters
26. blogPosts

---

**Report Generated**: 2025  
**Project Status**: ✅ Complete and Production Ready  
**Version**: 1.0.0

---

*This report provides a comprehensive overview of the PawCart Online Pet Store project. For detailed technical documentation, please refer to the `docs/` directory.*

