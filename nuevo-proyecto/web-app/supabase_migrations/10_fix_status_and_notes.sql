-- Fix 1: Añadir valores de status que el código usa pero el enum no tenía
-- La migración 07 los documentó pero nunca los añadió al tipo ENUM
ALTER TYPE public.client_status ADD VALUE IF NOT EXISTS 'perdido';
ALTER TYPE public.client_status ADD VALUE IF NOT EXISTS 'pago_fallido';

-- Fix 2: El schema creó 'internal_notes' pero el código en crmActions.ts usa 'notes'
-- Renombrar la columna para que el código funcione sin tocar nada más
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'internal_notes'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'notes'
  ) THEN
    ALTER TABLE public.clients RENAME COLUMN internal_notes TO notes;
  END IF;

  -- Si por alguna razón 'notes' aún no existe, la creamos
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'notes'
  ) THEN
    ALTER TABLE public.clients ADD COLUMN notes TEXT;
  END IF;
END $$;
