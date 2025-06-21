import { db } from "@/db/postgres";
import { partnerRepository } from "@/db/repositories/partnerRepository";
import {
  InsertPartner,
  insertPartnerSchema,
} from "@/db/repositories/schemas/partnerSchema";
import { ZodError } from "zod"; // Import ZodError

export default async function alterPartnerUseCase(
  id: string,
  input: InsertPartner
) {
  // Use parse() which throws ZodError on failure
  // Or, keep safeParse and throw explicitly:
  const validationResult = insertPartnerSchema.safeParse(input);
  if (!validationResult.success) {
    throw validationResult.error; // Throw the ZodError directly
  }

  const repo = partnerRepository(db);
  return await repo.update(id, validationResult.data);
}
