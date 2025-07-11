import { pgTable, text, jsonb, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./schemaHelpers";

export const AIDTDrawingTable = pgTable("drawing", {
    // 基础信息
    id,
    name: text().notNull(),
    desc: text().notNull().default(""),
    // 绘图内容 - 存储SVG、Canvas数据或其他格式
    data: jsonb("data").$type<any[]>().notNull().default([]),
    // 创建者/所有者
    userId: text().notNull(),
    isFavorite: boolean().notNull().default(false),
    // 文件管理
    isDeleted: boolean().notNull().default(false),
    deletedAt: timestamp(),          // 删除时间（用于回收站功能）
    parentFolderId: text().notNull(),          // 所在文件夹ID，必须属于某个文件夹
    filepath: text(),                // 文件路径（用于文件管理功能）
    // 时间戳
    createdAt,
    updatedAt,
});

export type AIDTDrawing = typeof AIDTDrawingTable.$inferSelect;