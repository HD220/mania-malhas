import { describe, it, expect, vi, beforeEach } from "vitest";
import { notificationRepository, NotificationRepositoryFactory } from "./notification-repository"; // Adjust path as necessary
import { InsertNotification, SelectNotification } from "./schemas/notificationSchema";
import { notificationTable, notificationTypeEnum } from "@/db/postgres/schema/notification";
import { faker } from "@faker-js/faker";
import { DBConnection } from "./notification-repository"; // Assuming DBConnection is exported or use any/mock type

// Mock the Drizzle db instance and its methods
const mockDb = {
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  returning: vi.fn(),
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  offset: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  execute: vi.fn(), // For general execute, though specific methods like returning might be used
  get: vi.fn(), // For single row returns if applicable
};

// Cast mockDb to the expected DBConnection type to satisfy the repository factory
const mockDbInstance = mockDb as unknown as DBConnection;

let repo: ReturnType<NotificationRepositoryFactory>; // Declare repo

const sampleUserId = faker.string.uuid();
const sampleNotificationId = faker.string.uuid();

const sampleNotificationData: InsertNotification = {
  userId: sampleUserId,
  type: "info",
  message: "This is a test notification.",
  relatedEntityId: faker.string.uuid(),
  relatedEntityType: "test_entity",
  isRead: false, // Optional in insert, but good to test with
};

const sampleSelectNotification: SelectNotification = {
  id: sampleNotificationId,
  userId: sampleUserId,
  type: "info",
  message: "This is a test notification.",
  isRead: false,
  relatedEntityId: sampleNotificationData.relatedEntityId || null,
  relatedEntityType: sampleNotificationData.relatedEntityType || null,
  createdAt: new Date(),
  updatedAt: new Date(),
};


describe("notificationRepository", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();

    // Default behavior for chained methods to return `this` (the mockDb object)
    // This allows chaining like db.select().from().where()
    mockDb.insert.mockReturnThis();
    mockDb.values.mockReturnThis();
    mockDb.select.mockReturnThis();
    mockDb.from.mockReturnThis();
    mockDb.where.mockReturnThis();
    mockDb.orderBy.mockReturnThis();
    mockDb.limit.mockReturnThis();
    mockDb.offset.mockReturnThis();
    mockDb.update.mockReturnThis();
    mockDb.set.mockReturnThis();

    // Re-initialize repo with the freshly configured mockDb for each test context
    repo = notificationRepository(mockDbInstance);
    // Specific resolvers for terminal methods will be set in each test below
  });

  describe("insert", () => {
    it("should insert a notification and return its id", async () => {
      mockDb.returning.mockResolvedValueOnce([{ id: sampleNotificationId }]);
      const result = await repo.insert(sampleNotificationData);
      expect(mockDb.insert).toHaveBeenCalledWith(notificationTable);
      expect(mockDb.values).toHaveBeenCalledWith(sampleNotificationData);
      expect(mockDb.returning).toHaveBeenCalledWith({ id: notificationTable.id });
      expect(result).toEqual({ id: sampleNotificationId });
    });
  });

  describe("findById", () => {
    it("should return a notification if found", async () => {
      // The `limit` method is the end of the chain that's awaited
      mockDb.limit.mockResolvedValueOnce([sampleSelectNotification]);
      const result = await repo.findById(sampleNotificationId);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalledWith(notificationTable);
      // expect(mockDb.where).toHaveBeenCalledWith(eq(notificationTable.id, sampleNotificationId)); // Drizzle-orm specific matcher needed
      expect(mockDb.limit).toHaveBeenCalledWith(1);
      expect(result).toEqual(sampleSelectNotification);
    });

    it("should return null if notification not found", async () => {
      mockDb.limit.mockResolvedValueOnce([]);
      const result = await repo.findById("non-existent-id");
      expect(result).toBeNull();
    });
  });

  describe("findByUserId", () => {
    it("should return notifications for a user with limit, offset, and order", async () => {
      // `offset` is the terminal method in this chain
      mockDb.offset.mockResolvedValueOnce([sampleSelectNotification]);
      const limitVal = 5; // Renamed to avoid conflict with mockDb.limit
      const offsetVal = 10; // Renamed
      const results = await repo.findByUserId(sampleUserId, limitVal, offsetVal);

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalledWith(notificationTable);
      expect(mockDb.where).toHaveBeenCalled(); // More specific check is hard with current mock
      expect(mockDb.orderBy).toHaveBeenCalled(); // More specific check is hard
      expect(mockDb.limit).toHaveBeenCalledWith(limitVal);
      expect(mockDb.offset).toHaveBeenCalledWith(offsetVal);
      expect(results).toEqual([sampleSelectNotification]);
    });
  });

  describe("countByUserId", () => {
    it("should count all notifications for a user", async () => {
      // `where` is the terminal method here before await
      mockDb.where.mockResolvedValueOnce([{ value: 10 }]);
      const countResult = await repo.countByUserId(sampleUserId);
      expect(mockDb.select).toHaveBeenCalledWith({ value: expect.anything() }); // Check for drizzleCount()
      expect(mockDb.from).toHaveBeenCalledWith(notificationTable);
      expect(mockDb.where).toHaveBeenCalled(); // More specific check is hard
      expect(countResult).toBe(10);
    });

    it("should count only unread notifications for a user", async () => {
      mockDb.where.mockResolvedValueOnce([{ value: 5 }]);
      const countResult = await repo.countByUserId(sampleUserId, true);
      expect(mockDb.select).toHaveBeenCalledWith({ value: expect.anything() });
      expect(mockDb.from).toHaveBeenCalledWith(notificationTable);
      expect(mockDb.where).toHaveBeenCalled(); // More specific check is hard
      expect(countResult).toBe(5);
    });
  });

  describe("markAsRead", () => {
    it("should update notification to isRead: true for the given user and id", async () => {
      // `where` is the terminal method for the update chain before await
      mockDb.where.mockResolvedValueOnce(undefined);
      await repo.markAsRead(sampleNotificationId, sampleUserId);
      expect(mockDb.update).toHaveBeenCalledWith(notificationTable);
      expect(mockDb.set).toHaveBeenCalledWith({ isRead: true, updatedAt: expect.any(Date) });
      expect(mockDb.where).toHaveBeenCalled(); // More specific check is hard
    });
  });

  describe("markAllAsReadForUser", () => {
    it("should update all notifications for a user to isRead: true", async () => {
      mockDb.where.mockResolvedValueOnce(undefined);
      await repo.markAllAsReadForUser(sampleUserId);
      expect(mockDb.update).toHaveBeenCalledWith(notificationTable);
      expect(mockDb.set).toHaveBeenCalledWith({ isRead: true, updatedAt: expect.any(Date) });
      expect(mockDb.where).toHaveBeenCalled(); // More specific check is hard
    });
  });
});
