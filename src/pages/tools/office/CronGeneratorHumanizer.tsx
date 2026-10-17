import { useMemo, useState } from 'react'
import { AlertTriangle, CalendarClock, CheckCircle2, TimerReset, Wand2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import Seo from '../../../components/ui/Seo'
import CodeBlock from '../../../components/ui/CodeBlock'
import { Button, Field, Select, TextArea } from '../../../components/ui/Fields'

const DOW_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const PRESETS = [
  { label: 'Every minute', cron: '* * * * *' },
  { label: 'Hourly', cron: '0 * * * *' },
  { label: 'Daily at midnight', cron: '0 0 * * *' },
  { label: 'Daily 09:30', cron: '30 9 * * *' },
  { label: 'Weekly Mon 09:00', cron: '0 9 * * 1' },
  { label: 'Monthly 1st noon', cron: '0 12 1 * *' },
  { label: 'Quarterly', cron: '0 0 1 */3 *' },
]

function splitField(field: string, max: number): string | null {
  if (!field.trim()) return 'Field is empty.'
  if (!/^[0-9*,/-\sA-Z]+$/i.test(field)) return `Invalid characters in "${field}".`
  const pieces = field.split(',')
  for (const piece of pieces) {
    const m = piece.match(/^(\d+|\*)(?:-(\d+|\*))?(?:\/(\d+))?$/)
    if (!m) return `Cannot read "${piece}".`
    const a = m[1] === '*' ? undefined : Number(m[1])
    const b = m[2] === '*' ? undefined : m[2] !== undefined ? Number(m[2]) : undefined
    const step = m[3] ? Number(m[3]) : undefined
    if (step !== undefined && step < 1) return 'Step must be 1 or greater.'
    if (a !== undefined && a > max) return `Value ${a} is out of range (0-${max}).`
    if (b !== undefined && b > max) return `Value ${b} is out of range (0-${max}).`
    if (a !== undefined && b !== undefined && b < a) return 'Range end is smaller than range start.'
  }
  return null
}

function dayName(dow: number): string {
  return DOW_NAMES[dow % 7]
}

function describeFieldMin(field: string): string {
  if (field === '*') return 'every minute'
  if (/^\*\//.test(field)) return `every ${field.slice(2)} minutes`
  if (field.includes(',')) return `at minutes ${field}`
  const m = field.match(/^(\d+)-(\d+)$/)
  if (m) return `between minutes ${m[1]} and ${m[2]}`
  const s = field.match(/^(\d+)-(\d+)\/(\d+)$/)
  if (s) return `every ${s[3]} minutes between ${s[1]} and ${s[2]}`
  return `at minute ${field}`
}

function describeFieldHour(field: string): string {
  if (field === '*') return 'every hour'
  if (/^\*\//.test(field)) return `every ${field.slice(2)} hours`
  if (field.includes(',')) return `at hours ${field}`
  const m = field.match(/^(\d+)-(\d+)$/)
  if (m) return `between hours ${m[1]} and ${m[2]}`
  const s = field.match(/^(\d+)-(\d+)\/(\d+)$/)
  if (s) return `every ${s[3]} hours between ${s[1]} and ${s[2]}`
  return `at hour ${field}`
}

function describeFieldDom(field: string): string {
  if (field === '*') return 'every day of the month'
  if (field === 'L') return 'on the last day of the month'
  if (/^\*\//.test(field)) return `every ${field.slice(2)} days`
  if (field.includes(',')) return `on days ${field} of the month`
  const m = field.match(/^(\d+)-(\d+)$/)
  if (m) return `on days ${m[1]} through ${m[2]} of the month`
  if (/^(\d+)[WL]$/.test(field)) {
    const n = field.replace(/[WL]/, '')
    return `on the closest weekday to day ${n}`
  }
  return `on day ${field} of the month`
}

function describeFieldMonth(field: string): string {
  if (field === '*') return 'every month'
  if (/^\*\//.test(field)) return `every ${field.slice(2)} months`
  if (field.includes(',')) return field.split(',').map((m) => MONTH_NAMES[Number(m) - 1] ?? m).join(', ')
  if (/^\d+$/.test(field)) return MONTH_NAMES[Number(field) - 1] ?? field
  return `in ${field}`
}

function describeFieldDow(field: string): string {
  if (field === '*') return 'every day of the week'
  if (field === '0' || field === '7') return 'on Sundays'
  if (field.includes(',')) return `on ${field.split(',').map((d) => dayName(Number(d))).join(', ')}`
  if (/^\d$/.test(field)) return `on ${dayName(Number(field))}s`
  return `on days ${field} of the week`
}

function humanize(expr: string): { hexpr: string; phrase: string; error: string | null } {
  const parts = expr.trim().split(/\s+/)
  if (parts.length !== 5) {
    return { hexpr: '', phrase: '', error: 'A cron expression needs exactly 5 space-separated fields (minute hour day-of-month month day-of-week).' }
  }
  const limits = [59, 23, 31, 12, 6]
  for (let i = 0; i < parts.length; i += 1) {
    const err = splitField(parts[i], limits[i])
    if (err) return { hexpr: '', phrase: '', error: `Field ${i + 1} (${parts[i]}): ${err}` }
  }
  const [min, hour, dom, month, dow] = parts
  let phrase = ''
  if (min === '*' && hour === '*') {
    phrase = 'Runs every minute.'
  } else {
    const clauses: string[] = []
    clauses.push(describeFieldMin(min))
    if (hour !== '*') clauses.push(describeFieldHour(hour))
    if (dom !== '*') clauses.push(describeFieldDom(dom))
    if (month !== '*') clauses.push(describeFieldMonth(month))
    if (dow !== '*') clauses.push(describeFieldDow(dow))
    let body = clauses.join(', ')
    body = body.charAt(0).toUpperCase() + body.slice(1)
    phrase = `Runs ${body}.`
  }
  return { hexpr: expr.trim(), phrase, error: null }
}

export default function CronGeneratorHumanizer() {
  const [mode, setMode] = useState<'builder' | 'humanize'>('builder')
  const [minute, setMinute] = useState('0')
  const [hour, setHour] = useState('9')
  const [dayOfMonth, setDayOfMonth] = useState('*')
  const [month, setMonth] = useState('*')
  const [dayOfWeek, setDayOfWeek] = useState('*')
  const [cronInput, setCronInput] = useState('0 9 * * *')

  const built = useMemo(() => `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`, [minute, hour, dayOfMonth, month, dayOfWeek])
  const builtInfo = useMemo(() => humanize(built), [built])
  const customInfo = useMemo(() => humanize(cronInput), [cronInput])

  return (
    <>
      <Seo
        title="CRON Expression Generator & Humanizer - vimz Tools"
        description="Build five-field cron schedules with a visual picker and translate any cron expression into plain English."
      />
      <ToolShell
        title="CRON Generator & Humanizer"
        description="Compose cron schedules with dropdowns and presets, then read any expression as a plain-English sentence."
        icon={<TimerReset className="h-6 w-6" />}
        breadcrumb="Office Utilities"
        instruction="Pick a schedule or paste a five-field cron to see it explained instantly"
      >
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setMode('builder')}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${mode === 'builder' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            Builder
          </button>
          <button
            onClick={() => setMode('humanize')}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${mode === 'humanize' ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            Humanize
          </button>
        </div>

        {mode === 'builder' ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">Schedule fields</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Field label="Minute (0-59)">
                  <Select value={minute} onChange={(e) => setMinute(e.target.value)}>
                    <option value="*">any / *</option>
                    {Array.from({ length: 60 }, (_, i) => (
                      <option key={i} value={String(i)}>
                        {i}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Hour (0-23)">
                  <Select value={hour} onChange={(e) => setHour(e.target.value)}>
                    <option value="*">any / *</option>
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={String(i)}>
                        {i}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Day of month (1-31)">
                  <Select value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)}>
                    <option value="*">any / *</option>
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1)}>
                        {i + 1}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Month">
                  <Select value={month} onChange={(e) => setMonth(e.target.value)}>
                    <option value="*">any / *</option>
                    {MONTH_NAMES.map((name, i) => (
                      <option key={name} value={String(i + 1)}>
                        {i + 1} - {name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Day of week (0=Sun)">
                  <Select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)}>
                    <option value="*">any / *</option>
                    {DOW_NAMES.map((name, i) => (
                      <option key={name} value={String(i)}>
                        {i} - {name}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <h3 className="mb-2 mt-5 text-sm font-bold text-slate-800">Presets</h3>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => {
                      const [m, h, d, mo, dw] = p.cron.split(' ')
                      setMinute(m)
                      setHour(h)
                      setDayOfMonth(d)
                      setMonth(mo)
                      setDayOfWeek(dw)
                    }}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${built === p.cron ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-primary-300'}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
                  <CalendarClock className="h-4 w-4 text-primary-600" /> Expression
                </div>
                <p className="font-mono text-lg font-bold leading-relaxed text-slate-900">{built}</p>
              </div>
              {builtInfo.error ? (
                <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                  <p className="text-xs text-rose-700">{builtInfo.error}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 shrink-0" /> {builtInfo.phrase}
                </div>
              )}
              <CodeBlock title="Copy expression" code={built} lang="plain" />
              <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">
                Behind the scenes this maps to the standard five-field cron used by cron, crontab, Vercel and most
                schedulers. Some services add a sixth seconds field - this generator targets the five-field format.
              </p>
            </section>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">Any cron expression</h3>
              <Field label="Five-field cron">
                <TextArea rows={3} value={cronInput} onChange={(e) => setCronInput(e.target.value)} placeholder="0 0 1 */3 *" className="font-mono" />
              </Field>
              <p className="mt-2 text-[11px] text-slate-400">Fields: minute hour day-of-month month day-of-week.</p>
              <Button variant="ghost" className="mt-2 px-3 py-1 text-xs" onClick={() => setCronInput('*/15 9-17 * * 1-5')}>
                <Wand2 className="h-3.5 w-3.5" /> Try every 15 min weekdays
              </Button>
            </section>

            <section className="space-y-4">
              {customInfo.error ? (
                <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                  <p className="break-all text-xs text-rose-700">{customInfo.error}</p>
                </div>
              ) : (
                <>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Plain English</div>
                    <p className="text-lg font-bold leading-relaxed text-slate-900">{customInfo.phrase}</p>
                  </div>
                  <div className="grid grid-cols-5 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-white text-center">
                    {['min', 'hour', 'dom', 'mon', 'dow'].map((b, i) => (
                      <div key={b} className="px-1 py-3">
                        <p className="text-[10px] font-bold uppercase text-slate-400">{b}</p>
                        <p className="font-mono text-sm font-bold text-slate-700">{customInfo.hexpr.split(/\s+/)[i] ?? '-'}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          </div>
        )}
      </ToolShell>
    </>
  )
}