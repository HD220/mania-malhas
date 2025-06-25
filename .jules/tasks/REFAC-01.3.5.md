---
id: "REFAC-01.3.5"
title: "Mover componentes UI `payment` para `src/features/payment/components/`"
priority: "P4"
status: "Pendente"
complexity: 1
assigned_to: "AgenteJules"
dependencies:
  - "REFAC-01.3.4"
creation_date: "2024-08-06"
completion_date: null
tags:
  - "refactor"
  - "payment"
  - "frontend"
  - "ui"
parent_task: "REFAC-01.3"
notes: |
  Parte da refatoração da feature `payment` (REFAC-01.3).
  Envolve identificar os componentes React (UI) relacionados a pagamentos,
  movê-los para a nova estrutura `src/features/payment/components/`,
  e atualizar todos os imports relevantes no projeto.
---

**Descrição Detalhada:**

1.  Identificar todos os componentes React (arquivos `.tsx`) relacionados à interface do usuário da funcionalidade de "payment". Estes podem estar localizados em diretórios genéricos como `src/components/` ou dentro de pastas de rotas como `src/app/(admin)/payment/components/` ou `src/app/(main_app)/payment/components/`.
2.  Verificar se o diretório `src/features/payment/components/` já existe e se já contém os componentes corretos (conforme verificado na tarefa REFAC-01.3.4, ele contém `payment-form.tsx` e `payment-list.tsx`).
3.  Se houver componentes de UI de `payment` ainda em locais antigos:
    a.  Mover os arquivos de componentes identificados para `src/features/payment/components/`.
    b.  Realizar uma busca global no projeto por todos os locais que importavam estes componentes de seus caminhos antigos.
    c.  Atualizar todos os caminhos de importação para apontar para a nova localização em `src/features/payment/components/`.
4.  Se os componentes já estiverem no local correto (como `payment-form.tsx` e `payment-list.tsx`), confirmar que os imports que os utilizam estão corretos.
5.  Verificar se há testes específicos para estes componentes UI (ex: testes de snapshot, interação) e garantir que continuam passando após a movimentação/verificação dos imports. (Nota: Testes de UI estão fora do escopo do agente, conforme `AGENTS.md`, mas a estrutura dos imports deve ser válida).
6.  Rodar ESLint para garantir a conformidade do código.
