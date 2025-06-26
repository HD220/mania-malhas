---
id: "REFAC-STRUCT-004"
title: "Mover `userRepository` para `src/features/user/db/`"
priority: "P3"
status: "Concluído"
complexity: 1
assigned_to: "AgenteJules"
dependencies: [] # Pode depender da criação da feature `user` se ela não existir
creation_date: "2024-08-07"
completion_date: "2024-08-09"
tags:
  - "refactor"
  - "estrutura"
  - "user"
  - "database"
parent_task: "AUDIT-001"
notes: |
  O `userRepository.ts` e seu teste `userRepository.test.ts` estão atualmente em `src/db/repositories/`.
  Devem ser movidos para a feature `user` em `src/features/user/db/user-repository.ts`
  e `src/features/user/db/user-repository.test.ts` (ou `__tests__/user-repository.test.ts`).
  A feature `user` já existe.
---

**Descrição Detalhada:**

1.  **Criar Estrutura (se necessário):**
    *   Garantir que o diretório `src/features/user/db/` exista.
2.  **Identificar Arquivos:**
    *   Origem: `src/db/repositories/userRepository.ts` e `src/db/repositories/userRepository.test.ts`.
3.  **Mover e Renomear Arquivos:**
    *   Mover `src/db/repositories/userRepository.ts` para `src/features/user/db/user-repository.ts`.
    *   Mover `src/db/repositories/userRepository.test.ts` para `src/features/user/db/user-repository.test.ts` (ou para `__tests__/` subdiretório).
4.  **Atualizar Imports:**
    *   Localizar e atualizar todos os imports para apontar para `@/features/user/db/user-repository`.
    *   Verificar o arquivo `src/db/repositories/index.ts` e remover a exportação do `userRepository` de lá, ou atualizar seu caminho se ele for usado para reexportar de forma controlada (o que é improvável para repositórios).
5.  **Validar:**
    *   Executar ESLint.
    *   Executar `user-repository.test.ts` e outros testes da feature `user`.

**Critérios de Aceitação:**
*   Arquivos `user-repository.ts` e `user-repository.test.ts` estão em `src/features/user/db/`.
*   Imports atualizados.
*   ESLint e testes relevantes passam.
