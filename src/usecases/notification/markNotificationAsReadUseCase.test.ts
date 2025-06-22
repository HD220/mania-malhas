import { describe, it, expect, vi, beforeEach } from "vitest";
import markNotificationAsReadUseCase, { MarkNotificationAsReadInput } from "./markNotificationAsReadUseCase";
import { NotificationRepositoryFactory } from "@/db/repositories/notificationRepository";
import { SelectNotification } from "@/db/repositories/schemas/notificationSchema";
import { NotFoundError } from "@/lib/errors/domainErrors";
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
const sampleNotificationId = faker.string.uuid();

const sampleNotificationUnread: SelectNotification = {
  id: sampleNotificationId,
  userId: sampleUserId,
  type: "info",
  message: "Unread message",
  isRead: false,
  relatedEntityId: null, relatedEntityType: null, createdAt: new Date(), updatedAt: new Date(),
};

const sampleNotificationRead: SelectNotification = {
  ...sampleNotificationUnread,
  isRead: true,
};

const otherUserId = faker.string.uuid();

describe("markNotificationAsReadUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should mark an unread notification as read if it belongs to the user", async () => {
    const input: MarkNotificationAsReadInput = { notificationId: sampleNotificationId, userId: sampleUserId };
    mockNotificationRepository.findById.mockResolvedValueOnce(sampleNotificationUnread);
    mockNotificationRepository.markAsRead.mockResolvedValueOnce(undefined);

    await markNotificationAsReadUseCase(input, mockNotificationRepoFactory);

    expect(mockNotificationRepository.findById).toHaveBeenCalledWith(sampleNotificationId);
    expect(mockNotificationRepository.markAsRead).toHaveBeenCalledWith(sampleNotificationId, sampleUserId);
  });

  it("should not call markAsRead if the notification is already read", async () => {
    const input: MarkNotificationAsReadInput = { notificationId: sampleNotificationId, userId: sampleUserId };
    mockNotificationRepository.findById.mockResolvedValueOnce(sampleNotificationRead); // Already read

    await markNotificationAsReadUseCase(input, mockNotificationRepoFactory);

    expect(mockNotificationRepository.findById).toHaveBeenCalledWith(sampleNotificationId);
    expect(mockNotificationRepository.markAsRead).not.toHaveBeenCalled();
  });

  it("should throw NotFoundError if the notification does not exist", async () => {
    const input: MarkNotificationAsReadInput = { notificationId: sampleNotificationId, userId: sampleUserId };
    mockNotificationRepository.findById.mockResolvedValueOnce(null);

    await expect(markNotificationAsReadUseCase(input, mockNotificationRepoFactory))
      .rejects.toThrow(NotFoundError);
    expect(mockNotificationRepository.findById).toHaveBeenCalledWith(sampleNotificationId);
    expect(mockNotificationRepository.markAsRead).not.toHaveBeenCalled();
  });

  it("should throw an Error if the notification does not belong to the user", async () => {
    const input: MarkNotificationAsReadInput = { notificationId: sampleNotificationId, userId: otherUserId }; // Different user
    mockNotificationRepository.findById.mockResolvedValueOnce(sampleNotificationUnread); // Belongs to sampleUserId

    await expect(markNotificationAsReadUseCase(input, mockNotificationRepoFactory))
      .rejects.toThrow("Usuário não autorizado a marcar esta notificação como lida.");
    expect(mockNotificationRepository.findById).toHaveBeenCalledWith(sampleNotificationId);
    expect(mockNotificationRepository.markAsRead).not.toHaveBeenCalled();
  });

  it("should throw ZodError for invalid notificationId", async () => {
    const input = { notificationId: "not-uuid", userId: sampleUserId } as MarkNotificationAsReadInput;
    await expect(markNotificationAsReadUseCase(input, mockNotificationRepoFactory))
      .rejects.toThrow(ZodError);
  });

  it("should throw ZodError for invalid userId", async () => {
    const input = { notificationId: sampleNotificationId, userId: "not-uuid" } as MarkNotificationAsReadInput;
    await expect(markNotificationAsReadUseCase(input, mockNotificationRepoFactory))
      .rejects.toThrow(ZodError);
  });

  it("should propagate error from findById if it occurs", async () => {
    const input: MarkNotificationAsReadInput = { notificationId: sampleNotificationId, userId: sampleUserId };
    const dbError = new Error("DB findById error");
    mockNotificationRepository.findById.mockRejectedValueOnce(dbError);

    await expect(markNotificationAsReadUseCase(input, mockNotificationRepoFactory))
      .rejects.toThrow(dbError);
  });

  it("should propagate error from markAsRead if it occurs", async () => {
    const input: MarkNotificationAsReadInput = { notificationId: sampleNotificationId, userId: sampleUserId };
    const dbError = new Error("DB markAsRead error");
    mockNotificationRepository.findById.mockResolvedValueOnce(sampleNotificationUnread);
    mockNotificationRepository.markAsRead.mockRejectedValueOnce(dbError);

    await expect(markNotificationAsReadUseCase(input, mockNotificationRepoFactory))
      .rejects.toThrow(dbError);
  });
});
