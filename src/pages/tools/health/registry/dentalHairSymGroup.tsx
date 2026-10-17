import { Candy, Sun, Sparkles, Droplets, Droplet, Thermometer, HeartPulse, Stethoscope, Brain } from 'lucide-react'
import type { HealthToolConfig } from '../HealthGenericTool'
import {
  sugarExposureScore, sugarExposureBand, uvBurnTimeMinutes, uvBurnLabel,
  hairLossRiskScore, hairLossBand, hairPorosityTest, dehydrationScore, dehydrationBand,
  coldOrFlu, chestPainRedFlagCount, chestPainBand, utiLikelihoodScore, utiBand,
  migraineScore, migraineBand,
} from '../../../../lib/health/dentalHairSym'

const DE = 'Dental Health'
const HS = 'Hair & Skin'
const SY = 'Symptoms & Self-Check'

export const dentalHairSymGroup: Record<string, HealthToolConfig> = {}

dentalHairSymGroup['sugar-exposure-check'] = {
  id: 'sugar-exposure-check',
  title: 'Dental Sugar Exposure',
  description: 'Estimate daily sugar episodes that feed cavity-causing bacteria.',
  icon: <Candy className="h-6 w-6" />,
  breadcrumb: 'Health / Dental Health',
  instruction: 'How often do you sweet-drink, snack and eat candy each day?',
  sub: DE,
  emoji: '🦷',
  accent: 'text-amber-600 bg-amber-50 border-amber-200',
  fields: [
    { key: 'drinks', label: 'Sweet drinks per day', type: 'number', min: 0, max: 10, placeholder: 'e.g. 2' },
    { key: 'snacks', label: 'Sweet snacks per day', type: 'number', min: 0, max: 10, placeholder: 'e.g. 3' },
    { key: 'candy', label: 'Candy pieces per day', type: 'number', min: 0, max: 20, placeholder: 'e.g. 4' },
  ],
  compute: (values) => {
    const s = sugarExposureScore(values.drinks ?? NaN, values.snacks ?? NaN, values.candy ?? NaN)
    if (s === null) return null
    return { title: 'Sugar exposure', value: s.toFixed(0), unit: 'episodes/day', tone: s <= 2 ? 'good' : s <= 4 ? 'ok' : 'warn', badge: sugarExposureBand(s), note: 'Frequency matters as much as amount - every sugar hit restarts the acid attack on enamel.' }
  },
  howItWorks: [
    { title: 'Count sweet events', text: 'Drinks, snacks, candy.' },
    { title: 'Add them up', text: 'Total daily sugar episodes.' },
    { title: 'Read the band', text: 'Fewer, clustered, or constant exposure.' },
  ],
  tips: [
    'Most people keep sugar below 5-10% of daily energy.',
    'Sipping slowly is worse than finishing fast.',
    'Chewing sugar-free gum after meals boosts saliva.',
  ],
}

dentalHairSymGroup['uv-sunburn-planner'] = {
  id: 'uv-sunburn-planner',
  title: 'Sunburn Time Planner',
  description: 'Estimate how many minutes before unprotected skin starts to burn.',
  icon: <Sun className="h-6 w-6" />,
  breadcrumb: 'Health / Hair & Skin',
  instruction: 'Enter today\u2019s UV index and your sunscreen SPF.',
  sub: HS,
  emoji: '💇',
  accent: 'text-rose-600 bg-rose-50 border-rose-200',
  fields: [
    { key: 'uv', label: 'UV index (check the weather app)', type: 'number', placeholder: 'e.g. 7' },
    { key: 'spf', label: 'Sunscreen SPF applied', type: 'select', options: [{ value: '1', label: 'None (SPF 1)' }, { value: '15', label: 'SPF 15' }, { value: '30', label: 'SPF 30' }, { value: '50', label: 'SPF 50+' }] },
  ],
  compute: (values) => {
    const m = uvBurnTimeMinutes(values.uv ?? NaN, values.spf ?? NaN)
    if (m === null) return null
    return { title: 'Time to burn', value: m.toFixed(0), unit: 'minutes', tone: m >= 60 ? 'good' : m >= 20 ? 'ok' : 'danger', badge: uvBurnLabel(m), note: 'Burns in ~15 minutes at UV 10 with no protection; SPF multiplies that raw time.' }
  },
  howItWorks: [
    { title: 'Read the UV index', text: '0-11+, from weather sources.' },
    { title: 'Pick your SPF', text: 'Or none if you\u2019ll get no sun.' },
    { title: 'Multiply the base time', text: 'Raw burn time \u00d7 SPF.' },
  ],
  tips: [
    'SPF 30 blocks ~97% of UVB when applied properly.',
    'Reapply every 2 hours and after swimming.',
    'UV index 3+ already needs protection.',
  ],
}

dentalHairSymGroup['hair-loss-risk'] = {
  id: 'hair-loss-risk',
  title: 'Hair Loss Risk Check',
  description: 'Screen modifiable factors linked to temporary and genetic hair loss.',
  icon: <Sparkles className="h-6 w-6" />,
  breadcrumb: 'Health / Hair & Skin',
  instruction: 'Tick each factor that applies.',
  sub: HS,
  emoji: '💇',
  accent: 'text-rose-600 bg-rose-50 border-rose-200',
  fields: [
    { key: 'genetic', label: 'Family history of pattern hair loss', type: 'bool' },
    { key: 'stress', label: 'High stress recently', type: 'bool' },
    { key: 'telogen', label: 'Lots of shedding 2-4 months after an event', type: 'bool' },
    { key: 'iron', label: 'Low-iron diet / known deficiency', type: 'bool' },
    { key: 'terstyle', label: 'Tight hairstyles or heat styling', type: 'bool' },
    { key: 'meds', label: 'New medication in the last months', type: 'bool' },
  ],
  compute: (values) => {
    const s = hairLossRiskScore(values.genetic === 1, values.stress === 1, values.telogen === 1, values.iron === 1, values.terstyle === 1, values.meds === 1)
    if (s === null) return null
    return { title: 'Hair-loss score', value: s.toFixed(0), unit: '/6', tone: s >= 4 ? 'warn' : s >= 2 ? 'ok' : 'good', badge: hairLossBand(s), note: 'Most non-genetic shedding (telogen effluvium) is temporary and reversible.' }
  },
  howItWorks: [
    { title: 'Tick the factors', text: 'Genetic plus five lifestyle ones.' },
    { title: 'Count them', text: 'Score 0-6.' },
    { title: 'Read the band', text: 'Low, moderate or higher risk.' },
  ],
  tips: [
    'Shedding is normal - 50-100 strands a day.',
    'Iron, protein and gentle styling support regrowth.',
    'Pattern loss responds best to early treatment.',
  ],
}

dentalHairSymGroup['hair-porosity-test'] = {
  id: 'hair-porosity-test',
  title: 'Hair Porosity Test',
  description: 'Use the hair-float test to rate low, normal or high porosity.',
  icon: <Droplets className="h-6 w-6" />,
  breadcrumb: 'Health / Hair & Skin',
  instruction: 'Drop a clean hair strand in water and time (in seconds) how long it floats.',
  sub: HS,
  emoji: '💇',
  accent: 'text-rose-600 bg-rose-50 border-rose-200',
  fields: [
    { key: 'seconds', label: 'Time strand stays floating (s)', type: 'number', placeholder: 'e.g. 15' },
  ],
  compute: (values) => {
    const s = values.seconds ?? NaN
    if (!Number.isFinite(s) || s < 0) return null
    return { title: 'Porosity', value: hairPorosityTest(s), unit: '', tone: 'ok', badge: hairPorosityTest(s), note: 'Floats long = low porosity (resists moisture); sinks fast = high porosity (loses it).' }
  },
  howItWorks: [
    { title: 'Wash and dry a strand', text: 'No products on it.' },
    { title: 'Drop it in water', text: 'Room-temperature glass.' },
    { title: 'Time the float', text: 'The seconds decide the class.' },
  ],
  tips: [
    'Low porosity needs heat-assisted moisture.',
    'High porosity benefits from proteins and sealants.',
    'Combine this with how your hair feels after wash day.',
  ],
}

dentalHairSymGroup['dehydration-symptoms'] = {
  id: 'dehydration-symptoms',
  title: 'Dehydration Symptom Check',
  description: 'Count symptoms that commonly signal mild-to-moderate dehydration.',
  icon: <Droplet className="h-6 w-6" />,
  breadcrumb: 'Health / Symptoms & Self-Check',
  instruction: 'Tick the symptoms you have right now.',
  sub: SY,
  emoji: '🩺',
  accent: 'text-cyan-600 bg-cyan-50 border-cyan-200',
  fields: [
    { key: 'headache', label: 'Headache', type: 'bool' },
    { key: 'darkurine', label: 'Dark-coloured urine', type: 'bool' },
    { key: 'thirst', label: 'Feeling thirsty', type: 'bool' },
    { key: 'dizzy', label: 'Dizziness when standing', type: 'bool' },
    { key: 'fatigue', label: 'Fatigue or sluggishness', type: 'bool' },
    { key: 'drymouth', label: 'Dry mouth / lips', type: 'bool' },
  ],
  compute: (values) => {
    const s = dehydrationScore(values.headache === 1, values.darkurine === 1, values.thirst === 1, values.dizzy === 1, values.fatigue === 1, values.drymouth === 1)
    if (s === null) return null
    return { title: 'Dehydration symptoms', value: s.toFixed(0), unit: '/6', tone: s >= 4 ? 'warn' : s >= 2 ? 'ok' : 'good', badge: dehydrationBand(s), note: 'Urine colour and dizziness are usually the strongest clues.' }
  },
  howItWorks: [
    { title: 'Tick present symptoms', text: 'Six common signs.' },
    { title: 'Count the checked', text: 'Score 0-6.' },
    { title: 'Read the level', text: 'Mild, moderate or severe hints.' },
  ],
  tips: [
    'Pale-yellow urine is the everyday target.',
    'Sip steadily - don\u2019t chug all at once.',
    'Dizziness plus confusion warrants urgent care.',
  ],
}

dentalHairSymGroup['cold-or-flu'] = {
  id: 'cold-or-flu',
  title: 'Cold vs Flu Check',
  description: 'Compare your symptoms against typical cold and flu patterns.',
  icon: <Thermometer className="h-6 w-6" />,
  breadcrumb: 'Health / Symptoms & Self-Check',
  instruction: 'Tick the symptoms you are currently experiencing.',
  sub: SY,
  emoji: '🩺',
  accent: 'text-cyan-600 bg-cyan-50 border-cyan-200',
  fields: [
    { key: 'fever', label: 'Fever over 38°C', type: 'bool' },
    { key: 'aches', label: 'Body aches', type: 'bool' },
    { key: 'chills', label: 'Chills', type: 'bool' },
    { key: 'cough', label: 'Dry cough', type: 'bool' },
    { key: 'sore', label: 'Sore throat', type: 'bool' },
    { key: 'sneeze', label: 'Sneezing / runny nose', type: 'bool' },
    { key: 'fatigue', label: 'Severe fatigue', type: 'bool' },
  ],
  compute: (values) => {
    const res = coldOrFlu(values.fever === 1, values.aches === 1, values.chills === 1, values.cough === 1, values.sore === 1, values.sneeze === 1, values.fatigue === 1)
    if (res === null) return null
    const isFlu = res.toLowerCase().includes('flu')
    return { title: 'Likely pattern', value: res, unit: '', tone: isFlu ? 'warn' : 'ok', badge: 'Self-check only', note: 'Abrupt fever, aches and chills lean flu; sneezing and sore throat lean cold. Test to confirm.' }
  },
  howItWorks: [
    { title: 'Tick your symptoms', text: 'Seven common ones.' },
    { title: 'Weigh the pattern', text: 'Fever+aches vs sneeze+sore throat.' },
    { title: 'Read the verdict', text: 'Cold-like, flu-like, or neither.' },
  ],
  tips: [
    'Flu usually hits suddenly, colds gradually.',
    'Antivirals work best within 48 hours of flu onset.',
    'Breathing trouble or confusion = urgent review.',
  ],
}

dentalHairSymGroup['chest-pain-red-flags'] = {
  id: 'chest-pain-red-flags',
  title: 'Chest Pain Red Flags',
  description: 'Count warning signs that make chest pain worth urgent assessment.',
  icon: <HeartPulse className="h-6 w-6" />,
  breadcrumb: 'Health / Symptoms & Self-Check',
  instruction: 'Tick the features that apply. Any chest pain + danger signs = call emergency.',
  sub: SY,
  emoji: '🩺',
  accent: 'text-cyan-600 bg-cyan-50 border-cyan-200',
  fields: [
    { key: 'arms', label: 'Pain spreading to arm/jaw/back', type: 'bool' },
    { key: 'sweat', label: 'Sweating or clamminess', type: 'bool' },
    { key: 'nausea', label: 'Nausea / vomiting', type: 'bool' },
    { key: 'crushing', label: 'Crushing or pressure feeling', type: 'bool' },
    { key: 'sob', label: 'Shortness of breath', type: 'bool' },
  ],
  compute: (values) => {
    const c = chestPainRedFlagCount(values.arms === 1, values.sweat === 1, values.nausea === 1, values.crushing === 1, values.sob === 1)
    if (c === null) return null
    return { title: 'Red flags', value: c.toFixed(0), unit: (c >= 3 ? 'severe' : c >= 2 ? 'elevated' : 'low') + ' risk', tone: c >= 3 ? 'danger' : c >= 2 ? 'warn' : 'ok', badge: chestPainBand(c), note: 'Severe or crushing chest pain with breathing trouble or sweating always warrants urgent evaluation.', pct: Math.round((c / 5) * 100) }
  },
  howItWorks: [
    { title: 'Tick each sign', text: 'Five high-risk features.' },
    { title: 'Count them', text: 'Score 0-5.' },
    { title: 'Scale the urgency', text: '2+ flags warrant prompt evaluation.' },
  ],
  tips: [
    'When in doubt, call emergency services.',
    'Women may feel it as back, jaw or nausea.',
    'Never drive yourself to the ER with severe chest pain.',
  ],
}

dentalHairSymGroup['uti-check'] = {
  id: 'uti-check',
  title: 'UTI Likelihood Check',
  description: 'Score symptoms that suggest a urinary tract infection.',
  icon: <Stethoscope className="h-6 w-6" />,
  breadcrumb: 'Health / Symptoms & Self-Check',
  instruction: 'Tick the symptoms you have.',
  sub: SY,
  emoji: '🩺',
  accent: 'text-cyan-600 bg-cyan-50 border-cyan-200',
  fields: [
    { key: 'freq', label: 'Frequent urination', type: 'bool' },
    { key: 'burn', label: 'Burning when urinating', type: 'bool' },
    { key: 'urgency', label: 'Sudden strong urge to go', type: 'bool' },
    { key: 'pelvic', label: 'Pelvic or bladder pressure', type: 'bool' },
    { key: 'fever', label: 'Fever', type: 'bool' },
    { key: 'back', label: 'Flank/back pain', type: 'bool' },
  ],
  compute: (values) => {
    const s = utiLikelihoodScore(values.freq === 1, values.burn === 1, values.urgency === 1, values.pelvic === 1, values.fever === 1, values.back === 1)
    if (s === null) return null
    return { title: 'UTI score', value: s.toFixed(0), unit: '/6', tone: s >= 4 ? 'danger' : s >= 2 ? 'warn' : 'ok', badge: utiBand(s), note: 'Burning + frequency is the classic pair. Fever or flank pain can signal an upper infection.' }
  },
  howItWorks: [
    { title: 'Tick present symptoms', text: 'Six UTI clues.' },
    { title: 'Count them', text: 'Score 0-6.' },
    { title: 'Read the band', text: 'Low, moderate or high likelihood.' },
  ],
  tips: [
    'Burning alone can be irritation - context matters.',
    'Urine dips help confirm before antibiotics.',
    'Fever plus back pain deserves same-day review.',
  ],
}

dentalHairSymGroup['migraine-screener'] = {
  id: 'migraine-screener',
  title: 'Migraine Screener',
  description: 'Check the classic features that separate migraines from ordinary headaches.',
  icon: <Brain className="h-6 w-6" />,
  breadcrumb: 'Health / Symptoms & Self-Check',
  instruction: 'Tick the features that describe your headache.',
  sub: SY,
  emoji: '🩺',
  accent: 'text-cyan-600 bg-cyan-50 border-cyan-200',
  fields: [
    { key: 'oneside', label: 'Usually one side of the head', type: 'bool' },
    { key: 'throb', label: 'Throbbing / pulsating pain', type: 'bool' },
    { key: 'nausea', label: 'Nausea', type: 'bool' },
    { key: 'light', label: 'Bothered by light/noise', type: 'bool' },
    { key: 'aura', label: 'Visual aura (flashing lights, zigzags)', type: 'bool' },
  ],
  compute: (values) => {
    const s = migraineScore(values.oneside === 1, values.throb === 1, values.nausea === 1, values.light === 1, values.aura === 1)
    if (s === null) return null
    return { title: 'Migraine score', value: s.toFixed(0), unit: '/5', tone: s >= 3 ? 'warn' : s >= 2 ? 'ok' : 'good', badge: migraineBand(s), note: 'Migraine \u201cplus\u201d pictures (aura, one-sided, throbbing, light-sensitive) push the score up.' }
  },
  howItWorks: [
    { title: 'Tick the features', text: 'Five migraine markers.' },
    { title: 'Count them', text: 'Score 0-5.' },
    { title: 'Interpret', text: '3+ fits migraine patterns well.' },
  ],
  tips: [
    'Trigger journals beat guessing.',
    'Treat early - migraine responds better at onset.',
    'Aura + severe headache starting suddenly needs evaluation.',
  ],
}