-- Conteúdo teórico por prancha (mais rico que o nível de sistema):
--   { abertura: string, blocos: [{subtitulo, texto}],
--     postits: [{tipo: "info"|"clinico"|"curiosidade", texto}],
--     palavras_chave: string[] }
-- O conteudo_teorico de "sistemas" passa a guardar apenas a introdução e o
-- fechamento do capítulo: { abertura, postits, fechamento: {texto, postit} }.
alter table public.pranchas
  add column conteudo_teorico jsonb not null default '{}'::jsonb;

comment on column public.pranchas.conteudo_teorico is
  'Conteúdo da página de teoria do caderno: {abertura, blocos, postits, palavras_chave}.';

comment on column public.sistemas.conteudo_teorico is
  'Introdução/fechamento do capítulo do sistema: {abertura, postits, fechamento}.';
