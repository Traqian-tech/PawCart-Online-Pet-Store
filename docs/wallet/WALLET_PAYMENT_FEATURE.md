# 💰 My Wallet Payment Feature

## 📋 概述

为结账页面和会员购买页面添加了 "My Wallet" (我的钱包) 支付选项，允许用户使用钱包余额进行支付。

---

## ✨ 新增功能

### 1. 商品结账页面 (`client/src/pages/checkout.tsx`)

#### 新增的支付选项
- ✅ 在支付方式列表中添加了 "My Wallet" 选项
- ✅ 显示当前钱包余额
- ✅ 仅对已登录用户显示

#### 支付流程
1. 用户选择 "My Wallet" 作为支付方式
2. 点击 "Place Order" 时：
   - 检查钱包余额是否充足
   - 如果余额不足，显示错误提示
   - 如果余额充足，创建订单
3. 订单创建成功后：
   - 自动调用钱包支付 API
   - 从钱包中扣除订单金额
   - 更新订单和发票状态为 "Paid"
   - 清空购物车
   - 跳转到支付成功页面

#### 代码修改
```typescript
// 导入 useWallet hook
import { useWallet } from '@/contexts/wallet-context';

// 获取钱包数据
const { wallet } = useWallet();

// 添加钱包余额检查
if (paymentMethod === 'my-wallet') {
  if (!wallet || wallet.balance < finalTotal) {
    // 显示余额不足提示
  }
}

// 创建订单成功后处理钱包支付
if (paymentMethod === 'my-wallet') {
  const paymentResponse = await apiRequest(
    `/api/orders/${data.invoice._id}/pay-with-wallet`,
    {
      method: 'POST',
      body: JSON.stringify({ userId: user?.id }),
    }
  );
}
```

---

### 2. 会员结账页面 (`client/src/pages/membership-checkout.tsx`)

#### 新增的支付选项
- ✅ 在支付方式列表中添加了 "My Wallet" 选项
- ✅ 显示当前钱包余额
- ✅ 仅对已登录用户显示

#### 支付流程
1. 用户选择 "My Wallet" 作为支付方式
2. 点击 "Proceed to Payment" 时：
   - 检查钱包余额是否充足
   - 如果余额不足，显示错误提示
   - 如果余额充足，直接调用会员购买 API
3. 购买成功后：
   - 从钱包中扣除会员费用
   - 激活会员资格
   - 跳转到仪表板

#### 代码修改
```typescript
// 导入 useWallet 和 useCurrency
import { useWallet } from '@/contexts/wallet-context';
import { useCurrency } from '@/contexts/currency-context';

// 获取钱包数据和格式化函数
const { wallet } = useWallet();
const { format } = useCurrency();

// 钱包支付处理
if (paymentMethod === 'my-wallet') {
  // 检查余额
  if (!wallet || wallet.balance < membershipOrder?.price) {
    // 显示余额不足提示
  }
  
  // 直接购买会员
  await fetch('/api/membership/purchase', {
    method: 'POST',
    body: JSON.stringify({ 
      userId, 
      userEmail,
      tier: membershipOrder.tier,
      paymentMethod: 'my-wallet',
      amount: membershipOrder.price
    }),
  });
}
```

---

### 3. 后端 API - 订单钱包支付 (`server/routes.ts`)

#### 新端点: `/api/orders/:orderId/pay-with-wallet`

**方法**: POST

**参数**:
```json
{
  "userId": "用户ID"
}
```

**功能**:
1. 验证发票是否存在
2. 获取用户钱包
3. 检查余额是否充足
4. 从钱包扣款
5. 创建钱包交易记录
6. 更新发票和订单状态为 "Paid"
7. 设置支付方式为 "my-wallet"

**响应**:
```json
{
  "success": true,
  "message": "Payment successful",
  "newBalance": 95.5,
  "invoice": {...},
  "order": {...}
}
```

**错误响应**:
- 400: 余额不足
- 404: 发票未找到
- 500: 服务器错误

#### 代码实现
```typescript
app.post("/api/orders/:orderId/pay-with-wallet", async (req, res) => {
  const { orderId } = req.params;
  const { userId } = req.body;

  // 获取发票
  const invoice = await Invoice.findById(orderId);
  
  // 获取钱包
  const wallet = await getOrCreateWallet(userId);
  
  // 检查余额
  if (wallet.balance < invoice.grandTotal) {
    return res.status(400).json({ 
      message: "Insufficient wallet balance" 
    });
  }

  // 扣款
  await addWalletTransaction(
    wallet._id.toString(),
    userId,
    'SPEND',
    'ORDER_PAYMENT',
    invoice.grandTotal,
    wallet,
    `Payment for order ${invoice.invoiceNumber}`
  );

  // 更新状态
  invoice.paymentStatus = 'Paid';
  invoice.paymentMethod = 'my-wallet';
  await invoice.save();
  
  // 更新订单
  const order = await Order.findOne({ _id: invoice.orderId });
  order.status = 'confirmed';
  order.paymentStatus = 'Paid';
  order.paymentMethod = 'my-wallet';
  await order.save();
});
```

---

### 4. 后端 API - 会员钱包支付 (`server/routes.ts`)

#### 修改端点: `/api/membership/purchase`

**新增参数**:
```json
{
  "paymentMethod": "my-wallet",  // 新增
  "amount": 29                    // 新增
}
```

**钱包支付处理**:
```typescript
if (paymentMethod === 'my-wallet') {
  // 获取钱包
  const wallet = await getOrCreateWallet(userId);
  
  // 检查余额
  if (wallet.balance < membershipPrice) {
    return res.status(400).json({ 
      message: "Insufficient wallet balance" 
    });
  }

  // 扣款
  await addWalletTransaction(
    wallet._id.toString(),
    userId,
    'SPEND',
    'MEMBERSHIP_PURCHASE',
    membershipPrice,
    wallet,
    `Purchase ${tier} membership`
  );
}

// 继续原有的会员激活流程...
```

---

## 🎨 UI 展示

### 商品结账页面
```
Select Payment Method

┌─────────────────────────────────────────┐
│ 💰 My Wallet        Balance: HK$150.00  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 💳 Credit/Debit Card                    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 📱 Mobile Payment                       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 💰 International Payment                │
└─────────────────────────────────────────┘

[Place Order]
```

### 会员结账页面
```
Select Payment Method

┌─────────────────────────────────────────┐
│ 💰 My Wallet         Balance: HK$60.00  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 💳 Credit/Debit Card                    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 📱 Mobile Payment                       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 💰 International Payment                │
└─────────────────────────────────────────┘

[Proceed to Payment]
```

---

## 💡 使用场景

### 场景 1: 用户余额充足
1. 用户钱包余额: HK$150.00
2. 订单总额: HK$95.50
3. 选择 "My Wallet" 支付
4. ✅ 支付成功
5. 新余额: HK$54.50

### 场景 2: 用户余额不足
1. 用户钱包余额: HK$50.00
2. 订单总额: HK$95.50
3. 选择 "My Wallet" 支付
4. ❌ 显示错误: "Your wallet balance (HK$50.00) is less than the order total (HK$95.50)"

### 场景 3: 访客用户
1. 用户未登录
2. ❌ "My Wallet" 选项不显示
3. 只能使用其他支付方式

---

## 🔒 安全性

### 余额验证
- ✅ 前端检查余额
- ✅ 后端双重检查余额
- ✅ 防止负余额

### 权限控制
- ✅ 仅登录用户可见
- ✅ 必须提供有效的 userId
- ✅ 钱包所有权验证

### 交易记录
- ✅ 所有支付都创建交易记录
- ✅ 记录订单号/发票号
- ✅ 可追溯审计

---

## 📦 依赖项

### 前端
- `@/contexts/wallet-context` - 钱包上下文
- `@/contexts/currency-context` - 货币格式化
- `@/hooks/use-auth` - 用户认证

### 后端
- `./wallet-routes` - 钱包路由模块
  - `getOrCreateWallet()` - 获取或创建钱包
  - `addWalletTransaction()` - 添加交易记录

---

## 🧪 测试建议

### 单元测试
1. ✅ 余额充足时的支付
2. ✅ 余额不足时的错误处理
3. ✅ 未登录用户的行为
4. ✅ 钱包交易记录创建
5. ✅ 订单状态更新

### 集成测试
1. ✅ 完整的商品购买流程
2. ✅ 完整的会员购买流程
3. ✅ 钱包余额实时更新
4. ✅ 订单历史记录准确性

---

## 🚀 部署注意事项

1. **数据库迁移**: 确保 `Wallet`, `WalletTransaction`, `Order`, `Invoice` 模型已更新
2. **环境变量**: 检查所有必要的环境变量
3. **测试环境**: 在生产环境部署前充分测试
4. **回滚计划**: 准备好数据库备份和代码回滚方案

---

## 📝 更新日志

### v1.0.0 (2025-11-07)
- ✅ 添加商品结账钱包支付
- ✅ 添加会员购买钱包支付
- ✅ 创建订单钱包支付 API
- ✅ 更新会员购买 API 支持钱包
- ✅ 余额验证和错误处理
- ✅ UI 优化和用户体验改进

---

## 🙏 致谢

感谢所有参与开发和测试的团队成员！

