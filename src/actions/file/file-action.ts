"use server";

import { AIDTFile } from "@/drizzle/schema";
import * as fileService from "@/services/file/file-service";
import { ActionResponse, errorResponse, successResponse } from "@/actions";

// 创建新文件
export async function createFileAction(data: Omit<AIDTFile, "id" | "createdAt" | "updatedAt">): Promise<ActionResponse> {
    try {
        if (!data.userId) {
            return errorResponse("用户ID不能为空");
        }

        if (!data.name) {
            return errorResponse("文件名不能为空");
        }

        const newFile = await fileService.createFile(data);
        return successResponse({ file: newFile });
    } catch (error) {
        console.error("创建文件时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "创建文件失败");
    }
}

// 通过ID获取文件
export async function getFileByIdAction(id: string): Promise<ActionResponse> {
    try {
        if (!id) {
            return errorResponse("文件ID不能为空");
        }

        const file = await fileService.getFileById(id);

        if (!file) {
            return errorResponse("未找到指定文件");
        }

        return successResponse({ file });
    } catch (error) {
        console.error("获取文件时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "获取文件失败");
    }
}

// 获取用户的所有文件
export async function getFilesByUserIdAction(userId: string, includeDeleted: boolean = false): Promise<ActionResponse> {
    try {
        if (!userId) {
            return errorResponse("用户ID不能为空");
        }

        const files = await fileService.getFilesByUserId(userId, includeDeleted);
        return successResponse({ files });
    } catch (error) {
        console.error("获取用户文件时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "获取用户文件失败");
    }
}

// 获取用户收藏的文件
export async function getFavoriteFilesByUserIdAction(userId: string): Promise<ActionResponse> {
    try {
        if (!userId) {
            return errorResponse("用户ID不能为空");
        }

        const files = await fileService.getFavoriteFilesByUserId(userId);
        return successResponse({ files });
    } catch (error) {
        console.error("获取收藏文件时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "获取收藏文件失败");
    }
}

// 更新文件信息
export async function updateFileAction(id: string, formData: FormData | Record<string, any>): Promise<ActionResponse> {
    try {
        if (!id) {
            return errorResponse("文件ID不能为空");
        }

        // 处理表单数据
        const data = formData instanceof FormData
            ? Object.fromEntries(formData.entries())
            : formData;

        const updatedFile = await fileService.updateFile(id, data);
        return successResponse({ file: updatedFile });
    } catch (error) {
        console.error("更新文件时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "更新文件失败");
    }
}

// 切换收藏状态
export async function toggleFavoriteAction(id: string): Promise<ActionResponse> {
    try {
        if (!id) {
            return errorResponse("文件ID不能为空");
        }

        const updatedFile = await fileService.toggleFavorite(id);
        return successResponse({
            file: updatedFile,
            isFavorite: updatedFile.isFavorite
        });
    } catch (error) {
        console.error("切换收藏状态时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "操作失败");
    }
}

// 更新共享级别
export async function updateSharingLevelAction(id: string, sharingLevel: string): Promise<ActionResponse> {
    try {
        if (!id) {
            return errorResponse("文件ID不能为空");
        }

        if (!['private', 'limited', 'public'].includes(sharingLevel)) {
            return errorResponse("无效的共享级别");
        }

        const updatedFile = await fileService.updateSharingLevel(id, sharingLevel);
        return successResponse({ file: updatedFile });
    } catch (error) {
        console.error("更新共享级别时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "更新共享级别失败");
    }
}

// 更新协作者
export async function updateCollaboratorsAction(id: string, collaborators: any[]): Promise<ActionResponse> {
    try {
        if (!id) {
            return errorResponse("文件ID不能为空");
        }

        if (!Array.isArray(collaborators)) {
            return errorResponse("协作者数据格式不正确");
        }

        const updatedFile = await fileService.updateCollaborators(id, collaborators);
        return successResponse({ file: updatedFile });
    } catch (error) {
        console.error("更新协作者时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "更新协作者失败");
    }
}

// 添加修订历史记录
export async function addRevisionHistoryAction(id: string, revision: any): Promise<ActionResponse> {
    try {
        if (!id) {
            return errorResponse("文件ID不能为空");
        }

        if (!revision) {
            return errorResponse("修订信息不能为空");
        }

        const updatedFile = await fileService.addRevisionHistory(id, revision);
        return successResponse({ file: updatedFile });
    } catch (error) {
        console.error("添加修订历史时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "添加修订历史失败");
    }
}

// 软删除文件
export async function softDeleteFileAction(id: string): Promise<ActionResponse> {
    try {
        if (!id) {
            return errorResponse("文件ID不能为空");
        }

        const deletedFile = await fileService.softDeleteFile(id);
        return successResponse({
            file: deletedFile,
            message: "文件已移至回收站"
        });
    } catch (error) {
        console.error("删除文件时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "删除文件失败");
    }
}

// 恢复删除的文件
export async function restoreFileAction(id: string): Promise<ActionResponse> {
    try {
        if (!id) {
            return errorResponse("文件ID不能为空");
        }

        const restoredFile = await fileService.restoreFile(id);
        return successResponse({
            file: restoredFile,
            message: "文件已恢复"
        });
    } catch (error) {
        console.error("恢复文件时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "恢复文件失败");
    }
}

// 永久删除文件
export async function deleteFileAction(id: string): Promise<ActionResponse> {
    try {
        if (!id) {
            return errorResponse("文件ID不能为空");
        }

        const deletedFile = await fileService.deleteFile(id);
        return successResponse({
            message: "文件已永久删除"
        });
    } catch (error) {
        console.error("永久删除文件时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "删除文件失败");
    }
}

// 获取文件列表（带筛选和分页）
export async function listFilesAction(options: {
    limit?: number;
    offset?: number;
    userId?: string;
    tags?: string[];
    isFavorite?: boolean;
    sharingLevel?: string;
    includeDeleted?: boolean;
} = {}): Promise<ActionResponse> {
    try {
        const files = await fileService.listFiles(options);
        return successResponse({
            files,
            pagination: {
                limit: options.limit || 100,
                offset: options.offset || 0
            }
        });
    } catch (error) {
        console.error("获取文件列表时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "获取文件列表失败");
    }
}

// 搜索文件
export async function searchFilesAction(query: string, userId?: string): Promise<ActionResponse> {
    try {
        if (!query || query.trim() === "") {
            return errorResponse("搜索关键词不能为空");
        }

        const files = await fileService.searchFiles(query, userId);
        return successResponse({
            files,
            searchParams: {
                query,
                userId
            }
        });
    } catch (error) {
        console.error("搜索文件时发生错误:", error);
        return errorResponse(error instanceof Error ? error.message : "搜索文件失败");
    }
}