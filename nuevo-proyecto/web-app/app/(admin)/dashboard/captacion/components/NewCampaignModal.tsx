"use client"

import { useState, useTransition } from "react"
import { createOutreachCampaignAction } from "@/app/actions/outreachActions"
import { Plus, Loader2, X, Target } from "lucide-react"

export function NewCampaignModal() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await createOutreachCampaignAction(formData)
      if (res.success) {
        setOpen(false)
      } else {
        setError(res.error || "Ocurrió un error")
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 text-white px-5 text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
      >
        <Plus className="w-4 h-4" /> Nueva Campaña
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isPending && setOpen(false)} />
          <div className="relative w-full max-w-md bg-card border border-neutral-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" /> Crear Campaña B2B
                </h2>
                <p className="text-xs text-neutral-500 mt-1">El script VPS procesará esta cola.</p>
              </div>
              <button
                onClick={() => !isPending && setOpen(false)}
                className="text-neutral-500 hover:text-foreground hover:bg-neutral-800/50 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <div className="mb-4 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Nombre interno (Ej: Q3 - Sector Legal)</label>
                <input
                  required
                  name="name"
                  type="text"
                  className="w-full bg-background border border-neutral-800 rounded-lg h-10 px-3 text-sm focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Objetivo / Queries (Ej: Despachos abogados Madrid)</label>
                <textarea
                  required
                  name="target_audience"
                  rows={2}
                  className="w-full bg-background border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60 transition-all outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => !isPending && setOpen(false)}
                  className="flex-1 h-10 rounded-lg border border-neutral-800 text-neutral-400 hover:bg-neutral-800/50 text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar campaña"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
