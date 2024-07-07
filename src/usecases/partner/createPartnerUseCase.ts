import { db } from "@/db/postgres";
import { partnerRepository } from "@/db/repositories/partnerRepository";
import {
  InsertPartner,
  insertPartnerSchema,
} from "@/db/repositories/schemas/partnerSchema";

export default async function createPartnerUseCase(input: InsertPartner) {
  const parsed = insertPartnerSchema.parse(input);
  const repo = partnerRepository(db);
  return await repo.insert(parsed);
}
