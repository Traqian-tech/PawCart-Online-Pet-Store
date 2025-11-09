# 🚀 Android APK 快速开始（4 步完成）

## ⚡ 快速命令

```bash
# 1. 构建项目
npm run build

# 2. 添加 Android 平台（首次运行）
npm run cap:add:android

# 3. 同步代码
npm run cap:sync

# 4. 打开 Android Studio
npm run cap:open:android
```

## 📦 在 Android Studio 中构建 APK

1. **等待项目同步完成**（首次可能需要几分钟）

2. **构建 APK**
   - 点击：`Build` > `Build Bundle(s) / APK(s)` > `Build APK(s)`
   - 或使用快捷键：`Ctrl + Shift + A`（Windows）输入 "Build APK"

3. **找到 APK 文件**
   - 位置：`android/app/build/outputs/apk/debug/app-debug.apk`
   - 点击通知中的 "locate" 按钮

4. **分发 APK**
   - 上传到云存储（Google Drive、Dropbox 等）
   - 分享下载链接给用户
   - 用户下载后直接安装

## 🎯 命令行构建（可选）

```bash
cd android
./gradlew assembleDebug
```

**Windows 用户：**
```bash
cd android
gradlew.bat assembleDebug
```

## ⚠️ 重要提示

- ✅ **完全免费** - 无需应用商店账号
- ✅ **直接分发** - 可以直接分享 APK 文件
- ⚠️ 用户需要允许"未知来源"安装（Android 8.0+）
- ⚠️ 每次更新代码后需要重新构建 APK

## 📚 详细文档

查看 `ANDROID_APK_BUILD_GUIDE.md` 获取完整指南，包括：
- 发布版 APK 构建
- 应用签名配置
- 应用图标和启动画面
- 常见问题解决

---

**开始构建：** 运行上面的 4 个命令即可！🚀


