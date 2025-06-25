---
id: "AUDIT-001"
title: "Analisar estrutura do diretório `src/` e planejar correções"
priority: "P2"
status: "Pendente"
complexity: 4
assigned_to: "AgenteJules"
dependencies: [] # Nenhuma dependência explícita para iniciar a análise
creation_date: "2024-08-07" # Data atual
completion_date: ""
tags:
  - "auditoria"
  - "refactor"
  - "estrutura"
  - "planejamento"
parent_task: null
notes: |
  Esta meta-tarefa envolve uma análise completa da estrutura de diretórios e arquivos dentro de `src/`.
  O objetivo é identificar quaisquer arquivos ou diretórios que não estejam em conformidade com as convenções de organização do projeto.
  Para cada desvio identificado, uma nova tarefa de correção deve ser criada e registrada no `TASKS.md`.
  A análise deve considerar a estrutura de features (`src/features/[nome_feature]/[actions|components|db|schemas|usecases]`),
  mas também a organização de outros diretórios como `src/components/`, `src/lib/`, `src/app/`, etc.
---

**Descrição Detalhada:**

1.  **Listar Estrutura:** Realizar uma listagem completa de todos os arquivos e diretórios dentro de `src/`.
2.  **Analisar Conformidade:**
    *   Para `src/features/`: Verificar se cada feature segue o padrão `[nome_feature]/(actions|components|db|schemas|usecases|...)`. Identificar arquivos fora dessas subpastas ou em subpastas incorretas.
    *   Para `src/components/`: Verificar se contém apenas componentes de UI genéricos/reutilizáveis. Componentes específicos de uma feature devem estar em `src/features/[nome_feature]/components/`.
    *   Para `src/lib/`: Verificar se contém código de biblioteca verdadeiramente genérico.
    *   Para `src/app/`: Analisar a estrutura de rotas e layouts, verificando se há componentes ou lógica que deveriam estar em `src/features/` ou `src/components/`.
    *   Outros diretórios em `src/`: Analisar seu propósito e se os arquivos estão corretamente localizados.
3.  **Identificar Desvios:** Documentar cada arquivo ou diretório que está fora do padrão esperado.
4.  **Criar Tarefas de Correção:** Para cada desvio significativo identificado:
    *   Criar uma nova entrada no `TASKS.md` com ID apropriado (ex: `REFAC-STRUCT-001`, `REFAC-STRUCT-002`, ...).
    *   Definir título, prioridade (provavelmente P3 ou P4), status `Pendente`, complexidade (geralmente 1 ou 2 para movimentação de arquivos), responsável `AgenteJules`.
    *   Criar um arquivo de detalhe para a nova tarefa explicando o arquivo/diretório a ser movido, o local de origem e o destino correto, e os passos para atualização de imports e validação.
5.  **Atualizar `AUDIT-001`:** Após a criação de todas as sub-tarefas de correção, marcar esta tarefa `AUDIT-001` como `Concluído` ou `Subdividido` (se o número de tarefas geradas for muito grande, pode-se considerar `Subdividido` e esta tarefa mãe como um épico).

**Critérios de Aceitação para `AUDIT-001`:**
*   Uma análise completa da estrutura de `src/` foi realizada.
*   Todos os desvios das convenções de organização foram identificados.
*   Tarefas de correção correspondentes foram criadas no `TASKS.md` e seus respectivos arquivos de detalhe foram gerados.
*   Esta tarefa `AUDIT-001` é marcada como `Concluído` (ou `Subdividido`).
