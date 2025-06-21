import { db } from "@/db/postgres";
import { partnerRepository } from "@/db/repositories/partnerRepository";
import {
  InsertPartner,
  insertPartnerSchema,
} from "@/db/repositories/schemas/partnerSchema";
import { ZodError } from "zod";

/**
 * Alters an existing partner's details.
 *
 * This use case is responsible for:
 * 1. Validating the input data against the `insertPartnerSchema`.
 *    (Note: `insertPartnerSchema` is used for both create and update, `id` is handled separately).
 * 2. Interacting with the partner repository to update the partner's data.
 *
 * @param {string} id - The ID of the partner to be altered.
 * @param {InsertPartner} input - The partner data to update. This should conform to `InsertPartner` schema,
 *                                excluding `id` as it's passed separately.
 *   - `name`: Name of the partner.
 *   - `phone`: Phone number (10 or 11 digits).
 *   - `active` (optional): Status of the partner.
 *   - `notes` (optional): Additional notes.
 * @returns {Promise<void>} A promise that resolves when the partner has been successfully updated.
 * @throws {ZodError} If the input data fails validation.
 * @throws {Error} If there's an issue with the repository during data persistence or if the ID is invalid.
 */
export default async function alterPartnerUseCase(
  id: string,
  input: InsertPartner
): Promise<void> {
  if (!id) {
    // Consider throwing a specific error for invalid ID if not handled by repository
    throw new Error("Partner ID is required for alteration.");
  }

  // Validate input data using Zod schema.
  // safeParse is used to explicitly handle the ZodError.
  const validationResult = insertPartnerSchema.safeParse(input);
  if (!validationResult.success) {
    throw validationResult.error;
  }

  const repo = partnerRepository(db);

  // Call the repository to update the partner.
  // The repository's update method is expected to handle cases where the ID might not exist,
  // though this use case doesn't explicitly check for existence beforehand.
  await repo.update(id, validationResult.data);

  // No explicit return value, resolves if successful.
}
