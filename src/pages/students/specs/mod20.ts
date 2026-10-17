import { n, sel, txt, ck, res, T, asNum, asSel, asStr, asBoolList, clamp, num } from '../../office/archetypes/spec'
import { sres, docr, type StudentSpec } from './studentSpec'

const SUBJECT = 'Student Finance & Budget'

const CUR: Record<string, string> = {
  '$ USD': '$',
  'GBP': 'GBP ',
  'EUR': 'EUR ',
  'INR': 'Rs ',
  'NGN': 'N ',
  'ZAR': 'R ',
  'AUD': 'A$',
  'CAD': 'C$',
  'JPY': 'Y',
  'KES': 'KSh ',
}

const CURRENCY_OPTIONS = ['$ USD', 'GBP', 'EUR', 'INR', 'NGN', 'ZAR', 'AUD', 'CAD', 'JPY', 'KES']

const NEEDS: { key: string; label: string; essential: boolean; fix: string }[] = [
  { key: 'rent', label: 'Rent and bills', essential: true, fix: 'the single biggest lever. A cheaper room ten minutes further out usually beats a smaller food budget' },
  { key: 'food', label: 'Food', essential: true, fix: 'cook four nights a week. One takeaway a night is a mortgage payment in disguise' },
  { key: 'transport', label: 'Transport', essential: true, fix: 'a monthly pass is cheaper than single tickets on any route you use weekly' },
  { key: 'course', label: 'Course materials', essential: true, fix: 'second-hand, library copies, and a share with the person in your study group' },
  { key: 'phone', label: 'Phone and internet', essential: true, fix: 'the cheapest plan that covers your data. This is where students quietly overspend' },
  { key: 'health', label: 'Health and insurance', essential: true, fix: 'keep the student rate, and check whether your university scheme already covers it' },
  { key: 'social', label: 'Social and going out', essential: false, fix: 'this is the budget you actually decide. A fixed amount per week beats an open tab' },
  { key: 'clothes', label: 'Clothes and hygiene', essential: false, fix: 'batched buying once a term, never a single item mid-week' },
  { key: 'other', label: 'Everything else', essential: false, fix: 'the category that hides subscriptions. Cancel anything you have not opened this month' },
]

function lines(raw: string): string[] {
  return raw
    .split('\n')
    .map((l) => l.replace(/\r$/, '').trim())
    .filter((l) => l.length > 0)
}

function cash(v: number, sym: string): string {
  const s = sym.trim()
  const formatted = Math.round(Math.abs(v)).toLocaleString('en-US')
  return (v < 0 ? '-' : '') + s + formatted
}

function symbol(v: string): string {
  const key = v.replace(/^([$£€])\s*(\w+)$/, '$1').replace(/\s+/g, '')
  if (CUR[v]) return CUR[v]
  return key.charAt(0) === '$' ? '$' : key.slice(0, 3).toUpperCase() + ' '
}

function emi(principal: number, annualRate: number, months: number): { pay: number; interest: number; total: number } {
  const p = Math.max(0, principal)
  const r = Math.max(0, annualRate) / 100 / 12
  const k = Math.max(1, Math.round(months))
  if (r <= 0) return { pay: p / k, interest: 0, total: p }
  const f = Math.pow(1 + r, k)
  const pay = (p * r * f) / (f - 1)
  const totalPay = pay * k
  return { pay, interest: totalPay - p, total: totalPay }
}

function median(arr: number[]): number {
  if (!arr.length) return 0
  const s = arr.slice().sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

const CAPS: StudentSpec[] = [
  {
    id: 'student-budget-calculator-finance',
    name: 'Student Budget Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Compares what comes in with what goes out each month, then tells you which line is actually running the budget.',
    tip: 'A student budget that only tracks rent and food misses the subscriptions, the taxi home and the coffee that becomes a daily habit. Track everything for one month before you decide anything.',
    usage: ['Enter your income and each monthly cost.', 'Check the essentials against the guideline split.', 'Read the surplus, the weekly burn and the biggest line.'],
    method: ['Costs are grouped into essentials and wants.', 'The result is compared against the 50/30/20 guideline.', 'Burn rate, surplus and the biggest lever are reported.'],
    fields: [
      sel('currency', 'Currency', CURRENCY_OPTIONS, '$ USD'),
      n('income', 'Monthly money coming in', { def: 900, min: 0, max: 100000, step: 10 }),
      n('savings', 'Savings you can draw from', { def: 0, min: 0, max: 100000, step: 50 }),
      n('rent', 'Rent and bills', { def: 380, min: 0, max: 20000, step: 10 }),
      n('food', 'Food', { def: 220, min: 0, max: 10000, step: 5 }),
      n('transport', 'Transport', { def: 45, min: 0, max: 5000, step: 5 }),
      n('course', 'Course materials', { def: 40, min: 0, max: 5000, step: 5 }),
      n('phone', 'Phone and internet', { def: 30, min: 0, max: 1000, step: 1 }),
      n('health', 'Health and insurance', { def: 25, min: 0, max: 2000, step: 5 }),
      n('social', 'Social and going out', { def: 90, min: 0, max: 5000, step: 5 }),
      n('clothes', 'Clothes and hygiene', { def: 30, min: 0, max: 2000, step: 5 }),
      n('other', 'Everything else', { def: 35, min: 0, max: 5000, step: 5 }),
    ],
    compute: (v) => {
      const sym = symbol(asSel(v.currency))
      const vals: Record<string, number> = {}
      NEEDS.forEach((nd) => {
        vals[nd.key] = Math.max(0, asNum(v[nd.key]))
      })
      const essentials = NEEDS.filter((nd) => nd.essential).reduce((s, nd) => s + vals[nd.key], 0)
      const wants = NEEDS.filter((nd) => !nd.essential).reduce((s, nd) => s + vals[nd.key], 0)
      const out = essentials + wants
      const income = Math.max(0, asNum(v.income))
      const savings = Math.max(0, asNum(v.savings))
      const balance = income - out
      const runRate = income > 0 ? out / income : 99
      const biggest = NEEDS.slice().sort((a, b) => vals[b.key] - vals[a.key])[0]
      const empty = NEEDS.filter((nd) => vals[nd.key] === 0)
      const table = NEEDS.map((nd) => (nd.label + '  ').padEnd(24) + String(cash(vals[nd.key], sym)).padStart(10) + '   ' + (out > 0 ? Math.round((vals[nd.key] / out) * 100) + '% of outgoings' : '-') + (nd.essential ? '   [essential]' : '   [choice]')).join('\n')
      const days = income > 0 && out > 0 ? Math.round((income / out) * 30) : 0
      return [
        sres('Monthly outgoings', cash(out, sym), out === 0 ? T.warn : T.neutral, 'your money lasts about ' + num(days, 0) + ' days at this rate, so ' + cash(out / 4.33, sym) + ' a week is the figure to work to', clamp(100 - Math.max(0, runRate - 70) * 1.5, 5, 100)),
        sres('Monthly balance', cash(balance, sym), balance > 0 ? T.good : balance === 0 ? T.warn : T.bad, balance > 0 ? 'you have ' + cash(balance, sym) + ' left before saving anything' : balance === 0 ? 'break even, which means no margin for one unexpected bill' : 'a deficit of ' + cash(-balance, sym) + '. The bill is not going away, so something has to change this month.', clamp(50 + balance * 0.5, 5, 100)),
        sres('Essentials share', num(out > 0 ? (essentials / out) * 100 : 0, 0) + '%', out > 0 && essentials / out <= 0.55 ? T.good : T.warn, out > 0 ? (essentials / out <= 0.55 ? 'inside the 50/30/20 guideline' : 'above the guideline 50%, which is normal with high rent but leaves nothing for savings') : 'nothing recorded yet', clamp(100 - Math.max(0, (essentials / Math.max(1, out)) * 100 - 50) * 2, 5, 100)),
        sres('Choices share', num(out > 0 ? (wants / out) * 100 : 0, 0) + '%', wants > out * 0.45 ? T.bad : wants > out * 0.3 ? T.warn : T.good, wants > out * 0.45 ? 'more than almost half of your money is discretionary. This is the fastest thing to change and nobody will notice.' : 'a workable amount of discretionary spend, so your essentials are not being funded by luck', clamp(100 - Math.max(0, (wants / Math.max(1, out)) * 100 - 30) * 2, 5, 100)),
        sres('Biggest line', biggest.label + ' at ' + cash(vals[biggest.key], sym), vals[biggest.key] > out * 0.4 ? T.warn : T.neutral, 'this is where the money is: ' + biggest.fix, clamp(100 - (vals[biggest.key] / Math.max(1, out)) * 100, 5, 100)),
        sres('Savings', cash(savings, sym), savings >= balance ? T.good : T.neutral, 'never spend savings to cover a recurring cost. Savings are for the annual costs: fees, travel, a laptop replacement.', savings >= balance ? 90 : 55),
        empty.length ? sres('Not tracked', num(empty.length, 0) + ' categor(y/ies) at zero', T.warn, 'a zero can mean genuinely free or genuinely forgotten: ' + empty.map((x) => x.label).join(', '), 50) : sres('Categories tracked', num(NEEDS.length, 0) + ' of ' + num(NEEDS.length, 0), T.good, 'every category has a number against it, so nothing is hidden', 100),
        docr('Budget table', 'Essentials ' + cash(essentials, sym) + '\nChoices    ' + cash(wants, sym) + '\nTotal out  ' + cash(out, sym) + '\nIncome     ' + cash(income, sym) + '\nBalance    ' + cash(balance, sym) + '\n\n' + table),
        res('The 50/30/20 guideline', 'half essentials, three tenths choices, two tenths saving and debt. Under 20, it is a rough shape rather than a rule, but the ratio is what matters: if your essentials are above half, the fix is housing, not coffee.', T.neutral),
        res('Annualise it', 'multiply your monthly figure by nine, not twelve, if you are only paying rent in term time. Students who budget for twelve months of rent and get nine months of income discover this in a specific week.', T.warn),
        res('A budget is a hypothesis', 'this is a model, not a measurement. Run it for one real month, compare it against your bank statement, and adjust the number that was wrong by the largest amount. Repeat once.', T.good),
      ]
    },
  },
  {
    id: 'monthly-student-budget-finance',
    name: 'Monthly Budget Planner',
    archetype: 'timeline',
    subject: SUBJECT,
    blurb: 'Turns one set of numbers into a month-by-month cash plan, including the expensive weeks that break most students.',
    tip: 'Term is not evenly expensive. Week one has course costs, week six has a book nobody read, and week twelve has a flight home. Budgeting the average hides all three.',
    usage: ['Set the term length and your money for it.', 'Separate essentials from choices and savings.', 'Read the week-by-week plan and the thin weeks.'],
    method: ['Fixed, variable and start-of-term costs are separated.', 'A running balance is projected week by week.', 'The thinnest weeks are flagged.'],
    fields: [
      sel('currency', 'Currency', CURRENCY_OPTIONS, '$ USD'),
      n('months', 'Months in the plan', { def: 9, min: 3, max: 24, step: 1 }),
      n('start', 'Money you start with', { def: 2000, min: 0, max: 1000000, step: 50 }),
      n('income', 'Money arriving in total', { def: 3600, min: 0, max: 1000000, step: 50 }),
      n('essentials', 'Essentials per month', { def: 600, min: 0, max: 100000, step: 10 }),
      n('wants', 'Choices per month', { def: 150, min: 0, max: 100000, step: 10 }),
      n('termStart', 'One-off costs at the start', { def: 500, min: 0, max: 100000, step: 10 }),
      n('save', 'Savings goal for the period', { def: 400, min: 0, max: 1000000, step: 10 }),
    ],
    compute: (v) => {
      const sym = symbol(asSel(v.currency))
      const months = clamp(Math.round(asNum(v.months)) || 9, 3, 24)
      const start = Math.max(0, asNum(v.start))
      const income = Math.max(0, asNum(v.income))
      const ess = Math.max(0, asNum(v.essentials))
      const wants = Math.max(0, asNum(v.wants))
      const termStart = Math.max(0, asNum(v.termStart))
      const save = Math.max(0, asNum(v.save))
      const monthlyOut = ess + wants
      const weeks = months * 4.33
      const weeklyOut = monthlyOut / 4.33
      const savingsPerWeek = save / Math.max(1, weeks)
      const totalAvailable = start + income
      const totalSpend = monthlyOut * months + termStart
      const rows: string[] = []
      let balance = start - termStart
      let brokeAt = 0
      for (let m = 1; m <= Math.min(months, 18); m++) {
        const inflow = income / months
        const saving = Math.min(savingsPerWeek * 4.33, Math.max(0, balance + inflow - monthlyOut))
        balance += inflow - monthlyOut - saving
        if (balance < 0 && brokeAt === 0) brokeAt = m
        rows.push('month ' + String(m).padStart(2, '0') + '  in ' + String(cash(inflow, sym)).padStart(10) + '   out ' + String(cash(monthlyOut, sym)).padStart(10) + '   saved ' + String(cash(saving, sym)).padStart(9) + '   balance ' + String(cash(balance, sym)).padStart(11))
      }
      const tail = months > 18 ? (months - 18) * (income / months - monthlyOut) : 0
      const atEnd = balance + tail
      const floorLine = ess * 4.33 * 0.9
      return [
        sres('Total available', cash(totalAvailable, sym), T.neutral, cash(start, sym) + ' starting plus ' + cash(income, sym) + ' arriving over ' + num(months, 0) + ' months', clamp(100 - Math.max(0, (totalSpend / Math.max(1, totalAvailable) - 1) * 100), 5, 100)),
        sres('Planned spending', cash(totalSpend, sym), totalSpend <= totalAvailable ? T.good : T.bad, cash(monthlyOut, sym) + ' a month for ' + num(months, 0) + ' months plus ' + cash(termStart, sym) + ' of one-off start costs', totalSpend <= totalAvailable ? 90 : 30),
        sres('Position at the end', cash(atEnd, sym), atEnd >= save ? T.good : atEnd >= 0 ? T.warn : T.bad, atEnd >= save ? 'you finish with the savings goal intact' : atEnd >= 0 ? 'you finish with nothing saved, and one surprise would end at zero' : 'the account first goes negative in month ' + num(brokeAt, 0) + ' and ends at ' + cash(atEnd, sym) + '. Cut ' + (ess > wants ? 'essentials' : 'choices') + ' by about ' + cash(Math.max(0, (-atEnd) / Math.max(1, months)), sym) + ' a month, or find income, because the months will not shorten.', clamp(50 + atEnd * 0.4, 5, 100)),
        sres('Weekly cost', cash(weeklyOut, sym) + ' out, ' + cash(savingsPerWeek, sym) + ' saved', T.neutral, 'work to the weekly figure, not the monthly one. Monthly planning hides a bad week until the bad week.', 70),
        sres('Safety floor', cash(floorLine, sym), T.neutral, 'keep at least two weeks of essentials in the account at all times. Below that, one delayed payment becomes a crisis.', 65),
        docr('Month by month', rows.join('\n') + (months > 18 ? '\n... months ' + num(19, 0) + '-' + num(months, 0) + ' follow the same pattern' : '')),
        res('Budget the break', 'put the money for a broken laptop, a cancelled course and a replacement textbook in a separate pot. Mixing it with the monthly budget is how a surprise becomes a debt.', T.warn),
        res('Income timing is not monthly', 'part-time wages, a bursary paid once, and family support arriving in one lump all break the monthly average. Plan against the date the money lands.', T.neutral),
        res('The two-account rule', 'one account for the term, one for the annual costs. Students who mix them spend the annual money in week three and borrow it back in week twenty.', T.good),
      ]
    },
  },
  {
    id: 'daily-expense-tracker-finance',
    name: 'Daily Expense Tracker',
    archetype: 'log',
    subject: SUBJECT,
    blurb: 'Totals your real spending by category, projects it to the month, and flags the entries that are probably mistakes.',
    tip: 'Track for seven days, honestly, including the small purchases. The small purchases are usually 60% of the total and they are the ones you can actually change.',
    usage: ['Enter one line per expense as item | amount | category.', 'Check the category totals and the projection.', 'Fix the flagged entries, then re-run.'],
    method: ['Lines are parsed into item, amount and category.', 'Totals are grouped by category and by day.', 'Large outliers and the month projection are reported.'],
    fields: [
      txt('entries', 'Expenses as item | amount | category', 16, 'Coffee | 4.50 | food\nBus ticket | 2.75 | transport\nTextbook second hand | 22 | course\nLunch | 8.20 | food\nMonthly bus pass | 46 | transport\nShampoo and soap | 11.40 | hygiene\nStreaming subscription | 12.99 | subscriptions\nBirthday gift | 30 | social'),
      n('days', 'Days these entries cover', { def: 7, min: 1, max: 90, step: 1 }),
      sel('currency', 'Currency', CURRENCY_OPTIONS, '$ USD'),
    ],
    compute: (v) => {
      const sym = symbol(asSel(v.currency))
      const raw = lines(asStr(v.entries))
      const items: { name: string; amt: number; cat: string }[] = []
      const broken: string[] = []
      raw.forEach((l) => {
        const p = l.split(/\s*\|\s*/)
        const amtRaw = p.length > 1 ? p[1].replace(/[^0-9.]/g, '') : ''
        const amt = parseFloat(amtRaw)
        if (isNaN(amt) || amt <= 0) {
          broken.push(l)
          return
        }
        items.push({ name: (p[0] || 'untitled').replace(/^\s*[-*]\s*/, '').trim(), amt, cat: (p[2] || 'uncategorised').trim().toLowerCase() })
      })
      if (items.length < 2) return [sres('Tracker', 'Add at least two lines as "item | amount | category"', T.warn, 'the vertical bar separates the three parts', 10)]
      const days = clamp(Math.round(asNum(v.days)) || 7, 1, 90)
      const total = items.reduce((s, i) => s + i.amt, 0)
      const cats = new Map<string, number>()
      items.forEach((i) => cats.set(i.cat, (cats.get(i.cat) || 0) + i.amt))
      const catRows = Array.from(cats.entries()).sort((a, b) => b[1] - a[1])
      const perDay = total / days
      const monthly = perDay * 30.4
      const med = median(items.map((i) => i.amt))
      const outliers = items.filter((i) => med > 0 && i.amt > med * 8)
      const uncategorised = items.filter((i) => i.cat === 'uncategorised')
      const biggest = items.slice().sort((a, b) => b.amt - a.amt)[0]
      const subs = items.filter((i) => /subscription|membership|plan|premium|gym/.test(i.name + ' ' + i.cat))
      return [
        sres('Total tracked', cash(total, sym), T.neutral, num(items.length, 0) + ' expenses over ' + num(days, 0) + ' days', clamp(100 - Math.max(0, (items.length < days * 2 ? 20 : 0)), 5, 100)),
        sres('Daily average', cash(perDay, sym), perDay > 20 ? T.warn : T.good, perDay > 20 ? 'a high daily average usually means one category is running away, not that everything is expensive' : 'a sustainable rate if it holds', clamp(100 - Math.max(0, perDay - 20) * 3, 5, 100)),
        sres('Projected month', cash(monthly, sym), monthly > 1200 ? T.bad : monthly > 700 ? T.warn : T.good, 'this rate across 30.4 days. Compare it against your bank statement, not against what you think you spend.', clamp(Math.min(100, (900 / Math.max(1, monthly)) * 100), 5, 100)),
        sres('Largest expense', biggest.name + ' at ' + cash(biggest.amt, sym), biggest.amt > total * 0.3 ? T.warn : T.neutral, num((biggest.amt / total) * 100, 0) + '% of everything tracked' + (outliers.length ? '. Possible mistakes: ' + outliers.map((o) => o.name).join(', ') : ''), clamp(100 - (biggest.amt / total) * 100, 5, 100)),
        sres('Small purchases', num(items.filter((i) => i.amt < 5).length, 0) + ' under ' + cash(5, sym) + ' totalling ' + cash(items.filter((i) => i.amt < 5).reduce((s, i) => s + i.amt, 0), sym), items.filter((i) => i.amt < 5).reduce((s, i) => s + i.amt, 0) > total * 0.3 ? T.warn : T.good, items.filter((i) => i.amt < 5).reduce((s, i) => s + i.amt, 0) > total * 0.3 ? 'small purchases are over 30% of the total, which is the usual pattern and also the easiest to change' : 'small purchases are not dominating, so the problem is elsewhere', clamp(100 - (items.filter((i) => i.amt < 5).reduce((s, i) => s + i.amt, 0) / total) * 100, 5, 100)),
        sres('Subscriptions found', num(subs.length, 0), subs.length > 2 ? T.warn : T.good, subs.length ? subs.map((o) => o.name).join(', ') + '. Open each one and check the last time you used it.' : 'none in this sample, which is worth confirming monthly', subs.length > 2 ? 50 : 90),
        sres('Uncategorised', uncategorised.length ? num(uncategorised.length, 0) + ' item(s)' : 'none', uncategorised.length ? T.warn : T.good, uncategorised.length ? 'add a third field so these roll into a category' : 'every entry has a category', uncategorised.length ? 55 : 100),
        broken.length ? sres('Could not read', num(broken.length, 0) + ' line(s)', T.bad, 'no amount was found on: ' + broken.slice(0, 3).join(' | '), 25) : sres('Could not read', 'none', T.good, 'every line had a readable amount', 100),
        docr('By category', catRows.map(([c, a]) => c.padEnd(16) + String(cash(a, sym)).padStart(10) + '   ' + Math.round((a / total) * 100) + '%').join('\n')),
        docr('Every entry', items.map((i) => (i.amt.toFixed(2) + '  ').padStart(10) + i.name.padEnd(28) + i.cat).join('\n')),
        res('Seven days is enough', 'a week of honest entries, including the days you spent nothing worth mentioning, produces a usable baseline. Three months produces a personality profile.', T.neutral),
        res('Cash distorts the record', 'card spending is logged by you, cash is not. If you use cash for anything significant, count what is in your wallet at the start and end of the week.', T.warn),
        res('Fix one category, not nine', 'pick the largest category and cut it by 20%. Nine small reductions will not survive contact with a bad week.', T.good),
      ]
    },
  },
  {
    id: 'education-cost-calculator-finance',
    name: 'Course Cost Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Works out the true cost of a course, including the years you are not earning, and compares it against studying while working.',
    tip: 'The tuition fee is the part you can see. The lost earnings, the travel home and the final-year equipment are larger, and they are the part nobody budgets for.',
    usage: ['Set the course length and the fees.', 'Add living costs, travel and equipment.', 'Compare against the earn-while-you-study option.'],
    method: ['Direct costs and indirect costs are separated.', 'The net cost of studying full time is compared with working.', 'Contingency and cost per week are reported.'],
    fields: [
      sel('currency', 'Currency', CURRENCY_OPTIONS, '$ USD'),
      n('years', 'Years of study', { def: 3, min: 1, max: 7, step: 1 }),
      n('fees', 'Tuition per year', { def: 6000, min: 0, max: 200000, step: 100 }),
      n('living', 'Living costs per year', { def: 11000, min: 0, max: 200000, step: 100 }),
      n('travel', 'Travel and relocation, total', { def: 1200, min: 0, max: 100000, step: 50 }),
      n('equipment', 'Equipment and books, total', { def: 1500, min: 0, max: 100000, step: 50 }),
      n('wage', 'What you could earn per year', { def: 0, min: 0, max: 200000, step: 500 }),
      n('partTime', 'What you can earn while studying, per year', { def: 3500, min: 0, max: 200000, step: 100 }),
    ],
    compute: (v) => {
      const sym = symbol(asSel(v.currency))
      const years = clamp(Math.round(asNum(v.years)) || 3, 1, 7)
      const fees = Math.max(0, asNum(v.fees)) * years
      const living = Math.max(0, asNum(v.living)) * years
      const travel = Math.max(0, asNum(v.travel))
      const kit = Math.max(0, asNum(v.equipment))
      const direct = fees + living + travel + kit
      const wage = Math.max(0, asNum(v.wage))
      const partTime = Math.max(0, asNum(v.partTime))
      const contingency = direct * 0.08
      const total = direct + contingency
      const foregone = wage * years
      const netAfterPartTime = total - partTime * years
      const workingYears = years
      const workingNet = wage * workingYears
      const weeks = years * 52
      const costPerWeek = total / Math.max(1, weeks)
      const comparison = [
        'STUDY FULL TIME',
        '  fees          ' + cash(fees, sym),
        '  living        ' + cash(living, sym),
        '  travel + kit  ' + cash(travel + kit, sym),
        '  contingency   ' + cash(contingency, sym),
        '  TOTAL COST    ' + cash(total, sym),
        '  earned while studying ' + cash(partTime * years, sym),
        '  NET COST      ' + cash(netAfterPartTime, sym),
        '  foregone earnings    ' + cash(foregone, sym) + ' (not cash, but real)',
        '',
        'WORK INSTEAD, ' + num(workingYears, 0) + ' years',
        '  earned        ' + cash(workingNet, sym),
        '  less the part-time you lose ' + cash(partTime * years, sym),
        '  NET           ' + cash(workingNet - partTime * years, sym),
        '',
        'Gap to close    ' + cash(netAfterPartTime - (workingNet - partTime * years), sym),
      ].join('\n')
      const breakEvenWage = netAfterPartTime / Math.max(1, years)
      return [
        sres('Total cost', cash(total, sym), T.neutral, cash(fees, sym) + ' fees + ' + cash(living, sym) + ' living + ' + cash(kit + travel, sym) + ' kit and travel + ' + cash(contingency, sym) + ' contingency', clamp(100 - Math.max(0, ((fees + living) / Math.max(1, total) - 1) * 100), 5, 100)),
        sres('Cost per week', cash(costPerWeek, sym), T.neutral, 'across ' + num(weeks, 0) + ' weeks of study. Per week is the only figure that makes a course comparable to a job.', 70),
        sres('Net of what you earn', cash(netAfterPartTime, sym), partTime * years > total * 0.6 ? T.good : T.warn, 'after ' + cash(partTime * years, sym) + ' earned across the course', clamp(50 + (1 - (partTime * years) / Math.max(1, total)) * 50, 5, 100)),
        sres('Break-even salary', cash(breakEvenWage, sym) + ' a year', breakEvenWage > 28000 ? T.good : T.warn, 'a graduate role paying more than this makes the course pay back. Below it, the return depends entirely on the field, not on the course.', clamp(Math.min(100, (breakEvenWage / 40000) * 100), 5, 100)),
        sres('Foregone earnings', cash(foregone, sym), wage > 0 ? T.warn : T.neutral, wage > 0 ? 'what you gave up by not working. It is the largest number in this calculation and it never appears in the fees letter.' : 'set your wage to see this. The number is usually bigger than the fees.'),
        sres('Contingency', cash(contingency, sym), T.good, '8% for the unexpected: replacement kit, a second attempt at a module, a flight home that costs twice the quote.'),
        docr('Comparison', comparison),
        res('The honest comparison', 'comparing a course against working is not a moral judgement, it is arithmetic. Work out the salary that makes the course pay back in ten years, then check whether that salary exists in the field you are choosing.', T.neutral),
        res('Payback, not payback on fees', 'divide the net cost by the difference between the graduate salary and what you would otherwise earn. Two years of payback is comfortable, seven is a gamble.', T.warn),
        res('Cheaper is not always cheaper', 'a cheaper course with no placement or network can cost more than an expensive one, because the salary difference dominates everything else in this calculation.', T.neutral),
      ]
    },
  },
  {
    id: 'tuition-fee-calculator-finance',
    name: 'Tuition Fee Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb: 'Turns credits, fees, scholarships and instalments into the figure you will actually be invoiced, including interest on deferred payment.',
    tip: 'Check whether the fee is per credit or per year before you plan anything. Students routinely estimate their bill on the wrong basis and are surprised twice.',
    usage: ['Choose the fee structure and enter the credits.', 'Add scholarships and any international surcharge.', 'Set the payment plan and the interest rate.'],
    method: ['The fee is computed from the chosen structure.', 'Scholarships, bursaries and surcharges are applied in order.', 'Instalments are costed with interest where payment is deferred.'],
    fields: [
      sel('currency', 'Currency', CURRENCY_OPTIONS, '$ USD'),
      sel('structure', 'Fee structure', ['Per credit', 'Flat per year', 'Flat per term', 'Tiered by credits'], 'Per credit'),
      n('credits', 'Credits this year', { def: 120, min: 0, max: 720, step: 10 }),
      n('perCredit', 'Fee per credit', { def: 45, min: 0, max: 10000, step: 1 }),
      n('flat', 'Flat fee per period', { def: 6000, min: 0, max: 200000, step: 100 }),
      n('fixed', 'Fixed fees and levies', { def: 450, min: 0, max: 50000, step: 10 }),
      n('scholarship', 'Scholarships and bursaries', { def: 1500, min: 0, max: 200000, step: 50 }),
      n('surcharge', 'International surcharge', { def: 0, min: 0, max: 200000, step: 100 }),
      n('rate', 'Interest on deferred payment (%)', { def: 6, min: 0, max: 40, step: 0.5 }),
      n('installments', 'Number of instalments', { def: 3, min: 1, max: 24, step: 1 }),
    ],
    compute: (v) => {
      const sym = symbol(asSel(v.currency))
      const structure = asSel(v.structure)
      const credits = Math.max(0, asNum(v.credits))
      const perCredit = Math.max(0, asNum(v.perCredit))
      const flat = Math.max(0, asNum(v.flat))
      const fixed = Math.max(0, asNum(v.fixed))
      const scholarship = Math.max(0, asNum(v.scholarship))
      const surcharge = Math.max(0, asNum(v.surcharge))
      const rate = Math.max(0, asNum(v.rate))
      const k = clamp(Math.round(asNum(v.installments)) || 3, 1, 24)
      let base = 0
      if (structure === 'Per credit') base = credits * perCredit
      else if (structure === 'Flat per year') base = flat
      else if (structure === 'Flat per term') base = flat * 3
      else {
        const bands: { upTo: number; rate: number }[] = [
          { upTo: 60, rate: 1 },
          { upTo: 120, rate: 1.15 },
          { upTo: 180, rate: 1.3 },
          { upTo: 720, rate: 1.5 },
        ]
        const band = bands.filter((b) => credits <= b.upTo)[0] || bands[bands.length - 1]
        base = credits * perCredit * band.rate
      }
      const gross = base + fixed + surcharge
      const net = Math.max(0, gross - scholarship)
      const discount = gross > 0 ? (scholarship / gross) * 100 : 0
      const perInstallment = net / k
      const interest = rate > 0 && k > 1 ? net * ((rate / 100) * (k / 12)) * 0.5 : 0
      const table = [
        'fee basis        ' + String(cash(base, sym)).padStart(12) + '   ' + structure,
        'fixed fees       ' + String(cash(fixed, sym)).padStart(12),
        'surcharge        ' + String(cash(surcharge, sym)).padStart(12),
        'GROSS            ' + String(cash(gross, sym)).padStart(12),
        'awards           ' + String('-' + cash(scholarship, sym)).padStart(12) + '   ' + num(discount, 1) + '% of gross',
        'NET PAYABLE      ' + String(cash(net, sym)).padStart(12),
        'instalments      ' + String(cash(perInstallment, sym)).padStart(12) + '   x ' + num(k, 0),
        'interest if deferred ' + String(cash(interest, sym)).padStart(12) + '   at ' + num(rate, 1) + '%',
        'net total        ' + String(cash(net + interest, sym)).padStart(12),
      ].join('\n')
      const perCreditEffective = credits > 0 ? net / credits : 0
      return [
        sres('Net fee', cash(net, sym), T.neutral, cash(gross, sym) + ' gross less ' + cash(scholarship, sym) + ' of awards' + (discount > 20 ? '. That is a large reduction: check the renewal conditions now, not in year three.' : ''), clamp(100 - discount * 2, 5, 100)),
        sres('Effective cost per credit', cash(perCreditEffective, sym), perCreditEffective > perCredit * 1.2 ? T.warn : T.good, 'after awards, per credit. Compare it across institutions before comparing headline fees.', clamp(100 - Math.max(0, (perCreditEffective / Math.max(1, perCredit) - 1) * 100), 5, 100)),
        sres('Per instalment', cash(perInstallment, sym) + ' x ' + num(k, 0), T.neutral, 'the amount leaving your account each time' + (k > 6 ? '. Six or more instalments usually costs more in total interest and takes longer than the course needs.' : '.'), k > 6 ? 50 : 85),
        sres('Cost of paying later', cash(interest, sym), rate > 0 ? T.bad : T.good, rate > 0 ? 'approximate financing cost of spreading ' + cash(net, sym) + ' over ' + num(k, 0) + ' instalments at ' + num(rate, 1) + '%. Interest charged on a student loan you do not need is the most common avoidable debt.' : 'no interest charged, so spreading the payment is free', rate > 0 ? 30 : 95),
        sres('Awards ratio', num(discount, 1) + '%', discount >= 15 ? T.good : discount > 0 ? T.neutral : T.warn, discount >= 15 ? 'a strong award package. Check whether it is renewable and what the renewal criteria are.' : discount > 0 ? 'a modest award. Ask about the bursary and hardship funds you have not applied for.' : 'no awards applied for. Bursaries and hardship schemes are frequently unadvertised.', discount >= 15 ? 90 : discount > 0 ? 60 : 35),
        docr('Fee breakdown', table),
        res('Read the small print on the award', 'scholarships are conditional on grades, attendance and sometimes on not working. A renewal condition you did not read is the same as no award at all.', T.warn),
        res('Pay on time even if it hurts', 'late payment fees and interest on a missed instalment cost more than almost anything else you can cut from your budget. If money is short, talk to the bursar before the date, not after.', T.bad),
        res('Ask for the total, not the rate', 'institutions publish a rate. What you need is the total after awards and surcharges, which is the only number that compares between courses.', T.neutral),
      ]
    },
  },
  {
    id: 'semester-cost-calculator-finance',
    name: 'Semester Cost Planner',
    archetype: 'timeline',
    subject: SUBJECT,
    blurb: 'Builds a week-by-week cash curve for one term, so you can see the week you run out rather than discovering it.',
    tip: 'The first three weeks of term are the most expensive and the students who run out are always caught by the same thing: a start-of-term lump they budgeted for in a different month.',
    usage: ['Set the term length and your available cash.', 'Add the one-off costs at the start of term.', 'Read the weekly curve and the thinnest week.'],
    method: ['Weekly living costs are combined with dated one-off costs.', 'A running balance is projected across the term.', 'The lowest point and its week are reported.'],
    fields: [
      sel('currency', 'Currency', CURRENCY_OPTIONS, '$ USD'),
      n('weeks', 'Weeks in the term', { def: 12, min: 4, max: 30, step: 1 }),
      n('cash', 'Cash available at the start', { def: 1200, min: 0, max: 200000, step: 50 }),
      n('weekly', 'Weekly living cost', { def: 90, min: 0, max: 10000, step: 5 }),
      n('books', 'Books and course kit', { def: 250, min: 0, max: 20000, step: 10 }),
      n('deposit', 'Deposit and first rent', { def: 450, min: 0, max: 50000, step: 50 }),
      n('travelHome', 'Travel home over the term', { def: 120, min: 0, max: 10000, step: 20 }),
      n('printing', 'Printing and project costs', { def: 60, min: 0, max: 5000, step: 10 }),
    ],
    compute: (v) => {
      const sym = symbol(asSel(v.currency))
      const weeks = clamp(Math.round(asNum(v.weeks)) || 12, 4, 30)
      const cashStart = Math.max(0, asNum(v.cash))
      const weekly = Math.max(0, asNum(v.weekly))
      const books = Math.max(0, asNum(v.books))
      const deposit = Math.max(0, asNum(v.deposit))
      const travel = Math.max(0, asNum(v.travelHome))
      const printing = Math.max(0, asNum(v.printing))
      const termCost = weekly * weeks + books + deposit + travel + printing
      const rows: string[] = []
      let bal = cashStart - deposit - books
      let low = bal
      let lowWeek = 0
      for (let w = 1; w <= weeks; w++) {
        const extras = (travel / Math.max(1, Math.floor(weeks / 3)) && w % Math.max(1, Math.floor(weeks / 3)) === 0 ? travel / Math.max(1, Math.floor(weeks / 3)) : 0) + (w === Math.ceil(weeks / 2) ? printing : 0)
        bal -= weekly + extras
        if (bal < low) {
          low = bal
          lowWeek = w
        }
        rows.push('week ' + String(w).padStart(2, '0') + '   out ' + String(cash(weekly + extras, sym)).padStart(9) + '   balance ' + String(cash(bal, sym)).padStart(11) + (extras > 0 ? '   (includes term costs)' : ''))
      }
      const perWeekAll = termCost / Math.max(1, weeks)
      const safeWeekly = cashStart / Math.max(1, weeks) - (books + deposit) / Math.max(1, weeks)
      return [
        sres('Term cost', cash(termCost, sym), termCost <= cashStart ? T.good : T.bad, cash(weekly, sym) + ' a week for ' + num(weeks, 0) + ' weeks plus ' + cash(books + deposit + travel + printing, sym) + ' of one-off costs', termCost <= cashStart ? 90 : 25),
        sres('Lowest point', cash(low, sym) + ' in week ' + num(lowWeek, 0), low >= 0 ? T.good : T.bad, low >= 0 ? 'you stay solvent all term' : 'you go negative in week ' + num(lowWeek, 0) + '. Either raise the start cash by ' + cash(-low, sym) + ' or cut the weekly figure to ' + cash(Math.max(0, safeWeekly), sym) + '.', low >= 0 ? 90 : 20),
        sres('Real weekly cost', cash(perWeekAll, sym), T.neutral, 'all costs spread evenly, which is the number to compare against other students with. The weekly figure alone is misleading.'),
        sres('Safe weekly spend', cash(Math.max(0, safeWeekly), sym), safeWeekly >= weekly ? T.good : T.warn, 'what you can spend each week if you also have to cover the start-of-term lump sums', clamp(100 - Math.max(0, (1 - safeWeekly / Math.max(1, weekly)) * 100), 5, 100)),
        docr('Week by week', rows.join('\n')),
        res('The term is not uniform', 'the graph of spending over a term has spikes at the start, at the halfway project deadline and at reading week. Three spikes in twelve weeks is why a fixed weekly transfer fails.', T.warn),
        res('Keep one week in reserve', 'a single unexpected cost, and term has several, is survivable with one week of money in the account and impossible without it.', T.good),
        res('Travel home is a budget line', 'the trip home is real money spent in a term where the other spending is low, so it gets forgotten. Put it in the term budget or it comes out of the following week.', T.neutral),
      ]
    },
  },
  {
    id: 'scholarship-calculator-finance',
    name: 'Scholarship Value Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Prices a scholarship correctly: amount, probability, application cost and your time, then reports the net outcome.',
    tip: 'The question is not whether a scholarship is worth applying for. Almost all of them are. The question is which three, because application time is the scarce resource.',
    usage: ['Enter the award amount and your realistic chance.', 'Add the application cost and the hours each one takes.', 'Compare the expected value against the deadline.'],
    method: ['Expected value is amount multiplied by probability.', 'Application cost is money plus time at a stated rate.', 'Break-even probability and a ranked shortlist are produced.'],
    fields: [
      sel('currency', 'Currency', CURRENCY_OPTIONS, '$ USD'),
      n('award', 'Award amount', { def: 2000, min: 0, max: 200000, step: 50 }),
      n('chance', 'Your realistic chance of winning (%)', { def: 25, min: 0, max: 100, step: 1 }),
      n('tuition', 'Tuition this year', { def: 6000, min: 0, max: 200000, step: 100 }),
      n('appFee', 'Cost per application', { def: 0, min: 0, max: 5000, step: 5 }),
      n('apps', 'Applications you will submit', { def: 6, min: 1, max: 60, step: 1 }),
      n('hours', 'Hours per application', { def: 3, min: 0, max: 40, step: 0.5 }),
      n('hourly', 'What your time is worth per hour', { def: 12, min: 0, max: 500, step: 1 }),
    ],
    compute: (v) => {
      const sym = symbol(asSel(v.currency))
      const award = Math.max(0, asNum(v.award))
      const chance = clamp(asNum(v.chance), 0, 100) / 100
      const tuition = Math.max(0, asNum(v.tuition))
      const appFee = Math.max(0, asNum(v.appFee))
      const apps = clamp(Math.round(asNum(v.apps)) || 6, 1, 60)
      const hours = Math.max(0, asNum(v.hours))
      const hourly = Math.max(0, asNum(v.hourly))
      const timeCost = hours * hourly
      const perApp = appFee + timeCost
      const ev = award * chance - perApp
      const breakEven = perApp > 0 && award > 0 ? (perApp / award) * 100 : 0
      const totalCost = perApp * apps
      const totalEv = ev * apps
      const tuitionShare = tuition > 0 ? (award / tuition) * 100 : 0
      const pAny = 1 - Math.pow(1 - chance, apps)
      const awardsToCover = award > 0 ? Math.ceil(tuition / award) : 99
      const ranked = [
        { label: 'Value per application', value: cash(ev, sym) },
        { label: 'Cost of the whole shortlist', value: cash(totalCost, sym) },
        { label: 'Expected return on the shortlist', value: cash(totalEv, sym) },
        { label: 'Hours invested', value: num(apps * hours, 0) + ' h' },
      ]
      return [
        sres('Expected value per application', cash(ev, sym), ev > 0 ? T.good : T.bad, cash(award * chance, sym) + ' expected award less ' + cash(perApp, sym) + ' cost' + (ev < 0 ? '. On these numbers, applying loses money in expectation. That is still not a reason to skip it - see below.' : '.'), ev > 0 ? clamp(Math.min(100, 40 + ev * 2), 5, 100) : clamp(100 + ev * 4, 5, 95)),
        sres('Break-even chance', num(breakEven, 1) + '%', chance * 100 >= breakEven ? T.good : T.warn, 'apply only if your chance is above this. Below it, the time is better spent on applications with better odds.', clamp(chance * 100 - breakEven + 50, 5, 100)),
        sres('Share of tuition', num(tuitionShare, 0) + '%', tuitionShare >= 30 ? T.good : tuitionShare > 0 ? T.neutral : T.warn, tuitionShare >= 30 ? 'this award would cover a serious share of your fees' : 'a small award against your fees. Multiple small awards compound; one large one does not exist for most students.', clamp(tuitionShare * 2, 5, 100)),
        sres('Shortlist of ' + num(apps, 0), cash(totalEv, sym), totalEv > 0 ? T.good : T.bad, cash(totalCost, sym) + ' spent on ' + num(apps, 0) + ' applications, ' + num(apps * hours, 0) + ' hours of work, returning about ' + cash(totalEv, sym) + ' in expectation', totalEv > 0 ? 85 : 30),
        sres('Chance of at least one award', num(pAny * 100, 1) + '%', pAny > 0.5 ? T.good : T.warn, 'submitting ' + num(apps, 0) + ' applications at ' + num(chance, 0) + '% each gives ' + num(pAny * 100, 1) + '% odds of winning at least one. Concentration beats volume: the same hours in four good applications beat eight generic ones.', clamp(pAny * 100, 5, 100)),
        sres('Awards needed to cover tuition', num(awardsToCover, 0), awardsToCover <= 2 ? T.good : awardsToCover <= 5 ? T.warn : T.bad, awardsToCover <= 5 ? 'achievable with a small shortlist if you target schemes you have a real chance at' : 'no student wins ' + num(awardsToCover, 0) + ' separate scholarships. Build a package instead: one big merit award, one need-based bursary, one departmental award, one hardship fund.', clamp(100 - Math.max(0, awardsToCover - 2) * 12, 5, 100)),
        docr('Valuation', ranked.map((r) => r.label.padEnd(30) + r.value).join('\n')),
        res('Negative expectation is normal', 'most scholarship applications have a low chance and are correctly worth applying for, because the downside is your time and the upside is a year of fees. Judge the shortlist, not the single application.', T.neutral),
        res('Three good ones beat ten bad ones', 'a tailored application to a scheme you have a real chance at is worth more than five generic ones. The generic ones also damage your other applications if the same writing is reused.', T.warn),
        res('The real return is the form', 'many of these applications ask you to write about your goals, your finances and your reasons. That document is the asset, and it is reusable for bursaries, hardship funds and graduate schemes.', T.good),
      ]
    },
  },
  {
    id: 'scholarship-eligibility-checklist-finance',
    name: 'Scholarship Eligibility Audit',
    archetype: 'checklist',
    subject: SUBJECT,
    blurb: 'Checks you against the criteria scholarships actually use, and tells you which single gap is disqualifying you.',
    tip: 'Most scholarships are won on criteria, not on the essay. Find the two criteria that would exclude you before you spend an evening writing.',
    usage: ['Enter your grades, income, age and status.', 'Tick what you already have.', 'Read the pass, unknown and fail columns, then fix the fails.'],
    method: ['A criterion table is evaluated against your answers.', 'Each criterion returns pass, fail or unknown.', 'The disqualifying gaps are ranked.'],
    fields: [
      n('gpa', 'Your grade average', { def: 3.2, min: 0, max: 4.3, step: 0.1 }),
      n('gpaScale', 'Scale the grade is out of', { def: 4, min: 1, max: 10, step: 0.5 }),
      n('income', 'Household income per year', { def: 24000, min: 0, max: 1000000, step: 500 }),
      n('age', 'Your age', { def: 20, min: 15, max: 70, step: 1 }),
      sel('level', 'Level of study', ['Foundation', 'Undergraduate', 'Masters', 'Doctoral'], 'Undergraduate'),
      sel('residency', 'Residency', ['Home country', 'International', 'Refugee or displaced'], 'Home country'),
      n('credits', 'Credits completed', { def: 90, min: 0, max: 720, step: 10 }),
      ck('have', 'What you already have', ['Leadership role or record', 'Volunteering or community work', 'Paid work alongside study', 'Competition or academic award', 'Published writing or research', 'Disability or access needs documented', 'Care responsibilities', 'Care leaver or first generation status']),
      sel('discipline', 'Field of study', ['STEM', 'Health', 'Education', 'Arts and humanities', 'Business', 'Social sciences', 'Any field'], 'Any field'),
    ],
    compute: (v) => {
      const gpa = Math.max(0, asNum(v.gpa))
      const scale = Math.max(1, asNum(v.gpaScale))
      const pctGpa = clamp((gpa / scale) * 100, 0, 100)
      const income = Math.max(0, asNum(v.income))
      const age = Math.max(15, asNum(v.age))
      const level = asSel(v.level)
      const residency = asSel(v.residency)
      const credits = Math.max(0, asNum(v.credits))
      const discipline = asSel(v.discipline)
      const have = [
        'Leadership role or record',
        'Volunteering or community work',
        'Paid work alongside study',
        'Competition or academic award',
        'Published writing or research',
        'Disability or access needs documented',
        'Care responsibilities',
        'Care leaver or first generation status',
      ]
      const hv = asBoolList(v.have)
      const has = have.filter((_, i) => hv[i])
      interface Rule {
        name: string
        status: 'pass' | 'fail' | 'unknown'
        note: string
      }
      const rules: Rule[] = []
      rules.push({ name: 'Academic threshold (usually 60% or a 3.0 average)', status: pctGpa >= 60 ? 'pass' : 'fail', note: pctGpa >= 75 ? 'well clear of the usual threshold' : pctGpa >= 60 ? 'clear of the usual threshold' : 'below the usual threshold. This is the hardest gap to fix in the short term, so find schemes without one.' })
      rules.push({ name: 'Age limit', status: age <= 25 ? 'pass' : age <= 30 ? 'unknown' : 'fail', note: age <= 25 ? 'inside the standard undergraduate limit' : age <= 30 ? 'many postgraduate and mature-student schemes go to 30 or 35' : 'most undergraduate schemes exclude you; postgraduate and mature schemes usually do not' })
      rules.push({ name: 'Level of study matches the scheme', status: 'pass', note: 'you are applying as ' + level.toLowerCase() + '. Match the level when you search, because a masters scheme will not accept an undergraduate application.' })
      rules.push({ name: 'Residency or international eligibility', status: residency === 'International' ? 'unknown' : 'pass', note: residency === 'International' ? 'many schemes are home-country only, and international students are often excluded by nationality. Filter before you write.' : 'home-country applicants are the default assumption for most schemes' })
      rules.push({ name: 'Financial need threshold', status: income > 0 ? 'unknown' : 'fail', note: 'enter your household income to see if you sit inside a means-tested band. Needs-tested schemes are where the money is, and they are the least advertised.' })
      rules.push({ name: 'Progress or credits completed', status: credits > 0 ? 'pass' : 'fail', note: credits > 0 ? num(credits, 0) + ' credits completed, which satisfies most second-year or later requirements' : 'no credits yet. First-year and foundation schemes are your realistic target this year.' })
      rules.push({ name: 'Evidence of activity beyond grades', status: has.length >= 2 ? 'pass' : has.length === 1 ? 'unknown' : 'fail', note: has.length >= 2 ? num(has.length, 0) + ' ticked: ' + has.slice(0, 3).join(', ') + (has.length > 3 ? ' and more' : '') : has.length === 1 ? 'one item is thin. Almost every essay prompt asks for two or three examples, so start collecting a second now.' : 'none ticked, and this is the criterion most often used to rank equally qualified applicants. It is also the most fixable: one term of activity changes it.' })
      rules.push({ name: 'Field matches the scheme', status: discipline === 'Any field' ? 'unknown' : 'pass', note: discipline === 'Any field' ? 'open schemes are competitive; field-specific schemes are far easier, so search by discipline rather than by keyword' : discipline + ' schemes are the ones worth your time' })
      rules.push({ name: 'References and documentation ready', status: 'unknown', note: 'assume you need one academic reference, a statement of purpose, and proof of income or residency. Collect them before the deadline you are targeting.' })
      const pass = rules.filter((r) => r.status === 'pass')
      const fails = rules.filter((r) => r.status === 'fail')
      const unknown = rules.filter((r) => r.status === 'unknown')
      const score = Math.round((pass.length / rules.length) * 100)
      const table = rules.map((r) => (r.status === 'pass' ? '[PASS] ' : r.status === 'fail' ? '[FAIL] ' : '[?]    ') + r.name.padEnd(46) + r.note).join('\n')
      return [
        sres('Readiness', num(score, 0) + '%', fails.length === 0 ? T.good : fails.length > 2 ? T.bad : T.warn, num(pass.length, 0) + ' clear, ' + num(unknown.length, 0) + ' unknown, ' + num(fails.length, 0) + ' failing out of ' + num(rules.length, 0) + ' criteria', clamp(score, 5, 100)),
        sres('Hard fails', num(fails.length, 0), fails.length === 0 ? T.good : T.bad, fails.length ? fails.map((f) => f.name).join('; ') + '. Every one of these excludes you before anyone reads your essay.' : 'nothing disqualifies you outright, which means the essay and the competition decide it', fails.length ? clamp(100 - fails.length * 25, 5, 95) : 95),
        sres('Unknowns to resolve', num(unknown.length, 0), unknown.length > 3 ? T.warn : T.good, unknown.length ? 'check these against the specific scheme: ' + unknown.slice(0, 3).map((u) => u.name.toLowerCase()).join('; ') + (unknown.length > 3 ? '; and the rest' : '') : 'nothing unresolved', unknown.length > 3 ? 55 : 85),
        sres('Grade position', num(pctGpa, 0) + '% (' + num(gpa, 1) + ' of ' + num(scale, 1) + ')', pctGpa >= 70 ? T.good : pctGpa >= 60 ? T.neutral : T.bad, pctGpa >= 70 ? 'competitive almost everywhere' : pctGpa >= 60 ? 'meets the standard threshold' : 'below the standard threshold, so target schemes without a grade requirement', clamp(pctGpa, 5, 100)),
        sres('Evidence on file', num(has.length, 0) + ' of ' + num(have.length, 0), has.length >= 3 ? T.good : has.length >= 2 ? T.warn : T.bad, has.length ? has.join(', ') : 'nothing ticked. The applicants with no evidence lose to the applicants with a year of it, regardless of grades.', clamp(has.length * 18, 5, 100)),
        docr('Criteria audit', table),
        res('Criteria first, essay second', 'spend the first hour checking eligibility and the second writing. Applications fail on criteria far more often than on prose, and the prose is the part people spend all the time on.', T.warn),
        res('The unknown column is your job', 'most of what is unknown here can be resolved in twenty minutes by reading one funding page. Do that before you write a word.', T.neutral),
        res('Keep an eligibility spreadsheet', 'date, amount, criteria met, criteria missing, deadline, outcome. Schemes change every year, and the same application recurs next year with different criteria.', T.good),
      ]
    },
  },
  {
    id: 'student-loan-calculator-finance',
    name: 'Student Loan Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Works out how much you actually need to borrow, what it costs to repay, and whether the debt is sane against the salary that follows.',
    tip: 'Borrow the gap between the cost and the money you actually have. Students who borrow the fee and then spend the difference on living end up with debt and no discipline.',
    usage: ['Enter the costs and everything you can contribute.', 'Set the interest rate and the repayment term.', 'Read the monthly payment, the total repaid and the sanity check.'],
    method: ['Net need is costs less savings, aid and earnings.', 'Repayment is costed with standard amortisation.', 'The monthly payment is compared with expected post-study income.'],
    fields: [
      sel('currency', 'Currency', CURRENCY_OPTIONS, '$ USD'),
      n('tuition', 'Tuition fees', { def: 6000, min: 0, max: 200000, step: 100 }),
      n('living', 'Living costs', { def: 10000, min: 0, max: 200000, step: 100 }),
      n('aid', 'Grants and bursaries', { def: 2000, min: 0, max: 200000, step: 100 }),
      n('savings', 'Your savings', { def: 800, min: 0, max: 200000, step: 50 }),
      n('earnings', 'What you can earn while studying', { def: 3000, min: 0, max: 200000, step: 100 }),
      n('rate', 'Interest rate per year (%)', { def: 6.5, min: 0, max: 40, step: 0.1 }),
      n('years', 'Years until you start repaying', { def: 1, min: 0, max: 10, step: 1 }),
      n('term', 'Repayment term in years', { def: 10, min: 1, max: 40, step: 1 }),
      n('salary', 'Expected salary after graduation', { def: 32000, min: 0, max: 500000, step: 500 }),
    ],
    compute: (v) => {
      const sym = symbol(asSel(v.currency))
      const tuition = Math.max(0, asNum(v.tuition))
      const living = Math.max(0, asNum(v.living))
      const aid = Math.max(0, asNum(v.aid))
      const savings = Math.max(0, asNum(v.savings))
      const earnings = Math.max(0, asNum(v.earnings))
      const rate = Math.max(0, asNum(v.rate))
      const years = clamp(Math.round(asNum(v.years)) || 1, 0, 10)
      const termYears = clamp(Math.round(asNum(v.term)) || 10, 1, 40)
      const salary = Math.max(0, asNum(v.salary))
      const cost = tuition + living
      const available = aid + savings + earnings
      const need = Math.max(0, cost - available)
      const months = termYears * 12
      const deferred = years > 0 ? need * (1 + (rate / 100) * years) : need
      const plan = emi(deferred, rate, months)
      const monthlyGross = salary / 12
      const share = monthlyGross > 0 ? (plan.pay / monthlyGross) * 100 : 99
      const totalCost = plan.total
      const perYearBorrowing = years > 0 ? need / years : need
      const over = perYearBorrowing > tuition * 0.9 && tuition > 0
      const table = [
        'cost of the course      ' + String(cash(cost, sym)).padStart(12),
        'grants and bursaries    ' + String('-' + cash(aid, sym)).padStart(12),
        'your savings            ' + String('-' + cash(savings, sym)).padStart(12),
        'your earnings           ' + String('-' + cash(earnings, sym)).padStart(12),
        'AMOUNT TO BORROW        ' + String(cash(need, sym)).padStart(12),
        '',
        years > 0 ? 'deferred ' + num(years, 0) + ' year(s) at ' + num(rate, 1) + '%  ' + String(cash(deferred - need, sym)).padStart(12) : 'no deferral',
        'borrowed after deferral ' + String(cash(deferred, sym)).padStart(12),
        'monthly repayment       ' + String(cash(plan.pay, sym)).padStart(12) + '   x ' + num(months, 0),
        'total interest          ' + String(cash(plan.interest, sym)).padStart(12),
        'total repaid            ' + String(cash(totalCost, sym)).padStart(12),
        '',
        'salary after graduation ' + String(cash(salary, sym)).padStart(12) + ' a year',
        'repayment as share      ' + String(num(Math.min(99, share), 1) + '%').padStart(12) + ' of gross monthly',
      ].join('\n')
      return [
        sres('Amount to borrow', cash(need, sym), need > 0 ? T.neutral : T.good, 'cost ' + cash(cost, sym) + ' less ' + cash(available, sym) + ' you already have. This is the number to compare against the loan offer on the table.', clamp(100 - Math.max(0, (available / Math.max(1, cost) - 1) * 100), 5, 100)),
        sres('Monthly repayment', cash(plan.pay, sym), share > 12 ? T.bad : share > 8 ? T.warn : T.good, share > 12 ? num(share, 1) + '% of your expected gross monthly salary, which is above the rule of thumb of 8 to 10%' : num(share, 1) + '% of expected gross monthly salary, inside the 8 to 10% rule of thumb', clamp(Math.min(100, (10 / Math.max(0.1, share)) * 100), 5, 100)),
        sres('Total interest', cash(plan.interest, sym), plan.interest / Math.max(1, deferred) > 0.4 ? T.bad : T.neutral, plan.interest / Math.max(1, deferred) > 0.4 ? 'more than 40% of what you borrowed is interest. Shorten the term or the rate is too high.' : 'interest added over ' + num(termYears, 0) + ' years of repayment', clamp(100 - (plan.interest / Math.max(1, deferred)) * 150, 5, 100)),
        sres('Total repaid', cash(totalCost, sym), T.neutral, cash(deferred, sym) + ' borrowed becomes ' + cash(totalCost, sym) + ' over ' + num(months, 0) + ' payments', 60),
        sres('Deferred interest', years > 0 ? cash(deferred - need, sym) : 'none', years > 0 ? T.warn : T.good, years > 0 ? years + ' year(s) of deferral at ' + num(rate, 1) + '% cost you this before you make a single payment. Interest capitalised during study is the most expensive money in a student plan.' : 'no deferral period', years > 0 ? 45 : 95),
        sres('Borrowing per year', cash(perYearBorrowing, sym), over ? T.warn : T.good, over ? 'higher than your tuition, which means the loan is being used for living costs. That is legitimate, but it should be a deliberate decision with a number attached, not a drift.' : 'at or below your tuition, which is the defensible position', clamp(100 - Math.max(0, (perYearBorrowing / Math.max(1, tuition) - 0.9) * 100), 5, 100)),
        docr('Loan summary', table),
        res('Borrow the gap, not the fee', 'the discipline that keeps student debt manageable is one line: borrow the difference between the cost and the money you have. The rest is a budget problem, not a finance problem.', T.warn),
        res('Over-borrowing is common and quiet', 'it happens because the extra cash arrives at the same time as the flexibility to spend it. A separate account with a standing order to savings is the whole intervention.', T.bad),
        res('Income-driven repayment may be better', 'if the monthly payment on a 10-year term is more than 8% of your salary, an income-driven plan ties it to what you earn and caps the monthly amount. Check whether your provider offers one before you sign.', T.neutral),
      ]
    },
  },
  {
    id: 'education-loan-emi-calculator-finance',
    name: 'Loan Repayment Calculator',
    archetype: 'conv',
    subject: SUBJECT,
    blurb: 'Computes the monthly payment, the total interest and what a different rate or term would cost you.',
    tip: 'Two variables decide the total: the rate and the years. A small increase in years is usually cheaper than a small increase in rate, and it is much easier to negotiate.',
    usage: ['Enter the loan amount, rate and term.', 'Read the monthly payment and the total interest.', 'Compare the sensitivity rows before you sign.'],
    method: ['Payments use the standard amortisation formula.', 'Interest is separated from principal over the life of the loan.', 'A rate and term sensitivity grid is produced.'],
    fields: [
      sel('currency', 'Currency', CURRENCY_OPTIONS, '$ USD'),
      n('principal', 'Loan amount', { def: 12000, min: 0, max: 1000000, step: 100 }),
      n('rate', 'Annual interest rate (%)', { def: 7, min: 0, max: 40, step: 0.25 }),
      n('months', 'Repayment term in months', { def: 120, min: 6, max: 480, step: 6 }),
      n('fees', 'Arrangement and setup fees', { def: 0, min: 0, max: 50000, step: 25 }),
    ],
    compute: (v) => {
      const sym = symbol(asSel(v.currency))
      const principal = Math.max(0, asNum(v.principal))
      const rate = Math.max(0, asNum(v.rate))
      const months = clamp(Math.round(asNum(v.months)) || 120, 6, 480)
      const fees = Math.max(0, asNum(v.fees))
      const borrowed = principal + fees
      const plan = emi(borrowed, rate, months)
      const firstYearInterest = borrowed * (rate / 100) * (plan.pay > 0 ? 1 - Math.pow(1 + rate / 100 / 12, -12) : 0)
      const interestRatio = plan.interest / Math.max(1, borrowed)
      const rates = [Math.max(0, rate - 1), rate, rate + 1, rate + 3]
      const terms = [Math.max(6, Math.round(months * 0.6)), months, Math.min(480, Math.round(months * 1.4))]
      const grid: string[] = []
      terms.forEach((tm) => {
        const label = (tm / 12).toFixed(1) + ' yr'
        grid.push(label.padEnd(9) + rates.map((r) => {
          const p = emi(borrowed, r, tm)
          return (cash(p.pay, sym) + ' / ' + cash(p.interest, sym)).padStart(22)
        }).join(''))
      })
      const header = 'payment / interest'.padEnd(9) + rates.map((r) => (num(r, 2) + '%').padStart(22)).join('')
      const shorter = emi(borrowed, rate, Math.round(months * 0.7))
      const cheaperRate = emi(borrowed, Math.max(0, rate - 1), months)
      return [
        sres('Monthly payment', cash(plan.pay, sym), T.neutral, 'on ' + cash(borrowed, sym) + ' over ' + num(months, 0) + ' months at ' + num(rate, 2) + '%', clamp(100 - Math.max(0, (rate - 5) * 8), 5, 100)),
        sres('Total interest', cash(plan.interest, sym), interestRatio > 0.6 ? T.bad : interestRatio > 0.35 ? T.warn : T.good, (interestRatio * 100).toFixed(0) + '% of the amount borrowed. You repay ' + cash(plan.total, sym) + ' in total.', clamp(100 - interestRatio * 120, 5, 100)),
        sres('First-year interest', cash(firstYearInterest, sym), firstYearInterest > plan.pay * 2 ? T.warn : T.neutral, 'interest in year one alone. Early repayments are worth more than late ones because they remove later interest as well as this.'),
        sres('Effect of a 1% lower rate', cash(cheaperRate.interest, sym) + ' total interest', cheaperRate.interest < plan.interest ? T.good : T.neutral, 'saving ' + cash(plan.interest - cheaperRate.interest, sym) + ' over the life of the loan, with the same payment length. Worth spending an hour on to find.'),
        sres('Effect of a shorter term', cash(shorter.pay, sym) + ' a month', shorter.pay > plan.pay ? T.warn : T.neutral, 'paying ' + cash(shorter.pay - plan.pay, sym) + ' more a month saves ' + cash(plan.interest - shorter.interest, sym) + ' in interest, if the extra monthly amount is affordable.', shorter.interest < plan.interest ? 80 : 55),
        docr('Sensitivity grid', header + '\n' + grid.join('\n')),
        docr('Summary', 'borrowed        ' + cash(borrowed, sym) + (fees > 0 ? ' (including ' + cash(fees, sym) + ' of fees)' : '') + '\nmonthly         ' + cash(plan.pay, sym) + '\ntotal interest  ' + cash(plan.interest, sym) + '\ntotal repaid    ' + cash(plan.total, sym) + '\nrate            ' + num(rate, 2) + '%\nterm            ' + num(months, 0) + ' months'),
        res('Year one is the expensive year', 'interest in the first twelve months can exceed the principal reduction, and it is charged on the full balance. Paying above the minimum early is the cheapest saving available.', T.warn),
        res('Term over rate', 'going from 10 years to 14 saves more interest than going from 7% to 6% in most ranges, and the longer term is far easier to negotiate. Start there before shopping around.', T.neutral),
        res('Never borrow for a deposit you can earn', 'debt at 7% is not repaid by money earning 2% in an account. Borrow only for things that raise your earning power, and pay cash for the rest.', T.bad),
      ]
    },
  },
  {
    id: 'hostel-cost-calculator-finance',
    name: 'Accommodation Cost Calculator',
    archetype: 'bdown',
    subject: SUBJECT,
    blurb: 'Compares halls, a shared flat, living at home and a private room on the numbers, including bills and the summer you are not there.',
    tip: 'The cheapest room is not always the cheapest year. A nine-month contract leaves three months of rent with nowhere to sleep, and that gap is where student budgets quietly fail.',
    usage: ['Enter the cost of each option you are considering.', 'Set the number of people sharing and weeks per year.', 'Read the annual totals and the summer gap.'],
    method: ['Rent, bills, food and travel are combined per option.', 'Contract length and void periods are costed.', 'The options are ranked on total annual cost.'],
    fields: [
      sel('currency', 'Currency', CURRENCY_OPTIONS, '$ USD'),
      n('hallsRent', 'Halls rent per week', { def: 130, min: 0, max: 5000, step: 5 }),
      n('hallsBills', 'Halls bills per week', { def: 22, min: 0, max: 2000, step: 1 }),
      n('flatRent', 'Shared flat rent per month', { def: 750, min: 0, max: 20000, step: 25 }),
      n('flatBills', 'Flat bills and internet per month', { def: 140, min: 0, max: 2000, step: 5 }),
      n('homeCost', 'Living at home per month', { def: 300, min: 0, max: 10000, step: 10 }),
      n('privateRent', 'Private room per month', { def: 1100, min: 0, max: 20000, step: 25 }),
      n('flatmates', 'People sharing the flat', { def: 3, min: 1, max: 8, step: 1 }),
      n('weeks', 'Weeks per year you pay for', { def: 40, min: 10, max: 52, step: 1 }),
      n('food', 'Food per month', { def: 220, min: 0, max: 5000, step: 10 }),
      n('travel', 'Travel home per term', { def: 60, min: 0, max: 5000, step: 10 }),
    ],
    compute: (v) => {
      const sym = symbol(asSel(v.currency))
      const hallsRent = Math.max(0, asNum(v.hallsRent))
      const hallsBills = Math.max(0, asNum(v.hallsBills))
      const flatRent = Math.max(0, asNum(v.flatRent))
      const flatBills = Math.max(0, asNum(v.flatBills))
      const homeCost = Math.max(0, asNum(v.homeCost))
      const privateRent = Math.max(0, asNum(v.privateRent))
      const flatmates = clamp(Math.round(asNum(v.flatmates)) || 3, 1, 8)
      const weeks = clamp(Math.round(asNum(v.weeks)) || 40, 10, 52)
      const food = Math.max(0, asNum(v.food))
      const travel = Math.max(0, asNum(v.travel))
      const terms = 3
      const travelYear = travel * terms
      const hallsAnnual = (hallsRent + hallsBills) * weeks + food + travelYear
      const flatAnnual = ((flatRent + flatBills) / flatmates) * 12 + food + travelYear
      const homeAnnual = homeCost * 12 + food * 0.5 + travelYear
      const privateAnnual = privateRent * 12 + flatBills + food + travelYear
      const voidWeeks = Math.max(0, 52 - weeks)
      const hallsGap = (hallsRent + hallsBills) * voidWeeks
      const allRows: [string, number][] = [
        ['Halls', hallsAnnual],
        ['Shared flat', flatAnnual],
        ['Live at home', homeAnnual],
        ['Private room', privateAnnual],
      ]
      const rows = allRows.slice().sort((a, b) => a[1] - b[1])
      const cheapest = rows[0]
      const perWeekAll = (x: number) => x / 52
      return [
        sres('Cheapest option', cheapest[0] + ' at ' + cash(cheapest[1], sym) + ' a year', T.good, 'over 52 weeks, including food, bills and three trips home', clamp(100 - Math.max(0, ((cheapest[1] / Math.max(1, rows[rows.length - 1][1]) - 1) * 100)), 5, 100)),
        sres('Halls', cash(hallsAnnual, sym), hallsAnnual === cheapest[1] ? T.good : T.neutral, cash(hallsRent + hallsBills, sym) + ' a week for ' + num(weeks, 0) + ' paid weeks' + (voidWeeks > 0 ? ', and the ' + num(voidWeeks, 0) + '-week summer void costs you nothing, which is worth ' + cash(hallsGap, sym) + '. You still have to sleep somewhere in July, though.' : '')),
        sres('Shared flat', cash(flatAnnual, sym), flatAnnual === cheapest[1] ? T.good : T.neutral, 'split ' + num(flatmates, 0) + ' ways: ' + cash((flatRent + flatBills) / flatmates, sym) + ' a month each, 12 months' + (flatmates >= 4 ? '. Four or more sharers means the quietest room is the one nobody wants.' : '')),
        sres('Live at home', cash(homeAnnual, sym), homeAnnual === cheapest[1] ? T.good : T.neutral, cash(homeCost, sym) + ' a month, with food halved to ' + cash(food * 0.5, sym) + '. The hidden cost is travel time, not rent.'),
        sres('Private room', cash(privateAnnual, sym), privateAnnual === cheapest[1] ? T.good : T.neutral, cash(privateRent, sym) + ' a month plus your own bills. Solitude has a price and it is this number.'),
        sres('Summer gap', voidWeeks + ' weeks', voidWeeks > 8 ? T.warn : T.good, 'you pay for ' + num(weeks, 0) + ' weeks and live for 52. Budget the void explicitly: summer storage, a sublet application, or a job that pays for itself.', voidWeeks > 8 ? 45 : 85),
        docr('Comparison', rows.map(([name, cost]) => name.padEnd(14) + String(cash(cost, sym)).padStart(11) + ' a year   ' + String(cash(perWeekAll(cost), sym)).padStart(9) + ' a week   ' + String(cash(cost / terms, sym)).padStart(10) + ' a term').join('\n') + '\n\nfood and travel are inside every figure above (' + cash(food, sym) + ' a month, ' + cash(travelYear, sym) + ' a year)'),
        res('Bills belong in the comparison', 'a room without bills is not a cheap room, it is a room with a second invoice. Put utilities, internet and water into every column or the comparison is meaningless.', T.warn),
        res('The quiet room is not free', 'in shared accommodation the cheapest room is the noisiest one, and sleep is the input to everything else you do. Pay for the quiet.', T.neutral),
        res('Twelve months versus nine', 'a 12-month flat costs more in summer than a 9-month contract, but a 9-month contract means finding somewhere for the summer anyway. Price the full year before choosing.', T.good),
      ]
    },
  },
  {
    id: 'study-abroad-budget-finance',
    name: 'Study Abroad Budget',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb: 'Builds a full-year budget in two currencies, checks the contingency, and lays out the monthly cash drawdown against your funding.',
    tip: 'Budget the year as it will be lived, including the weeks when nothing is happening and the first month when everything is. Exchange-rate movement and deposits are where these plans break.',
    usage: ['Enter the local costs and the exchange rate.', 'Set your funding mix.', 'Read the monthly drawdown and the buffer you need.'],
    method: ['Costs are converted at the given rate and grouped.', 'A contingency is applied on the variable portion.', 'Funding is matched against the monthly drawdown.'],
    fields: [
      sel('currency', 'Home currency', CURRENCY_OPTIONS, '$ USD'),
      n('tuitionLocal', 'Tuition for the year (local)', { def: 9000, min: 0, max: 500000, step: 100 }),
      n('rate', 'Local units per home unit', { def: 0.8, min: 0.01, max: 500, step: 0.01 }),
      n('living', 'Living costs per month (local)', { def: 900, min: 0, max: 200000, step: 25 }),
      n('flights', 'Flights, home and return (local)', { def: 1100, min: 0, max: 50000, step: 50 }),
      n('visa', 'Visa, insurance and fees (local)', { def: 700, min: 0, max: 50000, step: 25 }),
      n('setup', 'Setup costs before term starts (local)', { def: 900, min: 0, max: 50000, step: 25 }),
      n('scholarship', 'Scholarship, in home currency', { def: 1500, min: 0, max: 200000, step: 100 }),
      n('savings', 'Your savings, in home currency', { def: 3000, min: 0, max: 200000, step: 100 }),
      n('family', 'Family support, in home currency', { def: 1500, min: 0, max: 200000, step: 100 }),
      n('months', 'Months abroad', { def: 12, min: 1, max: 24, step: 1 }),
    ],
    compute: (v) => {
      const sym = symbol(asSel(v.currency))
      const rate = Math.max(0.01, asNum(v.rate))
      const months = clamp(Math.round(asNum(v.months)) || 12, 1, 24)
      const toHome = (x: number) => x / rate
      const tuitionHome = toHome(Math.max(0, asNum(v.tuitionLocal)))
      const livingHome = toHome(Math.max(0, asNum(v.living))) * months
      const flightsHome = toHome(Math.max(0, asNum(v.flights)))
      const visaHome = toHome(Math.max(0, asNum(v.visa)))
      const setupHome = toHome(Math.max(0, asNum(v.setup)))
      const variableBase = livingHome
      const contingency = (variableBase * 0.1 + flightsHome + visaHome + setupHome) * 0.08
      const total = tuitionHome + livingHome + flightsHome + visaHome + setupHome + contingency
      const funding = Math.max(0, asNum(v.scholarship)) + Math.max(0, asNum(v.savings)) + Math.max(0, asNum(v.family))
      const gap = total - funding
      const buffer = toHome(Math.max(0, asNum(v.living))) * 2
      const rows: string[] = []
      let run = setupHome + flightsHome + visaHome
      for (let m = 1; m <= Math.min(months, 24); m++) {
        const out = toHome(Math.max(0, asNum(v.living))) + (m === 1 ? 0 : contingency / months)
        run += out
        rows.push('month ' + String(m).padStart(2, '0') + '   spend ' + String(cash(out, sym)).padStart(10) + '   cumulative ' + String(cash(run, sym)).padStart(12))
      }
      const monthOne = tuitionHome + setupHome + flightsHome + visaHome + livingHome + contingency / Math.max(1, months)
      return [
        sres('Total cost', cash(total, sym), T.neutral, 'converted at ' + num(rate, 2) + ' local per home unit, including ' + cash(contingency, sym) + ' of contingency', clamp(100 - Math.max(0, (contingency / Math.max(1, total) - 0.08) * 200), 5, 100)),
        sres('Funding gap', cash(gap, sym), gap <= 0 ? T.good : T.bad, gap <= 0 ? 'you have ' + cash(-gap, sym) + ' more than the year costs' : 'you are ' + cash(gap, sym) + ' short. The realistic sources are a bursary, more savings over the next two terms, or a cheaper city.', gap <= 0 ? clamp(100 + gap, 5, 100) : clamp(100 - gap * 3, 5, 95)),
        sres('Month one is the heavy one', cash(monthOne, sym), monthOne > (total / Math.max(1, months)) * 1.5 ? T.warn : T.neutral, 'against an average of ' + cash(total / Math.max(1, months), sym) + ' a month, because tuition, deposits, flights, registration and the first month of living all land together', monthOne > (total / Math.max(1, months)) * 1.5 ? 45 : 75),
        sres('Cash buffer needed', cash(buffer, sym), funding >= buffer ? T.good : T.warn, 'two months of living held back for the visa delay, the lost deposit or the flight change. This is the amount that decides whether a bad month is an inconvenience or a crisis.', funding >= buffer ? 85 : 45),
        sres('Rate sensitivity', cash(total * 1.1, sym) + ' at 10% worse', T.warn, 'a 10% adverse move in the exchange rate adds ' + cash(total * 0.1, sym) + '. Set the money aside when the rate is good, not when it is bad.'),
        docr('Budget', 'tuition        ' + cash(tuitionHome, sym) + '\nliving         ' + cash(livingHome, sym) + '  (' + num(months, 0) + ' months)\nflights        ' + cash(flightsHome, sym) + '\nvisa + cover   ' + cash(visaHome, sym) + '\nsetup          ' + cash(setupHome, sym) + '\ncontingency    ' + cash(contingency, sym) + '\nTOTAL          ' + cash(total, sym) + '\n\nfunding        ' + cash(funding, sym) + '\n  scholarship  ' + cash(Math.max(0, asNum(v.scholarship)), sym) + '\n  savings      ' + cash(Math.max(0, asNum(v.savings)), sym) + '\n  family       ' + cash(Math.max(0, asNum(v.family)), sym) + '\nGAP            ' + cash(gap, sym)),
        docr('Monthly drawdown', rows.join('\n')),
        res('Convert at a pessimistic rate', 'budget with a rate 10% worse than today. If the plan only works at the rate you happen to get on the day you book, it is not a plan.', T.warn),
        res('The first month is three months', 'deposits, flights, registration, bedding and a first week of nothing knowing where anything is. Front-load the first month and the rest of the year relaxes.', T.bad),
        res('Know the deposit rules', 'deposit protection schemes differ by country and the difference is sometimes a month of rent. Check the small print before you sign, not after you move out.', T.neutral),
      ]
    },
  },
]

export const mod20: StudentSpec[] = CAPS
