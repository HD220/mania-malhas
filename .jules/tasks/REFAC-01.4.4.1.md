---
id: "REFAC-01.4.4.1"
title: "Mover schemas Zod `user` para `src/features/user/types/`"
priority: "P4"
status: "Pendente"
complexity: 1
assigned_to: "AgenteJules"
dependencies:
  - "REFAC-01.4"
  - "REFAC-STRUCT-013.1" # Mover schema de tabela `user.ts` (já concluído)
parent_task: "REFAC-01.4"
creation_date: "2024-08-09"
completion_date: ""
tags:
  - "refactor"
  - "user"
  - "schemas"
  - "types"
  - "backend"
notes: |
  Mover os schemas de validação Zod (e tipos inferidos) relacionados à entidade `user`
  (ex: perfil de usuário, atualização de dados) para o diretório `src/features/user/types/`.
---

**Descrição Detalhada:**

1.  **Identificar Arquivos de Schema Zod:** Localizar schemas Zod para `user`.
2.  **Mover/Criar Arquivos:** Mover/criar `user.schema.ts` em `src/features/user/types/`.
3.  **Atualizar Imports:** Atualizar dependências.
4.  **Validar:** ESLint, testes de `user`.

**Critérios de Aceitação:**
*   Schemas Zod de `user` em `src/features/user/types/`.
*   Imports atualizados.
*   ESLint OK.
*   Testes OK.
