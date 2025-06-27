---
id: "REFAC-01.4.2.3"
title: "Mover lógica de banco de dados (db/repositories) `partner` para `src/features/partner/db/`"
priority: "P4"
status: "Pendente"
complexity: 1
assigned_to: "AgenteJules"
dependencies:
  - "REFAC-01.4.2.1" # Schemas de tabela já devem estar em features/partner/db/schema.ts
parent_task: "REFAC-01.4"
creation_date: "2024-08-09"
completion_date: ""
tags:
  - "refactor"
  - "partner"
  - "database"
  - "repositories"
  - "backend"
notes: |
  Mover todos os arquivos relacionados à persistência de dados (repositórios Drizzle)
  da feature `partner` para o diretório `src/features/partner/db/`.
  O schema da tabela (`partnerTable`) já foi movido por `REFAC-STRUCT-013.3`.
  Esta tarefa foca no `partner-repository.ts`.
  Atualizar todos os imports que utilizam esses componentes.
---

**Descrição Detalhada:**

1.  **Identificar Arquivos de Repositório:** Localizar o arquivo `partner-repository.ts` (ou similar).
    *   A tarefa `REFAC-STRUCT-008` (Mover `partnerRepository` para `src/features/partner/db/`) já foi concluída. Esta sub-tarefa serve para validar essa movimentação e garantir consistência com o processo de refatoração da feature.
2.  **Verificar Localização:** Confirmar que `partner-repository.ts` está em `src/features/partner/db/`.
3.  **Atualizar Imports (se necessário):** Verificar e atualizar os caminhos de import nos arquivos que dependem do `partnerRepository` (ex: casos de uso de `partner`).
4.  **Validar:**
    *   Executar ESLint.
    *   Executar testes unitários/integração da feature `partner`, especialmente os que interagem com o banco de dados.

**Critérios de Aceitação:**
*   Toda a lógica de repositório de `partner` está em `src/features/partner/db/`.
*   Imports para `partnerRepository` estão corretos.
*   ESLint sem erros relacionados.
*   Testes de `partner` (com foco em DB) passando.
