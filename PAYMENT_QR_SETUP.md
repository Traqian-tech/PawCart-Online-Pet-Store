# Mobile Payment QR Code Setup Guide

## 📱 支付二维码设置指南

### 需要添加的文件

请将您的支付二维码图片保存到 `client/public/` 文件夹中，文件名如下：

1. **支付宝二维码**: `alipay.jpg`
2. **微信二维码**: `wechat.jpg`

### 文件路径
```
MeowMeowPetShop_Construction-main/
├── client/
│   └── public/
│       ├── alipay.jpg    ← 支付宝收款码
│       ├── wechat.jpg    ← 微信收款码
│       ├── logo.png
│       └── ...
```

### 设置步骤

1. 打开您的文件管理器
2. 导航到项目目录: `client/public/`
3. 将两张二维码图片复制到该目录
4. 重命名文件：
   - 支付宝二维码 → `alipay.jpg`
   - 微信二维码 → `wechat.jpg`

### 图片要求

- **格式**: PNG, JPG, JPEG 都支持
- **建议尺寸**: 400x400 像素或更高（系统会自动调整显示大小）
- **文件大小**: 建议不超过 2MB

### 如何使用

1. 用户在结账时选择 "Mobile Payment"
2. 选择支付宝或微信支付
3. 系统会显示对应的二维码
4. 用户扫码支付后，点击"I Have Paid"按钮
5. 订单自动完成

### 功能特点

✅ 支持支付宝和微信支付切换
✅ 显示订单金额和ID
✅ 提供详细的支付说明
✅ "我已支付"确认按钮
✅ 美观的UI设计，匹配支付宝/微信品牌色

### 测试

完成设置后，您可以：
1. 启动项目
2. 进入会员结账页面（Membership Checkout）
3. 选择 "Mobile Payment"
4. 点击 "Proceed to Payment"
5. 验证二维码是否正确显示

---

## Technical Details

### Modified Files

- `client/src/components/ui/payment-method-selector.tsx`
  - Updated mobile payment UI to display QR codes
  - Removed password input
  - Added "I Have Paid" button
  - Improved visual design with brand colors

### QR Code Display

- Alipay: Blue theme (#1677FF)
- WeChat: Green theme (#07C160)
- QR codes are displayed at 256x256px
- Fallback message if image not found

### Payment Flow

1. User selects Mobile Payment
2. User chooses Alipay or WeChat
3. QR code is displayed
4. User scans and pays
5. User clicks "I Have Paid"
6. Transaction is completed

---

**Note**: 如果二维码图片未找到，系统会显示一个占位符提示您添加图片。

