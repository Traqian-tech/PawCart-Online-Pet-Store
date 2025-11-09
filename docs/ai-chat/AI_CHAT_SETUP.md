# 🤖 AI聊天机器人设置指南

## 📋 概述

我们已经为PawCart宠物商店集成了智能AI聊天机器人功能，让客户可以通过Live Chat获得即时、智能的产品咨询和客服支持。

## ✨ 功能特点

### AI聊天机器人能做什么：

1. **🛍️ 商品咨询**
   - 智能推荐产品
   - 查询商品价格、库存
   - 介绍商品详情和特点
   - 对比不同产品

2. **📦 订单服务**
   - 配送信息咨询
   - 退货政策说明
   - 订单状态查询指引

3. **💎 会员服务**
   - 介绍会员福利
   - 积分政策说明
   - 优惠活动信息

4. **📞 客服支持**
   - 24/7全天候响应
   - 多语言支持
   - 自动转接人工客服

## 🚀 快速开始

### 方式一：使用DeepSeek API（推荐 - 更智能）

1. **获取DeepSeek API密钥**
   - 访问 https://platform.deepseek.com/
   - 注册账号并创建API密钥
   - 复制您的API密钥

2. **配置环境变量**
   
   在项目根目录创建或编辑 `.env` 文件，添加：
   
   ```bash
   DEEPSEEK_API_KEY=your_deepseek_api_key_here
   ```
   
   获取DeepSeek API密钥：https://platform.deepseek.com/

3. **重启服务器**
   
   ```bash
   npm run dev
   ```

4. **测试AI聊天**
   - 访问 http://localhost:5000/messenger
   - 或点击网站右下角的聊天按钮
   - 输入消息测试AI回复

### 方式二：使用内置规则引擎（无需API）

如果不配置OpenAI API密钥，系统会自动使用内置的规则引擎：
- ✅ 完全免费，无需API费用
- ✅ 即开即用，无需配置
- ✅ 涵盖常见问题和场景
- ⚠️ 回复相对简单，不如AI智能

## 📁 文件说明

### 后端文件

1. **server/ai-chat-service.ts** - AI聊天服务核心逻辑
   - OpenAI API集成
   - 规则引擎备用方案
   - 产品信息查询
   - 智能推荐算法

2. **server/routes.ts** - API路由配置
   - `/api/ai-chat` - 主聊天接口
   - `/api/ai-chat/recommended-products` - 推荐产品
   - `/api/ai-chat/search-products` - 产品搜索

### 前端文件

3. **client/src/pages/messenger.tsx** - 完整聊天页面
   - 全屏聊天界面
   - AI对话历史
   - 产品展示卡片
   - 快捷回复按钮

4. **client/src/components/ui/floating-cart.tsx** - 浮动聊天窗口
   - 右下角聊天气泡
   - 迷你聊天界面
   - 随时可访问

## 🎯 使用方式

### 客户端访问

1. **通过专用聊天页面**
   ```
   网址：http://localhost:5000/messenger
   ```

2. **通过浮动聊天按钮**
   - 在任意页面右下角
   - 点击聊天图标打开

3. **通过客服中心**
   ```
   网址：http://localhost:5000/customer-support
   点击"Live Chat"按钮
   ```

## 💬 AI对话示例

### 商品查询
```
客户：有什么猫粮推荐吗？
AI：我们有多种优质猫粮可供选择！以下是一些推荐：

🐱 Royal Canin室内成猫粮 - HK$298
   适合室内猫咪，帮助控制体重...

🐱 Purina Pro Plan成猫粮 - HK$268
   高蛋白配方，促进肌肉健康...

您想了解哪款猫粮的详细信息吗？
```

### 配送咨询
```
客户：你们配送需要多久？
AI：我们的配送服务信息：

🚚 配送方式：
• 标准配送 (3-5天)
• 快速配送 (1-2天)
• 当日送达

💰 运费说明：
• 订单满HK$300 - 免运费！
• 不满HK$300 - HK$30运费

📍 配送范围：香港全区

您还想了解什么吗？
```

### 会员咨询
```
客户：会员有什么优惠？
AI：PawCart会员福利：

🌟 会员特权：
• 所有商品9折优惠
• 每月专享优惠券
• 积分奖励计划
• 生日特别礼物

💎 积分系统：
• 每消费HK$1 = 1积分
• 积分可兑换商品和优惠券

想了解更多会员详情吗？
```

## 🔧 高级配置

### 自定义AI回复

编辑 `server/ai-chat-service.ts` 中的系统提示词：

```typescript
const systemPrompt = `你是PawCart宠物商店的AI客服助手。你的职责是：
1. 友好、专业地回答客户关于宠物用品的问题
2. 根据提供的产品信息推荐合适的产品
...
`;
```

### 调整AI参数

在 `chatWithAI` 函数中：

```typescript
model: 'deepseek-chat',  // DeepSeek的对话模型
temperature: 0.7,         // 0-1，越高越有创意
max_tokens: 500          // 回复长度限制
```

### 添加自定义规则

在 `chatWithRules` 函数中添加新的关键词匹配：

```typescript
if (message.includes('你的关键词')) {
  return {
    response: '你的自定义回复',
    products: []
  };
}
```

## 📊 API接口文档

### 1. AI聊天接口

**POST** `/api/ai-chat`

请求体：
```json
{
  "message": "有什么猫粮推荐？",
  "conversationHistory": [
    {
      "role": "user",
      "content": "你好"
    },
    {
      "role": "assistant",
      "content": "您好！我是AI客服..."
    }
  ]
}
```

响应：
```json
{
  "response": "我们有多种优质猫粮...",
  "products": [
    {
      "_id": "...",
      "name": "Royal Canin室内成猫粮",
      "price": 298,
      "category": "Cat Food",
      "stock": 50
    }
  ]
}
```

### 2. 推荐产品接口

**GET** `/api/ai-chat/recommended-products?category=cat food&limit=5`

响应：
```json
{
  "products": [...]
}
```

### 3. 产品搜索接口

**GET** `/api/ai-chat/search-products?q=猫粮&limit=10`

响应：
```json
{
  "query": "猫粮",
  "products": [...]
}
```

## 💰 成本估算

### DeepSeek API费用

- 输入：¥0.001 / 1K tokens (约$0.00014)
- 输出：¥0.002 / 1K tokens (约$0.00028)
- 平均一次对话：约0.001-0.002美元
- 月活1000次对话：约1-2美元

DeepSeek相比OpenAI价格更优惠，性能相当

### 节省成本的方法

1. **使用规则引擎处理简单问题**
   - 完全免费
   - 适合FAQ类问题

2. **设置token限制**
   - 限制max_tokens
   - 精简系统提示词

3. **使用缓存**
   - 缓存常见问题的回复
   - 减少API调用

## 🐛 故障排查

### 问题1：AI不响应

**检查项：**
- ✅ 确认DEEPSEEK_API_KEY已正确配置
- ✅ 检查API密钥是否有效
- ✅ 查看服务器日志错误信息
- ✅ 确认网络连接正常

**解决方案：**
```bash
# 测试API密钥
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### 问题2：回复很慢

**可能原因：**
- OpenAI API延迟
- 数据库查询慢
- 网络问题

**解决方案：**
- 优化产品查询（添加索引）
- 使用更快的模型
- 启用缓存机制

### 问题3：回复不准确

**解决方案：**
- 优化系统提示词
- 提供更多产品信息
- 使用gpt-4模型
- 补充训练数据

## 🔒 安全建议

1. **保护API密钥**
   - ❌ 不要提交到Git
   - ✅ 使用环境变量
   - ✅ 使用.env文件（已加入.gitignore）

2. **速率限制**
   ```typescript
   // 添加速率限制防止滥用
   const rateLimit = require('express-rate-limit');
   
   const chatLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15分钟
     max: 50 // 最多50次请求
   });
   
   app.post('/api/ai-chat', chatLimiter, ...);
   ```

3. **输入验证**
   - 已实现消息长度检查
   - 过滤敏感内容
   - 防止注入攻击

## 📈 未来增强

### 计划中的功能

1. **🎨 UI增强**
   - 产品图片展示
   - 富文本消息
   - 表情支持

2. **🧠 智能提升**
   - 对话上下文记忆
   - 个性化推荐
   - 多轮对话优化

3. **📊 数据分析**
   - 对话统计
   - 热门问题分析
   - 客户满意度调查

4. **🌐 多语言**
   - 自动语言检测
   - 多语言切换
   - 本地化回复

## 🎉 测试建议

### 测试场景

1. **基础对话**
   ```
   - "你好"
   - "有什么猫粮？"
   - "价格是多少？"
   ```

2. **商品查询**
   ```
   - "推荐一款狗粮"
   - "Royal Canin有货吗？"
   - "300元以下的猫粮"
   ```

3. **服务咨询**
   ```
   - "配送要多久？"
   - "怎么退货？"
   - "会员有什么优惠？"
   ```

4. **边界测试**
   ```
   - 空消息
   - 超长消息
   - 特殊字符
   - 无关问题
   ```

## 📞 技术支持

如有问题，请联系：

- 📧 技术支持：boqianjlu@gmail.com
- 📞 客服电话：852-6214-6811
- 💬 在线支持：使用系统内的AI聊天功能

---

## 🎊 总结

您现在已经成功集成了AI聊天机器人！客户可以：

✅ 24/7随时获得智能回复
✅ 快速了解产品信息
✅ 获得个性化推荐
✅ 自助解决常见问题

这将大大提升客户体验，减轻客服压力，增加转化率！

祝您使用愉快！🐾

