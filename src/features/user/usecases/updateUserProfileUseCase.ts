import { z } from "zod";
import { userRepository } from "@/db/repositories";
import {
  SelectUser,
  selectUserSchema,
  updateUserProfileSchema as zodUpdateUserProfileSchema,
  UpdateUserProfile as ZodUpdateUserProfileType
} from "@/features/user/schemas/userSchema";
import { NotFoundError } from "@/lib/errors/domainErrors";

export const updateUserProfileUseCaseInputSchema = z.object({
  userId: z.string().uuid("ID do usuário inválido."),
  data: zodUpdateUserProfileSchema,
});

export type UpdateUserProfileUseCaseInput = z.infer<typeof updateUserProfileUseCaseInputSchema>;
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

    const existingUser = await this.repo.findById(userId);
    if (!existingUser) {
      throw new NotFoundError("Usuário");
    }

    const updatedUser = await this.repo.updateProfile(userId, data as ZodUpdateUserProfileType);

    if (!updatedUser) {
      throw new Error("Falha ao atualizar o perfil do usuário após a verificação.");
    }

    return selectUserSchema.parse(updatedUser);
  }
}
