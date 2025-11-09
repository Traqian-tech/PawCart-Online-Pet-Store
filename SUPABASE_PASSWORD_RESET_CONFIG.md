# Supabase 密码重置功能配置指南

本文档说明如何配置和自定义 Supabase 密码重置功能的相关设置。

## 📋 目录

1. [Supabase Dashboard 配置](#supabase-dashboard-配置)
2. [代码中的配置](#代码中的配置)
3. [邮件模板自定义](#邮件模板自定义)
4. [重定向 URL 配置](#重定向-url-配置)
5. [常见问题排查](#常见问题排查)

---

## 🔧 Supabase Dashboard 配置

### 1. 访问 Supabase Dashboard

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择您的项目

### 2. 配置重定向 URL（重要）

**步骤：**
1. 进入 **Authentication** > **URL Configuration**
2. 在 **Redirect URLs** 部分，添加您的应用域名：
   - 开发环境：`http://localhost:5000/reset-password`
   - 生产环境：`https://yourdomain.com/reset-password`
   - Replit 环境：`https://your-repl.replit.dev/reset-password`

**示例：**
```
http://localhost:5000/reset-password
https://meowmeowpetshop.com/reset-password
https://*.replit.dev/reset-password
```

⚠️ **重要**：如果不添加重定向 URL，密码重置链接将无法正常工作！

### 3. 配置邮件服务

**步骤：**
1. 进入 **Authentication** > **Settings**
2. 配置以下选项：

#### 使用 Supabase 默认邮件服务（免费版）
- **Enable email confirmations**: 开启（推荐）
- **Enable email change confirmations**: 开启（推荐）
- **Secure email change**: 开启（推荐，增强安全性）

#### 使用自定义 SMTP 服务（推荐用于生产环境）
1. 在 **SMTP Settings** 中配置：
   - **Sender email**: 您的发送邮箱（如：noreply@yourdomain.com）
   - **Sender name**: 发送者名称（如：MeowMeow Pet Shop）
   - **SMTP host**: SMTP 服务器地址（如：smtp.gmail.com）
   - **SMTP port**: 端口号（通常 587 或 465）
   - **SMTP user**: SMTP 用户名
   - **SMTP password**: SMTP 密码
   - **Enable SMTP**: 开启

### 4. 配置邮件模板

**步骤：**
1. 进入 **Authentication** > **Email Templates**
2. 选择 **Reset Password** 模板
3. 自定义邮件内容：

**可用的模板变量：**
- `{{ .ConfirmationURL }}` - 密码重置链接
- `{{ .Email }}` - 用户邮箱
- `{{ .Token }}` - 重置令牌（通常不需要直接使用）
- `{{ .TokenHash }}` - 令牌哈希
- `{{ .SiteURL }}` - 站点 URL

**示例模板：**
```html
<h2>重置您的密码</h2>
<p>您好，</p>
<p>我们收到了您重置密码的请求。请点击下面的链接来设置新密码：</p>
<p><a href="{{ .ConfirmationURL }}">重置密码</a></p>
<p>如果这不是您的操作，请忽略此邮件。</p>
<p>此链接将在 1 小时后过期。</p>
<p>谢谢，<br>MeowMeow Pet Shop 团队</p>
```

---

## 💻 代码中的配置

### 1. 环境变量配置

确保在 `.env` 文件或 Replit Secrets 中设置了：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. 修改重定向 URL 逻辑

文件位置：`client/src/pages/forgot-password.tsx`

**当前实现：**
```typescript
function getPasswordResetUrl(): string {
  const currentOrigin = window.location.origin;
  
  // 生产环境
  if (!currentOrigin.includes('localhost') && !currentOrigin.includes('127.0.0.1')) {
    return `${currentOrigin}/reset-password`;
  }
  
  // Replit 环境检测
  const replitMatch = href.match(/https?:\/\/([^\/]+\.replit\.dev)/);
  if (replitMatch) {
    return `https://${replitMatch[1]}/reset-password`;
  }
  
  // 默认
  return `${currentOrigin}/reset-password`;
}
```

**自定义配置：**

如果需要为不同环境设置不同的重定向 URL，可以修改为：

```typescript
function getPasswordResetUrl(): string {
  // 方式 1: 使用环境变量
  const customRedirectUrl = import.meta.env.VITE_PASSWORD_RESET_URL;
  if (customRedirectUrl) {
    return customRedirectUrl;
  }
  
  // 方式 2: 根据域名判断
  const currentOrigin = window.location.origin;
  const hostname = window.location.hostname;
  
  // 开发环境
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000/reset-password';
  }
  
  // 生产环境
  if (hostname.includes('yourdomain.com')) {
    return 'https://yourdomain.com/reset-password';
  }
  
  // Replit 环境
  if (hostname.includes('replit.dev')) {
    return `${currentOrigin}/reset-password`;
  }
  
  // 默认
  return `${currentOrigin}/reset-password`;
}
```

### 3. 添加额外的重置选项

在 `forgot-password.tsx` 中，可以添加更多配置选项：

```typescript
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: redirectUrl,
  // 可选：自定义邮件主题
  // emailRedirectTo: redirectUrl,
  // 可选：添加额外的数据
  // options: {
  //   data: {
  //     customKey: 'customValue'
  //   }
  // }
})
```

---

## 📧 邮件模板自定义

### 1. HTML 邮件模板示例

在 Supabase Dashboard > Authentication > Email Templates > Reset Password：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { 
      display: inline-block; 
      padding: 12px 24px; 
      background-color: #4CAF50; 
      color: white; 
      text-decoration: none; 
      border-radius: 5px; 
      margin: 20px 0;
    }
    .footer { margin-top: 30px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h2>🔐 重置您的密码</h2>
    <p>您好，</p>
    <p>我们收到了您重置 MeowMeow Pet Shop 账户密码的请求。</p>
    <p>请点击下面的按钮来设置新密码：</p>
    <p style="text-align: center;">
      <a href="{{ .ConfirmationURL }}" class="button">重置密码</a>
    </p>
    <p>或者复制以下链接到浏览器：</p>
    <p style="word-break: break-all; color: #0066cc;">{{ .ConfirmationURL }}</p>
    <p><strong>重要提示：</strong></p>
    <ul>
      <li>此链接将在 1 小时后过期</li>
      <li>如果您没有请求重置密码，请忽略此邮件</li>
      <li>为了您的账户安全，请不要将此链接分享给他人</li>
    </ul>
    <div class="footer">
      <p>此邮件由 MeowMeow Pet Shop 自动发送，请勿回复。</p>
      <p>© 2025 MeowMeow Pet Shop. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

### 2. 纯文本邮件模板

```text
重置您的密码

您好，

我们收到了您重置 MeowMeow Pet Shop 账户密码的请求。

请访问以下链接来设置新密码：
{{ .ConfirmationURL }}

此链接将在 1 小时后过期。

如果您没有请求重置密码，请忽略此邮件。

谢谢，
MeowMeow Pet Shop 团队
```

---

## 🔗 重定向 URL 配置

### 开发环境

**本地开发：**
```
http://localhost:5000/reset-password
```

**在 Supabase Dashboard 中添加：**
1. Authentication > URL Configuration
2. 添加：`http://localhost:5000/reset-password`

### 生产环境

**自定义域名：**
```
https://yourdomain.com/reset-password
```

**Replit 环境：**
```
https://your-repl-name.replit.dev/reset-password
```

**通配符配置（Replit）：**
```
https://*.replit.dev/reset-password
```

### 验证重定向 URL

1. 确保 URL 格式正确（包含协议 `http://` 或 `https://`）
2. 确保路径以 `/reset-password` 结尾
3. 在 Supabase Dashboard 中保存配置
4. 测试密码重置流程

---

## 🔍 常见问题排查

### 问题 1: 密码重置邮件未收到

**可能原因：**
- 邮件被标记为垃圾邮件
- SMTP 配置错误
- 邮箱地址输入错误

**解决方案：**
1. 检查垃圾邮件文件夹
2. 验证 Supabase Dashboard 中的 SMTP 设置
3. 查看 Supabase Dashboard > Authentication > Logs 中的错误信息

### 问题 2: 重置链接无效或过期

**可能原因：**
- 链接已过期（默认 1 小时）
- 重定向 URL 未在 Supabase Dashboard 中配置
- 链接已被使用

**解决方案：**
1. 在 Supabase Dashboard 中添加正确的重定向 URL
2. 重新请求密码重置
3. 检查 `reset-password.tsx` 中的会话验证逻辑

### 问题 3: 重定向到错误页面

**可能原因：**
- `getPasswordResetUrl()` 函数返回的 URL 不正确
- Supabase Dashboard 中的重定向 URL 配置不匹配

**解决方案：**
1. 检查 `forgot-password.tsx` 中的 `getPasswordResetUrl()` 函数
2. 确保 Supabase Dashboard 中的重定向 URL 与代码中的 URL 匹配
3. 添加调试日志查看实际使用的 URL：
   ```typescript
   console.log('Password reset redirect URL:', redirectUrl);
   ```

### 问题 4: 密码重置后无法登录

**可能原因：**
- 新密码不符合要求
- 会话未正确更新

**解决方案：**
1. 检查密码要求（至少 6 个字符）
2. 确保 `reset-password.tsx` 中正确调用了 `supabase.auth.updateUser()`
3. 重置后清除浏览器缓存并重新登录

### 问题 5: 开发环境与生产环境 URL 不一致

**解决方案：**
使用环境变量来区分不同环境：

```typescript
// .env.development
VITE_PASSWORD_RESET_URL=http://localhost:5000/reset-password

// .env.production
VITE_PASSWORD_RESET_URL=https://yourdomain.com/reset-password
```

然后在代码中：
```typescript
function getPasswordResetUrl(): string {
  return import.meta.env.VITE_PASSWORD_RESET_URL || 
         `${window.location.origin}/reset-password`;
}
```

---

## 📝 配置检查清单

在部署前，请确认：

- [ ] Supabase Dashboard 中已配置重定向 URL
- [ ] 邮件服务已正确配置（SMTP 或默认服务）
- [ ] 邮件模板已自定义（可选）
- [ ] 代码中的 `getPasswordResetUrl()` 函数返回正确的 URL
- [ ] 环境变量已正确设置
- [ ] 已测试密码重置流程（开发和生产环境）
- [ ] 已检查邮件是否正常发送
- [ ] 已验证重置链接可以正常工作

---

## 🔐 安全建议

1. **使用 HTTPS**：生产环境必须使用 HTTPS
2. **设置链接过期时间**：默认 1 小时，可在 Supabase Dashboard 中调整
3. **限制请求频率**：防止暴力破解，Supabase 会自动限制
4. **验证邮箱**：确保用户邮箱已验证
5. **日志监控**：定期检查 Supabase Dashboard > Authentication > Logs

---

## 📚 相关文档

- [Supabase 官方文档 - 密码重置](https://supabase.com/docs/guides/auth/auth-password-reset)
- [Supabase 邮件配置](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase URL 配置](https://supabase.com/docs/guides/auth/auth-redirects)

---

## 🛠️ 快速配置步骤总结

1. **Supabase Dashboard**：
   - 添加重定向 URL
   - 配置邮件服务（可选）
   - 自定义邮件模板（可选）

2. **代码配置**：
   - 检查环境变量
   - 验证 `getPasswordResetUrl()` 函数
   - 测试密码重置流程

3. **测试**：
   - 发送测试重置邮件
   - 验证链接可访问
   - 确认密码可以成功重置

---

**最后更新：** 2025-01-27




























