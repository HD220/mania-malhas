import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDashboardStats } from './actions';
import countActiveProductsUseCase from '@/usecases/product/countActiveProductsUseCase';
import countActivePartnersUseCase from '@/features/partner/usecases/countActivePartnersUseCase';
import getPendingTransactionsStatsUseCase from '@/features/transaction/usecases/getPendingTransactionsStatsUseCase';

import { unstable_noStore } from 'next/cache'; // Importar diretamente

// Mock dos casos de uso
vi.mock('@/usecases/product/countActiveProductsUseCase');
vi.mock('@/features/partner/usecases/countActivePartnersUseCase');
vi.mock('@/features/transaction/usecases/getPendingTransactionsStatsUseCase');

// Mock de next/cache
vi.mock('next/cache', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/cache')>();
  return {
    ...actual,
    unstable_noStore: vi.fn(),
  };
});


describe('getDashboardStats Server Action', () => {
  const mockCountActiveProducts = countActiveProductsUseCase as ReturnType<typeof vi.fn>;
  const mockCountActivePartners = countActivePartnersUseCase as ReturnType<typeof vi.fn>;
  const mockGetPendingStats = getPendingTransactionsStatsUseCase as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return dashboard stats successfully when all use cases succeed', async () => {
    mockCountActiveProducts.mockResolvedValue(10);
    mockCountActivePartners.mockResolvedValue(5);
    mockGetPendingStats.mockResolvedValue({ count: 3, totalValue: 1500.75 });

    const response = await getDashboardStats();

    expect(response.success).toBe(true);
    expect(response.data).toEqual({
      activeProductsCount: 10,
      activePartnersCount: 5,
      pendingTransactionsCount: 3,
      pendingTransactionsTotalValue: 1500.75,
    });
    expect(response.message).toBeUndefined();
    expect(unstable_noStore).toHaveBeenCalled(); // Usar importado
  });

  it('should return success false and default data if countActiveProductsUseCase fails', async () => {
    const errorMessage = 'Error counting products';
    mockCountActiveProducts.mockRejectedValue(new Error(errorMessage));
    mockCountActivePartners.mockResolvedValue(5); // Outros mocks bem-sucedidos
    mockGetPendingStats.mockResolvedValue({ count: 3, totalValue: 1500.75 });

    const response = await getDashboardStats();

    expect(response.success).toBe(false);
    expect(response.message).toBe(errorMessage);
    expect(response.data).toEqual({
      activeProductsCount: 0,
      activePartnersCount: 0,
      pendingTransactionsCount: 0,
      pendingTransactionsTotalValue: 0,
    });
  });

  it('should return success false and default data if countActivePartnersUseCase fails', async () => {
    const errorMessage = 'Error counting partners';
    mockCountActiveProducts.mockResolvedValue(10);
    mockCountActivePartners.mockRejectedValue(new Error(errorMessage));
    mockGetPendingStats.mockResolvedValue({ count: 3, totalValue: 1500.75 });

    const response = await getDashboardStats();

    expect(response.success).toBe(false);
    expect(response.message).toBe(errorMessage);
    expect(response.data).toEqual({
      activeProductsCount: 0,
      activePartnersCount: 0,
      pendingTransactionsCount: 0,
      pendingTransactionsTotalValue: 0,
    });
  });

  it('should return success false and default data if getPendingTransactionsStatsUseCase fails', async () => {
    const errorMessage = 'Error getting pending stats';
    mockCountActiveProducts.mockResolvedValue(10);
    mockCountActivePartners.mockResolvedValue(5);
    mockGetPendingStats.mockRejectedValue(new Error(errorMessage));

    const response = await getDashboardStats();

    expect(response.success).toBe(false);
    expect(response.message).toBe(errorMessage);
    expect(response.data).toEqual({
      activeProductsCount: 0,
      activePartnersCount: 0,
      pendingTransactionsCount: 0,
      pendingTransactionsTotalValue: 0,
    });
  });
});
