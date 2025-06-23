import { dbType, db as defaultDb } from "@/db/postgres";
import { notificationTable } from "@/db/postgres/schema/notification";
import { InsertNotification, SelectNotification } from "./schemas/notificationSchema";
import { eq, desc, and, count as drizzleCount } from "drizzle-orm"; // Renamed count to drizzleCount

/**
 * Type alias for the Drizzle database connection instance.
 * This can be used for dependency injection, particularly in testing.
 */
export type DBConnection = dbType["db"];

/**
 * Defines the interface for a notification repository.
 * This factory function returns an object with methods to interact with notification data.
 * @param {DBConnection} [dbInstance] - Optional Drizzle database instance. If not provided, a default instance is used.
 * @returns {object} An object containing methods for notification data manipulation.
 */
export type NotificationRepositoryFactory = (dbInstance?: DBConnection) => {
  /**
   * Inserts a new notification into the database.
   * @param {InsertNotification} data - The notification data to insert.
   * @returns {Promise<{ id: string }>} The ID of the newly created notification.
   */
  insert: (data: InsertNotification) => Promise<{ id: string }>;
  /**
   * Finds a notification by its ID.
   * @param {string} id - The ID of the notification to find.
   * @returns {Promise<SelectNotification | null>} The notification object if found, otherwise null.
   */
  findById: (id: string) => Promise<SelectNotification | null>;
  /**
   * Finds all notifications for a specific user, with optional pagination.
   * Notifications are ordered by creation date in descending order.
   * @param {string} userId - The ID of the user whose notifications are to be fetched.
   * @param {number} [limit=10] - The maximum number of notifications to return.
   * @param {number} [offset=0] - The number of notifications to skip (for pagination).
   * @returns {Promise<SelectNotification[]>} A list of notifications.
   */
  findByUserId: (
    userId: string,
    limit?: number,
    offset?: number
  ) => Promise<SelectNotification[]>;
  /**
   * Counts the number of notifications for a specific user.
   * Can optionally count only unread notifications.
   * @param {string} userId - The ID of the user.
   * @param {boolean} [onlyUnread=false] - If true, counts only unread notifications.
   * @returns {Promise<number>} The total count of notifications.
   */
  countByUserId: (userId: string, onlyUnread?: boolean) => Promise<number>;
  /**
   * Marks a specific notification as read for a given user.
   * Ensures that the notification belongs to the user before marking it as read.
   * @param {string} id - The ID of the notification to mark as read.
   * @param {string} userId - The ID of the user who owns the notification.
   * @returns {Promise<void>}
   */
  markAsRead: (id: string, userId: string) => Promise<void>;
  /**
   * Marks all notifications for a specific user as read.
   * @param {string} userId - The ID of the user whose notifications will be marked as read.
   * @returns {Promise<void>}
   */
  markAllAsReadForUser: (userId: string) => Promise<void>;
};

/**
 * Factory function that creates a notification repository.
 * This repository provides methods to interact with notification data in the database.
 * @param {DBConnection} [dbInstance] - An optional Drizzle database instance. If not provided, a default instance is used.
 * @returns {ReturnType<NotificationRepositoryFactory>} An object with methods for notification data operations.
 */
export const notificationRepository: NotificationRepositoryFactory = (dbInstance) => {
  const db = dbInstance || defaultDb;

  const insert = async (data: InsertNotification): Promise<{ id: string }> => {
    const [newNotification] = await db
      .insert(notificationTable)
      .values(data)
      .returning({ id: notificationTable.id });
    return newNotification;
  };

  const findById = async (id: string): Promise<SelectNotification | null> => {
    const result = await db
      .select()
      .from(notificationTable)
      .where(eq(notificationTable.id, id))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  };

  const findByUserId = async (
    userId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<SelectNotification[]> => {
    return await db
      .select()
      .from(notificationTable)
      .where(eq(notificationTable.userId, userId))
      .orderBy(desc(notificationTable.createdAt))
      .limit(limit)
      .offset(offset);
  };

  const countByUserId = async (userId: string, onlyUnread: boolean = false): Promise<number> => {
    let conditions = [eq(notificationTable.userId, userId)];
    if (onlyUnread) {
      conditions.push(eq(notificationTable.isRead, false));
    }

    const result = await db
      .select({ value: drizzleCount() }) // Use aliased drizzleCount
      .from(notificationTable)
      .where(and(...conditions));

    return result[0]?.value ?? 0;
  };

  const markAsRead = async (id: string, userId: string): Promise<void> => {
    // Ensure the notification belongs to the user attempting to mark it as read
    await db
      .update(notificationTable)
      .set({ isRead: true, updatedAt: new Date() }) // Assuming an updatedAt field exists or should be added
      .where(and(eq(notificationTable.id, id), eq(notificationTable.userId, userId)));
  };

  const markAllAsReadForUser = async (userId: string): Promise<void> => {
    await db
      .update(notificationTable)
      .set({ isRead: true, updatedAt: new Date() }) // Assuming an updatedAt field exists or should be added
      .where(eq(notificationTable.userId, userId));
  };

  return {
    insert,
    findById,
    findByUserId,
    countByUserId,
    markAsRead,
    markAllAsReadForUser,
  };
};
