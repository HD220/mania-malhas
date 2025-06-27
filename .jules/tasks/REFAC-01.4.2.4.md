---
id: "REFAC-01.4.2.4"
title: "Mover Server Actions `partner` para `src/features/partner/actions/`"
priority: "P4"
status: "Pendente"
complexity: 1
assigned_to: "AgenteJules"
dependencies:
  - "REFAC-01.4.2.2" # Depende dos use cases
parent_task: "REFAC-01.4"
creation_date: "2024-08-09"
completion_date: ""
tags:
  - "refactor"
  - "partner"
  - "server-actions"
  - "backend"
notes: |
  Mover toda a lógica de Server Actions relacionada à feature `partner`
  de seus locais atuais (possivelmente em `src/app/(main_app)/partner/actions/` ou similar)
  para o diretório centralizado da feature `src/features/partner/actions/`.
  Nomear os arquivos de forma descritiva, ex: `partner.actions.ts`.
---

**Descrição Detalhada:**

1.  **Identificar Arquivos de Server Actions:** Localizar todos os Server Actions da feature `partner`.
2.  **Mover Arquivos:**
    *   Garantir que o diretório `src/features/partner/actions/` exista.
    *   Mover os arquivos identificados para este diretório. Consolidar em um ou mais arquivos `*.actions.ts` se apropriado (ex: `partner.actions.ts`).
3.  **Atualizar Imports/Usages:** Atualizar os caminhos de import nos componentes de UI ou outras partes da aplicação que invocam essas actions.
4.  **Validar:**
    *   Executar ESLint.
    *   Testar a funcionalidade das actions (idealmente com testes de integração ou testes manuais focados).

**Critérios de Aceitação:**
*   Todas as Server Actions de `partner` estão em `src/features/partner/actions/`.
*   Nomes de arquivo padronizados.
*   Usages atualizados.
*   ESLint sem erros relacionados.
*   Funcionalidade das actions preservada.
