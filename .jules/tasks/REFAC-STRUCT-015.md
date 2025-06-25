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
status: Subdividido
priority: P3
complexity: 2
created_date: 2024-08-07
due_date:
completion_date: 2024-08-08 # Data do desmembramento
dependencies:
  - AUDIT-001
  - ARCH-DOC-001
assignee: AgenteJules
tags:
  - refactor
  - structure
  - naming-convention
  - features
  - meta-tarefa
---

### Critérios de Aceitação Originais (Agora cobertos pelas sub-tarefas):
- Todos os arquivos e diretórios dentro de `src/features/[nome_da_feature]/` e seus subdiretórios são nomeados usando `kebab-case`.
- Os nomes dos arquivos são descritivos e, quando apropriado, prefixados ou sufixados com o nome da feature ou tipo de módulo.
- Todos os imports e referências a esses arquivos no código são atualizados.
- A aplicação compila e funciona como esperado após as renomeações.
- ESLint não reporta erros.

### Sub-tarefas Criadas:
Esta tarefa foi desmembrada nas seguintes sub-tarefas, uma para cada feature principal:
- `REFAC-STRUCT-015.1`: Padronizar nomes de arquivos em `src/features/dashboard/`.
- `REFAC-STRUCT-015.2`: Padronizar nomes de arquivos em `src/features/notification/`.
- `REFAC-STRUCT-015.3`: Padronizar nomes de arquivos em `src/features/partner/`.
- `REFAC-STRUCT-015.4`: Padronizar nomes de arquivos em `src/features/payment/`.
- `REFAC-STRUCT-015.5`: Padronizar nomes de arquivos em `src/features/product/`.
- `REFAC-STRUCT-015.6`: Padronizar nomes de arquivos em `src/features/transaction/`.
- `REFAC-STRUCT-015.7`: Padronizar nomes de arquivos em `src/features/user/`.

### Notas Adicionais:
- A complexidade original era 2. Foi desmembrada em tarefas de complexidade 1 para cada feature.
- Ferramentas de busca e substituição em todo o projeto serão úteis, mas devem ser usadas com cautela para atualizar os imports.
- A regra ESLint `unicorn/filename-case` (se configurada) pode auxiliar na identificação, mas a correção e atualização de imports ainda será manual por sub-tarefa.
