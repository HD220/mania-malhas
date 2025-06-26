---
id: REFAC-STRUCT-015.6
title: Padronizar nomes de arquivos em `src/features/transaction/` para `kebab-case`
description: >
  Como parte da padronização de nomes de arquivos (REFAC-STRUCT-015), esta tarefa
  foca no diretório `src/features/transaction/` e seus subdiretórios. Todos os
  arquivos `.ts` e `.tsx` devem ser renomeados para `kebab-case`.
  Exemplos:
  - `components/CreateTransactionDialog.tsx` -> `components/create-transaction-dialog.component.tsx`
  - `components/DeleteTransactionButton.tsx` -> `components/delete-transaction-button.component.tsx`
  - `components/EditTransactionDialog.tsx` -> `components/edit-transaction-dialog.component.tsx`
  - `db/transactionRepository.ts` -> `db/transaction-repository.ts`
  - `schemas/transactionSchema.ts` -> `schemas/transaction.schema.ts`
  - `usecases/...` (ex: `createTransactionUseCase.ts` -> `create-transaction.usecase.ts`)
  E assim por diante. Imports devem ser atualizados.
status: Concluído
priority: P3
complexity: 1
created_date: 2024-08-08
completion_date: "2024-08-09"
dependencies:
  - REFAC-STRUCT-015
parent_task: REFAC-STRUCT-015
assignee: AgenteJules
tags:
  - refactor
  - structure
  - naming-convention
  - features
  - transaction-feature
---

### Critérios de Aceitação:
- Todos os arquivos `.ts` e `.tsx` em `src/features/transaction/` e subdiretórios são `kebab-case`.
- Nomes de arquivo descritivos, incluindo tipo de módulo.
- Imports atualizados.
- Aplicação compila, funcionalidades de transação OK.
- ESLint não reporta erros.

### Notas de Implementação:
- Focar nos componentes, repositório, schema e use cases.
- Arquivos de teste também devem seguir o padrão (ex: `create-transaction.usecase.test.ts`).
