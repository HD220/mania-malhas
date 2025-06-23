import { dbType, db as defaultDb } from "@/db/postgres";
import { userTable } from "@/db/postgres/schema/user";
import {
  InsertUser,
  SelectUser,
  selectUserSchema, // For parsing result of findById/findByEmail
  selectUserWithPasswordSchema, // For parsing result when password is included
  UpdateUserProfile
} from "./schemas/userSchema";
import { eq, and } from "drizzle-orm";

export type DBConnection = dbType["db"];

export type UserRepositoryFactory = (dbInstance?: DBConnection) => {
  findById: (id: string) => Promise<SelectUser | null>;
  findByEmail: (email: string) => Promise<SelectUser | null>; // Typically for login, might need password
  findByEmailWithPassword: (email: string) => Promise<ReturnType<typeof selectUserWithPasswordSchema.parse> | null>; // For auth checks
  insert: (data: InsertUser) => Promise<{ id: string }>;
  updateProfile: (id: string, data: UpdateUserProfile) => Promise<SelectUser | null>;
  updatePassword: (id: string, newPasswordHash: string) => Promise<void>;
};

export const userRepository: UserRepositoryFactory = (dbInstance) => {
  const db = dbInstance || defaultDb;

  const insert = async (data: InsertUser): Promise<{ id: string }> => {
    const [newUser] = await db
      .insert(userTable)
      .values(data)
      .returning({ id: userTable.id });
    return newUser;
  };

  const findById = async (id: string): Promise<SelectUser | null> => {
    const result = await db
      .select({ // Explicitly list columns to exclude passwordHash by default
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        emailVerified: userTable.emailVerified,
        image: userTable.image,
        createdAt: userTable.createdAt,
        updatedAt: userTable.updatedAt,
      })
      .from(userTable)
      .where(eq(userTable.id, id))
      .limit(1);
    return result.length > 0 ? selectUserSchema.parse(result[0]) : null;
  };

  const findByEmail = async (email: string): Promise<SelectUser | null> => {
    const result = await db
      .select({ // Exclude passwordHash
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        emailVerified: userTable.emailVerified,
        image: userTable.image,
        createdAt: userTable.createdAt,
        updatedAt: userTable.updatedAt,
      })
      .from(userTable)
      .where(eq(userTable.email, email))
      .limit(1);
    return result.length > 0 ? selectUserSchema.parse(result[0]) : null;
  };

  const findByEmailWithPassword = async (email: string): Promise<ReturnType<typeof selectUserWithPasswordSchema.parse> | null> => {
    const result = await db
      .select() // Select all columns including passwordHash
      .from(userTable)
      .where(eq(userTable.email, email))
      .limit(1);
    return result.length > 0 ? selectUserWithPasswordSchema.parse(result[0]) : null;
  };

  const updateProfile = async (id: string, data: UpdateUserProfile): Promise<SelectUser | null> => {
    // Filter out undefined values to only update provided fields
    const updateData: Partial<typeof userTable.$inferInsert> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.image !== undefined) updateData.image = data.image; // handles null for clearing image

    if (Object.keys(updateData).length === 0) {
      return findById(id); // No actual change, return current data
    }

    updateData.updatedAt = new Date(); // Manually set updatedAt

    await db
      .update(userTable)
      .set(updateData)
      .where(eq(userTable.id, id));

    return findById(id); // Return updated user data
  };

  const updatePassword = async (id: string, newPasswordHash: string): Promise<void> => {
    await db
      .update(userTable)
      .set({ passwordHash: newPasswordHash, updatedAt: new Date() })
      .where(eq(userTable.id, id));
  };

  return {
    insert,
    findById,
    findByEmail,
    findByEmailWithPassword,
    updateProfile,
    updatePassword,
  };
};
