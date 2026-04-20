"use client"

import { useState, useTransition, useEffect } from "react"
import { getClienteData, updateKeywords } from "@/app/actions/clienteActions"
import { Save, Info } from "lucide-react"

export default function KeywordsPage() {
  const [positive, setPositive] = useState("")
  const [negative, setNegative] = useState("")
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    getClienteData().then(({ config }) => {
      setPositive((config?.keywords_positive ?? []).join("\n"))
      setNegative((config?.keywords_negative ?? []).join("\n"))
    })
  }, [])

  const handleSave = () => {
    setMsg(null)
    startTransition(async () => {
      const result = await updateKeywords(positive, negative)
      if (result.error) setMsg({ type: "err", text: result.error })
      else setMsg({ type: "ok", text: "Keywords guardadas correctamente." })
    })
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-2">Keywords de búsqueda</h1>
      <p className="text-neutral-500 text-sm mb-8">
        El Radar BOE filtra los artículos que contienen tus keywords positivas y excluye los que contienen las negativas.
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white mb-1.5">
            Keywords positivas
            <span className="text-neutral-500 font-normal ml-2">— una por línea</span>
          </label>
          <div className="flex items-start gap-2 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2 mb-2">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>Solo recibirás alertas de artículos que contengan al menos una de estas palabras.</span>
          </div>
          <textarea
            value={positive}
            onChange={(e) => setPositive(e.target.value)}
            rows={8}
            placeholder={"licitación\nsubvención\ncontratación pública\nfondo europeo"}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 placeholder:text-neutral-700 resize-none font-mono"
          />
          <p className="text-xs text-neutral-600 mt-1">
            {positive.split("\n").filter(Boolean).length} keyword(s)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1.5">
            Keywords negativas (excluir)
            <span className="text-neutral-500 font-normal ml-2">— una por línea</span>
          </label>
          <textarea
            value={negative}
            onChange={(e) => setNegative(e.target.value)}
            rows={4}
            placeholder={"ayudas personas físicas\nbeneficiarios autónomos"}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 placeholder:text-neutral-700 resize-none font-mono"
          />
          <p className="text-xs text-neutral-600 mt-1">
            {negative.split("\n").filter(Boolean).length} keyword(s) de exclusión
          </p>
        </div>

        {msg && (
          <div className={`text-sm px-4 py-3 rounded-lg border ${msg.type === "ok" ? "bg-green-500/10 border-green-900 text-green-400" : "bg-red-500/10 border-red-900 text-red-400"}`}>
            {msg.text}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isPending ? "Guardando..." : "Guardar keywords"}
        </button>
      </div>
    </div>
  )
}
