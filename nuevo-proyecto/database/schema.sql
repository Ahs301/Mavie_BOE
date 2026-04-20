-- Habilitar extensión para UUIDs (si no existe)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum para estados de cliente
CREATE TYPE client_status AS ENUM (
  'lead',
  'presupuesto_enviado',
  'esperando_respuesta',
  'onboarding_pendiente',
  'listo_para_activar',
  'activo',
  'pausado',
  'cancelado'
);

-- Enum para estados de ejecución de logs
CREATE TYPE log_status AS ENUM (
  'success',
  'partial',
  'error'
);

-- Tabla Principal: Clients
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    contact_name TEXT,
    primary_email TEXT NOT NULL,
    phone TEXT,
    lead_source TEXT,
    status client_status DEFAULT 'lead',
    internal_notes TEXT,
    activation_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Configuración del BOE
CREATE TABLE public.client_boe_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT false,
    frequency TEXT DEFAULT 'diario',
    destination_emails TEXT[] DEFAULT '{}',
    keywords_positive TEXT[] DEFAULT '{}',
    keywords_negative TEXT[] DEFAULT '{}',
    regions TEXT[] DEFAULT '{BOE}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(client_id)
);

-- Historial de Oportunidades Encontradas
CREATE TABLE public.boe_match_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    opportunity_title TEXT NOT NULL,
    opportunity_url TEXT,
    publication_date DATE,
    source TEXT DEFAULT 'BOE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trazabilidad de correos por cliente
CREATE TABLE public.client_email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    subject TEXT,
    sent_to TEXT[] DEFAULT '{}',
    module TEXT DEFAULT 'boe_radar',
    status TEXT, -- 'sent', 'bounced', 'error'
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Logs Generales del Worker (Transversales)
CREATE TABLE public.execution_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_name TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    status log_status,
    total_processed_clients INTEGER DEFAULT 0
);

-- Incidencias Operativas (Alertas para el admin)
CREATE TABLE public.incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    module TEXT,
    incident_type TEXT,
    description TEXT,
    full_error_stack TEXT,
    status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'resolved'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Triggers para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_boe_configs_updated_at BEFORE UPDATE ON public.client_boe_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS Base (Asumiendo que el Admin accederá con Autenticación de Supabase o Service Role Key desde el Worker)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_boe_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boe_match_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- Política super-admin: todo el contenido visible para rol de admin logueado o service role
CREATE POLICY "Admin All Access on clients" ON public.clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin All Access on boe_configs" ON public.client_boe_configs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin All Access on match_history" ON public.boe_match_history FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin All Access on email_logs" ON public.client_email_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin All Access on execution_logs" ON public.execution_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin All Access on incidents" ON public.incidents FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- NOTA: El service_role del BOE-Worker puentea el RLS automáticamente y tendrá full access.
