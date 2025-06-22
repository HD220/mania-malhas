import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import TransactionsListPage from './page'; // Component to test
import { listTransactionsAction } from '../actions'; // Import the specific action
import { PaginatedTransactionsResult } from '@/usecases/transaction/getTransactionsUseCase';
import { TransactionWithPartner } from '@/db/repositories/transactionRepository';

// Mock Next.js components and hooks
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: vi.fn() }),
  usePathname: () => '/transactions/list',
}));

// Mock the toast hook
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

// Mock the server action module - now synchronous
vi.mock('../actions', () => ({
  listTransactionsAction: vi.fn(), // Specifically mock listTransactionsAction
}));

// listTransactionsAction imported above should now be the vi.fn() instance

const mockInitialTransaction: TransactionWithPartner = {
  id: 'txn_1',
  description: 'Initial Transaction',
  value: "150.00",
  type: 'E',
  status: 'Pago',
  partnerId: 'partner_1',
  partnerName: 'Initial Partner',
  date: new Date('2023-02-10'),
  due_date: new Date('2023-02-15'),
  createdAt: new Date(),
  updatedAt: new Date(),
  transactionId: null,
};

const mockFilteredTransaction: TransactionWithPartner = {
  id: 'txn_2',
  description: 'Filtered Coffee Purchase',
  value: "25.00",
  type: 'S',
  status: 'Pendente',
  partnerId: 'partner_2',
  partnerName: 'Coffee Shop',
  date: new Date('2023-03-05'),
  due_date: new Date('2023-03-10'),
  createdAt: new Date(),
  updatedAt: new Date(),
  transactionId: null,
};

const mockInitialResponse: PaginatedTransactionsResult = {
  data: [mockInitialTransaction],
  totalItems: 1,
  totalPages: 1,
  currentPage: 1,
  pageSize: 10,
};

const mockFilteredResponse: PaginatedTransactionsResult = {
  data: [mockFilteredTransaction],
  totalItems: 1,
  totalPages: 1,
  currentPage: 1,
  pageSize: 10,
};

const mockEmptyResponse: PaginatedTransactionsResult = {
  data: [],
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
  pageSize: 10,
};

describe('TransactionsListPage', () => {

  beforeEach(() => {
    // vi.useFakeTimers(); // For debounce - Temporarily removed for diagnostics
    (listTransactionsAction as vi.Mock).mockClear(); // Clear previous calls and instances
    (listTransactionsAction as vi.Mock).mockResolvedValue({ success: true, data: mockInitialResponse }); // Set default resolution
  });

  afterEach(() => {
    // vi.runOnlyPendingTimers(); // Temporarily removed
    // vi.useRealTimers(); // Temporarily removed
    (listTransactionsAction as vi.Mock).mockClear(); // Clear this specific mock
  });

  it('should render and load initial transactions', async () => {
    render(<TransactionsListPage />);

    await waitFor(() => {
      expect(listTransactionsAction).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Initial Transaction')).toBeInTheDocument();
    });
  });

  it('should call listTransactionsAction with description filter when user types in search input', async () => {
    (listTransactionsAction as vi.Mock)
      .mockResolvedValueOnce({ success: true, data: mockInitialResponse }) // Initial load
      .mockResolvedValueOnce({ success: true, data: mockFilteredResponse }); // Filtered load

    render(<TransactionsListPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Initial Transaction')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Ex: Venda Camiseta...');
    fireEvent.change(searchInput, { target: { value: 'Coffee' } });

    // Fast-forward timers to trigger debounce
    vi.advanceTimersByTime(500); // Debounce time is 500ms

    await waitFor(() => {
      expect(listTransactionsAction).toHaveBeenCalledTimes(2); // Initial load + filtered load
      expect(listTransactionsAction).toHaveBeenLastCalledWith(
        { description: 'Coffee' }, // filters
        { page: 1, pageSize: 10 },  // pagination
        { column: 'date', direction: 'desc' } // orderBy (default)
      );
    });

    // Check if the UI updates with filtered data
    await waitFor(() => {
        expect(screen.getByText('Filtered Coffee Purchase')).toBeInTheDocument();
        expect(screen.queryByText('Initial Transaction')).not.toBeInTheDocument();
    });
  });

  it('should display "Nenhuma transação encontrada." when search yields no results', async () => {
    (listTransactionsAction as vi.Mock)
      .mockResolvedValueOnce({ success: true, data: mockInitialResponse })
      .mockResolvedValueOnce({ success: true, data: mockEmptyResponse });

    render(<TransactionsListPage />);
    await waitFor(() => {
      expect(screen.getByText('Initial Transaction')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Ex: Venda Camiseta...');
    fireEvent.change(searchInput, { target: { value: 'NonExistentSearchTerm' } });
    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(listTransactionsAction).toHaveBeenCalledTimes(2);
      expect(listTransactionsAction).toHaveBeenLastCalledWith(
        { description: 'NonExistentSearchTerm' },
        expect.any(Object),
        expect.any(Object)
      );
    });

    await waitFor(() => {
        expect(screen.getByText('Nenhuma transação encontrada.')).toBeInTheDocument();
    });
  });

  it('should clear description filter when search input is cleared', async () => {
    // Initial load (filtered), then load with cleared filter
    // Note: The beforeEach already sets up a mockResolvedValue for the first call.
    // So, the first call in this test will use mockFilteredResponse,
    // and the second call (after clearing) will use mockInitialResponse.
    (listTransactionsAction as vi.Mock)
      .mockResolvedValueOnce({ success: true, data: mockFilteredResponse }) // Simulating already filtered
      .mockResolvedValueOnce({ success: true, data: mockInitialResponse }); // Back to initial

    render(<TransactionsListPage />);

    // Set initial search value and trigger first load (simulated as already filtered)
    const searchInput = screen.getByPlaceholderText('Ex: Venda Camiseta...');
    fireEvent.change(searchInput, { target: { value: 'Coffee' } });
    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(listTransactionsAction).toHaveBeenCalledTimes(1); // This is the "initial" call for this test
      expect(screen.getByText('Filtered Coffee Purchase')).toBeInTheDocument();
    });

    // Clear the search input
    fireEvent.change(searchInput, { target: { value: '' } });
    vi.advanceTimersByTime(500);

    await waitFor(() => {
      expect(listTransactionsAction).toHaveBeenCalledTimes(2);
      expect(listTransactionsAction).toHaveBeenLastCalledWith(
        { description: undefined }, // description filter should be undefined
        expect.any(Object),
        expect.any(Object)
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Initial Transaction')).toBeInTheDocument();
    });
  });

});
