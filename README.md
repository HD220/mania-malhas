This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Documentação do Sistema

A documentação detalhada sobre a arquitetura, funcionalidades existentes e planejadas do sistema de gestão para costureira pode ser encontrada na pasta [`docs/`](./docs/).

*   **Visão Geral do Sistema:**
    *   [`docs/SYSTEM_OVERVIEW.md`](./docs/SYSTEM_OVERVIEW.md): Descreve a arquitetura geral, tecnologias utilizadas e as funcionalidades atuais do sistema.
*   **Funcionalidades Existentes:**
    *   [`docs/PRODUCT_FEATURE.md`](./docs/PRODUCT_FEATURE.md): Detalhes sobre o gerenciamento de produtos, incluindo estrutura de dados, fluxos de usuário e casos de uso.
    *   [`docs/PARTNER_FEATURE.md`](./docs/PARTNER_FEATURE.md): Detalhes sobre o gerenciamento de parceiros.
    *   [`docs/FINANCIAL_FEATURE.md`](./docs/FINANCIAL_FEATURE.md): Detalhes sobre a base do sistema de gerenciamento financeiro.
    *   [`docs/AUTHENTICATION.md`](./docs/AUTHENTICATION.md): Informações sobre o sistema de autenticação do painel administrativo.
    *   [`docs/SERVICES_INTEGRATION.md`](./docs/SERVICES_INTEGRATION.md): Descreve a integração com serviços externos, como o MinIO para armazenamento de imagens.
*   **Novas Funcionalidades Planejadas:**
    *   [`docs/NEW_FEATURES_SPECIFICATION.md`](./docs/NEW_FEATURES_SPECIFICATION.md): Especificações para o Portal do Cliente e a funcionalidade de Pedidos Personalizados, incluindo requisitos, novas entidades no banco de dados, e fluxos.
*   **API e Arquitetura:**
    *   [`docs/API_DOCUMENTATION.md`](./docs/API_DOCUMENTATION.md): Documentação da API interna do sistema, baseada nos casos de uso.
    *   [`docs/ARCHITECTURE_DIAGRAM.md`](./docs/ARCHITECTURE_DIAGRAM.md): Diagrama da arquitetura do sistema em formato MermaidJS.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Running Tests

This project uses [Vitest](https://vitest.dev/) for unit and integration testing.

To run all tests:
```bash
npm test
```

To run tests in watch mode:
```bash
npm test -- --watch
```
(Or `vitest` directly if installed globally or via npx)

To run tests with a UI (opens in browser):
```bash
npm run test:ui
```

To generate a coverage report (output in `./coverage` directory):
```bash
npm run coverage
```
