"use client"

import { useEffect, useState } from "react"

const STORAGE_KEY = "mavie_cookie_consent_v1"

type Consent = "accepted" | "rejected"

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  const handleChoice = (choice: Consent) => {
    try {
      localStorage.setItem(STORAGE_KEY, choice)
    } catch {
      /* ignore */
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div role="dialog" aria-live="polite" aria-label="Consentimiento de cookies" className="fixed bottom-4 inset-x-4 md:inset-x-auto md:right-4 md:max-w-md z-50 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-card/95 backdrop-blur-md p-5 shadow-lg">
      <h2 className="text-sm font-semibold text-foreground mb-2">Uso de cookies</h2>
      <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed">
        Usamos cookies técnicas imprescindibles para que la web funcione. Las analíticas son opcionales y se activan sólo con tu consentimiento.
        Más información en nuestra{" "}
        <a href="/cookies" className="underline hover:text-blue-600">política de cookies</a>{" "}
        y{" "}
        <a href="/privacidad" className="underline hover:text-blue-600">privacidad</a>.
      </p>
      <div className="flex gap-2">
        <button onClick={() => handleChoice("rejected")} className="flex-1 h-9 rounded-md border border-neutral-300 dark:border-neutral-700 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
          Sólo necesarias
        </button>
        <button onClick={() => handleChoice("accepted")} className="flex-1 h-9 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors">
          Aceptar todas
        </button>
      </div>
    </div>
  )
}
