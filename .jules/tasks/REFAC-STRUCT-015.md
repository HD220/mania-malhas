---
id: REFAC-STRUCT-015
title: Padronizar nomes de arquivos em `src/features/` para `kebab-case`
description: >
  O `docs/project-structure-guide.md` especifica que os nomes de arquivos devem
  seguir o padrão `kebab-case` (ex: `meu-arquivo.ts`). Esta tarefa consiste em
  auditar todos os arquivos dentro dos subdiretórios de `src/features/[nome_da_feature]/`
  (como `actions/`, `components/`, `db/`, `schemas/`, `usecases/`, `lib/`, `types/`, etc.)
  e renomear qualquer arquivo que não esteja em `kebab-case`. Por exemplo,
  `myActions.ts` se tornaria `my-actions.ts` ou, preferencialmente,
  `[feature-name].actions.ts` se tornaria `[feature-name].actions.ts` (se já não estiver assim)
  ou `user-profile.component.tsx` em vez de `UserProfile.tsx`.
  Deve-se dar atenção especial a manter a semântica do nome do arquivo,
  como por exemplo, incluir o nome da feature no arquivo para evitar colisões e
  melhorar a clareza (ex: `auth.actions.ts` em vez de apenas `actions.ts` dentro de `src/features/auth/actions/`).
status: Pendente
priority: P3
complexity: 2
created_date: 2024-08-07
due_date:
dependencies:
  - AUDIT-001
  - ARCH-DOC-001
assignee: AgenteJules
tags:
  - refactor
  - structure
  - naming-convention
  - features
---

### Critérios de Aceitação:
- Todos os arquivos e diretórios (onde aplicável, embora diretórios geralmente sigam o mesmo padrão ou um padrão específico como `__tests__`) dentro de `src/features/[nome_da_feature]/` e seus subdiretórios são nomeados usando `kebab-case`.
- Os nomes dos arquivos são descritivos e, quando apropriado, prefixados ou sufixados com o nome da feature ou tipo de módulo (ex: `payment.schemas.ts`, `user-card.component.tsx`).
- Todos os imports e referências a esses arquivos no código são atualizados para refletir os novos nomes.
- A aplicação compila e funciona como esperado após as renomeações.
- ESLint não reporta erros relacionados a nomes de arquivos ou caminhos quebrados devido à renomeação.

### Notas Adicionais:
- A complexidade é 2 porque pode envolver um número significativo de arquivos e requer cuidado para atualizar todos os imports.
- Pode ser útil usar ferramentas de busca e substituição em todo o projeto, mas com cautela.
- Considerar se a regra ESLint `unicorn/filename-case` (se configurada e funcionando) pode ajudar a identificar ou corrigir isso. Se não, esta tarefa é manual.
