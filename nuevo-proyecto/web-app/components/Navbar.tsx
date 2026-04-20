"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ArrowRight, ChevronDown } from "lucide-react"
import { MavieLogo } from "@/components/MavieLogo"
import { ThemeToggle } from "@/components/ThemeToggle"

const navigation = [
  { href: "/", label: "Inicio", exact: true },
  {
    label: "Plataforma",
    children: [
      { href: "/servicios", label: "Ecosistema CRM / ERP" },
      { href: "/servicios", label: "Scraping & Bases de Datos" },
      { href: "/servicios", label: "Automatización de Negocio" },
    ],
  },
  {
    label: "Soluciones",
    children: [
      { href: "/soluciones", label: "Ver Catálogo Base" },
      { href: "/soluciones/boe", label: "Radar BOE/DOUE" },
      { href: "/soluciones/prospeccion", label: "Outreach B2B AI" },
    ],
  },
  { href: "/servicios", label: "Precios & Setup" },
  { href: "/sobre-nosotros", label: "Sobre Nosotros" },
]

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ")
}

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null)
  const [scrolled, setScrolled] = React.useState(false)
  const pathname = usePathname()

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  React.useEffect(() => {
    setIsOpen(false)
    setOpenDropdown(null)
  }, [pathname])

  const isActive = (href?: string, exact?: boolean) => {
    if (!href) return false
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "bg-background/95 backdrop-blur-xl border-b border-neutral-800/60 shadow-sm"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-5 flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" aria-label="Mavie Automations — Inicio">
            <MavieLogo size={30} showWordmark />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {navigation.map((item) => {
              if (item.children) {
                return (
                  <div key={item.label} className="relative">
                    <button
                      onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                      className={cn(
                        "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        item.children.some((c) => isActive(c.href))
                          ? "text-foreground bg-neutral-800/60"
                          : "text-neutral-500 hover:text-foreground hover:bg-neutral-800/40"
                      )}
                    >
                      {item.label}
                      <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", openDropdown === item.label && "rotate-180")} />
                    </button>
                    {openDropdown === item.label && (
                      <div className="absolute top-full left-0 mt-1 w-48 rounded-xl border border-neutral-800 bg-background shadow-xl shadow-black/10 dark:shadow-black/40 overflow-hidden py-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "flex items-center px-4 py-2.5 text-sm transition-colors",
                              isActive(child.href)
                                ? "text-foreground bg-neutral-800/50"
                                : "text-neutral-500 hover:text-foreground hover:bg-neutral-800/30"
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive(item.href, item.exact)
                      ? "text-foreground bg-neutral-800/60"
                      : "text-neutral-500 hover:text-foreground hover:bg-neutral-800/40"
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* CTA & Theme */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              Hablar con experto <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex md:hidden items-center justify-center w-9 h-9 rounded-md border border-neutral-800 text-neutral-500 hover:text-foreground hover:bg-neutral-800/40 transition-colors"
            aria-label="Abrir menú"
          >
            {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Click outside to close dropdown */}
      {openDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
      )}

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-background border-l border-neutral-800 flex flex-col">
            <div className="flex items-center justify-between px-5 h-16 border-b border-neutral-800">
              <MavieLogo size={26} showWordmark />
              <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-0.5 p-4 flex-1 overflow-auto">
              {navigation.map((item) => {
                if (item.children) {
                  return (
                    <div key={item.label}>
                      <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider mt-2">
                        {item.label}
                      </div>
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center px-4 py-2.5 rounded-lg text-sm transition-colors",
                            isActive(child.href)
                              ? "text-foreground bg-neutral-800/60 font-medium"
                              : "text-neutral-500 hover:text-foreground hover:bg-neutral-800/30"
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href!}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "px-4 py-2.5 rounded-lg text-sm transition-colors",
                      isActive(item.href, item.exact)
                        ? "text-foreground bg-neutral-800/60 font-medium"
                        : "text-neutral-500 hover:text-foreground hover:bg-neutral-800/30"
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="p-4 border-t border-neutral-800">
              <Link
                href="/contacto"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full h-10 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Hablar con experto <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="h-16" />
    </>
  )
}
