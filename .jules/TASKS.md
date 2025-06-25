# Rastreador de Tarefas do Projeto (Resumo)

Este arquivo fornece um resumo de alto nível das tarefas de desenvolvimento.
Para detalhes completos de cada tarefa, consulte o arquivo individual vinculado na coluna "Link para Detalhes".
A especificação completa do formato dos arquivos de tarefa pode ser encontrada em `/.jules/TASK_FORMAT_SPECIFICATION.md`.
O fluxo de trabalho para interagir com este sistema de tarefas está documentado em `/.jules/AGENT_WORKFLOW.md`.

**Nota para Agentes LLM:**
- Tarefas com `Complexidade > 1` na tabela abaixo devem ser desmembradas antes da execução. Consulte `AGENT_WORKFLOW.md`.
- Para executar uma tarefa, primeiro verifique suas dependências (nos arquivos de detalhe) e o status.

| ID da Tarefa   | Prioridade | Título Curto                                                       | Status      | Complexidade | Responsável                 | Data de Criação | Link para Detalhes                                             |
|----------------|------------|--------------------------------------------------------------------|-------------|--------------|-----------------------------|-----------------|----------------------------------------------------------------|
| F07.1          | P2         | Confirmar requisitos de negócio para páginas públicas/marketing... | Concluído   | 1            | [Product Owner/Stakeholder] | 2024-08-01      | [F07.1.md](./tasks/F07.1.md)                                   |
| F07.2          | P3         | Criar Route Group e layout base para páginas Públicas/Marketing... | Concluído   | 1            | AgenteJules                 | 2024-08-01      | [F07.2.md](./tasks/F07.2.md)                                   |
| F07            | P3         | Avaliar necessidade e, se confirmado, implementar layout para...   | Concluído   | 2            | AgenteJules                 | 2024-08-01      | [F07.md](./tasks/F07.md)                                       |
| REFAC-01.3     | P4         | Mover a primeira feature (ex: `payment`) para `src/features/payment/` | Subdividido | 3            | AgenteJules                 | 2024-08-01      | [REFAC-01.3.md](./tasks/REFAC-01.3.md)                         |
| REFAC-01.4     | P4         | Refatorar features subsequentes (iterativo)                        | Subdividido | 3            | AgenteJules                 | 2024-08-01      | [REFAC-01.4.md](./tasks/REFAC-01.4.md)                         |
| REFAC-01.4.1.6 | P4         | Validar feature `product` movida (ESLint, Testes)                  | Concluído   | 1            | AgenteJules                 | 2024-08-03      | [REFAC-01.4.1.6.md](./tasks/REFAC-01.4.1.6.md)                 |
| REFAC-01.4.5.6 | P4         | Validar feature `notification` movida (ESLint, Testes)           | Concluído   | 1            | AgenteJules                 | 2024-08-03      | [REFAC-01.4.5.6.md](./tasks/REFAC-01.4.5.6.md)                 |
| REFAC-01       | P4         | Refatorar para estrutura baseada em features com validação ESLint    | Subdividido | 5            | [A DEFINIR]                 | 2024-08-01      | [REFAC-01.md](./tasks/REFAC-01.md)                             |
| C01            | P5         | Monitorar viabilidade de Route Groups para layouts distintos       | Subdividido | 4            | [A DEFINIR]                 | AAAA-MM-DD      | [C01.md](./tasks/C01.md)                                       |
| META-MIGRATE-FORMAT-001 | P0 | Migrar TASKS.md para novo formato com arquivos de detalhe...     | Concluído   | 2            | AgenteJules                 | 2024-08-05      | [META-MIGRATE-FORMAT-001.md](./tasks/META-MIGRATE-FORMAT-001.md) |
| META-MIGRATE-FORMAT-001.1 | P0 | Definir novo formato e estrutura para arquivos de tarefa         | Concluído   | 1            | AgenteJules                 | 2024-08-06      | [META-MIGRATE-FORMAT-001.1.md](./tasks/META-MIGRATE-FORMAT-001.1.md) |
| META-MIGRATE-FORMAT-001.2 | P0 | Criar script/procedimento para converter tarefas existentes      | Concluído   | 1            | AgenteJules                 | 2024-08-06      | [META-MIGRATE-FORMAT-001.2.md](./tasks/META-MIGRATE-FORMAT-001.2.md) |
| META-MIGRATE-FORMAT-001.3 | P0 | Migrar um pequeno lote de tarefas (piloto)                       | Concluído   | 1            | AgenteJules                 | 2024-08-06      | [META-MIGRATE-FORMAT-001.3.md](./tasks/META-MIGRATE-FORMAT-001.3.md) |
| META-MIGRATE-FORMAT-001.4 | P0 | Migrar todas as tarefas restantes                                | Concluído   | 1            | AgenteJules                 | 2024-08-06      | [META-MIGRATE-FORMAT-001.4.md](./tasks/META-MIGRATE-FORMAT-001.4.md) |
| META-MIGRATE-FORMAT-001.5 | P0 | Atualizar a documentação do fluxo de trabalho do agente          | Concluído   | 1            | AgenteJules                 | 2024-08-06      | [META-MIGRATE-FORMAT-001.5.md](./tasks/META-MIGRATE-FORMAT-001.5.md) |
| META-MIGRATE-FORMAT-001.6 | P0 | Finalizar a migração da TASKS.md principal                     | Concluído   | 1            | AgenteJules                 | 2024-08-06      | [META-MIGRATE-FORMAT-001.6.md](./tasks/META-MIGRATE-FORMAT-001.6.md) |
| REFAC-01.3.4 | P4         | Mover actions `payment` para `src/features/payment/actions/`     | Concluído   | 1            | AgenteJules                 | 2024-08-06      | [REFAC-01.3.4.md](./tasks/REFAC-01.3.4.md)                     |

**Legenda de Status:** Pendente, Em Andamento, Concluído, Bloqueado, Revisão, Subdividido
**Legenda de Complexidade (1-5):** 1 (Muito Baixa), 2 (Baixa), 3 (Média), 4 (Alta), 5 (Muito Alta / Requer Subdivisão Significativa)
**Legenda de Prioridade (P0-P5):** P0 (Meta/Crítica), P1 (Mais Alta), P2, P3, P4, P5 (Mais Baixa)
