import { z } from "zod";
import { userRepository } from "@/db/repositories";
import {
  SelectUser,
  selectUserSchema,
  updateUserProfileSchema as zodUpdateUserProfileSchema, // aliasing to avoid name clash
  UpdateUserProfile as ZodUpdateUserProfileType
} from "@/db/repositories/schemas/userSchema";
import { NotFoundError } from "@/lib/errors/domainErrors";

/**
 * Schema for validating the input data for the `UpdateUserProfileUseCase`.
 * It requires the user's ID and a data object conforming to `zodUpdateUserProfileSchema`
 * (which allows partial updates to user profile fields like name and email).
 */
export const updateUserProfileUseCaseInputSchema = z.object({
  /** The UUID of the user whose profile is to be updated. */
  userId: z.string().uuid("ID do usuário inválido."),
  /** An object containing the profile fields to update (e.g., name, email). */
  data: zodUpdateUserProfileSchema,
});

/**
 * Type definition for the input data required by `UpdateUserProfileUseCase`.
 * Inferred from `updateUserProfileUseCaseInputSchema`.
 */
export type UpdateUserProfileUseCaseInput = z.infer<typeof updateUserProfileUseCaseInputSchema>;

/**
 * Type definition for the output of `UpdateUserProfileUseCase`.
 * Represents the updated user profile data, aliasing `SelectUser` from the schema.
 */
export type UpdateUserProfileUseCaseOutput = SelectUser;

/**
 * Use case for updating a user's profile information.
 * It validates the input, ensures the user exists, updates the profile data
 * in the repository, and returns the updated user profile.
 */
export class UpdateUserProfileUseCase {
  private repo: ReturnType<typeof userRepository>;

  /**
   * Constructs a new `UpdateUserProfileUseCase`.
   * Initializes the user repository.
   */
  constructor() {
    this.repo = userRepository();
  }

  /**
   * Executes the use case to update a user's profile.
   * @param input - The input data containing `userId` and the `data` to update.
   * @returns A Promise that resolves to the updated user's profile data.
   * @throws {z.ZodError} If the input validation fails.
   * @throws {NotFoundError} If the user with the given `userId` is not found.
   * @throws {Error} If the update fails unexpectedly after the user is found.
   */
  async execute(input: UpdateUserProfileUseCaseInput): Promise<UpdateUserProfileUseCaseOutput> {
    const validationResult = updateUserProfileUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      throw new z.ZodError(validationResult.error.issues);
    }

    const { userId, data } = validationResult.data;

    // 1. Check if user exists
    const existingUser = await this.repo.findById(userId);
    if (!existingUser) {
      throw new NotFoundError("Usuário");
    }

    // 2. Perform the update
    // The repository's updateProfile method already handles partial updates
    // and returns the updated user or null if not found (though we found it already).
    const updatedUser = await this.repo.updateProfile(userId, data as ZodUpdateUserProfileType);

    if (!updatedUser) {
      // This case should ideally not be reached if findById passed and repo.updateProfile is consistent.
      // However, it's good practice to handle it, perhaps indicating a race condition or unexpected repo behavior.
      throw new Error("Falha ao atualizar o perfil do usuário após a verificação.");
    }

    return selectUserSchema.parse(updatedUser); // Ensure conformity
  }
}
