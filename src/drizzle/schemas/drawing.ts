import { pgTable, text, jsonb, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./schemaHelpers";

export const AIDTDrawingTable = pgTable("drawing", {
    // 基础信息
    id,
    name: text().notNull(),
    desc: text().notNull().default(""),
    dataPath: text("data_path"), // R2中的数据路径（创建时可能为空） 
    version: integer("version").notNull().default(1), // 数据版本，用于缓存失效
    elementCount: integer("element_count").notNull().default(0), // 元素数量，用于展示
    fileCount: integer("file_count").notNull().default(0), // 文件数量，用于展示
    lastModified: timestamp("last_modified").notNull().defaultNow(), // 内容最后修改时间
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