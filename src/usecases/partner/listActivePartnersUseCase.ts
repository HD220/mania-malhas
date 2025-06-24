import { db } from "@/db/postgres";
import { partnerRepository } from "@/db/repositories/partnerRepository";
import { SelectPartner } from "@/features/partner/schemas/partnerSchema";

/**
 * Fetches a list of all active partners.
 *
 * This use case interacts with the partner repository to retrieve all partners
 * that are marked as active (e.g., status is true).
 *
 * @returns {Promise<SelectPartner[]>} A promise that resolves to an array of active partners.
 *                                     Returns an empty array if no active partners are found.
 * @throws {Error} If there's an issue with the repository during data retrieval.
 */
export default async function listActivePartnersUseCase(): Promise<SelectPartner[]> {
  const repo = partnerRepository(db);
  // The `findAll` method in the repository, when called with `true`,
  // is expected to filter by status and return only active partners.
  const partners = await repo.findAll(true);
  return partners;
}

// Note: The commented-out section below suggesting a generic `getPartnersByStatusUseCase`
// is a good consideration for future refactoring if more status-based fetching needs arise.
// For now, this specific use case for active partners serves the current requirements.
