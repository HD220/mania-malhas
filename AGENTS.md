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

## Fluxo de Trabalho de Desenvolvimento

1.  **Seleção de Tarefa:** Consulte o arquivo `.jules/TASKS.md` para tarefas pendentes. Certifique-se de entender os requisitos, complexidade e dependências.
2.  **Branching:** Crie um novo branch a partir da branch principal (atualmente parece ser `main`, mas verificar) para cada tarefa ou feature. Use um padrão de nomenclatura claro (ex: `feature/ID-descricao-curta`, `fix/ID-descricao-curta`).
3.  **Desenvolvimento (TDD/BDD preferencial para lógica de negócios):**
    *   **Testes Primeiro (Ideal para Casos de Uso/Actions):** Antes de escrever a lógica da funcionalidade em casos de uso ou server actions, escreva testes que definam o comportamento esperado.
    *   **Implementação:** Escreva o código para fazer os testes passarem.
    *   **Refatoração:** Refatore o código e os testes para melhorar a clareza, desempenho e manutenibilidade.
4.  **Commits:** Faça commits pequenos e atômicos com mensagens claras e descritivas, seguindo o padrão [Conventional Commits](https://www.conventionalcommits.org/) (ex: `feat: adiciona funcionalidade X`, `fix: corrige bug Y na feature Z`, `docs: atualiza documentacao do componente A`).
5.  **Revisão de Código (Code Review):** Após completar a tarefa, submeta um Pull Request (PR) para a branch principal. Aguarde a revisão por outros membros da equipe (humanos ou LLMs). Esteja preparado para discutir suas escolhas e fazer ajustes.
6.  **Merge:** Após a aprovação, o PR será mesclado.
7.  **Atualização de Tarefas:** Atualize o status da tarefa em `.jules/TASKS.md`.

## Comunicação

*   **Progresso:** Para tarefas longas, forneça atualizações periódicas sobre seu progresso.
*   **Dúvidas e Bloqueios:** Se encontrar ambiguidades nos requisitos, tiver dúvidas técnicas ou estiver bloqueado, não hesite em pedir ajuda. Forneça um resumo claro do problema, o que foi tentado e o contexto relevante (últimas ações, arquivos modificados) para facilitar a assistência. O `.jules/AGENT_WORKFLOW.md` detalha como você deve pausar e reportar.
*   **Feedback:** Forneça feedback construtivo sobre o código e os processos. Estamos todos aprendendo e melhorando.
*   **Ferramentas:** A comunicação principal pode ocorrer via comentários em PRs, issues no GitHub (se usado), ou através da plataforma de interação com o agente.

## Considerações Específicas

*   **Variáveis de Ambiente:** Todas as configurações sensíveis ou específicas do ambiente (chaves de API, strings de conexão de banco de dados, URLs de serviços) DEVEM ser gerenciadas através de variáveis de ambiente. Utilize o arquivo `.env.exemple` como base e nunca comite o arquivo `.env` real no repositório.
*   **Tratamento de Erros:** Utilize os erros customizados definidos em `src/lib/errors/domainErrors.ts` quando apropriado. Server Actions devem capturar exceções (especialmente `ZodError` para validação) e retornar respostas estruturadas para o cliente.
*   **Tipagem:** Esforce-se para usar a tipagem mais específica possível em TypeScript. Evite `any` sempre que uma alternativa mais segura existir. Utilize os schemas Zod também para inferir tipos (`z.infer<typeof schema>`).
*   **Upload de Arquivos:** A integração com MinIO para upload de imagens de produto deve seguir a lógica existente nos casos de uso e repositórios de produto.
*   **Componentes Shadcn/UI:** Utilize os componentes existentes em `src/components/ui/` e siga os padrões de uso e estilização do Shadcn/UI ao criar novos componentes de interface.

## Regras para LLMs

*   **Fluxo de Trabalho:** Siga rigorosamente o protocolo definido em `.jules/AGENT_WORKFLOW.md`. Isso inclui como selecionar tarefas, lidar com complexidade, planejar, executar, testar, submeter e comunicar.
*   **Foco:** Trabalhe em uma tarefa (ou sub-tarefa de complexidade 1) por vez para manter o foco e a qualidade.

Obrigado por sua colaboração!
