---
id: REFAC-STRUCT-012
title: Renomear `src/db/` para `src/lib/db-config/` e ajustar caminhos
description: >
  Conforme o `docs/project-structure-guide.md`, a configuração do banco de dados
  (conexão, cliente Drizzle, scripts de migração) deve residir em `src/lib/db-config/`
  em vez de `src/db/`. Esta tarefa envolve renomear o diretório `src/db/postgres/`
  (e potencialmente `src/db/` se ele contiver apenas `postgres/`) para
  `src/lib/db-config/postgres/` e atualizar todas as referências e imports no
  código para refletir essa mudança.
status: Pendente
priority: P3
complexity: 1
created_date: 2024-08-07
due_date:
dependencies:
  - AUDIT-001
  - ARCH-DOC-001
assignee: AgenteJules
tags:
  - refactor
  - structure
  - database
---

### Critérios de Aceitação:
- O diretório `src/db/postgres/` é movido/renomeado para `src/lib/db-config/postgres/`.
- Se `src/db/` se tornar vazio, ele é removido.
- Todos os imports e referências no código que apontavam para o caminho antigo são atualizados para o novo caminho.
- A aplicação compila e os scripts de migração (se houver comandos para executá-los) funcionam corretamente após a mudança.
- ESLint não reporta erros de caminho relacionados a esta mudança.
