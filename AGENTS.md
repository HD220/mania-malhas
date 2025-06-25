# Guia para Agentes LLM - Projeto Mania Malhas Web App

## Introdução

Bem-vindo ao projeto **Mania Malhas Web App**! Este documento serve como o principal guia de orientação para agentes LLM (como você) que colaboram neste repositório. O objetivo é fornecer o contexto necessário, padrões e fluxos de trabalho para garantir uma colaboração eficiente e produtiva.

Por favor, leia este documento cuidadosamente antes de iniciar qualquer tarefa e consulte-o sempre que tiver dúvidas.

## Visão Geral do Projeto

O **Mania Malhas Web App** é uma aplicação Next.js projetada para gerenciar aspectos de um negócio, possivelmente um e-commerce ou sistema interno para a "Mania Malhas". As funcionalidades atuais e planejadas incluem o gerenciamento de produtos (com upload de imagens para MinIO), parceiros (clientes/fornecedores), transações financeiras (entradas/saídas) e pagamentos associados a essas transações. Possui uma área administrativa com dashboard para visualização de estatísticas e acesso rápido a funcionalidades de CRUD.

## Princípios Gerais de Desenvolvimento

Aderimos aos seguintes princípios para garantir a qualidade e manutenibilidade do nosso software:

*   **Clareza de Código:** Escreva código claro, legível e autoexplicativo. Use nomes de variáveis e funções significativos. Adicione comentários apenas quando necessário para explicar lógicas complexas ou decisões de design não óbvias.
*   **DRY (Don't Repeat Yourself):** Evite a repetição de código. Generalize e reutilize componentes e lógicas sempre que possível.
*   **KISS (Keep It Simple, Stupid):** Priorize soluções simples e diretas em vez de complexidade desnecessária.
*   **Testabilidade:** Escreva código que seja fácil de testar. Desenvolva testes unitários e de integração para garantir a corretude e facilitar refatorações seguras. (Veja a seção de Fluxo de Trabalho para mais detalhes sobre TDD/BDD). Atualmente, o foco está em testes unitários/integração para a lógica de backend (casos de uso, server actions), com testes de UI tendo sido removidos.
*   **Segurança:** Considere a segurança desde o início do desenvolvimento (Security by Design). Esteja ciente das vulnerabilidades comuns (ex: OWASP Top 10) e aplique as melhores práticas para mitigá-las.
*   **YAGNI (You Ain't Gonna Need It):** Não implemente funcionalidades que não são necessárias no momento, mesmo que você antecipe que serão úteis no futuro. Concentre-se nos requisitos atuais.

## Padrões Arquiteturais e Estrutura de Código

A arquitetura e a organização do código fonte (`src/`) são detalhadas no documento **`docs/project-structure-guide.md`**. Este documento é a **fonte da verdade** para a estrutura do projeto. Abaixo, um resumo dos pontos chave, mas **consulte sempre o guia completo para detalhes**.

*   **Framework:** Next.js (App Router).
*   **Linguagem:** TypeScript.
*   **Nomenclatura:** `kebab-case` para arquivos e diretórios, exceto onde convenções de framework (ex: `page.tsx`, componentes React `PascalCase.tsx`) ditam o contrário.
*   **Features (`src/features/`)**: Módulos de negócio verticalmente fatiados (ex: `user-profile`, `product-management`). Cada feature contém seus próprios `actions`, `components`, `db` (repositórios), `lib`, `types` (schemas Zod), e `usecases`.
*   **Componentes Genéricos (`src/components/`)**: Componentes React reutilizáveis não atrelados a uma feature.
    *   `ui/`: Componentes base ShadCN/UI.
*   **Biblioteca (`src/lib/`)**: Configurações globais, clientes de serviço, utilitários compartilhados.
    *   `db-config/`: Configuração Drizzle ORM, schemas de tabela (`*.table.ts`), migrações.
    *   `utils/`: Utilitários globais.
    *   `clients/` ou `sdk/`: Para clientes de serviços externos (ex: MinIO).
    *   `shared-types/`: Tipos e Schemas Zod compartilhados.
    *   `constants/`: Constantes globais.
*   **Rotas (`src/app/`)**: Páginas e layouts do Next.js.
*   **Testes (`__tests__/`)**: Ao lado dos arquivos testados. Setup global em `test-setup.ts` na raiz do projeto.
*   **Estilos Globais:** `src/globals.css`.
*   **Referência Principal:** `docs/project-structure-guide.md`.

## Tecnologias Chave

*   **Linguagem Principal:** TypeScript
*   **Framework Frontend/Backend:** Next.js (~14.2.4, App Router)
*   **ORM/Banco de Dados:** Drizzle ORM (~0.44.2) com PostgreSQL
*   **Testes:** Vitest (~3.2.4) para testes unitários e de integração (foco atual).
*   **Armazenamento de Arquivos:** MinIO (SDK `minio` ~8.0.0)
*   **Estilização:** Tailwind CSS (~3.4.4)
*   **Componentes UI:** Shadcn/UI (utilizando Radix UI e `lucide-react`)
*   **Validação de Dados:** Zod (~3.23.8)
*   **Gerenciamento de Formulários:** React Hook Form (~7.51.5)
*   **Gerenciador de Pacotes:** npm (~10.8.1)
*   **Node.js:** Versão 20.x (conforme `package.json`)
*   **Controle de Versão:** Git

## Protocolo Operacional do Agente e Gerenciamento de Tarefas

Esta seção detalha o fluxo de trabalho que você, como Agente Jules (ou outro agente LLM), deve seguir. Ela substitui e consolida informações anteriormente distribuídas.

### 1. Visão Geral do Sistema de Tarefas

O gerenciamento de tarefas é fundamental para a organização do projeto. Ele é composto por:

*   **Arquivos de Tarefas Individuais:** Cada tarefa é definida em seu próprio arquivo Markdown com frontmatter YAML, localizado em `/.jules/tasks/TASK_ID.md` (ex: `/.jules/tasks/FEAT-001.md`). Estes arquivos são a fonte da verdade para os detalhes de uma tarefa, incluindo descrição, critérios de aceitação, status, prioridade, complexidade, dependências, notas de implementação, etc.
*   **Arquivo de Resumo Principal (`/.jules/TASKS.md`):** Este arquivo contém uma tabela de resumo de alto nível de todas as tarefas. Ele fornece uma visão geral rápida e links para os arquivos de detalhes individuais.
*   **Especificação do Formato das Tarefas (`/.jules/TASK_FORMAT_SPECIFICATION.md`):** Este documento define a estrutura e todos os campos obrigatórios e opcionais para os arquivos de tarefa `.md`. Consulte-o ao criar ou modificar tarefas.

### 2. O Ciclo de Trabalho do Agente (Loop de Execução)

Sua operação funciona em ciclos. Cada ciclo envolve análise, decisão e execução, culminando em uma submissão (commit). Siga estas fases rigorosamente:

**Fase 1: Sincronização e Análise**
1.  **Leia o Resumo de Tarefas:** Inicie o ciclo lendo o conteúdo atual do arquivo `/.jules/TASKS.md`.
2.  **Analise o Estado do Projeto:** Avalie a tabela de resumo inteira para entender o estado atual das tarefas, suas prioridades e interdependências.

**Fase 2: Seleção da Próxima Ação e Leitura de Detalhes**
Sua lógica de decisão para escolher a próxima ação é, em ordem de prioridade:

1.  **Desmembrar Tarefas Complexas:**
    *   **Critério:** Procure a primeira tarefa no `TASKS.md` com status `Pendente` e `Complexidade > 1`.
    *   **Ação Preparatória Obrigatória:** Antes de prosseguir, leia completamente o arquivo de detalhe da tarefa-mãe selecionada (ex: `/.jules/tasks/TSK-COMPLEXA-001.md`). Isso é crucial para entender o escopo completo antes de definir sub-tarefas.
2.  **Executar Tarefa Simples:**
    *   **Critério:** Se não houver tarefas para desmembrar, procure a primeira tarefa no `TASKS.md` com status `Pendente`, `Complexidade < 2` (idealmente 1), e cujas `Dependências` (listadas no seu arquivo `.md` e/ou no `TASKS.md`) estejam todas com o status `Concluído`.
    *   **Ação Preparatória Obrigatória:** Antes de prosseguir, leia completamente o arquivo de detalhe da tarefa selecionada (ex: `/.jules/tasks/TSK-SIMPLES-002.md`). Isso garante a compreensão total dos requisitos, critérios de aceitação e qualquer nota ou histórico relevante.
3.  **Aguardar:**
    *   **Critério:** Se nenhuma ação for possível (ex: todas as tarefas pendentes estão bloqueadas por dependências não concluídas, ou não há tarefas pendentes).
    *   **Ação:** Informe o status de bloqueio (ou ausência de tarefas) e aguarde por novas instruções ou mudanças no `TASKS.md`.

**Fase 3: Execução da Ação**
Com base na sua decisão na Fase 2:

*   **SE A AÇÃO FOR DESMEMBRAR UMA TAREFA:**
    1.  **Adote a Persona:** "Arquiteto de Software".
    2.  **Anuncie a Ação:** Informe qual tarefa será desmembrada (ex: `"Analisando a Tarefa TSK-COMPLEXA-001 para desmembramento."`).
    3.  **Crie Sub-Tarefas Detalhadas:**
        *   Defina um conjunto de novas sub-tarefas menores (idealmente `Complexidade = 1`).
        *   Para cada sub-tarefa, crie um novo arquivo de detalhe `.md` em `/.jules/tasks/` (ex: `/.jules/tasks/SUB-001.1.md`). Preencha todos os campos necessários conforme `/.jules/TASK_FORMAT_SPECIFICATION.md`, incluindo `id`, `title`, `description`, `status: Pendente`, `priority`, `complexity`, `dependencies` (listando o ID da tarefa-mãe), e `parent_task` (com o ID da tarefa-mãe).
    4.  **Atualize a Tarefa-Mãe:**
        *   Modifique o arquivo de detalhe da tarefa-mãe (`/.jules/tasks/TSK-COMPLEXA-001.md`):
            *   Altere seu `status` para `Subdividido` (ou `Bloqueado` se as sub-tarefas devem ser concluídas antes que ela possa ser considerada avançada).
            *   Adicione uma nota no campo `notes` ou similar, listando os IDs das sub-tarefas criadas.
    5.  **Prepare Atualização do Resumo (`TASKS.md`):**
        *   No seu "estado mental" (para ser aplicado no `TASKS.md` antes do commit), marque a tarefa-mãe com o novo status e adicione as novas sub-tarefas à tabela de resumo, incluindo links para seus respectivos arquivos `.md`.
    6.  **Transição:** Passe para a Fase 4 (Submissão).

*   **SE A AÇÃO FOR EXECUTAR UMA TAREFA:**
    1.  **Adote a Persona Apropriada:** (ex: `"Ativando persona: Engenheiro de Backend para a Tarefa TSK-SIMPLES-002."`).
    2.  **Anuncie a Ação:** Informe qual tarefa será executada.
    3.  **Atualize Status para "Em Andamento":**
        *   Modifique o arquivo de detalhe da tarefa (`/.jules/tasks/TSK-SIMPLES-002.md`), alterando seu `status` para `Em Andamento`.
        *   Reflita essa mudança no `TASKS.md` (a ser aplicado antes do commit).
    4.  **Realize o Trabalho:** Utilize suas ferramentas e habilidades para implementar a solução conforme descrito no arquivo de detalhe da tarefa. Siga os princípios de desenvolvimento e padrões arquiteturais (descritos anteriormente neste documento).
    5.  **Registro de Progresso e Descobertas:**
        *   Durante a execução, se houver descobertas importantes, impedimentos, decisões de design significativas ou progresso que valha a pena notar, **adicione essas informações como comentários ou notas** na seção apropriada (ex: `### Notas de Implementação` ou `### Log de Progresso`) do arquivo de detalhe da tarefa (`/.jules/tasks/TSK-SIMPLES-002.md`).
    6.  **Reavaliação de Complexidade:** Se, durante a execução, perceber que a tarefa é mais complexa do que o inicialmente avaliado:
        *   Pare imediatamente a execução.
        *   Atualize o campo `complexity` no arquivo de detalhe da tarefa (`.md`) e no `TASKS.md`.
        *   Comunique a mudança e, se a nova complexidade for `> 1`, a tarefa deverá retornar à Fase 2 para possível desmembramento em um ciclo futuro.
    7.  **Identificação de Novas Tarefas Ad-Hoc:** Se identificar a necessidade de uma nova tarefa não mapeada que é um pré-requisito ou um desdobramento importante:
        *   Siga o procedimento em "3. Gerenciamento Detalhado de Tarefas > Criando Novas Tarefas" abaixo para criar a nova tarefa (incluindo seu arquivo `.md` e entrada no `TASKS.md`).
        *   Avalie se a tarefa atual depende desta nova tarefa.
    8.  **Conclusão da Tarefa:** Após concluir a implementação e quaisquer testes necessários (conforme os padrões do projeto):
        *   Modifique o arquivo de detalhe da tarefa (`/.jules/tasks/TSK-SIMPLES-002.md`), alterando seu `status` para `Concluído`.
        *   Reflita essa mudança no `TASKS.md` (a ser aplicado antes do commit).
    9.  **Transição:** Passe para a Fase 4 (Submissão).

**Fase 4: Submissão (O "Commit")**
1.  **Prepare o Commit:** Reúna todas as alterações feitas durante o ciclo:
    *   Código-fonte modificado/criado.
    *   Arquivos de detalhe de tarefas (`.jules/tasks/*.md`) criados ou atualizados.
    *   O arquivo de resumo `/.jules/TASKS.md` atualizado.
2.  **Execute Testes:** Se houver testes automatizados relevantes para as mudanças de código, execute-os e garanta que passam.
3.  **Submeta:** Utilize a ferramenta `submit` com um nome de branch apropriado e uma mensagem de commit clara e descritiva, seguindo o padrão de [Conventional Commits](https://www.conventionalcommits.org/). A mensagem deve resumir o que foi feito na tarefa.

### 3. Gerenciamento Detalhado de Tarefas (Procedimentos Adicionais)

Estes procedimentos são referenciados no ciclo de trabalho e detalham interações específicas com o sistema de tarefas.

**3.1. Criando Novas Tarefas (Ad-hoc ou Sub-tarefas)**
1.  **Defina um ID Único:** Escolha um ID claro e único para a nova tarefa (ex: `FEAT-002`, `FIX-005`, `SUB-001.2`).
2.  **Crie o Arquivo de Detalhe da Tarefa:**
    *   Crie um novo arquivo em `/.jules/tasks/` com o nome `ID_DA_TAREFA.md` (ex: `/.jules/tasks/FEAT-002.md`).
    *   Preencha o frontmatter YAML e o corpo da descrição em Markdown conforme especificado em `/.jules/TASK_FORMAT_SPECIFICATION.md`. Certifique-se de incluir todos os campos obrigatórios (como `id`, `title`, `status: Pendente`, `priority`, `complexity`, `created_date`) e opcionais relevantes (como `description`, `dependencies`, `parent_task`, `assignee: AgenteJules`).
3.  **Adicione ao Resumo Principal (`/.jules/TASKS.md`):**
    *   Abra `/.jules/TASKS.md`.
    *   Adicione uma nova linha na tabela de resumo para a nova tarefa, incluindo colunas chave como ID, Prioridade, Título Curto, Status, Complexidade, Responsável, Data de Criação e um link para o arquivo de detalhe (ex: `[FEAT-002.md](./tasks/FEAT-002.md)`).

**3.2. Atualizando Tarefas Existentes**
Para modificar uma tarefa existente (ex: mudar status, adicionar notas, atualizar descrição, etc.):
1.  **Modifique o Arquivo de Detalhe:**
    *   Abra o arquivo `/.jules/tasks/TASK_ID.md` correspondente.
    *   Faça as alterações necessárias no frontmatter YAML (ex: `status`, `priority`, `complexity`, `assignee`) ou no corpo da descrição/notas.
2.  **Atualize o Resumo Principal (`/.jules/TASKS.md`) (se necessário):**
    *   Se você alterou campos que são espelhados na tabela de resumo em `/.jules/TASKS.md` (como `Status`, `Prioridade`, `Título Curto`, `Responsável`, `Complexidade`), atualize a linha correspondente para manter a consistência. Mudanças de status são as mais comuns a serem refletidas aqui.

**3.3. Desmembrando Tarefas Complexas (Detalhes Adicionais)**
Este processo é parte da Fase 3, mas alguns detalhes sobre a atualização dos arquivos são reforçados aqui:
1.  **Identifique a Tarefa Mãe:** (ex: `TSK-COMPLEXA-001`).
2.  **Leia o Detalhe da Tarefa Mãe:** (Obrigatório, conforme Fase 2).
3.  **Atualize o Arquivo de Detalhe da Tarefa Mãe:**
    *   No arquivo `/.jules/tasks/TSK-COMPLEXA-001.md`, altere o `status` para `Subdividido`.
    *   Adicione uma nota no campo `notes` (ou similar) indicando que foi subdividida e liste os IDs das novas sub-tarefas criadas.
4.  **Crie Arquivos de Detalhe para Sub-Tarefas:**
    *   Para cada nova sub-tarefa, siga o processo "3.1. Criando Novas Tarefas".
    *   No frontmatter de cada sub-tarefa, preencha `dependencies: ["TSK-COMPLEXA-001"]` e `parent_task: "TSK-COMPLEXA-001"`.
5.  **Atualize o Resumo Principal (`/.jules/TASKS.md`):**
    *   Modifique a linha da tarefa mãe no `TASKS.md` para refletir seu novo status (`Subdividido`).
    *   Adicione novas linhas para cada sub-tarefa criada no `TASKS.md`.

### 4. Comunicação

*   **Progresso:** Para tarefas longas, as atualizações no campo `notes` do arquivo de detalhe da tarefa servem como registro. Comunique verbalmente (via mensagem) se um marco importante for atingido ou se houver bloqueios.
*   **Dúvidas e Bloqueios:** Se encontrar ambiguidades nos requisitos (mesmo após ler o detalhe da tarefa), tiver dúvidas técnicas ou estiver bloqueado:
    1.  Primeiro, registre a dúvida/bloqueio no campo `notes` do arquivo de detalhe da tarefa.
    2.  Em seguida, use a ferramenta `request_user_input` para pedir ajuda. Forneça um resumo claro do problema, o que foi tentado, o ID da tarefa e o contexto relevante.
*   **Feedback:** Forneça feedback construtivo sobre o código e os processos.
*   **Ferramentas:** A comunicação principal ocorre através da plataforma de interação com o agente e por meio das atualizações nos arquivos de tarefa.

### 5. Considerações Específicas

*   **Variáveis de Ambiente:** Todas as configurações sensíveis ou específicas do ambiente DEVEM ser gerenciadas através de variáveis de ambiente. Utilize o arquivo `.env.exemple` como base e nunca comite o arquivo `.env` real no repositório.
*   **Tratamento de Erros:** Utilize os erros customizados definidos em `src/lib/errors/domainErrors.ts` (ou conforme a estrutura atual) quando apropriado. Server Actions devem capturar exceções e retornar respostas estruturadas.
*   **Tipagem:** Esforce-se para usar a tipagem mais específica possível em TypeScript. Evite `any`. Utilize os schemas Zod também para inferir tipos (`z.infer<typeof schema>`).
*   **Upload de Arquivos:** Siga a lógica existente para integração com MinIO.
*   **Componentes Shadcn/UI:** Utilize os componentes existentes e siga seus padrões.

### 6. Regras Fundamentais para LLMs

*   **Este Documento como Guia Único:** Siga rigorosamente o protocolo operacional e as diretrizes de gerenciamento de tarefas detalhadas **neste arquivo (`AGENTS.md`)**. Ele é sua principal fonte de verdade para o fluxo de trabalho.
*   **Foco na Tarefa:** Trabalhe em uma sub-tarefa (idealmente `Complexidade = 1`) por vez para manter o foco e a qualidade.
*   **Gerenciamento de Tarefas Preciso:** A manipulação correta dos arquivos em `/.jules/tasks/`, do resumo `/.jules/TASKS.md`, e a adesão à `/.jules/TASK_FORMAT_SPECIFICATION.md` são cruciais para a organização do projeto.

Obrigado por sua colaboração!
