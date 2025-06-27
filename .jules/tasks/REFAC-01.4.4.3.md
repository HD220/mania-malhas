---
id: "REFAC-01.4.4.3"
title: "Mover lógica de banco de dados (db/repositories) `user` para `src/features/user/db/`"
priority: "P4"
status: "Pendente"
complexity: 1
assigned_to: "AgenteJules"
dependencies:
  - "REFAC-01.4.4.1" # Schema de tabela já em features/user/db/schema.ts (via REFAC-STRUCT-013.1)
parent_task: "REFAC-01.4"
creation_date: "2024-08-09"
completion_date: ""
tags:
  - "refactor"
  - "user"
  - "database"
  - "repositories"
  - "backend"
notes: |
  Mover o `user-repository.ts` para `src/features/user/db/`.
  Validar que `REFAC-STRUCT-004` cobriu isso.
---

**Descrição Detalhada:**

1.  **Identificar Repositório:** Localizar `user-repository.ts`.
    *   Tarefa `REFAC-STRUCT-004` (Mover `userRepository`) já concluída. Validar.
2.  **Verificar Localização:** Confirmar em `src/features/user/db/`.
3.  **Atualizar Imports:** Verificar e atualizar.
4.  **Validar:** ESLint, testes DB de `user`.

**Critérios de Aceitação:**
*   Lógica de repositório de `user` em `src/features/user/db/`.
*   Imports OK.
*   ESLint OK.
*   Testes DB OK.
