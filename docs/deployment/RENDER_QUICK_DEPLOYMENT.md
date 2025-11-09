# 🚀 Render Quick Deployment Guide

## 5 Steps to Deploy

### 1️⃣ Prepare MongoDB Atlas (5 minutes)

1. Visit https://www.mongodb.com/cloud/atlas to register
2. Create a **M0 Free Cluster**
3. **Network Access** → Add `0.0.0.0/0`
4. **Database Access** → Create a user (remember the password)
5. **Connect** → Copy the connection string, replace `<password>` and `<dbname>`

**Example:** `mongodb+srv://user:pass@cluster.mongodb.net/pawcart`

---

### 2️⃣ Prepare Supabase (3 minutes)

1. Visit https://supabase.com to register
2. Create a new project (wait 2-3 minutes)
3. **Settings** → **API** → Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - anon public key → `VITE_SUPABASE_ANON_KEY`

---

### 3️⃣ Generate Session Secret

**PowerShell:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Or visit: https://randomkeygen.com/

---

### 4️⃣ Deploy to Render (5 minutes)

1. Visit https://render.com, log in with GitHub
2. **New +** → **Web Service** → Connect your GitHub repository
3. Configure:
   - **Name:** `pawcart`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** `Free`
4. Add environment variables:
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/pawcart
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   SESSION_SECRET=your-32-character-random-string
   NODE_ENV=production
   PORT=10000
   ```
5. **Create Web Service** → Wait 5-10 minutes for deployment to complete

---

### 5️⃣ Configure Supabase Redirect

1. Get the URL Render gives you (e.g., `https://pawcart.onrender.com`)
2. Go back to Supabase → **Authentication** → **URL Configuration**
3. Add: `https://your-app-name.onrender.com/*`
4. Save

---

## ✅ Done!

Visit your Render URL to start using the application.

---

## ⚠️ Important Notes

- Free tier will sleep after 15 minutes of inactivity, first access requires 30-60 seconds to wake up
- All environment variables must be manually added in Render dashboard
- Ensure MongoDB network access has `0.0.0.0/0` enabled

---

## 🆘 Having Issues?

- Check build logs: Render dashboard → Logs
- Verify all environment variables are correctly set
- Confirm MongoDB connection string format is correct

