import {
  type HouseholdSpec,
  T,
  n,
  sel,
  ck,
  res,
  doc,
  asNum,
  asSel,
  asBoolList,
  money,
  moneyC,
  pct,
  num,
  numD,
} from './householdSpec'

const SUB = 'Electricity'
const SUB_ID = 'electricity'

export const electricitySpecs: HouseholdSpec[] = [
  {
    id: 'appliance-wattage-finder',
    name: 'Appliance Wattage Finder',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Quickly look up typical operational wattage and hourly running costs for 30 common home appliances.',
    tip: 'Heating and cooling elements (space heaters, water heaters, hair dryers) draw 10x more power than electronics.',
    usage: [
      'Select any home appliance from the directory.',
      'Enter your local electricity rate.',
      'Check average wattage and cost per hour of operation.',
    ],
    method: [
      'Wattage directory lookup * (Hours / 1000) * kWh rate.',
    ],
    fields: [
      sel('appliance', 'Select Home Appliance', [
        'Central AC (3,500 W)',
        'Window AC (1,200 W)',
        'Electric Space Heater (1,500 W)',
        'Clothes Dryer (Electric) (3,000 W)',
        'Washing Machine (500 W)',
        'Electric Oven (2,500 W)',
        'Microwave Oven (1,000 W)',
        'Air Fryer (1,500 W)',
        'Refrigerator (150 W running avg)',
        'Dishwasher (1,200 W)',
        'Hair Dryer (1,800 W)',
        'Gaming PC with Monitor (450 W)',
        'LED TV 55-inch (80 W)',
        'Ceiling Fan (60 W)',
      ], 'Central AC (3,500 W)'),
      n('kwhRate', 'Electricity Rate ($/kWh)', { def: 0.16, min: 0.05, max: 0.8, step: 0.01 }),
    ],
    compute: (v) => {
      const app = asSel(v.appliance)
      const rate = asNum(v.kwhRate)

      const m = app.match(/([\d,]+)\s*W/)
      const watts = m ? parseInt(m[1].replace(/,/g, ''), 10) : 1000

      const kwhPerHour = watts / 1000
      const costPerHour = kwhPerHour * rate

      return [
        res('Rated Wattage', `${num(watts)} Watts`, watts > 1500 ? T.warn : T.good),
        res('Cost per Hour Running', moneyC(costPerHour), costPerHour > 0.3 ? T.warn : T.good),
        res('Cost per 8 Hours', moneyC(costPerHour * 8), T.neutral),
      ]
    },
  },
  {
    id: 'home-electricity-load-calculator',
    name: 'Home Electricity Load Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate the total connected electrical load of your home in kilowatts (kW) and Amperes.',
    tip: 'Homes with under 100-Amp electrical panels may trip the main breaker if an EV charger and electric oven run together.',
    usage: [
      'Enter total estimated connected wattage across all lighting, kitchen, and HVAC.',
      'Select your electrical panel voltage (120V or 240V).',
      'Check total load in Amperes.',
    ],
    method: [
      'Amperes = Total Watts / Voltage.',
    ],
    fields: [
      n('totalWatts', 'Total Connected Wattage (Watts)', { def: 12500, min: 500, max: 100000, step: 500 }),
      sel('voltage', 'Main Panel Voltage', ['240V (Standard Split-Phase / UK)', '120V (Single-Phase Line)'], '240V (Standard Split-Phase / UK)'),
    ],
    compute: (v) => {
      const watts = asNum(v.totalWatts)
      const voltStr = asSel(v.voltage)
      const volts = voltStr.startsWith('240') ? 240 : 120

      const amps = watts / volts
      const kw = watts / 1000

      let status = 'Standard 100A Panel Adequate'
      let tone = T.good
      if (amps > 160) { status = 'Requires 200A Main Service Panel'; tone = T.bad }
      else if (amps > 80) { status = 'Approaching 100A Limit — 150A/200A Recommended'; tone = T.warn }

      return [
        res('Total Load (kW)', `${numD(kw, 1)} kW`, T.neutral),
        res('Current Draw (Amps)', `${numD(amps, 1)} Amperes`, tone, `At ${volts} Volts`),
        res('Panel Service Sizing', status, tone),
      ]
    },
  },
  {
    id: 'total-appliance-load-calculator',
    name: 'Total Appliance Load Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Sum up simultaneously operating appliances to test if they will overload a specific 15A or 20A room circuit.',
    tip: 'A standard 15-Amp household circuit can safely sustain 1,440 Watts continuously (the 80% safety rule).',
    usage: [
      'Check appliances plugged into the same room breaker.',
      'Check circuit capacity status and trip risk.',
    ],
    method: [
      'Sums watts and compares against the National Electrical Code 80% continuous limit (1440W for 15A, 1920W for 20A at 120V).',
    ],
    fields: [
      sel('circuitRating', 'Breaker Rating', ['15 Amp Circuit (Max 1,440W Safe)', '20 Amp Circuit (Max 1,920W Safe)'], '15 Amp Circuit (Max 1,440W Safe)'),
      ck('appliances', 'Appliances running on this branch circuit:', [
        'Electric Space Heater (1,500 W)',
        'Hair Dryer (1,800 W)',
        'Vacuum Cleaner (1,000 W)',
        'Coffee Maker / Kettle (1,200 W)',
        'Computer / Monitor (300 W)',
        'Room Lighting (60 W)',
      ]),
    ],
    compute: (v) => {
      const breaker = asSel(v.circuitRating)
      const list = asBoolList(v.appliances)

      const wattValues = [1500, 1800, 1000, 1200, 300, 60]
      let totalW = 0
      list.forEach((checked, i) => {
        if (checked) totalW += wattValues[i] ?? 0
      })

      const limit = breaker.startsWith('15') ? 1440 : 1920
      const isOver = totalW > limit

      return [
        res('Combined Load', `${num(totalW)} Watts`, isOver ? T.bad : T.good),
        res('Circuit Breaker Safe Limit', `${limit} Watts`, T.neutral, breaker),
        res('Breaker Trip Risk', isOver ? 'OVERLOAD — Breaker will likely trip!' : 'Safe to run concurrently', isOver ? T.bad : T.good),
      ]
    },
  },
  {
    id: 'peak-load-calculator',
    name: 'Peak Load Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate maximum simultaneous peak power draw during hot summer late afternoons.',
    tip: 'Running the dishwasher and clothes dryer at 9:00 PM instead of 5:00 PM prevents regional peak grid brownouts.',
    usage: [
      'Check heavy appliances operating simultaneously.',
      'Calculate instantaneous grid demand.',
    ],
    method: [
      'Sums peak operational power draws.',
    ],
    fields: [
      ck('peakItems', 'Heavy Loads Running Concurrently:', [
        'Central Air Conditioning (3,500 W)',
        'Electric Clothes Dryer (3,200 W)',
        'Electric Oven / Cooktop (3,000 W)',
        'Water Heater Heating Element (4,000 W)',
        'Dishwasher Wash Cycle (1,200 W)',
      ]),
    ],
    compute: (v) => {
      const list = asBoolList(v.peakItems)
      const values = [3500, 3200, 3000, 4000, 1200]

      let sum = 0
      list.forEach((on, i) => { if (on) sum += values[i] ?? 0 })

      const kw = sum / 1000
      const tone = kw > 8 ? T.bad : kw > 4 ? T.warn : T.good

      return [
        res('Instantaneous Peak Draw', `${numD(kw, 1)} kW (${num(sum)} Watts)`, tone),
        res('Grid Impact', kw > 8 ? 'Very Heavy Load — Stagger appliances' : 'Moderate demand', tone),
        res('Off-Peak Shifting Tip', 'Avoid running dryer and oven simultaneously with AC', T.neutral),
      ]
    },
  },
  {
    id: 'daily-energy-consumption-calculator',
    name: 'Daily Energy Consumption Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate total daily kilowatt-hours (kWh) consumed by an appliance from wattage and run hours.',
    tip: '1 kWh equals running a 100-Watt incandescent bulb for 10 hours or a 10-Watt LED bulb for 100 hours.',
    usage: [
      'Enter appliance wattage and daily operating hours.',
      'Input local power rate to see daily and monthly cost.',
    ],
    method: [
      'kWh = (Watts * Hours) / 1000.',
    ],
    fields: [
      n('watts', 'Appliance Wattage (W)', { def: 1200, min: 1, max: 20000 }),
      n('hoursPerDay', 'Hours Used per Day', { def: 4, min: 0.1, max: 24, step: 0.5 }),
      n('kwhRate', 'Electricity Rate ($/kWh)', { def: 0.16, min: 0.05, max: 0.8, step: 0.01 }),
    ],
    compute: (v) => {
      const w = asNum(v.watts)
      const h = asNum(v.hoursPerDay)
      const rate = asNum(v.kwhRate)

      const dailyKwh = (w * h) / 1000
      const dailyCost = dailyKwh * rate
      const monthlyCost = dailyCost * 30.5

      return [
        res('Daily Consumption', `${numD(dailyKwh, 2)} kWh/day`, dailyKwh > 5 ? T.warn : T.good),
        res('Daily Running Cost', moneyC(dailyCost), T.neutral),
        res('Monthly Running Cost', money(monthlyCost) + '/mo', monthlyCost > 30 ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'monthly-kwh-forecast',
    name: 'Monthly kWh Forecast',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Predict your monthly electric bill from a mid-month meter reading.',
    tip: 'Reading your electric meter on day 15 lets you adjust AC settings before an expensive surprise bill arrives.',
    usage: [
      'Enter electric meter reading at start of month and current reading today.',
      'Enter days elapsed in month.',
    ],
    method: [
      'Extrapolates daily burn: Projected = (Consumed / Days Elapsed) * 30.5.',
    ],
    fields: [
      n('startReading', 'Start of Month Meter (kWh)', { def: 14200, min: 0, max: 500000 }),
      n('currentReading', 'Current Meter Reading Today (kWh)', { def: 14580, min: 0, max: 500000 }),
      n('daysElapsed', 'Days Elapsed so Far', { def: 15, min: 1, max: 31 }),
      n('rate', 'Electricity Rate ($/kWh)', { def: 0.16, min: 0.05, max: 0.8, step: 0.01 }),
    ],
    compute: (v) => {
      const start = asNum(v.startReading)
      const current = asNum(v.currentReading)
      const days = asNum(v.daysElapsed)
      const rate = asNum(v.rate)

      const usedSoFar = Math.max(0, current - start)
      const dailyAvg = usedSoFar / days
      const projectedKwh = dailyAvg * 30.5
      const projectedCost = projectedKwh * rate

      return [
        res('Projected Monthly Usage', `${Math.round(projectedKwh)} kWh`, projectedKwh > 1000 ? T.warn : T.good, `Current pace: ${numD(dailyAvg, 1)} kWh/day`),
        res('Forecasted Bill', money(projectedCost), projectedCost > 200 ? T.warn : T.good),
        res('Used So Far', `${Math.round(usedSoFar)} kWh (${money(usedSoFar * rate)})`, T.neutral, `Through ${days} days`),
      ]
    },
  },
  {
    id: 'electricity-tariff-calculator',
    name: 'Electricity Tariff Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate your power bill under a tiered / block pricing tariff where higher usage costs more per kWh.',
    tip: 'Tiered tariffs penalize heavy consumption—staying under Tier 1 threshold cuts your average cost per unit drastically.',
    usage: [
      'Enter total monthly kWh used.',
      'Enter Tier 1 allowance limit, Tier 1 rate, and Tier 2 surcharge rate.',
    ],
    method: [
      'Tier 1 = min(Usage, Tier1 Limit) * Rate1. Tier 2 = max(0, Usage - Tier1 Limit) * Rate2.',
    ],
    fields: [
      n('totalKwh', 'Total Monthly Usage (kWh)', { def: 750, min: 10, max: 5000, step: 25 }),
      n('tier1Limit', 'Tier 1 Baseline Limit (kWh)', { def: 500, min: 50, max: 2000, step: 50 }),
      n('rate1', 'Tier 1 Rate ($/kWh)', { def: 0.13, min: 0.02, max: 0.6, step: 0.01 }),
      n('rate2', 'Tier 2 Rate ($/kWh)', { def: 0.22, min: 0.02, max: 0.9, step: 0.01 }),
    ],
    compute: (v) => {
      const kwh = asNum(v.totalKwh)
      const limit = asNum(v.tier1Limit)
      const r1 = asNum(v.rate1)
      const r2 = asNum(v.rate2)

      const tier1Kwh = Math.min(kwh, limit)
      const tier2Kwh = Math.max(0, kwh - limit)

      const cost1 = tier1Kwh * r1
      const cost2 = tier2Kwh * r2
      const total = cost1 + cost2
      const blendedRate = total / kwh

      return [
        res('Total Electric Bill', money(total), total > 150 ? T.warn : T.good),
        res('Tier 1 Cost', money(cost1), T.good, `${tier1Kwh} kWh @ ${moneyC(r1)}`),
        res('Tier 2 Surcharge Cost', money(cost2), tier2Kwh > 0 ? T.warn : T.good, `${tier2Kwh} kWh @ ${moneyC(r2)}`),
        res('Effective Blended Rate', `${moneyC(blendedRate)} / kWh`, T.neutral),
      ]
    },
  },
  {
    id: 'peak-vs-off-peak-cost-calculator',
    name: 'Peak vs Off-Peak Cost Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate how much money you save by shifting high-draw appliances to cheap night off-peak hours.',
    tip: 'Under Time-Of-Use (TOU) tariffs, daytime power can cost 3x more than running appliances overnight.',
    usage: [
      'Enter peak and off-peak electric rates.',
      'Enter weekly dishwasher and laundry cycles shifted to off-peak.',
    ],
    method: [
      'Savings = Shifted kWh * (Peak Rate - OffPeak Rate).',
    ],
    fields: [
      n('peakRate', 'Peak Daytime Rate ($/kWh)', { def: 0.32, min: 0.1, max: 1.0, step: 0.01 }),
      n('offPeakRate', 'Off-Peak Night Rate ($/kWh)', { def: 0.11, min: 0.02, max: 0.5, step: 0.01 }),
      n('loadsShifted', 'Weekly Major Cycles Shifted (Dryer/Dishwasher)', { def: 6, min: 1, max: 30 }),
    ],
    compute: (v) => {
      const peak = asNum(v.peakRate)
      const offPeak = asNum(v.offPeakRate)
      const loads = asNum(v.loadsShifted)

      const kwhPerCycle = 3.2
      const kwhPerWeek = loads * kwhPerCycle
      const diffPerKwh = peak - offPeak

      const weeklySavings = kwhPerWeek * diffPerKwh
      const annualSavings = weeklySavings * 52

      return [
        res('Annual Savings', money(annualSavings) + '/year', T.good, 'Simply by pressing the delay-start button'),
        res('Monthly Savings', money(weeklySavings * 4.33) + '/month', T.good),
        res('Rate Discount', pct(((peak - offPeak) / peak) * 100, 0), T.good, `${moneyC(offPeak)} vs ${moneyC(peak)}`),
      ]
    },
  },
  {
    id: 'appliance-energy-comparison',
    name: 'Appliance Energy Comparison',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Compare the operating cost between two different models or energy star ratings.',
    tip: 'Paying $100 more for an efficient refrigerator pays for itself within 2 years in electric savings.',
    usage: [
      'Enter annual kWh consumption from the yellow EnergyGuide sticker for Model A and Model B.',
      'Check annual and 10-year operating cost difference.',
    ],
    method: [
      'Delta Cost = (kWh_A - kWh_B) * Electricity Rate.',
    ],
    fields: [
      n('kwhA', 'Model A Annual Usage (kWh/yr)', { def: 620, min: 50, max: 5000, step: 10 }),
      n('kwhB', 'Model B Annual Usage (kWh/yr)', { def: 380, min: 50, max: 5000, step: 10 }),
      n('rate', 'Electricity Rate ($/kWh)', { def: 0.16, min: 0.05, max: 0.8, step: 0.01 }),
    ],
    compute: (v) => {
      const a = asNum(v.kwhA)
      const b = asNum(v.kwhB)
      const rate = asNum(v.rate)

      const diffKwh = a - b
      const annualDiff = diffKwh * rate
      const tenYearDiff = annualDiff * 10

      return [
        res('Annual Cost Difference', money(Math.abs(annualDiff)) + '/year', T.good, `${b < a ? 'Model B' : 'Model A'} is cheaper`),
        res('10-Year Lifecycle Savings', money(Math.abs(tenYearDiff)), T.good, 'Total lifetime electricity saved'),
        res('Annual Energy Reduction', `${Math.abs(diffKwh)} kWh/yr`, T.neutral),
      ]
    },
  },
  {
    id: 'energy-usage-comparison',
    name: 'Energy Usage Comparison',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Compare your electricity consumption against the previous month or the same month last year.',
    tip: 'Heating and cooling weather differences account for 70% of month-over-month electric bill fluctuations.',
    usage: [
      'Enter current month kWh and comparison period kWh.',
      'Review percentage change and weather-adjusted analysis.',
    ],
    method: [
      'Delta = ((Current - Previous) / Previous) * 100.',
    ],
    fields: [
      n('currKwh', 'Current Month Usage (kWh)', { def: 820, min: 10, max: 10000, step: 20 }),
      n('prevKwh', 'Previous Period Usage (kWh)', { def: 740, min: 10, max: 10000, step: 20 }),
    ],
    compute: (v) => {
      const curr = asNum(v.currKwh)
      const prev = asNum(v.prevKwh)

      const diff = curr - prev
      const pctChange = (diff / prev) * 100
      const tone = diff <= 0 ? T.good : diff > 100 ? T.bad : T.warn

      return [
        res('Usage Change', `${diff > 0 ? '+' : ''}${pct(pctChange, 1)}`, tone, `${diff > 0 ? '+' : ''}${diff} kWh shift`),
        res('Trend Verdict', diff <= 0 ? 'Favorable: Reduced consumption' : 'Consumption increased — Check AC / heater usage', tone),
      ]
    },
  },
  {
    id: 'led-vs-incandescent-savings',
    name: 'LED vs Incandescent Savings',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate the return on investment of upgrading old 60-Watt incandescent bulbs to 9-Watt LEDs.',
    tip: 'LED bulbs use 85% less energy and last 25,000 hours (20+ years of normal 3-hour daily household use).',
    usage: [
      'Enter how many bulbs you are replacing.',
      'Check immediate monthly and annual dollar savings.',
    ],
    method: [
      'Savings = Bulbs * (60W - 9W) * Hours/Day * 365 / 1000 * kWh Rate.',
    ],
    fields: [
      n('bulbCount', 'Number of Bulbs to Replace', { def: 15, min: 1, max: 100 }),
      n('hoursPerDay', 'Average Hours On per Day', { def: 4, min: 1, max: 24 }),
      n('kwhRate', 'Electricity Rate ($/kWh)', { def: 0.16, min: 0.05, max: 0.7, step: 0.01 }),
    ],
    compute: (v) => {
      const bulbs = asNum(v.bulbCount)
      const hours = asNum(v.hoursPerDay)
      const rate = asNum(v.kwhRate)

      const wattSavedPerBulb = 60 - 9 // 51W saved
      const totalKwhSavedYear = (bulbs * wattSavedPerBulb * hours * 365) / 1000
      const annualDollarSavings = totalKwhSavedYear * rate

      return [
        res('Annual Money Saved', money(annualDollarSavings) + '/year', T.good, `For replacing ${bulbs} bulbs`),
        res('Monthly Electric Reduction', money(annualDollarSavings / 12) + '/mo', T.good),
        res('Annual Energy Saved', `${Math.round(totalKwhSavedYear)} kWh/year`, T.neutral, '85% power reduction per socket'),
      ]
    },
  },
  {
    id: 'led-vs-cfl-savings',
    name: 'LED vs CFL Savings',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Compare curly CFL fluorescent bulbs (14W) against modern instant-on LEDs (9W).',
    tip: 'Unlike CFLs, LEDs contain zero toxic mercury and do not take 2 minutes to warm up to full brightness.',
    usage: [
      'Enter bulb count and hours used.',
      'Review energy savings and elimination of mercury hazard.',
    ],
    method: [
      'Saves ~5 Watts per socket with 3x longer operating lifespan.',
    ],
    fields: [
      n('bulbCount', 'Number of CFL Bulbs', { def: 12, min: 1, max: 80 }),
      n('kwhRate', 'Electricity Rate ($/kWh)', { def: 0.16, min: 0.05, max: 0.7, step: 0.01 }),
    ],
    compute: (v) => {
      const bulbs = asNum(v.bulbCount)
      const rate = asNum(v.kwhRate)

      const annualKwhSaved = (bulbs * 5 * 3.5 * 365) / 1000
      const annualSavings = annualKwhSaved * rate

      return [
        res('Annual Upgrade Savings', money(annualSavings) + '/yr', T.good),
        res('Lifespan Advantage', 'LEDs last 25,000 hrs vs 8,000 hrs CFL', T.good),
        res('Environmental Health', 'Zero hazardous mercury disposal', T.good),
      ]
    },
  },
  {
    id: 'ac-temperature-cost-estimator',
    name: 'AC Temperature Cost Estimator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate how much money you save or waste by changing your thermostat by 1, 2, or 3 degrees.',
    tip: 'Each 1°F increase on your thermostat in summer cuts your cooling bill by approximately 3% to 5%.',
    usage: [
      'Enter current summer cooling electric bill and degrees shifted.',
      'See instant monthly and seasonal savings.',
    ],
    method: [
      'Standard thermal rule of thumb: ~4% energy reduction per 1°F (7% per 1°C) thermostat increase.',
    ],
    fields: [
      n('monthlyAcBill', 'Monthly AC / Cooling Bill ($)', { def: 180, min: 20, max: 1500, step: 10 }),
      n('degreesShifted', 'Degrees Raised (Warmer in Summer) (°F)', { def: 3, min: 1, max: 8 }),
    ],
    compute: (v) => {
      const bill = asNum(v.monthlyAcBill)
      const deg = asNum(v.degreesShifted)

      const savingsPct = deg * 4.2
      const monthlySavings = bill * (savingsPct / 100)
      const summerSavings = monthlySavings * 4 // 4 summer months

      return [
        res('Monthly AC Savings', money(monthlySavings) + '/month', T.good, `${pct(savingsPct, 0)} bill reduction`),
        res('4-Month Summer Savings', money(summerSavings), T.good, `By raising thermostat ${deg}°F`),
        res('New Projected Monthly AC', money(bill - monthlySavings), T.neutral),
      ]
    },
  },
  {
    id: 'ac-energy-efficiency-calculator',
    name: 'AC Energy Efficiency Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate cooling cost differences between older 10 SEER air conditioners and modern 16+ SEER units.',
    tip: 'Upgrading from a 10 SEER AC to a 16 SEER high-efficiency inverter cuts cooling power draw by 38%.',
    usage: [
      'Enter AC tonnage size and current SEER rating vs target SEER rating.',
      'Review annual electric bill drop.',
    ],
    method: [
      'Watts = (Tons * 12,000 BTU) / SEER. Compares seasonal cooling energy across 1,000 standard operating hours.',
    ],
    fields: [
      n('acTons', 'AC Size (Tons)', { def: 3.0, min: 1.0, max: 7.0, step: 0.5 }),
      n('oldSeer', 'Old AC SEER Rating', { def: 10, min: 8, max: 14 }),
      n('newSeer', 'New AC SEER Rating', { def: 16, min: 14, max: 24 }),
      n('kwhRate', 'Electricity Rate ($/kWh)', { def: 0.16, min: 0.05, max: 0.7, step: 0.01 }),
    ],
    compute: (v) => {
      const tons = asNum(v.acTons)
      const oldS = asNum(v.oldSeer)
      const newS = asNum(v.newSeer)
      const rate = asNum(v.rate)

      const btu = tons * 12000
      const oldWatts = btu / oldS
      const newWatts = btu / newS

      const hours = 1100
      const oldKwh = (oldWatts * hours) / 1000
      const newKwh = (newWatts * hours) / 1000

      const annualOldCost = oldKwh * rate
      const annualNewCost = newKwh * rate
      const annualSavings = annualOldCost - annualNewCost

      return [
        res('Annual AC Savings', money(annualSavings) + '/year', T.good, `${pct(((oldWatts - newWatts) / oldWatts) * 100, 0)} power reduction`),
        res('10-Year Cooling Savings', money(annualSavings * 10), T.good, 'Subsidizes the replacement equipment cost'),
        res('Current Annual Cooling Cost', money(annualOldCost), T.neutral, `New cost: ${money(annualNewCost)}`),
      ]
    },
  },
  {
    id: 'refrigerator-energy-comparison',
    name: 'Refrigerator Energy Comparison',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Check if an old basement refrigerator is quietly wasting hundreds of dollars in electricity.',
    tip: 'Refrigerators manufactured before 2005 consume up to 850 kWh/year compared to 360 kWh/year for modern Energy Star models.',
    usage: [
      'Select age category of your refrigerator.',
      'Check annual operating cost.',
    ],
    method: [
      'Historical average consumption benchmarks: Pre-2000 (~1000 kWh), 2000-2010 (~650 kWh), Modern Energy Star (~350 kWh).',
    ],
    fields: [
      sel('fridgeAge', 'Refrigerator Age', ['Manufactured before 2000 (1000 kWh/yr)', 'Manufactured 2001-2010 (650 kWh/yr)', 'Modern Energy Star 2018+ (350 kWh/yr)'], 'Manufactured before 2000 (1000 kWh/yr)'),
      n('kwhRate', 'Electricity Rate ($/kWh)', { def: 0.16, min: 0.05, max: 0.7, step: 0.01 }),
    ],
    compute: (v) => {
      const age = asSel(v.fridgeAge)
      const rate = asNum(v.kwhRate)

      const kwh = age.includes('before 2000') ? 1000 : age.includes('2001-2010') ? 650 : 350
      const annualCost = kwh * rate
      const modernCost = 350 * rate
      const excessWaste = Math.max(0, annualCost - modernCost)

      return [
        res('Annual Running Cost', money(annualCost) + '/year', annualCost > 120 ? T.bad : T.good),
        res('Excess Electricity Waste', money(excessWaste) + '/year', excessWaste > 0 ? T.warn : T.good, 'Compared to modern replacement'),
        res('Retirement Verdict', excessWaste > 80 ? 'Retire / Recycle immediately — Wasting cash' : 'Energy profile acceptable', excessWaste > 80 ? T.bad : T.good),
      ]
    },
  },
  {
    id: 'washing-machine-energy-comparison',
    name: 'Washing Machine Energy Comparison',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Compare electric running costs between top-loader agitators and front-load inverter machines.',
    tip: 'Inverter direct-drive motors eliminate friction belts and draw 30% less wattage during the spin phase.',
    usage: [
      'Select motor technology and weekly load volume.',
      'Review annual electricity spend.',
    ],
    method: [
      'Top-load agitator: ~0.85 kWh/cycle. Modern Front-load Inverter: ~0.40 kWh/cycle.',
    ],
    fields: [
      sel('tech', 'Washer Technology', ['Front-Load Inverter Motor (Efficient)', 'Traditional Top-Load Belt Agitator'], 'Front-Load Inverter Motor (Efficient)'),
      n('loadsPerWeek', 'Loads per Week', { def: 6, min: 1, max: 25 }),
      n('kwhRate', 'Electricity Rate ($/kWh)', { def: 0.16, min: 0.05, max: 0.7, step: 0.01 }),
    ],
    compute: (v) => {
      const tech = asSel(v.tech)
      const loads = asNum(v.loadsPerWeek)
      const rate = asNum(v.kwhRate)

      const kwh = tech.includes('Inverter') ? 0.40 : 0.85
      const annualKwh = loads * 52 * kwh
      const annualCost = annualKwh * rate

      return [
        res('Annual Washer Power Cost', money(annualCost) + '/year', T.good),
        res('Energy per Cycle', `${numD(kwh, 2)} kWh`, tech.includes('Inverter') ? T.good : T.warn),
        res('5-Year Electricity Total', money(annualCost * 5), T.neutral),
      ]
    },
  },
  {
    id: 'iron-energy-cost-comparison',
    name: 'Iron Energy Cost Comparison',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Compare operating energy and speed between a 2,200-Watt steam iron and a 1,200-Watt handheld steamer.',
    tip: 'Iron clothes while they are still slightly damp to eliminate the need for high-heat continuous steam bursts.',
    usage: [
      'Input weekly ironing hours and local electricity rate.',
      'Check energy cost per session and annual spend.',
    ],
    method: [
      'Steam iron draws ~2,000 Watts continuously; handheld steamer draws ~1,200 Watts.',
    ],
    fields: [
      n('hoursPerWeek', 'Ironing / Steaming Hours per Week', { def: 1.5, min: 0.25, max: 10, step: 0.25 }),
      n('kwhRate', 'Electricity Rate ($/kWh)', { def: 0.16, min: 0.05, max: 0.7, step: 0.01 }),
    ],
    compute: (v) => {
      const hours = asNum(v.hoursPerWeek)
      const rate = asNum(v.kwhRate)

      const ironAnnual = hours * 52 * 2.0 * rate
      const steamerAnnual = hours * 52 * 1.2 * rate

      return [
        res('Steam Iron (Annual)', money(ironAnnual), T.neutral, '2,000 W element'),
        res('Handheld Steamer (Annual)', money(steamerAnnual), T.good, '1,200 W element'),
        res('Steamer Savings', money(ironAnnual - steamerAnnual) + '/yr', T.good, '40% energy savings'),
      ]
    },
  },
  {
    id: 'standby-energy-usage-calculator',
    name: 'Standby Energy Usage Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate the hidden "vampire draw" of electronics left plugged in on standby 24/7.',
    tip: 'Plugging TV entertainment centers and home offices into smart power strips that shut off at night saves $80+ per year.',
    usage: [
      'Check standby appliances currently plugged in across your home.',
      'Calculate annual phantom power drain.',
    ],
    method: [
      'Sums continuous vampire wattages across 8,760 hours per year.',
    ],
    fields: [
      ck('vampires', 'Appliance running on standby 24/7:', [
        'Cable TV Set-top Box / DVR (25 W constant)',
        'Smart TV with Quick-Start Mode (15 W)',
        'Gaming Console in Instant-On mode (12 W)',
        'Microwave / Oven digital clocks (4 W)',
        'Unplugged Phone & Laptop Chargers (2 W)',
        'Wi-Fi Mesh Extenders (10 W)',
      ]),
      n('rate', 'Electricity Rate ($/kWh)', { def: 0.16, min: 0.05, max: 0.7, step: 0.01 }),
    ],
    compute: (v) => {
      const list = asBoolList(v.vampires)
      const rate = asNum(v.rate)

      const wattsList = [25, 15, 12, 4, 2, 10]
      let totalW = 0
      list.forEach((on, i) => { if (on) totalW += wattsList[i] ?? 0 })

      const annualKwh = (totalW * 8760) / 1000
      const annualCost = annualKwh * rate

      return [
        res('Continuous Standby Draw', `${totalW} Watts 24/7`, totalW > 40 ? T.warn : T.good),
        res('Annual Vampire Power Bill', money(annualCost) + '/year', annualCost > 60 ? T.warn : T.good, `${Math.round(annualKwh)} kWh lost per year`),
        res('Solution', 'Use switchable surge protector strips for TV and desk', T.neutral),
      ]
    },
  },
  {
    id: 'energy-usage-reduction-planner',
    name: 'Energy Usage Reduction Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Generate a high-impact action checklist to reduce your home electric bill by 15% to 25%.',
    tip: 'Cleaning AC outdoor condenser fins with a garden hose removes dust blankets and boosts heat transfer by 15%.',
    usage: [
      'Select your primary heating and cooling system.',
      'Receive prioritized energy conservation actions.',
    ],
    method: [
      'Identifies top heat transfer, water heating, and appliance efficiency levers.',
    ],
    fields: [
      sel('hvacType', 'Primary Home Climate System', ['Central AC & Heat Pump', 'Window AC Units + Gas Heat', 'Ductless Mini-Splits', 'Electric Baseboard Heaters'], 'Central AC & Heat Pump'),
    ],
    compute: (v) => {
      const h = asSel(v.hvacType)

      const actions = [
        '1. THERMOSTAT: Shift temperature 2°F closer to outside temp (saves 8% cooling/heating).',
        '2. WATER HEATER: Turn dial down from 140°F to 120°F (saves $45/yr and stops scalding).',
        '3. LAUNDRY: Wash all routine clothes in COLD water (saves 75% of washer power).',
        '4. LIGHTING: Replace 10 highest-use sockets with 9W LEDs.',
        '5. FRIDGE COILS: Vacuum dust from refrigerator rear/bottom coils every 6 months.',
        '6. AIRFLOW: Replace furnace/AC air filters monthly during peak summer and winter.',
      ].join('\n')

      return [
        res('System Focus', h.split('(')[0].trim(), T.good),
        res('Target Reduction', '15% to 25% lower bill', T.good),
        doc('High-Impact Action Plan', actions),
      ]
    },
  },
  {
    id: 'home-energy-audit',
    name: 'Home Energy Audit',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Self-audit your home’s insulation, windows, water heater, and lighting efficiency.',
    tip: 'Drafty exterior doors lose as much conditioned air as leaving an open 2-inch hole in your wall year-round.',
    usage: [
      'Check off energy efficiency measures currently active in your home.',
      'Check your home efficiency grade (A to F).',
    ],
    method: [
      'Weights 8 core building envelope and mechanical efficiency standards.',
    ],
    fields: [
      ck('auditItems', 'Home Energy Features Installed:', [
        '100% LED lighting installed throughout entire home',
        'Programmable or Smart Thermostat (Ecobee / Nest)',
        'Exterior door sweeps and window weather-stripping sealed',
        'Attic insulation depth at least 12-14 inches (R-38)',
        'Water heater set to 120°F (50°C)',
        'Air filters replaced within the last 60 days',
        'Windows double-glazed / low-E coated',
        'Energy Star rated refrigerator and washing machine',
      ]),
    ],
    compute: (v) => {
      const list = asBoolList(v.auditItems)
      const passed = list.filter(Boolean).length
      const total = list.length || 8
      const score = Math.round((passed / total) * 100)

      let grade = 'A (Excellent Energy Efficiency)'
      let tone = T.good
      if (score < 50) { grade = 'D / F (High Energy Waste)'; tone = T.bad }
      else if (score < 75) { grade = 'C (Average — High savings potential)'; tone = T.warn }
      else if (score < 90) { grade = 'B (Good Energy Discipline)'; tone = T.good }

      return [
        res('Home Energy Grade', grade, tone),
        res('Measures Passed', `${passed} of ${total} standards met (${pct(score, 0)})`, tone),
        res('Next Best Upgrade', passed < 4 ? 'Seal exterior door gaps & install Smart Thermostat' : 'Verify attic insulation depth', T.neutral),
      ]
    },
  },
  {
    id: 'appliance-energy-budget',
    name: 'Appliance Energy Budget',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Allocate a daily kilowatt-hour (kWh) budget across kitchen, laundry, climate, and lights.',
    tip: 'HVAC typically consumes 50% of home electricity, water heating 18%, and refrigeration 8%.',
    usage: [
      'Enter total target daily kWh cap.',
      'Check recommended breakdown across home subsystems.',
    ],
    method: [
      'Standard residential distribution: HVAC (50%), Water Heater (18%), Fridge/Kitchen (14%), Laundry (10%), Lighting/Electronics (8%).',
    ],
    fields: [
      n('targetKwh', 'Target Daily Electricity Cap (kWh/day)', { def: 25, min: 5, max: 150 }),
    ],
    compute: (v) => {
      const target = asNum(v.targetKwh)

      const hvac = target * 0.50
      const water = target * 0.18
      const kitchen = target * 0.14
      const laundry = target * 0.10
      const lighting = target * 0.08

      return [
        res('HVAC Cooling / Heating Cap', `${numD(hvac, 1)} kWh/day (50%)`, T.neutral),
        res('Water Heater Cap', `${numD(water, 1)} kWh/day (18%)`, T.neutral),
        res('Kitchen & Fridge Cap', `${numD(kitchen, 1)} kWh/day (14%)`, T.neutral),
        res('Laundry Cap', `${numD(laundry, 1)} kWh/day (10%)`, T.neutral),
        res('Lighting & Tech Cap', `${numD(lighting, 1)} kWh/day (8%)`, T.good),
      ]
    },
  },
  {
    id: 'monthly-energy-target-calculator',
    name: 'Monthly Energy Target Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Work backwards from your desired monthly dollar electric bill to determine your maximum daily kWh limit.',
    tip: 'If your target bill is $120 and power costs $0.16/kWh, your household must consume under 24.5 kWh per day.',
    usage: [
      'Enter your desired target monthly electric bill amount.',
      'Enter local electricity rate.',
      'Check maximum allowable daily kWh burn.',
    ],
    method: [
      'Max Monthly kWh = Target Bill / Rate. Max Daily kWh = Max Monthly kWh / 30.5.',
    ],
    fields: [
      n('targetBill', 'Desired Monthly Electric Bill ($)', { def: 120, min: 20, max: 1000, step: 10 }),
      n('kwhRate', 'Electricity Rate ($/kWh)', { def: 0.16, min: 0.05, max: 0.8, step: 0.01 }),
    ],
    compute: (v) => {
      const bill = asNum(v.targetBill)
      const rate = asNum(v.kwhRate)

      const maxMonthlyKwh = bill / rate
      const maxDailyKwh = maxMonthlyKwh / 30.5

      return [
        res('Daily Energy Ceiling', `${numD(maxDailyKwh, 1)} kWh/day`, T.good, `To keep bill under ${money(bill)}`),
        res('Monthly Allowance', `${Math.round(maxMonthlyKwh)} kWh/month`, T.neutral),
        res('Estimated Hourly Avg', `${Math.round((maxDailyKwh / 24) * 1000)} Watts continuous draw`, T.neutral),
      ]
    },
  },
]
