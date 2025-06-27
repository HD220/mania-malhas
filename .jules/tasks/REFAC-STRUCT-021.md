---
id: REFAC-STRUCT-021
title: Investigar e refatorar/remover `schemaTemplate.ts`
description: >
  O arquivo `src/db/postgres/schemaTemplate.ts` (ou seu futuro local após
  a execução de REFAC-STRUCT-012, que move `src/db/` para `src/lib/db-config/`)
  não parece ser uma definição de tabela Drizzle padrão (`*.table.ts`) conforme
  o `docs/project-structure-guide.md`. Esta tarefa consiste em investigar a
  finalidade deste arquivo. Se for um template obsoleto ou desnecessário,
  deve ser removido. Se contiver alguma lógica útil para a definição de schemas
  que não se encaixe no padrão de arquivos de tabela individuais, deve ser
  avaliado se pode ser refatorado, renomeado para `kebab-case` e movido para
  um local apropriado (ex: dentro de `src/lib/db-config/utils/` se for um utilitário).
status: Concluído
priority: P4
complexity: 1
created_date: 2024-08-08
due_date:
dependencies:
  - AUDIT-001
  - REFAC-STRUCT-012 # Depende da movimentação da pasta db
assignee: AgenteJules
tags:
  - refactor
  - structure
  - database
  - cleanup
---

### Critérios de Aceitação:
- O propósito do arquivo `schemaTemplate.ts` é claramente entendido.
- Se o arquivo for desnecessário, é removido do repositório.
- Se o arquivo contiver lógica útil:
    - É renomeado para `kebab-case` (ex: `schema-template-util.ts`).
    - É movido para um local apropriado dentro de `src/lib/db-config/` ou `src/lib/utils/`.
    - Quaisquer imports que o utilizem são atualizados.
- A aplicação continua compilando e funcionando corretamente.
- ESLint não reporta erros relacionados a este arquivo após a ação.

### Notas de Implementação:
- Verificar o conteúdo do arquivo para entender sua função.
- Procurar por usos deste arquivo no restante do código base.
