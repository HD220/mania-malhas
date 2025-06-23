"use server";

import getProductsUseCase from "@/usecases/product/getProductsUseCase";
import { unstable_noStore as noStore } from "next/cache"; // Padronizado para noStore

export async function getProducts(search: string, status: boolean) {
  noStore(); // Padronizado para noStore
  return await getProductsUseCase(search, status);
}
