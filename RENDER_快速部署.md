# 🚀 Render 快速部署指南

## 5 步完成部署

### 1️⃣ 准备 MongoDB Atlas（5分钟）

1. 访问 https://www.mongodb.com/cloud/atlas 注册
2. 创建 **M0 免费集群**
3. **Network Access** → 添加 `0.0.0.0/0`
4. **Database Access** → 创建用户（记住密码）
5. **Connect** → 复制连接字符串，替换 `<password>` 和 `<dbname>`

**示例：** `mongodb+srv://user:pass@cluster.mongodb.net/pawcart`

---

### 2️⃣ 准备 Supabase（3分钟）

1. 访问 https://supabase.com 注册
2. 创建新项目（等待 2-3 分钟）
3. **Settings** → **API** → 复制：
   - Project URL → `VITE_SUPABASE_URL`
   - anon public key → `VITE_SUPABASE_ANON_KEY`

---

### 3️⃣ 生成 Session Secret

**PowerShell：**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

或访问：https://randomkeygen.com/

---

### 4️⃣ 部署到 Render（5分钟）

1. 访问 https://render.com，用 GitHub 登录
2. **New +** → **Web Service** → 连接你的 GitHub 仓库
3. 配置：
   - **Name:** `pawcart`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** `Free`
4. 添加环境变量：
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/pawcart
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGci...
   SESSION_SECRET=你的32位随机字符串
   NODE_ENV=production
   PORT=10000
   ```
5. **Create Web Service** → 等待 5-10 分钟部署完成

---

### 5️⃣ 配置 Supabase 重定向

1. 获取 Render 给你的 URL（如：`https://pawcart.onrender.com`）
2. 回到 Supabase → **Authentication** → **URL Configuration**
3. 添加：`https://你的应用名.onrender.com/*`
4. 保存

---

## ✅ 完成！

访问你的 Render URL 即可使用。

---

## ⚠️ 注意事项

- 免费版会在 15 分钟无活动后休眠，首次访问需等待 30-60 秒唤醒
- 所有环境变量必须在 Render 后台手动添加
- 确保 MongoDB 网络访问已开放 `0.0.0.0/0`

---

## 🆘 遇到问题？

- 查看构建日志：Render 后台 → Logs
- 检查环境变量是否全部正确填写
- 确认 MongoDB 连接字符串格式正确

