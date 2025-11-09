# PawCart - Online Pet Store E-commerce Platform

A comprehensive full-stack e-commerce application for pet products, featuring a modern tech stack, gamification elements, membership system, and AI-powered customer support.

## 🚀 Features

### Core E-commerce Features
- 🛍️ **Complete Shopping Experience** - Product browsing, search, filtering, and sorting
- 🛒 **Shopping Cart & Checkout** - Seamless cart management and secure checkout process
- 📦 **Order Management** - Track orders, view order history, and manage deliveries
- 💳 **Multiple Payment Methods** - Cash on delivery, wallet payment, and QR code payments
- ⭐ **Product Reviews & Ratings** - Customer feedback and rating system
- 🔍 **Advanced Search** - Search products by name, category, brand, and keywords
- 📱 **Responsive Design** - Mobile-first design optimized for all devices

### Membership System
- 💎 **Three-Tier Membership** - Silver Paw (5%), Golden Paw (10%), Diamond Paw (15%) discounts
- 👑 **Member-Exclusive Products** - Access to premium products for members
- 🎁 **Free Shipping** - All membership tiers enjoy free shipping on orders
- 📊 **Membership Statistics** - Track savings, exclusive product purchases, and benefits
- 🔄 **Auto-Renewal** - Automatic membership renewal option
- 📧 **Email Notifications** - Expiry reminders and renewal confirmations

### Wallet & Rewards System
- 💰 **Digital Wallet** - Earn and spend rewards through various activities
- 📅 **Daily Check-in** - Earn rewards for consecutive daily check-ins
- 🎮 **Gamification** - Play games to earn wallet credits:
  - Feed Pet Game
  - Match Three Puzzle
  - Lucky Wheel (weekly)
  - Pet Knowledge Quiz
- 🏆 **Member Bonus Multipliers** - Higher rewards for membership tiers
- 📈 **Transaction History** - Complete record of all wallet transactions

### Customer Support
- 🤖 **AI-Powered Chat** - Intelligent customer support chatbot
- 📚 **Help Center** - Comprehensive FAQ and support articles
- 💬 **Live Support** - Direct communication with support team
- 📞 **Helpline** - Contact information and support channels

### Additional Features
- ❤️ **Wishlist** - Save favorite products for later
- 🎯 **Product Recommendations** - AI-powered personalized recommendations
- 🌍 **Multi-language Support** - Internationalization support
- 💱 **Multi-currency** - Support for different currencies
- 🎨 **Theme Customization** - Light/dark mode and color themes
- 📊 **Admin Dashboard** - Comprehensive analytics and management tools
- 🎁 **Coupon System** - Discount codes and promotional offers
- 📧 **Email Notifications** - Order confirmations and updates

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui built on Radix UI primitives
- **State Management**: TanStack Query for server state, Zustand for client state
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized production builds

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: MongoDB with Mongoose ODM
- **API Design**: RESTful API architecture
- **Session Management**: Express-session with MongoDB store
- **File Uploads**: Multer for image handling

### Authentication & Services
- **Authentication**: Supabase Auth for user management
- **Email Service**: Resend API (recommended) or SMTP
- **AI Chat**: DeepSeek, OpenAI, Groq, or Kimi API support
- **Image Processing**: Sharp for image optimization

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier available) or local MongoDB
- Supabase account (free tier available)
- Git for version control

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd PawCart-Online-Pet-Store
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database (Required)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Supabase Authentication (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Session Secret (Required)
SESSION_SECRET=your-random-32-character-secret-key

# Server Configuration
NODE_ENV=development
PORT=5000

# Email Service (Optional - for password reset and notifications)
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=onboarding@resend.dev

# AI Chat Service (Optional - for AI customer support)
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### 4. Set Up MongoDB Atlas

1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free M0 cluster
3. Add `0.0.0.0/0` in Network Access (for development)
4. Create a database user
5. Get connection string from Clusters > Connect > Connect your application
6. Replace `<password>` and `<dbname>` in the connection string

### 5. Set Up Supabase

1. Visit [Supabase](https://supabase.com)
2. Create a new project
3. Go to Settings > API
4. Copy Project URL and anon public key
5. Add your local URL (`http://localhost:5000/*`) in Authentication > URL Configuration

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 📁 Project Structure

```
PawCart-Online-Pet-Store/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── admin/     # Admin dashboard components
│   │   │   ├── auth/      # Authentication components
│   │   │   ├── layout/    # Layout components (header, footer)
│   │   │   ├── product/   # Product-related components
│   │   │   └── ui/        # shadcn/ui components
│   │   ├── contexts/      # React contexts (cart, wallet, auth)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions and configurations
│   │   ├── pages/         # Page components
│   │   └── App.tsx        # Main app component with routing
│   └── public/            # Static assets
├── server/                # Backend Express server
│   ├── routes.ts          # API routes
│   ├── wallet-routes.ts   # Wallet system routes
│   ├── mongodb.ts         # MongoDB connection
│   ├── supabase-client.ts # Supabase client
│   └── index.ts           # Server entry point
├── shared/                # Shared code between frontend and backend
│   └── models.ts          # MongoDB schemas and TypeScript types
├── attached_assets/       # Product images and static assets
└── package.json           # Dependencies and scripts
```

## 📜 Available Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run check` - Run TypeScript type checking

### Production
- `npm run build` - Build for production (frontend + backend)
- `npm start` - Start production server

### Utilities
- `npm run check:env` - Verify environment variables configuration
- `npm run mark-member-products` - Mark products as member-exclusive
- `npm run membership-cron` - Run membership email notifications
- `npm run verify-order-discounts` - Verify order discount calculations

## 🌐 Deployment

### Quick Deployment Options

The application can be deployed to various platforms:

#### Render (Recommended for Beginners)
- **Guide**: See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)
- **Quick Guide**: See [RENDER_快速部署.md](./RENDER_快速部署.md) (Chinese)
- **Free Tier**: Available with sleep mode after 15 minutes

#### Railway
- **Guide**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Free Tier**: $5 credit monthly

#### Fly.io
- **Guide**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Global Edge**: Fast worldwide deployment

#### Vercel + Railway
- Frontend on Vercel, Backend on Railway
- See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for details

### Environment Variables for Production

Ensure all required environment variables are set in your deployment platform:

**Required:**
- `MONGODB_URI`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SESSION_SECRET`
- `NODE_ENV=production`
- `PORT` (varies by platform: Render uses 10000)

**Optional:**
- `RESEND_API_KEY` and `FROM_EMAIL` (for email features)
- `DEEPSEEK_API_KEY` or other AI API keys (for AI chat)

### Post-Deployment Configuration

1. **Supabase Redirect URLs**: Add your deployment URL to Supabase Authentication > URL Configuration
2. **MongoDB Network Access**: Ensure your deployment platform IPs are allowed (or use `0.0.0.0/0` for development)
3. **Email Service**: Configure Resend or SMTP for production email features

For detailed deployment instructions, see:
- [QUICK_START.md](./QUICK_START.md) - Quick deployment guide
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Complete deployment guide
- [ENV_VARIABLES.md](./ENV_VARIABLES.md) - Environment variables guide

## 🎯 Key Features in Detail

### Membership Tiers

| Tier | Price | Discount | Free Shipping | Exclusive Products | Wallet Bonus |
|------|-------|----------|---------------|-------------------|--------------|
| Silver Paw | HK$29/month | 5% | ✅ | ❌ | 1.2x |
| Golden Paw | HK$59/month | 10% | ✅ | ✅ | 1.5x |
| Diamond Paw | HK$99/month | 15% | ✅ | ✅ | 2.0x |

### Wallet System

Users can earn wallet credits through:
- **Daily Check-in**: Base $1.00 HKD + membership bonus
- **Feed Pet Game**: $0.50 - $2.00 HKD per play
- **Match Three**: Up to $10.00 HKD based on score
- **Lucky Wheel**: $1 - $50 HKD (weekly)
- **Pet Quiz**: Up to $5.00 HKD (daily)
- **First Purchase**: $50.00 HKD bonus
- **Product Reviews**: $3.00 - $5.00 HKD

Wallet credits can be used to pay up to:
- 30% (non-members)
- 40% (Silver Paw)
- 50% (Golden Paw)
- 70% (Diamond Paw)

### Product Categories

- Cat Food (Dry, Wet, Treats)
- Dog Food (Dry, Wet, Treats)
- Pet Toys (Interactive, Plush, Puzzle)
- Grooming Products (Shampoo, Brushes, Nail Clippers)
- Health Care (Supplements, Medications, First Aid)
- Accessories (Collars, Leashes, Beds, Carriers)

## 🔧 Configuration

### Email Service Setup

For password reset and membership notifications:

**Option 1: Resend (Recommended)**
1. Sign up at [Resend](https://resend.com)
2. Create API key
3. Add to `.env`:
   ```env
   RESEND_API_KEY=re_your_key
   FROM_EMAIL=onboarding@resend.dev
   ```

**Option 2: SMTP (Gmail/Outlook)**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### AI Chat Setup

Configure one of the following AI services:

- **DeepSeek**: `DEEPSEEK_API_KEY=sk-xxxxx`
- **OpenAI**: `OPENAI_API_KEY=sk-xxxxx`
- **Groq**: `GROQ_API_KEY=xxxxx`
- **Kimi (Moonshot)**: `KIMI_API_KEY=xxxxx`

If no AI API is configured, the system uses a rule-based chat engine.

## 🧪 Testing

### Test Accounts

The application includes test membership accounts:
- `silvermember` / `password123` - Silver Paw member
- `goldenmember` / `password123` - Golden Paw member
- `diamondmember` / `password123` - Diamond Paw member

### Admin Access

Default admin credentials:
- Email: `admin@petshop.com`
- Password: `admin123`

## 📚 Documentation

Comprehensive documentation is available:

- [QUICK_START.md](./QUICK_START.md) - Quick deployment guide
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Complete deployment instructions
- [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) - Render-specific deployment
- [ENV_VARIABLES.md](./ENV_VARIABLES.md) - Environment variables reference
- [README_MEMBERSHIP_FEATURES.md](./README_MEMBERSHIP_FEATURES.md) - Membership system guide
- [WALLET_SYSTEM_SUMMARY.md](./WALLET_SYSTEM_SUMMARY.md) - Wallet system documentation
- [CUSTOMER_SUPPORT_README.md](./CUSTOMER_SUPPORT_README.md) - Customer support features

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Test thoroughly before submitting PRs
- Update documentation for new features

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed**
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas Network Access settings
- Ensure username and password are URL-encoded if special characters exist

**Supabase Authentication Not Working**
- Verify redirect URLs are configured in Supabase
- Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Ensure Supabase project is active

**Build Errors**
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (requires 18+)
- Clear `node_modules` and reinstall if needed

**Email Not Sending**
- Verify email service credentials
- Check spam folder
- For Gmail, use App Password instead of regular password
- See [EMAIL_SETUP_GUIDE.md](./EMAIL_SETUP_GUIDE.md) for detailed setup

## 📄 License

This project is licensed under the MIT License.

## 📧 Contact

For questions, support, or collaboration:
- Email: saadbintofayeltahsin@gmail.com

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Supabase](https://supabase.com) for authentication
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for database hosting
- [Tailwind CSS](https://tailwindcss.com) for styling
- All open-source contributors and libraries

---

**Built with ❤️ for pet lovers everywhere**
