# Diagrama da Arquitetura do Sistema

Este documento contém um diagrama da arquitetura do sistema de gestão para costureira, incluindo o painel administrativo e o futuro portal do cliente. O diagrama é representado usando a sintaxe do MermaidJS.

## Diagrama

```mermaid
graph TD
    subgraph "Usuários"
        Admin[Costureira/Admin]
        ClienteFinal[Cliente Final]
    end

    subgraph "Frontend (Next.js)"
        AdminPanel[Painel Administrativo (React Components)]
        ClientPortal[Portal do Cliente (React Components)]
    end

    subgraph "Backend (Next.js)"
        ServerActions[Server Actions / API Routes]
        UseCases[Casos de Uso (Lógica de Negócio)]
        Drizzle[Drizzle ORM]
    end

    subgraph "Banco de Dados"
        PostgreSQL[PostgreSQL Database]
    end

    subgraph "Serviços Externos"
        MinIO[MinIO (Armazenamento de Imagens)]
        EmailService[Serviço de Email (Notificações)]
    end

    %% Conexões do Administrador
    Admin -- Acessa --> AdminPanel

    %% Conexões do Cliente Final
    ClienteFinal -- Acessa --> ClientPortal

    %% Interações do Painel Administrativo
    AdminPanel -- Chama (HTTP/RPC) --> ServerActions
    ServerActions -- Invoca --> UseCases

    %% Interações do Portal do Cliente
    ClientPortal -- Chama (HTTP/RPC) --> ServerActions

    %% Lógica de Negócio e Dados
    UseCases -- Manipula --> Drizzle
    Drizzle -- CRUD --> PostgreSQL

    %% Casos de Uso específicos e suas interações
    subgraph "Casos de Uso Detalhados"
        Usecase_Product[Product Use Cases]
        Usecase_Partner[Partner Use Cases]
        Usecase_Financial[Financial Use Cases]
        Usecase_Customer[Customer Use Cases (Novo)]
        Usecase_Order[Order Use Cases (Novo)]
        Usecase_CustomOrder[Custom Order Use Cases (Novo)]
    end

    UseCases --> Usecase_Product
    UseCases --> Usecase_Partner
    UseCases --> Usecase_Financial
    UseCases --> Usecase_Customer
    UseCases --> Usecase_Order
    UseCases --> Usecase_CustomOrder

    %% Interação com MinIO
    Usecase_Product -- Upload/Get URL --> MinIO
    Usecase_CustomOrder -- Upload/Get URL Ref Imgs --> MinIO
    ServerActions -- Gera Presigned URL via --> MinIO

    %% Interação com Serviço de Email (Nova Funcionalidade)
    Usecase_Order -- Envia Notificação --> EmailService
    Usecase_CustomOrder -- Envia Notificação --> EmailService
    Usecase_Customer -- Envia Email Confirmação --> EmailService


    %% Detalhamento das Tabelas Principais (referência)
    PostgreSQL --> T_Product[productTable]
    PostgreSQL --> T_ProductImage[productImageTable]
    PostgreSQL --> T_Partner[partnerTable]
    PostgreSQL --> T_Transaction[transactionTable]
    PostgreSQL --> T_Payment[paymentTable]
    PostgreSQL --> T_Customer[customerTable (Nova)]
    PostgreSQL --> T_CustomerAddress[customerAddressTable (Nova)]
    PostgreSQL --> T_Order[orderTable (Nova)]
    PostgreSQL --> T_OrderItem[orderItemTable (Nova)]
    PostgreSQL --> T_CustomOrderRequest[customOrderRequestTable (Nova)]
    PostgreSQL --> T_CustomOrderRequestImage[customOrderRequestImageTable (Nova)]
    PostgreSQL --> T_Category[categoryTable (Nova, Opcional)]

    %% Relacionamentos entre tabelas (exemplos)
    T_ProductImage -- FK --> T_Product
    T_Payment -- FK --> T_Transaction
    T_Transaction -- FK --> T_Partner
    T_CustomerAddress -- FK --> T_Customer
    T_OrderItem -- FK --> T_Order
    T_Order -- FK --> T_Customer
    T_CustomOrderRequestImage -- FK --> T_CustomOrderRequest
    T_Order -- FK_optional --> T_CustomOrderRequest

    %% Estilização (opcional, para melhor visualização)
    classDef user fill:#D_FL_Lavender,stroke:#333,stroke-width:2px;
    classDef frontend fill:#D_FL_LightCyan,stroke:#333,stroke-width:2px;
    classDef backend fill:#D_FL_PaleGreen,stroke:#333,stroke-width:2px;
    classDef database fill:#D_FL_BlanchedAlmond,stroke:#333,stroke-width:2px;
    classDef service fill:#D_FL_LightGrey,stroke:#333,stroke-width:2px;

    class Admin,ClienteFinal user;
    class AdminPanel,ClientPortal frontend;
    class ServerActions,UseCases,Drizzle backend;
    class PostgreSQL,T_Product,T_ProductImage,T_Partner,T_Transaction,T_Payment,T_Customer,T_CustomerAddress,T_Order,T_OrderItem,T_CustomOrderRequest,T_CustomOrderRequestImage,T_Category database;
    class MinIO,EmailService service;
```

## Explicação do Diagrama

*   **Usuários:**
    *   `Costureira/Admin`: Interage com o Painel Administrativo.
    *   `Cliente Final`: Interage com o Portal do Cliente.

*   **Frontend (Next.js):**
    *   `Painel Administrativo`: Interface para a costureira gerenciar o sistema (produtos, parceiros, finanças, pedidos personalizados).
    *   `Portal do Cliente`: Interface para os clientes visualizarem produtos, fazerem encomendas e solicitarem pedidos personalizados.

*   **Backend (Next.js):**
    *   `Server Actions / API Routes`: Camada que recebe as requisições do frontend. As Server Actions são o método preferido para interações RPC.
    *   `Casos de Uso (Lógica de Negócio)`: Onde a lógica principal do sistema reside. Orquestra as operações, validações e interações com o banco de dados e serviços externos.
    *   `Drizzle ORM`: Ferramenta de mapeamento objeto-relacional para interagir com o banco de dados PostgreSQL.

*   **Banco de Dados:**
    *   `PostgreSQL Database`: Armazena todos os dados persistentes da aplicação (produtos, clientes, pedidos, etc.). As tabelas principais (existentes e novas) são listadas para referência.

*   **Serviços Externos:**
    *   `MinIO`: Utilizado para armazenamento de imagens de produtos e imagens de referência para pedidos personalizados.
    *   `Serviço de Email`: (Nova integração) Necessário para enviar notificações (confirmação de pedido, atualizações de status, orçamentos, etc.).

*   **Fluxos Principais:**
    *   O Admin e o Cliente Final interagem com suas respectivas interfaces no Frontend.
    *   As interfaces do Frontend enviam requisições (via Server Actions ou chamadas de API) para o Backend.
    *   O Backend processa essas requisições através dos Casos de Uso.
    *   Os Casos de Uso utilizam o Drizzle ORM para ler e escrever no banco de dados PostgreSQL.
    *   Os Casos de Uso também interagem com serviços externos como MinIO (para uploads/geração de URLs) e o Serviço de Email (para notificações).

Este diagrama fornece uma visão de alto nível de como os componentes do sistema se conectam e interagem.
