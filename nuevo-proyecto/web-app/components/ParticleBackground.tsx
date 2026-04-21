"use client"

import { useEffect, useRef, useCallback } from "react"
import { useTheme } from "next-themes"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
  baseOpacity: number
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const animRef = useRef<number>(0)
  const lastSizeRef = useRef({ w: 0, h: 0 })
  const isTouchActiveRef = useRef(false)
  const touchFadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { resolvedTheme } = useTheme()

  const initParticles = useCallback((w: number, h: number) => {
    const numParticles = w < 768 ? 55 : 140
    particlesRef.current = Array.from({ length: numParticles }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.3,
      baseOpacity: Math.random() * 0.5 + 0.3,
    }))
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dark = resolvedTheme === "dark"

    // Set canvas size. Uses clientWidth for width (stable) and applies a threshold
    // on height to avoid reinitializing particles when the mobile address bar shows/hides
    // (which only changes height by ~55-70px, far less than an orientation change).
    const applySize = (forceInit = false) => {
      const w = document.documentElement.clientWidth
      const h = window.innerHeight
      const prev = lastSizeRef.current
      const widthChanged = Math.abs(w - prev.w) > 10
      const heightChangedMajor = Math.abs(h - prev.h) > 100

      if (widthChanged || heightChangedMajor || forceInit) {
        canvas.width = w
        canvas.height = h
        lastSizeRef.current = { w, h }
        initParticles(w, h)
      }
    }

    applySize(true)

    let resizeTimer: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => applySize(), 150)
    }
    window.addEventListener("resize", onResize, { passive: true })

    // Desktop: update mouse position, but ignore synthetic events generated from touch.
    const onMouseMove = (e: MouseEvent) => {
      if (isTouchActiveRef.current) return
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    const onMouseLeave = () => {
      if (isTouchActiveRef.current) return
      mouseRef.current = { x: -9999, y: -9999 }
    }
    window.addEventListener("mousemove", onMouseMove, { passive: true })
    window.addEventListener("mouseleave", onMouseLeave, { passive: true })

    // Mobile touch: drive the cursor effect from touch coordinates.
    const cancelTouchFade = () => {
      if (touchFadeTimerRef.current) {
        clearTimeout(touchFadeTimerRef.current)
        touchFadeTimerRef.current = null
      }
    }

    const onTouchStart = (e: TouchEvent) => {
      isTouchActiveRef.current = true
      cancelTouchFade()
      if (e.touches.length > 0) {
        const t = e.touches[0]
        mouseRef.current = { x: t.clientX, y: t.clientY }
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const t = e.touches[0]
        mouseRef.current = { x: t.clientX, y: t.clientY }
      }
    }

    const onTouchEnd = () => {
      // Short delay so particles settle gracefully instead of snapping away.
      touchFadeTimerRef.current = setTimeout(() => {
        mouseRef.current = { x: -9999, y: -9999 }
        // Keep the flag active a bit longer to absorb any trailing synthetic mousemove.
        setTimeout(() => { isTouchActiveRef.current = false }, 200)
      }, 250)
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchmove", onTouchMove, { passive: true })
    window.addEventListener("touchend", onTouchEnd, { passive: true })
    window.addEventListener("touchcancel", onTouchEnd, { passive: true })

    const draw = () => {
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      const particles = particlesRef.current
      const mouse = mouseRef.current
      const mobile = w < 768

      const CONNECTION_DISTANCE = mobile ? 110 : 160
      const MOUSE_REPEL_DISTANCE = mobile ? 90 : 130
      const MOUSE_ATTRACT_STRENGTH = 0.022

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        const dx = mouse.x - p.x
        const dy = mouse.y - p.y
        const distMouse = Math.sqrt(dx * dx + dy * dy)

        if (distMouse < MOUSE_REPEL_DISTANCE) {
          const force = (MOUSE_REPEL_DISTANCE - distMouse) / MOUSE_REPEL_DISTANCE
          p.vx += dx * MOUSE_ATTRACT_STRENGTH * force
          p.vy += dy * MOUSE_ATTRACT_STRENGTH * force
          p.opacity = Math.min(1, p.baseOpacity + force * 0.6)
        } else {
          p.opacity += (p.baseOpacity - p.opacity) * 0.05
        }

        // Speed cap
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (speed > 1.5) {
          p.vx *= 1.5 / speed
          p.vy *= 1.5 / speed
        }

        // Natural deceleration keeps movement smooth after touch ends
        p.vx *= 0.99
        p.vy *= 0.99

        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1
        p.x = Math.max(0, Math.min(w, p.x))
        p.y = Math.max(0, Math.min(h, p.y))

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = dark
          ? `rgba(147, 197, 253, ${p.opacity})`
          : `rgba(29, 78, 216, ${p.opacity * 0.85})`
        ctx.fill()

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const cx = p.x - p2.x
          const cy = p.y - p2.y
          const dist = Math.sqrt(cx * cx + cy * cy)

          if (dist < CONNECTION_DISTANCE) {
            const alpha = (1 - dist / CONNECTION_DISTANCE) * (dark ? 0.25 : 0.18)
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = dark
              ? `rgba(147, 197, 253, ${alpha})`
              : `rgba(29, 78, 216, ${alpha})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }

      // Cursor glow
      if (mouse.x > 0) {
        const r = MOUSE_REPEL_DISTANCE
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, r)
        gradient.addColorStop(0, dark ? "rgba(59,130,246,0.07)" : "rgba(37,99,235,0.04)")
        gradient.addColorStop(1, "rgba(0,0,0,0)")
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, r, 0, Math.PI * 2)
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animRef.current)
      clearTimeout(resizeTimer)
      cancelTouchFade()
      window.removeEventListener("resize", onResize)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseleave", onMouseLeave)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("touchend", onTouchEnd)
      window.removeEventListener("touchcancel", onTouchEnd)
    }
  }, [resolvedTheme, initParticles])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 1 }}
    />
  )
}
