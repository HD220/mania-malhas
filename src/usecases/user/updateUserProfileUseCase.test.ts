import { describe, it, expect, vi, beforeEach } from "vitest";
import { UpdateUserProfileUseCase, updateUserProfileUseCaseInputSchema } from "./updateUserProfileUseCase";
import { userRepository } from "@/db/repositories";
import { NotFoundError } from "@/lib/errors/domainErrors";
import { ZodError } from "zod";
import { SelectUser, UpdateUserProfile, selectUserSchema } from "@/db/repositories/schemas/userSchema";
import { faker } from "@faker-js/faker";

// Mock the userRepository factory and its methods
const mockUserRepoInstance = {
  findById: vi.fn(),
  findByEmail: vi.fn(),
  findByEmailWithPassword: vi.fn(),
  insert: vi.fn(),
  updateProfile: vi.fn(),
  updatePassword: vi.fn(),
};

vi.mock("@/db/repositories", () => ({
  userRepository: vi.fn(() => mockUserRepoInstance),
}));

describe("UpdateUserProfileUseCase", () => {
  let useCase: UpdateUserProfileUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new UpdateUserProfileUseCase();
  });

  const mockUserId = faker.string.uuid();
  const originalRawUser = {
    id: mockUserId,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    emailVerified: null,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const originalUserProfile: SelectUser = selectUserSchema.parse(originalRawUser);

  it("should update user profile and return updated data", async () => {
    const updateData: UpdateUserProfile = {
      name: "New Name",
      email: faker.internet.email().toLowerCase(),
      image: faker.image.avatar(),
    };
    const expectedUpdatedUser: SelectUser = {
      ...originalUserProfile,
      ...updateData,
      updatedAt: new Date(), // Assuming repo updates this
    };

    mockUserRepoInstance.findById.mockResolvedValue(originalUserProfile); // User exists
    mockUserRepoInstance.updateProfile.mockResolvedValue(expectedUpdatedUser);

    const input = { userId: mockUserId, data: updateData };
    const result = await useCase.execute(input);

    expect(mockUserRepoInstance.findById).toHaveBeenCalledWith(mockUserId);
    expect(mockUserRepoInstance.updateProfile).toHaveBeenCalledWith(mockUserId, updateData);
    expect(result).toEqual(expectedUpdatedUser);
  });

  it("should handle partial updates (only name)", async () => {
    const updateData: UpdateUserProfile = { name: "Only Name Updated" };
    const expectedUpdatedUser: SelectUser = {
      ...originalUserProfile,
      name: updateData.name,
      updatedAt: new Date(),
    };

    mockUserRepoInstance.findById.mockResolvedValue(originalUserProfile);
    mockUserRepoInstance.updateProfile.mockResolvedValue(expectedUpdatedUser);

    const input = { userId: mockUserId, data: updateData };
    const result = await useCase.execute(input);

    expect(mockUserRepoInstance.updateProfile).toHaveBeenCalledWith(mockUserId, updateData);
    expect(result.name).toBe(updateData.name);
    expect(result.email).toBe(originalUserProfile.email); // Email should be original
  });

  it("should handle clearing the image (image: null)", async () => {
    const updateData: UpdateUserProfile = { image: null };
     const expectedUpdatedUser: SelectUser = {
      ...originalUserProfile,
      image: null,
      updatedAt: new Date(),
    };
    mockUserRepoInstance.findById.mockResolvedValue(originalUserProfile);
    mockUserRepoInstance.updateProfile.mockResolvedValue(expectedUpdatedUser);

    const input = { userId: mockUserId, data: updateData };
    const result = await useCase.execute(input);

    expect(mockUserRepoInstance.updateProfile).toHaveBeenCalledWith(mockUserId, updateData);
    expect(result.image).toBeNull();
  });


  it("should throw NotFoundError if user to update is not found", async () => {
    mockUserRepoInstance.findById.mockResolvedValue(null); // User does not exist

    const updateData: UpdateUserProfile = { name: "Any Name" };
    const input = { userId: mockUserId, data: updateData };

    await expect(useCase.execute(input)).rejects.toThrow(NotFoundError);
    await expect(useCase.execute(input)).rejects.toThrow("Usuário não encontrada.");
    expect(mockUserRepoInstance.updateProfile).not.toHaveBeenCalled();
  });

  it("should throw ZodError for invalid userId format", async () => {
    const updateData: UpdateUserProfile = { name: "Any Name" };
    const input = { userId: "invalid-uuid", data: updateData };

    await expect(useCase.execute(input)).rejects.toThrow(ZodError);
    try {
      await useCase.execute(input);
    } catch (e) {
      if (e instanceof ZodError) {
        const userIdError = e.errors.find(err => err.path.includes("userId"));
        expect(userIdError?.message).toBe("ID do usuário inválido.");
      }
    }
    expect(mockUserRepoInstance.findById).not.toHaveBeenCalled();
    expect(mockUserRepoInstance.updateProfile).not.toHaveBeenCalled();
  });

  it("should throw ZodError for invalid data (e.g., invalid email in data)", async () => {
    const updateData = { email: "invalid-email" }; // name and image are optional
    const input = { userId: mockUserId, data: updateData as any };

    await expect(useCase.execute(input)).rejects.toThrow(ZodError);
    try {
      await useCase.execute(input);
    } catch (e) {
      if (e instanceof ZodError) {
        const emailError = e.errors.find(err => err.path.join('.') === "data.email");
        expect(emailError?.message).toBe("Email inválido.");
      }
    }
    expect(mockUserRepoInstance.findById).not.toHaveBeenCalled();
    expect(mockUserRepoInstance.updateProfile).not.toHaveBeenCalled();
  });

  it("should throw ZodError if data is empty object and schema requires fields", async () => {
    // updateUserProfileSchema allows all fields to be optional, so an empty object is valid for the 'data' part.
    // The use case's combined input schema (updateUserProfileUseCaseInputSchema) requires 'data' object itself.
    // Let's test if 'data' is missing.
    const inputWithoutData = { userId: mockUserId };

    await expect(useCase.execute(inputWithoutData as any)).rejects.toThrow(ZodError);
     try {
      await useCase.execute(inputWithoutData as any);
    } catch (e) {
      if (e instanceof ZodError) {
        const dataError = e.errors.find(err => err.path.includes("data"));
        expect(dataError?.message).toBe("Required");
      }
    }
  });

  it("should re-throw error if updateProfile unexpectedly returns null after user was found", async () => {
    mockUserRepoInstance.findById.mockResolvedValue(originalUserProfile); // User exists
    mockUserRepoInstance.updateProfile.mockResolvedValue(null); // Simulate update failing unexpectedly

    const updateData: UpdateUserProfile = { name: "Test Name" };
    const input = { userId: mockUserId, data: updateData };

    await expect(useCase.execute(input)).rejects.toThrow("Falha ao atualizar o perfil do usuário após a verificação.");
  });
});
