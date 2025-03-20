"use server";

import { db } from "@/drizzle/db";
import { AIDTDrawing, AIDTDrawingTable } from "@/drizzle/schema";
import { eq, sql } from "drizzle-orm";

// 创建新绘图
export async function createDrawing(data: Omit<AIDTDrawing, "id" | "createdAt" | "updatedAt">): Promise<AIDTDrawing> {
    const [newDrawing] = await db
        .insert(AIDTDrawingTable)
        .values(data)
        .returning();

    if (newDrawing == null) throw new Error("创建绘图失败");
    return newDrawing;
}

// 通过ID获取绘图
export async function getDrawingById(id: string): Promise<AIDTDrawing | null> {
    const [drawing] = await db
        .select()
        .from(AIDTDrawingTable)
        .where(eq(AIDTDrawingTable.id, id));

    return drawing || null;
}

// 获取用户的所有绘图
export async function getDrawingsByUserId(userId: string): Promise<AIDTDrawing[]> {
    return db
        .select()
        .from(AIDTDrawingTable)
        .where(eq(AIDTDrawingTable.userId, userId));
}

// 更新绘图信息
export async function updateDrawing(
    id: string,
    data: Partial<Omit<typeof AIDTDrawingTable.$inferInsert, "id" | "createdAt" | "updatedAt">>
): Promise<AIDTDrawing> {
    const [updatedDrawing] = await db
        .update(AIDTDrawingTable)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(AIDTDrawingTable.id, id))
        .returning();

    if (updatedDrawing == null) throw new Error("更新绘图失败");
    return updatedDrawing;
}

// 删除绘图
export async function deleteDrawing(id: string): Promise<AIDTDrawing> {
    const [deletedDrawing] = await db
        .delete(AIDTDrawingTable)
        .where(eq(AIDTDrawingTable.id, id))
        .returning();

    if (deletedDrawing == null) throw new Error("删除绘图失败");
    return deletedDrawing;
}

// 获取绘图列表（带分页）
export async function listDrawings(limit: number = 100, offset: number = 0): Promise<AIDTDrawing[]> {
    return db
        .select()
        .from(AIDTDrawingTable)
        .limit(limit)
        .offset(offset);
}

// 搜索绘图 - 替代方案
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