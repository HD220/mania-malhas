import { describe, it, expect, vi, beforeEach } from "vitest";
import { ListNotificationsForUserUseCase, ListNotificationsForUserInput } from "./list-notifications-for-user.usecase"; // Updated path
import { NotificationRepository } from "@/features/notification/db/notification-repository";
import { selectNotificationSchema, SelectNotification } from "@/features/notification/schemas/notification.schema"; // Updated path
import { notificationTypeEnum } from "@/features/notification/db/schema"; // Updated path
import { ZodError } from "zod";
import { faker } from "@faker-js/faker";

const mockNotificationRepository: NotificationRepository = {
  insert: vi.fn(),
  findById: vi.fn(),
  findByUserId: vi.fn(),
  countByUserId: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsReadForUser: vi.fn(),
};

const useCase = new ListNotificationsForUserUseCase(mockNotificationRepository);

const sampleUserId = faker.string.uuid();

const generateMockNotifications = (count: number): SelectNotification[] => {
  return Array.from({ length: count }, (_, i) =>
    selectNotificationSchema.parse({
      id: faker.string.uuid(),
      userId: sampleUserId,
      type: notificationTypeEnum.enumValues[i % notificationTypeEnum.enumValues.length],
      message: faker.lorem.sentence(),
      relatedEntityId: faker.string.uuid(),
      relatedEntityType: "test_entity",
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  );
};

describe("ListNotificationsForUserUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return paginated notifications for a user", async () => {
    const mockNotifications = generateMockNotifications(5);
    const totalCount = 15;
    const input: ListNotificationsForUserInput = { userId: sampleUserId, page: 2, pageSize: 5 };

    (mockNotificationRepository.findByUserId as vi.Mock).mockResolvedValueOnce(mockNotifications);
    (mockNotificationRepository.countByUserId as vi.Mock).mockResolvedValueOnce(totalCount);

    const result = await useCase.execute(input);

    expect(mockNotificationRepository.findByUserId).toHaveBeenCalledWith({
      userId: sampleUserId,
      limit: 5,
      offset: 5,
    });
    expect(mockNotificationRepository.countByUserId).toHaveBeenCalledWith(sampleUserId);
    expect(result.notifications).toEqual(mockNotifications);
    expect(result.totalCount).toBe(totalCount);
    expect(result.currentPage).toBe(2);
    expect(result.pageSize).toBe(5);
    expect(result.totalPages).toBe(Math.ceil(totalCount / input.pageSize!));
  });

  it("should use default pagination when page and pageSize are not provided", async () => {
    const mockNotifications = generateMockNotifications(10);
    const totalCount = 20;
    const input: ListNotificationsForUserInput = { userId: sampleUserId };

    (mockNotificationRepository.findByUserId as vi.Mock).mockResolvedValueOnce(mockNotifications);
    (mockNotificationRepository.countByUserId as vi.Mock).mockResolvedValueOnce(totalCount);

    const result = await useCase.execute(input);

    expect(mockNotificationRepository.findByUserId).toHaveBeenCalledWith({
      userId: sampleUserId,
      limit: 10,
      offset: 0,
    });
    expect(result.notifications).toEqual(mockNotifications);
    expect(result.totalCount).toBe(totalCount);
    expect(result.currentPage).toBe(1);
    expect(result.pageSize).toBe(10);
    expect(result.totalPages).toBe(Math.ceil(totalCount / 10));
  });

  it("should return empty array if no notifications are found", async () => {
    const totalCount = 0;
    const input: ListNotificationsForUserInput = { userId: sampleUserId };

    (mockNotificationRepository.findByUserId as vi.Mock).mockResolvedValueOnce([]);
    (mockNotificationRepository.countByUserId as vi.Mock).mockResolvedValueOnce(totalCount);

    const result = await useCase.execute(input);

    expect(result.notifications).toEqual([]);
    expect(result.totalCount).toBe(totalCount);
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(0);
  });

  it("should throw ZodError for invalid userId", async () => {
    const input = { userId: "not-a-uuid" } as any;
    await expect(useCase.execute(input)).rejects.toThrow(ZodError);
  });

  it("should throw ZodError for non-positive page", async () => {
    const input = { userId: sampleUserId, page: 0 };
    await expect(useCase.execute(input)).rejects.toThrow(ZodError);
  });

  it("should throw ZodError for non-positive pageSize", async () => {
    const input = { userId: sampleUserId, pageSize: 0 };
    await expect(useCase.execute(input)).rejects.toThrow(ZodError);
  });

  it("should throw ZodError for pageSize greater than max (100)", async () => {
    const input = { userId: sampleUserId, pageSize: 101 };
    await expect(useCase.execute(input)).rejects.toThrow(ZodError);
  });

  it("should propagate errors from notificationRepository.findByUserId", async () => {
    const input: ListNotificationsForUserInput = { userId: sampleUserId };
    (mockNotificationRepository.findByUserId as vi.Mock).mockRejectedValueOnce(new Error("DB find error"));
    (mockNotificationRepository.countByUserId as vi.Mock).mockResolvedValueOnce(0);

    await expect(useCase.execute(input)).rejects.toThrow("DB find error");
  });

  it("should propagate errors from notificationRepository.countByUserId", async () => {
    const input: ListNotificationsForUserInput = { userId: sampleUserId };
    (mockNotificationRepository.findByUserId as vi.Mock).mockResolvedValueOnce([]);
    (mockNotificationRepository.countByUserId as vi.Mock).mockRejectedValueOnce(new Error("DB count error"));

    await expect(useCase.execute(input)).rejects.toThrow("DB count error");
  });
});
