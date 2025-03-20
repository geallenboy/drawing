"use server";

import { db } from "@/drizzle/db";
import { AIDTFile, AIDTFileTable } from "@/drizzle/schema";
import { eq, sql, and, or, like } from "drizzle-orm";

// 创建新文件
export async function createFile(data: Omit<AIDTFile, "id" | "createdAt" | "updatedAt">): Promise<AIDTFile> {
    const [newFile] = await db
        .insert(AIDTFileTable)
        .values(data)
        .returning();

    if (newFile == null) throw new Error("创建文件失败");
    return newFile;
}

// 通过ID获取文件
export async function getFileById(id: string): Promise<AIDTFile | null> {
    const [file] = await db
        .select()
        .from(AIDTFileTable)
        .where(and(
            eq(AIDTFileTable.id, id),
            eq(AIDTFileTable.isDeleted, false)
        ));

    return file || null;
}

// 通过用户ID获取文件
export async function getFilesByUserId(userId: string, includeDeleted: boolean = false): Promise<AIDTFile[]> {
    let query = db
        .select()
        .from(AIDTFileTable);

    const conditions = [eq(AIDTFileTable.userId, userId)];
    if (!includeDeleted) {
        conditions.push(eq(AIDTFileTable.isDeleted, false));
    }

    return query.where(and(...conditions));
}

// 获取用户收藏的文件
export async function getFavoriteFilesByUserId(userId: string): Promise<AIDTFile[]> {
    return db
        .select()
        .from(AIDTFileTable)
        .where(and(
            eq(AIDTFileTable.userId, userId),
            eq(AIDTFileTable.isFavorite, true),
            eq(AIDTFileTable.isDeleted, false)
        ));
}

// 更新文件
export async function updateFile(
    id: string,
    data: Partial<Omit<typeof AIDTFileTable.$inferInsert, "id" | "createdAt" | "updatedAt">>
): Promise<AIDTFile> {
    // 更新字数和字符统计（如果提供了data字段）
    const updateData = { ...data };
    if (data.data) {
        const wordCount = calculateWordCount(data.data);
        updateData.wordCount = wordCount.words;
        updateData.charCount = wordCount.characters;
    }

    const [updatedFile] = await db
        .update(AIDTFileTable)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(AIDTFileTable.id, id))
        .returning();

    if (updatedFile == null) throw new Error("更新文件失败");
    return updatedFile;
}

// 切换收藏状态
export async function toggleFavorite(id: string): Promise<AIDTFile> {
    const file = await getFileById(id);
    if (!file) throw new Error("文件不存在");

    const [updatedFile] = await db
        .update(AIDTFileTable)
        .set({
            isFavorite: !file.isFavorite,
            updatedAt: new Date()
        })
        .where(eq(AIDTFileTable.id, id))
        .returning();

    if (updatedFile == null) throw new Error("更新收藏状态失败");
    return updatedFile;
}

// 更新共享级别
export async function updateSharingLevel(id: string, sharingLevel: string): Promise<AIDTFile> {
    const [updatedFile] = await db
        .update(AIDTFileTable)
        .set({
            sharingLevel,
            updatedAt: new Date()
        })
        .where(eq(AIDTFileTable.id, id))
        .returning();

    if (updatedFile == null) throw new Error("更新共享级别失败");
    return updatedFile;
}

// 添加或更新协作者
export async function updateCollaborators(id: string, collaborators: any[]): Promise<AIDTFile> {
    const [updatedFile] = await db
        .update(AIDTFileTable)
        .set({
            collaborators,
            updatedAt: new Date()
        })
        .where(eq(AIDTFileTable.id, id))
        .returning();

    if (updatedFile == null) throw new Error("更新协作者失败");
    return updatedFile;
}

// 添加修订历史记录
export async function addRevisionHistory(id: string, revision: any): Promise<AIDTFile> {
    const file = await getFileById(id);
    if (!file) throw new Error("文件不存在");

    const revisionHistory = Array.isArray(file.revisionHistory)
        ? [...file.revisionHistory, revision]
        : [revision];

    const [updatedFile] = await db
        .update(AIDTFileTable)
        .set({
            revisionHistory,
            updatedAt: new Date()
        })
        .where(eq(AIDTFileTable.id, id))
        .returning();

    if (updatedFile == null) throw new Error("更新修订历史失败");
    return updatedFile;
}

// 软删除文件
export async function softDeleteFile(id: string): Promise<AIDTFile> {
    const [deletedFile] = await db
        .update(AIDTFileTable)
        .set({
            isDeleted: true,
            updatedAt: new Date()
        })
        .where(eq(AIDTFileTable.id, id))
        .returning();

    if (deletedFile == null) throw new Error("删除文件失败");
    return deletedFile;
}

// 恢复删除的文件
export async function restoreFile(id: string): Promise<AIDTFile> {
    const [restoredFile] = await db
        .update(AIDTFileTable)
        .set({
            isDeleted: false,
            updatedAt: new Date()
        })
        .where(eq(AIDTFileTable.id, id))
        .returning();

    if (restoredFile == null) throw new Error("恢复文件失败");
    return restoredFile;
}

// 硬删除文件
export async function deleteFile(id: string): Promise<AIDTFile> {
    const [deletedFile] = await db
        .delete(AIDTFileTable)
        .where(eq(AIDTFileTable.id, id))
        .returning();

    if (deletedFile == null) throw new Error("删除文件失败");
    return deletedFile;
}

// 列出所有文件（带分页和筛选）
export async function listFiles(options: {
    limit?: number;
    offset?: number;
    userId?: string;
    tags?: string[];
    isFavorite?: boolean;
    sharingLevel?: string;
    includeDeleted?: boolean;
} = {}): Promise<AIDTFile[]> {
    const {
        limit = 100,
        offset = 0,
        userId,
        tags,
        isFavorite,
        sharingLevel,
        includeDeleted = false
    } = options;

    let baseQuery = db.select().from(AIDTFileTable);

    // 应用筛选条件
    const conditions = [];

    if (!includeDeleted) {
        conditions.push(eq(AIDTFileTable.isDeleted, false));
    }

    if (userId) {
        conditions.push(eq(AIDTFileTable.userId, userId));
    }

    if (typeof isFavorite === 'boolean') {
        conditions.push(eq(AIDTFileTable.isFavorite, isFavorite));
    }

    if (sharingLevel) {
        conditions.push(eq(AIDTFileTable.sharingLevel, sharingLevel));
    }

    if (tags && tags.length > 0) {
        // 注意：这里使用了简化的标签匹配，实际实现可能需要更复杂的数组包含检查
        tags.forEach(tag => {
            conditions.push(sql`${AIDTFileTable.tags} @> ARRAY[${tag}]::text[]`);
        });
    }

    const query = conditions.length > 0
        ? baseQuery.where(and(...conditions))
        : baseQuery;

    return query.limit(limit).offset(offset);
}

// 搜索文件
export async function searchFiles(query: string, userId?: string): Promise<AIDTFile[]> {
    const searchQuery = `%${query}%`;

    let conditions = or(
        like(AIDTFileTable.name, searchQuery),
        like(AIDTFileTable.desc, searchQuery)
    );

    if (userId) {
        conditions = and(conditions, eq(AIDTFileTable.userId, userId));
    }

    // 只搜索未删除的文件
    conditions = and(conditions, eq(AIDTFileTable.isDeleted, false));

    return db
        .select()
        .from(AIDTFileTable)
        .where(conditions);
}

// 计算字数和字符数的辅助函数
function calculateWordCount(data: any): { words: number, characters: number } {
    try {
        // 假设data是EditorJS格式的数据
        let text = '';
        if (data.blocks) {
            data.blocks.forEach((block: any) => {
                if (block.type === 'paragraph' || block.type === 'header') {
                    text += block.data.text + ' ';
                }
            });
        }

        const words = text.trim().split(/\s+/).filter(Boolean).length;
        const characters = text.replace(/\s+/g, '').length;

        return { words, characters };
    } catch (error) {
        console.error('计算字数失败:', error);
        return { words: 0, characters: 0 };
    }
}