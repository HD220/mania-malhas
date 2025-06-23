# Documentação da Funcionalidade: Gerenciamento de Parceiros

## 1. Propósito

A funcionalidade de Gerenciamento de Parceiros permite à administradora do sistema (a costureira) registrar e gerenciar informações de contato e detalhes relevantes sobre seus parceiros de negócios. Estes parceiros podem incluir fornecedores de matéria-prima, outros colaboradores, ou qualquer entidade com a qual exista uma relação comercial ou de colaboração.

## 2. Estrutura de Dados

As informações dos parceiros são armazenadas na tabela `partner` (`partnerTable`) no banco de dados PostgreSQL, gerenciada pelo Drizzle ORM.

### 2.1. Tabela `partner` (`partnerTable`)

*   **Schema:** `src/db/postgres/schema/partner.ts`
*   **Campos Principais:**
    *   `id` (UUID): Identificador único do parceiro.
    *   `name` (VARCHAR(100)): Nome do parceiro ou da empresa parceira. (Obrigatório)
    *   `phone` (VARCHAR(20)): Número de telefone do parceiro.
    *   `notes` (TEXT): Campo para anotações diversas sobre o parceiro.
    *   `active` (BOOLEAN): Indica se o parceiro está ativo ou não. (Padrão: `true`)
    *   `createdAt` (TIMESTAMP): Data e hora de criação do registro.
    *   `updatedAt` (TIMESTAMP): Data e hora da última atualização do registro.

## 3. Fluxos de Usuário (Painel Administrativo)

As seguintes rotas e páginas são usadas para gerenciar parceiros:

*   **Listagem de Parceiros:**
    *   **Rota:** `src/app/partner/list/page.tsx`
    *   **Descrição:** Exibe uma tabela ou lista de todos os parceiros cadastrados. Permite visualizar informações como nome, telefone e status. Funcionalidades de busca e paginação são esperadas.
    *   **Ações:** A partir da listagem, o usuário pode navegar para criar um novo parceiro, editar um existente ou alterar seu status.

*   **Cadastro de Novo Parceiro:**
    *   **Rota:** `src/app/partner/new/page.tsx`
    *   **Formulário:** `src/components/forms/partner-form/partner-form.tsx` (e `partner-form-schema.ts` para validação).
    *   **Descrição:** Apresenta um formulário para a costureira inserir os dados de um novo parceiro (nome, telefone, anotações).

*   **Edição de Parceiro Existente:**
    *   **Rota:** `src/app/partner/[id]/page.tsx` (onde `[id]` é o ID do parceiro)
    *   **Formulário:** Reutiliza o mesmo formulário de cadastro (`src/components/forms/partner-form/partner-form.tsx`).
    *   **Descrição:** Carrega os dados de um parceiro existente no formulário, permitindo à costureira modificar suas informações.

## 4. Componentes de UI Relevantes

*   `src/components/forms/partner-form/partner-form.tsx`: Formulário principal para criação e edição de parceiros.
*   `src/components/forms/partner-form/partner-form-schema.ts`: Define o schema de validação (provavelmente com Zod) para os dados do formulário de parceiro.
*   `src/components/ui/data-table.tsx`: Componente genérico para exibição de dados em tabela, provavelmente usado na listagem de parceiros.

## 5. Casos de Uso (Use Cases)

A lógica de negócio para o gerenciamento de parceiros está encapsulada nos seguintes casos de uso localizados em `src/usecases/partner/`:

*   `createPartnerUseCase.ts`: Responsável por validar os dados e criar um novo parceiro no banco de dados.
*   `alterPartnerUseCase.ts`: Responsável por validar os dados e atualizar um parceiro existente.
*   `getPartnerByIdUseCase.ts`: Busca um parceiro específico pelo seu ID.
*   `getPartnersUseCase.ts`: Busca uma lista de parceiros, possivelmente com filtros e paginação.

## 6. Considerações Adicionais

*   **Relação com Transações:** A tabela `transactionTable` possui um campo `partnerId`, indicando que as transações financeiras podem ser associadas a parceiros. Isso é crucial para rastrear despesas com fornecedores ou receitas de determinados parceiros.
*   **Validação de Dados:** A validação dos dados de entrada é feita tanto no frontend (usando schemas como `partner-form-schema.ts`) quanto no backend (dentro dos casos de uso).
*   **Simplicidade:** Atualmente, a funcionalidade de parceiros é relativamente simples, focada em informações de contato. Pode ser expandida no futuro para incluir mais detalhes, como CNPJ/CPF, endereço, categorias de parceiros, etc., conforme a necessidade.
*   **Segurança:** O acesso a essas funcionalidades é protegido por autenticação.
