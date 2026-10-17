import { useMemo, useState } from 'react'
import { LayoutGrid } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { round, toNumber } from '../../../lib/numbers'

const ARRANGEMENTS = [
  { label: 'Center of room', scale: 0.8 },
  { label: 'Under sofa', scale: 0 },
  { label: 'Dining table', scale: 0.7 },
  { label: 'Bedroom sides', scale: 0 },
  { label: 'Hallway', scale: 0 },
]

const RECT_SIZES = [
  { w: 160, l: 230 },
  { w: 200, l: 290 },
  { w: 240, l: 340 },
  { w: 280, l: 365 },
  { w: 300, l: 400 },
]

const ROUND_SIZES = [150, 180, 220, 250]

export default function RugCarpetSize() {
  const [roomLen, setRoomLen] = useState('5')
  const [roomWid, setRoomWid] = useState('4')
  const [arrangement, setArrangement] = useState(0)
  const [shape, setShape] = useState('rectangle')

  const calc = useMemo(() => {
    const len = toNumber(roomLen)
    const wid = toNumber(roomWid)
    if (![len, wid].every(Number.isFinite) || len <= 0 || wid <= 0) return null
    const roomArea = len * wid
    let rugW = 0
    let rugL = 0
    if (arrangement === 0) {
      const s = Math.sqrt(ARRANGEMENTS[0].scale)
      rugW = wid * s
      rugL = len * s
    } else if (arrangement === 1) {
      rugW = wid - 1
      rugL = rugW - 0.9
    } else if (arrangement === 2) {
      const s = Math.sqrt(ARRANGEMENTS[2].scale)
      rugW = wid * s
      rugL = len * s
    } else if (arrangement === 3) {
      rugW = 0.6
      rugL = 1.2
    } else {
      rugW = Math.min(wid, 0.7)
      rugL = len * 0.85
    }
    const rugArea = rugW * rugL
    const cover = (rugArea / roomArea) * 100
    let standard = ''
    let standardArea = 0
    if (shape === 'rectangle') {
      let best = 0
      let bestDiff = Number.POSITIVE_INFINITY
      RECT_SIZES.forEach((s, i) => {
        const a = (s.w / 100) * (s.l / 100)
        const d = Math.abs(a - rugArea)
        if (d < bestDiff) {
          bestDiff = d
          best = i
          standardArea = a
        }
      })
      const s = RECT_SIZES[best]
      standard = `${s.w} cm × ${s.l} cm`
    } else {
      const dia = 2 * Math.sqrt(rugArea / Math.PI)
      let best = 0
      let bestDiff = Number.POSITIVE_INFINITY
      ROUND_SIZES.forEach((d, i) => {
        const diff = Math.abs(d / 100 - dia)
        if (diff < bestDiff) {
          bestDiff = diff
          best = i
        }
      })
      const d = ROUND_SIZES[best]
      standard = `${d / 100} m diameter`
      standardArea = Math.PI * ((d / 200) ** 2)
    }
    return {
      roomArea,
      rugW,
      rugL,
      rugArea,
      cover,
      standard,
      standardArea,
    }
  }, [roomLen, roomWid, arrangement, shape])

  const showVisual = shape === 'rectangle' && calc

  return (
    <>
      <Seo
        title="Rug & Carpet Size Calculator - vimz Tools"
        description="Find the right rug size for your room, sofa, dining table or bedroom and see coverage on a floor plan."
      />
      <ToolShell
        title="Rug & Carpet Size"
        description="Find the right rug size for any room arrangement."
        icon={<LayoutGrid className="h-6 w-6" />}
        breadcrumb="Household & Life"
        instruction="Enter room dimensions and an arrangement to get the recommended rug size."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Room details</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Room length (m)">
                  <TextInput type="number" min={0} step={0.1} value={roomLen} onChange={(e) => setRoomLen(e.target.value)} placeholder="e.g. 5" />
                </Field>
                <Field label="Room width (m)">
                  <TextInput type="number" min={0} step={0.1} value={roomWid} onChange={(e) => setRoomWid(e.target.value)} placeholder="e.g. 4" />
                </Field>
              </div>
              <Field label="Placement">
                <Select value={arrangement} onChange={(e) => setArrangement(Number(e.target.value))}>
                  {ARRANGEMENTS.map((a, i) => (
                    <option key={a.label} value={i}>
                      {a.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Rug shape">
                <Select value={shape} onChange={(e) => setShape(e.target.value)}>
                  <option value="rectangle">Rectangle</option>
                  <option value="round">Round</option>
                </Select>
              </Field>
            </div>
          </section>

          <div className="space-y-5">
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-500">Recommended rug</p>
              <p className="mt-2 text-4xl font-extrabold text-emerald-700">{calc ? calc.standard : '—'}</p>
              <p className="mt-2 text-sm text-emerald-500">for a {shape} layout near the {ARRANGEMENTS[arrangement].label.toLowerCase()}</p>
              <div className="mt-4 flex justify-center gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-600">
                  Covers {calc ? round(calc.cover) : '—'}%
                </span>
                {calc && (
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-600">
                    Rug {round(calc.rugW, 1)} m × {round(calc.rugL, 1)} m
                  </span>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-sm font-bold text-slate-800">Floor plan preview</h3>
              {calc ? (
                <div
                  className="relative w-full overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-100"
                  style={{ aspectRatio: `${roomWid} / ${roomLen}` }}
                >
                  <p className="absolute left-3 top-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Room {roomLen} m × {roomWid} m
                  </p>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-full w-full items-center justify-center">
                      {showVisual && (
                        <div
                          className="flex items-center justify-center rounded-xl border-2 border-emerald-500 bg-emerald-400/30 text-center"
                          style={{
                            width: `${(calc.rugW / toNumber(roomWid)) * 100}%`,
                            height: `${(calc.rugL / toNumber(roomLen)) * 100}%`,
                          }}
                        >
                          <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                            Rug {round(calc.rugW, 1)} × {round(calc.rugL, 1)}</span>
                        </div>
                      )}
                      {!showVisual && (
                        <div
                          className="aspect-square rounded-full border-2 border-emerald-500 bg-emerald-400/30"
                          style={{ width: `${(calc.rugW / toNumber(roomWid)) * 100}%` }}
                        >
                          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                            {calc.standard}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 text-xs text-slate-400">
                  Enter room size to draw the floor plan.
                </div>
              )}
            </section>
          </div>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-bold text-slate-800">Standard {shape} sizes</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-[11px] uppercase tracking-wide text-slate-400">
                  <th className="py-2 pr-3 font-semibold">Size</th>
                  <th className="py-2 pr-3 font-semibold">Area</th>
                  <th className="py-2 font-semibold">Fit</th>
                </tr>
              </thead>
              <tbody>
                {shape === 'rectangle'
                  ? RECT_SIZES.map((s) => {
                      const area = (s.w / 100) * (s.l / 100)
                      const match = calc && `${s.w} cm × ${s.l} cm` === calc.standard
                      return (
                        <tr key={s.w} className={match ? 'bg-emerald-50 text-emerald-700' : 'border-b border-slate-50'}>
                          <td className="py-2.5 pr-3 font-semibold">{s.w} cm × {s.l} cm</td>
                          <td className="py-2.5 pr-3">{area.toFixed(2)} m²</td>
                          <td className="py-2.5">
                            {match ? <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">recommended</span> : '—'}
                          </td>
                        </tr>
                      )
                    })
                  : ROUND_SIZES.map((d) => {
                      const area = Math.PI * ((d / 200) ** 2)
                      const match = calc && calc.standard === `${d / 100} m diameter`
                      return (
                        <tr key={d} className={match ? 'bg-emerald-50 text-emerald-700' : 'border-b border-slate-50'}>
                          <td className="py-2.5 pr-3 font-semibold">{d} cm diameter</td>
                          <td className="py-2.5 pr-3">{area.toFixed(2)} m²</td>
                          <td className="py-2.5">
                            {match ? <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">recommended</span> : '—'}
                          </td>
                        </tr>
                      )
                    })}
              </tbody>
            </table>
          </div>
        </section>
      </ToolShell>
    </>
  )
}