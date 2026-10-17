import {
  type HouseholdSpec,
  T,
  n,
  sel,
  res,
  doc,
  asNum,
  asSel,
  money,
  moneyC,
  pct,
  num,
  numD,
} from './householdSpec'

const SUB = 'Laundry'
const SUB_ID = 'laundry'

export const laundrySpecs: HouseholdSpec[] = [
  {
    id: 'laundry-cost-per-load-calculator',
    name: 'Laundry Cost per Load Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate the total cost of running a single load of laundry including detergent, electricity, and water.',
    tip: 'Washing in cold water (30°C/85°F) saves up to 75% of a washing cycle’s electricity, as 90% of energy goes to heating water.',
    usage: [
      'Enter the cost per detergent pod or liquid dose.',
      'Input local electricity and water rates.',
      'Specify whether you use an electric tumble dryer or air-dry.',
    ],
    method: [
      'Averages washing machine draw at ~0.6 kWh (cold) to ~1.8 kWh (hot).',
      'Calculates water cost assuming ~14 gallons per high-efficiency cycle or 30 gallons for top-loader.',
      'Adds electric dryer consumption of ~3.0 kWh per cycle if selected.',
    ],
    fields: [
      n('detergentCost', 'Detergent Cost per Load ($)', { def: 0.25, min: 0.05, max: 2, step: 0.05 }),
      sel('waterTemp', 'Wash Water Temperature', ['Cold (20°C - 30°C)', 'Warm (40°C)', 'Hot / Sanitary (60°C)'], 'Cold (20°C - 30°C)'),
      sel('dryingMethod', 'Drying Method', ['Line / Rack Air Drying ($0)', 'Tumble Dryer (Electric)', 'Tumble Dryer (Gas)'], 'Tumble Dryer (Electric)'),
      n('kwhRate', 'Electricity Rate ($/kWh)', { def: 0.16, min: 0.05, max: 0.7, step: 0.01 }),
    ],
    compute: (v) => {
      const detergent = asNum(v.detergentCost)
      const temp = asSel(v.waterTemp)
      const dryer = asSel(v.dryingMethod)
      const kwhRate = asNum(v.kwhRate)

      const washerKwh = temp.startsWith('Cold') ? 0.35 : temp.startsWith('Warm') ? 0.9 : 1.8
      const dryerKwh = dryer.includes('Electric') ? 3.2 : dryer.includes('Gas') ? 0.6 : 0
      const gasCost = dryer.includes('Gas') ? 0.35 : 0

      const electricityCost = (washerKwh + dryerKwh) * kwhRate
      const waterCost = 0.10
      const totalLoadCost = detergent + electricityCost + waterCost + gasCost

      return [
        res('Cost per Load', moneyC(totalLoadCost), totalLoadCost > 1.0 ? T.warn : T.good, `${moneyC(detergent)} soap + ${moneyC(electricityCost)} energy + ${moneyC(waterCost)} water`),
        res('Energy Share', pct((electricityCost / totalLoadCost) * 100, 0), electricityCost > 0.5 ? T.warn : T.good),
        res('Cost for 5 Loads/Week', money(totalLoadCost * 5 * 52) + '/year', T.neutral, 'Annualized household cost'),
      ]
    },
  },
  {
    id: 'laundry-loads-per-week-calculator',
    name: 'Laundry Loads per Week Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Estimate your household’s weekly laundry loads based on family members, workout frequency, and linens.',
    tip: 'Wait until you have a full drum before washing—running half-empty loads doubles your annual water and energy usage.',
    usage: [
      'Enter the number of adults, children, and weekly gym sessions.',
      'Check bed sheet and towel change frequency.',
      'Get estimated loads per week and a recommended washing schedule.',
    ],
    method: [
      'Applies ~1.2 loads per adult/week for clothes, 1.5 loads per young child, plus 0.2 loads per fitness workout.',
      'Adds 1 load per 2 beds for sheets and 1 load for bath towels.',
    ],
    fields: [
      n('adults', 'Number of Adults', { def: 2, min: 1, max: 10 }),
      n('children', 'Number of Children', { def: 1, min: 0, max: 10 }),
      n('gymWorkouts', 'Weekly Gym / Sports Sessions', { def: 4, min: 0, max: 30 }),
      n('beds', 'Number of Beds to Wash', { def: 2, min: 1, max: 8 }),
    ],
    compute: (v) => {
      const a = asNum(v.adults)
      const c = asNum(v.children)
      const g = asNum(v.gymWorkouts)
      const b = asNum(v.beds)

      const clothingLoads = (a * 1.2) + (c * 1.5) + (g * 0.15)
      const linenLoads = (b * 0.5) + (a * 0.3)
      const totalLoads = Math.ceil(clothingLoads + linenLoads)

      return [
        res('Estimated Weekly Loads', `${totalLoads} loads/week`, totalLoads > 7 ? T.warn : T.good, `~${numD(clothingLoads, 1)} clothes + ${numD(linenLoads, 1)} linens/towels`),
        res('Monthly Total', `${totalLoads * 4} loads`, T.neutral),
        res('Recommended Frequency', totalLoads <= 3 ? '1 laundry day per week' : totalLoads <= 6 ? '2 days per week (e.g. Wed & Sun)' : '1 load daily', T.good),
      ]
    },
  },
  {
    id: 'laundry-electricity-cost-estimator',
    name: 'Laundry Electricity Cost Estimator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Compare electric costs across different wash temperatures and spin speeds.',
    tip: 'High-speed spin cycles (1400+ RPM) remove 40% more moisture, cutting electric dryer time in half.',
    usage: [
      'Enter your local kWh cost and weekly cycle count.',
      'Review estimated electric bills across cold, warm, and hot settings.',
    ],
    method: [
      'Cold cycle: ~0.35 kWh. Warm (40°C): ~0.95 kWh. Hot (60°C): ~1.9 kWh.',
    ],
    fields: [
      n('kwhPrice', 'Electricity Price ($/kWh)', { def: 0.16, min: 0.05, max: 0.8, step: 0.01 }),
      n('weeklyLoads', 'Weekly Loads', { def: 5, min: 1, max: 25 }),
    ],
    compute: (v) => {
      const price = asNum(v.kwhPrice)
      const loads = asNum(v.weeklyLoads)

      const coldAnnual = 52 * loads * 0.35 * price
      const warmAnnual = 52 * loads * 0.95 * price
      const hotAnnual = 52 * loads * 1.90 * price

      return [
        res('Cold Wash (Annual)', money(coldAnnual), T.good, 'Using ambient water'),
        res('Warm 40°C (Annual)', money(warmAnnual), T.neutral, 'Standard everyday setting'),
        res('Hot 60°C (Annual)', money(hotAnnual), T.warn, 'Sanitary / whites setting'),
        res('Cold Switch Savings', money(warmAnnual - coldAnnual) + '/yr', T.good, 'Switching all warm loads to cold'),
      ]
    },
  },
  {
    id: 'laundry-water-cost-estimator',
    name: 'Laundry Water Cost Estimator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Estimate water consumption and cost differences between front-load and top-load washers.',
    tip: 'Front-load washing machines use gravity to tumble clothes through shallow water, using 50% less water than top-loaders.',
    usage: [
      'Select machine type (Front Loader vs Standard Top Loader).',
      'Enter weekly loads and local water rate.',
    ],
    method: [
      'Front-loader consumes ~14 gallons per load; Top-loader consumes ~35 gallons per load.',
    ],
    fields: [
      sel('washerType', 'Washer Mechanism', ['Front Load (HE - High Efficiency)', 'Top Load (HE Impeller)', 'Traditional Top Load (Agitator)'], 'Front Load (HE - High Efficiency)'),
      n('loadsPerWeek', 'Loads per Week', { def: 5, min: 1, max: 30 }),
      n('waterRate', 'Water Rate ($ per 1,000 Gallons)', { def: 6.50, min: 1, max: 30, step: 0.5 }),
    ],
    compute: (v) => {
      const type = asSel(v.washerType)
      const loads = asNum(v.loadsPerWeek)
      const rate = asNum(v.waterRate)

      const galPerLoad = type.startsWith('Front') ? 14 : type.includes('Impeller') ? 22 : 38
      const annualGal = loads * galPerLoad * 52
      const annualCost = (annualGal / 1000) * rate

      return [
        res('Gallons per Load', `${galPerLoad} gal`, type.startsWith('Front') ? T.good : T.warn),
        res('Annual Water Usage', `${num(annualGal)} gal`, T.neutral, `${loads} loads weekly`),
        res('Annual Water Cost', money(annualCost), annualCost > 40 ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'clothes-drying-cost-calculator',
    name: 'Clothes Drying Cost Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Compare the cost of electric tumble drying, gas drying, and natural air drying over a year.',
    tip: 'Using wool dryer balls reduces tumble drying time by 20% by separating clothes and absorbing humidity.',
    usage: [
      'Input loads dried per week and electricity cost.',
      'See how much money and carbon you save by line-drying a portion of your laundry.',
    ],
    method: [
      'Calculates ~3.3 kWh per electric dry cycle vs zero energy for rack line drying.',
    ],
    fields: [
      n('loadsPerWeek', 'Dryer Cycles per Week', { def: 5, min: 1, max: 25 }),
      n('kwhRate', 'Electricity Rate ($/kWh)', { def: 0.16, min: 0.05, max: 0.7, step: 0.01 }),
      sel('rackShare', 'Portion Air-Dried', ['0% (Dryer only)', '25% on rack', '50% on rack', '100% Air-dried'], '50% on rack'),
    ],
    compute: (v) => {
      const loads = asNum(v.loadsPerWeek)
      const rate = asNum(v.kwhRate)
      const rack = asSel(v.rackShare)

      const rackPct = rack.startsWith('0') ? 0 : rack.startsWith('25') ? 0.25 : rack.startsWith('50') ? 0.50 : 1.0
      const annualFullDryer = loads * 52 * 3.3 * rate
      const actualCost = annualFullDryer * (1 - rackPct)
      const savings = annualFullDryer - actualCost

      return [
        res('Projected Drying Cost', money(actualCost) + '/yr', actualCost > 100 ? T.warn : T.good, `${pct(rackPct * 100, 0)} air-dried`),
        res('Annual Money Saved', money(savings), T.good, 'Savings from rack drying'),
        res('Full Dryer Cost (100%)', money(annualFullDryer) + '/yr', T.neutral, 'If all loads were tumble dried'),
      ]
    },
  },
  {
    id: 'drying-rack-capacity-calculator',
    name: 'Drying Rack Capacity Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Check how many shirts, pants, and smalls fit on your folding drying rack.',
    tip: 'Hang shirts upside down by the bottom hem to avoid clothespin shoulder marks.',
    usage: [
      'Enter the linear feet or meters of your drying rack.',
      'Check garment capacity and recommended spacing.',
    ],
    method: [
      'Calculates ~1.5 linear feet per adult top/trousers and 0.5 linear feet per underwear/socks item.',
    ],
    fields: [
      n('linearFeet', 'Total Rack Rail Length (feet)', { def: 40, min: 10, max: 120, step: 5 }),
    ],
    compute: (v) => {
      const feet = asNum(v.linearFeet)
      const largeItems = Math.floor(feet * 0.45)
      const smallItems = Math.floor((feet - (largeItems * 1.5)) / 0.5)

      return [
        res('Total Rail Length', `${feet} ft (~${numD(feet * 0.3048, 1)} m)`, T.neutral),
        res('Large Items Capacity', `~${largeItems} shirts / pants`, T.good, 'Spaced 2-3 inches apart for airflow'),
        res('Small Items Capacity', `~${Math.max(0, smallItems)} socks / undergarments`, T.good),
      ]
    },
  },
  {
    id: 'laundry-basket-capacity-calculator',
    name: 'Laundry Basket Capacity Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Match hamper basket capacity to washing machine drum size to avoid overloading.',
    tip: 'Your palm should easily fit vertically above clothes in the drum—if you have to force your hand in, it is overloaded.',
    usage: [
      'Enter your laundry basket volume in liters or bushels.',
      'Input your washing machine drum capacity in kilograms or cubic feet.',
    ],
    method: [
      'Standard laundry weighs approximately ~0.12 kg per liter when loosely packed.',
    ],
    fields: [
      n('basketLiters', 'Laundry Basket Size (Liters)', { def: 55, min: 20, max: 150, step: 5 }),
      n('washerKg', 'Washer Capacity (kg dry weight)', { def: 8, min: 4, max: 16, step: 0.5 }),
    ],
    compute: (v) => {
      const liters = asNum(v.basketLiters)
      const washerKg = asNum(v.washerKg)

      const estimatedWeightKg = liters * 0.12
      const capacityRatio = (estimatedWeightKg / washerKg) * 100

      const status = capacityRatio > 105 ? 'Overloaded (Split into 2 loads)' : capacityRatio > 85 ? 'Perfect Full Load' : 'Partial Load'
      const tone = capacityRatio > 105 ? T.bad : capacityRatio > 85 ? T.good : T.neutral

      return [
        res('Load Match', status, tone),
        res('Estimated Weight', `~${numD(estimatedWeightKg, 1)} kg (${numD(estimatedWeightKg * 2.2, 1)} lbs)`, T.neutral),
        res('Drum Fill Percentage', pct(capacityRatio, 0), tone, `Max drum capacity: ${washerKg} kg`),
      ]
    },
  },
  {
    id: 'clothing-care-label-guide',
    name: 'Clothing Care Label Guide',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Decode international laundry wash symbols, dry cleaning codes, and ironing dots.',
    tip: 'A wash tub symbol with a single bar underneath means Permanent Press (gentle agitation); two bars means Delicates.',
    usage: [
      'Select the symbol type you are inspecting on your garment tag.',
      'Read the exact washing, bleaching, or ironing instructions.',
    ],
    method: [
      'Standard ISO / ASTM laundry label dictionary lookups.',
    ],
    fields: [
      sel('symbolCategory', 'Tag Symbol Group', [
        'Wash Tub with Dots (Temperature)',
        'Wash Tub with Underlines (Cycle)',
        'Triangle (Bleach)',
        'Square with Circle (Tumble Dry)',
        'Iron with Dots (Heat Level)',
        'Circle (Dry Clean)',
      ], 'Wash Tub with Dots (Temperature)'),
    ],
    compute: (v) => {
      const cat = asSel(v.symbolCategory)

      const explanations: Record<string, string> = {
        'Wash Tub with Dots (Temperature)': '• 1 Dot: Cold (30°C / 85°F)\n• 2 Dots: Warm (40°C / 105°F)\n• 3 Dots: Hot (50°C / 120°F)\n• 4 Dots: Very Hot (60°C / 140°F)\n• Hand in tub: Hand wash only (max 40°C)\n• Tub with X: Do not wash in water',
        'Wash Tub with Underlines (Cycle)': '• No bar: Normal / cotton cycle (full agitation & spin)\n• One bar underneath: Permanent Press (reduced agitation to prevent wrinkles)\n• Two bars underneath: Gentle / Delicate cycle (slow spin for fragile fabrics)',
        'Triangle (Bleach)': '• Clear Triangle: Any bleach (chlorine or non-chlorine) allowed\n• Triangle with diagonal stripes: Only non-chlorine (oxygen) bleach allowed\n• Solid black triangle or triangle with X: Do NOT bleach under any circumstances',
        'Square with Circle (Tumble Dry)': '• 1 Dot in circle: Low heat tumble dry\n• 2 Dots: Medium heat\n• 3 Dots: High heat\n• Solid circle or X over symbol: Do NOT tumble dry\n• Square with curved top line: Line dry in sun\n• Square with horizontal line: Dry flat (essential for wool knits)',
        'Iron with Dots (Heat Level)': '• 1 Dot: Cool iron (max 110°C / 230°F) for nylon, acrylic, acetate\n• 2 Dots: Medium iron (max 150°C / 300°F) for polyester, silk, wool\n• 3 Dots: Hot iron (max 200°C / 390°F) for cotton and linen\n• Iron with steam crossed out: Dry iron only, no steam',
        'Circle (Dry Clean)': '• Circle: Professional dry clean\n• Circle with X: Do NOT dry clean\n• Letter inside circle (P, F, A): Specific solvent requirements for dry cleaner',
      }

      const text = explanations[cat] ?? 'Follow tag instructions carefully.'

      return [
        res('Selected Group', cat.split('(')[0].trim(), T.good),
        doc('Symbol Explanations', text),
      ]
    },
  },
  {
    id: 'fabric-shrinkage-estimator',
    name: 'Fabric Shrinkage Estimator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Estimate the shrinkage risk percentage for cotton, wool, linen, and synthetic fabrics.',
    tip: 'Wool shrinks due to felting—the tiny microscopic scales on wool fibers lock together when agitated in warm water.',
    usage: [
      'Select the primary fabric fiber.',
      'Choose wash temperature and drying method.',
      'Check predicted shrinkage rate and prevention advice.',
    ],
    method: [
      'Calculates shrinkage curves based on fiber hygroscopic swelling and thermal contraction.',
    ],
    fields: [
      sel('fiber', 'Fabric Fiber', ['100% Cotton (Unwashed)', '100% Wool / Cashmere', 'Linen', 'Rayon / Viscose', 'Polyester / Nylon', 'Cotton-Poly Blend (50/50)'], '100% Cotton (Unwashed)'),
      sel('waterTemp', 'Wash Temperature', ['Cold (30°C)', 'Warm (40°C)', 'Hot (60°C+)'], 'Warm (40°C)'),
      sel('dryHeat', 'Drying Method', ['Tumble Dry High Heat', 'Tumble Dry Low Heat', 'Air Dry Flat / Line'], 'Tumble Dry High Heat'),
    ],
    compute: (v) => {
      const fiber = asSel(v.fiber)
      const temp = asSel(v.waterTemp)
      const dry = asSel(v.dryHeat)

      let shrink = 2
      if (fiber.includes('Cotton')) shrink = temp.includes('Hot') ? 8 : temp.includes('Warm') ? 5 : 3
      if (fiber.includes('Wool')) shrink = dry.includes('Air') ? 4 : 20
      if (fiber.includes('Rayon')) shrink = dry.includes('High') ? 9 : 4
      if (fiber.includes('Linen')) shrink = dry.includes('High') ? 7 : 3
      if (fiber.includes('Polyester')) shrink = 1

      if (dry.includes('High')) shrink += 2

      const risk = shrink >= 8 ? T.bad : shrink >= 4 ? T.warn : T.good

      return [
        res('Predicted Shrinkage', `~${shrink}%`, risk, `${shrink >= 6 ? 'High risk' : 'Manageable risk'}`),
        res('Garment Impact', shrink >= 8 ? 'Can shrink up to 1 full clothing size' : shrink >= 4 ? 'Slight snugness across chest/sleeves' : 'Minimal noticeable size change', risk),
        res('Best Prevention', fiber.includes('Wool') ? 'Hand wash cold & dry flat on towel' : 'Wash cold and air-dry on hanger', T.neutral),
      ]
    },
  },
  {
    id: 'fabric-weight-calculator',
    name: 'Fabric Weight Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate the total dry weight of clothes and towels to ensure you stay within your washer’s rating.',
    tip: 'A single plush bath sheet can weigh over 800 grams when dry and over 2.5 kg when water-logged.',
    usage: [
      'Input the count of jeans, t-shirts, towels, and bedsheets.',
      'Check total dry weight against standard machine capacities.',
    ],
    method: [
      'Standard item dry weights: Jeans (700g), T-Shirt (200g), Bath Sheet (750g), Queen Bedsheet (600g).',
    ],
    fields: [
      n('jeans', 'Pairs of Jeans / Heavy Trousers', { def: 3, min: 0, max: 15 }),
      n('tshirts', 'T-Shirts / Tops', { def: 8, min: 0, max: 30 }),
      n('towels', 'Bath Towels', { def: 3, min: 0, max: 12 }),
      n('sheets', 'Bedsheets / Duvet Covers', { def: 2, min: 0, max: 8 }),
    ],
    compute: (v) => {
      const jeans = asNum(v.jeans) * 0.70
      const shirts = asNum(v.tshirts) * 0.20
      const towels = asNum(v.towels) * 0.75
      const sheets = asNum(v.sheets) * 0.65

      const totalKg = jeans + shirts + towels + sheets
      const totalLbs = totalKg * 2.20462

      return [
        res('Total Dry Weight', `${numD(totalKg, 1)} kg (${numD(totalLbs, 1)} lbs)`, T.good),
        res('Ideal Washer Size', totalKg <= 7 ? 'Standard 7-8 kg drum' : totalKg <= 10 ? 'Large 9-10 kg drum' : 'Split into 2 separate loads', totalKg > 10 ? T.warn : T.good),
        res('Weight Breakdown', `${numD(towels + sheets, 1)} kg linens + ${numD(jeans + shirts, 1)} kg clothes`, T.neutral),
      ]
    },
  },
  {
    id: 'washing-machine-cycle-cost-calculator',
    name: 'Washing Machine Cycle Cost Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Compare cost, water, and duration differences between Quick 15m, Eco, and Heavy Duty cycles.',
    tip: 'Eco cycles take longer (2.5+ hours) but use cooler water and slow drum soaking, consuming 35% less energy than quick hot washes.',
    usage: [
      'Select candidate cycle and enter your local electricity rate.',
      'See exact cost per cycle and annual projection.',
    ],
    method: [
      'Eco cycle: 0.65 kWh. Quick 15m: 0.45 kWh. Heavy Duty 60°C: 2.1 kWh.',
    ],
    fields: [
      sel('cycle', 'Select Washer Cycle', ['Eco 40-60 (Slow soak, low heat)', 'Quick 15 / Rapid 30', 'Standard Cotton 40°C', 'Heavy Duty / Hygiene 60°C'], 'Eco 40-60 (Slow soak, low heat)'),
      n('kwhRate', 'Electricity Price ($/kWh)', { def: 0.16, min: 0.05, max: 0.7, step: 0.01 }),
    ],
    compute: (v) => {
      const cycle = asSel(v.cycle)
      const rate = asNum(v.kwhRate)

      let kwh = 0.65
      let durationMins = 160
      if (cycle.startsWith('Quick')) { kwh = 0.45; durationMins = 25 }
      else if (cycle.startsWith('Standard')) { kwh = 1.10; durationMins = 90 }
      else if (cycle.startsWith('Heavy')) { kwh = 2.10; durationMins = 140 }

      const electricityCost = kwh * rate
      const waterAndSoap = 0.35
      const totalCycleCost = electricityCost + waterAndSoap

      return [
        res('Cost per Cycle', moneyC(totalCycleCost), totalCycleCost > 0.6 ? T.warn : T.good, `${kwh} kWh + water & detergent`),
        res('Cycle Duration', `${durationMins} minutes`, T.neutral),
        res('Annual Cost (4 loads/wk)', money(totalCycleCost * 4 * 52) + '/yr', T.neutral),
      ]
    },
  },
  {
    id: 'laundry-day-planner',
    name: 'Laundry Day Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Create a predictable, stress-free weekly laundry schedule that avoids weekend wash marathons.',
    tip: 'Do one dedicated load every Tuesday and Thursday so your weekend stays completely free of hampers.',
    usage: [
      'Select your preferred laundry rhythm (Single weekend sprint vs Mid-week split).',
      'Receive a day-by-day load allocation schedule.',
    ],
    method: [
      'Allocates darks, whites/lights, bedding, and towels into manageable individual days.',
    ],
    fields: [
      sel('cadence', 'Preferred Washing Rhythm', ['2-Day Midweek Split (Tue & Fri)', 'Dedicated Weekend Day (Saturday)', 'One Load Every Other Day'], '2-Day Midweek Split (Tue & Fri)'),
    ],
    compute: (v) => {
      const cadence = asSel(v.cadence)

      let schedule: string[] = []
      if (cadence.startsWith('2-Day')) {
        schedule = [
          '• TUESDAY MORNING: Clothes (Darks & Colors) — Wash at 30°C, hang or dry by noon.',
          '• TUESDAY EVENING: 10-minute quick fold & wardrobe put away.',
          '• FRIDAY MORNING: Bed linens & Pillowcases — Wash hot at 60°C.',
          '• FRIDAY AFTERNOON: Towels & Bath mats — Fast wash, high spin.',
          '• WEEKEND: 100% Free of laundry hampers!',
        ]
      } else if (cadence.startsWith('Dedicated')) {
        schedule = [
          '• SATURDAY 08:30 AM: Load 1 — Bed Sheets & Linens (Hot 60°C)',
          '• SATURDAY 10:30 AM: Load 2 — Darks & Everyday Clothes (Cold 30°C)',
          '• SATURDAY 01:00 PM: Load 3 — Lights & Whites (Warm 40°C)',
          '• SATURDAY 03:00 PM: Load 4 — Bath Towels & Kitchen Cloths (Hot)',
          '• SATURDAY 05:00 PM: 30-Minute Family Fold & Put Away Sprint',
        ]
      } else {
        schedule = [
          '• MONDAY: Darks & Jeans',
          '• WEDNESDAY: Whites & Light colors',
          '• FRIDAY: Bath towels & Hand towels',
          '• SUNDAY: Bedding & Pillowcases',
        ]
      }

      return [
        res('Selected Routine', cadence.split('(')[0].trim(), T.good),
        doc('Weekly Laundry Action Plan', schedule.join('\n')),
      ]
    },
  },
  {
    id: 'delicate-clothing-care-planner',
    name: 'Delicate Clothing Care Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Wash advice and temperature settings for silk, wool knits, lace, activewear, and bras.',
    tip: 'Never wring out wet wool or silk—roll them gently inside a clean dry bath towel like a sushi roll to press out water.',
    usage: [
      'Select delicate garment type.',
      'Check recommended detergent, water temp, and drying method.',
    ],
    method: [
      'Maps protein fibers (wool, silk) and synthetic elastane to appropriate enzymatic restrictions.',
    ],
    fields: [
      sel('garment', 'Delicate Garment Category', ['Silk Blouse / Pillowcase', 'Wool / Cashmere Sweater', 'Lace Undergarments & Bras', 'Spandex / Lycra Activewear'], 'Silk Blouse / Pillowcase'),
    ],
    compute: (v) => {
      const g = asSel(v.garment)

      const protocols: Record<string, string> = {
        'Silk Blouse / Pillowcase': '• WATER: Cold water (under 30°C)\n• SOAP: pH-neutral silk wash or baby shampoo (NO enzymes; protease dissolves silk proteins)\n• ACTION: Hand wash or mesh bag on delicate cycle\n• DRY: Lay flat on clean white towel away from direct sunlight',
        'Wool / Cashmere Sweater': '• WATER: Cold water strictly (temperature changes trigger felting)\n• SOAP: Wool-safe detergent without optical brighteners\n• ACTION: Soak for 10 mins without scrubbing or twisting\n• DRY: Roll in towel to absorb excess water; reshape and dry flat horizontally',
        'Lace Undergarments & Bras': '• WATER: Lukewarm or cold\n• SOAP: Mild gentle liquid detergent\n• ACTION: Always hook bra clasps and place in zippered wash net\n• DRY: Air hang by the center gore—never hang by straps as elastic stretches',
        'Spandex / Lycra Activewear': '• WATER: Cold wash\n• SOAP: Sport detergent (NO fabric softener; softener coats fibers and traps body odor)\n• DRY: Air dry only—dryer heat breaks down elastane stretch permanently',
      }

      return [
        res('Fabric Category', g, T.good),
        doc('Washing & Drying Protocol', protocols[g] ?? 'Handle gently in cold water.'),
      ]
    },
  },
  {
    id: 'white-clothes-care-guide',
    name: 'White Clothes Care Guide',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Restore yellowed white shirts, remove collar rings, and maintain crisp white brightness.',
    tip: 'Chlorine bleach reacts with human protein (sweat/body oils) and turns armpit areas permanently yellow. Use oxygen bleach instead.',
    usage: [
      'Select white garment issue (yellowing, dingy gray, or armpit sweat stains).',
      'Follow proven stain lifting and brightening protocols.',
    ],
    method: [
      'Applies sodium percarbonate (oxygen bleach) and enzymatic soaking principles.',
    ],
    fields: [
      sel('problem', 'Current Garment Issue', ['Underarm Sweat & Deodorant Yellowing', 'Overall Gray / Dingy Whites', 'Greasy Collar Ring', 'Accidental Color Bleed Transfer'], 'Underarm Sweat & Deodorant Yellowing'),
    ],
    compute: (v) => {
      const p = asSel(v.problem)

      let recipe = ''
      if (p.includes('Underarm')) {
        recipe = '1. Mix 1 part dish soap + 2 parts baking soda + 2 parts hydrogen peroxide into a paste.\n2. Rub generously into the yellow underarm stains with an old toothbrush.\n3. Let sit for 1 hour.\n4. Wash normally in warm water with oxygen bleach.'
      } else if (p.includes('Gray')) {
        recipe = '1. Fill a bucket with hot water and add 1 cup of sodium percarbonate (oxygen bleach powder).\n2. Submerge dingy whites completely for 4 to 6 hours (or overnight).\n3. Wash on standard cycle with an extra rinse.\n4. Dry in direct natural sunlight for free UV bleaching.'
      } else if (p.includes('Collar')) {
        recipe = '1. Rub concentrated liquid dish soap or shampoo directly onto the collar ring (human sebum oils).\n2. Allow to sit for 20 minutes.\n3. Wash in the warmest water safe for the fabric tag.'
      } else {
        recipe = '1. Do NOT dry the garment in the dryer (heat sets the transferred dye permanently).\n2. Soak immediately in cold water with a commercial color-run remover or oxygen bleach.\n3. Re-wash until dye transfer is fully lifted.'
      }

      return [
        res('Target Issue', p, T.warn),
        doc('Restoration Protocol', recipe),
      ]
    },
  },
  {
    id: 'dark-clothes-care-guide',
    name: 'Dark Clothes Care Guide',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Prevent black jeans, dark t-shirts, and navy fabrics from fading into dull gray.',
    tip: 'Always turn black clothes inside out before washing—this protects exterior fibers from drum abrasion which creates the white fuzzy fade.',
    usage: [
      'Review the 4 core golden rules of preserving dark garments.',
      'Check recommended wash parameters.',
    ],
    method: [
      'Fading is caused by dye bleed, alkaline detergents, and friction abrasion.',
    ],
    fields: [
      sel('fabricType', 'Garment Type', ['Black Denim Jeans', 'Dark Cotton T-Shirts', 'Navy / Black Work Trousers', 'Dark Bed Linens'], 'Black Denim Jeans'),
    ],
    compute: (v) => {
      const f = asSel(v.fabricType)

      const guide = [
        '1. TURN INSIDE OUT: Closes the outer dye surface away from the friction of other clothes.',
        '2. COLD WATER ONLY: Wash at 20°C - 30°C. Hot water opens cotton fibers and releases dye.',
        '3. LIQUID DETERGENT ONLY: Powder detergents leave cloudy white mineral films on darks.',
        '4. AVOID DRYER: Air-dry inside out away from direct harsh sun (UV light fades black dyes).',
        '5. VINEGAR RINSE: Adding 1/2 cup white vinegar to the fabric softener drawer helps set dark dyes.',
      ].join('\n')

      return [
        res('Selected Garment', f, T.good),
        doc('Dark Garment Preservation Rules', guide),
      ]
    },
  },
  {
    id: 'bedding-wash-schedule',
    name: 'Bedding Wash Schedule',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Plan wash cycles for sheets, duvet covers, pillow inserts, and mattress protectors.',
    tip: 'Pillowcases collect facial oils, sebum, and drool every night—switch them twice weekly to reduce acne breakouts.',
    usage: [
      'Enter household bed count.',
      'Get an organized hygienic bedding laundry timetable.',
    ],
    method: [
      'Standard dermatology and allergist guidelines for home bedding hygiene.',
    ],
    fields: [
      n('beds', 'Number of Beds in Home', { def: 2, min: 1, max: 6 }),
    ],
    compute: (v) => {
      const beds = asNum(v.beds)

      const timetable = [
        '• Pillowcases: Wash every 3 to 4 days (or flip pillow on night 2, replace night 4).',
        '• Fitted & Flat Sheets: Wash every 7 days at 60°C to eliminate dust mites.',
        '• Duvet Covers: Wash every 2 weeks.',
        '• Mattress & Pillow Protectors: Wash once a month in warm water.',
        '• Duvet Comforter Insert: Wash or dry-clean every 3 to 6 months.',
        '• Bed Pillows (Synthetic/Feather): Wash 2 pillows together in machine every 4 months.',
      ].join('\n')

      return [
        res('Beds Tracked', `${beds} beds`, T.good),
        res('Weekly Loads for Sheets', `${Math.ceil(beds * 0.7)} loads/wk`, T.neutral),
        doc('Master Bedding Hygiene Schedule', timetable),
      ]
    },
  },
  {
    id: 'towel-wash-schedule',
    name: 'Towel Wash Schedule',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Track when bath towels, hand towels, and kitchen dish cloths need sanitizing.',
    tip: 'If your towels smell musty immediately after getting wet, wash them with 1 cup of white vinegar and NO detergent to strip old soap buildup.',
    usage: [
      'Enter occupant count.',
      'Check recommended rotation and wash temperature.',
    ],
    method: [
      'Damp towels grow bacteria and mildew within 48-72 hours of bathroom hanging.',
    ],
    fields: [
      n('occupants', 'Occupants in Home', { def: 3, min: 1, max: 10 }),
    ],
    compute: (v) => {
      const p = asNum(v.occupants)

      const schedule = [
        '• Bath Towels: Wash after 3 to 4 uses (hang fully spread out between uses to dry).',
        '• Hand Towels (Shared Bathroom): Replace every 2 days (high bacterial contact).',
        '• Kitchen Dish Towels: Replace daily or every 2 days to prevent kitchen cross-contamination.',
        '• Washcloths / Face Towels: Use once, then put directly into laundry basket.',
        '• Gym / Sports Towels: Wash immediately after every single workout session.',
      ].join('\n')

      return [
        res('Household Members', `${p} people`, T.good),
        res('Weekly Towel Loads', `~${Math.ceil(p * 0.4 + 1)} loads`, T.neutral),
        doc('Towel Sanitization Rules', schedule),
      ]
    },
  },
  {
    id: 'curtain-wash-schedule',
    name: 'Curtain Wash Schedule',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Schedule seasonal dusting, steaming, and machine washing for window drapes and curtains.',
    tip: 'Shake heavy curtains outside on a breezy day or vacuum with a brush nozzle every month to extend time between washes.',
    usage: [
      'Select curtain fabric (Sheer polyester, heavy velvet, cotton, or thermal blackout).',
      'View washing and drying specifications.',
    ],
    method: [
      'Thermal blackout curtains have acrylic rubber backing that melts in hot dryers—hang dry only.',
    ],
    fields: [
      sel('curtainType', 'Curtain Fabric Type', ['Lightweight Sheers (Polyester)', 'Cotton / Linen Drapes', 'Thermal Backed Blackout Curtains', 'Heavy Velvet / Brocade'], 'Cotton / Linen Drapes'),
    ],
    compute: (v) => {
      const c = asSel(v.curtainType)

      let guidance = ''
      if (c.includes('Blackout')) {
        guidance = '• WASH: Delicate cycle in cool water (30°C).\n• CAUTION: Never put in dryer; heat melts rubber backing.\n• DRY: Hang damp directly back onto curtain rod with windows open.'
      } else if (c.includes('Sheers')) {
        guidance = '• WASH: Mesh wash bag, delicate cycle, cold water.\n• DRY: Hang while slightly damp to allow gravity to pull out wrinkles without ironing.'
      } else if (c.includes('Velvet')) {
        guidance = '• WASH: Professional dry clean only.\n• ROUTINE: Brush with soft garment brush and steam vertically.'
      } else {
        guidance = '• WASH: Gentle cycle in cool water. Check tag for shrinkage warnings.\n• DRY: Line dry or low-heat tumble; iron while slightly damp.'
      }

      return [
        res('Fabric Type', c, T.good),
        res('Recommended Frequency', 'Wash every 3 to 6 months', T.neutral),
        doc('Washing & Care Instructions', guidance),
      ]
    },
  },
  {
    id: 'shoe-cleaning-schedule',
    name: 'Shoe Cleaning Schedule',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Guide for safely machine-washing canvas sneakers and spot-cleaning leather footwear.',
    tip: 'Always remove shoe insoles and laces before machine washing—wash laces inside a small mesh bag.',
    usage: [
      'Select shoe material.',
      'Check washing machine safety and drying precautions.',
    ],
    method: [
      'Hot water dissolves shoe sole glue—always wash cold on delicate spin with towels to buffer drum thumping.',
    ],
    fields: [
      sel('shoeType', 'Shoe Type', ['Canvas Sneakers (Converse/Vans)', 'Running / Mesh Athletic Shoes', 'Smooth Leather Shoes', 'Suede / Nubuck Boots'], 'Running / Mesh Athletic Shoes'),
    ],
    compute: (v) => {
      const s = asSel(v.shoeType)

      let instructions = ''
      if (s.includes('Suede')) {
        instructions = '• MACHINE SAFE: NO! Water ruins suede texture.\n• CLEANING: Use a dry suede eraser for marks and brass bristle suede brush in one direction.\n• PROTECTION: Spray with hydrophobic suede protector.'
      } else if (s.includes('Leather')) {
        instructions = '• MACHINE SAFE: NO!\n• CLEANING: Wipe with damp microfiber and saddle soap or mild dish foam.\n• CARE: Condition with leather balm or polish to prevent leather drying and cracking.'
      } else {
        instructions = '• MACHINE SAFE: YES (with precautions).\n• PREP: Remove laces and insole. Brush off loose mud.\n• WASH: Cold water (30°C), gentle cycle, zero spin or low spin.\n• BUFFER: Put 2 old bath towels in drum with shoes to prevent banging.\n• DRY: NEVER tumble dry (ruins glue). Stuff with dry paper towels and air-dry near fan.'
      }

      return [
        res('Shoe Material', s, T.good),
        doc('Cleaning Protocol', instructions),
      ]
    },
  },
  {
    id: 'laundry-room-organization-planner',
    name: 'Laundry Room Organization Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Plan hamper sorting bins, shelf space, and folding stations for your laundry nook.',
    tip: 'A 3-section pre-sorting hamper (Darks, Lights, Towels) saves 15 minutes of manual sorting every laundry day.',
    usage: [
      'Input laundry space width and family size.',
      'Receive recommended bin configuration and layout tips.',
    ],
    method: [
      'Calculates linear surface requirements for folding, sorting hampers, and detergent staging.',
    ],
    fields: [
      n('spaceWidthFt', 'Laundry Area Width (feet)', { def: 6, min: 3, max: 20, step: 0.5 }),
      n('occupants', 'Household Members', { def: 3, min: 1, max: 10 }),
    ],
    compute: (v) => {
      const width = asNum(v.spaceWidthFt)
      const p = asNum(v.occupants)

      const hampers = p > 3 ? 3 : 2
      const counterSpace = width >= 6 ? 'Can accommodate dedicated 3ft folding counter over machines' : 'Use wall-mounted drop-leaf folding table'

      return [
        res('Recommended Hampers', `${hampers} sorting bins`, T.good, 'Darks, Lights/Whites, Linens'),
        res('Folding Station', counterSpace, width >= 6 ? T.good : T.neutral),
        doc('Organization Checklist', '1. Install high shelf for bleach and detergents away from children.\n2. Wall-mount retractable drying rack for delicates.\n3. Keep small jar for loose coins and pockets treasures.\n4. Wall-mount ironing board hanger behind door.'),
      ]
    },
  },
]
