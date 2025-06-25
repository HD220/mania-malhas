# Guia de Estrutura e Organização do Projeto

## 1. Introdução e Objetivos

Este documento descreve a arquitetura geral do projeto e as convenções para organização de diretórios e arquivos dentro da pasta `src/`. O objetivo é fornecer uma "fonte da verdade" para a estrutura do projeto, garantindo consistência, manutenibilidade e escalabilidade. Este guia deve orientar as atividades de refatoração e o desenvolvimento de novas funcionalidades.

## 2. Visão Geral da Arquitetura

O projeto é uma aplicação web full-stack construída com as seguintes tecnologias principais:

*   **Framework Frontend/Backend:** Next.js (utilizando o App Router)
*   **Linguagem:** TypeScript
*   **ORM:** Drizzle ORM para interação com banco de dados PostgreSQL.
*   **Estilização:** Tailwind CSS e componentes ShadCN/UI.
*   **Testes:** Vitest.
*   **Linting:** ESLint com plugins específicos (ex: `eslint-plugin-project-structure`).

## 3. Organização do Diretório `src/`

A pasta `src/` é a raiz para todo o código-fonte da aplicação. A estrutura interna é projetada para separar claramente as preocupações e agrupar código por funcionalidade (features) sempre que possível.

### 3.1. `src/app/` - Roteamento, Páginas e Layouts

*   **Propósito:** Contém todas as rotas, páginas e layouts da aplicação, seguindo as convenções do Next.js App Router.
*   **Estrutura:**
    *   Utiliza **Route Groups** (ex: `(admin)`, `(auth)`, `(marketing)`, `(main_app)`) para organizar seções da aplicação com layouts ou propósitos distintos sem afetar a URL.
    *   Cada rota ou grupo de rotas deve ter seu próprio `page.tsx` (para a UI da página) e `layout.tsx` (para a UI de layout compartilhada).
    *   Arquivos `loading.tsx`, `error.tsx`, `not-found.tsx` podem ser usados conforme as convenções do Next.js para estados de UI específicos.
*   **Componentes Específicos de Rota:**
    *   Componentes React que são usados exclusivamente por uma página ou layout específico dentro de `src/app/` devem residir em um subdiretório `components/` dentro da pasta da rota.
        *   Exemplo: `src/app/(admin)/dashboard/components/overview-chart.tsx`
*   **Lógica Específica de Rota (Server Actions, etc.):**
    *   Server Actions ou lógica de manipulação de dados estritamente ligada a uma rota específica e não reutilizável por outras features podem residir em um arquivo `actions.tsx` dentro da pasta da rota.
    *   **Preferência:** Se a lógica for mais complexa ou potencialmente reutilizável, ela deve ser movida para uma `feature` em `src/features/`.

### 3.2. `src/components/` - Componentes de UI Genéricos e Reutilizáveis

*   **Propósito:** Contém componentes React que são genéricos, reutilizáveis em múltiplas partes da aplicação e não estão atrelados a uma feature de negócio específica.
*   **Estrutura:**
    *   **`ui/`**: Destinado primariamente aos componentes base do ShadCN/UI (ex: `Button.tsx`, `Card.tsx`, `Input.tsx`). Estes componentes são a base do sistema de design.
    *   **Raiz de `src/components/`**: Pode conter componentes compostos reutilizáveis construídos a partir dos componentes de `ui/` ou outros componentes genéricos (ex: `ThemeToggle.tsx`, `GenericDataTable.tsx` se aplicável).
*   **Distinção Importante:**
    *   Se um componente é específico para uma `feature` (ex: `UserProfileCard.tsx`), ele deve residir em `src/features/[nome_da_feature]/components/`.
    *   Se um componente é usado apenas em uma seção específica do `app/` (ex: um header específico para o marketing), ele deve ir para `src/app/(marketing)/components/`.

### 3.3. `src/features/` - Módulos de Funcionalidade de Negócio

*   **Propósito:** O coração da lógica de negócio da aplicação. Cada subdiretório em `src/features/` representa um domínio ou uma funcionalidade de negócio verticalmente fatiada.
*   **Nome da Feature:** Deve ser em `camelCase` ou `kebab-case` (a ser definido, mas `kebab-case` é comum para nomes de diretório). Ex: `userProfile`, `productManagement`, `orderProcessing`. (Atualmente, o projeto usa `camelCase` como `user`, `product`, `partner`). Manteremos `camelCase` por ora.
*   **Estrutura Interna Padrão para uma Feature (`src/features/[nomeFeature]/`):**
    *   **`actions/`**: Contém Server Actions do Next.js e lógica relacionada a mutações de dados para a feature. (Ex: `src/features/user/actions/updateUserProfileAction.ts`)
    *   **`components/`**: Componentes React específicos desta feature. (Ex: `src/features/user/components/UserProfileForm.tsx`)
    *   **`db/`**: Lógica de acesso ao banco de dados específica da feature, como repositórios Drizzle. (Ex: `src/features/user/db/userRepository.ts`)
    *   **`lib/`**: Utilitários, helpers ou lógica de biblioteca que são específicos para esta feature e não são genéricos o suficiente para `src/lib/`. (Ex: `src/features/product/lib/pricingCalculator.ts`)
    *   **`schemas/`**: Schemas de validação (ex: Zod) para os dados da feature. (Ex: `src/features/user/schemas/userProfileSchema.ts`)
    *   **`services/`**: Clientes ou adaptadores para serviços externos que são usados primariamente ou exclusivamente por esta feature. (Ex: `src/features/notification/services/emailService.ts`)
    *   **`usecases/`**: Casos de uso ou lógica de negócio central que orquestra as operações da feature. Eles não devem depender diretamente do Next.js ou do React. (Ex: `src/features/user/usecases/getUserProfileUseCase.ts`)
    *   **`types/` ou `interfaces/` (opcional):** Definições de tipo TypeScript específicas da feature, se não definidas junto ao código que as utiliza.
    *   `index.ts` (opcional): Para reexportar publicamente elementos da feature.
*   **Observação:** Nem toda feature precisará de todos esses subdiretórios. Crie apenas os necessários.

### 3.4. `src/lib/` - Bibliotecas e Utilitários Globais

*   **Propósito:** Contém código que é verdadeiramente genérico, reutilizável por múltiplas features ou partes do sistema, e não específico de nenhuma feature em particular.
*   **Exemplos:** Funções de formatação de data/moeda, helpers de array/objeto, código de internacionalização (i18n), instâncias de clientes de bibliotecas globais (ex: um cliente Axios configurado).
*   **Evitar:** Não deve conter lógica de negócio ou componentes de UI.

### 3.5. `src/db/` - Configuração Global do Banco de Dados

*   **`postgres/`**:
    *   **`schema/`**: Contém as definições de tabelas do Drizzle ORM (`*.table.ts`). Esta é a definição canônica do esquema do banco de dados.
    *   `drizzle.config.ts`: Configuração para o Drizzle Kit (migrações, etc.).
    *   `index.ts`: Exporta a instância do cliente Drizzle (`db`).
    *   `migrate.ts`: Script para executar migrações.
    *   `seed.ts`: Script para popular o banco de dados com dados iniciais.
    *   `migrations/`: Arquivos de migração gerados pelo Drizzle Kit.
*   **NÃO DEVE CONTER:** Repositórios de dados. Estes pertencem a `src/features/[nomeFeature]/db/`.

### 3.6. `src/services/` - Clientes de Serviços Externos Globais

*   **Propósito:** Contém módulos para interagir com APIs de terceiros ou outros serviços externos que são amplamente utilizados pela aplicação (ex: serviços de pagamento, e-mail, armazenamento de arquivos como MinIO se usado por múltiplas features).
*   **Distinção:** Se um cliente de serviço é usado apenas por uma feature, ele pode residir em `src/features/[nomeFeature]/services/`.

### 3.7. `src/styles/` - Estilos Globais

*   **Propósito:** Arquivos CSS globais, como `globals.css` para Tailwind CSS, reset/normalize CSS, ou definições de variáveis CSS globais.

### 3.8. `src/assets/` - Ativos Estáticos

*   **Propósito:** Imagens, fontes e outros arquivos estáticos que são servidos pela aplicação.

### 3.9. `src/utils/` - Utilitários Diversos Globais

*   **Propósito:** Funções utilitárias pequenas e genéricas que não se encaixam em `src/lib/` ou são específicas do ambiente (ex: helpers para Next.js).
*   **Exemplo:** `uuidUtils.ts`.

### 3.10. `src/test/` - Configuração de Teste Global

*   **Propósito:** Arquivos de configuração para o framework de teste (ex: `vitest.setup.ts`), mocks globais, ou utilitários de teste reutilizáveis em todo o projeto.
*   **Testes de Unidade/Integração:** Devem residir próximos ao código que testam (ex: `*.test.ts` ou `*.spec.ts` ao lado do arquivo de código fonte).

### 3.11. `src/types/` (Opcional, se necessário)

*   **Propósito:** Definições de tipo TypeScript globais que são usadas em múltiplas partes da aplicação e não são específicas de uma feature.
*   **Preferência:** Sempre que possível, defina tipos próximos de onde são usados. Crie esta pasta apenas se houver uma necessidade clara de tipos verdadeiramente globais.

### 3.12. Raiz de `src/`

*   **`constant.tsx` / `constants.ts`**: Constantes globais da aplicação.
*   Outros arquivos de configuração globais que precisam estar na raiz de `src/` por alguma razão específica de ferramenta.

## 4. Fluxo de Trabalho e Criação de Novas Features

1.  **Criar Diretório da Feature:** `src/features/[nomeFeature]`
2.  **Adicionar Subdiretórios Necessários:** (actions, components, db, lib, schemas, services, usecases).
3.  **Implementar Lógica:**
    *   **Schemas (Zod):** Definir em `schemas/`.
    *   **Repositórios (Drizzle):** Definir em `db/` para interagir com as tabelas de `src/db/postgres/schema/`.
    *   **Use Cases:** Implementar em `usecases/`, utilizando repositórios.
    *   **Server Actions:** Implementar em `actions/`, chamando use cases.
    *   **Componentes React:** Implementar em `components/`.
    *   **Páginas/Rotas:** Criar em `src/app/` e conectar aos actions e componentes da feature.
4.  **Testes:** Escrever testes para cada camada.

Este documento é um guia vivo e pode ser atualizado conforme o projeto evolui e novas decisões de arquitetura são tomadas.

---
**Próximo Passo:** Por favor, revise este rascunho. Se estiver de acordo, posso prosseguir com a criação do arquivo. Se precisar de ajustes, me informe.
