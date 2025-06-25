import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { notificationTable, notificationTypeEnum } from "@/db/postgres/schema/notification"; // Adjusted import path

// Insert Schema
export const insertNotificationSchema = createInsertSchema(notificationTable, {
  userId: z.string().uuid("ID do usuário inválido."),
  type: z.enum(notificationTypeEnum.enumValues, {
    errorMap: () => ({ message: "Tipo de notificação inválido." })
  }),
  message: z.string().min(1, "Mensagem é obrigatória."),
  relatedEntityId: z.string().uuid("ID da entidade relacionada inválido.").optional(),
  relatedEntityType: z.string().optional(),
  isRead: z.boolean().optional().default(false),
}).omit({
  id: true,
  createdAt: true,
});
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Select Schema
export const selectNotificationSchema = createSelectSchema(notificationTable, {
  isRead: z.boolean(),
  type: z.enum(notificationTypeEnum.enumValues),
});
export type SelectNotification = z.infer<typeof selectNotificationSchema>;
