---
id: REFAC-STRUCT-015.7
title: Padronizar nomes de arquivos em `src/features/user/` para `kebab-case`
description: >
  Como parte da padronização de nomes de arquivos (REFAC-STRUCT-015), esta tarefa
  foca no diretório `src/features/user/` e seus subdiretórios. Todos os
  arquivos `.ts` e `.tsx` devem ser renomeados para `kebab-case`.
  Exemplos:
  - `components/change-password-form.tsx` (ok)
  - `components/profile-form.tsx` (ok)
  - `db/userRepository.ts` -> `db/user-repository.ts`
  - `schemas/userSchema.ts` -> `schemas/user.schema.ts`
  - `usecases/changeUserPasswordUseCase.ts` -> `usecases/change-user-password.usecase.ts`
  - `usecases/getUserProfileUseCase.ts` -> `usecases/get-user-profile.usecase.ts`
  - `usecases/updateUserProfileUseCase.ts` -> `usecases/update-user-profile.usecase.ts`
  E assim por diante. Imports devem ser atualizados.
status: Pendente
priority: P3
complexity: 1
created_date: 2024-08-08
due_date:
dependencies:
  - REFAC-STRUCT-015
parent_task: REFAC-STRUCT-015
assignee: AgenteJules
tags:
  - refactor
  - structure
  - naming-convention
  - features
  - user-feature
---

### Critérios de Aceitação:
- Todos os arquivos `.ts` e `.tsx` em `src/features/user/` e subdiretórios são `kebab-case`.
- Nomes de arquivo descritivos.
- Imports atualizados.
- Aplicação compila, funcionalidades de usuário OK.
- ESLint não reporta erros.

### Notas de Implementação:
- Muitos arquivos de componentes já podem estar em `kebab-case`. Focar no repositório, schema e use cases.
- Arquivos de teste devem seguir o padrão (ex: `get-user-profile.usecase.test.ts`).
