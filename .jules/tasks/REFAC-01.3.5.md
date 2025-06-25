---
id: "REFAC-01.3.5"
title: "Mover componentes UI `payment` para `src/features/payment/components/`"
priority: "P4"
status: "Concluído"
complexity: 1
assigned_to: "AgenteJules"
dependencies:
  - "REFAC-01.3.4"
creation_date: "2024-08-06"
completion_date: "2024-08-06"
tags:
  - "refactor"
  - "payment"
  - "frontend"
  - "ui"
parent_task: "REFAC-01.3"
notes: |
  Componentes UI `payment-form.tsx` e `payment-list.tsx` já estavam em `src/features/payment/components/`.
  O componente `transaction-payments-modal.tsx` foi movido de `src/components/` para `src/features/payment/components/`.
  O import em `src/app/(admin)/transactions/list/page.tsx` foi atualizado.
  ESLint não pôde ser executado devido a erro no sandbox.
---

**Descrição Detalhada:**

A tarefa consistia em mover os componentes UI da feature `payment` para `src/features/payment/components/` e atualizar os imports.

**Resultado:**
1.  **Identificação:** Os componentes `payment-form.tsx` e `payment-list.tsx` já estavam em `src/features/payment/components/`. O componente `transaction-payments-modal.tsx` foi identificado em `src/components/`.
2.  **Movimentação:** `transaction-payments-modal.tsx` foi movido para `src/features/payment/components/transaction-payments-modal.tsx`.
3.  **Atualização de Imports:** O import de `TransactionPaymentsModal` em `src/app/(admin)/transactions/list/page.tsx` foi atualizado para o novo caminho.
4.  **Validação:**
    *   ESLint: Tentativas de rodar ESLint resultaram em erro "Failed to compute affected file count". A validação de lint não pôde ser concluída.
    *   Testes de UI: Fora do escopo do agente.
