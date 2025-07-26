import { uploadDrawingData, getDrawingData, deleteDrawingData } from "./cloudflare-r2";

export interface DrawingMetadata {
  id: string;
  name: string;
  userId: string;
  parentFolderId: string;
  isFavorite: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // 新增：R2中的文件路径
  r2Path: string;
  // 新增：数据摘要信息（用于列表显示等）
  elementsCount: number;
  hasImages: boolean;
  lastModified: Date;
}

export interface DrawingContent {
  elements: any[];
  files: Record<string, any>;
  appState?: any;
  version: number;
  type: "excalidraw";
}

/**
 * 保存画图数据到R2
 */
export async function saveDrawingContent(
  drawingId: string, 
  content: DrawingContent
): Promise<{ success: boolean; r2Path?: string; error?: string }> {
  try {
    const r2Path = await uploadDrawingData(drawingId, content);
    if (r2Path) {
      return { success: true, r2Path };
    } else {
      return { success: false, error: "上传到R2失败" };
    }
  } catch (error) {
    console.error("保存画图内容失败:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "未知错误" 
    };
  }
}

/**
 * 从R2加载画图数据
 */
export async function loadDrawingContent(
  drawingId: string
): Promise<{ success: boolean; content?: DrawingContent; error?: string }> {
  try {
    const content = await getDrawingData(`drawings/${drawingId}.json`);
    if (content) {
      return { success: true, content };
    } else {
      return { success: false, error: "画图数据不存在" };
    }
  } catch (error) {
    console.error("加载画图内容失败:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "未知错误" 
    };
  }
}

/**
 * 删除R2中的画图数据
 */
export async function deleteDrawingContent(drawingId: string): Promise<void> {
  try {
    await deleteDrawingData(`drawings/${drawingId}.json`);
  } catch (error) {
    console.error("删除画图内容失败:", error);
    // 不抛出错误，允许删除数据库记录即使R2删除失败
  }
}

/**
 * 生成画图内容摘要（用于数据库存储）
 */
export function generateDrawingSummary(content: DrawingContent): {
  elementsCount: number;
  hasImages: boolean;
} {
  const elementsCount = content.elements?.length || 0;
  const hasImages = content.elements?.some((el: any) => el.type === 'image') || 
                   Object.keys(content.files || {}).length > 0;
  
  return { elementsCount, hasImages };
}

/**
 * 创建标准的Excalidraw内容格式
 */
export function createDrawingContent(
  elements: any[] = [], 
  files: Record<string, any> = {}, 
  appState?: any
): DrawingContent {
  return {
    type: "excalidraw",
    version: 2,
    elements,
    files,
    appState,
  };
}

/**
 * R2存储接口（仅限服务端使用）
 * 这个接口不包含数据库操作，只负责R2存储
 */
export class R2StorageInterface {
  /**
   * 上传画图数据到R2
   */
  static async uploadDrawing(
    drawingId: string,
    content: {
      elements: any[];
      files: Record<string, any>;
      appState?: any;
    }
  ): Promise<string> {
    const drawingContent = createDrawingContent(
      content.elements,
      content.files,
      content.appState
    );
    
    return await uploadDrawingData(drawingId, drawingContent);
  }

  /**
   * 从R2获取画图数据
   */
  static async getDrawing(drawingId: string): Promise<{
    elements: any[];
    files: Record<string, any>;
    appState?: any;
  }> {
    const content = await getDrawingData(`drawings/${drawingId}.json`);
    
    return {
      elements: content?.elements || [],
      files: content?.files || {},
      appState: content?.appState,
    };
  }

  /**
   * 删除R2中的画图数据
   */
  static async deleteDrawing(drawingId: string): Promise<void> {
    await deleteDrawingData(`drawings/${drawingId}.json`);
  }
}