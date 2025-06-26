---
id: REFAC-STRUCT-014
title: Mover testes de repositórios de `src/db/repositories/` para `src/features/[feature]/db/__tests__/`
description: >
  Com a movimentação dos repositórios para dentro de suas respectivas features
  (conforme tarefas REFAC-STRUCT-004 a REFAC-STRUCT-009), os testes
  associados a esses repositórios também devem ser movidos. Atualmente, podem
  existir testes como `notificationRepository.test.ts` e `userRepository.test.ts`
  em `src/db/repositories/` (ou no novo caminho `src/lib/db-config/repositories/` se
  não foram completamente limpos). Esta tarefa visa mover esses arquivos de teste
  para o subdiretório `__tests__/` dentro do diretório `db/` da feature correspondente
  (ex: `src/features/user/db/__tests__/user-repository.test.ts`).
  O diretório `src/db/repositories/` (ou seu equivalente) deve ser removido se ficar vazio.
status: Concluído
priority: P3
complexity: 1
created_date: 2024-08-07
completion_date: "2024-08-09"
dependencies:
  - AUDIT-001
  - ARCH-DOC-001
  - REFAC-STRUCT-004 # Exemplo, depende de todas as REFAC-STRUCT que movem repositórios
  - REFAC-STRUCT-005
  - REFAC-STRUCT-006
  - REFAC-STRUCT-007
  - REFAC-STRUCT-008
  - REFAC-STRUCT-009
assignee: AgenteJules
tags:
  - refactor
  - structure
  - test
  - database
---

### Critérios de Aceitação:
- Todos os arquivos de teste de repositórios (ex: `*.test.ts`) são movidos de `src/db/repositories/` (ou caminho antigo/intermediário) para `src/features/[nome_da_feature]/db/__tests__/`.
- Os nomes dos arquivos de teste seguem o padrão `kebab-case` (ex: `user-repository.test.ts`).
- Os testes são executados corretamente a partir de seus novos locais.
- O diretório `src/db/repositories/` (ou o que quer que tenha sido o local original desses testes fora das features) é removido se ficar vazio.
- ESLint não reporta erros de caminho relacionados a esta mudança.
