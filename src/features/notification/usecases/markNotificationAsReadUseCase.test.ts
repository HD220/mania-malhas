import { describe, it, expect, vi, beforeEach } from "vitest";
import { MarkNotificationAsReadUseCase, MarkNotificationAsReadInput } from "./markNotificationAsReadUseCase";
import { NotificationRepository } from "@/features/notification/db/notificationRepository";
import { selectNotificationSchema, SelectNotification } from "@/features/notification/schemas/notificationSchema";
import { notificationTypeEnum as actualEnumValues } from "@/db/postgres/schema/notification";
import { ZodError } from "zod";
import { NotFoundError, ForbiddenError } from "@/lib/errors/domainErrors";
import { faker } from "@faker-js/faker";

const mockNotificationRepository: NotificationRepository = {
  insert: vi.fn(),
  findById: vi.fn(),
  findByUserId: vi.fn(),
  countByUserId: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsReadForUser: vi.fn(),
};

const useCase = new MarkNotificationAsReadUseCase(mockNotificationRepository);

const sampleUserId = faker.string.uuid();
const anotherUserId = faker.string.uuid();
const sampleNotificationId = faker.string.uuid();

const createMockNotification = (isRead: boolean, userId = sampleUserId, notificationId = sampleNotificationId): SelectNotification => {
  return selectNotificationSchema.parse({
    id: notificationId,
    userId: userId,
    type: actualEnumValues.enumValues[0],
    message: "Test message",
    relatedEntityId: null,
    relatedEntityType: null,
    isRead: isRead,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};

describe("MarkNotificationAsReadUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const validInput: MarkNotificationAsReadInput = {
    notificationId: sampleNotificationId,
    userId: sampleUserId,
  };

  it("should successfully mark an unread notification as read and return the updated notification", async () => {
    const unreadNotification = createMockNotification(false);
    const readNotification = selectNotificationSchema.parse({ ...unreadNotification, isRead: true, updatedAt: new Date(Date.now() + 1000) }); // Simulate updatedAt change

    (mockNotificationRepository.findById as vi.Mock)
      .mockResolvedValueOnce(unreadNotification) // First call in use case
      .mockResolvedValueOnce(readNotification);   // Second call after markAsRead
    (mockNotificationRepository.markAsRead as vi.Mock).mockResolvedValueOnce(undefined); // Repo markAsRead returns void

    const result = await useCase.execute(validInput);

    expect(mockNotificationRepository.findById).toHaveBeenCalledWith(sampleNotificationId);
    expect(mockNotificationRepository.markAsRead).toHaveBeenCalledWith(sampleNotificationId, sampleUserId); // Ensure userId is passed
    expect(result).toEqual(readNotification);
    expect(result.isRead).toBe(true);
  });

  it("should return the notification without calling markAsRead if already read", async () => {
    const alreadyReadNotification = createMockNotification(true);
    (mockNotificationRepository.findById as vi.Mock).mockResolvedValueOnce(alreadyReadNotification);

    const result = await useCase.execute(validInput);

    expect(mockNotificationRepository.findById).toHaveBeenCalledWith(sampleNotificationId);
    expect(mockNotificationRepository.markAsRead).not.toHaveBeenCalled();
    expect(result).toEqual(alreadyReadNotification);
    expect(result.isRead).toBe(true);
  });

  it("should throw NotFoundError if notification does not exist", async () => {
    (mockNotificationRepository.findById as vi.Mock).mockResolvedValueOnce(null);

    const execution = useCase.execute(validInput);
    await expect(execution).rejects.toThrow(NotFoundError);
    await expect(execution).rejects.toThrow("Notificação não encontrada.");
  });

  it("should throw ForbiddenError if user tries to mark another user's notification as read", async () => {
    const notificationOfAnotherUser = createMockNotification(false, anotherUserId);
    (mockNotificationRepository.findById as vi.Mock).mockResolvedValueOnce(notificationOfAnotherUser);

    const execution = useCase.execute(validInput);
    await expect(execution).rejects.toThrow(ForbiddenError);
    await expect(execution).rejects.toThrow("Você não tem permissão para marcar esta notificação como lida.");
    expect(mockNotificationRepository.markAsRead).not.toHaveBeenCalled();
  });

  it("should throw ZodError for invalid notificationId", async () => {
    const invalidInput = { ...validInput, notificationId: "not-a-uuid" };
    await expect(useCase.execute(invalidInput)).rejects.toThrow(ZodError);
  });

  it("should throw ZodError for invalid userId", async () => {
    const invalidInput = { ...validInput, userId: "not-a-uuid" };
    await expect(useCase.execute(invalidInput)).rejects.toThrow(ZodError);
  });

  it("should propagate errors from notificationRepository.findById if it's not a 'not found' scenario", async () => {
    (mockNotificationRepository.findById as vi.Mock).mockRejectedValueOnce(new Error("DB findById error"));
    await expect(useCase.execute(validInput)).rejects.toThrow("DB findById error");
  });

  it("should propagate errors from notificationRepository.markAsRead", async () => {
    const unreadNotification = createMockNotification(false);
    (mockNotificationRepository.findById as vi.Mock).mockResolvedValueOnce(unreadNotification);
    (mockNotificationRepository.markAsRead as vi.Mock).mockRejectedValueOnce(new Error("DB markAsRead error"));

    await expect(useCase.execute(validInput)).rejects.toThrow("DB markAsRead error");
  });
});
