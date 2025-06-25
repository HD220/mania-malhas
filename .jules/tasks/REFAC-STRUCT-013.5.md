---
id: REFAC-STRUCT-013.5
title: Mover schema `transaction.ts` para `src/features/transaction/db/schema.ts`
description: >
  Como parte do desmembramento dos schemas de banco de dados centralizados
  (REFAC-STRUCT-013), esta tarefa foca em mover a definição da(s) tabela(s)
  de transação, atualmente em `src/lib/db-config/postgres/schema/transaction.ts` (após
  REFAC-STRUCT-012), para `src/features/transaction/db/schema.ts`.
status: Pendente
priority: P3
complexity: 1
created_date: 2024-08-08
due_date:
dependencies:
  - REFAC-STRUCT-013
  - REFAC-STRUCT-012
parent_task: REFAC-STRUCT-013
assignee: AgenteJules
tags:
  - refactor
  - structure
  - database
  - schema
  - transaction-feature
---

### Critérios de Aceitação:
- O conteúdo do arquivo `.../schema/transaction.ts` é movido para `src/features/transaction/db/schema.ts`.
- O arquivo original é removido.
- Imports atualizados.
- Lógica da feature `transaction` usa o schema local.
- Aplicação compila, ESLint OK.
- Migrações Drizzle OK após `REFAC-STRUCT-013.7`.
