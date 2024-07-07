import { db } from "@/db/postgres";
import { partnerRepository } from "@/db/repositories/partnerRepository";

export default async function getPartnersUseCase(
  search: string,
  status: boolean
) {
  const partners = await partnerRepository(db).findBySearch(search, status);

  return partners;
}
