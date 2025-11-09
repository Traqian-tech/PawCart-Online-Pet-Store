# Local Deployment Guide - MeowMeowPetShop

## Prerequisites
- Node.js 18+ installed
- MongoDB (either local or cloud via MongoDB Atlas)

## Step 1: MongoDB Setup

### Option A: MongoDB Atlas (Recommended - Free & Easy)

1. **Create a MongoDB Atlas Account**
   - Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
   - Sign up for free

2. **Create a Free Cluster**
   - Click "Build a Database"
   - Choose "M0 Free" tier
   - Select your preferred region
   - Click "Create"

3. **Configure Database Access**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Create username and password (save these!)
   - Grant "Read and write to any database" permission

4. **Configure Network Access**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Confirm

5. **Get Connection String**
   - Go to "Database" in left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/petshop`

### Option B: Local MongoDB Installation

1. **Download MongoDB Community Server**
   - Go to [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
   - Download for Windows
   - Run the installer
   - Choose "Complete" installation
   - Install MongoDB as a service

2. **Verify Installation**
   ```powershell
   mongod --version
   ```

3. **Your connection string will be:**
   ```
   mongodb://localhost:27017/petshop
   ```

## Step 2: Environment Configuration

1. **Create `.env` file** in the project root:
   ```env
   # MongoDB Configuration
   MONGODB_URI=your_mongodb_connection_string_here
   
   # Supabase Configuration (provided for testing)
   VITE_SUPABASE_URL=https://ghqivevrwfkmdmduyjzv.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdocWl2ZXZyd2ZrbWRtZHV5anp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NjAwODUsImV4cCI6MjA2OTAzNjA4NX0.FfQ8WT_ZKzAD5-mnAwrzX_F0JtHDjVdCxhB1y2M3aaY
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

2. **Replace** `your_mongodb_connection_string_here` with your actual MongoDB URI

## Step 3: Install Dependencies

```powershell
npm install
```

## Step 4: Start the Application

### Development Mode (with hot reload)
```powershell
npm run dev
```

### Production Mode
```powershell
npm run build
npm start
```

## Step 5: Access the Application

Open your browser and navigate to:
- **Local:** [http://localhost:5000](http://localhost:5000)

## Default Admin Account

The application automatically creates an admin account on first start:
- **Email:** admin@petshop.com
- **Password:** admin123
- **Note:** Change this password after first login!

## Features Available

✅ User Registration & Login (via Supabase)
✅ Browse Products by Category
✅ Product Search & Filtering
✅ Shopping Cart
✅ Product Reviews & Ratings
✅ Admin Dashboard
✅ Product Management
✅ User Analytics

## Troubleshooting

### Issue: "MONGODB_URI not found"
- Make sure `.env` file exists in project root
- Check that `MONGODB_URI` is properly set
- Restart the development server

### Issue: "Cannot connect to MongoDB"
- **Atlas:** Check your IP is whitelisted in Network Access
- **Atlas:** Verify username/password in connection string
- **Local:** Make sure MongoDB service is running

### Issue: "Port 5000 already in use"
- Change PORT in `.env` file to another port (e.g., 3000, 8080)

### Issue: Supabase Authentication Not Working
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Clear browser cache and cookies
- Check browser console for errors

## Project Structure

```
MeowMeowPetShop_Construction-main/
├── client/                 # Frontend React application
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Page components
│       ├── contexts/       # React contexts
│       └── hooks/          # Custom hooks
├── server/                 # Backend Express server
│   ├── index.ts            # Main server file
│   ├── routes.ts           # API routes
│   ├── mongodb.ts          # Database connection
│   └── admin-setup.ts      # Admin account setup
├── shared/                 # Shared types and models
│   └── models.ts           # Mongoose schemas
└── uploads/                # Product images

```

## Available Scripts

- `npm run dev` - Start development server (frontend + backend)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run check:env` - Validate environment variables

## Next Steps

1. ✅ Complete MongoDB setup
2. ✅ Create `.env` file
3. ✅ Install dependencies
4. ✅ Start the application
5. 🎉 Start developing!

## Support

For issues or questions:
- Check the troubleshooting section
- Review server console logs
- Check browser console for frontend errors

---

**Happy Coding! 🐱🐶**

