# PawCart UI 优化 - 快速使用指南

## 🎨 新增的品牌色变量

在项目中可以直接使用以下CSS变量：

```css
/* 主品牌色 */
var(--meow-yellow)        /* 品牌金黄色 */
var(--meow-green)         /* 品牌绿色 */
var(--meow-green-hover)   /* 悬停绿色 */

/* 强调色 */
var(--meow-orange)        /* 温暖橙 */
var(--meow-pink)          /* 活泼粉 */
var(--meow-blue)          /* 鲜明蓝 */
var(--meow-purple)        /* 高级紫 */

/* 中性色 */
var(--meow-gray-100) 到 var(--meow-gray-900)

/* 语义色 */
var(--meow-success)       /* 成功绿 */
var(--meow-warning)       /* 警告黄 */
var(--meow-error)         /* 错误红 */
var(--meow-info)          /* 信息蓝 */
```

## 🎯 新增的按钮变体

```tsx
// 品牌黄色按钮（推荐用于主要行动按钮）
<Button variant="meow">立即购买</Button>

// 品牌绿色按钮（推荐用于确认操作）
<Button variant="meowGreen">确认订单</Button>

// 品牌轮廓按钮（推荐用于次要操作）
<Button variant="meowOutline">了解更多</Button>

// 渐变按钮（推荐用于特殊操作）
<Button variant="meowGradient">特别优惠</Button>

// 高级按钮（推荐用于会员功能）
<Button variant="premium">升级VIP</Button>

// 信息按钮
<Button variant="info">查看详情</Button>
```

## 🏷️ 新增的徽章变体

```tsx
// 品牌徽章
<Badge variant="meow">热卖</Badge>
<Badge variant="meowGreen">新品</Badge>

// 语义徽章
<Badge variant="success">已发货</Badge>
<Badge variant="warning">库存不足</Badge>
<Badge variant="info">预售中</Badge>
```

## ✨ 实用动画类

### 淡入动画
```tsx
<div className="animate-fade-in">淡入内容</div>
<div className="animate-fade-in-up">向上淡入</div>
```

### 悬停效果
```tsx
<div className="hover-lift">悬浮上升</div>
<div className="hover-scale">悬浮放大</div>
<div className="hover-glow">悬浮发光</div>
```

### 卡片效果
```tsx
<Card className="card-elevated">悬浮卡片</Card>
<Card className="card-brand">品牌风格卡片</Card>
```

### 图片效果
```tsx
<div className="image-zoom">
  <img src="..." />  {/* 悬浮时缩放 */}
</div>
```

### 加载效果
```tsx
<div className="shimmer">加载中...</div>
<div className="pulse-soft">柔和脉冲</div>
```

## 🎨 渐变背景类

```tsx
// 品牌渐变（绿色系）
<div className="gradient-brand">品牌渐变背景</div>

// 强调渐变（黄橙色系）
<div className="gradient-accent">强调渐变背景</div>

// 高级渐变（紫粉色系）
<div className="gradient-premium">高级渐变背景</div>
```

## 📦 组件使用示例

### 增强的输入框
```tsx
<Input 
  placeholder="搜索产品..." 
  className="focus-visible:border-[var(--meow-green)]"
/>
```

### 增强的卡片
```tsx
<Card className="hover:border-[var(--meow-green)] transition-all">
  <CardHeader>
    <CardTitle>产品名称</CardTitle>
    <CardDescription>产品描述</CardDescription>
  </CardHeader>
  <CardContent>
    内容区域
  </CardContent>
</Card>
```

## 🎯 设计令牌使用

### 阴影
```css
box-shadow: var(--shadow-sm);      /* 小阴影 */
box-shadow: var(--shadow-md);      /* 中阴影 */
box-shadow: var(--shadow-lg);      /* 大阴影 */
box-shadow: var(--shadow-brand);   /* 品牌阴影 */
box-shadow: var(--shadow-glow-yellow);  /* 黄色发光 */
```

### 圆角
```css
border-radius: var(--radius-sm);   /* 小圆角 6px */
border-radius: var(--radius-md);   /* 中圆角 8px */
border-radius: var(--radius-lg);   /* 大圆角 12px */
border-radius: var(--radius-xl);   /* 超大圆角 16px */
```

### 间距
```css
padding: var(--spacing-4);         /* 16px */
margin: var(--spacing-8);          /* 32px */
```

## 💡 最佳实践

### 1. 主要操作按钮
使用 `variant="meow"` 或 `variant="meowGreen"`

### 2. 重要信息提示
使用品牌色徽章和强调色

### 3. 卡片悬停效果
添加 `card-brand` 或 `hover-lift` 类

### 4. 表单输入
保持统一的聚焦颜色（品牌绿色）

### 5. 页面过渡
使用 `animate-fade-in` 或 `animate-slide-up`

## 🔧 自定义提示

如需自定义品牌色，可在 `client/src/index.css` 的 `:root` 中修改CSS变量值。

所有组件都支持通过 `className` prop 进行进一步定制。

## 📞 技术支持

如有问题，请查看 `UI_OPTIMIZATION_SUMMARY.md` 了解详细的优化内容。

