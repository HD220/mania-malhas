---
id: REFAC-STRUCT-015.1
title: Padronizar nomes de arquivos em `src/features/dashboard/` para `kebab-case`
description: >
  Como parte da padronização de nomes de arquivos em todas as features (REFAC-STRUCT-015),
  esta tarefa foca especificamente no diretório `src/features/dashboard/` e seus
  subdiretórios (`actions/`, `components/`, etc.). Todos os arquivos `.ts` e `.tsx`
  dentro desta feature devem ser renomeados para `kebab-case` conforme o
  `docs/project-structure-guide.md`. Por exemplo, `myFile.ts` se torna `my-file.ts`.
  Os imports devem ser atualizados em todo o projeto.
status: Pendente
priority: P3
complexity: 1
created_date: 2024-08-08
due_date:
dependencies:
  - REFAC-STRUCT-015 # Tarefa mãe
parent_task: REFAC-STRUCT-015
assignee: AgenteJules
tags:
  - refactor
  - structure
  - naming-convention
  - features
  - dashboard-feature
---

### Critérios de Aceitação:
- Todos os arquivos `.ts` e `.tsx` dentro de `src/features/dashboard/` e seus subdiretórios (ex: `actions/`, `components/`) são renomeados para `kebab-case`.
    - Exceção: Arquivos como `index.ts` podem ser mantidos se servirem apenas para reexportar.
- Nomes de arquivo descritivos são mantidos/aprimorados (ex: `dashboard-overview.component.tsx`).
- Todos os imports no código que referenciam os nomes antigos dentro desta feature, ou que importam módulos desta feature, são atualizados.
- A aplicação compila e a funcionalidade do dashboard continua funcionando como esperado.
- ESLint (especialmente regras como `import/no-unresolved` ou `unicorn/filename-case` se ativa) não reporta erros relacionados.

### Notas de Implementação:
- Realizar uma busca global por cada nome de arquivo antigo para garantir que todos os imports sejam atualizados.
- Testar a funcionalidade do dashboard após a refatoração.
- Exemplo de arquivo já em `kebab-case` (se houver) pode servir de guia. A listagem `ls` mostrou `actions.test.ts` em `src/features/dashboard/actions/` que já está em `kebab-case`. `index.ts` também.
- A listagem `ls` não mostrou muitos arquivos em `dashboard`, então esta pode ser rápida. Verificar `actions/index.ts` e `actions/actions.test.ts`. Se houver outros arquivos, eles são o foco.
