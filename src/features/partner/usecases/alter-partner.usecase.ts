import { db } from "@/lib/db-config/postgres"; // Updated path
import { partnerRepository } from "@/features/partner/db/partner-repository"; // Updated path
import {
  InsertPartner,
  insertPartnerSchema,
  SelectPartner,
} from "@/features/partner/schemas/partner.schema"; // Updated path
import { ZodError } from "zod";

/**
 * Alters an existing partner with the provided data.
 *
 * This use case is responsible for:
 * 1. Validating the input data against the `insertPartnerSchema`.
 * 2. Interacting with the partner repository to update the partner's information.
 *
 * @param {string} id - The ID of the partner to be altered.
 * @param {InsertPartner} data - The data to update the partner with. This should conform to `InsertPartner` schema.
 *   - `name`: Name of the partner.
 *   - `phone`: Phone number (10 or 11 digits).
 *   - `active` (optional): Status of the partner.
 *   - `notes` (optional): Additional notes.
 * @returns {Promise<SelectPartner | null>} A promise that resolves to the updated partner data
 *                                     or `null` if the partner was not found by the repository.
 * @throws {ZodError} If the input data fails validation.
 * @throws {Error} If there's an issue with the repository during data persistence (other than not found),
 *                 or if the provided ID is invalid (e.g., empty).
 */
export default async function alterPartnerUseCase(
  id: string,
  data: InsertPartner
): Promise<SelectPartner | null> {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    // It's generally better to throw an error for invalid input like a missing ID.
    // Alternatively, align with repository behavior if it handles invalid IDs by returning null.
    // For now, throwing an error for clearly invalid ID.
    throw new Error("Invalid Partner ID provided for alteration.");
  }

  // Validate input data using Zod schema.
  const validationResult = insertPartnerSchema.safeParse(data);
  if (!validationResult.success) {
    throw validationResult.error;
  }

  const repo = partnerRepository(db);

  // The repository's update method is expected to handle cases where the ID might not exist,
  // ideally returning null in such cases, or the updated partner data.
  // The current partnerRepository.update returns void. It should ideally return the updated entity or null.
  // For now, we'll call update and then findById to get the updated data.
  await repo.update(id, validationResult.data);
  const updatedPartner = await repo.findById(id); // Re-fetch to get updated data

  return updatedPartner;
}
