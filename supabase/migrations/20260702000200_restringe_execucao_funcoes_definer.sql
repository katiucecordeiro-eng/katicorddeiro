-- handle_new_user só deve rodar via trigger (contexto que só o Postgres
-- invoca); não deve ser chamável diretamente via RPC por anon/authenticated.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ranking() é o leaderboard: só usuários autenticados podem consultá-lo.
revoke execute on function public.ranking() from public, anon;
