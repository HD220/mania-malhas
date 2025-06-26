---
id: REFAC-STRUCT-015.3
title: Padronizar nomes de arquivos em `src/features/partner/` para `kebab-case`
description: >
  Como parte da padronização de nomes de arquivos (REFAC-STRUCT-015), esta tarefa
  foca no diretório `src/features/partner/` e seus subdiretórios. Todos os
  arquivos `.ts` e `.tsx` devem ser renomeados para `kebab-case`.
  Exemplos de arquivos a serem verificados:
  - `actions/createPartnerActions.test.ts` (já ok)
  - `actions/editPartnerActions.test.ts` (já ok)
  - `components/partner-form/...` (parece ok, verificar arquivos internos)
  - `db/partnerRepository.ts` -> `db/partner-repository.ts`
  - `schemas/partnerSchema.ts` -> `schemas/partner.schema.ts`
  - `usecases/alterPartnerUseCase.ts` -> `usecases/alter-partner.usecase.ts`
  E assim por diante. Imports devem ser atualizados.
status: Concluído
priority: P3
complexity: 1
created_date: 2024-08-08
completion_date: "2024-08-09"
dependencies:
  - REFAC-STRUCT-015
parent_task: REFAC-STRUCT-015
assignee: AgenteJules
tags:
  - refactor
  - structure
  - naming-convention
  - features
  - partner-feature
---

### Critérios de Aceitação:
- Todos os arquivos `.ts` e `.tsx` em `src/features/partner/` e subdiretórios são `kebab-case`.
- Nomes de arquivo descritivos (ex: `alter-partner.usecase.ts`, `partner.schema.ts`).
- Imports atualizados.
- Aplicação compila, funcionalidades de parceiro OK.
- ESLint não reporta erros.

### Notas de Implementação:
- Verificar todos os arquivos em `actions`, `components`, `db`, `schemas`, `usecases`.
- O diretório `partner-form` já está em kebab-case, verificar os arquivos dentro dele.
