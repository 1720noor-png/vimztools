import { useState } from 'react'
import { Thermometer, Plus, Trash2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import { Button } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { uid } from '../../../lib/utils'

interface LogEntry {
  id: string
  name: string
  onset: string
  severity: string
}

function durationDays(onset: string): number {
  if (!onset) return -1
  const d = new Date(onset)
  if (Number.isNaN(d.getTime())) return -1
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / (24 * 60 * 60 * 1000)))
}

export default function SymptomDurationLog() {
  const [name, setName] = useState('')
  const [onset, setOnset] = useState('')
  const [severity, setSeverity] = useState('5')
  const [entries, setEntries] = useState<LogEntry[]>([])

  const add = () => {
    if (!name.trim()) return
    setEntries((prev) => [{ id: uid(), name: name.trim(), onset, severity }, ...prev])
    setName('')
    setOnset('')
    setSeverity('5')
  }

  const remove = (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id))
  const needsFollowUp = entries.some((e) => durationDays(e.onset) > 14)
  const severityNum = (s: string) => Number(s) || 0

  return (
    <>
      <Seo
        title="Symptom Duration & Severity Log - vimz Tools"
        description="Log when a symptom started and its severity so you can track duration over time."
      />
      <ToolShell
        title="Symptom Duration & Severity Log"
        description="Keeps a local log of symptom name, start date and severity so you can see how long things have been going on."
        icon={<Thermometer className="h-6 w-6" />}
        breadcrumb="Health / Symptoms"
        instruction="Add a symptom and its start date to track duration."
        guideSteps={[
          { title: 'Describe the symptom', text: 'A short label, e.g. "headache" or "dry cough".' },
          { title: 'Add the start date and severity', text: 'When it began and how bothersome it is (1-10).' },
          { title: 'Track over time', text: 'Each entry shows days since onset so you can spot patterns.' },
        ]}
        guideTips={[
          'This log is for personal tracking and doctor discussions, not diagnosis.',
          'Duration matters: symptoms lasting more than two weeks usually deserve attention.',
          'Call emergency services if symptoms are severe, sudden or involve breathing trouble, chest pain or confusion.',
        ]}
        tipsTitle="Quick Health Tips"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Add a symptom</h3>
            <div className="space-y-3">
              <Field label="Symptom">
                <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. headache" />
              </Field>
              <Field label="Start date">
                <TextInput type="date" value={onset} onChange={(e) => setOnset(e.target.value)} />
              </Field>
              <Field label="Severity (1-10)">
                <TextInput type="number" min={1} max={10} value={severity} onChange={(e) => setSeverity(e.target.value)} />
              </Field>
              <Button onClick={add} className="w-full">
                <Plus className="h-4 w-4" /> Add to log
              </Button>
            </div>
          </section>

          <div className="space-y-5 lg:col-span-2">
            <section className="rounded-2xl border border-rose-100 bg-white dark:border-rose-900/30 dark:bg-slate-900 p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Your log ({entries.length})</h3>
              {entries.length === 0 ? (
                <p className="text-sm text-slate-400">No symptoms logged yet - add one on the left.</p>
              ) : (
                <div className="space-y-3">
                  {entries.map((e) => {
                    const days = durationDays(e.onset)
                    return (
                      <div key={e.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-800">{e.name}</p>
                          <p className="text-xs text-slate-500">
                            {days >= 0 ? `${days} day${days === 1 ? '' : 's'} since onset` : 'Start date not set'}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                              severityNum(e.severity) >= 7
                                ? 'bg-rose-100 text-rose-700'
                                : severityNum(e.severity) >= 4
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {e.severity}/10
                          </span>
                          <button
                            onClick={() => remove(e.id)}
                            aria-label={`Remove ${e.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            {entries.length > 0 && (
              <section className={`rounded-2xl border p-5 ${needsFollowUp ? 'border-amber-300 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
                <h3 className="mb-2 text-sm font-bold text-slate-800">Trend check</h3>
                <p className="text-sm leading-relaxed text-slate-700">
                  {needsFollowUp
                    ? 'At least one symptom has lasted more than 14 days - worth mentioning to a healthcare professional.'
                    : 'No logged symptom has passed the two-week mark yet. Keep tracking if anything changes.'}
                </p>
              </section>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}