import {
  type HouseholdSpec,
  T,
  n,
  sel,
  txt,
  res,
  doc,
  asNum,
  asStr,
  asSel,
  money,
  moneyC,
  pct,
  numD,
  clamp,
} from './householdSpec'

const SUB = 'Budget'
const SUB_ID = 'budget'

export const budgetSpecs: HouseholdSpec[] = [
  {
    id: 'household-income-allocation-calculator',
    name: 'Household Income Allocation Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Divide net take-home pay using the classic 50/30/20 budgeting rule (Needs, Wants, Savings).',
    tip: 'If your Needs exceed 50% due to high rent, reduce Wants to 20% to ensure your 20% savings rate stays protected.',
    usage: [
      'Enter your monthly net household take-home income.',
      'Check ideal target dollar caps for Essential Needs, Lifestyle Wants, and Future Savings.',
    ],
    method: [
      'Applies Elizabeth Warren’s 50/30/20 rule: 50% Needs (rent, utilities, groceries), 30% Wants (dining, hobbies), 20% Savings/Debt.',
    ],
    fields: [
      n('netIncome', 'Monthly Net Take-Home Income ($)', { def: 5200, min: 500, max: 50000, step: 100 }),
    ],
    compute: (v) => {
      const inc = asNum(v.netIncome)

      const needs = inc * 0.50
      const wants = inc * 0.30
      const savings = inc * 0.20

      return [
        res('Essential Needs (50% Max)', money(needs), T.neutral, 'Rent/mortgage, utilities, basic groceries, transport'),
        res('Lifestyle Wants (30% Max)', money(wants), T.neutral, 'Dining out, entertainment, shopping, vacations'),
        res('Savings & Debt Payoff (20%)', money(savings), T.good, 'Emergency fund, investments, extra debt payoff'),
        res('Annual Savings Potential', money(savings * 12) + '/year', T.good),
      ]
    },
  },
  {
    id: 'monthly-cash-flow-calculator',
    name: 'Monthly Cash Flow Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Subtract total monthly household expenses from net income to calculate your net surplus or deficit.',
    tip: 'A negative cash flow means you are quietly accumulating credit card debt or eroding savings each month.',
    usage: [
      'Enter total monthly income and total expenses.',
      'Review net monthly cash flow surplus and savings runway.',
    ],
    method: [
      'Net Cash Flow = Total Inflows - Total Outflows.',
    ],
    fields: [
      n('inflows', 'Total Monthly Inflow / Salary ($)', { def: 5500, min: 500, max: 50000, step: 100 }),
      n('outflows', 'Total Monthly Expenses & Bills ($)', { def: 4650, min: 200, max: 50000, step: 50 }),
    ],
    compute: (v) => {
      const inc = asNum(v.inflows)
      const exp = asNum(v.outflows)

      const surplus = inc - exp
      const tone = surplus > 400 ? T.good : surplus >= 0 ? T.warn : T.bad

      return [
        res('Net Monthly Cash Flow', money(surplus), tone, surplus >= 0 ? 'Monthly Net Surplus' : 'Operating at a Deficit!'),
        res('Savings Rate', pct((Math.max(0, surplus) / inc) * 100, 1), tone),
        res('Annualized Surplus', money(surplus * 12), tone, 'Money available for investing or debt payoff'),
      ]
    },
  },
  {
    id: 'household-spending-breakdown',
    name: 'Household Spending Breakdown',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Analyze the percentage distribution of your income across Housing, Food, Auto, and Discretionary.',
    tip: 'Housing should ideally not exceed 30% of gross income to avoid being "house poor".',
    usage: [
      'Enter monthly amounts for Housing, Food, Transportation, Utilities, and Other.',
      'Review percentage allocation against healthy financial benchmarks.',
    ],
    method: [
      'Calculates percentage share of each category against total expense sum.',
    ],
    fields: [
      n('housing', 'Housing (Rent / Mortgage) ($)', { def: 1800, min: 0, max: 20000, step: 50 }),
      n('food', 'Food (Groceries & Dining) ($)', { def: 750, min: 0, max: 10000, step: 25 }),
      n('transport', 'Transportation (Car, Gas, Transit) ($)', { def: 550, min: 0, max: 8000, step: 25 }),
      n('utilities', 'Utilities & Internet ($)', { def: 320, min: 0, max: 3000, step: 10 }),
      n('other', 'Other Expenses ($)', { def: 600, min: 0, max: 10000, step: 25 }),
    ],
    compute: (v) => {
      const h = asNum(v.housing)
      const f = asNum(v.food)
      const t = asNum(v.transport)
      const u = asNum(v.utilities)
      const o = asNum(v.other)

      const total = h + f + t + u + o
      const hPct = (h / total) * 100
      const fPct = (f / total) * 100

      return [
        res('Total Monthly Expenses', money(total), T.neutral),
        res('Housing Share', pct(hPct, 1), hPct > 38 ? T.warn : T.good, 'Benchmark: under 30-35%'),
        res('Food Share', pct(fPct, 1), fPct > 20 ? T.warn : T.good, 'Benchmark: 10-15%'),
        res('Transport Share', pct((t / total) * 100, 1), T.neutral),
      ]
    },
  },
  {
    id: 'expense-category-analyzer',
    name: 'Expense Category Analyzer',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Identify which household expense category is your single largest budget leak.',
    tip: 'Targeting the single biggest expense category (usually housing or auto loans) yields 10x more savings than cutting lattes.',
    usage: [
      'Input top 3 biggest monthly expense categories.',
      'Identify the highest leverage point for budget reduction.',
    ],
    method: [
      'Finds mathematical max among user expenses and suggests targeted reduction tactics.',
    ],
    fields: [
      txt('catA', 'Category A Name & Cost ($)', 1, 'Auto Loan & Insurance: 650'),
      txt('catB', 'Category B Name & Cost ($)', 1, 'Dining Out & Delivery: 500'),
      txt('catC', 'Category C Name & Cost ($)', 1, 'Streaming & Subscriptions: 120'),
    ],
    compute: (v) => {
      const parse = (str: string) => {
        const m = str.match(/(\d+)/)
        return m ? parseInt(m[1], 10) : 0
      }
      const valA = parse(asStr(v.catA))
      const valB = parse(asStr(v.catB))
      const valC = parse(asStr(v.catC))

      const maxVal = Math.max(valA, valB, valC)
      let biggest = 'Category A'
      if (maxVal === valB) biggest = 'Category B'
      else if (maxVal === valC) biggest = 'Category C'

      return [
        res('Primary Spending Driver', biggest, T.warn, `Accounts for ${money(maxVal)}/month`),
        res('Annualized Drain', money(maxVal * 12) + '/year', T.bad),
        res('Action Recommendation', 'Shop competitive insurance rates or set a strict weekly dining cap', T.good),
      ]
    },
  },
  {
    id: 'fixed-vs-variable-expense-calculator',
    name: 'Fixed vs Variable Expense Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Compare rigid contractual obligations against flexible discretionary spending.',
    tip: 'If your fixed expenses exceed 65% of your income, you have low financial resilience during unexpected job loss.',
    usage: [
      'Enter total fixed expenses (rent, loan payments, insurance).',
      'Enter total variable expenses (groceries, dining, entertainment, shopping).',
    ],
    method: [
      'Fixed / Total ratio reflects financial structural agility.',
    ],
    fields: [
      n('fixedExp', 'Monthly Fixed Expenses ($)', { def: 2800, min: 0, max: 30000, step: 50 }),
      n('variableExp', 'Monthly Variable Expenses ($)', { def: 1400, min: 0, max: 20000, step: 50 }),
    ],
    compute: (v) => {
      const fixed = asNum(v.fixedExp)
      const variable = asNum(v.variableExp)

      const total = fixed + variable
      const fixedPct = (fixed / total) * 100
      const varPct = (variable / total) * 100

      const tone = fixedPct > 70 ? T.warn : T.good

      return [
        res('Fixed Expense Ratio', pct(fixedPct, 1), tone, `${money(fixed)} locked in monthly`),
        res('Variable Expense Ratio', pct(varPct, 1), T.neutral, `${money(variable)} cuttable in emergency`),
        res('Financial Agility', fixedPct > 70 ? 'Inflexible (High fixed overhead)' : 'Flexible (Can pivot quickly in crisis)', tone),
      ]
    },
  },
  {
    id: 'household-debt-planner',
    name: 'Household Debt Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Tally all credit cards, student loans, and auto debt to view your total balance and monthly interest bleed.',
    tip: 'A $10,000 credit card balance at 22% APR drains over $180 per month in pure interest without reducing principal.',
    usage: [
      'Enter total debt balance across non-mortgage loans and average APR interest rate.',
      'Check how much money you lose to interest each month.',
    ],
    method: [
      'Monthly Interest = Balance * (APR / 100) / 12.',
    ],
    fields: [
      n('debtBalance', 'Total Non-Mortgage Debt ($)', { def: 14500, min: 0, max: 500000, step: 500 }),
      n('avgApr', 'Average Interest Rate (% APR)', { def: 18.5, min: 0, max: 36, step: 0.5 }),
      n('monthlyPayment', 'Total Monthly Debt Payment ($)', { def: 550, min: 10, max: 10000, step: 25 }),
    ],
    compute: (v) => {
      const balance = asNum(v.debtBalance)
      const apr = asNum(v.avgApr)
      const pmt = asNum(v.monthlyPayment)

      const monthlyInterest = balance * (apr / 100) / 12
      const principalPayment = Math.max(0, pmt - monthlyInterest)
      const annualInterest = monthlyInterest * 12

      const tone = apr > 15 ? T.bad : apr > 7 ? T.warn : T.good

      return [
        res('Monthly Interest Bleed', moneyC(monthlyInterest), tone, 'Money lost to banks each month'),
        res('Actual Principal Reduced', moneyC(principalPayment), T.neutral, `Out of ${money(pmt)} payment`),
        res('Annual Interest Waste', money(annualInterest), tone, 'Could fund emergency savings'),
      ]
    },
  },
  {
    id: 'debt-payoff-timeline',
    name: 'Debt Payoff Timeline',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate the exact month and year you will become debt-free by adding extra monthly cash.',
    tip: 'Adding just $100 extra per month to high-interest debt can shave years off your repayment timeline.',
    usage: [
      'Enter current debt balance, interest rate, and planned monthly payment.',
      'See total months to payoff and total interest paid.',
    ],
    method: [
      'Standard amortization formula: n = -ln(1 - (i * B / P)) / ln(1 + i).',
    ],
    fields: [
      n('balance', 'Total Debt Balance ($)', { def: 8000, min: 100, max: 200000, step: 250 }),
      n('interestRate', 'Annual Interest Rate (%)', { def: 19.9, min: 1, max: 36, step: 0.5 }),
      n('monthlyPay', 'Monthly Payment ($)', { def: 300, min: 20, max: 10000, step: 25 }),
    ],
    compute: (v) => {
      const b = asNum(v.balance)
      const rate = asNum(v.interestRate) / 100 / 12
      const p = asNum(v.monthlyPay)

      if (p <= b * rate) {
        return [
          res('Payoff Status', 'PAYMENT TOO LOW', T.bad, 'Payment does not even cover monthly interest! Debt will grow indefinitely.'),
          res('Minimum Required', `At least ${moneyC(b * rate + 10)} / month`, T.warn),
        ]
      }

      const months = Math.ceil(-Math.log(1 - (rate * b) / p) / Math.log(1 + rate))
      const totalPaid = months * p
      const totalInterest = totalPaid - b

      const years = Math.floor(months / 12)
      const remMonths = months % 12
      const timeStr = years > 0 ? `${years} yrs ${remMonths} mos` : `${months} months`

      return [
        res('Debt-Free In', timeStr, months <= 24 ? T.good : months <= 48 ? T.warn : T.bad),
        res('Total Interest Paid', money(totalInterest), totalInterest > b * 0.3 ? T.warn : T.good),
        res('Total Lifetime Outlay', money(totalPaid), T.neutral),
      ]
    },
  },
  {
    id: 'debt-to-income-calculator',
    name: 'Debt-to-Income Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Check your DTI ratio to see whether banks and mortgage lenders consider your debt level safe.',
    tip: 'Mortgage lenders look for a DTI below 36%, with no more than 28% allocated to housing debt.',
    usage: [
      'Enter gross monthly income (before tax).',
      'Enter total monthly required debt payments (rent/mortgage, auto, student, credit cards).',
    ],
    method: [
      'DTI = (Total Monthly Debt Payments / Gross Monthly Income) * 100.',
    ],
    fields: [
      n('grossIncome', 'Gross Monthly Income ($)', { def: 6500, min: 500, max: 50000, step: 100 }),
      n('debtPayments', 'Total Monthly Debt Payments ($)', { def: 2100, min: 0, max: 30000, step: 50 }),
    ],
    compute: (v) => {
      const gross = asNum(v.grossIncome)
      const debts = asNum(v.debtPayments)

      const dti = (debts / gross) * 100
      let status = 'Excellent (Under 30%)'
      let tone = T.good

      if (dti > 43) { status = 'Dangerously High (Hard to qualify for loans)'; tone = T.bad }
      else if (dti > 36) { status = 'Manageable but Elevated (Above 36%)'; tone = T.warn }

      return [
        res('Your DTI Ratio', pct(dti, 1), tone, status),
        res('Lender Rating', dti <= 36 ? 'Approved for Prime Rates' : 'Higher Interest / Co-signer Needed', tone),
        res('Available Debt Capacity', dti < 36 ? `${money((gross * 0.36) - debts)} / mo remaining before hitting 36% cap` : 'Over recommended ceiling', T.neutral),
      ]
    },
  },
  {
    id: 'bill-due-date-planner',
    name: 'Bill Due Date Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Stagger recurring bill due dates across your paychecks to eliminate mid-month cash crunches.',
    tip: 'Most credit card and utility companies let you change your monthly due date online with one click.',
    usage: [
      'Select your pay schedule (1st and 15th, Bi-weekly, or Monthly).',
      'Review optimal bill grouping strategy.',
    ],
    method: [
      'Splits fixed obligations evenly across paycheck windows.',
    ],
    fields: [
      sel('paySchedule', 'Paycheck Schedule', ['Twice a Month (1st & 15th)', 'Every Two Weeks (Bi-weekly)', 'Once a Month (1st)'], 'Twice a Month (1st & 15th)'),
    ],
    compute: (v) => {
      const sched = asSel(v.paySchedule)

      const advice = [
        'PAYCHECK 1 (1st of Month):',
        '• Rent / Mortgage (Largest single bill)',
        '• Electric & Heating Utility bills',
        '• Initial Half of Monthly Groceries',
        '',
        'PAYCHECK 2 (15th of Month):',
        '• Auto Loan & Insurance payments',
        '• Internet & Mobile Phone bills',
        '• Credit Card payments & Subscriptions',
        '• Second Half of Monthly Groceries & Savings Transfer',
      ].join('\n')

      return [
        res('Pay Cadence', sched, T.good),
        doc('Balanced Bill Staggering Guide', advice),
      ]
    },
  },
  {
    id: 'bill-payment-calendar',
    name: 'Bill Payment Calendar',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Organize your recurring monthly bills chronologically so you never miss a due date or pay a late fee.',
    tip: 'Autopay is great for fixed bills, but set a calendar reminder 2 days before autopay fires to ensure funds are settled.',
    usage: [
      'Review a standard chronological home billing schedule.',
      'Check total monthly obligations.',
    ],
    method: [
      'Sequences typical household bills across 4 calendar quarters.',
    ],
    fields: [
      n('totalBills', 'Total Monthly Fixed Bills ($)', { def: 2400, min: 200, max: 20000, step: 50 }),
    ],
    compute: (v) => {
      const b = asNum(v.totalBills)

      const schedule = [
        '• 1st: Rent / Mortgage ($1,400 est.)',
        '• 5th: Electricity & Water Utilities ($180 est.)',
        '• 10th: Car Loan & Vehicle Insurance ($450 est.)',
        '• 15th: Internet & Mobile Phone ($120 est.)',
        '• 20th: Credit Card Minimums ($150 est.)',
        '• 25th: Streaming & Software Subscriptions ($50 est.)',
      ].join('\n')

      return [
        res('Total Tracked Bills', money(b) + '/month', T.neutral),
        doc('Monthly Chronological Calendar', schedule),
      ]
    },
  },
  {
    id: 'bill-payment-priority-planner',
    name: 'Bill Payment Priority Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Triage which bills MUST be paid first when facing a temporary income shortfall or emergency.',
    tip: 'Unsecured credit card debt should always be prioritized LAST in an emergency—protect shelter and food first.',
    usage: [
      'Select your current financial situation.',
      'Receive a strict legal and survival hierarchy for bill payment.',
    ],
    method: [
      'Applies the "Four Walls" financial survival hierarchy: Food, Shelter, Utilities, Transportation.',
    ],
    fields: [
      sel('crisisLevel', 'Financial Pressure Level', ['Mild Cash Pinch (Short by $200-$500)', 'Severe Shortfall (Cannot pay all bills this month)'], 'Severe Shortfall (Cannot pay all bills this month)'),
    ],
    compute: (v) => {
      const crisis = asSel(v.crisisLevel)

      const hierarchy = [
        'PRIORITY 1: THE FOUR WALLS (SURVIVAL FIRST):',
        '1. Basic Groceries (Keep family fed)',
        '2. Rent or Mortgage (Keep roof over head)',
        '3. Electric, Gas & Water (Keep heat and water running)',
        '4. Minimum Transportation (Gas/transit to keep job)',
        '',
        'PRIORITY 2: SECONDARY NECESSITIES:',
        '5. Health Insurance & Critical Prescriptions',
        '6. Mobile Phone (Needed for work & family emergency)',
        '',
        'PRIORITY 3: UNSECURED DEBTS (PAY LAST):',
        '7. Credit Cards, Personal Loans, Store Cards.',
        'Note: Call credit card companies proactively to request hardship forbearance programs before missing payments.',
      ].join('\n')

      return [
        res('Triage Strategy', crisis.split('(')[0].trim(), T.warn),
        doc('Emergency Payment Hierarchy', hierarchy),
      ]
    },
  },
  {
    id: 'annual-household-budget',
    name: 'Annual Household Budget',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Project your entire 12-month household cash flow, fixed living costs, and annual wealth building.',
    tip: 'Don’t forget non-monthly annual bills (car registration, Amazon Prime, property tax)—divide by 12 and save monthly.',
    usage: [
      'Enter net monthly income and average monthly expenses.',
      'Check annual wealth accumulation forecast.',
    ],
    method: [
      'Multiplies monthly parameters by 12.',
    ],
    fields: [
      n('monthlyIncome', 'Net Monthly Household Income ($)', { def: 6000, min: 500, max: 60000, step: 100 }),
      n('monthlyExpenses', 'Net Monthly Household Expenses ($)', { def: 4800, min: 500, max: 60000, step: 100 }),
    ],
    compute: (v) => {
      const inc = asNum(v.monthlyIncome)
      const exp = asNum(v.monthlyExpenses)

      const annualInc = inc * 12
      const annualExp = exp * 12
      const annualSavings = annualInc - annualExp
      const savingsRate = (annualSavings / annualInc) * 100

      return [
        res('Annual Take-Home Income', money(annualInc), T.good),
        res('Annual Living Costs', money(annualExp), T.neutral),
        res('Annual Net Wealth Added', money(annualSavings), annualSavings > 10000 ? T.good : T.warn),
        res('True Annual Savings Rate', pct(savingsRate, 1), savingsRate >= 20 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'family-financial-goal-tracker',
    name: 'Family Financial Goal Tracker',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Track progress toward a family milestone like a house down payment, car replacement, or big holiday.',
    tip: 'Keeping dedicated separate high-yield savings accounts with nicknames (e.g. "Japan 2027") prevents accidental spending.',
    usage: [
      'Enter your savings target and current balance.',
      'Input monthly contribution amount to see completion date.',
    ],
    method: [
      'Months remaining = (Target - Current) / Monthly Contribution.',
    ],
    fields: [
      txt('goalName', 'Goal Name', 1, 'House Down Payment Fund'),
      n('targetAmount', 'Target Goal Amount ($)', { def: 25000, min: 100, max: 500000, step: 500 }),
      n('currentSaved', 'Currently Saved ($)', { def: 11200, min: 0, max: 500000, step: 250 }),
      n('monthlyAddition', 'Monthly Contribution ($)', { def: 650, min: 10, max: 20000, step: 25 }),
    ],
    compute: (v) => {
      const goal = asStr(v.goalName) || 'Goal'
      const target = asNum(v.targetAmount)
      const current = asNum(v.currentSaved)
      const addition = asNum(v.monthlyAddition)

      const remaining = Math.max(0, target - current)
      const progress = clamp((current / target) * 100, 0, 100)
      const monthsLeft = Math.ceil(remaining / addition)

      return [
        res('Goal Progress', pct(progress, 1), progress >= 75 ? T.good : T.neutral, `${money(current)} of ${money(target)} for ${goal}`),
        res('Time to Completion', `${monthsLeft} months (~${numD(monthsLeft / 12, 1)} yrs)`, monthsLeft <= 24 ? T.good : T.neutral),
        res('Remaining to Save', money(remaining), T.neutral),
      ]
    },
  },
  {
    id: 'savings-rate-calculator',
    name: 'Savings Rate Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate your exact household savings rate—the single most predictive metric of financial independence.',
    tip: 'A 20% savings rate means for every 4 years worked, you fund 1 full year of retirement living.',
    usage: [
      'Enter total monthly net take-home pay and total money saved / invested.',
      'Check savings tier and financial independence velocity.',
    ],
    method: [
      'Savings Rate = (Monthly Saved / Net Monthly Income) * 100.',
    ],
    fields: [
      n('netIncome', 'Net Monthly Income ($)', { def: 5000, min: 500, max: 50000, step: 100 }),
      n('totalSaved', 'Total Saved & Invested per Month ($)', { def: 950, min: 0, max: 50000, step: 50 }),
    ],
    compute: (v) => {
      const inc = asNum(v.netIncome)
      const saved = asNum(v.totalSaved)

      const rate = (saved / inc) * 100
      let tier = 'Average (Under 10%)'
      let tone = T.warn

      if (rate >= 30) { tier = 'Elite Wealth Builder (30%+)'; tone = T.good }
      else if (rate >= 20) { tier = 'Healthy Financial Freedom Target (20-30%)'; tone = T.good }
      else if (rate >= 10) { tier = 'Moderate Progress (10-20%)'; tone = T.neutral }

      return [
        res('Household Savings Rate', pct(rate, 1), tone, tier),
        res('Annual Capital Accumulated', money(saved * 12) + '/year', T.good),
        res('Target Recommendation', rate < 20 ? `Increase monthly savings by ${money((inc * 0.20) - saved)} to reach the 20% benchmark` : 'Great job! Keep investing steadily', tone),
      ]
    },
  },
  {
    id: 'monthly-savings-target',
    name: 'Monthly Savings Target',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate how much money you need to set aside every month to hit a target lump sum by a deadline.',
    tip: 'Automate your savings deposit on the day after payday so you never accidentally spend it.',
    usage: [
      'Enter the target amount you need and how many months you have to reach it.',
      'See required monthly savings deposit.',
    ],
    method: [
      'Monthly Target = Target Amount / Months Available.',
    ],
    fields: [
      n('targetSum', 'Target Amount Needed ($)', { def: 6000, min: 100, max: 200000, step: 250 }),
      n('months', 'Months Until Target Date', { def: 10, min: 1, max: 120 }),
    ],
    compute: (v) => {
      const target = asNum(v.targetSum)
      const m = asNum(v.months)

      const monthly = target / m
      const weekly = monthly / 4.33

      return [
        res('Monthly Deposit Needed', moneyC(monthly), T.good, `Save this every month for ${m} months`),
        res('Weekly Equivalent', moneyC(weekly) + ' / week', T.neutral),
        res('Total Target', money(target), T.neutral),
      ]
    },
  },
  {
    id: 'unexpected-expense-planner',
    name: 'Unexpected Expense Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate monthly "sinking funds" for irregular but inevitable costs like car maintenance, vet bills, and dental.',
    tip: 'Car repairs and appliance breakdowns are NOT emergencies—they are predictable irregular expenses that occur every year.',
    usage: [
      'Enter expected annual irregular expenses across vehicles, home repairs, and medical co-pays.',
      'Check required monthly sinking fund transfer.',
    ],
    method: [
      'Sums annual irregular categories and divides by 12.',
    ],
    fields: [
      n('carRepairs', 'Annual Auto Maintenance & Tires ($)', { def: 800, min: 0, max: 10000, step: 50 }),
      n('homeRepairs', 'Annual Home Maintenance ($)', { def: 1200, min: 0, max: 20000, step: 100 }),
      n('medicalDental', 'Annual Medical & Dental Out-of-pocket ($)', { def: 600, min: 0, max: 15000, step: 50 }),
      n('giftsHolidays', 'Annual Gifts & Celebrations ($)', { def: 800, min: 0, max: 10000, step: 50 }),
    ],
    compute: (v) => {
      const car = asNum(v.carRepairs)
      const home = asNum(v.homeRepairs)
      const med = asNum(v.medicalDental)
      const gift = asNum(v.giftsHolidays)

      const totalAnnual = car + home + med + gift
      const monthlySinking = totalAnnual / 12

      return [
        res('Monthly Sinking Fund Total', moneyC(monthlySinking) + '/mo', T.good, 'Transfer to savings automatically'),
        res('Total Annual Irregular Costs', money(totalAnnual), T.neutral, 'Budgeted ahead of time with zero stress'),
        res('Auto Share', `${money(Math.round(car / 12))}/mo`, T.neutral),
        res('Home Share', `${money(Math.round(home / 12))}/mo`, T.neutral),
      ]
    },
  },
  {
    id: 'emergency-expense-impact-calculator',
    name: 'Emergency Expense Impact Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Simulate how a sudden $1,000 or $3,000 shock (transmission repair, water heater) impacts your emergency buffer.',
    tip: 'Rebuild your emergency fund immediately after a shock before resuming non-essential discretionary spending.',
    usage: [
      'Enter current emergency fund balance and size of unexpected emergency expense.',
      'See remaining buffer and recovery runway.',
    ],
    method: [
      'Remaining Balance = Current - Shock. Calculates months of essential expenses remaining.',
    ],
    fields: [
      n('currentFund', 'Current Emergency Fund ($)', { def: 8500, min: 100, max: 100000, step: 250 }),
      n('emergencyCost', 'Emergency Expense Amount ($)', { def: 2200, min: 50, max: 50000, step: 50 }),
      n('monthlyNeeds', 'Essential Monthly Living Costs ($)', { def: 2800, min: 300, max: 30000, step: 100 }),
    ],
    compute: (v) => {
      const fund = asNum(v.currentFund)
      const shock = asNum(v.emergencyCost)
      const needs = asNum(v.monthlyNeeds)

      const remaining = fund - shock
      const monthsBefore = fund / needs
      const monthsAfter = Math.max(0, remaining / needs)

      const tone = monthsAfter >= 3 ? T.good : monthsAfter >= 1 ? T.warn : T.bad

      return [
        res('Post-Emergency Balance', money(remaining), tone, `${pct(((fund - remaining) / fund) * 100, 0)} of fund used`),
        res('Remaining Runway', `${numD(monthsAfter, 1)} months`, tone, `Was ${numD(monthsBefore, 1)} months before shock`),
        res('Buffer Verdict', monthsAfter >= 3 ? 'Resilient (Still has 3+ months buffer)' : 'Vulnerable (Rebuild immediately)', tone),
      ]
    },
  },
  {
    id: 'subscription-audit-tool',
    name: 'Subscription Audit Tool',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Audit streaming video, music, gym, and cloud subscriptions to reveal your annual recurring drain.',
    tip: 'Adopt a "one streaming service at a time" rule: cancel Netflix when watching HBO, and switch back when finished.',
    usage: [
      'Input monthly spending on video streaming, music, fitness apps, and cloud storage.',
      'Review total annual subscription drain.',
    ],
    method: [
      'Monthly sum * 12 = Annual recurring digital drain.',
    ],
    fields: [
      n('videoSubs', 'Video Streaming (Netflix, Disney, etc.) ($/mo)', { def: 38, min: 0, max: 200 }),
      n('musicAudio', 'Music & Audio (Spotify, Audible) ($/mo)', { def: 16, min: 0, max: 100 }),
      n('gymApps', 'Gym, Fitness Apps & Memberships ($/mo)', { def: 55, min: 0, max: 500 }),
      n('cloudSoftware', 'Cloud Storage & Software ($/mo)', { def: 22, min: 0, max: 300 }),
    ],
    compute: (v) => {
      const video = asNum(v.videoSubs)
      const music = asNum(v.musicAudio)
      const gym = asNum(v.gymApps)
      const cloud = asNum(v.cloudSoftware)

      const monthly = video + music + gym + cloud
      const annual = monthly * 12

      return [
        res('Monthly Subscription Drain', money(monthly) + '/mo', monthly > 100 ? T.warn : T.good),
        res('Annual Subscription Spend', money(annual) + '/year', annual > 1200 ? T.warn : T.good),
        res('5-Year Compounded Drain', money(annual * 5), T.bad, 'Pure recurring software/membership expense'),
      ]
    },
  },
  {
    id: 'recurring-expense-calculator',
    name: 'Recurring Expense Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate the shocking true annual and 10-year cost of daily coffees, takeout lunches, and convenience habits.',
    tip: 'A $5 daily coffee costs $150/month, $1,825/year, and $26,000+ over 10 years if invested at 7% return.',
    usage: [
      'Enter the daily or weekly cost of a recurring habit.',
      'Check 1-year and 10-year compound costs.',
    ],
    method: [
      'Calculates linear cost and 10-year compound investment opportunity cost at 7% annual growth.',
    ],
    fields: [
      txt('habitName', 'Habit / Expense Name', 1, 'Cafe Coffee & Pastry'),
      n('costPerOccurrence', 'Cost per Occurrence ($)', { def: 6.50, min: 0.5, max: 500, step: 0.5 }),
      n('timesPerWeek', 'Times per Week', { def: 5, min: 1, max: 28 }),
    ],
    compute: (v) => {
      const name = asStr(v.habitName) || 'Habit'
      const cost = asNum(v.costPerOccurrence)
      const times = asNum(v.timesPerWeek)

      const weekly = cost * times
      const annual = weekly * 52
      const tenYearInvested = annual * 13.816 // Future value factor at 7% for 10 years

      return [
        res('Weekly Spend', moneyC(weekly), T.neutral, `For ${name}`),
        res('Annual Spend', money(annual) + '/year', annual > 1000 ? T.warn : T.good),
        res('10-Year Opportunity Cost', money(tenYearInvested), T.bad, 'If invested in an S&P 500 index fund at 7% return'),
      ]
    },
  },
  {
    id: 'household-financial-snapshot',
    name: 'Household Financial Snapshot',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate your total household Net Worth by subtracting all debts from total assets.',
    tip: 'Your net worth is your true financial scoreboard—not your income. High earners can still have negative net worth.',
    usage: [
      'Enter total cash, investments, and home equity.',
      'Enter total mortgages, auto loans, and card debts.',
      'View your net worth scoreboard.',
    ],
    method: [
      'Net Worth = Total Assets - Total Liabilities.',
    ],
    fields: [
      n('cashBank', 'Cash & Bank Checking/Savings ($)', { def: 12000, min: 0, max: 2000000, step: 500 }),
      n('investments', 'Retirement & Investment Accounts ($)', { def: 45000, min: 0, max: 10000000, step: 1000 }),
      n('homeValue', 'Primary Home / Property Market Value ($)', { def: 280000, min: 0, max: 50000000, step: 5000 }),
      n('mortgageBalance', 'Mortgage Loan Balance ($)', { def: 195000, min: 0, max: 50000000, step: 5000 }),
      n('consumerDebt', 'Other Debts (Auto, Cards, Student) ($)', { def: 14000, min: 0, max: 1000000, step: 500 }),
    ],
    compute: (v) => {
      const cash = asNum(v.cashBank)
      const inv = asNum(v.investments)
      const home = asNum(v.homeValue)
      const mort = asNum(v.mortgageBalance)
      const debt = asNum(v.consumerDebt)

      const assets = cash + inv + home
      const liabilities = mort + debt
      const netWorth = assets - liabilities

      const tone = netWorth > 100000 ? T.good : netWorth > 0 ? T.neutral : T.bad

      return [
        res('Household Net Worth', money(netWorth), tone, netWorth >= 0 ? 'Positive Net Worth' : 'Negative Net Worth'),
        res('Total Household Assets', money(assets), T.good, `${money(cash + inv)} liquid/invested`),
        res('Total Household Liabilities', money(liabilities), liabilities > assets ? T.bad : T.neutral),
      ]
    },
  },
  {
    id: 'expense-trend-analyzer',
    name: 'Expense Trend Analyzer',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Compare this month’s spending against last month to identify lifestyle creep.',
    tip: 'Lifestyle inflation occurs when raises and bonuses are immediately absorbed by higher restaurant and shopping spending.',
    usage: [
      'Enter total spending from Last Month and This Month.',
      'Check percentage shift and budget trajectory.',
    ],
    method: [
      'Trend = ((This Month - Last Month) / Last Month) * 100.',
    ],
    fields: [
      n('lastMonth', 'Last Month Total Spending ($)', { def: 4100, min: 100, max: 50000, step: 50 }),
      n('thisMonth', 'This Month Total Spending ($)', { def: 4550, min: 100, max: 50000, step: 50 }),
    ],
    compute: (v) => {
      const last = asNum(v.lastMonth)
      const current = asNum(v.thisMonth)

      const diff = current - last
      const changePct = (diff / last) * 100
      const tone = diff < 0 ? T.good : diff > 250 ? T.warn : T.neutral

      return [
        res('Monthly Spending Trend', `${diff > 0 ? '+' : ''}${pct(changePct, 1)}`, tone, `${diff > 0 ? 'Increased' : 'Decreased'} by ${money(Math.abs(diff))}`),
        res('Status', diff <= 0 ? 'Spending Contracted — Excellent savings discipline' : 'Spending Crept Upward — Audit discretionary items', tone),
      ]
    },
  },
  {
    id: 'budget-variance-calculator',
    name: 'Budget Variance Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate the variance between your planned budget and actual register spending across categories.',
    tip: 'A healthy budget has both positive and negative variances that offset each other to keep the bottom line neutral.',
    usage: [
      'Enter planned budget and actual spent amount.',
      'Check variance dollar amount and percentage drift.',
    ],
    method: [
      'Variance = Actual - Budgeted.',
    ],
    fields: [
      n('budgeted', 'Planned Budget ($)', { def: 1200, min: 10, max: 20000, step: 25 }),
      n('actual', 'Actual Amount Spent ($)', { def: 1340, min: 0, max: 20000, step: 25 }),
    ],
    compute: (v) => {
      const b = asNum(v.budgeted)
      const a = asNum(v.actual)

      const variance = a - b
      const varPct = (variance / b) * 100
      const tone = variance <= 0 ? T.good : variance > b * 0.15 ? T.bad : T.warn

      return [
        res('Budget Variance', `${variance > 0 ? '+' : ''}${money(variance)}`, tone, variance <= 0 ? 'Under Budget (Favorable)' : 'Over Budget (Unfavorable)'),
        res('Variance Percentage', `${variance > 0 ? '+' : ''}${pct(varPct, 1)}`, tone),
      ]
    },
  },
  {
    id: 'monthly-spending-limit-calculator',
    name: 'Monthly Spending Limit Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Determine your safe daily and weekly discretionary spending allowance after reserving fixed bills and savings.',
    tip: 'Move your discretionary spending allowance to a separate debit card or checking account every Monday.',
    usage: [
      'Enter net income, fixed bills, and target savings.',
      'Check safe daily and weekly spending limit.',
    ],
    method: [
      'Discretionary = Net Income - Fixed Bills - Savings. Daily = Discretionary / 30.',
    ],
    fields: [
      n('income', 'Net Monthly Income ($)', { def: 4800, min: 500, max: 40000, step: 100 }),
      n('bills', 'Fixed Bills & Debt Payments ($)', { def: 2700, min: 0, max: 30000, step: 50 }),
      n('savings', 'Target Monthly Savings ($)', { def: 800, min: 0, max: 20000, step: 50 }),
    ],
    compute: (v) => {
      const inc = asNum(v.income)
      const bills = asNum(v.bills)
      const save = asNum(v.savings)

      const available = inc - bills - save
      const weekly = available / 4.33
      const daily = available / 30.5

      const tone = available > 400 ? T.good : available >= 0 ? T.warn : T.bad

      return [
        res('Safe Discretionary Allowance', money(available) + '/month', tone, 'For food, fun, shopping and hobbies'),
        res('Weekly Spending Cap', `${moneyC(weekly)} / week`, tone, 'Safe limit from Monday to Sunday'),
        res('Daily Spending Cap', `${moneyC(daily)} / day`, tone),
      ]
    },
  },
  {
    id: 'no-spend-day-tracker',
    name: 'No-Spend Day Tracker',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Track challenge days where you spend $0 on non-essential discretionary items to accelerate savings.',
    tip: 'A "No-Spend Day" allows fixed bills and routine groceries, but bans takeout coffee, online shopping, and restaurant food.',
    usage: [
      'Input how many zero-spend days you achieved this month.',
      'Enter target goal (e.g. 10 to 14 days per month).',
      'Check completion rate and estimated money saved.',
    ],
    method: [
      'Estimates ~$35 saved per successful no-spend day in avoided impulse buys and takeout food.',
    ],
    fields: [
      n('noSpendDays', 'No-Spend Days Achieved this Month', { def: 9, min: 0, max: 31 }),
      n('targetDays', 'Monthly Target Goal', { def: 12, min: 1, max: 31 }),
    ],
    compute: (v) => {
      const days = asNum(v.noSpendDays)
      const target = asNum(v.targetDays)

      const progress = clamp((days / target) * 100, 0, 100)
      const moneySaved = days * 35

      const tone = progress >= 80 ? T.good : progress >= 50 ? T.neutral : T.warn

      return [
        res('Challenge Progress', `${days} of ${target} days (${pct(progress, 0)})`, tone),
        res('Estimated Cash Saved', money(moneySaved), T.good, `Based on ~$35/day saved in impulse avoidance`),
        res('Annualized Impact', money(moneySaved * 12) + '/year', T.good),
      ]
    },
  },
]
