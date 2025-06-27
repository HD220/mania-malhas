"use server";

import { unstable_noStore as noStore } from "next/cache";

import countActivePartnersUseCase from "@/features/partner/usecases/count-active-partners.usecase";
import countActiveProductsUseCase from "@/features/product/usecases/countActiveProductsUseCase";
import getPendingTransactionsStatsUseCase from "@/features/transaction/usecases/getPendingTransactionsStatsUseCase"; // Import new use case

/**
 * Represents the successful data structure returned by `getDashboardStats`.
 */
export interface DashboardStatsData {
  activeProductsCount: number;
  activePartnersCount: number;
  pendingTransactionsCount: number;
  pendingTransactionsTotalValue: number;
}

/**
 * Represents the structure of the response from `getDashboardStats`.
 * It can indicate success with data or failure with a message.
 */
export type DashboardStatsResponse =
  | {
      success: true;
      data: DashboardStatsData;
    }
  | {
      success: false;
      message: string;
      data: DashboardStatsData; // Includes default/zeroed data on error
    };

/**
 * Fetches statistics for the admin dashboard.
 * This includes counts of active products, active partners,
 * and stats about pending transactions.
 *
 * Uses `unstable_noStore` to ensure data is fetched dynamically on each request.
 *
 * @returns {Promise<DashboardStatsResponse>} A promise that resolves to an object
 *  containing either the successfully fetched dashboard statistics or an error message.
 *  On error, `data` will contain default zeroed values.
 */
export async function getDashboardStats(): Promise<DashboardStatsResponse> {
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
