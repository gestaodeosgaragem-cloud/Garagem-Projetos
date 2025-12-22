# Mapeamento de Status - Garagem Projetos

Este documento define os valores de status usados no banco de dados e sua correspondência com as colunas do Kanban.

---

## 1. Kanban de Projetos

| Coluna (UI) | Valor no BD |
|-------------|-------------|
| Em espera | `waiting` |
| Aguardando Cliente | `waiting_client` |
| Desenvolvimento | `in_development` |
| Aguardando aprovação | `waiting_approval` |
| Concluído | `done` |

### TypeScript Type
```typescript
type ProjectStatus =
  | 'waiting'
  | 'waiting_client'
  | 'in_development'
  | 'waiting_approval'
  | 'done';
```

---

## 2. Kanban de Orçamentos

| Coluna (UI) | Condição |
|-------------|----------|
| Solicitados | `status === 'requested'` |
| Aguardando Confirmação | `status === 'waiting_scheduled'` |
| Reunião Agendada | `status === 'meeting_scheduled'` |
| Aprovados | `production_permission === true` E `status !== 'done'` |
| Finalizados | `production_permission === true` E `status === 'done'` |

### Status de Orçamento (antes de aprovação)
```typescript
type BudgetStatus =
  | 'requested'
  | 'waiting_scheduled'
  | 'meeting_scheduled';
```

> **Nota:** As colunas "Aprovados" e "Finalizados" não usam um status específico, mas sim a combinação de `production_permission` com o `status` do projeto.

---

## 3. Campos Booleanos Importantes

| Campo | Descrição |
|-------|-----------|
| `production_permission` | Se `true`, o orçamento foi aprovado para produção. Determina se aparece em "Aprovados" ou "Finalizados" no Kanban de Orçamentos, e também aparece no Kanban de Projetos. |
| `alert_status` | Se `true` e o projeto está em "Aguardando Cliente", o card recebe a classe `.alert-card` com gradiente de alerta (apenas na tela de Projetos) |

---

## 4. Fluxo de Status

### Orçamento → Projeto
1. Cliente cria orçamento → `status: 'requested'` (Solicitados)
2. Devs agendam reunião → `status: 'meeting_scheduled'` (Reunião Agendada)
3. Orçamento aprovado → `production_permission: true` → aparece em "Aprovados"
4. Entra no Kanban de Projetos com status: `waiting` (Em espera)
5. Segue o fluxo de desenvolvimento até `done` (Concluído)
6. Quando `status: 'done'` E `production_permission: true` → aparece em "Finalizados" no Kanban de Orçamentos
