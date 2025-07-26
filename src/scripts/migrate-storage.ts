#!/usr/bin/env tsx
/**
 * 数据存储方案迁移脚本
 * 将现有的drawing数据从数据库迁移到Cloudflare R2存储
 * 
 * 运行方法：
 * npx tsx src/scripts/migrate-storage.ts
 */

import { migrateAllDrawings, migrateDrawingRecord } from "@/lib/migration-helper";

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "all":
      console.log("开始迁移所有drawing记录...");
      try {
        const result = await migrateAllDrawings();
        console.log(`迁移完成: ${result.successCount} 成功, ${result.failureCount} 失败`);
        
        if (result.failureCount === 0) {
          console.log("\n所有数据迁移成功！");
          console.log("接下来可以手动执行以下SQL清理旧字段：");
          console.log('ALTER TABLE "drawing" DROP COLUMN "data";');
          console.log('ALTER TABLE "drawing" DROP COLUMN "files";');
          console.log('ALTER TABLE "drawing" ALTER COLUMN "data_path" SET NOT NULL;');
        } else {
          console.log(`\n有 ${result.failureCount} 条记录迁移失败，请检查日志并重试。`);
        }
      } catch (error) {
        console.error("迁移失败:", error);
        process.exit(1);
      }
      break;

    case "single":
      const drawingId = args[1];
      if (!drawingId) {
        console.error("请提供drawing ID: npx tsx src/scripts/migrate-storage.ts single <drawing-id>");
        process.exit(1);
      }
      
      console.log(`开始迁移drawing: ${drawingId}`);
      try {
        const result = await migrateDrawingRecord(drawingId);
        console.log("迁移成功:", result);
      } catch (error) {
        console.error("迁移失败:", error);
        process.exit(1);
      }
      break;

    case "help":
    default:
      console.log("数据存储方案迁移脚本");
      console.log("");
      console.log("用法:");
      console.log("  npx tsx src/scripts/migrate-storage.ts <command> [options]");
      console.log("");
      console.log("命令:");
      console.log("  all                    迁移所有drawing记录");
      console.log("  single <drawing-id>    迁移指定的drawing记录");
      console.log("  help                   显示帮助信息");
      console.log("");
      console.log("示例:");
      console.log("  npx tsx src/scripts/migrate-storage.ts all");
      console.log("  npx tsx src/scripts/migrate-storage.ts single abc-123-def");
      break;
  }
}

// 错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// 执行主函数
main().catch((error) => {
  console.error("脚本执行失败:", error);
  process.exit(1);
});