import { db } from "@/db/postgres";
import { productRepository } from "@/db/repositories/productRepository";

export default async function getInactiveProductsUseCase() { // Corrigido: Inative -> Inactive
  const products = await productRepository(db).findAll(false);

  return products;
}
