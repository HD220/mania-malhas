import { describe, it, expect, vi, beforeEach } from "vitest";
import createNotificationUseCase, { CreateNotificationInput } from "./createNotificationUseCase";
import { NotificationRepositoryFactory } from "@/db/repositories/notificationRepository";
import { InsertNotification, SelectNotification } from "@/db/repositories/schemas/notificationSchema";
import { ZodError } from "zod";
import { faker } from "@faker-js/faker";

const mockNotificationRepository = {
  insert: vi.fn(),
  findById: vi.fn(),
  // Add other methods if your factory/interface expects them
  findByUserId: vi.fn(),
  countByUserId: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsReadForUser: vi.fn(),
};

const mockNotificationRepoFactory: NotificationRepositoryFactory = () => mockNotificationRepository;

const sampleUserId = faker.string.uuid();
const sampleNotificationId = faker.string.uuid();

const validNotificationInput: CreateNotificationInput = {
  userId: sampleUserId,
  type: "new_transaction",
  message: "Nova transação criada",
  relatedEntityId: faker.string.uuid(),
  relatedEntityType: "transaction",
};

const sampleCreatedNotification: SelectNotification = {
  id: sampleNotificationId,
  ...validNotificationInput,
  isRead: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("createNotificationUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should create a notification successfully and return the full notification object", async () => {
    mockNotificationRepository.insert.mockResolvedValueOnce({ id: sampleNotificationId });
    mockNotificationRepository.findById.mockResolvedValueOnce(sampleCreatedNotification);

    const result = await createNotificationUseCase(validNotificationInput, mockNotificationRepoFactory);

    expect(mockNotificationRepository.insert).toHaveBeenCalledWith(validNotificationInput);
    expect(mockNotificationRepository.findById).toHaveBeenCalledWith(sampleNotificationId);
    expect(result).toEqual(sampleCreatedNotification);
  });

  it("should throw ZodError if input data is invalid (e.g., missing userId)", async () => {
    const invalidInput = { ...validNotificationInput, userId: "not-a-uuid" } as CreateNotificationInput;
    // ZodError will be thrown by insertNotificationSchema.parse inside the use case
    await expect(
      createNotificationUseCase(invalidInput, mockNotificationRepoFactory)
    ).rejects.toThrow(ZodError);
    expect(mockNotificationRepository.insert).not.toHaveBeenCalled();
  });

  it("should throw ZodError if message is empty", async () => {
    const invalidInput = { ...validNotificationInput, message: "" } as CreateNotificationInput;
    await expect(
      createNotificationUseCase(invalidInput, mockNotificationRepoFactory)
    ).rejects.toThrow(ZodError);
  });


  it("should throw an error if repository.insert fails", async () => {
    const dbError = new Error("Database insert failed");
    mockNotificationRepository.insert.mockRejectedValueOnce(dbError);

    await expect(
      createNotificationUseCase(validNotificationInput, mockNotificationRepoFactory)
    ).rejects.toThrow(dbError);
    expect(mockNotificationRepository.insert).toHaveBeenCalledWith(validNotificationInput);
    expect(mockNotificationRepository.findById).not.toHaveBeenCalled();
  });

  it("should throw an error if repository.findById fails after insert", async () => {
    const findError = new Error("Database findById failed");
    mockNotificationRepository.insert.mockResolvedValueOnce({ id: sampleNotificationId });
    mockNotificationRepository.findById.mockRejectedValueOnce(findError);

    await expect(
      createNotificationUseCase(validNotificationInput, mockNotificationRepoFactory)
    ).rejects.toThrow(findError);
    expect(mockNotificationRepository.insert).toHaveBeenCalledWith(validNotificationInput);
    expect(mockNotificationRepository.findById).toHaveBeenCalledWith(sampleNotificationId);
  });

  it("should throw an error if findById returns null after insert (should not happen)", async () => {
    mockNotificationRepository.insert.mockResolvedValueOnce({ id: sampleNotificationId });
    mockNotificationRepository.findById.mockResolvedValueOnce(null); // Simulate unexpected null

    await expect(
      createNotificationUseCase(validNotificationInput, mockNotificationRepoFactory)
    ).rejects.toThrow("Falha ao recuperar a notificação criada após a inserção.");
  });
});
