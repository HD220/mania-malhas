---
id: META-MIGRATE-FORMAT-001.2
title: "Criar script/procedimento para converter tarefas existentes"
priority: P0
status: Concluído
complexity: 1
assigned_to: AgenteJules
parent_task: META-MIGRATE-FORMAT-001
creation_date: "2024-08-06"
completion_date: "2024-08-06"
tags:
  - "meta"
  - "task-management"
  - "automation"
notes: "Script Python .jules/migrate_tasks.py criado para converter tarefas do formato de tabela MD para arquivos individuais com frontmatter YAML."
---

Criar um script (Python, Node.js) para automatizar a conversão de tarefas existentes do formato de tabela em `TASKS.md` para o novo formato de arquivo individual, ou detalhar um procedimento manual passo a passo.

**Resultado:**
- Um script Python, `/.jules/migrate_tasks.py`, foi desenvolvido e salvo.
- O script lê `TASKS.md`, parseia a tabela e gera arquivos `.md` individuais em `/.jules/tasks/`.
