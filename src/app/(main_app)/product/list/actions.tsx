"use server";

import { unstable_noStore as noStore } from "next/cache";

import getProductsUseCase from "@/features/product/usecases/get-products.usecase";

export async function getProducts(search: string, status: boolean) {
  noStore(); // Padronizado para noStore
  return await getProductsUseCase(search, status);
}
