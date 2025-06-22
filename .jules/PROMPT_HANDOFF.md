# Template para Continuidade de Trabalho / Passagem de Contexto

Este template deve ser usado para documentar o estado atual de uma tarefa ao final de uma sessão de trabalho, ao encontrar um bloqueio, ou ao passar a tarefa para outro colaborador (humano ou LLM).

---

## 1. Visão Geral da Tarefa Principal
*   **Breve descrição do objetivo geral que está sendo trabalhado:**
    `[PREENCHER - Ex: Implementar o fluxo de autenticação de usuários usando JWT.]`

---

## 2. Ponto de Continuação

### 2.1. Última Sub-tarefa/Ação Concluída:
*   **ID da Tarefa (de `.jules/TASKS.md`):** `[PREENCHER_ID_ULTIMA_TAREFA_CONCLUIDA]`
*   **Descrição Breve:** `[PREENCHER_DESCRICAO_ULTIMA_TAREFA - Ex: Criação dos endpoints de login e registro.]`
*   **Commit Associado (se aplicável):** `[LINK_OU_HASH_DO_COMMIT - Ex: https://github.com/seu_usuario/seu_repo/commit/abcdef123456]`
*   **Resumo das Mudanças:**
    `[BREVE_RESUMO_DO_QUE_FOI_FEITO_NA_ULTIMA_TAREFA - Ex:
    - Adicionado \`authController.ts\` com lógica para \`/login\` e \`/register\`.
    - Schemas de validação Zod para payloads de entrada criados em \`authSchemas.ts\`.
    - Testes unitários básicos para o controller implementados.]`

### 2.2. Próxima Sub-tarefa/Ação Imediata:
*   **ID da Tarefa (de `.jules/TASKS.md`):** `[PREENCHER_ID_PROXIMA_TAREFA]`
*   **Descrição da Tarefa:** `[COPIAR_DESCRICAO_DA_PROXIMA_TAREFA - Ex: Implementar geração e validação de JWT no \`authService.ts\`]`
*   **Complexidade Estimada (opcional):** `[COMPLEXIDADE_DA_PROXIMA_TAREFA - Ex: Média, ou 1-5 se usando essa escala]`

### 2.3. Estado Atual do Código Relevante:
*   **Branch Git Atual:** `[NOME_DA_BRANCH_GIT_ATUAL - Ex: feature/FEAT-042-user-auth]`
*   **Arquivos Criados/Modificados na Sessão Anterior (relevantes para esta tarefa):**
    *   `[CAMINHO_ARQUIVO_1 - Ex: src/controllers/authController.ts]`
    *   `[CAMINHO_ARQUIVO_2 - Ex: src/services/tokenService.ts (iniciado)]`
    *   `[CAMINHO_ARQUIVO_3 - Ex: src/routes/authRoutes.ts]`
*   **Observações sobre o Estado do Código:**
    `[QUALQUER_NOTA_IMPORTANTE_SOBRE_O_ESTADO_ATUAL - Ex:
    - A função \`generateToken\` em \`tokenService.ts\` está incompleta.
    - Os endpoints estão registrados mas ainda não integrados com a lógica de JWT.
    - Lembrar de adicionar variáveis de ambiente para o segredo do JWT.]`

---

## 3. Contexto Chave e Documentação de Referência
*   `AGENTS.md` (para diretrizes gerais)
*   `.jules/TASKS.MD` (para visão geral das tarefas do projeto)
*   `[LINK_ESPECIFICACAO_FEATURE_X - Ex: Link para a issue do GitHub ou documento de requisitos da feature de autenticação]`
*   `[LINK_DIAGRAMA_Y - Ex: Link para diagrama de fluxo de autenticação, se existir]`
*   `[OUTRO_DOCUMENTO_RELEVANTE]`

---

## 4. Bloqueios ou Questões Pendentes
*   `[Descrever qualquer bloqueio ou questão que precise de input antes de prosseguir. Se não houver, declare: "Nenhum bloqueio identificado."
    Ex: "Preciso de clareza sobre o tempo de expiração padrão para os tokens JWT."
    Ex: "A biblioteca externa XYZ está com um bug documentado que impede o progresso; aguardando nova versão ou buscando alternativa."]`

---

## 5. Objetivo Específico para a Próxima Sessão de Trabalho
*   `[Detalhar o que precisa ser feito para concluir a próxima sub-tarefa/ação específica.
    Ex: "Implementar a lógica de geração de token em \`tokenService.ts\`, integrá-la ao endpoint de login no \`authController.ts\`, e adicionar testes unitários para o serviço de token."]`

---
**Data do Handoff:** `AAAA-MM-DD HH:MM`
**De:** `[SEU_NOME_OU_ID_AGENTE]`
**Para (opcional):** `[NOME_DO_PROXIMO_COLABORADOR_OU_ID_AGENTE]`
