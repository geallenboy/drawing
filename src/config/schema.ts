import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const Users = pgTable('users', {
    id: serial('id').primaryKey(),
    userName: varchar('userName'),
    userEmail: varchar('userEmail'),
    userImage: varchar('userImage'),
    credit: integer('credits').default(3)
})