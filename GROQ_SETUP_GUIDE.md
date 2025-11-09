# ⚡ Groq API 配置指南

Groq 是一个**极速**的 AI API 服务，使用 Llama 3.1 模型，响应速度可以达到毫秒级！

## 🎯 为什么选择 Groq？

- ⚡ **响应速度极快** - 比传统 API 快 10-100 倍
- 🆓 **有免费额度** - 适合测试和小规模使用
- 🚀 **高并发支持** - 适合需要快速响应的场景
- 💪 **强大的模型** - 使用 Llama 3.1 8B 模型

---

## 📋 配置步骤

### 步骤 1：注册 Groq 账号

1. 访问 **https://console.groq.com/**
2. 点击 "Sign Up" 或 "Get Started"
3. 选择登录方式：
   - ✅ Google 账号登录（推荐，最快）
   - ✅ GitHub 账号登录
   - ✅ 邮箱注册

### 步骤 2：创建 API Key

1. 登录后，进入 **API Keys** 页面
2. 点击 **"Create API Key"**
3. 给 API Key 起个名字（如：`pawcart-petshop`）
4. 点击 **"Submit"**
5. **重要**：立即复制 API Key（只显示一次！）
   - 格式类似：`gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 步骤 3：配置到项目

1. 打开项目根目录的 `.env` 文件
2. 添加或修改以下配置：

```env
# Groq API - 极速 AI 服务
GROQ_API_KEY=gsk_your_actual_api_key_here
```

**注意**：
- 如果之前配置了其他 AI API（如 `DEEPSEEK_API_KEY`），可以注释掉：
  ```env
  # DEEPSEEK_API_KEY=your_old_key
  GROQ_API_KEY=gsk_your_groq_key_here
  ```
- 系统会按优先级自动选择，优先级：DeepSeek > Kimi > OpenAI > **Groq**

### 步骤 4：重启服务器

```bash
npm run dev
```

### 步骤 5：验证配置

服务器启动时，您应该看到：

```
✅ Groq API key found: gsk_xxxxx...
   AI chat will use Groq API for intelligent responses
```

如果看到这个，说明配置成功！🎉

---

## 🧪 测试 Groq API

配置完成后，在聊天界面测试：

1. 打开宠物店网站
2. 点击聊天图标
3. 发送任意问题，例如：
   - "你好"
   - "推荐一些猫粮"
   - "地球的气候类型有哪些？"

您应该会收到**非常快速**的响应！

---

## 💰 免费额度说明

Groq 提供免费 tier，包括：
- 每分钟一定数量的请求
- 每月一定的总请求数

**注意**：
- 免费额度有限，适合测试和小规模使用
- 如果超出免费额度，需要升级到付费计划
- 查看使用情况：登录 https://console.groq.com/ 查看 Dashboard

---

## 🔧 故障排除

### 问题 1：API Key 无效

**症状**：服务器启动时没有显示 Groq API key found

**解决方法**：
1. 检查 `.env` 文件中的 `GROQ_API_KEY` 是否正确
2. 确保没有多余的空格或引号
3. 重新复制 API Key 并粘贴

### 问题 2：API 调用失败

**症状**：聊天时返回错误或使用规则引擎

**解决方法**：
1. 检查 API Key 是否过期（在 Groq 控制台查看）
2. 检查是否超出免费额度
3. 查看服务器日志中的错误信息

### 问题 3：响应慢

**症状**：Groq 响应不如预期快

**解决方法**：
1. 检查网络连接
2. 查看 Groq 服务状态：https://status.groq.com/
3. 确认使用的是正确的模型（代码中使用 `llama-3.1-8b-instant`）

---

## 📊 性能对比

| 指标 | Groq | 其他 API |
|------|------|---------|
| 响应时间 | **< 100ms** | 500-2000ms |
| 并发支持 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 免费额度 | ✅ 有 | 部分有 |
| 模型 | Llama 3.1 8B | 各种 |

---

## 🎯 使用建议

### 适合使用 Groq 的场景：
- ✅ 需要快速响应的实时聊天
- ✅ 高并发场景（多个用户同时使用）
- ✅ 测试和开发环境
- ✅ 对响应速度要求高的应用

### 不适合的场景：
- ❌ 需要超长文本生成（Groq 的 token 限制较小）
- ❌ 需要最新模型（Groq 使用 Llama 3.1，不是最新的 GPT-4）

---

## 🔗 相关链接

- **Groq 控制台**：https://console.groq.com/
- **API 文档**：https://console.groq.com/docs
- **状态页面**：https://status.groq.com/
- **定价信息**：https://console.groq.com/ 查看 Pricing

---

## 💡 提示

1. **API Key 安全**：
   - 不要将 API Key 提交到 Git
   - 确保 `.env` 文件在 `.gitignore` 中
   - 如果泄露，立即在 Groq 控制台删除并重新创建

2. **监控使用**：
   - 定期检查 Groq 控制台的使用情况
   - 设置使用提醒（如果支持）

3. **备用方案**：
   - 可以同时配置多个 AI API
   - 如果 Groq 失败，系统会自动回退到规则引擎
   - 建议配置一个备用 API（如 Kimi）

---

**配置完成后，享受极速 AI 聊天体验！** ⚡🚀





