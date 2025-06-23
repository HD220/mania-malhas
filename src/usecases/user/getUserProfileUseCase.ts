import { z } from "zod";
import { userRepository } from "@/db/repositories";
import { SelectUser, selectUserSchema } from "@/db/repositories/schemas/userSchema";
import { NotFoundError } from "@/lib/errors/domainErrors";

/**
 * Schema for validating the input data for the `GetUserProfileUseCase`.
 * Requires the user's ID.
 */
export const getUserProfileUseCaseInputSchema = z.object({
  /** The UUID of the user whose profile is to be fetched. */
  userId: z.string().uuid("ID do usuário inválido."),
});

/**
 * Type definition for the input data required by `GetUserProfileUseCase`.
 * Inferred from `getUserProfileUseCaseInputSchema`.
 */
export type GetUserProfileUseCaseInput = z.infer<typeof getUserProfileUseCaseInputSchema>;

/**
 * Type definition for the output of `GetUserProfileUseCase`.
 * Represents the selected user profile data, aliasing `SelectUser` from the schema.
 */
export type GetUserProfileUseCaseOutput = SelectUser;

/**
 * Use case for fetching a user's profile information.
 * It validates the input `userId`, retrieves the user from the repository,
 * and returns the user's profile data.
 */
export class GetUserProfileUseCase {
  private repo: ReturnType<typeof userRepository>;

  /**
   * Constructs a new `GetUserProfileUseCase`.
   * Initializes the user repository.
   */
  constructor() {
    this.repo = userRepository();
  }

  /**
   * Executes the use case to fetch a user's profile.
   * @param input - The input data containing the `userId`.
   * @returns A Promise that resolves to the user's profile data.
   * @throws {z.ZodError} If the input validation fails.
   * @throws {NotFoundError} If the user with the given `userId` is not found.
   */
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
