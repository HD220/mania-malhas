---
id: "REFAC-01.4.3.4"
title: "Mover Server Actions `transaction` para `src/features/transaction/actions/`"
priority: "P4"
status: "Pendente"
complexity: 1
assigned_to: "AgenteJules"
dependencies:
  - "REFAC-01.4.3.2"
parent_task: "REFAC-01.4"
creation_date: "2024-08-09"
completion_date: ""
tags:
  - "refactor"
  - "transaction"
  - "server-actions"
  - "backend"
notes: |
  Mover Server Actions da feature `transaction` para `src/features/transaction/actions/`.
---

**Descrição Detalhada:**

1.  **Identificar Server Actions:** Localizar actions de `transaction`.
2.  **Mover Arquivos:** Mover para `src/features/transaction/actions/`, nomear como `transaction.actions.ts` ou similar.
3.  **Atualizar Usages:** Atualizar chamadas nas UIs.
4.  **Validar:** ESLint, testes funcionais.

**Critérios de Aceitação:**
*   Server Actions de `transaction` em `src/features/transaction/actions/`.
*   Nomes de arquivo OK.
*   Usages OK.
*   ESLint OK.
*   Funcionalidade OK.
