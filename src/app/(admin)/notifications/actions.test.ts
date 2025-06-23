import { describe, it, expect, vi, beforeEach } from "vitest";
import { faker } from "@faker-js/faker";
import { ZodError } from "zod";
import { NotFoundError, ForbiddenError, DomainError } from "@/lib/errors/domainErrors";

// ---- START MOCK DEFINITIONS ----
const mockListNotificationsExecute = vi.fn();
const mockMarkAsReadExecute = vi.fn();
const mockMarkAllAsReadExecute = vi.fn();
// ---- END MOCK DEFINITIONS ----

// ---- START MOCK DEFINITIONS ----
const mockListNotificationsExecute = vi.fn();
const mockMarkAsReadExecute = vi.fn();
const mockMarkAllAsReadExecute = vi.fn();
const mockRevalidatePath = vi.fn(); // Define for vi.doMock
const mockRevalidateTag = vi.fn();   // Define for vi.doMock
// ---- END MOCK DEFINITIONS ----

// ---- START MOCKS ----
// IMPORTANT: All vi.mock calls must be at the top of the module, before any imports
// that might use these mocked modules (including the actions.ts file itself).

// vi.mock("next/cache", ...) // Removed, will use vi.doMock later

vi.mock("@/db/postgres", () => ({
  db: vi.fn(),
}));

vi.mock("@/db/repositories/notificationRepository", () => ({
  notificationRepository: vi.fn().mockImplementation(() => ({
    findByUserId: vi.fn(),
    countByUserId: vi.fn(),
  })),
}));

vi.mock("@/lib/auth/session", () => ({
  internalGetUserIdFromSession: vi.fn(),
}));

// These use cases are NOT mocked at the module level anymore with vi.mock.
// We will spy on their prototype methods instead.
// ---- END MOCKS ----


// Import the actual use case classes for spying AFTER mocks for their dependencies (like DB) are set up
import {
  ListNotificationsForUserUseCase,
  ListNotificationsForUserInput, // type only
  ListNotificationsForUserOutput // type only
} from "@/usecases/notification/listNotificationsForUserUseCase";
import {
  MarkNotificationAsReadUseCase,
  MarkNotificationAsReadInput // type only
} from "@/usecases/notification/markNotificationAsReadUseCase";
import {
  MarkAllNotificationsAsReadUseCase,
  MarkAllNotificationsAsReadInput, // type only
  MarkAllNotificationsAsReadOutput // type only
} from "@/usecases/notification/markAllNotificationsAsReadUseCase";
import { SelectNotification, notificationTypeEnum as actualNotificationTypeEnum } from "@/db/repositories/schemas/notificationSchema";


// Now import the items to be tested (actions) and other necessary items
import { revalidatePath, revalidateTag } from "next/cache"; // These will be the mocked versions
import { internalGetUserIdFromSession } from "@/lib/auth/session"; // This will be the mocked version

import {
  listNotificationsAction,
  markAsReadAction,
  markAllAsReadAction,
} from "./actions";


const sampleUserId = faker.string.uuid();
const sampleNotificationId = faker.string.uuid();

const generateMockSelectNotification = (isRead = false, userId = sampleUserId, id = faker.string.uuid()): SelectNotification => ({
    id,
    userId,
    type: "info", // Hardcode a valid enum string directly
    message: faker.lorem.sentence(),
    isRead,
    relatedEntityId: null,
    relatedEntityType: null,
    createdAt: new Date(),
    updatedAt: new Date(),
});


describe("Notification Server Actions", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Reset the imported mocks from next/cache and auth/session
    (revalidatePath as vi.Mock).mockReset(); // Reset imported mock
    (revalidateTag as vi.Mock).mockReset();   // Reset imported mock
    (internalGetUserIdFromSession as vi.Mock).mockReset();

    // Reset execute mocks
    mockListNotificationsExecute.mockClear();
    mockMarkAsReadExecute.mockClear();
    mockMarkAllAsReadExecute.mockClear();

    (internalGetUserIdFromSession as vi.Mock).mockResolvedValue(sampleUserId); // Setup for most tests

    // Spy on the prototype methods for each use case
    vi.spyOn(ListNotificationsForUserUseCase.prototype, 'execute').mockImplementation(mockListNotificationsExecute);
    vi.spyOn(MarkNotificationAsReadUseCase.prototype, 'execute').mockImplementation(mockMarkAsReadExecute);
    vi.spyOn(MarkAllNotificationsAsReadUseCase.prototype, 'execute').mockImplementation(mockMarkAllAsReadExecute);
  });

  describe("listNotificationsAction", () => {
    it("should return paginated notifications for an authenticated user", async () => {
      const paginationOptions = { page: 1, pageSize: 5 };
      const mockNotificationsArray = [generateMockSelectNotification()];
      const mockOutput: ListNotificationsForUserOutput = {
        notifications: mockNotificationsArray,
        totalCount: 1,
        currentPage: 1,
        totalPages: 1,
        pageSize: 5,
      };
      mockListNotificationsExecute.mockResolvedValue(mockOutput); // This is now the spy's implementation

      const response = await listNotificationsAction(paginationOptions);

      expect(internalGetUserIdFromSession).toHaveBeenCalled();
      // expect(ListNotificationsForUserUseCase).toHaveBeenCalled(); // Constructor is called, but not a mock fn anymore
      expect(mockListNotificationsExecute).toHaveBeenCalledWith({ // Assert the spy was called
        userId: sampleUserId,
        page: paginationOptions.page,
        pageSize: paginationOptions.pageSize,
      });
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockOutput);
    });

    it("should return unauthenticated error if no user ID from session", async () => {
      (internalGetUserIdFromSession as vi.Mock).mockResolvedValue(null); // Simulate no user
      const response = await listNotificationsAction({});
      expect(response.success).toBe(false);
      expect(response.message).toBe("Usuário não autenticado.");
      expect(mockListNotificationsExecute).not.toHaveBeenCalled();
    });

    it("should return ZodError details if use case throws ZodError", async () => {
      const zodError = new ZodError([{ path: ["page"], message: "Invalid page", code: "custom" }]);
      mockListNotificationsExecute.mockRejectedValue(zodError);

      const response = await listNotificationsAction({});
      expect(response.success).toBe(false);
      expect(response.message).toBe("Dados de entrada inválidos.");
      expect(response.fieldErrors).toEqual(zodError.flatten().fieldErrors);
    });

    it("should return DomainError message if use case throws DomainError", async () => {
      const domainError = new DomainError("A specific domain error occurred");
      mockListNotificationsExecute.mockRejectedValue(domainError);

      const response = await listNotificationsAction({});
      expect(response.success).toBe(false);
      expect(response.message).toBe("A specific domain error occurred");
    });

    it("should return generic error message for other errors", async () => {
      mockListNotificationsExecute.mockRejectedValue(new Error("Some other error"));
      const response = await listNotificationsAction({});
      expect(response.success).toBe(false);
      expect(response.message).toBe("Falha ao buscar notificações. Tente novamente mais tarde.");
    });
  });

  describe("markAsReadAction", () => {
    it("should successfully mark a notification as read and return it", async () => {
      const updatedNotification = generateMockSelectNotification(true, sampleUserId, sampleNotificationId);
      mockMarkAsReadExecute.mockResolvedValue(updatedNotification);

      const response = await markAsReadAction(sampleNotificationId);

      expect(internalGetUserIdFromSession).toHaveBeenCalled();
      // expect(MarkNotificationAsReadUseCase).toHaveBeenCalled(); // Constructor is spied on, not a mock fn
      expect(mockMarkAsReadExecute).toHaveBeenCalledWith({ notificationId: sampleNotificationId, userId: sampleUserId });
      expect(response.success).toBe(true);
      expect(response.data).toEqual(updatedNotification);
      expect(response.message).toBe("Notificação marcada como lida.");
      expect(revalidatePath).toHaveBeenCalledWith("/(admin)/notifications");
      expect(revalidateTag).toHaveBeenCalledWith("user-notifications-count");
    });

    it("should return unauthenticated error if no user ID for markAsReadAction", async () => {
      (internalGetUserIdFromSession as vi.Mock).mockResolvedValue(null);
      const response = await markAsReadAction(sampleNotificationId);
      expect(response.success).toBe(false);
      expect(response.message).toBe("Usuário não autenticado.");
      expect(mockMarkAsReadExecute).not.toHaveBeenCalled();
    });

    it("should return ZodError details for invalid notificationId from use case", async () => {
       const zodError = new ZodError([{ path: ["notificationId"], message: "Invalid ID", code: "custom" }]);
      mockMarkAsReadExecute.mockRejectedValue(zodError);

      const response = await markAsReadAction(sampleNotificationId);
      expect(response.success).toBe(false);
      expect(response.message).toBe("Dados de entrada inválidos.");
      expect(response.fieldErrors).toEqual(zodError.flatten().fieldErrors);
    });

    it("should return NotFoundError message", async () => {
      const notFoundError = new NotFoundError("Notificação");
      mockMarkAsReadExecute.mockRejectedValue(notFoundError);
      const response = await markAsReadAction(sampleNotificationId);
      expect(response.success).toBe(false);
      expect(response.message).toBe("Notificação não encontrada.");
    });

    it("should return ForbiddenError message", async () => {
      const forbiddenError = new ForbiddenError("Acesso negado para esta notificação.");
      mockMarkAsReadExecute.mockRejectedValue(forbiddenError);
      const response = await markAsReadAction(sampleNotificationId);
      expect(response.success).toBe(false);
      expect(response.message).toBe("Acesso negado para esta notificação.");
    });
  });

  describe("markAllAsReadAction", () => {
    it("should successfully mark all notifications as read and return count", async () => {
      const mockOutputFromUseCase: MarkAllNotificationsAsReadOutput = { success: true, markedCount: 3 };
      mockMarkAllAsReadExecute.mockResolvedValue(mockOutputFromUseCase);

      const response = await markAllAsReadAction();

      expect(internalGetUserIdFromSession).toHaveBeenCalled();
      // expect(MarkAllNotificationsAsReadUseCase).toHaveBeenCalled(); // Constructor is spied on
      expect(mockMarkAllAsReadExecute).toHaveBeenCalledWith({ userId: sampleUserId });
      expect(response.success).toBe(true);
      expect(response.markedCount).toBe(3);
      expect(response.message).toBe("Todas as notificações foram marcadas como lidas.");
      expect(revalidatePath).toHaveBeenCalledWith("/(admin)/notifications");
      expect(revalidateTag).toHaveBeenCalledWith("user-notifications-count");
    });

    it("should return unauthenticated error if no user ID for markAllAsReadAction", async () => {
      (internalGetUserIdFromSession as vi.Mock).mockResolvedValue(null);
      const response = await markAllAsReadAction();
      expect(response.success).toBe(false);
      expect(response.message).toBe("Usuário não autenticado.");
      expect(mockMarkAllAsReadExecute).not.toHaveBeenCalled();
    });

    it("should return error if use case throws for markAllAsReadAction", async () => {
      const domainError = new DomainError("Failed to mark all");
      mockMarkAllAsReadExecute.mockRejectedValue(domainError);
      const response = await markAllAsReadAction();
      expect(response.success).toBe(false);
      expect(response.message).toBe("Failed to mark all");
    });
  });
});
