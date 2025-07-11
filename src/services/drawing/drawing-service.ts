"use server";

import { db } from "@/drizzle/db";
import { AIDTDrawing, AIDTDrawingTable } from "@/drizzle/schemas";
import { eq, sql } from "drizzle-orm";
import { uploadDrawingData, getDrawingData, deleteDrawingData } from "@/lib/minio";

// 创建新画图
export async function createDrawing(data: Omit<AIDTDrawing, "id" | "createdAt" | "updatedAt">): Promise<AIDTDrawing> {
    const [newDrawing] = await db
        .insert(AIDTDrawingTable)
        .values(data)
        .returning();

    if (newDrawing == null) throw new Error("创建画图失败");
    return newDrawing;
}

// 创建新画图（集成 MinIO）
export async function createDrawingWithMinio(data: Omit<AIDTDrawing, "id" | "createdAt" | "updatedAt">): Promise<AIDTDrawing> {
    // 创建画图，将数据同时存储到数据库和MinIO
    const [newDrawing] = await db
        .insert(AIDTDrawingTable)
        .values({
            ...data,
            // 确保数据库也有画图数据的副本
            data: data.data || []
        })
        .returning();

    if (newDrawing == null) throw new Error("创建画图失败");

    // 如果有画图数据，同时上传到 MinIO 作为备份
    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        try {
            await uploadDrawingData(newDrawing.id, data.data);
            // 更新 filepath 为 MinIO 路径
            if (!data.filepath) {
                await db
                    .update(AIDTDrawingTable)
                    .set({ filepath: `drawings/${newDrawing.id}.json` })
                    .where(eq(AIDTDrawingTable.id, newDrawing.id));
                newDrawing.filepath = `drawings/${newDrawing.id}.json`;
            }
            console.log(`✅ 画图数据已同步到数据库和MinIO: ${newDrawing.id}`);
        } catch (error) {
            console.warn("上传画图数据到 MinIO 失败，但数据库创建成功:", error);
            // MinIO 上传失败不回滚，因为数据库已有完整数据
        }
    }

    return newDrawing;
}

// 通过ID获取画图
export async function getDrawingById(id: string): Promise<AIDTDrawing | null> {
    const [drawing] = await db
        .select()
        .from(AIDTDrawingTable)
        .where(eq(AIDTDrawingTable.id, id));

    return drawing || null;
}

// 获取画图（包含 MinIO 数据）
export async function getDrawingWithMinioData(id: string): Promise<AIDTDrawing & { minioData?: any } | null> {
    const drawing = await getDrawingById(id);
    if (!drawing) return null;

    try {
        // 优先使用数据库中的数据，MinIO 作为备份
        if (drawing.data && Array.isArray(drawing.data) && drawing.data.length > 0) {
            console.log(`✅ 从数据库获取画图数据: ${id}`);
            return drawing;
        }

        // 如果数据库中没有数据，尝试从 MinIO 获取
        const minioData = await getDrawingData(`${id}.json`);
        if (minioData) {
            console.log(`✅ 从 MinIO 获取画图数据: ${id}`);
            return {
                ...drawing,
                data: minioData,
                minioData
            };
        }

        return drawing;
    } catch (error) {
        console.warn("从 MinIO 获取画图数据失败:", error);
        // 如果 MinIO 获取失败，返回数据库中的数据
        return drawing;
    }
}

// 获取用户的所有画图
export async function getDrawingsByUserId(userId: string): Promise<AIDTDrawing[]> {
    return db
        .select()
        .from(AIDTDrawingTable)
        .where(eq(AIDTDrawingTable.userId, userId));
}

// 更新画图信息
export async function updateDrawing(
    id: string,
    data: Partial<Omit<typeof AIDTDrawingTable.$inferInsert, "id" | "createdAt" | "updatedAt">>
): Promise<AIDTDrawing> {
    const [updatedDrawing] = await db
        .update(AIDTDrawingTable)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(AIDTDrawingTable.id, id))
        .returning();

    if (updatedDrawing == null) throw new Error("更新画图失败");
    return updatedDrawing;
}

// 更新画图（集成 MinIO）
export async function updateDrawingWithMinio(
    id: string,
    data: Partial<Omit<typeof AIDTDrawingTable.$inferInsert, "id" | "createdAt" | "updatedAt">>
): Promise<AIDTDrawing> {
    // 准备数据库更新数据
    const updateData = { ...data };
    const drawingData = updateData.data;
    
    // 将画图数据同时存储到数据库和MinIO以确保数据一致性
    const [updatedDrawing] = await db
        .update(AIDTDrawingTable)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(AIDTDrawingTable.id, id))
        .returning();

    if (updatedDrawing == null) throw new Error("更新画图失败");

    // 如果有画图数据，同时上传到 MinIO 作为备份
    if (drawingData) {
        try {
            await uploadDrawingData(id, drawingData);
            console.log(`✅ 画图数据已同步到数据库和MinIO: ${id}`);
        } catch (error) {
            console.warn("同步画图数据到 MinIO 失败，但数据库更新成功:", error);
            // MinIO 同步失败不影响主要功能，数据库已有完整数据
        }
    }

    return updatedDrawing;
}

// 删除画图
export async function deleteDrawing(id: string): Promise<AIDTDrawing> {
    const [deletedDrawing] = await db
        .delete(AIDTDrawingTable)
        .where(eq(AIDTDrawingTable.id, id))
        .returning();

    if (deletedDrawing == null) throw new Error("删除画图失败");
    return deletedDrawing;
}

// 获取画图列表（带分页）
export async function listDrawings(limit: number = 100, offset: number = 0): Promise<AIDTDrawing[]> {
    return db
        .select()
        .from(AIDTDrawingTable)
        .limit(limit)
        .offset(offset);
}

// 搜索画图 - 替代方案
export async function searchDrawings(query: string, userId?: string): Promise<AIDTDrawing[]> {
    const searchQuery = `%${query}%`;

    // 基本搜索条件
    const nameOrDescCondition = sql`${AIDTDrawingTable.name} ILIKE ${searchQuery} OR ${AIDTDrawingTable.desc} ILIKE ${searchQuery}`;

    // 构建条件
    let conditions = nameOrDescCondition;

    // 如果提供了userId，组合条件
    if (userId) {
        conditions = sql`(${nameOrDescCondition}) AND ${AIDTDrawingTable.userId} = ${userId}`;
    }

    // 执行查询
    return db
        .select()
        .from(AIDTDrawingTable)
        .where(conditions);
}