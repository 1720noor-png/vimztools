import { Wind, Mountain, Flame, Gauge, CloudSun, Droplets, Droplet, Activity, Gem, Scale } from 'lucide-react'
import type { HealthToolConfig, HealthResult } from '../HealthGenericTool'
import { pfRatio, pfRatioBand, aaGradient, packYears, packYearsBand, peakFlowZone, kidneyStage, fluidBalanceNetMl, kidneyStoneRiskScore, kidneyStoneBand, wetBulbCelsius, wetBulbAlert } from '../../../../lib/health/respKidney'
import { cockcroftGault, egfrCkdEpi2021 } from '../../../../lib/health/clinical'

const RS = 'Respiratory Health'
const KD = 'Kidney & Renal'

export const respKidneyGroup: Record<string, HealthToolConfig> = {}

respKidneyGroup['pf-ratio'] = {
  id: 'pf-ratio',
  title: 'P/F Ratio Calculator',
  description: 'Measure of gas exchange efficiency - PaO2 divided by FiO2.',
  icon: <Wind className="h-6 w-6" />,
  breadcrumb: 'Health / Respiratory Health',
  instruction: 'Enter the arterial PaO2 and the oxygen fraction the patient breathes.',
  sub: RS,
  emoji: '🫁',
  accent: 'text-cyan-600 bg-cyan-50 border-cyan-200',
  fields: [
    { key: 'paO2', label: 'PaO2 (mmHg)', type: 'number', placeholder: 'e.g. 80' },
    { key: 'fio2', label: 'FiO2 (oxygen fraction)', type: 'select', options: [{ value: '21', label: 'Room air (21%)' }, { value: '40', label: 'O2 40%' }, { value: '50', label: 'O2 50%' }, { value: '60', label: 'O2 60%' }, { value: '80', label: 'O2 80%' }, { value: '100', label: 'O2 100%' }] },
  ],
  compute: (values) => {
    const f = values.fio2 === null ? NaN : values.fio2 / 100
    const r = pfRatio(values.paO2 ?? NaN, f)
    if (r === null) return null
    return { title: 'P/F ratio', value: r.toFixed(0), unit: 'mmHg', tone: r >= 300 ? 'good' : r >= 200 ? 'warn' : 'danger', badge: pfRatioBand(r), note: 'Lower values mean worse oxygen exchange; < 300 gets attention in hospital.' }
  },
  howItWorks: [
    { title: 'Get blood gas PaO2', text: 'Arterial oxygen tension in mmHg.' },
    { title: 'Know the oxygen setting', text: 'FiO2 from room air to 100%.' },
    { title: 'Divide', text: 'PaO2 \u00f7 FiO2 gives the ratio.' },
  ],
  tips: [
    'P/F guides ARDS classification in the ICU.',
    'On room air the FiO2 is 0.21.',
    'It is a snapshot - trends tell the real story.',
  ],
}

respKidneyGroup['aa-gradient'] = {
  id: 'aa-gradient',
  title: 'A-a Gradient',
  description: 'Alveolar-arterial oxygen gradient to separate lung from blood-gas causes.',
  icon: <Mountain className="h-6 w-6" />,
  breadcrumb: 'Health / Respiratory Health',
  instruction: 'Enter PaO2, PaCO2 and your altitude in metres.',
  sub: RS,
  emoji: '🫁',
  accent: 'text-cyan-600 bg-cyan-50 border-cyan-200',
  fields: [
    { key: 'paO2', label: 'PaO2 (mmHg)', type: 'number', placeholder: 'e.g. 75' },
    { key: 'paCO2', label: 'PaCO2 (mmHg)', type: 'number', placeholder: 'e.g. 40' },
    { key: 'alt', label: 'Altitude (m)', type: 'number', placeholder: 'e.g. 0' },
  ],
  compute: (values) => {
    const g = aaGradient(values.paO2 ?? NaN, values.paCO2 ?? NaN, values.alt ?? NaN)
    if (g === null) return null
    return { title: 'A-a gradient', value: g.toFixed(1), unit: 'mmHg', tone: g <= 20 ? 'good' : 'warn', badge: g <= 20 ? 'Typical (< 20 mmHg at sea level)' : 'Elevated gradient', note: 'A widened gradient usually points to the lung rather than the pump.' }
  },
  howItWorks: [
    { title: 'Compute ideal alveolar O2', text: 'PAO2 \u2248 150 - PaCO2/0.8 at sea level.' },
    { title: 'Subtract arterial', text: 'A-a = PAO2 - PaO2.' },
    { title: 'Compare to age norms', text: '~normal range rises with age (age/4 + 4).' },
  ],
  tips: [
    'Altitude lowers inspired oxygen and PAO2.',
    'Elevated gradient suggests V/Q mismatch or shunt.',
    'This is bedside clinical math - interpret with the full picture.',
  ],
}

respKidneyGroup['pack-years'] = {
  id: 'pack-years',
  title: 'Smoking Pack-Years',
  description: 'Lifetime tobacco exposure - packs per day times years of smoking.',
  icon: <Flame className="h-6 w-6" />,
  breadcrumb: 'Health / Respiratory Health',
  instruction: 'Enter average packs smoked per day and total years.',
  sub: RS,
  emoji: '🫁',
  accent: 'text-cyan-600 bg-cyan-50 border-cyan-200',
  fields: [
    { key: 'packs', label: 'Packs per day (1 pack = 20 cigarettes)', type: 'number', step: 0.5, placeholder: 'e.g. 1' },
    { key: 'years', label: 'Years smoking', type: 'number', placeholder: 'e.g. 25' },
  ],
  compute: (values) => {
    const r = packYears(values.packs ?? NaN, values.years ?? NaN)
    if (r === null) return null
    return { title: 'Pack-years', value: r.toFixed(1), unit: 'pack-yrs', tone: r >= 20 ? 'warn' : r >= 10 ? 'ok' : 'good', badge: packYearsBand(r), note: 'Pack-years = packs/day \u00d7 years. 20+ often triggers lung-cancer screening discussions.' }
  },
  howItWorks: [
    { title: 'Average packs per day', text: 'Total cigarettes \u00f7 20.' },
    { title: 'Multiply by years', text: 'Packs \u00d7 years.' },
    { title: 'Read the exposure', text: 'Higher = longer cumulative risk.' },
  ],
  tips: [
    'Quitting at any age lowers risk over time.',
    'Screening for lung cancer starts around 20 pack-years.',
    'Pack-years is cumulative - no smoking at all is best.',
  ],
}

respKidneyGroup['peak-flow-zones'] = {
  id: 'peak-flow-zones',
  title: 'Peak Flow Zone Check',
  description: 'Place today\u2019s peak flow into green, yellow or red asthma zones.',
  icon: <Gauge className="h-6 w-6" />,
  breadcrumb: 'Health / Respiratory Health',
  instruction: 'Enter your personal-best peak flow and today\u2019s reading.',
  sub: RS,
  emoji: '🫁',
  accent: 'text-cyan-600 bg-cyan-50 border-cyan-200',
  fields: [
    { key: 'best', label: 'Personal best (L/min)', type: 'number', placeholder: 'e.g. 480' },
    { key: 'current', label: 'Today\u2019s reading (L/min)', type: 'number', placeholder: 'e.g. 320' },
  ],
  compute: (values) => {
    const zone = peakFlowZone(values.best ?? NaN, values.current ?? NaN)
    const cur = values.current ?? NaN
    if (!Number.isFinite(cur) || cur <= 0) return null
    const best = values.best ?? NaN
    const pct = Number.isFinite(best) && best > 0 ? Math.round((cur / best) * 100) : undefined
    const tone: HealthResult['tone'] = pct === undefined ? 'ok' : pct >= 80 ? 'good' : pct >= 50 ? 'warn' : 'danger'
    return { title: 'Peak flow zone', value: zone, unit: pct !== undefined ? `${pct}% of best` : '', tone, badge: `${cur.toFixed(0)} L/min of ${best.toFixed(0)} best`, pct, note: 'Green 80-100%, yellow 50-79%, red under 50% of your personal best.' }
  },
  howItWorks: [
    { title: 'Record best', text: 'Your highest reading when well.' },
    { title: 'Measure today', text: 'Three blows, best of three.' },
    { title: 'Compare', text: 'Zone tells you how it\u2019s tracking.' },
  ],
  tips: [
    'Follow your asthma action-plan colours.',
    'Red zone with worsening symptoms is urgent.',
    'Blow before medication for a truer reading.',
  ],
}

respKidneyGroup['heat-stress-check'] = {
  id: 'heat-stress-check',
  title: 'Heat Stress Wet-Bulb Check',
  description: 'Compute wet-bulb temperature (Stull 2011) and its heat-stress advice.',
  icon: <CloudSun className="h-6 w-6" />,
  breadcrumb: 'Health / Respiratory Health',
  instruction: 'Enter air temperature and relative humidity.',
  sub: RS,
  emoji: '🫁',
  accent: 'text-cyan-600 bg-cyan-50 border-cyan-200',
  fields: [
    { key: 'temp', label: 'Air temperature (°C)', type: 'number', placeholder: 'e.g. 30' },
    { key: 'hum', label: 'Relative humidity (%)', type: 'number', min: 0, max: 100, placeholder: 'e.g. 60' },
  ],
  compute: (values) => {
    const wb = wetBulbCelsius(values.temp ?? NaN, values.hum ?? NaN)
    if (wb === null) return null
    const alert = wetBulbAlert(values.temp ?? NaN, values.hum ?? NaN)
    return { title: 'Wet-bulb temperature', value: wb.toFixed(1), unit: '°C', tone: wb < 28 ? (wb < 24 ? 'good' : 'ok') : 'danger', badge: alert, note: 'Wet-bulb caps how well sweating cools you - the threshold for human survival sits around 35°C.' }
  },
  howItWorks: [
    { title: 'Enter T and RH', text: 'Dry temperature and humidity.' },
    { title: 'Apply the Stull formula', text: 'A compact approximation of wet-bulb.' },
    { title: 'Read the advice', text: 'Risk bands for exercise and work outdoors.' },
  ],
  tips: [
    'High humidity raises wet-bulb sharply.',
    'Above ~28°C ease off strenuous outdoor work.',
    'Hydrate before, during and after heat exposure.',
  ],
}

respKidneyGroup['egfr-calculator'] = {
  id: 'egfr-calculator',
  title: 'eGFR (CKD-EPI 2021)',
  description: 'Estimated glomerular filtration rate from creatinine, age and sex.',
  icon: <Droplets className="h-6 w-6" />,
  breadcrumb: 'Health / Kidney & Renal',
  instruction: 'Enter serum creatinine, age and sex.',
  sub: KD,
  emoji: '🫘',
  accent: 'text-pink-600 bg-pink-50 border-pink-200',
  fields: [
    { key: 'creat', label: 'Serum creatinine (mg/dL)', type: 'number', placeholder: 'e.g. 1.0' },
    { key: 'age', label: 'Age (years)', type: 'number', placeholder: 'e.g. 60' },
    { key: 'female', label: 'Female sex', type: 'bool' },
  ],
  compute: (values) => {
    const g = egfrCkdEpi2021(values.creat ?? NaN, values.age ?? NaN, values.female === 1)
    if (g === null) return null
    return { title: 'eGFR', value: g.toFixed(0), unit: 'mL/min/1.73m²', tone: g >= 60 ? 'good' : g >= 30 ? 'warn' : 'danger', badge: kidneyStage(g), note: 'The 2021 race-free CKD-EPI equation. Screening glue for chronic kidney disease.' }
  },
  howItWorks: [
    { title: 'Enter creatinine', text: 'mg/dL from the lab.' },
    { title: 'Add age and sex', text: 'Both shift the normal curves.' },
    { title: 'Read eGFR', text: 'Stages < 60 flag chronic kidney disease.' },
  ],
  tips: [
    'eGFR under 60 for 3+ months defines CKD.',
    'Muscle mass, foods and hydration affect readings.',
    'Repeat tests follow trends, not single numbers.',
  ],
}

respKidneyGroup['crcl-calculator'] = {
  id: 'crcl-calculator',
  title: 'Creatinine Clearance (Cockcroft-Gault)',
  description: 'Estimate creatinine clearance for drug-dose planning.',
  icon: <Droplet className="h-6 w-6" />,
  breadcrumb: 'Health / Kidney & Renal',
  instruction: 'Enter weight, age, serum creatinine and sex.',
  sub: KD,
  emoji: '🫘',
  accent: 'text-pink-600 bg-pink-50 border-pink-200',
  fields: [
    { key: 'weight', label: 'Weight (kg)', type: 'number', placeholder: 'e.g. 70' },
    { key: 'age', label: 'Age (years)', type: 'number', placeholder: 'e.g. 65' },
    { key: 'creat', label: 'Serum creatinine (mg/dL)', type: 'number', placeholder: 'e.g. 1.2' },
    { key: 'female', label: 'Female sex', type: 'bool' },
  ],
  compute: (values) => {
    const c = cockcroftGault(values.age ?? NaN, values.weight ?? NaN, values.creat ?? NaN, values.female === 1)
    if (c === null) return null
    return { title: 'Clearence (eCrCl)', value: c.toFixed(0), unit: 'mL/min', tone: c >= 60 ? 'good' : c >= 30 ? 'warn' : 'danger', badge: `${values.age ?? 0} yrs, ${values.weight ?? 0} kg`, note: 'CrCl \u2248 ((140 - age) \u00d7 weight) / (72 \u00d7 creat), \u00d70.85 for women.' }
  },
  howItWorks: [
    { title: 'Gather the inputs', text: 'Age, weight, creatinine, sex.' },
    { title: 'Apply the formula', text: 'Include the 0.85 factor for women.' },
    { title: 'Read clearance', text: 'Many drugs are dosed off this number.' },
  ],
  tips: [
    'Use ideal body weight for obese patients - dosing nuance.',
    'Cockcroft-Gault is the classic drug-dosing standard.',
    'A clinician matches it to each medication\u2019s label.',
  ],
}

respKidneyGroup['kidney-stage-check'] = {
  id: 'kidney-stage-check',
  title: 'Kidney Stage (from eGFR)',
  description: 'Convert an eGFR into the CKD stage label G1-G5.',
  icon: <Activity className="h-6 w-6" />,
  breadcrumb: 'Health / Kidney & Renal',
  instruction: 'Enter your known eGFR (mL/min/1.73m²).',
  sub: KD,
  emoji: '🫘',
  accent: 'text-pink-600 bg-pink-50 border-pink-200',
  fields: [
    { key: 'egfr', label: 'eGFR (mL/min/1.73m²)', type: 'number', placeholder: 'e.g. 55' },
  ],
  compute: (values) => {
    const g = values.egfr ?? NaN
    if (!Number.isFinite(g) || g <= 0) return null
    return { title: 'Kidney stage', value: kidneyStage(g), unit: '', tone: g >= 90 ? 'good' : g >= 60 ? 'ok' : g >= 30 ? 'warn' : 'danger', badge: `eGFR ${g.toFixed(0)}`, note: 'G1 90+, G2 60-89, G3a 45-59, G3b 30-44, G4 15-29, G5 < 15.' }
  },
  howItWorks: [
    { title: 'Enter eGFR', text: 'From a recent lab report.' },
    { title: 'Match to a stage', text: 'G1 to G5 thresholds.' },
    { title: 'Read the class', text: 'Stages guide follow-up intensity.' },
  ],
  tips: [
    'A single number is not a diagnosis - trends matter.',
    'Stage plus albuminuria gives the full picture.',
    'Nephrology referral is normal at G4 onward.',
  ],
}

respKidneyGroup['kidney-stone-risk'] = {
  id: 'kidney-stone-risk',
  title: 'Kidney Stone Risk Check',
  description: 'Score modifiable lifestyle factors that raise kidney-stone risk.',
  icon: <Gem className="h-6 w-6" />,
  breadcrumb: 'Health / Kidney & Renal',
  instruction: 'Tick each factor that applies to you.',
  sub: KD,
  emoji: '🫘',
  accent: 'text-pink-600 bg-pink-50 border-pink-200',
  fields: [
    { key: 'family', label: 'Family history of stones', type: 'bool' },
    { key: 'lowwater', label: 'Low water intake', type: 'bool' },
    { key: 'sodium', label: 'High sodium intake', type: 'bool' },
    { key: 'protein', label: 'High animal protein', type: 'bool' },
    { key: 'oxalate', label: 'High oxalate foods', type: 'bool' },
    { key: 'citrus', label: 'Little citrus fruit', type: 'bool' },
  ],
  compute: (values) => {
    const s = kidneyStoneRiskScore(values.family === 1, values.lowwater === 1, values.sodium === 1, values.protein === 1, values.oxalate === 1, values.citrus === 1)
    if (s === null) return null
    return { title: 'Stone risk score', value: s.toFixed(0), unit: '/6', tone: s >= 4 ? 'warn' : s >= 2 ? 'ok' : 'good', badge: kidneyStoneBand(s), note: 'Many risks are reversible: water > 2-2.5 L/day, less salt and animal protein.' }
  },
  howItWorks: [
    { title: 'Tick the factors', text: 'Six known stone contributors.' },
    { title: 'Count them', text: 'Score 0-6.' },
    { title: 'Read the band', text: 'Compare to low-moderate-high.' },
  ],
  tips: [
    'Water is the single biggest lever.',
    'Citrus (lemon, lime) adds citrate that can help.',
    'Past stone formers should get a 24-hour urine workup.',
  ],
}

respKidneyGroup['renal-fluid-balance'] = {
  id: 'renal-fluid-balance',
  title: 'Renal Fluid Balance',
  description: 'Track net fluid in vs out on a day with output monitoring.',
  icon: <Scale className="h-6 w-6" />,
  breadcrumb: 'Health / Kidney & Renal',
  instruction: 'Enter total fluid intake and total urine/output for the day.',
  sub: KD,
  emoji: '🫘',
  accent: 'text-pink-600 bg-pink-50 border-pink-200',
  fields: [
    { key: 'in', label: 'Total intake (mL)', type: 'number', placeholder: 'e.g. 2500' },
    { key: 'out', label: 'Total urine output (mL)', type: 'number', placeholder: 'e.g. 2100' },
  ],
  compute: (values) => {
    const net = fluidBalanceNetMl(values.in ?? NaN, values.out ?? NaN)
    if (net === null) return null
    return { title: 'Net balance', value: `${net > 0 ? '+' : ''}${net.toFixed(0)}`, unit: 'mL', tone: net > 1000 || net < -1000 ? 'warn' : 'good', badge: net >= 0 ? 'Retaining' : 'Losing', note: 'Positive = fluid remaining in the body; used by renal and heart teams for daily totals.' }
  },
  howItWorks: [
    { title: 'Sum the intakes', text: 'Drinks, food fluids, IV if any.' },
    { title: 'Sum the outputs', text: 'Urine, drains, losses.' },
    { title: 'Subtract', text: 'Intake minus output = net.' },
  ],
  tips: [
    'Weigh at the same time daily - better than guesswork.',
    'Insensible losses (sweat, breathing) are ~400-800 mL/day.',
    'Track for 2-3 days before judging trends.',
  ],
}