-- =====================================================================
-- Asterik — schema inicial
-- Caderno de estudo digital de anatomia (pranchas, quiz, pomodoro)
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------
create type public.plano_usuario as enum ('white', 'black');
create type public.tipo_sessao_pomodoro as enum ('foco', 'descanso');

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null default '',
  email text not null,
  plano public.plano_usuario not null default 'white',
  xp_total integer not null default 0,
  criado_em timestamptz not null default now()
);

comment on table public.profiles is 'Dados públicos de cada usuário, espelhando auth.users.';

-- Cria automaticamente um profile quando um novo usuário se cadastra.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------
-- sistemas (categorias de pranchas, ex: "Sistema Esquelético")
-- ---------------------------------------------------------------------
create table public.sistemas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  ordem integer not null default 0,
  thumbnail_url text,
  criado_em timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- pranchas (as ilustrações estilo atlas para colorir)
-- ---------------------------------------------------------------------
create table public.pranchas (
  id uuid primary key default gen_random_uuid(),
  sistema_id uuid not null references public.sistemas (id) on delete cascade,
  numero_prancha text not null,
  titulo text not null,
  imagem_base_url text,
  imagem_referencia_url text,
  imagem_pdf_url text,
  legenda_cores jsonb not null default '[]'::jsonb,
  disponivel_no_white boolean not null default false,
  criado_em timestamptz not null default now()
);

comment on column public.pranchas.legenda_cores is
  'Lista de {estrutura, cor_sugerida, area_id} usada para colorir e legendar a prancha.';

create index pranchas_sistema_id_idx on public.pranchas (sistema_id);

-- ---------------------------------------------------------------------
-- progresso_usuario (coloração + anotações de cada usuário por prancha)
-- ---------------------------------------------------------------------
create table public.progresso_usuario (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  prancha_id uuid not null references public.pranchas (id) on delete cascade,
  cores_preenchidas jsonb not null default '{}'::jsonb,
  anotacoes text default '',
  completo boolean not null default false,
  atualizado_em timestamptz not null default now(),
  unique (user_id, prancha_id)
);

create index progresso_usuario_user_id_idx on public.progresso_usuario (user_id);

-- ---------------------------------------------------------------------
-- quiz_perguntas
-- ---------------------------------------------------------------------
create table public.quiz_perguntas (
  id uuid primary key default gen_random_uuid(),
  prancha_id uuid not null references public.pranchas (id) on delete cascade,
  pergunta text not null,
  alternativas jsonb not null,
  resposta_correta text not null,
  criado_em timestamptz not null default now()
);

create index quiz_perguntas_prancha_id_idx on public.quiz_perguntas (prancha_id);

-- ---------------------------------------------------------------------
-- quiz_respostas_usuario
-- ---------------------------------------------------------------------
create table public.quiz_respostas_usuario (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pergunta_id uuid not null references public.quiz_perguntas (id) on delete cascade,
  acertou boolean not null,
  respondido_em timestamptz not null default now()
);

create index quiz_respostas_usuario_user_id_idx on public.quiz_respostas_usuario (user_id);

-- ---------------------------------------------------------------------
-- sessoes_pomodoro
-- ---------------------------------------------------------------------
create table public.sessoes_pomodoro (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  duracao_minutos integer not null,
  tipo public.tipo_sessao_pomodoro not null default 'foco',
  iniciado_em timestamptz not null default now(),
  finalizado_em timestamptz
);

create index sessoes_pomodoro_user_id_idx on public.sessoes_pomodoro (user_id);

-- ---------------------------------------------------------------------
-- ranking (view agregada, sem RLS própria — expõe apenas dados agregados)
-- View "security invoker = false" (padrão): roda com privilégios do dono,
-- então pode agregar quiz_respostas_usuario de todos os usuários sem
-- expor as respostas individuais (que continuam protegidas por RLS).
-- ---------------------------------------------------------------------
create view public.ranking as
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

grant select on public.ranking to authenticated;

-- =====================================================================
-- Row Level Security
-- =====================================================================

alter table public.profiles enable row level security;
alter table public.sistemas enable row level security;
alter table public.pranchas enable row level security;
alter table public.progresso_usuario enable row level security;
alter table public.quiz_perguntas enable row level security;
alter table public.quiz_respostas_usuario enable row level security;
alter table public.sessoes_pomodoro enable row level security;

-- profiles: cada usuário só vê/edita o próprio perfil.
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- sistemas: catálogo de leitura pública para usuários autenticados.
create policy "sistemas_select_authenticated"
  on public.sistemas for select
  to authenticated
  using (true);

-- pranchas: leitura liberada para o plano 'white' apenas nas pranchas
-- marcadas como disponíveis; usuários do plano 'black' veem tudo.
create policy "pranchas_select_por_plano"
  on public.pranchas for select
  to authenticated
  using (
    disponivel_no_white = true
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.plano = 'black'
    )
  );

-- progresso_usuario: cada usuário só acessa o próprio progresso.
create policy "progresso_usuario_select_own"
  on public.progresso_usuario for select
  to authenticated
  using (auth.uid() = user_id);

create policy "progresso_usuario_insert_own"
  on public.progresso_usuario for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "progresso_usuario_update_own"
  on public.progresso_usuario for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "progresso_usuario_delete_own"
  on public.progresso_usuario for delete
  to authenticated
  using (auth.uid() = user_id);

-- quiz_perguntas: segue a mesma regra de acesso por plano da prancha.
create policy "quiz_perguntas_select_por_plano"
  on public.quiz_perguntas for select
  to authenticated
  using (
    exists (
      select 1 from public.pranchas
      where pranchas.id = quiz_perguntas.prancha_id
        and (
          pranchas.disponivel_no_white = true
          or exists (
            select 1 from public.profiles
            where profiles.id = auth.uid() and profiles.plano = 'black'
          )
        )
    )
  );

-- quiz_respostas_usuario: cada usuário só acessa as próprias respostas.
-- (o ranking agregado é exposto separadamente pela view "ranking".)
create policy "quiz_respostas_usuario_select_own"
  on public.quiz_respostas_usuario for select
  to authenticated
  using (auth.uid() = user_id);

create policy "quiz_respostas_usuario_insert_own"
  on public.quiz_respostas_usuario for insert
  to authenticated
  with check (auth.uid() = user_id);

-- sessoes_pomodoro: cada usuário só acessa as próprias sessões.
create policy "sessoes_pomodoro_select_own"
  on public.sessoes_pomodoro for select
  to authenticated
  using (auth.uid() = user_id);

create policy "sessoes_pomodoro_insert_own"
  on public.sessoes_pomodoro for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "sessoes_pomodoro_update_own"
  on public.sessoes_pomodoro for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "sessoes_pomodoro_delete_own"
  on public.sessoes_pomodoro for delete
  to authenticated
  using (auth.uid() = user_id);

-- =====================================================================
-- Storage — bucket público para as imagens das pranchas
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('pranchas', 'pranchas', true)
on conflict (id) do nothing;

create policy "pranchas_storage_leitura_publica"
  on storage.objects for select
  to public
  using (bucket_id = 'pranchas');
