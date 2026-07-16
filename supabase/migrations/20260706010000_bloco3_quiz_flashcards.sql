-- Bloco 3 — sistema de estudo ativo: quiz completo, flashcards e ranking.

-- ---------------------------------------------------------------------
-- quiz_perguntas: dificuldade, tipo de pergunta e explicação de feedback
-- ---------------------------------------------------------------------
create type public.dificuldade_quiz as enum ('facil', 'medio', 'dificil');
create type public.tipo_quiz as enum ('multipla_escolha', 'apontar_imagem');

alter table public.quiz_perguntas
  add column dificuldade public.dificuldade_quiz not null default 'medio',
  add column tipo public.tipo_quiz not null default 'multipla_escolha',
  add column explicacao text;

comment on column public.quiz_perguntas.alternativas is
  'multipla_escolha: array de strings. apontar_imagem: {imagem_url, ponto_correto: {x,y}, raio_tolerancia} (x/y normalizados 0-1).';

-- ---------------------------------------------------------------------
-- quiz_respostas_usuario: peso para repetição espaçada simples
-- ---------------------------------------------------------------------
alter table public.quiz_respostas_usuario
  add column peso_repeticao integer not null default 1;

comment on column public.quiz_respostas_usuario.peso_repeticao is
  'Maior peso = a pergunta tende a reaparecer com mais frequência (sobe ao errar, desce ao acertar).';

-- ---------------------------------------------------------------------
-- flashcards
-- ---------------------------------------------------------------------
create table public.flashcards (
  id uuid primary key default gen_random_uuid(),
  prancha_id uuid not null references public.pranchas (id) on delete cascade,
  frente text not null,
  verso text not null,
  imagem_url text,
  criado_em timestamptz not null default now()
);

create index flashcards_prancha_id_idx on public.flashcards (prancha_id);

alter table public.flashcards enable row level security;

create policy "flashcards_select_por_plano"
  on public.flashcards for select
  to authenticated
  using (
    exists (
      select 1 from public.pranchas
      where pranchas.id = flashcards.prancha_id
        and (
          pranchas.disponivel_no_white = true
          or exists (
            select 1 from public.profiles
            where profiles.id = auth.uid() and profiles.plano = 'black'
          )
        )
    )
  );

-- ---------------------------------------------------------------------
-- flashcard_progresso: sistema de Leitner (5 caixas)
-- ---------------------------------------------------------------------
create table public.flashcard_progresso (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  flashcard_id uuid not null references public.flashcards (id) on delete cascade,
  caixa integer not null default 1 check (caixa between 1 and 5),
  proxima_revisao date not null default current_date,
  atualizado_em timestamptz not null default now(),
  unique (user_id, flashcard_id)
);

create index flashcard_progresso_user_id_idx on public.flashcard_progresso (user_id);
create index flashcard_progresso_proxima_revisao_idx on public.flashcard_progresso (proxima_revisao);

alter table public.flashcard_progresso enable row level security;

create policy "flashcard_progresso_select_own"
  on public.flashcard_progresso for select
  to authenticated
  using (auth.uid() = user_id);

create policy "flashcard_progresso_insert_own"
  on public.flashcard_progresso for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "flashcard_progresso_update_own"
  on public.flashcard_progresso for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- ranking(): agora aceita filtro opcional por sistema.
-- Sem filtro: pontuação = xp_total do perfil (soma quiz + flashcards).
-- Com filtro: pontuação = acertos de quiz naquele sistema * 10 (as
-- revisões de flashcard já entram no xp_total global, mas não são
-- naturalmente "de um sistema só" para efeito de ranking segmentado).
-- ---------------------------------------------------------------------
drop function if exists public.ranking();

create function public.ranking(filtro_sistema_slug text default null)
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
    case
      when filtro_sistema_slug is null then p.xp_total::bigint
      else coalesce(pontos_sistema.pontos, 0)
    end as pontos_totais,
    row_number() over (
      order by
        (case
          when filtro_sistema_slug is null then p.xp_total::bigint
          else coalesce(pontos_sistema.pontos, 0)
        end) desc,
        p.criado_em asc
    ) as posicao
  from public.profiles p
  left join lateral (
    select count(*) filter (where qru.acertou) * 10 as pontos
    from public.quiz_respostas_usuario qru
    join public.quiz_perguntas qp on qp.id = qru.pergunta_id
    join public.pranchas pr on pr.id = qp.prancha_id
    join public.sistemas s on s.id = pr.sistema_id
    where qru.user_id = p.id and s.slug = filtro_sistema_slug
  ) pontos_sistema on filtro_sistema_slug is not null
  order by pontos_totais desc;
$$;

revoke all on function public.ranking(text) from public, anon;
grant execute on function public.ranking(text) to authenticated;
