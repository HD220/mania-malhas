import { z } from "zod";
import { userRepository } from "@/db/repositories";
import { updateUserPasswordSchema } from "@/db/repositories/schemas/userSchema"; // Corrected import
import { NotFoundError } from "@/lib/errors/domainErrors";

// Input schema for ChangeUserPasswordUseCase
// For now, it only takes userId and the newPasswordHash.
// In a real app, it would likely take `currentPassword` for verification and `newPassword` (plain text).
// The hashing of `newPassword` would then occur within this use case or a dedicated service.
// Here, we assume `newPasswordHash` is already appropriately hashed by the caller (e.g., a Server Action).
export const changeUserPasswordUseCaseInputSchema = z.object({
  userId: z.string().uuid("ID do usuário inválido."),
  newPasswordHash: z.string().min(1, "Hash da nova senha não pode ser vazio."), // Basic check, actual hash complexity isn't validated here
});
export type ChangeUserPasswordUseCaseInput = z.infer<typeof changeUserPasswordUseCaseInputSchema>;

export interface ChangeUserPasswordUseCaseOutput {
  success: boolean;
}

export class ChangeUserPasswordUseCase {
  private repo: ReturnType<typeof userRepository>;

  constructor() {
    this.repo = userRepository();
  }

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
