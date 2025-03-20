import { pgTable, text, jsonb } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "../schemaHelpers";

export const AIDTDrawingTable = pgTable("aidt_drawing", {
    id,
    name: text().notNull(),
    desc: text().notNull().default(""),
    data: jsonb("data").$type<any[]>().notNull().default([]),
    fileUrl: text().notNull().default(""),
    userId: text().notNull(),
    createdAt,
    updatedAt,
});

export type AIDTDrawing = typeof AIDTDrawingTable.$inferSelect;