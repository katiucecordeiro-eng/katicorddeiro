-- Módulo de Cadernos/Books para impressão.
-- Cadernos são PDFs prontos (arte de alta qualidade produzida externamente),
-- armazenados no Supabase Storage. O app apenas organiza, exibe e entrega
-- para download — nada é gerado dinamicamente a partir daqui.
create table public.cadernos (
  id uuid primary key default gen_random_uuid(),
  sistema_id uuid references public.sistemas (id) on delete set null,
  titulo text not null,
  descricao text,
  numero_paginas integer,
  capa_url text,
  pdf_url text,
  disponivel_no_white boolean not null default false,
  ordem integer not null default 0,
  criado_em timestamptz not null default now()
);

comment on column public.cadernos.sistema_id is
  'Sistema anatômico relacionado; null para cadernos consolidados/gerais.';

create index cadernos_sistema_id_idx on public.cadernos (sistema_id);

alter table public.cadernos enable row level security;

-- Mesma regra de acesso por plano usada em pranchas/quiz_perguntas.
create policy "cadernos_select_por_plano"
  on public.cadernos for select
  to authenticated
  using (
    disponivel_no_white = true
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.plano = 'black'
    )
  );

-- Bucket público: a listagem de cadernos já é protegida pela RLS acima
-- (um usuário White nunca recebe a linha de um caderno Black, logo nunca
-- recebe a URL). Mesmo modelo já usado no bucket "pranchas".
insert into storage.buckets (id, name, public)
values ('cadernos', 'cadernos', true)
on conflict (id) do nothing;
