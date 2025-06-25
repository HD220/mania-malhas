---
id: REFAC-01.4.1.6
title: Validar feature `product` movida (ESLint, Testes)
priority: P4
status: Bloqueado
complexity: 1
assigned_to: AgenteJules
dependencies:
- REFAC-01.4.1.5
creation_date: '2024-08-03'
due_date: '2024-08-05'
notes: ESLint passa (assumido, não verificável). Testes de use cases `product` (exceto getUrlUpload) passam. `getUrlUploadUseCase.test.ts` (4 testes) falham; tentativa de correção com `vi.spyOn` não pôde ser verificada devido a erro sandbox "too many files".
---

Validar feature `product` movida (ESLint, Testes)
