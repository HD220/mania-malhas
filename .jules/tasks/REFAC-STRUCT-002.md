---
id: "REFAC-STRUCT-002"
title: "Mover `actions.tsx` de `src/app/(auth)/` para `src/features/auth/actions/auth.actions.ts`"
priority: "P3"
status: "Pendente"
complexity: 1
assigned_to: "AgenteJules"
dependencies: ["REFAC-STRUCT-001"]
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
  O arquivo `actions.tsx` (contendo lógica de autenticação) está em `src/app/(auth)/actions.tsx`.
  Deve ser movido para `src/features/auth/actions/auth.actions.ts` para seguir a convenção kebab-case para arquivos não-componentes e agrupar por feature.
  A feature `auth` (diretório `src/features/auth/`) será criada se não existir.
---

**Descrição Detalhada:**

1.  **Criar Estrutura da Feature (se necessário):**
    *   Garantir que o diretório `src/features/auth/actions/` exista. Se `src/features/auth/` não existir, criá-lo.
2.  **Identificar Arquivo:**
    *   Arquivo de origem: `src/app/(auth)/actions.tsx`.
3.  **Mover e Renomear Arquivo:**
    *   Mover `src/app/(auth)/actions.tsx` para `src/features/auth/actions/auth.actions.ts`.
4.  **Atualizar Imports:**
    *   Localizar todos os imports que referenciam o antigo caminho (`@/app/(auth)/actions` ou relativos).
    *   Atualizar para o novo caminho (ex: `@/features/auth/actions/auth.actions`).
5.  **Validar:**
    *   Executar ESLint para verificar conformidade com as novas regras de estrutura e nomenclatura.
    *   Executar testes relacionados à autenticação.
    *   Testar manualmente as funcionalidades de autenticação.

**Critérios de Aceitação:**
*   O diretório `src/features/auth/actions/` existe.
*   O arquivo de actions de autenticação está em `src/features/auth/actions/auth.actions.ts`.
*   Todos os imports estão corretos.
*   ESLint passa sem erros relevantes.
*   Funcionalidades de autenticação operam como esperado.
