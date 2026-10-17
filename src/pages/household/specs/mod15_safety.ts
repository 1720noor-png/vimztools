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
  num,
} from './householdSpec'

const SUB = 'Safety'
const SUB_ID = 'safety'

export const safetySpecs: HouseholdSpec[] = [
  {
    id: 'home-emergency-checklist',
    name: 'Home Emergency Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Master home emergency readiness checklist covering water, non-perishable food, flashlights, first aid, and power banks.',
    tip: 'FEMA recommends households keep a minimum 72-hour self-sufficiency supply of water, food, and medical essentials.',
    usage: [
      'Review foundational 72-hour survival essentials.',
      'Check off emergency water, food, flashlights, radio, and documents.',
      'Check overall household emergency readiness score.',
    ],
    method: [
      'Scores compliance across FEMA Ready.gov core emergency benchmarks.',
    ],
    fields: [
      ck('waterSupplied', '1 gallon of drinking water per person/pet per day for 3 days minimum', true),
      ck('nonPerishableFood', '3-day supply of shelf-stable food + manual can opener', true),
      ck('noPowerLights', 'LED flashlights, headlamps, and fresh batteries (No candles due to fire risk)', true),
      ck('firstAidReady', 'Comprehensive family first aid kit with trauma dressings and shears', true),
      ck('handCrankRadio', 'NOAA Weather Radio with battery backup or hand-crank charging', false),
      ck('cashOnHand', 'Emergency cash stash in small bills ($100-$300; ATMs fail without power)', false),
    ],
    compute: (v) => {
      const items = [
        v.waterSupplied,
        v.nonPerishableFood,
        v.noPowerLights,
        v.firstAidReady,
        v.handCrankRadio,
        v.cashOnHand,
      ]
      const count = items.filter(Boolean).length
      const score = Math.round((count / items.length) * 100)

      return [
        res('Emergency Readiness', `${score}% Prepared`, score >= 80 ? 'good' : 'warn', `${count} of ${items.length} FEMA core standards met`),
        res('Weather Radio Status', v.handCrankRadio ? 'NOAA Radio Ready' : 'Acquire NOAA Weather Radio', v.handCrankRadio ? 'good' : 'warn', 'Vital when cell networks fail'),
        res('Emergency Cash', v.cashOnHand ? 'Cash on Hand' : 'Keep $100-$200 in small bills', v.cashOnHand ? 'good' : 'info', 'Credit card readers fail during blackouts'),
        res('Review Cadence', 'Inspect expiration dates every daylight savings change', 'good', 'Rotate water and canned goods every 6 months'),
      ]
    },
  },
  {
    id: 'emergency-contact-sheet',
    name: 'Emergency Contact Sheet',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Create a laminated emergency contacts sheet with 911 dispatch, poison control, local electric/gas utility, and out-of-town relatives.',
    tip: 'Program emergency contacts into your phone as "ICE" (In Case of Emergency) so paramedics can find them without unlocking your phone.',
    usage: [
      'Enter primary local contacts and utility emergency lines.',
      'Enter out-of-state emergency coordinator.',
      'Generate printable emergency contact card.',
    ],
    method: [
      'Compiles emergency response directory for home display.',
    ],
    fields: [
      txt('localPoliceFire', 'Local Police/Fire Dispatch (Non-Emergency)', '(555) 019-2830'),
      txt('poisonControlNum', 'National Poison Control Center', '1-800-222-1222'),
      txt('gasUtilityEmergency', 'Gas Utility Leak Reporting Line', '1-800-GAS-LEAK'),
      txt('outOfAreaContact', 'Out-of-Area Family Contact', 'Uncle David (Denver, CO - 555-0182)'),
    ],
    compute: (v) => {
      const pol = asStr(v.localPoliceFire, 'Police Non-Emergency')
      const pc = asStr(v.poisonControlNum, '1-800-222-1222')
      const gas = asStr(v.gasUtilityEmergency, 'Gas Line')
      const ooa = asStr(v.outOfAreaContact, 'Out of area relative')

      return [
        res('Poison Control Line', pc, 'bad', 'Available 24/7/365 nationwide'),
        res('Gas Leak Line', gas, 'bad', 'Call from outside home if smelling gas'),
        res('Non-Emergency Dispatch', pol, 'info', 'For noise, minor incidents (Use 911 for life safety)'),
        res('Out-of-Area Coordinator', ooa, 'good', 'Central check-in hub for family members'),
      ]
    },
  },
  {
    id: 'family-emergency-plan',
    name: 'Family Emergency Plan',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Establish primary and secondary family meeting locations (neighborhood tree vs regional park) during evacuations.',
    tip: 'Designate two meeting spots: Spot #1 directly outside the home (mailbox/tree) and Spot #2 outside the neighborhood (library/park).',
    usage: [
      'Enter Spot #1 (Immediate home exterior meeting place).',
      'Enter Spot #2 (Neighborhood emergency evacuation meeting place).',
      'Check communication protocol and drill cadence.',
    ],
    method: [
      'Structures FEMA dual-location family rendezvous plan.',
    ],
    fields: [
      txt('meetingSpot1', 'Meeting Spot #1 (Outside Home)', 'The big oak tree by the front sidewalk'),
      txt('meetingSpot2', 'Meeting Spot #2 (Outside Neighborhood)', 'Oak Park Community Center playground'),
      ck('planPracticed', 'Practiced evacuation drill with all family members within last 6 months', true),
    ],
    compute: (v) => {
      const s1 = asStr(v.meetingSpot1, 'Front sidewalk')
      const s2 = asStr(v.meetingSpot2, 'Community center')
      const drilled = v.planPracticed

      return [
        res('Meeting Spot #1 (Immediate)', s1, 'good', 'For fire evacuation from home'),
        res('Meeting Spot #2 (Neighborhood)', s2, 'info', 'If neighborhood is barricaded or evacuated'),
        res('Emergency Drill Status', drilled ? 'Recently Practiced' : 'SCHEDULE EVACUATION DRILL', drilled ? 'good' : 'warn', 'Practice turns panic into muscle memory'),
        res('Text-First Rule', 'Text messages often get through when voice calls fail', 'good', 'Send short status texts: "Safe at Spot #2"'),
      ]
    },
  },
  {
    id: 'emergency-kit-checklist',
    name: 'Emergency Kit Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Complete inventory of the classic 72-hour Go-Bag / Bug-Out Bag for rapid home evacuation.',
    tip: 'Keep your Go-Bags packed and stored in an easily accessible hallway closet near your primary garage or front exit.',
    usage: [
      'Work through Go-Bag items across water, food, navigation, warmth, and documents.',
      'Check kit completeness score.',
    ],
    method: [
      'Evaluates 6 essential categories of personal survival gear.',
    ],
    fields: [
      ck('hydrationPack', '1 Gallon water per person + water purification tablets or Sawyer mini filter', true),
      ck('rationsPacked', 'Calorie-dense Millennium bars or MRE non-cook food bars', true),
      ck('emergencyBlankets', 'Mylar thermal reflective space blankets + rain ponchos', true),
      ck('workGlovesMasks', 'Heavy leather work gloves + N95 particulate dust masks', true),
      ck('multiToolLights', 'Stainless multi-tool knife + LED headlamp + waterproof matches', true),
      ck('copiesDocuments', 'Thumb drive with encrypted scans of ID, insurance & deeds', false),
    ],
    compute: (v) => {
      const items = [
        v.hydrationPack,
        v.rationsPacked,
        v.emergencyBlankets,
        v.workGlovesMasks,
        v.multiToolLights,
        v.copiesDocuments,
      ]
      const count = items.filter(Boolean).length
      const score = Math.round((count / items.length) * 100)

      return [
        res('Go-Bag Completeness', `${score}% Ready`, score >= 80 ? 'good' : 'warn', `${count} of ${items.length} survival pillars packed`),
        res('Encrypted Flash Drive', v.copiesDocuments ? 'Secured' : 'Back up documents to encrypted USB', v.copiesDocuments ? 'good' : 'warn', 'Crucial for proving identity and insurance claims'),
        res('Headlamp Advantage', 'Headlamps keep hands free for carrying children or gear', 'info', 'Better than handheld flashlights'),
        res('Weight Target', 'Keep pack weight under 20% of your body weight', 'good', 'Ensures you can walk briskly for miles'),
      ]
    },
  },
  {
    id: 'first-aid-kit-checklist',
    name: 'First Aid Kit Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Inventory medical supplies: tourniquet, trauma shears, pressure bandages, sterile gauze, burn gel, and splints.',
    tip: 'A commercial CAT tourniquet and trauma shears are vital for severe limb lacerations and power tool injuries.',
    usage: [
      'Check off essential medical and trauma supplies.',
      'Verify expiration dates on ointments and antiseptic wipes.',
    ],
    method: [
      'Scores first aid readiness against OSHA and Red Cross trauma standards.',
    ],
    fields: [
      ck('traumaBandages', 'Israeli pressure emergency bandage + sterile 4x4 gauze pads', true),
      ck('tourniquetShears', 'Combat Application Tourniquet (CAT) + EMT medical trauma shears', false),
      ck('burnGelSaline', 'Water-Jel burn dressing + sterile eye wash saline solution', true),
      ck('otcMeds', 'Aspirin (heart attack), Ibuprofen, Diphenhydramine (Benadryl allergic reaction)', true),
      ck('samSplintTape', 'SAM structural aluminum splint + self-adherent Coban cohesive wrap', false),
      ck('cprShieldGloves', 'Nitrile medical gloves (latex-free) + CPR pocket barrier shield', true),
    ],
    compute: (v) => {
      const items = [
        v.traumaBandages,
        v.tourniquetShears,
        v.burnGelSaline,
        v.otcMeds,
        v.samSplintTape,
        v.cprShieldGloves,
      ]
      const count = items.filter(Boolean).length
      const score = Math.round((count / items.length) * 100)

      return [
        res('First Aid Kit Rating', `${score}% Stocked`, score >= 75 ? 'good' : 'warn', `${count} of ${items.length} medical categories on hand`),
        res('Bleeding Control', v.tourniquetShears ? 'Severe Bleeding Capable' : 'Add CAT Tourniquet & Trauma Shears', v.tourniquetShears ? 'good' : 'bad', 'Stops life-threatening arterial bleeding in 30 sec'),
        res('Allergy & Cardiac Care', v.otcMeds ? 'Emergency Meds Stocked' : 'Stock Chewable Aspirin & Benadryl', v.otcMeds ? 'good' : 'warn', 'Immediate first response for heart attack/allergy'),
        res('Annual Expiration Audit', 'Replace antibiotic ointments and wipes every 2 years', 'info', 'Keeps active ingredients sterile & potent'),
      ]
    },
  },
  {
    id: 'power-outage-checklist',
    name: 'Power Outage Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Blackout action checklist: keep refrigerator doors shut (4 hours safe), power banks, solar lights, and generator safety.',
    tip: 'An unopened refrigerator keeps food safe for 4 hours; a full unopened freezer holds safe freezing temperatures for 48 hours.',
    usage: [
      'Review critical steps when grid power drops.',
      'Check off food preservation protocols, phone power conservation, and generator carbon monoxide safety.',
    ],
    method: [
      'Enforces CDC food safety and generator safety guidelines.',
    ],
    fields: [
      ck('fridgeClosed', 'Keep refrigerator and freezer doors strictly closed (4 hrs fridge / 48 hrs freezer)', true),
      ck('generatorOutdoors', 'Portable generator placed OUTDOORS at least 20 feet from home and open windows', true),
      ck('unplugSensitiveElec', 'Unplugged expensive computers and TVs to prevent post-restoration voltage surges', true),
      ck('powerBankPhones', 'Phones placed in Low Power Mode; charged via backup power bank', true),
      ck('flashlightsOnly', 'Using LED flashlights and battery lanterns only (NO open candle flames)', true),
    ],
    compute: (v) => {
      const items = [
        v.fridgeClosed,
        v.generatorOutdoors,
        v.unplugSensitiveElec,
        v.powerBankPhones,
        v.flashlightsOnly,
      ]
      const done = items.filter(Boolean).length

      return [
        res('Outage Protocol', `${done} of 5 safety rules active`, done === 5 ? 'good' : 'warn', 'Protects food and life safety'),
        res('Carbon Monoxide Danger', v.generatorOutdoors ? 'Generator Safely Placed' : 'DANGER: Never run generator inside or garage', v.generatorOutdoors ? 'good' : 'bad', 'CO poisoning from generators is fatal in minutes'),
        res('Food Safety Clock', 'Discard refrigerated meat/dairy if power out > 4 hours', 'warn', 'When in doubt, throw it out'),
        res('Surge Defense', v.unplugSensitiveElec ? 'Electronics Unplugged' : 'Unplug sensitive electronics now', 'info', 'Power restoration spikes fry circuit boards'),
      ]
    },
  },
  {
    id: 'severe-weather-preparedness-checklist',
    name: 'Severe Weather Preparedness Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Prepare your home for hurricanes, tornadoes, blizzards, and severe thunderstorms.',
    tip: 'In a tornado, head to the lowest level (basement) or an interior windowless room (bathroom/closet) and cover with a mattress.',
    usage: [
      'Select weather threat (Tornado, Hurricane, Winter Blizzard, Severe Thunderstorm).',
      'Check tailored safety actions, shuttering rules, and shelter locations.',
    ],
    method: [
      'Tailors emergency actions to specific National Weather Service threat categories.',
    ],
    fields: [
      sel('weatherThreat', 'Severe Weather Event', [
        'Tornado Watch / Warning (Interior lowest room, helmet on)',
        'Hurricane / Tropical Storm (Board windows, clear patio furniture, 7-day water)',
        'Winter Blizzard / Ice Storm (Pipe freeze defense, backup heat, indoor blankets)',
        'Severe Thunderstorm / Flash Flood (High ground, avoid floodwaters)',
      ], 'Tornado Watch / Warning (Interior lowest room, helmet on)'),
      ck('patioFurnitureSecured', 'Brought in outdoor patio furniture, trash cans, and trampolines', true),
    ],
    compute: (v) => {
      const threat = asSel(v.weatherThreat)
      const secured = v.patioFurnitureSecured

      return [
        res('Weather Threat Category', threat.split('(')[0].trim(), 'good', threat.split('(')[1]?.replace(')', '') || 'Severe weather event'),
        res('Missile Hazard Defense', secured ? 'Patio Furniture Secured' : 'BRING IN OUTDOOR FURNITURE', secured ? 'good' : 'bad', 'High winds turn patio chairs into deadly projectiles'),
        res('Shelter Directive', threat.includes('Tornado') ? 'Basement or center bathroom under mattress' : threat.includes('Flood') ? 'Move to higher ground immediately' : 'Stay indoors away from windows', 'warn', 'Follow official NWS evacuation orders'),
        res('Communication Lifeline', 'Monitor local county OEM alerts and NOAA weather radio', 'info', 'Receive real-time radar updates'),
      ]
    },
  },
  {
    id: 'home-evacuation-checklist',
    name: 'Home Evacuation Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Rapid 15-minute home evacuation checklist: grab Go-Bags, pets, prescriptions, laptops, and shut off gas/water.',
    tip: 'If instructed to evacuate immediately, grab "The 6 P\'s": People/Pets, Papers, Prescriptions, Pictures, PCs, and Plastic (cash/cards).',
    usage: [
      'Work through rapid 15-minute departure priorities.',
      'Check off family headcounts, pets in carriers, medication bags, and master valve shutoffs.',
    ],
    method: [
      'Sequences rapid evacuation using the proven "6 P\'s of Evacuation".',
    ],
    fields: [
      ck('peoplePetsAccounted', 'P1: People & Pets accounted for, leashed or in carriers', true),
      ck('prescriptionsGathered', 'P2: Prescriptions and medical devices (inhalers, glasses) in bag', true),
      ck('papersDrive', 'P3: Papers, passports, and backup hard drives/laptops gathered', true),
      ck('picturesHeirlooms', 'P4: Irreplaceable family photo albums or sentimental heirlooms', false),
      ck('plasticCash', 'P5: Wallet, credit cards, checkbook, and emergency cash envelope', true),
      ck('valvesSecured', 'P6: Main gas valve and main water valve shut off before exit', false),
    ],
    compute: (v) => {
      const items = [
        v.peoplePetsAccounted,
        v.prescriptionsGathered,
        v.papersDrive,
        v.picturesHeirlooms,
        v.plasticCash,
        v.valvesSecured,
      ]
      const count = items.filter(Boolean).length
      const score = Math.round((count / items.length) * 100)

      return [
        res('Evacuation Readiness', `${score}% Evacuated`, score >= 80 ? 'good' : 'warn', `${count} of 6 P-Categories secured`),
        res('Gas Valve Shutoff', v.valvesSecured ? 'Utilities Isolated' : 'Shut off main gas ONLY if ordered or smelling gas', v.valvesSecured ? 'good' : 'info', 'Requires utility technician to turn back on'),
        res('Door Marker Tip', 'Tie white towel or ribbon to front doorknob upon exit', 'good', 'Signals emergency search teams that home is evacuated'),
        res('Vehicle Fuel Rule', 'Never let your vehicle tank drop below 1/2 during storm season', 'warn', 'Gas stations run out during mass evacuations'),
      ]
    },
  },
  {
    id: 'fire-escape-plan',
    name: 'Fire Escape Plan',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Map two unobstructed escape routes out of every bedroom and verify escape ladders for upper-story windows.',
    tip: 'House fires double in size every 60 seconds; modern synthetic furnishings leave occupants with under 3 minutes to escape.',
    usage: [
      'Select number of second-story bedrooms.',
      'Verify two clear exit pathways (door + window) for every bedroom.',
      'Check escape ladder requirements and family fire drill schedule.',
    ],
    method: [
      'Enforces NFPA 101 Life Safety Code standards for residential escape.',
    ],
    fields: [
      n('upperBedrooms', 'Second-Story / Upper Level Bedrooms', { def: 3, min: 0, max: 8, step: 1 }),
      ck('escapeLaddersReady', 'Have UL-listed emergency escape ladder in every upper bedroom', true),
      ck('twoExitsPerRoom', 'Every bedroom has 2 unobstructed ways out (Door + Openable Window)', true),
      ck('crawlLowPracticed', 'Taught children to crawl low under smoke (clean air is in bottom 12 inches)', true),
    ],
    compute: (v) => {
      const upper = asNum(v.upperBedrooms, 3)
      const ladders = v.escapeLaddersReady
      const exits = v.twoExitsPerRoom
      const crawl = v.crawlLowPracticed

      return [
        res('Life Safety Escape Status', exits && ladders ? 'Fully Compliant' : 'SAFETY DEFICIT DETECTED', exits && ladders ? 'good' : 'bad', 'Two routes out of every room'),
        res('Upper Story Ladders', upper > 0 ? (ladders ? `${upper} Escape Ladders Ready` : 'CRITICAL: Buy 2nd-story escape ladders') : 'Single story (No ladders needed)', ladders || upper === 0 ? 'good' : 'bad', 'Prevents trapping during hallway fires'),
        res('Smoke Crawl Rule', crawl ? 'Drilled Crawling Low' : 'Teach kids to crawl on belly', crawl ? 'good' : 'warn', 'Superheated toxic smoke rises to ceiling'),
        res('Door Touch Test', 'Feel door with back of hand; if hot, do NOT open door', 'warn', 'Use secondary window route'),
      ]
    },
  },
  {
    id: 'fire-safety-checklist',
    name: 'Fire Safety Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Whole-house fire prevention audit: dryer lint duct, kitchen grease, space heaters, and Christmas tree watering.',
    tip: 'Keep space heaters at least 3 feet away from curtains, bedding, and furniture, and plug directly into wall outlets only.',
    usage: [
      'Perform whole-house fire hazard audit.',
      'Check off space heater clearance, dryer lint cleaning, and kitchen grease safety.',
    ],
    method: [
      'Audits top 5 causes of residential structure fires (NFPA data).',
    ],
    fields: [
      ck('dryerLintCleaned', 'Cleaned dryer lint screen before every load + cleaned rigid metal exhaust duct', true),
      ck('spaceHeaterClearance', 'Space heaters kept 3 feet from flammables & plugged into wall (No power strips)', true),
      ck('kitchenGreaseCover', 'Have matching metal lid next to stove to smother grease fires (Never use water)', true),
      ck('candleExtinguished', 'No open unattended burning candles anywhere in the home', true),
      ck('electricalPanelsClear', '36 inches of clear unobstructed workspace in front of electrical breaker box', true),
    ],
    compute: (v) => {
      const checks = [
        v.dryerLintCleaned,
        v.spaceHeaterClearance,
        v.kitchenGreaseCover,
        v.candleExtinguished,
        v.electricalPanelsClear,
      ]
      const count = checks.filter(Boolean).length
      const score = Math.round((count / checks.length) * 100)

      return [
        res('Fire Prevention Score', `${score}% Safe`, score === 100 ? 'good' : 'warn', `${count} of ${checks.length} hazards secured`),
        res('Kitchen Grease Fire Rule', 'NEVER POUR WATER ON A GREASE FIRE', 'bad', 'Slide lid over pan and turn off burner'),
        res('Dryer Lint Danger', v.dryerLintCleaned ? 'Lint Ducts Maintained' : 'Clean dryer duct annually', v.dryerLintCleaned ? 'good' : 'warn', 'Leading cause of home appliance fires'),
        res('Extinguisher Placement', 'Mount 1 extinguisher in kitchen, garage, and each floor', 'good', 'Class ABC multipurpose dry chemical'),
      ]
    },
  },
  {
    id: 'smoke-alarm-replacement-tracker',
    name: 'Smoke Alarm Replacement Tracker',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate smoke detector manufacture age and replace entire detector units after the 10-year expiration ceiling.',
    tip: 'Smoke alarms expire after 10 years; the internal sensor degrades and fails even if the test beeper still sounds.',
    usage: [
      'Enter manufacture date printed on back of smoke alarm.',
      'Check detector age and replace-by date.',
    ],
    method: [
      'NFPA standard mandates complete replacement of all smoke alarms 10 years from manufacture date.',
    ],
    fields: [
      n('manufactureYear', 'Year Printed on Back of Alarm', { def: 2017, min: 2000, max: 2026, step: 1 }),
      sel('sensorType', 'Alarm Technology', [
        'Dual-Sensor (Photoelectric + Ionization - Recommended)',
        'Photoelectric Only (Best for smoldering furniture fires)',
        'Ionization Only (Best for fast flaming fires)',
      ], 'Dual-Sensor (Photoelectric + Ionization - Recommended)'),
    ],
    compute: (v) => {
      const yr = asNum(v.manufactureYear, 2017)
      const currentYear = 2026
      const age = currentYear - yr
      const remainingYears = Math.max(0, 10 - age)
      const isExpired = age >= 10

      return [
        res('Detector Status', isExpired ? 'EXPIRED (Replace Unit Immediately)' : `Active (${remainingYears} years life left)`, isExpired ? 'bad' : 'good', `${age} years old (10-yr max limit)`),
        res('Expiration Year', `${yr + 10}`, 'info', 'Mandatory NFPA replacement date'),
        res('Sensor Recommendation', 'Dual-Sensor covers both smoldering and flaming fires', 'good', 'Photoelectric minimizes kitchen false alarms'),
        res('10-Year Sealed Battery', 'Upgrade to 10-year sealed lithium tamper-proof alarms', 'neutral', 'Eliminates annual 9V battery changes'),
      ]
    },
  },
  {
    id: 'smoke-alarm-testing-reminder',
    name: 'Smoke Alarm Testing Reminder',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Schedule monthly test-button tests and semi-annual battery replacement cycles aligned with daylight savings.',
    tip: 'Change your smoke alarm batteries twice a year when you "Spring Forward" and "Fall Back" your clocks.',
    usage: [
      'Review monthly testing protocol.',
      'Check detector coverage across bedrooms, hallways, and basements.',
    ],
    method: [
      'Enforces monthly test-button push and semi-annual battery swaps.',
    ],
    fields: [
      ck('monthlyTestDone', 'Pressed and held test button on all alarms this month (loud horn sounded)', true),
      ck('bedroomCoverage', 'Smoke alarms installed inside EVERY bedroom + outside every sleeping area', true),
      ck('interconnectedAlarms', 'Alarms are interconnected (when one sounds, they all sound)', true),
    ],
    compute: (v) => {
      const test = v.monthlyTestDone
      const bed = v.bedroomCoverage
      const inter = v.interconnectedAlarms

      return [
        res('Monthly Test Status', test ? 'Tested & Operational' : 'TEST ALARMS TODAY', test ? 'good' : 'warn', 'Push test button until alarm chirps 3x'),
        res('Code Coverage', bed ? 'Full Bedroom Coverage' : 'Install alarms in every bedroom', bed ? 'good' : 'bad', 'Ensures sleeping occupants wake up'),
        res('Interconnection Benefit', inter ? 'Interconnected System' : 'Upgrade to wireless RF interconnected alarms', inter ? 'good' : 'info', 'Early warning if basement fire starts while sleeping'),
        res('Vacuuming Tip', 'Vacuum dust and cobwebs off alarm grill every 6 months', 'neutral', 'Prevents nuisance chirps in middle of night'),
      ]
    },
  },
  {
    id: 'carbon-monoxide-detector-reminder',
    name: 'Carbon Monoxide Detector Reminder',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Manage carbon monoxide (CO) detector lifespan (5-7 years) and optimal low-to-mid wall mounting placement.',
    tip: 'Carbon monoxide is odorless and colorless; CO detectors must be replaced every 5 to 7 years (faster than smoke alarms).',
    usage: [
      'Enter CO detector installation year.',
      'Verify placement near bedrooms and fuel-burning appliances.',
      'Check replacement date and safety guidelines.',
    ],
    method: [
      'Electrochemical CO sensors degrade after 5 to 7 years.',
    ],
    fields: [
      n('installYear', 'Installation Year of CO Detector', { def: 2021, min: 2010, max: 2026, step: 1 }),
      ck('placedNearBedrooms', 'Installed outside each sleeping area and on every level with gas appliances', true),
    ],
    compute: (v) => {
      const yr = asNum(v.installYear, 2021)
      const currentYear = 2026
      const age = currentYear - yr
      const remainingYears = Math.max(0, 7 - age)
      const isExpired = age >= 7

      return [
        res('CO Detector Status', isExpired ? 'EXPIRED (Replace CO Detector)' : `Active (${remainingYears} years left)`, isExpired ? 'bad' : 'good', `${age} years old (7-year lifespan)`),
        res('Placement Verification', v.placedNearBedrooms ? 'Properly Located' : 'Place outside sleeping areas', v.placedNearBedrooms ? 'good' : 'warn', 'CO mixes evenly with air'),
        res('End-of-Life Chirp', 'A steady chirp every 30 seconds means sensor end-of-life', 'info', 'Do not ignore end-of-life beeps'),
        res('Symptom Warning', 'Headaches, dizziness, nausea in multiple family members = Evacuate & call 911', 'bad', 'Classic CO poisoning signs'),
      ]
    },
  },
  {
    id: 'emergency-lighting-checklist',
    name: 'Emergency Lighting Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Inventory plug-in power failure nightlights, LED headlamps, glow sticks, and long-lasting lanterns.',
    tip: 'Plug-in emergency flashlights stay charged in wall outlets and turn on automatically when the power fails.',
    usage: [
      'Audit emergency lighting devices across bedrooms, hallways, and living zones.',
      'Check battery readiness.',
    ],
    method: [
      'Evaluates emergency blackout illumination coverage.',
    ],
    fields: [
      n('autoPlugInLights', 'Plug-in Auto-On Emergency Wall Flashlights', { def: 3, min: 0, max: 10, step: 1 }),
      n('ledHeadlamps', 'LED Headlamps (Keeps hands free)', { def: 4, min: 0, max: 12, step: 1 }),
      n('batteryLanterns', 'High-Lumen Battery Camping Lanterns', { def: 2, min: 0, max: 8, step: 1 }),
      ck('spareBatteriesChecked', 'Spare alkaline batteries stored in cool, dry container', true),
    ],
    compute: (v) => {
      const plug = asNum(v.autoPlugInLights, 3)
      const head = asNum(v.ledHeadlamps, 4)
      const lant = asNum(v.batteryLanterns, 2)
      const batts = v.spareBatteriesChecked

      const totalLights = plug + head + lant

      return [
        res('Total Emergency Lights', `${totalLights} devices`, totalLights >= 6 ? 'good' : 'warn', 'Sufficient for entire house'),
        res('Hallway Safety', plug >= 2 ? 'Auto-Blackout Lights Active' : 'Install plug-in emergency lights in hallways', plug >= 2 ? 'good' : 'info', 'Instant light during 2:00 AM blackouts'),
        res('Hands-Free Navigation', `${head} headlamps ready`, head >= 2 ? 'good' : 'neutral', 'Essential for checking breakers or moving kids'),
        res('Battery Storage Rule', batts ? 'Batteries Fresh' : 'Check battery expiration dates', batts ? 'good' : 'warn', 'Do not store batteries inside unused lights long-term'),
      ]
    },
  },
  {
    id: 'emergency-water-storage-calculator',
    name: 'Emergency Water Storage Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate emergency drinking and sanitation water reserves based on family size, pets, and duration (3-14 days).',
    tip: 'FEMA benchmark: 1 gallon per person per day (0.5 gal drinking + 0.5 gal food prep and basic hygiene).',
    usage: [
      'Enter number of family members and household pets.',
      'Select emergency duration (3-day minimum vs 14-day comprehensive).',
      'Check total gallons and liters to store in sealed containers.',
    ],
    method: [
      'Total Gallons = ((People * 1.0 gal) + (Pets * 0.5 gal)) * Emergency Days.',
    ],
    fields: [
      n('familyMembers', 'Number of Family Members', { def: 4, min: 1, max: 12, step: 1 }),
      n('pets', 'Household Pets (Dogs/Cats)', { def: 2, min: 0, max: 8, step: 1 }),
      sel('reserveDuration', 'Storage Duration Goal', [
        '3-Day Minimum Go-Bag / Bug-In (FEMA standard)',
        '7-Day Extended Disaster Supply',
        '14-Day Self-Reliance / Major Earthquake',
      ], '3-Day Minimum Go-Bag / Bug-In (FEMA standard)'),
    ],
    compute: (v) => {
      const p = asNum(v.familyMembers, 4)
      const pets = asNum(v.pets, 2)
      const dur = asSel(v.reserveDuration)

      const days = dur.includes('14-Day') ? 14 : dur.includes('7-Day') ? 7 : 3
      const dailyGal = (p * 1.0) + (pets * 0.5)
      const totalGal = Math.round(dailyGal * days)
      const totalLiters = Math.round(totalGal * 3.785)
      const cases16Oz = Math.ceil(totalGal / 3.0) // 1 case (24 x 16.9 oz) = ~3.1 gal

      return [
        res('Emergency Water Reserve', `${totalGal} gallons`, 'good', `${num(totalLiters)} Liters total`),
        res('Storage Duration', `${days} days self-sufficiency`, 'info', `${p} people + ${pets} pets`),
        res('Case Pack Equivalent', `~${cases16Oz} cases of bottled water`, 'neutral', '24-packs of 16.9 oz bottles'),
        res('Alternative Bulk Storage', `${Math.ceil(totalGal / 5)} x 5-gallon food-grade water jugs (WaterBrick / Reliance)`, 'good', 'Durable, stackable, food-grade blue jugs'),
      ]
    },
  },
  {
    id: 'emergency-food-supply-calculator',
    name: 'Emergency Food Supply Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate daily caloric targets (2,000 kcal/person) and shelf-stable food provisions for emergency reserves.',
    tip: 'Choose shelf-stable foods that require no cooking or refrigeration (canned tuna, chili, peanut butter, granola bars).',
    usage: [
      'Enter family size.',
      'Enter emergency days target (3, 7, 14, 30 days).',
      'Check total calories required and food supply categories.',
    ],
    method: [
      'Total Calories = Family Members * 2,000 kcal/day * Days.',
    ],
    fields: [
      n('people', 'Number of Family Members', { def: 4, min: 1, max: 10, step: 1 }),
      n('daysDuration', 'Emergency Days Target', { def: 7, min: 3, max: 30, step: 1 }),
    ],
    compute: (v) => {
      const p = asNum(v.people, 4)
      const days = asNum(v.daysDuration, 7)

      const totalKcal = p * 2000 * days
      const cannedMealsEst = Math.ceil(totalKcal / 450) // ~450 kcal per can avg

      return [
        res('Total Caloric Reserve', `${num(totalKcal)} kcal`, 'good', `For ${p} people over ${days} days`),
        res('Daily Energy Benchmark', '2,000 kcal per person/day', 'info', 'Maintains cognitive and physical strength'),
        res('Canned Meal Equivalent', `~${cannedMealsEst} standard cans`, 'neutral', 'Soups, chilis, beans, tuna, fruit'),
        res('Manual Can Opener Rule', 'Pack 2 manual hand-turn can openers in food bin', 'bad', 'Electric can openers fail in blackouts'),
      ]
    },
  },
  {
    id: 'emergency-supply-budget-calculator',
    name: 'Emergency Supply Budget Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Build a comprehensive home disaster preparedness supply kit on an affordable $25 to $50 monthly budget.',
    tip: 'Building an emergency stockpile incrementally over 6 to 12 months makes preparedness painless on household budgets.',
    usage: [
      'Enter monthly preparedness budget ($/mo).',
      'Select target preparedness level (72-hr basic, 14-day comprehensive, full off-grid power).',
      'Check estimated months to complete kit and phased shopping list.',
    ],
    method: [
      'Itemizes costs across water, food, first aid, lighting, radio, and power.',
    ],
    fields: [
      n('monthlyBudget', 'Monthly Emergency Fund Budget ($)', { def: 40, min: 15, max: 300, step: 5 }),
      sel('kitScope', 'Preparedness Target Tier', [
        'Tier 1: 72-Hour Basic Survival Kit (~$180 total)',
        'Tier 2: 14-Day Complete Household Stockpile (~$450 total)',
        'Tier 3: Full Resilience + Solar Generator (~$1,200 total)',
      ], 'Tier 2: 14-Day Complete Household Stockpile (~$450 total)'),
    ],
    compute: (v) => {
      const b = asNum(v.monthlyBudget, 40)
      const kit = asSel(v.kitScope)

      let totalTarget = 450
      if (kit.includes('Tier 1')) totalTarget = 180
      else if (kit.includes('Tier 3')) totalTarget = 1200

      const monthsNeeded = Math.ceil(totalTarget / b)

      return [
        res('Total Kit Investment', money(totalTarget), 'good', kit.split(':')[1]?.split('(')[0].trim() || 'Preparedness kit'),
        res('Timeline to Complete', `~${monthsNeeded} months`, monthsNeeded <= 6 ? 'good' : 'info', `@ ${money(b)}/month steady pace`),
        res('Month 1 Priority', 'Water jugs + manual can opener + LED flashlights', 'good', 'Immediate 72-hr baseline'),
        res('Month 2 Priority', 'Canned protein stockpile + family first aid kit', 'info', 'Nutrition and injury management'),
      ]
    },
  },
  {
    id: 'home-safety-inspection-checklist',
    name: 'Home Safety Inspection Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Annual whole-house safety inspection: handrail sturdiness, water heater temp (120°F), GFCI outlets, and trip hazards.',
    tip: 'Set your water heater thermostat to 120°F (49°C) to prevent scalding injuries to young children and elderly family members.',
    usage: [
      'Perform whole-house hazard audit.',
      'Check off water heater scald temp, handrail stability, slip hazards, and window locks.',
    ],
    method: [
      'Scores safety across CDC and Home Safety Council criteria.',
    ],
    fields: [
      ck('waterHeater120', 'Water heater set to maximum 120°F to prevent scalding burns', true),
      ck('handrailsSecure', 'Stairway handrails firmly anchored into wall studs with zero wobble', true),
      ck('tripHazardsCleared', 'No loose rugs or extension cords across high-traffic pathways', true),
      ck('windowLocksTested', 'Window sash locks secure on all ground floor accessible windows', false),
      ck('outdoorLightingWorking', 'Exterior motion sensor security floodlights working properly', true),
    ],
    compute: (v) => {
      const items = [
        v.waterHeater120,
        v.handrailsSecure,
        v.tripHazardsCleared,
        v.windowLocksTested,
        v.outdoorLightingWorking,
      ]
      const done = items.filter(Boolean).length
      const score = Math.round((done / items.length) * 100)

      return [
        res('Safety Inspection Score', `${score}% Secure`, score >= 80 ? 'good' : 'warn', `${done} of ${items.length} safety items verified`),
        res('Anti-Scald Setting', v.waterHeater120 ? 'Safe 120°F' : 'Lower water heater to 120°F', v.waterHeater120 ? 'good' : 'bad', 'Water at 140°F causes 3rd-degree scald in 5 sec'),
        res('Fall Prevention', v.handrailsSecure && v.tripHazardsCleared ? 'Fall Hazards Minimized' : 'Secure handrails & loose rugs', 'good', 'Falls are #1 cause of home injuries'),
        res('Burglary Deterrent', v.outdoorLightingWorking ? 'Exterior Lit' : 'Install motion security lights', 'info', 'Deters opportunistic nighttime intruders'),
      ]
    },
  },
  {
    id: 'child-home-safety-checklist',
    name: 'Child Home Safety Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Baby-proofing audit: anti-tip furniture anchors for dressers/TVs, outlet covers, cabinet locks, and cordless blinds.',
    tip: 'Unanchored dressers and TVs cause a child emergency room visit every 45 minutes; anchor all furniture to wall studs.',
    usage: [
      'Review essential child-proofing protections.',
      'Check off furniture wall anchors, outlet covers, poison cabinet latches, and window blind cord safety.',
    ],
    method: [
      'Validates CPSC (Consumer Product Safety Commission) child safety rules.',
    ],
    fields: [
      ck('furnitureAnchored', 'All dressers, bookcases, and TVs securely anchored to wall studs with heavy brackets', true),
      ck('electricalOutletsCovered', 'Tamper-resistant safety caps or sliding plate covers on all wall outlets', true),
      ck('poisonsLocked', 'Cleaning chemicals, medications, and laundry pods locked in high cabinet with latch', true),
      ck('cordlessBlinds', 'Cordless window coverings installed (No looped cords causing strangulation risk)', false),
      ck('babyGatesStairs', 'Hardware-mounted safety gates installed at top and bottom of all stairwells', true),
    ],
    compute: (v) => {
      const items = [
        v.furnitureAnchored,
        v.electricalOutletsCovered,
        v.poisonsLocked,
        v.cordlessBlinds,
        v.babyGatesStairs,
      ]
      const count = items.filter(Boolean).length
      const score = Math.round((count / items.length) * 100)

      return [
        res('Child Safety Rating', `${score}% Proofed`, score === 100 ? 'good' : 'warn', `${count} of ${items.length} critical protections verified`),
        res('Furniture Tip-Over Risk', v.furnitureAnchored ? 'Furniture Anchored' : 'CRITICAL: Anchor Dressers & TVs to Studs', v.furnitureAnchored ? 'good' : 'bad', 'Prevents fatal furniture tip-over crushes'),
        res('Poison & Pod Safety', v.poisonsLocked ? 'Poisons Locked Away' : 'Lock laundry detergent pods high', v.poisonsLocked ? 'good' : 'bad', 'Pods look like candy to toddlers'),
        res('Stairway Gates', v.babyGatesStairs ? 'Stair Gates Secure' : 'Use hardware-mounted gates at top of stairs', v.babyGatesStairs ? 'good' : 'warn', 'Pressure gates can slip under child weight'),
      ]
    },
  },
  {
    id: 'elderly-home-safety-checklist',
    name: 'Elderly Home Safety Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Senior aging-in-place safety checklist: bathroom grab bars, non-slip shower mats, nightlights, and threshold ramps.',
    tip: 'Towel racks are NOT grab bars; they pull out of drywall under human weight. Install stud-anchored ADA grab bars.',
    usage: [
      'Audit senior safety modifications.',
      'Check off shower grab bars, walk-in shower access, slip-resistant floors, and well-lit staircases.',
    ],
    method: [
      'Applies ADA and CDC Steadi fall-prevention benchmarks.',
    ],
    fields: [
      ck('grabBarsInstalled', 'ADA-rated grab bars installed into studs in shower and next to toilet', true),
      ck('throwRugsRemoved', 'All loose throw rugs removed or secured with double-sided carpet tape', true),
      ck('stairwayLighting', 'High-illumination continuous lighting on stairs with top/bottom 3-way switches', true),
      ck('leverDoorHandles', 'Lever-style door handles replacing round knobs (easier for arthritis)', false),
      ck('medicAlertButton', 'Wearable emergency alert pendant or smartwatch with fall detection active', false),
    ],
    compute: (v) => {
      const items = [
        v.grabBarsInstalled,
        v.throwRugsRemoved,
        v.stairwayLighting,
        v.leverDoorHandles,
        v.medicAlertButton,
      ]
      const done = items.filter(Boolean).length
      const score = Math.round((done / items.length) * 100)

      return [
        res('Senior Fall Prevention', `${score}% Safe`, score >= 80 ? 'good' : 'warn', `${done} of ${items.length} aging-in-place upgrades verified`),
        res('Bathroom Grab Bars', v.grabBarsInstalled ? 'ADA Bars in Studs' : 'INSTALL STUD-ANCHORED GRAB BARS', v.grabBarsInstalled ? 'good' : 'bad', 'Bathrooms account for 70% of senior home falls'),
        res('Rug Hazard Alert', v.throwRugsRemoved ? 'Throw Rugs Secured' : 'Remove all loose throw rugs', v.throwRugsRemoved ? 'good' : 'bad', '#1 household trip hazard for seniors'),
        res('Fall Detection Tech', v.medicAlertButton ? 'Emergency Alert Active' : 'Consider Apple Watch or Life Alert', v.medicAlertButton ? 'good' : 'info', 'Summons help automatically if unconscious'),
      ]
    },
  },
  {
    id: 'pet-safety-checklist',
    name: 'Pet Safety Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Identify household pet hazards: chocolate, xylitol, rodent poison, Lilies, open toilet bowls, and electrical cords.',
    tip: 'Xylitol (birch bark sweetener, found in sugar-free gum and peanut butter) causes rapid, fatal liver failure in dogs.',
    usage: [
      'Review top pet toxicity hazards in the home.',
      'Check off plant safety, food pantry security, and rodenticide bans.',
    ],
    method: [
      'Validates ASPCA Animal Poison Control guidelines.',
    ],
    fields: [
      ck('toxicPlantsRemoved', 'Removed toxic houseplants (True Lilies are 100% fatal to cats; Philodendron, Sago Palm)', true),
      ck('xylitolFoodsSecured', 'Checked peanut butter and sugar-free gums for Xylitol; locked away', true),
      ck('noRodentPoisons', 'Zero anticoagulant or neurotoxic rodent poisons anywhere on property', true),
      ck('medsLockedInDrawers', 'Human prescription and OTC medications stored in closed medicine cabinets', true),
    ],
    compute: (v) => {
      const items = [
        v.toxicPlantsRemoved,
        v.xylitolFoodsSecured,
        v.noRodentPoisons,
        v.medsLockedInDrawers,
      ]
      const count = items.filter(Boolean).length

      return [
        res('Pet Toxicity Defense', `${count} of 4 hazards eliminated`, count === 4 ? 'good' : 'warn', 'Pet safe home'),
        res('Lily Danger Alert (Cats)', v.toxicPlantsRemoved ? 'Safe Foliage' : 'DANGER: A single pollen grain of Lily causes feline kidney failure', v.toxicPlantsRemoved ? 'good' : 'bad', 'Never allow True Lilies in homes with cats'),
        res('Rodent Poison Risk', v.noRodentPoisons ? 'Poisons Excluded' : 'BAN ALL RAT POISONS', v.noRodentPoisons ? 'good' : 'bad', 'Pets eat bait or poisoned mice (secondary poisoning)'),
        res('ASPCA Hotline', 'ASPCA Poison Control: (888) 426-4435', 'info', 'Call immediately if ingestion suspected'),
      ]
    },
  },
  {
    id: 'emergency-document-checklist',
    name: 'Emergency Document Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Inventory physical and digital vital documents: passports, home deed, insurance policies, and vaccination records.',
    tip: 'Keep encrypted PDF scans of your driver\'s license and insurance card in an offline vault on your smartphone.',
    usage: [
      'Audit vital documents checklist.',
      'Verify physical fire safe placement and digital cloud backups.',
    ],
    method: [
      'Validates all essential records needed for post-disaster insurance recovery.',
    ],
    fields: [
      ck('propertyDeedInsurance', 'Homeowners/renters insurance policy declarations page and property deed', true),
      ck('idsPassports', 'Government IDs, birth certificates, and social security cards', true),
      ck('medicalRecordsMeds', 'List of active prescriptions, doctor contacts, and medical insurance cards', true),
      ck('estateWillPapers', 'Will, Living Trust, and Durable Financial Power of Attorney documents', false),
    ],
    compute: (v) => {
      const items = [
        v.propertyDeedInsurance,
        v.idsPassports,
        v.medicalRecordsMeds,
        v.estateWillPapers,
      ]
      const count = items.filter(Boolean).length

      return [
        res('Vital Documents Status', `${count} of 4 categories ready`, count >= 3 ? 'good' : 'warn', 'Disaster proof records'),
        res('Insurance Declaration Page', v.propertyDeedInsurance ? 'Insurance Policy Ready' : 'Print insurance policy dec page', v.propertyDeedInsurance ? 'good' : 'warn', 'Speeds emergency insurance claim filing'),
        res('Storage Location', 'Store paper originals in UL-rated fireproof pouch inside grab-and-go safe', 'good', 'Ready to carry in 10 seconds'),
        res('Encrypted USB Backup', 'Keep a 256-bit AES encrypted thumb drive in your Go-Bag', 'info', 'Digital redundancy is king'),
      ]
    },
  },
  {
    id: 'important-documents-inventory',
    name: 'Important Documents Inventory',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Catalog bank account numbers, policy numbers, title deeds, and safe deposit box keys in an organized registry.',
    tip: 'Store a laminated inventory card of key account numbers inside your fire safe for quick family reference.',
    usage: [
      'Enter primary insurance company and policy number.',
      'Enter bank names and safety deposit box location.',
      'Generate emergency financial registry summary.',
    ],
    method: [
      'Structures comprehensive household financial documentation.',
    ],
    fields: [
      txt('insurancePolicy', 'Home Insurance Company & Policy #', 'State Farm #HO-98214-A'),
      txt('primaryBank', 'Primary Bank & Emergency Checking #', 'Chase Bank (Acct ending in 4102)'),
      txt('safeDepositLocation', 'Safe Deposit Box Location & Key ID', 'First National Bank - Branch #3 (Box #142)'),
    ],
    compute: (v) => {
      const ins = asStr(v.insurancePolicy, 'Insurance Policy')
      const bank = asStr(v.primaryBank, 'Primary Bank')
      const safe = asStr(v.safeDepositLocation, 'Safe Deposit Box')

      return [
        res('Insurance Policy Documented', ins, 'good', 'Primary asset protection'),
        res('Banking Coordinates', bank, 'info', 'Emergency funds access'),
        res('Safe Deposit Vault', safe, 'neutral', 'Offsite physical backup repository'),
        res('Security Directive', 'Never write unencrypted bank PINs or passwords in plain text', 'warn', 'Protect against identity theft'),
      ]
    },
  },
  {
    id: 'emergency-contact-card-generator',
    name: 'Emergency Contact Card Generator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Generate wallet-sized emergency contact cards for every family member\'s wallet, purse, and school backpack.',
    tip: 'Every child should carry a laminated emergency card with parents\' cell numbers inside their school backpack.',
    usage: [
      'Enter child / family member name.',
      'Enter Mom cell, Dad cell, and out-of-town contact.',
      'Check formatted wallet card summary ready to print and laminate.',
    ],
    method: [
      'Formats standard 3.5" x 2" wallet emergency identity card.',
    ],
    fields: [
      txt('memberName', 'Family Member / Child Name', 'Emma Johnson'),
      txt('parent1Phone', 'Parent #1 Cell Phone', 'Mom (555) 234-5678'),
      txt('parent2Phone', 'Parent #2 Cell Phone', 'Dad (555) 876-5432'),
      txt('doctorEmergency', 'Pediatrician / Medical Note', 'Dr. Smith (555-0199) - Penicillin Allergy'),
    ],
    compute: (v) => {
      const name = asStr(v.memberName, 'Child')
      const p1 = asStr(v.parent1Phone, 'Parent 1')
      const p2 = asStr(v.parent2Phone, 'Parent 2')
      const docNote = asStr(v.doctorEmergency, 'Medical note')

      return [
        res('Wallet Card Profile', name, 'good', 'Printable emergency card'),
        res('Primary Contacts', `${p1} / ${p2}`, 'info', 'Immediate phone reach'),
        res('Medical Alerts', docNote, 'bad', 'Critical for emergency first responders'),
        res('Card Lamination', 'Print, fold to 3.5" x 2", and seal with clear packaging tape', 'good', 'Durable, waterproof wallet card'),
      ]
    },
  },
  {
    id: 'home-insurance-inventory-checklist',
    name: 'Home Insurance Inventory Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Create a video and photographic room-by-room home inventory documenting serial numbers for insurance claims.',
    tip: 'Take a continuous 15-minute video walkthrough of your entire home, opening all closet doors and drawers, once a year.',
    usage: [
      'Review room-by-room photo and video inventory checkpoints.',
      'Verify serial numbers for major electronics, tools, and jewelry.',
    ],
    method: [
      'Validates all criteria required by property claims adjusters for maximum claim settlement.',
    ],
    fields: [
      ck('videoWalkthroughDone', 'Completed continuous video walkthrough of every room, opening closet doors and drawers', true),
      ck('electronicsSerials', 'Photographed serial number rating plates on TVs, laptops, and power tools', true),
      ck('jewelryAppraisals', 'Written professional appraisals for jewelry, watches, and fine art stored safely', false),
      ck('cloudVideoBackup', 'Uploaded inventory video and photos to Google Drive / iCloud / Dropbox', true),
    ],
    compute: (v) => {
      const items = [
        v.videoWalkthroughDone,
        v.electronicsSerials,
        v.jewelryAppraisals,
        v.cloudVideoBackup,
      ]
      const count = items.filter(Boolean).length

      return [
        res('Insurance Inventory Status', `${count} of 4 steps complete`, count >= 3 ? 'good' : 'warn', 'Rock-solid claims evidence'),
        res('Cloud Backup Status', v.cloudVideoBackup ? 'Cloud Backup Secured' : 'UPLOAD PHOTOS TO CLOUD DRIVE', v.cloudVideoBackup ? 'good' : 'bad', 'Local files on home computers are destroyed in fires'),
        res('Jewelry Rider Caution', v.jewelryAppraisals ? 'Appraised & Scheduled' : 'Standard policies cap jewelry at $1,500', v.jewelryAppraisals ? 'good' : 'warn', 'Add scheduled personal property riders for fine jewelry'),
        res('Update Frequency', 'Re-film inventory video annually after holiday gift season', 'info', 'Captures new major purchases'),
      ]
    },
  },
  {
    id: 'home-inventory-for-insurance',
    name: 'Home Inventory for Insurance',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate personal property valuation by category (Electronics, Furniture, Kitchenware, Clothing) for policy coverage limits.',
    tip: 'Most homeowners insurance policies set Personal Property coverage at 50% to 70% of the total Dwelling coverage.',
    usage: [
      'Enter replacement value estimates for major item categories.',
      'Check total personal property value and compare against your policy declarations page limit.',
    ],
    method: [
      'Sums personal property replacement valuations across 4 key categories.',
    ],
    fields: [
      n('furnitureValue', 'Furniture, Mattresses & Rugs ($)', { def: 22000, min: 2000, max: 200000, step: 500 }),
      n('electronicsValue', 'Computers, TVs, Audio & Cameras ($)', { def: 9500, min: 500, max: 80000, step: 250 }),
      n('wardrobeValue', 'Clothing, Shoes & Outerwear ($)', { def: 14000, min: 1000, max: 100000, step: 500 }),
      n('kitchenToolsValue', 'Cookware, Appliances & Tools ($)', { def: 8500, min: 500, max: 60000, step: 250 }),
    ],
    compute: (v) => {
      const furn = asNum(v.furnitureValue, 22000)
      const elec = asNum(v.electronicsValue, 9500)
      const cloth = asNum(v.wardrobeValue, 14000)
      const tool = asNum(v.kitchenToolsValue, 8500)

      const totalVal = furn + elec + cloth + tool

      return [
        res('Total Personal Property Value', money(totalVal), 'good', 'Estimated replacement cost new'),
        res('Recommended Policy Limit', money(Math.ceil((totalVal * 1.2) / 10000) * 10000), 'info', 'Includes 20% inflation/buffer allowance'),
        res('Coverage Type Rule', 'Ensure policy is "Replacement Cost Value" (RCV), not "Actual Cash Value" (ACV)', 'bad', 'ACV depreciates heavily; RCV buys brand new items'),
        res('Largest Asset Share', furn > cloth ? 'Furniture & Bedding' : 'Wardrobe & Apparel', 'neutral', 'Account for accumulated clothing value'),
      ]
    },
  },
  {
    id: 'disaster-recovery-checklist',
    name: 'Disaster Recovery Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Post-disaster steps: photograph damage before cleanup, prevent secondary mold, contact insurer, and hire licensed adjusters.',
    tip: 'Never throw away damaged items before your insurance adjuster inspects them; pile them in the yard if they smell.',
    usage: [
      'Follow chronological post-disaster recovery steps.',
      'Check off initial photo documentation, insurer notification, and mold mitigation.',
    ],
    method: [
      'Directs post-disaster insurance claim and mitigation protocols.',
    ],
    fields: [
      ck('damageDocumented', 'Took 100+ photos/video of all water, structural, and property damage before cleanup', true),
      ck('claimReported', 'Contacted insurance company and logged official Claim Number and Adjuster Name', true),
      ck('mitigateSecondary', 'Took reasonable steps to prevent further damage (tarped roof, boarded windows)', true),
      ck('receiptsPreserved', 'Kept every single receipt for emergency hotels, meals, plywood, and tarps', true),
    ],
    compute: (v) => {
      const items = [
        v.damageDocumented,
        v.claimReported,
        v.mitigateSecondary,
        v.receiptsPreserved,
      ]
      const count = items.filter(Boolean).length

      return [
        res('Disaster Recovery Status', `${count} of 4 steps executed`, count === 4 ? 'good' : 'warn', 'Protecting insurance rights'),
        res('Secondary Damage Duty', v.mitigateSecondary ? 'Mitigation Active' : 'TARP ROOF / COVER WINDOWS NOW', v.mitigateSecondary ? 'good' : 'bad', 'Policies exclude secondary rain damage if neglected'),
        res('ALE Expense Tracking', v.receiptsPreserved ? 'Receipts Preserved' : 'Save all hotel & food receipts', v.receiptsPreserved ? 'good' : 'warn', 'Reimbursed under Loss of Use / ALE coverage'),
        res('Contractor Caution', 'Never pay 100% upfront to door-to-door storm-chasing contractors', 'warn', 'Verify license and insurance with state board'),
      ]
    },
  },
  {
    id: 'emergency-communication-plan',
    name: 'Emergency Communication Plan',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Establish family communication protocols: designated check-in times, SMS priority, and battery preservation.',
    tip: 'During regional disasters, local phone lines jam; SMS text messages use 1% of the bandwidth and queue until delivered.',
    usage: [
      'Select family check-in protocol.',
      'Review battery preservation steps and social media safety check-ins.',
    ],
    method: [
      'Applies Red Cross and FEMA crisis communications protocols.',
    ],
    fields: [
      sel('checkInFrequency', 'Scheduled Check-In Windows', [
        'Every 3 Hours on the Hour (Active storm/disaster)',
        'Morning & Evening (8:00 AM & 7:00 PM - Extended outage)',
        'Immediate upon reaching destination / meeting spot',
      ], 'Immediate upon reaching destination / meeting spot'),
      ck('textOverCallRule', 'Family instructed to TEXT first instead of placing voice calls', true),
    ],
    compute: (v) => {
      const freq = asSel(v.checkInFrequency)
      const textRule = v.textOverCallRule

      return [
        res('Check-In Cadence', freq, 'good', 'Family accountability rule'),
        res('Bandwidth Protocol', textRule ? 'SMS Texting Priority Active' : 'Instruct family to TEXT, not call', textRule ? 'good' : 'warn', 'Conserves battery and network capacity'),
        res('Phone Battery Life', 'Put phone on Ultra Battery Saver mode + disable Bluetooth/WiFi', 'good', 'Extends single charge to 72 hours'),
        res('Social Media Safety', 'Mark family "Safe" on Red Cross Safe & Well or Facebook Crisis Response', 'info', 'Notifies extended relatives instantly'),
      ]
    },
  },
  {
    id: 'utility-emergency-contact-list',
    name: 'Utility Emergency Contact List',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Directory of local electric outage reporting, gas leak dispatch, municipal water main break, and cable repair lines.',
    tip: 'If you smell sulfur or rotten eggs, leave the home immediately on foot before calling the gas emergency line; never flip light switches.',
    usage: [
      'Enter emergency phone numbers for electric, gas, and water utilities.',
      'Generate utility crisis dispatch reference.',
    ],
    method: [
      'Formats municipal utility emergency dispatch contacts.',
    ],
    fields: [
      txt('electricOutage', 'Electric Utility Power Outage Hotline', '1-800-POWER-OFF'),
      txt('gasLeakHotline', 'Natural Gas Emergency / Leak Line', '1-888-GAS-LEAK'),
      txt('waterMainBreak', 'Water Authority Main Break Dispatch', '(555) 019-3300'),
    ],
    compute: (v) => {
      const elec = asStr(v.electricOutage, 'Electric Hotline')
      const gas = asStr(v.gasLeakHotline, 'Gas Hotline')
      const water = asStr(v.waterMainBreak, 'Water Hotline')

      return [
        res('Gas Leak Line', gas, 'bad', 'Evacuate immediately before dialing'),
        res('Electric Outage Line', elec, 'warn', 'Report downed power lines immediately'),
        res('Water Main Emergency', water, 'info', 'For street geysers or lost pressure'),
        res('Downed Line Safety', 'Stay at least 35 feet away from all downed wires', 'bad', 'Assume all downed wires are energized and deadly'),
      ]
    },
  },
  {
    id: 'emergency-preparedness-scorecard',
    name: 'Emergency Preparedness Scorecard',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate your household\'s composite readiness grade across Water, Food, Power, Evacuation, Medical, and Insurance.',
    tip: 'Homes with a composite preparedness score above 85% experience 60% less financial and emotional trauma during disasters.',
    usage: [
      'Score your household across 6 core emergency pillars.',
      'Check your overall composite readiness grade and top priority gap.',
    ],
    method: [
      'Calculates weighted readiness composite score across 6 preparedness dimensions.',
    ],
    fields: [
      ck('pillarWater', 'Pillar 1: 3-day minimum water stored (1 gal/person/day)', true),
      ck('pillarFood', 'Pillar 2: Shelf-stable non-perishable food + manual opener', true),
      ck('pillarMedical', 'Pillar 3: Trauma first aid kit + 14-day prescription backup', true),
      ck('pillarPower', 'Pillar 4: LED flashlights + power banks + NOAA weather radio', true),
      ck('pillarPlan', 'Pillar 5: Practiced family evacuation plan + Go-Bags packed', false),
      ck('pillarDocs', 'Pillar 6: Vital documents in fire safe + digital cloud backup', false),
    ],
    compute: (v) => {
      const pillars = [
        v.pillarWater,
        v.pillarFood,
        v.pillarMedical,
        v.pillarPower,
        v.pillarPlan,
        v.pillarDocs,
      ]
      const done = pillars.filter(Boolean).length
      const score = Math.round((done / pillars.length) * 100)

      let grade = 'Grade A (Disaster Ready)'
      if (score < 50) grade = 'Grade D (High Vulnerability)'
      else if (score < 70) grade = 'Grade C (Moderate Preparedness)'
      else if (score < 85) grade = 'Grade B (Substantial Preparedness)'

      return [
        res('Preparedness Score', `${score}% Ready`, score >= 80 ? 'good' : score >= 60 ? 'info' : 'warn', grade),
        res('Pillars Verified', `${done} of 6 pillars secure`, 'info', 'FEMA national benchmark standard'),
        res('Top Priority Vulnerability', !v.pillarWater ? 'Store 1 gal/person/day water' : !v.pillarFood ? 'Stock 3-day food supply' : !v.pillarMedical ? 'First aid & medicine reserve' : !v.pillarPower ? 'NOAA radio & power banks' : !v.pillarPlan ? 'Practice evacuation drill' : !v.pillarDocs ? 'Secure documents in fire safe' : 'All pillars secure!', score === 100 ? 'good' : 'warn', 'Address weakest link first'),
        res('Household Peace of Mind', score >= 80 ? 'Family is well-protected against unexpected crises' : 'Continue incremental preparation', 'good', 'Preparation removes fear'),
      ]
    },
  },
]
