# 环境变量配置模板

将以下内容复制到你的 `.env` 文件中：

```env
# Database Configuration
DATABASE_URL=mongodb://localhost:27017/meowmeow-petshop
# Or use MongoDB Atlas:
# DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Supabase Configuration (for authentication)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Resend Email Service (Recommended - Easy Setup)
# Get your free API key at https://resend.com
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=onboarding@resend.dev

# Gmail SMTP Configuration (Alternative - Not Recommended)
# Only use if you can't use Resend
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASSWORD=your-gmail-app-password

# Session Configuration
SESSION_SECRET=your-random-secret-key-change-this-in-production

# AI Chat Service (Optional but Recommended - Choose ONE)
# Without any API key, the chat will use a rule-based engine (limited responses)
# Priority: DeepSeek > Kimi > OpenAI > Groq

# Option 1: DeepSeek (Recommended - Good balance of cost and quality)
# Get your API key at https://platform.deepseek.com/
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Option 2: Kimi (Moonshot) - FREE 15元 credit for new users!
# Get your API key at https://platform.moonshot.cn/
# KIMI_API_KEY=your_kimi_api_key_here

# Option 3: OpenAI (GPT-3.5-turbo)
# Get your API key at https://platform.openai.com/
# OPENAI_API_KEY=your_openai_api_key_here

# Option 4: Groq - FREE tier available, very fast!
# Get your API key at https://console.groq.com/
# GROQ_API_KEY=your_groq_api_key_here

# Server Configuration
PORT=5000
NODE_ENV=development
```

## 📋 配置说明

### 必需的配置

1. **DATABASE_URL** - MongoDB 数据库连接字符串
2. **VITE_SUPABASE_URL** - Supabase 项目 URL
3. **VITE_SUPABASE_ANON_KEY** - Supabase 匿名密钥
4. **SESSION_SECRET** - 会话密钥（随机字符串）

### AI 聊天服务配置（可选但推荐 - 只需配置一个）

系统支持多个 AI 服务提供商，按优先级自动选择：
1. **DeepSeek** (推荐)
2. **Kimi (Moonshot)** - 新用户免费15元！
3. **OpenAI** (GPT-3.5-turbo)
4. **Groq** - 有免费额度，速度很快！

#### 选项 1：DeepSeek API（推荐）✅
```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

**优点**：
- ✅ 可以回答任何问题（不限主题）
- ✅ 智能对话，理解上下文
- ✅ 支持多语言（自动匹配用户语言）
- ✅ 价格合理，性能优秀

**如何获取**：
1. 访问 https://platform.deepseek.com/
2. 注册账号并登录
3. 创建 API 密钥
4. 复制密钥到 `.env` 文件

---

#### 选项 2：Kimi (Moonshot) - 免费15元！🎁
```env
KIMI_API_KEY=your_kimi_api_key_here
```

**优点**：
- ✅ **新用户免费赠送15元**，足够测试使用
- ✅ 可以回答任何问题
- ✅ 支持长文本理解
- ✅ 中文支持优秀

**如何获取**：
1. 访问 https://platform.moonshot.cn/
2. 注册账号并登录
3. 进入"API Key 管理"创建密钥
4. 新用户自动获得15元免费额度
5. 复制密钥到 `.env` 文件

---

#### 选项 3：OpenAI API
```env
OPENAI_API_KEY=your_openai_api_key_here
```

**优点**：
- ✅ GPT-3.5-turbo 模型
- ✅ 新用户有免费额度
- ✅ 稳定可靠

**如何获取**：
1. 访问 https://platform.openai.com/
2. 注册账号并登录
3. 创建 API 密钥
4. 复制密钥到 `.env` 文件

---

#### 选项 4：Groq API - 免费且快速！⚡
```env
GROQ_API_KEY=your_groq_api_key_here
```

**优点**：
- ✅ **有免费额度**
- ✅ **响应速度极快**
- ✅ 使用 Llama 3.1 模型
- ✅ 适合高并发场景

**如何获取**：
1. 访问 https://console.groq.com/
2. 注册账号并登录
3. 创建 API 密钥
4. 复制密钥到 `.env` 文件

---

**不配置会怎样**：
- ⚠️ 系统会使用规则引擎（只能回答预设问题）
- ⚠️ 无法回答一般知识问题（如"地球的气候类型"）
- ⚠️ 回复相对简单，不如 AI 智能

**推荐选择**：
- 🆓 **想免费测试**：选择 **Kimi**（新用户15元免费）
- ⚡ **需要快速响应**：选择 **Groq**（免费且极快）
- 💰 **追求性价比**：选择 **DeepSeek**（价格合理）
- 🌟 **追求稳定性**：选择 **OpenAI**（最稳定）

### 邮件服务配置（二选一）

#### 选项 1：Resend API（推荐）✅
```env
RESEND_API_KEY=re_your_api_key_here
FROM_EMAIL=onboarding@resend.dev
```

**优点**：
- ✅ 设置简单（5 分钟）
- ✅ 免费额度：每月 3,000 封
- ✅ 不需要 Gmail 配置
- ✅ 可靠性高

**如何获取**：参考 `RESEND_EMAIL_SETUP.md`

#### 选项 2：Gmail SMTP（不推荐）
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
```

**缺点**：
- ⚠️ 设置复杂（需要 App Password）
- ⚠️ 配置时间长（15-30 分钟）
- ⚠️ 可能被 Gmail 限制

---

## 🚀 快速开始

1. **创建 .env 文件**
   ```bash
   # 在项目根目录
   touch .env
   ```

2. **复制上面的模板**
   - 将模板内容粘贴到 `.env` 文件

3. **填写你的配置值**
   - 替换 `your-project`、`your-api-key` 等占位符
   - 至少配置：Database、Supabase、Resend
   - **强烈推荐配置**：DEEPSEEK_API_KEY（让 AI 可以回答任何问题）

4. **重启服务器**
   ```bash
   npm run dev
   ```

---

## 📚 相关文档

- **`RESEND_EMAIL_SETUP.md`** - Resend 邮件服务配置指南
- **`SUPABASE_SETUP.md`** - Supabase 配置指南（如果存在）
- **`ENV_SETUP_GUIDE.md`** - 完整的环境变量设置指南（如果存在）

---

**推荐配置**：使用 Resend API 进行邮件发送 🎉





