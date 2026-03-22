# CLAUDE.md — Guia para Claude Code
> Lido automaticamente pelo `claude` ao abrir este projeto no terminal.

## O que é este projeto
Sistema de gestão operacional da **Nova São Luiz Diesel** — oficina especializada em
bomba injetora, bomba de alta pressão, injetores mecânicos/eletrônicos, turbinas e veículos diesel.

**Stack:** HTML + CSS + JS puro (single file) · Supabase PostgreSQL · Deploy Vercel

---

## Arquitetura

```
index.html          ← ARQUIVO DE DEPLOY (não editar diretamente)
src/                ← EDITAR AQUI (módulos separados)
  css/main.css      ← variáveis CSS, estilos globais, componentes
  html/sections/    ← cada aba da interface
  html/modals/      ← modais de criação, edição e configuração
  js/               ← lógica separada por responsabilidade
supabase/migrations ← SQL em ordem numérica (001→002→003)
```

## Módulos JS — o que editar para cada tarefa

| Arquivo | Editar quando quiser... |
|---|---|
| `src/js/config.js` | Trocar projeto Supabase |
| `src/js/constants.js` | Adicionar/renomear setor, mudar cores |
| `src/js/helpers.js` | Mudar toast, calcular dias diferente |
| `src/js/init.js` | Alterar ordem de carregamento inicial |
| `src/js/operadores.js` | Mudar lógica de vínculos ou operadores |
| `src/js/dashboard.js` | KPIs, alertas, tabela principal |
| `src/js/kanban.js` | Cards, drag & drop, avançar/voltar |
| `src/js/campos-extras.js` | Campos dinâmicos do formulário |
| `src/js/modal-nova-os.js` | Formulário de criação de OS |
| `src/js/modal-editar-os.js` | Formulário de edição/exclusão de OS |
| `src/js/configurador-campos.js` | Config de campos extras |
| `src/js/configurador-etapas.js` | Config de etapas do Kanban |
| `src/js/configurador-ops.js` | Config de operadores por setor |

## Seções HTML

| Arquivo | Conteúdo |
|---|---|
| `src/html/sections/header.html` | Logo, data, badge Supabase, nav |
| `src/html/sections/dashboard.html` | KPIs, barras de progresso, tabela |
| `src/html/sections/kanban.html` | Board com abas de setor |
| `src/html/sections/agenda.html` | Reuniões semanais e mensais |
| `src/html/sections/matrizes.html` | Análise, gargalos, infraestrutura |
| `src/html/modals/nova-os.html` | Modal de nova OS |
| `src/html/modals/editar-os.html` | Modal de edição de OS |
| `src/html/modals/config.html` | Modal ⚙️ Config (campos+etapas+operadores) |

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
# Supabase:apply_migration(project_id="yfnfcdxmirvfhzphuigy", name="004_...", query="...")
# Salvar também em supabase/migrations/004_nome.sql
```

---

## Como aplicar mudanças dos src/ no index.html

Os arquivos `src/` são para **edição e referência** no Claude Code.
O `index.html` é o arquivo de deploy (tem tudo junto).

Para refletir uma edição do `src/` no `index.html`:
1. Edite o módulo em `src/`
2. Peça ao Claude Code: *"Aplica a mudança do src/js/kanban.js no index.html"*

---

## Setores e cores

```js
// src/js/constants.js
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
- **Feedback:** usar `toast('msg', 'ok'|'err')` — nunca alert() para erros de API
- **IDs HTML:** prefixo `m-` (nova OS), `e-` (editar), `cfg-` (config)
- **Async:** todas as chamadas Supabase são async/await com try/catch

## Problemas conhecidos

| Erro | Causa | Solução |
|---|---|---|
| `DataCloneError: Headers object` | Objeto erro Supabase propagado cru | Usar `error?.message` |
| `[função] is not defined` | Função declarada após chamada | Mover antes do `init()` |
| Kanban vazio | `etapasKanban` vazio no render | Aguardar `carregarEtapas()` |
