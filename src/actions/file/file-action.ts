"use server";

import { db } from "@/drizzle/db";
import { AIDTFileTable } from "@/drizzle/schema";
import { eq, sql, desc, and, or, like } from "drizzle-orm";

import { ActionResponse, errorResponse, successResponse } from "@/actions";
import { auth } from "@clerk/nextjs/server";

// 创建文件
export async function createFileAction(formData: FormData | Record<string, any>): Promise<ActionResponse> {
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
            return errorResponse("文件名称不能为空");
        }

        // 准备插入数据
        const fileData = {
            name: data.name as string,
            desc: (data.desc as string) || "",
            userId: session?.userId,
            data: data.data ? JSON.parse(data.data as string) : {},
            parentFolderId: (data.parentFolderId as string) || null,
            lastModifiedBy: session?.userId
        };

        // 创建新文件
        const [newFile] = await db
            .insert(AIDTFileTable)
            .values(fileData)
            .returning();

        if (newFile == null) throw new Error("创建文件失败");

        return successResponse({ file: newFile });

    } catch (error) {
        console.error("创建文件时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "创建文件失败");
    }
}

// 通过ID获取文件
export async function getFileByIdAction(id: string): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        if (!id) {
            return errorResponse("文件ID不能为空");
        }

        // 获取文件
        const [file] = await db
            .select()
            .from(AIDTFileTable)
            .where(eq(AIDTFileTable.id, id));

        if (!file) {
            return errorResponse("未找到指定文件");
        }

        // 检查权限（只有文件创建者可以查看）
        if (file.userId !== session?.userId) {
            return errorResponse("无权访问该文件");
        }

        return successResponse({ file });

    } catch (error) {
        console.error("获取文件时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "获取文件失败");
    }
}

// 更新文件
export async function updateFileAction(id: string, formData: FormData | Record<string, any>): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        if (!id) {
            return errorResponse("文件ID不能为空");
        }

        // 检查权限
        const [file] = await db
            .select()
            .from(AIDTFileTable)
            .where(eq(AIDTFileTable.id, id));

        if (!file) {
            return errorResponse("未找到指定文件");
        }

        if (file.userId !== session?.userId) {
            return errorResponse("无权修改该文件");
        }

        // 处理表单数据
        const data = formData instanceof FormData
            ? Object.fromEntries(formData.entries())
            : formData;

        // 准备更新数据
        const updateData: Record<string, any> = {
            updatedAt: new Date(),
            lastModifiedBy: session?.userId,
            version: file.version + 1 // 增加版本号
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
        const [updatedFile] = await db
            .update(AIDTFileTable)
            .set(updateData)
            .where(eq(AIDTFileTable.id, id))
            .returning();

        if (updatedFile == null) throw new Error("更新文件失败");

        return successResponse({ file: updatedFile });

    } catch (error) {
        console.error("更新文件时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "更新文件失败");
    }
}

// 获取用户的所有文件
export async function getFilesByUserIdAction(): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        const userId = session?.userId;

        // 获取用户的所有未删除文件
        const files = await db
            .select()
            .from(AIDTFileTable)
            .where(sql`${AIDTFileTable.userId} = ${userId} AND ${AIDTFileTable.isDeleted} = false`);

        return successResponse({ files });

    } catch (error) {
        console.error("获取用户文件时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "获取用户文件失败");
    }
}

// 软删除文件（移入回收站）
export async function softDeleteFileAction(id: string): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        if (!id) {
            return errorResponse("文件ID不能为空");
        }

        // 检查权限
        const [file] = await db
            .select()
            .from(AIDTFileTable)
            .where(eq(AIDTFileTable.id, id));

        if (!file) {
            return errorResponse("未找到指定文件");
        }

        if (file.userId !== session?.userId) {
            return errorResponse("无权删除该文件");
        }

        // 软删除实现
        const [updatedFile] = await db
            .update(AIDTFileTable)
            .set({
                isDeleted: true,
                deletedAt: new Date(),
                updatedAt: new Date()
            })
            .where(eq(AIDTFileTable.id, id))
            .returning();

        if (updatedFile == null) throw new Error("移动文件到回收站失败");

        return successResponse({
            file: updatedFile,
            message: "文件已移至回收站"
        });

    } catch (error) {
        console.error("软删除文件时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "移动文件到回收站失败");
    }
}

// 恢复已软删除的文件
export async function restoreFileAction(id: string): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        if (!id) {
            return errorResponse("文件ID不能为空");
        }

        // 检查权限
        const [file] = await db
            .select()
            .from(AIDTFileTable)
            .where(eq(AIDTFileTable.id, id));

        if (!file) {
            return errorResponse("未找到指定文件");
        }

        if (file.userId !== session?.userId) {
            return errorResponse("无权恢复该文件");
        }

        // 恢复实现
        const [updatedFile] = await db
            .update(AIDTFileTable)
            .set({
                isDeleted: false,
                deletedAt: null,
                updatedAt: new Date()
            })
            .where(eq(AIDTFileTable.id, id))
            .returning();

        if (updatedFile == null) throw new Error("恢复文件失败");

        return successResponse({
            file: updatedFile,
            message: "文件已恢复"
        });

    } catch (error) {
        console.error("恢复文件时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "恢复文件失败");
    }
}

// 获取用户回收站中的文件
export async function getRecycleBinFilesAction(): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        const userId = session?.userId;

        // 获取回收站中的文件
        const files = await db
            .select()
            .from(AIDTFileTable)
            .where(sql`${AIDTFileTable.userId} = ${userId} AND ${AIDTFileTable.isDeleted} = true`);

        return successResponse({ files });

    } catch (error) {
        console.error("获取回收站文件时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "获取回收站文件失败");
    }
}

// 切换收藏状态
export async function toggleFavoriteFileAction(id: string): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        if (!id) {
            return errorResponse("文件ID不能为空");
        }

        // 检查权限
        const [file] = await db
            .select()
            .from(AIDTFileTable)
            .where(eq(AIDTFileTable.id, id));

        if (!file) {
            return errorResponse("未找到指定文件");
        }

        if (file.userId !== session?.userId) {
            return errorResponse("无权操作该文件");
        }

        // 切换收藏状态
        const [updatedFile] = await db
            .update(AIDTFileTable)
            .set({
                isFavorite: !file.isFavorite,
                updatedAt: new Date()
            })
            .where(eq(AIDTFileTable.id, id))
            .returning();

        if (updatedFile == null) throw new Error("更新收藏状态失败");

        return successResponse({
            file: updatedFile,
            message: updatedFile.isFavorite ? "已添加到收藏" : "已从收藏中移除"
        });

    } catch (error) {
        console.error("切换收藏状态时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "切换收藏状态失败");
    }
}

// 获取收藏的文件
export async function getFavoriteFilesAction(): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        const userId = session?.userId;

        // 获取用户收藏的文件
        const files = await db
            .select()
            .from(AIDTFileTable)
            .where(sql`
                ${AIDTFileTable.userId} = ${userId} AND 
                ${AIDTFileTable.isDeleted} = false AND
                ${AIDTFileTable.isFavorite} = true
            `);

        return successResponse({ files });

    } catch (error) {
        console.error("获取收藏文件时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "获取收藏文件失败");
    }
}

// 搜索文件
export async function searchFilesAction(query: string): Promise<ActionResponse> {
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
        const files = await db
            .select()
            .from(AIDTFileTable)
            .where(sql`${AIDTFileTable.userId} = ${userId} 
                AND ${AIDTFileTable.isDeleted} = false
                AND (${AIDTFileTable.name} ILIKE ${searchQuery} 
                OR ${AIDTFileTable.desc} ILIKE ${searchQuery})`);

        return successResponse({
            files,
            searchParams: { query }
        });

    } catch (error) {
        console.error("搜索文件时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "搜索文件失败");
    }
}

// 获取文档数据用于导出
async function getDocumentData(fileId: string) {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return { success: false, error: "未授权操作" };
        }

        const [file] = await db
            .select()
            .from(AIDTFileTable)
            .where(eq(AIDTFileTable.id, fileId))
            .limit(1);

        if (!file) {
            return { success: false, error: "文档不存在" };
        }

        // 检查权限
        if (file.userId !== session?.userId) {
            return { success: false, error: "无权访问该文件" };
        }

        // 根据简化的 schema 返回数据
        return {
            success: true,
            data: {
                name: file.name || "导出文档",
                content: file.data,
                // 简化后的 schema 不再包含这些字段，可以从数据中计算或省略
                wordCount: countWords(file.data),
                charCount: countChars(file.data)
            }
        };
    } catch (error) {
        console.error("获取文档数据失败:", error);
        return { success: false, error: "获取文档数据失败" };
    }
}

// 辅助函数：计算文档中的字数
function countWords(data: any): number {
    try {
        if (!data || !data.blocks) return 0;

        let text = '';
        for (const block of data.blocks) {
            if (block.type === 'paragraph' || block.type === 'header') {
                text += block.data?.text + ' ';
            }
        }

        // 简单的字数计算，可根据需要改进
        return text.trim().split(/\s+/).filter(Boolean).length;
    } catch (e) {
        console.error("计算字数错误:", e);
        return 0;
    }
}

// 辅助函数：计算文档中的字符数
function countChars(data: any): number {
    try {
        if (!data || !data.blocks) return 0;

        let text = '';
        for (const block of data.blocks) {
            if (block.type === 'paragraph' || block.type === 'header') {
                text += block.data?.text || '';
            }
        }

        return text.length;
    } catch (e) {
        console.error("计算字符数错误:", e);
        return 0;
    }
}

// 导出为各种格式 (实际上只是获取数据，客户端负责格式转换)
export async function exportToPdfAction(fileId: string) {
    return getDocumentData(fileId);
}

export async function exportToWordAction(fileId: string) {
    return getDocumentData(fileId);
}

export async function exportToMarkdownAction(fileId: string) {
    return getDocumentData(fileId);
}

export async function exportToHtmlAction(fileId: string) {
    return getDocumentData(fileId);
}