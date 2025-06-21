import { db } from "@/db/postgres";
import { partnerRepository } from "@/db/repositories/partnerRepository";
import { SelectPartner } from "@/db/repositories/schemas/partnerSchema";

/**
 * Fetches a specific partner by their ID.
 *
 * This use case interacts with the partner repository to retrieve a partner.
 * It expects the repository's `findById` method to return the partner data
 * or `null` if the partner is not found.
 *
 * @param {string} id - The ID of the partner to fetch.
 * @returns {Promise<SelectPartner | null>} A promise that resolves to the partner data
 *                                          or `null` if the partner is not found.
 * @throws {Error} If there's an issue with the repository during data retrieval,
 *                 other than not finding the partner, or if the ID is invalid.
 */
export default async function getPartnerByIdUseCase(
  id: string
): Promise<SelectPartner | null> {
  if (!id || typeof id !== 'string') { // Adicionada verificação básica do ID
    // Consider throwing a specific error or returning null based on desired contract
    console.error("getPartnerByIdUseCase: ID inválido fornecido.");
    return null;
  }
  const repo = partnerRepository(db);
  const partner = await repo.findById(id);
  return partner;
}
