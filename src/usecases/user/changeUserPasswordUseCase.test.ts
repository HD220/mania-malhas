import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChangeUserPasswordUseCase, changeUserPasswordUseCaseInputSchema } from "./changeUserPasswordUseCase";
import { userRepository } from "@/db/repositories";
import { NotFoundError } from "@/lib/errors/domainErrors";
import { ZodError } from "zod";
import { faker } from "@faker-js/faker";
import { selectUserSchema, SelectUser } from "@/db/repositories/schemas/userSchema";


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

describe("ChangeUserPasswordUseCase", () => {
  let useCase: ChangeUserPasswordUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new ChangeUserPasswordUseCase();
  });

  const mockUserId = faker.string.uuid();
  const mockNewPasswordHash = faker.internet.password(60); // Simulate a hash

  // Minimal user object for findById check
  const mockExistingUserObjectToParse = {
    id: mockUserId,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    emailVerified: null, // Explicitly provide null for nullable fields
    image: null,         // Explicitly provide null for nullable fields
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const mockExistingUser: SelectUser = selectUserSchema.parse(mockExistingUserObjectToParse);


  it("should update user password and return success", async () => {
    mockUserRepoInstance.findById.mockResolvedValue(mockExistingUser); // User exists
    mockUserRepoInstance.updatePassword.mockResolvedValue(undefined); // updatePassword returns void

    const input = { userId: mockUserId, newPasswordHash: mockNewPasswordHash };
    const result = await useCase.execute(input);

    expect(mockUserRepoInstance.findById).toHaveBeenCalledWith(mockUserId);
    expect(mockUserRepoInstance.updatePassword).toHaveBeenCalledWith(mockUserId, mockNewPasswordHash);
    expect(result).toEqual({ success: true });
  });

  it("should throw NotFoundError if user is not found", async () => {
    mockUserRepoInstance.findById.mockResolvedValue(null); // User does not exist

    const input = { userId: mockUserId, newPasswordHash: mockNewPasswordHash };

    await expect(useCase.execute(input)).rejects.toThrow(NotFoundError);
    await expect(useCase.execute(input)).rejects.toThrow("Usuário não encontrada.");
    expect(mockUserRepoInstance.updatePassword).not.toHaveBeenCalled();
  });

  it("should throw ZodError for invalid userId format", async () => {
    const input = { userId: "invalid-uuid", newPasswordHash: mockNewPasswordHash };

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
    expect(mockUserRepoInstance.updatePassword).not.toHaveBeenCalled();
  });

  it("should throw ZodError if newPasswordHash is empty", async () => {
    const input = { userId: mockUserId, newPasswordHash: "" };

    await expect(useCase.execute(input)).rejects.toThrow(ZodError);
    try {
      await useCase.execute(input);
    } catch (e) {
      if (e instanceof ZodError) {
        const passwordError = e.errors.find(err => err.path.includes("newPasswordHash"));
        expect(passwordError?.message).toBe("Hash da nova senha não pode ser vazio.");
      }
    }
    expect(mockUserRepoInstance.findById).not.toHaveBeenCalled(); // Should fail before findById
    expect(mockUserRepoInstance.updatePassword).not.toHaveBeenCalled();
  });

  it("should throw ZodError if newPasswordHash is not provided", async () => {
    const input = { userId: mockUserId }; // Missing newPasswordHash

    await expect(useCase.execute(input as any)).rejects.toThrow(ZodError);
    try {
      await useCase.execute(input as any);
    } catch (e) {
      if (e instanceof ZodError) {
        const passwordError = e.errors.find(err => err.path.includes("newPasswordHash"));
        expect(passwordError?.message).toBe("Required");
      }
    }
    expect(mockUserRepoInstance.findById).not.toHaveBeenCalled();
    expect(mockUserRepoInstance.updatePassword).not.toHaveBeenCalled();
  });
});
