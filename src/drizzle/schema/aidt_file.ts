import { pgTable, text, json, boolean, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";

export const AIDTFileTable = pgTable("aidt_file", {
    id,
    name: text().notNull(),
    desc: text().notNull().default(""),
    data: json().notNull().default({}),
    fileUrl: text().notNull().default(""),
    userId: text().notNull(),
    isFavorite: boolean().notNull().default(false),
    // 历史记录相关
    lastModifiedBy: text(), // 最后修改人ID
    revisionHistory: jsonb().notNull().default([]), // [{version, timestamp, userId, summary, snapshot}]
    snapshotFrequency: text().notNull().default("hourly"), // 'manual', 'hourly', 'daily'
    maxHistoryItems: integer().notNull().default(50), // 保留的最大历史记录数

    // 文件管理
    isDeleted: boolean().notNull().default(false),
    deletedAt: timestamp(), // 删除时间用于回收站功能
    parentFolderId: text(), // 文件所在文件夹ID
    version: integer().notNull().default(1), // 文档版本号
    // 时间戳
    createdAt,
    updatedAt,
});

// 为文档历史记录创建单独的表
export const AIDTFileHistoryTable = pgTable("aidt_file_history", {
    id,
    fileId: text().notNull(), // 关联到原始文件
    version: integer().notNull(), // 版本号
    data: json().notNull(), // 这个版本的完整文档内容
    userId: text().notNull(), // 创建这个版本的用户ID
    createdAt: timestamp().notNull().defaultNow(),
    changeDescription: text().default(""), // 版本描述/变更说明
    wordCount: integer().notNull().default(0),
    charCount: integer().notNull().default(0),
    isAutosave: boolean().notNull().default(true), // 是自动保存还是手动创建的版本
});



export type AIDTFile = typeof AIDTFileTable.$inferSelect;
export type AIDTFileHistory = typeof AIDTFileHistoryTable.$inferSelect;
