---
id: REFAC-STRUCT-015.4
title: Padronizar nomes de arquivos em `src/features/payment/` para `kebab-case`
description: >
  Como parte da padronização de nomes de arquivos (REFAC-STRUCT-015), esta tarefa
  foca no diretório `src/features/payment/` e seus subdiretórios. Todos os
  arquivos `.ts` e `.tsx` devem ser renomeados para `kebab-case`.
  Exemplos:
  - `actions/actions.test.ts` (ok)
  - `components/payment-form.tsx` (ok)
  - `components/payment-list.tsx` (ok)
  - `components/transaction-payments-modal.tsx` (ok)
  - `db/paymentRepository.ts` -> `db/payment-repository.ts`
  - `schemas/paymentSchema.ts` -> `schemas/payment.schema.ts`
  - `usecases/createPaymentUseCase.ts` -> `usecases/create-payment.usecase.ts`
  - `usecases/getPaymentsByTransactionIdUseCase.ts` -> `usecases/get-payments-by-transaction-id.usecase.ts`
  E assim por diante. Imports devem ser atualizados.
status: Pendente
priority: P3
complexity: 1
created_date: 2024-08-08
due_date:
dependencies:
  - REFAC-STRUCT-015
parent_task: REFAC-STRUCT-015
assignee: AgenteJules
tags:
  - refactor
  - structure
  - naming-convention
  - features
  - payment-feature
---

### Critérios de Aceitação:
- Todos os arquivos `.ts` e `.tsx` em `src/features/payment/` e subdiretórios (ignorando `.gitkeep`) são `kebab-case`.
- Nomes de arquivo descritivos.
- Imports atualizados.
- Aplicação compila, funcionalidades de pagamento OK.
- ESLint não reporta erros.

### Notas de Implementação:
- Muitos arquivos de componentes já parecem estar em `kebab-case`. Focar nos repositórios, schemas e use cases.
