# 存储方案优化迁移指南

## 概述

本次更新将drawing数据存储方案从"数据库+R2双存储"优化为"R2主存储+数据库元数据"，大幅降低存储成本和提升性能。

## 方案对比

### 🔴 旧方案（数据库+R2双存储）
- ✅ 数据库有完整备份，查询速度快
- ✅ 即使R2不可用，基本功能仍可工作  
- ❌ 数据库存储成本高（大量base64数据）
- ❌ 数据冗余，维护复杂
- ❌ 数据库性能影响（大JSON字段）

### 🟢 新方案（R2主存储+数据库元数据）
- ✅ 数据库轻量化，只存储必要元数据
- ✅ 存储成本大幅降低（R2比数据库便宜很多）
- ✅ 更好的可扩展性
- ✅ 符合"冷热数据分离"最佳实践
- ⚠️ 对R2依赖性增加
- ⚠️ 需要处理R2连接失败的情况

## 核心变更

### 数据库Schema变更
```sql
-- 移除大数据字段
-- ALTER TABLE "drawing" DROP COLUMN "data";      -- 画图元素数据
-- ALTER TABLE "drawing" DROP COLUMN "files";     -- 文件数据

-- 新增轻量级字段
ALTER TABLE "drawing" ADD COLUMN "data_path" text NOT NULL;           -- R2数据路径
ALTER TABLE "drawing" ADD COLUMN "version" integer DEFAULT 1;         -- 数据版本
ALTER TABLE "drawing" ADD COLUMN "element_count" integer DEFAULT 0;   -- 元素数量统计
ALTER TABLE "drawing" ADD COLUMN "file_count" integer DEFAULT 0;      -- 文件数量统计
ALTER TABLE "drawing" ADD COLUMN "last_modified" timestamp DEFAULT now(); -- 内容修改时间
```

### 新增核心模块
- `src/lib/drawing-storage.ts` - 统一的存储管理器
- `src/lib/migration-helper.ts` - 数据迁移辅助工具
- `src/scripts/migrate-storage.ts` - 迁移执行脚本
- `src/scripts/test-storage.ts` - 功能测试脚本

## 迁移步骤

### 1. 准备阶段
```bash
# 1. 确保环境变量配置正确
# CLOUDFLARE_R2_ACCOUNT_ID
# CLOUDFLARE_R2_ACCESS_KEY_ID  
# CLOUDFLARE_R2_SECRET_ACCESS_KEY
# CLOUDFLARE_R2_BUCKET_NAME

# 2. 备份数据库
pg_dump your_database > backup_before_migration.sql
```

### 2. 执行数据库schema更新
```bash
# 运行迁移SQL
psql -d your_database -f src/drizzle/migrations/0003_optimize_drawing_storage.sql
```

### 3. 数据迁移
```bash
# 测试存储功能
npx tsx src/scripts/test-storage.ts

# 迁移单个drawing（测试）
npx tsx src/scripts/migrate-storage.ts single <drawing-id>

# 迁移所有drawing数据
npx tsx src/scripts/migrate-storage.ts all
```

### 4. 验证迁移结果
```bash
# 检查迁移统计
SELECT 
  COUNT(*) as total_drawings,
  COUNT(CASE WHEN data_path IS NOT NULL THEN 1 END) as migrated_count,
  COUNT(CASE WHEN data_path IS NULL THEN 1 END) as pending_count
FROM drawing 
WHERE is_deleted = false;
```

### 5. 清理旧字段（可选）
⚠️ **重要：只有在确认所有数据迁移成功后才执行此步骤**

```sql
-- 删除旧的大数据字段
ALTER TABLE "drawing" DROP COLUMN "data";
ALTER TABLE "drawing" DROP COLUMN "files";

-- 设置data_path为必填字段
ALTER TABLE "drawing" ALTER COLUMN "data_path" SET NOT NULL;
```

## 功能验证

### 验证清单
- [ ] 创建新drawing正常工作
- [ ] 打开现有drawing能正确显示
- [ ] 编辑和保存功能正常
- [ ] 导入/导出功能正常
- [ ] 删除drawing能同时清理R2数据
- [ ] 文件夹中的drawing列表显示正常

### 性能监控
```bash
# 监控R2请求响应时间
# 监控数据库查询性能
# 检查存储成本变化
```

## 回滚方案

如果迁移过程中出现问题，可以按以下步骤回滚：

### 1. 代码回滚
```bash
git revert <migration-commit-hash>
```

### 2. 数据库回滚
```bash
# 恢复备份数据库
psql -d your_database < backup_before_migration.sql
```

### 3. 清理R2数据（可选）
```bash
# 删除迁移期间上传的R2数据
# 使用Cloudflare控制台或CLI工具
```

## 故障排除

### 常见问题

**Q: 迁移脚本报错"找不到drawing数据"**
A: 检查数据库连接和drawing记录是否存在

**Q: R2上传失败**  
A: 检查Cloudflare R2配置和网络连接

**Q: 新drawing无法保存**
A: 检查DrawingStorageManager的错误日志

**Q: 性能比预期慢**
A: 检查R2网络延迟和并发请求数量

### 监控和日志
- 应用程序日志：检查存储操作错误
- R2访问日志：监控请求状态和延迟  
- 数据库日志：监控查询性能

## 联系支持

如果在迁移过程中遇到问题，请：
1. 检查错误日志
2. 参考本文档的故障排除部分
3. 联系技术支持团队

---

**重要提醒：** 
- 迁移前务必备份数据库
- 在生产环境执行前先在测试环境验证
- 迁移过程中建议暂停应用服务
- 保留旧字段直到确认迁移完全成功