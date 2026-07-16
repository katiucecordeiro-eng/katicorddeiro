-- Anotação pessoal por cartão (associada a usuário + flashcard) e um
-- registro leve da reflexão de fim de sessão de revisão de flashcards.

alter table public.flashcard_progresso
  add column anotacao text;

comment on column public.flashcard_progresso.anotacao is
  'Anotação livre do usuário sobre este cartão específico, escrita durante a revisão.';

create table public.flashcard_sessao_reflexoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  criado_em timestamptz not null default now(),
  total_cartoes integer not null,
  acertos integer not null,
  erros integer not null,
  xp_ganho integer not null,
  duracao_segundos integer,
  texto text not null
);

create index flashcard_sessao_reflexoes_user_id_idx on public.flashcard_sessao_reflexoes (user_id);

alter table public.flashcard_sessao_reflexoes enable row level security;

create policy "flashcard_sessao_reflexoes_select_own"
  on public.flashcard_sessao_reflexoes for select
  to authenticated
  using (auth.uid() = user_id);

create policy "flashcard_sessao_reflexoes_insert_own"
  on public.flashcard_sessao_reflexoes for insert
  to authenticated
  with check (auth.uid() = user_id);
