---
id: REFAC-STRUCT-013.4
title: Mover schema `payment.ts` para `src/features/payment/db/schema.ts`
description: >
  Como parte do desmembramento dos schemas de banco de dados centralizados
  (REFAC-STRUCT-013), esta tarefa foca em mover a definição da(s) tabela(s)
  de pagamento, atualmente em `src/lib/db-config/postgres/schema/payment.ts` (após
  REFAC-STRUCT-012), para `src/features/payment/db/schema.ts`.
status: Concluído
priority: P3
complexity: 1
created_date: 2024-08-08
completion_date: "2024-08-09"
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
  - payment-feature
---

### Critérios de Aceitação:
- O conteúdo do arquivo `.../schema/payment.ts` é movido para `src/features/payment/db/schema.ts`.
- O arquivo original é removido.
- Imports atualizados.
- Lógica da feature `payment` usa o schema local.
- Aplicação compila, ESLint OK.
- Migrações Drizzle OK após `REFAC-STRUCT-013.7`.
