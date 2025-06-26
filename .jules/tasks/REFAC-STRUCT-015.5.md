---
id: REFAC-STRUCT-015.5
title: Padronizar nomes de arquivos em `src/features/product/` para `kebab-case`
description: >
  Como parte da padronização de nomes de arquivos (REFAC-STRUCT-015), esta tarefa
  foca no diretório `src/features/product/` e seus subdiretórios. Todos os
  arquivos `.ts` e `.tsx` devem ser renomeados para `kebab-case`.
  Exemplos:
  - `actions/editProductActions.tsx` -> `actions/edit-product.action.tsx` (ou `edit-product.actions.tsx`)
  - `actions/getUrlUploadAction.ts` -> `actions/get-url-upload.action.ts`
  - `components/ProductCard.tsx` -> `components/product-card.component.tsx`
  - `components/ProductForm.tsx` -> `components/product-form.component.tsx`
  - `components/useProductForm.tsx` -> `components/use-product-form.hook.tsx` (ou `use-product-form.ts`)
  - `db/productRepository.ts` -> `db/product-repository.ts`
  - `schemas/productImageSchema.ts` -> `schemas/product-image.schema.ts`
  - `schemas/productSchema.ts` -> `schemas/product.schema.ts`
  - `usecases/...` (ex: `alterProductUseCase.ts` -> `alter-product.usecase.ts`)
  E assim por diante. Imports devem ser atualizados.
status: Concluído
priority: P3
complexity: 1
created_date: 2024-08-08
completion_date: "2024-08-09"
dependencies:
  - REFAC-STRUCT-015
parent_task: REFAC-STRUCT-015
assignee: AgenteJules
tags:
  - refactor
  - structure
  - naming-convention
  - features
  - product-feature
---

### Critérios de Aceitação:
- Todos os arquivos `.ts` e `.tsx` em `src/features/product/` e subdiretórios (ignorando `.gitkeep`) são `kebab-case`.
- Nomes de arquivo descritivos, incluindo tipo de módulo (action, component, hook, schema, usecase).
- Imports atualizados.
- Aplicação compila, funcionalidades de produto OK.
- ESLint não reporta erros.

### Notas de Implementação:
- Esta feature tem vários arquivos com `PascalCase` que precisarão de atenção (especialmente em `actions` e `components`).
- Hooks customizados como `useProductForm.tsx` devem ser `use-product-form.hook.ts` ou similar.
