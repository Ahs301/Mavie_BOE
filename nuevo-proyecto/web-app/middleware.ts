import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Si faltan variables, redirigir al login para no romper la app
  if (!supabaseUrl || !supabaseKey) {
    console.warn('[Middleware] Faltan credenciales de Supabase. Redirigiendo a login.')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    })

    // Verificar sesión activa
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      // No autenticado → redirigir a login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Autorización de Nivel 2: Lista Blanca de Emails Administrativos
    // Fail closed: si ADMIN_EMAILS no está configurado, bloquear acceso
    const adminEmailsEnv = process.env.ADMIN_EMAILS
    if (!adminEmailsEnv || !user.email) {
      console.warn(`[Seguridad] ADMIN_EMAILS no configurado o email de usuario ausente. Bloqueando acceso.`)
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(loginUrl)
    }

    const allowedEmails = adminEmailsEnv.split(',').map(e => e.trim().toLowerCase())
    if (!allowedEmails.includes(user.email.toLowerCase())) {
      console.warn(`[Seguridad] Intento de acceso bloqueado para email no autorizado: ${user.email}`)
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(loginUrl)
    }

    // Usuario autenticado y autorizado → permitir acceso
    return response
  } catch (err) {
    console.error('[Middleware] Error inesperado:', err)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    // Proteger TODAS las rutas del dashboard
    // En Next.js App Router, (admin) es un route group, la URL real es /dashboard
    '/dashboard',
    '/dashboard/:path*',
  ],
}
