"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-9 h-9 rounded-md bg-neutral-800 animate-pulse" />
  }

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`
        relative inline-flex items-center justify-center w-9 h-9 rounded-md
        border transition-all duration-200 focus:outline-none
        ${isDark
          ? "border-neutral-700 bg-neutral-800/60 text-neutral-400 hover:text-white hover:bg-neutral-700 hover:border-neutral-600"
          : "border-slate-300 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-100 hover:border-slate-400 shadow-sm"
        }
      `}
      aria-label="Alternar tema de color"
      title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="sr-only">Alternar tema</span>
    </button>
  )
}
