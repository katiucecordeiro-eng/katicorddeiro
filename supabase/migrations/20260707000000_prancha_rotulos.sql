-- Modo estudo ativo: rótulos posicionados sobre as ilustrações coloríveis,
-- como elementos do app (não mais embutidos na imagem). Cada rótulo aponta
-- para uma coordenada relativa (0-1) sobre a imagem principal da prancha
-- (prancha_imagem_id nulo) ou sobre uma imagem específica da galeria
-- (prancha_imagem_id preenchido).
create table public.prancha_rotulos (
  id uuid primary key default gen_random_uuid(),
  prancha_id uuid not null references public.pranchas (id) on delete cascade,
  prancha_imagem_id uuid references public.prancha_imagens (id) on delete cascade,
  texto text not null,
  pos_x numeric(5, 4) not null check (pos_x between 0 and 1),
  pos_y numeric(5, 4) not null check (pos_y between 0 and 1),
  ordem integer not null default 0,
  criado_em timestamptz not null default now()
);

create index prancha_rotulos_prancha_id_idx on public.prancha_rotulos (prancha_id);
create index prancha_rotulos_prancha_imagem_id_idx on public.prancha_rotulos (prancha_imagem_id);

alter table public.prancha_rotulos enable row level security;

-- Acesso espelha a regra de plano da prancha dona (mesmo padrão de
-- prancha_imagens/quiz_perguntas/flashcards).
create policy "prancha_rotulos_select_por_plano"
  on public.prancha_rotulos for select
  to authenticated
  using (
    exists (
      select 1 from public.pranchas
      where pranchas.id = prancha_rotulos.prancha_id
        and (
          pranchas.disponivel_no_white = true
          or exists (
            select 1 from public.profiles
            where profiles.id = auth.uid() and profiles.plano = 'black'
          )
        )
    )
  );

-- A partir de agora, imagem_base_url/imagem_url devem apontar para a versão
-- "só desenho" (line art limpo, sem texto/rótulos embutidos) — os rótulos e
-- a legenda de cores são renderizados pelo app, não pela imagem.
comment on column public.pranchas.imagem_base_url is
  'Ilustração para colorir (line art limpo, sem texto/rótulos embutidos — rótulos vêm de prancha_rotulos, legenda de legenda_cores).';
comment on column public.prancha_imagens.imagem_url is
  'Ilustração para colorir (line art limpo, sem texto/rótulos embutidos — ver prancha_rotulos).';
