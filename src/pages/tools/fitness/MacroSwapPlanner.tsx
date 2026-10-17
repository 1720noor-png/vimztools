import { useMemo, useState } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { round, toNumber } from '../../../lib/numbers'

export default function MacroSwapPlanner() {
  const [oP, setOP] = useState('')
  const [oC, setOC] = useState('')
  const [oF, setOF] = useState('')
  const [rP, setRP] = useState('')
  const [rC, setRC] = useState('')
  const [rF, setRF] = useState('')

  const calc = useMemo(() => {
    const op = toNumber(oP)
    const oc = toNumber(oC)
    const of = toNumber(oF)
    const rp = toNumber(rP)
    const rc = toNumber(rC)
    const rf = toNumber(rF)
    if (![op, oc, of, rp, rc, rf].every(Number.isFinite) || op < 0 || oc < 0 || of < 0 || rp <= 0 || rc <= 0 || rf <= 0) return null
    const wP = (op / rp) * 100
    const wC = (oc / rc) * 100
    const wF = (of / rf) * 100
    const kcal = (wP / 100) * (rp * 4 + rc * 4 + rf * 9)
    return { wP, wC, wF, kcal }
  }, [oP, oC, oF, rP, rC, rF])

  return (
    <>
      <Seo
        title="Dietary Macro Swap & Food Portion Replacer - vimz Tools"
        description="Calculates equivalent portion sizes when swapping ingredients to maintain macro targets."
      />
      <ToolShell
        title="Dietary Macro Swap & Food Portion Replacer"
        description="Calculates equivalent portion sizes when swapping an ingredient while keeping your original protein, carb, and fat targets."
        icon={<ArrowLeftRight className="h-6 w-6" />}
        breadcrumb="Fitness"
        instruction="Enter original food and replacement macros to find the swap portion."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Original food (whole portion)</h3>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Protein g">
                <TextInput type="number" min={0} value={oP} onChange={(e) => setOP(e.target.value)} placeholder="e.g. 20" />
              </Field>
              <Field label="Carbs g">
                <TextInput type="number" min={0} value={oC} onChange={(e) => setOC(e.target.value)} placeholder="e.g. 30" />
              </Field>
              <Field label="Fat g">
                <TextInput type="number" min={0} value={oF} onChange={(e) => setOF(e.target.value)} placeholder="e.g. 8" />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Replacement (per 100 g)</h3>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Protein g">
                <TextInput type="number" min={0} value={rP} onChange={(e) => setRP(e.target.value)} placeholder="e.g. 30" />
              </Field>
              <Field label="Carbs g">
                <TextInput type="number" min={0} value={rC} onChange={(e) => setRC(e.target.value)} placeholder="e.g. 10" />
              </Field>
              <Field label="Fat g">
                <TextInput type="number" min={0} value={rF} onChange={(e) => setRF(e.target.value)} placeholder="e.g. 12" />
              </Field>
            </div>
          </section>
        </div>

        {calc ? (
          <>
            <section className="mt-6 rounded-2xl border border-primary-200 bg-primary-50 p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-primary-500">Replacement portion (protein-matched)</p>
              <p className="mt-2 text-6xl font-extrabold text-primary-800">{round(calc.wP, 0)} g</p>
              <p className="mt-2 text-sm text-primary-600">
                About {round(calc.kcal, 0)} kcal with these macros
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-sky-700">Carbs match: {round(calc.wC, 0)} g</span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-amber-700">Fat match: {round(calc.wF, 0)} g</span>
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Original vs replacement (at {round(calc.wP, 0)} g)</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-[11px] font-bold uppercase text-slate-400">
                    <th className="py-2">Macro</th>
                    <th className="py-2">Original (g)</th>
                    <th className="py-2">Replacement (g)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { name: 'Protein', orig: toNumber(oP), rep: (calc.wP / 100) * toNumber(rP) },
                    { name: 'Carbs', orig: toNumber(oC), rep: (calc.wP / 100) * toNumber(rC) },
                    { name: 'Fat', orig: toNumber(oF), rep: (calc.wP / 100) * toNumber(rF) },
                  ].map((row) => (
                    <tr key={row.name}>
                      <td className="py-2 font-semibold text-slate-700">{row.name}</td>
                      <td className="py-2 font-bold text-slate-800">{round(row.orig, 1)}</td>
                      <td className="py-2 font-bold text-primary-700">{round(row.rep, 1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        ) : (
          <p className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
            Fill in both foods to compute the matching swap portion.
          </p>
        )}
      </ToolShell>
    </>
  )
}