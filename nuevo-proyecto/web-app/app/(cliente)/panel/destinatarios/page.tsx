"use client"

import { useState, useTransition, useEffect } from "react"
import { getClienteData, updateDestinatarios } from "@/app/actions/clienteActions"
import { Save, Info } from "lucide-react"

export default function DestinatariosPage() {
  const [emails, setEmails] = useState("")
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    getClienteData().then(({ config }) => {
      setEmails((config?.destination_emails ?? []).join("\n"))
    })
  }, [])

  const handleSave = () => {
    setMsg(null)
    startTransition(async () => {
      const result = await updateDestinatarios(emails)
      if (result.error) setMsg({ type: "err", text: result.error })
      else setMsg({ type: "ok", text: "Destinatarios guardados correctamente." })
    })
  }

  const emailList = emails.split("\n").map(e => e.trim()).filter(Boolean)

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-2">Destinatarios de alertas</h1>
      <p className="text-neutral-500 text-sm mb-8">
        Los resúmenes y alertas del BOE se enviarán a estas direcciones de email.
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white mb-1.5">
            Emails destinatarios
            <span className="text-neutral-500 font-normal ml-2">— uno por línea</span>
          </label>
          <div className="flex items-start gap-2 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2 mb-2">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>Máximo 20 destinatarios. Todos recibirán el mismo resumen diario.</span>
          </div>
          <textarea
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            rows={6}
            placeholder={"nombre@empresa.com\ndepartamento@empresa.com"}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 placeholder:text-neutral-700 resize-none font-mono"
          />
          <p className="text-xs text-neutral-600 mt-1">{emailList.length} destinatario(s)</p>
        </div>

        {emailList.length > 0 && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
            <p className="text-xs text-neutral-500 mb-2 font-medium">Vista previa</p>
            <div className="space-y-1">
              {emailList.map((email, i) => (
                <p key={i} className="text-sm text-white font-mono">{email}</p>
              ))}
            </div>
          </div>
        )}

        {msg && (
          <div className={`text-sm px-4 py-3 rounded-lg border ${msg.type === "ok" ? "bg-green-500/10 border-green-900 text-green-400" : "bg-red-500/10 border-red-900 text-red-400"}`}>
            {msg.text}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={isPending || emailList.length === 0}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {isPending ? "Guardando..." : "Guardar destinatarios"}
        </button>
      </div>
    </div>
  )
}
