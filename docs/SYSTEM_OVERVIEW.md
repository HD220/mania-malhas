# Visão Geral do Sistema de Gestão para Costureira

## 1. Introdução

Este documento fornece uma visão geral do sistema de gestão desenvolvido para uma costureira. O sistema tem como objetivo principal servir como um painel administrativo para gerenciar produtos, informações financeiras e, futuramente, expandir para um portal de encomendas para clientes.

## 2. Arquitetura e Tecnologias

O sistema é construído como uma aplicação web moderna, utilizando as seguintes tecnologias principais:

*   **Frontend:**
    *   [Next.js](https://nextjs.org/): Framework React para renderização no lado do servidor (SSR) e geração de sites estáticos (SSG), proporcionando uma experiência de usuário rápida e otimizada para SEO.
    *   [TypeScript](https://www.typescriptlang.org/): Superset do JavaScript que adiciona tipagem estática, melhorando a robustez e a manutenibilidade do código.
    *   [Tailwind CSS](https://tailwindcss.com/): Framework CSS utilitário para estilização rápida e customizável da interface do usuário.
    *   **Componentes Shadcn/UI (inferido):** A estrutura da pasta `src/components/ui` sugere o uso de componentes pré-construídos e acessíveis, comuns em bibliotecas como Shadcn/UI.

*   **Backend (Lógica de Negócio e API):**
    *   **Next.js API Routes (inferido):** A lógica de backend e as operações de API são provavelmente manipuladas usando as rotas de API do Next.js, localizadas dentro da pasta `src/app/api` (embora não explicitamente listada, é uma convenção comum) ou diretamente nos `Server Actions` do Next.js dentro das páginas/componentes.
    *   **Casos de Uso (Use Cases):** A pasta `src/usecases` define a lógica de negócio principal para as diferentes entidades do sistema (ex: `CreateProductUseCase`, `GetPartnerByIdUseCase`), promovendo uma arquitetura limpa e testável.

*   **Banco de Dados:**
    *   [PostgreSQL](https://www.postgresql.org/): Sistema de gerenciamento de banco de dados relacional objeto, robusto e confiável.
    *   [Drizzle ORM](https://orm.drizzle.team/): ORM (Object-Relational Mapper) TypeScript-first para interagir com o banco de dados PostgreSQL, oferecendo segurança de tipos e uma sintaxe intuitiva para queries. As definições de schema estão em `src/db/postgres/schema/` e as migrações em `src/db/postgres/migrations/`.
    *   **Repositórios:** A pasta `src/db/repositories` contém classes que abstraem o acesso direto aos dados, implementando padrões de repositório para cada entidade.

*   **Armazenamento de Arquivos:**
    *   [MinIO](https://min.io/): Serviço de armazenamento de objetos compatível com S3, utilizado para armazenar imagens de produtos. A configuração do cliente MinIO encontra-se em `src/services/minio.ts`.

## 3. Funcionalidades Existentes Principais

O sistema atualmente implementa as seguintes funcionalidades no painel administrativo:

### 3.1. Gerenciamento de Produtos
*   **Cadastro de Produtos:** Permite à costureira adicionar novos produtos ao sistema, incluindo nome, descrição detalhada e preço.
*   **Upload de Imagens de Produtos:** Suporta o upload de múltiplas imagens para cada produto, que são armazenadas no MinIO.
*   **Listagem e Edição de Produtos:** Permite visualizar a lista de produtos cadastrados, buscar, filtrar e editar suas informações.
*   **Ativação/Desativação de Produtos:** Produtos podem ser marcados como ativos ou inativos.

### 3.2. Gerenciamento de Parceiros
*   **Cadastro de Parceiros:** Permite registrar informações de contato de parceiros (ex: fornecedores).
*   **Listagem e Edição de Parceiros:** Permite visualizar e editar informações dos parceiros.
*   **Ativação/Desativação de Parceiros.**

### 3.3. Gerenciamento Financeiro (Base)
*   **Registro de Transações:** O sistema possui tabelas (`transactionTable`, `paymentTable`) para registrar transações financeiras (entradas e saídas), associando-as a parceiros quando aplicável.
    *   Campos como tipo de transação (Entrada/Saída), valor, data, data de vencimento são suportados.
*   **Registro de Pagamentos:** Pagamentos individuais podem ser registrados e associados a transações específicas.
*   **Listagem de Contas a Receber:** Uma página (`src/app/receivable/list`) indica a existência de uma funcionalidade para visualizar contas a receber.

### 3.4. Autenticação
*   Uma página de login (`src/app/login`) sugere um sistema de autenticação para proteger o acesso ao painel administrativo.

## 4. Estrutura do Projeto (Principais Pastas)

*   `src/app/`: Contém as definições de rotas e páginas da aplicação Next.js.
    *   `login/`: Página de autenticação.
    *   `partner/`: Páginas CRUD para parceiros.
    *   `product/`: Páginas CRUD para produtos.
    *   `receivable/`: Páginas relacionadas a contas a receber.
*   `src/components/`: Componentes React reutilizáveis.
    *   `forms/`: Formulários específicos para as entidades.
    *   `ui/`: Componentes de UI genéricos (botões, tabelas, etc.).
*   `src/db/`: Configurações e schemas do banco de dados.
    *   `postgres/schema/`: Definições das tabelas do banco de dados com Drizzle ORM.
    *   `repositories/`: Camada de acesso a dados.
*   `src/services/`: Integração com serviços externos (ex: MinIO).
*   `src/usecases/`: Lógica de negócio da aplicação.
*   `public/`: Arquivos estáticos.
*   `docs/`: Documentação do sistema (esta pasta).

## 5. Próximos Passos (Visão Futura)

Conforme solicitado pelo usuário, o sistema será expandido para incluir:

*   **Portal do Cliente:** Uma interface para os clientes finais da costureira visualizarem produtos e realizarem encomendas.
*   **Pedidos Personalizados:** Funcionalidade para clientes solicitarem produtos personalizados, com envio de descrições e referências.
*   **Aprimoramento da Gestão Financeira:** Maior detalhamento e funcionalidades na gestão financeira, integrando os pedidos do portal.

Esta documentação será atualizada conforme o sistema evolui.
