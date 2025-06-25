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
completion_date: "2024-08-07" # Atualizada data de conclusão
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
  ESLint não pôde ser executado devido a erro no sandbox (tentativa anterior).
  Tarefa reaberta para concluir a validação do ESLint.
  Import em `transaction-payments-modal.tsx` corrigido (`./ui/use-toast` para `@/components/ui/use-toast`).
  ESLint executado com sucesso no arquivo `src/features/payment/components/transaction-payments-modal.tsx` após a correção.
---

**Descrição Detalhada:**

A tarefa consistia em mover os componentes UI da feature `payment` para `src/features/payment/components/` e atualizar os imports.

**Resultado:**
1.  **Identificação:** Os componentes `payment-form.tsx` e `payment-list.tsx` já estavam em `src/features/payment/components/`. O componente `transaction-payments-modal.tsx` foi identificado em `src/components/`.
2.  **Movimentação:** `transaction-payments-modal.tsx` foi movido para `src/features/payment/components/transaction-payments-modal.tsx`.
3.  **Atualização de Imports:** O import de `TransactionPaymentsModal` em `src/app/(admin)/transactions/list/page.tsx` foi atualizado para o novo caminho.
4.  **Validação:**
    *   ESLint: Tentativas anteriores de rodar ESLint resultaram em erro "Failed to compute affected file count". A tarefa foi reaberta. O import de `useToast` em `transaction-payments-modal.tsx` foi corrigido de um caminho relativo para o alias `@/components/ui/use-toast`. Após a correção, o ESLint passou com sucesso no arquivo `src/features/payment/components/transaction-payments-modal.tsx`.
    *   Testes de UI: Fora do escopo do agente.
