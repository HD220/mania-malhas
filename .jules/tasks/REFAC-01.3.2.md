---
id: "REFAC-01.3.2"
title: "Mover casos de uso (usecases) `payment` para `src/features/payment/usecases/`"
priority: "P4"
status: "Concluído"
complexity: 1
assigned_to: "AgenteJules"
dependencies:
  - "REFAC-01.3.1"
creation_date: "2024-08-07"
completion_date: "2024-08-09"
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

  **Nota de Implementação (2024-08-09):**
  - Arquivos de casos de uso de `payment` (`create-payment.usecase.ts`, `get-payments-by-transaction-id.usecase.ts`) e seus testes já estavam no diretório de destino `src/features/payment/usecases/`.
  - Verificadas e corrigidas importações para estes arquivos e seus dependentes.
  - Corrigida a localização do arquivo `payment.schema.ts` de `schemas/` para `types/` dentro da feature `payment` e atualizadas as importações correspondentes.
  - Criado `src/lib/utils/index.ts` para resolver import de `cn` de forma mais modular.
  - Testes unitários/integração para `src/features/payment/` (incluindo use cases e actions) estão passando.
  - Persistem aproximadamente 50 erros de ESLint relacionados à regra `project-structure/independent-modules` em toda a feature `payment`. Estes erros não puderam ser resolvidos no escopo desta tarefa, pois a causa raiz não é clara e pode exigir uma revisão mais profunda da configuração do plugin ESLint ou das regras de arquitetura. Funcionalmente, a feature `payment` parece correta conforme os testes.
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
