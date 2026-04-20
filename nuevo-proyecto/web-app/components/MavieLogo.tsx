import Image from "next/image"

interface MavieLogoProps {
  size?: number
  showWordmark?: boolean
  theme?: "dark" | "light"
  className?: string
  priority?: boolean
}

export function MavieLogo({
  size = 32,
  showWordmark = true,
  className = "",
  priority = false,
}: MavieLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Icono M — siempre visible */}
      <Image
        src="/logo-mavie-icon.png"
        alt="Mavie"
        width={size}
        height={size}
        priority={priority}
        style={{ height: size, width: "auto", objectFit: "contain" }}
        className="pointer-events-none shrink-0"
      />
      {/* Wordmark completo — igual que la referencia con "avie" */}
      {showWordmark && (
        <span
          style={{ fontSize: size * 0.65, lineHeight: 1 }}
          className="font-bold tracking-tight text-foreground hidden sm:inline"
        >
          avie
        </span>
      )}
    </div>
  )
}
