# Documentação: Integração com Serviços Externos

Este documento detalha a integração do sistema com serviços externos, focando principalmente no MinIO para armazenamento de objetos.

## 1. MinIO - Armazenamento de Imagens de Produtos

### 1.1. Propósito

O [MinIO](https://min.io/) é um serviço de armazenamento de objetos de alto desempenho, compatível com a API do Amazon S3. No contexto deste sistema, o MinIO é utilizado para armazenar as imagens dos produtos cadastrados pela costureira. Isso desacopla o armazenamento de arquivos binários da aplicação principal e do banco de dados relacional, o que é uma prática recomendada.

### 1.2. Configuração e Arquivos Chave

*   **Cliente MinIO:**
    *   `src/services/minio.ts`: Este arquivo contém a configuração do cliente MinIO. Ele inicializa o cliente com as credenciais necessárias (endpoint, access key, secret key) para se conectar ao servidor MinIO. Essas credenciais são geralmente carregadas a partir de variáveis de ambiente por segurança.
*   **Variáveis de Ambiente:**
    *   `.env.exemple`: Este arquivo provavelmente lista as variáveis de ambiente necessárias para a configuração do MinIO, como `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET_NAME`, `MINIO_USE_SSL` (ou `MINIO_PORT`).

### 1.3. Interação com a Funcionalidade de Produtos

*   **Upload de Imagens:**
    *   Quando a costureira adiciona ou edita um produto e faz o upload de novas imagens através do formulário de produto (ex: `src/components/forms/product-form/product-form.tsx` utilizando `src/components/ui/dropzone-image-carousel.tsx`), a aplicação interage com o MinIO.
    *   **`src/usecases/product/getUrlUploadUseCase.ts`**: Este caso de uso é crucial. Ele provavelmente é responsável por:
        1.  Comunicar-se com o MinIO (através do cliente em `minio.ts`) para gerar uma **URL pré-assinada (presigned URL)**.
        2.  Esta URL pré-assinada concede permissão temporária e limitada para o frontend (navegador do usuário) fazer o upload direto do arquivo da imagem para um bucket específico no MinIO. Isso evita que o arquivo precise passar pelo servidor da aplicação, economizando recursos e sendo mais eficiente.
    *   O frontend, ao receber a URL pré-assinada, realiza o upload do arquivo diretamente para o MinIO.
*   **Armazenamento de Metadados:**
    *   Após o upload bem-sucedido, a URL pública ou o identificador do objeto no MinIO (juntamente com outros metadados como nome do arquivo) é salvo na tabela `productImage` (`src/db/postgres/schema/productImage.ts`), no campo `url`.
*   **Exibição de Imagens:**
    *   Para exibir as imagens dos produtos na aplicação (seja no painel administrativo ou no futuro portal do cliente), o sistema utiliza as URLs armazenadas no campo `productImage.url`. Essas URLs apontam diretamente para os objetos no MinIO.

### 1.4. Bucket MinIO

*   Espera-se que haja um bucket dedicado no servidor MinIO para armazenar as imagens dos produtos deste sistema. O nome deste bucket é configurado via variável de ambiente.
*   As políticas de acesso do bucket devem ser configuradas para permitir que as URLs públicas das imagens sejam acessíveis para leitura pela aplicação e pelos usuários, enquanto o upload é controlado por URLs pré-assinadas.

### 1.5. Considerações

*   **Segurança:** O uso de URLs pré-assinadas para uploads é uma boa prática de segurança, pois as credenciais principais do MinIO não são expostas ao frontend.
*   **Gerenciamento de Erros:** A aplicação deve tratar possíveis erros durante o processo de upload (falhas de conexão, bucket não encontrado, etc.).
*   **Exclusão de Imagens:** Quando uma imagem de produto é removida no sistema, deve haver uma lógica correspondente para excluir o objeto do bucket MinIO para evitar o acúmulo de arquivos órfãos. Isso pode ser tratado por um caso de uso específico ou dentro do `alterProductUseCase.ts`.

## 2. Outros Serviços (Potenciais Futuros)

Atualmente, o MinIO é o principal serviço externo explicitamente integrado. No futuro, outras integrações podem ser consideradas:

*   **Serviços de Email:** Para notificações (ex: confirmação de pedido, redefinição de senha).
*   **Gateways de Pagamento:** Para processar pagamentos online no portal do cliente.
*   **Serviços de Análise (Analytics):** Para rastrear o uso do portal do cliente.

Esta documentação será atualizada se novas integrações de serviços forem adicionadas.
