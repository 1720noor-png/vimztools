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
  moneyC,
  pct,
  num,
  numD,
} from './householdSpec'

const SUB = 'Pets'
const SUB_ID = 'pets'

export const petsSpecs: HouseholdSpec[] = [
  {
    id: 'pet-age-calculator',
    name: 'Pet Age Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Convert dog and cat calendar years into biological human-equivalent years using AVMA physiological life stages.',
    tip: 'The old "1 dog year = 7 human years" myth is inaccurate; larger dogs age twice as fast in adulthood as small dogs.',
    usage: [
      'Select pet species (Dog vs Cat).',
      'Select dog breed size category (Small, Medium, Large, Giant).',
      'Enter pet calendar age in years.',
      'Check biological human equivalent age and veterinary life stage.',
    ],
    method: [
      'Cat: Year 1 = 15 human yrs, Year 2 = +9 (24), each subsequent year = +4.',
      'Small Dog (<20 lb): Year 1=15, 2=24, then +4/yr.',
      'Giant Dog (>90 lb): Year 1=12, 2=22, then +7-8/yr.',
    ],
    fields: [
      sel('petSpecies', 'Pet Species', ['Dog', 'Cat'], 'Dog'),
      sel('dogSize', 'Dog Breed Size (If Dog)', [
        'Small Dog (< 20 lbs / 9 kg)',
        'Medium Dog (21 - 50 lbs / 10-23 kg)',
        'Large Dog (51 - 90 lbs / 24-40 kg)',
        'Giant Dog (> 90 lbs / 41+ kg)',
      ], 'Medium Dog (21 - 50 lbs / 10-23 kg)'),
      n('calendarAge', 'Pet Calendar Age (Years)', { def: 5, min: 0.5, max: 25, step: 0.5 }),
    ],
    compute: (v) => {
      const species = asSel(v.petSpecies)
      const size = asSel(v.dogSize)
      const age = asNum(v.calendarAge, 5)

      let humanAge = 36
      if (species === 'Cat') {
        if (age <= 1) humanAge = age * 15
        else if (age <= 2) humanAge = 15 + (age - 1) * 9
        else humanAge = 24 + (age - 2) * 4
      } else {
        let mult = 4
        if (size.includes('Small')) mult = 4
        else if (size.includes('Medium')) mult = 5
        else if (size.includes('Large')) mult = 6
        else if (size.includes('Giant')) mult = 8

        if (age <= 1) humanAge = 15
        else if (age <= 2) humanAge = 24
        else humanAge = 24 + (age - 2) * mult
      }

      let lifeStage = 'Adult'
      if (humanAge < 18) lifeStage = 'Puppy / Kitten'
      else if (humanAge < 35) lifeStage = 'Young Adult'
      else if (humanAge < 55) lifeStage = 'Mature Adult'
      else if (humanAge < 75) lifeStage = 'Senior'
      else lifeStage = 'Geriatric'

      return [
        res('Human-Equivalent Age', `~${Math.round(humanAge)} human years`, humanAge >= 60 ? 'warn' : 'good', `${age} calendar years old`),
        res('Veterinary Life Stage', lifeStage, lifeStage.includes('Senior') || lifeStage.includes('Geriatric') ? 'warn' : 'good', species),
        res('Senior Vet Checkup Rule', humanAge >= 55 ? 'Twice-yearly geriatric checkups recommended' : 'Annual wellness exam sufficient', 'info', 'Screen for arthritis & kidney health'),
        res('Nutrition Stage', humanAge >= 55 ? 'Switch to senior joint-support formula' : 'Standard adult maintenance diet', 'neutral', 'Supports cartilage & metabolism'),
      ]
    },
  },
  {
    id: 'pet-feeding-schedule',
    name: 'Pet Feeding Schedule',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate daily meal timing intervals for puppies, adult dogs, and cats to maintain steady blood glucose.',
    tip: 'Puppies under 6 months need 3-4 small meals daily to prevent hypoglycemia and stomach distension.',
    usage: [
      'Select pet type and life stage.',
      'Enter total daily food portion in cups or grams.',
      'Check recommended meals per day and feeding schedule times.',
    ],
    method: [
      'Divides total daily requirement into equal age-appropriate intervals.',
    ],
    fields: [
      sel('petLifeStage', 'Pet Type & Life Stage', [
        'Adult Dog (2 meals / day standard)',
        'Puppy under 6 Months (3 meals / day)',
        'Senior Dog (2 smaller easily digestible meals)',
        'Adult Cat (2-3 meals / day)',
        'Kitten under 6 Months (3-4 meals / day)',
      ], 'Adult Dog (2 meals / day standard)'),
      n('dailyCups', 'Total Daily Food Allocation (Cups)', { def: 2.5, min: 0.25, max: 10, step: 0.25 }),
    ],
    compute: (v) => {
      const stage = asSel(v.petLifeStage)
      const totalCups = asNum(v.dailyCups, 2.5)

      let mealCount = 2
      let times = '7:30 AM & 6:00 PM'
      if (stage.includes('3 meals')) {
        mealCount = 3
        times = '7:30 AM, 1:00 PM & 6:30 PM'
      } else if (stage.includes('3-4 meals')) {
        mealCount = 4
        times = '7:00 AM, 11:30 AM, 4:00 PM & 8:30 PM'
      }

      const portionPerMeal = totalCups / mealCount

      return [
        res('Portion per Meal', `${numD(portionPerMeal, 2)} cups`, 'good', `${mealCount} meals daily`),
        res('Recommended Timing', times, 'info', 'Consistent schedule improves digestion'),
        res('Total Daily Allocation', `${totalCups} cups`, 'neutral', 'Measure with standard measuring cup'),
        res('Hydration Reminder', 'Provide clean, fresh water 24/7', 'good', 'Wash bowls daily to prevent bacteria'),
      ]
    },
  },
  {
    id: 'pet-food-portion-calculator',
    name: 'Pet Food Portion Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate Resting Energy Requirements (RER) and daily caloric targets (kcal) for canine and feline weight management.',
    tip: 'Always use your pet\'s IDEAL target weight in the RER formula if they are currently overweight.',
    usage: [
      'Select species (Dog vs Cat).',
      'Enter pet body weight in pounds or kg.',
      'Select activity and neuter status.',
      'Enter kibble caloric density (kcal/cup from bag label).',
      'Check exact daily calories and daily measuring cups required.',
    ],
    method: [
      'RER (Resting Energy Requirement) = 70 * (Weight in kg)^0.75.',
      'Maintenance Energy Requirement (MER) = RER * Life Stage Factor (1.4 - 1.8).',
      'Daily Cups = MER / kcal per cup.',
    ],
    fields: [
      sel('species', 'Species', ['Dog', 'Cat'], 'Dog'),
      n('weightLbs', 'Pet Weight (Pounds)', { def: 45, min: 2, max: 200, step: 1 }),
      sel('activityStatus', 'Activity Level & Neuter Status', [
        'Neutered / Spayed Adult (Normal activity - 1.6x RER)',
        'Intact Adult (Active - 1.8x RER)',
        'Sedentary / Prone to Weight Gain (1.2x - 1.4x RER)',
        'High Energy Working / Agility Dog (2.0x - 3.0x RER)',
        'Indoor Neutered Cat (1.2x RER)',
      ], 'Neutered / Spayed Adult (Normal activity - 1.6x RER)'),
      n('kibbleKcalPerCup', 'Kibble Calorie Density (kcal / cup from bag)', { def: 375, min: 200, max: 600, step: 5 }),
    ],
    compute: (v) => {
      const sp = asSel(v.species)
      const lbs = asNum(v.weightLbs, 45)
      const act = asSel(v.activityStatus)
      const kcalCup = asNum(v.kibbleKcalPerCup, 375)

      const kg = lbs * 0.453592
      const rer = 70 * Math.pow(kg, 0.75)

      let factor = 1.6
      if (sp === 'Cat' || act.includes('Indoor Neutered Cat')) factor = 1.2
      else if (act.includes('Sedentary')) factor = 1.3
      else if (act.includes('Intact Adult')) factor = 1.8
      else if (act.includes('Working')) factor = 2.4

      const dailyKcal = Math.round(rer * factor)
      const dailyCups = dailyKcal / kcalCup

      return [
        res('Daily Caloric Target', `${num(dailyKcal)} kcal/day`, 'good', `RER: ${Math.round(rer)} kcal base`),
        res('Daily Kibble Portion', `${numD(dailyCups, 2)} cups/day`, 'good', `@ ${kcalCup} kcal/cup`),
        res('Per Meal (2x / Day)', `${numD(dailyCups / 2, 2)} cups each`, 'info', 'Morning and evening'),
        res('Body Condition Check', 'You should easily feel ribs without pressing hard', 'neutral', 'Veterinary 9-point BCS standard'),
      ]
    },
  },
  {
    id: 'pet-food-cost-calculator',
    name: 'Pet Food Cost Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate monthly and annual feeding expenses from bag price, bag weight, and daily consumption portions.',
    tip: 'Buying large 30 lb bags usually cuts pet food cost per pound by 25% to 40% compared to small 5 lb retail bags.',
    usage: [
      'Enter dry food bag price and net weight in pounds.',
      'Enter daily cups consumed.',
      'Check cost per day, cost per month, and annual food expenditure.',
    ],
    method: [
      '1 cup dry kibble ≈ 0.25 lbs (4 cups per lb).',
      'Days per Bag = (Bag Weight * 4) / Daily Cups.',
      'Cost per Day = Bag Price / Days per Bag.',
    ],
    fields: [
      n('bagPrice', 'Dry Pet Food Bag Price ($)', { def: 64.99, min: 10, max: 200, step: 1 }),
      n('bagWeightLbs', 'Bag Weight (Pounds)', { def: 28, min: 2, max: 50, step: 1 }),
      n('dailyCups', 'Daily Consumption (Cups/Day)', { def: 2.25, min: 0.25, max: 10, step: 0.25 }),
    ],
    compute: (v) => {
      const price = asNum(v.bagPrice, 64.99)
      const weight = asNum(v.bagWeightLbs, 28)
      const cups = asNum(v.dailyCups, 2.25)

      const totalCupsInBag = weight * 4.0 // approx 4 cups/lb
      const daysPerBag = totalCupsInBag / cups
      const dailyCost = price / daysPerBag
      const monthlyCost = dailyCost * 30.4
      const annualCost = dailyCost * 365

      return [
        res('Monthly Food Cost', money(monthlyCost), 'good', `~${numD(30.4 / daysPerBag, 1)} bags/month`),
        res('Bag Lifespan', `~${Math.round(daysPerBag)} days`, 'info', `${weight} lb bag lasts ${Math.round(daysPerBag / 7)} weeks`),
        res('Daily Feeding Cost', money(dailyCost), 'neutral', `${cups} cups daily`),
        res('Annual Food Budget', money(annualCost), 'info', 'Yearly nutrition budget'),
      ]
    },
  },
  {
    id: 'pet-treat-budget-calculator',
    name: 'Pet Treat Budget Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Enforce the veterinary 10% Treat Calorie Rule to prevent obesity and allocate monthly training treat spending.',
    tip: 'Treats should NEVER exceed 10% of a pet\'s total daily caloric intake to prevent nutritional imbalances.',
    usage: [
      'Enter your pet\'s total daily calories (kcal).',
      'Select treat type (Training bites, dental chews, jerky).',
      'Check maximum safe treat calories and monthly treat spending cap.',
    ],
    method: [
      'Max Treat Calories = Daily Caloric Target * 10%.',
    ],
    fields: [
      n('dailyKcal', 'Pet Total Daily Caloric Target (kcal)', { def: 950, min: 150, max: 3000, step: 25 }),
      n('monthlyTreatBudget', 'Monthly Treat Spending Budget ($)', { def: 25, min: 5, max: 150, step: 5 }),
    ],
    compute: (v) => {
      const total = asNum(v.dailyKcal, 950)
      const budget = asNum(v.monthlyTreatBudget, 25)

      const maxTreatKcal = Math.round(total * 0.10)
      const mainDietKcal = total - maxTreatKcal
      const trainingBitesApprox = Math.round(maxTreatKcal / 3) // ~3 kcal per training bite

      return [
        res('Max Treat Calorie Limit', `${maxTreatKcal} kcal/day`, 'warn', 'Strict 10% veterinary maximum'),
        res('Training Bites Equivalent', `Up to ${trainingBitesApprox} small bites/day`, 'good', 'Low-calorie 3-kcal training treats'),
        res('Main Food Calories', `${mainDietKcal} kcal/day`, 'good', 'Must provide 90%+ of nutrition'),
        res('Budget Allocation', money(budget) + '/month', 'info', `~${moneyC(budget / 30.4)}/day`),
      ]
    },
  },
  {
    id: 'pet-weight-tracker',
    name: 'Pet Weight Tracker',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Track body weight changes against veterinary targets and calculate safe weekly weight loss percentages.',
    tip: 'Safe pet weight loss is 1% to 2% of total body weight per week; losing weight faster risks feline hepatic lipidosis.',
    usage: [
      'Enter current pet weight and veterinarian target weight.',
      'Check weight surplus/deficit, target weeks to goal, and Body Condition Score (BCS).',
    ],
    method: [
      'Safe Weekly Loss = Current Weight * 0.015 (1.5% per week).',
      'Weeks to Goal = Excess Weight / Safe Weekly Loss.',
    ],
    fields: [
      n('currentWeight', 'Current Weight (Pounds)', { def: 54, min: 2, max: 200, step: 0.5 }),
      n('targetWeight', 'Vet-Recommended Target Weight (Pounds)', { def: 45, min: 2, max: 190, step: 0.5 }),
    ],
    compute: (v) => {
      const cur = asNum(v.currentWeight, 54)
      const tgt = asNum(v.targetWeight, 45)

      const diff = cur - tgt
      const pctOver = (diff / tgt) * 100

      if (diff <= 0) {
        return [
          res('Weight Status', 'Ideal Target Weight', 'good', `${cur} lbs maintains healthy body condition`),
          res('Action', 'Maintain current caloric intake', 'good', 'Monitor monthly'),
          res('Body Score', 'BCS 4-5 of 9 (Ideal)', 'good', 'Tuck visible, ribs palpable'),
          res('Health Risk', 'Minimal joint & diabetes risk', 'good', 'Optimal longevity'),
        ]
      }

      const safeWeeklyLoss = cur * 0.015
      const weeksNeeded = Math.ceil(diff / safeWeeklyLoss)

      return [
        res('Weight Difference', `+${numD(diff, 1)} lbs overweight`, 'bad', `${pct(pctOver)} over ideal`),
        res('Safe Weekly Loss Target', `~${numD(safeWeeklyLoss, 2)} lbs/week`, 'good', '1.5% per week safe pace'),
        res('Weeks to Target Weight', `~${weeksNeeded} weeks`, 'info', `${Math.round(weeksNeeded / 4.33)} months disciplined diet`),
        res('Health Impact', 'Reduces arthritis pain and cardiovascular strain', 'good', 'Weigh bi-weekly on same scale'),
      ]
    },
  },
  {
    id: 'pet-growth-tracker',
    name: 'Pet Growth Tracker',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Estimate adult mature dog weight from puppy weight at 16 weeks (4 months) across small, medium, and giant breeds.',
    tip: 'Medium-to-large breed puppies reach approximately 50% of their adult weight around 16 weeks (4 months) of age.',
    usage: [
      'Enter puppy current weight in pounds.',
      'Enter puppy age in weeks.',
      'Check predicted mature adult weight range.',
    ],
    method: [
      'Adult Weight ≈ (Puppy Weight / Age in Weeks) * 52 (for medium breeds).',
      'At 16 weeks: Small breeds are ~65% adult weight, Large breeds are ~50%.',
    ],
    fields: [
      n('puppyWeight', 'Current Puppy Weight (Pounds)', { def: 24, min: 1, max: 100, step: 0.5 }),
      n('puppyAgeWeeks', 'Puppy Age (Weeks)', { def: 16, min: 6, max: 48, step: 1 }),
      sel('sizeClass', 'Expected Breed Size Category', [
        'Small Breed (< 25 lbs adult)',
        'Medium Breed (25 - 55 lbs adult)',
        'Large Breed (56 - 90 lbs adult)',
        'Giant Breed (90+ lbs adult)',
      ], 'Medium Breed (25 - 55 lbs adult)'),
    ],
    compute: (v) => {
      const w = asNum(v.puppyWeight, 24)
      const age = asNum(v.puppyAgeWeeks, 16)
      const sc = asSel(v.sizeClass)

      let adultPct = 0.50
      if (sc.includes('Small')) adultPct = Math.min(0.95, (age / 36))
      else if (sc.includes('Giant')) adultPct = Math.min(0.85, (age / 72))
      else adultPct = Math.min(0.90, (age / 52))

      adultPct = Math.max(0.15, adultPct)
      const estAdultWeight = Math.round(w / adultPct)

      return [
        res('Predicted Adult Weight', `~${estAdultWeight} lbs`, 'good', `Range: ${Math.round(estAdultWeight * 0.9)} - ${Math.round(estAdultWeight * 1.1)} lbs`),
        res('Growth Completion', `${Math.round(adultPct * 100)}% of adult size`, 'info', `${w} lbs @ ${age} weeks`),
        res('Full Maturity Timeline', sc.includes('Giant') ? '18 to 24 months' : sc.includes('Large') ? '14 to 18 months' : '10 to 12 months', 'neutral', 'Large dogs mature slower'),
        res('Food Formula Tip', sc.includes('Large') || sc.includes('Giant') ? 'Use Large Breed Puppy food with controlled calcium' : 'Standard puppy formula', 'good', 'Prevents rapid growth skeletal disorders'),
      ]
    },
  },
  {
    id: 'pet-exercise-planner',
    name: 'Pet Exercise Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate daily physical exercise and mental stimulation targets based on breed group, energy level, and age.',
    tip: 'Mental enrichment (puzzle feeders, snuffle mats, scent work) tires an active dog faster than physical walking alone.',
    usage: [
      'Select breed energy profile (Working/Herding, Sporting, Companion/Lapdog).',
      'Select pet age.',
      'Check daily walking minutes and recommended mental games.',
    ],
    method: [
      'Working/Herding: 90-120 min daily. Sporting: 60-90 min. Companion: 30-45 min.',
    ],
    fields: [
      sel('breedEnergy', 'Breed Energy Profile', [
        'High Energy: Herding & Working (Border Collie, Malinois, Husky ~90-120 min)',
        'Sporting / Retrievers (Labrador, Golden, Pointers ~60-90 min)',
        'Moderate Energy: Terriers & Hounds (~45-60 min)',
        'Low Energy / Companion: French Bulldog, Shih Tzu (~30 min)',
        'Senior Dog (Low impact gentle strolling ~20-30 min)',
      ], 'Sporting / Retrievers (Labrador, Golden, Pointers ~60-90 min)'),
    ],
    compute: (v) => {
      const be = asSel(v.breedEnergy)

      let mins = 60
      if (be.includes('High Energy')) mins = 105
      else if (be.includes('Moderate')) mins = 50
      else if (be.includes('Low Energy')) mins = 30
      else if (be.includes('Senior')) mins = 25

      return [
        res('Daily Physical Exercise', `${mins} minutes/day`, 'good', 'Split into 2 daily sessions'),
        res('Mental Enrichment Target', '20 minutes daily', 'info', 'Puzzle toys, sniffing games, obedience training'),
        res('Behavioral Benefit', 'Reduces nuisance barking and destructive chewing', 'good', '"A tired dog is a good dog"'),
        res('Weather Safety', 'Avoid asphalt walks when pavement temp > 120°F', 'warn', 'If too hot for bare hand 7 sec, too hot for paws'),
      ]
    },
  },
  {
    id: 'dog-walking-schedule',
    name: 'Dog Walking Schedule',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Plan daily morning, midday, and evening walking times and calculate weekly miles logged with your dog.',
    tip: 'Regular sniff walks ("sniffaris") provide vital decompression and trigger dopamine release in your dog\'s brain.',
    usage: [
      'Enter daily walk minutes across morning, afternoon, and evening.',
      'Check total weekly hours and estimated miles walked.',
    ],
    method: [
      'Walking speed ≈ 3.0 mph (20 minutes per mile).',
      'Weekly Miles = (Total Daily Minutes * 7) / 20.',
    ],
    fields: [
      n('morningWalkMins', 'Morning Walk Duration (Minutes)', { def: 25, min: 5, max: 90, step: 5 }),
      n('middayBreakMins', 'Midday Relief / Walk (Minutes)', { def: 15, min: 0, max: 60, step: 5 }),
      n('eveningWalkMins', 'Evening Walk Duration (Minutes)', { def: 30, min: 5, max: 90, step: 5 }),
    ],
    compute: (v) => {
      const am = asNum(v.morningWalkMins, 25)
      const mid = asNum(v.middayBreakMins, 15)
      const pm = asNum(v.eveningWalkMins, 30)

      const dailyMins = am + mid + pm
      const weeklyHours = (dailyMins * 7) / 60
      const weeklyMiles = (dailyMins * 7) / 20 // 20 min/mile

      return [
        res('Daily Walk Time', `${dailyMins} minutes/day`, 'good', '3 daily walks'),
        res('Weekly Distance Logged', `~${numD(weeklyMiles, 1)} miles/week`, 'info', `${numD(weeklyHours, 1)} hours walking`),
        res('Human Calories Burned', `~${Math.round(dailyMins * 4.5 * 7)} kcal/wk`, 'good', 'Great fitness bonus for owners'),
        res('Leash Protocol', 'Use a 6-ft standard leash (Avoid retractables)', 'neutral', 'Retractables can cause friction burns'),
      ]
    },
  },
  {
    id: 'cat-care-schedule',
    name: 'Cat Care Schedule',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Daily and weekly schedule covering litter box scooping, water fountain washing, brushing, and interactive play.',
    tip: 'The gold standard litter box rule is "Number of cats + 1" (e.g. 2 cats require 3 litter boxes).',
    usage: [
      'Enter number of household cats.',
      'Check recommended litter box count, daily scooping schedule, and water fountain cleaning cycle.',
    ],
    method: [
      'Litter Boxes = Cats + 1. Daily scooping frequency = Max(1, Cats).',
    ],
    fields: [
      n('catCount', 'Number of Cats in Home', { def: 2, min: 1, max: 8, step: 1 }),
      sel('coatLength', 'Cat Coat Length', [
        'Short Hair (Brush 1x / week)',
        'Medium Hair (Brush 2-3x / week)',
        'Long Hair / Persian / Maine Coon (Brush daily)',
      ], 'Short Hair (Brush 1x / week)'),
    ],
    compute: (v) => {
      const cats = asNum(v.catCount, 2)
      const coat = asSel(v.coatLength)

      const boxes = cats + 1
      const scoopTimes = cats >= 2 ? 'Twice daily (Morning & Evening)' : 'Once daily'

      return [
        res('Recommended Litter Boxes', `${boxes} boxes`, 'good', 'N+1 formula prevents territorial accidents'),
        res('Litter Scooping Frequency', scoopTimes, 'info', 'Complete litter dump & scrub monthly'),
        res('Coat Brushing Routine', coat.split('(')[1]?.replace(')', '') || 'Regular brushing', 'good', 'Prevents hairballs & matting'),
        res('Play Session Target', '15 minutes of feather wand interactive play daily', 'info', 'Simulates predatory hunting cycle'),
      ]
    },
  },
  {
    id: 'pet-grooming-planner',
    name: 'Pet Grooming Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Schedule professional or DIY grooming appointments for hair cutting, de-shedding, and ear cleaning.',
    tip: 'Breeds with continuously growing hair (Poodles, Doodles, Shih Tzus) require professional clipping every 4 to 6 weeks.',
    usage: [
      'Select dog breed coat type (Double coat, Single non-shedding, Wire, Smooth).',
      'Check grooming cycle in weeks and de-shedding protocol.',
    ],
    method: [
      'Maps coat anatomy to salon haircut and de-shedding frequency.',
    ],
    fields: [
      sel('coatType', 'Dog Coat Type', [
        'Continuous Growing / Poodle / Doodle (Clip every 4-6 weeks)',
        'Double Coat / Shedding (Golden, Husky - De-shed every 8-10 weeks; NEVER shave)',
        'Short Smooth Coat (Boxer, Beagle - Bath & brush every 6-8 weeks)',
        'Wirehair (Terriers - Hand strip or clip every 8 weeks)',
      ], 'Continuous Growing / Poodle / Doodle (Clip every 4-6 weeks)'),
      n('proGroomCost', 'Professional Grooming Cost per Visit ($)', { def: 85, min: 30, max: 250, step: 5 }),
    ],
    compute: (v) => {
      const ct = asSel(v.coatType)
      const cost = asNum(v.proGroomCost, 85)

      let weeks = 6
      if (ct.includes('Double Coat')) weeks = 8
      else if (ct.includes('Short Smooth')) weeks = 8

      const visitsPerYear = Math.round(52 / weeks)
      const annualCost = visitsPerYear * cost

      return [
        res('Grooming Interval', `Every ${weeks} weeks`, 'good', ct.split('(')[0].trim()),
        res('Visits per Year', `~${visitsPerYear} salon visits`, 'info', 'Keeps coat healthy & mat-free'),
        res('Annual Grooming Budget', money(annualCost), 'neutral', `@ ${money(cost)} per full groom`),
        res('Golden Rule', ct.includes('Double Coat') ? 'NEVER SHAVE double coats (Destroys thermal insulation)' : 'Daily line brushing prevents matted pelt', ct.includes('Double Coat') ? 'warn' : 'good', 'Preserves coat health'),
      ]
    },
  },
  {
    id: 'pet-bathing-schedule',
    name: 'Pet Bathing Schedule',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate safe bathing intervals to avoid stripping natural protective skin sebum oils.',
    tip: 'Bathing dogs too frequently (e.g. weekly) strips skin lipids, causing dry skin, flaking, and intense itching.',
    usage: [
      'Select dog lifestyle (Active outdoor mud enthusiast vs indoor couch potato).',
      'Select skin sensitivity status.',
      'Check recommended bathing frequency and shampoo pH guidelines.',
    ],
    method: [
      'Healthy dogs: every 4-8 weeks. Medical medicated baths: per vet prescription.',
    ],
    fields: [
      sel('lifestyle', 'Dog Outdoor Lifestyle', [
        'Moderate Indoor Dog (Bathe every 6-8 weeks)',
        'Active Outdoor / Trail Dog (Bathe every 3-4 weeks or as muddy)',
        'Skin Allergy / Medicated Baths (Per vet protocol ~weekly)',
      ], 'Moderate Indoor Dog (Bathe every 6-8 weeks)'),
    ],
    compute: (v) => {
      const ls = asSel(v.lifestyle)

      return [
        res('Bathing Cadence', ls.split('(')[1]?.replace(')', '') || 'Every 4-6 weeks', 'good', ls.split('(')[0].trim()),
        res('Shampoo Formula Rule', 'Use Dog-Specific pH Balanced Shampoo (pH 6.5-7.5)', 'good', 'Human shampoo (pH 5.5) is too acidic for dogs'),
        res('Water Temperature', 'Lukewarm water only (Never hot)', 'info', 'Hot water triggers skin inflammation'),
        res('Ear Drying Tip', 'Gently dry ear canals with cotton ball after bath', 'neutral', 'Trapped moisture breeds yeast infections'),
      ]
    },
  },
  {
    id: 'pet-nail-trimming-reminder',
    name: 'Pet Nail Trimming Reminder',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Schedule nail trimming or Dremel grinding intervals and learn how to manage the vascular nail quick.',
    tip: 'If you can hear your dog\'s nails clicking on hardwood floors, their nails are too long and stress paw joints.',
    usage: [
      'Select walking surface (Frequent pavement walks vs grass/indoor only).',
      'Check nail trimming frequency and quick-shortening protocol.',
    ],
    method: [
      'Pavement walks naturally file nails (trim every 3-4 wks); indoor/grass dogs require trimming every 2 wks.',
    ],
    fields: [
      sel('surface', 'Primary Walking Surfaces', [
        'Pavement & Concrete (Natural wear - trim every 3-4 weeks)',
        'Grass / Turf & Soft Carpet (Minimal wear - trim every 2-3 weeks)',
      ], 'Pavement & Concrete (Natural wear - trim every 3-4 weeks)'),
      ck('haveStyptic', 'Have styptic powder / Kwik Stop on hand to stop bleeding if quick is nicked', true),
    ],
    compute: (v) => {
      const surf = asSel(v.surface)
      const styptic = v.haveStyptic

      const weeks = surf.includes('Pavement') ? '3 to 4 weeks' : '2 weeks'

      return [
        res('Trimming Interval', `Every ${weeks}`, 'good', 'Prevents splayed toes & joint arthritis'),
        res('Emergency Styptic', styptic ? 'Styptic Ready' : 'BUY STYPTIC POWDER', styptic ? 'good' : 'bad', 'Immediately clots accidental quick nicks'),
        res('Sound Indicator', 'Nails should NOT click on hard floors', 'info', 'Clicking = Too long'),
        res('Tool Preference', 'Rotary Dremel grinder smooths edges without pinching', 'good', 'Reduces accidental quick cutting'),
      ]
    },
  },
  {
    id: 'pet-dental-care-reminder',
    name: 'Pet Dental Care Reminder',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Schedule toothbrushing routines and professional veterinary dental cleanings under anesthesia.',
    tip: 'Over 80% of dogs and cats over age 3 show active periodontal disease, which can lead to heart and kidney disease.',
    usage: [
      'Select current tooth brushing frequency.',
      'Enter pet age.',
      'Check dental care score and professional scaling timeline.',
    ],
    method: [
      'Gold standard: Daily brushing with enzymatic pet toothpaste.',
    ],
    fields: [
      sel('brushingFreq', 'Home Tooth Brushing Frequency', [
        'Daily / Every other day (Veterinary Gold Standard)',
        '1-2 Times per week (Moderate protection)',
        'Never / Dental chews only (High calculus risk)',
      ], '1-2 Times per week (Moderate protection)'),
      n('petAge', 'Pet Age (Years)', { def: 4, min: 1, max: 18, step: 1 }),
    ],
    compute: (v) => {
      const bf = asSel(v.brushingFreq)
      const age = asNum(v.petAge, 4)

      const isGood = bf.includes('Daily')
      const needsVetCheck = age >= 3

      return [
        res('Dental Health Grade', isGood ? 'Grade A (Excellent)' : bf.includes('1-2') ? 'Grade B (Acceptable)' : 'Grade C (High Plaque Risk)', isGood ? 'good' : 'warn', 'Prevents periodontal bone loss'),
        res('Professional Dental Exam', needsVetCheck ? 'Annual veterinary oral exam recommended' : 'Check puppy/kitten bite alignment', 'info', `${age} years old`),
        res('Enzymatic Toothpaste', 'NEVER use human toothpaste (Fluoride & Xylitol toxic)', 'bad', 'Use poultry/beef flavored enzymatic paste'),
        res('VOHC Approval', 'Use VOHC-Accepted dental treats only', 'good', 'Scientifically proven plaque reduction'),
      ]
    },
  },
  {
    id: 'pet-vaccination-schedule',
    name: 'Pet Vaccination Schedule',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Track Core (Rabies, DHPP, FVRCP) and Non-Core (Bordetella, Lyme, FeLV) vaccination boosters.',
    tip: 'Rabies is legally mandated by law; modern DHPP and FVRCP core vaccines provide 3-year immune protection after the 1-year booster.',
    usage: [
      'Select pet species.',
      'Select vaccination history stage (Puppy/Kitten series, 1-year booster, Adult 3-year cycle).',
      'Check core vaccine roster and renewal due dates.',
    ],
    method: [
      'Core AAHA / AAFP vaccine guidelines: 3-year Rabies & DHPP/FVRCP.',
    ],
    fields: [
      sel('species', 'Pet Species', ['Dog', 'Cat'], 'Dog'),
      sel('cycleStage', 'Vaccination Cycle Stage', [
        'Adult 3-Year Booster Cycle (Rabies & Core DA2PP/FVRCP)',
        'Annual Non-Core Boosters (Bordetella kennel cough, Leptospirosis, Lyme)',
        'Puppy / Kitten Initial Series (8, 12, 16 weeks)',
      ], 'Adult 3-Year Booster Cycle (Rabies & Core DA2PP/FVRCP)'),
    ],
    compute: (v) => {
      const sp = asSel(v.species)
      const stage = asSel(v.cycleStage)

      const coreName = sp === 'Dog' ? 'Rabies + DHPP (Distemper, Parvo, Adenovirus)' : 'Rabies + FVRCP (Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia)'

      return [
        res('Core Vaccine Suite', coreName, 'good', 'Legally & medically essential'),
        res('Renewal Cadence', stage.includes('3-Year') ? 'Every 3 Years' : stage.includes('Annual') ? 'Every 12 Months' : 'Every 3-4 weeks until 16 weeks', 'info', stage.split('(')[0].trim()),
        res('Boarding / Daycare Requirements', sp === 'Dog' ? 'Bordetella + Leptospirosis required by salons' : 'FeLV recommended for outdoor cats', 'warn', 'Check facility policies 2 weeks prior'),
        res('Certificate Retention', 'Keep Rabies certificate and metallic collar tag', 'good', 'Proof of municipal licensing'),
      ]
    },
  },
  {
    id: 'pet-deworming-reminder',
    name: 'Pet Deworming Reminder',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Schedule broad-spectrum intestinal parasite screening and deworming treatments for roundworms, hookworms, and tapeworms.',
    tip: 'Year-round heartworm preventatives (like Heartgard or Simparica Trio) also treat and control common intestinal worms monthly.',
    usage: [
      'Select lifestyle exposure (Frequents dog parks, hunts small rodents, indoor only).',
      'Check fecal flotation test cadence and deworming schedule.',
    ],
    method: [
      'CAPC (Companion Animal Parasite Council) recommends annual fecal tests and monthly preventive.',
    ],
    fields: [
      sel('exposure', 'Parasite Risk Profile', [
        'High Risk (Dog parks, daycare, hunting rodents, outdoor access)',
        'Moderate Risk (Leashed neighborhood walks)',
        'Low Risk (100% Indoor cats)',
      ], 'High Risk (Dog parks, daycare, hunting rodents, outdoor access)'),
    ],
    compute: (v) => {
      const exp = asSel(v.exposure)

      return [
        res('Preventative Protocol', 'Monthly all-in-one chewable (Heartworm + Worms)', 'good', 'Year-round administration'),
        res('Veterinary Fecal Screen', exp.includes('High') ? 'Fecal flotation test every 6 months' : 'Annual fecal float test', 'info', 'Detects microscopic eggs & Giardia'),
        res('Tapeworm Note', 'Tapeworms are transmitted by ingesting infected fleas', 'warn', 'Flea control is primary defense'),
        res('Zoonotic Risk Alert', 'Wash hands after scooping yard or litter box', 'neutral', 'Roundworms can transmit to children'),
      ]
    },
  },
  {
    id: 'pet-medication-schedule',
    name: 'Pet Medication Schedule',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Manage dosage timings, pill-pocket administration, and refill alarms for daily chronic or antibiotic pet meds.',
    tip: 'Never give human NSAIDs (Ibuprofen, Tylenol, Advil) to pets; a single tablet can cause acute, fatal kidney failure.',
    usage: [
      'Enter medication name and prescribed dosage.',
      'Select dosing frequency (Once daily, Twice daily, Every 8 hours).',
      'Check schedule interval and food-pairing instructions.',
    ],
    method: [
      'Divides 24-hour cycle into exact spacing intervals.',
    ],
    fields: [
      txt('medName', 'Medication Name', 'Carprofen (Rimadyl) 75mg'),
      sel('frequency', 'Dosing Cadence', [
        'Once Daily (Every 24 hours - Same time each morning)',
        'Twice Daily (Every 12 hours - 8:00 AM & 8:00 PM)',
        'Three Times Daily (Every 8 hours)',
      ], 'Twice Daily (Every 12 hours - 8:00 AM & 8:00 PM)'),
      ck('giveWithFood', 'Administer with food or treat pocket', true),
    ],
    compute: (v) => {
      const med = asStr(v.medName, 'Medication')
      const freq = asSel(v.frequency)
      const food = v.giveWithFood

      return [
        res('Medication Logged', med, 'good', freq.split('(')[0].trim()),
        res('Timing Schedule', freq.split('(')[1]?.replace(')', '') || 'Regular schedule', 'info', 'Strict timing maintains therapeutic blood levels'),
        res('Food Pairing', food ? 'Administer WITH meal or pill pocket' : 'Can give on empty stomach', food ? 'good' : 'neutral', 'Prevents stomach irritation'),
        res('Safety Warning', 'Complete the full course; do not stop antibiotics early', 'warn', 'Prevents bacterial resistance'),
      ]
    },
  },
  {
    id: 'pet-vet-visit-planner',
    name: 'Pet Vet Visit Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Prepare questions, symptom logs, fecal sample bags, and carrier prep before heading to the veterinary clinic.',
    tip: 'Leave your cat\'s carrier open in your living room with a cozy towel for 3 days prior to the visit to reduce stress.',
    usage: [
      'Review pre-appointment prep checklist.',
      'Check off fasting requirements (if bloodwork/sedation needed), fecal sample collection, and questions.',
    ],
    method: [
      'Validates clinic visit preparation readiness.',
    ],
    fields: [
      ck('fecalSampleFresh', 'Fresh fecal sample collected within 4-6 hours in sealed plastic bag', true),
      ck('vaccineRecords', 'Have printed/digital copy of past vaccination certificates', true),
      ck('symptomVideo', 'Recorded video on phone if pet displays intermittent limping or cough', false),
      ck('fastingConfirmed', 'Fasted pet for 8-12 hours if routine chemistry bloodwork is scheduled', false),
    ],
    compute: (v) => {
      const items = [
        v.fecalSampleFresh,
        v.vaccineRecords,
        v.symptomVideo,
        v.fastingConfirmed,
      ]
      const count = items.filter(Boolean).length

      return [
        res('Vet Prep Readiness', `${count} of 4 steps ready`, count >= 3 ? 'good' : 'warn', 'Smooth veterinary consultation'),
        res('Fecal Sample Status', v.fecalSampleFresh ? 'Sample Ready' : 'Collect fresh morning sample', v.fecalSampleFresh ? 'good' : 'warn', 'Required for microscopic parasite check'),
        res('Behavior Video Tip', v.symptomVideo ? 'Video Evidence Ready' : 'Take video of limping/cough at home', v.symptomVideo ? 'good' : 'info', 'Pets often hide symptoms in the clinic'),
        res('Carrier Comfort', 'Spray carrier with Feliway / Adaptil pheromones 15 min prior', 'neutral', 'Reduces travel anxiety'),
      ]
    },
  },
  {
    id: 'pet-medical-record',
    name: 'Pet Medical Record',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Consolidate microchip ID number, primary clinic phone, medical allergies, and emergency veterinary hospital contacts.',
    tip: 'Ensure your microchip is registered with your current phone number and address in the universal pet recovery database.',
    usage: [
      'Enter pet name and 15-digit ISO microchip number.',
      'Enter primary vet and 24/7 emergency vet phone numbers.',
      'Generate an emergency veterinary summary record.',
    ],
    method: [
      'Formats permanent emergency medical dossier.',
    ],
    fields: [
      txt('petName', 'Pet Name', 'Max'),
      txt('microchipNum', '15-Digit Microchip Number', '985141002345678'),
      txt('primaryVet', 'Primary Veterinary Clinic & Phone', 'Oakridge Animal Hospital (555-0192)'),
      txt('erVet', 'Nearest 24/7 Emergency Vet Clinic', 'Metropolitan ER Vet Center (555-0911)'),
    ],
    compute: (v) => {
      const name = asStr(v.petName, 'Pet')
      const chip = asStr(v.microchipNum, 'Unregistered')
      const pVet = asStr(v.primaryVet, 'Primary Vet')
      const er = asStr(v.erVet, 'Emergency Clinic')

      return [
        res('Medical Dossier', name, 'good', 'Universal identification record'),
        res('Microchip ID', chip, 'info', 'Universal 15-digit scanner standard'),
        res('Primary Care', pVet, 'neutral', 'Regular medical history records'),
        res('Emergency Hospital', er, 'bad', 'Call ahead while en route in emergencies'),
      ]
    },
  },
  {
    id: 'pet-expense-tracker',
    name: 'Pet Expense Tracker',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Consolidate annual pet ownership expenses across food, veterinary care, grooming, toys, and insurance.',
    tip: 'The lifetime cost of owning a medium dog ranges from $15,000 to $28,000 over 12-14 years.',
    usage: [
      'Enter monthly food, monthly insurance, annual veterinary bills, and grooming costs.',
      'Check total annual cost of pet ownership and levelized monthly budget.',
    ],
    method: [
      'Annual Total = (Monthly Food * 12) + (Monthly Ins * 12) + Annual Vet + Annual Grooming + Supplies.',
    ],
    fields: [
      n('monthlyFood', 'Monthly Food & Treats ($)', { def: 75, min: 10, max: 400, step: 5 }),
      n('monthlyInsurance', 'Monthly Pet Health Insurance ($)', { def: 48, min: 0, max: 200, step: 2 }),
      n('annualVetWellness', 'Annual Vet Exams, Vaccines & Preventatives ($)', { def: 420, min: 50, max: 3000, step: 25 }),
      n('annualGrooming', 'Annual Grooming / Hygiene ($)', { def: 240, min: 0, max: 2000, step: 10 }),
      n('annualSupplies', 'Toys, Gear, Waste Bags & Bedding ($)', { def: 150, min: 0, max: 1000, step: 10 }),
    ],
    compute: (v) => {
      const food = asNum(v.monthlyFood, 75)
      const ins = asNum(v.monthlyInsurance, 48)
      const vet = asNum(v.annualVetWellness, 420)
      const groom = asNum(v.annualGrooming, 240)
      const gear = asNum(v.annualSupplies, 150)

      const annualTotal = (food * 12) + (ins * 12) + vet + groom + gear
      const levelizedMonthly = annualTotal / 12

      return [
        res('Total Annual Pet Expense', money(annualTotal), 'good', 'All-inclusive cost of care'),
        res('Levelized Monthly Budget', money(levelizedMonthly), 'info', 'Dedicated monthly reserve allocation'),
        res('Food vs Healthcare Share', `${Math.round(((food * 12) / annualTotal) * 100)}% Food / ${Math.round(((vet + ins * 12) / annualTotal) * 100)}% Medical`, 'neutral', 'Largest financial drivers'),
        res('Emergency Fund Reserve', 'Maintain $1,000 - $1,500 dedicated pet emergency fund', 'warn', 'Covers sudden diagnostics or deductibles'),
      ]
    },
  },
  {
    id: 'pet-insurance-cost-tracker',
    name: 'Pet Insurance Cost Tracker',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Compare pet insurance monthly premiums against annual deductibles and 70%-90% reimbursement rates.',
    tip: 'Pet insurance does NOT cover pre-existing conditions; enroll your pet as a healthy puppy or kitten for maximum coverage.',
    usage: [
      'Enter monthly premium ($/mo).',
      'Enter annual deductible and reimbursement percentage (70%, 80%, 90%).',
      'Simulate a $3,500 emergency foreign body surgery to evaluate out-of-pocket savings.',
    ],
    method: [
      'Insurer Pays = Max(0, (Claim - Deductible)) * Reimbursement Rate.',
      'Out of Pocket = Claim - Insurer Pays + Annual Premium.',
    ],
    fields: [
      n('monthlyPremium', 'Monthly Insurance Premium ($)', { def: 45, min: 15, max: 200, step: 1 }),
      n('annualDeductible', 'Annual Deductible ($)', { def: 250, min: 0, max: 1000, step: 50 }),
      sel('reimbursementRate', 'Reimbursement Percentage', [
        '80% Reimbursement (Industry standard)',
        '90% Reimbursement (Maximum coverage)',
        '70% Reimbursement (Lower monthly premium)',
      ], '80% Reimbursement (Industry standard)'),
      n('simulatedClaim', 'Simulated Emergency Vet Claim ($)', { def: 3500, min: 500, max: 15000, step: 100 }),
    ],
    compute: (v) => {
      const prem = asNum(v.monthlyPremium, 45)
      const ded = asNum(v.annualDeductible, 250)
      const rateSel = asSel(v.reimbursementRate)
      const claim = asNum(v.simulatedClaim, 3500)

      const rate = rateSel.includes('90%') ? 0.90 : rateSel.includes('70%') ? 0.70 : 0.80
      const annualPremiums = prem * 12

      const eligibleAmount = Math.max(0, claim - ded)
      const insuranceReimburses = eligibleAmount * rate
      const netOutOfPocketOnClaim = (claim - insuranceReimburses)
      const netSavingsOnEmergency = insuranceReimburses - annualPremiums

      return [
        res('Insurance Reimburses', money(insuranceReimburses), 'good', `@ ${Math.round(rate * 100)}% after ${money(ded)} deductible`),
        res('Your Out-of-Pocket on Claim', money(netOutOfPocketOnClaim), 'warn', `Down from full ${money(claim)} bill`),
        res('Annual Policy Cost', money(annualPremiums), 'info', `${money(prem)}/month`),
        res('Net Benefit on Simulated Claim', money(netSavingsOnEmergency), netSavingsOnEmergency > 0 ? 'good' : 'neutral', netSavingsOnEmergency > 0 ? 'Protects against catastrophic financial shock' : 'Standard premium year'),
      ]
    },
  },
  {
    id: 'pet-emergency-checklist',
    name: 'Pet Emergency Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Emergency evacuation and disaster readiness kit checklist for household dogs and cats.',
    tip: 'Pack at least a 7-day supply of canned/dry pet food and bottled water in your household emergency bug-out bag.',
    usage: [
      'Review evacuation gear and pet first aid essentials.',
      'Check disaster readiness score and missing supplies.',
    ],
    method: [
      'Scores preparedness across 6 vital pet disaster criteria.',
    ],
    fields: [
      ck('foodWater7Day', '7-day sealed supply of pet food, manual can opener, and bottled water', true),
      ck('extraLeashCarrier', 'Sturdy travel carrier (cats) or slip leash + harness (dogs)', true),
      ck('medicationSupply', '2-week supply of critical prescription medications in waterproof bag', false),
      ck('vaccineProofPrinted', 'Printed physical vaccination and rabies records (required by shelters)', false),
      ck('petFirstAidKit', 'Pet first aid kit (gauze, self-adhering vet wrap, saline, styptic)', true),
      ck('comfortItem', 'Familiar blanket or toy with household scent to reduce disaster trauma', true),
    ],
    compute: (v) => {
      const items = [
        v.foodWater7Day,
        v.extraLeashCarrier,
        v.medicationSupply,
        v.vaccineProofPrinted,
        v.petFirstAidKit,
        v.comfortItem,
      ]
      const count = items.filter(Boolean).length
      const score = Math.round((count / items.length) * 100)

      return [
        res('Pet Disaster Preparedness', `${score}% Ready`, score >= 80 ? 'good' : 'warn', `${count} of ${items.length} provisions packed`),
        res('Prescription Meds', v.medicationSupply ? 'Packed' : 'CRITICAL: Pack 2-week medication reserve', v.medicationSupply ? 'good' : 'bad', 'Pharmacies may be closed post-disaster'),
        res('Shelter Access', v.vaccineProofPrinted ? 'Certified for emergency shelters' : 'Print vaccine certificates', v.vaccineProofPrinted ? 'good' : 'warn', 'Disaster shelters require proof of rabies'),
        res('Identification Tip', 'Ensure collar ID tag has current cell phone number with area code', 'info', 'Primary reuniting tool'),
      ]
    },
  },
  {
    id: 'new-pet-preparation-checklist',
    name: 'New Pet Preparation Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Complete pre-arrival checklist covering home pet-proofing, food selection, beds, crates, and vet registration.',
    tip: 'Tuck away all electrical cords and poisonous houseplants (Lilies, Philodendrons) before your new pet arrives.',
    usage: [
      'Work through arrival readiness tasks.',
      'Verify toxic plant removal and secure trash cans.',
      'Track homecoming readiness score.',
    ],
    method: [
      'Validates all foundational homecoming preparations.',
    ],
    fields: [
      ck('homeProofed', 'Electrical cords concealed and toxic houseplants removed', true),
      ck('crateBedReady', 'Crate, bedding, and designated quiet decompression space set up', true),
      ck('foodBowlsReady', 'Purchased same food brand shelter/breeder fed + stainless bowls', true),
      ck('vetScheduled', 'Initial wellness veterinary examination appointment scheduled', false),
      ck('idTagReady', 'Collar with engraved ID tag containing owner cell phone ready', true),
    ],
    compute: (v) => {
      const items = [
        v.homeProofed,
        v.crateBedReady,
        v.foodBowlsReady,
        v.vetScheduled,
        v.idTagReady,
      ]
      const done = items.filter(Boolean).length
      const score = Math.round((done / items.length) * 100)

      return [
        res('Homecoming Readiness', `${score}% Prepared`, score >= 80 ? 'good' : 'warn', `${done} of ${items.length} checks complete`),
        res('3-3-3 Rule', '3 days to decompress, 3 weeks to learn routine, 3 months to feel at home', 'info', 'Patience guideline for rescue pets'),
        res('Initial Vet Visit', v.vetScheduled ? 'Scheduled' : 'Book vet visit within first 7 days', v.vetScheduled ? 'good' : 'warn', 'Baseline wellness evaluation'),
        res('Diet Continuity', 'Keep on existing food for 7 days before slow transition', 'good', 'Prevents stress diarrhea'),
      ]
    },
  },
  {
    id: 'puppy-preparation-checklist',
    name: 'Puppy Preparation Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Puppy-specific checklist covering crate training setup, enzymatic cleaner, teething chew toys, and potty pads.',
    tip: 'Standard carpet cleaners will not remove pet urine enzymes; always use an enzymatic cleaner to prevent repeat accidents.',
    usage: [
      'Verify puppy crate sizing, enzymatic stain remover, and chew toys.',
      'Check puppy-proofing readiness score.',
    ],
    method: [
      'Scores puppy readiness across crate, potty training, teething, and safety.',
    ],
    fields: [
      ck('crateWithDivider', 'Crate with adjustable divider panel (allows crate to grow with puppy)', true),
      ck('enzymaticCleaner', 'Gallon jug of enzymatic cleaner (Rocco & Roxie / Nature’s Miracle)', true),
      ck('teethingToys', 'Variety of puppy-safe rubber chew toys (Kong, Nylabone Puppy)', true),
      ck('pottySchedulePlan', 'Committed to taking puppy out every 1-2 hours while awake', true),
      ck('xPenPlaypen', 'Puppy exercise pen (X-Pen) for safe contained play', false),
    ],
    compute: (v) => {
      const items = [
        v.crateWithDivider,
        v.enzymaticCleaner,
        v.teethingToys,
        v.pottySchedulePlan,
        v.xPenPlaypen,
      ]
      const done = items.filter(Boolean).length
      const score = Math.round((done / items.length) * 100)

      return [
        res('Puppy Readiness', `${score}% Ready`, score >= 80 ? 'good' : 'warn', `${done} of ${items.length} supplies ready`),
        res('Potty Training Golden Rule', 'Out after waking, eating, playing, and every 2 hours', 'good', 'Prevents indoor accidents'),
        res('Teething Defense', v.teethingToys ? 'Toys on Deck' : 'Stock rubber chew toys', v.teethingToys ? 'good' : 'warn', 'Redirects biting from furniture & hands'),
        res('Crate Sizing Tip', 'Size crate just big enough to stand, turn, and lie down', 'info', 'Too large encourages soiling one corner'),
      ]
    },
  },
  {
    id: 'kitten-preparation-checklist',
    name: 'Kitten Preparation Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Kitten-specific preparation covering low-entry litter trays, scratching posts, vertical climbers, and kitten formula.',
    tip: 'Provide both vertical sisal scratching posts and horizontal cardboard scratchers to discover your kitten\'s clawing preference.',
    usage: [
      'Verify low-entry kitten litter box, scratching posts, and safe breakaway collar.',
      'Check kitten-proofing score.',
    ],
    method: [
      'Validates feline juvenile safety standards.',
    ],
    fields: [
      ck('lowEntryLitter', 'Low-entry shallow litter box with non-clumping paper/clay litter', true),
      ck('scratchingPost', 'Sturdy tall sisal scratching post and cardboard scratch pads', true),
      ck('kittenFoodKcal', 'High-protein, high-calorie canned and dry kitten food', true),
      ck('breakawayCollar', 'Breakaway safety collar with bell and identification tag', true),
      ck('windowScreensSecure', 'Verified all window screens are securely locked and tear-free', false),
    ],
    compute: (v) => {
      const items = [
        v.lowEntryLitter,
        v.scratchingPost,
        v.kittenFoodKcal,
        v.breakawayCollar,
        v.windowScreensSecure,
      ]
      const count = items.filter(Boolean).length
      const score = Math.round((count / items.length) * 100)

      return [
        res('Kitten Readiness', `${score}% Ready`, score >= 80 ? 'good' : 'warn', `${count} of ${items.length} checks passing`),
        res('Litter Type Precaution', 'Use non-clumping litter until 4 months old', 'warn', 'Kittens sometimes ingest clumping litter'),
        res('Safety Collar Status', v.breakawayCollar ? 'Breakaway Safe' : 'Must use breakaway collar only', v.breakawayCollar ? 'good' : 'bad', 'Prevents strangulation if caught on furniture'),
        res('Claw Training Tip', 'Place scratching post directly next to sleeping spot', 'good', 'Cats instinctively stretch and scratch upon waking'),
      ]
    },
  },
  {
    id: 'pet-travel-checklist',
    name: 'Pet Travel Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Checklist for road trips and flights with pets covering crash-tested car harnesses, travel bowls, and health certificates.',
    tip: 'Unrestrained dogs in cars become dangerous projectiles during a 35 MPH collision; use a crash-tested harness or crate.',
    usage: [
      'Select travel mode (Automobile road trip vs Commercial airline).',
      'Review crate/restraint safety and travel documentation.',
      'Check travel readiness score.',
    ],
    method: [
      'Scores travel compliance with DOT and airline regulations.',
    ],
    fields: [
      sel('travelMode', 'Travel Mode', [
        'Automobile Road Trip (Crash-tested harness / strapped crate)',
        'Airline In-Cabin (Under seat airline-approved carrier)',
        'Airline Cargo Transport (IATA compliant rigid crate)',
      ], 'Automobile Road Trip (Crash-tested harness / strapped crate)'),
      ck('healthCertSigned', 'Veterinary Certificate of Veterinary Inspection (CVI) signed within 10 days', false),
      ck('collapsibleBowls', 'Collapsible silicone water/food bowls and bottled gallon water', true),
      ck('medsAndComfort', 'Prescription motion sickness/calming meds and familiar blanket', true),
    ],
    compute: (v) => {
      const mode = asSel(v.travelMode)
      const cvi = v.healthCertSigned

      return [
        res('Travel Mode Selected', mode.split('(')[0].trim(), 'good', 'Follow transport guidelines'),
        res('Health Certificate Status', cvi ? 'Certified for Travel' : mode.includes('Airline') ? 'REQUIRED: Schedule CVI with Vet' : 'Optional for in-state driving', cvi ? 'good' : mode.includes('Airline') ? 'bad' : 'info', 'Airlines require vet exam within 10 days'),
        res('Car Safety Warning', 'Never leave pet unattended in parked vehicle', 'bad', 'Vehicle interiors hit 115°F in under 15 minutes'),
        res('Rest Stop Cadence', 'Stop every 2 to 3 hours for potty and water', 'good', 'Keep dog leashed before opening car doors'),
      ]
    },
  },
  {
    id: 'pet-boarding-checklist',
    name: 'Pet Boarding Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Prepare food portions, vaccine paperwork, favorite bed, and emergency veterinary consent forms for boarding kennels.',
    tip: 'Pre-portion food into individual zip-top bags marked with your pet\'s name and meal (e.g. "Max - Tuesday AM") for kennel staff.',
    usage: [
      'Check off kennel boarding requirements (Vaccines, portioned meals, emergency contact).',
      'Verify kennel boarding readiness.',
    ],
    method: [
      'Validates all requirements demanded by commercial boarding facilities.',
    ],
    fields: [
      ck('vaccinesUpToDate', 'Bordetella, Rabies & DHPP vaccinated within last 12 months', true),
      ck('prePortionedBags', 'Food pre-portioned into individual labeled zip-top meal bags + 2 extra days', true),
      ck('emergencyContactForm', 'Signed veterinary emergency treatment authorization form with spending limit', false),
      ck('favoriteBlanket', 'Clean washable blanket or T-shirt smelling like home', true),
    ],
    compute: (v) => {
      const items = [
        v.vaccinesUpToDate,
        v.prePortionedBags,
        v.emergencyContactForm,
        v.favoriteBlanket,
      ]
      const count = items.filter(Boolean).length

      return [
        res('Boarding Preparation', `${count} of 4 ready`, count === 4 ? 'good' : 'warn', count === 4 ? 'Kennel-ready' : 'Complete missing forms'),
        res('Emergency Authorization', v.emergencyContactForm ? 'Authorized' : 'CRITICAL: Sign Medical Authorization', v.emergencyContactForm ? 'good' : 'warn', 'Allows kennel to transport to ER vet immediately'),
        res('Food Portioning Tip', v.prePortionedBags ? 'Portioned' : 'Bag meals individually', v.prePortionedBags ? 'good' : 'info', 'Guarantees exact dosage and zero stomach upset'),
        res('Extra Food Buffer', 'Always include 2 extra days of food', 'good', 'Protects against flight delays or travel extensions'),
      ]
    },
  },
  {
    id: 'pet-sitter-instructions-generator',
    name: 'Pet Sitter Instructions Generator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Generate a comprehensive, printable instruction sheet for in-home pet sitters, dog walkers, and house guests.',
    tip: 'Leave clear instructions on your pet\'s hiding spots and fear triggers (thunderstorms, delivery trucks, doorbells).',
    usage: [
      'Enter pet name and breed.',
      'Enter feeding schedule and walk schedule.',
      'Enter vet contact and WiFi password.',
      'Generate a structured summary document for the sitter.',
    ],
    method: [
      'Formats a complete, printable care document for pet sitters.',
    ],
    fields: [
      txt('petName', 'Pet Name & Breed', 'Charlie (Golden Retriever)'),
      txt('feedingInstructions', 'Feeding Instructions', '1.25 cups dry food at 7:30 AM & 6:00 PM with splash of water'),
      txt('vetEmergency', 'Veterinary Emergency Clinic', 'Downtown ER Vet (555-0199) - Account #9822'),
      txt('alarmWifi', 'Home Alarm / WiFi Info', 'WiFi: HomeNet / Key: barkbark2026'),
    ],
    compute: (v) => {
      const name = asStr(v.petName, 'Pet')
      const feed = asStr(v.feedingInstructions, 'Standard feeding')
      const vet = asStr(v.vetEmergency, 'Local ER Vet')
      const wifi = asStr(v.alarmWifi, 'WiFi info')

      return [
        res('Sitter Dossier Ready', name, 'good', 'Print or text to your pet sitter'),
        res('Feeding Protocol', feed, 'info', 'Measure precisely'),
        res('Medical Emergency Contact', vet, 'bad', 'Authorized to treat up to specified limit'),
        res('House Access & WiFi', wifi, 'neutral', 'Alarm & internet details'),
      ]
    },
  },
  {
    id: 'pet-care-routine-planner',
    name: 'Pet Care Routine Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Map daily morning, afternoon, and evening care tasks into a smooth family chore workflow.',
    tip: 'Assigning specific pet duties (e.g. child A feeds morning, child B cleans litter) prevents skipped or double feedings.',
    usage: [
      'Review daily scheduled routine blocks.',
      'Verify morning, midday, and evening care allocations.',
    ],
    method: [
      'Creates a 3-block daily routine structure for family pet care.',
    ],
    fields: [
      ck('morningRoutine', 'Morning: Potty break, fresh water bowl, breakfast meal, 20-min walk', true),
      ck('middayRoutine', 'Midday: Quick relief break, brief snuffle mat game, quick check-in', false),
      ck('eveningRoutine', 'Evening: Dinner meal, evening 30-min walk, tooth brushing, couch cuddle', true),
    ],
    compute: (v) => {
      const m = v.morningRoutine
      const mid = v.middayRoutine
      const e = v.eveningRoutine

      return [
        res('Daily Care Structure', m && e ? 'Complete Core Routine' : 'Gaps in Routine', m && e ? 'good' : 'warn', 'Morning + Evening baseline intact'),
        res('Midday Coverage', mid ? 'Covered' : 'Consider midday dog walker if away > 8 hrs', mid ? 'good' : 'info', 'Adult dogs should not hold urine > 8-9 hours'),
        res('Mental Stimulation Block', 'Add 10-min obedience training before dinner', 'good', 'Reinforces manners and burns mental energy'),
        res('Family Coordination', 'Use dry-erase whiteboard on fridge to mark feedings', 'neutral', 'Eliminates "Did anyone feed the dog?" confusion'),
      ]
    },
  },
  {
    id: 'pet-supplies-checklist',
    name: 'Pet Supplies Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Inventory recurring supplies across dry kibble, flea/tick preventatives, poop bags, litter, and treats.',
    tip: 'Buying poop bags and canned food in bulk cartons online saves up to 45% compared to pet store impulse buys.',
    usage: [
      'Check off current in-stock status of essential consumable pet supplies.',
      'Check supply replenishment urgency.',
    ],
    method: [
      'Calculates consumable inventory health across 5 core pet staples.',
    ],
    fields: [
      ck('foodStocked', 'At least 2 weeks of dry/canned pet food remaining', true),
      ck('fleaHeartwormStocked', 'Current month and next month’s flea/tick & heartworm chewables on hand', true),
      ck('wasteBagsLitter', 'Generous supply of biodegradable waste bags or cat litter', true),
      ck('treatsStocked', 'Training treats and dental chews in stock', false),
    ],
    compute: (v) => {
      const items = [
        v.foodStocked,
        v.fleaHeartwormStocked,
        v.wasteBagsLitter,
        v.treatsStocked,
      ]
      const done = items.filter(Boolean).length
      const score = Math.round((done / items.length) * 100)

      return [
        res('Supply Inventory Status', `${score}% Stocked`, score >= 75 ? 'good' : 'warn', `${done} of ${items.length} staples on hand`),
        res('Medication Refill Alert', v.fleaHeartwormStocked ? 'Covered' : 'ORDER PREVENTATIVES: Heartworm meds needed', v.fleaHeartwormStocked ? 'good' : 'bad', 'Missing a single dose risks heartworm infection'),
        res('Bulk Savings Tip', 'Set up auto-ship on heavy food bags for 5-10% discount', 'info', 'Delivered right to your front door'),
        res('Poop Bag Stock', v.wasteBagsLitter ? 'Stocked' : 'Order bulk 900-count poop bag box', 'neutral', 'Never get caught without waste bags'),
      ]
    },
  },
]
