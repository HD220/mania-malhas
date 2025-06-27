---
id: "REFAC-01.3.2"
title: "Mover casos de uso (usecases) `payment` para `src/features/payment/usecases/`"
priority: "P4"
status: "Em Andamento"
complexity: 1
assigned_to: "AgenteJules"
dependencies:
  - "REFAC-01.3.1"
creation_date: "2024-08-07"
completion_date: ""
tags:
  - "refactor"
  - "payment"
  - "usecases"
  - "backend"
parent_task: "REFAC-01.3"
notes: |
  Esta tarefa consiste em mover todos os arquivos de casos de uso (lógica de negócio) relacionados à feature `payment` para o diretório `src/features/payment/usecases/`.
  Será necessário atualizar todos os imports que utilizam esses casos de uso.
  Ao final, rodar ESLint e testes para garantir a integridade.
---

**Descrição Detalhada:**

1.  **Identificar Arquivos:** Localizar todos os arquivos de casos de uso da feature `payment`.
2.  **Mover Arquivos:** Mover os arquivos identificados para `src/features/payment/usecases/`.
3.  **Atualizar Imports:** Atualizar os caminhos de import nos arquivos que consomem esses casos de uso.
4.  **Validar:**
    *   Executar ESLint.
    *   Executar testes unitários/integração da feature `payment`.

**Critérios de Aceitação:**
*   Todos os casos de uso de `payment` estão em `src/features/payment/usecases/`.
*   Imports atualizados.
*   ESLint sem erros.
*   Testes de `payment` passando.
