---
id: "REFAC-01.4.3.1"
title: "Mover schemas Zod `transaction` para `src/features/transaction/types/`"
priority: "P4"
status: "Pendente"
complexity: 1
assigned_to: "AgenteJules"
dependencies:
  - "REFAC-01.4"
  - "REFAC-STRUCT-013.5" # Mover schema de tabela `transaction.ts` (já concluído)
parent_task: "REFAC-01.4"
creation_date: "2024-08-09"
completion_date: ""
tags:
  - "refactor"
  - "transaction"
  - "schemas"
  - "types"
  - "backend"
notes: |
  Mover os schemas de validação Zod (e tipos inferidos) relacionados à entidade `transaction`
  para o diretório `src/features/transaction/types/`.
---

**Descrição Detalhada:**

1.  **Identificar Arquivos de Schema Zod:** Localizar schemas Zod para `transaction`.
2.  **Mover/Criar Arquivos:** Mover/criar `transaction.schema.ts` em `src/features/transaction/types/`.
3.  **Atualizar Imports:** Atualizar dependências.
4.  **Validar:** ESLint, testes de `transaction`.

**Critérios de Aceitação:**
*   Schemas Zod de `transaction` em `src/features/transaction/types/`.
*   Imports atualizados.
*   ESLint OK.
*   Testes OK.
