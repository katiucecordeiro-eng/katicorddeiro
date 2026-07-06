-- Galeria de imagens colorí­veis por prancha: além da imagem principal
-- (pranchas.imagem_base_url), cada prancha pode ter vistas/detalhes
-- adicionais, todas coloríveis na mecânica de flood-fill.
create table public.prancha_imagens (
  id uuid primary key default gen_random_uuid(),
  prancha_id uuid not null references public.pranchas (id) on delete cascade,
  imagem_url text not null,
  titulo text not null,
  ordem integer not null default 0,
  criado_em timestamptz not null default now()
);

create index prancha_imagens_prancha_id_idx on public.prancha_imagens (prancha_id);

alter table public.prancha_imagens enable row level security;

-- Acesso espelha exatamente a regra de acesso da prancha "dona" da imagem
-- (mesma regra de plano usada em pranchas/quiz_perguntas).
create policy "prancha_imagens_select_por_plano"
  on public.prancha_imagens for select
  to authenticated
  using (
    exists (
      select 1 from public.pranchas
      where pranchas.id = prancha_imagens.prancha_id
        and (
          pranchas.disponivel_no_white = true
          or exists (
            select 1 from public.profiles
            where profiles.id = auth.uid() and profiles.plano = 'black'
          )
        )
    )
  );
