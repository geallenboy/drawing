# GitHub OAuth 登录配置和故障排除指南

## 🔍 问题诊断

GitHub登录失败并返回到SSO回调页面通常由以下原因导致：

### 1. **Clerk控制台配置问题**
- GitHub OAuth应用未在Clerk中配置
- GitHub OAuth应用配置不正确
- 回调URL配置错误

### 2. **GitHub OAuth应用配置问题**
- GitHub OAuth应用未创建
- 授权回调URL配置错误
- 应用权限设置不正确

### 3. **环境变量配置问题**
- Clerk密钥配置错误
- 重定向URL配置不匹配

## ⚙️ 完整配置步骤

### 步骤1: 在GitHub创建OAuth应用

1. **访问GitHub设置**:
   - 登录GitHub
   - 转到 Settings → Developer settings → OAuth Apps
   - 点击 "New OAuth App"

2. **配置OAuth应用**:
   ```
   Application name: Drawing (或您选择的名称)
   Homepage URL: http://localhost:3001 (开发环境)
   Application description: Drawing应用的GitHub登录
   Authorization callback URL: https://eternal-squid-90.clerk.accounts.dev/v1/oauth_callback
   ```

3. **获取凭据**:
   - 创建后获取 Client ID
   - 生成 Client Secret

### 步骤2: 在Clerk控制台配置GitHub OAuth

1. **访问Clerk Dashboard**:
   - 登录 https://dashboard.clerk.com/
   - 选择您的应用 (eternal-squid-90)

2. **配置社交连接**:
   - 转到 "User & Authentication" → "Social Connections"
   - 找到 GitHub 并点击配置
   - 启用 GitHub OAuth
   - 输入从GitHub获取的:
     - Client ID
     - Client Secret

3. **验证回调URL**:
   - 确保回调URL为: `https://eternal-squid-90.clerk.accounts.dev/v1/oauth_callback`

### 步骤3: 验证环境变量配置

确保 `.env` 文件包含正确的配置：

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZXRlcm5hbC1zcXVpZC05MC5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_ZPpRQfLYrySG3kS8v0VH86hwtWQD6RJlMH6nyd0uDw
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/signin
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## 🚀 已实施的改进

### 1. **改进的SSO回调页面**
- 添加了超时处理机制
- 改进了错误检测和日志记录
- 更好的用户反馈

### 2. **增强的错误处理**
- 支持不同类型的OAuth错误
- 详细的错误信息显示
- 自动重定向到登录页面

### 3. **完善的环境变量**
- 添加了所有必要的Clerk配置
- 统一的重定向URL配置

## 🧪 测试步骤

### 1. **重启开发服务器**
```bash
pnpm dev
```

### 2. **测试GitHub登录流程**
1. 访问 http://localhost:3001/auth/signin
2. 点击 GitHub 登录按钮
3. 在GitHub授权页面点击授权
4. 应该重定向到 `/auth/sso-callback`
5. 然后自动跳转到 `/dashboard`

### 3. **检查浏览器控制台**
- 打开F12开发者工具
- 查看Console标签页的日志信息
- 查看Network标签页的请求信息

## 🐛 故障排除

### 如果仍然失败，检查以下项目：

1. **浏览器控制台错误**:
   ```javascript
   // 查看是否有JavaScript错误
   console.log('OAuth登录成功，用户ID:', userId);
   ```

2. **网络请求**:
   - 检查是否有失败的API请求
   - 查看重定向链是否正确

3. **Clerk事件日志**:
   - 在Clerk Dashboard中查看 "Events" 页面
   - 查看最近的认证事件

4. **GitHub OAuth应用日志**:
   - 在GitHub OAuth应用设置中查看请求日志

### 常见错误和解决方案

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 授权被拒绝 | GitHub应用配置错误 | 检查回调URL是否正确 |
| 无效的客户端 | Client ID/Secret错误 | 重新复制正确的凭据 |
| 回调URL不匹配 | URL配置不一致 | 确保GitHub和Clerk中的URL一致 |
| 超时 | 网络或服务器问题 | 检查网络连接，重试 |

## 📋 当前状态

✅ **已完成**:
- SSO回调页面逻辑改进
- 错误处理增强
- 环境变量完善
- 超时处理机制

⚠️ **需要配置**:
- GitHub OAuth应用创建
- Clerk控制台中的GitHub配置

配置完成后，GitHub登录应该能够正常工作！
