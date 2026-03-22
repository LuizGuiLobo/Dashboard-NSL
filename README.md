# 🚛 Nova São Luiz Diesel — Sistema de Gestão

Gestão operacional de oficina diesel: Kanban por setor, OS, operadores, vínculos e configurações.

## Stack
| | |
|---|---|
| Frontend | HTML + CSS + JS (single file) |
| Banco | Supabase PostgreSQL · São Paulo `sa-east-1` |
| Deploy | Vercel (static) |

## Início rápido

```bash
# Clone e abra no Claude Code
git clone https://github.com/LuizGuiLobo/nova-sao-luiz-diesel
cd nova-sao-luiz-diesel
claude .         # abre o Claude Code com CLAUDE.md carregado
```

## Deploy

```bash
vercel deploy --prod --name=nova-sao-luiz-diesel
# ou: arraste a pasta em vercel.com/new
```

## Migrations (ordem obrigatória)

```
supabase/migrations/001_ordens_servico.sql
supabase/migrations/002_etapas_kanban.sql
supabase/migrations/003_operadores_vinculos.sql
```

> Veja `CLAUDE.md` para guia completo de desenvolvimento.
