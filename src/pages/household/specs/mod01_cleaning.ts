import {
  type HouseholdSpec,
  T,
  n,
  sel,
  txt,
  ck,
  res,
  doc,
  asNum,
  asSel,
  asStr,
  asBoolList,
  money,
  pct,
  num,
  numD,
  clamp,
} from './householdSpec'

const SUB = 'Cleaning'
const SUB_ID = 'cleaning'

export const cleaningSpecs: HouseholdSpec[] = [
  {
    id: 'cleaning-time-estimator',
    name: 'Cleaning Time Estimator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Estimate how long a cleaning session will take based on home size, room count, and clutter level.',
    tip: 'Clean top-to-bottom and dry-to-wet to avoid having to re-clean surfaces when dust falls.',
    usage: [
      'Enter your total living space in square feet and the number of bedrooms and bathrooms.',
      'Select the current clutter intensity and cleaning depth.',
      'View the estimated cleaning duration and recommended breakdown by zone.',
    ],
    method: [
      'Calculates baseline cleaning rate of ~450 sq ft per hour for standard maintenance.',
      'Applies a 1.4x modifier for deep cleaning and an additive 15-30 mins per extra bathroom.',
      'Adjusts for clutter level adding 20% to 50% extra sorting and moving time.',
    ],
    fields: [
      n('sqft', 'Floor Area (sq ft)', { def: 1200, min: 200, max: 10000, step: 50 }),
      n('bedrooms', 'Number of Bedrooms', { def: 2, min: 0, max: 10 }),
      n('bathrooms', 'Number of Bathrooms', { def: 1, min: 1, max: 8 }),
      sel('depth', 'Cleaning Depth', ['Routine Tidy', 'Standard Clean', 'Deep Clean', 'Move-out Reset'], 'Standard Clean'),
      sel('clutter', 'Clutter Level', ['Low (Everything has a place)', 'Moderate (Some items on floor/counters)', 'High (Heavy decluttering needed)'], 'Moderate (Some items on floor/counters)'),
    ],
    compute: (v) => {
      const sqft = asNum(v.sqft)
      const beds = asNum(v.bedrooms)
      const baths = asNum(v.bathrooms)
      const depth = asSel(v.depth)
      const clutter = asSel(v.clutter)

      const depthMult = depth === 'Routine Tidy' ? 0.6 : depth === 'Standard Clean' ? 1.0 : depth === 'Deep Clean' ? 1.6 : 2.2
      const clutterAddMin = clutter.startsWith('Low') ? 0 : clutter.startsWith('Moderate') ? 25 : 60

      const baseMins = (sqft / 450) * 60 * depthMult + (beds * 15) + (baths * 35) + clutterAddMin
      const totalHours = Math.max(0.5, baseMins / 60)
      const speedRating = totalHours > 4 ? T.warn : totalHours > 6 ? T.bad : T.good

      return [
        res('Estimated Cleaning Time', `${numD(totalHours, 1)} hrs`, speedRating, `${Math.round(baseMins)} total minutes estimated`),
        res('Kitchen & Bath Share', `${Math.round(totalHours * 0.45 * 60)} mins`, T.neutral, 'Typically accounts for ~45% of total deep effort'),
        res('Bedrooms & Living', `${Math.round(totalHours * 0.40 * 60)} mins`, T.neutral, 'Dusting, vacuuming, bed making and surface wipes'),
        res('Buffer & Trash Run', `${Math.round(totalHours * 0.15 * 60)} mins`, T.neutral, 'Bin emptying, rag washing and final inspection'),
      ]
    },
  },
  {
    id: 'cleaning-staff-cost-calculator',
    name: 'Cleaning Staff Cost Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate weekly and monthly expenditures for hiring domestic cleaning staff or maid services.',
    tip: 'Providing your own cleaning supplies typically lowers third-party agency hourly rates by 10-15%.',
    usage: [
      'Enter the hourly rate or day rate of the cleaner.',
      'Specify hours per visit and visits per week.',
      'Review monthly spend, tips/agency fees, and annual cost forecast.',
    ],
    method: [
      'Multiplies hours per visit by visits per week and hourly rate.',
      'Applies a standard 4.33 weeks per month multiplier.',
      'Includes optional tip/transportation allowances to compute true total cost.',
    ],
    fields: [
      n('hourlyRate', 'Hourly Rate ($/hr)', { def: 25, min: 5, max: 150, step: 1 }),
      n('hoursPerVisit', 'Hours per Visit', { def: 3, min: 1, max: 12, step: 0.5 }),
      n('visitsPerWeek', 'Visits per Week', { def: 1, min: 0.25, max: 7, step: 0.5 }),
      n('suppliesCost', 'Supplies / Tip per Month ($)', { def: 20, min: 0, max: 500, step: 5 }),
    ],
    compute: (v) => {
      const rate = asNum(v.hourlyRate)
      const hpv = asNum(v.hoursPerVisit)
      const vpw = asNum(v.visitsPerWeek)
      const supplies = asNum(v.suppliesCost)

      const perVisit = rate * hpv
      const perWeek = perVisit * vpw
      const perMonth = (perWeek * 4.33) + supplies
      const perYear = perMonth * 12

      return [
        res('Cost per Visit', money(perVisit), T.neutral, `${hpv} hours at ${money(rate)}/hr`),
        res('Monthly Cost', money(perMonth), perMonth > 400 ? T.warn : T.good, `Includes ${money(supplies)} supplies/tip`),
        res('Annual Budget', money(perYear), T.neutral, `${num(vpw * 52)} visits per year`),
      ]
    },
  },
  {
    id: 'room-by-room-cleaning-planner',
    name: 'Room-by-Room Cleaning Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Generate a focused cleaning checklist tailored to each individual room in your house.',
    tip: 'Carry a single cleaning caddy with microfibers and multi-surface cleaner to save trips back and forth.',
    usage: [
      'Select the target room you want to clean.',
      'Choose the time window you have available (15, 30, or 60 minutes).',
      'Follow the generated room task checklist in order of priority.',
    ],
    method: [
      'Categorizes room tasks into High-Impact (first 15m), Thorough (30m), and Deep-Clean (60m).',
      'Formats a structured printable or copyable task schedule.',
    ],
    fields: [
      sel('room', 'Target Room', ['Kitchen', 'Bathroom', 'Living Room', 'Master Bedroom', 'Home Office', 'Kids Bedroom', 'Entryway'], 'Kitchen'),
      sel('timeSlot', 'Available Time', ['15 Minutes (Express Tidy)', '30 Minutes (Standard Reset)', '60 Minutes (Deep Clean)'], '30 Minutes (Standard Reset)'),
    ],
    compute: (v) => {
      const room = asSel(v.room)
      const slot = asSel(v.timeSlot)

      const planMap: Record<string, string[]> = {
        Kitchen: [
          'Clear and load dishwasher; wipe down countertops.',
          'Scrub kitchen sink and disinfect faucet handle.',
          'Wipe stovetop, microwave interior, and appliance exteriors.',
          'Empty trash bin and take out compost.',
          'Sweep and damp-mop tile floor.',
        ],
        Bathroom: [
          'Spray shower and toilet bowl with disinfectant; let sit 5 mins.',
          'Wipe mirror, vanity sink counter, and faucet.',
          'Scrub inside toilet bowl and wipe exterior tank, lid, and base.',
          'Squeegee shower glass and scrub tub surface.',
          'Shake bath mats, sweep and mop bathroom floor.',
        ],
        'Living Room': [
          'Clear coffee table, side tables, and return loose cups to kitchen.',
          'Fluff sofa cushions and fold throw blankets neatly.',
          'Dust electronics, TV screen (microfiber only), and shelves.',
          'Vacuum rugs and under couch edges.',
          'Open windows for 10 minutes to refresh indoor air.',
        ],
        'Master Bedroom': [
          'Strip and replace bedsheets and pillowcases.',
          'Clear nightstands of clutter and wipe surfaces.',
          'Put clean clothes into wardrobe; hamper dirty clothes.',
          'Dust headboard, baseboards, and window sills.',
          'Vacuum floor including accessible area under bed.',
        ],
      }

      const tasks = planMap[room] ?? [
        'Clear all floor clutter and sort into bins.',
        'Wipe down all flat surfaces with damp microfiber.',
        'Dust high corners and door frames.',
        'Empty wastebaskets and sanitize switchplates.',
        'Vacuum or mop the entire floor thoroughly.',
      ]

      const count = slot.startsWith('15') ? 2 : slot.startsWith('30') ? 4 : tasks.length
      const activeTasks = tasks.slice(0, count)
      const checklistText = activeTasks.map((t, idx) => `[ ] Step ${idx + 1}: ${t}`).join('\n')

      return [
        res('Active Zone', room, T.neutral, slot),
        res('Planned Steps', `${activeTasks.length} tasks`, T.good, 'Focus strictly on this list to prevent distraction'),
        doc('Action Checklist', `ROOM CLEANING PLAN: ${room.toUpperCase()} (${slot})\n\n${checklistText}`),
      ]
    },
  },
  {
    id: 'cleaning-frequency-calculator',
    name: 'Cleaning Frequency Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Determine how often home items need washing or sanitizing based on household size and pets.',
    tip: 'Bed linens collect sweat, dust mites, and skin flakes daily—wash weekly at 60°C (140°F) to kill allergens.',
    usage: [
      'Enter how many people and pets live in the home.',
      'Check whether anyone has active allergies or asthma.',
      'Receive recommended cleaning frequencies for 10 essential home items.',
    ],
    method: [
      'Scales baseline hygienic intervals based on bio-load (occupants + indoor pets).',
      'Allergy households accelerate soft furnishing and dusting frequencies by 50%.',
    ],
    fields: [
      n('people', 'Number of Occupants', { def: 3, min: 1, max: 12 }),
      n('pets', 'Number of Shedding Pets', { def: 1, min: 0, max: 8 }),
      sel('allergies', 'Allergy or Asthma Sufferers Present?', ['No', 'Yes'], 'No'),
    ],
    compute: (v) => {
      const p = asNum(v.people)
      const pets = asNum(v.pets)
      const allergy = asSel(v.allergies) === 'Yes'

      const sheetFreq = allergy || pets > 0 ? 'Every 5 to 7 days' : 'Every 7 to 10 days'
      const vacuumFreq = pets > 1 || allergy ? 'Daily or every 2 days' : pets > 0 || p > 3 ? 'Every 3 days' : 'Once a week'
      const bathTowels = p > 2 ? 'Wash after 3 uses' : 'Wash after 4 uses'
      const ovenClean = p > 3 ? 'Every 2 months' : 'Every 3 to 4 months'
      const fridgeDeep = 'Every 3 months'

      const schedule = [
        `• Bed Linens & Pillowcases: ${sheetFreq}`,
        `• Vacuuming & Floor Mopping: ${vacuumFreq}`,
        `• Bath Towels: ${bathTowels}`,
        `• Kitchen Sponges: Sanitize every 2 days; replace every 2 weeks`,
        `• Refrigerator Deep Wipe: ${fridgeDeep}`,
        `• Oven & Range Hood Filter: ${ovenClean}`,
        `• Pillows & Duvet Comforters: Every 3 to 6 months`,
      ].join('\n')

      return [
        res('Vacuuming Frequency', vacuumFreq, allergy || pets > 1 ? T.warn : T.good, 'High bio-load / dander triggers'),
        res('Bed Sheet Cycle', sheetFreq, T.good, 'Prevents dust mite accumulation'),
        doc('Recommended Home Hygiene Schedule', schedule),
      ]
    },
  },
  {
    id: 'cleaning-priority-planner',
    name: 'Cleaning Priority Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Triage messy areas into Urgent, Important, and Deferrable to conquer overwhelm quickly.',
    tip: 'When overwhelmed, always clean the kitchen sink and make your bed first for immediate mental calm.',
    usage: [
      'Rate urgency of living areas, kitchen, and sanitary spaces.',
      'Get an immediate 3-tier action plan separating today’s priorities from weekend chores.',
    ],
    method: [
      'Calculates an impact index balancing health hygiene against visual order.',
      'Ranks sanitary zones (toilets, food prep) as Tier 1, high-traffic as Tier 2, and storage as Tier 3.',
    ],
    fields: [
      sel('sinkState', 'Kitchen Sink State', ['Empty & Clean', 'Few Cups', 'Overflowing with Pots'], 'Overflowing with Pots'),
      sel('bathroomState', 'Bathroom Cleanliness', ['Fresh', 'Moderate Dust/Water spots', 'Dirty toilet/shower'], 'Dirty toilet/shower'),
      sel('guestsVisiting', 'Are Guests Coming Today?', ['No', 'Yes (Within 4 hours)', 'Tomorrow'], 'No'),
    ],
    compute: (v) => {
      const sink = asSel(v.sinkState)
      const bath = asSel(v.bathroomState)
      const guest = asSel(v.guestsVisiting)

      const urgent: string[] = []
      const secondary: string[] = []

      if (sink === 'Overflowing with Pots') urgent.push('Soak and wash pots; wipe food prep surfaces.')
      if (bath === 'Dirty toilet/shower') urgent.push('Disinfect toilet seat, rim and bowl; wipe faucet handles.')
      if (guest.startsWith('Yes')) urgent.push('Clear entryway shoes, empty main bathroom trash, and light a candle.')

      secondary.push('Vacuum living room center walkway and shake welcome mat.')
      secondary.push('Take out kitchen bin and recycling.')
      secondary.push('Dust flat coffee and console table surfaces.')

      const plan = `TIER 1 (DO FIRST - NEXT 30 MINS):\n${urgent.map((u, i) => `${i + 1}. ${u}`).join('\n')}\n\nTIER 2 (DO NEXT IF TIME PERMITS):\n${secondary.map((s, i) => `${i + 1}. ${s}`).join('\n')}`

      return [
        res('Urgent Tasks Count', `${urgent.length}`, urgent.length > 2 ? T.bad : T.good, 'High-impact hygiene items'),
        res('Guest Readiness', guest.startsWith('Yes') ? 'High Alert' : 'Standard', guest.startsWith('Yes') ? T.warn : T.neutral),
        doc('Priority Cleaning Roadmap', plan),
      ]
    },
  },
  {
    id: 'mess-level-assessment',
    name: 'Mess Level Assessment',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Score your current home disorder level (1–10) and receive an achievable, bite-sized rescue plan.',
    tip: 'Never clean where you haven’t decluttered first. Moving items back and forth wastes 40% of cleaning time.',
    usage: [
      'Select the state of dishes, laundry piles, floor space, and trash bins.',
      'Check your calculated Mess Index score and severity tier.',
      'Follow the recommended 3-phase reset protocol.',
    ],
    method: [
      'Sums weighted indices across 4 visible chaos indicators (dishes, clothes, floors, garbage).',
      'Classifies into Maintenance (1-3), Cluttered (4-6), Chaotic (7-8), or Emergency Reset (9-10).',
    ],
    fields: [
      sel('dishes', 'Dishes Status', ['Zero dishes in sink (0)', 'One load waiting (2)', 'Piles on countertops (4)'], 'One load waiting (2)'),
      sel('laundry', 'Laundry Status', ['Put away (0)', 'Clean clothes in hamper (1)', 'Floordrobe everywhere (3)'], 'Clean clothes in hamper (1)'),
      sel('floor', 'Floor Clutter', ['Clear walkways (0)', 'Shoes & bags scattered (2)', 'Hard to walk without stepping on things (4)'], 'Shoes & bags scattered (2)'),
      sel('trash', 'Trash & Recycling', ['Empty (0)', 'Full bins (1)', 'Overflowing bags on floor (2)'], 'Full bins (1)'),
    ],
    compute: (v) => {
      const getScore = (s: string) => {
        const m = s.match(/\((\d+)\)/)
        return m ? parseInt(m[1], 10) : 1
      }
      const totalScore = getScore(asSel(v.dishes)) + getScore(asSel(v.laundry)) + getScore(asSel(v.floor)) + getScore(asSel(v.trash))
      const normalized = Math.min(10, Math.round((totalScore / 13) * 10))

      const status = normalized <= 3 ? 'Mild Tidy Needed' : normalized <= 6 ? 'Moderate Clutter' : 'Heavy Reset Required'
      const tone = normalized <= 3 ? T.good : normalized <= 6 ? T.warn : T.bad

      const roadmap = [
        'PHASE 1: Trash Sweep (5 mins) — Carry a black trash bag through every room and collect obvious rubbish.',
        'PHASE 2: Dish & Surface Reset (15 mins) — Collect all mugs, plates, and cutlery into kitchen sink.',
        'PHASE 3: Laundry Basket Triage (10 mins) — Toss all loose floor clothes into a single hamper.',
        'PHASE 4: 10-Minute Vacuum Sweep — Clear the center pathways to reclaim visual calm.',
      ].join('\n')

      return [
        res('Mess Index', `${normalized}/10`, tone, status),
        res('Estimated Recovery Time', `${normalized * 12} mins`, T.neutral, 'Can be broken into 15-minute sprints'),
        doc('Step-by-Step Reset Plan', roadmap),
      ]
    },
  },
  {
    id: 'decluttering-progress-tracker',
    name: 'Decluttering Progress Tracker',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Track discarded, donated, and kept items across rooms to monitor decluttering momentum.',
    tip: 'Use the 20/20 rule: if you can replace it for under $20 in under 20 minutes from where you are, let it go.',
    usage: [
      'Input the count of items donated, sold, recycled, or discarded.',
      'Enter the target number of items you wanted to purge.',
      'Check completion rate, space reclaimed estimate, and disposal breakdown.',
    ],
    method: [
      'Computes percentage progress towards user declutter target.',
      'Estimates average physical volume freed assuming ~0.5 cu ft per average purged home item.',
    ],
    fields: [
      n('targetItems', 'Target Items to Remove', { def: 100, min: 10, max: 2000, step: 10 }),
      n('donated', 'Items Donated', { def: 35, min: 0, max: 1000 }),
      n('recycled', 'Items Recycled / Trashed', { def: 25, min: 0, max: 1000 }),
      n('sold', 'Items Listed for Sale', { def: 8, min: 0, max: 500 }),
    ],
    compute: (v) => {
      const target = asNum(v.targetItems)
      const donated = asNum(v.donated)
      const trashed = asNum(v.recycled)
      const sold = asNum(v.sold)

      const totalPurged = donated + trashed + sold
      const progress = clamp((totalPurged / Math.max(1, target)) * 100, 0, 100)
      const volumeCuFt = totalPurged * 0.45

      return [
        res('Total Purged', `${totalPurged} items`, T.good, `${num(donated)} donated, ${num(sold)} sold, ${num(trashed)} discarded`),
        res('Goal Progress', pct(progress, 0), progress >= 100 ? T.good : progress >= 50 ? T.neutral : T.warn),
        res('Est. Volume Reclaimed', `${numD(volumeCuFt, 1)} cu ft`, T.good, `Equivalent to ~${numD(volumeCuFt / 1.5, 0)} medium storage boxes`),
      ]
    },
  },
  {
    id: 'home-cleaning-checklist-generator',
    name: 'Home Cleaning Checklist Generator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Generate a complete, ready-to-print or copy master cleaning checklist for your home layout.',
    tip: 'Assigning specific days to specific tasks (e.g. Sheets on Sunday, Dusting on Thursday) prevents weekend burnout.',
    usage: [
      'Select your home type and whether pets live with you.',
      'Choose whether you need a daily maintenance list, weekly schedule, or monthly checklist.',
      'Copy the generated checklist for your household.',
    ],
    method: [
      'Generates categorized action items based on household variables and frequency preference.',
    ],
    fields: [
      sel('homeType', 'Home Size', ['Studio / 1-Bed Apartment', '2-3 Bedroom Apartment', 'Single Family House (3-4 Bed)', 'Large Multi-story Home'], '2-3 Bedroom Apartment'),
      sel('petStatus', 'Pets in Home', ['No Pets', 'Dog / Cat Present'], 'Dog / Cat Present'),
      sel('frequency', 'Checklist Frequency', ['Daily Habits', 'Weekly Deep Sweep', 'Monthly Preventative'], 'Weekly Deep Sweep'),
    ],
    compute: (v) => {
      const home = asSel(v.homeType)
      const pets = asSel(v.petStatus)
      const freq = asSel(v.frequency)

      let items: string[] = []
      if (freq === 'Daily Habits') {
        items = [
          'Make bed upon waking.',
          'Wipe dining and kitchen counter surfaces after meals.',
          'Wash or dishwasher-cycle all used dishes; dry sink.',
          '10-minute floor tidy of clothes, shoes, and toys.',
          'Empty small trash cans if full.',
        ]
        if (pets.includes('Dog')) items.push('Wipe pet paws after walks; sweep around pet food bowl.')
      } else if (freq === 'Weekly Deep Sweep') {
        items = [
          'Change all bed linens and pillowcases.',
          'Disinfect toilet bowls, seats, sink basins, and bathroom mirrors.',
          'Dust ceiling fans, picture frames, and television screens.',
          'Thorough vacuuming of all rugs, carpets, and baseboards.',
          'Mop hard floors with suitable tile/wood cleaner.',
          'Wipe microwave interior, stovetop, and fridge handle.',
        ]
        if (pets.includes('Dog')) items.push('Wash pet bedding and vacuum pet hair from couch crevices.')
      } else {
        items = [
          'Clean interior oven and range hood grease filters.',
          'Sanitize washing machine drum and clear dryer lint trap exhaust.',
          'Wipe down all interior doors, handles, and light switches.',
          'Clean interior window glass and vacuum window sills.',
          'Descale shower heads and inspect plumbing under sinks for leaks.',
          'Dust high vents and air conditioning filters.',
        ]
      }

      const docText = `HOME CLEANING CHECKLIST: ${freq.toUpperCase()} (${home})\n${'='.repeat(55)}\n\n${items.map((it, idx) => `[ ] ${idx + 1}. ${it}`).join('\n')}`

      return [
        res('Category', freq, T.good, home),
        res('Total Items', `${items.length} tasks`, T.neutral, 'Tick off as you complete each task'),
        doc('Complete Printable Checklist', docText),
      ]
    },
  },
  {
    id: 'cleaning-task-randomizer',
    name: 'Cleaning Task Randomizer',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Overcome procrastination with a randomized single 10-minute micro-task to kickstart your cleaning.',
    tip: 'The 5-minute rule: commit to doing just one task for 5 minutes. 80% of the time you will keep going.',
    usage: [
      'Select how much energy you currently have.',
      'Pick the room you are in or select Any Room.',
      'Hit calculate to spin the wheel and get your single designated task.',
    ],
    method: [
      'Selects a curated micro-task mapped to room and energy level with high visual payoff.',
    ],
    fields: [
      sel('energy', 'Current Energy Level', ['Low (Barely awake / exhausted)', 'Medium (30 mins to spare)', 'High (Ready to conquer)'], 'Medium (30 mins to spare)'),
      sel('targetZone', 'Area of Focus', ['Kitchen', 'Bathroom', 'Living Room', 'Bedroom', 'Any Room'], 'Any Room'),
    ],
    compute: (v) => {
      const energy = asSel(v.energy)
      const zone = asSel(v.targetZone)

      const lowTasks = [
        'Wipe just the bathroom mirror and sink faucet with a dry cloth.',
        'Throw away 10 pieces of expired paper or junk mail from your desk.',
        'Clear all mugs and glasses from your nightstand and place in sink.',
        'Empty the single biggest trash can in the house.',
        'Fold and hang 5 shirts that are sitting out.',
      ]

      const medTasks = [
        'Wipe down all kitchen countertops and disinfect the stove.',
        'Vacuum the living room rug and straighten couch throw pillows.',
        'Scrub the inside of the toilet and wipe the flush handle.',
        'Strip your bed sheets and put them directly into the washing machine.',
        'Clean the microwave inside using a bowl of steaming lemon water.',
      ]

      const highTasks = [
        'Pull out the refrigerator vegetable bins, wash them in sink, and dry.',
        'Scrub the shower tiles and glass door with squeegee.',
        'Mop the entire kitchen and hallway hard floors.',
        'Vacuum under the sofa and behind furniture corners.',
        'Organize one entire chaotic food pantry shelf.',
      ]

      const pool = energy.startsWith('Low') ? lowTasks : energy.startsWith('Medium') ? medTasks : highTasks
      const chosen = pool[Math.floor(Math.random() * pool.length)]

      return [
        res('Target Zone', zone, T.neutral, `Tailored for ${energy.split(' ')[0]} energy`),
        res('Your Challenge Task', chosen, T.good, 'One single focus'),
        res('Target Duration', energy.startsWith('Low') ? '5 - 10 mins' : energy.startsWith('Medium') ? '15 mins' : '25 mins', T.neutral),
        res('Rule', 'Do ONLY this task, then stop or spin again', T.good),
      ]
    },
  },
  {
    id: 'cleaning-rotation-planner',
    name: 'Cleaning Rotation Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Distribute weekly and monthly household cleaning duties fairly across family members or housemates.',
    tip: 'Rotate high-dislike tasks (like scrubbing toilets and taking out heavy bins) weekly to keep chore morale balanced.',
    usage: [
      'Enter the names of household participants (comma separated).',
      'Select rotation frequency.',
      'Receive an organized rotation chart mapping responsibilities.',
    ],
    method: [
      'Parses participant names and assigns balanced duty rotations across standard cleaning zones.',
    ],
    fields: [
      txt('members', 'Member Names (comma separated)', 1, 'Alex, Sam, Jordan'),
      sel('rotationType', 'Rotation Cycle', ['Weekly Zone Rotation', 'Daily Chore Alternation', 'Bi-Weekly Shift'], 'Weekly Zone Rotation'),
    ],
    compute: (v) => {
      const names = asStr(v.members).split(',').map((s: string) => s.trim()).filter(Boolean)
      const cycle = asSel(v.rotationType)

      if (names.length === 0) {
        return [res('Error', 'Please enter at least one name', T.bad)]
      }

      const zones = ['Zone 1: Kitchen & Dishes', 'Zone 2: Bathrooms & Trash', 'Zone 3: Living Room & Floors', 'Zone 4: Entryway & Recycling', 'Zone 5: Laundry & Linens']
      const scheduleLines = names.map((name: string, idx: number) => {
        const assigned = zones[idx % zones.length]
        return `• ${name}: Assigned to ${assigned}`
      })

      return [
        res('Active Participants', `${names.length} members`, T.good, cycle),
        doc('Rotation Schedule', `HOUSEHOLD ROTATION PLAN (${cycle})\n${'='.repeat(45)}\n\n${scheduleLines.join('\n')}\n\nNote: Rotate roles forward by one slot every Monday.`),
      ]
    },
  },
  {
    id: 'cleaning-supplies-inventory',
    name: 'Cleaning Supplies Inventory',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Track on-hand cleaning products and identify what needs to be restocked before your next big clean.',
    tip: 'Microfiber cloths should be washed without fabric softener—softener clogs the micro-wedges and ruins absorbency.',
    usage: [
      'Audit current stock levels of core household cleaning essentials.',
      'View restocking alerts and supply preparedness score.',
    ],
    method: [
      'Calculates a supply completeness score based on presence of all 5 fundamental cleaning categories.',
    ],
    fields: [
      ck('supplies', 'Check items currently in stock in your home:', [
        'Multi-Surface Cleaner Spray',
        'Disinfectant Toilet Bowl Cleaner',
        'Glass / Mirror Cleaner',
        'Dish Soap / Dishwasher Pods',
        'Baking Soda / White Vinegar',
        'Microfiber Cloths (at least 4)',
        'Scrub Sponges & Brushes',
        'Mop & Floor Cleaning Solution',
        'Heavy-duty Trash Bags',
        'Rubber Cleaning Gloves',
      ]),
    ],
    compute: (v) => {
      const list = asBoolList(v.supplies)
      const count = list.filter(Boolean).length
      const total = list.length || 10
      const score = Math.round((count / total) * 100)

      const status = score >= 80 ? 'Fully Stocked' : score >= 50 ? 'Restock Soon' : 'Critically Low'
      const tone = score >= 80 ? T.good : score >= 50 ? T.warn : T.bad

      return [
        res('Supplies On Hand', `${count} of ${total}`, tone, status),
        res('Preparedness Score', pct(score, 0), tone),
        res('Restock Recommendation', count < 6 ? 'Buy Toilet Cleaner, Trash Bags & Microfibers' : 'Well prepared for routine cleans', T.neutral),
      ]
    },
  },
  {
    id: 'cleaning-supplies-cost-calculator',
    name: 'Cleaning Supplies Cost Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate your annual expenditure on home cleaning chemicals, paper towels, sponges, and trash bags.',
    tip: 'Buying concentrated multi-surface refills instead of single-use spray bottles cuts cleaner costs by up to 70%.',
    usage: [
      'Input monthly spending on sprays, detergents, paper towels, and trash bags.',
      'Check your projected yearly spend and potential savings with bulk refills.',
    ],
    method: [
      'Sums monthly consumables and projects annual expenses.',
      'Estimates ~35% savings potential through concentrated refill tablets and washable microfibers.',
    ],
    fields: [
      n('sprays', 'Cleaning Sprays & Wipes ($/mo)', { def: 15, min: 0, max: 200 }),
      n('paperTowels', 'Paper Towels & Sponges ($/mo)', { def: 18, min: 0, max: 200 }),
      n('dishPods', 'Dishwasher & Dish Soap ($/mo)', { def: 14, min: 0, max: 200 }),
      n('trashBags', 'Trash & Compost Bags ($/mo)', { def: 10, min: 0, max: 150 }),
    ],
    compute: (v) => {
      const sprays = asNum(v.sprays)
      const paper = asNum(v.paperTowels)
      const dish = asNum(v.dishPods)
      const trash = asNum(v.trashBags)

      const monthly = sprays + paper + dish + trash
      const annual = monthly * 12
      const potentialSavings = (sprays * 0.5 + paper * 0.4) * 12

      return [
        res('Monthly Supply Spend', money(monthly), monthly > 60 ? T.warn : T.good),
        res('Annual Cleaning Spend', money(annual), T.neutral, 'Total projected annual outlay'),
        res('Est. Eco-Refill Savings', money(potentialSavings), T.good, 'Switching paper towels to microfiber + refill tabs'),
      ]
    },
  },
  {
    id: 'cleaning-product-compatibility-checker',
    name: 'Cleaning Product Compatibility Checker',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Check if two household cleaning chemicals can be mixed safely to prevent dangerous gas creation.',
    tip: 'NEVER mix bleach with ammonia, vinegar, or rubbing alcohol. It produces lethal toxic chlorine or chloramine gas.',
    usage: [
      'Select Chemical A and Chemical B.',
      'Instantly verify whether the mixture is Safe, Ineffective, or a Dangerous Hazard.',
    ],
    method: [
      'Evaluates chemical cross-reactions based on standard household hazardous material guidelines.',
    ],
    fields: [
      sel('chemA', 'Product / Chemical A', ['Bleach (Sodium Hypochlorite)', 'White Vinegar (Acetic Acid)', 'Ammonia', 'Rubbing Alcohol (Isopropyl)', 'Baking Soda', 'Dish Soap', 'Hydrogen Peroxide'], 'Bleach (Sodium Hypochlorite)'),
      sel('chemB', 'Product / Chemical B', ['White Vinegar (Acetic Acid)', 'Ammonia', 'Rubbing Alcohol (Isopropyl)', 'Dish Soap', 'Baking Soda', 'Hydrogen Peroxide'], 'White Vinegar (Acetic Acid)'),
    ],
    compute: (v) => {
      const a = asSel(v.chemA)
      const b = asSel(v.chemB)

      if (a.includes('Bleach') && b.includes('Vinegar')) {
        return [
          res('SAFETY VERDICT', 'LETHAL DANGER', T.bad, 'DO NOT MIX!'),
          res('Reaction Hazard', 'Releases toxic Chlorine gas', T.bad, 'Causes severe respiratory damage and eye irritation'),
          doc('Safety Advisory', 'WARNING: Bleach + Vinegar creates Chlorine gas.\nEven tiny concentrations can cause coughing, chest pain, and chemical burns to airways. Never combine them.'),
        ]
      }
      if (a.includes('Bleach') && b.includes('Ammonia')) {
        return [
          res('SAFETY VERDICT', 'LETHAL DANGER', T.bad, 'DO NOT MIX!'),
          res('Reaction Hazard', 'Releases deadly Chloramine gas', T.bad, 'Can cause shortness of breath and fluid in lungs'),
          doc('Safety Advisory', 'WARNING: Bleach + Ammonia produces toxic chloramine vapours.\nDo not use toilet bowl cleaners with bleach if ammonia-containing glass cleaner was recently sprayed.'),
        ]
      }
      if (a.includes('Bleach') && b.includes('Alcohol')) {
        return [
          res('SAFETY VERDICT', 'TOXIC HAZARD', T.bad, 'DO NOT MIX!'),
          res('Reaction Hazard', 'Forms Chloroform and hydrochloric acid', T.bad, 'Causes dizziness, nausea, and organ damage'),
        ]
      }
      if (a.includes('Vinegar') && b.includes('Baking Soda')) {
        return [
          res('SAFETY VERDICT', 'SAFE BUT WEAK', T.warn, 'Neutralizes cleaning power'),
          res('Result', 'Produces Carbon Dioxide & Salt Water', T.neutral, 'Fun fizzing bubbles, but vinegar and soda neutralize each other into plain salt water.'),
        ]
      }

      return [
        res('SAFETY VERDICT', 'GENERALLY SAFE', T.good, 'Standard cleaning combination'),
        res('Compatibility', 'No known toxic fumes formed', T.good, 'Ensure room is reasonably ventilated when cleaning.'),
      ]
    },
  },
  {
    id: 'surface-cleaning-guide',
    name: 'Surface Cleaning Guide',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Look up the safe cleaning methods, prohibited chemicals, and tools for delicate home surfaces.',
    tip: 'Never use vinegar or lemon juice on natural marble or limestone—the acid etches the calcium carbonate permanently.',
    usage: [
      'Select the surface material you want to clean.',
      'Review safe cleaners, tools, and prohibited ingredients.',
    ],
    method: [
      'Maps material porosity and mineral structure against safe cleaning chemistry.',
    ],
    fields: [
      sel('surface', 'Select Surface Material', ['Natural Marble / Granite', 'Hardwood Flooring', 'Stainless Steel Appliances', 'Quartz Countertop', 'Ceramic / Porcelain Tile', 'Glass & Mirrors'], 'Natural Marble / Granite'),
    ],
    compute: (v) => {
      const s = asSel(v.surface)

      const guides: Record<string, { safe: string; avoid: string; tool: string; tip: string }> = {
        'Natural Marble / Granite': {
          safe: 'pH-neutral stone soap or warm water with a drop of mild dish soap.',
          avoid: 'Vinegar, lemon, bleach, generic multi-surface sprays, acidic bathroom cleaners.',
          tool: 'Soft microfiber cloth only. Never use abrasive scouring pads.',
          tip: 'Wipe wine and citrus spills immediately to prevent permanent surface etching.',
        },
        'Hardwood Flooring': {
          safe: 'Damp (well-wrung) microfiber mop with specialized pH-balanced wood cleaner.',
          avoid: 'Steam mops, excess soaking water, ammonia, vinegar, wax polishes.',
          tool: 'Flat microfiber mop pad. Vacuum with soft brush attachment only.',
          tip: 'Excess water seeps into floor seams causing warping and board cupping.',
        },
        'Stainless Steel Appliances': {
          safe: 'Diluted dish soap wipe followed by a drop of mineral oil or stainless cleaner in grain direction.',
          avoid: 'Bleach, chloride cleaners, abrasive powders, steel wool.',
          tool: 'Soft microfiber cloth rubbed WITH the grain of the steel.',
          tip: 'Always wipe parallel to the grain lines to avoid micro-scratching.',
        },
        'Quartz Countertop': {
          safe: 'Mild dish soap, water, and warm microfiber. Isopropyl alcohol for sticky residue.',
          avoid: 'High-pH oven cleaners, bleach, paint thinners, abrasive scouring powders.',
          tool: 'Non-scratch sponge or microfiber cloth.',
          tip: 'Quartz is resin-bound; intense heat or harsh alkalis can discolor the resin.',
        },
      }

      const g = guides[s] ?? {
        safe: 'Warm water with gentle dish soap or 50/50 water and white vinegar.',
        avoid: 'Steel wool and harsh abrasives that scratch glaze.',
        tool: 'Grout brush and microfiber.',
        tip: 'Rinse with clean water to prevent soap film buildup.',
      }

      return [
        res('Recommended Cleaner', g.safe, T.good),
        res('Strictly Avoid', g.avoid, T.bad, 'Will degrade or etch the surface'),
        res('Safe Tool', g.tool, T.neutral),
        doc('Care Protocol', `SURFACE CARE: ${s.toUpperCase()}\n\n• SAFE: ${g.safe}\n• AVOID: ${g.avoid}\n• TOOLS: ${g.tool}\n• PRO TIP: ${g.tip}`),
      ]
    },
  },
  {
    id: 'room-by-room-supply-calculator',
    name: 'Room-by-Room Supply Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate the quantity of microfiber cloths, sponges, and bin liners needed for a thorough home clean.',
    tip: 'Color-code microfibers: Red for toilets, Yellow for bathroom counters, Blue for glass, Green for kitchen.',
    usage: [
      'Enter the number of bedrooms, bathrooms, and living areas.',
      'Receive recommended clean cloth count, sponges, and bags so you do not cross-contaminate.',
    ],
    method: [
      'Calculates sanitary separation: 2 cloths per bathroom, 3 per kitchen, 1 per bedroom/living zone.',
    ],
    fields: [
      n('baths', 'Bathrooms', { def: 2, min: 1, max: 10 }),
      n('beds', 'Bedrooms', { def: 3, min: 0, max: 10 }),
      n('kitchens', 'Kitchens', { def: 1, min: 1, max: 4 }),
      n('living', 'Living / Dining Areas', { def: 2, min: 1, max: 8 }),
    ],
    compute: (v) => {
      const baths = asNum(v.baths)
      const beds = asNum(v.beds)
      const kitchen = asNum(v.kitchens)
      const living = asNum(v.living)

      const cloths = baths * 3 + kitchen * 4 + beds * 1 + living * 2
      const sponges = baths * 1 + kitchen * 2
      const bags = baths * 1 + kitchen * 2 + 1

      return [
        res('Microfiber Cloths Needed', `${cloths} cloths`, T.good, 'Separated by zone to avoid cross-contamination'),
        res('Scrub Sponges Needed', `${sponges} sponges`, T.neutral, 'Keep toilet and kitchen sponges strictly separate'),
        res('Trash Liners Needed', `${bags} bags`, T.neutral, 'For room wastebaskets and consolidated house trash'),
      ]
    },
  },
  {
    id: 'deep-cleaning-progress-tracker',
    name: 'Deep Cleaning Progress Tracker',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Track thorough seasonal or annual deep cleaning tasks that are typically skipped during routine tidying.',
    tip: 'Vacuuming refrigerator coils at the back or bottom improves cooling efficiency and cuts electricity bills by 10%.',
    usage: [
      'Check off items as you complete them during your deep clean weekend.',
      'Monitor your progress percentage and remaining tasks.',
    ],
    method: [
      'Tallies completion of 10 high-value seasonal deep cleaning targets.',
    ],
    fields: [
      ck('tasks', 'Deep Clean Milestones:', [
        'Behind and under the refrigerator vacuumed',
        'Inside oven and racks thoroughly degreased',
        'Dishwasher filter removed and descaled',
        'Washing machine gasket and detergent tray sanitized',
        'Window tracks and sills vacuumed and wiped',
        'Baseboards dusted and wiped down across all rooms',
        'Mattresses vacuumed and rotated',
        'Curtains washed or upholstery deep-vacuumed',
        'Ceiling fan blades and light fixtures dusted',
        'Showerhead descaled in warm vinegar soak',
      ]),
    ],
    compute: (v) => {
      const list = asBoolList(v.tasks)
      const done = list.filter(Boolean).length
      const total = list.length || 10
      const pctDone = Math.round((done / total) * 100)

      return [
        res('Deep Clean Progress', pct(pctDone, 0), pctDone >= 80 ? T.good : pctDone >= 40 ? T.warn : T.neutral),
        res('Completed Tasks', `${done} of ${total} finished`, T.good),
        res('Remaining Targets', `${total - done} tasks to go`, total - done === 0 ? T.good : T.neutral),
      ]
    },
  },
  {
    id: 'seasonal-cleaning-planner',
    name: 'Seasonal Cleaning Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Plan spring, summer, autumn, and winter home maintenance cleaning schedules.',
    tip: 'Check smoke alarm batteries every spring and autumn when the clocks change.',
    usage: [
      'Select current season.',
      'Review the curated seasonal priority chores.',
    ],
    method: [
      'Maps weather transitions to appropriate exterior and interior maintenance cleaning steps.',
    ],
    fields: [
      sel('season', 'Choose Season', ['Spring (The Big Reset)', 'Summer (Pest & AC Focus)', 'Autumn (Pre-Winter Prep)', 'Winter (Indoor Air & Mold Focus)'], 'Spring (The Big Reset)'),
    ],
    compute: (v) => {
      const s = asSel(v.season)
      let plan: string[] = []

      if (s.startsWith('Spring')) {
        plan = [
          'Wash exterior and interior window glass.',
          'Wash or dry-clean heavy winter drapes and blankets.',
          'Clear garage and organize garden storage.',
          'Pressure-wash patio, balcony, or entryway.',
          'Flip or rotate all mattresses.',
        ]
      } else if (s.startsWith('Summer')) {
        plan = [
          'Clean air conditioning filters and wipe indoor unit vents.',
          'Deep clean outdoor grill and patio furniture.',
          'Inspect kitchen pantry for summer flour weevils / ants.',
          'Check under sinks and refrigerator drip pans for moisture.',
        ]
      } else if (s.startsWith('Autumn')) {
        plan = [
          'Clear leaves from gutters and outdoor downspouts.',
          'Service heating systems and replace furnace filters.',
          'Seal drafty door sweeps and window weather-stripping.',
          'Deep clean carpets before holiday gatherings.',
        ]
      } else {
        plan = [
          'Inspect bathroom silicone caulk for winter mold growth.',
          'Dust and vacuum radiator heaters or baseboard heating vents.',
          'Wipe interior walls and window sills prone to condensation.',
          'Sanitize high-touch surfaces (door knobs, banisters, remote controls).',
        ]
      }

      return [
        res('Seasonal Focus', s.split(' ')[0], T.good),
        res('Priority Items', `${plan.length} seasonal tasks`, T.neutral),
        doc('Seasonal Action Checklist', `SEASONAL CLEANING PLAN: ${s.toUpperCase()}\n${'='.repeat(50)}\n\n${plan.map((p, i) => `[ ] ${i + 1}. ${p}`).join('\n')}`),
      ]
    },
  },
  {
    id: 'move-out-cleaning-checklist',
    name: 'Move-Out Cleaning Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Check off critical cleaning tasks required to secure 100% of your rental security deposit back.',
    tip: 'Take timestamped photos of every clean room, the inside of the oven, and window tracks after cleaning.',
    usage: [
      'Work through the landlord inspection checklist.',
      'Monitor deposit readiness score before the final walkthrough.',
    ],
    method: [
      'Weights the top 10 most common deposit deduction points identified by property managers.',
    ],
    fields: [
      ck('depositItems', 'Tenant Move-Out Checklist:', [
        'Oven and stovetop completely degreased and burn marks removed',
        'Refrigerator emptied, defrosted, and interior wiped clean',
        'All wall scuffs erased with melamine foam sponge',
        'Picture hanging nails removed and holes spackled',
        'Bathroom limescale removed from taps, shower door and tiles',
        'Inside of all kitchen cupboards and drawers wiped free of crumbs',
        'Window sills, tracks and glass wiped clean',
        'Carpet professionally vacuumed or steam-cleaned',
        'Trash emptied completely from all rooms and outside bins',
        'Light fixtures dusted and burnt-out bulbs replaced',
      ]),
    ],
    compute: (v) => {
      const list = asBoolList(v.depositItems)
      const done = list.filter(Boolean).length
      const total = list.length || 10
      const score = Math.round((done / total) * 100)

      return [
        res('Deposit Safety Score', pct(score, 0), score >= 90 ? T.good : score >= 60 ? T.warn : T.bad),
        res('Completed Checks', `${done} of ${total}`, T.neutral),
        res('Risk Verdict', score >= 90 ? 'Ready for Walkthrough' : 'High Risk of Cleaning Deductions', score >= 90 ? T.good : T.bad),
      ]
    },
  },
  {
    id: 'rental-property-cleaning-checklist',
    name: 'Rental Property Cleaning Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Turnover cleaning checklist for landlords, Airbnb hosts, and short-term rental managers.',
    tip: 'Leave a fresh roll of paper towels and individually wrapped welcome soaps to boost initial 5-star cleanliness ratings.',
    usage: [
      'Select turnover speed (Express 1-hour vs Deep turnover).',
      'Follow the guest-readiness protocol.',
    ],
    method: [
      'Ensures critical sanitization points (linens, high-touch, bathroom seals) are verified before guest check-in.',
    ],
    fields: [
      sel('turnoverType', 'Turnover Type', ['Same-Day Guest Turnover (2 hrs)', 'Full Maintenance Turnover (Deep Clean)', 'Pre-Listing Photo Prep'], 'Same-Day Guest Turnover (2 hrs)'),
      n('bedsCount', 'Beds to Change', { def: 2, min: 1, max: 8 }),
    ],
    compute: (v) => {
      const type = asSel(v.turnoverType)
      const beds = asNum(v.bedsCount)

      const protocol = [
        `1. Strip ${beds} beds and start high-heat wash cycle immediately.`,
        '2. Empty all bins, replace liners, and check under beds for forgotten guest belongings.',
        '3. Sanitize toilet, shower, sink faucet, and restock 2 toilet paper rolls per bath.',
        '4. Wipe kitchen appliances, clean coffee machine filter, and verify clean sponge.',
        '5. Dust coffee table, TV console, and check remote control batteries.',
        '6. Vacuum all rugs and mop entrance and bathroom tiles.',
        '7. Set fresh bath towels, hand towels, and verify Wi-Fi password card is visible.',
      ].join('\n')

      return [
        res('Turnover Target', type.split('(')[0].trim(), T.good),
        res('Bed Linens', `${beds} sets to wash & make`, T.neutral),
        doc('Host Turnover Protocol', protocol),
      ]
    },
  },
  {
    id: 'cleaning-service-quote-calculator',
    name: 'Cleaning Service Quote Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Estimate a fair market price for professional residential cleaning services based on home details.',
    tip: 'Getting recurring bi-weekly service typically earns a 15-20% discount compared to one-off bookings.',
    usage: [
      'Enter home square footage, bedroom count, and bathroom count.',
      'Select any specialized add-ons (inside oven, windows, pet hair).',
      'Check the estimated market quote range.',
    ],
    method: [
      'Base formula: $0.10-$0.14 per sq ft adjusted for room counts and deep clean add-ons.',
    ],
    fields: [
      n('sqft', 'Home Size (sq ft)', { def: 1500, min: 300, max: 8000, step: 100 }),
      n('bedrooms', 'Bedrooms', { def: 3, min: 0, max: 8 }),
      n('bathrooms', 'Bathrooms', { def: 2, min: 1, max: 6 }),
      sel('frequency', 'Booking Frequency', ['One-time Deep Clean', 'Bi-weekly Service', 'Monthly Service'], 'Bi-weekly Service'),
      ck('addons', 'Optional Add-on Services:', [
        'Inside oven deep scrub ($35)',
        'Inside refrigerator wipe ($30)',
        'Interior window glass ($45)',
        'Heavy pet hair removal ($25)',
      ]),
    ],
    compute: (v) => {
      const sqft = asNum(v.sqft)
      const beds = asNum(v.bedrooms)
      const baths = asNum(v.bathrooms)
      const freq = asSel(v.frequency)
      const addons = asBoolList(v.addons)

      let base = (sqft * 0.08) + (beds * 15) + (baths * 25)
      if (freq.startsWith('One-time')) base *= 1.35
      if (freq.startsWith('Bi-weekly')) base *= 0.85

      const addonPrices = [35, 30, 45, 25]
      let addonTotal = 0
      addons.forEach((checked, i) => {
        if (checked) addonTotal += addonPrices[i] ?? 0
      })

      const total = base + addonTotal
      const low = Math.round(total * 0.9)
      const high = Math.round(total * 1.15)

      return [
        res('Estimated Fair Quote', `${money(low)} – ${money(high)}`, T.good, `Median estimate: ${money(total)}`),
        res('Base Service', money(base), T.neutral, `${sqft} sq ft, ${beds}b/${baths}b`),
        res('Selected Add-ons', money(addonTotal), addonTotal > 0 ? T.neutral : T.good),
      ]
    },
  },
]
