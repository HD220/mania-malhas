import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PartnerForm } from './index';
import { FormPartner, formPartnerSchema } from './usePartnerForm';
import { vi } from 'vitest';

// Mock de 'next/navigation' para useRouter
const mockRouterPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

// Mock do useToast
const mockToast = vi.fn();
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock da função formatterPhoneNumber para simplificar
vi.mock('@/utils', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/utils')>();
    return {
        ...actual,
        formatterPhoneNumber: (value: string) => value, // Retorna o valor original
    };
});


describe('PartnerForm Component', () => {
  const mockOnSubmit = vi.fn();

  const initialValuesNew: FormPartner = {
    name: '',
    phone: '',
    notes: '',
    active: true,
  };

  const initialValuesEdit: FormPartner = {
    id: 'partner-123',
    name: 'Existing Partner',
    phone: '11999998888',
    notes: 'Some important notes',
    active: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockReset();
  });

  it('renders correctly with initial values for a new partner', () => {
    render(<PartnerForm initialValues={initialValuesNew} onSubmit={mockOnSubmit} />);
    expect(screen.getByLabelText(/Nome/i)).toHaveValue('');
    expect(screen.getByLabelText(/Telefone/i)).toHaveValue('');
    expect(screen.getByLabelText(/Anotações/i)).toHaveValue('');
    expect(screen.getByLabelText(/Ativo\?/i)).toBeChecked();
  });

  it('renders correctly with initial values for an existing partner', () => {
    render(<PartnerForm initialValues={initialValuesEdit} onSubmit={mockOnSubmit} />);
    expect(screen.getByLabelText(/Código/i)).toHaveValue('partner-123');
    expect(screen.getByLabelText(/Nome/i)).toHaveValue('Existing Partner');
    expect(screen.getByLabelText(/Telefone/i)).toHaveValue('11999998888');
    expect(screen.getByLabelText(/Anotações/i)).toHaveValue('Some important notes');
  });

  it('submits the form data when "Salvar" is clicked', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue({ success: true, message: "Parceiro salvo!" });

    render(<PartnerForm initialValues={initialValuesNew} onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/Nome/i), 'New Partner Name');
    await user.type(screen.getByLabelText(/Telefone/i), '1023456789'); // 10 digitos
    await user.type(screen.getByLabelText(/Anotações/i), 'Test notes.');

    await user.click(screen.getByRole('button', { name: /Salvar/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Partner Name',
          phone: '1023456789',
          notes: 'Test notes.',
          active: true,
        })
      );
    });
    await waitFor(() => expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: "Sucesso!" })));
    await waitFor(() => expect(mockRouterPush).toHaveBeenCalledWith('/partner/list'));
  });

  it('displays client-side validation error for invalid phone', async () => {
    const user = userEvent.setup();
    render(<PartnerForm initialValues={initialValuesNew} onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/Nome/i), 'Valid Name');
    await user.type(screen.getByLabelText(/Telefone/i), '123'); // Telefone inválido
    await user.click(screen.getByRole('button', { name: /Salvar/i }));

    // Esperar que a mensagem de erro do Zod (do formPartnerSchema) apareça
    // A mensagem exata vem do schema: "String must contain at least 10 or 11 character(s)"
    expect(await screen.findByText(/String must contain at least 10 or 11 character/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });


  it('displays server-side validation errors if onSubmit returns errors', async () => {
    const user = userEvent.setup();
    const serverErrors = {
      name: ['Este nome de parceiro já está em uso.'],
    };
    mockOnSubmit.mockResolvedValue({ success: false, errors: serverErrors, message: "Falha ao salvar parceiro." });

    render(<PartnerForm initialValues={initialValuesNew} onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/Nome/i), 'NomeValidoMasDuplicadoNoServidor');
    await user.type(screen.getByLabelText(/Telefone/i), '1122334455'); // Telefone válido

    await user.click(screen.getByRole('button', { name: /Salvar/i }));

    expect(await screen.findByText('Este nome de parceiro já está em uso.')).toBeInTheDocument();
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ variant: "destructive", title: "Erro ao salvar" }));
  });
});
