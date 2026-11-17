-- 012 — E-mails de usuários visíveis só para admin (ou o próprio usuário)
--       e funções de trigger fora da API.
create or replace view public.v_profiles_com_email as
 select p.id, p.nome, p.role, p.ativo, p.setores, p.telefone, p.criado_em,
        (case when public.get_my_role() = 'admin' or p.id = auth.uid() then u.email end)::character varying(255) as email
   from public.profiles p join auth.users u on u.id = p.id;
revoke all on public.v_profiles_com_email from anon, public;
grant select on public.v_profiles_com_email to authenticated;

revoke execute on function public.log_os_status_change() from public, anon, authenticated;
revoke execute on function public.log_os_setor_status_change() from public, anon, authenticated;
revoke execute on function public.gamificacao_on_status_change() from public, anon, authenticated;
revoke execute on function public.gamificacao_on_setor_status_change() from public, anon, authenticated;
revoke execute on function public.atualizar_timestamp() from public, anon, authenticated;
