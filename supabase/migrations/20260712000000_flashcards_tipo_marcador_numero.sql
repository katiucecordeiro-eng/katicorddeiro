-- Flashcards visuais: tipo (visual/conceitual) e marcador numerico
-- pre-impresso na imagem (sem overlay x/y), para os cards baseados nas
-- pranchas do bucket "flascards". Campos ficam prontos para receber o
-- conteudo real (perguntas, respostas e alternativas) via UPDATE direto.
create type public.tipo_flashcard as enum ('visual', 'conceitual');

alter table public.flashcards
  add column tipo public.tipo_flashcard not null default 'conceitual',
  add column marcador_numero integer,
  add column explicacao text;

comment on column public.flashcards.tipo is
  'Tipo do flashcard: visual (baseado em imagem com marcador numerado) ou conceitual (pergunta textual).';
comment on column public.flashcards.marcador_numero is
  'Numero do marcador pre-impresso na imagem (bucket flascards) a que este flashcard se refere. Nulo para cards sem marcador.';
comment on column public.flashcards.explicacao is
  'Texto explicativo exibido apos a resposta, complementando o verso do card.';

update public.flashcards set tipo = 'visual' where imagem_url is not null;
