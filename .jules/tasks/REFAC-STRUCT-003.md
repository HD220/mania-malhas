---
id: "REFAC-STRUCT-003"
title: "Mover `session.ts` e `session.test.ts` de `src/lib/auth/` para `src/features/auth/lib/`"
priority: "P3"
status: "Concluído"
complexity: 1
assigned_to: "AgenteJules"
dependencies: ["REFAC-STRUCT-001"] # Depende da criação da feature `auth`
creation_date: "2024-08-07"
completion_date: "2024-08-09"
tags:
  - "refactor"
  - "estrutura"
  - "auth"
  - "backend"
  - "lib"
parent_task: "AUDIT-001"
notes: |
  Os arquivos `session.ts` e `session.test.ts`, contendo lógica de gerenciamento de sessão de autenticação,
  estão atualmente em `src/lib/auth/`. Eles devem ser movidos para dentro da feature `auth` em `src/features/auth/lib/`.
  Se a subpasta `lib` não for comum dentro de features, pode-se mover diretamente para `src/features/auth/session.ts`.
  Por ora, o destino será `src/features/auth/lib/`.
---

**Descrição Detalhada:**

1.  **Criar Estrutura da Feature (se necessário):**
    *   Verificar se o diretório `src/features/auth/lib/` existe.
    *   Se não existir, criar `src/features/auth/` e `src/features/auth/lib/`. (Nota: `src/features/auth/` pode já existir).
2.  **Identificar Arquivos:**
    *   Arquivos a serem movidos: `src/lib/auth/session.ts` e `src/lib/auth/session.test.ts`.
3.  **Mover Arquivos:**
    *   Mover `src/lib/auth/session.ts` para `src/features/auth/lib/session.ts`.
    *   Mover `src/lib/auth/session.test.ts` para `src/features/auth/lib/session.test.ts`.
4.  **Atualizar Imports:**
    *   Identificar todos os locais no código onde `session.ts` é importado.
    *   Atualizar os caminhos de import para apontar para o novo local (ex: `@/features/auth/lib/session`).
5.  **Validar:**
    *   Executar ESLint.
    *   Executar os testes `session.test.ts` em seu novo local.
    *   Executar outros testes relacionados à autenticação e sessão.
    *   Testar manualmente funcionalidades que dependem da sessão (login, logout, acesso a rotas protegidas).

**Critérios de Aceitação:**
*   O diretório `src/features/auth/lib/` existe.
*   Os arquivos `session.ts` e `session.test.ts` estão localizados em `src/features/auth/lib/`.
*   Todos os imports para `session.ts` estão atualizados.
*   ESLint passa sem erros.
*   Testes de sessão e funcionalidades de sessão continuam operando como esperado.
