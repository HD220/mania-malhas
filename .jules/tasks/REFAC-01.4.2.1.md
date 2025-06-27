---
id: "REFAC-01.4.2.1"
title: "Mover schemas Zod `partner` para `src/features/partner/types/`"
priority: "P4"
status: "Concluído"
complexity: 1
assigned_to: "AgenteJules"
dependencies:
  - "REFAC-01.4" # Depende da decisão de refatorar esta feature
  - "REFAC-STRUCT-013.3" # Mover schema de tabela `partner.ts` (já concluído)
parent_task: "REFAC-01.4"
creation_date: "2024-08-09"
completion_date: "2024-08-09"
tags:
  - "refactor"
  - "partner"
  - "schemas"
  - "types"
  - "backend"
notes: |
  Mover os schemas de validação Zod (e tipos inferidos) relacionados à entidade `partner`
  para o diretório `src/features/partner/types/`.
  Isso inclui schemas para criação, atualização e seleção de parceiros.
  Atualizar todos os imports que utilizam esses schemas.

  **Nota de Implementação (2024-08-09):**
  - Arquivo `partner.schema.ts` movido de `src/features/partner/schemas/` para `src/features/partner/types/`.
  - Imports atualizados em todos os arquivos relevantes.
  - Testes para a feature `partner` (`npm test src/features/partner/ "src/app/(main_app)/partner/"`) estão passando.
  - Persistem erros de ESLint da regra `project-structure/independent-modules` em toda a feature `partner`, similar ao observado em outras features. Estes não foram resolvidos como parte desta tarefa.
---

**Descrição Detalhada:**

1.  **Identificar Arquivos de Schema Zod:** Localizar os arquivos contendo schemas Zod para a entidade `partner` (ex: `insertPartnerSchema`, `selectPartnerSchema`, etc.). Eles podem estar em `src/lib/schemas/` ou em uma estrutura antiga.
2.  **Mover/Criar Arquivos:**
    *   Garantir que o diretório `src/features/partner/types/` exista.
    *   Mover ou criar o arquivo `partner.schema.ts` (ou similar) em `src/features/partner/types/` contendo os schemas Zod relevantes.
3.  **Atualizar Imports:** Atualizar todos os caminhos de import nos arquivos que dependem desses schemas Zod.
4.  **Validar:**
    *   Executar ESLint para verificar conformidade de caminhos e estrutura.
    *   Garantir que os testes relacionados a `partner` (especialmente os que usam validação de schema) continuem passando.

**Critérios de Aceitação:**
*   Todos os schemas Zod de `partner` estão em `src/features/partner/types/`.
*   Imports atualizados em todo o projeto.
*   ESLint sem erros relacionados à mudança.
*   Testes relevantes passando.
