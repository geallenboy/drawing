# 第三方登录调试完整指南

## 🎯 常见问题排查

### 1. **Clerk控制台配置检查**

#### 访问Clerk Dashboard
1. 登录 [Clerk Dashboard](https://dashboard.clerk.com/)
2. 选择您的应用（eternal-squid-90）
3. 转到 "User & Authentication" → "Social Connections"

#### Google OAuth配置检查
- [ ] Google连接已启用
- [ ] Client ID已正确填入
- [ ] Client Secret已正确填入
- [ ] 域名配置正确

#### GitHub OAuth配置检查
- [ ] GitHub连接已启用  
- [ ] Client ID已正确填入
- [ ] Client Secret已正确填入

### 2. **OAuth应用配置检查**

#### Google Cloud Console配置
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 选择项目或创建新项目
3. 启用 Google+ API 或 People API
4. 创建OAuth 2.0客户端ID

**重要的回调URL配置**:
```
生产环境: https://eternal-squid-90.clerk.accounts.dev/v1/oauth_callback
开发环境: https://eternal-squid-90.clerk.accounts.dev/v1/oauth_callback
```

**授权来源域名**:
```
开发环境: localhost:3000, localhost:3001
生产环境: 您的实际域名
```

#### GitHub OAuth App配置
1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 转到 "OAuth Apps" → "New OAuth App"

**配置参数**:
```
Application name: Drawing
Homepage URL: http://localhost:3000 (开发环境)
Authorization callback URL: https://eternal-squid-90.clerk.accounts.dev/v1/oauth_callback
```

### 3. **环境变量检查**

创建或检查 `.env.local` 文件：

```env
# Clerk配置
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZXRlcm5hbC1zcXVpZC05MC5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_ZPpRQfLYrySG3kS8v0VH86hwtWQD6RJlMH6nyd0uDw

# Clerk重定向URL - 确保这些URL正确
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/signin
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/signup
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# 数据库配置
DATABASE_URL=你的数据库连接字符串
```

### 4. **网络和域名检查**

#### 检查Clerk域名
确保您的Clerk实例域名是：
```
https://eternal-squid-90.clerk.accounts.dev
```

#### 开发环境访问
确保通过以下URL访问：
```
http://localhost:3000  (不是127.0.0.1)
```

### 5. **常见错误及解决方案**

#### 错误: "redirect_uri_mismatch"
**原因**: OAuth应用中的回调URL与Clerk要求的不匹配
**解决**: 检查OAuth应用中的回调URL设置

#### 错误: "access_denied"
**原因**: 用户拒绝授权或OAuth应用配置错误
**解决**: 检查OAuth应用权限配置

#### 错误: "invalid_client"
**原因**: Client ID或Secret配置错误
**解决**: 重新检查并复制粘贴Client凭据

#### 错误: 页面停留在SSO callback
**原因**: 认证完成但重定向失败
**解决**: 检查环境变量中的重定向URL配置

### 6. **调试步骤**

#### 第一步：检查浏览器控制台
1. 打开浏览器开发者工具 (F12)
2. 点击第三方登录按钮
3. 查看Console和Network标签的错误信息

#### 第二步：检查Clerk Events
1. 在Clerk Dashboard中转到 "Events"
2. 查看最近的登录尝试记录
3. 查看失败原因

#### 第三步：测试OAuth应用
可以使用OAuth测试工具验证您的配置：
- [Google OAuth Playground](https://developers.google.com/oauthplayground)
- [GitHub OAuth测试](https://docs.github.com/en/developers/apps/building-oauth-apps/testing-oauth-apps)

## 🛠️ 快速修复步骤

### Google登录修复
```bash
# 1. 访问Google Cloud Console
# 2. 启用People API
# 3. 创建OAuth客户端
# 4. 设置回调URL: https://eternal-squid-90.clerk.accounts.dev/v1/oauth_callback
# 5. 在Clerk中输入Client ID和Secret
```

### GitHub登录修复  
```bash
# 1. 访问GitHub Settings → Developer settings
# 2. 创建OAuth App
# 3. 设置回调URL: https://eternal-squid-90.clerk.accounts.dev/v1/oauth_callback
# 4. 在Clerk中输入Client ID和Secret
```

## 🧪 测试流程

1. **重启开发服务器**
   ```bash
   pnpm dev
   ```

2. **清除浏览器缓存和Cookie**

3. **测试登录**
   - 访问 http://localhost:3000/auth/signin
   - 尝试第三方登录
   - 检查是否成功重定向

4. **查看错误信息**
   - 如果失败，访问 http://localhost:3000/auth-test
   - 查看详细的错误信息

## 📞 获取支持

如果问题仍然存在，请提供：
1. 具体的错误信息（浏览器控制台）
2. Clerk Events中的错误日志
3. OAuth配置截图
4. 环境变量配置（隐藏敏感信息）

我们可以进一步协助调试！ 