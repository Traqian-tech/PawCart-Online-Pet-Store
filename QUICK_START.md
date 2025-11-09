# 🚀 Quick Deployment Guide

Choose the deployment platform that best suits you and follow the steps.

## ⚡ Fastest Deployment: Render (Recommended for Beginners)

### Step 1: Prepare Database

1. Visit https://www.mongodb.com/cloud/atlas
2. Register and create a free M0 cluster
3. Add `0.0.0.0/0` in Network Access
4. Create database user
5. Get connection string (format: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`)

### Step 2: Prepare Supabase

1. Visit https://supabase.com
2. Create new project
3. Get from Settings > API:
   - Project URL → `VITE_SUPABASE_URL`
   - anon public key → `VITE_SUPABASE_ANON_KEY`
4. Add in Authentication > URL Configuration:
   - `https://your-app-name.onrender.com/*`

### Step 3: Deploy to Render

1. Visit https://render.com, sign in with GitHub
2. Click "New +" > "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `pawcart` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
5. Add environment variables:
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   SESSION_SECRET=randomly-generated-long-string
   NODE_ENV=production
   PORT=10000
   ```
6. Click "Create Web Service"
7. Wait for deployment to complete (about 5-10 minutes)

### Step 4: Done!

After deployment, visit the URL provided by Render to use the application!

---

## 🚄 Railway Deployment (Fast and Stable)

### Steps 1-2: Same as above (Prepare database and Supabase)

### Step 3: Deploy to Railway

1. Visit https://railway.app, sign in with GitHub
2. Click "New Project" > "Deploy from GitHub repo"
3. Select your repository
4. Railway will automatically detect Node.js project
5. Add all environment variables in Variables tab (same as above)
6. Wait for deployment to complete

**Advantage**: Railway free tier provides $5 credit, more stable than Render

---

## 🪂 Fly.io Deployment (Global Edge Deployment)

### Step 1: Install Fly CLI

```powershell
# Windows PowerShell
iwr https://fly.io/install.ps1 -useb | iex
```

### Step 2: Login and Initialize

```bash
fly auth login
fly launch
```

### Step 3: Set Environment Variables

```bash
fly secrets set MONGODB_URI="your_mongodb_uri"
fly secrets set VITE_SUPABASE_URL="your_supabase_url"
fly secrets set VITE_SUPABASE_ANON_KEY="your_supabase_key"
fly secrets set SESSION_SECRET="your_random_secret"
fly secrets set NODE_ENV="production"
```

### Step 4: Deploy

```bash
fly deploy
```

---

## 📝 Quick Environment Variable Generation

### SESSION_SECRET Generation

Run in PowerShell:
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Or use online tool: https://randomkeygen.com/

---

## ✅ Post-Deployment Verification

1. **Visit Website** - Should see homepage
2. **Test Registration** - Create new account
3. **Test Login** - Login with newly created account
4. **Test Features** - Browse products, add to cart, etc.

---

## 🆘 Having Issues?

### Application Won't Start
- Check if all environment variables are set
- View error messages in deployment logs
- Confirm database connection string is correct

### Database Connection Failed
- MongoDB Atlas: Check if Network Access allows all IPs (0.0.0.0/0)
- Confirm username and password are correct
- Check connection string format

### Supabase Authentication Failed
- Confirm redirect URL for deployment domain is added in Supabase
- Check if URL and Key are correct
- Confirm Supabase project is activated

---

## 💡 Tips

- **Render Free Tier**: Sleeps after 15 minutes of inactivity, first visit requires ~30 seconds wait
- **Railway**: More stable, but free credit is limited
- **Fly.io**: Global deployment, fast, but configuration is slightly complex
- **Recommendation**: Beginners recommend Render, need stability choose Railway

---

## 📚 Detailed Documentation

See `DEPLOYMENT_GUIDE.md` for more detailed instructions and all platform options.

Happy deploying! 🎉

