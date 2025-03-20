"use server";

import { AIDTDrawing } from "@/drizzle/schema";
import * as drawingService from "@/services/drawing/drawing-service";
import { ActionResponse, errorResponse, successResponse } from "@/actions";

// 创建新绘图
export async function createDrawingAction(data: Omit<AIDTDrawing, "id" | "createdAt" | "updatedAt">): Promise<ActionResponse> {
    try {
        if (!data.userId) {
            return errorResponse("用户ID不能为空");
        }

        if (!data.name) {
            return errorResponse("绘图名称不能为空");
        }

        const newDrawing = await drawingService.createDrawing(data);
        return successResponse({ drawing: newDrawing });

    } catch (error) {
        console.error("创建绘图时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "创建绘图失败");
    }
}

// 通过ID获取绘图
export async function getDrawingByIdAction(id: string): Promise<ActionResponse> {
    try {
        if (!id) {
            return errorResponse("绘图ID不能为空");
        }

        const drawing = await drawingService.getDrawingById(id);

        if (!drawing) {
            return errorResponse("未找到指定绘图");
        }

        return successResponse({ drawing });

    } catch (error) {
        console.error("获取绘图时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "获取绘图失败");
    }
}

// 获取用户的所有绘图
export async function getDrawingsByUserIdAction(userId: string): Promise<ActionResponse> {
    try {
        if (!userId) {
            return errorResponse("用户ID不能为空");
        }

        const drawings = await drawingService.getDrawingsByUserId(userId);
        return successResponse({ drawings });

    } catch (error) {
        console.error("获取用户绘图时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "获取用户绘图失败");
    }
}

// 更新绘图信息
export async function updateDrawingAction(id: string, formData: FormData | Record<string, any>): Promise<ActionResponse> {
    try {
        if (!id) {
            return errorResponse("绘图ID不能为空");
        }

        // 处理表单数据
        const data = formData instanceof FormData
            ? Object.fromEntries(formData.entries())
            : formData;

        const updatedDrawing = await drawingService.updateDrawing(id, data);
        return successResponse({ drawing: updatedDrawing });

    } catch (error) {
        console.error("更新绘图时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "更新绘图失败");
    }
}

// 删除绘图
export async function deleteDrawingAction(id: string): Promise<ActionResponse> {
    try {
        if (!id) {
            return errorResponse("绘图ID不能为空");
        }

        const deletedDrawing = await drawingService.deleteDrawing(id);
        return successResponse({
            drawing: deletedDrawing,
            message: "绘图已删除"
        });

    } catch (error) {
        console.error("删除绘图时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "删除绘图失败");
    }
}

// 获取绘图列表（带分页）
export async function listDrawingsAction(limit: number = 100, offset: number = 0): Promise<ActionResponse> {
    try {
        const drawings = await drawingService.listDrawings(limit, offset);
        return successResponse({
            drawings,
            pagination: {
                limit,
                offset
            }
        });

    } catch (error) {
        console.error("获取绘图列表时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "获取绘图列表失败");
    }
}

// 搜索绘图
export async function searchDrawingsAction(query: string, userId?: string): Promise<ActionResponse> {
    try {
        if (!query || query.trim() === "") {
            return errorResponse("搜索关键词不能为空");
        }

        const drawings = await drawingService.searchDrawings(query, userId);
        return successResponse({
            drawings,
            searchParams: {
                query,
                userId
            }
        });

    } catch (error) {
        console.error("搜索绘图时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "搜索绘图失败");
    }
}