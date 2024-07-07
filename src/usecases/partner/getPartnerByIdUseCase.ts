import { db } from "@/db/postgres";
import { partnerRepository } from "@/db/repositories/partnerRepository";

export default async function getPartnerByIdUseCase({ id }: { id: string }) {
  return await partnerRepository(db).findById(id);
}
