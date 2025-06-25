---
id: REFAC-STRUCT-017
title: Mover `src/services/minio.ts` e teste para `src/lib/minio-service/`
description: >
  O `docs/project-structure-guide.md` estabelece que o diretório `src/services/`
  deve ser evitado para configurações de serviços de terceiros. Em vez disso,
  tais configurações e clientes de serviço devem residir em subdiretórios de `src/lib/`,
  como `src/lib/config-services/` ou um diretório específico para o serviço,
  como `src/lib/minio-service/`.
  Esta tarefa envolve mover `src/services/minio.ts` e seu arquivo de teste
  associado (`minio.test.ts`) para um novo local, por exemplo,
  `src/lib/minio-service/minio.ts` e `src/lib/minio-service/__tests__/minio.test.ts`.
  Os nomes dos arquivos devem ser mantidos ou convertidos para `kebab-case` conforme
  a convenção. Todos os imports devem ser atualizados.
status: Pendente
priority: P3
complexity: 1
created_date: 2024-08-07
due_date:
dependencies:
  - AUDIT-001
  - ARCH-DOC-001
assignee: AgenteJules
tags:
  - refactor
  - structure
  - lib
  - services
---

### Critérios de Aceitação:
- O arquivo `src/services/minio.ts` é movido para `src/lib/minio-service/minio.ts` (ou um caminho similar em `src/lib/`).
- O arquivo `src/services/minio.test.ts` é movido para `src/lib/minio-service/__tests__/minio.test.ts` (ou local de teste correspondente).
- Os nomes dos arquivos são convertidos para `kebab-case` se ainda não estiverem (ex: `minio.ts` já está).
- O diretório `src/services/` é removido se ficar vazio após esta e outras movimentações.
- Todos os imports no código que referenciam os caminhos antigos são atualizados.
- A aplicação compila e os testes relacionados ao serviço MinIO passam.
- ESLint não reporta erros de caminho.
