-- Adds optional user-chosen icon and color to categorias, so a category
-- created via the "Nueva categoría" picker can persist its own look instead
-- of always falling back to the name-based icon/color mapping.
alter table public.categorias
  add column if not exists icono text,
  add column if not exists color text;
