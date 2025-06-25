---
id: REFAC-STRUCT-013
title: Desmembrar schemas de `src/lib/db-config/postgres/schema/` para `src/features/[feature]/db/schema.ts`
description: >
  Atualmente, os schemas de banco de dados (definições de tabela Drizzle) parecem
  estar centralizados em `src/lib/db-config/postgres/schema/` (após a REFAC-STRUCT-012).
  Conforme o `docs/project-structure-guide.md`, cada feature deve ser proprietária
  de seu schema de banco de dados. Esta tarefa envolve mover as definições de tabela
  relevantes do diretório centralizado para arquivos `schema.ts` dentro do
  subdiretório `db/` de cada feature correspondente (ex: `src/features/user/db/schema.ts`,
  `src/features/product/db/schema.ts`).
status: Subdividido
priority: P3
complexity: 2
created_date: 2024-08-07
due_date:
completion_date: 2024-08-08 # Data do desmembramento
dependencies:
  - REFAC-STRUCT-012
  - ARCH-DOC-001
assignee: AgenteJules
tags:
  - refactor
  - structure
  - database
  - schema
  - meta-tarefa
---

### Critérios de Aceitação Originais (Agora cobertos pelas sub-tarefas):
- As definições de tabelas de banco de dados são movidas do local centralizado para arquivos `schema.ts` dentro de `src/features/[feature]/db/`.
- Cada feature contém apenas o schema das tabelas que gerencia diretamente.
- Um arquivo de agregação de schemas é criado/ajustado e funciona corretamente com Drizzle ORM.
- Os repositórios e a lógica de banco de dados dentro de cada feature usam seu schema local.
- A aplicação compila, as migrações funcionam e os testes relacionados ao banco de dados passam.
- ESLint não reporta erros de caminho ou estrutura relacionados a esta mudança.

### Sub-tarefas Criadas:
Esta tarefa foi desmembrada nas seguintes sub-tarefas:
- `REFAC-STRUCT-013.1`: Mover schema `user.ts` para `src/features/user/db/schema.ts`.
- `REFAC-STRUCT-013.2`: Mover schemas `product.ts` e `productImage.ts` para `src/features/product/db/schema.ts`.
- `REFAC-STRUCT-013.3`: Mover schema `partner.ts` para `src/features/partner/db/schema.ts`.
- `REFAC-STRUCT-013.4`: Mover schema `payment.ts` para `src/features/payment/db/schema.ts`.
- `REFAC-STRUCT-013.5`: Mover schema `transaction.ts` para `src/features/transaction/db/schema.ts`.
- `REFAC-STRUCT-013.6`: Mover schema `notification.ts` para `src/features/notification/db/schema.ts`.
- `REFAC-STRUCT-013.7`: Ajustar agregação de schemas Drizzle e validar migrações pós-desmembramento.

### Notas Adicionais:
- A complexidade original era 2. Foi desmembrada em tarefas de complexidade 1 para cada movimentação de schema de feature e uma tarefa final de validação/agregação.
- Investigar como o Drizzle lida com schemas distribuídos foi incorporado na tarefa `REFAC-STRUCT-013.7`.
