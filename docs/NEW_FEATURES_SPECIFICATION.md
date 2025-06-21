# Especificação de Novas Funcionalidades: Portal do Cliente e Pedidos Personalizados

## 1. Introdução

Este documento descreve as especificações para as novas funcionalidades a serem adicionadas ao sistema de gestão da costureira:
1.  **Portal do Cliente:** Uma interface pública onde os clientes poderão visualizar os produtos cadastrados pela costureira e realizar encomendas.
2.  **Pedidos Personalizados:** Uma funcionalidade dentro do Portal do Cliente que permitirá aos clientes solicitar orçamentos para produtos que não estão no catálogo padrão, descrevendo suas necessidades e anexando referências.

## 2. Portal do Cliente

### 2.1. Requisitos Gerais

*   **Visualização Pública:** Não exigirá login para navegar pelos produtos.
*   **Design Responsivo:** Deve funcionar bem em desktops, tablets e smartphones.
*   **Identidade Visual:** Deve refletir a marca e o estilo da costureira.

### 2.2. Funcionalidades Detalhadas

#### 2.2.1. Visualização de Produtos
*   **Página Inicial do Portal:** Pode destacar produtos novos, promoções ou categorias.
*   **Página de Catálogo/Listagem de Produtos:**
    *   Exibir todos os produtos ativos (`product.active = true`).
    *   Permitir filtros (por categoria - *nova entidade/campo*, por faixa de preço).
    *   Permitir ordenação (por preço, por nome, por mais recentes).
    *   Exibir imagem principal, nome e preço de cada produto.
*   **Página de Detalhes do Produto:**
    *   Exibir todas as imagens do produto em um carrossel ou galeria.
    *   Mostrar nome, descrição completa, preço.
    *   Opção de selecionar variações (ex: tamanho, cor - *novas entidades/campos se necessário*).
    *   Botão "Adicionar ao Carrinho" ou "Encomendar".

#### 2.2.2. Carrinho de Compras
*   **Funcionalidade:** Permitir que clientes adicionem múltiplos produtos ao carrinho antes de finalizar a encomenda.
*   **Visualização:** Mostrar itens no carrinho, quantidades, preços unitários e total.
*   **Ações:** Atualizar quantidade, remover item, prosseguir para finalizar encomenda.
*   **Persistência:** O carrinho pode ser persistido no `localStorage` para visitantes não logados ou associado ao usuário se logado.

#### 2.2.3. Processo de Encomenda (Checkout)
*   **Identificação do Cliente:**
    *   Opção de fazer login (se já for cliente).
    *   Opção de se cadastrar como novo cliente.
    *   Opção de fazer encomenda como convidado (coletando informações mínimas: nome, email, telefone, endereço de entrega).
*   **Informações de Entrega:** Formulário para endereço de entrega.
*   **Resumo do Pedido:** Revisão dos itens, quantidades, preços, endereço.
*   **Método de Pagamento (Inicial):**
    *   Inicialmente, pode ser um sistema de "Encomenda sob Confirmação". O cliente finaliza o pedido, a costureira recebe a notificação e entra em contato para combinar o pagamento (ex: PIX, transferência).
    *   Futuramente, pode integrar com gateways de pagamento online.
*   **Confirmação do Pedido:** Página de sucesso após finalizar a encomenda, com número do pedido e informações de próximos passos. Envio de email de confirmação para o cliente e notificação para a costureira.

#### 2.2.4. Área do Cliente (Pós-Login)
*   **Meus Pedidos:** Listar histórico de encomendas, status de cada pedido.
*   **Meus Dados:** Visualizar e editar informações cadastrais (nome, contato, endereços).

### 2.3. Novas Entidades/Alterações no Banco de Dados

*   **`customerTable` (Nova):**
    *   `id` (UUID, PK)
    *   `name` (VARCHAR, Not Null)
    *   `email` (VARCHAR, Not Null, Unique)
    *   `password` (VARCHAR, Not Null - Hashed) - *Se houver sistema de login de cliente*
    *   `phone` (VARCHAR)
    *   `createdAt`, `updatedAt` (TIMESTAMPS)

*   **`customerAddressTable` (Nova):**
    *   `id` (UUID, PK)
    *   `customerId` (UUID, FK to `customerTable`)
    *   `street` (VARCHAR)
    *   `number` (VARCHAR)
    *   `complement` (VARCHAR)
    *   `neighborhood` (VARCHAR)
    *   `city` (VARCHAR)
    *   `state` (VARCHAR(2))
    *   `zipCode` (VARCHAR)
    *   `isDefault` (BOOLEAN)
    *   `createdAt`, `updatedAt` (TIMESTAMPS)

*   **`categoryTable` (Nova - Opcional, para organizar produtos):**
    *   `id` (UUID, PK)
    *   `name` (VARCHAR, Not Null, Unique)
    *   `description` (TEXT)
    *   `createdAt`, `updatedAt` (TIMESTAMPS)
    *   **Alteração em `productTable`:** Adicionar `categoryId` (UUID, FK to `categoryTable`).

*   **`orderTable` (Nova - Pedidos de Produtos do Catálogo):**
    *   `id` (UUID, PK)
    *   `customerId` (UUID, FK to `customerTable` - pode ser nulo se for pedido de convidado)
    *   `guestName` (VARCHAR) - *Se pedido de convidado*
    *   `guestEmail` (VARCHAR) - *Se pedido de convidado*
    *   `guestPhone` (VARCHAR) - *Se pedido de convidado*
    *   `shippingAddressId` (UUID, FK to `customerAddressTable` - ou campos de endereço duplicados se for convidado)
    *   `orderDate` (TIMESTAMP, Default NOW)
    *   `status` (VARCHAR - ex: "Pendente", "Confirmado", "Em Produção", "Enviado", "Entregue", "Cancelado")
    *   `totalAmount` (DECIMAL)
    *   `paymentMethod` (VARCHAR - ex: "A Combinar")
    *   `paymentStatus` (VARCHAR - ex: "Pendente", "Pago")
    *   `notes` (TEXT - observações do cliente)
    *   `createdAt`, `updatedAt` (TIMESTAMPS)
    *   **Relação com `transactionTable`:** Um pedido confirmado e pago deve gerar uma transação de "Entrada" no financeiro.

*   **`orderItemTable` (Nova):**
    *   `id` (UUID, PK)
    *   `orderId` (UUID, FK to `orderTable`)
    *   `productId` (UUID, FK to `productTable`)
    *   `quantity` (INTEGER, Not Null)
    *   `unitPrice` (DECIMAL - preço no momento da compra)
    *   `totalPrice` (DECIMAL)
    *   `createdAt`, `updatedAt` (TIMESTAMPS)

### 2.4. Novas Rotas e Páginas (Exemplos)

*   `/` (Portal): Página inicial do portal do cliente.
*   `/produtos`: Listagem de produtos.
*   `/produto/:id`: Detalhes do produto.
*   `/carrinho`: Página do carrinho de compras.
*   `/checkout`: Processo de finalização da encomenda.
*   `/login-cliente`: Página de login para clientes.
*   `/cadastro-cliente`: Página de cadastro para clientes.
*   `/cliente/pedidos`: Histórico de pedidos do cliente logado.
*   `/cliente/dados`: Dados cadastrais do cliente logado.

### 2.5. Novos Componentes de UI

*   Cards de produto para listagem.
*   Componente de galeria/carrossel de imagens para detalhes do produto.
*   Interface do carrinho de compras.
*   Formulários de cadastro de cliente, endereço.
*   Listagem de pedidos para o cliente.

## 3. Pedidos Personalizados

### 3.1. Requisitos Gerais

*   Permitir que clientes solicitem itens que não estão no catálogo.
*   Facilitar a comunicação entre cliente e costureira para definir o escopo e o orçamento do pedido.

### 3.2. Funcionalidades Detalhadas

*   **Formulário de Solicitação de Pedido Personalizado:**
    *   Campos para:
        *   Nome do cliente, email, telefone.
        *   Descrição detalhada do item desejado.
        *   Dimensões, tecidos preferidos, cores, etc.
        *   Upload de imagens de referência (múltiplas imagens).
    *   Este formulário estará acessível no Portal do Cliente.
*   **Notificação para a Costureira:** A costureira recebe um email e/ou uma notificação no painel administrativo sobre a nova solicitação.
*   **Painel de Gerenciamento de Pedidos Personalizados (Admin):**
    *   Listar todas as solicitações de pedidos personalizados.
    *   Visualizar detalhes da solicitação, incluindo imagens de referência.
    *   Ferramenta para responder ao cliente, solicitar mais informações.
    *   Funcionalidade para criar um orçamento (preço, prazo de produção estimado).
    *   Enviar o orçamento para o cliente.
*   **Interação com o Cliente:**
    *   Cliente recebe o orçamento por email ou em sua área no portal.
    *   Cliente pode aprovar ou recusar o orçamento.
*   **Conversão em Pedido:** Se o orçamento for aprovado, a solicitação é convertida em um "Pedido" formal no sistema, similar a um pedido de produto do catálogo, mas com os detalhes e preço acordados. Este pedido também deve gerar uma transação financeira.

### 3.3. Novas Entidades/Alterações no Banco de Dados

*   **`customOrderRequestTable` (Nova):**
    *   `id` (UUID, PK)
    *   `customerName` (VARCHAR)
    *   `customerEmail` (VARCHAR)
    *   `customerPhone` (VARCHAR)
    *   `description` (TEXT, Not Null)
    *   `status` (VARCHAR - ex: "Novo", "Em Análise", "Orçamento Enviado", "Aprovado", "Recusado", "ConvertidoEmPedido")
    *   `requestedDate` (TIMESTAMP, Default NOW)
    *   `budgetAmount` (DECIMAL - preenchido pela costureira)
    *   `estimatedProductionTime` (VARCHAR - preenchido pela costureira)
    *   `notesAdmin` (TEXT - anotações internas da costureira)
    *   `customerId` (UUID, FK to `customerTable` - opcional, se o solicitante já for cliente)
    *   `orderId` (UUID, FK to `orderTable` - opcional, preenchido quando convertido em pedido)
    *   `createdAt`, `updatedAt` (TIMESTAMPS)

*   **`customOrderRequestImageTable` (Nova):**
    *   `id` (UUID, PK)
    *   `customOrderRequestId` (UUID, FK to `customOrderRequestTable`)
    *   `imageUrl` (VARCHAR, Not Null - armazenada no MinIO)
    *   `fileName` (VARCHAR)
    *   `uploadedAt` (TIMESTAMP, Default NOW)

*   **Alterações em `orderTable` (se necessário):**
    *   Adicionar um campo `type` (VARCHAR - ex: "Catalogo", "Personalizado") para diferenciar os tipos de pedido.
    *   Adicionar um campo `customOrderRequestId` (UUID, FK to `customOrderRequestTable`) para vincular o pedido à solicitação original.

### 3.4. Novas Rotas e Páginas (Exemplos)

*   **Portal do Cliente:**
    *   `/pedido-personalizado`: Página com o formulário de solicitação.
    *   `/cliente/solicitacoes`: Listar solicitações de pedidos personalizados feitas pelo cliente logado e seus status/orçamentos.
*   **Painel Administrativo:**
    *   `/admin/pedidos-personalizados`: Listagem de todas as solicitações.
    *   `/admin/pedidos-personalizados/:id`: Detalhes da solicitação, ferramentas para orçar e comunicar com o cliente.

### 3.5. Novos Componentes de UI

*   Formulário de solicitação de pedido personalizado com upload de arquivos.
*   Interface de gerenciamento de solicitações no painel administrativo.
*   Visualização de orçamentos para o cliente.

## 4. Integração Financeira das Novas Funcionalidades

*   **Pedidos do Catálogo:** Quando um `orderTable` é confirmado e o pagamento verificado (mesmo que "A Combinar" inicialmente), uma `transactionTable` do tipo "E" (Entrada) deve ser criada, vinculada ao cliente (se logado) ou com os dados do convidado na descrição. O valor da transação será o `orderTable.totalAmount`.
*   **Pedidos Personalizados:** Após a aprovação do orçamento e a conversão da `customOrderRequestTable` em uma `orderTable` (do tipo "Personalizado"), o fluxo financeiro segue o mesmo dos pedidos do catálogo. Uma `transactionTable` de "Entrada" é criada com o `budgetAmount` acordado.

## 5. Considerações Gerais

*   **Notificações por Email:** Essenciais para informar a costureira sobre novos pedidos/solicitações e para informar os clientes sobre o status de seus pedidos/orçamentos. (Requer integração com serviço de email).
*   **Autenticação de Cliente:** Decidir se o cadastro/login de cliente será obrigatório para todas as encomendas ou se haverá opção de "convidado".
*   **Casos de Uso (Usecases):** Novas lógicas de negócio precisarão ser implementadas em `src/usecases/` para:
    *   Gerenciar clientes (`createCustomer`, `getCustomerOrders`, etc.).
    *   Gerenciar categorias de produtos.
    *   Processar o carrinho de compras.
    *   Criar e gerenciar pedidos (`createOrder`, `updateOrderStatus`, etc.).
    *   Gerenciar solicitações de pedidos personalizados (`createCustomOrderRequest`, `submitBudget`, `convertToOrder`, etc.).
    *   Gerenciar o upload de imagens de referência para pedidos personalizados (similar ao `getUrlUploadUseCase` dos produtos).
*   **Migrações de Banco de Dados:** Todas as novas tabelas e alterações em tabelas existentes exigirão novas migrações do Drizzle.

Este documento serve como um guia inicial e será refinado conforme o desenvolvimento avança.
