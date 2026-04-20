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

const NUM_PARTICLES = 140
const CONNECTION_DISTANCE = 160
const MOUSE_REPEL_DISTANCE = 130
const MOUSE_ATTRACT_STRENGTH = 0.022

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const animRef = useRef<number>(0)
  const { resolvedTheme } = useTheme()

  const initParticles = useCallback((w: number, h: number) => {
    particlesRef.current = Array.from({ length: NUM_PARTICLES }, () => ({
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

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles(canvas.width, canvas.height)
    }
    resize()
    window.addEventListener("resize", resize)

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 }
    }
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseleave", onMouseLeave)

    const draw = () => {
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      const particles = particlesRef.current
      const mouse = mouseRef.current

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Mouse attraction
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

        // Move
        p.x += p.vx
        p.y += p.vy

        // Bounce walls
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1
        p.x = Math.max(0, Math.min(w, p.x))
        p.y = Math.max(0, Math.min(h, p.y))

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = dark
          ? `rgba(147, 197, 253, ${p.opacity})`    // blue-200 in dark
          : `rgba(29, 78, 216, ${p.opacity * 0.85})` // blue-700 in light — very visible
        ctx.fill()

        // Draw connections
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

      // Draw mouse glow if on screen
      if (mouse.x > 0) {
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, MOUSE_REPEL_DISTANCE)
        gradient.addColorStop(0, dark ? "rgba(59,130,246,0.07)" : "rgba(37,99,235,0.04)")
        gradient.addColorStop(1, "rgba(0,0,0,0)")
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, MOUSE_REPEL_DISTANCE, 0, Math.PI * 2)
        ctx.fill()
      }

      animRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseleave", onMouseLeave)
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
