# Supabase OTP 发送失败修复指南

## 🔍 问题诊断

你遇到的错误：`net::ERR_CONNECTION_CLOSED` 表示与 Supabase 服务器的连接被关闭。

### 可能的原因：

1. **Supabase API Key 未配置或错误**
2. **网络连接问题**（防火墙、代理、VPN）
3. **Supabase 项目被暂停**
4. **CORS 配置问题**

---

## ✅ 修复步骤

### 步骤 1: 获取并配置 Supabase 凭证

1. **登录 Supabase Dashboard**
   - 访问：https://app.supabase.com
   - 选择你的项目（URL: `ggkpvyfaxstrufxjkldy.supabase.co`）

2. **获取 API 密钥**
   - 进入：**Settings** > **API**
   - 复制 **Project URL**（应该已经是：`https://ggkpvyfaxstrufxjkldy.supabase.co`）
   - 复制 **anon public** key（这是 `VITE_SUPABASE_ANON_KEY`）

3. **更新 .env 文件**
   ```env
   VITE_SUPABASE_URL=https://ggkpvyfaxstrufxjkldy.supabase.co
   VITE_SUPABASE_ANON_KEY=你的anon-key-here
   ```

### 步骤 2: 检查 Supabase 项目状态

1. **检查项目是否运行**
   - 在 Supabase Dashboard 中，确认项目状态是 **Active**（不是 Paused）
   - 如果项目被暂停，点击 **Resume** 恢复

2. **检查 API 限制**
   - 进入：**Settings** > **API**
   - 确认没有达到 API 调用限制

### 步骤 3: 检查网络连接

1. **测试 Supabase 连接**
   ```powershell
   # 在 PowerShell 中测试连接
   Test-NetConnection -ComputerName ggkpvyfaxstrufxjkldy.supabase.co -Port 443
   ```

2. **检查防火墙/代理设置**
   - 确保防火墙允许访问 `*.supabase.co`
   - 如果使用 VPN，尝试暂时关闭测试

3. **检查浏览器控制台**
   - 打开浏览器开发者工具（F12）
   - 查看 **Network** 标签
   - 检查是否有 CORS 错误

### 步骤 4: 配置 CORS（如果需要）

1. **在 Supabase Dashboard 中**
   - 进入：**Settings** > **API**
   - 在 **CORS** 部分，添加你的前端 URL：
     - `http://localhost:5000`
     - `http://localhost:5173`（如果使用 Vite 默认端口）

### 步骤 5: 重启开发服务器

```powershell
# 停止当前服务器（Ctrl+C）
# 然后重新启动
npm run dev
```

---

## 🔧 快速修复命令

如果你已经获取了 Supabase ANON_KEY，运行以下命令更新 `.env` 文件：

```powershell
# 替换 YOUR_ANON_KEY_HERE 为你的实际密钥
$anonKey = "YOUR_ANON_KEY_HERE"
$content = Get-Content .env -Raw
$content = $content -replace "VITE_SUPABASE_ANON_KEY=.*", "VITE_SUPABASE_ANON_KEY=$anonKey"
$content | Set-Content .env -Encoding UTF8
```

---

## 🧪 测试连接

更新配置后，在浏览器控制台中运行：

```javascript
// 检查 Supabase 配置
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Supabase Key configured:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)

// 测试连接
fetch('https://ggkpvyfaxstrufxjkldy.supabase.co/rest/v1/', {
  headers: {
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
  }
})
.then(r => console.log('✅ Connection OK:', r.status))
.catch(e => console.error('❌ Connection Failed:', e))
```

---

## 📋 常见问题

### Q: 仍然出现 ERR_CONNECTION_CLOSED
**A:** 
- 检查 Supabase 项目是否被暂停
- 尝试在浏览器中直接访问：`https://ggkpvyfaxstrufxjkldy.supabase.co`
- 检查网络代理设置

### Q: 出现 CORS 错误
**A:**
- 在 Supabase Dashboard 中添加你的前端 URL 到 CORS 允许列表
- 确保使用正确的端口（5000 或 5173）

### Q: API Key 无效
**A:**
- 确认复制了完整的 `anon public` key（通常很长）
- 检查 `.env` 文件中没有多余的空格或引号
- 重启开发服务器

---

## 🆘 如果问题仍然存在

1. **检查 Supabase 状态页面**：https://status.supabase.com/
2. **查看 Supabase 项目日志**：Dashboard > Logs
3. **尝试创建新的 Supabase 项目**（如果当前项目有问题）

---

## 📝 当前配置检查清单

- [ ] `.env` 文件包含 `VITE_SUPABASE_URL`
- [ ] `.env` 文件包含 `VITE_SUPABASE_ANON_KEY`（且值正确）
- [ ] Supabase 项目状态为 **Active**
- [ ] 网络连接正常（可以访问 supabase.co）
- [ ] 已重启开发服务器
- [ ] 浏览器控制台没有其他错误

完成以上步骤后，OTP 发送应该可以正常工作！







