---
id: "REFAC-STRUCT-007"
title: "Mover `productRepository` para `src/features/product/db/`"
priority: "P3"
status: "Pendente"
complexity: 1
assigned_to: "AgenteJules"
dependencies: [] # Feature `product` já existe
creation_date: "2024-08-07"
completion_date: ""
tags:
  - "refactor"
  - "estrutura"
  - "product"
  - "database"
parent_task: "AUDIT-001"
notes: |
  O `productRepository.ts` e seu teste (se existir) estão atualmente em `src/db/repositories/`.
  Devem ser movidos para a feature `product` em `src/features/product/db/product-repository.ts`.
---

**Descrição Detalhada:**

1.  **Garantir Estrutura:**
    *   Verificar se o diretório `src/features/product/db/` existe.
2.  **Identificar Arquivos:**
    *   Origem: `src/db/repositories/productRepository.ts` e `src/db/repositories/productRepository.test.ts` (se existir).
3.  **Mover e Renomear Arquivos:**
    *   Mover `productRepository.ts` para `src/features/product/db/product-repository.ts`.
    *   Mover `productRepository.test.ts` (se existir) para `src/features/product/db/product-repository.test.ts`.
4.  **Atualizar Imports:**
    *   Atualizar todos os imports para `@/features/product/db/product-repository`.
    *   Verificar `src/db/repositories/index.ts`.
5.  **Validar:**
    *   ESLint e testes da feature `product`.

**Critérios de Aceitação:**
*   Arquivos do `productRepository` movidos e renomeados corretamente.
*   Imports atualizados.
*   ESLint e testes passam.
