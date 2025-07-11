# Google 登录配置指南

## 问题诊断
根据错误信息，Google 登录失败通常是由于以下原因：

1. **Clerk 控制台中未配置 Google OAuth**
2. **Google OAuth 应用配置不正确**
3. **回调 URL 配置错误**

## 解决步骤

### 1. 在 Google Cloud Console 配置 OAuth

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建或选择一个项目
3. 启用 Google+ API 或 Google Identity API
4. 转到 "凭据" 页面
5. 创建 OAuth 2.0 客户端 ID
6. 配置授权回调 URL：
   ```
   https://eternal-squid-90.clerk.accounts.dev/v1/oauth_callback
   ```
   
### 2. 在 Clerk 控制台配置 Google OAuth

1. 登录 [Clerk Dashboard](https://dashboard.clerk.com/)
2. 选择你的应用 (eternal-squid-90)
3. 转到 "User & Authentication" → "Social Connections"
4. 启用 Google OAuth
5. 输入从 Google Cloud Console 获取的：
   - Client ID
   - Client Secret

### 3. 验证环境变量

确保 `.env.local` 文件中包含正确的 Clerk 密钥：

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZXRlcm5hbC1zcXVpZC05MC5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_ZPpRQfLYrySG3kS8v0VH86hwtWQD6RJlMH6nyd0uDw
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/signin
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 4. 测试配置

1. 重启开发服务器：
   ```bash
   pnpm dev
   ```

2. 访问登录页面：
   ```
   http://localhost:3000/auth/signin
   ```

3. 点击 Google 登录按钮测试

### 5. 常见问题排查

#### 如果仍然失败，检查：

1. **浏览器控制台错误**
   - 打开 F12 开发者工具
   - 查看 Console 和 Network 标签页的错误

2. **Clerk 控制台日志**
   - 在 Clerk Dashboard 中查看 "Events" 页面
   - 查看失败的登录尝试

3. **回调 URL 匹配**
   - 确保 Google OAuth 中的回调 URL 与 Clerk 要求的完全匹配

#### 备用测试方案

如果 Google 登录暂时无法配置，可以：

1. **使用邮箱密码登录**
   - 注册新账户
   - 使用邮箱验证码

2. **配置 GitHub 登录** (通常更简单)
   - 在 GitHub 设置中创建 OAuth App
   - 在 Clerk 中配置 GitHub 连接

## 当前状态

✅ **已修复的问题**：
- `getUserByClerkId` 导入错误已修复
- 用户数据同步功能正常
- 所有认证页面可以正常访问

⚠️ **需要配置的问题**：
- Google OAuth 需要在 Clerk 控制台中配置
- 可能需要在 Google Cloud Console 中设置 OAuth 应用

## 测试命令

```bash
# 重启服务器
pnpm dev

# 测试页面
http://localhost:3000/auth/signin
http://localhost:3000/auth/signup
```

配置完成后，Google 登录功能将正常工作。
