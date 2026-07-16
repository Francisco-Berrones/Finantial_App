-- Adds an optional user-chosen color for the credit card visual, so a card
-- created via the "Nueva Tarjeta de Crédito" sheet can use its own color
-- instead of always falling back to the bank-name-based gradient.
alter table public.tarjetas
  add column if not exists color text;
