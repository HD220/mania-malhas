---
id: REFAC-STRUCT-020
title: Revisar e renomear arquivos em `src/components/` para `kebab-case`
description: >
  O `docs/project-structure-guide.md` especifica o uso de `kebab-case` para nomes
  de arquivos. Esta tarefa foca em auditar e renomear arquivos diretamente sob
  `src/components/` e seus subdiretórios (como `forms/`, `layout/`, `navbar/`,
  `navigation/`, `providers/`), excluindo `src/components/ui/` (que geralmente
  segue as convenções da biblioteca de componentes, como ShadCN) e arquivos
  já cobertos por outras tarefas de refatoração (ex: `login-form.tsx`).
  Exemplos de arquivos a serem verificados: `aside-bar.tsx`, `header.tsx`,
  `main-app-header.tsx`. Se algum não estiver em `kebab-case`, deve ser renomeado
  e seus imports atualizados.
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
  - naming-convention
  - components
---

### Critérios de Aceitação:
- Arquivos em `src/components/` e seus subdiretórios (exceto `ui/` e casos já tratados) são verificados quanto à convenção `kebab-case`.
- Qualquer arquivo que não esteja em `kebab-case` é renomeado (ex: `mainAppHeader.tsx` para `main-app-header.tsx`).
- Todos os imports no código que referenciam os nomes antigos são atualizados.
- A aplicação compila e os componentes são renderizados corretamente.
- ESLint não reporta erros de nomenclatura ou caminho para esses arquivos.
