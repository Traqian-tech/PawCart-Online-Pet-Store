# Environment Variables Configuration Guide

## 📋 Required Environment Variables

### 1. Database Configuration (Choose One)

#### MongoDB Atlas (Recommended)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
```

**Setup Steps:**
1. Visit https://www.mongodb.com/cloud/atlas
2. Register and create free M0 cluster
3. Add `0.0.0.0/0` in Network Access
4. Create database user
5. Get connection string from Clusters > Connect > Connect your application

#### PostgreSQL (Using Neon)
```env
DATABASE_URL=postgresql://user:password@host/dbname
```

**Setup Steps:**
1. Visit https://neon.tech
2. Register and create new project
3. Copy connection string

---

### 2. Supabase Authentication Configuration

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Setup Steps:**
1. Visit https://supabase.com
2. Create new project
3. Get from Settings > API:
   - Project URL → `VITE_SUPABASE_URL`
   - anon public key → `VITE_SUPABASE_ANON_KEY`
4. Add deployment domain in Authentication > URL Configuration

---

### 3. Session Secret

```env
SESSION_SECRET=your-random-secret-key-change-this-in-production
```

**Generation Methods:**

**PowerShell:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Online Tools:**
- https://randomkeygen.com/
- https://www.lastpass.com/features/password-generator

**Requirement:** At least 32 characters random string

---

## 🔧 Optional Environment Variables

### Email Service (For Password Reset)

#### Resend (Recommended)
```env
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=onboarding@resend.dev
```

**Setup Steps:**
1. Visit https://resend.com
2. Register free account
3. Create new key in API Keys
4. Verify domain (or use test domain)

#### Gmail SMTP (Not Recommended)
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
```

---

### AI Chat Service (Only Configure One)

#### DeepSeek (Recommended)
```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```
Get from: https://platform.deepseek.com/

#### Kimi (Moonshot) - New users get 15 CNY free
```env
KIMI_API_KEY=your_kimi_api_key_here
```
Get from: https://platform.moonshot.cn/

#### OpenAI
```env
OPENAI_API_KEY=your_openai_api_key_here
```
Get from: https://platform.openai.com/

#### Groq - Free tier available
```env
GROQ_API_KEY=your_groq_api_key_here
```
Get from: https://console.groq.com/

**Note:** If no AI API is configured, the system will use a rule-based chat engine (limited functionality)

---

### Server Configuration

```env
PORT=5000
NODE_ENV=production
```

**Note:** 
- Render uses `PORT=10000`
- Railway and Fly.io usually auto-set PORT
- Most platforms automatically set `NODE_ENV=production`

---

## 📝 Complete Configuration Examples

### Minimal Configuration (Required)
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
SESSION_SECRET=randomly-generated-32-character-string
NODE_ENV=production
PORT=5000
```

### Full Configuration (Recommended)
```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# Session
SESSION_SECRET=randomly-generated-32-character-string

# Email Service
RESEND_API_KEY=re_xxxxx
FROM_EMAIL=onboarding@resend.dev

# AI Service
DEEPSEEK_API_KEY=sk-xxxxx

# Server
NODE_ENV=production
PORT=5000
```

---

## 🚀 Setting Environment Variables on Deployment Platforms

### Render
1. On Web Service page
2. Click "Environment"
3. Click "Add Environment Variable"
4. Add all variables

### Railway
1. On project page
2. Click "Variables" tab
3. Click "New Variable"
4. Add all variables

### Fly.io
Using command line:
```bash
fly secrets set MONGODB_URI="your_uri"
fly secrets set VITE_SUPABASE_URL="your_url"
# ... other variables
```

Or set in Dashboard:
1. On application page
2. Click "Secrets"
3. Add all variables

---

## ✅ Verify Configuration

After deployment, check:
1. Application can start normally
2. Database connection is successful
3. User registration/login works normally
4. Password reset works (if email service is configured)
5. AI chat works (if AI API is configured)

---

## 🆘 Common Issues

### Environment Variables Not Taking Effect
- Ensure variable names are completely correct (case-sensitive)
- Check for extra spaces
- Redeploy application

### Database Connection Failed
- Check connection string format
- Confirm database allows IP access from deployment platform
- Check if username and password are correct

### Supabase Authentication Failed
- Confirm deployment domain redirect URL is added in Supabase
- Check if URL and Key are correctly copied
- Confirm Supabase project is activated

---

## 📚 Related Documentation

- [Quick Deployment Guide](./QUICK_START.md)
- [Complete Deployment Guide](./DEPLOYMENT_GUIDE.md)



