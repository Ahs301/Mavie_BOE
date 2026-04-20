import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const isDashboard = pathname.startsWith('/dashboard')
  const isPanel = pathname.startsWith('/panel')

  const loginUrl = (dest: string, params?: Record<string, string>) => {
    const url = new URL(dest, request.url)
    if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    return NextResponse.redirect(url)
  }

  if (!supabaseUrl || !supabaseKey) {
    if (isDashboard) return loginUrl('/login')
    if (isPanel) return loginUrl('/acceso')
    return NextResponse.next()
  }

  let response = NextResponse.next({ request: { headers: request.headers } })

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value },
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

    const { data: { user }, error } = await supabase.auth.getUser()

    if (isDashboard) {
      if (error || !user) {
        return loginUrl('/login', { redirect: pathname })
      }
      const adminEmailsEnv = process.env.ADMIN_EMAILS
      if (!adminEmailsEnv || !user.email) {
        console.warn('[Seguridad] ADMIN_EMAILS no configurado o email ausente. Bloqueando.')
        return loginUrl('/login', { error: 'unauthorized' })
      }
      const allowedEmails = adminEmailsEnv.split(',').map(e => e.trim().toLowerCase())
      if (!allowedEmails.includes(user.email.toLowerCase())) {
        console.warn(`[Seguridad] Email no autorizado como admin: ${user.email}`)
        return loginUrl('/login', { error: 'unauthorized' })
      }
      return response
    }

    if (isPanel) {
      if (error || !user) {
        return loginUrl('/acceso', { redirect: pathname })
      }
      // Panel solo requiere sesión válida — requireClienteAuth() en server actions verifica el registro de cliente
      return response
    }

    return response
  } catch (err) {
    console.error('[Middleware] Error inesperado:', err)
    if (isDashboard) return loginUrl('/login')
    if (isPanel) return loginUrl('/acceso')
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/panel',
    '/panel/:path*',
  ],
}
