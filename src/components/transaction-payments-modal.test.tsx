import React from 'react'; // Adicionar import do React
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionPaymentsModal } from './transaction-payments-modal';
import { SelectPayment } from '@/db/repositories/schemas/paymentSchema';
import { PaymentFormData } from './forms/payment-form';
import * as paymentActions from '@/app/payment/actions'; // Importar o módulo mockado

// Mock das actions de pagamento
// As declarações de vi.fn() são movidas para dentro da factory para evitar ReferenceError devido ao hoisting.
vi.mock('@/app/payment/actions', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/app/payment/actions')>();
  return {
    ...actual, // Manter outras exportações se houver
    listPaymentsByTransactionAction: vi.fn(),
    addPaymentAction: vi.fn(),
  };
});

// Mock do useToast
const mockToast = vi.fn();
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock do PaymentList para simplificar (focar no modal)
vi.mock('./payment-list', () => ({
  PaymentList: ({ payments, isLoading }: { payments: SelectPayment[], isLoading: boolean}) => (
    <div data-testid="payment-list">
      {isLoading && <p>Carregando pagamentos...</p>}
      {payments.map(p => <div key={p.id} data-testid="payment-item">{p.value}</div>)}
    </div>
  )
}));


const mockPayments: SelectPayment[] = [
  { id: 'pay_1', transactionId: 'txn_1', value: "50.00", date: new Date(), createdAt: new Date(), updatedAt: new Date() },
  { id: 'pay_2', transactionId: 'txn_1', value: "25.00", date: new Date(), createdAt: new Date(), updatedAt: new Date() },
];

const defaultProps = {
  transactionId: 'txn_1',
  transactionValue: 100.00,
  transactionType: 'S' as 'E' | 'S',
  open: true,
  onOpenChange: vi.fn(),
  onPaymentAdded: vi.fn(),
};

describe('TransactionPaymentsModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Configurar mocks padrão para listPayments
    (paymentActions.listPaymentsByTransactionAction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true, data: mockPayments });
  });

  it('renders correctly with transaction details and fetches payments', async () => {
    render(<TransactionPaymentsModal {...defaultProps} />);

    expect(screen.getByText('Pagamentos da Transação')).toBeInTheDocument();
    expect(screen.getByText(/ID da Transação: txn_1/)).toBeInTheDocument();
    expect(screen.getByText(/Valor Total: R\$ 100,00/)).toBeInTheDocument();

    await waitFor(() => {
      expect(paymentActions.listPaymentsByTransactionAction).toHaveBeenCalledWith('txn_1');
      expect(screen.getByTestId('payment-list')).toBeInTheDocument();
      expect(screen.getAllByTestId('payment-item').length).toBe(mockPayments.length);
    });

    // Saldo devedor (100 - 50 - 25 = 25)
    // O Intl.NumberFormat pode usar um non-breaking space (NBSP) que é \u00A0
    // Usar textContent para verificar o valor formatado.
    const remainingBalanceElement = screen.getByTestId('remaining-balance');
    expect(remainingBalanceElement).toHaveTextContent('R$ 25,00'); // Ou /R\$\s*25,00/ para mais flexibilidade com espaços

    // Verifica se o formulário de pagamento está presente pois há saldo devedor
    expect(screen.getByLabelText('Valor do Pagamento')).toBeInTheDocument();
  });

  it('shows payment form when transaction is not fully paid', async () => {
    render(<TransactionPaymentsModal {...defaultProps} transactionValue={100.00} />);
    await waitFor(() => expect(paymentActions.listPaymentsByTransactionAction).toHaveBeenCalled());
    // Saldo 25.00, então formulário deve estar visível
    expect(screen.getByLabelText('Valor do Pagamento')).toBeVisible();
  });

  it('hides payment form and shows "fully paid" message when transaction is paid', async () => {
    // Total pago é 75. Se transactionValue for 75, está pago.
    render(<TransactionPaymentsModal {...defaultProps} transactionValue={75.00} />);
    await waitFor(() => expect(paymentActions.listPaymentsByTransactionAction).toHaveBeenCalled());

    expect(screen.getByText('Esta transação já foi totalmente paga.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Valor do Pagamento')).not.toBeInTheDocument();
  });

  it('calls addPaymentAction and onPaymentAdded on successful payment submission', async () => {
    const user = userEvent.setup();
    (paymentActions.addPaymentAction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true, message: 'Pagamento adicionado!' });
    // Recarregar lista após adição bem-sucedida
    (paymentActions.listPaymentsByTransactionAction as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({ success: true, data: mockPayments }) // Initial load
        .mockResolvedValueOnce({ success: true, data: [...mockPayments, {id: 'pay_3', value:"10.00"}] }); // After add


    render(<TransactionPaymentsModal {...defaultProps} transactionValue={100.00} />);
    await waitFor(() => expect(paymentActions.listPaymentsByTransactionAction).toHaveBeenCalledTimes(1));

    const valueInput = screen.getByLabelText('Valor do Pagamento');
    await user.clear(valueInput);
    await user.type(valueInput, '10.00');

    // O PaymentForm usa o componente InputMoneyField que pode ter formatação.
    // Clicar no botão Salvar Pagamento
    const submitButton = screen.getByRole('button', { name: /Salvar Pagamento/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(paymentActions.addPaymentAction).toHaveBeenCalledTimes(1);
      // O PaymentForm passa transactionId para a action
      expect(paymentActions.addPaymentAction).toHaveBeenCalledWith(expect.objectContaining({ value: 10, transactionId: 'txn_1' }));
    });

    await waitFor(() => {
      expect(defaultProps.onPaymentAdded).toHaveBeenCalledTimes(1);
      // Verifica se a lista de pagamentos foi recarregada
      expect(paymentActions.listPaymentsByTransactionAction).toHaveBeenCalledTimes(2);
    });
  });

  it('displays error message if fetching payments fails', async () => {
    (paymentActions.listPaymentsByTransactionAction as ReturnType<typeof vi.fn>).mockResolvedValue({ success: false, message: 'Erro ao buscar pagamentos mockado.' });
    render(<TransactionPaymentsModal {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Erro ao buscar pagamentos mockado.')).toBeInTheDocument();
    });
  });

  it('closes the modal when "Fechar" button is clicked', async () => {
    const user = userEvent.setup();
    render(<TransactionPaymentsModal {...defaultProps} />);
    await waitFor(() => expect(paymentActions.listPaymentsByTransactionAction).toHaveBeenCalled());

    const closeButton = screen.getByRole('button', { name: /Fechar/i });
    await user.click(closeButton);

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

});
