# 📱 Android APK 构建和分发指南（完全免费）

本指南将帮助您构建 Android APK 并直接分发给用户，**完全免费，无需应用商店**！

## 🎯 方案概述

### ✅ 优势
- **完全免费** - 无需支付任何费用
- **直接分发** - 可以直接分享 APK 文件给用户
- **无需应用商店** - 不需要 Google Play 开发者账号
- **快速部署** - 几分钟内即可生成 APK

### ⚠️ 注意事项
- 用户需要允许"未知来源"安装（Android 8.0+）
- 无法通过 Google Play 自动更新
- 需要手动分发 APK 文件

## 🚀 快速开始（4 步完成）

### 第一步：构建 Web 应用

```bash
npm run build
```

这将构建您的 Web 应用并输出到 `dist/public` 目录。

### 第二步：添加 Android 平台（首次运行）

```bash
npm run cap:add:android
```

这将创建 `android` 文件夹并配置 Android 项目。

### 第三步：同步代码

```bash
npm run cap:sync
```

这将：
- 构建 Web 应用
- 将构建文件复制到 Android 项目
- 同步所有配置

### 第四步：打开 Android Studio

```bash
npm run cap:open:android
```

这将自动打开 Android Studio。

## 📦 在 Android Studio 中构建 APK

### 方法 1: 使用图形界面（推荐新手）

1. **等待项目同步完成**
   - Android Studio 会自动下载依赖
   - 等待底部状态栏显示 "Gradle sync completed"

2. **构建 APK**
   - 点击顶部菜单：`Build` > `Build Bundle(s) / APK(s)` > `Build APK(s)`
   - 或者使用快捷键：`Ctrl + Shift + A`（Windows/Linux）或 `Cmd + Shift + A`（Mac），然后输入 "Build APK"

3. **等待构建完成**
   - 构建完成后，会显示通知
   - 点击 "locate" 查看 APK 文件位置

4. **找到 APK 文件**
   - 默认位置：`android/app/build/outputs/apk/debug/app-debug.apk`
   - 这是**调试版 APK**，可以直接安装和分发

### 方法 2: 使用命令行（推荐高级用户）

在项目根目录运行：

```bash
cd android
./gradlew assembleDebug
```

**Windows 用户：**
```bash
cd android
gradlew.bat assembleDebug
```

APK 文件位置：`android/app/build/outputs/apk/debug/app-debug.apk`

## 🎁 构建发布版 APK（可选）

如果您想构建发布版 APK（更小、更优化），需要先配置签名：

### 1. 生成签名密钥

```bash
keytool -genkey -v -keystore pawcart-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias pawcart
```

按提示输入信息：
- 密钥库密码：设置一个强密码（记住它！）
- 密钥密码：可以相同或不同
- 姓名、组织等信息：按实际情况填写

**重要：** 保存好 `.jks` 文件和密码，丢失后无法更新应用！

### 2. 配置签名

编辑 `android/app/build.gradle`，在 `android` 块中添加：

```gradle
android {
    // ... 其他配置 ...
    
    signingConfigs {
        release {
            storeFile file('../pawcart-release-key.jks')
            storePassword '您的密钥库密码'
            keyAlias 'pawcart'
            keyPassword '您的密钥密码'
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
        }
    }
}
```

### 3. 构建发布版 APK

**在 Android Studio 中：**
- `Build` > `Build Bundle(s) / APK(s)` > `Build APK(s)`
- 选择 `release` 构建变体

**使用命令行：**
```bash
cd android
./gradlew assembleRelease
```

发布版 APK 位置：`android/app/build/outputs/apk/release/app-release.apk`

## 📤 分发 APK

### 方法 1: 直接分享（最简单）

1. **上传到云存储**
   - Google Drive
   - Dropbox
   - OneDrive
   - 或您自己的服务器

2. **分享下载链接**
   - 将链接发送给用户
   - 用户点击链接下载 APK

3. **用户安装步骤**
   - 下载 APK 文件
   - 打开文件管理器找到 APK
   - 点击安装（可能需要允许"未知来源"）

### 方法 2: 二维码分发

1. **生成二维码**
   - 使用在线工具（如 [QR Code Generator](https://www.qr-code-generator.com/)）
   - 输入 APK 下载链接
   - 生成二维码图片

2. **用户扫描安装**
   - 用户扫描二维码
   - 下载并安装 APK

### 方法 3: 网站下载页面

创建一个简单的下载页面：

```html
<!DOCTYPE html>
<html>
<head>
    <title>PawCart 下载</title>
</head>
<body>
    <h1>下载 PawCart</h1>
    <a href="app-release.apk" download>点击下载 APK</a>
    <p>安装说明：...</p>
</body>
</html>
```

## 🔄 更新应用流程

每次更新应用时：

1. **修改代码并构建**
   ```bash
   npm run build
   npm run cap:sync
   ```

2. **在 Android Studio 中重新构建 APK**
   - 或者使用命令行：`cd android && ./gradlew assembleDebug`

3. **分发新版本 APK**
   - 建议增加版本号（在 `android/app/build.gradle` 中）
   - 通知用户更新

## ⚙️ 配置应用信息

### 修改应用名称

编辑 `android/app/src/main/res/values/strings.xml`：

```xml
<resources>
    <string name="app_name">PawCart</string>
</resources>
```

### 修改应用图标

1. 准备图标文件（建议 512x512 PNG）
2. 使用 [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html) 生成所有尺寸
3. 替换 `android/app/src/main/res/mipmap-*/ic_launcher.png` 文件

### 修改版本号

编辑 `android/app/build.gradle`：

```gradle
android {
    defaultConfig {
        versionCode 1        // 内部版本号（每次更新 +1）
        versionName "1.0.0"  // 用户看到的版本号
    }
}
```

## 🛠️ 常见问题解决

### Q1: Android Studio 无法打开项目

**解决方案：**
- 确保已安装 Android Studio
- 检查 Java JDK 是否已安装
- 尝试手动打开：`File` > `Open` > 选择 `android` 文件夹

### Q2: Gradle 同步失败

**解决方案：**
- 检查网络连接（需要下载依赖）
- 在 Android Studio 中：`File` > `Invalidate Caches / Restart`
- 检查 `android/build.gradle` 中的 Gradle 版本

### Q3: 构建 APK 时出错

**解决方案：**
- 确保已运行 `npm run build` 和 `npm run cap:sync`
- 检查 `dist/public` 目录是否存在
- 查看错误日志，通常是依赖问题

### Q4: 用户无法安装 APK

**解决方案：**
- Android 8.0+ 需要允许"未知来源"安装
- 引导用户：`设置` > `安全` > `允许安装未知应用`
- 或者使用 Google Play（需要开发者账号）

### Q5: APK 文件太大

**解决方案：**
- 构建发布版 APK（启用代码混淆和资源压缩）
- 优化图片资源
- 使用 ProGuard 进一步减小体积

## 📋 完整命令清单

```bash
# 1. 构建 Web 应用
npm run build

# 2. 添加 Android 平台（首次）
npm run cap:add:android

# 3. 同步代码
npm run cap:sync

# 4. 打开 Android Studio
npm run cap:open:android

# 5. 构建 APK（命令行方式）
cd android
./gradlew assembleDebug        # 调试版
./gradlew assembleRelease      # 发布版（需要配置签名）

# Windows 用户
cd android
gradlew.bat assembleDebug
gradlew.bat assembleRelease
```

## 🎯 下一步建议

1. ✅ **完成基础构建** - 按照本指南构建第一个 APK
2. 🎨 **自定义应用** - 添加应用图标、启动画面
3. 📱 **测试应用** - 在真机上测试所有功能
4. 🔒 **配置签名** - 为发布版 APK 配置签名
5. 📤 **准备分发** - 选择分发方式并准备下载页面

## 💡 提示

- **首次构建可能需要较长时间**（下载依赖）
- **建议使用调试版 APK 进行测试**
- **发布版 APK 需要配置签名才能安装**
- **每次更新代码后都要重新构建 APK**
- **保存好签名密钥文件，丢失后无法更新应用**

---

**祝您构建顺利！** 🚀

如有问题，请参考：
- [Capacitor 官方文档](https://capacitorjs.com/docs)
- [Android 开发文档](https://developer.android.com/)


