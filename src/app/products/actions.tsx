"use server";

import getProductsUseCase from "@/usecases/product/getProductsUseCase";
import { unstable_noStore as noCache } from "next/cache";

export async function getProducts(search: string, status: boolean) {
  noCache();
  console.log("status", status);
  return await getProductsUseCase(search, status);
}
