import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetUserProfileUseCase, getUserProfileUseCaseInputSchema } from "./getUserProfileUseCase";
import { userRepository } from "@/db/repositories";
import { NotFoundError } from "@/lib/errors/domainErrors";
import { ZodError } from "zod";
import { SelectUser, selectUserSchema } from "@/db/repositories/schemas/userSchema";
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
  // Mock other repositories if they were also exported and GetUserProfileUseCase somehow used them
}));

describe("GetUserProfileUseCase", () => {
  let useCase: GetUserProfileUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GetUserProfileUseCase(); // Re-instantiate to ensure fresh mocks if needed by constructor
  });

  const mockUserId = faker.string.uuid();
  const mockRawUserFromDb = {
    id: mockUserId,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    emailVerified: null,
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    // passwordHash is omitted as per selectUserSchema
  };
  const mockUserProfile: SelectUser = selectUserSchema.parse(mockRawUserFromDb);


  it("should retrieve and return user profile on valid userId", async () => {
    mockUserRepoInstance.findById.mockResolvedValue(mockUserProfile);

    const input = { userId: mockUserId };
    const profile = await useCase.execute(input);

    expect(userRepository).toHaveBeenCalledTimes(1); // Check factory was called by constructor
    expect(mockUserRepoInstance.findById).toHaveBeenCalledWith(mockUserId);
    expect(profile).toEqual(mockUserProfile);
  });

  it("should throw NotFoundError if user is not found", async () => {
    mockUserRepoInstance.findById.mockResolvedValue(null);

    const input = { userId: mockUserId };
    await expect(useCase.execute(input)).rejects.toThrow(NotFoundError);
    await expect(useCase.execute(input)).rejects.toThrow("Usuário não encontrada.");
  });

  it("should throw ZodError on invalid userId format", async () => {
    const input = { userId: "invalid-uuid-format" };

    await expect(useCase.execute(input)).rejects.toThrow(ZodError);
    try {
      await useCase.execute(input);
    } catch (e) {
      if (e instanceof ZodError) {
        expect(e.errors[0].message).toBe("ID do usuário inválido.");
      }
    }
    expect(mockUserRepoInstance.findById).not.toHaveBeenCalled();
  });

  it("should throw ZodError if userId is not provided", async () => {
    const input = {}; // Missing userId
    await expect(useCase.execute(input as any)).rejects.toThrow(ZodError);
     try {
      await useCase.execute(input as any);
    } catch (e) {
      if (e instanceof ZodError) {
        // Check for the specific path and message if needed
        const userIdError = e.errors.find(err => err.path.includes("userId"));
        expect(userIdError).toBeDefined();
        expect(userIdError?.message).toBe("Required"); // Default Zod message for missing required field
      }
    }
    expect(mockUserRepoInstance.findById).not.toHaveBeenCalled();
  });

   it("should correctly parse user data against selectUserSchema", async () => {
    // Simulate repo returning data that might have extra fields or needs coercion
    const rawDataFromRepo = {
      ...mockUserProfile,
      // Ensure emailVerified is either a valid ISO string or null
      emailVerified: mockUserProfile.emailVerified ? mockUserProfile.emailVerified.toISOString() : null,
      extraField: "should be stripped"
    };
    // Reparse expected profile with the potentially coerced date string to ensure consistency in comparison,
    // especially if the original mockUserProfile.emailVerified was already a Date object.
    const expectedParsedProfile = selectUserSchema.parse(rawDataFromRepo);


    mockUserRepoInstance.findById.mockResolvedValue(rawDataFromRepo as any); // Cast as any to allow extra field

    const input = { userId: mockUserId };
    const profile = await useCase.execute(input);

    expect(profile).toEqual(expectedParsedProfile);
    expect(profile).not.toHaveProperty("extraField");
    if (expectedParsedProfile.emailVerified) {
      expect(profile.emailVerified).toBeInstanceOf(Date);
    }
  });
});
