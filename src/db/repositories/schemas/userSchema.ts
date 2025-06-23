import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { userTable } from "../../postgres/schema/user";

// Insert Schema for creating a new user
export const insertUserSchema = createInsertSchema(userTable, {
  name: z.string().optional(), // Name is optional on creation
  email: z.string().email("Email inválido."),
  passwordHash: z.string().optional(), // Password hash is optional (e.g., for OAuth users)
  image: z.string().url("URL da imagem inválida.").optional(),
  emailVerified: z.coerce.date().optional(),
}).omit({
  id: true, // Handled by DB
  createdAt: true, // Handled by DB
  updatedAt: true, // Handled by DB
});
export type InsertUser = z.infer<typeof insertUserSchema>;

// Select Schema for retrieving user data
// By default, exclude passwordHash for security.
export const selectUserSchema = createSelectSchema(userTable, {
   emailVerified: z.coerce.date().nullable(), // ensure it can be null
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
  image: z.string().url("URL da imagem inválida.").nullable().optional(), // Allow setting image to null
});
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;

// Schema for updating user password
export const updateUserPasswordSchema = z.object({
  passwordHash: z.string().min(8, "Nova senha deve ter pelo menos 8 caracteres."), // Basic validation
});
export type UpdateUserPassword = z.infer<typeof updateUserPasswordSchema>;
