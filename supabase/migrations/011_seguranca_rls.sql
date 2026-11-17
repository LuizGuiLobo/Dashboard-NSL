-- ═══════════════════════════════════════════════════════════════════
-- 011 — Correções de segurança (auditoria de 16/nov/2026)
--
-- Problemas encontrados:
--  1. Políticas "USING (true)" para o papel public: qualquer pessoa com a
--     chave anon (que está no bundle e no repositório público) lia, alterava
--     e apagava ordens de serviço, operadores, etapas e histórico sem login.
--  2. View v_profiles_com_email expunha e-mails de auth.users para anon.
--  3. Usuário comum podia mudar o próprio "role" para admin.
--  4. Views SECURITY DEFINER ignoravam RLS; funções sem search_path fixo
--     e executáveis por anon.
--
-- IMPORTANTE: aplicar junto com o deploy do front desta mesma branch
-- (o app passa a carregar dados só depois do login).
-- ═══════════════════════════════════════════════════════════════════

-- 1. Políticas: tudo exige usuário autenticado ─────────────────────────
drop policy if exists acesso_leitura_achievements on public.achievements;
create policy leitura_achievements on public.achievements
  for select to authenticated using (true);

drop policy if exists acesso_leitura_daily_missions on public.daily_missions;
create policy leitura_daily_missions on public.daily_missions
  for select to authenticated using (true);

drop policy if exists acesso_total_campos on public.campos_config;
create policy auth_campos on public.campos_config
  for all to authenticated using (true) with check (true);

drop policy if exists acesso_total_etapas on public.etapas_kanban;
create policy auth_etapas on public.etapas_kanban
  for all to authenticated using (true) with check (true);

drop policy if exists acesso_total_operador_achievements on public.operador_achievements;
create policy auth_operador_achievements on public.operador_achievements
  for all to authenticated using (true) with check (true);

drop policy if exists acesso_total_operador_missions on public.operador_missions;
create policy auth_operador_missions on public.operador_missions
  for all to authenticated using (true) with check (true);

drop policy if exists acesso_total_operadores on public.operadores;
create policy auth_operadores on public.operadores
  for all to authenticated using (true) with check (true);

drop policy if exists acesso_total_operadores_gamification on public.operadores_gamification;
create policy auth_operadores_gamification on public.operadores_gamification
  for all to authenticated using (true) with check (true);

drop policy if exists acesso_total_os on public.ordens_servico;
create policy auth_os on public.ordens_servico
  for all to authenticated using (true) with check (true);

drop policy if exists acesso_total_os_historico on public.os_historico;
create policy auth_os_historico on public.os_historico
  for all to authenticated using (true) with check (true);

drop policy if exists acesso_total_vinculos on public.os_vinculos;
create policy auth_vinculos on public.os_vinculos
  for all to authenticated using (true) with check (true);

-- 2. Perfis: usuário edita o próprio perfil, mas não o próprio papel ───
drop policy if exists update_proprio_profile on public.profiles;
create policy update_proprio_profile on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id and role = public.get_my_role());

-- 3. Papel anon não acessa nada do schema public ───────────────────────
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on sequences from anon;
alter default privileges in schema public revoke execute on functions from anon;

-- 4. Views respeitam o RLS de quem consulta ────────────────────────────
alter view public.v_kanban            set (security_invoker = true);
alter view public.v_ordens_com_status set (security_invoker = true);
alter view public.v_historico_mensal  set (security_invoker = true);
alter view public.v_os_atrasadas      set (security_invoker = true);
alter view public.v_os_sla            set (security_invoker = true);
alter view public.v_operador_ranking  set (security_invoker = true);
alter view public.v_os_timeline       set (security_invoker = true);
-- v_profiles_com_email precisa ler auth.users, então continua como está,
-- mas só para usuários logados (anon já foi revogado no passo 3).
grant select on public.v_profiles_com_email to authenticated;

-- 5. Funções: search_path fixo e sem execução anônima ──────────────────
alter function public.adicionar_setor_os(uuid, text, text)        set search_path = public, extensions, pg_temp;
alter function public.admin_criar_usuario(text, text, text, text) set search_path = public, extensions, pg_temp;
alter function public.admin_excluir_usuario(uuid)                 set search_path = public, extensions, pg_temp;
alter function public.finalizar_os(uuid)                          set search_path = public, extensions, pg_temp;
alter function public.fn_os_insert_criar_setor()                  set search_path = public, extensions, pg_temp;
alter function public.fn_os_update_sync_setor()                   set search_path = public, extensions, pg_temp;
alter function public.get_my_role()                               set search_path = public, extensions, pg_temp;
alter function public.handle_new_user()                           set search_path = public, extensions, pg_temp;
alter function public.mover_status_setor(uuid, text)              set search_path = public, extensions, pg_temp;

revoke execute on function public.adicionar_setor_os(uuid, text, text)        from public, anon;
revoke execute on function public.admin_criar_usuario(text, text, text, text) from public, anon;
revoke execute on function public.admin_excluir_usuario(uuid)                 from public, anon;
revoke execute on function public.finalizar_os(uuid)                          from public, anon;
revoke execute on function public.get_my_role()                               from public, anon;
revoke execute on function public.mover_status_setor(uuid, text)              from public, anon;
-- funções de trigger não precisam ser chamadas pela API
revoke execute on function public.fn_os_insert_criar_setor() from public, anon, authenticated;
revoke execute on function public.fn_os_update_sync_setor()  from public, anon, authenticated;
revoke execute on function public.handle_new_user()          from public, anon, authenticated;

grant execute on function public.adicionar_setor_os(uuid, text, text)        to authenticated;
grant execute on function public.admin_criar_usuario(text, text, text, text) to authenticated;
grant execute on function public.admin_excluir_usuario(uuid)                 to authenticated;
grant execute on function public.finalizar_os(uuid)                          to authenticated;
grant execute on function public.get_my_role()                               to authenticated;
grant execute on function public.mover_status_setor(uuid, text)              to authenticated;

-- 6. Fazer à mão no painel do Supabase (não é SQL):
--    Authentication → Password security → ativar "Leaked password protection".
