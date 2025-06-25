---
id: "LINT-CFG-001"
title: "Configurar ESLint para Impor o Guia de Estrutura do Projeto"
priority: "P1"
status: "Concluído"
complexity: 3
assigned_to: "AgenteJules"
dependencies:
  - "ARCH-DOC-001"
creation_date: "2024-08-07"
completion_date: "2024-08-07"
tags:
  - "eslint"
  - "linting"
  - "configuração"
  - "qualidade-codigo"
  - "estrutura"
parent_task: null
notes: |
  O objetivo desta tarefa é atualizar a configuração do ESLint (`.eslintrc.json`)
  para que ele valide e ajude a impor as convenções de organização de arquivos e diretórios
  definidas no `docs/project-structure-guide.md`.
  Isso ajudará a manter a consistência da base de código automaticamente.
---

**Descrição Detalhada:**

1.  **Revisar Guia de Estrutura:** Ler atentamente o `docs/project-structure-guide.md` para extrair todas as regras de estrutura que podem ser automatizadas via ESLint.
    *   Nomenclatura de arquivos e diretórios (`kebab-case`).
    *   Localização de tipos de arquivos específicos (ex: repositórios em `features/[feature]/db/`, utilitários em `lib/utils/` ou `features/[feature]/lib/`).
    *   Restrições de import entre módulos/camadas (ex: `app/` não importar diretamente de `db/` de outra feature sem passar por um caso de uso ou action).
2.  **Pesquisar Plugins ESLint:**
    *   Verificar as capacidades do `eslint-plugin-project-structure` (já presente no projeto) e se ele pode cobrir as regras.
    *   Pesquisar outros plugins ESLint que possam ajudar, como:
        *   `eslint-plugin-import` (para regras de import/export, caminhos, etc.).
        *   `eslint-plugin-filenames` ou similar (para convenções de nomenclatura).
        *   Plugins para restringir imports baseados em padrões de diretório.
3.  **Atualizar `.eslintrc.json`:**
    *   Adicionar/configurar os plugins escolhidos.
    *   Definir as regras para corresponder às convenções do guia.
    *   Exemplo de áreas a configurar:
        *   Regras para `eslint-plugin-project-structure` (ajustar `modules` e `allowImportsFrom`).
        *   Regras para `eslint-plugin-import` como `import/no-restricted-paths`.
        *   Regras para nomenclatura de arquivos.
4.  **Testar Configuração:**
    *   Executar `npx eslint . --fix` (ou em arquivos específicos) para ver se as novas regras detectam violações existentes (se houver) ou se passam em código que já está em conformidade.
    *   Criar alguns arquivos de teste temporários que violem as regras para garantir que o ESLint os sinaliza corretamente.
5.  **Documentar Configurações (opcional):** Adicionar comentários no `.eslintrc.json` explicando regras mais complexas.

**Critérios de Aceitação:**
*   O arquivo `.eslintrc.json` é atualizado para incluir regras que reforcem as convenções do `docs/project-structure-guide.md` tanto quanto possível.
*   ESLint consegue identificar violações comuns das regras de estrutura (ex: um arquivo no local errado, um import não permitido).
*   A execução do ESLint no projeto não gera erros inesperados devido à nova configuração (apenas erros de violação de estrutura, se existirem).

**Desafios Potenciais:**
*   Algumas regras de estrutura podem ser difíceis ou impossíveis de impor estaticamente apenas com ESLint.
*   A configuração pode se tornar complexa. Priorizar as regras mais impactantes.
