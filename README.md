# PawCart - Online Pet Store E-commerce Platform

A full-stack e-commerce application for pet products with membership system, wallet rewards, and customer support features.

## 🚀 Features

### Core E-commerce Features
- 🛍️ **Complete Shopping Experience** - Product browsing, search, filtering, and sorting
- 🛒 **Shopping Cart & Checkout** - Cart management and checkout process
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
- 📚 **Help Center** - FAQ and support articles
- 💬 **Live Support** - Direct communication with support team

### Admin Dashboard
- 📊 **Analytics & Statistics** - View sales data, user analytics, and business insights
- 👥 **User Management** - Manage users, memberships, and permissions
- 📦 **Product Management** - Add, edit, and manage products and inventory
- 🎫 **Coupon Management** - Create and manage discount codes and promotions
- 📈 **Order Management** - Track and manage all orders and deliveries
- 💰 **Wallet System Management** - Monitor wallet transactions and rewards

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
- **Email Service**: SMTP
- **AI Chat**: DeepSeek, OpenAI, Groq, or Kimi API support

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

You have two options:

**Option 1: Use the provided `.env` file (Recommended)**
- If the project includes a `.env` file, you can use it directly
- Make sure to update the values with your own credentials

**Option 2: Create a new `.env` file**

Create a `.env` file in the root directory with the following variables:

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
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# AI Chat Service (Optional - for AI customer support)
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### 4. Set Up MongoDB Atlas

You have two options:

**Option 1: Use the provided database (Recommended for quick start)**
- The project includes a pre-configured MongoDB Atlas connection
- If you're using the provided `.env` file, the database is already configured
- You can start using the application immediately without setting up your own database

**Option 2: Set up your own MongoDB Atlas**

1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free M0 cluster
3. Add `0.0.0.0/0` in Network Access (for development)
4. Create a database user
5. Get connection string from Clusters > Connect > Connect your application
6. Replace `<password>` and `<dbname>` in the connection string
7. Update the `MONGODB_URI` in your `.env` file

### 5. Set Up Supabase

You have two options:

**Option 1: Use the provided database (Recommended for quick start)**
- The project includes a pre-configured Supabase connection
- If you're using the provided `.env` file, Supabase is already configured
- You can start using the application immediately without setting up your own Supabase project

**Option 2: Set up your own Supabase**

1. Visit [Supabase](https://supabase.com)
2. Create a new project
3. Go to Settings > API
4. Copy Project URL and anon public key
5. Add your local URL (`http://localhost:5000/*`) in Authentication > URL Configuration
6. Update `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your `.env` file

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
│   │   ├── contexts/      # React contexts (cart, wallet, auth)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions and configurations
│   │   └── pages/         # Page components
│   └── public/            # Static assets
├── server/                # Backend Express server
│   ├── routes.ts          # API routes
│   ├── wallet-routes.ts   # Wallet system routes
│   ├── mongodb.ts         # MongoDB connection
│   └── index.ts           # Server entry point
├── shared/                # Shared code between frontend and backend
│   └── models.ts          # MongoDB schemas and TypeScript types
├── render.yaml            # Render deployment configuration
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
- `npm run membership-cron` - Run membership email notifications

## 🌐 Deployment

### Render Cloud Deployment

This project is **deployed and running** on [Render](https://render.com), a cloud platform for hosting web applications.

**🌐 Live Production Site**: https://pawcart-online-pet-store.onrender.com/

The application is fully functional and accessible at the above URL. You can visit it to see the live version of PawCart.

#### For Local Development

If you want to deploy your own instance or make changes, follow these steps:

1. **Push your code to GitHub**

2. **Create a new Web Service on Render**
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` configuration file

3. **Set Environment Variables in Render Dashboard**

   **Required:**
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `SESSION_SECRET` - A random 32-character secret key
   - `NODE_ENV=production`
   - `PORT=10000` (Render uses port 10000)

   **Optional:**
   - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD` (for email features)
   - `DEEPSEEK_API_KEY` or other AI API keys (for AI chat)

4. **Configure Supabase**
   - Add your Render URL (`https://pawcart-online-pet-store.onrender.com/*`) to Supabase Authentication > URL Configuration

5. **Deploy**
   - Render will automatically build and deploy your application
   - The first deployment may take a few minutes

#### Configuration File

The project includes `render.yaml` which configures:
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Environment: Node.js
- Port: 10000

### Database Access

For instructors or reviewers who need to view the database data:

#### 🌐 Direct Database View (Recommended)

**Click here to view database data directly**: https://pawcart-online-pet-store.onrender.com/database-view

This public read-only page provides:
- **Database Statistics**: Overview of users, products, orders, and more
- **Sample Data**: Recent users, products, and orders (limited to 10 items each for privacy)
- **MongoDB Details**: Complete collection statistics and sample data
- **Supabase Details**: Authentication user statistics
- **No Login Required**: Direct access without any credentials

The page includes tabs for:
- Overview: Key statistics and membership distribution
- Users: User statistics and recent user samples
- Products: Product statistics, categories, and brands
- Orders: Order statistics and recent order samples
- MongoDB Details: Complete MongoDB collection information
- Supabase Details: Authentication system information

#### Alternative Access Methods

**MongoDB Atlas**:
- The MongoDB database is hosted on MongoDB Atlas
- Connection string available in the `.env` file (MONGODB_URI)
- For direct database access, contact the project owner

**Supabase**:
- Supabase is primarily used for authentication
- Main application data is stored in MongoDB
- Project URL and credentials available in the `.env` file

**Note**: The public database view page provides read-only access to database statistics and sample data. For full database access credentials, please contact the project owner at boqianjlu@gmail.com

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

## 🔧 Configuration

### Email Service Setup

For password reset and membership notifications, configure SMTP:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**Note**: For Gmail, you need to use an App Password instead of your regular password. Generate one in your Google Account settings under Security > 2-Step Verification > App passwords.

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
- Email: `admin`
- Password: `admin123`

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

## 📄 License

This project is licensed under the MIT License.

## 📧 Contact

For questions, support, or collaboration:
- Email: boqianjlu@gmail.com

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Supabase](https://supabase.com) for authentication
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for database hosting
- [Tailwind CSS](https://tailwindcss.com) for styling
- All open-source contributors and libraries

---

**Built with ❤️ for pet lovers everywhere**
