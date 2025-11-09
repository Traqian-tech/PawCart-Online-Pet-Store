# 📧 Resend Email 配置指南

## 为什么使用 Resend？

✅ **免费且简单**：每月免费 3,000 封邮件  
✅ **无需 SMTP 配置**：不需要 Gmail App Password  
✅ **快速设置**：只需一个 API Key  
✅ **可靠性高**：专业的邮件发送服务  

---

## 🚀 快速开始（5 分钟设置）

### 步骤 1：注册 Resend 账户

1. 访问 **https://resend.com**
2. 点击 **"Sign Up"** 或 **"Get Started"**
3. 使用 GitHub 账户登录（或邮箱注册）
4. 完成注册流程

### 步骤 2：获取 API Key

1. 登录后，进入 **Dashboard**
2. 点击左侧菜单的 **"API Keys"**
3. 点击 **"Create API Key"**
4. 输入名称（例如：`MeowMeow PetShop`）
5. 选择权限：**"Sending access"**（发送权限）
6. 点击 **"Create"**
7. **重要**：立即复制 API Key（只会显示一次！）
   - 格式类似：`re_123456789abcdefghijklmnop`

### 步骤 3：配置环境变量

1. 打开项目根目录的 `.env` 文件
2. 添加以下配置：

```env
# Resend Email Service Configuration
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=onboarding@resend.dev
```

**说明**：
- **`RESEND_API_KEY`**：你刚才复制的 API Key
- **`FROM_EMAIL`**：发件人邮箱
  - 默认使用 `onboarding@resend.dev`（Resend 提供的测试邮箱）
  - 如果你有自己的域名，可以设置为 `noreply@yourdomain.com`（需要验证域名）

### 步骤 4：重启服务器

```bash
npm run dev
```

---

## ✅ 测试邮件功能

### 方式 1：测试密码修改功能

1. 启动开发服务器：
   ```bash
   npm run dev
   ```

2. 打开浏览器访问：`http://localhost:5000`

3. 登录你的账户

4. 进入 **Dashboard**

5. 点击 **"Change Password"**

6. 点击 **"Send Verification Code"**

7. 检查你的邮箱（包括垃圾邮件文件夹）

8. 你应该会收到包含 6 位验证码的邮件！

### 方式 2：使用测试脚本

创建测试文件 `test-resend.js`：

```javascript
import { sendPasswordChangeOtpEmail } from './server/resend-email-service.ts';

async function test() {
  const success = await sendPasswordChangeOtpEmail('your-email@example.com', '123456');
  if (success) {
    console.log('✅ 测试邮件发送成功！');
  } else {
    console.error('❌ 测试邮件发送失败！');
  }
}

test();
```

运行测试：
```bash
npx tsx test-resend.js
```

---

## 🎯 使用流程

### 用户修改密码的完整流程

1. **用户点击 "Change Password"**
   - 在 Dashboard 的 "Account Security" 部分

2. **点击 "Send Verification Code"**
   - 系统通过 Resend API 发送验证码邮件

3. **检查邮箱**
   - 打开邮箱收件箱
   - 查找来自 MeowMeow PetShop 的邮件
   - 标题：🔐 Password Change Verification Code

4. **复制验证码**
   - 邮件中有一个大大的 6 位数字
   - 验证码有效期：10 分钟

5. **在 Dashboard 输入验证码**
   - 回到浏览器的密码修改对话框
   - 输入 6 位验证码
   - 输入新密码
   - 确认新密码

6. **完成**
   - 点击 "Update Password"
   - 密码立即更新！

---

## 🔧 进阶配置

### 使用自定义域名（可选）

如果你有自己的域名（例如 `meowmeowpetshop.com`），可以：

1. **在 Resend Dashboard 添加域名**
   - 进入 **"Domains"** 菜单
   - 点击 **"Add Domain"**
   - 输入你的域名

2. **配置 DNS 记录**
   - Resend 会提供 DNS 记录
   - 在你的域名服务商添加这些记录
   - 等待验证（通常几分钟）

3. **更新 `.env` 文件**
   ```env
   FROM_EMAIL=noreply@meowmeowpetshop.com
   ```

4. **重启服务器**

现在邮件将从你的域名发送，看起来更专业！

---

## 📊 Resend 免费套餐限制

| 功能 | 免费套餐 |
|------|----------|
| **每月邮件数** | 3,000 封 |
| **每日邮件数** | 100 封 |
| **API 请求** | 无限制 |
| **域名数量** | 1 个 |
| **附件** | 最大 40MB |

对于大多数小型项目来说，免费套餐完全够用！

---

## 🐛 故障排查

### 问题 1：API Key 无效

**错误信息**：
```
❌ Resend API error: { message: 'Invalid API key' }
```

**解决方案**：
1. 检查 `.env` 文件中的 `RESEND_API_KEY`
2. 确保 API Key 以 `re_` 开头
3. 确保没有多余的空格或换行
4. 重新生成一个新的 API Key

### 问题 2：没有收到邮件

**可能原因**：
- 邮件在垃圾邮件文件夹中
- FROM_EMAIL 使用了未验证的域名
- 收件人邮箱错误

**解决方案**：
1. 检查垃圾邮件文件夹
2. 使用默认的 `onboarding@resend.dev`
3. 查看服务器日志，确认邮件已发送
4. 在 Resend Dashboard 的 "Logs" 查看发送记录

### 问题 3：发送失败

**错误信息**：
```
❌ Resend API key not configured
```

**解决方案**：
1. 确认 `.env` 文件存在
2. 确认 `RESEND_API_KEY` 已设置
3. 重启开发服务器
4. 检查终端是否有错误提示

### 问题 4：邮件发送慢

**可能原因**：
- 网络延迟
- Resend API 响应慢

**解决方案**：
- 正常情况下，邮件应该在几秒内到达
- 如果超过 1 分钟，检查网络连接
- 查看 Resend Dashboard 的 "Status" 页面

---

## 📝 与 Gmail SMTP 对比

| 特性 | Gmail SMTP | Resend API |
|------|-----------|------------|
| **设置复杂度** | 🔴 复杂 | 🟢 简单 |
| **需要 App Password** | ✅ 是 | ❌ 否 |
| **免费额度** | 500/天 | 3,000/月 |
| **可靠性** | 🟡 中等 | 🟢 高 |
| **配置时间** | 15-30 分钟 | 5 分钟 |
| **专业性** | 🟡 使用个人邮箱 | 🟢 专业发件服务 |

**推荐**：使用 Resend API 🎉

---

## 🔗 相关链接

- **Resend 官网**：https://resend.com
- **Resend 文档**：https://resend.com/docs
- **Resend Dashboard**：https://resend.com/dashboard
- **API 参考**：https://resend.com/docs/api-reference

---

## 📚 相关文档

- **`ENV_SETUP_GUIDE.md`** - 完整的环境变量配置指南
- **`PASSWORD_CHANGE_GUIDE.md`** - 密码修改功能使用指南
- **`server/resend-email-service.ts`** - Resend 邮件服务代码

---

## 🎊 总结

✅ **设置简单**：只需 5 分钟  
✅ **免费使用**：每月 3,000 封邮件  
✅ **无需 SMTP**：不需要 Gmail 配置  
✅ **即插即用**：添加 API Key 即可  

现在你可以：
1. 注册 Resend 账户
2. 获取 API Key
3. 添加到 `.env` 文件
4. 重启服务器
5. 测试密码修改功能！

就这么简单！🚀

---

**最后更新**：2025-11-08  
**状态**：✅ 可用  
**免费套餐**：✅ 每月 3,000 封









