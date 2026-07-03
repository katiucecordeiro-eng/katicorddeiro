-- Bloco 1.5 — experiência de "caderno de estudo" navegável por páginas.
-- Cada página de teoria é composta por blocos tipados:
--   { tipo: "titulo" | "paragrafo" | "post-it" | "destaque", texto: string, cor?: string }
-- A cor (para post-it/destaque) é uma de: amarelo | rosa | azul | verde.
alter table public.sistemas
  add column conteudo_teorico jsonb not null default '[]'::jsonb;

comment on column public.sistemas.conteudo_teorico is
  'Blocos de conteúdo teórico da página de anotações do caderno: [{tipo, texto, cor?}].';
