---
id: REFAC-STRUCT-013.7
title: Ajustar agregação de schemas Drizzle e validar migrações pós-desmembramento
description: >
  Após a conclusão das sub-tarefas REFAC-STRUCT-013.1 a REFAC-STRUCT-013.6, que
  moveram os schemas de tabelas individuais para seus respectivos diretórios de feature,
  esta tarefa visa garantir que o Drizzle ORM ainda consiga agregar todos os schemas
  corretamente para fins de geração de migrações e para a instanciação do cliente DB.
  Pode ser necessário criar ou ajustar um arquivo central (ex: `src/lib/db-config/postgres/schema/index.ts`
  ou diretamente no `src/lib/db-config/postgres/index.ts` onde o `db` é instanciado)
  que importe todos os schemas das features.
status: Concluído
priority: P2 # Prioridade maior pois valida o trabalho das outras sub-tarefas
complexity: 1
created_date: 2024-08-08
completion_date: "2024-08-09"
dependencies:
  - REFAC-STRUCT-013.1
  - REFAC-STRUCT-013.2
  - REFAC-STRUCT-013.3
  - REFAC-STRUCT-013.4
  - REFAC-STRUCT-013.5
  - REFAC-STRUCT-013.6
parent_task: REFAC-STRUCT-013
assignee: AgenteJules
tags:
  - refactor
  - structure
  - database
  - schema
  - drizzle-orm
  - validation
---

### Critérios de Aceitação:
- Todos os schemas de tabelas, agora localizados em `src/features/[feature]/db/schema.ts`, são corretamente agregados para uso pelo Drizzle ORM.
- O cliente Drizzle (`db`) é instanciado com todos os schemas disponíveis.
- O comando de geração de migrações do Drizzle Kit (ex: `drizzle-kit generate:pg`) funciona corretamente e detecta alterações nos schemas individuais das features.
- Se nenhuma alteração de schema real foi feita (apenas movimentação), a geração de migração deve resultar em uma migração vazia ou nenhuma migração.
- A aplicação compila e os testes relacionados ao banco de dados (se existentes e abrangentes) passam.
- A execução de migrações (`db push` ou `migrate`) funciona.

### Notas de Implementação:
- Investigar a melhor prática para agregar múltiplos arquivos de schema com Drizzle. Geralmente, isso envolve importar todos os objetos de tabela e espalhá-los em um único objeto de schema passado para `drizzle()`.
- Exemplo de agregação em `src/lib/db-config/postgres/index.ts` ou um `schema/index.ts` dedicado:
  ```typescript
  // import * as userSchema from '@/features/user/db/schema';
  // import * as productSchema from '@/features/product/db/schema';
  // ... outros schemas
  //
  // const allSchemas = {
  //   ...userSchema,
  //   ...productSchema,
  //   // ... outros
  // };
  //
  // export const db = drizzle(client, { schema: allSchemas });
  ```
- Testar a geração de uma nova migração (mesmo que vazia) é crucial.
