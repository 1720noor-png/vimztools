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

const SUB = 'Kitchen'
const SUB_ID = 'kitchen'

export const kitchenSpecs: HouseholdSpec[] = [
  {
    id: 'kitchen-storage-capacity-calculator',
    name: 'Kitchen Storage Capacity Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Estimate your kitchen cabinet and pantry capacity in cubic feet and linear feet.',
    tip: 'Adding tiered shelf risers doubles vertical plate and mug storage space in deep cabinets.',
    usage: [
      'Enter the count of upper cabinets, base cabinets, and pantry shelves.',
      'Check total storage volume and adequacy for your household size.',
    ],
    method: [
      'Upper cabinets average ~4 cu ft each; base cabinets ~8 cu ft each; pantry shelves ~2.5 cu ft each.',
    ],
    fields: [
      n('upperCabinets', 'Upper Cabinets Count', { def: 6, min: 1, max: 25 }),
      n('baseCabinets', 'Base Cabinets / Drawers', { def: 6, min: 1, max: 25 }),
      n('pantryShelves', 'Pantry Shelves Count', { def: 5, min: 0, max: 20 }),
      n('people', 'Household Size', { def: 3, min: 1, max: 10 }),
    ],
    compute: (v) => {
      const u = asNum(v.upperCabinets)
      const b = asNum(v.baseCabinets)
      const p = asNum(v.pantryShelves)
      const people = asNum(v.people)

      const totalCuFt = (u * 4.2) + (b * 8.0) + (p * 2.8)
      const neededCuFt = people * 18
      const status = totalCuFt >= neededCuFt ? 'Generous Capacity' : totalCuFt >= neededCuFt * 0.8 ? 'Adequate Storage' : 'Tight / Declutter Recommended'

      return [
        res('Estimated Storage Volume', `${Math.round(totalCuFt)} cu ft`, T.good, `~${num(totalCuFt * 28.3)} liters`),
        res('Storage Status', status, totalCuFt >= neededCuFt ? T.good : T.warn, `Recommended: ~${neededCuFt} cu ft for ${people} people`),
        res('Capacity per Person', `${numD(totalCuFt / people, 1)} cu ft`, T.neutral),
      ]
    },
  },
  {
    id: 'refrigerator-storage-planner',
    name: 'Refrigerator Storage Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Check if your refrigerator capacity matches your household food storage and meal prep needs.',
    tip: 'Keep your fridge at 37°F (3°C) and avoid crowding—cold air must circulate freely around containers to maintain safe temperatures.',
    usage: [
      'Enter refrigerator volume in liters or cubic feet.',
      'Input family size and meal prepping habits.',
      'View capacity rating and shelf space breakdown.',
    ],
    method: [
      'Rule of thumb: 4-6 cu ft per adult plus 10 cu ft baseline for standard meal prep and condiments.',
    ],
    fields: [
      n('fridgeVolume', 'Fridge Capacity (cu ft)', { def: 18, min: 4, max: 35, step: 0.5 }),
      n('household', 'Household Members', { def: 3, min: 1, max: 8 }),
      sel('mealPrep', 'Meal Prep Batching', ['None (Cook daily)', 'Moderate (3-5 prep containers)', 'Heavy (10+ prep containers)'], 'Moderate (3-5 prep containers)'),
    ],
    compute: (v) => {
      const vol = asNum(v.fridgeVolume)
      const h = asNum(v.household)
      const prep = asSel(v.mealPrep)

      const prepAdd = prep.startsWith('None') ? 0 : prep.startsWith('Moderate') ? 2.5 : 5
      const idealVol = 10 + (h * 3.5) + prepAdd
      const ratio = (vol / idealVol) * 100

      const tone = ratio >= 90 ? T.good : ratio >= 75 ? T.warn : T.bad
      const assessment = ratio >= 110 ? 'Spacious Fridge' : ratio >= 90 ? 'Ideal Size' : 'Likely Overcrowded'

      return [
        res('Storage Match', assessment, tone, `${vol} cu ft available vs ${numD(idealVol, 1)} cu ft recommended`),
        res('Space Sufficiency', pct(ratio, 0), tone),
        res('Capacity in Liters', `~${Math.round(vol * 28.3168)} Liters`, T.neutral),
      ]
    },
  },
  {
    id: 'freezer-storage-planner',
    name: 'Freezer Storage Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Plan freezer zones to maximize food safety, reduce freezer burn, and stop mystery frozen items.',
    tip: 'Label all freezer items with Item Name and Date in permanent marker—freeze flat in ziplock bags like books on a shelf.',
    usage: [
      'Select freezer style (Top mount, Bottom drawer, Side-by-side, or Chest freezer).',
      'Receive optimal 4-zone allocation guide.',
    ],
    method: [
      'Allocates temperatures: coldest bottom/rear for raw meat, accessible upper shelves for daily items.',
    ],
    fields: [
      sel('freezerType', 'Freezer Style', ['Bottom Drawer Freezer', 'Top Mount Freezer', 'Side-by-Side Freezer', 'Dedicated Chest Freezer'], 'Bottom Drawer Freezer'),
    ],
    compute: (v) => {
      const type = asSel(v.freezerType)

      const guides: Record<string, string> = {
        'Bottom Drawer Freezer': '• TOP SLIDING BASKET: Ice trays, frozen berries, daily bread, butter.\n• MIDDLE BASKET: Cooked meal prep containers, ready-to-eat leftovers.\n• BOTTOM DEEP BIN (COLDEST): Raw poultry, beef steaks, and bulk frozen meats.\n• DOOR SLOTS: Frozen herbs, opened coffee beans, ice packs.',
        'Top Mount Freezer': '• TOP SHELF: Ice maker and rapid-grab items (ice cream, frozen fruit).\n• BOTTOM SHELF (COLDEST): Raw sealed meats and long-term bulk frozen bags.\n• DOOR RACKS: Nuts, seeds, yeast, ice packs (do not store raw meat on door).',
        'Side-by-Side Freezer': '• EYE LEVEL: Frequently used frozen veggies and prepared meals.\n• LOWER BASKETS: Bulk raw meats (prevents drip if power fails).\n• UPPER SHELVES: Ice, dessert treats, breads.',
        'Dedicated Chest Freezer': '• HANGING BASKETS: Everyday frozen veg, butter, half-used bags.\n• REUSABLE BAG BINS: Group by type (Poultry bag, Red meat bag, Seafood bag).\n• BOTTOM LAYER: Quarter/half cow shares, whole turkeys, emergency food supply.',
      }

      return [
        res('Freezer Architecture', type, T.good),
        doc('4-Zone Storage Strategy', guides[type] ?? 'Organize by frequency of use and food safety.'),
      ]
    },
  },
  {
    id: 'freezer-space-calculator',
    name: 'Freezer Space Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate cubic feet required for bulk meat purchases (e.g. 1/4 cow, 50 lbs chicken) or meal prep.',
    tip: '1 cubic foot of freezer space holds approximately 35 to 40 pounds of cut, vacuum-packaged meat.',
    usage: [
      'Enter total pounds of meat or bulk items to freeze.',
      'Check cubic feet needed and whether your fridge freezer or a chest freezer is required.',
    ],
    method: [
      'Standard density: ~35 lbs per cubic foot of usable packaged food storage.',
    ],
    fields: [
      n('bulkLbs', 'Weight of Food to Freeze (lbs)', { def: 70, min: 5, max: 800, step: 5 }),
    ],
    compute: (v) => {
      const lbs = asNum(v.bulkLbs)
      const cuFt = lbs / 35
      const kg = lbs * 0.453592

      const recommendedFreezer = cuFt <= 4 ? 'Standard Refrigerator Freezer Compartment' : cuFt <= 7 ? 'Small 5-7 cu ft Compact Chest Freezer' : 'Large 10+ cu ft Deep Chest Freezer'

      return [
        res('Freezer Space Needed', `${numD(cuFt, 1)} cu ft`, T.good, `For ${lbs} lbs (${numD(kg, 1)} kg) of food`),
        res('Recommended Unit', recommendedFreezer, cuFt > 4 ? T.warn : T.good),
        res('Freezer Fill Guide', `Equals ~${Math.ceil(lbs / 2)} standard 2-lb vacuum packs`, T.neutral),
      ]
    },
  },
  {
    id: 'food-container-size-calculator',
    name: 'Food Container Size Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Determine the exact container volume (ml / oz) needed to store your cooked portions.',
    tip: 'Leave 1/2 inch of headspace at the top of containers when freezing liquids (soups/sauces) as water expands ~9% when freezing.',
    usage: [
      'Select food type and number of adult servings.',
      'Check total volume in milliliters, fluid ounces, and cup measurements.',
    ],
    method: [
      'Soup/Stews: ~450ml (15 oz) per serving; Salad: ~600ml (20 oz); Grain/Curry: ~400ml (13 oz).',
    ],
    fields: [
      sel('foodType', 'Meal Type', ['Soup / Stew / Chili (Liquid)', 'Grain + Protein Bowl (Curry, Rice)', 'Leafy Green Salad', 'Pasta Dish'], 'Grain + Protein Bowl (Curry, Rice)'),
      n('servings', 'Number of Servings', { def: 2, min: 1, max: 12 }),
    ],
    compute: (v) => {
      const food = asSel(v.foodType)
      const s = asNum(v.servings)

      const perServingMl = food.includes('Soup') ? 450 : food.includes('Salad') ? 600 : food.includes('Pasta') ? 480 : 400
      const totalMl = perServingMl * s
      const totalOz = totalMl / 29.5735
      const cups = totalMl / 240

      return [
        res('Required Volume', `${Math.round(totalMl)} ml (${numD(totalOz, 1)} fl oz)`, T.good, `~${numD(cups, 1)} US cups`),
        res('Single Container Size', s > 1 ? `Use one ${Math.round(totalMl)}ml dish or ${s} × ${perServingMl}ml tubs` : `${perServingMl} ml container`, T.neutral),
        res('Freezer Safety Note', food.includes('Soup') ? 'Leave 15% headspace for liquid expansion' : 'Safe to fill to rim', T.neutral),
      ]
    },
  },
  {
    id: 'meal-prep-time-planner',
    name: 'Meal Prep Time Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Estimate the total cooking and cleanup time for your weekly batch cooking session.',
    tip: 'Chop all vegetables for the entire week in one go before turning on any stove burner—this saves 25% total prep time.',
    usage: [
      'Input number of meals and different proteins to cook.',
      'View preparation, cooking, and packaging time breakdown.',
    ],
    method: [
      'Calculates 20m base prep + 12m per unique dish + 15m packaging & sink cleanup.',
    ],
    fields: [
      n('mealCount', 'Total Meal Portions to Prep', { def: 8, min: 2, max: 30 }),
      n('uniqueDishes', 'Different Recipes / Proteins', { def: 2, min: 1, max: 6 }),
    ],
    compute: (v) => {
      const meals = asNum(v.mealCount)
      const dishes = asNum(v.uniqueDishes)

      const prepMins = 20 + (dishes * 10)
      const cookMins = dishes * 25
      const packCleanMins = 15 + (meals * 1.5)
      const totalMins = prepMins + cookMins + packCleanMins
      const totalHours = totalMins / 60

      return [
        res('Total Session Time', `${numD(totalHours, 1)} hrs (${Math.round(totalMins)} mins)`, totalHours > 2.5 ? T.warn : T.good),
        res('Active Chopping & Prep', `${prepMins} mins`, T.neutral),
        res('Stovetop / Oven Time', `${cookMins} mins`, T.neutral, 'Can run in parallel'),
        res('Portioning & Cleanup', `${Math.round(packCleanMins)} mins`, T.neutral),
      ]
    },
  },
  {
    id: 'meal-prep-portion-planner',
    name: 'Meal Prep Portion Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate exact cooked protein, carb, and vegetable gram weights for balanced lunchbox containers.',
    tip: 'Raw chicken breast loses ~25% of its weight during cooking—scale raw grocery weight up by 1.33x.',
    usage: [
      'Select your dietary split target (Balanced, High-Protein Athletic, or Low-Carb).',
      'Enter total calories desired per meal box.',
      'Receive recommended gram weights for each component.',
    ],
    method: [
      'Calculates macronutrient ratios: Balanced (30P / 40C / 30F); High-Protein (40P / 35C / 25F).',
    ],
    fields: [
      sel('dietGoal', 'Portion Profile', ['Balanced (40% Carb / 30% Protein / 30% Veg)', 'High-Protein Athletic (40% Protein / 30% Carb / 30% Veg)', 'Low-Carb / Keto (50% Protein / 50% Non-starchy Veg)'], 'Balanced (40% Carb / 30% Protein / 30% Veg)'),
      n('targetCalories', 'Target Calories per Box', { def: 550, min: 300, max: 1200, step: 25 }),
    ],
    compute: (v) => {
      const goal = asSel(v.dietGoal)
      const cals = asNum(v.targetCalories)

      let proteinG = 150
      let carbG = 160
      let vegG = 150

      if (goal.includes('High-Protein')) {
        proteinG = Math.round(cals * 0.35)
        carbG = Math.round(cals * 0.25)
        vegG = 150
      } else if (goal.includes('Low-Carb')) {
        proteinG = Math.round(cals * 0.45)
        carbG = 40
        vegG = 220
      } else {
        proteinG = Math.round(cals * 0.28)
        carbG = Math.round(cals * 0.32)
        vegG = 160
      }

      return [
        res('Cooked Protein Portion', `~${proteinG} g (${Math.round(proteinG / 28.35)} oz)`, T.good, 'Chicken, beef, tofu, or fish'),
        res('Cooked Carb Portion', `~${carbG} g (${Math.round(carbG / 28.35)} oz)`, T.neutral, 'Rice, sweet potato, or quinoa'),
        res('Vegetable Portion', `~${vegG} g`, T.good, 'Broccoli, green beans, or mixed roast veg'),
      ]
    },
  },
  {
    id: 'batch-cooking-planner',
    name: 'Batch Cooking Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Scale any recipe easily from a standard dinner into 4, 8, 12, or 16 freeze-ahead portions.',
    tip: 'Do not multiply salt and spicy chili proportionally when scaling up 4x—start at 2.5x salt and adjust to taste.',
    usage: [
      'Enter the original serving size and target batch size.',
      'Check the multiplier factor and spice scaling warning.',
    ],
    method: [
      'Calculates ratio: Target / Original servings with non-linear seasoning suppression.',
    ],
    fields: [
      n('origServings', 'Original Recipe Servings', { def: 4, min: 1, max: 20 }),
      n('targetServings', 'Target Batch Servings', { def: 12, min: 2, max: 50 }),
    ],
    compute: (v) => {
      const orig = asNum(v.origServings)
      const target = asNum(v.targetServings)
      const mult = target / orig

      const spiceMult = mult > 3 ? mult * 0.75 : mult

      return [
        res('Scale Multiplier', `${numD(mult, 2)}x`, T.good, `Multiply ingredients by ${numD(mult, 2)}`),
        res('Seasoning Adjustment', `${numD(spiceMult, 2)}x salt/spices`, T.warn, 'Salt and strong aromatics concentrate faster in large pots'),
        res('Pot Size Required', target >= 12 ? '8+ Quart Dutch Oven / Stockpot' : 'Standard 5-6 Quart Pot', T.neutral),
      ]
    },
  },
  {
    id: 'leftover-portion-calculator',
    name: 'Leftover Portion Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Weigh your remaining cooked pot of stew or pasta to calculate remaining full adult servings.',
    tip: 'Cool large pots of stew quickly by placing the sealed pot in an ice-water sink bath before refrigerating.',
    usage: [
      'Enter net weight of remaining leftovers in grams or ounces.',
      'Select whether it is a light side dish, standard main, or heavy stew.',
    ],
    method: [
      'Standard adult dinner main portion is ~350g to 450g.',
    ],
    fields: [
      n('leftoverGrams', 'Net Leftover Weight (grams)', { def: 900, min: 100, max: 5000, step: 50 }),
      sel('dishType', 'Course Type', ['Full Main Dish (Stew, Casserole, Curry)', 'Side Dish (Rice, Roasted Veggies)', 'Soup / Broth'], 'Full Main Dish (Stew, Casserole, Curry)'),
    ],
    compute: (v) => {
      const grams = asNum(v.leftoverGrams)
      const type = asSel(v.dishType)

      const portionSize = type.includes('Side') ? 180 : type.includes('Soup') ? 450 : 380
      const exactPortions = grams / portionSize
      const wholePortions = Math.floor(exactPortions)
      const remainderGrams = Math.round(grams % portionSize)

      return [
        res('Full Servings Remaining', `${wholePortions} full portions`, wholePortions > 0 ? T.good : T.warn, `Based on ~${portionSize}g per portion`),
        res('Exact Decimal Servings', `${numD(exactPortions, 1)} servings`, T.neutral),
        res('Remainder', `${remainderGrams} g snack portion`, T.neutral),
      ]
    },
  },
  {
    id: 'food-waste-tracker',
    name: 'Food Waste Tracker',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Log discarded produce, stale bread, and spoiled dairy to identify what you are over-buying.',
    tip: 'Store a designated "Eat Me First" bin on your middle fridge shelf for produce nearing its expiry date.',
    usage: [
      'Log estimated weight of food thrown away this week.',
      'Select the primary category of wasted food.',
    ],
    method: [
      'Tracks weekly food waste and projects annual environmental and volume impact.',
    ],
    fields: [
      n('wasteLbs', 'Food Wasted This Week (lbs)', { def: 3.5, min: 0.1, max: 50, step: 0.5 }),
      sel('mainCategory', 'Biggest Waste Category', ['Fresh Produce (Fruits & Greens)', 'Leftovers (Cooked food forgotten)', 'Dairy & Eggs', 'Bakery / Bread', 'Meat & Seafood'], 'Fresh Produce (Fruits & Greens)'),
    ],
    compute: (v) => {
      const lbs = asNum(v.wasteLbs)
      const cat = asSel(v.mainCategory)

      const annualLbs = lbs * 52
      const annualKg = annualLbs * 0.453592

      const rating = lbs <= 2 ? T.good : lbs <= 5 ? T.warn : T.bad

      return [
        res('Weekly Waste', `${numD(lbs, 1)} lbs (${numD(lbs * 0.45, 1)} kg)`, rating),
        res('Annualized Waste', `${Math.round(annualLbs)} lbs/year (${Math.round(annualKg)} kg)`, rating),
        res('Top Culprit', cat.split('(')[0].trim(), T.neutral, 'Focus buying adjustments here next shopping trip'),
      ]
    },
  },
  {
    id: 'food-waste-cost-calculator',
    name: 'Food Waste Cost Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate the true financial loss of throwing away spoiled groceries every week.',
    tip: 'Freezing brown bananas, bread slices, and vegetable scraps for stock rescues $250+ per year per home.',
    usage: [
      'Estimate your weekly discarded food dollar value.',
      'Check 1-year and 5-year compound losses.',
    ],
    method: [
      'Multiplies weekly lost food value over 52 weeks and calculates 5-year cumulative waste.',
    ],
    fields: [
      n('weeklyCost', 'Estimated Waste per Week ($)', { def: 18, min: 1, max: 150, step: 1 }),
    ],
    compute: (v) => {
      const cost = asNum(v.weeklyCost)
      const monthly = cost * 4.33
      const annual = cost * 52
      const fiveYear = annual * 5

      return [
        res('Annual Money Lost', money(annual) + '/year', annual > 800 ? T.bad : annual > 400 ? T.warn : T.good),
        res('Monthly Grocery Drain', money(monthly) + '/month', T.neutral),
        res('5-Year Food Waste Loss', money(fiveYear), T.bad, 'Money thrown into the garbage bin'),
      ]
    },
  },
  {
    id: 'cooking-gas-cost-calculator',
    name: 'Cooking Gas Cost Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate the cost of cooking on natural gas or an LPG propane bottle.',
    tip: 'Using a lid on pots traps heat and cooks dishes 30% faster while using half as much cooking gas.',
    usage: [
      'Select gas supply (Natural Gas Utility vs LPG Cylinder Bottle).',
      'Input daily cooking hours on burners.',
      'Calculate monthly and per-meal cooking gas cost.',
    ],
    method: [
      'Standard burner consumes ~7,000 BTU/hr (approx 0.14 kg LPG per hour).',
    ],
    fields: [
      sel('gasType', 'Gas Supply Type', ['LPG Propane Cylinder', 'Natural Gas (Piped Grid)'], 'LPG Propane Cylinder'),
      n('cylinderCost', 'LPG Cylinder Price / Bill ($)', { def: 28, min: 5, max: 150 }),
      n('dailyCookingHours', 'Total Daily Burner Hours', { def: 1.5, min: 0.25, max: 8, step: 0.25 }),
    ],
    compute: (v) => {
      const type = asSel(v.gasType)
      const price = asNum(v.cylinderCost)
      const hours = asNum(v.dailyCookingHours)

      const monthlyHours = hours * 30.5
      let monthlyCost = (monthlyHours * 0.15) * 2.2
      if (type.includes('LPG')) {
        const cylinderDurationDays = Math.max(10, Math.round(95 / hours))
        monthlyCost = (30.5 / cylinderDurationDays) * price
      }

      return [
        res('Estimated Monthly Gas', money(monthlyCost) + '/mo', monthlyCost > 45 ? T.warn : T.good),
        res('Daily Cooking Cost', moneyC(monthlyCost / 30.5), T.neutral, `For ${hours} burner hours daily`),
        res('Cost per Meal Prepared', moneyC((monthlyCost / 30.5) / 3), T.good, 'Assuming 3 meals/day'),
      ]
    },
  },
  {
    id: 'kitchen-electricity-cost-calculator',
    name: 'Kitchen Electricity Cost Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Compare electric running costs between electric oven, air fryer, induction, and microwave.',
    tip: 'An air fryer uses 1500W for 20 mins (~$0.08) vs a full oven which preheats and cooks at 3000W for 50 mins (~$0.40).',
    usage: [
      'Select appliance and enter daily running minutes.',
      'Check operating cost per cook and annual spend.',
    ],
    method: [
      'Electric Oven (3000W), Induction Hob (1800W), Air Fryer (1500W), Microwave (1000W), Slow Cooker (200W).',
    ],
    fields: [
      sel('appliance', 'Kitchen Appliance', [
        'Electric Oven (3,000 W)',
        'Induction Cooktop (1,800 W)',
        'Air Fryer (1,500 W)',
        'Microwave Oven (1,000 W)',
        'Slow Cooker / Crockpot (200 W)',
      ], 'Air Fryer (1,500 W)'),
      n('minutes', 'Usage Minutes per Day', { def: 30, min: 1, max: 300, step: 5 }),
      n('kwhRate', 'Electricity Rate ($/kWh)', { def: 0.16, min: 0.05, max: 0.7, step: 0.01 }),
    ],
    compute: (v) => {
      const app = asSel(v.appliance)
      const mins = asNum(v.minutes)
      const rate = asNum(v.kwhRate)

      let watts = 1500
      if (app.includes('3,000')) watts = 3000
      else if (app.includes('1,800')) watts = 1800
      else if (app.includes('1,000')) watts = 1000
      else if (app.includes('200')) watts = 200

      const kwhPerDay = (watts * (mins / 60)) / 1000
      const costPerUse = kwhPerDay * rate
      const annualCost = costPerUse * 365

      return [
        res('Cost per Cooking Session', moneyC(costPerUse), costPerUse > 0.4 ? T.warn : T.good, `${numD(kwhPerDay, 2)} kWh consumed`),
        res('Monthly Cost', money(costPerUse * 30.5), T.neutral),
        res('Annual Appliance Cost', money(annualCost), annualCost > 100 ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'refrigerator-food-storage-guide',
    name: 'Refrigerator Food Storage Guide',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Look up the correct temperature zones inside your fridge for dairy, raw meat, and produce.',
    tip: 'Never store milk or eggs in the refrigerator door—the door is the warmest zone and fluctuates every time it opens.',
    usage: [
      'Select food item to store.',
      'Check recommended shelf location and storage temperature.',
    ],
    method: [
      'Food safety temperature hierarchy: Upper shelf (warmest consistent), Lower shelf (coldest), Crisper (humidity), Door (fluctuating).',
    ],
    fields: [
      sel('item', 'Food Item Category', [
        'Fresh Milk & Dairy',
        'Raw Chicken, Beef & Fish',
        'Leftovers & Cooked Foods',
        'Leafy Greens & Fresh Herbs',
        'Condiments & Jams',
        'Eggs',
      ], 'Fresh Milk & Dairy'),
    ],
    compute: (v) => {
      const item = asSel(v.item)

      const zones: Record<string, { zone: string; temp: string; why: string }> = {
        'Fresh Milk & Dairy': {
          zone: 'Middle or Back of Bottom Shelf',
          temp: '34°F - 37°F (1°C - 3°C)',
          why: 'Most stable cold zone. Storing milk in the door causes premature souring.',
        },
        'Raw Chicken, Beef & Fish': {
          zone: 'Bottom Shelf (Inside a sealed rimmed tray)',
          temp: '32°F - 34°F (0°C - 1°C)',
          why: 'Coldest zone. Bottom placement ensures raw meat juices cannot drip down onto other food.',
        },
        'Leftovers & Cooked Foods': {
          zone: 'Top Shelf (Ready-to-eat zone)',
          temp: '37°F (3°C)',
          why: 'Clear visibility prevents food being forgotten; safely away from raw meat.',
        },
        'Leafy Greens & Fresh Herbs': {
          zone: 'High-Humidity Crisper Drawer',
          temp: '37°F (3°C)',
          why: 'Controls airflow so moisture does not evaporate, keeping lettuce crisp.',
        },
        'Condiments & Jams': {
          zone: 'Refrigerator Door Bins',
          temp: '39°F - 42°F (4°C - 5°C)',
          why: 'High natural acidity and sugar make condiments safe from slight door temperature swings.',
        },
        Eggs: {
          zone: 'Original Carton on Middle Shelf',
          temp: '35°F - 37°F (2°C - 3°C)',
          why: 'Carton prevents shell pores from absorbing fridge odors and maintains temperature stability.',
        },
      }

      const z = zones[item] ?? { zone: 'Middle shelf', temp: '37°F', why: 'Standard refrigeration' }

      return [
        res('Optimal Shelf Location', z.zone, T.good),
        res('Ideal Temperature', z.temp, T.neutral),
        doc('Food Safety Rationale', z.why),
      ]
    },
  },
  {
    id: 'freezer-food-storage-guide',
    name: 'Freezer Food Storage Guide',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Look up maximum safe and quality freezing durations for raw meats, soups, breads, and cooked dishes.',
    tip: 'Food remains scientifically safe indefinitely at 0°F (-18°C), but quality, taste, and texture degrade after specified months.',
    usage: [
      'Select food item category.',
      'Check recommended maximum freezing months and packaging tips.',
    ],
    method: [
      'Based on FDA/USDA safe food storage guidelines for zero-degree freezers.',
    ],
    fields: [
      sel('freezerItem', 'Food to Freeze', [
        'Raw Chicken (Breasts / Pieces)',
        'Ground Beef / Mince',
        'Steaks & Roasts',
        'Soups, Stews & Cooked Casseroles',
        'Sliced Bread & Rolls',
        'Bacon & Sausages',
        'Cooked Rice',
      ], 'Raw Chicken (Breasts / Pieces)'),
    ],
    compute: (v) => {
      const item = asSel(v.freezerItem)

      const times: Record<string, { duration: string; wrap: string }> = {
        'Raw Chicken (Breasts / Pieces)': { duration: '9 to 12 months', wrap: 'Heavy duty freezer wrap or vacuum sealed to stop freezer burn.' },
        'Ground Beef / Mince': { duration: '3 to 4 months', wrap: 'Flatten flat in zip bag to freeze and thaw rapidly.' },
        'Steaks & Roasts': { duration: '6 to 12 months', wrap: 'Double wrap tightly in plastic then foil.' },
        'Soups, Stews & Cooked Casseroles': { duration: '2 to 3 months', wrap: 'Airtight container with 1/2 inch expansion room.' },
        'Sliced Bread & Rolls': { duration: '3 months', wrap: 'Keep in original bag inside an extra freezer ziplock.' },
        'Bacon & Sausages': { duration: '1 to 2 months', wrap: 'High fat content degrades faster; use within 60 days.' },
        'Cooked Rice': { duration: '1 month', wrap: 'Cool rapidly within 1 hr and freeze flat.' },
      }

      const t = times[item] ?? { duration: '3 months', wrap: 'Airtight packaging' }

      return [
        res('Max Quality Duration', t.duration, T.good, 'At 0°F / -18°C'),
        doc('Best Freezing Practice', t.wrap),
      ]
    },
  },
  {
    id: 'food-safety-storage-timer',
    name: 'Food Safety Storage Timer',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate the safe discard date for cooked dinner leftovers stored in your refrigerator.',
    tip: 'The USDA 3-to-4 Day Rule: Cooked meat and leftovers must be eaten or frozen within 4 days of cooking.',
    usage: [
      'Enter the date the food was cooked.',
      'Check whether the food is currently Safe, Needs Immediate Consumption, or should be Discarded.',
    ],
    method: [
      'Counts elapsed calendar days against the 4-day refrigeration threshold for Listeria and pathogen safety.',
    ],
    fields: [
      n('daysAgoCooked', 'How many days ago was it cooked?', { def: 2, min: 0, max: 14 }),
      sel('refrigeratedPromptly', 'Was it refrigerated within 2 hours?', ['Yes, chilled promptly', 'No, sat on counter > 2 hours'], 'Yes, chilled promptly'),
    ],
    compute: (v) => {
      const days = asNum(v.daysAgoCooked)
      const chilled = asSel(v.refrigeratedPromptly)

      if (chilled.includes('No')) {
        return [
          res('Safety Status', 'UNSAFE — DISCARD', T.bad, 'Bacteria multiply exponentially between 40°F and 140°F'),
          res('Verdict', 'Food sat in Danger Zone > 2 hours', T.bad),
        ]
      }

      if (days <= 2) {
        return [
          res('Safety Status', 'FRESH & SAFE', T.good, `${days} days in fridge`),
          res('Days Remaining', `${4 - days} days left to consume`, T.good),
          res('Recommendation', 'Enjoy today or tomorrow, or freeze now', T.neutral),
        ]
      } else if (days <= 4) {
        return [
          res('Safety Status', 'EAT TODAY OR TOSS', T.warn, `${days} days old`),
          res('Days Remaining', `${4 - days} days left`, T.warn),
          res('Recommendation', 'Heat thoroughly to steaming hot (165°F / 74°C) before eating', T.neutral),
        ]
      } else {
        return [
          res('Safety Status', 'EXPIRED — DISCARD', T.bad, `${days} days old (exceeds 4-day rule)`),
          res('Recommendation', 'Pathogens like Listeria can grow at fridge temps over time', T.bad),
        ]
      }
    },
  },
  {
    id: 'thawing-time-calculator',
    name: 'Thawing Time Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate safe refrigerator thawing times and emergency cold-water thaw times for frozen meat.',
    tip: 'NEVER thaw meat on the kitchen counter—the outer layer reaches room temperature where bacteria multiply while the inside is still frozen.',
    usage: [
      'Enter the weight of the meat in pounds or kilograms.',
      'Check estimated refrigerator thaw hours and cold-water thaw time.',
    ],
    method: [
      'Refrigerator thaw: ~24 hours per 4-5 lbs (approx 5 hours per lb). Cold water thaw: ~30 mins per lb.',
    ],
    fields: [
      n('weightLbs', 'Meat Weight (lbs)', { def: 4, min: 0.5, max: 30, step: 0.5 }),
      sel('meatType', 'Meat Cut', ['Whole Chicken / Turkey', 'Boneless Chicken Breasts', 'Roast / Large Joint', 'Steaks / Chops'], 'Whole Chicken / Turkey'),
    ],
    compute: (v) => {
      const lbs = asNum(v.weightLbs)
      const meat = asSel(v.meatType)

      const fridgeHours = Math.round(lbs * 5.5)
      const waterHours = lbs * 0.5

      return [
        res('Thawing Item', meat, T.neutral, `${lbs} lbs cut`),
        res('Refrigerator Thaw (Safest)', `${Math.round(fridgeHours / 24)} days (${fridgeHours} hrs)`, T.good, 'Kept below 40°F the entire time'),
        res('Cold Water Thaw (Fastest)', `${numD(waterHours, 1)} hours`, T.neutral, 'Submerge in leakproof bag; change water every 30 mins'),
        res('Microwave Defrost', 'Cook immediately after defrosting', T.warn),
      ]
    },
  },
  {
    id: 'room-temperature-food-safety-timer',
    name: 'Room Temperature Food Safety Timer',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate remaining safe time for food left out on the table before bacteria reach dangerous levels.',
    tip: 'The 2-Hour / 4-Hour Rule: Food held between 40°F and 140°F (4°C–60°C) must be refrigerated within 2 hours or tossed after 4 hours.',
    usage: [
      'Enter how many minutes cooked or perishable food has been sitting out at room temperature.',
      'Enter ambient room temperature.',
    ],
    method: [
      'Standard ServSafe and FDA Food Code temperature danger zone parameters.',
    ],
    fields: [
      n('minutesOut', 'Minutes Food Has Been at Room Temp', { def: 45, min: 0, max: 360, step: 5 }),
      n('roomTempF', 'Room / Outdoor Temp (°F)', { def: 72, min: 50, max: 110 }),
    ],
    compute: (v) => {
      const mins = asNum(v.minutesOut)
      const tempF = asNum(v.roomTempF)

      const maxMins = tempF >= 90 ? 60 : 120
      const remainingMins = maxMins - mins

      if (remainingMins > 30) {
        return [
          res('Safety Status', 'SAFE TO REFRIGERATE', T.good, `${mins} mins elapsed`),
          res('Time Remaining to Chill', `${remainingMins} minutes left`, T.good, `Limit is ${maxMins} mins at ${tempF}°F`),
        ]
      } else if (remainingMins > 0) {
        return [
          res('Safety Status', 'URGENT — CHILL NOW', T.warn, `${remainingMins} mins before limit`),
          res('Action', 'Package into shallow containers and put in fridge immediately', T.warn),
        ]
      } else {
        return [
          res('Safety Status', 'DANGER — DISCARD', T.bad, `Exceeded ${maxMins} min limit`),
          res('Verdict', 'Bacterial toxins can cause food poisoning even after reheating', T.bad),
        ]
      }
    },
  },
  {
    id: 'kitchen-inventory-organizer',
    name: 'Kitchen Inventory Organizer',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Audit essential cooking staples across dry pantry, spices, and baking supplies.',
    tip: 'Ground spices lose their aromatic volatile oils after 1 year—replace when they no longer smell vibrant when rubbed between fingers.',
    usage: [
      'Check which foundational staples are currently stocked in your kitchen.',
      'View pantry completeness rating.',
    ],
    method: [
      'Evaluates presence across the 10 universal cooking foundations.',
    ],
    fields: [
      ck('staples', 'Check items currently in stock in your pantry:', [
        'Cooking Oil (Olive / Vegetable)',
        'Kosher Salt & Whole Black Pepper',
        'All-Purpose Flour & Sugar',
        'Dry Rice, Pasta or Grains',
        'Canned Tomatoes / Tomato Paste',
        'Canned Beans, Chickpeas or Lentils',
        'Soy Sauce, Vinegar or Acid',
        'Onions & Fresh Garlic',
        'Chicken, Beef, or Veggie Stock',
        'Core Spices (Cumin, Paprika, Oregano)',
      ]),
    ],
    compute: (v) => {
      const list = asBoolList(v.staples)
      const count = list.filter(Boolean).length
      const total = list.length || 10
      const pctScore = Math.round((count / total) * 100)

      return [
        res('Pantry Staples Score', pct(pctScore, 0), pctScore >= 80 ? T.good : pctScore >= 50 ? T.warn : T.bad),
        res('Stocked Essentials', `${count} of ${total} on hand`, T.neutral),
        res('Cooking Readiness', count >= 8 ? 'Can cook 100+ recipes without a grocery run' : 'Basic emergency restocking recommended', count >= 8 ? T.good : T.neutral),
      ]
    },
  },
  {
    id: 'pantry-meal-planner',
    name: 'Pantry Meal Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Discover practical emergency meals you can cook right now using common shelf-stable ingredients.',
    tip: 'A can of white beans mashed into sautéed garlic and canned tomatoes makes a 10-minute high-protein gourmet dinner.',
    usage: [
      'Select primary ingredients you currently have in your kitchen.',
      'Receive instant emergency meal ideas with zero shopping needed.',
    ],
    method: [
      'Rule-based pairing engine for basic pantry staples (pasta, eggs, beans, rice, tuna).',
    ],
    fields: [
      sel('primaryStaple', 'Primary Staple Available', [
        'Dry Pasta + Canned Tomatoes',
        'White / Brown Rice + Eggs',
        'Canned Tuna + Pasta / Mayo',
        'Canned Beans + Onions / Spices',
        'Bread + Cheese / Eggs',
      ], 'Dry Pasta + Canned Tomatoes'),
    ],
    compute: (v) => {
      const s = asSel(v.primaryStaple)

      const meals: Record<string, string> = {
        'Dry Pasta + Canned Tomatoes': '• MEAL 1: Classic Garlic & Herb Pasta (Sauté garlic in olive oil, simmer canned tomatoes for 15 mins, toss with pasta).\n• MEAL 2: Pasta e Fagioli (Add canned beans and a cup of water/bouillon to the tomato pasta for a hearty soup).',
        'White / Brown Rice + Eggs': '• MEAL 1: Quick Egg Fried Rice (Scramble eggs, fry cold cooked rice with soy sauce and any leftover veggies).\n• MEAL 2: Japanese Tamago Kake Gohan (Stir raw egg yolk into steaming hot freshly cooked rice with soy sauce and sesame oil).',
        'Canned Tuna + Pasta / Mayo': '• MEAL 1: Mediterranean Tuna Pasta (Flake tuna into warm olive oil with lemon, black pepper, and pasta).\n• MEAL 2: Classic Stovetop Tuna Melt (Mix tuna with mayo/mustard, toast on bread with a slice of cheese).',
        'Canned Beans + Onions / Spices': '• MEAL 1: 15-Minute Black Bean Chili (Simmer beans with onion, garlic, cumin, and canned tomatoes).\n• MEAL 2: Crispy Refried Beans (Mash beans in hot oil with salt and cumin; serve with toast or tortillas).',
        'Bread + Cheese / Eggs': '• MEAL 1: Gourmet Grilled Cheese with black pepper & mustard.\n• MEAL 2: French Toast or Savory Egg-in-a-Hole.',
      }

      return [
        res('Selected Pantry Base', s, T.good),
        doc('Instant Recipe Suggestions', meals[s] ?? 'Combine pantry starches with aromatics and healthy fats.'),
      ]
    },
  },
  {
    id: 'recipe-nutrition-label-generator',
    name: 'Recipe Nutrition Label Generator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Divide whole recipe nutritional totals into per-serving calories, protein, carbs, and fat.',
    tip: 'Measure the empty cooking pot before cooking, then weigh the finished dish with pot to get exact total grams.',
    usage: [
      'Enter total calories and macronutrients for the entire cooked pot.',
      'Specify how many portions it divides into.',
      'Generate a standardized per-serving nutrition card.',
    ],
    method: [
      'Divides whole recipe calorie and macro totals by serving count.',
    ],
    fields: [
      n('totalCalories', 'Total Recipe Calories', { def: 2200, min: 200, max: 20000, step: 50 }),
      n('totalProtein', 'Total Protein (g)', { def: 140, min: 0, max: 1000 }),
      n('totalCarbs', 'Total Carbs (g)', { def: 240, min: 0, max: 1500 }),
      n('totalFat', 'Total Fat (g)', { def: 75, min: 0, max: 1000 }),
      n('servings', 'Servings in Recipe', { def: 4, min: 1, max: 24 }),
    ],
    compute: (v) => {
      const cals = asNum(v.totalCalories)
      const p = asNum(v.totalProtein)
      const c = asNum(v.totalCarbs)
      const f = asNum(v.totalFat)
      const s = asNum(v.servings)

      const perCal = Math.round(cals / s)
      const perP = Math.round(p / s)
      const perC = Math.round(c / s)
      const perF = Math.round(f / s)

      const card = [
        `NUTRITION FACTS (Per Serving — ${s} Servings Total)`,
        `${'='.repeat(45)}`,
        `Calories:        ${perCal} kcal`,
        `Protein:         ${perP} g`,
        `Carbohydrates:   ${perC} g`,
        `Fat:             ${perF} g`,
      ].join('\n')

      return [
        res('Calories per Serving', `${perCal} kcal`, T.good),
        res('Macros per Serving', `${perP}g P / ${perC}g C / ${perF}g F`, T.neutral),
        doc('Nutrition Label', card),
      ]
    },
  },
  {
    id: 'recipe-ingredient-percentage-calculator',
    name: 'Recipe Ingredient Percentage Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate professional baker’s percentages where total flour weight equals 100%.',
    tip: 'Baker’s percentage makes scaling dough foolproof: 65% water, 2% salt, and 1% yeast works for almost every artisan loaf.',
    usage: [
      'Enter total flour weight in grams.',
      'Enter water, salt, and yeast weight.',
      'Review hydration percentage and baker’s formulation.',
    ],
    method: [
      'Baker’s percentage = (Ingredient Weight / Flour Weight) * 100.',
    ],
    fields: [
      n('flourGrams', 'Flour Weight (grams)', { def: 500, min: 100, max: 5000, step: 25 }),
      n('waterGrams', 'Water Weight (grams / ml)', { def: 350, min: 50, max: 4000, step: 10 }),
      n('saltGrams', 'Salt Weight (grams)', { def: 10, min: 1, max: 100 }),
      n('yeastGrams', 'Yeast Weight (grams)', { def: 5, min: 0.5, max: 100, step: 0.5 }),
    ],
    compute: (v) => {
      const flour = asNum(v.flourGrams)
      const water = asNum(v.waterGrams)
      const salt = asNum(v.saltGrams)
      const yeast = asNum(v.yeastGrams)

      const hyd = (water / flour) * 100
      const saltPct = (salt / flour) * 100
      const yeastPct = (yeast / flour) * 100
      const totalDough = flour + water + salt + yeast

      return [
        res('Dough Hydration', pct(hyd, 1), hyd >= 70 ? T.warn : T.good, hyd >= 75 ? 'Very wet artisan dough' : 'Standard workable dough'),
        res('Salt Percentage', pct(saltPct, 1), saltPct < 1.8 ? T.warn : T.good, 'Standard is 2.0%'),
        res('Yeast Percentage', pct(yeastPct, 1), T.neutral),
        res('Total Batch Weight', `${Math.round(totalDough)} g`, T.good, `Makes ~${Math.round(totalDough / 450)} standard loaves`),
      ]
    },
  },
  {
    id: 'baking-ingredient-ratio-calculator',
    name: 'Baking Ingredient Ratio Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Check fundamental baking ratios (Pound Cake 1:1:1:1, Pie Crust 3:2:1, Bread 5:3).',
    tip: 'Memorize the 3:2:1 pie crust ratio (3 parts flour, 2 parts fat, 1 part ice water) and you will never need a recipe book.',
    usage: [
      'Select classic baking ratio formula.',
      'Enter base flour or butter weight.',
      'Receive all corresponding ingredient measurements.',
    ],
    method: [
      'Applies historical pastry and baking mass ratios.',
    ],
    fields: [
      sel('ratioType', 'Classic Ratio Formula', [
        'Pound Cake (1 Flour : 1 Butter : 1 Sugar : 1 Egg)',
        'Pie Crust (3 Flour : 2 Fat : 1 Ice Water)',
        'Shortbread Cookies (3 Flour : 2 Butter : 1 Sugar)',
        'Standard Pancakes (2 Flour : 2 Liquid : 1 Egg : 1/2 Butter)',
      ], 'Pound Cake (1 Flour : 1 Butter : 1 Sugar : 1 Egg)'),
      n('baseGrams', 'Base Ingredient Weight (grams)', { def: 250, min: 50, max: 2000, step: 25 }),
    ],
    compute: (v) => {
      const r = asSel(v.ratioType)
      const base = asNum(v.baseGrams)

      let formulaText = ''
      if (r.includes('Pound Cake')) {
        formulaText = `• Flour: ${base} g\n• Butter: ${base} g\n• Sugar: ${base} g\n• Eggs: ${base} g (~${Math.round(base / 50)} large eggs)`
      } else if (r.includes('Pie Crust')) {
        const flour = base
        const fat = Math.round(base * (2 / 3))
        const water = Math.round(base * (1 / 3))
        formulaText = `• Flour: ${flour} g\n• Cold Butter/Lard: ${fat} g\n• Ice Water: ${water} g`
      } else if (r.includes('Shortbread')) {
        const flour = base
        const butter = Math.round(base * (2 / 3))
        const sugar = Math.round(base * (1 / 3))
        formulaText = `• Flour: ${flour} g\n• Soft Butter: ${butter} g\n• Sugar: ${sugar} g`
      } else {
        formulaText = `• Flour: ${base} g\n• Milk: ${base} g\n• Egg: ${Math.round(base / 2)} g (~1 egg)\n• Melted Butter: ${Math.round(base / 4)} g`
      }

      return [
        res('Base Measure', `${base} g`, T.good),
        doc('Exact Scaled Ingredients', formulaText),
      ]
    },
  },
  {
    id: 'dough-portion-calculator',
    name: 'Dough Portion Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Divide your total dough mass into perfectly equal burger buns, dinner rolls, or pizza dough balls.',
    tip: 'Using a digital scale to portion dough balls ensures all buns bake evenly at the exact same rate in the oven.',
    usage: [
      'Enter total dough batch weight.',
      'Specify how many pieces you want or select item type.',
    ],
    method: [
      'Standard sizes: Dinner roll (45g), Burger bun (90g), Neapolitan pizza ball (250g), Large pizza (320g).',
    ],
    fields: [
      n('totalDough', 'Total Dough Weight (grams)', { def: 900, min: 100, max: 10000, step: 25 }),
      n('pieces', 'Number of Desired Pieces', { def: 10, min: 1, max: 40 }),
    ],
    compute: (v) => {
      const total = asNum(v.totalDough)
      const count = asNum(v.pieces)

      const perPiece = total / count
      let category = 'Dinner Rolls (35-50g)'
      if (perPiece > 220) category = 'Pizza Dough Balls (220-300g)'
      else if (perPiece > 120) category = 'Large Bagels / Calzones'
      else if (perPiece > 75) category = 'Burger / Brioche Buns (80-100g)'

      return [
        res('Weight per Piece', `${numD(perPiece, 1)} grams`, T.good, `Cut exactly ${numD(perPiece, 1)}g per ball`),
        res('Closest Style Match', category, T.neutral),
        res('Total Pieces', `${count} items`, T.good),
      ]
    },
  },
  {
    id: 'baking-yield-calculator',
    name: 'Baking Yield Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Scale cake recipes when switching between 6-inch, 8-inch, 9-inch round pans, or rectangular 9x13 pans.',
    tip: 'A 9-inch round pan has 26% more volume than an 8-inch round pan—never substitute directly without adjusting batter!',
    usage: [
      'Select the recipe’s original pan size.',
      'Select the pan size you want to bake in.',
      'Get the exact batter scaling factor.',
    ],
    method: [
      'Calculates pan surface area ratio: Area = π * r² for rounds; Length * Width for rectangles.',
    ],
    fields: [
      sel('origPan', 'Original Recipe Pan', ['8-inch Round Pan', '9-inch Round Pan', '6-inch Round Pan', '8x8-inch Square Pan', '9x13-inch Rectangular Pan'], '8-inch Round Pan'),
      sel('targetPan', 'Target Pan You Have', ['9-inch Round Pan', '8-inch Round Pan', '6-inch Round Pan', '8x8-inch Square Pan', '9x13-inch Rectangular Pan'], '9-inch Round Pan'),
    ],
    compute: (v) => {
      const orig = asSel(v.origPan)
      const target = asSel(v.targetPan)

      const areaMap: Record<string, number> = {
        '6-inch Round Pan': Math.PI * 3 * 3, // ~28.3 sq in
        '8-inch Round Pan': Math.PI * 4 * 4, // ~50.3 sq in
        '9-inch Round Pan': Math.PI * 4.5 * 4.5, // ~63.6 sq in
        '8x8-inch Square Pan': 64, // 64 sq in
        '9x13-inch Rectangular Pan': 117, // 117 sq in
      }

      const origArea = areaMap[orig] ?? 50.3
      const targetArea = areaMap[target] ?? 63.6
      const factor = targetArea / origArea

      return [
        res('Batter Multiplier', `${numD(factor, 2)}x`, factor === 1 ? T.good : T.warn, `Multiply all batter ingredients by ${numD(factor, 2)}`),
        res('Surface Area Shift', `${Math.round(origArea)} sq in → ${Math.round(targetArea)} sq in`, T.neutral),
        res('Baking Time Adjustment', factor > 1.3 ? 'Increase bake time by 10-15 mins' : factor < 0.8 ? 'Check for doneness 8-10 mins early' : 'Standard bake time', T.neutral),
      ]
    },
  },
]
