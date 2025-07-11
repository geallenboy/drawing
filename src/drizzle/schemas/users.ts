import { 
  pgTable, 
  text, 
  timestamp, 
} from 'drizzle-orm/pg-core';


// --- 1. 用户表 (Users) ---
// 职责: 认证与资料层，代表所有能登录您平台的用户。
// 与 Clerk 同步，并存储应用专属的用户资料。
export const users = pgTable('users', {
  id: text('id').primaryKey(), 
  email: text('email').notNull().unique(), // 从 Clerk 同步
  fullName: text('full_name'),           // 从 Clerk 同步
  avatarUrl: text('avatar_url'),         // 从 Clerk 同步
  // -- 以下是您应用专属的、与认证无关的字段 --
  bio: text('bio'), // 用户自己填写的简介
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 导出用户类型
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;




