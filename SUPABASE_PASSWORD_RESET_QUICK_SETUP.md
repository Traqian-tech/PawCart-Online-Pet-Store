# Supabase 密码重置 - 快速配置指南

## 🚀 5 分钟快速配置

### 步骤 1: Supabase Dashboard 配置（必需）

1. **登录 Supabase Dashboard**
   - 访问：https://app.supabase.com
   - 选择您的项目

2. **添加重定向 URL**
   - 进入：**Authentication** > **URL Configuration**
   - 在 **Redirect URLs** 中添加：
     ```
     http://localhost:5000/reset-password
     https://yourdomain.com/reset-password
     ```
   - 点击 **Save**

3. **验证邮件服务**
   - 进入：**Authentication** > **Settings**
   - 确认 **Enable email confirmations** 已开启

### 步骤 2: 环境变量配置（可选，推荐）

**方式 A: 使用 Replit Secrets**
```
VITE_PASSWORD_RESET_URL=https://your-repl.replit.dev/reset-password
```

**方式 B: 使用 .env 文件（本地开发）**
```env
VITE_PASSWORD_RESET_URL=http://localhost:5000/reset-password
```

**注意**：如果不设置 `VITE_PASSWORD_RESET_URL`，系统会自动检测当前域名。

### 步骤 3: 测试

1. 访问忘记密码页面：`/forgot-password`
2. 输入您的邮箱地址
3. 检查邮箱（包括垃圾邮件文件夹）
4. 点击重置链接
5. 设置新密码

---

## ⚙️ 配置优先级

系统按以下优先级选择重定向 URL：

1. **环境变量** `VITE_PASSWORD_RESET_URL`（如果设置）
2. **生产域名**（自动检测非 localhost 域名）
3. **Replit 环境**（自动检测 replit.dev 域名）
4. **当前域名**（默认回退）

---

## 🔧 常见配置场景

### 场景 1: 本地开发
```env
# .env
VITE_PASSWORD_RESET_URL=http://localhost:5000/reset-password
```

### 场景 2: Replit 部署
```env
# Replit Secrets
VITE_PASSWORD_RESET_URL=https://your-repl-name.replit.dev/reset-password
```

### 场景 3: 自定义域名
```env
# Replit Secrets 或 .env
VITE_PASSWORD_RESET_URL=https://meowmeowpetshop.com/reset-password
```

### 场景 4: 多环境配置
```env
# .env.development
VITE_PASSWORD_RESET_URL=http://localhost:5000/reset-password

# .env.production
VITE_PASSWORD_RESET_URL=https://meowmeowpetshop.com/reset-password
```

---

## ✅ 配置检查清单

- [ ] Supabase Dashboard 中已添加重定向 URL
- [ ] 环境变量已设置（可选）
- [ ] 已测试发送重置邮件
- [ ] 已验证重置链接可访问
- [ ] 已确认可以成功重置密码

---

## 🐛 快速故障排查

**问题：收不到邮件**
- 检查垃圾邮件文件夹
- 验证 Supabase Dashboard > Authentication > Settings 中的邮件配置

**问题：重置链接无效**
- 确认 Supabase Dashboard 中的重定向 URL 已添加
- 检查环境变量 `VITE_PASSWORD_RESET_URL` 是否正确

**问题：链接过期**
- 默认 1 小时后过期，重新请求重置
- 可在 Supabase Dashboard 中调整过期时间

---

## 📚 详细文档

查看 `SUPABASE_PASSWORD_RESET_CONFIG.md` 获取完整配置说明。

---

**提示**：配置完成后，重启应用以确保环境变量生效。




























