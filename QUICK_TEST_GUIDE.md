# 🚀 快速测试指南 - 会员系统增强功能

## ⚡ 5分钟测试三大功能

---

## 🧪 **测试前准备**

### **1. 启动服务器**
```bash
npm run dev
```

### **2. 登录你的 Diamond Paw 账号**
- **邮箱**：`1374033928@qq.com`
- **密码**：你的密码

---

## ✅ **测试 1：会员自动续费（最简单）**

### **步骤**
1. 访问：`http://localhost:5000/dashboard`
2. 滚动到会员卡
3. 查看底部 "⚡ Auto-Renew Membership" 开关
4. 点击开关切换
5. 观察 Toast 提示

### **预期结果**
- ✅ 看到 "✅ Auto-Renew Enabled" 或 "❌ Auto-Renew Disabled"
- ✅ 开关状态实时改变
- ✅ 刷新页面，状态保持不变

**状态**：🟢 最容易测试，立即可见

---

## ✅ **测试 2：会员到期提醒**

### **方法 A：临时修改到期日期（推荐）**

#### **步骤 1：打开 MongoDB Compass**
- 连接到：`mongodb://localhost:27017`
- 选择数据库：`petshop`（或你的数据库名）
- 选择集合：`users`

#### **步骤 2：找到你的用户**
- 过滤：`{ "email": "1374033928@qq.com" }`

#### **步骤 3：修改到期日期**
点击编辑，修改 `membership.expiryDate`：
```json
{
  "membership": {
    "tier": "Diamond Paw",
    "startDate": "...",
    "expiryDate": "2025-11-12T00:00:00.000Z",  // 改为6天后
    "autoRenew": false
  }
}
```

#### **步骤 4：刷新 Dashboard**
1. 访问：`http://localhost:5000/dashboard`
2. 观察顶部（会员卡上方）

### **预期结果**
- ✅ 看到橙色警告横幅
- ✅ 显示 "⏰ Membership Expiring Soon!"
- ✅ 显示剩余天数
- ✅ 显示 "Renew Now" 按钮
- ✅ 页面加载时弹出 Toast 通知（仅首次，每天一次）

### **方法 B：等待自然到期（不推荐）**
- 你的会员到期日期是 `2025-12-07`
- 需要等到 `2025-12-01` 才会触发提醒

**状态**：🟡 需要修改数据库，但效果明显

---

## ✅ **测试 3：会员专属产品标签**

### **步骤 1：标记产品为会员专属**

打开终端，运行：
```bash
cd server
npx tsx mark-member-products.ts
```

**预期输出**：
```
Connecting to database...
Marking premium products as member-exclusive...
✅ Marked 12 products as member-exclusive

📦 Sample Member-Exclusive Products:
  - Royal Canin Persian Adult ($54.99)
  - Royal Canin British Shorthair ($52.99)
  ...
```

### **步骤 2：测试会员访问**

1. **确保已登录 Diamond Paw 账号**
2. 访问：`http://localhost:5000/products`
3. 查找价格 ≥ $50 的产品
4. 观察产品卡片

**预期结果**：
- ✅ 看到 `👑 Member Only` 紫粉色徽章（左上角）
- ✅ 点击 "Add to Cart" 正常工作
- ✅ 成功添加到购物车

### **步骤 3：测试非会员访问**

1. **登出当前账号**
   - 点击右上角头像 → Logout
2. **注册新账号**（或使用测试账号）
   - 访问：`http://localhost:5000`
   - 注册一个新用户（不购买会员）
3. **访问产品页面**：`http://localhost:5000/products`
4. **找到同样的会员专属产品**
5. **点击 "Add to Cart"**

**预期结果**：
- ✅ 弹出提示：`👑 Member-Only Product`
- ✅ 描述：`This product is exclusive to our Privilege Club members. Upgrade now to unlock!`
- ✅ 显示 `Join Club` 按钮
- ❌ **不会**添加到购物车

**状态**：🟡 需要运行脚本，但效果最明显

---

## 📊 **测试结果对比表**

| 功能 | 难度 | 时间 | 视觉效果 |
|------|------|------|----------|
| **自动续费开关** | 🟢 简单 | 30秒 | ⭐⭐⭐ 立即可见 |
| **到期提醒横幅** | 🟡 中等 | 2分钟 | ⭐⭐⭐⭐⭐ 非常明显 |
| **会员专属产品** | 🟡 中等 | 3分钟 | ⭐⭐⭐⭐⭐ 徽章 + 弹窗 |

---

## 🎬 **完整测试流程（推荐顺序）**

### **5分钟完整测试**

```bash
# 1. 启动服务器
npm run dev

# 2. 标记会员专属产品（新终端窗口）
cd server
npx tsx mark-member-products.ts

# 3. 浏览器测试
# ① 登录 Diamond Paw 账号
# ② 访问 Dashboard → 测试自动续费开关
# ③ 访问 Products → 查看会员专属徽章
# ④ 登出 → 注册新账号 → 测试权限控制
# ⑤ MongoDB Compass → 修改到期日期 → 测试提醒横幅
```

---

## 🐛 **常见问题**

### **Q1：自动续费开关没有反应？**
**检查**：
- 打开浏览器开发者工具（F12）
- 查看 Console 是否有错误
- 查看 Network → 找到 `/api/membership/toggle-autorenew`
- 检查响应状态

### **Q2：没有看到会员专属产品徽章？**
**原因**：
- 没有运行标记脚本
- 产品数据库没有符合条件的产品

**解决**：
```bash
cd server
npx tsx mark-member-products.ts
```

### **Q3：到期提醒横幅没有显示？**
**原因**：
- 到期日期 > 7 天
- 会员已过期

**解决**：
- 使用 MongoDB Compass 修改 `membership.expiryDate` 为 6 天后
- 刷新 Dashboard

### **Q4：Toast 弹窗只显示一次？**
**设计如此**：
- 每天只显示一次（localStorage 记录）
- 避免骚扰用户

**测试方法**：
```javascript
// 浏览器 Console
localStorage.removeItem('membershipExpiryNotification');
location.reload();
```

---

## 📸 **截图位置**

### **功能 1：自动续费开关**
- 位置：Dashboard → 会员卡底部
- 关键词：`⚡ Auto-Renew Membership`

### **功能 2：到期提醒横幅**
- 位置：Dashboard → 页面顶部（会员卡上方）
- 关键词：`⏰ Membership Expiring Soon!`

### **功能 3：会员专属徽章**
- 位置：产品卡片左上角
- 关键词：`👑 Member Only`

---

## ✅ **测试完成检查清单**

```
测试 1：自动续费
□ 看到开关
□ 点击有反应
□ Toast 提示正确
□ 刷新后状态保持

测试 2：到期提醒
□ 修改到期日期成功
□ 看到橙色横幅
□ Toast 弹窗显示
□ 点击 "Renew Now" 跳转正确

测试 3：会员专属产品
□ 脚本运行成功
□ 会员看到徽章
□ 会员可以购买
□ 非会员看到徽章
□ 非会员无法购买
□ 非会员看到升级提示
```

---

## 🎉 **全部通过！**

如果所有测试都通过，恭喜你！三大功能全部正常工作！🎊

**接下来可以**：
- 向用户展示新功能
- 准备部署到生产环境
- 添加更多会员权益

---

**需要帮助？**
- 查看 `MEMBERSHIP_ENHANCEMENTS.md` 了解技术细节
- 检查浏览器 Console 和 Network 面板
- 查看服务器终端日志






