import { db } from "@/db/postgres";
import { productRepository } from "@/db/repositories/productRepository";

export default async function getInativeProductsUseCase() {
  const products = await productRepository(db).findAll(false);

  return products;
}
