# Guia de Estrutura e Organização do Projeto

## 1. Introdução e Objetivos

Este documento descreve a arquitetura geral do projeto e as convenções para organização de diretórios e arquivos dentro da pasta `src/`. O objetivo é fornecer uma "fonte da verdade" para a estrutura do projeto, garantindo consistência, manutenibilidade e escalabilidade. Este guia deve orientar as atividades de refatoração e o desenvolvimento de novas funcionalidades.
**Todos os nomes de arquivo e diretório devem seguir o padrão `kebab-case`**, exceto quando ditado por convenções de frameworks (ex: `page.tsx`, `layout.tsx` no Next.js App Router, ou nomes de componentes React que são `PascalCase`).

## 2. Visão Geral da Arquitetura

O projeto é uma aplicação web full-stack construída com as seguintes tecnologias principais:

*   **Framework Frontend/Backend:** Next.js (utilizando o App Router)
*   **Linguagem:** TypeScript
*   **ORM:** Drizzle ORM para interação com banco de dados PostgreSQL.
*   **Estilização:** Tailwind CSS e componentes ShadCN/UI.
*   **Testes:** Vitest. Os arquivos de teste devem estar em um diretório `__tests__/` ao lado do arquivo que está sendo testado (ex: `src/features/user/components/user-profile.tsx` e `src/features/user/components/__tests__/user-profile.test.tsx`).
*   **Configuração de Testes:** O arquivo de setup de testes deve estar na raiz do projeto como `test-setup.ts`.
*   **Linting:** ESLint.

## 3. Organização do Diretório `src/`

A pasta `src/` é a raiz para todo o código-fonte da aplicação.

### 3.1. `src/app/` - Roteamento, Páginas e Layouts

*   **Propósito:** Contém todas as rotas, páginas e layouts da aplicação (Next.js App Router).
    *   Para diretrizes detalhadas sobre o uso de Route Groups e estratégias de layout, consulte o [Guia de Layouts e Route Groups](./layout-and-route-groups-guide.md).
*   **Estrutura:**
    *   Route Groups (ex: `(admin)`, `(auth)`) são permitidos e encorajados para aplicar layouts distintos a seções da aplicação.
    *   Arquivos padrão do Next.js: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`.
*   **Componentes Específicos de Rota:** Devem residir em `components/` dentro da pasta da rota (ex: `src/app/(admin)/dashboard/components/overview-chart.tsx`).
*   **Lógica Específica de Rota:** Server Actions (`actions.ts`) podem estar aqui se estritamente ligadas à rota. Se complexas/reutilizáveis, mover para `src/features/`.

### 3.2. `src/components/` - Componentes de UI Genéricos e Reutilizáveis

*   **Propósito:** Componentes React genéricos, não atrelados a uma feature de negócio específica.
*   **Estrutura:**
    *   **`ui/`**: Componentes base do ShadCN/UI (ex: `button.tsx`, `card.tsx`). Nomes de arquivo aqui podem seguir a convenção `PascalCase.tsx` se for o padrão da biblioteca.
    *   **Raiz de `src/components/`**: Componentes compostos reutilizáveis (ex: `theme-toggle.tsx`).
*   **Distinção:** Componentes específicos de feature vão para `src/features/[nome-feature]/components/`.

### 3.3. `src/features/` - Módulos de Funcionalidade de Negócio

*   **Propósito:** Lógica de negócio verticalmente fatiada.
*   **Nome da Feature:** `kebab-case` (ex: `user-profile`, `product-management`).
*   **Estrutura Interna (`src/features/[nome-feature]/`):**
    *   **`actions/`**: Server Actions (ex: `update-user-profile.action.ts`).
    *   **`components/`**: Componentes React específicos da feature (ex: `user-profile-form.tsx`).
    *   **`db/`**: Lógica de acesso ao banco de dados da feature (repositórios Drizzle) (ex: `user-repository.ts`).
    *   **`lib/`**: Utilitários ou lógica de biblioteca específica da feature (ex: `pricing-calculator.ts`). Pode incluir subpasta `utils/` se necessário.
    *   **`types/`**: Definições de tipo TypeScript e Schemas Zod específicos da feature. Tipos devem ser derivados dos Schemas Zod sempre que possível. (Ex: `user-profile.schema.ts`, `user-profile.types.ts`).
    *   **`usecases/`**: Casos de uso/lógica de negócio central (ex: `get-user-profile.usecase.ts`).
    *   `index.ts` (opcional): Para reexportar elementos.
*   **Observação:** Crie apenas subdiretórios necessários. Não deve haver pasta `services/` ou `schemas/` (fora de `types/`) a nível de feature.

### 3.4. `src/lib/` - Configurações Globais, Clientes de Serviço e Utilitários

*   **Propósito:** Código genérico, configurações globais, clientes para serviços externos e utilitários reutilizáveis.
*   **Estrutura:**
    *   **`db-config/`**: Configuração global do Drizzle ORM.
        *   **`schema/`**: Definições de tabelas Drizzle (`*.table.ts`).
        *   `drizzle.config.ts`, `index.ts` (cliente `db`), `migrate.ts`, `seed.ts`.
        *   `migrations/`: Migrações Drizzle.
    *   **`utils/`**: Utilitários globais (ex: `format-date.util.ts`, `uuid.util.ts`).
    *   **`clients/` ou `sdk/` (sugestão):** Para clientes de serviços externos globais (ex: `minio-client.ts`, `stripe-client.ts`).
    *   **`shared-types/` (sugestão):** Para tipos TypeScript e Schemas Zod compartilhados entre múltiplas features.
    *   **`constants/`**: Constantes globais (ex: `app-routes.constant.ts`).
*   **Evitar:** Lógica de negócio ou componentes de UI. Não deve haver pasta `services/` ou `utils/` diretamente em `src/` (elas são movidas para dentro de `lib/` ou para features).

### 3.5. `src/assets/` - Ativos Estáticos

*   **Propósito:** Imagens, fontes, etc. (ex: `logo.png`, `main-font.woff2`).

### 3.6. Raiz de `src/`

*   **`globals.css`**: Estilos globais da aplicação (Tailwind CSS). A pasta `src/styles/` não deve existir.
*   **`types/` (opcional):** Apenas para tipos verdadeiramente globais que não se encaixam em `lib/shared-types/` ou em features.

## 4. Fluxo de Trabalho e Criação de Novas Features

1.  **Criar Diretório da Feature:** `src/features/[nome-feature]` (kebab-case).
2.  **Adicionar Subdiretórios Necessários:** (actions, components, db, lib, types, usecases).
3.  **Implementar Lógica:**
    *   **Schemas Zod e Tipos:** Definir em `types/` dentro da feature.
    *   **Repositórios (Drizzle):** Definir em `db/` dentro da feature.
    *   **Use Cases:** Implementar em `usecases/`.
    *   **Server Actions:** Implementar em `actions/`.
    *   **Componentes React:** Implementar em `components/`.
    *   **Páginas/Rotas:** Criar em `src/app/`.
4.  **Testes:** Criar em `__tests__/` ao lado dos arquivos testados.

Este documento é um guia vivo e pode ser atualizado.
