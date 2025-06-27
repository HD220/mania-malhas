---
id: "REFAC-01.3.3"
title: "Mover lógica de banco de dados (db/repositories) `payment` para `src/features/payment/db/`"
priority: "P4"
status: "Concluído"
complexity: 1
assigned_to: "AgenteJules"
dependencies:
  - "REFAC-01.3.2"
creation_date: "2024-08-07"
completion_date: "2024-08-09"
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

  **Nota de Implementação (2024-08-09):**
  - Os arquivos `payment-repository.ts` e `schema.ts` (lógica de DB para payment) já se encontravam no diretório de destino `src/features/payment/db/`, provavelmente movidos por tarefas anteriores (REFAC-STRUCT-006, REFAC-STRUCT-013.4).
  - Nenhuma movimentação de arquivo ou atualização de import foi necessária para esta tarefa específica.
  - Testes da feature `payment` continuam passando.
  - Os erros de ESLint (`project-structure/independent-modules`) em toda a feature `payment`, conforme observado na tarefa REFAC-01.3.2, persistem e não são específicos desta sub-tarefa.
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
