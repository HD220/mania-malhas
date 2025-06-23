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

/**
 * Factory function for creating a user repository instance.
 * This repository provides methods to interact with user data in the database,
 * including finding users, inserting new users, and updating user profiles and passwords.
 *
 * @param {DBConnection} [dbInstance] - Optional Drizzle database connection instance.
 *                                      If not provided, a default instance is used.
 * @returns {ReturnType<UserRepositoryFactory>} An object containing methods for user data operations.
 */
export const userRepository: UserRepositoryFactory = (dbInstance) => {
  const db = dbInstance || defaultDb;

  /**
   * Inserts a new user into the database.
   * @async
   * @function insert
   * @param {InsertUser} data - The user data to insert (should not include ID, createdAt, updatedAt).
   *                            Password should be pre-hashed.
   * @returns {Promise<{ id: string }>} The ID of the newly created user.
   */
  const insert = async (data: InsertUser): Promise<{ id: string }> => {
    const [newUser] = await db
      .insert(userTable)
      .values(data)
      .returning({ id: userTable.id });
    return newUser;
  };

  /**
   * Finds a user by their ID.
   * Excludes the `passwordHash` from the returned user object.
   * @async
   * @function findById
   * @param {string} id - The UUID of the user to find.
   * @returns {Promise<SelectUser | null>} The user object (without password hash) if found, otherwise null.
   *                                       The result is parsed by `selectUserSchema`.
   */
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

  /**
   * Finds a user by their email address.
   * Excludes the `passwordHash` from the returned user object.
   * Useful for checking if an email exists or retrieving profile data.
   * @async
   * @function findByEmail
   * @param {string} email - The email address of the user to find.
   * @returns {Promise<SelectUser | null>} The user object (without password hash) if found, otherwise null.
   *                                       The result is parsed by `selectUserSchema`.
   */
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

  /**
   * Finds a user by their email address and includes the `passwordHash`.
   * Primarily used for authentication purposes (e.g., during login to verify a password).
   * @async
   * @function findByEmailWithPassword
   * @param {string} email - The email address of the user to find.
   * @returns {Promise<ReturnType<typeof selectUserWithPasswordSchema.parse> | null>}
   *          The user object including the password hash if found, otherwise null.
   *          The result is parsed by `selectUserWithPasswordSchema`.
   */
  const findByEmailWithPassword = async (email: string): Promise<ReturnType<typeof selectUserWithPasswordSchema.parse> | null> => {
    const result = await db
      .select() // Select all columns including passwordHash
      .from(userTable)
      .where(eq(userTable.email, email))
      .limit(1);
    return result.length > 0 ? selectUserWithPasswordSchema.parse(result[0]) : null;
  };

  /**
   * Updates a user's profile information (name, email, image).
   * Only updates fields that are provided in the `data` object.
   * Manually sets the `updatedAt` timestamp.
   * @async
   * @function updateProfile
   * @param {string} id - The UUID of the user to update.
   * @param {UpdateUserProfile} data - An object containing the profile fields to update (name, email, image).
   * @returns {Promise<SelectUser | null>} The updated user object (without password hash) if successful, otherwise null.
   */
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

  /**
   * Updates a user's password hash.
   * Manually sets the `updatedAt` timestamp.
   * @async
   * @function updatePassword
   * @param {string} id - The UUID of the user whose password is to be updated.
   * @param {string} newPasswordHash - The new, pre-hashed password.
   * @returns {Promise<void>}
   */
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
