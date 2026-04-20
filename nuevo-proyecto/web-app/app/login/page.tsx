"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Lock, Eye, EyeOff } from "lucide-react"

import { Suspense } from "react"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Si ya está logado, redirigir al dashboard sin mostrar login
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace("/dashboard")
    })
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError("Credenciales incorrectas. Verifica tu email y contraseña.")
      setLoading(false)
    } else {
      const redirect = searchParams.get("redirect") || "/dashboard"
      router.push(redirect)
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-6">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="h-12 w-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center">
              <Lock className="h-5 w-5 text-neutral-300" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-center text-white mb-1">Acceso Administrativo</h1>
          <p className="text-center text-neutral-500 text-sm mb-8">Mavie Automations · Panel de Control</p>

          {error && (
            <div className="bg-red-500/10 border border-red-900 text-red-500 text-sm p-3 rounded-lg mb-5 text-center font-medium animate-pulse">
              {error}
            </div>
          )}

          {searchParams.get("error") === "unauthorized" && !error && (
            <div className="bg-red-500/10 border border-red-900 text-red-400 text-sm p-3 rounded-lg mb-5 text-center">
              Tu email ha sido debidamente autenticado pero <strong>no está autorizado</strong> en la lista de administradores del sistema. Contacta con soporte.
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg h-10 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-neutral-600 placeholder:text-neutral-700"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg h-10 px-3 pr-10 text-white text-sm focus:outline-none focus:ring-1 focus:ring-neutral-600 placeholder:text-neutral-700"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-white text-black text-sm font-semibold rounded-lg hover:bg-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Verificando..." : "Entrar al Panel"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-neutral-700 mt-6">
          Acceso restringido · Solo personal autorizado
        </p>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  )
}
