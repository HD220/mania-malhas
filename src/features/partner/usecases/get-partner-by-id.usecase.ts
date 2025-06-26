import { db } from "@/lib/db-config/postgres"; // Updated
import { partnerRepository } from "@/features/partner/db/partner-repository"; // Updated
import { SelectPartner } from "@/features/partner/schemas/partner.schema"; // Updated

/**
 * Fetches a specific partner by their ID.
 *
 * This use case interacts with the partner repository to retrieve a partner.
 * It expects the repository's `findById` method to return the partner data
 * or `null` if the partner is not found or if the ID is invalid leading to no result.
 *
 * @param {string} id - The ID of the partner to fetch. Must be a non-empty string.
 * @returns {Promise<SelectPartner | null>} A promise that resolves to the partner data
 *                                          or `null` if the partner is not found or ID is invalid.
 * @throws {Error} If there's an issue with the repository during data retrieval,
 *                 other than not finding the partner due to a valid ID.
 */
export default async function getPartnerByIdUseCase(
  id: string
): Promise<SelectPartner | null> {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    console.warn("getPartnerByIdUseCase: Invalid or empty ID provided."); // Changed to warn
    return null;
  }
  const repo = partnerRepository(db);
  const partner = await repo.findById(id);
  // Repository's findById is expected to return null if not found or on parse error for the ID.
  return partner;
}
