import { describe, it, expect, vi, beforeEach } from "vitest";
import listNotificationsForUserUseCase, { ListNotificationsInput, PaginatedNotificationsResult } from "./listNotificationsForUserUseCase";
import { NotificationRepositoryFactory } from "@/db/repositories/notificationRepository";
import { SelectNotification } from "@/db/repositories/schemas/notificationSchema";
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
const sampleNotifications: SelectNotification[] = [
  {
    id: faker.string.uuid(), userId: sampleUserId, type: "info", message: "Msg 1", isRead: false,
    relatedEntityId: null, relatedEntityType: null, createdAt: new Date(), updatedAt: new Date()
  },
  {
    id: faker.string.uuid(), userId: sampleUserId, type: "warning", message: "Msg 2", isRead: true,
    relatedEntityId: null, relatedEntityType: null, createdAt: new Date(), updatedAt: new Date()
  },
];

describe("listNotificationsForUserUseCase", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return paginated notifications, totalItems, totalUnread, and pagination details", async () => {
    const input: ListNotificationsInput = { userId: sampleUserId, page: 1, pageSize: 5 };
    mockNotificationRepository.findByUserId.mockResolvedValueOnce(sampleNotifications);
    mockNotificationRepository.countByUserId
      .mockResolvedValueOnce(10) // totalItems for this user
      .mockResolvedValueOnce(3);  // totalUnread for this user

    const result = await listNotificationsForUserUseCase(input, mockNotificationRepoFactory);

    expect(mockNotificationRepository.findByUserId).toHaveBeenCalledWith(sampleUserId, 5, 0);
    expect(mockNotificationRepository.countByUserId).toHaveBeenCalledWith(sampleUserId);
    expect(mockNotificationRepository.countByUserId).toHaveBeenCalledWith(sampleUserId, true);

    expect(result.data).toEqual(sampleNotifications);
    expect(result.totalItems).toBe(10);
    expect(result.totalUnread).toBe(3);
    expect(result.totalPages).toBe(2); // 10 items / 5 per page
    expect(result.currentPage).toBe(1);
    expect(result.pageSize).toBe(5);
  });

  it("should use default pagination values if not provided", async () => {
    const input: ListNotificationsInput = { userId: sampleUserId }; // page and pageSize omitted
    mockNotificationRepository.findByUserId.mockResolvedValueOnce([]);
    mockNotificationRepository.countByUserId.mockResolvedValueOnce(0).mockResolvedValueOnce(0);


    await listNotificationsForUserUseCase(input, mockNotificationRepoFactory);

    // Defaults: page=1, pageSize=10. Offset = (1-1)*10 = 0
    expect(mockNotificationRepository.findByUserId).toHaveBeenCalledWith(sampleUserId, 10, 0);
  });

  it("should correctly calculate offset for different pages", async () => {
    const input: ListNotificationsInput = { userId: sampleUserId, page: 3, pageSize: 7 };
    mockNotificationRepository.findByUserId.mockResolvedValueOnce([]);
    mockNotificationRepository.countByUserId.mockResolvedValueOnce(0).mockResolvedValueOnce(0);

    await listNotificationsForUserUseCase(input, mockNotificationRepoFactory);
    // Offset = (3-1)*7 = 14
    expect(mockNotificationRepository.findByUserId).toHaveBeenCalledWith(sampleUserId, 7, 14);
  });


  it("should throw ZodError for invalid userId", async () => {
    const input = { userId: "not-a-uuid" } as ListNotificationsInput;
    await expect(listNotificationsForUserUseCase(input, mockNotificationRepoFactory))
      .rejects.toThrow(ZodError);
  });

  it("should throw ZodError for invalid page number (e.g., zero, negative, non-integer)", async () => {
    const input1 = { userId: sampleUserId, page: 0 } as ListNotificationsInput;
    await expect(listNotificationsForUserUseCase(input1, mockNotificationRepoFactory))
      .rejects.toThrow(ZodError);

    const input2 = { userId: sampleUserId, page: -1 } as ListNotificationsInput;
    await expect(listNotificationsForUserUseCase(input2, mockNotificationRepoFactory))
      .rejects.toThrow(ZodError);

    const input3 = { userId: sampleUserId, page: 1.5 } as ListNotificationsInput;
    await expect(listNotificationsForUserUseCase(input3, mockNotificationRepoFactory))
      .rejects.toThrow(ZodError);
  });

  it("should handle empty results correctly", async () => {
    const input: ListNotificationsInput = { userId: sampleUserId, page: 1, pageSize: 5 };
    mockNotificationRepository.findByUserId.mockResolvedValueOnce([]);
    mockNotificationRepository.countByUserId.mockResolvedValueOnce(0).mockResolvedValueOnce(0);

    const result = await listNotificationsForUserUseCase(input, mockNotificationRepoFactory);

    expect(result.data).toEqual([]);
    expect(result.totalItems).toBe(0);
    expect(result.totalUnread).toBe(0);
    expect(result.totalPages).toBe(0); // 0 items / 5 per page = 0
    expect(result.currentPage).toBe(1);
  });

  it("should propagate errors from the repository", async () => {
    const input: ListNotificationsInput = { userId: sampleUserId };
    const dbError = new Error("DB error");
    mockNotificationRepository.findByUserId.mockRejectedValueOnce(dbError);
    // countByUserId will also be called by Promise.all, let one of them throw
     mockNotificationRepository.countByUserId.mockResolvedValueOnce(0);


    await expect(listNotificationsForUserUseCase(input, mockNotificationRepoFactory))
      .rejects.toThrow(dbError);
  });
});
