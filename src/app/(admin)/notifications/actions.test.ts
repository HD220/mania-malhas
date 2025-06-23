import { describe, it, expect, vi, beforeEach } from "vitest";
import { faker } from "@faker-js/faker";
import { ZodError } from "zod";
import { NotFoundError } from "@/lib/errors/domainErrors";
import type { PaginatedNotificationsResult, ListNotificationsServerResponse, MarkAsReadServerResponse, MarkAllAsReadServerResponse } from './actions';
import type { SelectNotification } from "@/db/repositories/schemas/notificationSchema";


// ---- START MOCK DEFINITIONS (variables used by vi.mock factories) ----
const mockListNotificationsUseCase = vi.fn();
const mockMarkAsReadUseCase = vi.fn();
const mockMarkAllAsReadUseCase = vi.fn();
const mockRevalidatePath = vi.fn();
const mockInternalGetUserIdFromSession = vi.fn();
// ---- END MOCK DEFINITIONS ----


// ---- START MOCKS ----
// Mock Use Cases
vi.mock("@/usecases/notification/listNotificationsForUserUseCase", () => ({ default: mockListNotificationsUseCase }));
vi.mock("@/usecases/notification/markNotificationAsReadUseCase", () => ({ default: mockMarkAsReadUseCase }));
vi.mock("@/usecases/notification/markAllNotificationsAsReadUseCase", () => ({ default: mockMarkAllAsReadUseCase }));

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
  unstable_noStore: vi.fn()
}));

// Mock the ./actions module to control internalGetUserIdFromSession
vi.mock("./actions", async (importOriginal) => {
  const actualActionsModule = await importOriginal<typeof import("./actions")>();
  return {
    ...actualActionsModule,
    internalGetUserIdFromSession: mockInternalGetUserIdFromSession,
  };
});
// ---- END MOCKS ----

// Now import the actions AFTER all mock setups.
import {
  listNotificationsAction,
  markAsReadAction,
  markAllAsReadAction,
} from "./actions"; // internalGetUserIdFromSession is not directly used in tests, mockInternalGetUserIdFromSession is.


const sampleUserId = faker.string.uuid();
const sampleNotificationId = faker.string.uuid();


describe("Notification Server Actions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockInternalGetUserIdFromSession.mockResolvedValue(sampleUserId);
    mockListNotificationsUseCase.mockReset();
    mockMarkAsReadUseCase.mockReset();
    mockMarkAllAsReadUseCase.mockReset();
  });

  describe("listNotificationsAction", () => {
    it("should return paginated notifications for an authenticated user", async () => {
      const mockPaginationOpts = { page: 1, pageSize: 5 };
      const mockResultData: SelectNotification[] = [{
        id: sampleNotificationId, userId: sampleUserId, type: "info", message: "Test", isRead: false,
        createdAt: new Date(), updatedAt: new Date(), relatedEntityId: null, relatedEntityType: null
      }];
      const mockPaginatedResult: PaginatedNotificationsResult = {
        data: mockResultData, totalItems: 1, totalUnread: 1, totalPages: 1, currentPage: 1, pageSize: 5
      };
      mockListNotificationsUseCase.mockResolvedValue(mockPaginatedResult);

      const response = await listNotificationsAction(mockPaginationOpts);

      expect(mockInternalGetUserIdFromSession).toHaveBeenCalled();
      expect(mockListNotificationsUseCase).toHaveBeenCalledWith({
        userId: sampleUserId,
        page: mockPaginationOpts.page,
        pageSize: mockPaginationOpts.pageSize,
      });
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockPaginatedResult);
    });

    it("should return unauthenticated error if no user ID from session", async () => {
      mockInternalGetUserIdFromSession.mockResolvedValueOnce(null); // Simulate no user
      const mockPaginationOpts = { page: 1, pageSize: 5 };
      const response = await listNotificationsAction(mockPaginationOpts); // Use direct import
      expect(response.success).toBe(false);
      expect(response.message).toBe("Usuário não autenticado.");
      expect(mockListNotificationsUseCase).not.toHaveBeenCalled();
    });

    it("should return error if listNotificationsForUserUseCase throws", async () => {
      const mockPaginationOpts = { page: 1, pageSize: 5 };
      const errorMessage = "Use case failed";
      mockListNotificationsUseCase.mockRejectedValue(new Error(errorMessage));

      const response = await listNotificationsAction(mockPaginationOpts); // Use direct import
      expect(response.success).toBe(false);
      expect(response.message).toBe(errorMessage);
    });
  });

  describe("markAsReadAction", () => {
    it("should successfully mark a notification as read for an authenticated user", async () => {
      mockMarkAsReadUseCase.mockResolvedValue(undefined);
      const response = await markAsReadAction(sampleNotificationId); // Use direct import

      expect(mockInternalGetUserIdFromSession).toHaveBeenCalled();
      expect(mockMarkAsReadUseCase).toHaveBeenCalledWith({ notificationId: sampleNotificationId, userId: sampleUserId });
      expect(response.success).toBe(true);
      expect(response.message).toBe("Notificação marcada como lida.");
    });

    it("should return unauthenticated error if no user ID from session for markAsReadAction", async () => {
      mockInternalGetUserIdFromSession.mockResolvedValueOnce(null);
      const response = await markAsReadAction(sampleNotificationId); // Use direct import
      expect(response.success).toBe(false);
      expect(response.message).toBe("Usuário não autenticado.");
      expect(mockMarkAsReadUseCase).not.toHaveBeenCalled();
    });

    it("should return NotFoundError if markNotificationAsReadUseCase throws NotFoundError", async () => {
      const errorMessage = "Notificação não encontrada.";
      mockMarkAsReadUseCase.mockRejectedValue(new NotFoundError(errorMessage));
      const response = await markAsReadAction(sampleNotificationId); // Use direct import
      expect(response.success).toBe(false);
      expect(response.message).toBe(`${errorMessage} não encontrada.`);
    });

    it("should return authorization error if markNotificationAsReadUseCase throws authorization error", async () => {
      const errorMessage = "Usuário não autorizado a marcar esta notificação como lida.";
      mockMarkAsReadUseCase.mockRejectedValue(new Error(errorMessage));
      const response = await markAsReadAction(sampleNotificationId); // Use direct import
      expect(response.success).toBe(false);
      expect(response.message).toBe(errorMessage);
    });
  });

  describe("markAllAsReadAction", () => {
    it("should successfully mark all notifications as read for an authenticated user", async () => {
      mockMarkAllAsReadUseCase.mockResolvedValue(undefined);
      const response = await markAllAsReadAction(); // Use direct import

      expect(mockInternalGetUserIdFromSession).toHaveBeenCalled();
      expect(mockMarkAllAsReadUseCase).toHaveBeenCalledWith({ userId: sampleUserId });
      expect(response.success).toBe(true);
      expect(response.message).toBe("Todas as notificações foram marcadas como lidas.");
    });

    it("should return unauthenticated error if no user ID from session for markAllAsReadAction", async () => {
      mockInternalGetUserIdFromSession.mockResolvedValueOnce(null);
      const response = await markAllAsReadAction(); // Use direct import
      expect(response.success).toBe(false);
      expect(response.message).toBe("Usuário não autenticado.");
      expect(mockMarkAllAsReadUseCase).not.toHaveBeenCalled();
    });

    it("should return error if markAllNotificationsAsReadUseCase throws", async () => {
      const errorMessage = "Failed to mark all as read";
      mockMarkAllAsReadUseCase.mockRejectedValue(new Error(errorMessage));
      const response = await markAllAsReadAction(); // Use direct import
      expect(response.success).toBe(false);
      expect(response.message).toBe(errorMessage);
    });
  });
});
