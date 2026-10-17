import { useMemo, useState } from 'react'
import { Flower2, Leaf, Pipette, Sparkles, SwatchBook } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

type Shade = { name: string; hex: string; intensities: string[] }

type UndertoneData = {
  key: string
  label: string
  niceWith: string
  avoid: string
  lipShades: Shade[]
  blushShades: Shade[]
}

const INTENSITIES = ['nude', 'medium', 'vivid'] as const

const UNDERTONES: UndertoneData[] = [
  {
    key: 'cool',
    label: 'Cool (pink-red)',
    niceWith: 'Silver jewellery, blue-reds and icy pink tones bring out a rosy glow.',
    avoid: 'Yellow-orange lippies and peachy bronzers can fight a cool undertone.',
    lipShades: [
      { name: 'Blue Red', hex: '#c62f4e', intensities: ['nude', 'medium', 'vivid'] },
      { name: 'Powder Pink', hex: '#e9b7c4', intensities: ['nude'] },
      { name: 'Rosewood', hex: '#a45a74', intensities: ['nude', 'medium'] },
      { name: 'Berry Stain', hex: '#8e2f63', intensities: ['medium', 'vivid'] },
      { name: 'Raspberry', hex: '#b3224e', intensities: ['medium', 'vivid'] },
      { name: 'Deep Plum', hex: '#5e2451', intensities: ['vivid'] },
    ],
    blushShades: [
      { name: 'Baby Pink', hex: '#f4c7d3', intensities: ['nude'] },
      { name: 'Dusty Rose', hex: '#c98a9b', intensities: ['nude', 'medium'] },
      { name: 'Rose', hex: '#d97a97', intensities: ['medium', 'vivid'] },
      { name: 'Mauve', hex: '#b0708a', intensities: ['nude', 'medium'] },
      { name: 'Berry Pop', hex: '#c14b77', intensities: ['vivid'] },
      { name: 'Fuchsia', hex: '#d63384', intensities: ['vivid'] },
    ],
  },
  {
    key: 'warm',
    label: 'Warm (golden-yellow)',
    niceWith: 'Gold jewellery, coral and terracotta melt smoothly into warm skin.',
    avoid: 'Blue-magenta pinks can sit grey against a warm undertone.',
    lipShades: [
      { name: 'Coral', hex: '#ff6b4a', intensities: ['nude', 'medium', 'vivid'] },
      { name: 'Peachy Nude', hex: '#e3a588', intensities: ['nude', 'medium'] },
      { name: 'Terracotta', hex: '#c65f3d', intensities: ['medium', 'vivid'] },
      { name: 'Warm Apricot', hex: '#f2a06b', intensities: ['nude', 'medium'] },
      { name: 'Spiced Brown', hex: '#8a4a32', intensities: ['medium', 'vivid'] },
      { name: 'Brick', hex: '#a63d2f', intensities: ['vivid'] },
    ],
    blushShades: [
      { name: 'Peach', hex: '#ffb36b', intensities: ['nude', 'medium', 'vivid'] },
      { name: 'Warm Sand', hex: '#ddb892', intensities: ['nude'] },
      { name: 'Apricot', hex: '#f2a06b', intensities: ['nude', 'medium'] },
      { name: 'Copper', hex: '#c46a3d', intensities: ['medium', 'vivid'] },
      { name: 'Burnt Sienna', hex: '#c25d3a', intensities: ['vivid'] },
    ],
  },
  {
    key: 'neutral',
    label: 'Neutral (balanced)',
    niceWith: 'Both gold and silver work, so rose and terracotta bridge the middle nicely.',
    avoid: 'Extremes in either direction can clash with a balanced undertone.',
    lipShades: [
      { name: 'Mauve Nude', hex: '#b0849a', intensities: ['nude', 'medium', 'vivid'] },
      { name: 'Rose Beige', hex: '#c98f94', intensities: ['nude', 'medium'] },
      { name: 'Muted Coral', hex: '#df8d78', intensities: ['nude', 'medium'] },
      { name: 'Brick Rose', hex: '#b4576a', intensities: ['medium', 'vivid'] },
      { name: 'Dried Rose', hex: '#a9767c', intensities: ['nude', 'medium'] },
      { name: 'Wine', hex: '#7c2f40', intensities: ['vivid'] },
    ],
    blushShades: [
      { name: 'Dusty Mauve', hex: '#c49bb0', intensities: ['nude', 'medium', 'vivid'] },
      { name: 'Blush Sand', hex: '#d9b3a7', intensities: ['nude'] },
      { name: 'Peach Rose', hex: '#e09a86', intensities: ['nude', 'medium'] },
      { name: 'Rosewood', hex: '#ad6b78', intensities: ['medium', 'vivid'] },
      { name: 'Terracotta Rose', hex: '#bd6f5f', intensities: ['medium', 'vivid'] },
    ],
  },
  {
    key: 'olive',
    label: 'Olive (green-gold)',
    niceWith: 'Earth tones, muted berries and clay colours flatter green-tinted skin.',
    avoid: 'Pastel pinks and chalky nudes wash out an olive complexion.',
    lipShades: [
      { name: 'Muted Mauve', hex: '#9c7a8a', intensities: ['nude', 'medium', 'vivid'] },
      { name: 'Brick Nude', hex: '#a9624f', intensities: ['nude', 'medium'] },
      { name: 'Clay', hex: '#a85b45', intensities: ['medium', 'vivid'] },
      { name: 'Spiced Plum', hex: '#6f4460', intensities: ['medium', 'vivid'] },
      { name: 'Tomato', hex: '#c9413b', intensities: ['vivid'] },
    ],
    blushShades: [
      { name: 'Warm Terracotta', hex: '#cf7d62', intensities: ['nude', 'medium', 'vivid'] },
      { name: 'Earthy Peach', hex: '#e0a67f', intensities: ['nude', 'medium'] },
      { name: 'Muted Rose', hex: '#bb8295', intensities: ['nude', 'medium'] },
      { name: 'Rust', hex: '#b25e3f', intensities: ['medium', 'vivid'] },
      { name: 'Sienna', hex: '#a4633c', intensities: ['vivid'] },
    ],
  },
]

function ShadeChip({ shade }: { shade: Shade }) {
  return (
    <span className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700">
      <span
        className="h-8 w-8 shrink-0 rounded-lg border border-slate-200"
        style={{ backgroundColor: shade.hex }}
        aria-hidden="true"
      />
      {shade.name}
    </span>
  )
}

export default function UndertoneShadeMatcher() {
  const [undertone, setUndertone] = useState('cool')
  const [intensity, setIntensity] = useState('nude')

  const selected = UNDERTONES.find((u) => u.key === undertone) ?? UNDERTONES[0]

  const lipShades = useMemo(
    () => selected.lipShades.filter((s) => s.intensities.includes(intensity)),
    [selected, intensity],
  )

  const blushShades = useMemo(
    () => selected.blushShades.filter((s) => s.intensities.includes(intensity)),
    [selected, intensity],
  )

  return (
    <>
      <Seo
        title="Undertone Shade Matcher - vimz Tools"
        description="Find lipstick and blush shade families that match your skin undertone."
      />
      <ToolShell
        title="Undertone Shade Matcher"
        description="Find lipstick and blush shade families that match your skin undertone."
        icon={<SwatchBook className="h-6 w-6" />}
        breadcrumb="Beauty & Care"
        instruction="Pick your undertone and colour intensity to see matching shade families."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <Field label="Undertone">
              <Select value={undertone} onChange={(e) => setUndertone(e.target.value)}>
                {UNDERTONES.map((u) => (
                  <option key={u.key} value={u.key}>{u.label}</option>
                ))}
              </Select>
            </Field>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <Field label="Colour intensity">
              <Select value={intensity} onChange={(e) => setIntensity(e.target.value)}>
                {INTENSITIES.map((i) => (
                  <option key={i} value={i}>{i.charAt(0).toUpperCase() + i.slice(1)}</option>
                ))}
              </Select>
            </Field>
          </section>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-slate-800">
              <Pipette className="h-4 w-4 text-primary-600" /> Lipstick picks
            </h3>
            <p className="mb-4 text-xs text-slate-400">Shades tuned to {selected.label}.</p>
            <div className="flex flex-wrap gap-2">
              {lipShades.map((s) => (
                <ShadeChip key={s.name} shade={s} />
              ))}
            </div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-slate-800">
              <Flower2 className="h-4 w-4 text-primary-600" /> Blush picks
            </h3>
            <p className="mb-4 text-xs text-slate-400">Cream or powder, tapped low on the cheeks.</p>
            <div className="flex flex-wrap gap-2">
              {blushShades.map((s) => (
                <ShadeChip key={s.name} shade={s} />
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-emerald-800">
              <Sparkles className="h-4 w-4" /> Nice with {selected.label}
            </h3>
            <p className="text-sm leading-relaxed text-emerald-900">{selected.niceWith}</p>
          </section>
          <section className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-rose-800">
              <Leaf className="h-4 w-4" /> Best to skip
            </h3>
            <p className="text-sm leading-relaxed text-rose-900">{selected.avoid}</p>
          </section>
        </div>
      </ToolShell>
    </>
  )
}