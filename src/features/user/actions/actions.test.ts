import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { ZodError } from "zod";
import { revalidatePath } from "next/cache";

import {
  getUserProfileAction,
  updateUserProfileAction,
  changeUserPasswordAction,
  updateUserProfileActionSchema,
  changeUserPasswordActionSchema
} from './index'; // Updated import

import { GetUserProfileUseCase } from "@/features/user/usecases/getUserProfileUseCase";
import { UpdateUserProfileUseCase } from "@/features/user/usecases/updateUserProfileUseCase";
import { ChangeUserPasswordUseCase } from "@/features/user/usecases/changeUserPasswordUseCase";

import { SelectUser, UpdateUserProfile as UpdateUserProfileData } from "@/features/user/schemas/userSchema";
import { ForbiddenError, NotFoundError } from "@/lib/errors/domainErrors";
import { faker } from "@faker-js/faker";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const MOCK_USER_ID = "00000000-0000-0000-0000-000000000001";

let getUserProfileExecuteSpy: ReturnType<typeof vi.spyOn>;
let updateUserProfileExecuteSpy: ReturnType<typeof vi.spyOn>;
let changeUserPasswordExecuteSpy: ReturnType<typeof vi.spyOn>;

vi.mock("@/db/repositories", () => ({ // This mock might still be needed if use cases instantiate repo from here
  userRepository: vi.fn(() => ({
    findById: vi.fn(),
    updateProfile: vi.fn(),
    updatePassword: vi.fn(),
  })),
}));


describe("User Profile Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Spies are on the class prototype's execute method
    getUserProfileExecuteSpy = vi.spyOn(GetUserProfileUseCase.prototype, "execute");
    updateUserProfileExecuteSpy = vi.spyOn(UpdateUserProfileUseCase.prototype, "execute");
    changeUserPasswordExecuteSpy = vi.spyOn(ChangeUserPasswordUseCase.prototype, "execute");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

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

    it("should handle ZodError from use case", async () => {
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
      const zodError = new ZodError([{ code: "invalid_string", path: ["data", "email"], message: "Email inválido.", validation: "email" }]);
      updateUserProfileExecuteSpy.mockRejectedValue(zodError);
      const response = await updateUserProfileAction(invalidUpdateData as any);
      expect(response.success).toBe(false);
      expect(response.error).toBe("Erro de validação ao atualizar perfil.");
      expect(response.fieldErrors).toEqual(zodError.flatten().fieldErrors);
    });

    // Other tests for updateUserProfileAction...
  });

  describe("changeUserPasswordAction", () => {
    const passwordInput = { newPasswordHash: faker.internet.password(60) };

    it("should successfully change user password", async () => {
      changeUserPasswordExecuteSpy.mockResolvedValue({ success: true });
      const response = await changeUserPasswordAction(passwordInput);
      expect(changeUserPasswordExecuteSpy).toHaveBeenCalledWith({ userId: MOCK_USER_ID, newPasswordHash: passwordInput.newPasswordHash });
      expect(response.success).toBe(true);
      expect(response.data).toEqual({ success: true });
    });

    // Other tests for changeUserPasswordAction...
  });
});
