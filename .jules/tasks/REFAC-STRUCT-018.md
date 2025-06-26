---
id: REFAC-STRUCT-018
title: Mover `src/styles/globals.css` para `src/globals.css` e tratar `globals_default.css`
description: >
  Conforme o `docs/project-structure-guide.md`, o arquivo global de estilos
  (`globals.css`) deve estar localizado na raiz do diretório `src/`. Atualmente,
  ele está em `src/styles/globals.css`. Além disso, existe um arquivo
  `src/styles/globals_default.css` cuja finalidade precisa ser avaliada;
  ele pode ser um backup, uma versão antiga ou estilos que deveriam ser
  mesclados ou removidos.
  Esta tarefa envolve mover `globals.css` para o local correto, analisar
  `globals_default.css`, e mesclar seu conteúdo relevante em `src/globals.css`
  ou removê-lo se for supérfluo. O diretório `src/styles/` deve ser removido
  se ficar vazio.
status: Concluído
priority: P3
complexity: 1
created_date: 2024-08-07
completion_date: "2024-08-09"
dependencies:
  - AUDIT-001
  - ARCH-DOC-001
assignee: AgenteJules
tags:
  - refactor
  - structure
  - styles
  - css
---

### Critérios de Aceitação:
- O arquivo `src/styles/globals.css` é movido para `src/globals.css`.
- O arquivo `src/styles/globals_default.css` é analisado:
    - Se contiver estilos úteis e não duplicados, eles são mesclados em `src/globals.css`.
    - Se for supérfluo, obsoleto ou um backup desnecessário, é removido.
- Todos os imports ou referências ao `globals.css` no código (provavelmente no arquivo de layout principal, ex: `src/app/layout.tsx`) são atualizados para o novo caminho.
- O diretório `src/styles/` é removido se estas ações o deixarem vazio.
- A aplicação compila e os estilos globais são aplicados corretamente.
- ESLint não reporta erros de caminho.
