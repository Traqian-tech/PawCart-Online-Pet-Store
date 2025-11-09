# 🔧 Track Requests 调试指南

## ❌ 错误：Failed to Create Request

如果您在提交请求时看到"Failed to Create Request Please try again later."错误，请按照以下步骤解决：

## 🔄 步骤 1: 重启开发服务器

**这是最重要的步骤！** 因为我们添加了新的 Request 模型，服务器需要重启才能加载它。

### Windows (PowerShell):
```powershell
# 1. 停止当前服务器 (Ctrl+C)
# 2. 重新启动
npm run dev
```

### 为什么需要重启？
- 新增了 `Request` 模型到 `shared/models.ts`
- 新增了 `/api/requests` API 端点到 `server/routes.ts`
- Node.js 需要重新加载这些模块

## 🔍 步骤 2: 检查浏览器控制台

打开浏览器开发者工具 (F12)，查看 Console 标签：

### 查找以下日志：
```
Creating request with data: {
  userId: "...",
  type: "custom_order",
  subject: "Dog Food",
  description: "More classes",
  priority: "medium"
}

Response status: 201  // 成功
或
Response status: 400  // 客户端错误
或
Response status: 500  // 服务器错误
```

### 可能的错误：

#### 错误 1: "User ID not found"
**原因**: userId 未定义
**解决**: 
- 确保已登录
- 刷新页面重新加载用户信息

#### 错误 2: "Missing required fields"
**原因**: 后端收到的数据不完整
**解决**:
- 确保填写了 Subject 和 Description
- 检查控制台日志中的 requestData

#### 错误 3: "Failed to create request"
**原因**: 数据库操作失败
**解决**:
- 检查数据库连接
- 检查服务器端控制台错误

## 🔍 步骤 3: 检查服务器端日志

在运行 `npm run dev` 的终端中查看错误信息：

### 可能的错误：

#### 错误 1: "Request is not a constructor" 或 "Request is not defined"
**原因**: Request 模型未正确导入
**解决**:
```typescript
// 检查 server/routes.ts 第4行
import { ..., Request } from "@shared/models";

// 检查 shared/models.ts 是否导出
export const Request = mongoose.model<IRequest>('Request', requestSchema);
```

#### 错误 2: Schema 验证错误
**原因**: 发送的数据不符合 Schema 定义
**解决**: 检查数据格式是否正确

#### 错误 3: MongoDB 连接错误
**原因**: 数据库未连接或连接中断
**解决**:
- 检查 MongoDB 是否运行
- 检查 `.env` 文件中的数据库连接字符串
- 重启 MongoDB 服务

## ✅ 步骤 4: 测试请求创建

重启服务器后，再次尝试：

1. 打开浏览器控制台 (F12)
2. 进入 Dashboard → Track Requests
3. 点击 "New Request"
4. 填写表单：
   - Request Type: **Custom Order**
   - Subject: **Dog Food**
   - Description: **More classes**
5. 点击 "Submit Request"
6. 观察控制台日志

### 成功的日志示例：
```
Creating request with data: { userId: "...", type: "custom_order", ... }
Response status: 201
Request created: { _id: "...", userId: "...", type: "custom_order", ... }
```

### Toast 提示应该显示：
✅ **"Request Created - Your request has been submitted successfully."**

## 📝 步骤 5: 验证数据已保存

如果请求创建成功：

1. 刷新页面
2. 进入 Track Requests
3. 应该看到刚创建的请求卡片
4. 状态应该是 **Pending** (黄色徽章)

## 🐛 常见问题排查

### 问题：控制台显示 "Authentication Error"
**解决**: 
- 退出登录后重新登录
- 清除浏览器缓存
- 检查用户会话是否过期

### 问题：请求显示但状态不正确
**解决**: 
- 检查 Request Schema 中的 status 默认值
- 应该是 `status: { type: String, default: 'pending' }`

### 问题：无法看到请求列表
**解决**:
- 检查 `/api/requests/user/:userId` 端点
- 确保 userId 正确传递
- 检查网络请求是否成功 (Network 标签)

## 🔧 手动测试 API

使用以下命令手动测试 API (需要安装 curl 或使用 Postman):

### 测试创建请求：
```bash
curl -X POST http://localhost:5000/api/requests \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "YOUR_USER_ID",
    "type": "product_inquiry",
    "subject": "Test Request",
    "description": "This is a test",
    "priority": "medium"
  }'
```

### 预期响应：
```json
{
  "_id": "...",
  "userId": "YOUR_USER_ID",
  "type": "product_inquiry",
  "subject": "Test Request",
  "description": "This is a test",
  "status": "pending",
  "priority": "medium",
  "createdAt": "2025-01-27T...",
  "updatedAt": "2025-01-27T..."
}
```

## 📋 检查清单

在报告问题前，请确认：

- [ ] 已重启开发服务器 (`npm run dev`)
- [ ] MongoDB 正在运行
- [ ] 用户已登录
- [ ] 浏览器控制台中查看了错误日志
- [ ] 服务器终端中查看了错误信息
- [ ] Request 模型已正确导出
- [ ] API 端点已正确添加到 routes.ts
- [ ] Subject 和 Description 已填写

## 🎯 快速修复命令

```bash
# 1. 停止服务器 (Ctrl+C)

# 2. 确保所有依赖已安装
npm install

# 3. 重新启动开发服务器
npm run dev

# 4. 在浏览器中刷新页面 (Ctrl+F5 强制刷新)

# 5. 重新登录（如果需要）

# 6. 再次尝试创建请求
```

## 📞 仍然有问题？

如果按照以上步骤仍然无法解决，请提供以下信息：

1. 浏览器控制台的完整错误日志
2. 服务器终端的完整错误信息
3. 请求创建时的 requestData 日志
4. Response status 代码
5. MongoDB 是否正在运行

---

**最重要的是：重启开发服务器！** 🔄













