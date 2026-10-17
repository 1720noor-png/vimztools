export function fin(v: unknown): number | null {
  const n = typeof v === 'string' ? Number.parseFloat(v) : typeof v === 'number' ? v : Number.NaN
  return Number.isFinite(n) ? n : null
}

export function safeDiv(a: number, b: number): number | null {
  if (!Number.isFinite(b) || b === 0) return null
  return a / b
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v))
}