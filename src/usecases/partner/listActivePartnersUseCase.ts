import { db } from "@/db/postgres";
import { partnerRepository } from "@/db/repositories/partnerRepository";
import { SelectPartner } from "@/db/repositories/schemas/partnerSchema";

/**
 * Fetches a list of active partners.
 * @returns Promise<SelectPartner[]> A list of active partners.
 */
export default async function listActivePartnersUseCase(): Promise<SelectPartner[]> {
  const repo = partnerRepository(db);
  // Assuming findAll without arguments or with status=true fetches active partners
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
