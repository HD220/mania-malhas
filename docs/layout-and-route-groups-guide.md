# Guia de Layouts e Route Groups no Next.js

Este documento fornece diretrizes e melhores práticas para o uso de layouts e Route Groups no projeto Mania Malhas Web App, utilizando o App Router do Next.js. Ele complementa o `project-structure-guide.md`.

## 1. Visão Geral da Estratégia de Layout

O projeto utiliza uma abordagem de múltiplos layouts para diferentes seções da aplicação, aproveitando os Route Groups do Next.js. As principais seções com layouts distintos são:

*   `(marketing)`: Para páginas públicas e de marketing.
*   `(auth)`: Para páginas de autenticação (login, registro, etc.), geralmente com layout minimalista.
*   `(admin)`: Para o painel administrativo.
*   `(main_app)`: Para a aplicação principal acessada por usuários logados.

Um `app/layout.tsx` global (RootLayout) envolve todas as seções e é responsável por:
*   Estrutura HTML (`<html>`, `<body>`).
*   Provedores globais (ex: `ThemeProvider` para temas).
*   Carregamento de fontes globais (ex: Inter).
*   Inclusão de componentes globais como `Toaster` para notificações.
*   Carregamento do `globals.css`.

## 2. Route Groups `(pasta)`

### 2.1. Propósito e Uso
*   **Organização:** Route Groups (pastas com nomes entre parênteses, ex: `(marketing)`) são usados para organizar rotas em seções lógicas sem afetar o caminho da URL.
*   **Layouts Dedicados:** O principal uso no projeto é para aplicar um `layout.tsx` específico a um conjunto de rotas. Cada um dos grupos mencionados acima (`(marketing)`, `(admin)`, etc.) possui seu próprio `layout.tsx` que define a estrutura visual e componentes persistentes para aquela seção.

### 2.2. Múltiplos Layouts Raiz de Grupo
*   Cada `layout.tsx` dentro de um route group no nível superior de `app/` (ex: `app/(marketing)/layout.tsx`) atua como um layout raiz para as rotas dentro desse grupo.
*   **Comportamento de Navegação:** Ao navegar entre rotas que pertencem a diferentes grupos com layouts raiz distintos (ex: de `/sobre` em `(marketing)` para `/dashboard` em `(admin)`), o Next.js realizará uma **recarga completa da página (full page reload)**.
    *   **Impacto na UX:** Isso significa que o estado da aplicação no lado do cliente (estado React, etc.) será perdido. A transição pode ser percebida como mais lenta do que uma navegação SPA típica.
    *   **Mitigação:** Para melhorar a percepção do usuário durante essas transições, foram implementados arquivos `loading.tsx` em cada um dos principais route groups. Estes arquivos exibem um esqueleto de UI (skeleton) imediatamente enquanto a próxima rota e seus dados são carregados.
    *   **Frequência:** O impacto negativo é maior para transições frequentes. Para transições infrequentes (ex: marketing -> login), geralmente é aceitável.

### 2.3. Nomenclatura e Organização
*   Os nomes dos route groups devem ser descritivos do seu propósito (ex: `(marketing)`, `(admin)`).
*   Manter a estrutura interna de cada grupo consistente com o guia principal de estrutura do projeto.

## 3. Gerenciamento de CSS com Múltiplos Layouts

### 3.1. `globals.css`
*   O arquivo `src/globals.css` é carregado pelo `app/layout.tsx` (RootLayout) e seus estilos são aplicados globalmente.
*   **Diretriz:** `globals.css` deve ser usado **apenas** para estilos verdadeiramente globais, resets básicos, ou variáveis CSS que se aplicam a toda a aplicação. Evitar estilos em `globals.css` que sejam específicos de uma seção ou que possam conflitar entre diferentes layouts de grupo.

### 3.2. Estilos Específicos de Seção/Layout
*   Estilos que são específicos para um layout de grupo de rota (ex: para o `MarketingHeader`) devem ser definidos usando:
    *   **Classes Tailwind:** Diretamente nos componentes JSX.
    *   **CSS Modules:** Criando arquivos `[NomeComponente].module.css` para componentes de layout específicos.
    *   **Componentes Estilizados (se aplicável):** Se uma biblioteca de CSS-in-JS for usada (atualmente não é o foco principal).
*   **Vazamento de CSS Global (Issue #58597 Next.js):** Há um problema conhecido no Next.js onde CSS global pode, em certos cenários, não ser perfeitamente limpo ao transitar entre layouts raiz de grupo.
    *   **Mitigação no Projeto:** A recarga completa da página parece mitigar o vazamento de estilos aplicados diretamente aos elementos DOM dos layouts. A principal forma de evitar problemas é seguir a diretriz sobre `globals.css` e escopar rigorosamente os estilos específicos de seção. A investigação (C01.3.1) concluiu que o risco atual no projeto é baixo com as práticas adotadas.

## 4. Considerações de Performance e UX
*   **`loading.tsx`:** Utilizar `loading.tsx` em cada route group com layout próprio para fornecer feedback visual durante o carregamento da rota. Os esqueletos devem mimetizar a estrutura do layout da seção para uma melhor experiência.
*   **Pré-carregamento (`next/link`):** O componente `next/link` realiza pré-carregamento por padrão, o que ajuda a acelerar as transições, mesmo aquelas que resultam em recargas completas, pois os assets da próxima página podem já estar cacheados. Manter o uso de `<Link>` para navegação interna.
*   **Avaliação Contínua:** O impacto do "full page reload" deve ser monitorado à medida que a aplicação cresce e os fluxos de usuário evoluem. Se se tornar um gargalo significativo para a UX em transições frequentes, estratégias mais avançadas de otimização ou uma revisão da arquitetura de layout podem ser necessárias (conforme explorado em C01.3.4).

## 5. Boas Práticas
*   **Layouts Aninhados:** Dentro de um route group, layouts podem ser aninhados normalmente para compartilhar UI entre sub-rotas.
*   **Consistência:** Manter a estrutura e a abordagem de layout consistentes dentro de cada seção.
*   **Componentes de Layout Reutilizáveis:** Abstrair componentes de UI de layout comuns (headers, footers, sidebars específicos) em `src/components/layout/` ou, se muito específicos de uma feature, em `src/features/[nome_feature]/components/layout/`.

Este guia deve ser consultado ao implementar novos layouts ou modificar a estrutura de rotas e layouts existentes.
