---
id: REFAC-STRUCT-016
title: Renomear `domainErrors.ts` e teste para `kebab-case` em `src/lib/errors/`
description: >
  Conforme o `docs/project-structure-guide.md`, os nomes de arquivos devem seguir
  o padrão `kebab-case`. O arquivo `src/lib/errors/domainErrors.ts` e seu
  arquivo de teste associado (`domainErrors.test.ts`) precisam ser renomeados
  para `domain-errors.ts` e `domain-errors.test.ts`, respectivamente.
  Todos os imports que referenciam esses arquivos devem ser atualizados.
status: Concluído
priority: P3
complexity: 1
created_date: 2024-08-07
completion_date: "2024-08-09"
dependencies:
  - AUDIT-001
  - ARCH-DOC-001
assignee: AgenteJules
tags:
  - refactor
  - structure
  - naming-convention
  - lib
---

### Critérios de Aceitação:
- O arquivo `src/lib/errors/domainErrors.ts` é renomeado para `src/lib/errors/domain-errors.ts`.
- O arquivo `src/lib/errors/domainErrors.test.ts` é renomeado para `src/lib/errors/domain-errors.test.ts`.
- Todos os imports no código que referenciam os nomes antigos são atualizados para os novos nomes em `kebab-case`.
- A aplicação compila e os testes relacionados (especialmente `domain-errors.test.ts`) passam.
- ESLint não reporta erros de caminho ou nomenclatura para esses arquivos.
