# Documentação da API (Interna/Casos de Uso)

## 1. Introdução

Este sistema não expõe uma API REST ou GraphQL pública tradicional para consumo por terceiros. No entanto, a interação entre o frontend (componentes Next.js) e o backend (lógica de negócio) ocorre através de:

1.  **Casos de Uso (Use Cases):** Funções TypeScript localizadas em `src/usecases/` que encapsulam a lógica de negócio. Estas são chamadas diretamente pelo código do lado do servidor (ex: em Server Actions ou manipuladores de rota).
2.  **Next.js Server Actions:** Funções assíncronas que rodam no servidor e podem ser chamadas diretamente de componentes React (Server Components ou Client Components). Elas atuam como endpoints RPC (Remote Procedure Call).
3.  **Next.js API Routes (menos provável, dado o foco em usecases):** Poderiam existir em `src/app/api/` para endpoints mais tradicionais, mas a arquitetura parece pender para Server Actions e chamadas diretas de usecases.

Esta documentação descreverá os "endpoints" lógicos fornecidos pelos casos de uso existentes e os que seriam necessários para as novas funcionalidades, tratando-os como uma API interna.

## 2. Convenções Gerais

*   **Autenticação:** A maioria dos endpoints (especialmente os de escrita e acesso a dados sensíveis) requer autenticação prévia do administrador (costureira) ou do cliente (para o portal do cliente).
*   **Formato de Dados:** As trocas de dados são feitas usando objetos TypeScript/JavaScript. Para Server Actions, o Next.js lida com a serialização.
*   **Tratamento de Erros:** Os casos de uso e Server Actions devem retornar respostas de erro estruturadas em caso de falha (ex: erros de validação, não encontrado, não autorizado).

## 3. Endpoints da API (Casos de Uso Existentes)

### 3.1. Gerenciamento de Produtos (`src/usecases/product/`)

*   **`createProductUseCase(data: ProductFormData)`**
    *   **Propósito:** Cria um novo produto.
    *   **Método (lógico):** `POST`
    *   **Payload de Entrada (`data`):** Objeto contendo `name`, `description`, `price`, e um array de informações de imagens (`files`).
    *   **Resposta de Sucesso:** Objeto do produto criado.
    *   **Chamado por:** Formulário de novo produto (`src/app/product/new/page.tsx`).

*   **`alterProductUseCase(productId: string, data: ProductFormData)`**
    *   **Propósito:** Atualiza um produto existente.
    *   **Método (lógico):** `PUT`
    *   **Payload de Entrada (`data`):** Objeto contendo os campos a serem atualizados.
    *   **Resposta de Sucesso:** Objeto do produto atualizado.
    *   **Chamado por:** Formulário de edição de produto (`src/app/product/[id]/page.tsx`).

*   **`getProductByIdUseCase(productId: string)`**
    *   **Propósito:** Busca um produto pelo ID.
    *   **Método (lógico):** `GET`
    *   **Resposta de Sucesso:** Objeto do produto ou `null` se não encontrado.
    *   **Chamado por:** Página de edição de produto, detalhes do produto.

*   **`getProductsUseCase(filters?: ProductFilters)`**
    *   **Propósito:** Lista produtos, com possíveis filtros (nome, status, etc.) e paginação.
    *   **Método (lógico):** `GET`
    *   **Payload de Entrada (`filters`):** Objeto com critérios de filtro.
    *   **Resposta de Sucesso:** Array de objetos de produto.
    *   **Chamado por:** Página de listagem de produtos (`src/app/product/list/page.tsx`).

*   **`getUrlUploadUseCase(fileInfo: { name: string, type: string })`**
    *   **Propósito:** Obtém uma URL pré-assinada do MinIO para upload de imagem.
    *   **Método (lógico):** `POST`
    *   **Payload de Entrada (`fileInfo`):** Nome e tipo do arquivo.
    *   **Resposta de Sucesso:** Objeto com `uploadUrl` e `fileName` (ou `key`) no MinIO.
    *   **Chamado por:** Componente de upload de imagem no formulário de produto.

*   **`getInactiveProductsUseCase()`**
    *   **Propósito:** Lista produtos inativos.
    *   **Método (lógico):** `GET`
    *   **Resposta de Sucesso:** Array de objetos de produto.

### 3.2. Gerenciamento de Parceiros (`src/usecases/partner/`)

*   **`createPartnerUseCase(data: PartnerFormData)`**
    *   **Propósito:** Cria um novo parceiro.
    *   **Método (lógico):** `POST`
    *   **Payload de Entrada (`data`):** Objeto com `name`, `phone`, `notes`.
    *   **Resposta de Sucesso:** Objeto do parceiro criado.
    *   **Chamado por:** Formulário de novo parceiro.

*   **`alterPartnerUseCase(partnerId: string, data: PartnerFormData)`**
    *   **Propósito:** Atualiza um parceiro existente.
    *   **Método (lógico):** `PUT`
    *   **Payload de Entrada (`data`):** Objeto com campos a serem atualizados.
    *   **Resposta de Sucesso:** Objeto do parceiro atualizado.
    *   **Chamado por:** Formulário de edição de parceiro.

*   **`getPartnerByIdUseCase(partnerId: string)`**
    *   **Propósito:** Busca um parceiro pelo ID.
    *   **Método (lógico):** `GET`
    *   **Resposta de Sucesso:** Objeto do parceiro ou `null`.
    *   **Chamado por:** Página de edição de parceiro.

*   **`getPartnersUseCase(filters?: PartnerFilters)`**
    *   **Propósito:** Lista parceiros.
    *   **Método (lógico):** `GET`
    *   **Resposta de Sucesso:** Array de objetos de parceiro.
    *   **Chamado por:** Página de listagem de parceiros.

### 3.3. Gerenciamento Financeiro (inferido a partir de `billRepository.ts` e `receivable/list`)

*   **`getReceivablesUseCase(filters?: ReceivableFilters)` (Suposição)**
    *   **Propósito:** Lista contas a receber (transações do tipo "Entrada" pendentes).
    *   **Método (lógico):** `GET`
    *   **Resposta de Sucesso:** Array de objetos de transação.
    *   **Chamado por:** `src/app/receivable/list/page.tsx`.

*   **`createTransactionUseCase(data: TransactionData)` (Suposição/Necessário)**
    *   **Propósito:** Cria uma nova transação financeira.
    *   **Método (lógico):** `POST`
    *   **Payload de Entrada (`data`):** `partnerId`, `description`, `type` ('E'/'S'), `value`, `date`, `due_date`.
    *   **Resposta de Sucesso:** Objeto da transação criada.

*   **`createPaymentUseCase(data: PaymentData)` (Suposição/Necessário)**
    *   **Propósito:** Registra um pagamento para uma transação.
    *   **Método (lógico):** `POST`
    *   **Payload de Entrada (`data`):** `transactionId`, `value`, `date`.
    *   **Resposta de Sucesso:** Objeto do pagamento criado.

## 4. Endpoints da API (Novas Funcionalidades - Portal do Cliente e Pedidos Personalizados)

Estes são os casos de uso/endpoints que precisarão ser criados:

### 4.1. Portal do Cliente - Produtos (Público)

*   **`getPublicProductsUseCase(filters?: PublicProductFilters)`**
    *   **Propósito:** Lista produtos ativos para o portal do cliente.
    *   **Método (lógico):** `GET`
    *   **Resposta de Sucesso:** Array de produtos (com menos campos que no admin, se necessário).

*   **`getPublicProductDetailsUseCase(productId: string)`**
    *   **Propósito:** Busca detalhes de um produto ativo para o portal.
    *   **Método (lógico):** `GET`
    *   **Resposta de Sucesso:** Objeto do produto.

### 4.2. Portal do Cliente - Clientes (Autenticado como Cliente ou Convidado)

*   **`registerCustomerUseCase(data: CustomerRegistrationData)`**
    *   **Propósito:** Registra um novo cliente.
    *   **Método (lógico):** `POST`
    *   **Payload de Entrada:** `name`, `email`, `password`, `phone`.
    *   **Resposta de Sucesso:** Objeto do cliente criado.

*   **`loginCustomerUseCase(credentials: {email: string, password: string})`** (Se houver login de cliente)
    *   **Propósito:** Autentica um cliente.
    *   **Método (lógico):** `POST`
    *   **Resposta de Sucesso:** Token de sessão ou confirmação.

*   **`getCustomerProfileUseCase(customerId: string)`**
    *   **Propósito:** Busca dados do cliente logado.
    *   **Método (lógico):** `GET` (Requer autenticação de cliente)
    *   **Resposta de Sucesso:** Objeto do cliente.

*   **`updateCustomerProfileUseCase(customerId: string, data: CustomerProfileData)`**
    *   **Propósito:** Atualiza dados do cliente logado.
    *   **Método (lógico):** `PUT` (Requer autenticação de cliente)
    *   **Resposta de Sucesso:** Objeto do cliente atualizado.

*   **`addCustomerAddressUseCase(customerId: string, data: AddressData)`**
*   **`updateCustomerAddressUseCase(addressId: string, data: AddressData)`**
*   **`deleteCustomerAddressUseCase(addressId: string)`**
*   **`getCustomerAddressesUseCase(customerId: string)`**

### 4.3. Portal do Cliente - Pedidos (Autenticado como Cliente ou Convidado)

*   **`createOrderUseCase(data: OrderData)`**
    *   **Propósito:** Cria uma nova encomenda (a partir do carrinho).
    *   **Método (lógico):** `POST`
    *   **Payload de Entrada:** Informações do cliente/convidado, itens do pedido, endereço de entrega.
    *   **Resposta de Sucesso:** Objeto do pedido criado.
    *   **Ações Adicionais:** Deve disparar a criação de uma `Transaction` no financeiro.

*   **`getCustomerOrdersUseCase(customerId: string)`**
    *   **Propósito:** Lista pedidos de um cliente.
    *   **Método (lógico):** `GET` (Requer autenticação de cliente)
    *   **Resposta de Sucesso:** Array de pedidos.

*   **`getOrderDetailsUseCase(orderId: string)`**
    *   **Propósito:** Busca detalhes de um pedido específico (cliente ou admin).
    *   **Método (lógico):** `GET`
    *   **Resposta de Sucesso:** Objeto do pedido com itens.

### 4.4. Pedidos Personalizados

*   **`createCustomOrderRequestUseCase(data: CustomOrderRequestData)`**
    *   **Propósito:** Cliente submete uma solicitação de pedido personalizado.
    *   **Método (lógico):** `POST`
    *   **Payload de Entrada:** Informações do cliente, descrição, imagens de referência.
    *   **Resposta de Sucesso:** Objeto da solicitação criada.
    *   **Ações Adicionais:** Notificar administrador.

*   **`getCustomOrderRequestsUseCase(filters?: AdminFilters)` (Admin)**
    *   **Propósito:** Lista solicitações de pedidos personalizados para o admin.
    *   **Método (lógico):** `GET` (Requer autenticação de admin)
    *   **Resposta de Sucesso:** Array de solicitações.

*   **`getCustomOrderRequestDetailsUseCase(requestId: string)` (Admin/Cliente)**
    *   **Propósito:** Detalhes de uma solicitação.
    *   **Método (lógico):** `GET`
    *   **Resposta de Sucesso:** Objeto da solicitação com imagens.

*   **`submitBudgetForCustomOrderUseCase(requestId: string, data: BudgetData)` (Admin)**
    *   **Propósito:** Admin envia orçamento para uma solicitação.
    *   **Método (lógico):** `POST` (Requer autenticação de admin)
    *   **Payload de Entrada:** `budgetAmount`, `estimatedProductionTime`, `notes`.
    *   **Resposta de Sucesso:** Objeto da solicitação atualizado.
    *   **Ações Adicionais:** Notificar cliente.

*   **`approveCustomOrderBudgetUseCase(requestId: string)` (Cliente)**
    *   **Propósito:** Cliente aprova o orçamento.
    *   **Método (lógico):** `POST` (Requer autenticação de cliente ou link tokenizado)
    *   **Resposta de Sucesso:** Objeto da solicitação atualizado.
    *   **Ações Adicionais:** Converter em `Order`, criar `Transaction`, notificar admin.

*   **`rejectCustomOrderBudgetUseCase(requestId: string)` (Cliente)**
    *   **Propósito:** Cliente recusa o orçamento.
    *   **Método (lógico):** `POST`
    *   **Resposta de Sucesso:** Objeto da solicitação atualizado.
    *   **Ações Adicionais:** Notificar admin.

## 5. Considerações Finais

Esta documentação fornece uma visão de altoível da API interna. A implementação detalhada de cada caso de uso/Server Action definirá os schemas exatos de entrada e saída. É crucial manter uma boa organização e documentação no nível do código para cada uma dessas funções.
