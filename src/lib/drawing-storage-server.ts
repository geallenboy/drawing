/**
 * 服务端存储管理器
 * 负责协调数据库元数据和R2数据存储
 * 只能在服务端使用（包含数据库操作）
 */
import { db } from "@/drizzle/db";
import { AIDTDrawingTable } from "@/drizzle/schemas/drawing";
import { eq } from "drizzle-orm";
import { R2StorageInterface, createDrawingContent } from "./drawing-storage";

export class DrawingStorageManager {
  /**
   * 创建新的画图
   */
  static async createDrawing(
    metadata: {
      name: string;
      desc?: string;
      userId: string;
      parentFolderId: string;
      isFavorite?: boolean;
    },
    content: {
      elements: any[];
      files: Record<string, any>;
      appState?: any;
    }
  ): Promise<string> {
    try {
      // 1. 先创建数据库记录，获取ID
      const [drawing] = await db
        .insert(AIDTDrawingTable)
        .values({
          name: metadata.name,
          desc: metadata.desc || "",
          userId: metadata.userId,
          parentFolderId: metadata.parentFolderId,
          isFavorite: metadata.isFavorite || false,
          // 暂时设置临时路径，后面会更新
          dataPath: "temp",
          version: 1,
          elementCount: content.elements?.length || 0,
          fileCount: Object.keys(content.files || {}).length,
          lastModified: new Date(),
        })
        .returning();

      const drawingId = drawing.id;

      // 2. 上传数据到R2
      const dataPath = await R2StorageInterface.uploadDrawing(drawingId, content, metadata.userId);
      
      if (!dataPath) {
        throw new Error("R2存储失败，无法保存画图数据");
      }

      // 3. 更新数据库记录的dataPath
      await db
        .update(AIDTDrawingTable)
        .set({ dataPath })
        .where(eq(AIDTDrawingTable.id, drawingId));

      return drawingId;
    } catch (error) {
      console.error("创建画图失败:", error);
      throw error;
    }
  }

  /**
   * 获取画图数据
   */
  static async getDrawing(drawingId: string): Promise<{
    metadata: any;
    elements: any[];
    files: Record<string, any>;
    appState?: any;
  }> {
    try {
      // 1. 获取数据库元数据
      const [drawing] = await db
        .select()
        .from(AIDTDrawingTable)
        .where(eq(AIDTDrawingTable.id, drawingId));
      if (!drawing) {
        throw new Error("画图不存在");
      }

      // 2. 从R2获取数据
      // 如果dataPath为空或为临时值，说明是新画图，返回默认空数据
      if (!drawing.dataPath || drawing.dataPath === "temp") {
        console.log(`画图 ${drawingId} 是新创建的画图，返回默认空数据`);
        return {
          metadata: drawing,
          elements: [],
          files: {},
          appState: {},
        };
      }

      try {
        const content = await R2StorageInterface.getDrawing(drawingId, drawing.userId);
        return {
          metadata: drawing,
          elements: content.elements,
          files: content.files,
          appState: content.appState,
        };
      } catch (r2Error) {
        console.warn(`从R2加载画图 ${drawingId} 失败，返回默认空数据:`, r2Error);
        // 如果R2加载失败，也返回默认空数据而不是抛出错误
        return {
          metadata: drawing,
          elements: [],
          files: {},
          appState: {},
        };
      }
    } catch (error) {
      console.error("获取画图失败:", error);
      throw error;
    }
  }

  /**
   * 更新画图
   */
  static async updateDrawing(
    drawingId: string,
    metadata?: {
      name?: string;
      desc?: string;
      parentFolderId?: string;
    },
    content?: {
      elements: any[];
      files: Record<string, any>;
      appState?: any;
    }
  ): Promise<void> {
    try {
      // 1. 更新数据库元数据
      if (metadata) {
        const updateData: any = {
          updatedAt: new Date(),
        };
        
        if (metadata.name !== undefined) updateData.name = metadata.name;
        if (metadata.desc !== undefined) updateData.desc = metadata.desc;
        if (metadata.parentFolderId !== undefined) updateData.parentFolderId = metadata.parentFolderId;

        await db
          .update(AIDTDrawingTable)
          .set(updateData)
          .where(eq(AIDTDrawingTable.id, drawingId));
      }

      // 2. 更新R2数据
      if (content) {
        // 先获取userId用于R2存储
        const [currentDrawing] = await db
          .select({ userId: AIDTDrawingTable.userId })
          .from(AIDTDrawingTable)
          .where(eq(AIDTDrawingTable.id, drawingId));
        
        if (!currentDrawing) {
          throw new Error("画图不存在");
        }
        
        const dataPath = await R2StorageInterface.uploadDrawing(drawingId, content, currentDrawing.userId);
        
        if (!dataPath) {
          throw new Error("R2存储失败，无法保存画图数据");
        }

        // 获取当前版本号（已经在上面获取过currentDrawing了）
        const [versionInfo] = await db
          .select({ version: AIDTDrawingTable.version })
          .from(AIDTDrawingTable)
          .where(eq(AIDTDrawingTable.id, drawingId));

        // 更新统计信息和R2路径
        await db
          .update(AIDTDrawingTable)
          .set({
            dataPath: dataPath, // 更新R2路径
            elementCount: content.elements?.length || 0,
            fileCount: Object.keys(content.files || {}).length,
            lastModified: new Date(),
            version: (versionInfo?.version || 0) + 1,
          })
          .where(eq(AIDTDrawingTable.id, drawingId));
      }
    } catch (error) {
      console.error("更新画图失败:", error);
      throw error;
    }
  }

  /**
   * 删除画图
   */
  static async deleteDrawing(drawingId: string): Promise<void> {
    try {
      // 先获取userId用于R2删除
      const [drawing] = await db
        .select({ userId: AIDTDrawingTable.userId })
        .from(AIDTDrawingTable)
        .where(eq(AIDTDrawingTable.id, drawingId));
      
      // 1. 删除R2数据
      if (drawing) {
        await R2StorageInterface.deleteDrawing(drawingId, drawing.userId);
      }

      // 2. 删除数据库记录
      await db
        .delete(AIDTDrawingTable)
        .where(eq(AIDTDrawingTable.id, drawingId));
    } catch (error) {
      console.error("删除画图失败:", error);
      throw error;
    }
  }

  /**
   * 保存画图数据（兼容旧接口）
   */
  static async saveDrawing(
    drawingId: string,
    content: {
      elements: any[];
      files: Record<string, any>;
      appState?: any;
    }
  ): Promise<void> {
    await this.updateDrawing(drawingId, undefined, content);
  }
}