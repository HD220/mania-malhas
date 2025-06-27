---
id: "REFAC-01.4.4.5"
title: "Mover componentes UI `user` para `src/features/user/components/`"
priority: "P4"
status: "Pendente"
complexity: 1
assigned_to: "AgenteJules"
dependencies:
  - "REFAC-01.4.4.4"
parent_task: "REFAC-01.4"
creation_date: "2024-08-09"
completion_date: ""
tags:
  - "refactor"
  - "user"
  - "ui"
  - "components"
  - "frontend"
notes: |
  Mover componentes React específicos da feature `user` (ex: formulário de perfil)
  para `src/features/user/components/`.
---

**Descrição Detalhada:**

1.  **Identificar Componentes UI:** Localizar componentes de `user`.
2.  **Mover Arquivos:** Mover para `src/features/user/components/`. Renomear para `kebab-case.tsx`.
3.  **Atualizar Imports:** Atualizar em páginas e outros componentes.
4.  **Validar:** ESLint, visualização, testes de UI.

**Critérios de Aceitação:**
*   Componentes UI de `user` em `src/features/user/components/`.
*   Nomes de arquivo OK.
*   Imports OK.
*   ESLint OK.
*   Renderização e funcionalidade OK.
