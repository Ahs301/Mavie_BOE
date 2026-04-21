-- Añadir valores que faltaban en client_status ENUM
-- Sin estos, el webhook de Stripe falla silenciosamente al recibir invoice.payment_failed

ALTER TYPE client_status ADD VALUE IF NOT EXISTS 'pago_fallido';
ALTER TYPE client_status ADD VALUE IF NOT EXISTS 'inactivo';

-- Comentario actualizado
COMMENT ON COLUMN public.clients.status IS
  'Valores: lead | presupuesto_enviado | esperando_respuesta | onboarding_pendiente | listo_para_activar | activo | pausado | cancelado | pago_fallido | inactivo';
