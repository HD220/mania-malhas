---
id: "REFAC-01.4.4.2"
title: "Mover casos de uso (usecases) `user` para `src/features/user/usecases/`"
priority: "P4"
status: "Pendente"
complexity: 1
assigned_to: "AgenteJules"
dependencies:
  - "REFAC-01.4.4.1"
parent_task: "REFAC-01.4"
creation_date: "2024-08-09"
completion_date: ""
tags:
  - "refactor"
  - "user"
  - "usecases"
  - "backend"
notes: |
  Mover toda a lógica de casos de uso relacionada à feature `user`
  para o diretório `src/features/user/usecases/`.
---

**Descrição Detalhada:**

1.  **Identificar Casos de Uso:** Localizar casos de uso de `user`.
2.  **Mover Arquivos:** Mover para `src/features/user/usecases/`. Renomear para `kebab-case`.
3.  **Atualizar Imports:** Atualizar dependências.
4.  **Validar:** ESLint, testes de `user`.

**Critérios de Aceitação:**
*   Casos de uso de `user` em `src/features/user/usecases/`.
*   Nomes de arquivo OK.
*   Imports OK.
*   ESLint OK.
*   Testes OK.
