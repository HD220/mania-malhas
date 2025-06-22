# Plano de Ação para Melhorias e Resolução de Pendências

## 1. Introdução

Este documento detalha o plano de ação para abordar os itens identificados na revisão pós-refatoração e outras pendências. O objetivo é fornecer uma trilha clara para a execução das melhorias, correções e implementações necessárias para aumentar a robustez, manutenibilidade e funcionalidade do sistema.

Cada item possui um ID único, descrição, área afetada, prioridade, complexidade estimada, possíveis dependências e um status.

## 2. Legenda

*   **Prioridade:**
    *   **Crítico:** Requer atenção imediata. Impacta segurança, integridade de dados ou funcionalidade core.
    *   **Alto:** Impacto significativo na usabilidade, corretude ou manutenibilidade.
    *   **Médio:** Melhoria importante, mas não bloqueante.
    *   **Baixo:** Refatoração menor, cosmético ou otimização de baixo impacto.
*   **Complexidade:**
    *   **P:** Pequeno (poucas horas, baixo risco)
    *   **M:** Médio (alguns dias, risco moderado)
    *   **G:** Grande (pode levar uma semana ou mais, risco mais alto, pode envolver arquitetura)
*   **Dependências:** IDs de outras tarefas que devem ser concluídas antes.

## 3. Plano de Ação Detalhado

| ID  | Tarefa/Item                                                                    | Área                        | Prioridade | Complexidade | Dependências (IDs) | Status                         | Observações/Detalhes                                                                                                                                  |
|-----|--------------------------------------------------------------------------------|-----------------------------|------------|--------------|--------------------|--------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Investigação e Configuração** |                                                                                |                             |            |              |                    |                                |                                                                                                                                                       |
| C04 | Investigar e resolver incompatibilidades na atualização de `drizzle-kit`/`drizzle-orm` | Config / Data               | Alto       | M            | -                  | Concluído                      | Investigação confirmou que as versões em `package.json` (`drizzle-kit: ^0.31.1`, `drizzle-orm: ^0.44.2`) estão funcionais. Comandos `pg:generate`, `pg:migrate` (até conexão com DB) e testes (`npm test`) executam sem erros de versão do Drizzle. A incompatibilidade reportada anteriormente pode ser obsoleta ou resolvida. |
| C01 | Monitorar viabilidade de Route Groups para layouts distintos                     | Config / UI                 | Médio      | G            | -                  | Pendente - Bloqueado           | Anteriormente "Crítico". Bloqueado por limitações da ferramenta. Reavaliar periodicamente.                                                              |
| **Melhorias de Funcionalidades Existentes** |                                                                        |                             |            |              |                    |                                |                                                                                                                                                       |
| F03 | Melhorias Avançadas na UI de Transações                                        | Feature / UI                | Médio      | M            | -                  | Pendente                       | Implementar filtros textuais na descrição, aprimorar UX de ordenação/paginação. Considerar CRUD completo (edição/exclusão) se necessário.           |
| F05 | Desenvolvimento da Lógica de Backend para Notificações                         | Feature / Backend           | Médio      | M            | -                  | Pendente                       | UI base existe. Implementar a geração, armazenamento e consulta de notificações reais.                                                                  |
| A02 | Integração Completa do Perfil Admin                                            | Feature / Auth / UI         | Médio      | M            | -                  | Pendente                       | Conectar com sistema de autenticação real (obtenção de dados do usuário). Implementar funcionalidades de edição de perfil e alteração de senha. |
| **Qualidade e Manutenibilidade Contínua** |                                                                      |                             |            |              |                    |                                |                                                                                                                                                       |
| T01 | Expansão Contínua da Cobertura de Testes                                       | Testing                     | Alto       | G            | -                  | Em Progresso                   | Foco em testes E2E, componentes de UI mais complexos e fluxos críticos. Manter >100 testes passando e aumentar cobertura.                             |
| G01 | Manutenção e Expansão de Comentários no Código                                 | General / Docs              | Baixo      | M            | -                  | Em Progresso                   | Continuar adicionando/revisando JSDoc/TSDoc em lógicas complexas, decisões de design e funções públicas.                                              |

Este plano de ação foca nos itens pendentes e nas próximas etapas de desenvolvimento e manutenção.
