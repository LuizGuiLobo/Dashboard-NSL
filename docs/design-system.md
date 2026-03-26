# Design System — Nova São Luiz Diesel Dashboard

> Referência para integração de designs Figma via MCP e para manutenção do sistema visual.

---

## Stack

- **Sem framework** — HTML + CSS + JavaScript puro
- **Sem build step** — `index.html` é o artefato de deploy (tudo inline)
- **Módulos source** em `src/` são editados separadamente e mesclados manualmente no `index.html`
- **Banco de dados:** Supabase PostgreSQL (via CDN `@supabase/supabase-js`)

---

## 1. Design Tokens

Todos os tokens são CSS custom properties definidos em `src/css/main.css` dentro de `:root`:

```css
:root {
  /* Backgrounds */
  --bg:           #1a1a1a;   /* Fundo da página */
  --surface:      #222222;   /* Card / modal */
  --surface2:     #1e1e1e;   /* Input / superfície mais profunda */
  --border:       #333333;   /* Borda padrão */
  --border-hover: #444444;

  /* Accent principal (ouro — marca NSL) */
  --accent:       #c8962a;
  --accent-hover: #daa832;
  --accent-dark:  #a67b1e;

  /* Accents semânticos */
  --accent2: #3b82f6;  /* Azul   — info / Bomba Injetora */
  --accent3: #10b981;  /* Verde  — sucesso */
  --accent4: #ef4444;  /* Vermelho — perigo / alerta */
  --accent5: #8b5cf6;  /* Roxo  — Injetores Eletrônicos */

  /* Texto */
  --text:  #ffffff;
  --muted: #777777;

  /* Tipografia */
  --fd: 'Montserrat', sans-serif;      /* Display / títulos */
  --fb: 'Inter', sans-serif;           /* Corpo */
  --fm: 'JetBrains Mono', monospace;   /* Códigos, placas, números */
}
```

**Mapa de cores por setor** (definido em `src/js/constants.js`):

```js
const SETOR_COLORS = {
  'Bomba Injetora':         '#3b82f6',  // azul
  'Bomba de Alta':          '#e8a317',  // âmbar
  'Injetores Mecânicos':    '#10b981',  // verde
  'Injetores Eletrônicos':  '#8b5cf6',  // roxo
  'Veículo Diesel':         '#ef4444',  // vermelho
  'Turbinas':               '#06b6d4',  // ciano
};
```

> Sem pipeline de transformação de tokens — tokens são usados diretamente via `var(--token)`.

---

## 2. Componentes CSS

Sem framework — todos os componentes são classes CSS reutilizáveis:

| Classe | Descrição |
|---|---|
| `.card` | Superfície com borda + hover ouro |
| `.btn` `.btn-primary` `.btn-ghost` `.btn-danger` `.btn-sm` | Botões |
| `.pill` `.pill-y/g/b/r/p/gz` | Pills de status com indicador `●` |
| `.inp` `.inp-mono` | Inputs (text, select, textarea) |
| `.lbl` `.form-group` | Labels e agrupamento de form |
| `.modal-bg` `.modal-box` `.modal-title` | Overlay + container de modal |
| `.alert` `.alert-w/d/i` | Banners de alerta (warning/danger/info) |
| `.kanban-col` `.kanban-card` `.kanban-col-header` | Estrutura do board Kanban |
| `.setor-tab` `.setor-tabs` | Abas de setor |
| `.prog-wrap` `.prog-track` `.prog-fill` | Barras de progresso |
| `.grid-4` `.grid-2` | Layouts CSS Grid |
| `.sec-title` `.block-title` `.card-label` `.card-value` `.card-sub` | Hierarquia tipográfica |
| `.toast` `.toast-ok` `.toast-err` | Notificações |
| `.spinner` | Spinner de loading |
| `.sync-badge` `.sync-ok/err/load` | Badge de status Supabase |

---

## 3. Escala Tipográfica

```css
.sec-title   { font-family: var(--fd); font-size: 22px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
.modal-title { font-family: var(--fd); font-size: 20px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: var(--accent); }
.card-value  { font-family: var(--fd); font-size: 40px; font-weight: 700; line-height: 1; }
.block-title { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); }
.card-label  { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); }
.lbl         { font-size: 10px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: var(--muted); }
th           { font-size: 10px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: var(--muted); }
body         { font-family: var(--fb); font-size: 13px; }                    /* base */
.kc-placa    { font-family: var(--fm); font-size: 13px; letter-spacing: 2px; } /* mono p/ placas */
```

---

## 4. Espaçamento & Layout

- Unidades base de padding: `8px / 12px / 14px / 18px / 24px / 28px`
- Conteúdo principal: `padding: 24px 28px`, `max-width: 1500px`, centralizado
- Header: `padding: 14px 28px`
- Cards: `padding: 18px`
- Modal: `padding: 26px`, `max-width: 580px`
- Colunas Kanban: `min-width: 210px`, `max-width: 225px`

**Escala de border-radius:**

| Valor | Uso |
|---|---|
| `4px` | Pill / badge |
| `5px` | Input / botão |
| `6px` | Kanban card |
| `7px` | Toast |
| `8px` | Card / coluna kanban |
| `10px` | Modal |

---

## 5. Assets

- Armazenados em `assets/` na raiz do projeto
- Referenciados com caminho relativo: `src="assets/logo.png"`
- Logo: `assets/logo.png` — circular, 44×44px, borda ouro
- Sem CDN para assets; sem pipeline de otimização de imagem
- `src/assets/remove_bg.py` — utilitário Python para remoção de fundo (pré-processamento manual)

---

## 6. Ícones

- **Apenas emojis** — sem biblioteca de ícones
- Usados inline no HTML: `📊 Dashboard`, `🗂 Kanban`, `📅 Agenda`, `📐 Matrizes`, `⚙️ Config`
- Sem convenção de nomenclatura — emojis escolhidos semanticamente

---

## 7. Abordagem de Estilo

- **CSS global plano** — único `src/css/main.css`, sem escopo, sem módulos
- **Nomenclatura BEM-like** (sem BEM estrito): `kanban-col`, `kanban-col-header`, `kanban-card`, `kc-num`, `kc-placa` (prefixo `kc-` = kanban card)
- **Prefixos de ID** para seleção via JS:
  - `m-` → modal nova OS
  - `e-` → modal editar OS
  - `cfg-` → modal de configuração
- Responsivo com breakpoint único: `@media(max-width:800px)` — `.grid-4` vira 2 cols, `.grid-2` vira 1 col
- **Dark mode apenas** — sem modo claro

---

## 8. Estrutura do Projeto

```
index.html                  ← DEPLOY (todos os src/ mesclados aqui)
assets/
  logo.png
src/
  css/
    main.css                ← Tokens + estilos de todos os componentes
  html/
    sections/
      header.html           ← <header> + <nav>
      dashboard.html        ← KPIs, alertas, tabela
      kanban.html           ← Board + abas de setor
      agenda.html           ← Reuniões
      matrizes.html         ← Grades de análise
    modals/
      nova-os.html          ← Formulário de nova OS
      editar-os.html        ← Editar/excluir OS
      config.html           ← Config de campos + etapas + operadores
  js/
    config.js               ← Init do cliente Supabase
    constants.js            ← SETORES, SETOR_COLORS, variáveis de estado global
    helpers.js              ← toast(), calcDias(), setSyncBadge()
    init.js                 ← Sequência de bootstrap
    dashboard.js            ← KPIs, render da tabela
    kanban.js               ← Render do board, drag & drop
    modal-nova-os.js        ← Lógica de criação de OS
    modal-editar-os.js      ← Lógica de edição/exclusão de OS
    campos-extras.js        ← Campos dinâmicos do formulário
    operadores.js           ← Vínculos de operadores/mecânicos
    configurador-campos.js  ← Config: campos extras
    configurador-etapas.js  ← Config: etapas do kanban
    configurador-ops.js     ← Config: operadores por setor
  assets/
    remove_bg.py
supabase/
  migrations/               ← SQL em ordem numérica (001→...)
tools/
  gamification-prompt.html  ← Página utilitária estática
docs/
  design-system.md          ← Este arquivo
vercel.json                 ← Rewrites de rota para SPA
```

---

## 9. Guia Figma → Código

Ao converter designs Figma para este projeto:

1. **Mapear cores Figma → variáveis CSS** usando a tabela de tokens acima. Nunca hardcodar hex.
2. **Sem abstração de componente** — gerar HTML puro com as classes CSS correspondentes.
3. **Dark theme apenas** — todas as superfícies usam `var(--bg)`, `var(--surface)`, `var(--surface2)`.
4. **Ouro (`#c8962a`) = accent da marca** — usar em títulos, estados ativos, botões primários.
5. **Fonte mono** (`var(--fm)`) para placas de veículos, números de OS, códigos técnicos.
6. **Cores de setor** vêm do mapa `SETOR_COLORS` em JS, aplicadas como `style="color: ..."` inline — não como classes CSS.
7. **Pills** usam `.pill` + `.pill-{y|g|b|r|p|gz}` — novos variants de cor devem ser adicionados ao `main.css` seguindo o padrão `rgba` existente.
8. **Tabelas** usam `<table>/<th>/<td>` puro com CSS global — sem classes de wrapper.
9. **Modais** seguem a estrutura: `modal-bg > modal-box > modal-title + form-groups + linha de botões`.
10. **Novos IDs em JS** devem usar prefixos: `m-` (nova OS), `e-` (editar OS), `cfg-` (config).
