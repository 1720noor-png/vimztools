import { CalendarDays, CalendarRange, Calendar, Clock, AlarmClock, Moon, Sun, Droplets, Scale, HeartPulse, Brain, Timer, Activity, Sprout, Coffee, Gauge, Repeat, Thermometer } from 'lucide-react'
import type { HealthToolConfig } from '../HealthGenericTool'
import {
  cycleStats, nextPeriodDate, bbtLutealDays, lutealPhaseLength,
  conceptionDate, ivfDueDate, pregnancyMilestones, hcgDoublingHours,
  fundalHeightRange, pcosSymptomScore, pcosCycleScore, pcosCalorieTarget,
  pcosLifestyleScore, postpartumWeightProgress, breastfeedingFluidMl,
  postpartumRecoveryScore,
} from '../../../../lib/health/womenCycles'
import {
  minToClock, wakeTimesFromBedtime, bedtimesFromWake, sleepDurationMinutes,
  sleepCyclesBetween, napAdvice, sleepConsistency, sleepEfficiency, shiftPlan,
} from '../../../../lib/health/sleepPlanner'

const WH = "Women's Health"
const SL = 'Sleep & Recovery'

const BEDTIMES = [
  { value: '1200', label: '8:00 PM' },
  { value: '1260', label: '9:00 PM' },
  { value: '1320', label: '10:00 PM' },
  { value: '1380', label: '11:00 PM' },
  { value: '0', label: '12:00 AM' },
  { value: '1500', label: '1:00 AM' },
]
const WAKES = [
  { value: '300', label: '5:00 AM' },
  { value: '360', label: '6:00 AM' },
  { value: '420', label: '7:00 AM' },
  { value: '480', label: '8:00 AM' },
  { value: '540', label: '9:00 AM' },
]

export const extrasWomenSleepGroup: Record<string, HealthToolConfig> = {}

extrasWomenSleepGroup['cycle-length-calculator'] = {
  id: 'cycle-length-calculator',
  title: 'Cycle Length Calculator',
  description: 'Average your last three cycle lengths and find your shortest and longest.',
  icon: <CalendarRange className="h-6 w-6" />,
  breadcrumb: 'Health / Women\u2019s Health',
  instruction: 'Enter the length in days of your last three cycles.',
  sub: WH,
  emoji: '👩',
  accent: 'text-pink-600 bg-pink-50 border-pink-200',
  fields: [
    { key: 'c1', label: 'Cycle 1 (days)', type: 'number', min: 15, max: 60, placeholder: 'e.g. 29' },
    { key: 'c2', label: 'Cycle 2 (days)', type: 'number', min: 15, max: 60, placeholder: 'e.g. 28' },
    { key: 'c3', label: 'Cycle 3 (days)', type: 'number', min: 15, max: 60, placeholder: 'e.g. 30' },
  ],
  compute: (values) => {
    const s = cycleStats(values.c1 ?? NaN, values.c2 ?? NaN, values.c3 ?? NaN)
    if (s === null) return null
    return { title: 'Average cycle', value: s.average.toFixed(1), unit: 'days', tone: s.average >= 21 && s.average <= 35 ? 'good' : 'warn', badge: `Range ${s.shortest}-${s.longest} days`, note: 'Most cycles run 21-35 days. A consistent average makes period and ovulation prediction far more reliable.' }
  },
  howItWorks: [
    { title: 'Log three cycles', text: 'Days from period to period.' },
    { title: 'Average them', text: 'Mean, shortest, longest.' },
    { title: 'Read the trend', text: '21-35 days is the common band.' },
  ],
  tips: [
    'Cycle length counts from day 1 of a period to day 1 of the next.',
    'Spotting days still count as the cycle start.',
    'Large swings (7+ days) are worth mentioning to a clinician.',
  ],
}

extrasWomenSleepGroup['period-delay-planner'] = {
  id: 'period-delay-planner',
  title: 'Period Delay Planner',
  description: 'Work out your next expected period date when planning ahead.',
  icon: <CalendarDays className="h-6 w-6" />,
  breadcrumb: 'Health / Women\u2019s Health',
  instruction: 'Enter your last period start date and typical cycle length.',
  sub: WH,
  emoji: '👩',
  accent: 'text-pink-600 bg-pink-50 border-pink-200',
  fields: [
    { key: 'lmp', label: 'Last period start date', type: 'date' },
    { key: 'cycle', label: 'Typical cycle length', type: 'select', options: [{ value: '25', label: '25 days' }, { value: '28', label: '28 days' }, { value: '30', label: '30 days' }, { value: '32', label: '32 days' }, { value: '35', label: '35 days' }] },
  ],
  compute: (values) => {
    if (values.lmp === null || values.cycle === null) return null
    const iso = new Date(values.lmp).toISOString().slice(0, 10)
    const r = nextPeriodDate(iso, values.cycle)
    if (r === null) return null
    return { title: 'Next period', value: r.date, unit: '', tone: 'ok', badge: `Due in ${r.daysUntil} days`, note: 'Planning to delay a period (travel, event) must start several days before this date with prescriber guidance - continuous pills, not painkillers.' }
  },
  howItWorks: [
    { title: 'Enter last start', text: 'Day 1 of your period.' },
    { title: 'Enter cycle length', text: 'Your usual gap in days.' },
    { title: 'Add them', text: 'Gives the expected next date.' },
  ],
  tips: [
    'Hormonal delay needs a prescription - start it 3-4 days early.',
    'Tranexamic acid or NSAIDs only lighten, they do not delay.',
    'A missed dose breaks the delay - set reminders.',
  ],
}

extrasWomenSleepGroup['bbt-luteal-check'] = {
  id: 'bbt-luteal-check',
  title: 'BBT Luteal Phase Check',
  description: 'Use a temperature-rise day to estimate your luteal (post-ovulation) length.',
  icon: <Thermometer className="h-6 w-6" />,
  breadcrumb: 'Health / Women\u2019s Health',
  instruction: 'Enter your cycle length and the cycle day you saw a sustained temperature rise.',
  sub: WH,
  emoji: '👩',
  accent: 'text-pink-600 bg-pink-50 border-pink-200',
  fields: [
    { key: 'cycle', label: 'Cycle length (days)', type: 'number', min: 15, max: 60, placeholder: 'e.g. 28' },
    { key: 'rise', label: 'Day of sustained temp rise', type: 'number', min: 1, max: 40, placeholder: 'e.g. 14' },
  ],
  compute: (values) => {
    const luteal = bbtLutealDays(values.cycle ?? NaN, values.rise ?? NaN)
    if (luteal === null) return null
    return { title: 'Luteal phase', value: luteal.toFixed(0), unit: 'days', tone: luteal >= 10 && luteal <= 16 ? 'good' : 'warn', badge: luteal < 10 ? 'Short luteal phase' : 'Normal range', note: 'The corpus luteum phase typically lasts 10-16 days. Below 10 days repeatedly can make implantation timing tricky.' }
  },
  howItWorks: [
    { title: 'Take BBT daily', text: 'Before rising, same time.' },
    { title: 'Spot the rise', text: 'Ovulation happens just before it.' },
    { title: 'Count after it', text: 'Days until the next period.' },
  ],
  tips: [
    'BBT confirms ovulation already happened.',
    'A rise needs 0.2-0.3°C sustained for 3 days.',
    'Luteal phases under 10 days warrant a chat with your doctor.',
  ],
}

extrasWomenSleepGroup['luteal-phase-calculator'] = {
  id: 'luteal-phase-calculator',
  title: 'Luteal Phase Calculator',
  description: 'Discover your luteal phase length from ovulation day and cycle length.',
  icon: <Sprout className="h-6 w-6" />,
  breadcrumb: 'Health / Women\u2019s Health',
  instruction: 'Enter your usual cycle length and estimated ovulation day.',
  sub: WH,
  emoji: '👩',
  accent: 'text-pink-600 bg-pink-50 border-pink-200',
  fields: [
    { key: 'cycle', label: 'Cycle length (days)', type: 'number', min: 15, max: 60, placeholder: 'e.g. 28' },
    { key: 'ovulation', label: 'Ovulation day', type: 'number', min: 1, max: 40, placeholder: 'e.g. 14' },
  ],
  compute: (values) => {
    const luteal = lutealPhaseLength(values.cycle ?? NaN, values.ovulation ?? NaN)
    if (luteal === null) return null
    return { title: 'Luteal phase', value: luteal.toFixed(0), unit: 'days', tone: luteal >= 10 && luteal <= 16 ? 'good' : 'warn', badge: 'Cycle minus ovulation day', note: 'Ovulation splits the cycle: follicular before, luteal after. The luteal half is the more predictable one in most people.' }
  },
  howItWorks: [
    { title: 'Enter cycle', text: 'Total length in days.' },
    { title: 'Enter ovulation day', text: 'From tracking or apps.' },
    { title: 'Subtract', text: 'Luteal = cycle − ovulation day.' },
  ],
  tips: [
    'Luteal phase length is fairly stable per person.',
    'Ovulation around day 14 is the textbook example, not the rule.',
    'Apps guessing ovulation day make this approximate.',
  ],
}

extrasWomenSleepGroup['conception-date-calculator'] = {
  id: 'conception-date-calculator',
  title: 'Conception Date Calculator',
  description: 'Estimate a conception date from a due date or from your last period.',
  icon: <Calendar className="h-6 w-6" />,
  breadcrumb: 'Health / Women\u2019s Health',
  instruction: 'Choose what you know (due date or last period) and enter it.',
  sub: WH,
  emoji: '👩',
  accent: 'text-pink-600 bg-pink-50 border-pink-200',
  fields: [
    { key: 'mode', label: 'I know my...', type: 'select', options: [{ value: '1', label: 'Estimated due date' }, { value: '2', label: 'Last period start' }] },
    { key: 'iso', label: 'That date', type: 'date' },
  ],
  compute: (values) => {
    if (values.iso === null || values.mode === null) return null
    const iso = new Date(values.iso).toISOString().slice(0, 10)
    const c = conceptionDate(values.mode === 1 ? 'due' : 'lmp', iso)
    if (c === null) return null
    return { title: 'Estimated conception', value: c, unit: '', tone: 'ok', badge: values.mode === 2 ? 'From LMP + ~14 days' : 'Due date minus 266 days', note: 'Conception usually lands within a ±2-3 day window around this date because sperm can wait a few days.' }
  },
  howItWorks: [
    { title: 'Pick your anchor', text: 'Due date or last period.' },
    { title: 'Enter the date', text: 'The one you are sure about.' },
    { title: 'Back-calculate', text: 'A 266-day pregnancy from due date.' },
  ],
  tips: [
    'Due date also works backwards as a rough conception anchor.',
    'Ovulation dictates the conception window.',
    'Early ultrasound is the most accurate dating tool.',
  ],
}

extrasWomenSleepGroup['ivf-due-date-calculator'] = {
  id: 'ivf-due-date-calculator',
  title: 'IVF Due Date Calculator',
  description: 'Estimate an IVF due date from embryo transfer date and embryo age.',
  icon: <CalendarDays className="h-6 w-6" />,
  breadcrumb: 'Health / Women\u2019s Health',
  instruction: 'Enter the embryo transfer date and which day embryo was transferred.',
  sub: WH,
  emoji: '👩',
  accent: 'text-pink-600 bg-pink-50 border-pink-200',
  fields: [
    { key: 'iso', label: 'Transfer date', type: 'date' },
    { key: 'embryo', label: 'Embryo day', type: 'select', options: [{ value: '3', label: 'Day 3 (cleavage)' }, { value: '5', label: 'Day 5 (blastocyst)' }, { value: '6', label: 'Day 6 (blastocyst)' }] },
  ],
  compute: (values) => {
    if (values.iso === null || values.embryo === null) return null
    const iso = new Date(values.iso).toISOString().slice(0, 10)
    const d = ivfDueDate(iso, values.embryo)
    if (d === null) return null
    return { title: 'Estimated due date', value: d, unit: '', tone: 'ok', badge: values.embryo === 5 ? 'Day-5 blastocyst' : values.embryo === 6 ? 'Day-6 blastocyst' : 'Day-3 embryo', note: 'Clinic protocols differ slightly - confirm with your fertility center. The transfer-age correction is standard: older embryos get a slightly earlier due date.' }
  },
  howItWorks: [
    { title: 'Enter transfer date', text: 'The day of the procedure.' },
    { title: 'Select embryo day', text: '3, 5 or 6.' },
    { title: 'Add the offset', text: '261-263 days depending on age.' },
  ],
  tips: [
    'Blastocysts (day 5) implant-ready embryos date slightly earlier.',
    'Your IVF tracker will log every scan milestone.',
    'Due-date accuracy improves after the first ultrasound.',
  ],
}

extrasWomenSleepGroup['pregnancy-milestones'] = {
  id: 'pregnancy-milestones',
  title: 'Pregnancy Milestone Tracker',
  description: 'Map the key trimester milestones from your last period start date.',
  icon: <HeartPulse className="h-6 w-6" />,
  breadcrumb: 'Health / Women\u2019s Health',
  instruction: 'Enter your last period start date.',
  sub: WH,
  emoji: '👩',
  accent: 'text-pink-600 bg-pink-50 border-pink-200',
  fields: [{ key: 'lmp', label: 'Last period start date', type: 'date' }],
  compute: (values) => {
    if (values.lmp === null) return null
    const iso = new Date(values.lmp).toISOString().slice(0, 10)
    const m = pregnancyMilestones(iso)
    if (m === null) return null
    return { title: 'Milestones', value: 'Track', unit: '', tone: 'ok', badge: 'Dates from LMP', note: m.join(' · ') }
  },
  howItWorks: [
    { title: 'Enter LMP', text: 'Day 1 of last period.' },
    { title: 'Add 7-day weeks', text: 'Walk week by week.' },
    { title: 'Read the dates', text: 'Key scan and trimester markers.' },
  ],
  tips: [
    'Trimester 1 runs to ~13 weeks, trimester 2 to ~28.',
    'The 20-week anatomy scan is a highlight.',
    'Between 37-42 weeks is considered full term.',
  ],
}

extrasWomenSleepGroup['hcg-level-check'] = {
  id: 'hcg-level-check',
  title: 'hCG Level Check',
  description: 'Estimate hCG doubling time from two blood draws.',
  icon: <Activity className="h-6 w-6" />,
  breadcrumb: 'Health / Women\u2019s Health',
  instruction: 'Enter two hCG values and the days between the tests.',
  sub: WH,
  emoji: '👩',
  accent: 'text-pink-600 bg-pink-50 border-pink-200',
  fields: [
    { key: 'first', label: 'First hCG (mIU/mL)', type: 'number', min: 1, max: 100000, placeholder: 'e.g. 120' },
    { key: 'second', label: 'Second hCG (mIU/mL)', type: 'number', min: 1, max: 100000, placeholder: 'e.g. 240' },
    { key: 'days', label: 'Days between draws', type: 'number', min: 1, max: 30, placeholder: 'e.g. 2' },
  ],
  compute: (values) => {
    const h = hcgDoublingHours(values.first ?? NaN, values.second ?? NaN, values.days ?? NaN)
    if (h === null) return null
    return { title: 'Doubling time', value: h.toFixed(0), unit: 'hours', tone: h <= 72 ? 'good' : h <= 96 ? 'ok' : 'warn', badge: h <= 72 ? 'Typical early-pregnancy pace' : 'Slower rise - follow-up advised', note: 'In early pregnancy hCG usually doubles every ~48-72 hours. Very high or plateauing values need a clinician to interpret, never self-diagnosis.' }
  },
  howItWorks: [
    { title: 'Enter two values', text: 'Two separate draws.' },
    { title: 'Enter the gap', text: 'Days between them.' },
    { title: 'Solve for doubling', text: 'Rate of exponential growth.' },
  ],
  tips: [
    'Lower hCG values rise differently than higher ones.',
    'A single value means little - trends matter.',
    'Talk to your provider before worrying over one number.',
  ],
}

extrasWomenSleepGroup['fundal-height-check'] = {
  id: 'fundal-height-check',
  title: 'Fundal Height Check',
  description: 'See the expected and measured fundal height band for gestational age.',
  icon: <Gauge className="h-6 w-6" />,
  breadcrumb: 'Health / Women\u2019s Health',
  instruction: 'Enter your gestational age in weeks and your measured fundal height in cm.',
  sub: WH,
  emoji: '👩',
  accent: 'text-pink-600 bg-pink-50 border-pink-200',
  fields: [
    { key: 'weeks', label: 'Gestational age (weeks)', type: 'number', min: 20, max: 36, placeholder: 'e.g. 26' },
    { key: 'measured', label: 'Fundal height measured (cm)', type: 'number', min: 10, max: 45, step: 0.5, placeholder: 'e.g. 27' },
  ],
  compute: (values) => {
    const r = fundalHeightRange(values.weeks ?? NaN)
    if (r === null || values.measured === null) return null
    const inBand = values.measured >= r.low && values.measured <= r.high
    return { title: 'Expected band', value: `${r.low}-${r.high}`, unit: 'cm', tone: inBand ? 'good' : 'warn', badge: inBand ? 'Matches gestational age' : 'Outside expected band', note: 'Between weeks 20-36 fundal height tracks weeks ±2 cm. A mismatch of more than 2 cm deserves a clinician\u2019s look.' }
  },
  howItWorks: [
    { title: 'Enter weeks', text: 'Gestational age 20-36.' },
    { title: 'Enter measured height', text: 'From the pubic bone to fundus.' },
    { title: 'Compare', text: 'Expected = weeks ± 2 cm.' },
  ],
  tips: [
    'Measure with a tape on a full-length exam.',
    'One outlier is not alarming - trends matter.',
    'Growth scans are the gold standard for size.',
  ],
}

extrasWomenSleepGroup['pcos-symptom-assessment'] = {
  id: 'pcos-symptom-assessment',
  title: 'PCOS Symptom Self-Assessment',
  description: 'A quick score of classic PCOS-linked symptoms for a fuller picture.',
  icon: <Brain className="h-6 w-6" />,
  breadcrumb: 'Health / Women\u2019s Health',
  instruction: 'Tick the symptoms that apply to you. This is a screening aid, not a diagnosis.',
  sub: WH,
  emoji: '👩',
  accent: 'text-pink-600 bg-pink-50 border-pink-200',
  fields: [
    { key: 'irregular', label: 'Irregular / missed periods', type: 'bool' },
    { key: 'acne', label: 'Persistent acne', type: 'bool' },
    { key: 'hirsutism', label: 'Excess facial or body hair', type: 'bool' },
    { key: 'overweight', label: 'Overweight / weight gain tendency', type: 'bool' },
    { key: 'hairloss', label: 'Thinning scalp hair', type: 'bool' },
    { key: 'patches', label: 'Dark thickened skin patches', type: 'bool' },
  ],
  compute: (values) => {
    const s = pcosSymptomScore(values.irregular === 1, values.acne === 1, values.hirsutism === 1, values.overweight === 1, values.hairloss === 1, values.patches === 1)
    if (s === null) return null
    return { title: 'PCOS symptom score', value: s.toFixed(0), unit: '/10', tone: s >= 6 ? 'warn' : s >= 3 ? 'ok' : 'good', badge: s >= 6 ? 'Pattern warrants review' : s >= 3 ? 'Some linked features' : 'Few classic features', note: 'Diagnosis needs clinical criteria (often 2 of 3: irregular cycles, hyperandrogenism, polycystic ovaries). Use this to prepare for a doctor visit.', pct: s * 10 }
  },
  howItWorks: [
    { title: 'Tick symptoms', text: 'Six classic PCOS-linked signs.' },
    { title: 'Weight them', text: 'Irregularity and hirsutism count most.' },
    { title: 'Read the score', text: '0-10 symptom picture.' },
  ],
  tips: [
    'PCOS shows up differently in different people.',
    'Blood tests and ultrasound complete the picture.',
    'Lifestyle changes often improve cycle regularity.',
  ],
}

extrasWomenSleepGroup['pcos-cycle-tracker'] = {
  id: 'pcos-cycle-tracker',
  title: 'PCOS Cycle Tracker',
  description: 'Rate your cycle regularity from length, frequency and variation.',
  icon: <CalendarRange className="h-6 w-6" />,
  breadcrumb: 'Health / Women\u2019s Health',
  instruction: 'Enter average cycle length, cycles per year and whether lengths swing widely.',
  sub: WH,
  emoji: '👩',
  accent: 'text-pink-600 bg-pink-50 border-pink-200',
  fields: [
    { key: 'cycle', label: 'Average cycle length (days)', type: 'number', min: 15, max: 90, placeholder: 'e.g. 40' },
    { key: 'annual', label: 'Periods per year', type: 'number', min: 1, max: 13, placeholder: 'e.g. 6' },
    { key: 'vary', label: 'Cycle length varies by 7+ days', type: 'bool' },
  ],
  compute: (values) => {
    const s = pcosCycleScore(values.cycle ?? NaN, values.annual ?? NaN, values.vary === 1)
    if (s === null) return null
    return { title: 'Regularity score', value: s.toFixed(0), unit: '/10', tone: s >= 7 ? 'good' : s >= 4 ? 'warn' : 'danger', badge: s >= 7 ? 'Fairly regular cycles' : s >= 4 ? 'Irregular pattern' : 'Highly irregular cycles', note: 'Regular cycles typically mean 21-35 days and 8+ periods a year. Fewer than 8 or wide swings fit the typical PCOS pattern.', pct: s * 10 }
  },
  howItWorks: [
    { title: 'Enter cycle length', text: 'Days, typical value.' },
    { title: 'Enter periods/year', text: 'Annual count.' },
    { title: 'Note variation', text: 'Wide swings lower the score.' },
  ],
  tips: [
    'Fewer than 8-9 periods a year can affect uterine lining.',
    'Weight, insulin and sleep all shift cycle regularity.',
    'Track continuously - one month is not a pattern.',
  ],
}

extrasWomenSleepGroup['pcos-weight-management'] = {
  id: 'pcos-weight-management',
  title: 'PCOS Weight Management',
  description: 'A PCOS-aware calorie target from your BMR, activity and insulin status.',
  icon: <Scale className="h-6 w-6" />,
  breadcrumb: 'Health / Women\u2019s Health',
  instruction: 'Enter your BMR, an activity factor and whether insulin resistance is relevant.',
  sub: WH,
  emoji: '👩',
  accent: 'text-pink-600 bg-pink-50 border-pink-200',
  fields: [
    { key: 'bmr', label: 'BMR (kcal) - use a TDEE tool first', type: 'number', min: 900, max: 4000, placeholder: 'e.g. 1500' },
    { key: 'factor', label: 'Activity factor', type: 'select', options: [{ value: '1.2', label: '1.2 - sedentary' }, { value: '1.375', label: '1.375 - light' }, { value: '1.55', label: '1.55 - moderate' }, { value: '1.725', label: '1.725 - very active' }] },
    { key: 'ir', label: 'Insulin resistance known/suspected', type: 'bool' },
  ],
  compute: (values) => {
    const t = pcosCalorieTarget(values.bmr ?? NaN, values.factor ?? NaN, values.ir === 1)
    if (t === null) return null
    return { title: 'PCOS-aware calorie target', value: t.toFixed(0), unit: 'kcal', tone: 'ok', badge: values.ir === 1 ? 'Insulin-adjusted (-10%)' : 'Standard total (-5%)', note: 'People with PCOS often respond well to a modestly lower calorie band with more protein and fiber. Drop 250-500 kcal from this only with an eating plan in place.' }
  },
  howItWorks: [
    { title: 'Enter BMR', text: 'Base metabolic rate.' },
    { title: 'Times activity', text: 'Your daily movement factor.' },
    { title: 'Adjust for PCOS', text: 'Slight deficit for insulin tone.' },
  ],
  tips: [
    'Even 5-10% weight loss improves PCOS symptoms.',
    'Spread carbs with protein to blunt insulin spikes.',
    'Pair with a clinician when adjusting medications.',
  ],
}

extrasWomenSleepGroup['pcos-lifestyle-score'] = {
  id: 'pcos-lifestyle-score',
  title: 'PCOS Lifestyle Tracker',
  description: 'Score five daily habits that support PCOS management out of 100.',
  icon: <Sun className="h-6 w-6" />,
  breadcrumb: 'Health / Women\u2019s Health',
  instruction: 'Rate each habit 0-20 based on how it went today.',
  sub: WH,
  emoji: '👩',
  accent: 'text-pink-600 bg-pink-50 border-pink-200',
  fields: [
    { key: 'diet', label: 'Diet (0-20)', type: 'number', min: 0, max: 20, placeholder: 'e.g. 14' },
    { key: 'sleep', label: 'Sleep (0-20)', type: 'number', min: 0, max: 20, placeholder: 'e.g. 15' },
    { key: 'stress', label: 'Stress management (0-20)', type: 'number', min: 0, max: 20, placeholder: 'e.g. 12' },
    { key: 'activity', label: 'Movement (0-20)', type: 'number', min: 0, max: 20, placeholder: 'e.g. 16' },
    { key: 'hydration', label: 'Hydration (0-20)', type: 'number', min: 0, max: 20, placeholder: 'e.g. 13' },
  ],
  compute: (values) => {
    const s = pcosLifestyleScore(values.diet ?? NaN, values.sleep ?? NaN, values.stress ?? NaN, values.activity ?? NaN, values.hydration ?? NaN)
    if (s === null) return null
    return { title: 'Daily lifestyle score', value: s.toFixed(0), unit: '/100', tone: s >= 75 ? 'good' : s >= 50 ? 'ok' : 'warn', badge: s >= 75 ? 'Strong supportive day' : s >= 50 ? 'Balance is building' : 'A rough day - no guilt', note: 'Rebalancing insulin benefits from consistent, gentle habits rather than perfect ones. Score today, adjust tomorrow.', pct: s }
  },
  howItWorks: [
    { title: 'Rate 5 habits', text: 'Each from 0-20.' },
    { title: 'Add them up', text: 'Total out of 100.' },
    { title: 'Spot the weak spot', text: 'The lowest category is next week\u2019s focus.' },
  ],
  tips: [
    'Consistency over all-or-nothing.',
    'Sleep and stress quietly move insulin resistance.',
    'A weekly average beats a single-day verdict.',
  ],
}

extrasWomenSleepGroup['postpartum-weight-tracker'] = {
  id: 'postpartum-weight-tracker',
  title: 'Postpartum Weight Tracker',
  description: 'See how much pregnancy weight you have lost and your weekly pace.',
  icon: <Scale className="h-6 w-6" />,
  breadcrumb: 'Health / Women\u2019s Health',
  instruction: 'Enter your pre-pregnancy weight, current weight and weeks since birth.',
  sub: WH,
  emoji: '👩',
  accent: 'text-pink-600 bg-pink-50 border-pink-200',
  fields: [
    { key: 'pre', label: 'Pre-pregnancy weight (kg)', type: 'number', min: 30, max: 300, placeholder: 'e.g. 68' },
    { key: 'current', label: 'Current weight (kg)', type: 'number', min: 30, max: 300, placeholder: 'e.g. 62' },
    { key: 'weeks', label: 'Weeks postpartum', type: 'number', min: 0, max: 104, placeholder: 'e.g. 10' },
  ],
  compute: (values) => {
    const p = postpartumWeightProgress(values.pre ?? NaN, values.current ?? NaN, values.weeks ?? NaN)
    if (p === null) return null
    return { title: 'Weight lost since birth', value: p.lostKg.toFixed(1), unit: 'kg', tone: p.ratePerWeek <= 0.5 ? 'good' : 'ok', badge: `${p.pctBack}% back to pre-pregnancy weight`, note: `About ${p.ratePerWeek.toFixed(2)} kg per week - gradual and healthy. Bodies reset on their own timeline.`, pct: Math.min(100, p.pctBack * 2) }
  },
  howItWorks: [
    { title: 'Enter pre-pregnancy', text: 'Your baseline weight.' },
    { title: 'Enter now', text: 'Current reading.' },
    { title: 'Enter weeks', text: 'Time since delivery.' },
  ],
  tips: [
    'Losing 0.5-1 kg per week is plenty.',
    'Feeding burns extra calories naturally - fuel it.',
    'Compare trends, not daily numbers.',
  ],
}

extrasWomenSleepGroup['breastfeeding-hydration'] = {
  id: 'breastfeeding-hydration',
  title: 'Breastfeeding Hydration Calculator',
  description: 'Fluid guidance for nursing, adding per-feed needs on top of your base.',
  icon: <Droplets className="h-6 w-6" />,
  breadcrumb: 'Health / Women\u2019s Health',
  instruction: 'Enter your weight, breastfeeds per day and general activity.',
  sub: WH,
  emoji: '👩',
  accent: 'text-pink-600 bg-pink-50 border-pink-200',
  fields: [
    { key: 'weight', label: 'Weight (kg)', type: 'number', min: 30, max: 300, placeholder: 'e.g. 65' },
    { key: 'feeds', label: 'Breastfeeds per day', type: 'number', min: 0, max: 20, placeholder: 'e.g. 6' },
    { key: 'activity', label: 'Active minutes', type: 'number', min: 0, max: 300, placeholder: 'e.g. 30' },
  ],
  compute: (values) => {
    const ml = breastfeedingFluidMl(values.weight ?? NaN, values.feeds ?? NaN, values.activity ?? NaN)
    if (ml === null) return null
    return { title: 'Fluid target', value: (ml / 1000).toFixed(1), unit: 'L', tone: 'good', badge: 'Nursing-adjusted', note: `About ${ml.toFixed(0)} ml total. Milk production adds roughly 250 ml per feed on top of your base needs - thirst is a reliable guide.` }
  },
  howItWorks: [
    { title: 'Enter weight', text: 'Sets your base fluid.' },
    { title: 'Enter feeds', text: 'Each feed adds about 250 ml.' },
    { title: 'Add activity', text: 'Movement tops up the total.' },
  ],
  tips: [
    'Keep a bottle near your nursing spot.',
    'Pale yellow urine = hydration on track.',
    'Excess fluids do not increase supply - consistent intake does.',
  ],
}

extrasWomenSleepGroup['postpartum-recovery-tracker'] = {
  id: 'postpartum-recovery-tracker',
  title: 'Postpartum Recovery Tracker',
  description: 'Track bleeding, pain, mood, energy and sleep into a recovery score.',
  icon: <HeartPulse className="h-6 w-6" />,
  breadcrumb: 'Health / Women\u2019s Health',
  instruction: 'Rate each area 0-10 today (10 = worst).',
  sub: WH,
  emoji: '👩',
  accent: 'text-pink-600 bg-pink-50 border-pink-200',
  fields: [
    { key: 'bleeding', label: 'Bleeding severity (0-10)', type: 'number', min: 0, max: 10, placeholder: 'e.g. 2' },
    { key: 'pain', label: 'Pain / discomfort (0-10)', type: 'number', min: 0, max: 10, placeholder: 'e.g. 3' },
    { key: 'mood', label: 'Low mood (0-10)', type: 'number', min: 0, max: 10, placeholder: 'e.g. 2' },
    { key: 'energy', label: 'Fatigue (0-10)', type: 'number', min: 0, max: 10, placeholder: 'e.g. 5' },
    { key: 'sleep', label: 'Sleep disturbance (0-10)', type: 'number', min: 0, max: 10, placeholder: 'e.g. 4' },
  ],
  compute: (values) => {
    const s = postpartumRecoveryScore(values.bleeding ?? NaN, values.pain ?? NaN, values.mood ?? NaN, values.energy ?? NaN, values.sleep ?? NaN)
    if (s === null) return null
    return { title: 'Recovery score', value: s.toFixed(0), unit: '/100', tone: s >= 75 ? 'good' : s >= 50 ? 'ok' : 'warn', badge: s >= 75 ? 'Recovery going well' : s >= 50 ? 'Recovering steadily' : 'Needs support - reach out', note: 'A dip in mood or heavy bleeding is worth a call to your midwife or doctor - this score is for reflection, not diagnosis.', pct: s }
  },
  howItWorks: [
    { title: 'Rate five areas', text: '0-10 today.' },
    { title: 'Average them', text: 'Convert to a 0-100 score.' },
    { title: 'Watch the trend', text: 'Same tool daily shows movement.' },
  ],
  tips: [
    'New bleeding that soaks a pad hourly = urgent call.',
    'Persistent low mood may be postpartum depression - tell someone.',
    'Sleep when the baby sleeps, even 20 minutes.',
  ],
}

extrasWomenSleepGroup['sleep-calculator'] = {
  id: 'sleep-calculator',
  title: 'Sleep Calculator',
  description: 'Pick a bedtime to see 90-minute-cycle wake-up times synced to it.',
  icon: <Moon className="h-6 w-6" />,
  breadcrumb: 'Health / Sleep & Recovery',
  instruction: 'Choose your bedtime and how many sleep cycles you want.',
  sub: SL,
  emoji: '💤',
  accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  fields: [
    { key: 'bed', label: 'Bedtime', type: 'select', options: BEDTIMES },
    { key: 'cycles', label: 'Sleep cycles (each 90 min)', type: 'select', options: [{ value: '4', label: '4 cycles (6h)' }, { value: '5', label: '5 cycles (7.5h)' }, { value: '6', label: '6 cycles (9h)' }] },
  ],
  compute: (values) => {
    const t = wakeTimesFromBedtime(values.bed ?? NaN, values.cycles ?? NaN)
    if (t === null) return null
    const rec = minToClock(t[0])
    return { title: 'Ideal wake window', value: rec, unit: '', tone: 'good', badge: `${values.cycles} cycles of sleep`, note: `Also possible: ${t.slice(1).map(minToClock).join(', ')}. Waking between cycles leaves you far less groggy than mid-cycle alarms.` }
  },
  howItWorks: [
    { title: 'Pick bedtime', text: 'When you go to sleep.' },
    { title: 'Pick cycles', text: '4-6 full 90-minute cycles.' },
    { title: 'Compute wake times', text: 'Multiples of 90 min later.' },
  ],
  tips: [
    'Waking at the end of a cycle feels great.',
    'Add ~15 min for actually falling asleep.',
    'Keep a consistent anchor time daily.',
  ],
}

extrasWomenSleepGroup['wake-up-time-calculator'] = {
  id: 'wake-up-time-calculator',
  title: 'Wake-Up Time Calculator',
  description: 'Find the bedtimes that let you wake refreshed at your target time.',
  icon: <AlarmClock className="h-6 w-6" />,
  breadcrumb: 'Health / Sleep & Recovery',
  instruction: 'Choose your wake-up time and preferred cycle count.',
  sub: SL,
  emoji: '💤',
  accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  fields: [
    { key: 'wake', label: 'Wake-up time', type: 'select', options: WAKES },
    { key: 'cycles', label: 'Sleep cycles', type: 'select', options: [{ value: '4', label: '4 cycles (6h)' }, { value: '5', label: '5 cycles (7.5h)' }, { value: '6', label: '6 cycles (9h)' }] },
  ],
  compute: (values) => {
    const b = bedtimesFromWake(values.wake ?? NaN, values.cycles ?? NaN)
    if (b === null) return null
    const rec = minToClock(b[0])
    return { title: 'Go to bed around', value: rec, unit: '', tone: 'good', badge: `Waking at ${minToClock(values.wake ?? 420)}`, note: `Alternatives: ${b.slice(1).map(minToClock).join(', ')}. Working back in 90-min cycles beats a fixed hours target.` }
  },
  howItWorks: [
    { title: 'Pick wake time', text: 'When you must get up.' },
    { title: 'Pick cycles', text: 'How many full cycles.' },
    { title: 'Work backwards', text: 'Subtract 90 min per cycle.' },
  ],
  tips: [
    'Cycles run 90 minutes on average.',
    'Same wake time 7 days a week stabilizes rhythm.',
    'Let light in as soon as you wake.',
  ],
}

extrasWomenSleepGroup['sleep-duration-calculator'] = {
  id: 'sleep-duration-calculator',
  title: 'Sleep Duration Calculator',
  description: 'See exactly how long your time in bed gives you from bedtime to wake.',
  icon: <Clock className="h-6 w-6" />,
  breadcrumb: 'Health / Sleep & Recovery',
  instruction: 'Pick a bedtime and wake-up time.',
  sub: SL,
  emoji: '💤',
  accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  fields: [
    { key: 'bed', label: 'Bedtime', type: 'select', options: BEDTIMES },
    { key: 'wake', label: 'Wake-up time', type: 'select', options: WAKES },
  ],
  compute: (values) => {
    const min = sleepDurationMinutes(values.bed ?? NaN, values.wake ?? NaN)
    if (min === null) return null
    const h = Math.floor(min / 60)
    return { title: 'Time in bed', value: min < 60 ? `${min} min` : `${h}h ${min % 60}m`, unit: '', tone: min >= 450 ? 'good' : min >= 360 ? 'ok' : 'warn', badge: 'Time between lights off and alarm', note: 'Time in bed is usually more than actual sleep. If this is your habit, compare it against a sleep-efficiency check.' }
  },
  howItWorks: [
    { title: 'Pick bedtime', text: 'Lights out.' },
    { title: 'Pick wake time', text: 'Alarm.' },
    { title: 'Subtract hours', text: 'Guard the crossing midnight.' },
  ],
  tips: [
    'Adults typically need 7-9 hours in bed to sleep 7+.',
    'Consistent length beats longer-on-weekends.',
    'Track two weeks before judging your target.',
  ],
}

extrasWomenSleepGroup['sleep-cycle-calculator'] = {
  id: 'sleep-cycle-calculator',
  title: 'Sleep Cycle Calculator',
  description: 'Count how many full 90-minute cycles your sleep window contains.',
  icon: <Repeat className="h-6 w-6" />,
  breadcrumb: 'Health / Sleep & Recovery',
  instruction: 'Enter bedtime and wake time to count the cycles.',
  sub: SL,
  emoji: '💤',
  accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  fields: [
    { key: 'bed', label: 'Bedtime', type: 'select', options: BEDTIMES },
    { key: 'wake', label: 'Wake-up time', type: 'select', options: WAKES },
  ],
  compute: (values) => {
    const r = sleepCyclesBetween(values.bed ?? NaN, values.wake ?? NaN)
    if (r === null) return null
    return { title: 'Full sleep cycles', value: r.cycles.toFixed(0), unit: 'cycles', tone: r.cycles >= 5 ? 'good' : r.cycles >= 4 ? 'ok' : 'warn', badge: `${r.remainderMin} min left over`, note: `${Math.floor(r.totalMin / 60)}h ${r.totalMin % 60}m total. An incomplete last cycle is often the cause of groggy mornings.` }
  },
  howItWorks: [
    { title: 'Enter times', text: 'Bed and wake.' },
    { title: 'Divide by 90', text: 'Total minutes ÷ 90.' },
    { title: 'Count cycles', text: 'Full 4-6 cycles ideal.' },
  ],
  tips: [
    'Aim to wake at a cycle boundary.',
    'Shorten or extend by half a cycle, not 20 minutes.',
    'The last cycle is when REM is longest.',
  ],
}

extrasWomenSleepGroup['nap-calculator'] = {
  id: 'nap-calculator',
  title: 'Nap Length Advisor',
  description: 'Pick a nap length to match your goal - quick refresh or full cycle.',
  icon: <Coffee className="h-6 w-6" />,
  breadcrumb: 'Health / Sleep & Recovery',
  instruction: 'Enter the minutes you plan to nap.',
  sub: SL,
  emoji: '💤',
  accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  fields: [
    { key: 'minutes', label: 'Planned nap minutes', type: 'select', options: [{ value: '15', label: '15 min - micro' }, { value: '20', label: '20 min - classic power nap' }, { value: '30', label: '30 min - short sleep' }, { value: '60', label: '60 min - deep sleep risk' }, { value: '90', label: '90 min - full cycle' }] },
  ],
  compute: (values) => {
    const advice = napAdvice(values.minutes ?? NaN)
    if (advice === null) return null
    const mins = values.minutes ?? 20
    const label = mins <= 15 ? 'Micro' : mins === 20 ? 'Power nap' : mins <= 30 ? 'Short nap' : mins === 60 ? 'Caution' : 'Full cycle'
    return { title: 'Recommended nap', value: label, unit: '', tone: mins === 60 ? 'warn' : 'good', badge: mins <= 20 ? 'Quick alertness' : mins <= 30 ? 'Light recovery' : mins === 60 ? 'Deep-sleep zone' : 'Full sleep cycle', note: advice + '. Short naps beat caffeine for a clean afternoon boost.' }
  },
  howItWorks: [
    { title: 'Pick length', text: 'From 15 to 90 minutes.' },
    { title: 'Match your goal', text: 'Alertness vs full recovery.' },
    { title: 'Read the advice', text: 'Avoid waking in deep sleep.' },
  ],
  tips: [
    'Nap before 3 PM to protect nighttime sleep.',
    'Coffee right before a 20-min nap works well.',
    'A 90-min nap covers a whole light-to-REM cycle.',
  ],
}

extrasWomenSleepGroup['sleep-consistency-check'] = {
  id: 'sleep-consistency-check',
  title: 'Sleep Consistency Check',
  description: 'Score how consistent your weekday-weekend sleep schedule is.',
  icon: <Timer className="h-6 w-6" />,
  breadcrumb: 'Health / Sleep & Recovery',
  instruction: 'Enter how many minutes your bedtime and wake time drift between weekdays and weekends.',
  sub: SL,
  emoji: '💤',
  accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  fields: [
    { key: 'bed', label: 'Bedtime drift (minutes)', type: 'number', min: 0, max: 300, placeholder: 'e.g. 60' },
    { key: 'wake', label: 'Wake-time drift (minutes)', type: 'number', min: 0, max: 300, placeholder: 'e.g. 90' },
  ],
  compute: (values) => {
    const s = sleepConsistency(values.bed ?? NaN, values.wake ?? NaN)
    if (s === null) return null
    return { title: 'Consistency score', value: s.toFixed(0), unit: '/100', tone: s >= 70 ? 'good' : s >= 50 ? 'ok' : 'warn', badge: s >= 70 ? 'Rhythm is steady' : 'Social jet lag creeping in', note: 'Large weekday-weekend gaps are the classic \u201csocial jet lag\u201d - even great sleep totals can leave you tired.', pct: s }
  },
  howItWorks: [
    { title: 'Enter bedtime drift', text: 'Weekend minus weekday.' },
    { title: 'Enter wake drift', text: 'Same for wake times.' },
    { title: 'Penalize drift', text: 'Every minute drops the score.' },
  ],
  tips: [
    'Keep weekday and weekend wake times within 60 min.',
    'Bright morning light anchors your clock.',
    'One late night is fine; a weekly pattern is not.',
  ],
}

extrasWomenSleepGroup['sleep-efficiency'] = {
  id: 'sleep-efficiency',
  title: 'Sleep Efficiency Check',
  description: 'Compare time actually asleep against total time in bed.',
  icon: <Activity className="h-6 w-6" />,
  breadcrumb: 'Health / Sleep & Recovery',
  instruction: 'Enter approximate asleep time and total time in bed in minutes.',
  sub: SL,
  emoji: '💤',
  accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  fields: [
    { key: 'asleep', label: 'Time asleep (min)', type: 'number', min: 60, max: 720, placeholder: 'e.g. 420' },
    { key: 'inbed', label: 'Time in bed (min)', type: 'number', min: 60, max: 900, placeholder: 'e.g. 480' },
  ],
  compute: (values) => {
    const e = sleepEfficiency(values.asleep ?? NaN, values.inbed ?? NaN)
    if (e === null) return null
    return { title: 'Sleep efficiency', value: e.toFixed(0), unit: '%', tone: e >= 85 ? 'good' : e >= 75 ? 'ok' : 'warn', badge: e >= 85 ? 'Textbook efficiency' : e >= 75 ? 'Reasonably efficient' : 'Restless nights dominate', note: 'Above 85% is the usual target in sleep medicine. Lying awake often lowers efficiency below sleep quality alone.' }
  },
  howItWorks: [
    { title: 'Estimate asleep', text: 'From trackers or log.' },
    { title: 'Enter in-bed total', text: 'Lights off to alarm.' },
    { title: 'Divide', text: 'Asleep \u00f7 in bed \u00d7 100.' },
  ],
  tips: [
    'If efficiency is low, shorten time in bed gradually.',
    'Toss-and-turn time counts against you.',
    'Pair with a fixed wake time.',
  ],
}

extrasWomenSleepGroup['sleep-schedule-planner'] = {
  id: 'sleep-schedule-planner',
  title: 'Sleep Schedule Planner',
  description: 'Plan a gradual weekday wake-time shift with the daily adjustment suggested.',
  icon: <Calendar className="h-6 w-6" />,
  breadcrumb: 'Health / Sleep & Recovery',
  instruction: 'Pick your current wake time and your target wake time.',
  sub: SL,
  emoji: '💤',
  accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  fields: [
    { key: 'current', label: 'Current wake time', type: 'select', options: WAKES },
    { key: 'target', label: 'Target wake time', type: 'select', options: WAKES },
  ],
  compute: (values) => {
    const shift = shiftPlan(values.current ?? NaN, values.target ?? NaN)
    if (shift === null) return null
    if (shift === 0) return { title: 'No shift needed', value: 'Maintain', unit: '', tone: 'good', badge: 'Times already match', note: 'Keep the rhythm - steady beats shifting.' }
    const dir = shift < 0 ? 'earlier' : 'later'
    return { title: 'Daily adjustment', value: `${Math.abs(shift)} min ${dir}`, unit: '', tone: 'ok', badge: 'Gradual shift plan', note: `Wake ${Math.abs(shift)} min ${dir} each day for about a week, and let bedtime follow. Bright light in the morning cements the change.` }
  },
  howItWorks: [
    { title: 'Pick current wake', text: 'Where you are now.' },
    { title: 'Pick target wake', text: 'Where you want to be.' },
    { title: 'Split the move', text: 'Across roughly seven days.' },
  ],
  tips: [
    'Shift 15-30 minutes a day, not 2 hours at once.',
    'Morning light beats alarm clocks when adjusting.',
    'Keep weekends on the new schedule too.',
  ],
}