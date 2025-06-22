import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { notificationTable, notificationTypeEnum } from "../../postgres/schema/notification"; // Assuming notificationTypeEnum is exported

// Insert Schema
export const insertNotificationSchema = createInsertSchema(notificationTable, {
  userId: z.string().uuid("ID do usuário inválido."),
  type: z.enum(notificationTypeEnum.enumValues, { // Use enum values for Zod schema
    errorMap: () => ({ message: "Tipo de notificação inválido." })
  }),
  message: z.string().min(1, "Mensagem é obrigatória."),
  relatedEntityId: z.string().uuid("ID da entidade relacionada inválido.").optional(),
  relatedEntityType: z.string().optional(), // Could also be an enum if types are fixed
  isRead: z.boolean().optional().default(false), // Default handled by DB but good for clarity
}).omit({
  id: true,
  createdAt: true,
});
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Select Schema
export const selectNotificationSchema = createSelectSchema(notificationTable, {
  // Ensure correct type coercion if necessary, though Drizzle-Zod handles most cases
  isRead: z.boolean(),
  type: z.enum(notificationTypeEnum.enumValues), // Ensure type consistency
});
export type SelectNotification = z.infer<typeof selectNotificationSchema>;
