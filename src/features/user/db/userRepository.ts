import { dbType, db as defaultDb } from "@/db/postgres";
import { userTable } from "@/db/postgres/schema/user";
import {
  InsertUser,
  SelectUser,
  selectUserSchema,
  selectUserWithPasswordSchema,
  UpdateUserProfile
} from "../schemas/userSchema"; // Adjusted import path
import { eq, and } from "drizzle-orm";

export type DBConnection = dbType["db"];

export type UserRepositoryFactory = (dbInstance?: DBConnection) => {
  findById: (id: string) => Promise<SelectUser | null>;
  findByEmail: (email: string) => Promise<SelectUser | null>;
  findByEmailWithPassword: (email: string) => Promise<ReturnType<typeof selectUserWithPasswordSchema.parse> | null>;
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
      .select({
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
      .select({
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
      .select()
      .from(userTable)
      .where(eq(userTable.email, email))
      .limit(1);
    return result.length > 0 ? selectUserWithPasswordSchema.parse(result[0]) : null;
  };

  const updateProfile = async (id: string, data: UpdateUserProfile): Promise<SelectUser | null> => {
    const updateData: Partial<typeof userTable.$inferInsert> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.image !== undefined) updateData.image = data.image;

    if (Object.keys(updateData).length === 0) {
      return findById(id);
    }

    updateData.updatedAt = new Date();

    await db
      .update(userTable)
      .set(updateData)
      .where(eq(userTable.id, id));

    return findById(id);
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
