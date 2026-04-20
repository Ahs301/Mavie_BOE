"use client"

import { useState, useTransition } from "react"
import { addClientNoteAction } from "@/app/actions/crmActions"
import { Plus, Loader2, CheckCircle } from "lucide-react"

export function NotesPanel({ clientId, initialNotes }: { clientId: string; initialNotes?: string }) {
  const [newNote, setNewNote] = useState("")
  const [notes, setNotes] = useState(initialNotes || "")
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (!newNote.trim()) return
    const noteText = newNote.trim()

    startTransition(async () => {
      const res = await addClientNoteAction(clientId, noteText)
      if (res.success) {
        const dateStr = new Date().toLocaleString("es-ES")
        const appended = notes ? notes + `\n\n[${dateStr}] ${noteText}` : `[${dateStr}] ${noteText}`
        setNotes(appended)
        setNewNote("")
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    })
  }

  return (
    <div className="space-y-3">
      {/* Notes display */}
      <div className="min-h-[80px] text-sm text-neutral-400 whitespace-pre-wrap leading-relaxed">
        {notes || <span className="italic text-neutral-600">Sin notas todavía.</span>}
      </div>

      {/* Add note */}
      <div className="border-t border-neutral-800 pt-3 space-y-2">
        <textarea
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          rows={2}
          placeholder="Escribe una nota interna..."
          className="w-full bg-background border border-neutral-800 rounded-lg px-3 py-2 text-sm text-foreground placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60 resize-none transition-all"
        />
        <button
          onClick={handleSave}
          disabled={isPending || !newNote.trim()}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isPending ? (
            <><Loader2 className="w-3 h-3 animate-spin" /> Guardando...</>
          ) : saved ? (
            <><CheckCircle className="w-3 h-3" /> Guardado</>
          ) : (
            <><Plus className="w-3 h-3" /> Añadir nota</>
          )}
        </button>
      </div>
    </div>
  )
}
