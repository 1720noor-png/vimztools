import { clamp } from './guard.ts'

export function moodScoreCard(mood: number, energy: number, sleepHrs: number, stress: number): number | null {
  if (mood < 0 || mood > 10 || energy < 0 || energy > 10 || stress < 0 || stress > 10 || sleepHrs < 0 || sleepHrs > 14) return null
  const sleepPts = clamp((sleepHrs / 8) * 100, 0, 100)
  return Math.round(clamp((mood / 10) * 40 + (energy / 10) * 25 + sleepPts * 0.15 + (1 - stress / 10) * 20, 0, 100))
}

export function stressCopingCount(practices: boolean[]): number | null {
  if (!Array.isArray(practices)) return null
  return practices.reduce((n, p) => n + (p ? 1 : 0), 0)
}

export function resilienceScore(items: number[]): { total: number; pct: number; band: string } | null {
  if (!Array.isArray(items) || items.length !== 5) return null
  if (items.some((v) => v < 1 || v > 4)) return null
  const total = items.reduce((a, b) => a + b, 0)
  const pct = Math.round((total / 20) * 100)
  const band = total <= 10 ? 'Buffers are thin right now' : total <= 16 ? 'Moderate resilience' : 'Robust resilience - well tended'
  return { total, pct, band }
}

export function panicLog(episodesPerWeek: number, durationMin: number, intensity: number): number | null {
  if (episodesPerWeek < 0 || episodesPerWeek > 30 || durationMin < 0 || durationMin > 120 || intensity < 0 || intensity > 10) return null
  return Math.round(clamp(episodesPerWeek / 5 * 50 + (intensity / 10) * 30 + clamp(durationMin / 60, 0, 1) * 20, 0, 100))
}

export function ruminationScore(hoursPerDay: number, frequencyPerDay: number): number | null {
  if (hoursPerDay < 0 || hoursPerDay > 24 || frequencyPerDay < 0 || frequencyPerDay > 100) return null
  return Math.round(clamp((hoursPerDay / 12) * 60 + (frequencyPerDay / (frequencyPerDay + 10)) * 40, 0, 100))
}

export function digitalDetoxScore(minutesBetweenChecks: number, unpluggedMinutes: number): number | null {
  if (minutesBetweenChecks < 1 || minutesBetweenChecks > 120 || unpluggedMinutes < 0 || unpluggedMinutes > 480) return null
  return Math.round(clamp((minutesBetweenChecks / 120) * 60 + Math.min(unpluggedMinutes / 240, 1) * 40, 0, 100))
}

export function selfCompassionScore(kindness: number, mindfulness: number, commonHumanity: number): { total: number; pct: number } | null {
  if (kindness < 0 || kindness > 4 || mindfulness < 0 || mindfulness > 4 || commonHumanity < 0 || commonHumanity > 4) return null
  const total = kindness + mindfulness + commonHumanity
  return { total, pct: Math.round((total / 12) * 100) }
}

export function supportCheck(selfHarm: boolean, severeTwoWeeks: boolean, workImpact: boolean): { level: number; band: string } | null {
  let level = 0
  if (severeTwoWeeks) level += 1
  if (workImpact) level += 1
  if (selfHarm) level = 3
  const band =
    level === 0 ? 'Everyday stress - self-care is usually enough'
    : level === 1 ? 'Light support could help - talk to a counsellor'
    : level === 2 ? 'Professional support is recommended soon'
    : 'Urgent - reach out to a crisis line or emergency services now'
  return { level, band }
}

export { clamp }