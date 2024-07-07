"use server";

import {
  InsertPartner,
  insertPartnerSchema,
} from "@/db/repositories/schemas/partnerSchema";
import createPartnerUseCase from "@/usecases/partner/createPartnerUseCase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPartner(data: InsertPartner) {
  const parsed = insertPartnerSchema.parse(data);

  await createPartnerUseCase(parsed);

  revalidatePath("/partner/list");
  redirect("/partner/list");
}
