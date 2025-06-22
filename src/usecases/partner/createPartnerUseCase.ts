import { db } from "@/db/postgres";
import { partnerRepository } from "@/db/repositories/partnerRepository";
import {
  InsertPartner,
  insertPartnerSchema,
} from "@/db/repositories/schemas/partnerSchema";
import { ZodError } from "zod";

/**
 * Creates a new partner.
 *
 * This use case is responsible for:
 * 1. Validating the input data against the `insertPartnerSchema`.
 * 2. Interacting with the partner repository to persist the new partner.
 *
 * @param {InsertPartner} input - The partner data to be created.
 *   - `name`: Name of the partner.
 *   - `phone`: Phone number (10 or 11 digits).
 *   - `active` (optional): Status of the partner (defaults to true if not provided by schema or database default).
 *   - `notes` (optional): Additional notes.
 * @returns {Promise<{ id: string }>} A promise that resolves to an object containing the ID of the newly created partner.
 * @throws {ZodError} If the input data fails validation.
 * @throws {Error} If there's an issue with the repository during data persistence.
 */
export default async function createPartnerUseCase(
  input: InsertPartner
): Promise<{ id: string }> {
  // Validate input data using Zod schema. This will throw a ZodError if validation fails.
  const parsedInput = insertPartnerSchema.parse(input);

  const repo = partnerRepository(db);

  // Call the repository to insert the new partner.
  const result = await repo.insert(parsedInput);

  return result;
}
