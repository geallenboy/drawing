# Cloudflare R2 存储配置指南

## 概述

本应用使用 Cloudflare R2 作为主要存储方案，用于存储画图数据。R2 提供了成本效益高、性能优秀的对象存储服务。

## 前置要求

1. **Cloudflare 账户** - 需要有 Cloudflare 账户
2. **R2 服务** - 已启用 R2 存储服务
3. **API Token** - 创建具有 R2 权限的 API Token

## 配置步骤

### 1. 创建 R2 存储桶

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 导航到 **R2 Object Storage**
3. 点击 **Create bucket**
4. 输入存储桶名称（例如：`aidt-drawings`）
5. 选择位置（建议选择离用户最近的位置）
6. 点击 **Create bucket**

### 2. 获取 Account ID

1. 在 Cloudflare Dashboard 右侧边栏查看 **Account ID**
2. 复制此 ID，稍后需要用到

### 3. 创建 API Token

1. 导航到 **My Profile** → **API Tokens**
2. 点击 **Create Token**
3. 选择 **Custom token**
4. 配置权限：
   - **Account** - `Cloudflare R2:Edit`
   - **Zone Resources** - `Include - All zones`
5. 点击 **Continue to summary**
6. 点击 **Create Token**
7. **重要：复制并安全保存此 token，它只会显示一次**

### 4. 获取 R2 Access Keys

1. 在 R2 Overview 页面，点击 **Manage R2 API tokens**
2. 点击 **Create API token**
3. 配置权限：
   - **Permissions**: `Admin Read & Write`
   - **Specify bucket**: 选择你创建的存储桶
4. 点击 **Create API token**
5. 复制 **Access Key ID** 和 **Secret Access Key**

### 5. 配置环境变量

在项目根目录创建 `.env.local` 文件（如果不存在），添加以下配置：

```bash
# Cloudflare R2 配置
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id_here
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key_here
CLOUDFLARE_R2_BUCKET_NAME=aidt-drawings
```

**示例：**
```bash
CLOUDFLARE_ACCOUNT_ID=abc123def456ghi789jkl012mno345
CLOUDFLARE_R2_ACCESS_KEY_ID=1a2b3c4d5e6f7g8h9i0j
CLOUDFLARE_R2_SECRET_ACCESS_KEY=ABC123DEF456GHI789JKL012MNO345PQR678STU
CLOUDFLARE_R2_BUCKET_NAME=aidt-drawings
```

### 6. 验证配置

运行配置检查脚本：

```bash
npx tsx src/scripts/check-r2-config.ts
```

如果看到 "✅ R2 连接成功！"，说明配置正确。

## 数据结构

### R2 存储结构
```
bucket-name/
├── drawings/
│   ├── {drawing-id-1}.json
│   ├── {drawing-id-2}.json
│   └── ...
```

### 画图数据格式
```json
{
  "type": "excalidraw",
  "version": 2,
  "elements": [...],
  "files": {...},
  "appState": {...}
}
```

## 故障排除

### 常见问题

**Q: "R2存储失败，无法保存画图数据"**
- 检查环境变量是否正确设置
- 验证 API Token 是否有正确的权限
- 确认存储桶名称拼写正确

**Q: "Cloudflare R2客户端未初始化"**
- 检查 Account ID 是否正确
- 验证 Access Keys 是否有效

**Q: "文件不存在或为空"**
- 可能是之前的数据未正确保存
- 检查 R2 控制台确认文件是否存在

### 调试步骤

1. **检查环境变量**
   ```bash
   npx tsx src/scripts/check-r2-config.ts
   ```

2. **检查网络连接**
   ```bash
   curl -I https://your-account-id.r2.cloudflarestorage.com
   ```

3. **查看应用日志**
   - 检查服务器控制台输出
   - 查找 R2 相关的错误信息

## 成本优化

1. **存储桶生命周期规则** - 设置自动删除旧数据
2. **压缩数据** - JSON 数据已经过格式化，可考虑 gzip 压缩
3. **监控使用量** - 定期检查存储使用情况

## 安全最佳实践

1. **环境变量保护** - 永远不要将凭据提交到代码仓库
2. **最小权限原则** - API Token 只授予必要的权限
3. **定期轮换** - 定期更新 Access Keys
4. **网络限制** - 考虑设置 IP 白名单（如果可能）

## 备份策略

1. **多地域备份** - 考虑在多个地域创建备份
2. **定期导出** - 实施定期数据导出策略
3. **版本控制** - 利用 R2 的版本控制功能

---

## 支持

如果在配置过程中遇到问题：

1. 检查 [Cloudflare R2 文档](https://developers.cloudflare.com/r2/)
2. 查看应用日志获取详细错误信息
3. 使用提供的检查脚本验证配置