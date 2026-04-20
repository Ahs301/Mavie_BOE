-- Tabla para gestionar logs e incidencias del sistema
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    module TEXT NOT NULL, -- ej: 'radar_boe', 'scraper', 'brevo', 'system'
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open', -- 'open', 'in_progress', 'resolved'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin full access incidents" ON public.incidents;
CREATE POLICY "Admin full access incidents"
    ON public.incidents FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Permitir inserciones desde anon (para que los webhooks/APIs puedan registrar errores)
-- Requiere pasar API Key o auth header si se quiere asegurar, pero abriremos INSERTS para service role.
-- Si hay un endpoint API /api/logs, se hará por Server Side.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_incidents_updated_at') THEN
        CREATE TRIGGER update_incidents_updated_at
        BEFORE UPDATE ON public.incidents
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
