-- Adds an optional savings purpose tag to cuentas, chosen from a fixed set of
-- chips ("Viajes", "Fondo Emergencia", "Educación", "Inversión") when the
-- account is created.
alter table public.cuentas
  add column if not exists proposito text;
