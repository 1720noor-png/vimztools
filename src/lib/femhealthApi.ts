export const FEMHEALTH_API = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api/v1').replace(/\/$/, '')

export type EpisodeSeverity = 'mild' | 'moderate' | 'severe' | 'very_severe'

export interface EndometriosisEpisode {
  id: number
  episode_date: string
  pelvic_pain: number
  period_pain: number
  non_cyclic_pain: boolean
  painful_intercourse: boolean
  painful_bowel: boolean
  heavy_periods: boolean
  bloating: boolean
  fatigue_score: number
  bleed_days: number | null
  cycle_length: number | null
  missed_work_days: number | null
  painkiller_used: boolean
  treatments: string | null
  notes: string | null
  average_pain: number
  symptom_count: number
  severity: EpisodeSeverity
  severity_label: string
}

export interface EndometriosisSummary {
  total_episodes: number
  avg_pelvic_pain: number
  avg_period_pain: number
  avg_fatigue: number
  highest_avg_pain: number
  severity_breakdown: Record<EpisodeSeverity, number>
  flagged_episodes: number
  total_missed_work_days: number
  dominant_symptoms: {
    non_cyclic_pain: number
    painful_intercourse: number
    painful_bowel: number
    heavy_periods: number
    bloating: number
  }
  latest_episode_date: string | null
  earliest_episode_date: string | null
}

export const SEVERITY_META: Record<
  EpisodeSeverity,
  { label: string; rank: number; tone: string; badge: string; bar: string }
> = {
  mild: {
    label: 'Mild',
    rank: 0,
    tone: 'border-emerald-200 bg-emerald-50',
    badge: 'bg-emerald-100 text-emerald-700',
    bar: 'bg-emerald-500',
  },
  moderate: {
    label: 'Moderate',
    rank: 1,
    tone: 'border-amber-200 bg-amber-50',
    badge: 'bg-amber-100 text-amber-700',
    bar: 'bg-amber-500',
  },
  severe: {
    label: 'Severe',
    rank: 2,
    tone: 'border-orange-200 bg-orange-50',
    badge: 'bg-orange-100 text-orange-700',
    bar: 'bg-orange-500',
  },
  very_severe: {
    label: 'Very severe',
    rank: 3,
    tone: 'border-rose-200 bg-rose-50',
    badge: 'bg-rose-100 text-rose-700',
    bar: 'bg-rose-600',
  },
}

export const SEVERITY_ORDER: EpisodeSeverity[] = ['mild', 'moderate', 'severe', 'very_severe']

async function fetchJson<T>(path: string, init?: RequestInit, timeoutMs = 6000): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${FEMHEALTH_API}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { Accept: 'application/json', ...init?.headers },
    })
    if (!res.ok) throw new Error(`API ${res.status} for ${path}`)
    return (await res.json()) as T
  } finally {
    clearTimeout(timer)
  }
}

export async function listEpisodes(): Promise<EndometriosisEpisode[]> {
  const res = await fetchJson<{ data: EndometriosisEpisode[] }>('/femhealth/endometriosis')
  return res.data
}

export async function getSummary(): Promise<EndometriosisSummary> {
  const res = await fetchJson<{ data: EndometriosisSummary }>('/femhealth/endometriosis/summary')
  return res.data
}

export async function createEpisode(
  input: Omit<EndometriosisEpisode, 'id' | 'average_pain' | 'symptom_count' | 'severity' | 'severity_label' | 'created_at' | 'updated_at'>,
): Promise<EndometriosisEpisode> {
  const res = await fetchJson<{ data: EndometriosisEpisode }>('/femhealth/endometriosis', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return res.data
}

export async function updateEpisode(
  id: number,
  input: Omit<EndometriosisEpisode, 'id' | 'average_pain' | 'symptom_count' | 'severity' | 'severity_label' | 'created_at' | 'updated_at'>,
): Promise<EndometriosisEpisode> {
  const res = await fetchJson<{ data: EndometriosisEpisode }>(`/femhealth/endometriosis/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return res.data
}

export async function deleteEpisode(id: number): Promise<void> {
  await fetchJson<{ message: string }>(`/femhealth/endometriosis/${id}`, { method: 'DELETE' })
}

export function computeLocalSeverity(pelvicPain: number, periodPain: number, symptomCount: number): EpisodeSeverity {
  const avg = (pelvicPain + periodPain) / 2
  if (avg >= 8 || symptomCount >= 5) return 'very_severe'
  if (avg >= 6 || symptomCount >= 4) return 'severe'
  if (avg >= 4 || symptomCount >= 2) return 'moderate'
  return 'mild'
}