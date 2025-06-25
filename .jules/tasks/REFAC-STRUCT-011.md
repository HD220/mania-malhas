---
id: "REFAC-STRUCT-011"
title: "Mover cliente MinIO de `src/services/` para `src/lib/clients/`"
priority: "P3"
status: "Pendente"
complexity: 1
assigned_to: "AgenteJules"
dependencies: []
creation_date: "2024-08-07"
completion_date: ""
tags:
  - "refactor"
  - "estrutura"
  - "lib"
  - "clients"
  - "minio"
parent_task: "AUDIT-001"
notes: |
  O cliente MinIO (`minio.ts` e `minio.test.ts`) está em `src/services/`.
  Deve ser movido para `src/lib/clients/` e renomeado para `minio.client.ts` (e teste correspondente)
  para seguir a convenção de nomenclatura e a nova estrutura de `lib`.
---

**Descrição Detalhada:**

1.  **Garantir Estrutura:**
    *   Criar `src/lib/clients/` se não existir.
2.  **Identificar Arquivos:**
    *   Origem: `src/services/minio.ts` e `src/services/minio.test.ts`.
3.  **Mover e Renomear Arquivos:**
    *   Mover `src/services/minio.ts` para `src/lib/clients/minio.client.ts`.
    *   Mover `src/services/minio.test.ts` para `src/lib/clients/minio.client.test.ts`.
4.  **Atualizar Imports:**
    *   Atualizar todos os imports para `@/lib/clients/minio.client`.
5.  **Validar:**
    *   ESLint e testes relevantes.

**Critérios de Aceitação:**
*   Arquivos do cliente MinIO movidos e renomeados para `src/lib/clients/`.
*   Imports atualizados.
*   ESLint e testes passam.
