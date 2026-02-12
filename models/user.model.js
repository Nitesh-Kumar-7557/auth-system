import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid().defaultRandom().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: text().notNull(),
  salt: text().notNull(),
});

export const userSessions = pgTable("userSessions",{
  id: uuid().defaultRandom().primaryKey(),
  userId: uuid().references(()=> usersTable.id).notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow()
})