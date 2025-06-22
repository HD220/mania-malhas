import { dbType, db as defaultDb } from "@/db/postgres";
import { notificationTable } from "@/db/postgres/schema/notification";
import { InsertNotification, SelectNotification } from "./schemas/notificationSchema";
import { eq, desc, and, count as drizzleCount } from "drizzle-orm"; // Renamed count to drizzleCount

export type DBConnection = dbType["db"];

export type NotificationRepositoryFactory = (dbInstance?: DBConnection) => {
  insert: (data: InsertNotification) => Promise<{ id: string }>;
  findById: (id: string) => Promise<SelectNotification | null>;
  findByUserId: (
    userId: string,
    limit?: number,
    offset?: number
  ) => Promise<SelectNotification[]>;
  countByUserId: (userId: string, onlyUnread?: boolean) => Promise<number>;
  markAsRead: (id: string, userId: string) => Promise<void>; // userId to ensure ownership
  markAllAsReadForUser: (userId: string) => Promise<void>;
};

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
