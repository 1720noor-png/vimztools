import { useMemo, useState } from 'react'
import { FlaskConical, FlaskRound, Layers, Sparkles, Waves } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

type Combo = {
  top: string
  heart: string
  base: string
  mood: string
  ratio: string
  tried: string
}

const BASE_FAMILIES = ['Musky', 'Amber', 'Woody', 'Gourmand']
const HEART_FAMILIES = ['Floral', 'Spice', 'Aquatic']
const TOP_FAMILIES = ['Citrus', 'Green', 'Fruity', 'Aromatic']

const COMBO_CATALOG: Combo[] = [
  {
    top: 'Citrus',
    heart: 'Floral',
    base: 'Musky',
    mood: 'Crisp, clean and quietly magnetic for all-day office wear.',
    ratio: '3 sprays musky base, 2 floral heart, 1 citrus top',
    tried: 'spray the citrus top into the air and walk through it for a ghost layer',
  },
  {
    top: 'Citrus',
    heart: 'Spice',
    base: 'Amber',
    mood: 'Bright amber with a warm cinnamon lift, ideal for cozy evenings.',
    ratio: '2 sprays amber base, 2 spice heart, 2 citrus top',
    tried: 'hit the neck pulse points first, then mist citrus on the wrists',
  },
  {
    top: 'Green',
    heart: 'Floral',
    base: 'Woody',
    mood: 'Fresh-cut green over a soft floral, woody dry-down.',
    ratio: '3 sprays woody base, 2 floral heart, 1 green top',
    tried: 'layer the green on clothes, not skin, for extra staying power',
  },
  {
    top: 'Green',
    heart: 'Aquatic',
    base: 'Woody',
    mood: 'A dewy, rain-washed scent made for humid mornings.',
    ratio: '2 sprays woody base, 2 aquatic heart, 2 green top',
    tried: 'spritz the aquatic heart behind the ears only',
  },
  {
    top: 'Fruity',
    heart: 'Floral',
    base: 'Gourmand',
    mood: 'Juicy fruit melting into a dessert-like vanilla floral.',
    ratio: '2 sprays gourmand base, 3 floral heart, 1 fruity top',
    tried: 'dab the gourmand on hair ends for a soft scent trail',
  },
  {
    top: 'Fruity',
    heart: 'Spice',
    base: 'Amber',
    mood: 'Sweet fruit with a resinous, spicy warmth underneath.',
    ratio: '2 sprays amber base, 3 spice heart, 1 fruity top',
    tried: 'layer the spice on the chest so it blooms as you move',
  },
  {
    top: 'Aromatic',
    heart: 'Floral',
    base: 'Woody',
    mood: 'Herbal lavender notes over dry woods and fresh florals.',
    ratio: '3 sprays woody base, 2 floral heart, 1 aromatic top',
    tried: 'spray the aromatic top on a scarf for a crisp finish',
  },
  {
    top: 'Aromatic',
    heart: 'Spice',
    base: 'Musky',
    mood: 'A clean, skin-close scent with a warm spice kick.',
    ratio: '3 sprays musky base, 2 spice heart, 1 aromatic top',
    tried: 'apply the musky base to pulse points first and let it set',
  },
  {
    top: 'Citrus',
    heart: 'Aquatic',
    base: 'Musky',
    mood: 'Marine freshness lifted over clean white musk.',
    ratio: '2 sprays musky base, 2 aquatic heart, 2 citrus top',
    tried: 'shake the mix, citrus and aquatic meet best when fresh',
  },
  {
    top: 'Green',
    heart: 'Spice',
    base: 'Amber',
    mood: 'Earthy greens wrapped in amber and gentle spice.',
    ratio: '2 sprays amber base, 3 spice heart, 1 green top',
    tried: 'warm the spice heart with a wrist-to-wrist press',
  },
  {
    top: 'Fruity',
    heart: 'Aquatic',
    base: 'Gourmand',
    mood: 'A playful pear-marine blend with a sugary finish.',
    ratio: '2 sprays gourmand base, 2 aquatic heart, 2 fruity top',
    tried: 'keep the fruity top to one spray so it stays crisp',
  },
  {
    top: 'Aromatic',
    heart: 'Floral',
    base: 'Amber',
    mood: 'Soft amber florals lifted by herbal green aromatics.',
    ratio: '3 sprays amber base, 2 floral heart, 1 aromatic top',
    tried: 'layer florals on skin and amber on clothes for depth',
  },
]

const genericCombo = (top: string, heart: string, base: string): Combo => ({
  top,
  heart,
  base,
  mood: `A balanced ${base.toLowerCase()} base with a ${heart.toLowerCase()} heart and a ${top.toLowerCase()} opening.`,
  ratio: `3 sprays ${base.toLowerCase()} base, 2 ${heart.toLowerCase()} heart, 1 ${top.toLowerCase()} top`,
  tried: `mist the ${top.toLowerCase()} top layer from further out so it stays light`,
})

export default function PerfumeLayeringMatcher() {
  const [base, setBase] = useState('Musky')
  const [heart, setHeart] = useState('Floral')
  const [top, setTop] = useState('Citrus')

  const matched = useMemo(
    () =>
      COMBO_CATALOG.find((c) => c.base === base && c.heart === heart && c.top === top) ??
      genericCombo(top, heart, base),
    [base, heart, top],
  )

  const alternates = useMemo(() => {
    const others = COMBO_CATALOG.filter((c) => !(c.base === base && c.heart === heart && c.top === top))
    const byBase = others.filter((c) => c.base === base)
    const byHeart = byBase.length === 0 ? others.filter((c) => c.heart === heart) : []
    const pool = [...byBase, ...byHeart]
    return (pool.length > 0 ? pool : others).slice(0, 3)
  }, [base, heart, top])

  return (
    <>
      <Seo
        title="Perfume Layering Matcher - vimz Tools"
        description="Match perfume families into a balanced three-layer scent combo."
      />
      <ToolShell
        title="Perfume Layering Matcher"
        description="Match perfume families into a balanced three-layer scent combo."
        icon={<FlaskConical className="h-6 w-6" />}
        breadcrumb="Beauty & Care"
        instruction="Pick a base, heart and top family to see a curated layering mix."
      >
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Base family">
              <Select value={base} onChange={(e) => setBase(e.target.value)}>
                {BASE_FAMILIES.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </Select>
            </Field>
            <Field label="Heart family">
              <Select value={heart} onChange={(e) => setHeart(e.target.value)}>
                {HEART_FAMILIES.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </Select>
            </Field>
            <Field label="Top family">
              <Select value={top} onChange={(e) => setTop(e.target.value)}>
                {TOP_FAMILIES.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </Select>
            </Field>
          </div>
        </section>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <FlaskRound className="h-4 w-4 text-primary-600" /> Layered combo for you
          </h3>
          <p className="mt-3 text-base font-extrabold text-slate-900">
            {matched.top} → {matched.heart} → {matched.base}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">{matched.mood}</p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-2 rounded-xl bg-sky-50 px-3.5 py-3">
              <Waves className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
              <p className="text-sm font-medium text-sky-900">{matched.ratio}</p>
            </div>
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 px-3.5 py-3">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-sm font-medium text-amber-900">Try it: {matched.tried}</p>
            </div>
          </div>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800">
            <Layers className="h-4 w-4 text-primary-600" /> Alternate suggestions
          </h3>
          {alternates.length === 0 ? (
            <p className="text-xs text-slate-400">No alternates found for this trio.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {alternates.map((c) => (
                <div key={`${c.top}:${c.heart}:${c.base}`} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <p className="text-sm font-bold text-slate-800">{c.top} → {c.heart} → {c.base}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{c.mood}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-sky-700">
                    <Waves className="h-3.5 w-3.5" /> {c.ratio}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </ToolShell>
    </>
  )
}