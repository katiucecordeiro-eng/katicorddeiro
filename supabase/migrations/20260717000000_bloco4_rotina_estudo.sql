-- Bloco 4 — rotina de estudo: estratégia pessoal, habit tracker e
-- registro de horas por tipo de atividade.

create type public.formato_estudo as enum ('colorir', 'quiz', 'flashcards', 'leitura', 'pomodoro');

-- ---------------------------------------------------------------------
-- estrategia_estudo: uma por usuário, editável
-- ---------------------------------------------------------------------
create table public.estrategia_estudo (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  formatos_json jsonb not null default '[]',
  metas_json jsonb not null default '{}',
  atualizado_em timestamptz not null default now()
);

comment on column public.estrategia_estudo.formatos_json is
  'Array de {tipo: formato_estudo, minutos: integer} — a rotina que o usuário montou.';
comment on column public.estrategia_estudo.metas_json is
  '{meta_diaria_minutos, meta_semanal_minutos, sistemas_foco: [slug, ...]}.';

alter table public.estrategia_estudo enable row level security;

create policy "estrategia_estudo_select_own"
  on public.estrategia_estudo for select
  to authenticated
  using (auth.uid() = user_id);

create policy "estrategia_estudo_insert_own"
  on public.estrategia_estudo for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "estrategia_estudo_update_own"
  on public.estrategia_estudo for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- habitos_dia: um registro por usuário por dia (tracker + streak)
-- ---------------------------------------------------------------------
create table public.habitos_dia (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  data date not null default current_date,
  cumprido boolean not null default false,
  minutos_estudados integer not null default 0,
  formatos_usados_json jsonb not null default '[]',
  unique (user_id, data)
);

create index habitos_dia_user_id_data_idx on public.habitos_dia (user_id, data);

alter table public.habitos_dia enable row level security;

create policy "habitos_dia_select_own"
  on public.habitos_dia for select
  to authenticated
  using (auth.uid() = user_id);

create policy "habitos_dia_insert_own"
  on public.habitos_dia for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "habitos_dia_update_own"
  on public.habitos_dia for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- sessoes_estudo: log granular por atividade, para o gráfico semanal
-- ---------------------------------------------------------------------
create table public.sessoes_estudo (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tipo public.formato_estudo not null,
  minutos integer not null check (minutos > 0),
  criado_em timestamptz not null default now()
);

create index sessoes_estudo_user_id_criado_em_idx on public.sessoes_estudo (user_id, criado_em);

alter table public.sessoes_estudo enable row level security;

create policy "sessoes_estudo_select_own"
  on public.sessoes_estudo for select
  to authenticated
  using (auth.uid() = user_id);

create policy "sessoes_estudo_insert_own"
  on public.sessoes_estudo for insert
  to authenticated
  with check (auth.uid() = user_id);
