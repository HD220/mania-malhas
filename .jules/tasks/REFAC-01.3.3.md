---
id: "REFAC-01.3.3"
title: "Mover lógica de banco de dados (db/repositories) `payment` para `src/features/payment/db/`"
priority: "P4"
status: "Pendente"
complexity: 1
assigned_to: "AgenteJules"
dependencies:
  - "REFAC-01.3.2"
creation_date: "2024-08-07"
completion_date: ""
tags:
  - "refactor"
  - "payment"
  - "database"
  - "repositories"
  - "backend"
parent_task: "REFAC-01.3"
notes: |
  Esta tarefa consiste em mover todos os arquivos relacionados à persistência de dados (repositórios, interações diretas com o DB) da feature `payment` para o diretório `src/features/payment/db/`.
  Será necessário atualizar todos os imports que utilizam esses componentes.
  Ao final, rodar ESLint e testes para garantir a integridade.
---

**Descrição Detalhada:**

1.  **Identificar Arquivos:** Localizar todos os arquivos de repositórios e lógica de banco de dados da feature `payment`.
2.  **Mover Arquivos:** Mover os arquivos identificados para `src/features/payment/db/`.
3.  **Atualizar Imports:** Atualizar os caminhos de import nos arquivos que dependem dessa lógica de persistência.
4.  **Validar:**
    *   Executar ESLint.
    *   Executar testes unitários/integração da feature `payment`, especialmente os que interagem com o banco de dados.

**Critérios de Aceitação:**
*   Toda a lógica de banco de dados de `payment` está em `src/features/payment/db/`.
*   Imports atualizados.
*   ESLint sem erros.
*   Testes de `payment` (com foco em DB) passando.
