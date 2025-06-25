"use server";

import countActivePartnersUseCase from "@/features/partner/usecases/countActivePartnersUseCase";
import countActiveProductsUseCase from "@/usecases/product/countActiveProductsUseCase"; // Will need update when product use cases move
import getPendingTransactionsStatsUseCase from "@/features/transaction/usecases/getPendingTransactionsStatsUseCase";
import { unstable_noStore as noStore } from "next/cache";

export interface DashboardStatsData {
  activeProductsCount: number;
  activePartnersCount: number;
  pendingTransactionsCount: number;
  pendingTransactionsTotalValue: number;
}

export type DashboardStatsResponse =
  | {
      success: true;
      data: DashboardStatsData;
    }
  | {
      success: false;
      message: string;
      data: DashboardStatsData;
    };

export async function getDashboardStats(): Promise<DashboardStatsResponse> {
  noStore();

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
      data: {
        activeProductsCount: 0,
        activePartnersCount: 0,
        pendingTransactionsCount: 0,
        pendingTransactionsTotalValue: 0,
      },
    };
  }
}
