import { db } from "@/db/postgres";
import { partnerRepository } from "@/db/repositories/partnerRepository";
import {
  InsertPartner,
  insertPartnerSchema,
} from "@/db/repositories/schemas/partnerSchema";

export default async function alterPartnerUseCase(
  id: string,
  input: InsertPartner
) {
  const parsed = insertPartnerSchema.safeParse(input);
  if (parsed.success) {
    const repo = partnerRepository(db);
    return await repo.update(id, parsed.data);
  }
  return { errors: parsed.error.issues.map((err) => err.message) };
}
