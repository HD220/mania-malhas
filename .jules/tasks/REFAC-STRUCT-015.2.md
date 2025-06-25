---
id: REFAC-STRUCT-015.2
title: Padronizar nomes de arquivos em `src/features/notification/` para `kebab-case`
description: >
  Como parte da padronização de nomes de arquivos (REFAC-STRUCT-015), esta tarefa
  foca no diretório `src/features/notification/` e seus subdiretórios. Todos os
  arquivos `.ts` e `.tsx` devem ser renomeados para `kebab-case`.
  Exemplos de arquivos a serem verificados (da listagem `ls`):
  - `actions/actions.test.ts` (já ok)
  - `actions/index.ts` (ok)
  - `components/NotificationsPanel.tsx` -> `components/notifications-panel.tsx`
  - `db/notificationRepository.ts` -> `db/notification-repository.ts`
  - `schemas/notificationSchema.ts` -> `schemas/notification.schema.ts` (ou `notification-schema.ts`)
  - `usecases/createNotificationUseCase.test.ts` (já ok)
  - `usecases/createNotificationUseCase.ts` -> `usecases/create-notification.usecase.ts`
  - E assim por diante para os demais usecases.
  Imports devem ser atualizados.
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
  - notification-feature
---

### Critérios de Aceitação:
- Todos os arquivos `.ts` e `.tsx` em `src/features/notification/` e subdiretórios são `kebab-case`.
- Nomes de arquivo são descritivos, preferencialmente incluindo o tipo de módulo (ex: `create-notification.usecase.ts`, `notification.schema.ts`).
- Imports atualizados em todo o projeto.
- Aplicação compila, funcionalidades de notificação OK.
- ESLint não reporta erros.

### Notas de Implementação:
- Atenção especial aos arquivos de use cases e seus testes, schemas e componentes.
- A sugestão `[feature-name].[module-type].ts` (ex: `notification.schema.ts`, `create-notification.usecase.ts`) é uma boa prática.
