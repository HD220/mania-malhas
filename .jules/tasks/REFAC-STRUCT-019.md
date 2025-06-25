---
id: REFAC-STRUCT-019
title: Mover `src/test/setup.ts` para `test-setup.ts` na raiz do projeto
description: >
  O `docs/project-structure-guide.md` especifica que o arquivo de configuração
  global para testes (ex: `test-setup.ts` para Vitest/Jest) deve estar localizado
  na raiz do projeto, e não dentro do diretório `src/`. Atualmente, o arquivo
  está em `src/test/setup.ts`.
  Esta tarefa consiste em mover este arquivo para a raiz do projeto. A configuração
  do executor de testes (ex: `vitest.config.ts`) pode precisar ser atualizada
  para referenciar o novo local do arquivo de setup. O diretório `src/test/`
  deve ser removido se ficar vazio.
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
  - test
  - configuration
---

### Critérios de Aceitação:
- O arquivo `src/test/setup.ts` é movido para `test-setup.ts` na raiz do projeto.
- A configuração do executor de testes (ex: `vitest.config.ts` ou `jest.config.js`) é atualizada para apontar para o novo local do arquivo `test-setup.ts`, se necessário.
- Os testes continuam a ser executados corretamente, utilizando a configuração global do novo local.
- O diretório `src/test/` é removido se esta ação o deixar vazio.
- ESLint não reporta erros de caminho relacionados a este arquivo (se aplicável).
