---
id: "REFAC-STRUCT-009"
title: "Mover `transactionRepository` para `src/features/transaction/db/`"
priority: "P3"
status: "Concluído"
complexity: 1
assigned_to: "AgenteJules"
dependencies: [] # Feature `transaction` já existe
creation_date: "2024-08-07"
completion_date: "2024-08-09"
tags:
  - "refactor"
  - "estrutura"
  - "transaction"
  - "database"
parent_task: "AUDIT-001"
notes: |
  O `transactionRepository.ts` e seu teste (se existir) estão atualmente em `src/db/repositories/`.
  Devem ser movidos para a feature `transaction` em `src/features/transaction/db/transaction-repository.ts`.
---

**Descrição Detalhada:**

1.  **Garantir Estrutura:**
    *   Verificar se o diretório `src/features/transaction/db/` existe.
2.  **Identificar Arquivos:**
    *   Origem: `src/db/repositories/transactionRepository.ts` e `src/db/repositories/transactionRepository.test.ts` (se existir).
3.  **Mover e Renomear Arquivos:**
    *   Mover `transactionRepository.ts` para `src/features/transaction/db/transaction-repository.ts`.
    *   Mover `transactionRepository.test.ts` (se existir) para `src/features/transaction/db/transaction-repository.test.ts`.
4.  **Atualizar Imports:**
    *   Atualizar todos os imports para `@/features/transaction/db/transaction-repository`.
    *   Verificar `src/db/repositories/index.ts`.
5.  **Validar:**
    *   ESLint e testes da feature `transaction`.

**Critérios de Aceitação:**
*   Arquivos do `transactionRepository` movidos e renomeados corretamente.
*   Imports atualizados.
*   ESLint e testes passam.
