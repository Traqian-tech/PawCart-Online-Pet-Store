# MongoDB Quick Setup Guide

## 🚀 Quick Option: MongoDB Atlas (5 minutes)

### Step 1: Create Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with your email or Google account

### Step 2: Create Free Cluster
1. Click "Build a Database"
2. Choose **M0 FREE** tier
3. Select your nearest region (e.g., AWS / us-east-1)
4. Cluster Name: Can leave as default or name it "PetShop"
5. Click "Create"

### Step 3: Create Database User
1. You'll see a "Security Quickstart" screen
2. Choose "Username and Password"
3. Create a username (e.g., `petshop`)
4. Create a strong password (save this!)
5. Click "Create User"

### Step 4: Set Network Access
1. On the same screen, scroll down to "Where would you like to connect from?"
2. Choose "My Local Environment"
3. Click "Add My Current IP Address"
4. Or click "Allow Access from Anywhere" (for development only!)
5. Click "Finish and Close"

### Step 5: Get Connection String
1. Click "Connect" button on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. It looks like: `mongodb+srv://petshop:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

### Step 6: Update .env File
1. Open the `.env` file in your project
2. Replace `MONGODB_URI=mongodb://localhost:27017/petshop`
3. With your connection string:
   ```
   MONGODB_URI=mongodb+srv://petshop:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/petshop?retryWrites=true&w=majority
   ```
4. Make sure to:
   - Replace `<password>` with your actual password
   - Add `/petshop` before the `?` to specify the database name

**Example:**
```
MONGODB_URI=mongodb+srv://petshop:MySecurePass123@cluster0.abc123.mongodb.net/petshop?retryWrites=true&w=majority
```

### Step 7: Start Your Application
```bash
npm run dev
```

---

## 🏠 Alternative: Local MongoDB Installation

### Windows Installation
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Run the installer
3. Choose "Complete" installation
4. Install as a Windows Service
5. Default installation is fine

### Verify Installation
```bash
mongod --version
```

### Your .env configuration
The default local configuration is already set:
```
MONGODB_URI=mongodb://localhost:27017/petshop
```

---

## ✅ Verification

After setup, run:
```bash
npm run dev
```

You should see:
- ✅ Environment configuration validated
- ✅ MongoDB connected successfully
- ✅ Admin account created
- Server running on http://localhost:5000

---

## 🔧 Troubleshooting

### "Cannot connect to MongoDB"
- **Atlas**: Check your IP is whitelisted in Network Access
- **Atlas**: Verify your password doesn't contain special characters that need URL encoding
- **Local**: Make sure MongoDB service is running

### "MONGODB_URI not found"
- Make sure `.env` file exists in project root
- Restart your terminal/IDE
- Check for typos in variable name

### Port 5000 already in use
- Change PORT in `.env` file to 3000 or 8080

---

## 📞 Need Help?

If you encounter any issues:
1. Check the error message in the console
2. Verify your MongoDB connection string format
3. Make sure your database user has read/write permissions
4. Check that your IP is whitelisted (for Atlas)

**Default Admin Credentials:**
- Email: admin@petshop.com
- Password: admin123

