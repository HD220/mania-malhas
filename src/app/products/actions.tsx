"use server";

import getActiveProductsUseCase from "@/usecases/product/getActiveProductsUseCase";
import { unstable_noStore as noCache } from "next/cache";

export async function getProducts() {
  noCache();

  return await getActiveProductsUseCase();
}
