# Especificação do Formato de Tarefa Individual

Este documento descreve o formato para arquivos de tarefas individuais.

## Estrutura de Arquivos e Diretórios

- Todas as tarefas individuais serão armazenadas no diretório `/.jules/tasks/`.
- Cada tarefa será um arquivo Markdown com o nome correspondente ao seu ID (ex: `TSK-ID.md`).

## Formato do Arquivo da Tarefa

Cada arquivo de tarefa consistirá em:
1.  **YAML Frontmatter:** Para metadados estruturados.
2.  **Corpo Markdown:** Para a descrição detalhada da tarefa.

### YAML Frontmatter

O frontmatter YAML no início do arquivo (delimitado por `---`) conterá os seguintes campos:

-   `id`: `string` (Obrigatório) - Identificador único da tarefa (ex: "F07.1", "REFAC-01.3.1").
-   `title`: `string` (Obrigatório) - Um título conciso para a tarefa.
-   `priority`: `string` (Obrigatório) - Prioridade da tarefa (ex: "P0", "P1", "P2", "P3", "P4", "P5").
-   `status`: `string` (Obrigatório) - Status atual da tarefa (ex: "Pendente", "Em Andamento", "Concluído", "Bloqueado", "Revisão", "Subdividido").
-   `complexity`: `integer` (Obrigatório) - Nível de complexidade (1-5).
-   `assigned_to`: `string` (Opcional) - A quem a tarefa está atribuída (ex: "AgenteJules", "[A DEFINIR]", "Nome do Usuário").
-   `dependencies`: `list[string]` (Opcional) - Lista de IDs de tarefas das quais esta tarefa depende.
-   `creation_date`: `string` (Obrigatório) - Data de criação da tarefa no formato `YYYY-MM-DD`.
-   `due_date`: `string` (Opcional) - Data de vencimento estimada para a tarefa no formato `YYYY-MM-DD`.
-   `completion_date`: `string` (Opcional) - Data real de conclusão da tarefa no formato `YYYY-MM-DD`.
-   `tags`: `list[string]` (Opcional) - Lista de tags para categorizar a tarefa (ex: "refactor", "feature", "bug", "documentation").
-   `parent_task`: `string` (Opcional) - Se esta é uma sub-tarefa, o ID da tarefa mãe.
-   `notes`: `string` (Opcional) - Notas adicionais ou contexto sobre a tarefa. Pode ser multi-linha.

### Corpo Markdown

O conteúdo principal do arquivo, após o frontmatter YAML, será a descrição completa da tarefa em formato Markdown. Este campo substitui a coluna "Descrição da Tarefa" da tabela original.

### Exemplo (`/.jules/tasks/EXEMPLO-001.md`):

```yaml
---
id: "EXEMPLO-001"
title: "Exemplo de Tarefa Detalhada"
priority: "P3"
status: "Pendente"
complexity: 1
assigned_to: "AgenteJules"
dependencies:
  - "OUTRA-TAREFA-002"
creation_date: "2024-08-06"
due_date: "2024-08-10"
completion_date: null
tags:
  - "exemplo"
  - "documentacao"
parent_task: "TAREFA-MAE-001"
notes: |
  Esta é uma nota de exemplo.
  Pode ter múltiplas linhas.
---

Esta é a **descrição completa** da tarefa EXEMPLO-001.

Pode incluir:
- Listas
- Blocos de código
- Links
- E qualquer outro elemento Markdown.
```

## `TASKS.md` Principal

O arquivo `/.jules/TASKS.md` será simplificado para atuar como uma tabela de resumo de alto nível. Ele deverá conter, no mínimo:
- ID da Tarefa
- Título (Curto)
- Status
- Prioridade
- Responsável
- Link para o arquivo de detalhe da tarefa (se aplicável)

As colunas `Complexidade`, `Dependências`, `Data de Criação`, `Data de Conclusão`, `Notas` e a `Descrição da Tarefa` completa serão movidas para os arquivos individuais.

A coluna `Descrição da Tarefa` no `TASKS.md` principal pode ser removida ou drasticamente encurtada para apenas o `title` já presente no frontmatter do arquivo de detalhe.
A coluna `Dependências` no `TASKS.md` principal pode ser removida, pois estará no arquivo de detalhe.
A coluna `Notas` no `TASKS.md` principal pode ser removida.
A coluna `Complexidade` pode ser mantida para facilitar a visualização ou removida. (Decisão: Manter por enquanto para facilitar a lógica do agente de desmembramento).
A coluna `Responsável` será mantida.
A coluna `Data de Criação` será mantida para fins de histórico na tabela principal.
A coluna `Data de Conclusão (Estimada/Real)` será substituída por `Data de Vencimento` e `Data de Conclusão` nos arquivos de detalhe. Pode ser removida da tabela principal ou simplificada.

**Sugestão para nova estrutura de colunas em `TASKS.md`:**

| ID da Tarefa | Prioridade | Título Curto                                                    | Status      | Complexidade | Responsável | Data de Criação | Link para Detalhes |
|--------------|------------|-----------------------------------------------------------------|-------------|--------------|-------------|-----------------|--------------------|
| F07.1        | P2         | Confirmar requisitos de negócio para páginas públicas/marketing | Pendente    | 1            | [PO/SH]     | 2024-08-01      | [F07.1.md](./tasks/F07.1.md) |

Este novo formato visa melhorar a organização e a capacidade de detalhamento de cada tarefa.
