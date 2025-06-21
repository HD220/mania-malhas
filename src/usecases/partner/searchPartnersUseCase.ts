import { db } from "@/db/postgres";
import { partnerRepository } from "@/db/repositories/partnerRepository";
import { SelectPartner } from "@/db/repositories/schemas/partnerSchema";

/**
 * Searches for partners based on a search term and status.
 *
 * The search term is typically matched against fields like name, notes, or phone.
 * The repository's `findBySearch` method handles the actual search logic.
 *
 * @param {string} search - The search term to filter partners. The string is trimmed before use.
 * @param {boolean} [status=true] - The status of partners to search for (true for active, false for inactive).
 *                                  Defaults to true (active partners).
 * @returns {Promise<SelectPartner[]>} A promise that resolves to an array of matching partners.
 *                                     Returns an empty array if no partners match the criteria.
 * @throws {Error} If there's an issue with the repository during data retrieval.
 */
export default async function searchPartnersUseCase(
  search: string,
  status: boolean = true
): Promise<SelectPartner[]> {
  // Note on empty search string:
  // The behavior of `repo.findBySearch` with an empty `search.trim()` string
  // (e.g., returning all partners of the given status, or none)
  // depends on the SQL LIKE logic within the repository.
  // This use case currently assumes the repository handles it as desired.

  const repo = partnerRepository(db);
  const partners = await repo.findBySearch(search.trim(), status);

  return partners;
}
