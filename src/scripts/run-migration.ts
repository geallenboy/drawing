#!/usr/bin/env tsx
/**
 * 手动执行数据库迁移
 */
import { db } from "@/drizzle/db";
import { sql } from "drizzle-orm";

async function runMigration() {
  try {
    console.log("开始执行数据库迁移...");

    // 检查并添加新字段
    const migrations = [
      // 添加 data_path 字段
      `ALTER TABLE "drawing" ADD COLUMN IF NOT EXISTS "data_path" text;`,
      
      // 添加 version 字段  
      `ALTER TABLE "drawing" ADD COLUMN IF NOT EXISTS "version" integer DEFAULT 1 NOT NULL;`,
      
      // 添加 element_count 字段
      `ALTER TABLE "drawing" ADD COLUMN IF NOT EXISTS "element_count" integer DEFAULT 0 NOT NULL;`,
      
      // 添加 file_count 字段
      `ALTER TABLE "drawing" ADD COLUMN IF NOT EXISTS "file_count" integer DEFAULT 0 NOT NULL;`,
      
      // 添加 last_modified 字段
      `ALTER TABLE "drawing" ADD COLUMN IF NOT EXISTS "last_modified" timestamp DEFAULT now() NOT NULL;`,
    ];

    for (const migration of migrations) {
      try {
        await db.execute(sql.raw(migration));
        console.log("✅", migration);
      } catch (error) {
        console.log("⚠️", migration, "->", (error as Error).message);
      }
    }

    // 确保 data_path 允许为空
    try {
      await db.execute(sql.raw(`ALTER TABLE "drawing" ALTER COLUMN "data_path" DROP NOT NULL;`));
      console.log("✅ data_path 字段允许为空");
    } catch (error) {
      console.log("⚠️ data_path 字段可能已经允许为空:", (error as Error).message);
    }

    console.log("🎉 数据库迁移完成！");
  } catch (error) {
    console.error("❌ 迁移失败:", error);
    process.exit(1);
  }
}

runMigration().catch(console.error);