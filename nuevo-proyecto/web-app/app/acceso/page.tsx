"use client"

import { createClient } from "@/lib/supabase/client"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Radar } from "lucide-react"

function AccesoForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace("/panel")
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
      router.push("/panel")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-6">
      <div className="w-full max-w-sm">
        <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
              <Radar className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-center text-white mb-1">Radar BOE — Acceso</h1>
          <p className="text-center text-neutral-500 text-sm mb-8">Panel de cliente · Mavie Automations</p>

          {searchParams.get("error") === "no_client" && !error && (
            <div className="bg-yellow-500/10 border border-yellow-900 text-yellow-400 text-sm p-3 rounded-lg mb-5 text-center">
              Tu cuenta no tiene un servicio activo asociado. Contacta con soporte.
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-900 text-red-500 text-sm p-3 rounded-lg mb-5 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@empresa.com"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg h-10 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 placeholder:text-neutral-700"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg h-10 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 placeholder:text-neutral-700"
                autoComplete="current-password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Accediendo..." : "Entrar al Panel"}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-neutral-700 mt-6">
          ¿Problemas para acceder? Escríbenos a soporte@mavieautomations.com
        </p>
      </div>
    </div>
  )
}

export default function AccesoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">Cargando...</div>}>
      <AccesoForm />
    </Suspense>
  )
}
