---
id: "REFAC-01.4.2.2"
title: "Mover casos de uso (usecases) `partner` para `src/features/partner/usecases/`"
priority: "P4"
status: "Pendente"
complexity: 1
assigned_to: "AgenteJules"
dependencies:
  - "REFAC-01.4.2.1" # Depende dos schemas Zod estarem no lugar certo
parent_task: "REFAC-01.4"
creation_date: "2024-08-09"
completion_date: ""
tags:
  - "refactor"
  - "partner"
  - "usecases"
  - "backend"
notes: |
  Mover toda a lógica de casos de uso (lógica de negócio) relacionada à feature `partner`
  para o diretório `src/features/partner/usecases/`.
  Atualizar todos os imports que utilizam esses casos de uso.
---

**Descrição Detalhada:**

1.  **Identificar Arquivos de Casos de Uso:** Localizar todos os arquivos de casos de uso da feature `partner`.
2.  **Mover Arquivos:**
    *   Garantir que o diretório `src/features/partner/usecases/` exista.
    *   Mover os arquivos identificados para este diretório. Renomear para `kebab-case` se necessário (ex: `create-partner.usecase.ts`).
3.  **Atualizar Imports:** Atualizar os caminhos de import nos arquivos que consomem esses casos de uso (ex: Server Actions, outros use cases).
4.  **Validar:**
    *   Executar ESLint.
    *   Executar testes unitários/integração da feature `partner`.

**Critérios de Aceitação:**
*   Todos os casos de uso de `partner` estão em `src/features/partner/usecases/`.
*   Nomes de arquivo padronizados para `kebab-case`.
*   Imports atualizados.
*   ESLint sem erros relacionados.
*   Testes de `partner` passando.
