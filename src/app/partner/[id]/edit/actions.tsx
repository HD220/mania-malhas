"use server";

import {
  InsertPartner,
  insertPartnerSchema,
} from "@/db/repositories/schemas/partnerSchema";
import alterPartnerUseCase from "@/usecases/partner/alterPartnerUseCase";
import getPartnerByIdUseCase from "@/usecases/partner/getPartnerByIdUseCase";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";

export async function getPartnerById(id: string) {
  noStore();

  return await getPartnerByIdUseCase({ id });
}

export async function updatePartner({
  id,
  ...data
}: InsertPartner): Promise<void> {
  if (!id) throw new Error("Id to be defined!");
  const validation = insertPartnerSchema.parse(data);

  await alterPartnerUseCase(id, validation);

  revalidatePath("/partner/list");
  redirect("/partner/list");
}
