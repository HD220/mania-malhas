---
id: "REFAC-STRUCT-010"
title: "Mover utilitários globais de `src/utils/` para `src/lib/utils/`"
priority: "P3"
status: "Pendente"
complexity: 1
assigned_to: "AgenteJules"
dependencies: []
creation_date: "2024-08-07"
completion_date: ""
tags:
  - "refactor"
  - "estrutura"
  - "lib"
  - "utils"
parent_task: "AUDIT-001"
notes: |
  Os arquivos `utils.ts`, `utils.test.ts` e `uuidUtils.ts` estão em `src/utils/`.
  Devem ser movidos para `src/lib/utils/` e renomeados para kebab-case.
  Ex: `uuidUtils.ts` -> `src/lib/utils/uuid.util.ts`
      `utils.ts` -> `src/lib/utils/general.utils.ts` (ou nome mais específico se o conteúdo permitir)
      `utils.test.ts` -> `src/lib/utils/general.utils.test.ts`
---

**Descrição Detalhada:**

1.  **Garantir Estrutura:**
    *   Criar `src/lib/utils/` se não existir.
2.  **Identificar Arquivos:**
    *   Origem: `src/utils/utils.ts`, `src/utils/utils.test.ts`, `src/utils/uuidUtils.ts`.
3.  **Mover e Renomear Arquivos:**
    *   Mover `src/utils/uuidUtils.ts` para `src/lib/utils/uuid.util.ts`.
    *   Analisar `utils.ts`: Se contiver múltiplos utilitários não relacionados, considerar dividi-los em arquivos mais específicos dentro de `src/lib/utils/`. Por ora, mover para `src/lib/utils/general.utils.ts`.
    *   Mover `utils.test.ts` para `src/lib/utils/general.utils.test.ts`.
4.  **Atualizar Imports:**
    *   Atualizar todos os imports para os novos caminhos (ex: `@/lib/utils/uuid.util`, `@/lib/utils/general.utils`).
5.  **Validar:**
    *   ESLint e testes relevantes.

**Critérios de Aceitação:**
*   Arquivos de utilitários movidos e renomeados para `src/lib/utils/` com nomes em kebab-case.
*   Imports atualizados.
*   ESLint e testes passam.
