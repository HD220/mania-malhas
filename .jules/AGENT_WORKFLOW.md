# Fluxo de Trabalho do Agente e Gerenciamento de Tarefas

Este documento descreve como o Agente Jules (e outros agentes LLM) devem interagir com o sistema de gerenciamento de tarefas deste projeto.

## 1. Visão Geral do Gerenciamento de Tarefas

O gerenciamento de tarefas evoluiu para um sistema de arquivos individuais para maior detalhamento e clareza, complementado por um arquivo de resumo.

-   **Arquivos de Tarefas Individuais:** Cada tarefa é definida em seu próprio arquivo Markdown com frontmatter YAML, localizado em `/.jules/tasks/TASK_ID.md`. Estes arquivos contêm todos os detalhes da tarefa.
-   **Especificação do Formato:** Para detalhes completos sobre a estrutura e campos dos arquivos de tarefa, consulte `/.jules/TASK_FORMAT_SPECIFICATION.md`.
-   **Arquivo de Resumo Principal:** O arquivo `/.jules/TASKS.md` agora serve como uma tabela de resumo de alto nível. Ele fornece uma visão geral rápida das tarefas, seus status, prioridades e links para os arquivos de detalhes.

## 2. Lendo Tarefas e Preparando a Ação

1.  **Consulte o Resumo (`/.jules/TASKS.md`):** Comece visualizando a tabela de resumo para obter uma lista das tarefas, seus status atuais, prioridades e responsáveis.
2.  **Acesse os Detalhes (Leitura Obrigatória):**
    *   **Para Executar uma Tarefa:** Antes de iniciar a execução de uma tarefa (com `Complexidade < 2` e dependências resolvidas), **é obrigatório ler seu arquivo de detalhe completo** em `/.jules/tasks/TASK_ID.md`. Isso garante a compreensão total dos requisitos, critérios de aceitação, histórico e qualquer nota relevante.
    *   **Para Desmembrar uma Tarefa:** Antes de iniciar o desmembramento de uma tarefa complexa (`Complexidade > 1`), **é obrigatório ler seu arquivo de detalhe completo** em `/.jules/tasks/TASK_ID.md`. Isso é crucial para definir sub-tarefas que cubram adequadamente o escopo da tarefa-mãe.

## 3. Criando Novas Tarefas

Ao identificar a necessidade de uma nova tarefa:

1.  **Defina um ID Único:** Escolha um ID claro e único para a nova tarefa (ex: `NOVA-FEATURE-001`).
2.  **Crie o Arquivo da Tarefa:**
    -   Crie um novo arquivo em `/.jules/tasks/` com o nome `ID_DA_TAREFA.md` (ex: `/.jules/tasks/NOVA-FEATURE-001.md`).
    -   Preencha o frontmatter YAML e o corpo da descrição em Markdown conforme especificado em `/.jules/TASK_FORMAT_SPECIFICATION.md`. Certifique-se de incluir todos os campos obrigatórios (`id`, `title`, `priority`, `status`, `complexity`, `creation_date`).
3.  **Adicione ao Resumo Principal:**
    -   Abra `/.jules/TASKS.md`.
    -   Adicione uma nova linha na tabela de resumo para a nova tarefa, incluindo colunas chave como ID, Prioridade, Título Curto, Status, Complexidade, Responsável, Data de Criação e um link para o arquivo de detalhe (ex: `[NOVA-FEATURE-001.md](./tasks/NOVA-FEATURE-001.md)`).

## 4. Atualizando Tarefas

Para modificar uma tarefa existente (ex: mudar status, adicionar notas, atualizar descrição):

1.  **Modifique o Arquivo de Detalhe:**
    -   Abra o arquivo `/.jules/tasks/TASK_ID.md` correspondente.
    -   Faça as alterações necessárias no frontmatter YAML ou no corpo da descrição.
2.  **Atualize o Resumo Principal (se necessário):**
    -   Se você alterou campos que são espelhados na tabela de resumo em `/.jules/TASKS.md` (como `Status`, `Prioridade`, `Título Curto`, `Responsável`, `Complexidade`), atualize a linha correspondente em `/.jules/TASKS.md` para manter a consistência.

## 5. Desmembrando Tarefas Complexas (Subdivisão)

Conforme o protocolo, tarefas com `Complexidade > 1` devem ser desmembradas.

1.  **Identifique a Tarefa Mãe:** A tarefa a ser desmembrada (ex: `TSK-COMPLEXA-001`).
2.  **Atualize a Tarefa Mãe:**
    -   No arquivo `/.jules/tasks/TSK-COMPLEXA-001.md`, altere o `status` para `Subdividido`.
    -   Você pode adicionar uma nota no campo `notes` indicando que foi subdividida e quais são as sub-tarefas.
3.  **Crie Sub-Tarefas:**
    -   Para cada nova sub-tarefa, siga o processo de "Criando Novas Tarefas" (passo 3).
    -   No frontmatter de cada sub-tarefa, use o campo `dependencies` para listar o ID da tarefa mãe (ex: `dependencies: ["TSK-COMPLEXA-001"]`). Alternativamente ou complementarmente, pode-se usar o campo `parent_task: "TSK-COMPLEXA-001"`. (Nota: `TASK_FORMAT_SPECIFICATION.md` sugere `parent_task` para este propósito específico, enquanto `dependencies` é para pré-requisitos de execução).
4.  **Atualize o Resumo Principal (`TASKS.md`):**
    -   Modifique a linha da tarefa mãe para refletir seu novo status (`Subdividido`).
    -   Adicione novas linhas para cada sub-tarefa criada.

## 6. Ciclo de Trabalho Geral

Lembre-se de seguir o ciclo de trabalho principal:
1.  **Sincronização e Análise:** Leia `/.jules/TASKS.md` e os arquivos de detalhes relevantes.
2.  **Seleção da Ação:** Decida entre desmembrar uma tarefa complexa ou executar uma tarefa simples.
3.  **Execução:** Adote a persona, anuncie, atualize status (no arquivo da tarefa), e realize o trabalho. Crie novas tarefas se necessário.
4.  **Submissão:** Faça o commit das alterações (nos arquivos de tarefa, `TASKS.md`, código, etc.).

Aderir a este fluxo de trabalho garantirá que o rastreamento de tarefas permaneça preciso e que o projeto progrida de forma organizada.
