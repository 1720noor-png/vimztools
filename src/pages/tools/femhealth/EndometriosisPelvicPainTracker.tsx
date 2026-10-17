import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  BarChart3,
  CalendarHeart,
  CheckCircle2,
  Clock,
  Info,
  PenLine,
  Trash2,
} from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import { Button, Field, Select, TextArea, TextInput } from '../../../components/ui/Fields'
import HybridLoader from '../../../components/ui/HybridLoader'
import {
  computeLocalSeverity,
  createEpisode,
  deleteEpisode,
  getSummary,
  listEpisodes,
  SEVERITY_META,
  SEVERITY_ORDER,
  updateEpisode,
  type EndometriosisEpisode,
  type EndometriosisSummary,
  type EpisodeSeverity,
} from '../../../lib/femhealthApi'
import { round } from '../../../lib/numbers'

type SeverityKey = 'non_cyclic_pain' | 'painful_intercourse' | 'painful_bowel' | 'heavy_periods' | 'bloating'

interface FormState {
  episode_date: string
  pelvic_pain: number
  period_pain: number
  fatigue_score: number
  tee_non_cyclic_pain: boolean
  tee_painful_intercourse: boolean
  tee_painful_bowel: boolean
  tee_heavy_periods: boolean
  tee_bloating: boolean
  tee_painkiller_used: boolean
  bleed_days: string
  cycle_length: string
  missed_work_days: string
  treatments: string
  notes: string
}

const SCORES = Array.from({ length: 11 }, (_, i) => i)

const BOOL_FIELDS: { key: keyof FormState; label: string; hint: string }[] = [
  { key: 'tee_non_cyclic_pain', label: 'Pain outside periods', hint: 'chronic pelvic pain between cycles' },
  { key: 'tee_painful_intercourse', label: 'Painful intercourse', hint: 'deep pain during intimacy' },
  { key: 'tee_painful_bowel', label: 'Painful bowel movements', hint: 'pain passing stool, worse around periods' },
  { key: 'tee_heavy_periods', label: 'Heavy periods', hint: 'flooding or long heavy flow' },
  { key: 'tee_bloating', label: 'Bloating or swelling', hint: 'pelvic bloating beyond normal cycle' },
  { key: 'tee_painkiller_used', label: 'Painkillers used', hint: 'needed medication for this episode' },
]

const SYMPTOM_KEYS: SeverityKey[] = ['non_cyclic_pain', 'painful_intercourse', 'painful_bowel', 'heavy_periods', 'bloating']

const SYMPTOM_LABELS: Record<SeverityKey, string> = {
  non_cyclic_pain: 'Pain outside periods',
  painful_intercourse: 'Painful intercourse',
  painful_bowel: 'Painful bowel',
  heavy_periods: 'Heavy periods',
  bloating: 'Bloating',
}

function todayIso(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

function emptyForm(): FormState {
  return {
    episode_date: todayIso(),
    pelvic_pain: 0,
    period_pain: 0,
    fatigue_score: 0,
    tee_non_cyclic_pain: false,
    tee_painful_intercourse: false,
    tee_painful_bowel: false,
    tee_heavy_periods: false,
    tee_bloating: false,
    tee_painkiller_used: false,
    bleed_days: '',
    cycle_length: '',
    missed_work_days: '',
    treatments: '',
    notes: '',
  }
}

function emptySummary(): EndometriosisSummary {
  return {
    total_episodes: 0,
    avg_pelvic_pain: 0,
    avg_period_pain: 0,
    avg_fatigue: 0,
    highest_avg_pain: 0,
    severity_breakdown: { mild: 0, moderate: 0, severe: 0, very_severe: 0 },
    flagged_episodes: 0,
    total_missed_work_days: 0,
    dominant_symptoms: { non_cyclic_pain: 0, painful_intercourse: 0, painful_bowel: 0, heavy_periods: 0, bloating: 0 },
    latest_episode_date: null,
    earliest_episode_date: null,
  }
}

function localSymptomCount(e: FormState): number {
  return BOOL_FIELDS.filter((f) => f.key !== 'tee_painkiller_used' && e[f.key]).length + (e.tee_painkiller_used ? 1 : 0)
}

function localSummary(list: EndometriosisEpisode[]): EndometriosisSummary {
  const sum = emptySummary()
  sum.total_episodes = list.length
  if (!list.length) return sum
  sum.avg_pelvic_pain = round(list.reduce((a, e) => a + e.pelvic_pain, 0) / list.length, 1)
  sum.avg_period_pain = round(list.reduce((a, e) => a + e.period_pain, 0) / list.length, 1)
  sum.avg_fatigue = round(list.reduce((a, e) => a + e.fatigue_score, 0) / list.length, 1)
  sum.highest_avg_pain = Math.max(...list.map((e) => e.average_pain))
  for (const s of SEVERITY_ORDER) sum.severity_breakdown[s] = list.filter((e) => e.severity === s).length
  sum.flagged_episodes = list.filter((e) => e.severity === 'severe' || e.severity === 'very_severe').length
  sum.total_missed_work_days = round(list.reduce((a, e) => a + (e.missed_work_days ?? 0), 0), 1)
  for (const k of SYMPTOM_KEYS) sum.dominant_symptoms[k] = list.filter((e) => e[k]).length
  const dates = list.map((e) => e.episode_date).sort()
  sum.earliest_episode_date = dates[0] ?? null
  sum.latest_episode_date = dates[dates.length - 1] ?? null
  return sum
}

export default function EndometriosisPelvicPainTracker() {
  const [episodes, setEpisodes] = useState<EndometriosisEpisode[]>([])
  const [summary, setSummary] = useState<EndometriosisSummary>(emptySummary())
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [busy, setBusy] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const nextLocalId = useRef(-1)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [epRows, sumRows] = await Promise.all([listEpisodes(), getSummary()])
        if (!cancelled) {
          setEpisodes(epRows)
          setSummary(sumRows)
        }
      } catch {
        if (!cancelled) {
          setOffline(true)
          setEpisodes([])
          setSummary(emptySummary())
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const sorted = useMemo(
    () => [...episodes].sort((a, b) => b.episode_date.localeCompare(a.episode_date)),
    [episodes],
  )

  const maxCount = useMemo(
    () => Math.max(1, ...Object.values(summary.severity_breakdown)),
    [summary.severity_breakdown],
  )

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyForm())
  }

  const startEdit = (ep: EndometriosisEpisode) => {
    setEditingId(ep.id)
    setForm({
      episode_date: ep.episode_date,
      pelvic_pain: ep.pelvic_pain,
      period_pain: ep.period_pain,
      fatigue_score: ep.fatigue_score,
      tee_non_cyclic_pain: ep.non_cyclic_pain,
      tee_painful_intercourse: ep.painful_intercourse,
      tee_painful_bowel: ep.painful_bowel,
      tee_heavy_periods: ep.heavy_periods,
      tee_bloating: ep.bloating,
      tee_painkiller_used: ep.painkiller_used,
      bleed_days: ep.bleed_days?.toString() ?? '',
      cycle_length: ep.cycle_length?.toString() ?? '',
      missed_work_days: ep.missed_work_days?.toString() ?? '',
      treatments: ep.treatments ?? '',
      notes: ep.notes ?? '',
    })
  }

  const buildPayload = () => {
    const bleed = parseInt(form.bleed_days, 10)
    const cycle = parseInt(form.cycle_length, 10)
    const missed = parseFloat(form.missed_work_days)
    return {
      episode_date: form.episode_date,
      pelvic_pain: form.pelvic_pain,
      period_pain: form.period_pain,
      fatigue_score: form.fatigue_score,
      non_cyclic_pain: form.tee_non_cyclic_pain,
      painful_intercourse: form.tee_painful_intercourse,
      painful_bowel: form.tee_painful_bowel,
      heavy_periods: form.tee_heavy_periods,
      bloating: form.tee_bloating,
      painkiller_used: form.tee_painkiller_used,
      bleed_days: Number.isFinite(bleed) && bleed >= 0 ? bleed : null,
      cycle_length: Number.isFinite(cycle) && cycle >= 10 ? cycle : null,
      missed_work_days: Number.isFinite(missed) && missed >= 0 ? missed : null,
      treatments: form.treatments.trim() || null,
      notes: form.notes.trim() || null,
    }
  }

  const refreshSummary = (list: EndometriosisEpisode[]) => {
    setSummary(localSummary(list))
    if (offline) return
    getSummary()
      .then(setSummary)
      .catch(() => setSummary(localSummary(list)))
  }

  const applySaved = (list: EndometriosisEpisode[]) => {
    setEpisodes(list)
    refreshSummary(list)
  }

  const save = async () => {
    if (!form.episode_date) return
    setBusy(true)
    const payload = buildPayload()
    let savedOnline = false
    if (!offline) {
      try {
        let next: EndometriosisEpisode
        if (editingId !== null) {
          next = await updateEpisode(editingId, payload)
          applySaved(episodes.map((e) => (e.id === editingId ? next : e)))
        } else {
          next = await createEpisode(payload)
          applySaved([...episodes, next])
        }
        savedOnline = true
      } catch {
        setOffline(true)
      }
    }
    if (!savedOnline) {
      const symptomCount = localSymptomCount(form)
      const severity: EpisodeSeverity = computeLocalSeverity(form.pelvic_pain, form.period_pain, symptomCount)
      const meta = SEVERITY_META[severity]
      const local: EndometriosisEpisode = {
        id: nextLocalId.current--,
        ...payload,
        average_pain: round((form.pelvic_pain + form.period_pain) / 2, 1),
        symptom_count: symptomCount,
        severity,
        severity_label: meta.label,
      }
      if (editingId !== null) {
        applySaved(episodes.map((e) => (e.id === editingId ? { ...local, id: e.id } : e)))
      } else {
        applySaved([...episodes, local])
      }
    }
    setBusy(false)
    resetForm()
  }

  const remove = async (id: number) => {
    if (!window.confirm('Delete this episode log?')) return
    setBusy(true)
    if (!offline) {
      try {
        await deleteEpisode(id)
      } catch {
        setOffline(true)
      }
    }
    applySaved(episodes.filter((e) => e.id !== id))
    setBusy(false)
  }

  return (
    <>
      <Seo
        title="Endometriosis & Pelvic Pain Severity Tracker - vimz Tools"
        description="Log pelvic pain episodes and review a clinical severity summary over time."
      />
      <ToolShell
        title="Endometriosis & Pelvic Pain Severity Tracker"
        description="Log each painful episode with symptom details and track how your severity pattern shifts over time."
        icon={<CalendarHeart className="h-6 w-6" />}
        breadcrumb="FemHealth & PMOS"
        instruction="Add each episode with your pain scores and symptoms to build a severity timeline"
      >
        {offline && (
          <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm font-medium text-amber-800">
              Offline mode: the live episode database is unreachable, so logs stay on this device until the connection
              returns.
            </p>
          </div>
        )}

        {loading ? (
          <HybridLoader label="Loading episode history…" />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                <CalendarHeart className="mx-auto mb-1 h-5 w-5 text-slate-400" />
                <p className="text-[11px] font-semibold uppercase text-slate-400">Logged episodes</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-800">{summary.total_episodes}</p>
              </div>
              <div className="rounded-2xl border border-fuchsia-200 bg-fuchsia-50 p-4 text-center">
                <Clock className="mx-auto mb-1 h-5 w-5 text-fuchsia-500" />
                <p className="text-[11px] font-semibold uppercase text-fuchsia-500">Avg pelvic pain</p>
                <p className="mt-1 text-2xl font-extrabold text-fuchsia-700">{summary.avg_pelvic_pain}/10</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
                <AlertTriangle className="mx-auto mb-1 h-5 w-5 text-amber-600" />
                <p className="text-[11px] font-semibold uppercase text-amber-500">Flagged episodes</p>
                <p className="mt-1 text-2xl font-extrabold text-amber-700">{summary.flagged_episodes}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                <BarChart3 className="mx-auto mb-1 h-5 w-5 text-slate-400" />
                <p className="text-[11px] font-semibold uppercase text-slate-400">Missed work (days)</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-800">{summary.total_missed_work_days}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                  <BarChart3 className="h-4 w-4 text-fuchsia-600" /> Severity distribution
                </h3>
                <div className="space-y-3">
                  {SEVERITY_ORDER.map((s) => {
                    const meta = SEVERITY_META[s]
                    const count = summary.severity_breakdown[s] ?? 0
                    return (
                      <div key={s}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-600">{meta.label}</span>
                          <span className="font-extrabold text-slate-800">{count}</span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                          <div className={`h-2.5 rounded-full ${meta.bar}`} style={{ width: `${(count / maxCount) * 100}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {SYMPTOM_KEYS.map((k) => {
                    const count = summary.dominant_symptoms[k]
                    const top = count === Math.max(...Object.values(summary.dominant_symptoms)) && count > 0
                    return (
                      <span
                        key={k}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${top ? 'bg-fuchsia-100 text-fuchsia-700' : 'bg-slate-100 text-slate-600'}`}
                      >
                        {SYMPTOM_LABELS[k]} {count}
                      </span>
                    )
                  })}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <CalendarHeart className="h-4 w-4 text-primary-600" /> {editingId !== null ? 'Edit episode' : 'Log an episode'}
                  </h3>
                  {editingId !== null && (
                    <Button variant="ghost" className="px-2 py-1 text-xs" onClick={resetForm} disabled={busy}>
                      Cancel
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Episode date">
                    <TextInput type="date" value={form.episode_date} max={todayIso()} onChange={(e) => set('episode_date', e.target.value)} />
                  </Field>
                  <Field label="Fatigue (0-10)">
                    <Select value={form.fatigue_score} onChange={(e) => set('fatigue_score', Number(e.target.value))}>
                      {SCORES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Pelvic pain (0-10)">
                    <Select value={form.pelvic_pain} onChange={(e) => set('pelvic_pain', Number(e.target.value))}>
                      {SCORES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Period pain (0-10)">
                    <Select value={form.period_pain} onChange={(e) => set('period_pain', Number(e.target.value))}>
                      {SCORES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>

                <div className="mt-3 space-y-1.5">
                  {BOOL_FIELDS.map((f) => (
                    <label key={f.key} className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2">
                      <span>
                        <span className="block text-xs font-bold text-slate-700">{f.label}</span>
                        <span className="block text-[10px] text-slate-400">{f.hint}</span>
                      </span>
                      <button
                        onClick={() => set(f.key, !form[f.key])}
                        className={`relative h-5 w-9 rounded-full transition ${form[f.key] ? 'bg-fuchsia-600' : 'bg-slate-300'}`}
                        aria-label={f.label}
                      >
                        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${form[f.key] ? 'left-[18px]' : 'left-0.5'}`} />
                      </button>
                    </label>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-3">
                  <Field label="Bleed days">
                    <TextInput type="number" min={0} max={60} value={form.bleed_days} onChange={(e) => set('bleed_days', e.target.value)} placeholder="e.g. 6" />
                  </Field>
                  <Field label="Cycle length">
                    <TextInput type="number" min={10} max={60} value={form.cycle_length} onChange={(e) => set('cycle_length', e.target.value)} placeholder="e.g. 28" />
                  </Field>
                  <Field label="Missed work">
                    <TextInput type="number" min={0} step="0.5" max={60} value={form.missed_work_days} onChange={(e) => set('missed_work_days', e.target.value)} placeholder="e.g. 1.5" />
                  </Field>
                </div>

                <div className="mt-3 space-y-3">
                  <Field label="Treatments used">
                    <TextInput value={form.treatments} onChange={(e) => set('treatments', e.target.value)} placeholder="e.g. NSAIDs, heat pad" />
                  </Field>
                  <Field label="Notes">
                    <TextArea rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Anything else about this episode" />
                  </Field>
                  <Button variant="primary" className="w-full" onClick={save} disabled={busy}>
                    {busy ? 'Saving…' : editingId !== null ? 'Save changes' : 'Add episode'}
                  </Button>
                </div>
              </section>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
                <Clock className="h-4 w-4 text-primary-600" /> Episode timeline
              </h3>
              {sorted.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-xs text-slate-400">
                  No episodes logged yet. Add one with the form above.
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {sorted.map((ep) => {
                    const meta = SEVERITY_META[ep.severity]
                    return (
                      <li key={ep.id} className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-40">
                            <p className="text-sm font-bold text-slate-800">{ep.episode_date}</p>
                            <p className="text-[11px] text-slate-400">
                              {ep.bleed_days ? `Bleeding ${ep.bleed_days}d` : 'No bleeding noted'}
                              {ep.missed_work_days ? ` · missed ${ep.missed_work_days}d work` : ''}
                            </p>
                          </div>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.badge}`}>
                            {ep.severity_label} · {ep.average_pain}/10
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                          <div className="rounded-lg bg-slate-50 px-2.5 py-1.5">
                            <span className="text-slate-400">Pelvic · </span>
                            <span className="font-semibold text-slate-600">{ep.pelvic_pain}/10</span>
                          </div>
                          <div className="rounded-lg bg-slate-50 px-2.5 py-1.5">
                            <span className="text-slate-400">Period · </span>
                            <span className="font-semibold text-slate-600">{ep.period_pain}/10</span>
                          </div>
                          <div className="rounded-lg bg-slate-50 px-2.5 py-1.5">
                            <span className="text-slate-400">Symptoms · </span>
                            <span className="font-semibold text-slate-600">{ep.symptom_count}</span>
                          </div>
                        </div>
                        {ep.treatments && <p className="mt-2 text-xs text-slate-500">Treatments: {ep.treatments}</p>}
                        {ep.notes && <p className="mt-1 text-xs text-slate-500">{ep.notes}</p>}
                        <div className="mt-3 flex gap-2">
                          <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => startEdit(ep)} disabled={busy}>
                            <PenLine className="h-3.5 w-3.5" /> Edit
                          </Button>
                          <Button variant="danger" className="px-3 py-1.5 text-xs" onClick={() => remove(ep.id)} disabled={busy}>
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </Button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>

            <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white p-4">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <p className="text-xs leading-relaxed text-slate-500">
                This tracker stores your episode logs in the vimz database so your history persists, but it is not medical
                software. Use it to prepare better conversations with your gynaecologist about your symptom pattern.
              </p>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <p className="text-xs leading-relaxed text-emerald-800">
                Your episode notes are stored privately with your log and are never shared publicly. Read the privacy
                policy for full details.
              </p>
            </div>
          </div>
        )}
      </ToolShell>
    </>
  )
}