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
  asStr,
  asSel,
  asBoolList,
  money,
  moneyC,
  pct,
  numD,
  clamp,
} from './householdSpec'

const SUB = 'Grocery'
const SUB_ID = 'grocery'

export const grocerySpecs: HouseholdSpec[] = [
  {
    id: 'grocery-budget-by-category',
    name: 'Grocery Budget by Category',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Divide your total monthly grocery budget into balanced allocations for produce, meats, pantry, and dairy.',
    tip: 'Spending at least 25% of your grocery budget in the fresh produce aisle correlates with significantly lower overall processed food costs.',
    usage: [
      'Enter your total monthly grocery budget.',
      'Check recommended category caps to prevent overspending on snacks and packaged foods.',
    ],
    method: [
      'Standard balanced nutritional allocation: Fresh Produce (25%), Protein/Meat (30%), Dairy & Eggs (15%), Grains/Pantry (20%), Snacks/Beverages (10%).',
    ],
    fields: [
      n('totalBudget', 'Total Monthly Grocery Budget ($)', { def: 600, min: 100, max: 3000, step: 25 }),
    ],
    compute: (v) => {
      const b = asNum(v.totalBudget)

      const produce = b * 0.25
      const protein = b * 0.30
      const dairy = b * 0.15
      const pantry = b * 0.20
      const snacks = b * 0.10

      return [
        res('Fresh Produce (25%)', money(produce) + '/mo', T.good, `${money(produce / 4.33)} per week`),
        res('Meat, Fish & Proteins (30%)', money(protein) + '/mo', T.neutral, `${money(protein / 4.33)} per week`),
        res('Pantry & Grains (20%)', money(pantry) + '/mo', T.good),
        res('Dairy & Eggs (15%)', money(dairy) + '/mo', T.neutral),
        res('Snacks & Drinks (10% Max)', money(snacks) + '/mo', T.warn, 'Keep under 10% to protect savings'),
      ]
    },
  },
  {
    id: 'grocery-spending-tracker',
    name: 'Grocery Spending Tracker',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Track cumulative grocery receipts against your monthly limit to avoid running out of money by day 20.',
    tip: 'Check your grocery balance before entering the supermarket, not after you reach the checkout register.',
    usage: [
      'Enter your monthly budget, current spent amount, and day of the month.',
      'Check spending pace and safe daily allowance for the remaining days.',
    ],
    method: [
      'Calculates linear burn rate vs days elapsed in a 30-day month.',
    ],
    fields: [
      n('monthlyBudget', 'Monthly Budget ($)', { def: 650, min: 100, max: 4000, step: 25 }),
      n('amountSpent', 'Total Spent So Far ($)', { def: 420, min: 0, max: 4000, step: 10 }),
      n('dayOfMonth', 'Current Day of Month (1-31)', { def: 18, min: 1, max: 31 }),
    ],
    compute: (v) => {
      const budget = asNum(v.monthlyBudget)
      const spent = asNum(v.amountSpent)
      const day = asNum(v.dayOfMonth)

      const remaining = budget - spent
      const daysLeft = Math.max(1, 30 - day)
      const dailyRemaining = Math.max(0, remaining / daysLeft)

      const expectedSpend = (budget / 30) * day
      const variance = spent - expectedSpend

      const tone = remaining < 0 ? T.bad : variance > 50 ? T.warn : T.good
      const paceText = variance > 50 ? `Over-pacing by ${money(variance)}` : variance < -30 ? `Under budget by ${money(Math.abs(variance))}` : 'On track with budget'

      return [
        res('Budget Remaining', money(remaining), tone, `${pct((spent / budget) * 100, 0)} utilized`),
        res('Pace Assessment', paceText, tone),
        res('Safe Daily Spend', `${moneyC(dailyRemaining)} / day`, remaining > 0 ? T.good : T.bad, `For the remaining ${daysLeft} days`),
      ]
    },
  },
  {
    id: 'grocery-price-history-tracker',
    name: 'Grocery Price History Tracker',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Compare baseline prices of pantry staples over time to spot genuine discounts vs fake markups.',
    tip: 'Supermarkets often mark "Sale!" on items at their regular price after raising the baseline price 2 weeks prior.',
    usage: [
      'Enter the historical regular price and current promo/shelf price.',
      'Check true price difference and discount percentage.',
    ],
    method: [
      'Percentage change = ((Current - Previous) / Previous) * 100.',
    ],
    fields: [
      txt('item', 'Item Name', 1, 'Extra Virgin Olive Oil (500ml)'),
      n('oldPrice', 'Previous Regular Price ($)', { def: 8.99, min: 0.1, max: 500, step: 0.1 }),
      n('newPrice', 'Current Shelf Price ($)', { def: 11.49, min: 0.1, max: 500, step: 0.1 }),
    ],
    compute: (v) => {
      const item = asStr(v.item) || 'Item'
      const oldP = asNum(v.oldPrice)
      const newP = asNum(v.newPrice)

      const diff = newP - oldP
      const pctChange = (diff / oldP) * 100

      const tone = diff < 0 ? T.good : diff > 0 ? T.bad : T.neutral
      const sign = diff > 0 ? '+' : ''

      return [
        res('Price Shift', `${sign}${pct(pctChange, 1)}`, tone, `${sign}${moneyC(diff)} change for ${item}`),
        res('Verdict', diff < 0 ? 'Genuine Discount — Good time to stock up' : diff > 0 ? 'Inflation Spike — Consider store brand' : 'Price Unchanged', tone),
        res('Historical Baseline', moneyC(oldP), T.neutral, `Current: ${moneyC(newP)}`),
      ]
    },
  },
  {
    id: 'grocery-price-increase-calculator',
    name: 'Grocery Price Increase Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate the cumulative inflation percentage across your regular grocery basket.',
    tip: 'When essential groceries increase by 15%, shifting 4 brand-name items to private store brands restores parity.',
    usage: [
      'Enter your total grocery basket cost 1 year ago vs today.',
      'Review personal food inflation rate.',
    ],
    method: [
      'Personal Consumer Price Index calculation: ((New Basket - Old Basket) / Old Basket) * 100.',
    ],
    fields: [
      n('oldBasket', 'Old Basket Total ($)', { def: 120, min: 10, max: 2000, step: 5 }),
      n('newBasket', 'Current Basket Total ($)', { def: 142, min: 10, max: 2000, step: 5 }),
    ],
    compute: (v) => {
      const oldB = asNum(v.oldBasket)
      const newB = asNum(v.newBasket)

      const diff = newB - oldB
      const inflation = (diff / oldB) * 100

      return [
        res('Personal Grocery Inflation', pct(inflation, 1, true), inflation > 10 ? T.bad : T.warn),
        res('Extra Outlay per Trip', money(diff), T.warn, `From ${money(oldB)} to ${money(newB)}`),
        res('Annual Extra Cost', money(diff * 52) + '/year', T.bad, 'Assuming 1 grocery trip per week'),
      ]
    },
  },
  {
    id: 'grocery-basket-cost-calculator',
    name: 'Grocery Basket Cost Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Tally up items with quantity and tax to know your exact register total before getting to the cashier.',
    tip: 'Rounding up every item to the nearest dollar while shopping creates a built-in 10% cash cushion at checkout.',
    usage: [
      'Input number of items, average item cost, and local sales tax.',
      'Check estimated subtotal and tax-inclusive final bill.',
    ],
    method: [
      'Subtotal = Items * Avg Price. Total = Subtotal * (1 + Tax Rate).',
    ],
    fields: [
      n('itemCount', 'Number of Items in Cart', { def: 24, min: 1, max: 150 }),
      n('avgItemCost', 'Estimated Average Item Price ($)', { def: 4.25, min: 0.5, max: 50, step: 0.25 }),
      n('taxRate', 'Sales Tax on Groceries (%)', { def: 3.5, min: 0, max: 15, step: 0.5 }),
    ],
    compute: (v) => {
      const items = asNum(v.itemCount)
      const avg = asNum(v.avgItemCost)
      const tax = asNum(v.taxRate)

      const subtotal = items * avg
      const taxAmount = subtotal * (tax / 100)
      const total = subtotal + taxAmount

      return [
        res('Estimated Checkout Total', moneyC(total), total > 150 ? T.warn : T.good),
        res('Cart Subtotal', moneyC(subtotal), T.neutral, `${items} items @ avg ${moneyC(avg)}`),
        res('Estimated Sales Tax', moneyC(taxAmount), T.neutral, `${tax}% tax`),
      ]
    },
  },
  {
    id: 'grocery-list-by-meal-plan',
    name: 'Grocery List by Meal Plan',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Generate a focused grocery shopping checklist organized by supermarket aisles based on dinner plans.',
    tip: 'Organizing your grocery list by supermarket section (Produce -> Bakery -> Meat -> Dairy -> Frozen) saves 20 minutes.',
    usage: [
      'Select how many home dinners you plan to cook this week.',
      'Check off items needed by department.',
      'Copy the ready-to-shop grocery list.',
    ],
    method: [
      'Categorizes ingredients by standard grocery department layout.',
    ],
    fields: [
      n('dinnerCount', 'Dinners to Cook at Home', { def: 5, min: 1, max: 7 }),
      ck('departments', 'Include staple departments in list:', [
        'Produce (Veggies, Aromatics, Fruit)',
        'Butcher / Protein (Chicken, Meat, Fish, Tofu)',
        'Dairy & Refrigerated (Eggs, Milk, Cheese, Butter)',
        'Pantry Aisles (Rice, Canned Goods, Pasta, Oils)',
        'Bakery (Bread, Tortillas, Buns)',
      ]),
    ],
    compute: (v) => {
      const count = asNum(v.dinnerCount)

      const list = [
        `WEEKLY GROCERY LIST (${count} Home Dinners Planned)`,
        '='.repeat(45),
        '',
        'PRODUCE AISLE:',
        '[ ] Onions & Fresh Garlic',
        '[ ] 2 Green Vegetables (Broccoli, Spinach, Green beans)',
        '[ ] Salad Greens / Cucumber / Tomatoes',
        '[ ] Weekly fruit (Apples, Bananas, Berries)',
        '',
        'BUTCHER / MEAT AISLE:',
        `[ ] Main dinner proteins (${count} portions — Chicken, Ground Beef, Salmon)`,
        '',
        'DAIRY & EGGS:',
        '[ ] 1 Carton Eggs',
        '[ ] Milk or Plant Milk',
        '[ ] Cheese / Greek Yogurt',
        '',
        'PANTRY AISLE:',
        '[ ] Olive oil / Cooking fat check',
        '[ ] Dinner starches (Rice, Pasta, Potatoes)',
        '[ ] 2 Canned Tomatoes or Beans',
      ].join('\n')

      return [
        res('Planned Meals', `${count} Dinners`, T.good),
        doc('Aisle-by-Aisle Shopping List', list),
      ]
    },
  },
  {
    id: 'grocery-list-by-household-size',
    name: 'Grocery List by Household Size',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Generate a baseline weekly shopping template scaled precisely to the number of people in your home.',
    tip: 'Solo shoppers should buy loose apples and carrots rather than pre-bagged produce to eliminate spoilage.',
    usage: [
      'Select your household size (1 to 6 people).',
      'Receive recommended quantities of foundational staples.',
    ],
    method: [
      'Scales baseline weekly nutritional intake per adult: ~1 dozen eggs per 2 people, 1 gal milk, 4 lbs fresh fruit.',
    ],
    fields: [
      sel('size', 'Household Size', ['1 Person (Solo)', '2 People (Couple)', '3-4 People (Small Family)', '5+ People (Large Household)'], '2 People (Couple)'),
    ],
    compute: (v) => {
      const size = asSel(v.size)

      let plan = ''
      if (size.startsWith('1')) {
        plan = 'WEEKLY BASICS (SOLO):\n• Eggs: 1 Half-Dozen (6 eggs)\n• Milk: 1/2 Gallon or Quart\n• Protein: 2.5 - 3 lbs total meat/tofu\n• Fruit: 4-5 single pieces (apples, bananas)\n• Greens: 1 Clamshell salad mix\n• Bread: 1 Loaf (freeze half right away)'
      } else if (size.startsWith('2')) {
        plan = 'WEEKLY BASICS (COUPLE):\n• Eggs: 1 Dozen (12 eggs)\n• Milk: 1 Gallon (or 2 quarts)\n• Protein: 5 - 6 lbs total meat/fish/tofu\n• Fruit: 8-10 pieces fresh fruit\n• Veggies: 3-4 different fresh vegetables\n• Bread: 1-2 Loaves\n• Coffee / Tea: 1 Bag'
      } else if (size.startsWith('3')) {
        plan = 'WEEKLY BASICS (3-4 PEOPLE):\n• Eggs: 2 Dozen (24 eggs)\n• Milk: 2 Gallons\n• Protein: 10 - 12 lbs meat/poultry\n• Fruit: 15+ pieces / 2 large bags\n• Veggies: 6-8 lbs mixed fresh produce\n• Bread: 2-3 Loaves + snack crackers\n• Grains: 5-lb bag of rice or 3 pasta boxes'
      } else {
        plan = 'WEEKLY BASICS (5+ PEOPLE):\n• Eggs: 3-4 Dozen (Bulk pack)\n• Milk: 3+ Gallons\n• Protein: 16+ lbs (Costco/bulk club packs)\n• Fruit: Full case / multiple bags\n• Bread: 4+ Loaves\n• Buy flour, rice, and cooking oil strictly in bulk sizes'
      }

      return [
        res('Scale Target', size.split('(')[0].trim(), T.good),
        doc('Baseline Weekly Shopping List', plan),
      ]
    },
  },
  {
    id: 'grocery-quantity-by-family-size',
    name: 'Grocery Quantity by Family Size',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate weekly milk gallons, egg dozens, and meat pounds required for your family headcount.',
    tip: 'Pre-portioning bulk family-pack chicken into 1-lb ziplocks before freezing saves $40+ per month.',
    usage: [
      'Input number of adults, teens, and children.',
      'View total required pounds of protein, milk, and eggs.',
    ],
    method: [
      'Adult: ~3.5 lbs meat/wk. Teen: ~4.5 lbs meat/wk. Child: ~2 lbs meat/wk.',
    ],
    fields: [
      n('adults', 'Number of Adults', { def: 2, min: 1, max: 8 }),
      n('teens', 'Teens (High Appetite)', { def: 1, min: 0, max: 6 }),
      n('children', 'Children under 10', { def: 1, min: 0, max: 8 }),
    ],
    compute: (v) => {
      const a = asNum(v.adults)
      const t = asNum(v.teens)
      const c = asNum(v.children)

      const meatLbs = (a * 3.5) + (t * 4.5) + (c * 2.0)
      const eggDozens = Math.ceil(((a * 6) + (t * 8) + (c * 4)) / 12)
      const milkGallons = Math.max(1, Math.round(((a * 0.4) + (t * 0.8) + (c * 0.6)) * 10) / 10)

      return [
        res('Meat / Protein Needed', `${numD(meatLbs, 1)} lbs/week`, T.good, `~${numD(meatLbs * 0.45, 1)} kg`),
        res('Eggs Needed', `${eggDozens} Dozen / week`, T.neutral, `~${eggDozens * 12} eggs`),
        res('Milk Needed', `${milkGallons} Gallons / week`, T.neutral, `~${Math.round(milkGallons * 3.78)} liters`),
      ]
    },
  },
  {
    id: 'monthly-grocery-forecast',
    name: 'Monthly Grocery Forecast',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Forecast next month’s food expenditure factoring in dinner parties, holidays, and dining out shifts.',
    tip: 'Hosting a single 8-person dinner party typically adds $80-$140 to that week’s grocery bill.',
    usage: [
      'Enter your baseline grocery month.',
      'Add planned guest dinner parties or holiday feasts.',
      'Check predicted total grocery budget.',
    ],
    method: [
      'Baseline + (Guest Events * $20/guest) + seasonal buffer.',
    ],
    fields: [
      n('baseBudget', 'Standard Monthly Grocery Spend ($)', { def: 650, min: 100, max: 3000, step: 25 }),
      n('guestMeals', 'Dinner Party Guests to Host this Month', { def: 6, min: 0, max: 50 }),
      sel('holidayMonth', 'Is this a Major Holiday Month?', ['No (Standard month)', 'Yes (Thanksgiving, Christmas, Eid, etc.)'], 'No (Standard month)'),
    ],
    compute: (v) => {
      const base = asNum(v.baseBudget)
      const guests = asNum(v.guestMeals)
      const holiday = asSel(v.holidayMonth).startsWith('Yes')

      const entertainingCost = guests * 18
      const holidayCost = holiday ? 140 : 0
      const totalForecast = base + entertainingCost + holidayCost

      return [
        res('Forecasted Grocery Total', money(totalForecast), totalForecast > base * 1.2 ? T.warn : T.good),
        res('Entertaining Surcharge', money(entertainingCost), T.neutral, `For ${guests} guest meals`),
        res('Holiday Factor', holiday ? `+${money(holidayCost)}` : 'None', T.neutral),
      ]
    },
  },
  {
    id: 'grocery-stock-level-tracker',
    name: 'Grocery Stock Level Tracker',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Monitor your pantry safety stock so you never run out of cooking oil, salt, or toilet paper unexpectedly.',
    tip: 'Buy one replacement staple the day you OPEN the back-up container, not when it is completely empty.',
    usage: [
      'Check stock levels on 5 key high-impact household essentials.',
      'See immediate restock list.',
    ],
    method: [
      'Identifies critical zero-stock points for high-friction daily items.',
    ],
    fields: [
      sel('oil', 'Cooking Oil', ['Full bottle in reserve', 'Half bottle left', 'Almost empty (Need now!)'], 'Half bottle left'),
      sel('tp', 'Toilet Paper', ['5+ rolls on hand', '2-3 rolls left', 'Down to the last roll!'], '5+ rolls on hand'),
      sel('coffee', 'Morning Coffee / Tea', ['Unopened bag in pantry', 'Currently in canister', 'Almost out!'], 'Currently in canister'),
      sel('soap', 'Dishwasher / Dish Soap', ['Full backup', 'Partial bottle', 'Dregs left'], 'Full backup'),
    ],
    compute: (v) => {
      const urgent: string[] = []
      const watch: string[] = []

      const check = (val: string, name: string) => {
        if (val.includes('last') || val.includes('now') || val.includes('out') || val.includes('Dregs')) urgent.push(name)
        else if (val.includes('Half') || val.includes('2-3') || val.includes('canister') || val.includes('Partial')) watch.push(name)
      }

      check(asSel(v.oil), 'Cooking Oil')
      check(asSel(v.tp), 'Toilet Paper')
      check(asSel(v.coffee), 'Coffee/Tea')
      check(asSel(v.soap), 'Dish Soap')

      return [
        res('Urgent Buy List', urgent.length > 0 ? urgent.join(', ') : 'None — Fully Stocked!', urgent.length > 0 ? T.bad : T.good),
        res('Watchlist for Next Trip', watch.length > 0 ? watch.join(', ') : 'All reserves healthy', T.neutral),
        res('Pantry Buffer Health', urgent.length === 0 ? 'Secure' : 'Immediate Restock Needed', urgent.length === 0 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'grocery-restock-reminder',
    name: 'Grocery Restock Reminder',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate how many days a container of butter, olive oil, coffee, or milk will last at your consumption rate.',
    tip: 'Knowing your burn rate prevents emergency late-night convenience store runs where items cost 40% more.',
    usage: [
      'Enter package size and daily usage rate.',
      'Check remaining days until empty.',
    ],
    method: [
      'Days remaining = Total package units / Daily consumption units.',
    ],
    fields: [
      txt('item', 'Item Name', 1, 'Coffee Beans (12 oz / 340g)'),
      n('totalUnits', 'Total Package Quantity (grams / oz / cups)', { def: 340, min: 1, max: 5000 }),
      n('dailyBurn', 'Daily Household Usage (grams / oz / cups)', { def: 25, min: 0.5, max: 500, step: 0.5 }),
    ],
    compute: (v) => {
      const item = asStr(v.item) || 'Item'
      const total = asNum(v.totalUnits)
      const burn = asNum(v.dailyBurn)

      const daysLeft = Math.floor(total / burn)
      const tone = daysLeft <= 3 ? T.bad : daysLeft <= 7 ? T.warn : T.good

      return [
        res('Depletion Horizon', `${daysLeft} days remaining`, tone, `For ${item}`),
        res('Restock Trigger', daysLeft <= 4 ? 'Add to shopping list today!' : `Next purchase in ~${daysLeft - 3} days`, tone),
        res('Weekly Consumption', `${numD(burn * 7, 1)} units/week`, T.neutral),
      ]
    },
  },
  {
    id: 'grocery-purchase-frequency-planner',
    name: 'Grocery Purchase Frequency Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Split your shopping into monthly bulk runs and weekly fresh produce runs to minimize store trips.',
    tip: 'Shoppers who go to the grocery store only once a week spend 18% less on impulse buys than those visiting 3-4 times.',
    usage: [
      'Review the two-tier shopping schedule (Monthly warehouse vs Weekly green grocer).',
    ],
    method: [
      'Segregates non-perishables and frozen bulk items from rapid-decay fresh produce.',
    ],
    fields: [
      sel('storePreference', 'Shopping Format', ['Standard Supermarket (1x/week)', 'Bulk Club + Weekly Fresh Grocer', 'Discounter (Aldi/Lidl) + Specialty'], 'Bulk Club + Weekly Fresh Grocer'),
    ],
    compute: (v) => {
      const pref = asSel(v.storePreference)

      const routine = [
        'TIER 1 — MONTHLY BULK RUN (Day 1 of Month):',
        '• Toilet paper, paper towels, trash bags, dish tabs.',
        '• Rice, pasta, oats, flour, cooking oils, canned tomatoes.',
        '• Frozen meats, frozen berries, butter (freezable).',
        '',
        'TIER 2 — WEEKLY 20-MINUTE SPRINT (Every Saturday Morning):',
        '• Fresh leafy greens, berries, bananas, avocados.',
        '• Fresh milk, bread, and fresh fish.',
        '• STRICT RULE: Stick only to the perimeter of the store!',
      ].join('\n')

      return [
        res('Strategy Profile', pref, T.good),
        doc('Two-Tier Grocery Strategy', routine),
      ]
    },
  },
  {
    id: 'grocery-waste-tracker',
    name: 'Grocery Waste Tracker',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Track the ratio of food eaten vs thrown away to measure true grocery efficiency.',
    tip: 'The average family tosses $1,500 of uneaten food per year—mostly greens, bread, and forgotten leftovers.',
    usage: [
      'Enter total weekly grocery spend and estimated dollar value of food thrown away.',
      'Check your food efficiency rating.',
    ],
    method: [
      'Efficiency = ((Spend - Waste) / Spend) * 100.',
    ],
    fields: [
      n('weeklySpend', 'Weekly Grocery Spend ($)', { def: 150, min: 20, max: 1000, step: 5 }),
      n('weeklyWaste', 'Estimated Value Thrown Away ($)', { def: 18, min: 0, max: 200, step: 1 }),
    ],
    compute: (v) => {
      const spend = asNum(v.weeklySpend)
      const waste = asNum(v.weeklyWaste)

      const efficiency = clamp(((spend - waste) / spend) * 100, 0, 100)
      const tone = efficiency >= 92 ? T.good : efficiency >= 80 ? T.warn : T.bad

      return [
        res('Grocery Utilization Efficiency', pct(efficiency, 0), tone),
        res('Money Lost This Month', money(waste * 4.33) + '/mo', waste > 20 ? T.bad : T.neutral),
        res('Yearly Waste Loss', money(waste * 52) + '/year', T.bad, 'Pure savings potential'),
      ]
    },
  },
  {
    id: 'grocery-savings-tracker',
    name: 'Grocery Savings Tracker',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Log your supermarket loyalty savings, store brand substitutions, and digital coupon discounts.',
    tip: 'Store-brand staples (sugar, oats, canned beans, salt) are chemically identical to brand names at 30-40% lower cost.',
    usage: [
      'Enter register receipt savings and store brand discounts.',
      'View total annual savings forecast.',
    ],
    method: [
      'Sums discount mechanisms and calculates annual compounding return.',
    ],
    fields: [
      n('receiptSavings', 'Loyalty / Coupon Savings on Receipt ($)', { def: 12.50, min: 0, max: 200, step: 0.5 }),
      n('storeBrandSavings', 'Estimated Store-Brand Switch Savings ($)', { def: 15.00, min: 0, max: 200, step: 0.5 }),
    ],
    compute: (v) => {
      const coupons = asNum(v.receiptSavings)
      const storeBrand = asNum(v.storeBrandSavings)

      const tripSavings = coupons + storeBrand
      const annualSavings = tripSavings * 52

      return [
        res('Savings This Trip', moneyC(tripSavings), T.good, `${moneyC(coupons)} coupons + ${moneyC(storeBrand)} store-brand`),
        res('Annual Grocery Savings', money(annualSavings), T.good, 'Money kept in your wallet per year'),
        res('5-Year Impact', money(annualSavings * 5), T.good, 'Can fund a major family vacation'),
      ]
    },
  },
  {
    id: 'grocery-budget-remaining-calculator',
    name: 'Grocery Budget Remaining Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate exact remaining spend allowed per shopping trip for the rest of the calendar month.',
    tip: 'If you have $60 left for 10 days, shift dinner menus to pantry eggs, beans, and rice to close the gap cleanly.',
    usage: [
      'Enter starting monthly budget and amount spent so far.',
      'Input remaining grocery shopping trips planned this month.',
    ],
    method: [
      'Spend per trip = (Budget - Spent) / Trips Remaining.',
    ],
    fields: [
      n('budget', 'Monthly Grocery Budget ($)', { def: 600, min: 50, max: 3000, step: 25 }),
      n('spentSoFar', 'Spent to Date ($)', { def: 460, min: 0, max: 3000, step: 10 }),
      n('tripsLeft', 'Shopping Trips Remaining this Month', { def: 2, min: 1, max: 10 }),
    ],
    compute: (v) => {
      const b = asNum(v.budget)
      const s = asNum(v.spentSoFar)
      const trips = asNum(v.tripsLeft)

      const remaining = b - s
      const perTrip = remaining / trips
      const tone = perTrip < 40 ? T.warn : perTrip < 0 ? T.bad : T.good

      return [
        res('Remaining Dollars', money(remaining), tone, `${pct((s / b) * 100, 0)} already spent`),
        res('Allowance per Trip', money(perTrip), tone, `For ${trips} remaining trips`),
        res('Strategy', remaining < 50 ? 'Pantry challenge mode: Cook existing freezer foods' : 'Comfortable remaining balance', tone),
      ]
    },
  },
  {
    id: 'shopping-trip-cost-estimator',
    name: 'Shopping Trip Cost Estimator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Quickly estimate your basket total by multiplying planned items by your store’s price tier.',
    tip: 'Average item cost at Aldi/Lidl is ~$3.20 vs $4.60 at conventional supermarkets and $6.80 at Whole Foods.',
    usage: [
      'Select store tier (Discounter, Conventional, or Premium Organic).',
      'Input planned item count.',
      'Check predicted total at the register.',
    ],
    method: [
      'Multiplies item count by benchmarked basket price tiers.',
    ],
    fields: [
      sel('storeTier', 'Supermarket Tier', ['Discount Grocer (Aldi, Lidl) ~$3.20/item', 'Conventional Supermarket (Kroger, Tesco, Safeway) ~$4.60/item', 'Premium / Organic (Whole Foods, Trader Joes, M&S) ~$6.80/item'], 'Conventional Supermarket (Kroger, Tesco, Safeway) ~$4.60/item'),
      n('items', 'Number of Items on Shopping List', { def: 25, min: 1, max: 150 }),
    ],
    compute: (v) => {
      const tier = asSel(v.storeTier)
      const items = asNum(v.items)

      const avgPrice = tier.includes('3.20') ? 3.20 : tier.includes('6.80') ? 6.80 : 4.60
      const estimate = items * avgPrice
      const low = Math.round(estimate * 0.9)
      const high = Math.round(estimate * 1.15)

      return [
        res('Estimated Bill Range', `${money(low)} – ${money(high)}`, T.good, `Median estimate: ${money(estimate)}`),
        res('Items on List', `${items} items`, T.neutral),
        res('Store Type', tier.split('~')[0].trim(), T.neutral),
      ]
    },
  },
  {
    id: 'grocery-receipt-splitter',
    name: 'Grocery Receipt Splitter',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Fairly split a shared grocery bill when some items are shared and some are personal purchases.',
    tip: 'Keep personal specialty snacks separate at checkout or place a divider bar on the conveyor belt.',
    usage: [
      'Enter total receipt amount.',
      'Input Person A exclusive items and Person B exclusive items.',
      'Split the shared food items 50/50 and calculate final owes.',
    ],
    method: [
      'Shared = Total - A_personal - B_personal. Each pays: Personal + (Shared / 2).',
    ],
    fields: [
      n('totalReceipt', 'Total Grocery Receipt ($)', { def: 140, min: 1, max: 2000, step: 5 }),
      n('personAPersonal', 'Person A Personal Items ($)', { def: 30, min: 0, max: 1000, step: 2 }),
      n('personBPersonal', 'Person B Personal Items ($)', { def: 20, min: 0, max: 1000, step: 2 }),
    ],
    compute: (v) => {
      const total = asNum(v.totalReceipt)
      const aPersonal = asNum(v.personAPersonal)
      const bPersonal = asNum(v.personBPersonal)

      const shared = Math.max(0, total - aPersonal - bPersonal)
      const aOwes = aPersonal + (shared / 2)
      const bOwes = bPersonal + (shared / 2)

      return [
        res('Person A Pays', moneyC(aOwes), T.good, `${moneyC(aPersonal)} personal + ${moneyC(shared / 2)} shared`),
        res('Person B Pays', moneyC(bOwes), T.good, `${moneyC(bPersonal)} personal + ${moneyC(shared / 2)} shared`),
        res('Shared Household Food', moneyC(shared), T.neutral, 'Split 50/50 equally'),
      ]
    },
  },
  {
    id: 'grocery-receipt-organizer',
    name: 'Grocery Receipt Organizer',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Log and summarize grocery receipts by supermarket chain, payment method, and sales tax.',
    tip: 'Take a quick smartphone snap of paper receipts with thermal ink—thermal ink fades completely after 6 months.',
    usage: [
      'Enter store name, date, subtotal, and tax.',
      'Format a clean standardized log record for your budget spreadsheet.',
    ],
    method: [
      'Standard bookkeeping receipt entry generator.',
    ],
    fields: [
      txt('store', 'Supermarket / Store Name', 1, 'Trader Joes'),
      n('subtotal', 'Pre-tax Subtotal ($)', { def: 88.40, min: 1, max: 1000, step: 1 }),
      n('tax', 'Sales Tax ($)', { def: 2.65, min: 0, max: 100, step: 0.1 }),
      sel('payment', 'Payment Method', ['Credit Card', 'Debit Card', 'Cash', 'Mobile Pay'], 'Credit Card'),
    ],
    compute: (v) => {
      const store = asStr(v.store) || 'Store'
      const sub = asNum(v.subtotal)
      const tax = asNum(v.tax)
      const pay = asSel(v.payment)
      const total = sub + tax

      const record = `RECEIPT ENTRY: ${store.toUpperCase()}\nTotal: ${moneyC(total)} (Subtotal: ${moneyC(sub)}, Tax: ${moneyC(tax)})\nMethod: ${pay}\nCategory: Groceries & Household Essentials`

      return [
        res('Total Charged', moneyC(total), T.good),
        doc('Formatted Budget Log Record', record),
      ]
    },
  },
  {
    id: 'grocery-price-change-calculator',
    name: 'Grocery Price Change Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Compare the unit price ($/oz, $/100g, $/liter) between two different packaging sizes to find the genuine bargain.',
    tip: 'Bigger packaging is NOT always cheaper—supermarkets frequently price the "family size" at a higher per-ounce rate.',
    usage: [
      'Enter price and weight of Package A (Smaller).',
      'Enter price and weight of Package B (Larger).',
      'Instantly see which is cheaper per unit and by what percentage.',
    ],
    method: [
      'Unit Price = Price / Quantity. Calculates percentage difference between the two rates.',
    ],
    fields: [
      n('priceA', 'Package A Price ($)', { def: 4.99, min: 0.1, max: 500, step: 0.1 }),
      n('qtyA', 'Package A Size (oz / grams / count)', { def: 16, min: 1, max: 5000 }),
      n('priceB', 'Package B Price ($)', { def: 8.49, min: 0.1, max: 500, step: 0.1 }),
      n('qtyB', 'Package B Size (oz / grams / count)', { def: 32, min: 1, max: 5000 }),
    ],
    compute: (v) => {
      const pA = asNum(v.priceA)
      const qA = asNum(v.qtyA)
      const pB = asNum(v.priceB)
      const qB = asNum(v.qtyB)

      const unitA = pA / qA
      const unitB = pB / qB

      const aIsCheaper = unitA < unitB
      const diffPct = Math.abs(((unitA - unitB) / Math.max(unitA, unitB)) * 100)

      return [
        res('Better Value', aIsCheaper ? 'Package A is Cheaper' : 'Package B is Cheaper', T.good),
        res('Unit Price A', `${moneyC(unitA)} per unit`, aIsCheaper ? T.good : T.neutral),
        res('Unit Price B', `${moneyC(unitB)} per unit`, !aIsCheaper ? T.good : T.neutral),
        res('Savings Difference', `${pct(diffPct, 1)} savings`, T.good, `Buy ${aIsCheaper ? 'Package A' : 'Package B'} to save money`),
      ]
    },
  },
  {
    id: 'pantry-to-grocery-list-generator',
    name: 'Pantry-to-Grocery List Generator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Check your existing pantry stock against essential cooking foundations to auto-generate your missing grocery items.',
    tip: 'Shop your own pantry and freezer first before drafting a grocery list—you already own 50% of what you need.',
    usage: [
      'Uncheck any staple that is currently empty in your home.',
      'Copy the automatically compiled restock grocery list.',
    ],
    method: [
      'Inverts pantry inventory checklists to isolate missing supplies into a grocery list.',
    ],
    fields: [
      ck('staplesOnHand', 'Check items you ALREADY have on hand:', [
        'Olive Oil / Vegetable Oil',
        'Kosher Salt & Black Peppercorns',
        'All-Purpose Flour',
        'Granulated Sugar or Honey',
        'White or Brown Rice',
        'Pasta / Noodles',
        'Canned Chopped Tomatoes',
        'Canned Beans / Chickpeas',
        'Garlic & Yellow Onions',
        'Soy Sauce or Vinegar',
      ]),
    ],
    compute: (v) => {
      const list = asBoolList(v.staplesOnHand)
      const allItems = [
        'Cooking Oil (Olive / Vegetable)',
        'Salt & Black Pepper',
        'All-Purpose Flour',
        'Sugar or Honey',
        'Rice or Grains',
        'Dry Pasta',
        'Canned Tomatoes',
        'Canned Beans',
        'Fresh Garlic & Onions',
        'Soy Sauce or Vinegar',
      ]

      const missing: string[] = []
      allItems.forEach((item, idx) => {
        if (!list[idx]) missing.push(item)
      })

      const docText = missing.length === 0
        ? 'Pantry is 100% fully stocked! No core staples needed.'
        : `PANTRY RESTOCK LIST (Missing Staples):\n${'='.repeat(40)}\n\n${missing.map((m, i) => `[ ] ${i + 1}. Buy ${m}`).join('\n')}`

      return [
        res('Items to Buy', `${missing.length} missing staples`, missing.length > 0 ? T.warn : T.good),
        doc('Auto-Generated Grocery List', docText),
      ]
    },
  },
]
