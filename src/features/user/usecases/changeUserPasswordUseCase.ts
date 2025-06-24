import { z } from "zod";
import { userRepository } from "@/db/repositories"; // This will now point to the feature-based repo due to index.ts update
import { updateUserPasswordSchema } from "@/features/user/schemas/userSchema";
import { NotFoundError } from "@/lib/errors/domainErrors";

/**
 * Schema for validating the input data for the `ChangeUserPasswordUseCase`.
 * It requires the user's ID and the new password hash.
 */
export const changeUserPasswordUseCaseInputSchema = z.object({
  userId: z.string().uuid("ID do usuário inválido."),
  newPasswordHash: z.string().min(1, "Hash da nova senha não pode ser vazio."),
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

    const existingUser = await this.repo.findById(userId);
    if (!existingUser) {
      throw new NotFoundError("Usuário");
    }

    await this.repo.updatePassword(userId, newPasswordHash);

    return { success: true };
  }
}
