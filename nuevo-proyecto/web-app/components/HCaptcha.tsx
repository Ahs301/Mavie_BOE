"use client"

import { useEffect, useRef, useState } from "react"

declare global {
  interface Window {
    hcaptcha?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string | number
      reset: (id?: string | number) => void
      remove: (id?: string | number) => void
    }
    onHCaptchaLoaded?: () => void
  }
}

interface HCaptchaProps {
  onVerify: (token: string) => void
  onExpire?: () => void
  theme?: "light" | "dark"
}

let scriptLoading = false
let scriptLoaded = false

function loadScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve()
  if (scriptLoading) {
    return new Promise((resolve) => {
      const check = () => (scriptLoaded ? resolve() : setTimeout(check, 100))
      check()
    })
  }
  scriptLoading = true
  return new Promise((resolve, reject) => {
    const s = document.createElement("script")
    s.src = "https://hcaptcha.com/1/api.js?render=explicit"
    s.async = true
    s.defer = true
    s.onload = () => {
      scriptLoaded = true
      resolve()
    }
    s.onerror = () => reject(new Error("hCaptcha failed to load"))
    document.head.appendChild(s)
  })
}

export function HCaptcha({ onVerify, onExpire, theme = "dark" }: HCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY

  useEffect(() => {
    if (!siteKey || !containerRef.current) return

    let cancelled = false
    loadScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.hcaptcha) return
        widgetIdRef.current = window.hcaptcha.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          callback: (token: string) => onVerify(token),
          "expired-callback": () => onExpire?.(),
        })
      })
      .catch((err: Error) => setError(err.message))

    return () => {
      cancelled = true
      if (widgetIdRef.current !== null && window.hcaptcha) {
        try {
          window.hcaptcha.remove(widgetIdRef.current)
        } catch {
          /* noop */
        }
      }
    }
  }, [siteKey, theme, onVerify, onExpire])

  if (!siteKey) return null
  if (error) return <p className="text-xs text-red-500">Error al cargar verificación: {error}</p>

  return <div ref={containerRef} className="flex justify-center min-h-[78px]" />
}
