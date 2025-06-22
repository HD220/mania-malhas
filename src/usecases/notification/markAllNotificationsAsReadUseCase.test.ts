import { describe, it, expect, vi, beforeEach } from "vitest";
import markAllNotificationsAsReadUseCase, { MarkAllNotificationsAsReadInput } from "./markAllNotificationsAsReadUseCase";
import { NotificationRepositoryFactory } from "@/db/repositories/notificationRepository";
import { ZodError } from "zod";
import { faker } from "@faker-js/faker";

const mockNotificationRepository = {
  insert: vi.fn(),
  findById: vi.fn(),
  findByUserId: vi.fn(),
  countByUserId: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsReadForUser: vi.fn(),
};

const mockNotificationRepoFactory: NotificationRepositoryFactory = () => mockNotificationRepository;

const sampleUserId = faker.string.uuid();

describe("markAllNotificationsAsReadUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should call repository.markAllAsReadForUser with the correct userId", async () => {
    const input: MarkAllNotificationsAsReadInput = { userId: sampleUserId };
    mockNotificationRepository.markAllAsReadForUser.mockResolvedValueOnce(undefined);

    await markAllNotificationsAsReadUseCase(input, mockNotificationRepoFactory);

    expect(mockNotificationRepository.markAllAsReadForUser).toHaveBeenCalledWith(sampleUserId);
  });

  it("should throw ZodError for invalid userId", async () => {
    const input = { userId: "not-a-uuid" } as MarkAllNotificationsAsReadInput;
    await expect(markAllNotificationsAsReadUseCase(input, mockNotificationRepoFactory))
      .rejects.toThrow(ZodError);
    expect(mockNotificationRepository.markAllAsReadForUser).not.toHaveBeenCalled();
  });

  it("should propagate error from repository.markAllAsReadForUser if it occurs", async () => {
    const input: MarkAllNotificationsAsReadInput = { userId: sampleUserId };
    const dbError = new Error("DB markAllAsReadForUser error");
    mockNotificationRepository.markAllAsReadForUser.mockRejectedValueOnce(dbError);

    await expect(markAllNotificationsAsReadUseCase(input, mockNotificationRepoFactory))
      .rejects.toThrow(dbError);
    expect(mockNotificationRepository.markAllAsReadForUser).toHaveBeenCalledWith(sampleUserId);
  });
});
