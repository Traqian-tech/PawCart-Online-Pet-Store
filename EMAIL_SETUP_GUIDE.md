# 📧 邮件通知功能设置指南

## 📋 功能概览

会员系统邮件通知包括：
1. **到期提醒邮件**：会员到期前7天自动发送
2. **续费成功邮件**：购买/续费会员时发送确认邮件
3. **自动续费失败邮件**：自动续费失败时发送提醒

---

## 🚀 快速开始

### **步骤 1：配置环境变量**

在项目根目录的 `.env` 文件中添加邮件配置：

```env
# 邮件服务器配置
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# 前端 URL（用于邮件中的链接）
FRONTEND_URL=http://localhost:5000
```

---

## 📮 Gmail 配置指南

### **方法 1：使用 Gmail App Password（推荐）**

1. **启用两步验证**：
   - 访问 [Google 账户设置](https://myaccount.google.com/)
   - 点击"安全性" → "两步验证"
   - 按照步骤启用

2. **生成 App Password**：
   - 在"安全性"页面，找到"应用专用密码"
   - 选择"其他（自定义名称）"
   - 输入名称：`MeowMeow PetShop`
   - 点击"生成"
   - 复制生成的 16 位密码

3. **更新 .env 文件**：
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=youremail@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # 你生成的 App Password
   ```

### **方法 2：允许低安全性应用访问（不推荐）**

⚠️ **注意**：此方法安全性较低，不建议使用

1. 访问：https://myaccount.google.com/lesssecureapps
2. 开启"允许低安全性应用访问"
3. 使用你的 Gmail 密码作为 `EMAIL_PASSWORD`

---

## 📮 其他邮件服务提供商

### **Outlook/Hotmail**

```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=youremail@outlook.com
EMAIL_PASSWORD=your-password
```

### **Yahoo Mail**

```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=youremail@yahoo.com
EMAIL_PASSWORD=your-app-password  # 需要生成 App Password
```

### **自定义 SMTP 服务器**

```env
EMAIL_HOST=smtp.yourserver.com
EMAIL_PORT=587  # 或 465 (SSL)
EMAIL_USER=your-email@yourserver.com
EMAIL_PASSWORD=your-password
```

---

## 🧪 测试邮件配置

### **方法 1：运行定时任务脚本**

```bash
npm run membership-cron
```

**预期输出**：
```
🚀 Starting Membership Cron Job
📅 Current time: ...
✅ Connected to MongoDB
📧 Testing email configuration...
✅ Email server is ready to send messages
```

如果看到 `✅ Email server is ready to send messages`，说明配置正确！

### **方法 2：手动测试（Node.js）**

创建测试文件 `test-email.ts`：

```typescript
import { testEmailConfiguration } from './server/email-service';
import dotenv from 'dotenv';

dotenv.config();

async function test() {
  const result = await testEmailConfiguration();
  console.log(result ? '✅ Email works!' : '❌ Email failed');
}

test();
```

运行：
```bash
npx tsx test-email.ts
```

---

## 🤖 自动化定时任务

### **方法 1：使用 node-cron（推荐）**

1. **安装 node-cron**：
   ```bash
   npm install node-cron
   npm install -D @types/node-cron
   ```

2. **创建调度器**（`server/scheduler.ts`）：
   ```typescript
   import cron from 'node-cron';
   import { exec } from 'child_process';

   // 每天早上 9 点运行
   cron.schedule('0 9 * * *', () => {
     console.log('Running membership cron job...');
     exec('npm run membership-cron', (error, stdout, stderr) => {
       if (error) {
         console.error(`Error: ${error}`);
         return;
       }
       console.log(stdout);
     });
   });

   console.log('✅ Scheduler started - Membership cron runs daily at 9:00 AM');
   ```

3. **在 server/index.ts 中导入**：
   ```typescript
   import './scheduler';  // 添加这一行
   ```

4. **重启服务器**：
   ```bash
   npm run dev
   ```

### **方法 2：使用系统 Crontab（Linux/Mac）**

1. **编辑 crontab**：
   ```bash
   crontab -e
   ```

2. **添加定时任务**（每天早上 9 点）：
   ```bash
   0 9 * * * cd /path/to/your/project && npm run membership-cron >> /path/to/logs/cron.log 2>&1
   ```

### **方法 3：使用 Windows 任务计划程序**

1. 打开"任务计划程序"
2. 创建基本任务
3. 触发器：每天 9:00 AM
4. 操作：启动程序
   - 程序：`cmd.exe`
   - 参数：`/c cd D:\path\to\project && npm run membership-cron`

---

## 📧 邮件模板预览

### **1. 到期提醒邮件**

**主题**：⏰ Your Diamond Paw Membership Expires in 7 Days!

**内容**：
```
👑 Membership Expiring Soon!

Hi [User Name],

Your Diamond Paw membership will expire in 7 days on 12/14/2025.

🎉 Your Membership Benefits
- Membership Tier: Diamond Paw
- Discount Rate: 15%
- Member Since: 01/07/2025

Don't lose your exclusive benefits! Renew now to continue enjoying:
- 💰 Special member discounts on all products
- 👑 Access to exclusive member-only products
- 🚚 Priority shipping and support
- 🎁 Birthday special offers

[Renew Membership Now]
```

### **2. 续费成功邮件**

**主题**：✅ Your Diamond Paw Membership Has Been Renewed!

**内容**：
```
✅ Membership Renewed Successfully!

Hi [User Name],

🎉 Great News!
Your Diamond Paw membership has been successfully renewed!

Renewal Details:
- Membership Tier: Diamond Paw
- New Expiry Date: 12/14/2026
- Discount Rate: 15%
- Auto-Renew: Enabled ✓

[View Dashboard]
```

### **3. 自动续费失败邮件**

**主题**：❌ Auto-Renew Failed for Diamond Paw Membership

**内容**：
```
❌ Auto-Renew Failed

Hi [User Name],

⚠️ Action Required
We were unable to automatically renew your Diamond Paw membership.

Reason: Payment processing failed

To avoid losing your membership benefits, please:
1. Check your payment method
2. Ensure sufficient funds are available
3. Update your payment information if needed
4. Renew manually if auto-renew continues to fail

[Renew Membership Now]
```

---

## 🔧 故障排除

### **问题 1：无法连接到邮件服务器**

**错误**：`ECONNREFUSED` 或 `ETIMEDOUT`

**解决方案**：
1. 检查 `EMAIL_HOST` 和 `EMAIL_PORT` 是否正确
2. 检查网络连接和防火墙设置
3. 确认邮件服务器地址正确

### **问题 2：认证失败**

**错误**：`Invalid login` 或 `535 Authentication failed`

**解决方案**：
1. 检查 `EMAIL_USER` 和 `EMAIL_PASSWORD` 是否正确
2. Gmail: 使用 App Password 而不是账号密码
3. 确认启用了 IMAP/SMTP 访问

### **问题 3：邮件被标记为垃圾邮件**

**解决方案**：
1. 使用专业邮件服务（SendGrid, AWS SES, Mailgun）
2. 配置 SPF、DKIM、DMARC 记录
3. 使用公司域名邮箱
4. 避免使用过多推销用语

### **问题 4：Gmail 每天发送限制**

**限制**：免费 Gmail 账号每天最多发送 500 封邮件

**解决方案**：
1. 使用 G Suite（每天 2000 封）
2. 使用专业邮件服务（SendGrid 免费套餐：每天 100 封）
3. 使用多个 Gmail 账号轮换

---

## 🎯 生产环境建议

### **使用专业邮件服务**

#### **SendGrid（推荐）**

1. **注册**：https://sendgrid.com/
2. **免费套餐**：每天 100 封邮件
3. **配置**：
   ```env
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASSWORD=SG.your-api-key
   ```

#### **AWS SES**

1. **注册**：https://aws.amazon.com/ses/
2. **免费套餐**：每月 62,000 封邮件
3. **需要验证域名或邮箱**

#### **Mailgun**

1. **注册**：https://www.mailgun.com/
2. **免费套餐**：每月 5,000 封邮件（前 3 个月）
3. **简单易用，API 友好**

---

## 📊 监控和日志

### **查看邮件发送日志**

```bash
# 运行定时任务并查看详细日志
npm run membership-cron

# 或者输出到文件
npm run membership-cron > logs/cron-$(date +%Y%m%d).log 2>&1
```

### **日志示例**

```
✅ Expiring notification email sent to user@example.com
✅ Auto-renewed Diamond Paw for user@example.com until 12/14/2026
⚠️ Failed to send membership confirmation email
```

---

## 🧪 手动测试邮件发送

### **发送测试邮件给自己**

创建 `test-send-email.ts`：

```typescript
import { User } from '@shared/models';
import { sendMembershipExpiringEmail } from './server/email-service';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/petshop');
  
  // 使用你的测试账号邮箱
  const user = await User.findOne({ email: 'your-test-email@gmail.com' });
  
  if (user && user.membership) {
    const result = await sendMembershipExpiringEmail(user, 7);
    console.log(result ? '✅ Email sent!' : '❌ Failed');
  }
  
  await mongoose.connection.close();
}

test();
```

运行：
```bash
npx tsx test-send-email.ts
```

---

## ✅ 配置检查清单

- [ ] 添加 `EMAIL_HOST` 到 `.env`
- [ ] 添加 `EMAIL_PORT` 到 `.env`
- [ ] 添加 `EMAIL_USER` 到 `.env`
- [ ] 添加 `EMAIL_PASSWORD` 到 `.env`
- [ ] 添加 `FRONTEND_URL` 到 `.env`
- [ ] 测试邮件配置：`npm run membership-cron`
- [ ] 配置定时任务（cron 或 scheduler）
- [ ] 测试发送真实邮件
- [ ] 检查垃圾邮件文件夹
- [ ] 生产环境使用专业邮件服务

---

## 📚 相关文档

- [Nodemailer 文档](https://nodemailer.com/)
- [Gmail SMTP 设置](https://support.google.com/mail/answer/7126229)
- [SendGrid 文档](https://docs.sendgrid.com/)

---

## 💡 小贴士

1. **开发环境**：可以使用 [Mailpit](https://github.com/axllent/mailpit) 或 [MailHog](https://github.com/mailhog/MailHog) 来捕获测试邮件
2. **安全性**：永远不要将邮箱密码提交到 Git，使用 `.env` 文件
3. **频率限制**：避免短时间内发送大量邮件
4. **邮件内容**：保持邮件简洁、专业，避免使用过多 HTML/CSS
5. **用户体验**：提供退订选项，遵守邮件营销法规

---

**设置完成后，你的会员系统将自动发送：**
- ✅ 到期提醒邮件（每天检查，提前 7 天发送）
- ✅ 购买确认邮件（购买会员时立即发送）
- ✅ 自动续费成功/失败通知

Happy emailing! 📧🎉






