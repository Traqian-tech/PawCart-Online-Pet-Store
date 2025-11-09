# ⚡ 快速参考卡

## 🎯 **测试账户**

```
Silver Paw:   silvermember / password123   (5% 折扣)
Golden Paw:   goldenmember / password123   (10% 折扣)
Diamond Paw:  diamondmember / password123  (15% 折扣)
```

---

## 🛠️ **常用命令**

```bash
# 启动服务器
npm run dev

# 验证订单折扣（修复 Total Saved = $0.00）
npm run verify-order-discounts

# 标记会员专属产品
npm run mark-member-products

# 测试邮件通知
npm run membership-cron

# 检查用户
npm run check-users
```

---

## 🔍 **快速调试**

### **问题 1：Total Saved 显示 $0.00**

```bash
# 1. 验证订单
npm run verify-order-discounts

# 2. 下新订单测试
# 3. 检查后端日志是否显示：
#    MembershipDiscount=$XX.XX

# 4. 检查 Dashboard
```

### **问题 2：支付金额不包含会员折扣**

```bash
# 症状：
# - 结账页面显示 Grand Total = $155.87
# - 支付页面显示 Amount = $183.38 (未扣折扣)

# 原因：
# - 支付页面使用了 getFinalTotal() 而不是 calculateFinalTotal()

# 验证：
# 1. 结账页面查看 Grand Total
# 2. 提交订单后查看支付页面 Amount
# 3. 两者应该相同
```

### **问题 3：Invoice 不显示会员折扣**

```bash
# 症状：
# - Invoice 显示 Total = $183.38 (未扣会员折扣)
# - Invoice 没有显示 "Membership Discount -$27.51"

# 原因：
# - Invoice Schema 缺少 membershipDiscount 字段
# - 创建订单时未保存会员数据到 Invoice
# - Invoice 显示页面未渲染会员折扣

# 修复：
# - 已添加 membershipDiscount 和 membershipTier 到 Invoice Schema
# - 已在订单创建时保存会员数据
# - 已更新 Invoice 显示和下载功能

# 验证：
# 1. 创建新订单
# 2. 查看 Invoice 页面，应该显示会员折扣
# 3. 下载 Invoice，HTML 应该包含会员折扣
# 4. Total 应该与支付金额一致
```

### **🚨 问题 4：Invoice Total 计算错误（Critical）**

```bash
# 症状：
# - Invoice 显示会员折扣 -$41.26
# - 但 Total = $275.07（未扣折扣）
# - 正确的 Total 应该是 $233.81

# 原因：
# - server/routes.ts 第 2391 行计算 serverTotal 时
# - 忘记减去 membershipDiscount

# 修复前：
# const serverTotal = Math.max(0, serverSubtotal - serverDiscount + shippingFee);

# 修复后：
# const serverTotal = Math.max(0, serverSubtotal - serverDiscount - membershipDiscount + shippingFee);

# 影响：
# - 数据库中保存的 order.total 不正确
# - 数据库中保存的 invoice.total 不正确
# - Invoice 显示的 Total 不正确
# - 但用户实际支付金额是正确的（前端计算）

# 验证：
# 1. 创建新订单（会员账户）
# 2. 检查 Invoice Total = Subtotal - MembershipDiscount
# 3. 检查 Invoice Total = 支付金额
# 4. 示例：275.07 - 41.26 = 233.81 ✓
```

### **🚨 问题 5：会员折扣计算错误 + Total Saved 显示 $0.00（Critical）**

```bash
# 症状：
# - Invoice 显示 Membership Discount -$48.50
# - Invoice Total 正确
# - 但 Dashboard Total Saved = $0.00 ❌

# 原因：
# 1. 前端：基于商品原价（cartState.total）计算会员折扣
#    - 应该基于扣除优惠券后的金额（getFinalTotal()）
# 2. 服务器端：不验证，直接使用前端传递的值
#    - 应该验证用户会员资格并重新计算

# 示例：
# Subtotal = $323.40
# Coupon = -$50.00
# After Coupon = $273.40
# 
# ❌ 错误：323.40 × 15% = 48.51（基于 Subtotal）
# ✅ 正确：273.40 × 15% = 41.01（基于 After Coupon）

# 修复：
# 1. checkout.tsx & cart.tsx：
#    const baseTotal = getFinalTotal();  // 扣除优惠券后
#    const amount = baseTotal * percentage / 100;
#
# 2. server/routes.ts：
#    - 验证用户会员资格
#    - 重新计算：afterCouponTotal × membershipRate
#    - 使用服务器端计算的值保存

# 验证：
# 1. 创建订单（有优惠券 + 会员折扣）
# 2. 检查服务器日志：
#    "Server-side membership validation: Diamond Paw (15%) - Discount: $41.01"
# 3. 查看 Dashboard Total Saved = $41.01 ✓
```

### **问题：会员专属产品看不到**

```bash
# 标记产品
npm run mark-member-products

# 刷新页面
```

### **问题：邮件发送失败**

```bash
# 1. 配置 .env
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your@email.com
EMAIL_PASSWORD=app-password

# 2. 测试
npm run membership-cron
```

---

## 📊 **API 端点**

```
# 会员统计
GET /api/membership/statistics/:userId

# 会员信息
GET /api/membership/:userId

# 切换自动续费
POST /api/membership/toggle-auto-renew
Body: { userId, autoRenew }

# 订单列表
GET /api/orders/user/:userId
```

---

## 📝 **文档索引**

| 需求 | 文档 |
|------|------|
| 所有功能列表 | `README_MEMBERSHIP_FEATURES.md` |
| Total Saved 修复 | `FIX_TOTAL_SAVED_ISSUE.md` |
| 支付金额修复 | `FIX_PAYMENT_AMOUNT.md` |
| Invoice 会员折扣修复 | `FIX_INVOICE_MEMBERSHIP_DISCOUNT.md` |
| 🚨 Invoice Total 计算修复 | `FIX_CRITICAL_TOTAL_CALCULATION.md` |
| 🚨 会员折扣计算修复 | `FIX_MEMBERSHIP_DISCOUNT_CALCULATION.md` |
| 邮件配置 | `EMAIL_SETUP_GUIDE.md` |
| 完整功能总结 | `COMPLETE_FEATURES_SUMMARY.md` |
| 快速开始 | `GETTING_STARTED.md` |

---

## ✅ **检查清单**

### **功能测试**
- [ ] 会员折扣正常工作
- [ ] Total Saved 显示正确金额
- [ ] 会员专属产品可见
- [ ] 自动续费开关可用
- [ ] 免运费自动应用

### **数据验证**
- [ ] 订单包含 membershipDiscount
- [ ] Dashboard 统计准确
- [ ] 专属产品购买记录正确

### **邮件功能**（可选）
- [ ] 邮箱已配置
- [ ] Cron Job 正常运行
- [ ] 到期提醒邮件发送

---

**快速帮助**：遇到问题先查看对应文档，或运行验证命令检查


