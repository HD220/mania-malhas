"use server";

import getPartnersUseCase from "@/usecases/partner/getPartnersUseCase";
import { unstable_noStore as noCache } from "next/cache";

export async function getPartners(search: string, status: boolean) {
  noCache();
  return await getPartnersUseCase(search, status);
}
