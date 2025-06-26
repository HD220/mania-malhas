import { db } from "@/lib/db-config/postgres"; // Updated
import { partnerRepository } from "@/features/partner/db/partner-repository"; // Updated

/**
 * Counts the number of active partners in the system.
 *
 * This use case interacts with the partner repository to fetch all active partners
 * and then returns the count of this collection. "Active" is typically determined
 * by a status flag (e.g., `active = true`) in the partner data.
 *
 * @returns {Promise<number>} A promise that resolves to the total number of active partners.
 * @throws {Error} If there's an issue with the repository during data retrieval.
 */
export default async function countActivePartnersUseCase(): Promise<number> {
  const repo = partnerRepository(db);
  // The `findAll(true)` method is expected to retrieve only partners marked as active.
  const activePartners = await repo.findAll(true);
  return activePartners.length;
}
