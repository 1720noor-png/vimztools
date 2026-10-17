import { useEffect, useState } from 'react'
import { CalendarDays, Flag, Hourglass, Timer } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { clamp } from '../../../lib/numbers'

const R = 54
const CIRC = 2 * Math.PI * R

export default function ExamCountdown() {
  const [examDate, setExamDate] = useState('')
  const [subject, setSubject] = useState('')
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const parsed = examDate ? new Date(examDate + 'T23:59:59').getTime() : NaN
  const diffSec = Number.isFinite(parsed) ? (parsed - now) / 1000 : NaN
  const past = Number.isFinite(diffSec) && diffSec <= 0
  const safe = Math.max(0, Number.isFinite(diffSec) ? diffSec : 0)
  const days = Math.floor(safe / 86400)
  const hh = Math.floor((safe % 86400) / 3600)
  const mm = Math.floor((safe % 3600) / 60)
  const ss = Math.floor(safe % 60)
  const ring = clamp(Number.isFinite(parsed) ? days / 28 : 0, 0, 1)

  return (
    <>
      <Seo title="Exam Countdown - vimz Tools" description="See exactly how long until exam day with a live countdown timer." />
      <ToolShell
        title="Exam Countdown"
        description="See exactly how long until exam day with a live timer."
        icon={<Timer className="h-6 w-6" />}
        breadcrumb="Study & Education"
        instruction="Set your exam date and let the countdown keep you on track."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-1">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Exam details</h3>
            <div className="grid grid-cols-1 gap-3">
              <Field label="Exam date">
                <TextInput type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
              </Field>
              <Field label="Subject">
                <TextInput value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Physics" />
              </Field>
              {examDate && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                  <CalendarDays className="mr-1 inline h-3.5 w-3.5 text-slate-400" />
                  {new Date(examDate + 'T12:00:00').toDateString()}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2">
            {!examDate ? (
              <div className="flex h-full min-h-[260px] flex-col items-center justify-center text-center">
                <Hourglass className="mb-3 h-10 w-10 text-slate-200" />
                <p className="text-sm text-slate-400">Pick an exam date to start the live countdown.</p>
              </div>
            ) : past ? (
              <div className="flex h-full min-h-[260px] flex-col items-center justify-center text-center">
                <Flag className="mb-3 h-10 w-10 text-rose-300" />
                <p className="text-sm font-semibold text-rose-600">Exam day has passed</p>
                <p className="mt-1 text-xs text-slate-400">Choose a new date to restart the countdown.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-10">
                <div className="relative">
                  <svg viewBox="0 0 128 128" className="h-44 w-44">
                    <circle cx="64" cy="64" r={R} fill="none" strokeWidth="10" className="stroke-slate-100" />
                    <circle
                      cx="64"
                      cy="64"
                      r={R}
                      fill="none"
                      strokeWidth="10"
                      strokeLinecap="round"
                      className="stroke-primary-500 transition-all"
                      strokeDasharray={CIRC}
                      strokeDashoffset={CIRC * (1 - ring)}
                      transform="rotate(-90 64 64)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-extrabold text-primary-700">{days}</span>
                    <span className="text-xs font-semibold uppercase text-slate-400">{days === 1 ? 'day' : 'days'}</span>
                  </div>
                </div>
                <div className="text-center">
                  <span className="inline-block rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-primary-700">
                    {subject.trim() || 'General exam'}
                  </span>
                  <p className="mt-4 font-mono text-5xl font-bold tracking-widest text-slate-800 sm:text-6xl">
                    {String(hh).padStart(2, '0')}:{String(mm).padStart(2, '0')}:{String(ss).padStart(2, '0')}
                  </p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">hours · minutes · seconds</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </ToolShell>
    </>
  )
}