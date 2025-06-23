import { describe, it, expect, vi, beforeEach } from "vitest";
import { MarkAllNotificationsAsReadUseCase, MarkAllNotificationsAsReadInput, MarkAllNotificationsAsReadOutput } from "./markAllNotificationsAsReadUseCase";
import { NotificationRepository } from "@/db/repositories/notificationRepository";
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

const useCase = new MarkAllNotificationsAsReadUseCase(mockNotificationRepository);
const sampleUserId = faker.string.uuid();

describe("MarkAllNotificationsAsReadUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const validInput: MarkAllNotificationsAsReadInput = {
    userId: sampleUserId,
  };

  it("should successfully mark all notifications as read and return the count", async () => {
    const expectedMarkedCount = 5;
    (mockNotificationRepository.markAllAsReadForUser as vi.Mock).mockResolvedValueOnce({ count: expectedMarkedCount });

    const result = await useCase.execute(validInput);

    expect(mockNotificationRepository.markAllAsReadForUser).toHaveBeenCalledWith(sampleUserId);
    expect(result.success).toBe(true);
    expect(result.markedCount).toBe(expectedMarkedCount);
  });

  it("should return markedCount as 0 if no notifications were updated", async () => {
    (mockNotificationRepository.markAllAsReadForUser as vi.Mock).mockResolvedValueOnce({ count: 0 });

    const result = await useCase.execute(validInput);

    expect(mockNotificationRepository.markAllAsReadForUser).toHaveBeenCalledWith(sampleUserId);
    expect(result.success).toBe(true);
    expect(result.markedCount).toBe(0);
  });

  it("should throw ZodError for invalid userId", async () => {
    const invalidInput = { userId: "not-a-uuid" };
     // @ts-expect-error testing invalid type
    await expect(useCase.execute(invalidInput)).rejects.toThrow(ZodError);
  });

  it("should propagate errors from notificationRepository.markAllAsReadForUser", async () => {
    (mockNotificationRepository.markAllAsReadForUser as vi.Mock).mockRejectedValueOnce(new Error("DB update error"));
    await expect(useCase.execute(validInput)).rejects.toThrow("DB update error");
  });
});
