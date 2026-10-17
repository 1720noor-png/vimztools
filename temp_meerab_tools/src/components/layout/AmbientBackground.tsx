import { useEffect, useRef } from 'react'
import { useTheme } from './ThemeProvider'

// Rich ambient scroll ramps: [light] iridescent pastel harmony, [dark] deep charcoal with luminous colored under-glow
const LIGHT = ['#f5f3ff', '#fff1f2', '#f0f9ff', '#f0fdf4', '#fefce8', '#f5f3ff']
const DARK = ['#0b0f17', '#111827', '#1a1633', '#0d222b', '#0b1f1c', '#0f172a']

type RGB = [number, number, number]

function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}

function mix(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

function toCss(c: RGB) {
  return `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`
}

export default function AmbientBackground() {
  const ref = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const ramp: RGB[] = (theme === 'dark' ? DARK : LIGHT).map(hexToRgb)
    const n = ramp.length

    const pick = (p: number) => {
      const x = Math.max(0, Math.min(n - 1.0001, p * (n - 1)))
      const i = Math.floor(x)
      const t = x - i
      return mix(ramp[i], ramp[Math.min(i + 1, n - 1)], t)
    }

    const paint = () => {
      const doc = document.documentElement
      const max = Math.max(doc.scrollHeight - window.innerHeight, 1)
      const p = Math.min(window.scrollY / max, 1)
      const top = pick(p - 0.08)
      const mid = pick(p)
      const bot = pick(p + 0.08)
      el.style.background = `linear-gradient(152deg, ${toCss(top)} 0%, ${toCss(mid)} 48%, ${toCss(bot)} 100%)`
      raf = 0
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint)
    }

    paint()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [theme])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="ambient-bg pointer-events-none fixed inset-0 -z-50 overflow-hidden"
      style={{ willChange: 'background', transition: 'background 0.8s ease' }}
    >
      {/* Ambient Mesh Glow Orbs — never flat, never plain white on any route */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 h-[34rem] w-[34rem] rounded-full blur-3xl opacity-35 dark:opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.28) 0%, rgba(99, 102, 241, 0.12) 50%, transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute top-1/4 -right-36 h-[38rem] w-[38rem] rounded-full blur-3xl opacity-35 dark:opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(244, 63, 94, 0.24) 0%, rgba(14, 165, 233, 0.15) 50%, transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-36 left-1/3 h-[36rem] w-[36rem] rounded-full blur-3xl opacity-30 dark:opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, rgba(245, 158, 11, 0.12) 50%, transparent 70%)',
        }}
      />
    </div>
  )
}