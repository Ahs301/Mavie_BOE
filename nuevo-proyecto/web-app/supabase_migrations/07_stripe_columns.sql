-- Columnas Stripe en clients
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS stripe_customer_id     TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS plan_activo            TEXT;

-- Índice para lookup rápido por email (upsert en webhook)
CREATE UNIQUE INDEX IF NOT EXISTS clients_primary_email_idx ON public.clients (primary_email);

-- Índice para buscar por stripe_customer_id (webhook cancelaciones / pagos fallidos)
CREATE INDEX IF NOT EXISTS clients_stripe_customer_idx ON public.clients (stripe_customer_id);

-- Validar que status admite los nuevos valores de Stripe
-- Los valores posibles ahora son: pendiente, listo_para_activar, activo, cancelado, pago_fallido, inactivo
COMMENT ON COLUMN public.clients.status IS 'Valores: pendiente | listo_para_activar | activo | cancelado | pago_fallido | inactivo';
