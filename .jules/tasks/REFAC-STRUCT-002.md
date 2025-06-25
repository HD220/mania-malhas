---
id: "REFAC-STRUCT-002"
title: "Mover `actions.tsx` de `src/app/(auth)/` para `src/features/auth/actions/`"
priority: "P3"
status: "Pendente"
complexity: 1
assigned_to: "AgenteJules"
dependencies: ["REFAC-STRUCT-001"] # Idealmente após a criação da feature auth e seus componentes
creation_date: "2024-08-07"
completion_date: ""
tags:
  - "refactor"
  - "estrutura"
  - "auth"
  - "backend"
  - "actions"
parent_task: "AUDIT-001"
notes: |
  O arquivo `actions.tsx` contendo lógica de actions de autenticação está atualmente em `src/app/(auth)/actions.tsx`.
  Ele deve ser movido para dentro da feature `auth` em `src/features/auth/actions/actions.tsx`.
  Esta tarefa assume que a estrutura básica da feature `auth` (como `src/features/auth/`) pode ter sido criada pela REFAC-STRUCT-001 ou será criada aqui.
---

**Descrição Detalhada:**

1.  **Criar Estrutura da Feature (se necessário):**
    *   Verificar se o diretório `src/features/auth/actions/` existe.
    *   Se não existir, criar `src/features/auth/` e `src/features/auth/actions/`. (Nota: `src/features/auth/` pode já existir devido a `REFAC-STRUCT-001`).
2.  **Identificar Arquivo:**
    *   O arquivo a ser movido é `src/app/(auth)/actions.tsx`.
3.  **Mover Arquivo:**
    *   Mover `src/app/(auth)/actions.tsx` para `src/features/auth/actions/actions.tsx`. (Pode ser renomeado para `index.ts` ou manter `actions.tsx` dependendo da convenção para actions na feature). Por ora, manterei `actions.tsx`.
4.  **Atualizar Imports:**
    *   Identificar todos os locais no código onde estas actions são importadas (provavelmente de dentro de `src/app/(auth)/...` ou componentes de login/registro).
    *   Atualizar os caminhos de import para apontar para o novo local (ex: `@/features/auth/actions`).
5.  **Validar:**
    *   Executar ESLint.
    *   Executar testes relacionados à autenticação.
    *   Testar manualmente as funcionalidades que utilizam estas actions (login, registro, logout, etc.).

**Critérios de Aceitação:**
*   O diretório `src/features/auth/actions/` existe.
*   O arquivo de actions de autenticação está localizado em `src/features/auth/actions/actions.tsx` (ou nome similar).
*   Todos os imports para estas actions estão atualizados.
*   ESLint passa sem erros.
*   Funcionalidades de autenticação continuam operando como esperado.
