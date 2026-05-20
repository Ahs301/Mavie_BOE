---
description: Crear usuario cliente Supabase Auth
---

Necesito crear usuario Supabase Auth para un cliente real y conectarlo con el panel cliente.

Analiza:

- `nuevo-proyecto/web-app/app/`
- `nuevo-proyecto/web-app/lib/`
- `nuevo-proyecto/web-app/actions/`
- `nuevo-proyecto/database/`

Quiero:

1. Cómo funciona `/acceso`.
2. Cómo funciona `/panel`.
3. Qué tablas existen para cliente, usuario y `client_id`.
4. Cómo crear el usuario manualmente desde Supabase.
5. Cómo vincularlo al cliente correcto.
6. Cómo comprobar que RLS funciona.
7. Cómo probar login real.
8. Qué riesgos multi-tenant hay.
9. Qué archivos tocarías si falta lógica.
10. Qué NO tocarías.

No modifiques archivos todavía.
No toques Stripe.
No toques onboarding salvo que sea imprescindible.
No toques `.env.local`.
No toques `stripe.env`.