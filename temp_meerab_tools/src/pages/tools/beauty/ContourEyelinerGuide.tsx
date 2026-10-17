import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Compass, Paintbrush, PenLine, Sparkles } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Field, Select } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

type FaceGuide = { shade: string[]; highlight: string[] }
type EyeGuide = { style: string; tip: string; mistake: string }

const FACE_SHAPES = ['Round', 'Oval', 'Square', 'Heart', 'Long']
const EYE_TYPES = ['Almond', 'Round', 'Hooded', 'Monolid']

const FACE_GUIDES: Record<string, FaceGuide> = {
  Round: {
    shade: [
      'Sides of the forehead near the hairline',
      'A soft hollow under each cheekbone',
      'The jawline up to the ears for definition',
    ],
    highlight: [
      'Centre of the forehead',
      'Bridge of the nose',
      'A small triangle under each eye',
    ],
  },
  Oval: {
    shade: [
      'Just under the cheekbones, blended toward the ear',
      'A touch at the temples for structure',
    ],
    highlight: [
      'Above the cheekbones',
      'Centre of the forehead',
      'Centre of the chin',
    ],
  },
  Square: {
    shade: [
      'Corners of the forehead',
      'The lower jaw angles, softened with small strokes',
    ],
    highlight: [
      'Centre of the forehead',
      'Above the cheekbones',
      'A slim line down the nose',
    ],
  },
  Heart: {
    shade: [
      'Sides of the forehead to narrow the top',
      'The tip of the chin to shorten it',
    ],
    highlight: [
      'Triangles under the eyes',
      'Sides of the forehead',
      'Centre of the lips',
    ],
  },
  Long: {
    shade: [
      'Top of the forehead near the hairline',
      'The chin tip',
    ],
    highlight: [
      'Across the cheekbones',
      'The sides of the forehead',
      'The sides of the jaw',
    ],
  },
}

const EYE_GUIDES: Record<string, EyeGuide> = {
  Almond: {
    style: 'A classic thin-to-medium line with a gentle outward wing.',
    tip: 'Trace the natural lash line first, then extend the wing along the lower lid angle.',
    mistake: 'Piling on a thick line that hides the almond shape.',
  },
  Round: {
    style: 'Tightline the upper waterline with a soft outer flick.',
    tip: 'Keep the wing short and sharp, and smudge the lower lash line sparingly.',
    mistake: 'Lining the full lower lash line, which rounds the eye even more.',
  },
  Hooded: {
    style: 'A thin line that stays above the crease shadow, thickest at the outer third.',
    tip: 'Draw with the eye open using a felt or angled brush so the line stays visible.',
    mistake: 'A bold wing that folds into the crease and smears on the lid.',
  },
  Monolid: {
    style: 'A soft gradient line that builds outward without a hard edge.',
    tip: 'Smudge upward in short strokes so the liner reads more like shadow.',
    mistake: 'A crisp single line with no blend, which looks abrupt.',
  },
}

export default function ContourEyelinerGuide() {
  const [faceShape, setFaceShape] = useState('Round')
  const [eyeType, setEyeType] = useState('Almond')

  const face = useMemo(() => FACE_GUIDES[faceShape] ?? FACE_GUIDES.Round, [faceShape])
  const eye = useMemo(() => EYE_GUIDES[eyeType] ?? EYE_GUIDES.Almond, [eyeType])

  return (
    <>
      <Seo
        title="Contour and Eyeliner Guide - vimz Tools"
        description="Get contour placement and eyeliner techniques for your face shape and eye type."
      />
      <ToolShell
        title="Contour and Eyeliner Guide"
        description="Get contour placement and eyeliner techniques for your face shape and eye type."
        icon={<Compass className="h-6 w-6" />}
        breadcrumb="Beauty & Care"
        instruction="Select your face shape and eye type for a tailored contour and liner plan."
      >
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Face shape">
              <Select value={faceShape} onChange={(e) => setFaceShape(e.target.value)}>
                {FACE_SHAPES.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </Select>
            </Field>
            <Field label="Eye type">
              <Select value={eyeType} onChange={(e) => setEyeType(e.target.value)}>
                {EYE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
            </Field>
          </div>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-slate-800">
              <Paintbrush className="h-4 w-4 text-primary-600" /> Contour placement
            </h3>
            <p className="mb-4 text-xs text-slate-400">For a {faceShape.toLowerCase()} face shape.</p>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Shade these</p>
            <ul className="space-y-2">
              {face.shade.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                  <Paintbrush className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Highlight these</p>
            <ul className="space-y-2">
              {face.highlight.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-slate-800">
              <PenLine className="h-4 w-4 text-primary-600" /> Eyeliner technique
            </h3>
            <p className="mb-4 text-xs text-slate-400">Best fit for {eyeType.toLowerCase()} eyes.</p>
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <p className="text-sm font-bold text-slate-800">{eye.style}</p>
            </div>
            <div className="mt-3 space-y-2">
              <p className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {eye.tip}
              </p>
              <p className="flex items-start gap-2 text-sm text-rose-700">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                Avoid: {eye.mistake}
              </p>
            </div>
          </section>
        </div>
      </ToolShell>
    </>
  )
}