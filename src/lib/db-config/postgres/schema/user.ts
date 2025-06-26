import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const userTable = pgTable("user", { // Changed from "users" to "user" for consistency with other singular table names
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }), // Nullable
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date", withTimezone: true }), // Nullable
  passwordHash: text("passwordHash"), // Nullable, for users with password login
  image: text("image"), // Nullable, for profile picture URL
  createdAt: timestamp("createdAt", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date", withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
});
