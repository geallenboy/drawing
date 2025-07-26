-- 优化drawing表存储方案：移除大数据字段，改为R2存储
-- Migration: 0003_optimize_drawing_storage

-- 1. 添加新字段
ALTER TABLE "drawing" ADD COLUMN "data_path" text;
ALTER TABLE "drawing" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;
ALTER TABLE "drawing" ADD COLUMN "element_count" integer DEFAULT 0 NOT NULL;
ALTER TABLE "drawing" ADD COLUMN "file_count" integer DEFAULT 0 NOT NULL;
ALTER TABLE "drawing" ADD COLUMN "last_modified" timestamp DEFAULT now() NOT NULL;

-- 2. 数据迁移：为现有记录生成data_path和统计信息
-- 注意：这个脚本需要配合应用程序代码来完成数据迁移
-- 应用程序需要：
-- 1. 读取现有的data和files字段
-- 2. 上传到R2并生成data_path
-- 3. 统计element_count和file_count
-- 4. 更新记录

-- 3. 在数据迁移完成后，删除旧字段（暂时保留，迁移完成后手动执行）
-- ALTER TABLE "drawing" DROP COLUMN "data";
-- ALTER TABLE "drawing" DROP COLUMN "files";

-- 4. 设置data_path为非空（在数据迁移完成后执行）
-- 注意：如果使用新的创建流程，data_path允许临时为空
-- ALTER TABLE "drawing" ALTER COLUMN "data_path" SET NOT NULL;