import { faker } from "@faker-js/faker";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

import { ForbiddenError, NotFoundError } from "@/lib/errors/domain-errors";
import { SelectUser, UpdateUserProfile as UpdateUserProfileData } from "@/features/user/schemas/userSchema";
import { ChangeUserPasswordUseCase } from "@/features/user/usecases/changeUserPasswordUseCase";
import { GetUserProfileUseCase } from "@/features/user/usecases/getUserProfileUseCase";
import { UpdateUserProfileUseCase } from "@/features/user/usecases/updateUserProfileUseCase";

import {
  getUserProfileAction,
  updateUserProfileAction,
  changeUserPasswordAction,
  // updateUserProfileActionSchema, // Action validates internally
  // changeUserPasswordActionSchema // Action validates internally
} from "./actions";

// Mock Next.js cache revalidation
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock the placeholder session function used in actions.ts
// To do this effectively, we need to know how it's imported or used.
// Assuming it's a direct import in actions.ts, we can try to mock the module it's in
// or specific named export if applicable.
// For now, the actions.ts file has it as a local function, so we can't directly mock it easily from here
// without refactoring actions.ts or more complex mocking.
// The tests will rely on its hardcoded placeholder value.
const MOCK_USER_ID = "00000000-0000-0000-0000-000000000001"; // Matches placeholder

// Spies for use case execute methods
let getUserProfileExecuteSpy: ReturnType<typeof vi.spyOn>;
let updateUserProfileExecuteSpy: ReturnType<typeof vi.spyOn>;
let changeUserPasswordExecuteSpy: ReturnType<typeof vi.spyOn>;

// Mock repositories - needed because use cases are instantiated in actions.ts
vi.mock("@/db/repositories", () => ({
  userRepository: vi.fn(() => ({
    findById: vi.fn(),
    updateProfile: vi.fn(),
    updatePassword: vi.fn(),
  })),
}));


describe("User Profile Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    getUserProfileExecuteSpy = vi.spyOn(GetUserProfileUseCase.prototype, "execute");
    updateUserProfileExecuteSpy = vi.spyOn(UpdateUserProfileUseCase.prototype, "execute");
    changeUserPasswordExecuteSpy = vi.spyOn(ChangeUserPasswordUseCase.prototype, "execute");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // --- getUserProfileAction Tests ---
  describe("getUserProfileAction", () => {
    const mockUserProfile: SelectUser = {
      id: MOCK_USER_ID,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      emailVerified: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should successfully retrieve and return user profile", async () => {
      getUserProfileExecuteSpy.mockResolvedValue(mockUserProfile);
      const response = await getUserProfileAction();
      expect(getUserProfileExecuteSpy).toHaveBeenCalledWith({ userId: MOCK_USER_ID });
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockUserProfile);
      expect(response.error).toBeUndefined();
    });

    it("should handle NotFoundError from use case", async () => {
      getUserProfileExecuteSpy.mockRejectedValue(new NotFoundError("Usuário"));
      const response = await getUserProfileAction();
      expect(response.success).toBe(false);
      expect(response.error).toBe("Usuário não encontrada.");
    });

    it("should handle ZodError from use case (e.g. if userId was invalid - though session provides it)", async () => {
      // This test is more theoretical if userId always comes from a trusted session.
      // But if GetUserProfileUseCase's input validation for userId somehow fails.
      const zodError = new ZodError([{ code: "custom", path: ["userId"], message: "Invalid session User ID" }]);
      getUserProfileExecuteSpy.mockRejectedValue(zodError);
      const response = await getUserProfileAction();
      expect(response.success).toBe(false);
      expect(response.error).toBe("Erro de validação ao buscar perfil.");
      expect(response.fieldErrors).toEqual(zodError.flatten().fieldErrors);
    });

    it("should handle generic errors", async () => {
      getUserProfileExecuteSpy.mockRejectedValue(new Error("Generic failure"));
      const response = await getUserProfileAction();
      expect(response.success).toBe(false);
      expect(response.error).toBe("Falha ao buscar perfil do usuário.");
    });
  });

  // --- updateUserProfileAction Tests ---
  describe("updateUserProfileAction", () => {
    const updateData: UpdateUserProfileData = {
      name: "Updated Name",
      email: faker.internet.email().toLowerCase(),
      image: faker.image.avatar(),
    };
    const mockUpdatedProfile: SelectUser = {
      id: MOCK_USER_ID,
      name: updateData.name!,
      email: updateData.email!,
      emailVerified: null,
      image: updateData.image!,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should successfully update user profile", async () => {
      updateUserProfileExecuteSpy.mockResolvedValue(mockUpdatedProfile);
      const response = await updateUserProfileAction(updateData);

      expect(updateUserProfileExecuteSpy).toHaveBeenCalledWith({ userId: MOCK_USER_ID, data: updateData });
      expect(revalidatePath).toHaveBeenCalledWith("/(admin)/profile");
      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockUpdatedProfile);
    });

    it("should handle ZodError for invalid input data", async () => {
      const invalidUpdateData = { email: "not-an-email" };
      // Simulate ZodError from the use case execution due to invalid 'data'
      const zodError = new ZodError([{ code: "invalid_string", path: ["data", "email"], message: "Email inválido.", validation: "email" }]);
      updateUserProfileExecuteSpy.mockRejectedValue(zodError);

      const response = await updateUserProfileAction(invalidUpdateData as any);

      expect(response.success).toBe(false);
      expect(response.error).toBe("Erro de validação ao atualizar perfil.");
      // ZodErrors from use case might be nested under 'data.field'
      expect(response.fieldErrors).toEqual(zodError.flatten().fieldErrors);
    });

    it("should handle NotFoundError from use case", async () => {
      updateUserProfileExecuteSpy.mockRejectedValue(new NotFoundError("Usuário"));
      const response = await updateUserProfileAction(updateData);
      expect(response.success).toBe(false);
      expect(response.error).toBe("Usuário não encontrada.");
    });

    it("should handle generic errors during update", async () => {
      updateUserProfileExecuteSpy.mockRejectedValue(new Error("Generic update failure"));
      const response = await updateUserProfileAction(updateData);
      expect(response.success).toBe(false);
      expect(response.error).toBe("Falha ao atualizar perfil do usuário.");
    });
  });

  // --- changeUserPasswordAction Tests ---
  describe("changeUserPasswordAction", () => {
    const passwordInput = { newPasswordHash: faker.internet.password(60) };

    it("should successfully change user password", async () => {
      changeUserPasswordExecuteSpy.mockResolvedValue({ success: true });
      const response = await changeUserPasswordAction(passwordInput);

      expect(changeUserPasswordExecuteSpy).toHaveBeenCalledWith({ userId: MOCK_USER_ID, newPasswordHash: passwordInput.newPasswordHash });
      expect(response.success).toBe(true);
      expect(response.data).toEqual({ success: true });
    });

    it("should handle ZodError for invalid password input", async () => {
      const invalidPasswordInput = { newPasswordHash: "" }; // Empty hash
      // Simulate ZodError from use case for its input
      const zodError = new ZodError([{ code: "too_small", type: "string", minimum: 1, inclusive: true, path: ["newPasswordHash"], message: "Hash da nova senha não pode ser vazio." }]);
      changeUserPasswordExecuteSpy.mockRejectedValue(zodError);

      const response = await changeUserPasswordAction(invalidPasswordInput);

      expect(response.success).toBe(false);
      expect(response.error).toBe("Erro de validação ao alterar senha.");
      expect(response.fieldErrors).toEqual(zodError.flatten().fieldErrors);
    });

    it("should handle NotFoundError from use case", async () => {
      changeUserPasswordExecuteSpy.mockRejectedValue(new NotFoundError("Usuário"));
      const response = await changeUserPasswordAction(passwordInput);
      expect(response.success).toBe(false);
      expect(response.error).toBe("Usuário não encontrada.");
    });

    it("should handle generic errors during password change", async () => {
      changeUserPasswordExecuteSpy.mockRejectedValue(new Error("Generic password change failure"));
      const response = await changeUserPasswordAction(passwordInput);
      expect(response.success).toBe(false);
      expect(response.error).toBe("Falha ao alterar senha.");
    });
  });
});
