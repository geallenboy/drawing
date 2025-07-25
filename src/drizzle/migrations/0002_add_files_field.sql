-- 添加files字段到drawing表
ALTER TABLE "drawing" ADD COLUMN "files" jsonb DEFAULT '{}' NOT NULL;