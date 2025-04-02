"use server";

import { db } from "@/drizzle/db";
import { AIDTDrawing, AIDTDrawingTable } from "@/drizzle/schema";
import { ActionResponse, errorResponse, successResponse } from "@/actions";
import { eq, sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";


// 创建新绘图
export async function createDrawingAction(formData: FormData | Record<string, any>): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        // 处理表单数据
        const data = formData instanceof FormData
            ? Object.fromEntries(formData.entries())
            : formData;

        // 确保必要字段存在
        if (!data.name) {
            return errorResponse("绘图名称不能为空");
        }

        // 准备插入数据
        const drawingData = {
            name: data.name as string,
            desc: data.desc as string || "",
            userId: session?.userId,
            data: data.data ? JSON.parse(data.data as string) : [],
            parentFolderId: data.parentFolderId as string || null
        };

        // 创建新绘图
        const [newDrawing] = await db
            .insert(AIDTDrawingTable)
            .values(drawingData)
            .returning();

        if (newDrawing == null) throw new Error("创建绘图失败");

        return successResponse({ drawing: newDrawing });

    } catch (error) {
        console.error("创建绘图时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "创建绘图失败");
    }
}

// 通过ID获取绘图
export async function getDrawingByIdAction(id: string): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        if (!id) {
            return errorResponse("绘图ID不能为空");
        }

        // 获取绘图
        const [drawing] = await db
            .select()
            .from(AIDTDrawingTable)
            .where(eq(AIDTDrawingTable.id, id));

        if (!drawing) {
            return errorResponse("未找到指定绘图");
        }

        // 检查权限
        if (drawing.userId !== session?.userId) {
            return errorResponse("无权访问该绘图");
        }

        return successResponse({ drawing });

    } catch (error) {
        console.error("获取绘图时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "获取绘图失败");
    }
}

// 获取用户的所有绘图
export async function getDrawingsByUserIdAction(): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        const userId = session?.userId;

        // 获取用户的所有未删除绘图
        const drawings = await db
            .select()
            .from(AIDTDrawingTable)
            .where(sql`${AIDTDrawingTable.userId} = ${userId} AND ${AIDTDrawingTable.isDeleted} = false`);

        return successResponse({ drawings });

    } catch (error) {
        console.error("获取用户绘图时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "获取用户绘图失败");
    }
}

// 更新绘图信息
export async function updateDrawingAction(id: string, formData: FormData | Record<string, any>): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        if (!id) {
            return errorResponse("绘图ID不能为空");
        }

        // 检查权限
        const [drawing] = await db
            .select()
            .from(AIDTDrawingTable)
            .where(eq(AIDTDrawingTable.id, id));

        if (!drawing) {
            return errorResponse("未找到指定绘图");
        }

        if (drawing.userId !== session?.userId) {
            return errorResponse("无权修改该绘图");
        }

        // 处理表单数据
        const data = formData instanceof FormData
            ? Object.fromEntries(formData.entries())
            : formData;

        // 准备更新数据
        const updateData: Record<string, any> = {
            updatedAt: new Date()
        };

        // 只更新提供的字段
        if (data.name !== undefined) updateData.name = data.name;
        if (data.desc !== undefined) updateData.desc = data.desc;
        if (data.data !== undefined) {
            updateData.data = typeof data.data === 'string'
                ? JSON.parse(data.data)
                : data.data;
        }
        if (data.parentFolderId !== undefined) updateData.parentFolderId = data.parentFolderId;

        // 执行更新
        const [updatedDrawing] = await db
            .update(AIDTDrawingTable)
            .set(updateData)
            .where(eq(AIDTDrawingTable.id, id))
            .returning();

        if (updatedDrawing == null) throw new Error("更新绘图失败");

        return successResponse({ drawing: updatedDrawing });

    } catch (error) {
        console.error("更新绘图时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "更新绘图失败");
    }
}

// 删除绘图
export async function deleteDrawingAction(id: string): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        if (!id) {
            return errorResponse("绘图ID不能为空");
        }

        // 检查权限
        const [drawing] = await db
            .select()
            .from(AIDTDrawingTable)
            .where(eq(AIDTDrawingTable.id, id));

        if (!drawing) {
            return errorResponse("未找到指定绘图");
        }

        if (drawing.userId !== session?.userId) {
            return errorResponse("无权删除该绘图");
        }

        // 永久删除
        const [deletedDrawing] = await db
            .delete(AIDTDrawingTable)
            .where(eq(AIDTDrawingTable.id, id))
            .returning();

        if (deletedDrawing == null) throw new Error("删除绘图失败");

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
export async function listDrawingsAction(limit: number = 20, offset: number = 0): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        const userId = session?.userId;

        // 获取用户的绘图，带分页
        const drawings = await db
            .select()
            .from(AIDTDrawingTable)
            .where(sql`${AIDTDrawingTable.userId} = ${userId} AND ${AIDTDrawingTable.isDeleted} = false`)
            .limit(limit)
            .offset(offset);

        // 获取总数
        const [countResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(AIDTDrawingTable)
            .where(sql`${AIDTDrawingTable.userId} = ${userId} AND ${AIDTDrawingTable.isDeleted} = false`);

        const total = countResult?.count || 0;

        return successResponse({
            drawings,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + drawings.length < total
            }
        });

    } catch (error) {
        console.error("获取绘图列表时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "获取绘图列表失败");
    }
}

// 搜索绘图
export async function searchDrawingsAction(query: string): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        const userId = session?.userId;

        if (!query || query.trim() === "") {
            return errorResponse("搜索关键词不能为空");
        }

        // 使用LIKE进行模糊搜索
        const searchQuery = `%${query}%`;

        // 执行查询
        const drawings = await db
            .select()
            .from(AIDTDrawingTable)
            .where(sql`${AIDTDrawingTable.userId} = ${userId} 
                AND ${AIDTDrawingTable.isDeleted} = false
                AND (${AIDTDrawingTable.name} ILIKE ${searchQuery} 
                OR ${AIDTDrawingTable.desc} ILIKE ${searchQuery})`);

        return successResponse({
            drawings,
            searchParams: { query }
        });

    } catch (error) {
        console.error("搜索绘图时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "搜索绘图失败");
    }
}

// 软删除绘图（移入回收站）
export async function softDeleteDrawingAction(id: string): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        if (!id) {
            return errorResponse("绘图ID不能为空");
        }

        // 检查权限
        const [drawing] = await db
            .select()
            .from(AIDTDrawingTable)
            .where(eq(AIDTDrawingTable.id, id));

        if (!drawing) {
            return errorResponse("未找到指定绘图");
        }

        if (drawing.userId !== session?.userId) {
            return errorResponse("无权删除该绘图");
        }

        // 软删除实现
        const [updatedDrawing] = await db
            .update(AIDTDrawingTable)
            .set({
                isDeleted: true,
                deletedAt: new Date(),
                updatedAt: new Date()
            })
            .where(eq(AIDTDrawingTable.id, id))
            .returning();

        if (updatedDrawing == null) throw new Error("移动绘图到回收站失败");

        return successResponse({
            drawing: updatedDrawing,
            message: "绘图已移至回收站"
        });

    } catch (error) {
        console.error("软删除绘图时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "移动绘图到回收站失败");
    }
}

// 恢复已软删除的绘图
export async function restoreDrawingAction(id: string): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        if (!id) {
            return errorResponse("绘图ID不能为空");
        }

        // 检查权限
        const [drawing] = await db
            .select()
            .from(AIDTDrawingTable)
            .where(eq(AIDTDrawingTable.id, id));

        if (!drawing) {
            return errorResponse("未找到指定绘图");
        }

        if (drawing.userId !== session?.userId) {
            return errorResponse("无权恢复该绘图");
        }

        // 恢复实现
        const [updatedDrawing] = await db
            .update(AIDTDrawingTable)
            .set({
                isDeleted: false,
                deletedAt: null,
                updatedAt: new Date()
            })
            .where(eq(AIDTDrawingTable.id, id))
            .returning();

        if (updatedDrawing == null) throw new Error("恢复绘图失败");

        return successResponse({
            drawing: updatedDrawing,
            message: "绘图已恢复"
        });

    } catch (error) {
        console.error("恢复绘图时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "恢复绘图失败");
    }
}

// 获取用户回收站中的绘图
export async function getRecycleBinDrawingsAction(): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        const userId = session?.userId;

        // 获取回收站中的绘图
        const drawings = await db
            .select()
            .from(AIDTDrawingTable)
            .where(sql`${AIDTDrawingTable.userId} = ${userId} AND ${AIDTDrawingTable.isDeleted} = true`);

        return successResponse({ drawings });

    } catch (error) {
        console.error("获取回收站绘图时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "获取回收站绘图失败");
    }
}

// 切换收藏状态
export async function toggleFavoriteDrawingAction(id: string): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        if (!id) {
            return errorResponse("绘图ID不能为空");
        }

        // 检查权限
        const [drawing] = await db
            .select()
            .from(AIDTDrawingTable)
            .where(eq(AIDTDrawingTable.id, id));

        if (!drawing) {
            return errorResponse("未找到指定绘图");
        }

        if (drawing.userId !== session?.userId) {
            return errorResponse("无权操作该绘图");
        }

        // 切换收藏状态
        const [updatedDrawing] = await db
            .update(AIDTDrawingTable)
            .set({
                isFavorite: !drawing.isFavorite,
                updatedAt: new Date()
            })
            .where(eq(AIDTDrawingTable.id, id))
            .returning();

        if (updatedDrawing == null) throw new Error("更新收藏状态失败");

        return successResponse({
            drawing: updatedDrawing,
            message: updatedDrawing.isFavorite ? "已添加到收藏" : "已从收藏中移除"
        });

    } catch (error) {
        console.error("切换收藏状态时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "切换收藏状态失败");
    }
}

// 获取收藏的绘图
export async function getFavoriteDrawingsAction(): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        const userId = session?.userId;

        // 获取用户收藏的绘图
        const drawings = await db
            .select()
            .from(AIDTDrawingTable)
            .where(sql`
                ${AIDTDrawingTable.userId} = ${userId} AND 
                ${AIDTDrawingTable.isDeleted} = false AND
                ${AIDTDrawingTable.isFavorite} = true
            `);

        return successResponse({ drawings });

    } catch (error) {
        console.error("获取收藏绘图时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "获取收藏绘图失败");
    }
}

// 获取文件夹中的绘图
export async function getFolderDrawingsAction(folderId: string): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        const userId = session?.userId;

        // 获取指定文件夹中的绘图
        let drawings;
        if (!folderId || folderId === 'root') {
            // 根目录，获取没有parentFolderId的绘图
            drawings = await db
                .select()
                .from(AIDTDrawingTable)
                .where(sql`
                    ${AIDTDrawingTable.userId} = ${userId} AND 
                    ${AIDTDrawingTable.isDeleted} = false AND
                    ${AIDTDrawingTable.parentFolderId} IS NULL
                `);
        } else {
            // 获取指定文件夹中的绘图
            drawings = await db
                .select()
                .from(AIDTDrawingTable)
                .where(sql`
                    ${AIDTDrawingTable.userId} = ${userId} AND 
                    ${AIDTDrawingTable.isDeleted} = false AND
                    ${AIDTDrawingTable.parentFolderId} = ${folderId}
                `);
        }

        return successResponse({
            drawings,
            folderId: folderId || 'root'
        });

    } catch (error) {
        console.error("获取文件夹绘图时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "获取文件夹绘图失败");
    }
}