export function money(n: number, digits = 2): string {
  return Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: digits }) : '—'
}

export function moneyWithSymbol(n: number, symbol = '$', digits = 2): string {
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  return Number.isFinite(n) ? `${sign}${symbol}${abs.toLocaleString(undefined, { maximumFractionDigits: digits })}` : '—'
}

export function percent(n: number, digits = 1): string {
  return Number.isFinite(n) ? `${n.toFixed(digits)}%` : '—'
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

export function round(n: number, digits = 0): number {
  const f = 10 ** digits
  return Math.round(n * f) / f
}

export function fmtHours(minutes: number): string {
  if (!Number.isFinite(minutes)) return '—'
  const m = Math.max(0, Math.round(minutes))
  const h = Math.floor(m / 60)
  const rem = m % 60
  return rem ? `${h}h ${rem}m` : `${h}h`
}

export function fmtCountdown(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds)) return '00:00'
  const s = Math.max(0, Math.round(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(sec).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

export function avg(nums: number[]): number {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0
}

export function sum(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0)
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 9)
}

export function toNumber(raw: string): number {
  const n = parseFloat(raw)
  return Number.isFinite(n) ? n : NaN
}