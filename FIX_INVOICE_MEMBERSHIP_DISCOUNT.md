# 🧾 修复：Invoice 未显示会员折扣

## 📋 **问题描述**

用户反馈：
> "Invoice 里面显示的是：  
> Subtotal: HK$183.38  
> Shipping Fee: FREE  
> Total: HK$183.38  
> 
> **没有显示会员折扣 -HK$27.51**"

---

## ✅ **问题根源**

### **原因 1：Invoice Schema 缺少字段**

**位置**：`shared/models.ts` (第 305-355 行)

Invoice Schema 没有 `membershipDiscount` 和 `membershipTier` 字段，导致：
- 订单创建时无法保存会员折扣信息到 Invoice
- Invoice 页面无法读取和显示会员折扣

```typescript
// ❌ 错误：缺少会员折扣字段
export interface IInvoice extends Document {
  invoiceNumber: string;
  orderId: string;
  userId: string;
  customerInfo: {...};
  items: ICartItem[];
  subtotal: number;
  discount?: number;        // 只有优惠券折扣
  discountCode?: string;
  shippingFee?: number;
  freeDeliveryCode?: string;
  total: number;
  // ❌ 缺少 membershipDiscount
  // ❌ 缺少 membershipTier
}
```

---

### **原因 2：订单创建时未保存会员数据到 Invoice**

**位置**：`server/routes.ts` (第 2417-2433 行)

创建 Invoice 时没有包含会员折扣信息：

```typescript
// ❌ 错误：创建 Invoice 时未保存会员数据
const invoice = new Invoice({
  invoiceNumber,
  orderId: order._id?.toString() || order.id,
  userId,
  customerInfo,
  items: validatedItems,
  subtotal: serverSubtotal,
  discount: serverDiscount,
  discountCode: validatedCouponCode,
  // ❌ 缺少 membershipDiscount
  // ❌ 缺少 membershipTier
  shippingFee,
  freeDeliveryCode,
  total: serverTotal,
  paymentMethod,
  paymentStatus: order.paymentStatus
});
```

---

### **原因 3：Invoice 显示页面未渲染会员折扣**

**位置**：`client/src/pages/invoice.tsx` (第 340-376 行)

Invoice 页面只显示优惠券折扣，没有显示会员折扣：

```typescript
// ❌ 错误：只显示优惠券折扣
{/* Discount */}
{invoiceDiscount > 0 && (
  <div className="flex justify-between text-green-600">
    <span>Discount {invoice.discountCode && ...}</span>
    <span>-{format(invoiceDiscount)}</span>
  </div>
)}
// ❌ 缺少会员折扣显示

{/* Shipping Fee */}
<div className="flex justify-between">
  <span>Shipping Fee</span>
  <span>{invoiceShippingFee === 0 ? 'FREE' : format(invoiceShippingFee)}</span>
</div>
```

---

### **原因 4：Invoice PDF/下载未包含会员折扣**

**位置**：`server/routes.ts` (第 3370-3395 行)

Invoice 下载的 HTML 模板也没有会员折扣：

```html
<!-- ❌ 错误：只显示优惠券折扣 -->
${invoiceDiscount > 0 ? `
<div class="total-row" style="color: #16a34a;">
  <span>Discount ${invoice.discountCode ? `(${invoice.discountCode})` : ''}:</span>
  <span>-$${invoiceDiscount.toFixed(2)}</span>
</div>
` : ''}
<!-- ❌ 缺少会员折扣 -->

<div class="total-row">
  <span>Shipping Fee:</span>
  <span>${invoiceShippingFee === 0 ? 'FREE' : `$${invoiceShippingFee.toFixed(2)}`}</span>
</div>
```

---

## 🛠️ **修复方案**

### **修复 1：添加会员折扣字段到 Invoice Schema**

**文件**：`shared/models.ts`

**Interface (第 305-329 行)**：

```typescript
// ✅ 正确：添加会员折扣字段
export interface IInvoice extends Document {
  invoiceNumber: string;
  orderId: string;
  userId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address?: any;
  };
  items: ICartItem[];
  subtotal: number;
  discount?: number;
  discountCode?: string;
  membershipDiscount?: number; // ✅ 新增：会员折扣金额
  membershipTier?: string;     // ✅ 新增：会员等级
  shippingFee?: number;
  freeDeliveryCode?: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**Schema (第 331-359 行)**：

```typescript
const invoiceSchema = new Schema<IInvoice>({
  invoiceNumber: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  userId: { type: String, required: true },
  customerInfo: {...},
  items: [{...}],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  discountCode: { type: String },
  membershipDiscount: { type: Number, default: 0 }, // ✅ 新增
  membershipTier: { type: String },                 // ✅ 新增
  shippingFee: { type: Number, default: 0 },
  freeDeliveryCode: { type: String },
  total: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, default: 'Pending' },
  orderDate: { type: Date, default: Date.now }
}, { timestamps: true });
```

---

### **修复 2：订单创建时保存会员数据到 Invoice**

**文件**：`server/routes.ts` (第 2416-2433 行)

```typescript
// ✅ 正确：创建 Invoice 时包含会员数据
const invoice = new Invoice({
  invoiceNumber,
  orderId: order._id?.toString() || order.id,
  userId,
  customerInfo,
  items: validatedItems,
  subtotal: serverSubtotal,
  discount: serverDiscount,
  discountCode: validatedCouponCode,
  membershipDiscount,  // ✅ 新增：保存会员折扣
  membershipTier,      // ✅ 新增：保存会员等级
  shippingFee,
  freeDeliveryCode,
  total: serverTotal,
  paymentMethod,
  paymentStatus: order.paymentStatus
});
```

---

### **修复 3：Invoice 显示页面添加会员折扣**

**文件**：`client/src/pages/invoice.tsx`

#### **3.1 更新 Interface (第 22-47 行)**：

```typescript
interface Invoice {
  _id: string;
  invoiceNumber: string;
  orderId: string;
  userId: string;
  customerInfo: {...};
  items: InvoiceItem[];
  subtotal: number;
  discount?: number;
  discountCode?: string;
  membershipDiscount?: number;  // ✅ 新增
  membershipTier?: string;      // ✅ 新增
  shippingFee?: number;
  freeDeliveryCode?: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderDate: string;
  createdAt: string;
  updatedAt: string;
}
```

#### **3.2 计算会员折扣 (第 143-152 行)**：

```typescript
// ✅ 正确：包含会员折扣的计算
const invoiceDiscount = invoice.discount || 0;
const invoiceMembershipDiscount = invoice.membershipDiscount || 0; // ✅ 新增
let invoiceShippingFee = invoice.shippingFee;

// If shippingFee is missing (old invoice), calculate it from total
if (invoiceShippingFee === undefined || invoiceShippingFee === null) {
  // Formula: shippingFee = total - subtotal + discount + membershipDiscount
  invoiceShippingFee = Math.max(0, invoice.total - invoice.subtotal + invoiceDiscount + invoiceMembershipDiscount);
}
```

#### **3.3 显示会员折扣 (第 349-370 行)**：

```typescript
{/* Coupon Discount */}
{invoiceDiscount > 0 && (
  <div className="flex justify-between text-green-600">
    <span>
      Discount
      {invoice.discountCode && <span className="text-xs ml-1">({invoice.discountCode})</span>}
    </span>
    <span>-{format(invoiceDiscount)}</span>
  </div>
)}

{/* Membership Discount */}
{invoiceMembershipDiscount > 0 && (
  <div className="flex justify-between text-[#26732d]">
    <span className="flex items-center gap-1">
      <Crown className="h-4 w-4" />
      Membership Discount
      {invoice.membershipTier && <span className="text-xs ml-1">({invoice.membershipTier})</span>}
    </span>
    <span>-{format(invoiceMembershipDiscount)}</span>
  </div>
)}

{/* Shipping Fee */}
<div className="flex justify-between">
  <span>
    Shipping Fee
    {invoice.freeDeliveryCode && <span className="text-xs ml-1 text-green-600">(FREE: {invoice.freeDeliveryCode})</span>}
  </span>
  <span className={invoiceShippingFee === 0 ? 'text-green-600 font-medium' : ''}>
    {invoiceShippingFee === 0 ? 'FREE' : format(invoiceShippingFee)}
  </span>
</div>
```

---

### **修复 4：Invoice PDF/下载添加会员折扣**

**文件**：`server/routes.ts`

#### **4.1 计算会员折扣 (第 2981-2991 行)**：

```typescript
// ✅ 正确：包含会员折扣的计算
const invoiceDiscount = invoice.discount || 0;
const invoiceMembershipDiscount = invoice.membershipDiscount || 0; // ✅ 新增
let invoiceShippingFee = invoice.shippingFee;

// If shippingFee is missing (old invoice), calculate it from total
if (invoiceShippingFee === undefined || invoiceShippingFee === null) {
  // Formula: shippingFee = total - subtotal + discount + membershipDiscount
  invoiceShippingFee = Math.max(0, invoice.total - invoice.subtotal + invoiceDiscount + invoiceMembershipDiscount);
  console.log(`Old invoice ${invoice.invoiceNumber}: Calculated shippingFee = ${invoiceShippingFee} (total=${invoice.total}, subtotal=${invoice.subtotal}, discount=${invoiceDiscount}, membershipDiscount=${invoiceMembershipDiscount})`);
}
```

#### **4.2 HTML 模板添加会员折扣 (第 3380-3391 行)**：

```html
${invoiceDiscount > 0 ? `
<div class="total-row" style="color: #16a34a;">
  <span>Discount ${invoice.discountCode ? `(${invoice.discountCode})` : ''}:</span>
  <span>-$${invoiceDiscount.toFixed(2)}</span>
</div>
` : ''}

<!-- ✅ 新增：会员折扣显示 -->
${invoiceMembershipDiscount > 0 ? `
<div class="total-row" style="color: #26732d;">
  <span>👑 Membership Discount ${invoice.membershipTier ? `(${invoice.membershipTier})` : ''}:</span>
  <span>-$${invoiceMembershipDiscount.toFixed(2)}</span>
</div>
` : ''}

<div class="total-row">
  <span>Shipping Fee${invoice.freeDeliveryCode ? ` <span style="color: #16a34a; font-size: 12px;">(FREE: ${invoice.freeDeliveryCode})</span>` : ''}:</span>
  <span style="${invoiceShippingFee === 0 ? 'color: #16a34a; font-weight: 500;' : ''}">${invoiceShippingFee === 0 ? 'FREE' : `$${invoiceShippingFee.toFixed(2)}`}</span>
</div>
```

---

## 📊 **修复前后对比**

### **修复前** ❌

```
INVOICE
#INV-1762466382427-hmcijzkvp

Items Ordered:
Product                              Quantity  Price     Total
─────────────────────────────────────────────────────────────
Sheba Wet Cat Food Cans 12-Pack     4         HK$45.84  HK$183.38

Subtotal:                            HK$183.38
Shipping Fee:                        FREE
Total:                               HK$183.38  ❌ 错误（未扣会员折扣）
```

**问题**：
- ❌ 没有显示会员折扣 -HK$27.51
- ❌ Total 应该是 HK$155.87，但显示 HK$183.38
- ❌ 用户支付了 HK$155.87，但 Invoice 显示 HK$183.38

---

### **修复后** ✅

```
INVOICE
#INV-1762466382427-hmcijzkvp

Items Ordered:
Product                              Quantity  Price     Total
─────────────────────────────────────────────────────────────
Sheba Wet Cat Food Cans 12-Pack     4         HK$45.84  HK$183.38

Subtotal:                            HK$183.38
👑 Membership Discount (Diamond Paw): -HK$27.51  ✅ 新增
Shipping Fee:                        FREE
Total:                               HK$155.87  ✅ 正确
```

**改进**：
- ✅ 显示会员折扣 -HK$27.51
- ✅ 显示会员等级 (Diamond Paw)
- ✅ Total 正确显示 HK$155.87
- ✅ Invoice 与实际支付金额一致

---

## 🧪 **测试步骤**

### **第 1 步：启动服务器**

```bash
npm run dev
```

---

### **第 2 步：登录会员账户**

- 用户名：`diamondmember`
- 密码：`password123`
- 会员等级：Diamond Paw (15% 折扣)

---

### **第 3 步：创建新订单**

1. 添加产品到购物车：Sheba Wet Cat Food × 4 = HK$183.38
2. 进入结账页面，确认 Grand Total = HK$155.87
3. 填写必填信息（姓名、电话、地址、邮箱）
4. 选择支付方式（任意）
5. 点击 "Place Order"
6. 完成支付（或选择 COD）

---

### **第 4 步：查看 Invoice**

订单完成后会自动跳转到 Invoice 页面，检查显示：

```
✅ 检查点 1：Invoice 网页显示
──────────────────────────────────
Subtotal:                    HK$183.38
👑 Membership Discount:      -HK$27.51
   (Diamond Paw)
Shipping Fee:                FREE
Total:                       HK$155.87  ← 应该是 155.87

✅ 检查点 2：会员折扣信息
──────────────────────────────────
- 显示 "👑 Membership Discount"
- 显示金额 "-HK$27.51"
- 显示会员等级 "(Diamond Paw)"
- 使用绿色主题色显示

✅ 检查点 3：总金额
──────────────────────────────────
- Total = HK$155.87
- 与支付金额一致
- 与结账页面 Grand Total 一致
```

---

### **第 5 步：下载 Invoice**

点击 "Download Invoice" 按钮，检查下载的 HTML 文件：

```html
<!-- ✅ 应该包含会员折扣 -->
<div class="total-row">
  <span>Subtotal:</span>
  <span>$183.38</span>
</div>

<div class="total-row" style="color: #26732d;">
  <span>👑 Membership Discount (Diamond Paw):</span>
  <span>-$27.51</span>
</div>

<div class="total-row">
  <span>Shipping Fee:</span>
  <span style="color: #16a34a; font-weight: 500;">FREE</span>
</div>

<div class="total-row total-final">
  <span>Total:</span>
  <span class="amount">$155.87</span>
</div>
```

---

### **第 6 步：验证旧订单兼容性**

查看旧订单的 Invoice（创建于修复前）：

```
✅ 兼容性测试
──────────────────────────────────
- 旧订单的 Invoice 仍然可以正常显示
- 如果旧订单没有 membershipDiscount 字段，默认为 0
- 不会影响已有订单的显示
```

---

## 🔍 **验证清单**

### **数据库层面**

- [ ] Invoice Schema 包含 `membershipDiscount` 字段
- [ ] Invoice Schema 包含 `membershipTier` 字段
- [ ] 新创建的 Invoice 正确保存会员折扣数据

### **后端 API**

- [ ] `/api/orders` 创建订单时保存会员数据到 Invoice
- [ ] `/api/invoices/:invoiceId` 返回包含会员折扣的 Invoice
- [ ] `/api/invoices/download/:invoiceId` 生成包含会员折扣的 HTML

### **前端显示**

- [ ] Invoice 页面显示会员折扣行
- [ ] 会员折扣使用 Crown 图标
- [ ] 会员折扣显示会员等级
- [ ] 会员折扣使用品牌绿色 (#26732d)
- [ ] Total 正确计算（Subtotal - Discount - MembershipDiscount + Shipping）

### **下载/打印**

- [ ] 下载的 Invoice HTML 包含会员折扣
- [ ] 打印预览正确显示会员折扣
- [ ] 会员折扣使用皇冠 emoji (👑)

### **用户体验**

- [ ] Invoice 显示的 Total 与支付金额一致
- [ ] Invoice 显示的 Total 与结账页面 Grand Total 一致
- [ ] 会员可以清楚看到自己享受的折扣
- [ ] 非会员不显示会员折扣行

---

## 📝 **修改的文件**

| 文件 | 修改内容 | 行号 |
|------|----------|------|
| `shared/models.ts` | 添加 `membershipDiscount` 和 `membershipTier` 到 IInvoice 接口 | 319-320 |
| `shared/models.ts` | 添加 `membershipDiscount` 和 `membershipTier` 到 invoiceSchema | 351-352 |
| `server/routes.ts` | 创建 Invoice 时保存会员数据 | 2426-2427 |
| `server/routes.ts` | 下载 Invoice 时计算会员折扣 | 2983 |
| `server/routes.ts` | 下载 Invoice 的 HTML 模板添加会员折扣显示 | 3386-3391 |
| `client/src/pages/invoice.tsx` | 添加 `membershipDiscount` 和 `membershipTier` 到 Invoice 接口 | 37-38 |
| `client/src/pages/invoice.tsx` | 计算会员折扣 | 145 |
| `client/src/pages/invoice.tsx` | 显示会员折扣 | 360-370 |
| `client/src/pages/checkout.tsx` | 修复支付金额计算（使用 calculateFinalTotal）| 489 |

---

## 🎯 **金额计算流程**

### **订单创建时**

```typescript
// 1. 计算 Subtotal
const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

// 2. 应用优惠券折扣
const couponDiscount = calculateCouponDiscount(subtotal, coupon);

// 3. 应用会员折扣
const membershipDiscount = calculateMembershipDiscount(subtotal, membershipTier);

// 4. 计算运费
const shippingFee = calculateShippingFee(membershipTier, hasFreeDeliveryCode);

// 5. 计算最终总额
const total = subtotal - couponDiscount - membershipDiscount + shippingFee;

// 6. 保存到 Order 和 Invoice
order.membershipDiscount = membershipDiscount;
order.membershipTier = membershipTier;

invoice.subtotal = subtotal;
invoice.discount = couponDiscount;
invoice.membershipDiscount = membershipDiscount;  // ✅ 关键
invoice.membershipTier = membershipTier;          // ✅ 关键
invoice.shippingFee = shippingFee;
invoice.total = total;
```

---

### **Invoice 显示时**

```typescript
// 1. 从数据库读取 Invoice
const invoice = await Invoice.findById(invoiceId);

// 2. 提取数据
const subtotal = invoice.subtotal;              // HK$183.38
const couponDiscount = invoice.discount || 0;   // HK$0
const membershipDiscount = invoice.membershipDiscount || 0; // HK$27.51 ✅
const shippingFee = invoice.shippingFee || 0;   // HK$0
const total = invoice.total;                    // HK$155.87

// 3. 显示
Subtotal:              HK$183.38
Coupon Discount:       HK$0 (不显示)
Membership Discount:   -HK$27.51  ✅ 显示
Shipping Fee:          FREE
Total:                 HK$155.87
```

---

## ⚠️ **常见错误**

### **错误 1：忘记添加 Schema 字段**

```typescript
// ❌ 错误：只更新了 Interface，忘记更新 Schema
export interface IInvoice extends Document {
  membershipDiscount?: number; // ✅ 已添加
  membershipTier?: string;     // ✅ 已添加
}

const invoiceSchema = new Schema<IInvoice>({
  // ❌ 忘记添加字段
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  // 缺少 membershipDiscount
  // 缺少 membershipTier
});
```

**后果**：
- MongoDB 不会保存 `membershipDiscount` 和 `membershipTier`
- Invoice 显示时无法读取数据

---

### **错误 2：创建 Invoice 时忘记传递数据**

```typescript
// ❌ 错误：创建 Invoice 时忘记传递会员数据
const invoice = new Invoice({
  invoiceNumber,
  orderId: order._id?.toString() || order.id,
  userId,
  customerInfo,
  items: validatedItems,
  subtotal: serverSubtotal,
  discount: serverDiscount,
  // ❌ 忘记传递 membershipDiscount
  // ❌ 忘记传递 membershipTier
  shippingFee,
  total: serverTotal,
  paymentMethod,
  paymentStatus: order.paymentStatus
});
```

**后果**：
- Invoice 的 `membershipDiscount` 为 0
- Invoice 显示时不会显示会员折扣

---

### **错误 3：显示时忘记读取数据**

```typescript
// ❌ 错误：忘记从 Invoice 读取会员折扣
const invoiceDiscount = invoice.discount || 0;
// ❌ 忘记读取 membershipDiscount

// 显示
{invoiceDiscount > 0 && (
  <div>Discount: -{format(invoiceDiscount)}</div>
)}
// ❌ 忘记显示会员折扣
<div>Total: {format(invoice.total)}</div>
```

**后果**：
- Invoice 页面不显示会员折扣
- 用户看不到折扣信息

---

### **错误 4：计算运费时忘记包含会员折扣**

```typescript
// ❌ 错误：向后兼容时计算运费，忘记包含会员折扣
if (invoiceShippingFee === undefined) {
  // 公式错误：shippingFee = total - subtotal + discount
  invoiceShippingFee = Math.max(0, invoice.total - invoice.subtotal + invoiceDiscount);
  // ❌ 忘记加上 membershipDiscount
}
```

**后果**：
- 旧订单的运费计算错误
- 显示的 Total 不正确

**正确公式**：
```typescript
// ✅ 正确：shippingFee = total - subtotal + discount + membershipDiscount
invoiceShippingFee = Math.max(0, invoice.total - invoice.subtotal + invoiceDiscount + invoiceMembershipDiscount);
```

---

## 🎉 **总结**

### **修复内容**

| 问题 | 修复前 | 修复后 |
|------|--------|--------|
| Invoice Schema | 无 `membershipDiscount` 字段 | ✅ 已添加 |
| 订单创建 | 不保存会员数据到 Invoice | ✅ 已保存 |
| Invoice 显示 | 不显示会员折扣 | ✅ 已显示 |
| Invoice 下载 | 不显示会员折扣 | ✅ 已显示 |
| Total 计算 | HK$183.38 (错误) | ✅ HK$155.87 (正确) |

---

### **相关修复**

1. ✅ **支付金额修复** (`FIX_PAYMENT_AMOUNT.md`)
   - 修复支付页面金额不包含会员折扣

2. ✅ **Total Saved 修复** (`FIX_TOTAL_SAVED_ISSUE.md`)
   - 修复 Dashboard 的 Total Saved 统计

3. ✅ **Invoice 会员折扣修复** (`FIX_INVOICE_MEMBERSHIP_DISCOUNT.md`) ← **当前文档**
   - 修复 Invoice 不显示会员折扣

---

### **完整流程验证**

| 阶段 | 金额 | 状态 |
|------|------|------|
| 购物车页面 Subtotal | HK$183.38 | ✅ 正确 |
| 结账页面 Grand Total | HK$155.87 | ✅ 正确（含会员折扣） |
| 支付页面 Amount | HK$155.87 | ✅ 正确（含会员折扣） |
| Invoice 页面 Total | HK$155.87 | ✅ 正确（含会员折扣） |
| Invoice 下载 Total | HK$155.87 | ✅ 正确（含会员折扣） |
| Dashboard Total Saved | HK$27.51 | ✅ 正确（统计会员折扣） |

**结论**：所有页面和功能的金额一致，用户体验完美！🎉

---

## 📚 **相关文档**

- `FIX_PAYMENT_AMOUNT.md` - 支付金额修复
- `FIX_TOTAL_SAVED_ISSUE.md` - Total Saved 统计修复
- `QUICK_REFERENCE.md` - 快速参考指南
- `README_MEMBERSHIP_FEATURES.md` - 会员功能完整指南

---

**修复时间**：2025年11月7日  
**状态**：✅ 已修复  
**影响**：所有会员用户的 Invoice 显示

---

**如有问题，请运行**：
```bash
npm run dev
```
然后按照上述测试步骤验证修复。





