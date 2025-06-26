import { db } from "@/lib/db-config/postgres"; // Updated
import { partnerRepository } from "@/features/partner/db/partner-repository"; // Updated
import { SelectPartner } from "@/features/partner/schemas/partner.schema"; // Updated

/**
 * Searches for partners based on a search term and their status.
 *
 * This use case allows for searching partners by matching the search term against
 * relevant partner fields (e.g., name, notes, phone - depends on repository implementation)
 * and filtering by the partner's active status.
 *
 * The search term is trimmed before being passed to the repository.
 * The behavior for an empty search term (after trimming) depends on the
 * repository's `findBySearch` implementation (it might return all partners
 * matching the status, or none).
 *
 * @param {string} search - The search term to filter partners by.
 * @param {boolean} [status=true] - The status of the partners to fetch (true for active, false for inactive).
 *                                  Defaults to `true` (active partners).
 * @returns {Promise<SelectPartner[]>} A promise that resolves to an array of partners
 *                                     matching the search criteria and status. Returns an
 *                                     empty array if no matching partners are found.
 * @throws {Error} If there's an issue with the repository during data retrieval.
 */
export default async function searchPartnersUseCase(
  search: string,
  status: boolean = true
): Promise<SelectPartner[]> {
  const repo = partnerRepository(db);
  // The repository's findBySearch method is responsible for the actual search logic,
  // including how an empty search string (after trim) is handled.
  const partners = await repo.findBySearch(search.trim(), status);

  return partners;
}
