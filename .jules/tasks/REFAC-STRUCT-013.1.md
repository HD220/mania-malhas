---
id: REFAC-STRUCT-013.1
title: Mover schema `user.ts` para `src/features/user/db/schema.ts`
description: >
  Como parte do desmembramento dos schemas de banco de dados centralizados
  (REFAC-STRUCT-013), esta tarefa foca em mover a definição da(s) tabela(s)
  de usuário, atualmente em `src/lib/db-config/postgres/schema/user.ts` (após
  REFAC-STRUCT-012), para `src/features/user/db/schema.ts`.
  Isso alinhará a estrutura do schema com a feature correspondente.
status: Concluído
priority: P3
complexity: 1
created_date: 2024-08-08
completion_date: "2024-08-09"
dependencies:
  - REFAC-STRUCT-013 # Tarefa mãe
  - REFAC-STRUCT-012 # Garante que o caminho base `src/lib/db-config/...` exista
parent_task: REFAC-STRUCT-013
assignee: AgenteJules
tags:
  - refactor
  - structure
  - database
  - schema
  - user-feature
---

### Critérios de Aceitação:
- O conteúdo do arquivo `src/lib/db-config/postgres/schema/user.ts` (ou caminho original se REFAC-STRUCT-012 não executada) é movido para `src/features/user/db/schema.ts`.
- O arquivo original (`.../schema/user.ts`) é removido do local centralizado.
- Todos os imports que referenciam o schema de usuário são atualizados para apontar para o novo local.
- Os repositórios e lógica de banco de dados dentro da feature `user` utilizam este schema local.
- A aplicação compila.
- ESLint não reporta erros de caminho ou estrutura relacionados a esta mudança.
- A funcionalidade de migração do Drizzle (após todas as sub-tarefas de schema serem movidas e REFAC-STRUCT-013.7 ser concluída) continua funcionando.

### Notas de Implementação:
- Será necessário cuidado ao atualizar os imports, especialmente se houver um arquivo central que agrega todos os schemas para o Drizzle.
- Esta tarefa foca apenas na movimentação do arquivo. A agregação e validação final das migrações é coberta por `REFAC-STRUCT-013.7`.
