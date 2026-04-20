"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Key, Mail, LogOut, Radar, ExternalLink } from "lucide-react"
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

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/acceso")
    router.refresh()
  }

  return (
    <div className="flex h-screen bg-neutral-950 text-white overflow-hidden">
      <aside className="w-56 border-r border-neutral-800 bg-neutral-900 flex flex-col shrink-0">
        <div className="h-14 flex items-center px-5 border-b border-neutral-800 gap-2">
          <Radar className="h-5 w-5 text-blue-400" />
          <span className="font-semibold text-sm text-white">Radar BOE</span>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-neutral-800 text-white font-medium"
                    : "text-neutral-500 hover:text-white hover:bg-neutral-800/40"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-neutral-800 space-y-0.5">
          <a
            href="/api/stripe/portal"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-neutral-500 hover:text-white hover:bg-neutral-800/40 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Facturación
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500/70 hover:text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
