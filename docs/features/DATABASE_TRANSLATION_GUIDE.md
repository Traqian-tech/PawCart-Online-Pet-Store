# 🗄️ 数据库翻译指南

## 📋 概述

此脚本将自动翻译数据库中所有产品的中文内容为英文，包括：
- ✅ 产品名称（name）
- ✅ 产品描述（description）
- ✅ 产品标签（tags）

---

## 🚀 使用方法

### **运行翻译脚本：**

```bash
npm run translate-db
```

### **脚本会自动：**
1. 连接到MongoDB数据库
2. 读取所有产品
3. 将中文翻译成英文
4. 更新数据库
5. 显示翻译结果统计

---

## 📊 翻译示例

### **产品名称：**
| 原始（中文） | 翻译后（英文） |
|------------|--------------|
| 优质室内猫猫粮 2kg | Premium Indoor Cat Cat Food 2kg |
| 妙鲜PACK混合装 20包 | Meow Fresh PACK Mixed Pack 20 Pack |
| Cat自动饮水机 2L | Cat Automatic Water Fountain 2L |
| Cat封闭式Cat盆 大号 | Cat Enclosed Cat Box Large |
| 豆腐砂 6L 绿茶味 | Tofu Litter 6L Green Tea Flavor |
| Royal Canin成猫化毛球粮 | Royal Canin Adult Cat Hairball Control Food |

### **产品描述：**
| 原始（中文） | 翻译后（英文） |
|------------|--------------|
| 无谷物配方，天然食材，适合敏感狗狗 | Grain-Free Formula, Natural Ingredients, Suitable for Sensitive Dogs |
| 全面营养配方，促进健康活力 | Complete Nutrition Formula, Promotes Health Vitality |
| 针对英短体质研发，强健骨骼和肌肉 | For British Shorthair Physique Developed, Strengthens Bones and Muscles |

### **产品标签：**
| 原始（中文） | 翻译后（英文） |
|------------|--------------|
| 优质 | Premium |
| 室内猫 | Indoor Cat |
| 猫粮 | Cat Food |

---

## ⚙️ 工作原理

### **翻译词典：**
脚本使用包含**200+**中文词汇的翻译词典，涵盖：
- 动物类型（猫、狗、犬、幼猫、成猫等）
- 食品类型（猫粮、狗粮、罐头、零食等）
- 口味（鸡肉、牛肉、三文鱼等）
- 猫砂类型（豆腐砂、水晶砂、膨润土等）
- 宠物用品（饮水机、喂食器、指甲剪等）
- 产品特性（优质、室内、专业级等）

### **翻译算法：**
1. 按词汇长度排序（长词优先）
2. 逐个替换中文词汇为英文
3. 转换中文标点为英文标点
4. 清理多余空格

---

## 📝 运行前检查

### ✅ **确保以下配置正确：**

1. **MongoDB连接字符串**
   - 文件：`.env`
   - 变量：`MONGODB_URI`
   - 示例：`mongodb+srv://user:password@cluster.mongodb.net/petshop`

2. **数据库中有产品数据**
   - 运行前确保数据库已有产品记录

---

## 🔍 运行示例

### **执行命令：**
```bash
npm run translate-db
```

### **预期输出：**
```
🚀 Starting product translation...

✅ Connected to MongoDB

📦 Found 45 products to translate

✅ Translated:
   Name: 优质室内猫猫粮 2kg → Premium Indoor Cat Cat Food 2kg
   Desc: 全面营养配方，促进健康活力 → Complete Nutrition Formula, Promotes Health Vitality

✅ Translated:
   Name: 豆腐Cat砂 6L 绿茶Flavor → Tofu Cat Litter 6L Green Tea Flavor

✅ Translated:
   Name: Cat自动饮水机 2L → Cat Automatic Water Fountain 2L

============================================================
🎉 Translation Complete!
============================================================
✅ Translated: 42 products
⏭️  Skipped: 3 products (already in English)
📊 Total: 45 products
============================================================

✅ Disconnected from MongoDB
```

---

## ⚠️ 注意事项

### **1. 备份数据库**
在运行脚本前，建议备份数据库：
```bash
mongodump --uri="your_mongodb_uri" --out=./backup
```

### **2. 测试环境**
首先在测试环境中运行，确认翻译效果。

### **3. 重复运行**
脚本是**幂等的**，可以安全地多次运行：
- 已翻译的产品会被跳过
- 不会重复翻译

### **4. 停止开发服务器**
运行翻译脚本前，建议停止开发服务器：
```bash
Ctrl + C  # 停止 npm run dev
npm run translate-db  # 运行翻译
npm run dev  # 重新启动开发服务器
```

---

## 🔧 自定义翻译

### **添加新词汇：**

编辑 `server/translate-products.ts`，在 `productTerms` 对象中添加：

```typescript
const productTerms: { [key: string]: string } = {
  // ... 现有词汇
  '新中文词': 'New English Word',
  '另一个中文词': 'Another English Word',
};
```

---

## 📊 翻译效果

### **翻译前（数据库中的中文）：**
```json
{
  "name": "优质室内猫猫粮 2kg",
  "description": "全面营养配方，促进健康活力",
  "tags": ["优质", "室内猫", "猫粮"]
}
```

### **翻译后（数据库中的英文）：**
```json
{
  "name": "Premium Indoor Cat Cat Food 2kg",
  "description": "Complete Nutrition Formula, Promotes Health Vitality",
  "tags": ["Premium", "Indoor Cat", "Cat Food"]
}
```

---

## ✅ 翻译后效果

### **前端界面将自动显示英文：**
- ✅ 所有产品卡片：英文名称
- ✅ 产品详情页：英文描述
- ✅ 购物车：英文产品名
- ✅ 搜索结果：英文内容
- ✅ 所有页面：100% 英文

### **不再需要前端翻译：**
- ❌ 前端翻译函数仍然保留（作为备份）
- ✅ 数据库直接存储英文
- ✅ 性能更好（无需实时翻译）
- ✅ 一致性更好（统一的翻译结果）

---

## 🆘 故障排除

### **问题1：无法连接数据库**
**解决：**
- 检查 `.env` 文件中的 `MONGODB_URI`
- 确保MongoDB服务正在运行
- 检查网络连接

### **问题2：脚本运行失败**
**解决：**
- 确保已安装所有依赖：`npm install`
- 检查Node.js版本（推荐 v18+）
- 查看错误日志

### **问题3：翻译不完整**
**解决：**
- 检查 `productTerms` 词典是否包含该词汇
- 添加缺失的词汇到词典
- 重新运行脚本

---

## 📞 支持

如果遇到问题：
1. 检查控制台输出的错误信息
2. 确认数据库连接字符串正确
3. 验证数据库中有数据

---

## 🎯 完成后

### **1. 验证翻译结果**
```bash
# 启动开发服务器
npm run dev

# 在浏览器访问：http://localhost:5000
# 检查所有产品是否显示英文
```

### **2. 清除浏览器缓存**
```
按 Ctrl + Shift + R 强制刷新
```

### **3. 享受100%英文界面！**
🎉 所有产品现在都是英文了！

---

**最后更新：2025-11-02**  
**版本：v1.0**



