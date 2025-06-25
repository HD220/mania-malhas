---
id: "REFAC-01.3.4"
title: "Mover actions `payment` para `src/features/payment/actions/`"
priority: "P4"
status: "Concluído"
complexity: 1
assigned_to: "AgenteJules"
dependencies:
  - "REFAC-01.3.3"
creation_date: "2024-08-06"
completion_date: "2024-08-06"
tags:
  - "refactor"
  - "payment"
  - "backend"
parent_task: "REFAC-01.3"
notes: |
  Verificado que as actions da feature `payment` já estavam localizadas em `src/features/payment/actions/`.
  Os imports relevantes no projeto também já apontavam para o local correto.
  ESLint e testes para a feature `payment` passaram com sucesso.
  Nenhuma movimentação de arquivo ou atualização de import foi necessária nesta etapa.
---

**Descrição Detalhada:**

A tarefa consistia em mover as actions da feature `payment` para `src/features/payment/actions/` e atualizar os imports.

**Resultado:**
Após inspeção, verificou-se que os arquivos de actions (`index.ts`, `actions.test.ts`) já se encontravam no diretório de destino `src/features/payment/actions/`.
Uma verificação dos imports utilizando `grep` confirmou que os componentes que consomem estas actions já utilizavam o caminho correto (`@/features/payment/actions`).
ESLint e todos os testes para a feature `payment` (`npm test src/features/payment/`) foram executados e passaram com sucesso.
Portanto, a tarefa foi concluída por verificação e validação, sem necessidade de modificação de código.
