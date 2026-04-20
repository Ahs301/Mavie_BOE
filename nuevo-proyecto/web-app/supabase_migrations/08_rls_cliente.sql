-- RLS: acceso self-service del cliente autenticado
-- Los clientes solo pueden leer/editar SU propia fila

-- clients: cliente puede leer su propio registro (para lookup en auth)
CREATE POLICY "Cliente puede ver su propia fila"
  ON public.clients FOR SELECT TO authenticated
  USING (primary_email = auth.email());

-- client_boe_configs: cliente puede leer su config
CREATE POLICY "Cliente puede ver su propia config BOE"
  ON public.client_boe_configs FOR SELECT TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE primary_email = auth.email()
    )
  );

-- client_boe_configs: cliente puede actualizar keywords y emails (no is_active, no plan)
CREATE POLICY "Cliente puede actualizar su propia config BOE"
  ON public.client_boe_configs FOR UPDATE TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients WHERE primary_email = auth.email()
    )
  )
  WITH CHECK (
    client_id IN (
      SELECT id FROM public.clients WHERE primary_email = auth.email()
    )
  );
