import { pgTable, uuid, varchar, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";

// Optional: Define an enum for notification types if they are strictly predefined
export const notificationTypeEnum = pgEnum("notification_type_enum", [
  "info",
  "warning",
  "error",
  "new_transaction",
  "payment_due", // Example type
  "generic",     // Generic fallback
]);

export const notificationTable = pgTable("notification", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("userId").notNull(), // ID of the user this notification is for
  type: notificationTypeEnum("type").default("generic").notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  relatedEntityId: uuid("relatedEntityId"), // Optional: e.g., transactionId, productId
  relatedEntityType: varchar("relatedEntityType", { length: 50 }), // Optional: e.g., 'transaction', 'product'
  createdAt: timestamp("createdAt", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date", withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
});
