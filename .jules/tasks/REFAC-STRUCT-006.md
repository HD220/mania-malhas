---
id: "REFAC-STRUCT-006"
title: "Mover `paymentRepository` para `src/features/payment/db/`"
priority: "P3"
status: "Pendente"
complexity: 1
assigned_to: "AgenteJules"
dependencies: [] # Feature `payment` já existe
creation_date: "2024-08-07"
completion_date: ""
tags:
  - "refactor"
  - "estrutura"
  - "payment"
  - "database"
parent_task: "AUDIT-001"
notes: |
  O `paymentRepository.ts` e seu teste (se existir) estão atualmente em `src/db/repositories/`.
  Devem ser movidos para a feature `payment` em `src/features/payment/db/payment-repository.ts`.
---

**Descrição Detalhada:**

1.  **Garantir Estrutura:**
    *   Verificar se o diretório `src/features/payment/db/` existe.
2.  **Identificar Arquivos:**
    *   Origem: `src/db/repositories/paymentRepository.ts` e `src/db/repositories/paymentRepository.test.ts` (se existir).
3.  **Mover e Renomear Arquivos:**
    *   Mover `paymentRepository.ts` para `src/features/payment/db/payment-repository.ts`.
    *   Mover `paymentRepository.test.ts` (se existir) para `src/features/payment/db/payment-repository.test.ts`.
4.  **Atualizar Imports:**
    *   Atualizar todos os imports para `@/features/payment/db/payment-repository`.
    *   Verificar `src/db/repositories/index.ts`.
5.  **Validar:**
    *   ESLint e testes da feature `payment`.

**Critérios de Aceitação:**
*   Arquivos do `paymentRepository` movidos e renomeados corretamente.
*   Imports atualizados.
*   ESLint e testes passam.
