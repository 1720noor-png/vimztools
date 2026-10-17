import { useMemo, useState } from 'react'
import { Thermometer } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

const FABRICS = [
  { tempC: 204, dial: 3, steam: true, wash: 'hot', tumble: 'yes', bleach: 'yes', note: 'Iron while still damp for crisp collars and creases.' },
  { tempC: 230, dial: 3, steam: true, wash: 'hot', tumble: 'yes', bleach: 'yes', note: 'Best ironed very hot with steam, and on the wrong side to avoid shine.' },
  { tempC: 150, dial: 1, steam: false, wash: 'cold', tumble: 'no', bleach: 'non-chlorine', note: 'Silk scorches easily. Always use a press cloth and a dry low heat iron.' },
  { tempC: 150, dial: 1, steam: true, wash: 'cold', tumble: 'no', bleach: 'non-chlorine', note: 'Wool needs gentle steam and lots of patience. Do not press hard creases in.' },
  { tempC: 150, dial: 1, steam: false, wash: 'warm', tumble: 'no', bleach: 'no', note: 'Polyester melts fast. Use the synthetic setting with no steam.' },
  { tempC: 130, dial: 1, steam: false, wash: 'warm', tumble: 'low', bleach: 'no', note: 'Nylon is heat sensitive so keep the iron barely warm and dry.' },
  { tempC: 120, dial: 1, steam: false, wash: 'cold', tumble: 'no', bleach: 'no', note: 'Rayon wrinkles easily and scorches at medium heat. Iron on low.' },
  { tempC: 190, dial: 2, steam: true, wash: 'hot', tumble: 'yes', bleach: 'yes', note: 'Denim takes a hot iron with steam for sharp seams.' },
  { tempC: 110, dial: 1, steam: false, wash: 'cold', tumble: 'no', bleach: 'non-chlorine', note: 'Lycra loses stretch if heated. Press at very low heat on the wrong side.' },
  { tempC: 120, dial: 1, steam: false, wash: 'cold', tumble: 'no', bleach: 'non-chlorine', note: 'Acetate dissolves with heat. Cool iron only, and test a hidden seam first.' },
]

const washCls: Record<string, string> = {
  cold: 'bg-sky-50 text-sky-600 border-sky-200',
  warm: 'bg-amber-50 text-amber-600 border-amber-200',
  hot: 'bg-rose-50 text-rose-600 border-rose-200',
}

const tumbleCls: Record<string, string> = {
  yes: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  no: 'bg-slate-100 text-slate-500 border-slate-200',
  low: 'bg-amber-50 text-amber-600 border-amber-200',
}

const bleachCls: Record<string, string> = {
  yes: 'bg-rose-50 text-rose-600 border-rose-200',
  no: 'bg-slate-100 text-slate-500 border-slate-200',
  'non-chlorine': 'bg-amber-50 text-amber-600 border-amber-200',
}

export default function FabricCareIroning() {
  const [fabric, setFabric] = useState(0)

  const row = useMemo(() => FABRICS[fabric], [fabric])

  return (
    <>
      <Seo
        title="Fabric Care Ironing Guide - vimz Tools"
        description="Iron temperature, steam and care settings for cotton, linen, silk, wool, polyester and more fabrics."
      />
      <ToolShell
        title="Fabric Care Ironing"
        description="Iron temperature and care settings for every fabric."
        icon={<Thermometer className="h-6 w-6" />}
        breadcrumb="Household & Life"
        instruction="Pick a fabric to see the safe iron dial, temperature and care badges."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Pick a fabric</h3>
            <Field label="Fabric">
              <Select value={fabric} onChange={(e) => setFabric(Number(e.target.value))}>
                {FABRICS.map((_, i) => (
                  <option key={i} value={i}>
                    {['Cotton', 'Linen', 'Silk', 'Wool', 'Polyester', 'Nylon', 'Rayon', 'Denim', 'Lycra', 'Acetate'][i]}
                  </option>
                ))}
              </Select>
            </Field>
            <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
              Move the mock iron dial to your fabric setting before touching the fabric with the iron.
            </p>
          </section>

          <div className="space-y-5">
            <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-rose-400">
                {['Cotton', 'Linen', 'Silk', 'Wool', 'Polyester', 'Nylon', 'Rayon', 'Denim', 'Lycra', 'Acetate'][fabric]} iron temperature
              </p>
              <p className="mt-2 text-6xl font-extrabold text-rose-600">
                {row.tempC}
                <span className="text-3xl font-bold text-rose-400"> °C</span>
              </p>
              <p className="mt-1 text-sm text-rose-400">≈ {Math.round(row.tempC * 9 / 5 + 32)}°F</p>

              <div className="mt-5 flex items-center justify-center gap-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="text-center">
                    <div
                      className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 text-lg font-extrabold transition ${
                        row.dial >= n ? 'border-rose-500 bg-rose-500 text-white' : 'border-slate-300 bg-white text-slate-400'
                      }`}
                    >
                      {n}
                    </div>
                    <p className="mt-1 text-[10px] font-semibold uppercase text-slate-400">
                      {n === 1 ? 'low' : n === 2 ? 'med' : 'high'}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs font-semibold text-rose-500">Dial setting {row.dial} of 3</p>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">Care badges</h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className={`rounded-xl border px-3 py-2 text-center ${washCls[row.wash]}`}>
                  <p className="text-[10px] font-bold uppercase opacity-70">Wash</p>
                  <p className="text-sm font-extrabold capitalize">{row.wash}</p>
                </div>
                <div className={`rounded-xl border px-3 py-2 text-center ${tumbleCls[row.tumble]}`}>
                  <p className="text-[10px] font-bold uppercase opacity-70">Tumble dry</p>
                  <p className="text-sm font-extrabold capitalize">{row.tumble}</p>
                </div>
                <div className={`rounded-xl border px-3 py-2 text-center ${bleachCls[row.bleach]}`}>
                  <p className="text-[10px] font-bold uppercase opacity-70">Bleach</p>
                  <p className="text-sm font-extrabold capitalize">{row.bleach}</p>
                </div>
                <div className={`rounded-xl border px-3 py-2 text-center ${row.steam ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                  <p className="text-[10px] font-bold uppercase opacity-70">Steam</p>
                  <p className="text-sm font-extrabold">{row.steam ? 'Yes' : 'No'}</p>
                </div>
              </div>
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-700">
                <span className="text-lg leading-none">!</span>
                <p>{row.note}</p>
              </div>
            </section>
          </div>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-bold text-slate-800">Fabric quick reference</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-[11px] uppercase tracking-wide text-slate-400">
                  <th className="py-2 pr-3 font-semibold">Fabric</th>
                  <th className="py-2 pr-3 font-semibold">Temp</th>
                  <th className="py-2 pr-3 font-semibold">Dial</th>
                  <th className="py-2 pr-3 font-semibold">Steam</th>
                  <th className="py-2 pr-3 font-semibold">Wash</th>
                  <th className="py-2 pr-3 font-semibold">Tumble</th>
                  <th className="py-2 font-semibold">Bleach</th>
                </tr>
              </thead>
              <tbody>
                {FABRICS.map((f, i) => (
                  <tr key={i} className={i === fabric ? 'bg-primary-50 text-primary-700' : 'border-b border-slate-50'}>
                    <td className="py-2.5 pr-3 font-semibold">{['Cotton', 'Linen', 'Silk', 'Wool', 'Polyester', 'Nylon', 'Rayon', 'Denim', 'Lycra', 'Acetate'][i]}</td>
                    <td className="py-2.5 pr-3">{f.tempC}°C</td>
                    <td className="py-2.5 pr-3">{f.dial}</td>
                    <td className="py-2.5 pr-3">{f.steam ? 'Yes' : 'No'}</td>
                    <td className="py-2.5 pr-3 capitalize">{f.wash}</td>
                    <td className="py-2.5 pr-3 capitalize">{f.tumble}</td>
                    <td className="py-2.5 capitalize">{f.bleach}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </ToolShell>
    </>
  )
}