# 📱 移动应用快速开始指南

## 🚀 5分钟快速开始

### 第一步：构建项目

```bash
npm run build
```

### 第二步：初始化 Capacitor（首次运行）

```bash
npx cap init
```

按提示输入：
- **App name**: PawCart
- **App ID**: com.pawcart.app
- **Web dir**: dist/public

### 第三步：添加平台

**Android（推荐，完全免费）：**
```bash
npm run cap:add:android
```

**iOS（需要 macOS）：**
```bash
npm run cap:add:ios
```

### 第四步：同步代码

```bash
npm run cap:sync
```

### 第五步：打开开发环境

**Android：**
```bash
npm run cap:open:android
```

**iOS（需要 macOS）：**
```bash
npm run cap:open:ios
```

## 📱 开发流程

每次修改代码后：

1. **构建项目**
   ```bash
   npm run build
   ```

2. **同步到移动平台**
   ```bash
   npm run cap:sync
   ```

3. **在 Android Studio / Xcode 中运行**

## 🎯 两种使用方式

### 方式 1: 原生应用（推荐）

- ✅ 可以发布到应用商店
- ✅ 访问原生功能（相机、通知等）
- ✅ 更好的性能
- ❌ 需要开发环境（Android Studio / Xcode）

**适用场景：** 想要发布到应用商店，需要原生功能

### 方式 2: PWA（渐进式网页应用）

- ✅ 无需开发环境
- ✅ 用户可以直接"安装"到主屏幕
- ✅ 完全免费
- ❌ 功能有限，无法发布到应用商店

**使用方法：**
1. 部署您的网站（Render、Vercel等）
2. 用户访问网站
3. 浏览器会提示"添加到主屏幕"
4. 用户点击后，应用会像原生应用一样运行

## 🆓 免费方案推荐

### 方案 A: Android APK 直接分发（完全免费）

1. 构建 Android 应用
2. 生成 APK 文件
3. 直接分享 APK 给用户安装
4. **无需应用商店，完全免费**

### 方案 B: PWA（最简单）

1. 部署网站
2. 用户通过浏览器"添加到主屏幕"
3. **无需任何额外配置**

### 方案 C: F-Droid（Android 开源商店）

1. 发布到 F-Droid（完全免费）
2. 用户从 F-Droid 下载
3. **需要开源项目**

## 📝 常用命令

```bash
# 构建 + 同步
npm run cap:sync

# 仅同步（不构建）
npm run cap:copy

# 打开 Android Studio
npm run cap:open:android

# 打开 Xcode（macOS）
npm run cap:open:ios
```

## ⚠️ 注意事项

1. **首次运行需要安装开发工具**
   - Android: [Android Studio](https://developer.android.com/studio)（免费）
   - iOS: Xcode（仅 macOS，免费）

2. **Android 开发可以在 Windows/Linux/macOS**
   - 推荐从 Android 开始

3. **iOS 开发需要 macOS**
   - 如果没有 Mac，可以只开发 Android 版本

4. **应用商店发布费用**
   - Google Play: $25 一次性费用
   - App Store: $99/年

## 🎉 下一步

1. 选择您的平台（推荐从 Android 开始）
2. 按照上述步骤操作
3. 在模拟器或真机上测试
4. 根据需要调整 UI
5. 准备发布或使用 PWA

---

**提示**: 如果您是第一次开发移动应用，建议：
1. 先使用 **PWA** 方式快速体验
2. 然后尝试 **Android** 原生应用
3. 最后考虑 iOS（如果有 Mac）

祝您开发顺利！🚀



