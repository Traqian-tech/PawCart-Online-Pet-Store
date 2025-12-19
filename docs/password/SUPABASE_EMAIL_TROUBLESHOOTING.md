# Supabase 密码重置邮件未收到 - 排查指南

## 🔍 问题描述

用户看到 "Reset Email Sent" 消息，但没有收到密码重置邮件。

## 📋 快速检查清单

### 1. 检查浏览器控制台

打开浏览器开发者工具（F12），查看 Console 标签页，查找以下日志：

```
📧 Password Reset Request:
  - Email: your-email@example.com
  - Redirect URL: https://yourdomain.com/reset-password
  - Supabase URL: Configured / Missing
  - Supabase Key: Configured / Missing
```

**如果看到 "Missing"：**
- 检查 `.env` 文件是否包含 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`
- 重启开发服务器

### 2. 检查 Supabase Dashboard

#### 步骤 1: 检查邮件服务配置

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择您的项目
3. 进入 **Authentication** > **Settings**
4. 检查以下设置：

**必需配置：**
- ✅ **Enable email confirmations**: 已开启
- ✅ **Enable email change confirmations**: 已开启（推荐）

**SMTP 配置（推荐用于生产环境）：**

如果使用 Supabase 默认邮件服务（免费版）：
- 默认邮件服务已启用，无需额外配置
- ⚠️ **注意**：免费版可能有发送限制

如果使用自定义 SMTP（推荐）：
1. 在 **SMTP Settings** 中配置：
   - **Sender email**: 您的发送邮箱（如：noreply@yourdomain.com）
   - **Sender name**: 发送者名称（如：PawCart Pet Store）
   - **SMTP host**: SMTP 服务器地址
   - **SMTP port**: 端口号（通常 587 或 465）
   - **SMTP user**: SMTP 用户名
   - **SMTP password**: SMTP 密码
   - **Enable SMTP**: ✅ 开启

#### 步骤 2: 检查重定向 URL 配置

1. 进入 **Authentication** > **URL Configuration**
2. 在 **Redirect URLs** 部分，确保添加了您的重置密码页面 URL：

**开发环境：**
```
http://localhost:5000/reset-password
```

**生产环境：**
```
https://yourdomain.com/reset-password
```

**Replit 环境：**
```
https://your-repl-name.replit.dev/reset-password
```

或者使用通配符：
```
https://*.replit.dev/reset-password
```

⚠️ **重要**：如果不添加重定向 URL，Supabase 可能不会发送邮件！

#### 步骤 3: 检查认证日志

1. 进入 **Authentication** > **Logs**
2. 查找最近的密码重置请求
3. 查看是否有错误信息

**常见错误：**
- `Invalid redirect URL` - 重定向 URL 未配置
- `Email rate limit exceeded` - 发送频率过高
- `SMTP configuration error` - SMTP 配置错误

### 3. 检查邮件模板

1. 进入 **Authentication** > **Email Templates**
2. 选择 **Reset Password** 模板
3. 确保模板包含 `{{ .ConfirmationURL }}` 变量

**示例模板：**
```html
<h2>重置您的密码</h2>
<p>请点击以下链接重置密码：</p>
<p><a href="{{ .ConfirmationURL }}">重置密码</a></p>
```

### 4. 检查环境变量

确保 `.env` 文件包含：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**验证方法：**
1. 检查 `.env` 文件是否存在
2. 确认变量值正确（没有多余空格）
3. 重启开发服务器

---

## 🛠️ 解决方案

### 方案 1: 配置 Supabase 默认邮件服务（最简单）

**适用于：** 开发环境或测试

1. 登录 Supabase Dashboard
2. 进入 **Authentication** > **Settings**
3. 确保 **Enable email confirmations** 已开启
4. 不需要配置 SMTP（使用 Supabase 默认服务）

**限制：**
- 免费版可能有发送频率限制
- 邮件可能被标记为垃圾邮件

### 方案 2: 配置自定义 SMTP（推荐用于生产）

**适用于：** 生产环境

#### 使用 Gmail SMTP

1. **生成 Gmail App Password：**
   - 访问 [Google Account Settings](https://myaccount.google.com/)
   - 进入 **Security** > **2-Step Verification**
   - 启用两步验证
   - 进入 **App passwords**
   - 生成新的应用密码

2. **在 Supabase Dashboard 配置：**
   - **SMTP host**: `smtp.gmail.com`
   - **SMTP port**: `587`
   - **SMTP user**: 您的 Gmail 地址
   - **SMTP password**: 生成的 App Password
   - **Sender email**: 您的 Gmail 地址
   - **Sender name**: 您的应用名称

#### 使用其他邮件服务

**Outlook/Hotmail:**
- SMTP host: `smtp-mail.outlook.com`
- SMTP port: `587`

**SendGrid:**
- SMTP host: `smtp.sendgrid.net`
- SMTP port: `587`
- SMTP user: `apikey`
- SMTP password: 您的 SendGrid API Key

### 方案 3: 检查并修复重定向 URL

1. **获取当前使用的重定向 URL：**
   - 打开浏览器控制台
   - 查找日志：`Password reset redirect URL: ...`

2. **在 Supabase Dashboard 添加：**
   - 进入 **Authentication** > **URL Configuration**
   - 添加完全匹配的 URL（包括协议和路径）

3. **测试：**
   - 重新请求密码重置
   - 检查是否收到邮件

---

## 🔍 详细排查步骤

### 步骤 1: 验证 Supabase 配置

在浏览器控制台运行：

```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configured' : 'Missing');
```

**如果显示 "Missing"：**
- 检查 `.env` 文件
- 确认变量名正确（`VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`）
- 重启开发服务器

### 步骤 2: 检查 Supabase 连接

在浏览器控制台运行：

```javascript
import { supabase } from '@/lib/supabase';
const { data, error } = await supabase.auth.getSession();
console.log('Supabase connection:', error ? 'Failed' : 'OK');
```

**如果连接失败：**
- 检查网络连接
- 验证 Supabase URL 和 Key 是否正确
- 检查 Supabase 项目是否正常运行

### 步骤 3: 测试邮件发送

1. 在 Supabase Dashboard 中：
   - 进入 **Authentication** > **Users**
   - 找到您的用户
   - 点击 **Send password reset email**（如果可用）

2. 检查是否收到邮件

**如果收到：**
- 说明 Supabase 邮件服务正常
- 问题可能在应用代码或重定向 URL 配置

**如果未收到：**
- 检查 Supabase 邮件服务配置
- 查看 **Authentication** > **Logs** 中的错误信息

### 步骤 4: 检查邮件服务状态

在 Supabase Dashboard：
1. 进入 **Authentication** > **Settings**
2. 查看 **SMTP Settings** 部分
3. 如果使用自定义 SMTP，检查：
   - ✅ **Enable SMTP** 已开启
   - ✅ SMTP 配置信息正确
   - ✅ 测试连接是否成功

---

## 🚨 常见错误及解决方案

### 错误 1: "Invalid redirect URL"

**原因：** 重定向 URL 未在 Supabase Dashboard 中配置

**解决方案：**
1. 进入 **Authentication** > **URL Configuration**
2. 添加正确的重定向 URL
3. 确保 URL 格式正确（包含协议和完整路径）

### 错误 2: "Email rate limit exceeded"

**原因：** 发送邮件频率过高

**解决方案：**
1. 等待几分钟后重试
2. 检查 Supabase 项目的使用限制
3. 考虑升级到付费计划

### 错误 3: "SMTP configuration error"

**原因：** SMTP 配置信息错误

**解决方案：**
1. 检查 SMTP 服务器地址和端口
2. 验证用户名和密码
3. 对于 Gmail，确保使用 App Password 而不是普通密码
4. 测试 SMTP 连接

### 错误 4: 邮件进入垃圾邮件文件夹

**原因：** 邮件被标记为垃圾邮件

**解决方案：**
1. 检查垃圾邮件文件夹
2. 将发送者添加到联系人
3. 配置 SPF/DKIM 记录（如果使用自定义域名）
4. 使用专业的邮件服务（如 SendGrid）

---

## 📝 配置检查清单

在部署前，请确认：

- [ ] `.env` 文件包含 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`
- [ ] Supabase Dashboard 中已配置重定向 URL
- [ ] Supabase Dashboard 中邮件服务已启用
- [ ] 如果使用 SMTP，配置信息正确
- [ ] 邮件模板包含 `{{ .ConfirmationURL }}` 变量
- [ ] 已测试密码重置流程
- [ ] 已检查垃圾邮件文件夹
- [ ] 浏览器控制台没有错误信息

---

## 🆘 仍然无法解决？

如果按照以上步骤仍然无法解决问题，请提供以下信息：

1. **浏览器控制台日志**（F12 > Console）
2. **Supabase Dashboard 截图**：
   - Authentication > Settings
   - Authentication > URL Configuration
   - Authentication > Logs（最近的错误）
3. **环境信息**：
   - 开发环境还是生产环境？
   - 使用的部署平台（如 Replit, Render, Vercel）
4. **错误信息**：
   - 浏览器控制台的完整错误信息
   - Supabase Dashboard 中的错误日志

---

## 📚 相关文档

- [Supabase 密码重置配置指南](./SUPABASE_PASSWORD_RESET_CONFIG.md)
- [Supabase 官方文档 - 密码重置](https://supabase.com/docs/guides/auth/auth-password-reset)
- [Supabase 邮件配置](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase URL 配置](https://supabase.com/docs/guides/auth/auth-redirects)

---

**最后更新：** 2025-01-27

























