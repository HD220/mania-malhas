import { z } from "zod";
import { userRepository } from "@/db/repositories";
import {
  SelectUser,
  selectUserSchema,
  updateUserProfileSchema as zodUpdateUserProfileSchema, // aliasing to avoid name clash
  UpdateUserProfile as ZodUpdateUserProfileType // aliasing to avoid name clash
} from "@/db/repositories/schemas/userSchema";
import { NotFoundError } from "@/lib/errors/domainErrors";

// Input schema for UpdateUserProfileUseCase
// It includes userId and the fields for profile update
export const updateUserProfileUseCaseInputSchema = z.object({
  userId: z.string().uuid("ID do usuário inválido."),
  data: zodUpdateUserProfileSchema, // Use the schema from userSchema.ts
});
export type UpdateUserProfileUseCaseInput = z.infer<typeof updateUserProfileUseCaseInputSchema>;

// Output type is SelectUser
export type UpdateUserProfileUseCaseOutput = SelectUser;

export class UpdateUserProfileUseCase {
  private repo: ReturnType<typeof userRepository>;

  constructor() {
    this.repo = userRepository();
  }

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
