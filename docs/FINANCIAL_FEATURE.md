# Documentação da Funcionalidade: Gerenciamento Financeiro (Base)

## 1. Propósito

A funcionalidade de Gerenciamento Financeiro, em seu estado atual, fornece as bases para que a costureira (administradora do sistema) possa registrar e acompanhar as transações financeiras e pagamentos relacionados ao seu negócio. O objetivo é ter um controle sobre entradas e saídas de dinheiro, associando-as, quando pertinente, a parceiros.

Esta funcionalidade é fundamental e será expandida para integrar com o portal do cliente e os pedidos personalizados.

## 2. Estrutura de Dados

As informações financeiras são armazenadas principalmente em duas tabelas no banco de dados PostgreSQL, gerenciadas pelo Drizzle ORM:

### 2.1. Tabela `transaction` (`transactionTable`)

*   **Schema:** `src/db/postgres/schema/transaction.ts`
*   **Campos Principais:**
    *   `id` (UUID): Identificador único da transação.
    *   `partnerId` (UUID): Chave estrangeira referenciando `partner.id`. Permite associar a transação a um parceiro (ex: despesa com fornecedor, receita de um cliente/parceiro específico). (Obrigatório)
    *   `description` (VARCHAR(100)): Descrição da transação.
    *   `type` (CHAR(1)): Tipo da transação. ("E" para Entrada/Receita, "S" para Saída/Despesa). (Obrigatório)
    *   `value` (DECIMAL(16,7)): Valor total da transação. (Obrigatório)
    *   `date` (TIMESTAMP): Data em que a transação ocorreu ou foi registrada. (Padrão: Data atual)
    *   `due_date` (TIMESTAMP): Data de vencimento da transação (relevante para contas a pagar/receber). (Padrão: Data atual)
    *   `transactionId` (UUID): Auto-referência à própria tabela `transaction.id`. Pode ser usado para agrupar transações relacionadas, como parcelas de uma compra/venda maior, onde uma transação principal aponta para suas parcelas ou vice-versa.
    *   `createdAt` (TIMESTAMP): Data e hora de criação do registro.
    *   `updatedAt` (TIMESTAMP): Data e hora da última atualização do registro.

### 2.2. Tabela `payment` (`paymentTable`)

*   **Schema:** `src/db/postgres/schema/payment.ts`
*   **Campos Principais:**
    *   `id` (UUID): Identificador único do pagamento.
    *   `transactionId` (UUID): Chave estrangeira referenciando `transaction.id`. Indica a qual transação este pagamento pertence. (Obrigatório)
    *   `value` (DECIMAL(16,7)): Valor do pagamento efetuado. (Obrigatório)
    *   `date` (TIMESTAMP): Data em que o pagamento foi realizado. (Padrão: Data atual)
    *   `createdAt` (TIMESTAMP): Data e hora de criação do registro.
    *   `updatedAt` (TIMESTAMP): Data e hora da última atualização do registro.
*   **Relacionamento:** Uma relação de um-para-muitos entre `transaction` e `payment` (uma transação pode ter vários pagamentos parciais até ser quitada).

## 3. Fluxos de Usuário (Painel Administrativo)

*   **Listagem de Contas a Receber (Inferido):**
    *   **Rota:** `src/app/receivable/list/page.tsx`
    *   **Descrição:** Esta página sugere a existência de uma interface para visualizar transações que representam valores a serem recebidos pela costureira. Provavelmente filtra as transações do tipo "E" (Entrada) que ainda não foram totalmente pagas (comparando `transaction.value` com a soma dos `payment.value` associados).
    *   **Ações:** Poderia permitir registrar pagamentos recebidos, visualizar detalhes da transação.

*   **Criação e Gerenciamento de Transações (Não explicitamente visível, mas fundamental):**
    *   Embora não haja rotas diretas como `/transaction/new` visíveis na estrutura de pastas `src/app`, a existência das tabelas `transaction` e `payment`, juntamente com o repositório `billRepository.ts` (que pode ser um nome legado ou abranger transações/pagamentos), implica que há mecanismos para criar e gerenciar essas transações.
    *   Essas operações podem estar integradas em outras partes do sistema (ex: ao registrar uma venda de produto, uma transação de entrada é criada) ou podem ser gerenciadas através de uma interface administrativa ainda não totalmente mapeada.

## 4. Componentes de UI Relevantes

*   `src/components/ui/data-table.tsx`: Provavelmente utilizado para exibir a lista de contas a receber e outras listas financeiras.
*   Formulários para registrar novas transações e pagamentos (ainda não localizados especificamente, mas necessários para a funcionalidade).

## 5. Repositórios e Casos de Uso

*   **Repositório:**
    *   `src/db/repositories/billRepository.ts`: Este repositório provavelmente lida com as operações de banco de dados para as tabelas `transactionTable` e `paymentTable`. O nome "Bill" pode ser um termo genérico usado para abranger faturas, contas a pagar/receber.
*   **Casos de Uso (Inferido):**
    *   Ainda não foram explicitamente listados casos de uso como `createTransactionUseCase` em `src/usecases/`. No entanto, para uma funcionalidade financeira robusta, eles seriam necessários para:
        *   Criar, ler, atualizar e deletar transações.
        *   Registrar pagamentos para transações.
        *   Calcular saldos devedores/credores.
        *   Gerar relatórios financeiros básicos.

## 6. Integração com Outras Funcionalidades

*   **Parceiros:** As transações podem ser diretamente associadas a parceiros, permitindo rastrear despesas com fornecedores ou receitas de clientes específicos.
*   **Produtos (Futuro):** Quando um produto for vendido (especialmente através do futuro portal do cliente), uma transação de "Entrada" deverá ser gerada automaticamente.

## 7. Considerações Atuais e Futuras

*   **Estado Atual:** A base de dados para o gerenciamento financeiro está bem estruturada. A funcionalidade de "Contas a Receber" parece ser o primeiro passo na visualização desses dados.
*   **Desenvolvimento Futuro:**
    *   **Interface Completa:** Serão necessárias interfaces de usuário (formulários, tabelas, dashboards) mais completas para gerenciar todas as transações (entradas e saídas), registrar pagamentos de forma eficiente e visualizar o status financeiro.
    *   **Relatórios:** Funcionalidades de relatórios (fluxo de caixa, despesas por categoria, etc.) seriam adições valiosas.
    *   **Categorização:** Adicionar um campo de categoria às transações ajudaria na organização e análise financeira.
    *   **Conciliação Bancária:** Em um estágio mais avançado, funcionalidades de conciliação poderiam ser consideradas.
*   **Segurança:** O acesso a informações financeiras deve ser estritamente controlado por autenticação e, possivelmente, por níveis de permissão.

Esta documentação reflete a compreensão atual da base financeira do sistema. Conforme novas funcionalidades são desenvolvidas, este documento será atualizado.
