import { db } from "@/db/postgres";
import { partnerRepository } from "@/db/repositories/partnerRepository";
import { SelectPartner } from "@/db/repositories/schemas/partnerSchema";

export default async function searchPartnersUseCase(
  search: string,
  status: boolean = true // Default status to true (active)
): Promise<SelectPartner[]> {
  // It might be beneficial to trim the search string.
  // If search is an empty string, findBySearch might return all partners or none,
  // depending on its SQL LIKE logic. Consider if this is the desired behavior
  // or if an empty search should perhaps call findAll or return an empty array.
  // For now, assuming findBySearch handles empty strings appropriately (e.g., returns all matching status).

  const repo = partnerRepository(db);
  const partners = await repo.findBySearch(search.trim(), status);

  return partners;
}
