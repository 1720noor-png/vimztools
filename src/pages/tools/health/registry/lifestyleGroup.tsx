import { Droplets, Waves, Shirt, HeartPulse, Timer, Activity, Footprints, Gauge, Dumbbell, Heart, Radar, Droplet } from 'lucide-react'
import type { HealthToolConfig } from '../HealthGenericTool'
import {
  dailyFluidIntakeMl, exerciseFluidMl, sweatRateMlPerHour, waterBalanceMl, hydrationStatus,
} from '../../../../lib/health/hydration'
import {
  oneRepMaxEpley, vo2MaxCooper, stepsToKm, paceMinPerKm, karvonenHeartRate, runningTimeHours,
} from '../../../../lib/health/fitness'
import {
  bpCategory, mapValue, pulsePressure, friedewaldLdl, tcHdlRatio, restingHrBand, ldlBand,
} from '../../../../lib/health/heart'

const HY = 'Hydration'
const FI = 'Fitness & Exercise'
const HE = 'Heart & Cardiovascular'

export const lifestyleGroup: Record<string, HealthToolConfig> = {}

lifestyleGroup['daily-water-intake'] = {
  id: 'daily-water-intake',
  title: 'Daily Water Intake',
  description: 'Estimate your daily water target from weight, activity and climate.',
  icon: <Droplets className="h-6 w-6" />,
  breadcrumb: 'Health / Hydration',
  instruction: 'Enter weight, daily active minutes and your usual climate.',
  sub: HY,
  emoji: '💧',
  accent: 'text-sky-600 bg-sky-50 border-sky-200',
  fields: [
    { key: 'weight', label: 'Weight (kg)', type: 'number', placeholder: 'e.g. 70' },
    { key: 'activeMin', label: 'Daily active minutes', type: 'number', placeholder: 'e.g. 30' },
    { key: 'climate', label: 'Climate', type: 'select', options: [{ value: '0', label: 'Cool' }, { value: '1', label: 'Moderate' }, { value: '2', label: 'Hot' }] },
  ],
  compute: (values) => {
    const c = values.climate
    const climate = c === 0 ? 'cool' : c === 2 ? 'hot' : 'moderate'
    const ml = dailyFluidIntakeMl(values.weight ?? NaN, values.activeMin ?? NaN, climate)
    if (ml === null) return null
    return { title: 'Daily water target', value: ml.toFixed(0), unit: 'ml', tone: 'good', badge: 'Base + activity allowance', note: 'This covers fluids from drinks and food moisture combined.' }
  },
  howItWorks: [
    { title: 'Input the basics', text: 'Weight, exercise minutes and climate.' },
    { title: 'We scale per kg', text: 'A base of 30-40 ml/kg depending on climate.' },
    { title: 'Add activity fluid', text: 'About 12 ml per active minute is added on top.' },
  ],
  tips: [
    'Thirst is a late signal - sip through the day in hot weather.',
    'Fruits, soups and tea all count toward fluid intake.',
    'Check urine colour as a simple hydration cue.',
  ],
}

lifestyleGroup['exercise-fluid-planner'] = {
  id: 'exercise-fluid-planner',
  title: 'Exercise Fluid Planner',
  description: 'Plan how much to drink during a workout by intensity and duration.',
  icon: <Waves className="h-6 w-6" />,
  breadcrumb: 'Health / Hydration',
  instruction: 'Enter workout minutes and intensity to get a drinking plan.',
  sub: HY,
  emoji: '💧',
  accent: 'text-sky-600 bg-sky-50 border-sky-200',
  fields: [
    { key: 'minutes', label: 'Workout minutes', type: 'number', placeholder: 'e.g. 60' },
    { key: 'intensity', label: 'Intensity', type: 'select', options: [{ value: '0', label: 'Light' }, { value: '1', label: 'Moderate' }, { value: '2', label: 'Vigorous' }] },
  ],
  compute: (values) => {
    const i = values.intensity
    const intensity = i === 0 ? 'light' : i === 2 ? 'vigorous' : 'moderate'
    const ml = exerciseFluidMl(1, values.minutes ?? NaN, intensity)
    if (ml === null) return null
    return { title: 'During-exercise fluid', value: ml.toFixed(0), unit: 'ml', tone: 'ok', badge: intensity.charAt(0).toUpperCase() + intensity.slice(1) + ' effort', note: 'Sip in thirds across the session rather than all at once.' }
  },
  howItWorks: [
    { title: 'Pick intensity', text: 'Light, moderate or vigorous effort.' },
    { title: 'Multiply per minute', text: 'We apply 7, 12 or 18 ml per minute by intensity.' },
    { title: 'Split into sips', text: 'Divide the total across the session.' },
  ],
  tips: [
    'Drink small doses every 15-20 minutes during long sessions.',
    'Add electrolytes for efforts over 60-90 minutes.',
    'Never chug large volumes fast - it can cause stomach upset.',
  ],
}

lifestyleGroup['sweat-rate-estimator'] = {
  id: 'sweat-rate-estimator',
  title: 'Sweat Rate Estimator',
  description: 'Estimate your sweat rate from pre/post workout weight and fluids.',
  icon: <Shirt className="h-6 w-6" />,
  breadcrumb: 'Health / Hydration',
  instruction: 'Weigh yourself before and after a workout, and record fluids consumed.',
  sub: HY,
  emoji: '💧',
  accent: 'text-sky-600 bg-sky-50 border-sky-200',
  fields: [
    { key: 'pre', label: 'Weight before (kg)', type: 'number', placeholder: 'e.g. 72.0' },
    { key: 'post', label: 'Weight after (kg)', type: 'number', placeholder: 'e.g. 71.5' },
    { key: 'fluids', label: 'Fluids consumed (ml)', type: 'number', placeholder: 'e.g. 400' },
    { key: 'duration', label: 'Duration (min)', type: 'number', placeholder: 'e.g. 60' },
  ],
  compute: (values) => {
    const r = sweatRateMlPerHour(values.pre ?? NaN, values.post ?? NaN, values.fluids ?? NaN, values.duration ?? NaN)
    if (r === null) return null
    return { title: 'Sweat rate', value: r.toFixed(0), unit: 'ml/hour', tone: 'ok', badge: 'Weight loss + fluids', note: 'Your personal target for fluid replacement in the same conditions.' }
  },
  howItWorks: [
    { title: 'Weigh before and after', text: 'Bare skin, same scale, right after the session.' },
    { title: 'Add the fluids you drank', text: 'Lost ml = (pre - post) kg \u00d7 1000 + fluids.' },
    { title: 'Normalise to the hour', text: 'Divide by duration and multiply by 60.' },
  ],
  tips: [
    'Repeat the test in hot versus cool conditions - rates differ a lot.',
    'A sweat rate result tells you how much to drink per hour.',
    'Match fluids to the sweat rate, not to thirst alone.',
  ],
}

lifestyleGroup['water-balance-check'] = {
  id: 'water-balance-check',
  title: 'Water Balance Check',
  description: 'Compare daily fluid intake against fluid output for a net balance.',
  icon: <Droplet className="h-6 w-6" />,
  breadcrumb: 'Health / Hydration',
  instruction: 'Enter total intake and output for a day.',
  sub: HY,
  emoji: '💧',
  accent: 'text-sky-600 bg-sky-50 border-sky-200',
  fields: [
    { key: 'intake', label: 'Fluid intake (ml)', type: 'number', placeholder: 'e.g. 2400' },
    { key: 'output', label: 'Fluid output (ml)', type: 'number', placeholder: 'e.g. 2100' },
  ],
  compute: (values) => {
    const net = waterBalanceMl(values.intake ?? NaN, values.output ?? NaN)
    if (net === null) return null
    return {
      title: 'Net fluid balance',
      value: net > 0 ? `+${net.toFixed(0)}` : net.toFixed(0),
      unit: 'ml',
      tone: net < -500 ? 'warn' : 'good',
      badge: net === 0 ? 'In balance' : net > 0 ? 'Positive balance' : 'Negative balance',
      note: 'Intake can include food water; output includes urine, sweat and breathing.',
    }
  },
  howItWorks: [
    { title: 'Total your intake', text: 'Drinks plus high-water foods, in ml.' },
    { title: 'Total your output', text: 'Urine, sweat and other losses, estimated.' },
    { title: 'Subtract', text: 'Intake - output = today\u2019s net balance.' },
  ],
  tips: [
    'For healthy people, simple daily targets beat obsessive tracking.',
    'Prolonged large negative balance needs review.',
    'Some medical conditions (heart, kidney) require opposite advice - follow your clinician.',
  ],
}

lifestyleGroup['dehydration-status-check'] = {
  id: 'dehydration-status-check',
  title: 'Dehydration Status Check',
  description: 'Estimate hydration status from a quick pre/post body-weight change.',
  icon: <HeartPulse className="h-6 w-6" />,
  breadcrumb: 'Health / Hydration',
  instruction: 'Enter weight before exercise and again after (with no drinking between).',
  sub: HY,
  emoji: '💧',
  accent: 'text-sky-600 bg-sky-50 border-sky-200',
  fields: [
    { key: 'pre', label: 'Weight before (kg)', type: 'number', placeholder: 'e.g. 72.0' },
    { key: 'post', label: 'Weight after (kg)', type: 'number', placeholder: 'e.g. 71.0' },
  ],
  compute: (values) => {
    const pre = values.pre ?? NaN
    const post = values.post ?? NaN
    if (!Number.isFinite(pre) || !Number.isFinite(post) || pre <= 0 || post <= 0 || post > pre) return null
    const pct = ((pre - post) / pre) * 100
    const status = hydrationStatus(pct)
    return {
      title: 'Estimated weight loss',
      value: pct.toFixed(1),
      unit: '% of body weight',
      tone: pct >= 2 ? 'danger' : pct >= 1 ? 'warn' : 'good',
      badge: status,
      note: '2% loss is the classic performance-drop threshold.',
    }
  },
  howItWorks: [
    { title: 'Weigh before', text: 'Right before exercise, bare skin.' },
    { title: 'Weigh after', text: 'Immediately after, without drinking in between.' },
    { title: 'Convert to percent', text: '(pre - post) \u00f7 pre \u00d7 100.' },
  ],
  tips: [
    '2% or more body weight lost means performance typically drops.',
    'Replace roughly 1-1.5x the lost fluid over the next hours.',
    'Sweat rate and loss both depend on heat, clothing and fitness.',
  ],
}

lifestyleGroup['one-rep-max-calculator'] = {
  id: 'one-rep-max-calculator',
  title: 'One-Rep Max Calculator',
  description: 'Estimate your 1RM from a heavier set using the Epley formula.',
  icon: <Dumbbell className="h-6 w-6" />,
  breadcrumb: 'Health / Fitness & Exercise',
  instruction: 'Enter a weight you handled for reps (2-12) to estimate your one-rep max.',
  sub: FI,
  emoji: '🏃',
  accent: 'text-orange-600 bg-orange-50 border-orange-200',
  fields: [
    { key: 'weight', label: 'Weight lifted (kg)', type: 'number', placeholder: 'e.g. 100' },
    { key: 'reps', label: 'Reps performed', type: 'number', min: 1, max: 12, placeholder: 'e.g. 5' },
  ],
  compute: (values) => {
    const one = oneRepMaxEpley(values.weight ?? NaN, values.reps ?? NaN)
    if (one === null) return null
    return { title: 'Estimated one-rep max', value: one.toFixed(1), unit: 'kg', tone: 'ok', badge: 'Epley formula', note: 'Estimate only - always train heavy lifts with a spotter.' }
  },
  howItWorks: [
    { title: 'Log your set', text: 'Weight and reps from a recent heavy set.' },
    { title: 'Apply Epley', text: '1RM \u2248 weight \u00d7 (1 + reps/30).' },
    { title: 'Plan training loads', text: 'Use percentages of the estimate to pick sets and reps.' },
  ],
  tips: [
    'For 10+ reps, the estimate drifts - prefer 3-8 rep sets.',
    'Retest every few months as strength improves.',
    'A true 1RM max test carries risk; spotter and collars please.',
  ],
}

lifestyleGroup['cooper-vo2max'] = {
  id: 'cooper-vo2max',
  title: 'Cooper VO2max Test',
  description: 'Estimate aerobic fitness from a 12-minute run distance.',
  icon: <Activity className="h-6 w-6" />,
  breadcrumb: 'Health / Fitness & Exercise',
  instruction: 'Enter the distance you covered in a 12-minute all-out run.',
  sub: FI,
  emoji: '🏃',
  accent: 'text-orange-600 bg-orange-50 border-orange-200',
  fields: [{ key: 'distance', label: 'Distance (metres)', type: 'number', placeholder: 'e.g. 2500' }],
  compute: (values) => {
    const v = vo2MaxCooper(values.distance ?? NaN)
    if (v === null) return null
    const label = v >= 44.5 ? 'Excellent range (men)' : v >= 36 ? 'Above average range' : v >= 30.5 ? 'Average range' : 'Below average - build slow miles'
    return { title: 'Estimated VO2max', value: v.toFixed(1), unit: 'ml/kg/min', tone: v >= 44.5 ? 'good' : v >= 30.5 ? 'ok' : 'warn', badge: label, note: 'The Cooper test correlates closely with lab VO2max for most runners.' }
  },
  howItWorks: [
    { title: 'Warm up properly', text: '10 minutes easy before the test.' },
    { title: 'Run as far as possible in 12 min', text: 'Flat course, steady maximal pace.' },
    { title: 'We apply Cooper\u2019s formula', text: 'VO2max = (distance - 504.9) \u00f7 44.73.' },
  ],
  tips: [
    'Retake every 4-6 weeks to see training progress.',
    'Weather changes results - run on comparable days.',
    'Started running recently? Walk-run the test first.',
  ],
}

lifestyleGroup['steps-to-distance'] = {
  id: 'steps-to-distance',
  title: 'Steps to Distance',
  description: 'Convert your step count into kilometres using your stride length.',
  icon: <Footprints className="h-6 w-6" />,
  breadcrumb: 'Health / Fitness & Exercise',
  instruction: 'Enter steps and your average stride length in centimetres.',
  sub: FI,
  emoji: '🏃',
  accent: 'text-orange-600 bg-orange-50 border-orange-200',
  fields: [
    { key: 'steps', label: 'Steps taken', type: 'number', placeholder: 'e.g. 10000' },
    { key: 'stride', label: 'Stride length (cm)', type: 'number', placeholder: 'e.g. 65' },
  ],
  compute: (values) => {
    const km = stepsToKm(values.steps ?? NaN, values.stride ?? NaN)
    if (km === null) return null
    const mins = km / 5 * 60
    return { title: 'Distance covered', value: km.toFixed(2), unit: 'km', tone: 'good', badge: mins > 0 ? `\u2248 ${Math.round(mins)} min at 5 km/h` : 'Walk your 10k', note: 'Stride length averages ~65-75 cm for adults at walking pace.' }
  },
  howItWorks: [
    { title: 'Count your steps', text: 'Phone/watch step totals work fine.' },
    { title: 'Pick a stride length', text: 'Measure 10 steps and divide the distance by 10.' },
    { title: 'Multiply', text: 'Steps \u00d7 stride (cm \u2192 m) \u00f7 1000 = km.' },
  ],
  tips: [
    'A wearable\u2019s own distance estimate is usually fine too.',
    'Stride changes with speed - walking vs running differ.',
    'Aim to build weekly steps gradually rather than overnight.',
  ],
}

lifestyleGroup['pace-calculator'] = {
  id: 'pace-calculator',
  title: 'Pace Calculator',
  description: 'Turn speed (km/h) into running or walking pace per kilometre.',
  icon: <Timer className="h-6 w-6" />,
  breadcrumb: 'Health / Fitness & Exercise',
  instruction: 'Enter your speed in km/h.',
  sub: FI,
  emoji: '🏃',
  accent: 'text-orange-600 bg-orange-50 border-orange-200',
  fields: [{ key: 'speed', label: 'Speed (km/h)', type: 'number', step: 0.1, placeholder: 'e.g. 10' }],
  compute: (values) => {
    const p = paceMinPerKm(values.speed ?? NaN)
    if (p === null) return null
    const mm = Math.floor(p)
    const ss = Math.round((p - mm) * 60)
    return { title: 'Pace', value: `${mm}:${String(ss).padStart(2, '0')}`, unit: 'min/km', tone: 'ok', badge: 'Speed \u2192 pace', note: 'Use pace to set predictable workout targets.' }
  },
  howItWorks: [
    { title: 'Enter your speed', text: 'Any pace from walking to sprinting.' },
    { title: 'Divide 60 by speed', text: 'Minutes per km = 60 \u00f7 km/h.' },
    { title: 'Format as mm:ss', text: 'Instant, readable pace.' },
  ],
  tips: [
    'Easy runs usually sit 60-75% of max pace.',
    'Track pace on the same course types for fair comparisons.',
    'Wind and hills change pace even at equal effort.',
  ],
}

lifestyleGroup['karvonen-zone'] = {
  id: 'karvonen-zone',
  title: 'Target Heart Rate Zone',
  description: 'Calculate the Karvonen target heart rate for a chosen intensity.',
  icon: <Gauge className="h-6 w-6" />,
  breadcrumb: 'Health / Fitness & Exercise',
  instruction: 'Enter max and resting heart rate plus the intensity you want to train at.',
  sub: FI,
  emoji: '🏃',
  accent: 'text-orange-600 bg-orange-50 border-orange-200',
  fields: [
    { key: 'maxHr', label: 'Max heart rate (bpm)', type: 'number', placeholder: 'e.g. 185' },
    { key: 'restHr', label: 'Resting heart rate (bpm)', type: 'number', placeholder: 'e.g. 60' },
    { key: 'pct', label: 'Intensity (%)', type: 'number', min: 1, max: 100, placeholder: 'e.g. 70' },
  ],
  compute: (values) => {
    const hr = karvonenHeartRate(values.maxHr ?? NaN, values.restHr ?? NaN, values.pct ?? NaN)
    if (hr === null) return null
    return { title: 'Karvonen target', value: hr.toFixed(0), unit: 'bpm', tone: 'good', badge: `${values.pct?.toFixed(0) ?? ''}% of heart-rate reserve`, note: 'HRR = max - resting; target = HRR \u00d7 % + resting.' }
  },
  howItWorks: [
    { title: 'Know max and resting HR', text: 'Max from age estimate or a field test; resting from waking measurement.' },
    { title: 'Subtract to find reserve', text: 'Heart-rate reserve (HRR) = max - resting.' },
    { title: 'Scale by intensity', text: 'Target = HRR \u00d7 % + resting.' },
  ],
  tips: [
    'Take resting HR after 3-5 truly restful mornings.',
    'Zone 2 (60-70%) builds your aerobic base.',
    'Consult a doctor before intense training if you have heart concerns.',
  ],
}

lifestyleGroup['running-time-eta'] = {
  id: 'running-time-eta',
  title: 'Running Time & ETA',
  description: 'Estimate how long a distance will take at your pace.',
  icon: <Timer className="h-6 w-6" />,
  breadcrumb: 'Health / Fitness & Exercise',
  instruction: 'Enter distance and pace (min/km) to see total time.',
  sub: FI,
  emoji: '🏃',
  accent: 'text-orange-600 bg-orange-50 border-orange-200',
  fields: [
    { key: 'distance', label: 'Distance (km)', type: 'number', step: 0.1, placeholder: 'e.g. 10' },
    { key: 'pace', label: 'Pace (min/km)', type: 'number', step: 0.1, placeholder: 'e.g. 6.0' },
  ],
  compute: (values) => {
    const h = runningTimeHours(values.distance ?? NaN, values.pace ?? NaN)
    if (h === null) return null
    const totalMin = Math.round(h * 60)
    const hh = Math.floor(totalMin / 60)
    const mm = totalMin % 60
    return { title: 'Total time', value: `${hh}:${String(mm).padStart(2, '0')}`, unit: 'h:mm', tone: 'ok', badge: 'Distance \u00d7 pace', note: 'Flat-road estimate - add about 4-6% for hilly courses.' }
  },
  howItWorks: [
    { title: 'Enter distance and pace', text: 'Both in km and minutes-per-km.' },
    { title: 'Multiply', text: 'Time = distance \u00d7 pace.' },
    { title: 'Read the clock', text: 'Formatted as hours:minutes.' },
  ],
  tips: [
    'Always plan slightly longer than the estimate on easy runs.',
    'Temperature and headwinds slow you down - allow buffer.',
    'Break long runs into km splits to pace mentally.',
  ],
}

lifestyleGroup['bp-category-check'] = {
  id: 'bp-category-check',
  title: 'Blood Pressure Category Check',
  description: 'Classify your blood pressure reading with the ACC/AHA categories.',
  icon: <Activity className="h-6 w-6" />,
  breadcrumb: 'Health / Heart & Cardiovascular',
  instruction: 'Enter your systolic and diastolic readings in mmHg.',
  sub: HE,
  emoji: '❤️',
  accent: 'text-red-600 bg-red-50 border-red-200',
  fields: [
    { key: 'sys', label: 'Systolic (mmHg)', type: 'number', placeholder: 'e.g. 128' },
    { key: 'dia', label: 'Diastolic (mmHg)', type: 'number', placeholder: 'e.g. 82' },
  ],
  compute: (values) => {
    const label = bpCategory(values.sys ?? NaN, values.dia ?? NaN)
    if (label === 'Enter valid readings') return null
    return {
      title: 'BP classification',
      value: `${values.sys?.toFixed(0) ?? ''}/${values.dia?.toFixed(0) ?? ''}`,
      unit: 'mmHg',
      tone: label.includes('Normal') ? 'good' : label.includes('crisis') ? 'danger' : label.includes('Elevated') ? 'warn' : 'warn',
      badge: label,
      note: 'Use the higher category when systolic and diastolic classify differently.',
    }
  },
  howItWorks: [
    { title: 'Take a proper reading', text: 'Seated, back supported, arm at heart level, 5 min rest first.' },
    { title: 'Enter both numbers', text: 'Systolic over diastolic.' },
    { title: 'Map to ACC/AHA', text: '130/80 and 140/90 are the main cut-offs.' },
  ],
  tips: [
    'One high reading is not a diagnosis - confirm over several days.',
    'Sit quietly without talking for 5 minutes before measuring.',
    'If systolic is 180+ or diastolic 120+, seek urgent care.',
  ],
}

lifestyleGroup['map-calculator'] = {
  id: 'map-calculator',
  title: 'Mean Arterial Pressure (MAP)',
  description: 'Calculate mean arterial pressure from systolic and diastolic readings.',
  icon: <Heart className="h-6 w-6" />,
  breadcrumb: 'Health / Heart & Cardiovascular',
  instruction: 'Enter systolic and diastolic blood pressure.',
  sub: HE,
  emoji: '❤️',
  accent: 'text-red-600 bg-red-50 border-red-200',
  fields: [
    { key: 'sys', label: 'Systolic (mmHg)', type: 'number', placeholder: 'e.g. 120' },
    { key: 'dia', label: 'Diastolic (mmHg)', type: 'number', placeholder: 'e.g. 80' },
  ],
  compute: (values) => {
    const m = mapValue(values.sys ?? NaN, values.dia ?? NaN)
    if (m === null) return null
    return {
      title: 'Mean arterial pressure',
      value: m.toFixed(0),
      unit: 'mmHg',
      tone: m < 60 ? 'warn' : m < 105 ? 'good' : 'warn',
      badge: m < 60 ? 'Low - seek review' : m < 105 ? 'Typical resting range (70-105)' : 'Elevated - monitor',
      note: 'MAP = (systolic + 2 \u00d7 diastolic) / 3.',
    }
  },
  howItWorks: [
    { title: 'Enter both pressures', text: 'Systolic and diastolic.' },
    { title: 'Weight the diastolic', text: 'Diastolic counts twice because the heart spends more time in diastole.' },
    { title: 'Average', text: '(S + 2D) / 3 gives MAP.' },
  ],
  tips: [
    'MAP is a useful single number for organ perfusion.',
    'A single value won\u2019t replace repeated home measurement.',
    'Very low MAP with dizziness/syncope needs medical review.',
  ],
}

lifestyleGroup['pulse-pressure-check'] = {
  id: 'pulse-pressure-check',
  title: 'Pulse Pressure',
  description: 'Find the gap between systolic and diastolic blood pressure.',
  icon: <Activity className="h-6 w-6" />,
  breadcrumb: 'Health / Heart & Cardiovascular',
  instruction: 'Enter systolic and diastolic readings.',
  sub: HE,
  emoji: '❤️',
  accent: 'text-red-600 bg-red-50 border-red-200',
  fields: [
    { key: 'sys', label: 'Systolic (mmHg)', type: 'number', placeholder: 'e.g. 120' },
    { key: 'dia', label: 'Diastolic (mmHg)', type: 'number', placeholder: 'e.g. 80' },
  ],
  compute: (values) => {
    const pp = pulsePressure(values.sys ?? NaN, values.dia ?? NaN)
    if (pp === null) return null
    return { title: 'Pulse pressure', value: pp.toFixed(0), unit: 'mmHg', tone: pp > 60 ? 'warn' : 'good', badge: pp > 60 ? 'Wide pulse pressure' : 'Healthy spread (30-60)', note: 'Chronically wide pulse pressure is linked to higher cardiovascular risk.' }
  },
  howItWorks: [
    { title: 'Enter both numbers', text: 'Systolic and diastolic.' },
    { title: 'Subtract', text: 'Pulse pressure = systolic - diastolic.' },
    { title: 'Interpret the spread', text: 'A 30-60 gap is typical in healthy adults.' },
  ],
  tips: [
    'A one-off wide reading is not alarming by itself.',
    'Anxiety, anaemia and stiff arteries can widen pulse pressure.',
    'Confirm with repeated home measurements before worrying.',
  ],
}

lifestyleGroup['friedewald-ldl'] = {
  id: 'friedewald-ldl',
  title: 'Friedewald LDL Calculator',
  description: 'Estimate LDL cholesterol from a routine lipid panel.',
  icon: <Radar className="h-6 w-6" />,
  breadcrumb: 'Health / Heart & Cardiovascular',
  instruction: 'Enter total cholesterol, HDL, and triglycerides in mg/dL.',
  sub: HE,
  emoji: '❤️',
  accent: 'text-red-600 bg-red-50 border-red-200',
  fields: [
    { key: 'total', label: 'Total cholesterol (mg/dL)', type: 'number', placeholder: 'e.g. 200' },
    { key: 'hdl', label: 'HDL (mg/dL)', type: 'number', placeholder: 'e.g. 50' },
    { key: 'tg', label: 'Triglycerides (mg/dL)', type: 'number', placeholder: 'e.g. 150' },
  ],
  compute: (values) => {
    const ldl = friedewaldLdl(values.total ?? NaN, values.hdl ?? NaN, values.tg ?? NaN)
    if (ldl === null) return null
    return {
      title: 'Estimated LDL',
      value: ldl.toFixed(1),
      unit: 'mg/dL',
      tone: ldl < 100 ? 'good' : ldl < 130 ? 'ok' : ldl < 160 ? 'warn' : 'danger',
      badge: ldlBand(ldl),
      note: 'Valid mainly when triglycerides are below ~400 mg/dL.',
    }
  },
  howItWorks: [
    { title: 'Gather a lipid panel', text: 'TC, HDL and triglycerides in the same units.' },
    { title: 'Apply Friedewald', text: 'LDL = TC - HDL - TG/5.' },
    { title: 'Read the category', text: 'Below 100 mg/dL is the common optimal target.' },
  ],
  tips: [
    'Fasting is usually required for accurate triglycerides.',
    'Direct LDL lab measurement exists if Friedewald won\u2019t work.',
    'Interpret lipids with your overall risk, not one number.',
  ],
}

lifestyleGroup['tc-hdl-ratio'] = {
  id: 'tc-hdl-ratio',
  title: 'Total/HDL Cholesterol Ratio',
  description: 'The classic ratio summary of your cholesterol profile.',
  icon: <Heart className="h-6 w-6" />,
  breadcrumb: 'Health / Heart & Cardiovascular',
  instruction: 'Enter total cholesterol and HDL.',
  sub: HE,
  emoji: '❤️',
  accent: 'text-red-600 bg-red-50 border-red-200',
  fields: [
    { key: 'total', label: 'Total cholesterol (mg/dL)', type: 'number', placeholder: 'e.g. 200' },
    { key: 'hdl', label: 'HDL (mg/dL)', type: 'number', placeholder: 'e.g. 55' },
  ],
  compute: (values) => {
    const r = tcHdlRatio(values.total ?? NaN, values.hdl ?? NaN)
    if (r === null) return null
    return { title: 'Total/HDL ratio', value: r.toFixed(1), unit: 'ratio', tone: r < 3.5 ? 'good' : r < 5 ? 'ok' : 'warn', badge: r < 3.5 ? 'Desirable (<3.5)' : r < 5 ? 'Moderate' : 'Higher risk zone', note: 'A simple single-figure risk hint - not a stand-alone diagnosis.' }
  },
  howItWorks: [
    { title: 'Collect two values', text: 'Total cholesterol and HDL.' },
    { title: 'Divide', text: 'TC \u00f7 HDL.' },
    { title: 'Compare', text: 'Lower is generally better; <3.5 is the classic aim.' },
  ],
  tips: [
    'HDL raises are hard to force - focus on movement and quitting smoking.',
    'Triglycerides and LDL should still be reviewed separately.',
    'Ask your care team what target fits your personal risk.',
  ],
}

lifestyleGroup['resting-hr-check'] = {
  id: 'resting-hr-check',
  title: 'Resting Heart Rate Check',
  description: 'Compare your resting heart rate with typical ranges.',
  icon: <Gauge className="h-6 w-6" />,
  breadcrumb: 'Health / Heart & Cardiovascular',
  instruction: 'Enter your resting heart rate in beats per minute.',
  sub: HE,
  emoji: '❤️',
  accent: 'text-red-600 bg-red-50 border-red-200',
  fields: [{ key: 'hr', label: 'Resting heart rate (bpm)', type: 'number', placeholder: 'e.g. 65' }],
  compute: (values) => {
    const label = restingHrBand(values.hr ?? NaN)
    if (label === 'Unknown') return null
    return { title: 'Resting heart rate', value: values.hr?.toFixed(0) ?? '', unit: 'bpm', tone: label.includes('Normal') ? 'good' : 'ok', badge: label, note: 'Best measured on waking, before coffee, seated quietly.' }
  },
  howItWorks: [
    { title: 'Measure on waking', text: 'Before coffee or movement, 60 seconds.' },
    { title: 'Enter the number', text: 'Beats per minute.' },
    { title: 'Compare to range', text: '60-100 is typical; fit adults often sit 50-70.' },
  ],
  tips: [
    'A chronic resting rate under 60 in athletes is usually fine.',
    'Persistently above 100 while at rest deserves a clinician visit.',
    'Fever, stress and caffeine all raise resting heart rate.',
  ],
}

lifestyleGroup['ldl-band-check'] = {
  id: 'ldl-band-check',
  title: 'LDL Category Check',
  description: 'Place an LDL cholesterol value into its clinical category.',
  icon: <Radar className="h-6 w-6" />,
  breadcrumb: 'Health / Heart & Cardiovascular',
  instruction: 'Enter your LDL cholesterol in mg/dL.',
  sub: HE,
  emoji: '❤️',
  accent: 'text-red-600 bg-red-50 border-red-200',
  fields: [{ key: 'ldl', label: 'LDL (mg/dL)', type: 'number', placeholder: 'e.g. 140' }],
  compute: (values) => {
    const l = values.ldl ?? NaN
    if (!Number.isFinite(l) || l <= 0) return null
    const label = ldlBand(l)
    return { title: 'LDL cholesterol', value: l.toFixed(0), unit: 'mg/dL', tone: l < 100 ? 'good' : l < 130 ? 'ok' : l < 160 ? 'warn' : 'danger', badge: label, note: 'Targets depend on personal risk - someone after a heart event aims much lower than 100.' }
  },
  howItWorks: [
    { title: 'Enter LDL', text: 'From your lipid panel.' },
    { title: 'Find the band', text: 'Optimal <100, near-optimal <130, then rising bands.' },
    { title: 'Put it in context', text: 'Personal risk factors shift where targets should sit.' },
  ],
  tips: [
    'Low-dose everyday change: fibre, movement, less saturated fat.',
    'Statin benefit scales with absolute risk, not just LDL.',
    'Have lipids rechecked after lifestyle changes to see progress.',
  ],
}