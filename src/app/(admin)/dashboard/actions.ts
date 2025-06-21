"use server";

import countActivePartnersUseCase from "@/usecases/partner/countActivePartnersUseCase";
import countActivePartnersUseCase from "@/usecases/partner/countActivePartnersUseCase";
import countActiveProductsUseCase from "@/usecases/product/countActiveProductsUseCase";
import { unstable_noStore as noStore } from "next/cache";

/**
 * Fetches statistics for the admin dashboard.
 * This includes counts of active products and active partners.
 *
 * Uses `unstable_noStore` to ensure data is fetched dynamically on each request.
 *
 * @returns {Promise<Object>} An object containing:
 *  - `success` (boolean): Indicates if the data fetching was successful.
 *  - `data` (object, optional): Contains the dashboard statistics:
 *    - `activeProductsCount` (number): Count of active products.
 *    - `activePartnersCount` (number): Count of active partners.
 *  - `message` (string, optional): An error message if `success` is false.
 */
export async function getDashboardStats() {
  noStore(); // Ensure fresh data on each load

  try {
    const [activeProductsCount, activePartnersCount] = await Promise.all([
      countActiveProductsUseCase(),
      countActivePartnersUseCase(),
      // TODO: Add more stats like pending transactions count/value later
    ]);

    return {
      success: true,
      data: {
        activeProductsCount,
        activePartnersCount,
      },
    };
  } catch (error: any) {
    console.error("getDashboardStats Error:", error);
    return {
      success: false,
      message: error.message || "Erro ao buscar estatísticas do dashboard.",
      data: {
        activeProductsCount: 0,
        activePartnersCount: 0,
      },
    };
  }
}
