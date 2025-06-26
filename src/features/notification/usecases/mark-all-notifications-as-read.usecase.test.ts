import { describe, it, expect, vi, beforeEach } from "vitest";
import { MarkAllNotificationsAsReadUseCase, MarkAllNotificationsAsReadInput, MarkAllNotificationsAsReadOutput } from "./mark-all-notifications-as-read.usecase"; // Updated path
import { NotificationRepository } from "@/features/notification/db/notification-repository";
import { ZodError } from "zod";
import { faker } from "@faker-js/faker";

const mockNotificationRepository: NotificationRepository = {
  insert: vi.fn(),
  findById: vi.fn(),
  findByUserId: vi.fn(),
  countByUserId: vi.fn(), // Added for the modified use case
  markAsRead: vi.fn(),
  markAllAsReadForUser: vi.fn(),
};

const useCase = new MarkAllNotificationsAsReadUseCase(mockNotificationRepository);
const sampleUserId = faker.string.uuid();

describe("MarkAllNotificationsAsReadUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const validInput: MarkAllNotificationsAsReadInput = {
    userId: sampleUserId,
  };

  it("should successfully mark all notifications as read and return the count of previously unread notifications", async () => {
    const expectedUnreadCount = 5;
    // Mock countByUserId to return the number of unread notifications
    (mockNotificationRepository.countByUserId as vi.Mock).mockResolvedValueOnce(expectedUnreadCount);
    // markAllAsReadForUser now returns void, so no specific mock value needed for its resolution unless testing error propagation
    (mockNotificationRepository.markAllAsReadForUser as vi.Mock).mockResolvedValueOnce(undefined);

    const result = await useCase.execute(validInput);

    expect(mockNotificationRepository.countByUserId).toHaveBeenCalledWith(sampleUserId, true); // true for onlyUnread
    expect(mockNotificationRepository.markAllAsReadForUser).toHaveBeenCalledWith(sampleUserId);
    expect(result.success).toBe(true);
    expect(result.markedCount).toBe(expectedUnreadCount);
  });

  it("should return markedCount as 0 if no notifications were unread", async () => {
    (mockNotificationRepository.countByUserId as vi.Mock).mockResolvedValueOnce(0); // No unread notifications
    (mockNotificationRepository.markAllAsReadForUser as vi.Mock).mockResolvedValueOnce(undefined);


    const result = await useCase.execute(validInput);

    expect(mockNotificationRepository.countByUserId).toHaveBeenCalledWith(sampleUserId, true);
    // markAllAsReadForUser should not be called if count is 0
    expect(mockNotificationRepository.markAllAsReadForUser).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.markedCount).toBe(0);
  });

  it("should throw ZodError for invalid userId", async () => {
    const invalidInput = { userId: "not-a-uuid" } as any;
    await expect(useCase.execute(invalidInput)).rejects.toThrow(ZodError);
  });

  it("should propagate errors from notificationRepository.countByUserId", async () => {
    (mockNotificationRepository.countByUserId as vi.Mock).mockRejectedValueOnce(new Error("DB count error"));
    await expect(useCase.execute(validInput)).rejects.toThrow("DB count error");
    expect(mockNotificationRepository.markAllAsReadForUser).not.toHaveBeenCalled();
  });

  it("should propagate errors from notificationRepository.markAllAsReadForUser if called", async () => {
    (mockNotificationRepository.countByUserId as vi.Mock).mockResolvedValueOnce(3); // Assume 3 unread
    (mockNotificationRepository.markAllAsReadForUser as vi.Mock).mockRejectedValueOnce(new Error("DB update error"));
    await expect(useCase.execute(validInput)).rejects.toThrow("DB update error");
  });
});
