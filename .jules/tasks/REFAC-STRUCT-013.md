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
  `src/features/product/db/schema.ts`). Pode ser necessário criar um ponto de
  agregação para todos os schemas, se o Drizzle exigir.
status: Pendente
priority: P3
complexity: 2
created_date: 2024-08-07
due_date:
dependencies:
  - REFAC-STRUCT-012
  - ARCH-DOC-001
assignee: AgenteJules
tags:
  - refactor
  - structure
  - database
  - schema
---

### Critérios de Aceitação:
- As definições de tabelas de banco de dados são movidas do local centralizado para arquivos `schema.ts` dentro de `src/features/[feature]/db/`.
- Cada feature contém apenas o schema das tabelas que gerencia diretamente.
- Se necessário, um arquivo de agregação de schemas é criado e funciona corretamente com Drizzle ORM (por exemplo, para migrações).
- Os repositórios e a lógica de banco de dados dentro de cada feature usam seu schema local.
- A aplicação compila, as migrações funcionam e os testes relacionados ao banco de dados passam.
- ESLint não reporta erros de caminho ou estrutura relacionados a esta mudança.

### Notas Adicionais:
- Esta tarefa tem complexidade 2 e pode precisar ser desmembrada em sub-tarefas menores, uma para cada feature ou grupo de features, se a quantidade de schemas for grande.
- Investigar como o Drizzle lida com schemas distribuídos para o processo de migração e para a instanciação do cliente.
