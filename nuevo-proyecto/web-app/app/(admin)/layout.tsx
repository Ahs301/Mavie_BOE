"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { LayoutDashboard, Users, AlertCircle, Settings, LogOut, Target, UserPlus, Mail, Radar, Menu, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { MavieLogo } from "@/components/MavieLogo"

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ")
}

const navItems = [
  { href: "/dashboard", label: "Vista General", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/clientes", label: "Clientes (CRM)", icon: Users },
  { href: "/dashboard/leads", label: "Leads / Web", icon: UserPlus },
  { href: "/dashboard/emails", label: "Hub de Email", icon: Mail },
  { href: "/dashboard/boe", label: "Radar BOE", icon: Radar },
  { href: "/dashboard/captacion", label: "Captación B2B", icon: Target },
  { href: "/dashboard/incidencias", label: "Logs e Incidencias", icon: AlertCircle },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — drawer on mobile, static on desktop */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-60 border-r border-neutral-800 bg-neutral-950 flex flex-col shrink-0 transition-transform duration-300 ease-in-out",
        "md:relative md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-neutral-800 gap-2">
          <Link
            href="/dashboard"
            className="hover:opacity-80 transition-opacity flex items-center"
            onClick={() => setSidebarOpen(false)}
          >
            <MavieLogo size={22} showWordmark />
          </Link>
          <span className="ml-auto text-[10px] font-semibold text-neutral-600 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-full shrink-0 tracking-wide">
            Admin
          </span>
          <button
            className="md:hidden ml-1 p-1 text-neutral-500 hover:text-neutral-200 rounded"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
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

        {/* Footer acciones */}
        <div className="p-3 border-t border-neutral-800 space-y-0.5">
          <Link
            href="/dashboard/configuracion"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/50 transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4 shrink-0" />
            Configuración
          </Link>
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
          <MavieLogo size={18} showWordmark />
          <span className="ml-auto text-[10px] font-semibold text-neutral-600 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-full tracking-wide">
            Admin
          </span>
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
