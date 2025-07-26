// 数据迁移辅助工具：将现有drawing数据迁移到新的存储方案
import { db } from "@/drizzle/db";
import { AIDTDrawingTable } from "@/drizzle/schemas/drawing";
import { R2StorageInterface } from "./drawing-storage";
import { eq } from "drizzle-orm";

export interface LegacyDrawingData {
  id: string;
  data: any[];
  files: Record<string, any>;
}

/**
 * 迁移单个drawing记录到新存储方案
 */
export async function migrateDrawingRecord(drawingId: string) {
  try {
    // 1. 获取现有数据
    const drawing = await db
      .select()
      .from(AIDTDrawingTable)
      .where(eq(AIDTDrawingTable.id, drawingId))
      .limit(1);

    if (!drawing.length) {
      throw new Error(`Drawing ${drawingId} not found`);
    }

    const record = drawing[0];
    
    // 检查是否已经迁移
    if (record.dataPath) {
      console.log(`Drawing ${drawingId} already migrated`);
      return;
    }

    // 2. 检查绘图是否存在
    const drawingData = await db
      .select({
        id: AIDTDrawingTable.id,
        dataPath: AIDTDrawingTable.dataPath,
      })
      .from(AIDTDrawingTable)
      .where(eq(AIDTDrawingTable.id, drawingId))
      .limit(1);

    if (!drawingData.length) {
      throw new Error(`Drawing not found for id ${drawingId}`);
    }

    // 3. 由于新数据结构没有直接存储data和files字段，
    // 这个迁移函数需要重新设计或者移除
    console.log('Migration helper needs redesign for new schema');
    return;

    /* 原来的上传到R2逻辑（已注释）
    const legacyDrawingData = {
      elements: elements || [],
      files: files || {},
      appState: {}, // 默认应用状态
    };*/

    // const dataPath = await R2StorageInterface.uploadDrawing(drawingId, legacyDrawingData);

    /* 4. 统计信息
    const elementCount = Array.isArray(elements) ? elements.length : 0;
    const fileCount = files ? Object.keys(files).length : 0;*/

    /* 5. 更新记录
    await db
      .update(AIDTDrawingTable)
      .set({
        dataPath,
        version: 1,
        elementCount,
        fileCount,
        lastModified: new Date(),
      })
      .where(eq(AIDTDrawingTable.id, drawingId));*/

    console.log(`Migration helper disabled for new schema ${drawingId}`);
    return { success: false, message: 'Migration helper needs redesign' };
  } catch (error) {
    console.error(`Failed to migrate drawing ${drawingId}:`, error);
    throw error;
  }
}

/**
 * 批量迁移所有drawing记录
 */
export async function migrateAllDrawings() {
  try {
    // 获取所有未迁移的记录
    const drawings = await db
      .select({ id: AIDTDrawingTable.id })
      .from(AIDTDrawingTable)
      .where(eq(AIDTDrawingTable.dataPath, null as any));

    console.log(`Found ${drawings.length} drawings to migrate`);

    let successCount = 0;
    let failureCount = 0;

    for (const drawing of drawings) {
      try {
        await migrateDrawingRecord(drawing.id);
        successCount++;
      } catch (error) {
        console.error(`Failed to migrate drawing ${drawing.id}:`, error);
        failureCount++;
      }
    }

    console.log(`Migration completed: ${successCount} success, ${failureCount} failures`);
    return { successCount, failureCount };
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

/**
 * 清理迁移后的旧字段（在确认迁移成功后执行）
 */
export async function cleanupLegacyFields() {
  // 这里需要手动执行SQL来删除旧字段
  // ALTER TABLE "drawing" DROP COLUMN "data";
  // ALTER TABLE "drawing" DROP COLUMN "files";
  // ALTER TABLE "drawing" ALTER COLUMN "data_path" SET NOT NULL;
  
  console.log("Please manually execute the cleanup SQL commands:");
  console.log('ALTER TABLE "drawing" DROP COLUMN "data";');
  console.log('ALTER TABLE "drawing" DROP COLUMN "files";');
  console.log('ALTER TABLE "drawing" ALTER COLUMN "data_path" SET NOT NULL;');
}