# CLAUDE.md — Guia para Claude Code
> Lido automaticamente pelo `claude` ao abrir este projeto no terminal.

## O que é este projeto
Sistema de gestão operacional da **Nova São Luiz Diesel** — oficina especializada em
bomba injetora, bomba de alta pressão, injetores mecânicos/eletrônicos, turbinas e veículos diesel.

**Stack:** React 19 + TypeScript + Tailwind CSS + Vite · Supabase PostgreSQL · Deploy Vercel

---

## Arquitetura

```
src/
  App.tsx                      ← roteamento principal (React Router)
  main.tsx                     ← entry point
  index.css                    ← estilos globais + variáveis Tailwind
  pages/                       ← uma página por aba da interface
  components/
    dashboard/                 ← KPICard, Charts
    kanban/                    ← KanbanBoard, KanbanCard, KanbanColumn
    layout/                    ← Header, Sidebar, PageTransition
    os/                        ← OSForm, OSTable
    ui/                        ← Modal, Toast, Badge, Skeleton, AnimatedCounter
  hooks/
    useSupabase.ts             ← queries e mutations Supabase
    useAnimations.ts           ← animações Framer Motion
  lib/
    supabase.ts                ← client Supabase
    constants.ts               ← SETORES, cores, constantes globais
    utils.ts                   ← helpers gerais
  types/index.ts               ← interfaces TypeScript
supabase/migrations            ← SQL em ordem numérica (001→005)
```

## Componentes — o que editar para cada tarefa

| Arquivo | Editar quando quiser... |
|---|---|
| `src/lib/supabase.ts` | Trocar projeto Supabase |
| `src/lib/constants.ts` | Adicionar/renomear setor, mudar cores |
| `src/lib/utils.ts` | Mudar toast, formatação de datas |
| `src/hooks/useSupabase.ts` | Mudar lógica de queries/mutations |
| `src/pages/Dashboard.tsx` | KPIs, alertas, tabela principal |
| `src/pages/Kanban.tsx` | Board com abas de setor |
| `src/components/kanban/` | Cards, drag & drop, colunas |
| `src/components/os/OSForm.tsx` | Formulário de criação/edição de OS |
| `src/pages/Config.tsx` | Config de campos, etapas, operadores |
| `src/pages/Agenda.tsx` | Reuniões semanais e mensais |
| `src/pages/Matrizes.tsx` | Análise, gargalos, infraestrutura |

---

## Banco de Dados

**Projeto:** `nova-sao-luiz-diesel`
**ID:** `yfnfcdxmirvfhzphuigy`
**Região:** São Paulo (`sa-east-1`) · Status: ACTIVE_HEALTHY

| Tabela | Descrição | Linhas |
|---|---|---|
| `ordens_servico` | OS + extras JSONB + operador | — |
| `etapas_kanban` | Colunas configuráveis do Kanban | 7 |
| `campos_config` | Campos extras do formulário | 3 |
| `operadores` | Mecânicos por setor | 6 |
| `os_vinculos` | Relacionamentos entre OS | — |

### Adicionar nova migration
```bash
# Via MCP Supabase no Claude Code:
# Supabase:apply_migration(project_id="yfnfcdxmirvfhzphuigy", name="005_...", query="...")
# Salvar também em supabase/migrations/005_nome.sql
```

---

## Setores e cores

```ts
// src/lib/constants.ts
const SETORES = [
  'Bomba Injetora',        // #3b82f6 azul
  'Bomba de Alta',         // #f59e0b amarelo
  'Injetores Mecânicos',   // #10b981 verde
  'Injetores Eletrônicos', // #8b5cf6 roxo
  'Veículo Diesel',        // #ef4444 vermelho
  'Turbinas',              // #06b6d4 ciano
];
```

## Deploy

```bash
# Vercel (conectado ao GitHub — push = deploy automático)
git add . && git commit -m "feat: descrição" && git push

# Deploy manual via CLI
vercel deploy --prod --name=nova-sao-luiz-diesel
```

---

## Convenções de código

- **Erros Supabase:** sempre `error?.message` — nunca `throw error` direto (causa DataCloneError)
- **Feedback:** usar componente `<Toast>` ou hook de toast — nunca `alert()` para erros de API
- **Tipagem:** todas as entidades têm interface em `src/types/index.ts` — não usar `any`
- **Async:** todas as chamadas Supabase são async/await com try/catch dentro de `useSupabase.ts`

## Problemas conhecidos

| Erro | Causa | Solução |
|---|---|---|
| `DataCloneError: Headers object` | Objeto erro Supabase propagado cru | Usar `error?.message` |
| `[função] is not defined` | Função declarada após chamada | Mover antes do `init()` |
| Kanban vazio | `etapasKanban` vazio no render | Aguardar `carregarEtapas()` |
