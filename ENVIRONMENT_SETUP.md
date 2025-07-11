# 环境配置设置指南

## 📋 环境变量配置

在项目根目录创建 `.env.local` 文件，包含以下配置：

```env
# Clerk 认证配置
# 从 https://dashboard.clerk.com/ 获取这些密钥
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZXRlcm5hbC1zcXVpZC05MC5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_你的密钥

# Clerk 页面重定向配置
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/signin
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# 数据库配置
DATABASE_URL=你的数据库连接字符串

# 可选：Webhook配置（如果需要）
CLERK_WEBHOOK_SECRET=whsec_你的webhook密钥

# 开发环境配置
NODE_ENV=development
```

## 🔧 获取Clerk密钥步骤

### 1. 访问Clerk Dashboard
- 打开 [Clerk Dashboard](https://dashboard.clerk.com/)
- 选择您的应用：`eternal-squid-90`

### 2. 获取API密钥
- 转到 "API Keys" 页面
- 复制 "Publishable key" (以 `pk_test_` 开头)
- 复制 "Secret key" (以 `sk_test_` 开头)

### 3. 配置OAuth回调URL
**重要：确保在您的OAuth应用中设置正确的回调URL**

```
回调URL: https://eternal-squid-90.clerk.accounts.dev/v1/oauth_callback
```

## ⚙️ OAuth应用配置

### Google OAuth配置
1. **访问 [Google Cloud Console](https://console.cloud.google.com/)**
2. **创建或选择项目**
3. **启用APIs**：
   - Google+ API 或 People API
   - Google Identity API
4. **创建OAuth 2.0客户端ID**：
   - 应用类型：Web应用
   - 授权来源：`localhost:3000`
   - 授权回调URI：`https://eternal-squid-90.clerk.accounts.dev/v1/oauth_callback`

### GitHub OAuth配置
1. **访问 [GitHub Developer Settings](https://github.com/settings/developers)**
2. **创建OAuth App**：
   - Application name: `AI TextDraw`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `https://eternal-squid-90.clerk.accounts.dev/v1/oauth_callback`

## 🚀 配置完成后

1. **重启开发服务器**：
   ```bash
   pnpm dev
   ```

2. **测试登录**：
   - 访问 `http://localhost:3000/auth/signin`
   - 尝试第三方登录

3. **调试工具**：
   - 访问 `http://localhost:3000/oauth-debug` 进行诊断
   - 访问 `http://localhost:3000/auth-test` 查看认证状态

## 🔍 故障排除

### 常见问题
1. **回调URL不匹配**：确保OAuth应用中的回调URL完全匹配
2. **域名访问**：使用 `localhost:3000` 而不是 `127.0.0.1:3000`
3. **缓存问题**：清除浏览器缓存和Cookie
4. **网络问题**：确保能够访问 `clerk.com` 和 `clerk.accounts.dev`

### 获取帮助
如果问题仍然存在：
1. 查看浏览器控制台错误信息
2. 访问 `/oauth-debug` 页面进行自动诊断
3. 检查Clerk Dashboard中的Events日志 