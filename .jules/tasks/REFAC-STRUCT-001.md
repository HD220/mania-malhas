---
id: "REFAC-STRUCT-001"
title: "Mover `login-form.tsx` para `src/features/auth/components/`"
priority: "P3"
status: "Pendente"
complexity: 1
assigned_to: "AgenteJules"
dependencies: [] # Pode depender de AUDIT-001 se formalmente rastreado
creation_date: "2024-08-07"
completion_date: ""
tags:
  - "refactor"
  - "estrutura"
  - "auth"
  - "frontend"
parent_task: "AUDIT-001" # Tarefa mãe que originou esta
notes: |
  O componente `login-form.tsx` atualmente reside em `src/components/forms/`.
  Ele deve ser movido para dentro de uma nova feature `auth` em `src/features/auth/components/`.
  Esta tarefa inclui a criação da estrutura de diretórios para a feature `auth` se ela não existir.
---

**Descrição Detalhada:**

1.  **Criar Estrutura da Feature (se necessário):**
    *   Verificar se o diretório `src/features/auth/components/` existe.
    *   Se não existir, criar `src/features/auth/` e `src/features/auth/components/`.
2.  **Identificar Arquivo:**
    *   O arquivo a ser movido é `src/components/forms/login-form.tsx`.
3.  **Mover Arquivo:**
    *   Mover `src/components/forms/login-form.tsx` para `src/features/auth/components/login-form.tsx`.
4.  **Atualizar Imports:**
    *   Identificar todos os locais no código onde `login-form.tsx` é importado.
    *   Atualizar os caminhos de import para apontar para o novo local (`@/features/auth/components/login-form`).
5.  **Validar:**
    *   Executar ESLint para verificar erros de import ou outros problemas de linting.
    *   Executar testes (se houver testes de UI que cubram o formulário de login) para garantir que a funcionalidade não foi quebrada.
    *   Testar manualmente a funcionalidade de login na aplicação.

**Critérios de Aceitação:**
*   O diretório `src/features/auth/components/` existe.
*   O arquivo `login-form.tsx` está localizado em `src/features/auth/components/login-form.tsx`.
*   Todos os imports para `login-form.tsx` estão atualizados e corretos.
*   ESLint passa sem erros relacionados ao arquivo movido ou seus imports.
*   A funcionalidade de login continua operando como esperado.
