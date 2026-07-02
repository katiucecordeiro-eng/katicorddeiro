-- Dados de exemplo para popular a Biblioteca de Pranchas em ambiente
-- de desenvolvimento. Não contém pranchas/imagens reais (ver
-- imagem_base_url / imagem_referencia_url a preencher via Storage).

insert into public.sistemas (nome, slug, ordem) values
  ('Sistema Esquelético', 'sistema-esqueletico', 1),
  ('Sistema Muscular', 'sistema-muscular', 2),
  ('Sistema Cardiovascular', 'sistema-cardiovascular', 3),
  ('Sistema Nervoso', 'sistema-nervoso', 4),
  ('Sistema Respiratório', 'sistema-respiratorio', 5)
on conflict (slug) do nothing;

insert into public.pranchas (sistema_id, numero_prancha, titulo, disponivel_no_white, legenda_cores)
select s.id, 'Prancha I', 'Visão geral — ' || s.nome, true, '[]'::jsonb
from public.sistemas s
on conflict do nothing;
