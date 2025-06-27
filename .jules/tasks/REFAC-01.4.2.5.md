---
id: "REFAC-01.4.2.5"
title: "Mover componentes UI `partner` para `src/features/partner/components/`"
priority: "P4"
status: "Pendente"
complexity: 1
assigned_to: "AgenteJules"
dependencies:
  - "REFAC-01.4.2.4" # Actions podem ser usadas por componentes
parent_task: "REFAC-01.4"
creation_date: "2024-08-09"
completion_date: ""
tags:
  - "refactor"
  - "partner"
  - "ui"
  - "components"
  - "frontend"
notes: |
  Mover todos os componentes React específicos da feature `partner`
  (ex: formulários, tabelas, itens de lista para parceiros)
  de seus locais atuais (possivelmente em `src/app/(main_app)/partner/components/` ou `src/components/partner/`)
  para o diretório centralizado da feature `src/features/partner/components/`.
---

**Descrição Detalhada:**

1.  **Identificar Componentes UI:** Localizar todos os componentes React específicos da feature `partner`.
2.  **Mover Arquivos:**
    *   Garantir que o diretório `src/features/partner/components/` exista.
    *   Mover os arquivos `.tsx` identificados para este diretório. Renomear para `kebab-case.tsx` se necessário.
3.  **Atualizar Imports:** Atualizar os caminhos de import nas páginas ou outros componentes que usam esses componentes de `partner`.
4.  **Validar:**
    *   Executar ESLint.
    *   Verificar visualmente as páginas que usam esses componentes para garantir que renderizam corretamente.
    *   Executar testes de UI relacionados, se existirem.

**Critérios de Aceitação:**
*   Todos os componentes UI específicos de `partner` estão em `src/features/partner/components/`.
*   Nomes de arquivo padronizados.
*   Imports atualizados.
*   ESLint sem erros relacionados.
*   Componentes renderizam e funcionam como esperado.
