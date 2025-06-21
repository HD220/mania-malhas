# Documentação da Funcionalidade: Gerenciamento de Produtos

## 1. Propósito

A funcionalidade de Gerenciamento de Produtos permite à costureira (administradora do sistema) catalogar todos os itens que ela produz e oferece para venda. Isso inclui a capacidade de adicionar novos produtos, editar informações existentes, gerenciar imagens e controlar a visibilidade dos produtos.

## 2. Estrutura de Dados

As informações dos produtos são armazenadas principalmente em duas tabelas no banco de dados PostgreSQL, gerenciadas pelo Drizzle ORM:

### 2.1. Tabela `product` (`productTable`)

*   **Schema:** `src/db/postgres/schema/product.ts`
*   **Campos Principais:**
    *   `id` (UUID): Identificador único do produto.
    *   `name` (VARCHAR(100)): Nome do produto. (Obrigatório)
    *   `description` (TEXT): Descrição detalhada do produto.
    *   `price` (DECIMAL(16,7)): Preço do produto. (Obrigatório)
    *   `active` (BOOLEAN): Indica se o produto está ativo (visível/disponível) ou não. (Padrão: `true`)
    *   `createdAt` (TIMESTAMP): Data e hora de criação do registro.
    *   `updatedAt` (TIMESTAMP): Data e hora da última atualização do registro.

### 2.2. Tabela `productImage` (`productImagesTable`)

*   **Schema:** `src/db/postgres/schema/productImage.ts`
*   **Campos Principais:**
    *   `id` (UUID): Identificador único da imagem.
    *   `productId` (UUID): Chave estrangeira referenciando `product.id`. (Obrigatório)
    *   `name` (VARCHAR(255)): Nome do arquivo da imagem ou um nome descritivo. (Obrigatório)
    *   `url` (VARCHAR(4000)): URL completa para acessar a imagem. Esta URL aponta para o local onde a imagem está armazenada (ex: MinIO). (Obrigatório)
    *   `active` (BOOLEAN): Indica se a imagem está ativa. (Padrão: `true`)
    *   `createdAt` (TIMESTAMP): Data e hora de criação do registro.
    *   `updatedAt` (TIMESTAMP): Data e hora da última atualização do registro.
*   **Relacionamento:** Uma relação de um-para-muitos entre `product` e `productImage` (um produto pode ter várias imagens).

## 3. Fluxos de Usuário (Painel Administrativo)

As seguintes rotas e páginas são usadas para gerenciar produtos:

*   **Listagem de Produtos:**
    *   **Rota:** `src/app/product/list/page.tsx`
    *   **Descrição:** Exibe uma tabela ou lista de todos os produtos cadastrados. Permite visualizar informações básicas como nome, preço e status (ativo/inativo). Funcionalidades de busca e paginação são esperadas aqui.
    *   **Ações:** A partir da listagem, o usuário pode navegar para criar um novo produto, editar um existente ou alterar seu status.

*   **Cadastro de Novo Produto:**
    *   **Rota:** `src/app/product/new/page.tsx`
    *   **Formulário:** `src/components/forms/product-form/product-form.tsx` (e `product-form-schema.ts` para validação).
    *   **Descrição:** Apresenta um formulário para a costureira inserir os dados de um novo produto (nome, descrição, preço).
    *   **Upload de Imagens:** O formulário de produto inclui um componente para upload de imagens (`src/components/ui/dropzone-image-carousel.tsx` é um candidato provável para esta funcionalidade), que interage com o serviço MinIO para armazenar as imagens e salvar suas URLs na tabela `productImage`.

*   **Edição de Produto Existente:**
    *   **Rota:** `src/app/product/[id]/page.tsx` (onde `[id]` é o ID do produto)
    *   **Formulário:** Reutiliza o mesmo formulário de cadastro (`src/components/forms/product-form/product-form.tsx`).
    *   **Descrição:** Carrega os dados de um produto existente no formulário, permitindo à costureira modificar qualquer informação, adicionar ou remover imagens.

## 4. Componentes de UI Relevantes

*   `src/components/forms/product-form/product-form.tsx`: Formulário principal para criação e edição de produtos.
*   `src/components/forms/product-form/product-form-schema.ts`: Define o schema de validação (provavelmente com Zod) para os dados do formulário de produto.
*   `src/components/ui/data-table.tsx`: Componente genérico para exibição de dados em tabela, usado na listagem de produtos.
*   `src/components/ui/dropzone-image-carousel.tsx`: Componente para upload e visualização de imagens, integrado ao formulário de produto.
*   `src/components/product-card.tsx`: Possivelmente usado para exibir produtos em um formato de card, talvez no futuro portal do cliente ou em uma visualização diferente no admin.

## 5. Casos de Uso (Use Cases)

A lógica de negócio para o gerenciamento de produtos está encapsulada nos seguintes casos de uso localizados em `src/usecases/product/`:

*   `createProductUseCase.ts`: Responsável por validar os dados e criar um novo produto no banco de dados, incluindo o tratamento das informações das imagens.
*   `alterProductUseCase.ts`: Responsável por validar os dados e atualizar um produto existente.
*   `getProductByIdUseCase.ts`: Busca um produto específico pelo seu ID.
*   `getProductsUseCase.ts`: Busca uma lista de produtos, possivelmente com filtros e paginação.
*   `getInactiveProductsUseCase.ts`: Busca produtos marcados como inativos.
*   `getImageByIdUseCase.ts`: Busca uma imagem específica pelo seu ID (menos provável de ser usado diretamente pela UI, mais para lógica interna).
*   `getUrlUploadUseCase.ts`: Provavelmente obtém uma URL pré-assinada do MinIO para permitir o upload seguro de uma imagem pelo cliente.

## 6. Integração com Serviços Externos

*   **MinIO:** Utilizado para o armazenamento das imagens dos produtos. O `getUrlUploadUseCase` provavelmente interage com `src/services/minio.ts` para gerar URLs de upload e as URLs das imagens salvas em `productImage.url` apontam para objetos no MinIO.

## 7. Considerações Adicionais

*   **Validação de Dados:** A validação dos dados de entrada é feita tanto no frontend (usando schemas como `product-form-schema.ts`) quanto no backend (dentro dos casos de uso) para garantir a integridade dos dados.
*   **Gerenciamento de Estado:** A aplicação provavelmente utiliza o gerenciamento de estado do React (Context API, Zustand, etc.) ou as funcionalidades do Next.js para lidar com os dados do formulário e o estado da UI.
*   **Segurança:** O acesso a essas funcionalidades é protegido por autenticação. As operações de upload para o MinIO devem ser seguras (ex: usando URLs pré-assinadas).
