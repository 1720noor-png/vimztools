import {
  type HouseholdSpec,
  n,
  sel,
  ck,
  res,
  asNum,
  asSel,
  money,
  moneyC,
  pct,
  num,
  numD,
} from './householdSpec'

const SUB = 'Utilities'
const SUB_ID = 'utilities'

export const utilitiesSpecs: HouseholdSpec[] = [
  {
    id: 'household-water-budget',
    name: 'Household Water Budget',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Establish a monthly indoor and outdoor water budget based on family size and conservation targets.',
    tip: 'The standard efficient water benchmark is 45-50 gallons (170-190 L) per person per day for indoor use.',
    usage: [
      'Enter the number of household members.',
      'Specify expected outdoor landscape watering hours/week.',
      'Set target indoor gallons per person daily.',
      'View total allocated monthly water budget and cost estimate.',
    ],
    method: [
      'Monthly Indoor = People * Daily Gallons * 30.4.',
      'Outdoor = Garden Hose (9 gal/min) * Minutes.',
      'Total Gallons converted to HCF / 1,000 gal units for municipal billing.',
    ],
    fields: [
      n('people', 'Number of Household Members', { def: 3, min: 1, max: 15, step: 1 }),
      n('targetDaily', 'Target Indoor Water / Person (Gallons/Day)', { def: 50, min: 25, max: 150, step: 5 }),
      n('lawnHours', 'Lawn/Outdoor Watering (Hours/Week)', { def: 1.5, min: 0, max: 20, step: 0.5 }),
      n('ratePer1000', 'Water Rate per 1,000 Gallons ($)', { def: 6.5, min: 1, max: 30, step: 0.5 }),
    ],
    compute: (v) => {
      const p = asNum(v.people, 3)
      const target = asNum(v.targetDaily, 50)
      const lawnHrs = asNum(v.lawnHours, 1.5)
      const rate = asNum(v.ratePer1000, 6.5)

      const indoorMonthly = p * target * 30.4
      const outdoorWeekly = lawnHrs * 60 * 8 // avg sprinkler 8 GPM
      const outdoorMonthly = outdoorWeekly * 4.33
      const totalGal = indoorMonthly + outdoorMonthly
      const cost = (totalGal / 1000) * rate

      return [
        res('Monthly Water Budget', `${num(Math.round(totalGal))} gal`, 'neutral', 'Total allocated volume'),
        res('Indoor Monthly', `${num(Math.round(indoorMonthly))} gal`, 'good', `${Math.round((indoorMonthly / totalGal) * 100)}% of total`),
        res('Outdoor Monthly', `${num(Math.round(outdoorMonthly))} gal`, 'info', `${Math.round((outdoorMonthly / totalGal) * 100)}% of total`),
        res('Estimated Monthly Cost', money(cost), cost > 120 ? 'warn' : 'good', `@ $${rate}/kGal`),
      ]
    },
  },
  {
    id: 'water-usage-by-person-calculator',
    name: 'Water Usage by Person Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Break down an individual person\'s daily water footprint across showers, toilets, laundry, and cooking.',
    tip: 'Showers and toilets account for over 50% of an individual person\'s daily indoor water demand.',
    usage: [
      'Enter typical daily shower minutes.',
      'Select showerhead flow rate (standard vs low-flow aerated).',
      'Select toilet flush rating.',
      'Check daily and annualized water consumption per individual.',
    ],
    method: [
      'Shower Gal = Minutes * GPM.',
      'Toilet Gal = Flushes (default 5) * GPF.',
      'Basin + Cooking = ~12 gal base.',
      'Laundry/Dishes share = ~18 gal.',
    ],
    fields: [
      n('showerMinutes', 'Daily Shower Duration (Minutes)', { def: 10, min: 2, max: 45, step: 1 }),
      sel('showerhead', 'Showerhead Type', [
        'Standard (2.5 GPM / 9.5 LPM)',
        'WaterSense Low-Flow (1.75 GPM)',
        'Ultra Low-Flow (1.5 GPM)',
        'Vintage / Rain Shower (4.0 GPM)',
      ], 'Standard (2.5 GPM / 9.5 LPM)'),
      sel('toiletType', 'Toilet Flush Volume', [
        'Standard Modern (1.6 GPF)',
        'High-Efficiency Dual Flush (1.1 GPF)',
        'Older Toilet Pre-1994 (3.5 GPF)',
      ], 'Standard Modern (1.6 GPF)'),
      n('costPer1000', 'Water Rate per 1,000 Gallons ($)', { def: 6.5, min: 1, max: 25, step: 0.5 }),
    ],
    compute: (v) => {
      const mins = asNum(v.showerMinutes, 10)
      const sh = asSel(v.showerhead)
      const gpm = sh.includes('Ultra') ? 1.5 : sh.includes('WaterSense') ? 1.75 : sh.includes('Vintage') ? 4.0 : 2.5
      const tt = asSel(v.toiletType)
      const gpf = tt.includes('Dual') ? 1.1 : tt.includes('Older') ? 3.5 : 1.6
      const rate = asNum(v.costPer1000, 6.5)

      const showerDay = mins * gpm
      const toiletDay = 5 * gpf
      const hygieneCooking = 14
      const sharedAppliances = 16
      const totalDaily = showerDay + toiletDay + hygieneCooking + sharedAppliances
      const annualGal = totalDaily * 365
      const annualCost = (annualGal / 1000) * rate

      return [
        res('Daily Water per Person', `${numD(totalDaily, 1)} gal`, totalDaily > 75 ? 'warn' : 'good', `${num(Math.round(totalDaily * 3.785))} Liters`),
        res('Shower Share', `${numD(showerDay, 1)} gal/day`, 'info', `${Math.round((showerDay / totalDaily) * 100)}% of personal water`),
        res('Annual Usage', `${num(Math.round(annualGal))} gal`, 'neutral', 'Per person / year'),
        res('Personal Annual Cost', money(annualCost), 'info', 'Estimated municipal water cost'),
      ]
    },
  },
  {
    id: 'monthly-water-forecast',
    name: 'Monthly Water Forecast',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Forecast seasonal water consumption and bill fluctuations between summer irrigation and winter baselines.',
    tip: 'Outdoor watering in summer frequently doubles or triples monthly household water bills.',
    usage: [
      'Enter winter indoor baseline usage (gallons or units).',
      'Select season and lawn/garden watering frequency.',
      'Check projected monthly water volume and tiered cost.',
    ],
    method: [
      'Winter baseline = 100% indoor.',
      'Summer multiplier = 1.0 (indoor) + lawn area * evapotranspiration factor.',
    ],
    fields: [
      n('baselineGallons', 'Winter Monthly Baseline (Gallons)', { def: 4500, min: 1000, max: 30000, step: 250 }),
      sel('season', 'Forecasting Season', [
        'Spring (Mild outdoor irrigation)',
        'Peak Summer (Heavy lawn & garden)',
        'Autumn (Tapering irrigation)',
        'Winter (Indoor only)',
      ], 'Peak Summer (Heavy lawn & garden)'),
      n('lawnSqft', 'Lawn / Garden Area (sq ft)', { def: 1500, min: 0, max: 20000, step: 100 }),
      n('ratePer1000', 'Tier 1 Rate ($/kGal)', { def: 6.5, min: 1, max: 20, step: 0.5 }),
    ],
    compute: (v) => {
      const base = asNum(v.baselineGallons, 4500)
      const season = asSel(v.season)
      const sqft = asNum(v.lawnSqft, 1500)
      const rate = asNum(v.ratePer1000, 6.5)

      // Summer lawn needs ~1 inch water/week = 0.623 gal/sqft/week
      const outdoorWeekly = season.includes('Summer') ? sqft * 0.623
        : season.includes('Spring') ? sqft * 0.35
        : season.includes('Autumn') ? sqft * 0.2
        : 0
      const outdoorMonthly = outdoorWeekly * 4.33
      const total = base + outdoorMonthly
      const cost = (total / 1000) * rate

      return [
        res('Forecast Monthly Usage', `${num(Math.round(total))} gal`, total > 10000 ? 'warn' : 'good', `${num(Math.round(total / 748))} HCF units`),
        res('Outdoor Share', `${num(Math.round(outdoorMonthly))} gal`, outdoorMonthly > 3000 ? 'warn' : 'info', `${Math.round((outdoorMonthly / total) * 100)}% outdoor`),
        res('Forecast Bill', money(cost), 'neutral', `Estimated billing amount`),
        res('Seasonal Premium', money(Math.max(0, (outdoorMonthly / 1000) * rate)), 'warn', 'Extra cost above winter baseline'),
      ]
    },
  },
  {
    id: 'water-waste-calculator',
    name: 'Water Waste Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Quantify how much water and money is wasted by letting faucets run, long showers, and inefficient appliances.',
    tip: 'Leaving the tap running while brushing teeth wastes up to 4 gallons of clean drinking water every day.',
    usage: [
      'Select daily running habits (teeth brushing, pre-rinsing dishes).',
      'Enter extra shower minutes beyond 8 minutes.',
      'Calculate cumulative wasted gallons and financial loss over a year.',
    ],
    method: [
      'Running tap = 2.0 GPM * wasted minutes * 365.',
      'Long shower excess = GPM * (actual - 8) * 365.',
    ],
    fields: [
      sel('brushHabit', 'Tap Running While Brushing Teeth', [
        'Always running (4 min/day)',
        'Occasionally running (2 min/day)',
        'Never (Turned off)',
      ], 'Always running (4 min/day)'),
      sel('dishRinse', 'Running Water While Rinsing Dishes', [
        'Continuous stream (15 min/day)',
        'Intermittent spray (5 min/day)',
        'Filled sink basin / Dishwasher scrape only',
      ], 'Continuous stream (15 min/day)'),
      n('excessShowerMins', 'Excess Shower Minutes / Day (Entire Family)', { def: 12, min: 0, max: 60, step: 2 }),
      n('waterRate', 'Water Rate per 1,000 Gallons ($)', { def: 7.0, min: 2, max: 25, step: 0.5 }),
    ],
    compute: (v) => {
      const brush = asSel(v.brushHabit)
      const brushMins = brush.includes('4 min') ? 4 : brush.includes('2 min') ? 2 : 0
      const dish = asSel(v.dishRinse)
      const dishMins = dish.includes('15 min') ? 15 : dish.includes('5 min') ? 5 : 0
      const showerMins = asNum(v.excessShowerMins, 12)
      const rate = asNum(v.waterRate, 7.0)

      const dailyWastedGal = (brushMins * 2.2) + (dishMins * 2.2) + (showerMins * 2.5)
      const annualWastedGal = dailyWastedGal * 365
      const annualWasteCost = (annualWastedGal / 1000) * rate

      return [
        res('Daily Wasted Water', `${numD(dailyWastedGal, 1)} gal`, dailyWastedGal > 20 ? 'bad' : 'good', `${num(Math.round(dailyWastedGal * 3.785))} Liters`),
        res('Annual Wasted Volume', `${num(Math.round(annualWastedGal))} gal`, 'warn', `Equivalent to ~${Math.round(annualWastedGal / 400)} standard bathtubs`),
        res('Annual Wasted Money', money(annualWasteCost), 'bad', 'Pure avoidable loss'),
        res('Potential Savings', money(annualWasteCost * 0.85), 'good', 'Achievable with simple habit changes'),
      ]
    },
  },
  {
    id: 'leak-cost-estimator',
    name: 'Leak Cost Estimator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate the volume and monetary loss of dripping faucets, running flappers, and leaking irrigation pipes.',
    tip: 'A silently running toilet flapper can waste up to 200 gallons per day without making an audible splashing sound.',
    usage: [
      'Select the leak severity (dripping faucet, steady stream, running toilet).',
      'Enter the estimated duration the leak has been active.',
      'Check wasted water volume in gallons and utility bill surcharge.',
    ],
    method: [
      'Slow drip = 10 drops/min (~1 gal/day). Fast drip = 60 drops/min (~5 gal/day).',
      'Trickling faucet = 20 gal/day. Running toilet = 60 to 200 gal/day.',
    ],
    fields: [
      sel('leakType', 'Type and Rate of Leak', [
        'Slow Faucet Drip (10 drips/min ~ 1 gal/day)',
        'Fast Faucet Drip (60 drips/min ~ 5 gal/day)',
        'Steady Trickling Faucet (20 gal/day)',
        'Toilet Flapper Slow Silent Leak (50 gal/day)',
        'Toilet Flapper Running Continuously (200 gal/day)',
        'Irrigation Pipe Small Crack (500 gal/day)',
      ], 'Toilet Flapper Slow Silent Leak (50 gal/day)'),
      n('leakDays', 'Duration of Leak (Days)', { def: 30, min: 1, max: 365, step: 1 }),
      n('ratePer1000', 'Water Rate per 1,000 Gallons ($)', { def: 7.5, min: 2, max: 30, step: 0.5 }),
    ],
    compute: (v) => {
      const type = asSel(v.leakType)
      const days = asNum(v.leakDays, 30)
      const rate = asNum(v.ratePer1000, 7.5)

      let gpd = 50
      if (type.includes('Slow Faucet')) gpd = 1
      else if (type.includes('Fast Faucet')) gpd = 5
      else if (type.includes('Trickling Faucet')) gpd = 20
      else if (type.includes('Running Continuously')) gpd = 200
      else if (type.includes('Irrigation Pipe')) gpd = 500

      const totalGal = gpd * days
      const totalCost = (totalGal / 1000) * rate

      return [
        res('Daily Leak Loss', `${gpd} gal/day`, gpd >= 50 ? 'bad' : 'warn', `${Math.round(gpd * 3.785)} Liters/day`),
        res('Total Water Wasted', `${num(totalGal)} gal`, 'bad', `Over ${days} days duration`),
        res('Estimated Surcharge', money(totalCost), totalCost > 30 ? 'bad' : 'warn', 'Added to your water bill'),
        res('Repair ROI', 'Immediate (< 2 days)', 'good', 'New flapper kit ~$8-15'),
      ]
    },
  },
  {
    id: 'faucet-water-usage-calculator',
    name: 'Faucet Water Usage Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Compare standard faucets with aerated low-flow models across kitchen and bathroom sinks.',
    tip: 'Installing a $3 faucet aerator reduces flow from 2.2 GPM to 1.0 or 0.5 GPM with zero noticeable pressure loss.',
    usage: [
      'Enter total faucet running minutes per day across all sinks.',
      'Select current aerator status.',
      'See water consumption and annual savings from upgrading to 1.0 GPM aerators.',
    ],
    method: [
      'Gallons = Minutes * GPM flow rate * Days.',
      'Savings = (Old GPM - New GPM) * Minutes * Rate.',
    ],
    fields: [
      n('activeMinutes', 'Total Faucet Running Time (Mins/Day for House)', { def: 25, min: 5, max: 120, step: 5 }),
      sel('currentAerator', 'Current Aerator Flow Rate', [
        'Standard / Older (2.2 GPM)',
        'Modern Standard (1.5 GPM)',
        'High-Efficiency (1.0 GPM)',
        'Ultra Efficient Bathroom (0.5 GPM)',
      ], 'Standard / Older (2.2 GPM)'),
      n('ratePer1000', 'Water Rate per 1,000 Gallons ($)', { def: 7.0, min: 2, max: 25, step: 0.5 }),
    ],
    compute: (v) => {
      const mins = asNum(v.activeMinutes, 25)
      const aero = asSel(v.currentAerator)
      const rate = asNum(v.ratePer1000, 7.0)

      const flow = aero.includes('2.2') ? 2.2 : aero.includes('1.5') ? 1.5 : aero.includes('1.0') ? 1.0 : 0.5
      const dailyGal = mins * flow
      const annualGal = dailyGal * 365
      const annualCost = (annualGal / 1000) * rate

      // Compare with 1.0 GPM
      const effDailyGal = mins * 1.0
      const savedGal = Math.max(0, annualGal - (effDailyGal * 365))
      const savedCost = (savedGal / 1000) * rate

      return [
        res('Current Daily Faucet Water', `${numD(dailyGal, 1)} gal`, 'neutral', `${num(Math.round(dailyGal * 3.785))} Liters`),
        res('Annual Water Volume', `${num(Math.round(annualGal))} gal`, 'info', 'Per year'),
        res('Annual Faucet Cost', money(annualCost), 'neutral', 'Current expenditure'),
        res('Savings with 1.0 GPM Aerator', `${num(Math.round(savedGal))} gal/yr`, 'good', `Saves ${money(savedCost)}/year`),
      ]
    },
  },
  {
    id: 'toilet-water-usage-calculator',
    name: 'Toilet Water Usage Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Estimate total water consumed by household toilets and evaluate upgrading to dual-flush or 1.28 GPF fixtures.',
    tip: 'Toilets installed before 1994 use 3.5 to 5.0 gallons per flush, compared to 1.28 gallons for WaterSense models.',
    usage: [
      'Enter household residents and daily flushes per person.',
      'Select toilet era and flush volume.',
      'View daily, monthly, and annual toilet water demand.',
    ],
    method: [
      'Total Flushes = Residents * Flushes per person (avg 5).',
      'Gallons = Total Flushes * Gallons per flush.',
    ],
    fields: [
      n('residents', 'Number of Household Residents', { def: 4, min: 1, max: 12, step: 1 }),
      n('flushesPerDay', 'Flushes per Person / Day', { def: 5, min: 2, max: 10, step: 1 }),
      sel('toiletRating', 'Toilet Model / Era', [
        'Vintage Pre-1980 (5.0 GPF)',
        'Older Standard 1980-1993 (3.5 GPF)',
        'Standard Low-Flow 1994-2010 (1.6 GPF)',
        'Modern WaterSense (1.28 GPF)',
        'Dual-Flush High-Efficiency (0.9 / 1.6 GPF ~ avg 1.1 GPF)',
      ], 'Standard Low-Flow 1994-2010 (1.6 GPF)'),
      n('waterRate', 'Water Rate per 1,000 Gallons ($)', { def: 7.0, min: 2, max: 25, step: 0.5 }),
    ],
    compute: (v) => {
      const resCount = asNum(v.residents, 4)
      const flushes = asNum(v.flushesPerDay, 5)
      const tr = asSel(v.toiletRating)
      const rate = asNum(v.waterRate, 7.0)

      let gpf = 1.6
      if (tr.includes('5.0')) gpf = 5.0
      else if (tr.includes('3.5')) gpf = 3.5
      else if (tr.includes('1.28')) gpf = 1.28
      else if (tr.includes('Dual-Flush')) gpf = 1.1

      const totalDailyFlushes = resCount * flushes
      const dailyGal = totalDailyFlushes * gpf
      const monthlyGal = dailyGal * 30.4
      const annualGal = dailyGal * 365
      const annualCost = (annualGal / 1000) * rate

      // Savings if upgrading to 1.28 GPF
      const modernAnnualGal = totalDailyFlushes * 1.28 * 365
      const annualSavedGal = Math.max(0, annualGal - modernAnnualGal)
      const annualSavedCost = (annualSavedGal / 1000) * rate

      return [
        res('Daily Toilet Water', `${numD(dailyGal, 1)} gal`, dailyGal > 50 ? 'warn' : 'good', `${totalDailyFlushes} flushes total`),
        res('Monthly Water Consumed', `${num(Math.round(monthlyGal))} gal`, 'info', `${num(Math.round(monthlyGal / 748))} HCF`),
        res('Annual Toilet Bill', money(annualCost), 'neutral', 'Current cost of flushing'),
        res('Savings with WaterSense 1.28', `${num(Math.round(annualSavedGal))} gal/yr`, annualSavedGal > 0 ? 'good' : 'neutral', `Saves ${money(annualSavedCost)}/yr`),
      ]
    },
  },
  {
    id: 'toilet-flush-cost-calculator',
    name: 'Toilet Flush Cost Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate the micro-cost of a single toilet flush and see cumulative cost over months and years.',
    tip: 'Combined water and sewer rates in many cities mean a single 3.5 gallon flush costs almost 4 cents.',
    usage: [
      'Enter your municipal water + sewer rate per 1,000 gallons.',
      'Enter your toilet flush rating.',
      'Check exact cost per flush, cost per week, and cost per year.',
    ],
    method: [
      'Cost per Flush = (GPF / 1000) * Combined Rate.',
      'Annual Cost = Cost per Flush * Daily Flushes * 365.',
    ],
    fields: [
      n('combinedRate', 'Combined Water + Sewer Rate ($/1,000 Gal)', { def: 11.5, min: 2, max: 40, step: 0.5 }),
      sel('flushRating', 'Toilet Flush Volume (GPF)', [
        '1.1 GPF (Ultra High Efficiency)',
        '1.28 GPF (WaterSense Modern)',
        '1.6 GPF (Standard Low-Flow)',
        '3.5 GPF (Pre-1994 Conventional)',
        '5.0 GPF (Vintage 1970s)',
      ], '1.6 GPF (Standard Low-Flow)'),
      n('flushesPerDay', 'Flushes per Day in Household', { def: 18, min: 1, max: 60, step: 1 }),
    ],
    compute: (v) => {
      const rate = asNum(v.combinedRate, 11.5)
      const fr = asSel(v.flushRating)
      const dailyFlushes = asNum(v.flushesPerDay, 18)

      let gpf = 1.6
      if (fr.includes('1.1')) gpf = 1.1
      else if (fr.includes('1.28')) gpf = 1.28
      else if (fr.includes('3.5')) gpf = 3.5
      else if (fr.includes('5.0')) gpf = 5.0

      const costPerFlush = (gpf / 1000) * rate
      const dailyCost = costPerFlush * dailyFlushes
      const monthlyCost = dailyCost * 30.4
      const annualCost = dailyCost * 365

      return [
        res('Cost per Single Flush', moneyC(costPerFlush), 'good', `${gpf} gallons`),
        res('Daily Household Flush Cost', money(dailyCost), 'neutral', `${dailyFlushes} total flushes`),
        res('Monthly Cost', money(monthlyCost), 'info', 'Water + sewer combined'),
        res('Annual Cost', money(annualCost), annualCost > 100 ? 'warn' : 'good', 'Entire household'),
      ]
    },
  },
  {
    id: 'bathtub-water-usage-calculator',
    name: 'Bathtub Water Usage Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Compare the water volume and heating energy cost of a relaxing bath vs a quick shower.',
    tip: 'A standard full bathtub requires 35-50 gallons of water, whereas an 8-minute low-flow shower uses only 14 gallons.',
    usage: [
      'Select bathtub fill level (standard, deep soaking, whirlpool).',
      'Compare against typical shower duration.',
      'Check water difference and water heater gas/electric cost comparison.',
    ],
    method: [
      'Standard bath fill = ~36 gallons. Deep soaking = ~55-70 gallons.',
      'Shower = Minutes * Flow rate (e.g. 8 min * 2.0 GPM = 16 gal).',
      'Water heating energy = Gallons * 8.33 lb * Temp Rise (60F) / Efficiency.',
    ],
    fields: [
      sel('bathTubType', 'Bathtub Type & Fill Level', [
        'Standard Alcove Tub Filled 60% (~32 Gallons)',
        'Standard Alcove Tub Filled 85% (~45 Gallons)',
        'Deep Soaking / Freestanding Tub (~60 Gallons)',
        'Large Whirlpool / Jacuzzi Tub (~80 Gallons)',
      ], 'Standard Alcove Tub Filled 60% (~32 Gallons)'),
      n('showerMinutes', 'Comparable Shower Duration (Minutes)', { def: 8, min: 3, max: 30, step: 1 }),
      n('showerGpm', 'Showerhead Flow Rate (GPM)', { def: 2.0, min: 1.2, max: 4.0, step: 0.1 }),
      sel('heaterType', 'Water Heater Fuel Type', [
        'Electric Tank ($0.16/kWh)',
        'Natural Gas Tank ($1.40/therm)',
        'Heat Pump Hybrid ($0.16/kWh)',
      ], 'Natural Gas Tank ($1.40/therm)'),
    ],
    compute: (v) => {
      const bt = asSel(v.bathTubType)
      const bathGal = bt.includes('32') ? 32 : bt.includes('45') ? 45 : bt.includes('60') ? 60 : 80
      const sMins = asNum(v.showerMinutes, 8)
      const gpm = asNum(v.showerGpm, 2.0)
      const showerGal = sMins * gpm

      const galDiff = bathGal - showerGal
      const fuel = asSel(v.heaterType)

      // Cost per hot gallon: approx $0.008 for gas, $0.018 for electric resistance, $0.006 for heat pump
      const heatCostPerGal = fuel.includes('Gas') ? 0.008 : fuel.includes('Heat Pump') ? 0.006 : 0.018
      const waterRateGal = 0.007 // $7/kGal

      const bathTotalCost = bathGal * (waterRateGal + heatCostPerGal * 0.7) // 70% hot water
      const showerTotalCost = showerGal * (waterRateGal + heatCostPerGal * 0.65)

      return [
        res('Bathtub Volume', `${bathGal} gal`, 'warn', `${Math.round(bathGal * 3.785)} Liters`),
        res('Shower Volume', `${numD(showerGal, 1)} gal`, 'good', `${sMins} mins @ ${gpm} GPM`),
        res('Water Difference', `${numD(galDiff, 1)} gal saved per shower`, galDiff > 0 ? 'good' : 'warn', `${Math.round((galDiff / bathGal) * 100)}% less water`),
        res('Cost per Bath vs Shower', `${money(bathTotalCost)} vs ${money(showerTotalCost)}`, 'neutral', 'Includes water heating energy'),
      ]
    },
  },
  {
    id: 'garden-water-usage-calculator',
    name: 'Garden Water Usage Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate water volume required for lawn sprinklers, raised vegetable beds, and drip irrigation systems.',
    tip: 'Watering early in the morning before 8 AM reduces evaporation loss by up to 30% compared to afternoon watering.',
    usage: [
      'Enter garden or lawn surface area in square feet.',
      'Select irrigation delivery method (drip, sprinkler, soaker hose).',
      'Enter watering frequency and weekly inches of water needed.',
      'Review weekly and monthly water consumption and municipal billing cost.',
    ],
    method: [
      '1 inch of water on 1 sq ft = 0.623 gallons.',
      'Gallons = Area * Inches * 0.623 / Irrigation Efficiency factor.',
      'Drip efficiency = 90%, Sprinkler efficiency = 65%.',
    ],
    fields: [
      n('areaSqft', 'Garden / Lawn Area (sq ft)', { def: 1200, min: 50, max: 25000, step: 50 }),
      sel('irrigationMethod', 'Irrigation Delivery Method', [
        'Drip Irrigation (90% efficiency)',
        'Soaker Hose (75% efficiency)',
        'Oscillating / Rotor Sprinklers (65% efficiency)',
        'Hand Hose with Spray Nozzle (70% efficiency)',
      ], 'Oscillating / Rotor Sprinklers (65% efficiency)'),
      n('weeklyInches', 'Weekly Water Depth (Inches)', { def: 1.0, min: 0.25, max: 3.0, step: 0.25 }),
      n('ratePer1000', 'Water Rate per 1,000 Gallons ($)', { def: 6.5, min: 1, max: 25, step: 0.5 }),
    ],
    compute: (v) => {
      const area = asNum(v.areaSqft, 1200)
      const im = asSel(v.irrigationMethod)
      const eff = im.includes('90%') ? 0.90 : im.includes('75%') ? 0.75 : im.includes('70%') ? 0.70 : 0.65
      const inches = asNum(v.weeklyInches, 1.0)
      const rate = asNum(v.ratePer1000, 6.5)

      const baseWeeklyGal = area * inches * 0.623
      const totalWeeklyGal = baseWeeklyGal / eff
      const monthlyGal = totalWeeklyGal * 4.33
      const monthlyCost = (monthlyGal / 1000) * rate

      return [
        res('Weekly Garden Water', `${num(Math.round(totalWeeklyGal))} gal`, 'neutral', `${num(Math.round(totalWeeklyGal * 3.785))} Liters/wk`),
        res('Monthly Garden Water', `${num(Math.round(monthlyGal))} gal`, monthlyGal > 5000 ? 'warn' : 'good', `${num(Math.round(monthlyGal / 748))} HCF units`),
        res('Estimated Monthly Cost', money(monthlyCost), 'warn', `@ $${rate}/kGal`),
        res('Evaporation / Inefficiency Loss', `${num(Math.round(monthlyGal - (baseWeeklyGal * 4.33)))} gal/mo`, 'bad', `Due to ${Math.round((1 - eff) * 100)}% delivery loss`),
      ]
    },
  },
  {
    id: 'water-conservation-calculator',
    name: 'Water Conservation Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Simulate household water conservation retrofits (aerators, low-flow toilets, smart sprinklers) and projected savings.',
    tip: 'A comprehensive home water retrofit typically cuts total water bills by 25% to 38% with under 6 months payback.',
    usage: [
      'Enter current monthly water bill.',
      'Check retrofit measures planned (aerators, WaterSense toilets, smart sprinkler controller).',
      'View estimated annual financial and gallon savings.',
    ],
    method: [
      'Calculates cumulative percentage reduction from verified WaterSense benchmarks.',
    ],
    fields: [
      n('currentMonthlyBill', 'Current Average Monthly Water Bill ($)', { def: 85, min: 15, max: 400, step: 5 }),
      ck('aerators', 'Install Low-Flow Faucet Aerators (Save ~4% bill)', true),
      ck('toilets', 'Upgrade Older Toilets to WaterSense 1.28 GPF (Save ~16% bill)', true),
      ck('showerheads', 'Install 1.75 GPM Showerheads (Save ~9% bill)', true),
      ck('smartSprinkler', 'Install Smart Weather Sprinkler Controller (Save ~12% bill)', false),
      ck('fixLeaks', 'Inspect and Fix Minor Dripping Fixtures (Save ~6% bill)', true),
    ],
    compute: (v) => {
      const bill = asNum(v.currentMonthlyBill, 85)
      let pctSaved = 0
      if (v.aerators) pctSaved += 0.04
      if (v.toilets) pctSaved += 0.16
      if (v.showerheads) pctSaved += 0.09
      if (v.smartSprinkler) pctSaved += 0.12
      if (v.fixLeaks) pctSaved += 0.06

      pctSaved = Math.min(0.50, pctSaved)
      const monthlySavings = bill * pctSaved
      const annualSavings = monthlySavings * 12
      const newBill = bill - monthlySavings

      return [
        res('Total Bill Reduction', pct(pctSaved * 100), 'good', 'Projected efficiency gain'),
        res('Monthly Dollar Savings', money(monthlySavings), 'good', 'Off your monthly bill'),
        res('Annual Dollar Savings', money(annualSavings), 'good', 'Cumulative annual benefit'),
        res('New Projected Monthly Bill', money(newBill), 'neutral', `Down from ${money(bill)}/mo`),
      ]
    },
  },
  {
    id: 'rainwater-collection-calculator',
    name: 'Rainwater Collection Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate harvestable rainwater volume from your roof area and local rainfall statistics.',
    tip: 'One inch of rain on a 1,000 sq ft roof yields over 600 gallons of clean harvestable water.',
    usage: [
      'Enter your home roof footprint in square feet.',
      'Enter expected monthly or annual rainfall in inches.',
      'Select gutter/catchment efficiency rating.',
      'Check harvestable gallons and water utility cost offset.',
    ],
    method: [
      'Harvest Gallons = Catchment Sq Ft * Rainfall Inches * 0.6233 * Runoff Coefficient.',
      'Shingle roof runoff coefficient = ~0.85; Metal roof = ~0.95.',
    ],
    fields: [
      n('roofSqft', 'Roof Catchment Area (sq ft)', { def: 1800, min: 200, max: 15000, step: 50 }),
      n('rainfallInches', 'Rainfall (Inches)', { def: 3.5, min: 0.1, max: 30, step: 0.2 }),
      sel('roofMaterial', 'Roof Surface Material', [
        'Seamless Metal / Steel (95% runoff efficiency)',
        'Asphalt Shingle (80% runoff efficiency)',
        'Concrete Tile / Slate (85% runoff efficiency)',
        'Flat / Built-up Membrane (75% runoff efficiency)',
      ], 'Asphalt Shingle (80% runoff efficiency)'),
      n('waterRate', 'Municipal Water Rate ($/1,000 Gal)', { def: 7.0, min: 2, max: 25, step: 0.5 }),
    ],
    compute: (v) => {
      const roof = asNum(v.roofSqft, 1800)
      const rain = asNum(v.rainfallInches, 3.5)
      const rm = asSel(v.roofMaterial)
      const eff = rm.includes('95%') ? 0.95 : rm.includes('80%') ? 0.80 : rm.includes('85%') ? 0.85 : 0.75
      const rate = asNum(v.waterRate, 7.0)

      const harvestGal = roof * rain * 0.6233 * eff
      const harvestLit = harvestGal * 3.7854
      const val = (harvestGal / 1000) * rate

      return [
        res('Harvestable Rainwater', `${num(Math.round(harvestGal))} gal`, 'good', `${num(Math.round(harvestLit))} Liters`),
        res('Barrels Equivalent', `${Math.round(harvestGal / 55)} standard barrels`, 'info', '55-gallon rain barrels'),
        res('Utility Value', money(val), 'good', `Offset against municipal water`),
        res('Runoff Efficiency', pct(eff * 100), 'neutral', `${rm.split('(')[0].trim()}`),
      ]
    },
  },
  {
    id: 'rainwater-tank-size-calculator',
    name: 'Rainwater Tank Size Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Size a rainwater storage cistern or barrel bank based on dry-spell duration and garden irrigation demand.',
    tip: 'Always size your storage to bridge your longest expected summer drought period (typically 21-45 dry days).',
    usage: [
      'Enter daily garden or household non-potable water demand (gallons/day).',
      'Enter maximum consecutive dry days without significant rain.',
      'Check recommended minimum and buffered cistern capacity in gallons and liters.',
    ],
    method: [
      'Required Storage = Daily Demand * Dry Days * 1.25 (25% safety reserve).',
    ],
    fields: [
      n('dailyDemand', 'Daily Non-Potable Water Demand (Gallons/Day)', { def: 40, min: 5, max: 500, step: 5 }),
      n('dryDays', 'Longest Expected Dry Spell (Days)', { def: 28, min: 7, max: 120, step: 1 }),
      sel('reserveMargin', 'Buffer / Safety Reserve', [
        'Standard (25% safety reserve)',
        'Conservative (50% safety reserve)',
        'Minimal (10% safety reserve)',
      ], 'Standard (25% safety reserve)'),
    ],
    compute: (v) => {
      const demand = asNum(v.dailyDemand, 40)
      const days = asNum(v.dryDays, 28)
      const resSel = asSel(v.reserveMargin)
      const buffer = resSel.includes('50%') ? 1.5 : resSel.includes('25%') ? 1.25 : 1.10

      const netDemand = demand * days
      const tankCapacity = Math.round(netDemand * buffer)
      const liters = Math.round(tankCapacity * 3.7854)
      const barrels55 = Math.ceil(tankCapacity / 55)

      return [
        res('Recommended Tank Size', `${num(tankCapacity)} gal`, 'good', `${num(liters)} Liters`),
        res('Net Drought Demand', `${num(netDemand)} gal`, 'info', `${days} days @ ${demand} gal/day`),
        res('55-Gal Barrel Bank', `${barrels55} barrels`, 'neutral', 'If using linked modular barrels'),
        res('Safety Buffer Included', `${Math.round((buffer - 1) * 100)}% reserve`, 'good', 'Protects against prolonged dry periods'),
      ]
    },
  },
  {
    id: 'rainwater-harvesting-estimate',
    name: 'Rainwater Harvesting Estimate',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Generate a comprehensive annual financial and volume report for a complete residential rainwater catchment system.',
    tip: 'Using rainwater for toilet flushing and clothes washing eliminates chlorine and water softening salt needs.',
    usage: [
      'Enter roof square footage and annual rainfall in inches.',
      'Select intended uses (landscape only vs toilet flushing + landscape).',
      'Enter system installation budget.',
      'Check annual gallons harvested, annual utility savings, and payback period.',
    ],
    method: [
      'Annual Gallons = Roof * Annual Rain * 0.6233 * 0.85.',
      'Usable Gallons = Min(Annual Gallons, Annual Demand).',
      'Payback = System Cost / Annual Utility Savings.',
    ],
    fields: [
      n('roofSqft', 'Roof Footprint Area (sq ft)', { def: 2000, min: 300, max: 10000, step: 100 }),
      n('annualRainInches', 'Average Annual Rainfall (Inches)', { def: 36, min: 5, max: 100, step: 1 }),
      sel('harvestUsage', 'Intended Rainwater Application', [
        'Lawn & Garden Landscape Only',
        'Garden + Toilet Flushing (Requires diverter & pump)',
        'Full Non-Potable (Garden, Toilets, Laundry)',
      ], 'Lawn & Garden Landscape Only'),
      n('systemCost', 'Total System Setup Cost ($)', { def: 850, min: 100, max: 12000, step: 50 }),
      n('waterSewerRate', 'Combined Water/Sewer Rate ($/kGal)', { def: 11.0, min: 3, max: 35, step: 0.5 }),
    ],
    compute: (v) => {
      const roof = asNum(v.roofSqft, 2000)
      const rain = asNum(v.annualRainInches, 36)
      const app = asSel(v.harvestUsage)
      const cost = asNum(v.systemCost, 850)
      const rate = asNum(v.waterSewerRate, 11.0)

      const grossHarvest = roof * rain * 0.6233 * 0.85
      const demandLimit = app.includes('Full') ? 45000 : app.includes('Toilet') ? 30000 : 15000
      const actualUtilized = Math.min(grossHarvest, demandLimit)
      const annualSavings = (actualUtilized / 1000) * rate
      const paybackYears = annualSavings > 0 ? cost / annualSavings : 99

      return [
        res('Annual Harvest Volume', `${num(Math.round(grossHarvest))} gal/yr`, 'good', `${num(Math.round(grossHarvest * 3.785))} Liters`),
        res('Utilized Volume', `${num(Math.round(actualUtilized))} gal/yr`, 'info', `${app.split('(')[0].trim()}`),
        res('Annual Utility Savings', money(annualSavings), 'good', `Offset @ ${money(rate)}/kGal`),
        res('Estimated Payback', `${numD(paybackYears, 1)} years`, paybackYears < 6 ? 'good' : 'neutral', `System investment ${money(cost)}`),
      ]
    },
  },
  {
    id: 'gas-appliance-cost-calculator',
    name: 'Gas Appliance Cost Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate operational running costs for natural gas water heaters, furnaces, stoves, and clothes dryers.',
    tip: 'One Therm of natural gas equals 100,000 BTU. Always check your utility bill for the current therm rate.',
    usage: [
      'Select the gas appliance type and BTU rating.',
      'Enter hours or minutes used per day.',
      'Enter your natural gas rate per therm.',
      'Check daily, monthly, and yearly operating expenses.',
    ],
    method: [
      'Therms = (BTU / 100,000) * Hours * Duty Cycle.',
      'Cost = Therms * Gas Rate ($/therm).',
    ],
    fields: [
      sel('appliance', 'Gas Appliance', [
        'Gas Water Heater Tank (40,000 BTU, 3 hrs/day burner)',
        'Tankless Gas Water Heater (199,000 BTU, 0.7 hrs/day)',
        'Gas Central Furnace (80,000 BTU, 5 hrs/day winter)',
        'Gas Clothes Dryer (22,000 BTU, 1 hr/load)',
        'Gas Cooktop Burner (12,000 BTU, 1.5 hrs/day)',
        'Gas Fireplace (30,000 BTU, 2 hrs/day)',
      ], 'Gas Water Heater Tank (40,000 BTU, 3 hrs/day burner)'),
      n('gasRate', 'Natural Gas Rate ($/therm)', { def: 1.45, min: 0.5, max: 5.0, step: 0.05 }),
      n('customHours', 'Daily Operational Hours', { def: 3.0, min: 0.2, max: 24, step: 0.2 }),
    ],
    compute: (v) => {
      const app = asSel(v.appliance)
      const rate = asNum(v.gasRate, 1.45)
      const hrs = asNum(v.customHours, 3.0)

      let btu = 40000
      if (app.includes('Tankless')) btu = 199000
      else if (app.includes('Furnace')) btu = 80000
      else if (app.includes('Dryer')) btu = 22000
      else if (app.includes('Cooktop')) btu = 12000
      else if (app.includes('Fireplace')) btu = 30000

      const thermsPerDay = (btu / 100000) * hrs
      const dailyCost = thermsPerDay * rate
      const monthlyCost = dailyCost * 30.4
      const annualCost = dailyCost * 365

      return [
        res('Daily Gas Energy', `${numD(thermsPerDay, 2)} therms`, 'neutral', `${num(Math.round(thermsPerDay * 29.3))} kWh equiv`),
        res('Daily Operating Cost', money(dailyCost), 'good', `@ $${rate}/therm`),
        res('Monthly Operating Cost', money(monthlyCost), monthlyCost > 60 ? 'warn' : 'good', 'Estimated monthly share'),
        res('Annual Operating Cost', money(annualCost), 'info', 'Total annual consumption'),
      ]
    },
  },
  {
    id: 'monthly-gas-usage-forecast',
    name: 'Monthly Gas Usage Forecast',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Model year-round natural gas bill variations between mild summer months and freezing winter heating seasons.',
    tip: 'Space heating typically represents 60% to 75% of total annual natural gas usage in colder climates.',
    usage: [
      'Enter summer baseload gas usage (water heater + stove only).',
      'Select winter climate severity and home insulation quality.',
      'Check forecasted winter heating therms and monthly peak bill.',
    ],
    method: [
      'Baseload = Water heating + Cooking (~20-30 therms/month).',
      'Winter heating therms = HDD (Heating Degree Days) * Home Heat Loss Factor.',
    ],
    fields: [
      n('summerTherms', 'Summer Monthly Baseload (Therms)', { def: 22, min: 5, max: 60, step: 1 }),
      sel('climateZone', 'Winter Climate Severity', [
        'Mild Winter (South / Coastal - +30 therms/mo)',
        'Moderate Winter (Mid-Atlantic / Central - +75 therms/mo)',
        'Cold Winter (Northeast / Midwest - +140 therms/mo)',
        'Severe Cold Winter (Upper Midwest / Canada - +210 therms/mo)',
      ], 'Moderate Winter (Mid-Atlantic / Central - +75 therms/mo)'),
      n('gasRate', 'Gas Rate ($/therm)', { def: 1.45, min: 0.6, max: 4.0, step: 0.05 }),
    ],
    compute: (v) => {
      const base = asNum(v.summerTherms, 22)
      const cz = asSel(v.climateZone)
      const rate = asNum(v.gasRate, 1.45)

      let heatingTherms = 75
      if (cz.includes('Mild')) heatingTherms = 30
      else if (cz.includes('Cold Winter (Northeast')) heatingTherms = 140
      else if (cz.includes('Severe Cold')) heatingTherms = 210

      const peakWinterTherms = base + heatingTherms
      const summerBill = base * rate
      const winterBill = peakWinterTherms * rate
      const annualTherms = (base * 12) + (heatingTherms * 4.5) // ~4.5 heating months
      const annualBill = annualTherms * rate

      return [
        res('Summer Baseline Bill', money(summerBill), 'good', `${base} therms/mo`),
        res('Peak Winter Bill', money(winterBill), winterBill > 200 ? 'bad' : 'warn', `${peakWinterTherms} therms/mo`),
        res('Winter Premium', money(winterBill - summerBill), 'warn', 'Extra space heating cost'),
        res('Annual Natural Gas Bill', money(annualBill), 'neutral', `${num(Math.round(annualTherms))} therms/year`),
      ]
    },
  },
  {
    id: 'gas-cylinder-usage-estimator',
    name: 'Gas Cylinder Usage Estimator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Estimate remaining lifespan and daily burn rate for BBQ propane tanks and household LPG cylinders.',
    tip: 'A standard 20 lb BBQ propane cylinder contains approximately 4.7 gallons or 430,000 total BTUs of fuel.',
    usage: [
      'Select cylinder size (20 lb BBQ, 33 lb forklift, 100 lb residential).',
      'Select appliance burner size and daily burn time.',
      'Check hours of continuous burn and remaining days of fuel.',
    ],
    method: [
      'Cylinder total BTU = Propane weight in lbs * 21,548 BTU/lb.',
      'Hours = Total BTU / Appliance BTU per hour.',
      'Days = Hours / Daily Burn Hours.',
    ],
    fields: [
      sel('tankSize', 'Propane / LPG Cylinder Capacity', [
        '20 lb BBQ Grill Tank (430,000 BTU total)',
        '30 lb RV / Outdoor Heater Tank (646,000 BTU total)',
        '40 lb Commercial / Patio Tank (861,000 BTU total)',
        '100 lb Residential Domestic Cylinder (2,154,000 BTU total)',
      ], '20 lb BBQ Grill Tank (430,000 BTU total)'),
      sel('burnerRating', 'Appliance Burner Draw', [
        'BBQ Grill - 2 Burners Medium (24,000 BTU/hr)',
        'BBQ Grill - All Burners High (48,000 BTU/hr)',
        'Patio Heater (40,000 BTU/hr)',
        'Camping 2-Burner Stove (20,000 BTU/hr)',
        'Indoor Gas Stove 2 Burners (15,000 BTU/hr)',
      ], 'BBQ Grill - 2 Burners Medium (24,000 BTU/hr)'),
      n('dailyUseHours', 'Expected Daily Operation (Hours)', { def: 1.0, min: 0.2, max: 12, step: 0.2 }),
    ],
    compute: (v) => {
      const ts = asSel(v.tankSize)
      let totalBtu = 430000
      if (ts.includes('30 lb')) totalBtu = 646000
      else if (ts.includes('40 lb')) totalBtu = 861000
      else if (ts.includes('100 lb')) totalBtu = 2154000

      const br = asSel(v.burnerRating)
      let btuHr = 24000
      if (br.includes('48,000')) btuHr = 48000
      else if (br.includes('40,000')) btuHr = 40000
      else if (br.includes('20,000')) btuHr = 20000
      else if (br.includes('15,000')) btuHr = 15000

      const dailyHours = asNum(v.dailyUseHours, 1.0)
      const totalBurnHours = totalBtu / btuHr
      const daysOfUse = totalBurnHours / dailyHours

      return [
        res('Continuous Burn Time', `${numD(totalBurnHours, 1)} hours`, 'good', 'At specified burn rate'),
        res('Calendar Days Remaining', `${numD(daysOfUse, 1)} days`, daysOfUse < 7 ? 'warn' : 'good', `@ ${dailyHours} hrs/day`),
        res('Fuel Consumption Rate', `${numD(btuHr / 21548, 2)} lbs/hr`, 'neutral', 'Propane burn rate'),
        res('Tank Capacity', ts.split('(')[0].trim(), 'info', `${num(totalBtu)} BTU total`),
      ]
    },
  },
  {
    id: 'lpg-cylinder-duration-calculator',
    name: 'LPG Cylinder Duration Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate how many weeks a 14.2 kg or 19 kg domestic LPG cooking cylinder will last for your household size.',
    tip: 'Average domestic LPG consumption for a family of 4 cooking 3 fresh meals daily is roughly 14.2 kg every 30 to 35 days.',
    usage: [
      'Select LPG cylinder net weight (14.2 kg domestic, 19 kg commercial, 5 kg mini).',
      'Enter number of family members and daily meals cooked.',
      'Check expected refill replacement date and monthly cooking fuel expense.',
    ],
    method: [
      'Average cooking LPG demand = ~0.11 kg to 0.14 kg per person per day.',
      'Days Duration = Cylinder Weight (kg) / Daily Consumption (kg).',
    ],
    fields: [
      sel('cylinderWeight', 'LPG Cylinder Net Weight', [
        '14.2 kg Standard Domestic Cylinder',
        '19.0 kg Commercial / Large Household',
        '5.0 kg Mini / Small Cylinder',
        '11.8 kg Composite Cylinder',
      ], '14.2 kg Standard Domestic Cylinder'),
      n('people', 'Number of Household Members', { def: 4, min: 1, max: 12, step: 1 }),
      sel('cookingIntensity', 'Cooking Frequency & Intensity', [
        'Light (Quick breakfasts, eat out frequently ~0.08 kg/person/day)',
        'Standard (3 home-cooked meals daily ~0.12 kg/person/day)',
        'Heavy (Baking, slow simmering, tea multiple times ~0.16 kg/person/day)',
      ], 'Standard (3 home-cooked meals daily ~0.12 kg/person/day)'),
      n('cylinderCost', 'Refill Cost of Cylinder ($)', { def: 18, min: 5, max: 80, step: 1 }),
    ],
    compute: (v) => {
      const cw = asSel(v.cylinderWeight)
      const kg = cw.includes('19.0') ? 19.0 : cw.includes('5.0') ? 5.0 : cw.includes('11.8') ? 11.8 : 14.2
      const people = asNum(v.people, 4)
      const ci = asSel(v.cookingIntensity)
      const factor = ci.includes('Light') ? 0.08 : ci.includes('Heavy') ? 0.16 : 0.12
      const cost = asNum(v.cylinderCost, 18)

      const dailyKg = people * factor
      const durationDays = kg / dailyKg
      const durationWeeks = durationDays / 7
      const monthlyCost = (30.4 / durationDays) * cost

      return [
        res('Expected Duration', `${numD(durationDays, 0)} days`, durationDays < 20 ? 'warn' : 'good', `~${numD(durationWeeks, 1)} weeks`),
        res('Daily Fuel Burn', `${numD(dailyKg, 2)} kg/day`, 'info', `${people} people household`),
        res('Monthly Fuel Expense', money(monthlyCost), 'good', 'Estimated cooking gas cost'),
        res('Refills Required / Year', `${numD(365 / durationDays, 1)} cylinders`, 'neutral', 'Annual refill frequency'),
      ]
    },
  },
  {
    id: 'internet-data-usage-calculator',
    name: 'Internet Data Usage Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Estimate your household monthly internet data consumption to pick the right ISP data cap and avoid throttle penalties.',
    tip: '4K video streaming consumes about 7 GB per hour, compared to only 1.5 GB per hour for standard 1080p HD.',
    usage: [
      'Enter daily hours of 4K and HD video streaming.',
      'Enter daily gaming and video call hours.',
      'Review total monthly gigabyte demand against 1.2 TB ISP data caps.',
    ],
    method: [
      '4K Stream = 7.0 GB/hr. 1080p HD Stream = 2.0 GB/hr.',
      'Video Calls (Zoom/Teams) = 1.2 GB/hr. Online Gaming = 0.15 GB/hr (plus game downloads).',
    ],
    fields: [
      n('stream4k', '4K Ultra-HD Streaming (Hours/Day for House)', { def: 3, min: 0, max: 20, step: 0.5 }),
      n('streamHd', '1080p HD Streaming (Hours/Day for House)', { def: 4, min: 0, max: 30, step: 1 }),
      n('videoCalls', 'Work/School Video Meetings (Hours/Day)', { def: 3, min: 0, max: 20, step: 0.5 }),
      n('gamingHours', 'Online Multiplayer Gaming (Hours/Day)', { def: 2, min: 0, max: 20, step: 0.5 }),
      n('monthlyDownloads', 'Game / Large File Downloads (GB/Month)', { def: 120, min: 0, max: 1500, step: 20 }),
    ],
    compute: (v) => {
      const h4k = asNum(v.stream4k, 3)
      const hHd = asNum(v.streamHd, 4)
      const hCalls = asNum(v.videoCalls, 3)
      const hGame = asNum(v.gamingHours, 2)
      const dl = asNum(v.monthlyDownloads, 120)

      const dailyGb = (h4k * 7.0) + (hHd * 2.0) + (hCalls * 1.2) + (hGame * 0.15)
      const monthlyGb = (dailyGb * 30.4) + dl
      const capPct = (monthlyGb / 1228) * 100 // 1.2 TB standard Comcast cap

      return [
        res('Monthly Data Demand', `${num(Math.round(monthlyGb))} GB`, monthlyGb > 1100 ? 'bad' : monthlyGb > 800 ? 'warn' : 'good', `${numD(monthlyGb / 1024, 2)} Terabytes`),
        res('Daily Average Usage', `${numD(dailyGb, 1)} GB/day`, 'info', 'Streaming + conferencing'),
        res('1.2 TB Data Cap Status', `${Math.round(capPct)}% of cap`, capPct > 90 ? 'bad' : 'good', capPct > 100 ? 'Overage fees imminent' : 'Safe within limit'),
        res('Streaming Share', pct(((dailyGb * 30.4 * ((h4k * 7 + hHd * 2) / Math.max(1, dailyGb))) / monthlyGb) * 100), 'neutral', 'Largest data consumer'),
      ]
    },
  },
  {
    id: 'household-internet-cost-splitter',
    name: 'Household Internet Cost Splitter',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Fairly divide high-speed fiber or cable internet bills among roommates based on equal split or bandwidth intensity.',
    tip: 'When one roommate works from home with heavy cloud transfers or 4K streaming, an activity-weighted split prevents friction.',
    usage: [
      'Enter total monthly internet invoice amount.',
      'Enter number of roommates or household users.',
      'Select split methodology (equal division or usage tier).',
      'View individual monthly pay shares.',
    ],
    method: [
      'Equal: Bill / Roommates.',
      'Weighted: Base fee (50%) split equally + usage fee (50%) split by device/work-from-home factor.',
    ],
    fields: [
      n('totalBill', 'Total Monthly Internet Bill ($)', { def: 79.99, min: 20, max: 300, step: 1 }),
      n('roommates', 'Number of Contributing Roommates', { def: 3, min: 2, max: 8, step: 1 }),
      sel('splitMode', 'Cost Allocation Method', [
        'Equal Split (Exact even division)',
        'WFH Split (Heavy remote workers pay 1.25x share)',
        'Device Tiered (Proportional to connected active devices)',
      ], 'Equal Split (Exact even division)'),
    ],
    compute: (v) => {
      const bill = asNum(v.totalBill, 79.99)
      const count = asNum(v.roommates, 3)
      const mode = asSel(v.splitMode)

      const evenShare = bill / count

      if (mode.includes('Equal')) {
        return [
          res('Each Person Pays', money(evenShare), 'good', `${count} equal shares`),
          res('Monthly Total', money(bill), 'neutral', 'Invoice total'),
          res('Annual Cost per Person', money(evenShare * 12), 'info', 'Yearly contribution'),
          res('Allocation Method', '100% Equal', 'good', 'Zero dispute split'),
        ]
      } else if (mode.includes('WFH')) {
        // Assume 1 person WFH (1.25x weight) and (count - 1) standard (1.0x weight)
        const totalWeight = 1.25 + (count - 1)
        const unitShare = bill / totalWeight
        const wfhShare = unitShare * 1.25
        const stdShare = unitShare

        return [
          res('Standard Roommate Share', money(stdShare), 'good', `${count - 1} roommates`),
          res('WFH / Heavy User Share', money(wfhShare), 'warn', '1 heavy user (1.25x ratio)'),
          res('Monthly Total', money(bill), 'neutral', 'Full invoice cleared'),
          res('Fairness Premium', money(wfhShare - stdShare), 'info', 'Added for high bandwidth demand'),
        ]
      } else {
        return [
          res('Base Person Share', money(evenShare), 'good', 'Equal baseline'),
          res('Monthly Total', money(bill), 'neutral', 'Full bill amount'),
          res('Split Recommendation', 'Log router MAC devices or split evenly', 'info', 'Transparent device tracking'),
          res('Per Diem Cost', money(evenShare / 30.4), 'neutral', 'Daily cost per person'),
        ]
      }
    },
  },
  {
    id: 'utility-consumption-comparison',
    name: 'Utility Consumption Comparison',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Compare your electric, gas, water, and trash consumption against national and regional household benchmarks.',
    tip: 'Heating, cooling, and water heating account for over 65% of the average single-family home’s utility outlays.',
    usage: [
      'Enter your monthly electric (kWh), gas (therms), and water (gallons).',
      'Select your home size and occupancy.',
      'Check whether your home consumes above or below energy efficiency benchmarks.',
    ],
    method: [
      'Compares user values against EIA (Energy Information Administration) and EPA WaterSense averages.',
    ],
    fields: [
      n('monthlyKwh', 'Monthly Electricity Usage (kWh)', { def: 850, min: 100, max: 4000, step: 25 }),
      n('monthlyTherms', 'Monthly Gas Usage (Therms)', { def: 55, min: 0, max: 300, step: 5 }),
      n('monthlyWaterGal', 'Monthly Water Usage (Gallons)', { def: 6000, min: 500, max: 35000, step: 250 }),
      n('occupants', 'Household Occupants', { def: 3, min: 1, max: 10, step: 1 }),
    ],
    compute: (v) => {
      const kwh = asNum(v.monthlyKwh, 850)
      const therms = asNum(v.monthlyTherms, 55)
      const water = asNum(v.monthlyWaterGal, 6000)
      const people = asNum(v.occupants, 3)

      const benchmarkKwh = 300 * people + 250
      const benchmarkWater = 1800 * people
      const benchmarkTherms = 20 * people

      const kwhScore = kwh <= benchmarkKwh ? 'Efficient' : 'Higher than Average'
      const waterScore = water <= benchmarkWater ? 'Water-Saving' : 'High Consumption'

      return [
        res('Electricity Benchmark', `${num(kwh)} vs ~${num(benchmarkKwh)} kWh avg`, kwh <= benchmarkKwh ? 'good' : 'warn', kwhScore),
        res('Water Benchmark', `${num(water)} vs ~${num(benchmarkWater)} gal avg`, water <= benchmarkWater ? 'good' : 'warn', waterScore),
        res('Natural Gas Benchmark', `${num(therms)} vs ~${num(benchmarkTherms)} therms avg`, therms <= benchmarkTherms ? 'good' : 'neutral', `${therms} therms`),
        res('Overall Efficiency Grade', kwh <= benchmarkKwh && water <= benchmarkWater ? 'Grade A (Resource Efficient)' : 'Grade B (Optimization Opportunities)', 'good', 'Based on EIA standards'),
      ]
    },
  },
  {
    id: 'utility-budget-forecast',
    name: 'Utility Budget Forecast',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Consolidate all monthly utilities (electric, gas, water, trash, internet) into a complete 12-month budget forecast.',
    tip: 'Setting aside an annualized 1/12th equal utility reserve prevents winter heating and summer cooling bill spikes.',
    usage: [
      'Enter baseline monthly expenses for electricity, natural gas, water/sewer, internet, and trash.',
      'Check annualized utility liability, monthly levelized average, and seasonal variance buffer.',
    ],
    method: [
      'Total Annual = (Sum of base monthly * 12) + Summer AC Buffer + Winter Heat Buffer.',
      'Levelized Monthly Budget = Total Annual / 12.',
    ],
    fields: [
      n('electricBase', 'Average Monthly Electric ($)', { def: 135, min: 20, max: 800, step: 5 }),
      n('gasBase', 'Average Monthly Natural Gas ($)', { def: 65, min: 0, max: 500, step: 5 }),
      n('waterBase', 'Average Monthly Water/Sewer ($)', { def: 75, min: 10, max: 400, step: 5 }),
      n('internetBase', 'Monthly Internet / WiFi ($)', { def: 75, min: 20, max: 200, step: 5 }),
      n('trashBase', 'Monthly Trash / Recycling ($)', { def: 35, min: 0, max: 150, step: 5 }),
      n('seasonalBufferPct', 'Seasonal Weather Variance Buffer (%)', { def: 15, min: 0, max: 35, step: 5 }),
    ],
    compute: (v) => {
      const elec = asNum(v.electricBase, 135)
      const gas = asNum(v.gasBase, 65)
      const water = asNum(v.waterBase, 75)
      const net = asNum(v.internetBase, 75)
      const trash = asNum(v.trashBase, 35)
      const buffer = asNum(v.seasonalBufferPct, 15) / 100

      const monthlyBaseTotal = elec + gas + water + net + trash
      const annualBase = monthlyBaseTotal * 12
      const seasonalSurge = (elec + gas) * 4 * buffer // 4 peak seasonal months
      const annualTotal = annualBase + seasonalSurge
      const levelizedMonthly = annualTotal / 12

      return [
        res('Levelized Monthly Utility Budget', money(levelizedMonthly), 'good', 'Recommended steady monthly transfer'),
        res('Base Monthly Minimum', money(monthlyBaseTotal), 'neutral', 'Mild season baseline'),
        res('Total Annual Utility Cost', money(annualTotal), 'info', 'All 5 utility categories'),
        res('Peak Month Projected Bill', money(monthlyBaseTotal + (elec + gas) * buffer), 'warn', 'Summer/Winter weather peak'),
      ]
    },
  },
]
