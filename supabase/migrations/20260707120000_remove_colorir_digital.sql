-- Decisão de produto: o colorir digital (flood-fill em canvas) foi removido
-- do app. Colorir passa a existir apenas na impressão dos books/cadernos
-- (papel). progresso_usuario.cores_preenchidas guardava só esse progresso
-- de pintura na tela e não tem mais uso.
alter table public.progresso_usuario drop column if exists cores_preenchidas;
