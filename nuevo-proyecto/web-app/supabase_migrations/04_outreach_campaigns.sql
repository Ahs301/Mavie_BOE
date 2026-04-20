-- Tabla para gestionar las campañas de prospección desde el CRM
CREATE TABLE IF NOT EXISTS public.outreach_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    target_audience TEXT NOT NULL, -- ej: "Clínicas dentales Madrid"
    status TEXT NOT NULL DEFAULT 'draft', -- draft, scraping, sending, completed, paused
    total_leads_found INTEGER DEFAULT 0,
    emails_sent INTEGER DEFAULT 0,
    emails_opened INTEGER DEFAULT 0,
    emails_clicked INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.outreach_campaigns ENABLE ROW LEVEL SECURITY;

-- Políticas: Solo administradores (autenticados) pueden leer/escribir
CREATE POLICY "Admin full access outreach_campaigns"
    ON public.outreach_campaigns FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Trigger para updated_at (asumiendo que la función update_updated_at_column ya existe de migraciones previas)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_outreach_campaigns_updated_at') THEN
        CREATE TRIGGER update_outreach_campaigns_updated_at
        BEFORE UPDATE ON public.outreach_campaigns
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
