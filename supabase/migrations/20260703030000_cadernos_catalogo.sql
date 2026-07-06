-- A vitrine de cadernos precisa mostrar capa/título/descrição de TODOS os
-- cadernos (inclusive os bloqueados, como teaser "Desbloqueie no Black"),
-- mas a política de RLS da tabela "cadernos" restringe a linha inteira por
-- plano — se abríssemos a linha toda para todo mundo, pdf_url (o arquivo
-- pago) vazaria via consulta direta à API REST, já que RLS não distingue
-- colunas. Solução: função SECURITY DEFINER (mesmo padrão de ranking())
-- que expõe só as colunas seguras de vitrine, nunca pdf_url.
create function public.cadernos_catalogo()
returns table (
  id uuid,
  sistema_id uuid,
  titulo text,
  descricao text,
  numero_paginas integer,
  capa_url text,
  disponivel_no_white boolean,
  ordem integer,
  criado_em timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select id, sistema_id, titulo, descricao, numero_paginas, capa_url, disponivel_no_white, ordem, criado_em
  from public.cadernos
  order by ordem;
$$;

revoke all on function public.cadernos_catalogo() from public, anon;
grant execute on function public.cadernos_catalogo() to authenticated;
