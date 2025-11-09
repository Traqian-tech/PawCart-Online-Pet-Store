# 🔧 修复邮件发送问题 - 完整指南

## ❌ 你遇到的问题

```
Failed to Send Verification Code
Failed to send verification email. Please check email service configuration and try again later.
```

---

## 🎯 问题原因

**服务器在 `.env` 文件更新之前启动，所以没有读取到新的 `RESEND_API_KEY` 配置。**

---

## ✅ 解决方案（按顺序执行）

### 步骤 1：验证 .env 文件配置 ✅

运行以下命令检查配置：

```powershell
Get-Content .env -Tail 5
```

**你应该看到**：

```env
# Resend Email Service
RESEND_API_KEY=re_cm6848xV_CNvD6qHfhxQ9ZvMViqRigpbS
FROM_EMAIL=onboarding@resend.dev
```

✅ **这一步已完成！**

---

### 步骤 2：停止所有 Node.js 进程 🛑

**重要**：服务器必须重启才能读取新的环境变量！

#### 选项 A：在你的开发服务器终端按 `Ctrl + C`

如果你在一个终端中运行了 `npm run dev`，直接按 **`Ctrl + C`** 停止。

#### 选项 B：手动停止所有 Node.js 进程

如果不确定哪个是开发服务器，运行：

```powershell
# 停止所有 Node.js 进程
Get-Process node | Stop-Process -Force
```

⚠️ **警告**：这会停止所有 Node.js 进程，包括其他项目的服务器。

---

### 步骤 3：重新启动开发服务器 🚀

在项目根目录运行：

```powershell
npm run dev
```

**预期输出**：

```bash
> dev
> run-p dev:backend dev:frontend

> dev:backend
> tsx watch server/index.ts

> dev:frontend
> vite

🧪 Testing Resend email configuration...
✅ RESEND_API_KEY is configured
📧 FROM_EMAIL: onboarding@resend.dev
✅ Email service initialized

  VITE v6.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose

Server running on http://localhost:5000
```

**关键检查点**：
- ✅ 你必须看到 **"✅ RESEND_API_KEY is configured"**
- ✅ 你必须看到 **"✅ Email service initialized"**

如果没有看到这些消息，说明环境变量没有正确加载。

---

### 步骤 4：测试密码修改功能 🧪

1. **打开浏览器**
   - 访问 `http://localhost:5173/dashboard`
   - 或点击你当前打开的 Dashboard 页面

2. **点击 "Change Password" 按钮**
   - 在 "Account Security" 部分

3. **点击 "Send Verification Code"**
   - 等待几秒钟

4. **检查结果**：

#### ✅ 成功的标志：

**前端提示**：
```
Verification Code Sent
Please check your email for the 6-digit verification code.
```

**浏览器控制台** (F12)：
```
✅ Email sent successfully
```

**服务器日志**：
```
✅ Email sent successfully to your-email@example.com (ID: abc123-...)
```

#### ❌ 失败的标志：

如果还是显示：
```
Failed to Send Verification Code
```

请继续到步骤 5 进行进一步诊断。

---

### 步骤 5：运行诊断脚本 🔍

如果步骤 4 还是失败，运行诊断：

```powershell
node test-resend-api.js
```

**预期输出（成功）**：

```
🧪 Testing Resend API Configuration

==================================================

1️⃣ Checking Environment Variables:
   RESEND_API_KEY: ✅ Configured
   FROM_EMAIL: onboarding@resend.dev

2️⃣ Validating API Key Format:
   ✅ API Key format looks correct

3️⃣ Testing Resend API Connection:
   Sending test request to Resend API...
   Response Status: 200 OK
   Response Body: {
     "id": "abc123-..."
   }

✅ SUCCESS! Resend API is working correctly!
   Email ID: abc123-...
```

#### 可能的错误及解决方案

| 错误 | 原因 | 解决方法 |
|------|------|----------|
| `RESEND_API_KEY: ❌ Not configured` | 环境变量未加载 | 确保重启了服务器 |
| `fetch failed` | 网络问题 | 检查网络连接 |
| `401 Unauthorized` | API Key 无效 | 重新生成 API Key |
| `403 Forbidden` | API Key 没有发送权限 | 检查 API Key 权限设置 |
| `Invalid API key format` | API Key 格式错误 | 确认从 Resend 复制的完整 Key |

---

## 🔍 进一步诊断

### 检查 API Key 是否有效

1. 访问 **https://resend.com/api-keys**
2. 登录你的账户
3. 检查你的 API Key 是否存在且状态为 **Active**

### 重新生成 API Key

如果 API Key 无效：

1. 在 Resend Dashboard 删除旧的 API Key
2. 创建新的 API Key
3. 复制新的 Key
4. 更新 `.env` 文件：

```powershell
# 用新的 API Key 替换
$newApiKey = "re_YOUR_NEW_API_KEY"
(Get-Content .env) -replace 'RESEND_API_KEY=.*', "RESEND_API_KEY=$newApiKey" | Set-Content .env
```

5. 重启服务器

---

## 🎯 快速检查清单

- [ ] `.env` 文件包含 `RESEND_API_KEY=re_...`
- [ ] `.env` 文件包含 `FROM_EMAIL=onboarding@resend.dev`
- [ ] 已停止旧的服务器进程
- [ ] 已运行 `npm run dev` 重启服务器
- [ ] 服务器日志显示 "✅ RESEND_API_KEY is configured"
- [ ] 服务器日志显示 "✅ Email service initialized"
- [ ] 测试发送验证码功能
- [ ] 检查邮箱（包括垃圾邮件文件夹）

---

## 📧 如果仍然失败

### 检查服务器错误日志

在服务器终端中查找以下错误：

```bash
❌ Resend API error: ...
❌ Failed to send email via Resend: ...
❌ Resend API key not configured
```

复制完整的错误信息，我会帮你进一步诊断。

### 网络防火墙问题

如果你在公司网络或使用 VPN：
- 尝试关闭 VPN
- 检查防火墙是否阻止了 `api.resend.com`
- 尝试使用手机热点测试

---

## 💡 替代方案

如果 Resend 无法工作，你可以：

1. **使用 Supabase 邮件功能**（已集成在项目中）
2. **使用 Gmail SMTP**（需要配置 App Password）
3. **使用其他邮件服务**（SendGrid, Mailgun 等）

---

## 🆘 还是不行？

请提供以下信息：

1. 服务器启动时的完整日志（从运行 `npm run dev` 开始）
2. 点击 "Send Verification Code" 后的服务器日志
3. 浏览器控制台的错误信息（按 F12）
4. `test-resend-api.js` 的输出

我会根据这些信息帮你解决！

---

## ✅ 成功标志

当一切正常时，你会：

1. **收到一封邮件**（标题：🔐 Password Change Verification Code - MeowMeow PetShop）
2. **邮件包含 6 位验证码**（例如：123456）
3. **可以在 Dashboard 中输入验证码并修改密码**

祝好运！🚀









