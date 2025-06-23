import { describe, it, expect, vi, beforeEach } from "vitest";
import { userRepository } from "./userRepository";
import { InsertUser, UpdateUserProfile, selectUserSchema, selectUserWithPasswordSchema, SelectUser, SelectUserWithPassword } from "./schemas/userSchema";
import { userTable } from "@/db/postgres/schema/user";
import { faker } from "@faker-js/faker";

// --- START MOCK FUNCTION DEFINITIONS FOR Drizzle CHAINED METHODS ---
const mockDbReturning = vi.fn();
const mockDbValues = vi.fn();
const mockDbFrom = vi.fn();
const mockDbWhere = vi.fn();
const mockDbLimit = vi.fn();
const mockDbSet = vi.fn();
const mockDbOrderBy = vi.fn(); // Added for completeness, though not used by userRepo yet
const mockDbOffset = vi.fn();  // Added for completeness

// Mock the main Drizzle db object and its initial methods (insert, select, update)
const mockDb = {
  insert: vi.fn().mockImplementation(() => ({
    values: mockDbValues.mockImplementation(() => ({
      returning: mockDbReturning,
    })),
  })),
  select: vi.fn().mockImplementation((selectArg?: any) => ({ // Added selectArg to inspect
    from: mockDbFrom.mockImplementation(() => ({
      where: mockDbWhere.mockImplementation(() => ({
        limit: mockDbLimit,
        orderBy: mockDbOrderBy.mockImplementation(() => ({ // For potential future use
          limit: mockDbLimit,
          offset: mockDbOffset,
        })),
        offset: mockDbOffset.mockImplementation(() => ({ // For potential future use
            limit: mockDbLimit,
        }))
      })),
      limit: mockDbLimit, // If no .where is called
      orderBy: mockDbOrderBy.mockImplementation(() => ({
        limit: mockDbLimit,
        offset: mockDbOffset,
      })),
      offset: mockDbOffset.mockImplementation(() => ({
        limit: mockDbLimit,
      }))
    })),
  })),
  update: vi.fn().mockImplementation(() => ({
    set: mockDbSet.mockImplementation(() => ({
      where: mockDbWhere,
    })),
  })),
  // Add other top-level db methods if needed by the repository, e.g., delete, execute, etc.
};
// --- END MOCK FUNCTION DEFINITIONS ---

const mockDbInstance = mockDb as any;
const repo = userRepository(mockDbInstance);

const sampleUserId = faker.string.uuid();
const sampleUserEmail = faker.internet.email();
const samplePasswordHash = faker.internet.password();

const sampleInsertUser: InsertUser = {
  email: sampleUserEmail,
  name: faker.person.fullName(),
  passwordHash: samplePasswordHash,
};

const rawUserFromDb = { // Data as it might come from DB before Zod parsing
  id: sampleUserId,
  name: sampleInsertUser.name,
  email: sampleInsertUser.email,
  emailVerified: null,
  image: null,
  passwordHash: samplePasswordHash,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Parsed versions
const sampleSelectUser: SelectUser = selectUserSchema.parse(rawUserFromDb);
const sampleSelectUserWithPassword: SelectUserWithPassword = selectUserWithPasswordSchema.parse(rawUserFromDb);


describe("userRepository", () => {
  beforeEach(() => {
    // Reset all mock functions we defined
    mockDb.insert.mockClear(); // Clear the top-level method calls
    mockDb.select.mockClear();
    mockDb.update.mockClear();

    mockDbReturning.mockReset();
    mockDbValues.mockReset();
    mockDbFrom.mockReset();
    mockDbWhere.mockReset();
    mockDbLimit.mockReset();
    mockDbSet.mockReset();
    mockDbOrderBy.mockReset();
    mockDbOffset.mockReset();
  });

  describe("insert", () => {
    it("should insert a user and return their id", async () => {
      mockDbReturning.mockResolvedValueOnce([{ id: sampleUserId }]);
      const result = await repo.insert(sampleInsertUser);

      expect(mockDb.insert).toHaveBeenCalledWith(userTable);
      expect(mockDbValues).toHaveBeenCalledWith(sampleInsertUser);
      expect(mockDbReturning).toHaveBeenCalledWith({ id: userTable.id });
      expect(result).toEqual({ id: sampleUserId });
    });
  });

  describe("findById", () => {
    it("should return a user (without password) if found", async () => {
      mockDbLimit.mockResolvedValueOnce([rawUserFromDb]); // DB returns raw data
      const result = await repo.findById(sampleUserId);

      const selectCallArgs = (mockDb.select as vi.Mock).mock.calls[0][0];
      expect(selectCallArgs).toBeDefined();
      expect(selectCallArgs.passwordHash).toBeUndefined(); // passwordHash should not be in the selection object
      // Ensure other expected fields are there
      for (const key in selectUserSchema.shape) {
        if (key !== 'passwordHash') {
          expect(selectCallArgs[key]).toBeDefined();
        }
      }

      expect(mockDbFrom).toHaveBeenCalledWith(userTable);
      expect(mockDbWhere).toHaveBeenCalled(); // More specific eq check is tricky with mocks
      expect(mockDbLimit).toHaveBeenCalledWith(1);
      expect(result).toEqual(sampleSelectUser); // Expect Zod parsed result
    });
    it("should return null if user not found by id", async () => {
      mockDbLimit.mockResolvedValueOnce([]);
      const result = await repo.findById("non-existent-id");
      expect(result).toBeNull();
    });
  });

  describe("findByEmail", () => {
    it("should return a user (without password) if found by email", async () => {
      mockDbLimit.mockResolvedValueOnce([rawUserFromDb]);
      const result = await repo.findByEmail(sampleUserEmail);

      const selectCallArgs = (mockDb.select as vi.Mock).mock.calls[0][0];
      expect(selectCallArgs).toBeDefined();
      expect(selectCallArgs.passwordHash).toBeUndefined(); // passwordHash should not be in the selection object
       // Ensure other expected fields are there
      for (const key in selectUserSchema.shape) {
        if (key !== 'passwordHash') {
          expect(selectCallArgs[key]).toBeDefined();
        }
      }

      expect(mockDbFrom).toHaveBeenCalledWith(userTable);
      expect(mockDbWhere).toHaveBeenCalled();
      expect(mockDbLimit).toHaveBeenCalledWith(1);
      expect(result).toEqual(sampleSelectUser);
    });
     it("should return null if user not found by email", async () => {
      mockDbLimit.mockResolvedValueOnce([]);
      const result = await repo.findByEmail("non-existent-email@example.com");
      expect(result).toBeNull();
    });
  });

  describe("findByEmailWithPassword", () => {
    it("should return a user (with password) if found by email", async () => {
      mockDbLimit.mockResolvedValueOnce([rawUserFromDb]); // DB returns raw data
      const result = await repo.findByEmailWithPassword(sampleUserEmail);

      expect(mockDb.select).toHaveBeenCalledWith(); // Called with no arguments, meaning select all columns
      // const selectArgs = (mockDb.select as vi.Mock).mock.calls[0][0]; // This would be undefined
      // expect(selectArgs === undefined || (selectArgs && selectArgs.passwordHash !== undefined)).toBe(true);


      expect(mockDbFrom).toHaveBeenCalledWith(userTable);
      expect(mockDbWhere).toHaveBeenCalled();
      expect(mockDbLimit).toHaveBeenCalledWith(1);
      expect(result).toEqual(sampleSelectUserWithPassword); // Expect Zod parsed result
    });
  });

  describe("updateProfile", () => {
    it("should update user profile and return updated user data", async () => {
      const profileUpdate: UpdateUserProfile = { name: "New Name", email: faker.internet.email() };
      const updatedRawUser = { ...rawUserFromDb, ...profileUpdate, updatedAt: new Date() };
      const expectedUpdatedUser = selectUserSchema.parse(updatedRawUser);

      mockDbWhere.mockResolvedValueOnce(undefined); // For the update call
      mockDbLimit.mockResolvedValueOnce([updatedRawUser]); // For the subsequent findById call

      const result = await repo.updateProfile(sampleUserId, profileUpdate);

      expect(mockDb.update).toHaveBeenCalledWith(userTable);
      expect(mockDbSet).toHaveBeenCalledWith(expect.objectContaining({ name: "New Name", email: profileUpdate.email, updatedAt: expect.any(Date) }));
      expect(mockDbWhere).toHaveBeenCalledTimes(2); // Once for update, once for findById

      expect(result).toEqual(expectedUpdatedUser);
    });

    it("should only update provided fields", async () => {
        const profileUpdate: UpdateUserProfile = { name: "Only Name Updated" };
        const updatedRawUser = { ...rawUserFromDb, name: "Only Name Updated", updatedAt: new Date() };
        const expectedUpdatedUser = selectUserSchema.parse(updatedRawUser);

        mockDbWhere.mockResolvedValueOnce(undefined); // For update
        mockDbLimit.mockResolvedValueOnce([updatedRawUser]); // For findById

        const result = await repo.updateProfile(sampleUserId, profileUpdate);
        expect(mockDbSet).toHaveBeenCalledWith({ name: "Only Name Updated", updatedAt: expect.any(Date) }); // Only name and updatedAt
        expect(result?.email).toEqual(sampleSelectUser.email); // Email should be unchanged
        expect(result?.name).toEqual("Only Name Updated");
    });

    it("should return current user data if no fields are provided for update", async () => {
      mockDbLimit.mockResolvedValueOnce([rawUserFromDb]);
      const result = await repo.updateProfile(sampleUserId, {});
      expect(mockDb.update).not.toHaveBeenCalled();
      expect(result).toEqual(sampleSelectUser);
    });
  });

  describe("updatePassword", () => {
    it("should update user password hash", async () => {
      const newHash = "newSecurePasswordHash";
      mockDbWhere.mockResolvedValueOnce(undefined);

      await repo.updatePassword(sampleUserId, newHash);

      expect(mockDb.update).toHaveBeenCalledWith(userTable);
      expect(mockDbSet).toHaveBeenCalledWith({ passwordHash: newHash, updatedAt: expect.any(Date) });
      expect(mockDbWhere).toHaveBeenCalled();
    });
  });
});
