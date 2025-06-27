---
id: "REFAC-01.4.3.3"
title: "Mover lógica de banco de dados (db/repositories) `transaction` para `src/features/transaction/db/`"
priority: "P4"
status: "Pendente"
complexity: 1
assigned_to: "AgenteJules"
dependencies:
  - "REFAC-01.4.3.1" # Schema de tabela já em features/transaction/db/schema.ts (via REFAC-STRUCT-013.5)
parent_task: "REFAC-01.4"
creation_date: "2024-08-09"
completion_date: ""
tags:
  - "refactor"
  - "transaction"
  - "database"
  - "repositories"
  - "backend"
notes: |
  Mover o `transaction-repository.ts` para `src/features/transaction/db/`.
  Validar que `REFAC-STRUCT-009` cobriu isso.
---

**Descrição Detalhada:**

1.  **Identificar Repositório:** Localizar `transaction-repository.ts`.
    *   Tarefa `REFAC-STRUCT-009` (Mover `transactionRepository`) já concluída. Validar.
2.  **Verificar Localização:** Confirmar em `src/features/transaction/db/`.
3.  **Atualizar Imports:** Verificar e atualizar.
4.  **Validar:** ESLint, testes DB de `transaction`.

**Critérios de Aceitação:**
*   Lógica de repositório de `transaction` em `src/features/transaction/db/`.
*   Imports OK.
*   ESLint OK.
*   Testes DB OK.
