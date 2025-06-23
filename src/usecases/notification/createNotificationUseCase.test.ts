import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateNotificationUseCase, createNotificationInputSchema, CreateNotificationInput } from "./createNotificationUseCase";
import { NotificationRepository } from "@/db/repositories/notificationRepository";
import { selectNotificationSchema, SelectNotification, notificationTypeEnum } from "@/db/repositories/schemas/notificationSchema";
import { ZodError } from "zod";
import { DomainError } from "@/lib/errors/domainErrors";
import { faker } from "@faker-js/faker";

const mockNotificationRepository: NotificationRepository = {
  insert: vi.fn(),
  findById: vi.fn(),
  findByUserId: vi.fn(),
  countByUserId: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsReadForUser: vi.fn(),
};

const useCase = new CreateNotificationUseCase(mockNotificationRepository);

const sampleUserId = faker.string.uuid();
const sampleNotificationId = faker.string.uuid();
const sampleRelatedEntityId = faker.string.uuid();

const validCreateInput: CreateNotificationInput = {
  userId: sampleUserId,
  type: "new_transaction", // Valid type from the enum
  message: "Nova transação X criada.",
  relatedEntityId: sampleRelatedEntityId,
  relatedEntityType: "transaction",
};

const createdNotification: SelectNotification = selectNotificationSchema.parse({
    id: sampleNotificationId,
    userId: sampleUserId,
    type: validCreateInput.type,
    message: validCreateInput.message,
    relatedEntityId: validCreateInput.relatedEntityId,
    relatedEntityType: validCreateInput.relatedEntityType,
    isRead: false,
    createdAt: new Date(),
    updatedAt: new Date(),
});


describe("CreateNotificationUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should successfully create a notification", async () => {
    (mockNotificationRepository.insert as vi.Mock).mockResolvedValueOnce({ id: sampleNotificationId });
    (mockNotificationRepository.findById as vi.Mock).mockResolvedValueOnce(createdNotification);

    const result = await useCase.execute(validCreateInput);

    expect(mockNotificationRepository.insert).toHaveBeenCalledWith(validCreateInput);
    expect(mockNotificationRepository.findById).toHaveBeenCalledWith(sampleNotificationId);
    expect(result).toEqual(createdNotification);
  });

  it("should successfully create a notification with optional fields undefined", async () => {
    const inputWithoutOptional: CreateNotificationInput = {
        userId: sampleUserId,
        type: "generic",
        message: "Mensagem genérica."
        // relatedEntityId and relatedEntityType are optional in schema and input type now
    };
    const correspondingNotificationRecord: SelectNotification = selectNotificationSchema.parse({
        ...createdNotification, // base
        type: inputWithoutOptional.type,
        message: inputWithoutOptional.message,
        relatedEntityId: null, // How DB stores undefined optional UUIDs
        relatedEntityType: null, // How DB stores undefined optional strings
    });

    (mockNotificationRepository.insert as vi.Mock).mockResolvedValueOnce({ id: sampleNotificationId });
    (mockNotificationRepository.findById as vi.Mock).mockResolvedValueOnce(correspondingNotificationRecord);

    const result = await useCase.execute(inputWithoutOptional);
    expect(mockNotificationRepository.insert).toHaveBeenCalledWith(inputWithoutOptional);
    expect(result.relatedEntityId).toBeNull();
    expect(result.relatedEntityType).toBeNull();
  });


  it("should throw ZodError for invalid input - missing userId", async () => {
    const invalidInput = { ...validCreateInput, userId: "not-a-uuid" };
    // @ts-expect-error testing invalid type
    await expect(useCase.execute(invalidInput)).rejects.toThrow(ZodError);
  });

  it("should throw ZodError for invalid input - invalid type", async () => {
    const invalidInput = { ...validCreateInput, type: "invalid_type_enum" };
    // @ts-expect-error testing invalid type
    await expect(useCase.execute(invalidInput)).rejects.toThrow(ZodError);
  });

  it("should throw ZodError for invalid input - missing message", async () => {
    const invalidInput = { ...validCreateInput, message: "" };
    await expect(useCase.execute(invalidInput)).rejects.toThrow(ZodError);
  });

  it("should throw ZodError for invalid input - invalid relatedEntityId (if provided)", async () => {
    const invalidInput = { ...validCreateInput, relatedEntityId: "not-a-uuid" };
    await expect(useCase.execute(invalidInput)).rejects.toThrow(ZodError);
  });


  it("should throw an error if notificationRepository.insert fails", async () => {
    (mockNotificationRepository.insert as vi.Mock).mockRejectedValueOnce(new Error("DB insert error"));
    await expect(useCase.execute(validCreateInput)).rejects.toThrow("DB insert error");
  });

  it("should throw DomainError if notification is not found after insert", async () => {
    (mockNotificationRepository.insert as vi.Mock).mockResolvedValueOnce({ id: sampleNotificationId });
    (mockNotificationRepository.findById as vi.Mock).mockResolvedValueOnce(null);

    const execution = useCase.execute(validCreateInput);
    await expect(execution).rejects.toThrow(DomainError);
    await expect(execution).rejects.toThrow("Failed to retrieve notification immediately after creation.");
  });
});
