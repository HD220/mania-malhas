import { db } from "@/db/postgres";
import { partnerRepository } from "@/db/repositories/partnerRepository";

/**
 * Counts the number of active partners.
 * @returns Promise<number> The count of active partners.
 */
export default async function countActivePartnersUseCase(): Promise<number> {
  const repo = partnerRepository(db);
  const activePartners = await repo.findAll(true); // findAll(status = true)
  return activePartners.length;
}
