import { pgTable, text, json, boolean, integer } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";

export const AIDTFileTable = pgTable("aidt_file", {
    id,
    name: text().notNull(),
    desc: text().notNull().default(""),
    data: json().notNull().default({}),
    fileUrl: text().notNull().default(""),
    userId: text().notNull(),
    // 新增字段
    tags: text().array().notNull().default([]), // 使用 .array() 方法
    isFavorite: boolean().notNull().default(false),
    sharingLevel: text().notNull().default("private"), // 'private', 'limited', 'public'
    collaborators: json().notNull().default([]), // 存储协作者信息的数组
    lastModifiedBy: text(), // 最后修改人ID
    revisionHistory: json().notNull().default([]), // 使用JSON数组存储修订历史记录
    wordCount: integer().notNull().default(0), // 文档字数统计
    charCount: integer().notNull().default(0), // 文档字符统计
    metadata: json().notNull().default({}), // 可扩展的元数据字段，可存储如主题首选项等信息
    isDeleted: boolean().notNull().default(false), // 软删除标记
    createdAt,
    updatedAt,
});

export type AIDTFile = typeof AIDTFileTable.$inferSelect;