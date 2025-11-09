# 🚀 Render Deployment Guide - Step by Step

This guide will walk you through deploying PawCart to Render in just a few minutes.

## 📋 Prerequisites

Before starting, make sure you have:
- ✅ A GitHub account
- ✅ Your code pushed to a GitHub repository
- ✅ 15-20 minutes to complete the setup

---

## Step 1: Prepare MongoDB Atlas Database (Free)

1. **Visit MongoDB Atlas**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for a free account (or log in)

2. **Create a Free Cluster**
   - Click "Build a Database"
   - Select **M0 Free** tier
   - Choose a cloud provider and region (closest to you)
   - Click "Create"

3. **Configure Network Access**
   - Go to **Network Access** in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (adds `0.0.0.0/0`)
   - Click "Confirm"

4. **Create Database User**
   - Go to **Database Access** in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Enter a username and generate a secure password
   - **Save the password** (you'll need it!)
   - Set user privileges to "Atlas Admin"
   - Click "Add User"

5. **Get Connection String**
   - Go to **Database** > **Connect**
   - Click "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with your database name (e.g., `pawcart`)
   - **Example:** `mongodb+srv://username:password@cluster.mongodb.net/pawcart`

---

## Step 2: Prepare Supabase Authentication (Free)

1. **Visit Supabase**
   - Go to https://supabase.com
   - Sign up for a free account (or log in)

2. **Create a New Project**
   - Click "New Project"
   - Enter project name (e.g., "PawCart")
   - Enter a database password (save it!)
   - Select a region
   - Click "Create new project"
   - Wait 2-3 minutes for project to be ready

3. **Get API Credentials**
   - Go to **Settings** > **API**
   - Copy the following:
     - **Project URL** → This is your `VITE_SUPABASE_URL`
     - **anon public key** → This is your `VITE_SUPABASE_ANON_KEY`

4. **Configure Redirect URLs** (Do this after deployment)
   - Go to **Authentication** > **URL Configuration**
   - Add your Render URL: `https://your-app-name.onrender.com/*`
   - Click "Save"

---

## Step 3: Generate Session Secret

Generate a random 32+ character string for `SESSION_SECRET`:

**PowerShell (Windows):**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Online Tool:**
- Visit https://randomkeygen.com/
- Copy a "CodeIgniter Encryption Keys" value

**Save this value** - you'll need it in the next step!

---

## Step 4: Deploy to Render

1. **Sign in to Render**
   - Visit https://render.com
   - Click "Get Started for Free"
   - Sign in with your **GitHub account**

2. **Create New Web Service**
   - Click "New +" button (top right)
   - Select "Web Service"

3. **Connect Your Repository**
   - Click "Connect account" if needed
   - Select your GitHub repository
   - Click "Connect"

4. **Configure Service Settings**
   - **Name:** `pawcart` (or your preferred name)
   - **Region:** Choose closest to you
   - **Branch:** `main` (or your default branch)
   - **Root Directory:** Leave empty (or `.` if needed)
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Select **Free**

5. **Add Environment Variables**
   Click "Add Environment Variable" and add each of these:

   **Required Variables:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pawcart
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SESSION_SECRET=your-32-character-random-string-here
   NODE_ENV=production
   PORT=10000
   ```

   **Optional Variables (Recommended):**
   ```
   DEEPSEEK_API_KEY=sk-your-deepseek-key (for AI chat)
   RESEND_API_KEY=re_your_resend_key (for email features)
   FROM_EMAIL=onboarding@resend.dev
   ```

6. **Create Web Service**
   - Review all settings
   - Click "Create Web Service"
   - Render will start building and deploying your app

7. **Wait for Deployment**
   - First deployment takes 5-10 minutes
   - Watch the build logs for progress
   - You'll see "Your service is live" when ready

---

## Step 5: Configure Supabase Redirect URL

After deployment, you'll get a URL like `https://pawcart.onrender.com`

1. Go back to Supabase
2. Navigate to **Authentication** > **URL Configuration**
3. Add your Render URL: `https://your-app-name.onrender.com/*`
4. Click "Save"

---

## Step 6: Verify Deployment

1. **Visit Your App**
   - Open the URL provided by Render
   - You should see the PawCart homepage

2. **Test Features**
   - ✅ Create a new account
   - ✅ Log in
   - ✅ Browse products
   - ✅ Add items to cart
   - ✅ Test checkout flow

---

## 🎉 Success!

Your PawCart application is now live on Render!

**Your app URL:** `https://your-app-name.onrender.com`

---

## 📝 Important Notes

### Free Tier Limitations

- **Sleep Mode:** Free services sleep after 15 minutes of inactivity
- **First Visit:** May take 30-60 seconds to wake up
- **Monthly Hours:** 750 hours/month (usually enough for personal projects)

### Updating Your App

- Push changes to your GitHub repository
- Render will automatically detect and redeploy
- Or manually trigger deployment from Render dashboard

### Viewing Logs

- Go to your service in Render dashboard
- Click "Logs" tab
- View real-time logs and errors

---

## 🆘 Troubleshooting

### App Won't Start

1. **Check Environment Variables**
   - Ensure all required variables are set
   - Verify `MONGODB_URI` format is correct
   - Check `SESSION_SECRET` is at least 32 characters

2. **Check Build Logs**
   - Go to Render dashboard > Logs
   - Look for error messages
   - Common issues:
     - Missing environment variables
     - Build command errors
     - Port configuration issues

### Database Connection Failed

1. **MongoDB Atlas Network Access**
   - Ensure `0.0.0.0/0` is added in Network Access
   - Wait 2-3 minutes after adding IP

2. **Connection String**
   - Verify username and password are correct
   - Check database name is included
   - Ensure special characters in password are URL-encoded

### Authentication Not Working

1. **Supabase Configuration**
   - Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
   - Ensure redirect URL is added in Supabase
   - Check Supabase project is active

2. **CORS Issues**
   - Supabase should automatically handle CORS
   - If issues persist, check Supabase project settings

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [Supabase Documentation](https://supabase.com/docs)
- [Project README](./README.md)
- [Environment Variables Guide](./ENV_VARIABLES.md)

---

## 💡 Pro Tips

1. **Use Render Blueprint (render.yaml)**
   - Your project includes `render.yaml`
   - You can use "New Blueprint" in Render to auto-configure
   - Still need to add environment variables manually

2. **Monitor Your App**
   - Set up Render alerts for downtime
   - Monitor usage in Render dashboard

3. **Custom Domain**
   - Free tier supports custom domains
   - Add in Render dashboard > Settings > Custom Domains

---

Happy deploying! 🚀



