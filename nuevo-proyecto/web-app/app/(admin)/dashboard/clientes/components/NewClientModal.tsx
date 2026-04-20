"use client"

import { useRef, useState, useTransition } from "react"
import { X, Plus, Loader2, CheckCircle, AlertTriangle } from "lucide-react"
import { createClientAction } from "@/app/actions/crmActions"
import { useRouter } from "next/navigation"

const inputClass = "w-full bg-background border border-neutral-800 rounded-lg h-10 px-3 text-sm text-foreground placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60 transition-all"

export function NewClientModal() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setResult(null)

    startTransition(async () => {
      const res = await createClientAction(formData)
      setResult(res)
      if (res.success) {
        formRef.current?.reset()
        setTimeout(() => {
          setOpen(false)
          setResult(null)
          router.refresh()
        }, 1200)
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 text-white px-4 text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
      >
        <Plus className="w-4 h-4" /> Nuevo Cliente
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isPending && setOpen(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md bg-card border border-neutral-800 rounded-2xl shadow-2xl shadow-black/50 p-6 animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">Nuevo Cliente</h2>
                <p className="text-xs text-neutral-500 mt-0.5">Se añadirá a la base de datos de Supabase</p>
              </div>
              <button
                onClick={() => !isPending && setOpen(false)}
                className="w-8 h-8 rounded-lg border border-neutral-800 flex items-center justify-center text-neutral-500 hover:text-foreground hover:bg-neutral-800/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Success state */}
            {result?.success && (
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-xl mb-4">
                <CheckCircle className="w-4 h-4 shrink-0" />
                Cliente creado correctamente. Cerrando...
              </div>
            )}

            {/* Error state */}
            {result?.error && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-900 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {result.error}
              </div>
            )}

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              {/* Empresa */}
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                  Nombre de la Empresa <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  name="company_name"
                  type="text"
                  className={inputClass}
                  placeholder="Ej: Soluciones Tecnológicas SL"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">
                  Email Principal <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  name="primary_email"
                  type="email"
                  className={inputClass}
                  placeholder="contacto@empresa.com"
                />
              </div>

              {/* Contacto + Teléfono */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Persona de Contacto</label>
                  <input
                    name="contact_name"
                    type="text"
                    className={inputClass}
                    placeholder="Nombre completo"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Teléfono</label>
                  <input
                    name="phone"
                    type="tel"
                    className={inputClass}
                    placeholder="+34 6XX XXX XXX"
                  />
                </div>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Estado Inicial</label>
                <select name="status" className={inputClass}>
                  <option value="lead">Lead (prospecto)</option>
                  <option value="onboarding_pendiente">Onboarding Pendiente</option>
                  <option value="activo">Activo</option>
                  <option value="pausado">Pausado</option>
                </select>
              </div>

              {/* Nota inicial */}
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Nota Inicial (opcional)</label>
                <textarea
                  name="notes"
                  rows={2}
                  className={`${inputClass} h-auto py-2 resize-none`}
                  placeholder="Origen del cliente, contexto, etc."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => !isPending && setOpen(false)}
                  className="flex-1 h-10 rounded-lg border border-neutral-800 text-neutral-400 hover:text-foreground hover:bg-neutral-800/40 text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending || result?.success}
                  className="flex-1 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                  ) : (
                    <><Plus className="w-4 h-4" /> Crear Cliente</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
