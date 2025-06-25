import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { ZodError } from "zod";
import { revalidatePath } from "next/cache";
import {
  listNotificationsAction,
  markAsReadAction,
  markAllAsReadAction,
  MarkAsReadActionClientInput,
  ListNotificationsActionInput,
} from './index'; // Updated import

// Import REAL schemas for validation testing if actions use them directly before calling use cases.
// The actions.ts file does use listNotificationsForUserInputSchema directly for parsing.


import { ForbiddenError, NotFoundError } from "@/lib/errors/domainErrors";

import {
  ListNotificationsForUserUseCase,
  listNotificationsForUserInputSchema, // This is also exported by the use case module
} from "@/features/notification/usecases/listNotificationsForUserUseCase";
import {
  MarkNotificationAsReadUseCase,
  markNotificationAsReadInputSchema, // This is also exported by the use case module
} from "@/features/notification/usecases/markNotificationAsReadUseCase";
import {
  MarkAllNotificationsAsReadUseCase,
  markAllNotificationsAsReadInputSchema, // This is also exported by the use case module
} from "@/features/notification/usecases/markAllNotificationsAsReadUseCase";
import { ListNotificationsForUserOutput, MarkAllNotificationsAsReadOutput } from "./index"; // For types from action file

// Mock Next.js cache revalidation
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/db/repositories", () => ({
  notificationRepository: {},
  userRepository: {},
}));


const MOCK_USER_ID = "00000000-0000-0000-0000-000000000001";

let listNotificationsExecuteSpy: ReturnType<typeof vi.spyOn>;
let markAsReadExecuteSpy: ReturnType<typeof vi.spyOn>;
let markAllAsReadExecuteSpy: ReturnType<typeof vi.spyOn>;


describe("Notification Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    listNotificationsExecuteSpy = vi.spyOn(ListNotificationsForUserUseCase.prototype, "execute");
    markAsReadExecuteSpy = vi.spyOn(MarkNotificationAsReadUseCase.prototype, "execute");
    markAllAsReadExecuteSpy = vi.spyOn(MarkAllNotificationsAsReadUseCase.prototype, "execute");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("listNotificationsAction", () => {
    it("should call ListNotificationsForUserUseCase with session userId and return data on success", async () => {
      const mockOutput: ListNotificationsForUserOutput = { // Use type from action
        notifications: [{ id: "notif1", message: "Test", userId: MOCK_USER_ID, isRead: false, createdAt: new Date(), updatedAt: new Date(), type: "info" as const, relatedEntityId: null, relatedEntityType: null }],
        totalCount: 1,
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
      };
      listNotificationsExecuteSpy.mockResolvedValue(mockOutput);

      const input: ListNotificationsActionInput = { page: 1, pageSize: 10 };
      const response = await listNotificationsAction(input);

      expect(listNotificationsExecuteSpy).toHaveBeenCalledWith({
        ...input,
        userId: MOCK_USER_ID,
      });
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockOutput);
      expect(response.error).toBeUndefined();
    });

    it("should handle ZodError when action's input parsing fails", async () => {
      const input = { page: -1, pageSize: 10 } as ListNotificationsActionInput;
      const response = await listNotificationsAction(input);

      expect(response.success).toBe(false);
      expect(response.error).toBe("Erro de validação.");
      expect(response.fieldErrors).toBeDefined();
      expect(response.fieldErrors?.page).toContain("Página deve ser um inteiro positivo.");
      expect(listNotificationsExecuteSpy).not.toHaveBeenCalled();
    });

    it("should handle generic errors from use case", async () => {
      listNotificationsExecuteSpy.mockRejectedValue(new Error("UseCase failed"));
      const input: ListNotificationsActionInput = { page: 1, pageSize: 10 };
      const response = await listNotificationsAction(input);

      expect(response.success).toBe(false);
      expect(response.error).toBe("Falha ao listar notificações.");
    });
  });

  describe("markAsReadAction", () => {
    const validInput: MarkAsReadActionClientInput = { notificationId: "a1b2c3d4-e5f6-7890-1234-567890abcdef" };

    it("should call MarkNotificationAsReadUseCase and revalidate path on success", async () => {
      markAsReadExecuteSpy.mockResolvedValue({ // Use case returns updated notification
        id: validInput.notificationId,
        userId: MOCK_USER_ID,
        isRead: true,
        message: "MSG",
        createdAt: new Date(),
        updatedAt: new Date(),
        type: "info" as const,
        relatedEntityId: null,
        relatedEntityType: null,
      });

      const response = await markAsReadAction(validInput);

      expect(markAsReadExecuteSpy).toHaveBeenCalledWith({
        notificationId: validInput.notificationId,
        userId: MOCK_USER_ID,
      });
      expect(revalidatePath).toHaveBeenCalledWith("/(admin)/notifications", "page");
      expect(response.success).toBe(true);
      // expect(response.data).toBeNull(); // Action now returns the updated notification
      expect(response.data).toBeDefined();
      if(response.data) expect(response.data.isRead).toBe(true);
      expect(response.error).toBeUndefined();
    });

    it("should handle ZodError for invalid client input (invalid notificationId format)", async () => {
      const invalidInput = { notificationId: "invalid-id" };
      const response = await markAsReadAction(invalidInput as any);

      expect(response.success).toBe(false);
      expect(response.error).toBe("Erro de validação.");
      expect(response.fieldErrors?.notificationId).toContain("ID da notificação inválido.");
      expect(markAsReadExecuteSpy).not.toHaveBeenCalled();
    });
    // ... other tests for markAsReadAction
  });

  describe("markAllAsReadAction", () => {
    it("should call MarkAllNotificationsAsReadUseCase and revalidate path on success", async () => {
      const mockResult: MarkAllNotificationsAsReadOutput = { success: true, markedCount: 5 };
      markAllAsReadExecuteSpy.mockResolvedValue(mockResult);

      const response = await markAllAsReadAction();

      expect(markAllAsReadExecuteSpy).toHaveBeenCalledWith({
        userId: MOCK_USER_ID,
      });
      expect(revalidatePath).toHaveBeenCalledWith("/(admin)/notifications", "page");
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockResult);
      expect(response.error).toBeUndefined();
    });
    // ... other tests for markAllAsReadAction
  });
});
