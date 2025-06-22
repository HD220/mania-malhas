import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductForm } from './index'; // O componente que usa useProductForm internamente
import { FormProduct } from './useProductForm'; // O tipo do formulário
import { vi } from 'vitest';

// Mock de './actions' que exporta getUrlUpload
vi.mock('./actions', () => ({
  getUrlUpload: vi.fn().mockResolvedValue({ url: 'http://presigned-url.com/upload-here?token=xyz' }),
}));

// Mock de '@/utils' que exporta uploadS3
vi.mock('@/utils', () => ({
  uploadS3: vi.fn().mockResolvedValue(undefined), // Simula upload bem-sucedido
  cn: (...args: any[]) => args.filter(Boolean).join(' '), // Mock simples para cn
}));

// Mock de 'next/navigation' para useRouter
const mockRouterPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
  // redirect: vi.fn(), // Se redirect fosse usado diretamente no useProductForm
}));

// Mock do useToast
const mockToast = vi.fn();
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock do DropzoneImageCarousel para simplificar o teste do formulário
vi.mock('@/components/ui/dropzone-image-carousel', () => ({
    DropzoneImageCarousel: (props: any) => (
        <div data-testid="dropzone-carousel">
            {/* Mock simples para visualizar files e permitir remoção se necessário */}
            {props.files?.map((file: any, index: number) => (
                <div key={file.name || index}>
                    <span>{file.name}</span>
                    <button onClick={() => props.onRemove(index)}>Remove</button>
                </div>
            ))}
            <input type="file" data-testid="dropzone-input" onChange={e => {
                if (e.target.files) props.onDrop(Array.from(e.target.files));
            }} />
        </div>
    )
}));


describe('ProductForm Component', () => {
  const mockOnSubmit = vi.fn();

  const initialValuesNew: FormProduct = {
    name: '',
    price: 0,
    description: '',
    active: true,
    images: [],
  };

  const initialValuesEdit: FormProduct = {
    id: 'product-123',
    name: 'Existing Product',
    price: 99.90,
    description: 'A great product',
    active: true,
    images: [
      { name: 'img1.jpg', url: 'http://example.com/img1.jpg', active: true },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockReset();
  });

  it('renders correctly with initial values for a new product', () => {
    render(<ProductForm initialValues={initialValuesNew} onSubmit={mockOnSubmit} />);
    expect(screen.getByLabelText(/Nome/i)).toHaveValue('');
    expect(screen.getByLabelText(/Preço/i)).toHaveValue(0); // InputMoneyField pode formatar isso
    expect(screen.getByLabelText(/Descrição/i)).toHaveValue('');
    expect(screen.getByLabelText(/Ativo\?/i)).toBeChecked();
  });

  it('renders correctly with initial values for an existing product', () => {
    render(<ProductForm initialValues={initialValuesEdit} onSubmit={mockOnSubmit} />);
    expect(screen.getByLabelText(/Código/i)).toHaveValue('product-123');
    expect(screen.getByLabelText(/Nome/i)).toHaveValue('Existing Product');
    // InputMoneyField pode formatar 99.90 para "99,90" ou algo similar
    // A verificação exata do valor pode precisar de ajuste ou query mais específica
    expect(screen.getByLabelText(/Preço/i)).toHaveValue(99.90);
    expect(screen.getByLabelText(/Descrição/i)).toHaveValue('A great product');
  });

  it('submits the form data (excluding images for simplicity here) when "Salvar" is clicked', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue({ success: true, message: "Produto salvo!" }); // Simular resposta da action

    render(<ProductForm initialValues={initialValuesNew} onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/Nome/i), 'New Product Name');
    // Para InputMoneyField, a digitação pode ser mais complexa.
    // Vamos simular o valor diretamente ou usar um método mais simples se o componente permitir.
    // Por ora, vamos assumir que o valor é preenchido corretamente para o teste de submissão.
    // O zodResolver no useProductForm vai validar o tipo.
    // A forma como o InputMoneyField interage com react-hook-form (onChange) é crucial.
    // Se o InputMoneyField usa um input[type=number], user.type deve funcionar.
    // Se ele formata/mascara, pode ser mais complexo.
    // O schema espera um número para 'price'.
    const priceInput = screen.getByLabelText(/Preço/i);
    await user.clear(priceInput); // Limpar o valor 0 padrão
    await user.type(priceInput, '123.45'); // react-hook-form irá converter para número

    await user.type(screen.getByLabelText(/Descrição/i), 'Simple description.');

    await user.click(screen.getByRole('button', { name: /Salvar/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Product Name',
          price: 123.45, // O schema coerce para número
          description: 'Simple description.',
          active: true, // Default
          images: [], // Sem interagir com o upload de imagens neste teste
        })
      );
    });
    await waitFor(() => expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: "Sucesso!" })));
    await waitFor(() => expect(mockRouterPush).toHaveBeenCalledWith('/product/list'));
  });

  it('displays server-side validation errors if onSubmit returns errors', async () => {
    const user = userEvent.setup();
    const serverErrors = {
      name: ['Este nome já existe.'],
      price: ['Preço não pode ser zero para este tipo de produto.'],
    };
    mockOnSubmit.mockResolvedValue({ success: false, errors: serverErrors, message: "Falha ao salvar." });

    render(<ProductForm initialValues={initialValuesNew} onSubmit={mockOnSubmit} />);

    // Usar dados que passam na validação Zod do cliente, mas que o servidor rejeitaria
    await user.type(screen.getByLabelText(/Nome/i), 'NomeValidoMasDuplicadoNoServidor');
    const priceInput = screen.getByLabelText(/Preço/i);
    await user.clear(priceInput); // Limpar o valor 0 padrão
    await user.type(priceInput, '10'); // Preço válido

    await user.click(screen.getByRole('button', { name: /Salvar/i }));

    // Esperar que a mensagem de erro do servidor para 'name' apareça
    expect(await screen.findByText('Este nome já existe.')).toBeInTheDocument();

    // Para o erro de preço, vamos verificar se o campo está marcado como inválido,
    // já que a mensagem exata pode depender da validação do browser ou do Zod antes do server error.
    // Se o schema 'formProductSchema' já barra preço <= 0, o onSubmit não seria chamado com preço 0.
    // Este teste assume que o schema do formulário permite o valor, mas o servidor o rejeita.
    // Se o erro de preço também for retornado pelo servidor e definido via form.setError,
    // poderíamos usar: expect(await screen.findByText('Preço não pode ser zero...')).toBeInTheDocument();
    // No entanto, o erro "Preço deve ser positivo." já é do Zod client-side e apareceria antes.
    // Vamos focar no erro de 'name' que é um erro típico vindo do servidor.

    // A mensagem de erro do preço pode não aparecer diretamente se o tipo de input for number
    // e o browser impedir '0' se o schema já tem .positive().
    // O erro do Zod no cliente já pegaria isso antes.
      // Este teste foca em erros *retornados pelo servidor* via `form.setError`.
      // Se o schema do form (formProductSchema) já barra o preço 0, o onSubmit nem seria chamado.
      // Para testar o setError do servidor, o erro Zod do cliente precisa passar.
      // Vamos assumir que price:0 é válido para o Zod do form, mas o server rejeita.

    // O findByText já aguardou a atualização do estado que mostra o erro do campo.
    // O toast deve ter sido chamado como parte dessa mesma atualização de estado ou logo depois.
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ variant: "destructive", title: "Erro ao salvar" }));
  });

  // TODO: Testar interações com upload de imagem (addImage, removeImage)
  // Isso exigiria mockar File, URL.createObjectURL, e interagir com o DropzoneProvider mockado.
});
