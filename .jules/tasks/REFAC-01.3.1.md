---
id: "REFAC-01.3.1"
title: "Mover schemas Zod `payment` para `src/features/payment/schemas/`"
priority: "P4"
status: "Pendente"
complexity: 1
assigned_to: "AgenteJules" # Ou [A DEFINIR] se preferir
dependencies:
  - "REFAC-01.2" # Conforme REFAC-01.3.md, esta é a dependência lógica inicial da cadeia.
creation_date: "2024-08-07" # Data atual
completion_date: ""
tags:
  - "refactor"
  - "payment"
  - "schemas"
  - "backend"
parent_task: "REFAC-01.3"
notes: |
  Esta tarefa consiste em mover todos os arquivos de schema Zod relacionados à feature `payment` para o diretório `src/features/payment/schemas/`.
  Será necessário atualizar todos os imports que utilizam esses schemas.
  Ao final, rodar ESLint e testes (se aplicável aos schemas) para garantir a integridade.
---

**Descrição Detalhada:**

1.  **Identificar Arquivos:** Localizar todos os arquivos de schema Zod da feature `payment` na estrutura atual do projeto.
2.  **Mover Arquivos:** Mover os arquivos identificados para `src/features/payment/schemas/`.
3.  **Atualizar Imports:** Percorrer o código e atualizar todos os caminhos de import que referenciam os schemas movidos.
4.  **Validar:**
    *   Executar ESLint em todo o projeto (ou nos arquivos afetados) para verificar erros de import ou outros.
    *   Executar testes unitários/integração relevantes para a feature `payment` para garantir que nada foi quebrado.

**Critérios de Aceitação:**
*   Todos os schemas Zod de `payment` estão em `src/features/payment/schemas/`.
*   Todos os imports estão atualizados e corretos.
*   ESLint passa sem erros relacionados aos arquivos movidos ou seus imports.
*   Testes relevantes para `payment` passam.
