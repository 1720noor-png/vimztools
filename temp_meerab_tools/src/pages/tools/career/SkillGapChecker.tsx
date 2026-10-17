import { useMemo, useState } from 'react'
import { GraduationCap, Plus, Trash, TrendingUp } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput, Select } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { percent, uid } from '../../../lib/numbers'

type Level = 'have' | 'partial' | 'missing'
type Skill = { id: string; name: string; level: Level }

const LEVELS: Level[] = ['have', 'partial', 'missing']

export default function SkillGapChecker() {
  const [role, setRole] = useState('')
  const [skills, setSkills] = useState<Skill[]>([])
  const [draft, setDraft] = useState({ name: '', level: 'have' as Level })

  const add = () => {
    if (!draft.name.trim()) return
    setSkills((p) => [...p, { id: uid(), name: draft.name.trim(), level: draft.level }])
    setDraft({ name: '', level: 'have' })
  }
  const remove = (id: string) => setSkills((p) => p.filter((x) => x.id !== id))
  const setLevel = (id: string, level: Level) =>
    setSkills((p) => p.map((x) => (x.id === id ? { ...x, level } : x)))

  const result = useMemo(() => {
    const total = skills.length
    const have = skills.filter((s) => s.level === 'have').length
    const partial = skills.filter((s) => s.level === 'partial').length
    const missing = skills.filter((s) => s.level === 'missing').length
    const mastery = total ? ((have + partial * 0.5) / total) * 100 : 0
    const gaps = skills.filter((s) => s.level !== 'have')
    return { total, have, partial, missing, mastery, gaps }
  }, [skills])

  const levelColor: Record<Level, string> = {
    have: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    partial: 'border-amber-200 bg-amber-50 text-amber-700',
    missing: 'border-rose-200 bg-rose-50 text-rose-700',
  }

  return (
    <>
      <Seo title="Skill Gap Checker - vimz Tools" description="Compare your skills to a target role and find gaps." />
      <ToolShell
        title="Skill Gap Checker"
        description="Compare your skills to a target role and find gaps."
        icon={<GraduationCap className="h-6 w-6" />}
        breadcrumb="Career & Work"
        instruction="List role skills and mark which ones you already have."
      >
        <section className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_1fr_150px_auto]">
          <Field label="Target role">
            <TextInput value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Senior Frontend Engineer" />
          </Field>
          <Field label="Skill">
            <TextInput value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. GraphQL" />
          </Field>
          <Field label="Current level">
            <Select value={draft.level} onChange={(e) => setDraft({ ...draft, level: e.target.value as Level })}>
              <option value="have">Have it</option>
              <option value="partial">Partial</option>
              <option value="missing">Missing</option>
            </Select>
          </Field>
          <div className="flex items-end">
            <Button onClick={add}><Plus className="h-4 w-4" /> Add</Button>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
            <h3 className="mb-1 text-sm font-bold text-slate-800">Role skills</h3>
            <p className="mb-4 text-xs text-slate-400">{role ? `Required for: ${role}` : 'Add skills to compare against the target role.'}</p>
            {skills.length === 0 ? (
              <p className="text-xs text-slate-400">No skills added yet.</p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-400">
                    <tr>
                      <th className="px-4 py-2.5">Skill</th>
                      <th className="px-4 py-2.5">Level</th>
                      <th className="px-4 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {skills.map((s) => (
                      <tr key={s.id}>
                        <td className="px-4 py-2.5 font-semibold text-slate-700">{s.name}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex gap-1.5">
                            {LEVELS.map((lv) => (
                              <button
                                key={lv}
                                onClick={() => setLevel(s.id, lv)}
                                className={`rounded-lg border px-2.5 py-1 text-xs font-semibold capitalize transition ${s.level === lv ? levelColor[lv] : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                              >
                                {lv}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <button onClick={() => remove(s.id)} className="rounded-md p-1 text-slate-300 transition hover:text-rose-500" aria-label="Remove">
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <div className="space-y-5">
            <section className="rounded-2xl border border-primary-200 bg-primary-50 p-6 text-center">
              <GraduationCap className="mx-auto mb-2 h-7 w-7 text-primary-600" />
              <p className="text-[11px] font-semibold uppercase text-primary-500">Role mastery</p>
              <p className="mt-1 text-5xl font-extrabold text-primary-800">{percent(result.mastery, 0)}</p>
              <p className="mt-2 text-xs text-primary-500">{result.have} have · {result.partial} partial · {result.missing} missing</p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-rose-500" />
                <h4 className="text-sm font-bold text-slate-800">Gap list ({result.gaps.length})</h4>
              </div>
              {result.gaps.length === 0 ? (
                <p className="text-sm text-emerald-600">No gaps — you're fully covered!</p>
              ) : (
                <ul className="space-y-2">
                  {result.gaps.map((g) => (
                    <li key={g.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm">
                      <span className="font-semibold text-slate-700">{g.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold capitalize ${levelColor[g.level]}`}>{g.level}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h4 className="mb-2 text-sm font-bold text-slate-800">Next to learn</h4>
              <p className="text-sm leading-relaxed text-slate-600">
                {result.total === 0
                  ? 'Add skills to get personalised recommendations.'
                  : `Prioritise the ${result.missing} missing skill${result.missing === 1 ? '' : 's'} first, especially any that appear in job descriptions for ${role || 'the target role'}.`}
              </p>
            </section>
          </div>
        </div>
      </ToolShell>
    </>
  )
}