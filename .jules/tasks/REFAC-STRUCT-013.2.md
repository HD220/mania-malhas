---
id: REFAC-STRUCT-013.2
title: Mover schemas `product.ts` e `productImage.ts` para `src/features/product/db/schema.ts`
description: >
  Como parte do desmembramento dos schemas de banco de dados centralizados
  (REFAC-STRUCT-013), esta tarefa foca em mover as definições das tabelas
  de produto e imagens de produto, atualmente em `src/lib/db-config/postgres/schema/product.ts`
  e `src/lib/db-config/postgres/schema/productImage.ts` (após REFAC-STRUCT-012),
  para um único arquivo `src/features/product/db/schema.ts`.
  Isso alinhará a estrutura do schema com a feature `product`.
status: Concluído
priority: P3
complexity: 1
created_date: 2024-08-08
completion_date: "2024-08-09"
dependencies:
  - REFAC-STRUCT-013 # Tarefa mãe
  - REFAC-STRUCT-012 # Garante que o caminho base `src/lib/db-config/...` exista
parent_task: REFAC-STRUCT-013
assignee: AgenteJules
tags:
  - refactor
  - structure
  - database
  - schema
  - product-feature
---

### Critérios de Aceitação:
- O conteúdo dos arquivos `.../schema/product.ts` e `.../schema/productImage.ts` é consolidado e movido para `src/features/product/db/schema.ts`.
- Os arquivos originais (`.../schema/product.ts`, `.../schema/productImage.ts`) são removidos do local centralizado.
- Todos os imports que referenciam os schemas de produto e imagem de produto são atualizados.
- Os repositórios e lógica de banco de dados dentro da feature `product` utilizam este schema local.
- A aplicação compila.
- ESLint não reporta erros.
- A funcionalidade de migração do Drizzle (após REFAC-STRUCT-013.7) continua funcionando.

### Notas de Implementação:
- Consolidar os dois arquivos em um único `schema.ts` dentro da feature `product`.
- Atualizar imports e verificar a agregação de schemas em `REFAC-STRUCT-013.7`.
