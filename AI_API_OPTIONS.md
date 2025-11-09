# 🤖 免费 AI API 选项指南

本系统现在支持多个 AI 服务提供商！您可以选择任意一个免费或低成本的 API 来启用智能聊天功能。

## 🎯 快速选择指南

| 服务 | 免费额度 | 速度 | 中文支持 | 推荐场景 |
|------|---------|------|---------|---------|
| **Kimi** | ✅ 15元 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 🆓 想免费测试 |
| **Groq** | ✅ 有免费额度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⚡ 需要快速响应 |
| **DeepSeek** | ⚠️ 需充值 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 💰 追求性价比 |
| **OpenAI** | ⚠️ 新用户有额度 | ⭐⭐⭐ | ⭐⭐⭐ | 🌟 追求稳定性 |

---

## 📋 详细选项

### 1. 🎁 Kimi (Moonshot) - **推荐免费选项！**

**免费额度**：新用户注册即送 **15元**，足够测试使用！

**获取步骤**：
1. 访问 https://platform.moonshot.cn/
2. 注册账号（支持手机号/邮箱）
3. 登录后进入"API Key 管理"
4. 创建新的 API Key
5. 复制密钥到 `.env` 文件

**配置**：
```env
KIMI_API_KEY=your_kimi_api_key_here
```

**优点**：
- ✅ 新用户免费15元
- ✅ 中文支持优秀
- ✅ 支持长文本理解
- ✅ 可以回答任何问题

---

### 2. ⚡ Groq - **速度最快！**

**免费额度**：有免费 tier，响应速度极快！

**获取步骤**：
1. 访问 https://console.groq.com/
2. 注册账号（支持 Google/GitHub 登录）
3. 创建 API Key
4. 复制密钥到 `.env` 文件

**配置**：
```env
GROQ_API_KEY=your_groq_api_key_here
```

**优点**：
- ✅ 有免费额度
- ✅ **响应速度极快**（毫秒级）
- ✅ 使用 Llama 3.1 模型
- ✅ 适合高并发场景

---

### 3. 💰 DeepSeek - **性价比高**

**免费额度**：需要充值，但价格便宜

**获取步骤**：
1. 访问 https://platform.deepseek.com/
2. 注册账号并登录
3. 创建 API 密钥
4. 充值（价格很便宜）
5. 复制密钥到 `.env` 文件

**配置**：
```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

**优点**：
- ✅ 价格合理
- ✅ 性能优秀
- ✅ 支持多语言
- ✅ 可以回答任何问题

---

### 4. 🌟 OpenAI - **最稳定**

**免费额度**：新用户可能有免费额度

**获取步骤**：
1. 访问 https://platform.openai.com/
2. 注册账号并登录
3. 创建 API 密钥
4. 可能需要绑定信用卡（但可能有免费额度）
5. 复制密钥到 `.env` 文件

**配置**：
```env
OPENAI_API_KEY=your_openai_api_key_here
```

**优点**：
- ✅ GPT-3.5-turbo 模型
- ✅ 稳定可靠
- ✅ 新用户可能有免费额度

---

## 🔧 如何配置

### 步骤 1：选择服务并获取 API Key

根据上面的指南，选择一个服务并获取 API Key。

### 步骤 2：更新 `.env` 文件

在项目根目录的 `.env` 文件中，添加您选择的 API Key：

```env
# 只需配置一个即可（按优先级自动选择）
# 优先级：DeepSeek > Kimi > OpenAI > Groq

# 选项 1：Kimi（推荐免费）
KIMI_API_KEY=your_kimi_api_key_here

# 选项 2：Groq（快速）
# GROQ_API_KEY=your_groq_api_key_here

# 选项 3：DeepSeek（性价比）
# DEEPSEEK_API_KEY=your_deepseek_api_key_here

# 选项 4：OpenAI（稳定）
# OPENAI_API_KEY=your_openai_api_key_here
```

### 步骤 3：重启服务器

```bash
npm run dev
```

### 步骤 4：查看日志确认

服务器启动时，您会看到类似这样的日志：

```
✅ Kimi (Moonshot) API key found: sk-xxxxx...
   AI chat will use Kimi (Moonshot) API for intelligent responses
```

---

## 🎯 推荐选择

### 🆓 想免费测试？
→ 选择 **Kimi**（新用户15元免费）

### ⚡ 需要快速响应？
→ 选择 **Groq**（免费且极快）

### 💰 追求性价比？
→ 选择 **DeepSeek**（价格合理）

### 🌟 追求稳定性？
→ 选择 **OpenAI**（最稳定）

---

## ❓ 常见问题

### Q: 可以同时配置多个 API Key 吗？
A: 可以，但系统会按优先级自动选择第一个找到的。优先级：DeepSeek > Kimi > OpenAI > Groq

### Q: 如果 API Key 无效怎么办？
A: 系统会自动回退到规则引擎，不会崩溃。请检查：
- API Key 是否正确
- API Key 是否过期
- 是否有足够的额度/配额

### Q: 如何切换不同的 AI 服务？
A: 只需在 `.env` 文件中注释掉当前的 API Key，取消注释另一个即可。重启服务器后生效。

### Q: 不配置 API Key 会怎样？
A: 系统会使用内置的规则引擎，只能回答预设的问题，无法回答一般知识问题。

---

## 📚 更多信息

- 详细配置说明：查看 `ENV_CONFIG_TEMPLATE.md`
- AI 聊天功能说明：查看 `AI_CHAT_SETUP.md`

---

**推荐**：如果您是第一次使用，建议先尝试 **Kimi**，因为它提供 15元 免费额度，足够测试使用！🎉





