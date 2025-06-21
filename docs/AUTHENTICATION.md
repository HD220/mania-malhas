# Documentação da Funcionalidade: Autenticação

## 1. Propósito

A funcionalidade de Autenticação visa proteger o acesso ao painel administrativo do sistema, garantindo que apenas usuários autorizados (neste caso, a costureira) possam acessar e gerenciar as informações de produtos, parceiros, finanças e outras configurações do sistema.

## 2. Evidências da Funcionalidade

*   **Página de Login:** A existência da rota e página `src/app/login/page.tsx` é a principal evidência de um sistema de autenticação.
*   **Formulário de Login:** O componente `src/components/forms/login-form.tsx` indica que existe uma interface dedicada para o usuário inserir suas credenciais.

## 3. Fluxo de Usuário Esperado

1.  O usuário tenta acessar uma rota protegida do painel administrativo.
2.  Se não estiver autenticado, é redirecionado para a página de login (`/login`).
3.  Na página de login, o usuário insere suas credenciais (geralmente email/nome de usuário e senha).
4.  O `login-form.tsx` submete essas credenciais para um endpoint de API ou Server Action.
5.  O backend verifica as credenciais contra um banco de dados de usuários ou outro mecanismo de autenticação.
6.  **Se as credenciais forem válidas:**
    *   Uma sessão de usuário é criada (ex: usando cookies seguros, tokens JWT).
    *   O usuário é redirecionado para a página solicitada inicialmente ou para um dashboard principal.
7.  **Se as credenciais forem inválidas:**
    *   Uma mensagem de erro é exibida no formulário de login.

## 4. Componentes e Arquivos Chave

*   `src/app/login/page.tsx`: A página que renderiza o formulário de login.
*   `src/components/forms/login-form.tsx`: O componente React que define a estrutura e o comportamento do formulário de login.
*   `src/app/layout.tsx` ou middlewares: Podem conter lógica para verificar o status de autenticação do usuário e proteger rotas.

## 5. Mecanismo de Autenticação (Suposições)

O mecanismo exato de autenticação não está totalmente detalhado nos arquivos visíveis, mas algumas abordagens comuns em aplicações Next.js incluem:

*   **NextAuth.js (Auth.js):** Uma biblioteca popular e completa para adicionar autenticação a aplicações Next.js. Ela suporta diversos provedores (OAuth, email/senha, etc.) e gerencia sessões. A presença de um arquivo como `src/app/api/auth/[...nextauth]/route.ts` indicaria seu uso.
*   **Autenticação customizada com JWT e Cookies:** Uma implementação manual onde o backend gera um JSON Web Token (JWT) após o login bem-sucedido e o armazena em um cookie HTTP seguro. Middleware verificaria esse token em cada requisição a rotas protegidas.
*   **Server Actions com Cookies de Sessão:** Com as Server Actions do Next.js, a lógica de login pode definir um cookie de sessão seguro diretamente.

**Nota:** Não há uma tabela de `user` visível nos schemas do Drizzle (`src/db/postgres/schema/`). Isso pode significar algumas coisas:
1.  A tabela de usuários existe, mas não foi listada anteriormente ou está em um arquivo de schema diferente (menos provável dado o padrão).
2.  A autenticação pode estar sendo gerenciada por um serviço externo (ex: Firebase Auth, Auth0) e o sistema apenas consome o status da autenticação.
3.  Pode haver um único usuário "admin" com credenciais configuradas via variáveis de ambiente, especialmente se for um painel para uma única pessoa (a costureira). Esta é uma hipótese plausível para simplificar.

## 6. Rotas Protegidas

Espera-se que todas as rotas do painel administrativo, exceto `/login` e possivelmente rotas públicas do futuro portal do cliente, sejam protegidas. Isso inclui:
*   `/partner/*`
*   `/product/*`
*   `/receivable/*`
*   A página inicial do admin (`/` ou `/dashboard`)

## 7. Considerações de Segurança

*   **Senhas:** Se senhas estiverem sendo armazenadas, devem ser hasheadas usando algoritmos fortes (ex: bcrypt, Argon2).
*   **Gerenciamento de Sessão:** Sessões devem ser gerenciadas de forma segura, utilizando cookies `HttpOnly`, `Secure`, e `SameSite`, e com tempos de expiração adequados.
*   **Proteção contra Ataques Comuns:** Medidas contra CSRF, XSS devem estar implementadas (Next.js oferece algumas proteções por padrão).

## 8. Desenvolvimento Futuro (Portal do Cliente)

Quando o portal do cliente for implementado, pode ser necessário um sistema de autenticação separado ou uma extensão do sistema atual para os clientes, com funcionalidades como registro, login e recuperação de senha para clientes.

Esta documentação será atualizada conforme mais detalhes sobre a implementação da autenticação forem descobertos ou definidos.
