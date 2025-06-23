import { z } from "zod";
import { userRepository } from "@/db/repositories";
import { updateUserPasswordSchema } from "@/db/repositories/schemas/userSchema"; // Corrected import
import { NotFoundError } from "@/lib/errors/domainErrors";

/**
 * Schema for validating the input data for the `ChangeUserPasswordUseCase`.
 * It requires the user's ID and the new password hash.
 *
 * @remarks
 * In a production scenario, this use case would typically also require the current password
 * for verification, and the new password would be provided in plain text to be hashed
 * within the use case or a dedicated password service. For simplicity in this context,
 * it's assumed the new password hash is pre-computed by the caller.
 */
export const changeUserPasswordUseCaseInputSchema = z.object({
  /** The UUID of the user whose password is to be changed. */
  userId: z.string().uuid("ID do usuário inválido."),
  /** The pre-computed hash of the new password. */
  newPasswordHash: z.string().min(1, "Hash da nova senha não pode ser vazio."),
});

/**
 * Type definition for the input data required by `ChangeUserPasswordUseCase`.
 * Inferred from `changeUserPasswordUseCaseInputSchema`.
 */
export type ChangeUserPasswordUseCaseInput = z.infer<typeof changeUserPasswordUseCaseInputSchema>;

/**
 * Defines the structure of the output from `ChangeUserPasswordUseCase`.
 */
export interface ChangeUserPasswordUseCaseOutput {
  /** Boolean indicating whether the password change was successful. */
  success: boolean;
}

/**
 * Use case for changing a user's password.
 * It validates the input, ensures the user exists, and then updates the password
 * hash in the repository.
 */
export class ChangeUserPasswordUseCase {
  private repo: ReturnType<typeof userRepository>;

  /**
   * Constructs a new `ChangeUserPasswordUseCase`.
   * Initializes the user repository.
   */
  constructor() {
    this.repo = userRepository();
  }

  /**
   * Executes the use case to change a user's password.
   * @param input - The input data containing `userId` and `newPasswordHash`.
   * @returns A Promise that resolves to an object indicating success.
   * @throws {z.ZodError} If the input validation fails.
   * @throws {NotFoundError} If the user with the given `userId` is not found.
   */
  async execute(input: ChangeUserPasswordUseCaseInput): Promise<ChangeUserPasswordUseCaseOutput> {
    const validationResult = changeUserPasswordUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      throw new z.ZodError(validationResult.error.issues);
    }

    const { userId, newPasswordHash } = validationResult.data;

    // 1. Check if user exists (optional, as repo.updatePassword might not fail for non-existent user)
    // However, it's good practice for a use case to confirm the entity it's acting upon.
    const existingUser = await this.repo.findById(userId);
    if (!existingUser) {
      throw new NotFoundError("Usuário");
    }

    // 2. Perform the password update
    // The repository's updatePassword method handles setting the new hash.
    await this.repo.updatePassword(userId, newPasswordHash);

    return { success: true };
  }
}
