import { db } from "@/db/postgres";
import { partnerRepository } from "@/db/repositories/partnerRepository";
import { SelectPartner } from "@/db/repositories/schemas/partnerSchema";

/**
 * Fetches a list of all active partners.
 *
 * This use case calls the `findAll` method of the partner repository,
 * explicitly passing `true` to retrieve only active partners.
 *
 * @returns {Promise<SelectPartner[]>} A promise that resolves to an array of active partners.
 *                                     Returns an empty array if no active partners are found.
 * @throws {Error} If there's an issue with the repository during data retrieval.
 */
export default async function listActivePartnersUseCase(): Promise<SelectPartner[]> {
  const repo = partnerRepository(db);
  // The `findAll` method in the repository is expected to filter by status=true
  // when this argument is provided.
  const partners = await repo.findAll(true);
  return partners;
}

// Potentially, a more generic use case could be:
// export async function getPartnersByStatusUseCase(status: boolean): Promise<SelectPartner[]> {
//   const repo = partnerRepository(db);
//   const partners = await repo.findAll(status);
//   return partners;
// }
// And then listActivePartnersUseCase could call getPartnersByStatusUseCase(true)
// For now, a specific one is fine as per typical needs.
