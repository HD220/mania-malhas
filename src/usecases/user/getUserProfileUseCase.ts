import { z } from "zod";
import { userRepository } from "@/db/repositories"; // Assumes default export from new index.ts
import { SelectUser, selectUserSchema } from "@/db/repositories/schemas/userSchema";
import { NotFoundError } from "@/lib/errors/domainErrors";

// Input schema for GetUserProfileUseCase
export const getUserProfileUseCaseInputSchema = z.object({
  userId: z.string().uuid("ID do usuário inválido."),
});
export type GetUserProfileUseCaseInput = z.infer<typeof getUserProfileUseCaseInputSchema>;

// Output type is SelectUser, already defined and exported by userSchema.ts
// We can re-export it or use it directly.
export type GetUserProfileUseCaseOutput = SelectUser;

export class GetUserProfileUseCase {
  private repo: ReturnType<typeof userRepository>;

  constructor() {
    // Get the actual repository instance.
    // The userRepository is a factory function, so we call it.
    this.repo = userRepository();
  }

  async execute(input: GetUserProfileUseCaseInput): Promise<GetUserProfileUseCaseOutput> {
    const validationResult = getUserProfileUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      throw new z.ZodError(validationResult.error.issues);
    }

    const { userId } = validationResult.data;

    const user = await this.repo.findById(userId);

    if (!user) {
      throw new NotFoundError("Usuário");
    }

    // The user object from repo.findById should already conform to SelectUser.
    // but selectUserSchema.parse ensures it, useful if repo changes or for explicit validation.
    return selectUserSchema.parse(user);
  }
}
