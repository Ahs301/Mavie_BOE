"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Users, AlertCircle, Settings, LogOut, Target, UserPlus, Mail, Radar } from "lucide-react"
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

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 border-r border-neutral-800 bg-card flex flex-col shrink-0">
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-neutral-800">
          <Link href="/dashboard" className="hover:opacity-80 transition-opacity">
            <MavieLogo size={24} showWordmark />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-neutral-800/80 text-foreground font-medium"
                    : "text-neutral-500 hover:text-foreground hover:bg-neutral-800/40"
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive ? "text-foreground" : "text-neutral-500")} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer acciones */}
        <div className="p-3 border-t border-neutral-800 space-y-0.5">
          <Link
            href="/dashboard/configuracion"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-neutral-500 hover:text-foreground hover:bg-neutral-800/40 transition-colors"
          >
            <Settings className="w-4 h-4 text-neutral-500" />
            Configuración
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
