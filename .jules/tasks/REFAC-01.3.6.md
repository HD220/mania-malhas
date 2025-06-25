---
id: "REFAC-01.3.6"
title: "Validar feature `payment` movida (ESLint, Testes)"
priority: "P4"
status: "Pendente"
complexity: 1
assigned_to: "AgenteJules"
dependencies:
  - "REFAC-01.3.5" # Depende da movimentação dos componentes UI, que foi a última movimentação de código.
creation_date: "2024-08-07"
completion_date: ""
tags:
  - "refactor"
  - "payment"
  - "validation"
  - "eslint"
  - "tests"
parent_task: "REFAC-01.3"
notes: |
  Esta é a tarefa final de validação para a refatoração da feature `payment`.
  Após todas as outras sub-tarefas de movimentação (`.1` a `.5`) serem concluídas, esta tarefa garante que a feature `payment` está funcional e sem erros de linting em seu novo local (`src/features/payment/`).
  A tarefa `REFAC-01.3.4` já validou actions e `REFAC-01.3.5` validou (após correção) o componente UI movido. Esta tarefa é uma validação mais geral da feature.
---

**Descrição Detalhada:**

1.  **Executar ESLint:** Rodar o ESLint em todo o diretório `src/features/payment/` para pegar quaisquer problemas restantes.
    ```bash
    npx eslint src/features/payment/
    ```
2.  **Executar Testes:** Rodar todos os testes relacionados à feature `payment`.
    ```bash
    npm test src/features/payment/
    # ou um comando mais específico se disponível/necessário
    ```
3.  **Correções:** Se erros de ESLint ou falhas em testes forem encontrados, corrigi-los.

**Critérios de Aceitação:**
*   ESLint passa sem erros para o diretório `src/features/payment/`.
*   Todos os testes unitários e de integração para a feature `payment` passam.
*   A funcionalidade de `payment` está íntegra e operando como esperado em seu novo local.

[end of .jules/tasks/REFAC-01.3.6.md]
