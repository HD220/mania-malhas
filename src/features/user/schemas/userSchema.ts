import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { userTable } from "@/db/postgres/schema/user"; // Adjusted import path

// Insert Schema for creating a new user
export const insertUserSchema = createInsertSchema(userTable, {
  name: z.string().optional(),
  email: z.string().email("Email inválido."),
  passwordHash: z.string().optional(),
  image: z.string().url("URL da imagem inválida.").optional(),
  emailVerified: z.coerce.date().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;

// Select Schema for retrieving user data
export const selectUserSchema = createSelectSchema(userTable, {
   emailVerified: z.coerce.date().nullable(),
}).omit({
  passwordHash: true,
});
export type SelectUser = z.infer<typeof selectUserSchema>;

// Schema for selecting user data including passwordHash (for internal auth checks)
export const selectUserWithPasswordSchema = createSelectSchema(userTable, {
  emailVerified: z.coerce.date().nullable(),
});
export type SelectUserWithPassword = z.infer<typeof selectUserWithPasswordSchema>;


// Schema for updating user profile data (name, email, image)
export const updateUserProfileSchema = z.object({
  name: z.string().min(1, "Nome não pode ser vazio.").optional(),
  email: z.string().email("Email inválido.").optional(),
  image: z.string().url("URL da imagem inválida.").nullable().optional(),
});
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;

// Schema for updating user password
export const updateUserPasswordSchema = z.object({
  passwordHash: z.string().min(8, "Nova senha deve ter pelo menos 8 caracteres."),
});
export type UpdateUserPassword = z.infer<typeof updateUserPasswordSchema>;
