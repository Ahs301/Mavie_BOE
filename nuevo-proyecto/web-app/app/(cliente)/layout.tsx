"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { LayoutDashboard, Key, Mail, LogOut, Radar, ExternalLink, Menu, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ")
}

const navItems = [
  { href: "/panel", label: "Mi Panel", icon: LayoutDashboard, exact: true },
  { href: "/panel/keywords", label: "Mis Keywords", icon: Key },
  { href: "/panel/destinatarios", label: "Destinatarios", icon: Mail },
]

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/acceso")
    router.refresh()
  }

  return (
    <div className="flex h-screen bg-neutral-950 text-white overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — drawer on mobile, static on desktop */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-56 border-r border-neutral-800 bg-neutral-950 flex flex-col shrink-0 transition-transform duration-300 ease-in-out",
        "md:relative md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="h-16 flex items-center px-5 border-b border-neutral-800 gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Radar className="h-4 w-4 text-blue-400 shrink-0" />
            <span className="font-semibold text-sm text-white truncate">Radar BOE</span>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 px-2 py-0.5 rounded-full shrink-0">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            Activo
          </span>
          <button
            className="md:hidden ml-1 p-1 text-neutral-500 hover:text-neutral-200 rounded"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 cursor-pointer",
                  isActive
                    ? "bg-blue-950/30 text-white font-medium border border-blue-900/30"
                    : "text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/50"
                )}
              >
                <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-blue-400" : "text-neutral-500")} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-neutral-800 space-y-0.5">
          <a
            href="/api/stripe/portal"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/50 transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            Facturación
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500/60 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden h-14 flex items-center px-4 border-b border-neutral-800 bg-neutral-950 gap-3 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 rounded-lg transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Radar className="h-4 w-4 text-blue-400 shrink-0" />
            <span className="font-semibold text-sm text-white">Radar BOE</span>
          </div>
          <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 px-2 py-0.5 rounded-full">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            Activo
          </span>
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
