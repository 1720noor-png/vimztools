import {
  type HouseholdSpec,
  n,
  sel,
  txt,
  ck,
  res,
  asNum,
  asSel,
  asStr,
  money,
  pct,
  num,
  numD,
} from './householdSpec'

const SUB = 'Maintenance'
const SUB_ID = 'maintenance'

export const maintenanceSpecs: HouseholdSpec[] = [
  {
    id: 'home-maintenance-cost-forecast',
    name: 'Home Maintenance Cost Forecast',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate recommended annual home maintenance reserves using the 1% property rule and square footage guidelines.',
    tip: 'The standard financial rule of thumb is setting aside 1% to 2% of your home\'s market value annually for upkeep.',
    usage: [
      'Enter current estimated home market value.',
      'Enter home age in years and square footage.',
      'Check recommended monthly and annual maintenance reserve funds.',
    ],
    method: [
      '1% Rule: Home Value * 1% (new) up to 2.5% (older homes > 30 yrs).',
      'Square Foot Rule: $1.00 - $1.50 per sq ft per year.',
    ],
    fields: [
      n('homeValue', 'Home Market Value ($)', { def: 380000, min: 50000, max: 3000000, step: 5000 }),
      n('homeAgeYears', 'Home Age (Years)', { def: 18, min: 0, max: 120, step: 1 }),
      n('sqft', 'Home Finished Area (sq ft)', { def: 2200, min: 500, max: 10000, step: 50 }),
    ],
    compute: (v) => {
      const val = asNum(v.homeValue, 380000)
      const age = asNum(v.homeAgeYears, 18)
      const sq = asNum(v.sqft, 2200)

      let rulePct = 0.01
      if (age > 40) rulePct = 0.025
      else if (age > 20) rulePct = 0.018
      else if (age > 10) rulePct = 0.014

      const annualByVal = val * rulePct
      const annualBySqft = sq * (age > 20 ? 1.50 : 1.15)
      const recommendedAnnual = Math.round((annualByVal + annualBySqft) / 2)
      const monthlyReserve = Math.round(recommendedAnnual / 12)

      return [
        res('Annual Reserve Target', money(recommendedAnnual), 'good', `${pct(rulePct * 100)} of property valuation`),
        res('Monthly Reserve Deposit', money(monthlyReserve), 'info', 'Dedicated high-yield savings transfer'),
        res('Age-Adjusted Factor', `${age} year old home`, age > 25 ? 'warn' : 'good', age > 25 ? 'Roof/HVAC lifecycle active' : 'Modern building systems'),
        res('Per Square Foot Rate', money(recommendedAnnual / sq) + '/sq ft/yr', 'neutral', 'Blended benchmark average'),
      ]
    },
  },
  {
    id: 'appliance-maintenance-cost-tracker',
    name: 'Appliance Maintenance Cost Tracker',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Track annual tune-ups, filter replacements, descaling, and cleaning costs across major home appliances.',
    tip: 'Spending $15 on water heater anode rods and descaling can double the lifespan of an expensive $1,500 tank.',
    usage: [
      'Enter annual maintenance expenses for HVAC, water heater, refrigerator, and laundry.',
      'Check total annual upkeep expense and preventive savings multiplier.',
    ],
    method: [
      'Total Annual = Sum of appliance service contracts, filters, descalers, and inspections.',
    ],
    fields: [
      n('hvacService', 'HVAC Annual Tune-Ups & Filters ($)', { def: 180, min: 0, max: 1000, step: 10 }),
      n('waterHeater', 'Water Heater Flush & Anode ($)', { def: 35, min: 0, max: 400, step: 5 }),
      n('refrigerator', 'Water Filters & Coil Cleaning ($)', { def: 60, min: 0, max: 300, step: 5 }),
      n('laundryService', 'Dryer Vent Cleaning & Washer Care ($)', { def: 75, min: 0, max: 400, step: 5 }),
      n('dishwasherDisposal', 'Dishwasher & Disposal Cleaners ($)', { def: 25, min: 0, max: 200, step: 5 }),
    ],
    compute: (v) => {
      const hvac = asNum(v.hvacService, 180)
      const wh = asNum(v.waterHeater, 35)
      const ref = asNum(v.refrigerator, 60)
      const lnd = asNum(v.laundryService, 75)
      const dw = asNum(v.dishwasherDisposal, 25)

      const total = hvac + wh + ref + lnd + dw
      const monthly = total / 12
      const estAvoidedRepairs = total * 3.8

      return [
        res('Annual Upkeep Total', money(total), 'good', 'All appliances combined'),
        res('Monthly Cost', money(monthly), 'neutral', 'Predictable budgeting'),
        res('Avoided Breakdown Value', money(estAvoidedRepairs), 'good', 'Estimated lifetime extension ROI'),
        res('Dryer Vent Fire Safety', lnd >= 70 ? 'Cleaned / Safe' : 'Ensure annual vent sweep', lnd >= 70 ? 'good' : 'warn', 'Prevents home lint fires'),
      ]
    },
  },
  {
    id: 'maintenance-due-date-calculator',
    name: 'Maintenance Due Date Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate exact calendar due dates for recurring home tasks based on last performed date and recurrence interval.',
    tip: 'Schedule HVAC maintenance in shoulder months (March and September) to get contractor discounts before peak seasons.',
    usage: [
      'Select maintenance task or custom service.',
      'Enter months since last performed.',
      'Select recommended service cycle (3, 6, 12, or 24 months).',
      'Check task overdue status and target due window.',
    ],
    method: [
      'Overdue Months = Months Since Last - Cycle Months.',
    ],
    fields: [
      sel('taskType', 'Maintenance Task', [
        'HVAC Filter Replacement (3-Month Cycle)',
        'Water Heater Tank Flush (12-Month Cycle)',
        'Dryer Duct Lint Exhaust Sweep (12-Month Cycle)',
        'Smoke Detector Battery & Sensor Test (6-Month Cycle)',
        'Refrigerator Condenser Coil Vacuum (6-Month Cycle)',
        'Roof & Gutter Cleanout (6-Month Cycle)',
      ], 'HVAC Filter Replacement (3-Month Cycle)'),
      n('monthsSinceLast', 'Months Elapsed Since Last Service', { def: 4, min: 0, max: 36, step: 1 }),
    ],
    compute: (v) => {
      const task = asSel(v.taskType)
      const elapsed = asNum(v.monthsSinceLast, 4)

      let cycle = 12
      if (task.includes('3-Month')) cycle = 3
      else if (task.includes('6-Month')) cycle = 6

      const diff = elapsed - cycle
      const isOverdue = diff > 0

      return [
        res('Maintenance Status', isOverdue ? `Overdue by ${diff} month${diff > 1 ? 's' : ''}` : `Due in ${Math.abs(diff)} month${Math.abs(diff) !== 1 ? 's' : ''}`, isOverdue ? 'bad' : 'good', `${elapsed} months elapsed vs ${cycle} month cycle`),
        res('Service Recurrence', `Every ${cycle} Months`, 'info', task.split('(')[0].trim()),
        res('Action Urgency', isOverdue ? 'Schedule Service This Week' : 'On Track', isOverdue ? 'warn' : 'good', isOverdue ? 'Prevents equipment damage' : 'Healthy operating window'),
        res('Task Tip', cycle === 3 ? 'Check MERV rating of filter' : 'Flush until drain water runs clear', 'neutral', 'Best practice protocol'),
      ]
    },
  },
  {
    id: 'maintenance-frequency-planner',
    name: 'Maintenance Frequency Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Sort all standard home upkeep tasks into monthly, quarterly, semi-annual, and annual checklist cadences.',
    tip: 'Breaking home maintenance into small quarterly batches prevents expensive, overwhelming repair weekends.',
    usage: [
      'Select target season (Spring, Summer, Fall, Winter).',
      'View seasonal priority focus areas.',
      'Check cadence distribution across safety, HVAC, plumbing, and exterior.',
    ],
    method: [
      'Generates seasonal checklist breakdown based on seasonal climate demands.',
    ],
    fields: [
      sel('season', 'Current Planning Season', [
        'Spring (AC prep, gutter wash, roof shingles, exterior spigots)',
        'Summer (Deck sealing, sprinkler tune-up, lawn aeration, dryer duct)',
        'Fall (Furnace tune-up, chimney sweep, weatherstripping, leaf removal)',
        'Winter (Pipe freeze protection, indoor deep cleans, smoke detectors)',
      ], 'Spring (AC prep, gutter wash, roof shingles, exterior spigots)'),
    ],
    compute: (v) => {
      const s = asSel(v.season)
      const sName = s.split('(')[0].trim()

      return [
        res('Season Focus', `${sName} Home Upkeep`, 'good', 'High-impact seasonal tasks'),
        res('Critical Priority #1', sName === 'Spring' ? 'AC Tune-up & Refrigerant Check' : sName === 'Summer' ? 'Clean Dryer Lint Ducts' : sName === 'Fall' ? 'Furnace Inspection & Filter' : 'Disconnect Exterior Hose Spigots', 'warn', 'Prevents costly catastrophic failure'),
        res('Critical Priority #2', sName === 'Spring' ? 'Clean Gutters & Check Downspouts' : sName === 'Summer' ? 'Check Deck/Patio Sealant' : sName === 'Fall' ? 'Inspect Chimney & Flue' : 'Test Smoke & CO Detectors', 'good', 'Protects structural envelope'),
        res('Quarterly Cadence', 'Plan 1 weekend task per month', 'info', '~3-4 hours per month commitment'),
      ]
    },
  },
  {
    id: 'appliance-service-reminder',
    name: 'Appliance Service Reminder',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Generate custom maintenance intervals for refrigerator coils, dishwasher filter baskets, oven gaskets, and dryers.',
    tip: 'A clogged dishwasher bottom filter prevents complete draining, causing foul odors and cloudy glassware.',
    usage: [
      'Select home appliance to inspect.',
      'Select last maintenance status.',
      'Check recommended cleaning technique and checklist steps.',
    ],
    method: [
      'Looks up manufacturer-recommended preventive service protocol.',
    ],
    fields: [
      sel('appliance', 'Appliance to Service', [
        'Dishwasher Filter & Spray Arms (Monthly clean)',
        'Refrigerator Condenser Coils (Vacuum every 6 months)',
        'Oven Door Gasket & Door Glass (Every 6 months)',
        'Microwave Charcoal Vent Filter (Replace every 6-12 months)',
        'Garbage Disposal Blades & Baffle (Clean bi-weekly)',
      ], 'Dishwasher Filter & Spray Arms (Monthly clean)'),
    ],
    compute: (v) => {
      const app = asSel(v.appliance)
      const name = app.split('(')[0].trim()

      return [
        res('Selected Appliance', name, 'good', 'Preventive care protocol'),
        res('Frequency', app.split('(')[1]?.replace(')', '') || 'Regular maintenance', 'info', 'Keeps efficiency peak'),
        res('Typical DIY Time', '15 to 30 minutes', 'neutral', 'Requires basic household tools'),
        res('Expected Lifespan Boost', '+2 to 4 years extended life', 'good', 'Avoids premature replacement'),
      ]
    },
  },
  {
    id: 'ac-filter-replacement-reminder',
    name: 'AC Filter Replacement Reminder',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate exact filter replacement cadence based on filter thickness (1" vs 4"), pets, and allergy sensitivity.',
    tip: 'A dirty, restricted air filter can increase summer AC electric bills by 15% and freeze evaporator coils.',
    usage: [
      'Select filter thickness (1-inch standard vs 4-inch deep media).',
      'Select household occupancy and number of shedding pets.',
      'Check recommended filter replacement schedule in days.',
    ],
    method: [
      '1" filter base = 60 days. 4" filter base = 180 days.',
      'Deduct 20 days per shedding pet. Deduct 15 days for allergies.',
    ],
    fields: [
      sel('filterThickness', 'Filter Thickness & Style', [
        '1-Inch Standard Pleated (MERV 8-11)',
        '2-Inch Pleated Media',
        '4-Inch Deep Whole-House Media Filter (MERV 11-13)',
        '1-Inch Basic Fiberglass (Low filtration)',
      ], '1-Inch Standard Pleated (MERV 8-11)'),
      sel('petCount', 'Household Pets', [
        'No Pets',
        '1 Dog or Cat',
        '2+ Shedding Pets',
      ], '1 Dog or Cat'),
      ck('allergies', 'Family Members with Severe Allergies / Asthma', false),
    ],
    compute: (v) => {
      const ft = asSel(v.filterThickness)
      const pets = asSel(v.petCount)
      const allergy = v.allergies

      let days = 60
      if (ft.includes('4-Inch')) days = 180
      else if (ft.includes('2-Inch')) days = 90
      else if (ft.includes('Fiberglass')) days = 30

      if (pets.includes('1 Dog')) days -= (ft.includes('4-Inch') ? 30 : 15)
      else if (pets.includes('2+ Shedding')) days -= (ft.includes('4-Inch') ? 60 : 25)

      if (allergy) days -= (ft.includes('4-Inch') ? 25 : 10)
      days = Math.max(20, days)

      const filtersPerYear = Math.ceil(365 / days)

      return [
        res('Replace Filter Every', `${days} days`, days <= 35 ? 'warn' : 'good', `Every ~${numD(days / 30, 1)} months`),
        res('Annual Filters Needed', `${filtersPerYear} filters/year`, 'info', 'Keep a 4-pack on hand'),
        res('Airflow Protection', 'Prevents blower motor strain', 'good', 'Avoids $800 blower replacements'),
        res('Pro Tip', 'Write date of installation directly on filter cardboard rim with Sharpie', 'neutral', 'Easy visual reminder'),
      ]
    },
  },
  {
    id: 'water-filter-replacement-reminder',
    name: 'Water Filter Replacement Reminder',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Track lifespan and gallon capacity for refrigerator dispenser filters, under-sink RO membranes, and pitchers.',
    tip: 'Refrigerator water filters must be replaced every 6 months or 200-300 gallons to prevent microbial accumulation.',
    usage: [
      'Select filtration system (Refrigerator, Under-Sink Carbon, Reverse Osmosis).',
      'Enter household daily drinking water consumption.',
      'Check replacement frequency in months and annual cartridge budget.',
    ],
    method: [
      'Days = Gallon Capacity / Household Daily Gallons (Max 180 days for carbon).',
    ],
    fields: [
      sel('filterSystem', 'Water Filtration System', [
        'Refrigerator In-Door Dispenser (200-300 Gal / 6 Month Cap)',
        'Under-Sink Dual Stage Carbon (500 Gal / 6-12 Months)',
        'Reverse Osmosis Sediment & Carbon Pre-Filters (6 Months)',
        'Reverse Osmosis RO Membrane (2-3 Years)',
        'Pitcher Filter (Brita/PUR ~40 Gallons / 2 Months)',
      ], 'Refrigerator In-Door Dispenser (200-300 Gal / 6 Month Cap)'),
      n('people', 'Household Members Drinking Filtered Water', { def: 3, min: 1, max: 10, step: 1 }),
      n('cartridgeCost', 'Replacement Cartridge Cost ($)', { def: 38, min: 10, max: 150, step: 2 }),
    ],
    compute: (v) => {
      const sys = asSel(v.filterSystem)
      const people = asNum(v.people, 3)
      const cost = asNum(v.cartridgeCost, 38)

      let months = 6
      if (sys.includes('Pitcher')) months = 2
      else if (sys.includes('RO Membrane')) months = 24
      else if (sys.includes('Under-Sink')) months = 9

      const annualCost = (12 / months) * cost

      return [
        res('Replacement Cadence', `Every ${months} months`, months <= 2 ? 'warn' : 'good', `${people} users - ${sys.split('(')[0].trim()}`),
        res('Annual Filter Expense', money(annualCost), 'info', `${numD(12 / months, 1)} cartridges/year`),
        res('Water Quality Indicator', 'Reset filter light after installation', 'good', 'Flushes carbon fines before first use'),
        res('Flush Requirement', 'Run 3 gallons through new filter', 'neutral', 'Removes loose carbon particles'),
      ]
    },
  },
  {
    id: 'geyser-service-reminder',
    name: 'Geyser Service Reminder',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate water heater / geyser sediment flushing frequency, sacrificial anode rod life, and T&P valve testing.',
    tip: 'Flushing 2-3 gallons of sediment out of your water heater bottom drain valve annually prevents heating element burnout.',
    usage: [
      'Select water hardness in your city (Soft, Moderate, Hard, Very Hard).',
      'Select water heater type (Electric tank, Gas tank, Tankless).',
      'Check flushing frequency and anode rod inspection cycle.',
    ],
    method: [
      'Hard water accelerates mineral scaling. Hard water = flush every 6 months; Soft = 12 months.',
    ],
    fields: [
      sel('waterHardness', 'Local Municipal Water Hardness', [
        'Moderate Water (3-7 GPG / standard)',
        'Hard Water (7-14 GPG - Rapid mineral scaling)',
        'Very Hard / Well Water (14+ GPG)',
        'Softened Water (Water softener installed)',
      ], 'Hard Water (7-14 GPG - Rapid mineral scaling)'),
      sel('heaterType', 'Water Heater / Geyser Type', [
        'Standard Electric Storage Tank (Dual Element)',
        'Standard Natural Gas Storage Tank',
        'Tankless Gas / Electric (Requires vinegar flush pump)',
      ], 'Standard Gas Storage Tank'),
    ],
    compute: (v) => {
      const wh = asSel(v.waterHardness)
      const ht = asSel(v.heaterType)

      const isHard = wh.includes('Hard')
      const isTankless = ht.includes('Tankless')

      const flushMonths = isHard ? 6 : 12
      const anodeYears = wh.includes('Softened') ? 2 : isHard ? 3 : 5

      return [
        res('Sediment Flush Cadence', `Every ${flushMonths} months`, flushMonths <= 6 ? 'warn' : 'good', isHard ? 'Accelerated due to mineral hardness' : 'Standard preventative flush'),
        res('Anode Rod Inspection', `Every ${anodeYears} years`, 'info', 'Sacrificial magnesium/aluminum rod'),
        res('T&P Valve Test', 'Test lift lever once per year', 'good', 'Ensures pressure relief safety'),
        res('Maintenance Technique', isTankless ? 'Circulate 4 gal distilled white vinegar with submersible pump' : 'Connect garden hose to bottom drain cock and flush', 'neutral', 'Removes calcium & limescale build-up'),
      ]
    },
  },
  {
    id: 'refrigerator-service-reminder',
    name: 'Refrigerator Service Reminder',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Schedule condenser coil cleaning, door gasket seal tests, and drain pan checks to prevent compressor burnout.',
    tip: 'Dusty, pet-hair-covered condenser coils force your refrigerator compressor to run 30% longer, wasting $60+/year.',
    usage: [
      'Select household pet situation.',
      'Check coil vacuum frequency, dollar dollar bill gasket test, and defrost drain checks.',
    ],
    method: [
      'Generates coil maintenance interval based on pet hair volume.',
    ],
    fields: [
      sel('petHair', 'Pet Environment', [
        'No Pets (Clean coils every 12 months)',
        '1 Pet (Clean coils every 6 months)',
        '2+ Shedding Pets (Clean coils every 3-4 months)',
      ], '1 Pet (Clean coils every 6 months)'),
      ck('doorSealTight', 'Tested door gasket seal with a dollar bill (slides out with resistance)', true),
    ],
    compute: (v) => {
      const pets = asSel(v.petHair)
      const seal = v.doorSealTight

      const months = pets.includes('3-4') ? 4 : pets.includes('6') ? 6 : 12

      return [
        res('Coil Vacuum Interval', `Every ${months} months`, months <= 4 ? 'warn' : 'good', 'Under bottom toe kick or behind back panel'),
        res('Door Gasket Status', seal ? 'Airtight Seal' : 'Worn Gasket (Cold Air Leak)', seal ? 'good' : 'bad', seal ? 'Efficient cooling' : 'Clean with warm soapy water or replace'),
        res('Annual Energy Savings', money(45), 'good', 'From clean, unobstructed condenser heat transfer'),
        res('Pro Tool', 'Long flexible refrigerator coil brush ($9)', 'info', 'Loosens caked lint before vacuuming'),
      ]
    },
  },
  {
    id: 'washing-machine-service-reminder',
    name: 'Washing Machine Service Reminder',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Schedule descaling tub-clean cycles, debris filter drain cleanouts, and high-pressure hose inspections.',
    tip: 'Rubber washing machine inlet hoses should be replaced with braided stainless steel hoses every 5 years to prevent catastrophic floods.',
    usage: [
      'Select machine type (Front load vs Top load).',
      'Select water inlet hose material (Braided stainless steel vs Black rubber).',
      'Check tub sanitization cycle cadence and pump debris trap cleaning frequency.',
    ],
    method: [
      'Front loaders require monthly gasket drying & tub clean cycles; rubber hoses require 5-year replacement.',
    ],
    fields: [
      sel('machineType', 'Washing Machine Style', [
        'Front-Load High Efficiency (Prone to door gasket mildew)',
        'Top-Load with Impeller (HE)',
        'Top-Load Traditional with Agitator',
      ], 'Front-Load High Efficiency (Prone to door gasket mildew)'),
      sel('hoseType', 'Water Inlet Supply Hoses', [
        'Braided Stainless Steel Burst-Proof Hoses',
        'Black Rubber Factory Hoses (High rupture risk)',
      ], 'Braided Stainless Steel Burst-Proof Hoses'),
    ],
    compute: (v) => {
      const mt = asSel(v.machineType)
      const ht = asSel(v.hoseType)

      const isFront = mt.includes('Front-Load')
      const isRubber = ht.includes('Black Rubber')

      return [
        res('Tub Clean Cycle', 'Run once per month', 'good', 'Use hot water + washing machine cleaner tablet'),
        res('Coin / Debris Trap Clean', isFront ? 'Clean lower pump trap every 2-3 months' : 'Inspect drain hose annually', 'info', isFront ? 'Catches coins, hair clips & lint' : 'Standard drainage check'),
        res('Hose Burst Safety', isRubber ? 'DANGER: Replace Rubber Hoses Now' : 'Safe Stainless Steel Hoses', isRubber ? 'bad' : 'good', isRubber ? 'Rubber hoses cause $10k+ average flood damage' : 'Check fittings annually'),
        res('Front Load Tip', isFront ? 'Leave door ajar 2 inches between washes' : 'Wipe top rim monthly', 'good', 'Allows drum and rubber boot to dry completely'),
      ]
    },
  },
  {
    id: 'plumbing-inspection-planner',
    name: 'Plumbing Inspection Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Comprehensive whole-house plumbing checklist covering main water shutoff valve, PRV, toilet fill valves, and traps.',
    tip: 'Always test your main water shutoff valve once a year so you know it will turn freely during an emergency pipe burst.',
    usage: [
      'Review critical plumbing inspection checkpoints.',
      'Test main water valve, water pressure regulator (PRV), and sink trap seals.',
      'Check whole-house plumbing safety score.',
    ],
    method: [
      'Calculates safety compliance score across 6 key home plumbing points.',
    ],
    fields: [
      ck('mainShutoffTested', 'Tested Main Water Shut-Off Valve (turns fully without binding)', true),
      ck('waterPressureChecked', 'Checked Water Pressure (Normal range: 45 to 65 PSI)', true),
      ck('underSinkLeaks', 'Inspected Under-Sink Supply Lines & P-Traps for moisture', false),
      ck('toiletFlappers', 'Tested Toilet Flapper Seals for silent leaks', false),
      ck('waterHeaterPRV', 'Inspected Water Heater Temperature & Pressure Relief Valve', false),
      ck('outdoorHoseBibbs', 'Inspected Outdoor Hose Bibbs for winter freeze damage', true),
    ],
    compute: (v) => {
      const items = [
        v.mainShutoffTested,
        v.waterPressureChecked,
        v.underSinkLeaks,
        v.toiletFlappers,
        v.waterHeaterPRV,
        v.outdoorHoseBibbs,
      ]
      const count = items.filter(Boolean).length
      const score = Math.round((count / items.length) * 100)

      return [
        res('Plumbing Health Score', `${score}% Inspected`, score >= 80 ? 'good' : 'warn', `${count} of ${items.length} checks verified`),
        res('Main Shut-Off Safety', v.mainShutoffTested ? 'Emergency Operational' : 'CRITICAL: Test Valve Now', v.mainShutoffTested ? 'good' : 'bad', 'Prevents massive water damage'),
        res('Safe Water Pressure', v.waterPressureChecked ? 'Within 45-65 PSI' : 'Test with $10 gauge', v.waterPressureChecked ? 'good' : 'warn', 'High pressure (>80 PSI) ruins appliances'),
        res('Inspection Frequency', 'Perform whole-house walk every 6 months', 'info', 'Spring & Autumn'),
      ]
    },
  },
  {
    id: 'electrical-inspection-planner',
    name: 'Electrical Inspection Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Safety checklist covering GFCI outlet tripping, AFCI breakers, panel labeling, and heavy-draw extension cord audits.',
    tip: 'Press the "Test" button on all GFCI outlets in kitchens, bathrooms, and garages monthly to ensure life-safety protection.',
    usage: [
      'Audit electrical panel clarity, GFCI functionality, and smoke detector circuits.',
      'Check whole-house electrical safety rating.',
    ],
    method: [
      'Scores residential electrical system readiness and fire risk prevention.',
    ],
    fields: [
      ck('gfciTested', 'Tested & Reset all GFCI Outlets (Kitchen, Baths, Garage, Outdoors)', false),
      ck('panelLabeled', 'Electrical Breaker Panel has 100% readable legible circuit labels', false),
      ck('noCordOverload', 'No daisy-chained power strips or overloaded space heaters on cords', true),
      ck('outletsCool', 'Verified wall outlets are cool to touch (no warm plates or discoloration)', true),
      ck('smokeDetectorsCurrent', 'Smoke detectors tested and under 10 years old (check stamp date)', true),
    ],
    compute: (v) => {
      const checks = [
        v.gfciTested,
        v.panelLabeled,
        v.noCordOverload,
        v.outletsCool,
        v.smokeDetectorsCurrent,
      ]
      const done = checks.filter(Boolean).length
      const score = Math.round((done / checks.length) * 100)

      return [
        res('Electrical Safety Score', `${score}% Secure`, score >= 80 ? 'good' : 'warn', `${done} of ${checks.length} audits completed`),
        res('GFCI Tripping Status', v.gfciTested ? 'Functional Ground Protection' : 'Test GFCI Outlets Monthly', v.gfciTested ? 'good' : 'warn', 'Protects against electrocution'),
        res('Panel Labeling', v.panelLabeled ? 'Clearly Identified' : 'Map breaker circuits for emergencies', v.panelLabeled ? 'good' : 'info', 'Speeds emergency power cuts'),
        res('Fire Risk Warning', !v.outletsCool ? 'FIRE HAZARD: Call Electrician for warm outlet' : 'Normal Operating Temperatures', v.outletsCool ? 'good' : 'bad', 'Discolored plates indicate loose arcing wires'),
      ]
    },
  },
  {
    id: 'roof-maintenance-planner',
    name: 'Roof Maintenance Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Inspect architectural shingles, flashing around chimneys/vents, moss growth, and attic soffit ventilation.',
    tip: 'Over 80% of residential roof leaks occur around metal flashing at chimneys, skylights, and plumbing vents, not field shingles.',
    usage: [
      'Enter roof age in years and roofing material.',
      'Select ground binocular inspection findings.',
      'Check remaining roof lifespan and maintenance urgency.',
    ],
    method: [
      'Asphalt 3-tab: 18-22 yrs. Architectural dimensional: 25-30 yrs. Metal: 50+ yrs.',
    ],
    fields: [
      sel('roofMaterial', 'Roof Shingle Material', [
        'Architectural Dimensional Shingle (25-30 yr lifespan)',
        '3-Tab Asphalt Shingle (18-20 yr lifespan)',
        'Standing Seam Metal Roof (50+ yr lifespan)',
        'Clay Tile / Slate (60-100 yr lifespan)',
      ], 'Architectural Dimensional Shingle (25-30 yr lifespan)'),
      n('roofAge', 'Roof Age (Years)', { def: 14, min: 0, max: 60, step: 1 }),
      ck('mossGrowth', 'Visible moss or lichen growth on shady slopes', false),
      ck('granuleLoss', 'Heavy shingle mineral granules accumulating in gutters', false),
    ],
    compute: (v) => {
      const rm = asSel(v.roofMaterial)
      const age = asNum(v.roofAge, 14)
      const moss = v.mossGrowth
      const granules = v.granuleLoss

      const maxLife = rm.includes('3-Tab') ? 20 : rm.includes('Metal') ? 50 : rm.includes('Clay') ? 75 : 28
      const remainingYears = Math.max(0, maxLife - age)
      const healthPct = Math.round((remainingYears / maxLife) * 100)

      return [
        res('Estimated Remaining Life', `~${remainingYears} years`, remainingYears <= 5 ? 'warn' : 'good', `${age} years old of ${maxLife} yr lifespan`),
        res('Roof Health Index', pct(healthPct), healthPct < 30 ? 'warn' : 'good', rm.split('(')[0].trim()),
        res('Moss Action', moss ? 'Treat with zinc sulfate or gentle wash' : 'No moss detected', moss ? 'warn' : 'good', moss ? 'Moss lifts shingle edges' : 'Clean roof surface'),
        res('Wear Warning', granules ? 'High granule loss indicates UV weathering' : 'Normal shingle adhesion', granules ? 'warn' : 'good', 'Check attic for daylight penetrations'),
      ]
    },
  },
  {
    id: 'gutter-cleaning-reminder',
    name: 'Gutter Cleaning Reminder',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Schedule gutter cleaning cycles and calculate downspout extension distances based on surrounding tree canopy.',
    tip: 'Downspouts must discharge rainwater at least 4 to 6 feet away from the home foundation to prevent basement water seepage.',
    usage: [
      'Select tree canopy density surrounding your roof.',
      'Select gutter guard status.',
      'Check recommended cleaning frequency per year and downspout discharge rules.',
    ],
    method: [
      'Heavy trees = clean 3-4 times/year (Spring seeds, Late Autumn leaves). Guarded = 1 time/year.',
    ],
    fields: [
      sel('treeCover', 'Surrounding Tree Canopy', [
        'Dense Overhanging Trees (Pine, Oak, Maple)',
        'Moderate Trees within 50 feet',
        'Minimal / No Trees Nearby',
      ], 'Dense Overhanging Trees (Pine, Oak, Maple)'),
      sel('guardStatus', 'Gutter Guards Installed', [
        'Open Gutters (No guards)',
        'Micro-Mesh Screen Guards',
        'Slotted Plastic Covers',
      ], 'Open Gutters (No guards)'),
      n('downspoutExtFt', 'Downspout Extension Length (Feet from Wall)', { def: 5, min: 1, max: 15, step: 0.5 }),
    ],
    compute: (v) => {
      const trees = asSel(v.treeCover)
      const guards = asSel(v.guardStatus)
      const ext = asNum(v.downspoutExtFt, 5)

      let cleanings = 2
      if (trees.includes('Dense')) cleanings = 4
      else if (trees.includes('Minimal')) cleanings = 1

      if (guards.includes('Micro-Mesh')) cleanings = Math.max(1, cleanings - 2)

      const isSafeExt = ext >= 5

      return [
        res('Recommended Cleaning Frequency', `${cleanings} times per year`, cleanings > 2 ? 'warn' : 'good', 'Spring seed pods + Late Autumn leaves'),
        res('Foundation Water Protection', isSafeExt ? 'Adequate Drainage Clearance' : 'RISK: Extend Downspouts', isSafeExt ? 'good' : 'bad', `${ext} ft from wall (min 5-6 ft required)`),
        res('Ladder Safety Warning', 'Use standoff ladder stabilizer', 'warn', 'Never rest ladder directly on aluminum gutter trough'),
        res('Clog Alert', 'Inspect downspout elbows after heavy storms', 'info', 'Elbows clog first'),
      ]
    },
  },
  {
    id: 'door-and-window-maintenance-planner',
    name: 'Door and Window Maintenance Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Inspect weatherstripping, window weep holes, silicone exterior caulking, and door hinge lubrication.',
    tip: 'Clear the small exterior weep holes at the bottom of vinyl window tracks to prevent rainwater backing up into walls.',
    usage: [
      'Perform weatherstrip draft check and silicone exterior caulking audit.',
      'Review door lock graphite lube schedule.',
      'Check energy seal integrity score.',
    ],
    method: [
      'Calculates envelope draft and weather tightness.',
    ],
    fields: [
      ck('weatherstrippingIntact', 'Door weatherstripping forms tight seal on all 3 sides with no visible daylight', true),
      ck('exteriorCaulking', 'Exterior perimeter caulking intact with no peeling or cracking', false),
      ck('weepHolesClear', 'Window frame exterior weep holes clear of dirt and insects', false),
      ck('hingesLubricated', 'Door hinges and lock cylinders lubricated with silicone/graphite', true),
    ],
    compute: (v) => {
      const items = [
        v.weatherstrippingIntact,
        v.exteriorCaulking,
        v.weepHolesClear,
        v.hingesLubricated,
      ]
      const count = items.filter(Boolean).length
      const score = Math.round((count / items.length) * 100)

      return [
        res('Envelope Seal Rating', `${score}% Sealed`, score >= 75 ? 'good' : 'warn', `${count} of ${items.length} checks passing`),
        res('Draft Prevention', v.weatherstrippingIntact ? 'Airtight' : 'Drafty Door Threshold', v.weatherstrippingIntact ? 'good' : 'warn', 'Saves 5-10% heating costs'),
        res('Water Infiltration Risk', !v.exteriorCaulking ? 'Recaulk window perimeters with 100% silicone' : 'Protected from rain seepage', v.exteriorCaulking ? 'good' : 'bad', 'Prevents wood rot in framing'),
        res('Lock Lubricant Tip', 'Use dry graphite powder in key cylinders (never WD-40)', 'good', 'WD-40 attracts sticky dirt inside pins'),
      ]
    },
  },
  {
    id: 'home-maintenance-log',
    name: 'Home Maintenance Log',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Document completed home repairs, contractor names, paint color codes, and receipt amounts for resale records.',
    tip: 'Maintaining a clean maintenance log can increase home appraisal value and provide vital leverage during buyer inspections.',
    usage: [
      'Enter recent repair project name.',
      'Enter contractor name or DIY status.',
      'Enter total invoice amount and date.',
      'Generate a permanent record entry.',
    ],
    method: [
      'Compiles structured log record with warranty and ROI documentation.',
    ],
    fields: [
      txt('projectName', 'Project / Repair Completed', 'Replaced Water Heater 50 Gal'),
      txt('contractor', 'Service Provider / Contractor', 'ABC Plumbing LLC'),
      n('totalCost', 'Total Invoice / Material Cost ($)', { def: 1650, min: 0, max: 50000, step: 25 }),
      txt('warrantyNotes', 'Warranty & Part Numbers', '10-Yr Tank Warranty, Model #XG50T12'),
    ],
    compute: (v) => {
      const proj = asStr(v.projectName, 'Repair')
      const contr = asStr(v.contractor, 'Self/Contractor')
      const cost = asNum(v.totalCost, 1650)
      const notes = asStr(v.warrantyNotes, 'Standard')

      return [
        res('Logged Entry', proj, 'good', 'Recorded into household history'),
        res('Expense Logged', money(cost), 'info', `Performed by: ${contr}`),
        res('Warranty Documentation', notes, 'neutral', 'Keep receipt PDF archived'),
        res('Home Resale Value', 'Preserves documented property care', 'good', 'Increases buyer buyer confidence'),
      ]
    },
  },
  {
    id: 'repair-history-tracker',
    name: 'Repair History Tracker',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Track frequency and lifetime expenditure on a troublesome home system (plumbing, HVAC, roof) to guide replacement.',
    tip: 'When cumulative repairs over a 2-year window exceed 50% of a brand-new replacement, replacement is mathematically superior.',
    usage: [
      'Select system (HVAC, Refrigerator, Plumbing, Dishwasher).',
      'Enter total repair dollars spent over the last 24 months.',
      'Enter estimated cost of a brand new unit.',
      'Check system replacement viability.',
    ],
    method: [
      '50% Rule: If 2-yr repairs > 50% replacement cost, replace immediately.',
    ],
    fields: [
      sel('system', 'Home System / Appliance', [
        'Central HVAC System ($7,500 new)',
        'Water Heater Tank ($1,600 new)',
        'Refrigerator ($1,800 new)',
        'Washing Machine ($900 new)',
        'Dishwasher ($750 new)',
      ], 'Central HVAC System ($7,500 new)'),
      n('repairsLast24Mo', 'Total Repairs Spent in Last 2 Years ($)', { def: 1200, min: 0, max: 10000, step: 50 }),
      n('newCost', 'Estimated Brand New Replacement Cost ($)', { def: 7500, min: 300, max: 20000, step: 100 }),
    ],
    compute: (v) => {
      const sys = asSel(v.system)
      const spent = asNum(v.repairsLast24Mo, 1200)
      const newUnit = asNum(v.newCost, 7500)

      const repairRatio = (spent / newUnit) * 100
      const shouldReplace = repairRatio >= 45

      return [
        res('Repair-to-New Ratio', pct(repairRatio), shouldReplace ? 'bad' : 'good', `${money(spent)} spent vs ${money(newUnit)} new`),
        res('Economic Recommendation', shouldReplace ? 'Replace System (Sunk Cost Trap)' : 'Continue Maintaining (Economical)', shouldReplace ? 'warn' : 'good', shouldReplace ? 'Repairs exceeding 50% rule' : 'Repair costs still low relative to new unit'),
        res('Future Risk', shouldReplace ? 'Frequent failure cycle active' : 'Stable operating state', shouldReplace ? 'warn' : 'info', sys.split('(')[0].trim()),
        res('Energy Benefit', shouldReplace ? 'New unit will save 20-30% on utilities' : 'Maintain current unit', 'neutral', 'Modern SEER2 / Energy Star standards'),
      ]
    },
  },
  {
    id: 'appliance-service-history',
    name: 'Appliance Service History',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate equipment age and service cadence against national appliance life expectancy tables (AHAM).',
    tip: 'Dishwashers and microwaves typically last 9-10 years; furnaces and AC units last 15-20 years with annual maintenance.',
    usage: [
      'Select appliance and enter manufacturing year.',
      'Check current age against average life expectancy and projected failure window.',
    ],
    method: [
      'Compares current age against Association of Home Appliance Manufacturers (AHAM) averages.',
    ],
    fields: [
      sel('applianceType', 'Appliance Category', [
        'Central Air Conditioner (15 yr avg lifespan)',
        'Gas Furnace (18 yr avg lifespan)',
        'Water Heater Tank (10 yr avg lifespan)',
        'Refrigerator (12 yr avg lifespan)',
        'Dishwasher (9 yr avg lifespan)',
        'Clothes Washer (11 yr avg lifespan)',
        'Clothes Dryer (13 yr avg lifespan)',
      ], 'Central Air Conditioner (15 yr avg lifespan)'),
      n('currentAgeYears', 'Current Age (Years in Service)', { def: 11, min: 0, max: 35, step: 1 }),
    ],
    compute: (v) => {
      const app = asSel(v.applianceType)
      const age = asNum(v.currentAgeYears, 11)

      let avgLife = 15
      if (app.includes('Furnace')) avgLife = 18
      else if (app.includes('Water Heater')) avgLife = 10
      else if (app.includes('Refrigerator')) avgLife = 12
      else if (app.includes('Dishwasher')) avgLife = 9
      else if (app.includes('Washer')) avgLife = 11
      else if (app.includes('Dryer')) avgLife = 13

      const remaining = Math.max(0, avgLife - age)
      const pctUsed = (age / avgLife) * 100

      return [
        res('Lifespan Progress', pct(pctUsed), pctUsed >= 100 ? 'bad' : pctUsed >= 80 ? 'warn' : 'good', `${age} of ${avgLife} expected years`),
        res('Remaining Life Expectancy', remaining > 0 ? `~${remaining} years remaining` : 'Operating on borrowed time (Past average)', remaining > 0 ? 'good' : 'warn', 'Based on AHAM industry averages'),
        res('Budget Preparedness', pctUsed >= 80 ? 'Begin replacement fund savings' : 'Standard preventive care', pctUsed >= 80 ? 'warn' : 'good', 'Avoids emergency peak-season financing'),
        res('Efficiency Note', age > 10 ? 'Modern units offer substantially lower kWh draw' : 'Operating near modern standards', 'info', 'Energy Star efficiency gain'),
      ]
    },
  },
  {
    id: 'home-warranty-expiry-tracker',
    name: 'Home Warranty Expiry Tracker',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Track manufacturer and home warranty expiration dates to file claims on deteriorating appliances before coverage lapses.',
    tip: 'Conduct a thorough whole-house appliance audit 30 days before your 1-year builder or real estate warranty expires.',
    usage: [
      'Enter warranty policy expiration date / months remaining.',
      'Enter policy deductible or trade service call fee.',
      'Review pending appliance issues eligible for claims.',
    ],
    method: [
      'Flags imminent expiration and calculates deductible breakeven.',
    ],
    fields: [
      n('monthsRemaining', 'Months Remaining on Warranty Policy', { def: 2, min: 0, max: 60, step: 1 }),
      n('serviceCallFee', 'Policy Trade Service Call Fee ($)', { def: 85, min: 40, max: 150, step: 5 }),
      txt('suspectAppliance', 'Appliance with Potential Issue', 'HVAC compressor makes buzzing noise'),
    ],
    compute: (v) => {
      const months = asNum(v.monthsRemaining, 2)
      const fee = asNum(v.serviceCallFee, 85)
      const issue = asStr(v.suspectAppliance, 'Appliance issue')

      const isUrgent = months <= 2

      return [
        res('Warranty Policy Status', isUrgent ? `EXPIRING SOON (${months} mo)` : `Active (${months} months left)`, isUrgent ? 'bad' : 'good', isUrgent ? 'File claims immediately' : 'Comfortable window'),
        res('Service Call Fee', money(fee), 'info', 'Flat fee per trade visit'),
        res('Reported Symptom', issue, 'neutral', 'Document photos & audio before tech arrives'),
        res('Action Recommendation', isUrgent ? 'Request certified technician inspection before policy lapses' : 'Monitor symptom performance', isUrgent ? 'warn' : 'good', 'Avoid paying out-of-pocket after expiry'),
      ]
    },
  },
  {
    id: 'warranty-claim-checklist',
    name: 'Warranty Claim Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Checklist to maximize warranty claim approvals and avoid common insurer claim denials.',
    tip: 'Warranty companies frequently deny claims for "pre-existing conditions" or "lack of maintenance"; have maintenance records ready.',
    usage: [
      'Verify serial numbers, maintenance records, and error codes before calling the warranty claims line.',
      'Check claim approval readiness score.',
    ],
    method: [
      'Validates all 5 mandatory proof requirements for claim approval.',
    ],
    fields: [
      ck('serialModelLogged', 'Photographed clear appliance model and serial number rating plate', true),
      ck('maintRecordsReady', 'Have invoices showing regular filter changes and annual servicing', false),
      ck('symptomSpecific', 'Documented specific error codes, strange noises, and failure date', true),
      ck('contractTermsChecked', 'Reviewed policy exclusions (e.g. secondary water damage excluded)', false),
      ck('noUnauthRepair', 'Did not disassemble or attempt unauthorized third-party repairs', true),
    ],
    compute: (v) => {
      const items = [
        v.serialModelLogged,
        v.maintRecordsReady,
        v.symptomSpecific,
        v.contractTermsChecked,
        v.noUnauthRepair,
      ]
      const count = items.filter(Boolean).length
      const score = Math.round((count / items.length) * 100)

      return [
        res('Claim Approval Readiness', `${score}% Ready`, score >= 80 ? 'good' : 'warn', `${count} of ${items.length} insurer criteria verified`),
        res('Maintenance Record Status', v.maintRecordsReady ? 'Protected against denial' : 'VULNERABLE: Gather service receipts', v.maintRecordsReady ? 'good' : 'bad', 'Prevents "lack of maintenance" denial'),
        res('Third-Party Repair Rule', v.noUnauthRepair ? 'Compliant' : 'Risk of voiding warranty', v.noUnauthRepair ? 'good' : 'warn', 'Insurer must dispatch approved contractor'),
        res('Top Tip', 'Take continuous 30-sec video showing failure in real time', 'info', 'Undeniable proof for adjusters'),
      ]
    },
  },
  {
    id: 'replacement-vs-repair-calculator',
    name: 'Replacement vs Repair Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Apply the financial $5000 Rule (Age x Repair Cost) to objectively decide whether to fix or replace an old appliance.',
    tip: 'The $5000 Rule: Multiply appliance age in years by repair estimate. If total exceeds $5,000, replacement is the smarter move.',
    usage: [
      'Enter appliance age in years.',
      'Enter current repair estimate ($).',
      'Enter new replacement cost ($).',
      'Check $5,000 rule score and replacement recommendation.',
    ],
    method: [
      'Score = Appliance Age (Years) * Repair Cost ($).',
      'If Score > 5000: Replace. If Score <= 5000: Repair.',
    ],
    fields: [
      n('applianceAge', 'Appliance Age (Years)', { def: 9, min: 1, max: 30, step: 1 }),
      n('repairEstimate', 'Current Repair Estimate ($)', { def: 650, min: 50, max: 5000, step: 25 }),
      n('newReplacementCost', 'Brand New Replacement Cost ($)', { def: 1800, min: 200, max: 15000, step: 50 }),
    ],
    compute: (v) => {
      const age = asNum(v.applianceAge, 9)
      const rep = asNum(v.repairEstimate, 650)
      const repNew = asNum(v.newReplacementCost, 1800)

      const rule5000Score = age * rep
      const shouldReplace = rule5000Score > 5000 || (rep / repNew) > 0.50

      return [
        res('Decision Verdict', shouldReplace ? 'REPLACE APPLIANCE' : 'REPAIR APPLIANCE', shouldReplace ? 'warn' : 'good', shouldReplace ? 'Financially unsound to repair' : 'Repair makes economic sense'),
        res('$5000 Rule Score', `${num(rule5000Score)} pts`, rule5000Score > 5000 ? 'bad' : 'good', `${age} yrs * ${money(rep)} (Threshold: 5,000)`),
        res('Repair Cost Percentage', pct((rep / repNew) * 100), (rep / repNew) > 0.5 ? 'bad' : 'good', `${money(rep)} of ${money(repNew)} new cost`),
        res('Warranty Advantage', shouldReplace ? 'New unit includes 1-5 yr warranty' : 'Repair only warrants repaired part', 'info', 'Peace of mind factor'),
      ]
    },
  },
  {
    id: 'appliance-replacement-cost-planner',
    name: 'Appliance Replacement Cost Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate full out-of-pocket costs for new appliance purchases including delivery, installation, haul-away, and taxes.',
    tip: 'Installation, gas flex lines, electrical whips, and haul-away fees typically add $150 to $350 above the advertised retail price.',
    usage: [
      'Enter retail appliance unit price.',
      'Select delivery and professional installation services.',
      'Check all-inclusive out-of-door cost.',
    ],
    method: [
      'Total = Unit Price * (1 + Tax) + Delivery + Professional Install + Haul-Away Old Unit.',
    ],
    fields: [
      n('retailPrice', 'Appliance Advertised Retail Price ($)', { def: 1299, min: 200, max: 10000, step: 50 }),
      n('salesTaxPct', 'Local Sales Tax Rate (%)', { def: 7.5, min: 0, max: 15, step: 0.25 }),
      ck('proInstallation', 'Professional Installation & New Connection Lines ($180)', true),
      ck('haulAwayOld', 'Old Appliance Haul-Away & Disposal ($35)', true),
    ],
    compute: (v) => {
      const price = asNum(v.retailPrice, 1299)
      const taxRate = asNum(v.salesTaxPct, 7.5) / 100
      const install = v.proInstallation ? 180 : 0
      const haul = v.haulAwayOld ? 35 : 0

      const tax = price * taxRate
      const totalCost = price + tax + install + haul

      return [
        res('Total Out-of-Pocket Cost', money(totalCost), 'good', 'All fees and taxes included'),
        res('Appliance Base Price', money(price), 'neutral', 'Retail sticker price'),
        res('Sales Tax', money(tax), 'info', `@ ${numD(taxRate * 100, 2)}% tax rate`),
        res('Installation & Haul-Away', money(install + haul), 'neutral', 'Delivery, hookup, and removal'),
      ]
    },
  },
]
