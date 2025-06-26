---
id: "REFAC-STRUCT-008"
title: "Mover `partnerRepository` para `src/features/partner/db/`"
priority: "P3"
status: "Concluído"
complexity: 1
assigned_to: "AgenteJules"
dependencies: [] # Feature `partner` já existe
creation_date: "2024-08-07"
completion_date: "2024-08-09"
tags:
  - "refactor"
  - "estrutura"
  - "partner"
  - "database"
parent_task: "AUDIT-001"
notes: |
  O `partnerRepository.ts` e seu teste (se existir) estão atualmente em `src/db/repositories/`.
  Devem ser movidos para a feature `partner` em `src/features/partner/db/partner-repository.ts`.
---

**Descrição Detalhada:**

1.  **Garantir Estrutura:**
    *   Verificar se o diretório `src/features/partner/db/` existe.
2.  **Identificar Arquivos:**
    *   Origem: `src/db/repositories/partnerRepository.ts` e `src/db/repositories/partnerRepository.test.ts` (se existir).
3.  **Mover e Renomear Arquivos:**
    *   Mover `partnerRepository.ts` para `src/features/partner/db/partner-repository.ts`.
    *   Mover `partnerRepository.test.ts` (se existir) para `src/features/partner/db/partner-repository.test.ts`.
4.  **Atualizar Imports:**
    *   Atualizar todos os imports para `@/features/partner/db/partner-repository`.
    *   Verificar `src/db/repositories/index.ts`.
5.  **Validar:**
    *   ESLint e testes da feature `partner`.

**Critérios de Aceitação:**
*   Arquivos do `partnerRepository` movidos e renomeados corretamente.
*   Imports atualizados.
*   ESLint e testes passam.
