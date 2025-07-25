"use server";

import { db } from "@/drizzle/db";
import { AIDTDrawingTable } from "@/drizzle/schemas";
import { ActionResponse, errorResponse, successResponse } from "@/actions";
import { eq, sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { createDrawingWithMinio, getDrawingWithMinioData, updateDrawingWithMinio } from "@/services/drawing/drawing-service";
import { deleteDrawingData } from "@/lib/cloudflare-r2";


// 创建新画图
export async function createDrawingAction(data: any): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        // 确保必要字段存在
        if (!data.name) {
            return errorResponse("画图名称不能为空");
        }
        
        // 强制验证文件夹ID
        if (!data.parentFolderId) {
            return errorResponse("画图必须属于某个文件夹");
        }

        console.log(data, "data")
        // 准备插入数据
        const drawingData = {
            name: data.name as string,
            desc: data.desc as string || "",
            userId: session?.userId,
            data: data.data || [],
            parentFolderId: data.parentFolderId as string, // 现在是必需的
            filepath: data.filepath as string || null,
            isFavorite: false,
            isDeleted: false,
            deletedAt: null
        };
        console.log(drawingData, "drawingData")

        // 创建新画图
        const [newDrawing] = await db
            .insert(AIDTDrawingTable)
            .values(drawingData)
            .returning();

        if (newDrawing == null) throw new Error("创建画图失败");

        return successResponse({ drawing: newDrawing });

    } catch (error) {
        console.error("创建画图时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "创建画图失败");
    }
}

// 通过ID获取画图
export async function getDrawingByIdAction(id: string): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        if (!id) {
            return errorResponse("画图ID不能为空");
        }

        // 获取画图
        const [drawing] = await db
            .select()
            .from(AIDTDrawingTable)
            .where(eq(AIDTDrawingTable.id, id));

        if (!drawing) {
            return errorResponse("未找到指定画图");
        }

        // 检查权限
        if (drawing.userId !== session?.userId) {
            return errorResponse("无权访问该画图");
        }

        return successResponse({ drawing });

    } catch (error) {
        console.error("获取画图时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "获取画图失败");
    }
}

// 获取用户的所有画图
export async function getDrawingsByUserIdAction(): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        const userId = session?.userId;

        // 获取用户的所有未删除画图
        const drawings = await db
            .select()
            .from(AIDTDrawingTable)
            .where(sql`${AIDTDrawingTable.userId} = ${userId} AND ${AIDTDrawingTable.isDeleted} = false`);

        return successResponse({ drawings });

    } catch (error) {
        console.error("获取用户画图时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "获取用户画图失败");
    }
}

// 根据文件夹ID获取画图
export async function getDrawingsByFolderIdAction(folderId?: string): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        const userId = session?.userId;

        // 查询画图数据
        const drawings = await db
            .select()
            .from(AIDTDrawingTable)
            .where(
                sql`${AIDTDrawingTable.userId} = ${userId} 
                    AND ${AIDTDrawingTable.isDeleted} = false 
                    AND ${folderId ? 
                        sql`${AIDTDrawingTable.parentFolderId} = ${folderId}` : 
                        sql`${AIDTDrawingTable.parentFolderId} IS NULL`
                    }`
            );

        // 获取用户信息并组合数据
        const { getUserById } = await import("@/services/user/user-service");
        const userResult = await getUserById(userId);
        
        const userInfo = userResult.success ? {
            id: userResult.user?.id,
            email: userResult.user?.email,
            firstName: userResult.user?.fullName?.split(' ')[0],
            lastName: userResult.user?.fullName?.split(' ').slice(1).join(' '),
            imageUrl: userResult.user?.avatarUrl,
        } : null;

        // 为每个画图添加用户信息
        const drawingsWithUser = drawings.map(drawing => ({
            ...drawing,
            user: userInfo
        }));

        return successResponse({ drawings: drawingsWithUser });

    } catch (error) {
        console.error("根据文件夹获取画图时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "获取画图失败");
    }
}

// 更新画图信息（集成 MinIO）
export async function updateDrawingAction(id: string, formData: FormData | Record<string, any>): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        if (!id) {
            return errorResponse("画图ID不能为空");
        }

        // 检查权限
        const [drawing] = await db
            .select()
            .from(AIDTDrawingTable)
            .where(eq(AIDTDrawingTable.id, id));

        if (!drawing) {
            return errorResponse("未找到指定画图");
        }

        if (drawing.userId !== session?.userId) {
            return errorResponse("无权修改该画图");
        }

        // 处理表单数据
        const data = formData instanceof FormData
            ? Object.fromEntries(formData.entries())
            : formData;

        // 准备更新数据
        const updateData: Record<string, any> = {};

        // 只更新提供的字段
        if (data.name !== undefined) updateData.name = data.name;
        if (data.desc !== undefined) updateData.desc = data.desc;
        if (data.parentFolderId !== undefined) updateData.parentFolderId = data.parentFolderId;
        
        // 如果有画图数据，准备上传到 MinIO
        if (data.data !== undefined) {
            updateData.data = typeof data.data === 'string'
                ? JSON.parse(data.data)
                : data.data;
        }

        // 如果有文件数据，也要保存
        if (data.files !== undefined) {
            updateData.files = typeof data.files === 'string'
                ? JSON.parse(data.files)
                : data.files;
        }

        // 使用集成 MinIO 的服务更新画图
        const updatedDrawing = await updateDrawingWithMinio(id, updateData);

        return successResponse({ drawing: updatedDrawing });

    } catch (error) {
        console.error("更新画图时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "更新画图失败");
    }
}

// 删除画图（包括 MinIO 数据）
export async function deleteDrawingAction(id: string): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        if (!id) {
            return errorResponse("画图ID不能为空");
        }

        // 检查权限
        const [drawing] = await db
            .select()
            .from(AIDTDrawingTable)
            .where(eq(AIDTDrawingTable.id, id));

        if (!drawing) {
            return errorResponse("未找到指定画图");
        }

        if (drawing.userId !== session?.userId) {
            return errorResponse("无权删除该画图");
        }

        // 先删除 MinIO 中的数据
        try {
            await deleteDrawingData(`${id}.json`);
        } catch (minioError) {
            console.warn("删除 MinIO 中的画图数据失败:", minioError);
            // MinIO 删除失败不阻止数据库删除，继续执行
        }

        // 永久删除数据库记录
        const [deletedDrawing] = await db
            .delete(AIDTDrawingTable)
            .where(eq(AIDTDrawingTable.id, id))
            .returning();

        if (deletedDrawing == null) throw new Error("删除画图失败");

        return successResponse({
            drawing: deletedDrawing,
            message: "画图已删除"
        });

    } catch (error) {
        console.error("删除画图时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "删除画图失败");
    }
}

// 获取画图列表（带分页）
export async function listDrawingsAction(limit: number = 20, offset: number = 0): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        const userId = session?.userId;

        // 获取用户的画图，带分页
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
        console.error("获取画图列表时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "获取画图列表失败");
    }
}

// 搜索画图
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
        console.error("搜索画图时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "搜索画图失败");
    }
}

// 软删除画图（移入回收站）
export async function softDeleteDrawingAction(id: string): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        if (!id) {
            return errorResponse("画图ID不能为空");
        }

        // 检查权限
        const [drawing] = await db
            .select()
            .from(AIDTDrawingTable)
            .where(eq(AIDTDrawingTable.id, id));

        if (!drawing) {
            return errorResponse("未找到指定画图");
        }

        if (drawing.userId !== session?.userId) {
            return errorResponse("无权删除该画图");
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

        if (updatedDrawing == null) throw new Error("移动画图到回收站失败");

        return successResponse({
            drawing: updatedDrawing,
            message: "画图已移至回收站"
        });

    } catch (error) {
        console.error("软删除画图时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "移动画图到回收站失败");
    }
}

// 恢复已软删除的画图
export async function restoreDrawingAction(id: string): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        if (!id) {
            return errorResponse("画图ID不能为空");
        }

        // 检查权限
        const [drawing] = await db
            .select()
            .from(AIDTDrawingTable)
            .where(eq(AIDTDrawingTable.id, id));

        if (!drawing) {
            return errorResponse("未找到指定画图");
        }

        if (drawing.userId !== session?.userId) {
            return errorResponse("无权恢复该画图");
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

        if (updatedDrawing == null) throw new Error("恢复画图失败");

        return successResponse({
            drawing: updatedDrawing,
            message: "画图已恢复"
        });

    } catch (error) {
        console.error("恢复画图时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "恢复画图失败");
    }
}

// 获取用户回收站中的画图
export async function getRecycleBinDrawingsAction(): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        const userId = session?.userId;

        // 获取回收站中的画图
        const drawings = await db
            .select()
            .from(AIDTDrawingTable)
            .where(sql`${AIDTDrawingTable.userId} = ${userId} AND ${AIDTDrawingTable.isDeleted} = true`);

        return successResponse({ drawings });

    } catch (error) {
        console.error("获取回收站画图时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "获取回收站画图失败");
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
            return errorResponse("画图ID不能为空");
        }

        // 检查权限
        const [drawing] = await db
            .select()
            .from(AIDTDrawingTable)
            .where(eq(AIDTDrawingTable.id, id));

        if (!drawing) {
            return errorResponse("未找到指定画图");
        }

        if (drawing.userId !== session?.userId) {
            return errorResponse("无权操作该画图");
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

// 获取收藏的画图
export async function getFavoriteDrawingsAction(): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        const userId = session?.userId;

        // 获取用户收藏的画图
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
        console.error("获取收藏画图时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "获取收藏画图失败");
    }
}

// 获取文件夹中的画图
export async function getFolderDrawingsAction(folderId: string): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        const userId = session?.userId;

        // 获取指定文件夹中的画图
        let drawings;
        if (!folderId || folderId === 'root') {
            // 根目录，获取没有parentFolderId的画图
            drawings = await db
                .select()
                .from(AIDTDrawingTable)
                .where(sql`
                    ${AIDTDrawingTable.userId} = ${userId} AND 
                    ${AIDTDrawingTable.isDeleted} = false AND
                    ${AIDTDrawingTable.parentFolderId} IS NULL
                `);
        } else {
            // 获取指定文件夹中的画图
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
        console.error("获取文件夹画图时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "获取文件夹画图失败");
    }
}

// 创建画图（集成 MinIO）
export async function createDrawingWithMinioAction(data: any): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        // 确保必要字段存在
        if (!data.name) {
            return errorResponse("画图名称不能为空");
        }
        
        // 强制验证文件夹ID
        if (!data.parentFolderId) {
            return errorResponse("画图必须属于某个文件夹");
        }

        // 准备插入数据
        const drawingData = {
            name: data.name as string,
            desc: data.desc as string || "",
            userId: session?.userId,
            data: data.data || [],
            parentFolderId: data.parentFolderId as string, // 现在是必需的
            filepath: null, // 将在创建后由服务更新
            isFavorite: false,
            isDeleted: false,
            deletedAt: null
        };

        // 使用集成 MinIO 的服务创建画图
        const newDrawing = await createDrawingWithMinio(drawingData);

        return successResponse({ drawing: newDrawing });

    } catch (error) {
        console.error("创建画图时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "创建画图失败");
    }
}

// 获取画图及其数据（集成 MinIO）
export async function getDrawingWithDataAction(id: string): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        if (!id) {
            return errorResponse("画图ID不能为空");
        }

        // 获取画图及 MinIO 数据
        const drawingWithData = await getDrawingWithMinioData(id);

        if (!drawingWithData) {
            return errorResponse("未找到指定画图");
        }

        // 检查权限
        if (drawingWithData.userId !== session?.userId) {
            return errorResponse("无权访问该画图");
        }

        // 合并数据库数据和 MinIO 数据
        const responseData = {
            ...drawingWithData,
            data: drawingWithData.minioData || drawingWithData.data || []
        };

        return successResponse({ drawing: responseData });

    } catch (error) {
        console.error("获取画图时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "获取画图失败");
    }
}