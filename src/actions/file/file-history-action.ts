"use server";

import { db } from "@/drizzle/db";
import { AIDTFileTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { ActionResponse, errorResponse, successResponse } from "@/actions";

// 获取文件历史记录
export async function getFileHistoryAction(fileId: string): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        if (!fileId) {
            return errorResponse("文件ID不能为空");
        }

        // 检查权限
        const [file] = await db
            .select()
            .from(AIDTFileTable)
            .where(eq(AIDTFileTable.id, fileId));

        if (!file) {
            return errorResponse("未找到指定文件");
        }

        if (file.userId !== session?.userId) {
            return errorResponse("无权访问该文件历史");
        }

        // 返回文件的修订历史
        return successResponse({
            history: file.revisionHistory || [],
            snapshotFrequency: file.snapshotFrequency,
            maxHistoryItems: file.maxHistoryItems
        });

    } catch (error) {
        console.error("获取文件历史记录时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "获取文件历史记录失败");
    }
}

// 添加历史记录
export async function addFileHistoryAction(fileId: string, snapshot: any, summary: string = "更新文档"): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        if (!fileId) {
            return errorResponse("文件ID不能为空");
        }

        // 检查权限
        const [file] = await db
            .select()
            .from(AIDTFileTable)
            .where(eq(AIDTFileTable.id, fileId));

        if (!file) {
            return errorResponse("未找到指定文件");
        }

        if (file.userId !== session?.userId) {
            return errorResponse("无权修改该文件历史");
        }

        // 添加新的历史记录
        const currentHistory = Array.isArray(file.revisionHistory) ? [...file.revisionHistory] : [];

        // 创建新的历史条目
        const newHistoryItem = {
            version: file.version,
            timestamp: new Date().toISOString(),
            userId: session?.userId,
            summary,
            snapshot
        };

        // 添加到数组前面（最新的记录在前）
        currentHistory.unshift(newHistoryItem);

        // 仅保留最大历史条目数量
        const limitedHistory = currentHistory.slice(0, file.maxHistoryItems || 50);

        // 更新文件的修订历史
        const [updatedFile] = await db
            .update(AIDTFileTable)
            .set({
                revisionHistory: limitedHistory,
                updatedAt: new Date()
            })
            .where(eq(AIDTFileTable.id, fileId))
            .returning();

        if (updatedFile == null) throw new Error("更新文件历史失败");

        return successResponse({
            history: updatedFile.revisionHistory,
            message: "历史记录已添加"
        });

    } catch (error) {
        console.error("添加文件历史记录时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "添加文件历史记录失败");
    }
}

// 恢复到历史版本
export async function restoreFileVersionAction(fileId: string, version: string): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        if (!fileId) {
            return errorResponse("文件ID不能为空");
        }

        // 检查权限
        const [file] = await db
            .select()
            .from(AIDTFileTable)
            .where(eq(AIDTFileTable.id, fileId));

        if (!file) {
            return errorResponse("未找到指定文件");
        }

        if (file.userId !== session?.userId) {
            return errorResponse("无权恢复该文件版本");
        }

        // 查找指定版本的历史记录
        const historyItem = Array.isArray(file.revisionHistory)
            ? file.revisionHistory.find(item => item.version === version)
            : null;

        if (!historyItem) {
            return errorResponse("指定版本的历史记录不存在");
        }

        // 创建新的历史条目（记录当前状态）
        const currentSnapshot = file.data;
        const currentVersion = file.version;

        const newHistoryItem = {
            version: currentVersion,
            timestamp: new Date().toISOString(),
            userId: session?.userId,
            summary: `恢复前的版本 ${currentVersion}`,
            snapshot: currentSnapshot
        };

        // 更新历史记录
        const currentHistory = Array.isArray(file.revisionHistory) ? [...file.revisionHistory] : [];
        currentHistory.unshift(newHistoryItem);

        // 仅保留最大历史条目数量
        const limitedHistory = currentHistory.slice(0, file.maxHistoryItems || 50);

        // 更新文件数据为历史版本
        const newVersion = file.version + 1;
        const [updatedFile] = await db
            .update(AIDTFileTable)
            .set({
                data: historyItem.snapshot,
                version: newVersion,
                revisionHistory: limitedHistory,
                updatedAt: new Date(),
                lastModifiedBy: session?.userId
            })
            .where(eq(AIDTFileTable.id, fileId))
            .returning();

        if (updatedFile == null) throw new Error("恢复文件版本失败");

        return successResponse({
            file: updatedFile,
            message: `已恢复到版本 ${version}`
        });

    } catch (error) {
        console.error("恢复文件版本时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "恢复文件版本失败");
    }
}

// 更新历史设置
export async function updateHistorySettingsAction(fileId: string, settings: {
    snapshotFrequency?: string,
    maxHistoryItems?: number
}): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        if (!fileId) {
            return errorResponse("文件ID不能为空");
        }

        // 检查权限
        const [file] = await db
            .select()
            .from(AIDTFileTable)
            .where(eq(AIDTFileTable.id, fileId));

        if (!file) {
            return errorResponse("未找到指定文件");
        }

        if (file.userId !== session?.userId) {
            return errorResponse("无权修改该文件设置");
        }

        // 准备更新数据
        const updateData: Record<string, any> = {
            updatedAt: new Date()
        };

        if (settings.snapshotFrequency) updateData.snapshotFrequency = settings.snapshotFrequency;
        if (settings.maxHistoryItems !== undefined) updateData.maxHistoryItems = settings.maxHistoryItems;

        // 执行更新
        const [updatedFile] = await db
            .update(AIDTFileTable)
            .set(updateData)
            .where(eq(AIDTFileTable.id, fileId))
            .returning();

        if (updatedFile == null) throw new Error("更新历史设置失败");

        return successResponse({
            settings: {
                snapshotFrequency: updatedFile.snapshotFrequency,
                maxHistoryItems: updatedFile.maxHistoryItems
            },
            message: "历史设置已更新"
        });

    } catch (error) {
        console.error("更新历史设置时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "更新历史设置失败");
    }
}

// 清除文件历史记录
export async function clearFileHistoryAction(fileId: string): Promise<ActionResponse> {
    try {
        // 获取当前用户
        const session = await auth();
        if (!session?.userId) {
            return errorResponse("未授权操作");
        }

        if (!fileId) {
            return errorResponse("文件ID不能为空");
        }

        // 检查权限
        const [file] = await db
            .select()
            .from(AIDTFileTable)
            .where(eq(AIDTFileTable.id, fileId));

        if (!file) {
            return errorResponse("未找到指定文件");
        }

        if (file.userId !== session?.userId) {
            return errorResponse("无权清除该文件历史");
        }

        // 清除历史记录
        const [updatedFile] = await db
            .update(AIDTFileTable)
            .set({
                revisionHistory: [],
                updatedAt: new Date()
            })
            .where(eq(AIDTFileTable.id, fileId))
            .returning();

        if (updatedFile == null) throw new Error("清除文件历史失败");

        return successResponse({
            message: "文件历史已清除"
        });

    } catch (error) {
        console.error("清除文件历史时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "清除文件历史失败");
    }
}