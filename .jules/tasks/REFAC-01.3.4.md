---
id: "REFAC-01.3.4"
title: "Mover actions `payment` para `src/features/payment/actions/`"
priority: "P4"
status: "Pendente"
complexity: 1
assigned_to: "AgenteJules"
dependencies:
  - "REFAC-01.3.3"
creation_date: "2024-08-06"
completion_date: null
tags:
  - "refactor"
  - "payment"
  - "backend"
parent_task: "REFAC-01.3"
notes: |
  Parte da refatoração da feature `payment` (REFAC-01.3).
  Envolve identificar os arquivos de server actions relacionados a pagamentos,
  movê-los para a nova estrutura `src/features/payment/actions/`,
  e atualizar todos os imports relevantes no projeto.
---

**Descrição Detalhada:**

1.  Identificar todos os arquivos de Server Actions relacionados à funcionalidade de "payment". Estes podem estar localizados em diretórios como `src/app/(admin)/payment/actions.ts`, `src/app/(main_app)/payment/actions.ts` ou similares.
2.  Criar o diretório `src/features/payment/actions/` se ainda não existir.
3.  Mover os arquivos de actions identificados para `src/features/payment/actions/`.
4.  Se houver múltiplos arquivos de actions ou se for uma boa prática, criar/atualizar um `src/features/payment/actions/index.ts` para reexportar as actions.
5.  Realizar uma busca global no projeto por todos os locais que importavam estas actions de seus caminhos antigos.
6.  Atualizar todos os caminhos de importação para apontar para a nova localização em `src/features/payment/actions/`.
7.  Verificar se há testes unitários ou de integração específicos para estas actions e garantir que continuam passando após a movimentação e atualização dos imports.
8.  Rodar ESLint para garantir a conformidade do código.
