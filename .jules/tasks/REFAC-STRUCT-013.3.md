---
id: REFAC-STRUCT-013.3
title: Mover schema `partner.ts` para `src/features/partner/db/schema.ts`
description: >
  Como parte do desmembramento dos schemas de banco de dados centralizados
  (REFAC-STRUCT-013), esta tarefa foca em mover a definição da(s) tabela(s)
  de parceiro, atualmente em `src/lib/db-config/postgres/schema/partner.ts` (após
  REFAC-STRUCT-012), para `src/features/partner/db/schema.ts`.
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
  - partner-feature
---

### Critérios de Aceitação:
- O conteúdo do arquivo `.../schema/partner.ts` é movido para `src/features/partner/db/schema.ts`.
- O arquivo original é removido do local centralizado.
- Imports atualizados.
- Lógica da feature `partner` usa o schema local.
- Aplicação compila, ESLint OK.
- Migrações Drizzle OK após `REFAC-STRUCT-013.7`.
