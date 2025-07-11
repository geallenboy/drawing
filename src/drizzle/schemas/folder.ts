import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./schemaHelpers";

export const AIDTFolderTable = pgTable("folder", {
    // 基础信息
    id,
    name: text().notNull(),
    desc: text().notNull().default(""),
    // 创建者/所有者
    userId: text().notNull(),
    // 文件夹层级管理
    parentFolderId: text(),          // 父文件夹ID，null表示根文件夹
    // 文件管理
    isDeleted: boolean().notNull().default(false),
    deletedAt: timestamp(),          // 删除时间（用于回收站功能）
    // MinIO路径
    filepath: text(),                // MinIO中的文件夹路径
    // 时间戳
    createdAt,
    updatedAt,
});

export type AIDTFolder = typeof AIDTFolderTable.$inferSelect;
