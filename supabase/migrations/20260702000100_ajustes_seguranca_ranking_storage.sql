-- Corrige achados do advisor de segurança:
-- 1) view "ranking" era implicitamente SECURITY DEFINER (lint ERROR).
--    Substituída por função SECURITY DEFINER explícita e auditável,
--    que expõe apenas dados agregados (sem respostas individuais).
-- 2) bucket público "pranchas" não precisa de policy de SELECT em
--    storage.objects: buckets públicos já servem arquivos via URL
--    pública sem passar por RLS. A policy permitia listagem ampla
--    desnecessária (lint WARN), então foi removida.

drop view if exists public.ranking;

drop policy if exists "pranchas_storage_leitura_publica" on storage.objects;

create function public.ranking()
returns table (
  user_id uuid,
  nome text,
  pontos_totais bigint,
  posicao bigint
)
language sql
security definer
set search_path = public
stable
as $$
  select
    p.id as user_id,
    p.nome,
    count(*) filter (where qru.acertou) * 10 as pontos_totais,
    row_number() over (
      order by count(*) filter (where qru.acertou) desc, p.criado_em asc
    ) as posicao
  from public.profiles p
  left join public.quiz_respostas_usuario qru on qru.user_id = p.id
  group by p.id, p.nome, p.criado_em
  order by pontos_totais desc;
$$;

revoke all on function public.ranking() from public;
grant execute on function public.ranking() to authenticated;
