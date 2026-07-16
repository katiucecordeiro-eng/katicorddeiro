-- Flashcards mais ricos: modo de resposta ativa (múltipla escolha ou
-- resposta livre) e marcador posicional sobre a imagem da frente do
-- card. Campos opcionais — cards sem resposta_correta continuam no modo
-- clássico de virar a carta e se autoclassificar.
alter table public.flashcards
  add column alternativas jsonb,
  add column resposta_correta text,
  add column marcador_x numeric(5, 4) check (marcador_x is null or marcador_x between 0 and 1),
  add column marcador_y numeric(5, 4) check (marcador_y is null or marcador_y between 0 and 1);

comment on column public.flashcards.alternativas is
  'Array de strings com as alternativas de múltipla escolha (modo de resposta ativa). Nulo = resposta livre ou card clássico (virar a carta).';
comment on column public.flashcards.resposta_correta is
  'Resposta correta para o modo de resposta ativa (múltipla escolha ou texto livre). Nulo = card clássico, sem correção automática.';
comment on column public.flashcards.marcador_x is
  'Posição X relativa (0-1) de um marcador sobre imagem_url, apontando a estrutura perguntada.';
comment on column public.flashcards.marcador_y is
  'Posição Y relativa (0-1) de um marcador sobre imagem_url, apontando a estrutura perguntada.';
