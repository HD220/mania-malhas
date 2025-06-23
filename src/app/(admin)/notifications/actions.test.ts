import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { ZodError } from "zod";
import { revalidatePath } from "next/cache";
import {
  listNotificationsAction,
  markAsReadAction,
  markAllAsReadAction,
  MarkAsReadActionClientInput,
  ListNotificationsActionInput,
} from "./actions";

// Import REAL schemas for validation testing if actions use them directly before calling use cases.
// The actions.ts file does use listNotificationsForUserInputSchema directly for parsing.
import { listNotificationsForUserInputSchema } from "@/usecases/notification/listNotificationsForUserUseCase";
import { markNotificationAsReadInputSchema } from "@/usecases/notification/markNotificationAsReadUseCase";
import { markAllNotificationsAsReadInputSchema } from "@/usecases/notification/markAllNotificationsAsReadUseCase";


import { ForbiddenError, NotFoundError } from "@/lib/errors/domainErrors";

import {
  ListNotificationsForUserUseCase,
  listNotificationsForUserInputSchema,
} from "@/usecases/notification/listNotificationsForUserUseCase";
import {
  MarkNotificationAsReadUseCase,
  markNotificationAsReadInputSchema,
} from "@/usecases/notification/markNotificationAsReadUseCase";
import {
  MarkAllNotificationsAsReadUseCase,
  markAllNotificationsAsReadInputSchema,
} from "@/usecases/notification/markAllNotificationsAsReadUseCase";

// Mock Next.js cache revalidation
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock repositories if they are directly used in actions.ts
// This is still needed because actions.ts instantiates use cases with repository instances.
// However, the use cases themselves will have their 'execute' methods spied upon.
vi.mock("@/db/repositories", () => ({
  notificationRepository: {}, // Placeholder mock
  userRepository: {},       // Placeholder mock
}));


const MOCK_USER_ID = "00000000-0000-0000-0000-000000000001";
// This ID is hardcoded in actions.ts's internalGetUserIdFromSession placeholder.

// Spies for use case execute methods
let listNotificationsExecuteSpy: ReturnType<typeof vi.spyOn>;
let markAsReadExecuteSpy: ReturnType<typeof vi.spyOn>;
let markAllAsReadExecuteSpy: ReturnType<typeof vi.spyOn>;


describe("Notification Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Clears call counts and mock implementations for all mocks

    // Spy on the execute methods of the use case prototypes
    // These spies will be used by the actual instances created in actions.ts
    listNotificationsExecuteSpy = vi.spyOn(ListNotificationsForUserUseCase.prototype, "execute");
    markAsReadExecuteSpy = vi.spyOn(MarkNotificationAsReadUseCase.prototype, "execute");
    markAllAsReadExecuteSpy = vi.spyOn(MarkAllNotificationsAsReadUseCase.prototype, "execute");
  });

  afterEach(() => {
    // Restore original methods after each test
    vi.restoreAllMocks();
  });

  describe("listNotificationsAction", () => {
    it("should call ListNotificationsForUserUseCase with session userId and return data on success", async () => {
      const mockOutput = {
        notifications: [{ id: "notif1", message: "Test", userId: MOCK_USER_ID, isRead: false, createdAt: new Date(), updatedAt: new Date(), partnerId: null, transactionId: null, type: "info" as const }],
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
      // No need to mock listNotificationsExecuteSpy here as it shouldn't be called
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
      markAsReadExecuteSpy.mockResolvedValue({
        id: validInput.notificationId,
        userId: MOCK_USER_ID,
        isRead: true,
        message: "MSG",
        createdAt: new Date(),
        updatedAt: new Date(),
        partnerId: null,
        transactionId: null,
        type: "info" as const
      });

      const response = await markAsReadAction(validInput);

      expect(markAsReadExecuteSpy).toHaveBeenCalledWith({
        notificationId: validInput.notificationId,
        userId: MOCK_USER_ID,
      });
      expect(revalidatePath).toHaveBeenCalledWith("/(admin)/notifications", "page");
      expect(response.success).toBe(true);
      expect(response.data).toBeNull();
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

    it("should handle NotFoundError from use case", async () => {
      markAsReadExecuteSpy.mockRejectedValue(new NotFoundError("Notificação"));
      const response = await markAsReadAction(validInput);

      expect(response.success).toBe(false);
      expect(response.error).toBe("Notificação não encontrada.");
    });

    it("should handle ForbiddenError from use case", async () => {
      markAsReadExecuteSpy.mockRejectedValue(new ForbiddenError("Acesso negado."));
      const response = await markAsReadAction(validInput);

      expect(response.success).toBe(false);
      expect(response.error).toBe("Acesso negado.");
    });

    it("should handle generic errors from use case", async () => {
      markAsReadExecuteSpy.mockRejectedValue(new Error("UseCase failed"));
      const response = await markAsReadAction(validInput);

      expect(response.success).toBe(false);
      expect(response.error).toBe("Falha ao marcar notificação como lida.");
    });
  });

  describe("markAllAsReadAction", () => {
    it("should call MarkAllNotificationsAsReadUseCase and revalidate path on success", async () => {
      const mockResult = { success: true, markedCount: 5 };
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

    it("should handle ZodError if use case input (userId from session) is somehow invalid by use case", async () => {
      const zodErrorInstance = new ZodError([{
        code: 'invalid_string',
        message: 'Invalid uuid',
        path: ['userId'],
        validation: 'uuid',
      }]);
      markAllAsReadExecuteSpy.mockRejectedValue(zodErrorInstance);

      const response = await markAllAsReadAction();

      expect(response.success).toBe(false);
      expect(response.error).toBe("Erro de validação.");
    });

    it("should handle generic errors from use case", async () => {
      markAllAsReadExecuteSpy.mockRejectedValue(new Error("UseCase failed"));
      const response = await markAllAsReadAction();

      expect(response.success).toBe(false);
      expect(response.error).toBe("Falha ao marcar todas as notificações como lidas.");
    });
  });
});
