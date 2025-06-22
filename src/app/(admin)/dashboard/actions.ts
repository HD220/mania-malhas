"use server";

import countActivePartnersUseCase from "@/usecases/partner/countActivePartnersUseCase";
// import countActivePartnersUseCase from "@/usecases/partner/countActivePartnersUseCase"; // Duplicate import removed
import countActiveProductsUseCase from "@/usecases/product/countActiveProductsUseCase";
import getPendingTransactionsStatsUseCase from "@/usecases/transaction/getPendingTransactionsStatsUseCase"; // Import new use case
import { unstable_noStore as noStore } from "next/cache";

/**
 * Fetches statistics for the admin dashboard.
 * This includes counts of active products, active partners,
 * and stats about pending transactions.
 *
 * Uses `unstable_noStore` to ensure data is fetched dynamically on each request.
 *
 * @returns {Promise<Object>} An object containing:
 *  - `success` (boolean): Indicates if the data fetching was successful.
 *  - `data` (object, optional): Contains the dashboard statistics:
 *    - `activeProductsCount` (number): Count of active products.
 *    - `activePartnersCount` (number): Count of active partners.
 *    - `pendingTransactionsCount` (number): Count of pending transactions.
 *    - `pendingTransactionsTotalValue` (number): Total value of pending transactions.
 *  - `message` (string, optional): An error message if `success` is false.
 */
export async function getDashboardStats() {
  noStore(); // Ensure fresh data on each load

  try {
    const [
      activeProductsCount,
      activePartnersCount,
      pendingTransactionsStats
    ] = await Promise.all([
      countActiveProductsUseCase(),
      countActivePartnersUseCase(),
      getPendingTransactionsStatsUseCase(),
    ]);

    return {
      success: true,
      data: {
        activeProductsCount,
        activePartnersCount,
        pendingTransactionsCount: pendingTransactionsStats.count,
        pendingTransactionsTotalValue: pendingTransactionsStats.totalValue,
      },
    };
  } catch (error: any) {
    console.error("getDashboardStats Error:", error.message, error.stack);
    return {
      success: false,
      message: error.message || "Erro ao buscar estatísticas do dashboard.",
      data: { // Return default/zeroed data on error to prevent UI breaks
        activeProductsCount: 0,
        activePartnersCount: 0,
        pendingTransactionsCount: 0,
        pendingTransactionsTotalValue: 0,
      },
    };
  }
}
