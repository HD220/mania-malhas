---
id: "REFAC-01.4.4.4"
title: "Mover Server Actions `user` para `src/features/user/actions/`"
priority: "P4"
status: "Pendente"
complexity: 1
assigned_to: "AgenteJules"
dependencies:
  - "REFAC-01.4.4.2"
parent_task: "REFAC-01.4"
creation_date: "2024-08-09"
completion_date: ""
tags:
  - "refactor"
  - "user"
  - "server-actions"
  - "backend"
notes: |
  Mover Server Actions da feature `user` (ex: updateProfile)
  para `src/features/user/actions/`.
---

**Descrição Detalhada:**

1.  **Identificar Server Actions:** Localizar actions de `user`.
2.  **Mover Arquivos:** Mover para `src/features/user/actions/`, nomear como `user.actions.ts` ou similar.
3.  **Atualizar Usages:** Atualizar chamadas nas UIs.
4.  **Validar:** ESLint, testes funcionais.

**Critérios de Aceitação:**
*   Server Actions de `user` em `src/features/user/actions/`.
*   Nomes de arquivo OK.
*   Usages OK.
*   ESLint OK.
*   Funcionalidade OK.
