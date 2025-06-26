---
id: "REFAC-STRUCT-005"
title: "Mover `notificationRepository` para `src/features/notification/db/`"
priority: "P3"
status: "Concluído"
complexity: 1
assigned_to: "AgenteJules"
dependencies: [] # Feature `notification` já existe
creation_date: "2024-08-07"
completion_date: "2024-08-09"
tags:
  - "refactor"
  - "estrutura"
  - "notification"
  - "database"
parent_task: "AUDIT-001"
notes: |
  O `notificationRepository.ts` e seu teste `notificationRepository.test.ts` estão atualmente em `src/db/repositories/`.
  Devem ser movidos para a feature `notification` em `src/features/notification/db/notification-repository.ts`
  e `src/features/notification/db/notification-repository.test.ts`.
---

**Descrição Detalhada:**

1.  **Criar Estrutura (se necessário):**
    *   Garantir que o diretório `src/features/notification/db/` exista (a feature `notification` já existe).
2.  **Identificar Arquivos:**
    *   Origem: `src/db/repositories/notificationRepository.ts` e `src/db/repositories/notificationRepository.test.ts`.
3.  **Mover e Renomear Arquivos:**
    *   Mover `src/db/repositories/notificationRepository.ts` para `src/features/notification/db/notification-repository.ts`.
    *   Mover `src/db/repositories/notificationRepository.test.ts` para `src/features/notification/db/notification-repository.test.ts`.
4.  **Atualizar Imports:**
    *   Localizar e atualizar todos os imports para apontar para `@/features/notification/db/notification-repository`.
    *   Verificar o arquivo `src/db/repositories/index.ts` e remover/atualizar a exportação.
5.  **Validar:**
    *   Executar ESLint.
    *   Executar `notification-repository.test.ts` e outros testes da feature `notification`.

**Critérios de Aceitação:**
*   Arquivos `notification-repository.ts` e `notification-repository.test.ts` estão em `src/features/notification/db/`.
*   Imports atualizados.
*   ESLint e testes relevantes passam.
