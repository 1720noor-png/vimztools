import { useMemo, useState, type ChangeEvent } from 'react'
import { Calculator, Plus, Trash2 } from 'lucide-react'
import { TemplateShell, inputCls, btnGhostCls } from './TemplateShell'
import type { RegistryTool } from '../../lib/toolRegistry'

interface FieldDef {
  key: string
  label: string
  kind: 'number' | 'text' | 'date' | 'select'
  options?: Array<{ value: string; label: string }>
  suffix?: string
  placeholder?: string
}

interface RowDef {
  key: string
  label: string
  placeholder?: string
}

interface ResultItem {
  label: string
  value: string
  tone?: 'ok' | 'warn'
}

type Frame = 'finance' | 'marks' | 'rows' | 'ratio'

interface Family {
  id: string
  title: string
  hint: string
  frame: Frame
  fields: FieldDef[]
  rows?: RowDef[]
  rowAddLabel?: string
  rowEmptyText?: string
  compute: (values: Record<string, string>, rows: Array<Record<string, string>>) => ResultItem[]
}

const money = (n: number, digits = 2): string =>
  Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: digits }) : '—'

const num = (values: Record<string, string>, key: string): number => {
  const v = parseFloat(values[key] ?? '')
  return Number.isFinite(v) ? v : NaN
}

function req(a: number, b: number, c: number): boolean {
  return [a, b, c].every(Number.isFinite) && a > 0 && b > 0 && c > 0
}

function buildFamilies(tool: RegistryTool): Family[] {
  const name = tool.name
  const n = `${name} ${tool.description}`.toLowerCase()
  const has = (...words: string[]) => words.some((w) => n.includes(w))
  const families: Family[] = []

  // 1. Loan / EMI / mortgage
  families.push({
    id: 'loan_emi',
    title: 'Loan & EMI',
    hint: 'Estimate monthly EMI, total payable and interest cost.',
    frame: 'finance',
    fields: [
      { key: 'principal', label: 'Loan amount', kind: 'number', suffix: '$/₹' },
      { key: 'rate', label: 'Annual interest rate', kind: 'number', suffix: '%' },
      { key: 'years', label: 'Term', kind: 'number', suffix: 'years' },
    ],
    compute: (v) => {
      const p = num(v, 'principal')
      const pct = num(v, 'rate')
      const yr = num(v, 'years')
      if (!req(p, pct, yr)) return []
      const m = pct / 100 / 12
      const months = Math.round(yr * 12)
      const emi = m > 0 ? (p * m * Math.pow(1 + m, months)) / (Math.pow(1 + m, months) - 1) : p / months
      const total = emi * months
      return [
        { label: 'Monthly EMI', value: money(emi), tone: 'ok' },
        { label: 'Total payable', value: money(total) },
        { label: 'Total interest', value: money(total - p), tone: 'warn' },
      ]
    },
  })

  // 2. Savings / budget / debt payoff
  const savingsMode = has('debt payoff', 'payoff') ? 'debt' : has('savings', 'emergency fund') ? 'savings' : 'budget'
  families.push({
    id: 'savings_budget',
    title: savingsMode === 'debt' ? 'Debt payoff plan' : savingsMode === 'savings' ? 'Savings plan' : 'Budget planner',
    hint:
      savingsMode === 'debt'
        ? 'See how fast the debt clears and the interest saved.'
        : savingsMode === 'savings'
          ? 'Work out the monthly contribution needed to hit your goal.'
          : 'Balance income against expenses to see what is left.',
    frame: 'finance',
    fields:
      savingsMode === 'debt'
        ? [
            { key: 'balance', label: 'Current balance', kind: 'number', suffix: '$/₹' },
            { key: 'rate', label: 'Annual interest rate', kind: 'number', suffix: '%' },
            { key: 'payment', label: 'Monthly payment', kind: 'number', suffix: '$/₹' },
          ]
        : savingsMode === 'savings'
          ? [
              { key: 'target', label: 'Savings goal', kind: 'number', suffix: '$/₹' },
              { key: 'have', label: 'Already saved', kind: 'number', suffix: '$/₹' },
              { key: 'months', label: 'Months to reach it', kind: 'number' },
            ]
          : [
              { key: 'income', label: 'Monthly income', kind: 'number', suffix: '$/₹' },
              { key: 'fixed', label: 'Fixed expenses', kind: 'number', suffix: '$/₹' },
              { key: 'variable', label: 'Variable expenses', kind: 'number', suffix: '$/₹' },
            ],
    compute: (v) => {
      if (savingsMode === 'debt') {
        const bal = num(v, 'balance')
        const apr = num(v, 'rate')
        const pay = num(v, 'payment')
        if (!req(bal, pay, apr) && !(Number.isFinite(bal) && Number.isFinite(pay) && bal > 0 && pay > 0)) return []
        const m = (num(v, 'rate') || 0) / 100 / 12
        let remaining = bal
        let months = 0
        let interest = 0
        while (remaining > 0 && months < 1200) {
          const int = remaining * m
          interest += int
          remaining = remaining + int - pay
          months++
        }
        return [
          { label: 'Months to payoff', value: `${months}`, tone: 'ok' },
          { label: 'Total interest', value: money(interest) },
          { label: 'Total paid', value: money(months * pay), tone: 'warn' },
        ]
      }
      if (savingsMode === 'savings') {
        const target = num(v, 'target')
        const have = num(v, 'have') || 0
        const months = num(v, 'months')
        if (!Number.isFinite(target) || !Number.isFinite(months) || target <= 0 || months <= 0) return []
        return [
          { label: 'Monthly contribution', value: money((target - have) / months), tone: 'ok' },
          { label: 'Remaining to save', value: money(target - have) },
          { label: 'Percent done', value: `${Math.max(0, Math.min(100, Math.round((have / target) * 100)))}%` },
        ]
      }
      const income = num(v, 'income')
      const fixed = num(v, 'fixed') || 0
      const variable = num(v, 'variable') || 0
      if (!Number.isFinite(income) || income <= 0) return []
      const left = income - fixed - variable
      return [
        { label: 'Remaining each month', value: money(left), tone: left >= 0 ? 'ok' : 'warn' },
        { label: 'Expenses total', value: money(fixed + variable) },
        { label: 'Savings rate', value: income > 0 ? `${Math.max(0, Math.round((left / income) * 100))}%` : '—' },
      ]
    },
  })

  // 3. Gold / Zakat
  if (has('zakat')) {
    families.push({
      id: 'zakat',
      title: 'Zakat calculator',
      hint: 'Zakat is 2.5% of wealth above the nisab held for a lunar year.',
      frame: 'finance',
      fields: [{ key: 'wealth', label: 'Zakatable wealth', kind: 'number', suffix: '$/₹' }],
      compute: (v) => {
        const w = num(v, 'wealth')
        if (!Number.isFinite(w) || w <= 0) return []
        return [
          { label: 'Zakat due (2.5%)', value: money(w * 0.025), tone: 'ok' },
          { label: 'Wealth after Zakat', value: money(w * 0.975) },
        ]
      },
    })
  } else {
    families.push({
      id: 'gold',
      title: 'Gold value calculator',
      hint: 'Estimate gold value from weight, purity and price per gram.',
      frame: 'finance',
      fields: [
        { key: 'grams', label: 'Gold weight', kind: 'number', suffix: 'grams' },
        {
          key: 'purity',
          label: 'Purity',
          kind: 'select',
          options: [
            { value: '0.999', label: '24 karat (99.9%)' },
            { value: '0.916', label: '22 karat (91.6%)' },
            { value: '0.875', label: '21 karat (87.5%)' },
            { value: '0.75', label: '18 karat (75%)' },
          ],
        },
        { key: 'price', label: 'Price per gram (24k)', kind: 'number', suffix: '$/₹' },
      ],
      compute: (v) => {
        const grams = num(v, 'grams')
        const purity = parseFloat(v.purity || '0.999')
        const price = num(v, 'price')
        if (!Number.isFinite(grams) || !Number.isFinite(price) || grams <= 0) return []
        return [
          { label: 'Pure gold weight', value: `${money(grams * purity)} g` },
          { label: 'Estimated value', value: money(grams * purity * price), tone: 'ok' },
        ]
      },
    })
  }

  // 4. Tax estimator
  if (has('tax')) {
    families.push({
      id: 'tax',
      title: 'Tax estimator',
      hint: 'Approximate US federal income tax for a single filer.',
      frame: 'finance',
      fields: [{ key: 'income', label: 'Annual gross income', kind: 'number', suffix: '$' }],
      compute: (v) => {
        const income = num(v, 'income')
        if (!Number.isFinite(income) || income <= 0) return []
        const brackets = [
          { up: 11600, rate: 0.1 },
          { up: 47150, rate: 0.12 },
          { up: 100525, rate: 0.22 },
          { up: 191950, rate: 0.24 },
          { up: 243725, rate: 0.32 },
          { up: 609350, rate: 0.35 },
          { up: Infinity, rate: 0.37 },
        ]
        let tax = 0
        let prev = 0
        for (const b of brackets) {
          const cap = Math.min(income, b.up)
          if (cap > prev) tax += (cap - prev) * b.rate
          prev = b.up
          if (income <= b.up) break
        }
        return [
          { label: 'Estimated federal tax', value: money(tax), tone: 'warn' },
          { label: 'Effective rate', value: `${((tax / income) * 100).toFixed(1)}%` },
          { label: 'Approx. take-home', value: money(income - tax), tone: 'ok' },
        ]
      },
    })
  }

  // 5. Salary / hourly / freelance / overtime / leave / negotiation
  const salaryMode = has('overtime')
    ? 'overtime'
    : has('work hours')
      ? 'workhours'
      : has('leave balance')
        ? 'leave'
        : has('freelance rate')
          ? 'freelance'
          : has('negotiat')
            ? 'negotiation'
            : has('salary', 'hourly pay', 'income')
              ? 'salary'
              : 'hourly'
  families.push({
    id: 'salary_rates',
    title:
      salaryMode === 'overtime'
        ? 'Overtime pay'
        : salaryMode === 'leave'
          ? 'Leave balance'
          : salaryMode === 'freelance'
            ? 'Freelance rates'
            : salaryMode === 'negotiation'
              ? 'Salary negotiation'
              : salaryMode === 'workhours'
                ? 'Work hours calculator'
                : 'Income breakdown',
    hint:
      salaryMode === 'overtime'
        ? 'Overtime earnings with your multiplier.'
        : salaryMode === 'leave'
          ? 'Track remaining paid leave.'
          : salaryMode === 'freelance'
            ? 'Back into a daily / hourly rate from a target income.'
            : salaryMode === 'negotiation'
              ? 'Compare current and target salary.'
              : salaryMode === 'workhours'
                ? 'Total up your weekly and yearly hours, with optional pay.'
                : 'Break a salary or hourly rate into monthly and annual terms.',
    frame: 'finance',
    fields:
      salaryMode === 'overtime'
        ? [
            { key: 'rate', label: 'Hourly rate', kind: 'number', suffix: '$/₹' },
            { key: 'hours', label: 'Overtime hours', kind: 'number' },
            { key: 'mult', label: 'Multiplier', kind: 'number', suffix: '×' },
          ]
        : salaryMode === 'leave'
          ? [
              { key: 'total', label: 'Annual entitlement', kind: 'number', suffix: 'days' },
              { key: 'used', label: 'Days used', kind: 'number', suffix: 'days' },
            ]
          : salaryMode === 'freelance'
            ? [
                { key: 'income', label: 'Target annual income', kind: 'number', suffix: '$/₹' },
                { key: 'days', label: 'Billable days / year', kind: 'number' },
                { key: 'hours', label: 'Billable hours / day', kind: 'number' },
              ]
            : salaryMode === 'negotiation'
              ? [
                  { key: 'current', label: 'Current salary', kind: 'number', suffix: '$/₹' },
                  { key: 'target', label: 'Target salary', kind: 'number', suffix: '$/₹' },
                ]
              : salaryMode === 'workhours'
                ? [
                    { key: 'hours', label: 'Hours per day', kind: 'number' },
                    { key: 'days', label: 'Days per week', kind: 'number' },
                    { key: 'rate', label: 'Hourly rate (optional)', kind: 'number', suffix: '$/₹' },
                  ]
                : [
                    { key: 'annual', label: 'Annual salary', kind: 'number', suffix: '$/₹' },
                    { key: 'hours', label: 'Hours / week', kind: 'number' },
                  ],
    compute: (v) => {
      if (salaryMode === 'overtime') {
        const rate = num(v, 'rate')
        const hours = num(v, 'hours')
        const mult = num(v, 'mult') || 1.5
        if (![rate, hours].every(Number.isFinite) || hours <= 0) return []
        return [
          { label: 'Overtime pay', value: money(rate * hours * mult), tone: 'ok' },
          { label: 'Hours at multiplier', value: `${hours} × ${mult}` },
        ]
      }
      if (salaryMode === 'workhours') {
        const hours = num(v, 'hours')
        const days = num(v, 'days') || 5
        const rate = num(v, 'rate')
        if (!Number.isFinite(hours) || hours <= 0 || days <= 0) return []
        const weekly = hours * days
        if (!Number.isFinite(rate) || rate <= 0) {
          return [
            { label: 'Weekly hours', value: `${weekly}`, tone: 'ok' },
            { label: 'Monthly hours (avg)', value: `${money(weekly * 4.33, 1)}` },
            { label: 'Yearly hours', value: `${money(weekly * 52, 1)}` },
          ]
        }
        return [
          { label: 'Weekly pay', value: money(weekly * rate), tone: 'ok' },
          { label: 'Weekly hours', value: `${weekly}` },
          { label: 'Monthly pay (avg)', value: money(weekly * rate * 4.33) },
        ]
      }
      if (salaryMode === 'leave') {
        const total = num(v, 'total')
        const used = num(v, 'used') || 0
        if (!Number.isFinite(total) || total <= 0) return []
        const left = total - used
        return [
          { label: 'Leave remaining', value: `${money(left)} days`, tone: left >= 0 ? 'ok' : 'warn' },
          { label: 'Percent remaining', value: `${Math.max(0, Math.round((left / total) * 100))}%` },
        ]
      }
      if (salaryMode === 'freelance') {
        const income = num(v, 'income')
        const days = num(v, 'days') || 220
        const hours = num(v, 'hours') || 6
        if (!Number.isFinite(income) || income <= 0 || days <= 0 || hours <= 0) return []
        const day = income / days
        return [
          { label: 'Daily rate', value: money(day), tone: 'ok' },
          { label: 'Hourly rate', value: money(day / hours) },
          { label: 'Hours / year', value: `${money(days * hours)}` },
        ]
      }
      if (salaryMode === 'negotiation') {
        const cur = num(v, 'current')
        const tar = num(v, 'target')
        if (![cur, tar].every(Number.isFinite) || cur <= 0) return []
        return [
          { label: 'Raise percent', value: `${(((tar - cur) / cur) * 100).toFixed(1)}%`, tone: tar >= cur ? 'ok' : 'warn' },
          { label: 'Annual difference', value: money(tar - cur) },
          { label: 'Monthly difference', value: money((tar - cur) / 12) },
        ]
      }
      const annual = num(v, 'annual')
      const hours = num(v, 'hours') || 40
      if (!Number.isFinite(annual) || annual <= 0) return []
      const weekly = annual / 52
      return [
        { label: 'Hourly', value: money(weekly / hours), tone: 'ok' },
        { label: 'Weekly', value: money(weekly) },
        { label: 'Monthly', value: money(annual / 12) },
      ]
    },
  })

  // 6. Percentage / discount / markup / profit / tip
  const pctMode = has('discount', 'sale price') ? 'discount' : has('markup') ? 'markup' : has('profit') ? 'profit' : has('tip') ? 'tip' : 'percentage'
  families.push({
    id: 'percent_math',
    title:
      pctMode === 'discount'
        ? 'Discount & sale price'
        : pctMode === 'markup'
          ? 'Markup calculator'
          : pctMode === 'profit'
            ? 'Profit calculator'
            : pctMode === 'tip'
              ? 'Tip calculator'
              : 'Percentage calculator',
    hint:
      pctMode === 'discount'
        ? 'Find the final price after a discount.'
        : pctMode === 'markup'
          ? 'Selling price from cost and markup percent.'
          : pctMode === 'profit'
            ? 'Revenue minus cost, with margin.'
            : pctMode === 'tip'
              ? 'Tip amount and total bill.'
              : 'Compute a percentage of any value.',
    frame: 'finance',
    fields:
      pctMode === 'profit'
        ? [
            { key: 'revenue', label: 'Revenue', kind: 'number', suffix: '$/₹' },
            { key: 'cost', label: 'Cost', kind: 'number', suffix: '$/₹' },
          ]
        : [
            { key: 'base', label: pctMode === 'tip' ? 'Bill amount' : 'Original value', kind: 'number', suffix: '$/₹' },
            { key: 'pct', label: pctMode === 'markup' ? 'Markup' : 'Percentage', kind: 'number', suffix: '%' },
          ],
    compute: (v) => {
      if (pctMode === 'profit') {
        const rev = num(v, 'revenue')
        const cost = num(v, 'cost')
        if (![rev, cost].every(Number.isFinite) || rev <= 0) return []
        return [
          { label: 'Profit', value: money(rev - cost), tone: 'ok' },
          { label: 'Margin', value: `${(((rev - cost) / rev) * 100).toFixed(1)}%` },
        ]
      }
      const base = num(v, 'base')
      const pct = num(v, 'pct')
      if (![base, pct].every(Number.isFinite)) return []
      const amount = base * (pct / 100)
      const subtract = pctMode === 'discount'
      const add = pctMode === 'tip'
      return [
        { label: pctMode === 'tip' ? 'Tip amount' : 'Amount', value: money(amount), tone: 'ok' },
        {
          label: pctMode === 'tip' ? 'Total bill' : subtract ? 'Final price' : 'Result',
          value: money(add ? base + amount : subtract ? base - amount : base + amount),
        },
      ]
    },
  })

  // 7. GPA / CGPA / grade
  const gradeIsGpa = has('gpa', 'cgpa')
  families.push({
    id: 'grade_gpa',
    title: gradeIsGpa ? 'GPA / CGPA calculator' : 'Grade calculator',
    hint: gradeIsGpa
      ? 'Add subjects with grade points and credits for a weighted GPA; percentages alone give the average and letter grade.'
      : 'Enter percentage scores to see the average and letter grade.',
    frame: 'marks',
    fields: [],
    rows: gradeIsGpa
      ? [
          { key: 'course', label: 'Course / subject' },
          { key: 'grade', label: 'Grade point', placeholder: '0–4' },
          { key: 'credits', label: 'Credits', placeholder: 'e.g. 3' },
        ]
      : [
          { key: 'course', label: 'Course / subject' },
          { key: 'score', label: 'Score (%)' },
        ],
    rowAddLabel: gradeIsGpa ? 'Add subject' : 'Add score',
    rowEmptyText: gradeIsGpa ? 'Add at least one subject to compute your GPA.' : 'Add at least one score to see the average.',
    compute: (_v, rows) => {
      if (gradeIsGpa) {
        const valid = rows.filter((r) => Number.isFinite(parseFloat(r.grade)) && parseFloat(r.grade) > 0)
        if (!valid.length) return []
        let points = 0
        let credits = 0
        for (const r of valid) {
          const gp = parseFloat(r.grade) || 0
          const cr = parseFloat(r.credits) || 1
          points += gp * cr
          credits += cr
        }
        return [
          { label: 'Weighted GPA', value: (points / credits).toFixed(2), tone: 'ok' },
          { label: 'Credits attempted', value: String(credits) },
        ]
      }
      const scores = rows.map((r) => parseFloat(r.score)).filter(Number.isFinite)
      if (!scores.length) return []
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length
      const letter = avg >= 90 ? 'A' : avg >= 80 ? 'B' : avg >= 70 ? 'C' : avg >= 60 ? 'D' : 'F'
      return [
        { label: 'Average score', value: `${avg.toFixed(1)}%`, tone: 'ok' },
        { label: 'Letter grade', value: letter },
      ]
    },
  })

  // 8. Recipe scaler
  families.push({
    id: 'recipe_scale',
    title: 'Recipe scaler',
    hint: 'Scale the yield of a recipe to the number of servings you need.',
    frame: 'finance',
    fields: [
      { key: 'servings', label: 'Original servings', kind: 'number' },
      { key: 'want', label: 'Servings you want', kind: 'number' },
    ],
    compute: (v) => {
      const s = num(v, 'servings')
      const w = num(v, 'want')
      if (![s, w].every(Number.isFinite) || s <= 0 || w <= 0) return []
      return [
        { label: 'Scale factor', value: `× ${money(w / s, 3)}`, tone: 'ok' },
        { label: 'Hint', value: 'Multiply every ingredient by this factor.' },
      ]
    },
  })

  // 9. Recipe / grocery cost (itemized)
  families.push({
    id: 'item_cost',
    title: 'Cost estimator',
    hint: 'Add each item with its quantity, unit cost and unit, then total it all up.',
    frame: 'rows',
    fields: [],
    rows: [
      { key: 'name', label: 'Item', placeholder: 'e.g. Chicken (kg)' },
      { key: 'qty', label: 'Quantity', placeholder: 'e.g. 2' },
      { key: 'price', label: 'Unit cost', placeholder: 'e.g. 3.5' },
      { key: 'unit', label: 'Unit', placeholder: 'kg / g / pcs' },
    ],
    rowAddLabel: 'Add item',
    rowEmptyText: 'Add items to build the total cost.',
    compute: (_v, rows) => {
      let total = 0
      let count = 0
      for (const r of rows) {
        const qty = parseFloat(r.qty)
        const price = parseFloat(r.price)
        if (Number.isFinite(qty) && Number.isFinite(price) && qty > 0 && price >= 0) {
          total += qty * price
          count++
        }
      }
      if (!count) return []
      return [
        { label: 'Total cost', value: money(total), tone: 'ok' },
        { label: 'Items counted', value: String(count) },
      ]
    },
  })

  // 10. Bill splitter
  families.push({
    id: 'splitter',
    title: 'Bill splitter',
    hint: 'Split a bill evenly between a number of people.',
    frame: 'finance',
    fields: [
      { key: 'amount', label: 'Total amount', kind: 'number', suffix: '$/₹' },
      { key: 'people', label: 'People', kind: 'number' },
      { key: 'tip', label: 'Tip', kind: 'number', suffix: '%' },
    ],
    compute: (v) => {
      const amount = num(v, 'amount')
      const people = num(v, 'people')
      const tip = num(v, 'tip') || 0
      if (![amount, people].every(Number.isFinite) || amount <= 0 || people <= 0 || !Number.isInteger(people)) return []
      const total = amount * (1 + tip / 100)
      return [
        { label: 'Total with tip', value: money(total) },
        { label: 'Per person', value: money(total / people), tone: 'ok' },
      ]
    },
  })

  // 11. Bill / expense tracker (itemized recurring)
  families.push({
    id: 'pay_tracker',
    title: 'Bill & expense tracker',
    hint: 'List recurring bills with amounts and add them up.',
    frame: 'rows',
    fields: [],
    rows: [
      { key: 'name', label: 'Bill / expense' },
      { key: 'amount', label: 'Amount', placeholder: 'e.g. 45' },
    ],
    rowAddLabel: 'Add bill',
    rowEmptyText: 'Add bills to see the monthly total.',
    compute: (_v, rows) => {
      const amounts = rows.map((r) => parseFloat(r.amount)).filter(Number.isFinite)
      if (!amounts.length) return []
      const total = amounts.reduce((a, b) => a + b, 0)
      return [
        { label: 'Monthly total', value: money(total), tone: 'ok' },
        { label: 'Bills counted', value: String(amounts.length) },
      ]
    },
  })

  // 12. Ratio / ingredient converter
  if (has('ingredient', 'ratio', 'recipe') && has('substitut')) {
    families.push({
      id: 'ratio_substitute',
      title: 'Ingredient substitute',
      hint: 'Find a common substitute and its swap ratio for a missing ingredient.',
      frame: 'ratio',
      fields: [
        { key: 'amount', label: 'Amount you have', kind: 'number' },
        {
          key: 'from',
          label: 'Ingredient',
          kind: 'select',
          options: [
            { value: 'buttermilk', label: 'Buttermilk' },
            { value: 'butter', label: 'Butter' },
            { value: 'cornstarch', label: 'Cornstarch' },
            { value: 'eggs', label: 'Eggs' },
            { value: 'honey', label: 'Honey' },
            { value: 'sour cream', label: 'Sour cream' },
            { value: 'brown sugar', label: 'Brown sugar' },
            { value: 'vanilla', label: 'Vanilla extract' },
          ],
        },
      ],
      compute: (v) => {
        const amount = num(v, 'amount')
        if (!Number.isFinite(amount) || amount <= 0) return []
        const subs: Record<string, { label: string; ratio: number }> = {
          buttermilk: { label: 'milk + lemon juice (1 tbsp per cup of milk)', ratio: 1 },
          butter: { label: 'margarine or coconut oil', ratio: 1 },
          cornstarch: { label: 'all-purpose flour', ratio: 2 },
          eggs: { label: 'chia/water mix or ¼ cup applesauce', ratio: 0.25 },
          honey: { label: 'granulated sugar', ratio: 1.25 },
          'sour cream': { label: 'plain yogurt', ratio: 1 },
          'brown sugar': { label: 'granulated sugar + molasses', ratio: 1 },
          vanilla: { label: 'almond extract', ratio: 0.5 },
        }
        const s = subs[v.from] ?? subs.buttermilk
        return [
          { label: 'Use this instead', value: s.label },
          { label: 'Swap amount', value: `${money(amount * s.ratio, 2)} units`, tone: 'ok' },
        ]
      },
    })
  } else {
    families.push({
      id: 'ratio_preset',
      title: 'Ingredient / ratio converter',
      hint: 'Convert between ingredient measures using density-aware ratios.',
      frame: 'ratio',
      fields: [
        { key: 'amount', label: 'Amount', kind: 'number' },
        {
          key: 'from',
          label: 'From',
          kind: 'select',
          options: [
            { value: 'flour-cup', label: 'Cups of flour' },
            { value: 'sugar-cup', label: 'Cups of sugar' },
            { value: 'butter-cup', label: 'Cups of butter' },
            { value: 'liquid-cup', label: 'Cups of liquid' },
            { value: 'grams', label: 'Grams' },
            { value: 'ml', label: 'Milliliters' },
          ],
        },
        {
          key: 'to',
          label: 'To',
          kind: 'select',
          options: [
            { value: 'grams', label: 'Grams' },
            { value: 'tbsp', label: 'Tablespoons' },
            { value: 'tsp', label: 'Teaspoons' },
            { value: 'ml', label: 'Milliliters' },
          ],
        },
      ],
      compute: (v) => {
        const amount = num(v, 'amount')
        if (!Number.isFinite(amount) || amount <= 0) return []
        const gPerUnit: Record<string, number> = {
          'flour-cup': 120,
          'sugar-cup': 200,
          'butter-cup': 227,
          'liquid-cup': 240,
          grams: 1,
          ml: 0.95,
        }
        const grams = amount * (gPerUnit[v.from] ?? 120)
        const perG: Record<string, number> = { grams: 1, tbsp: 1 / 15, tsp: 1 / 5, ml: 1 / 0.95 }
        return [{ label: `= ${v.to ?? 'grams'}`, value: `${money(grams * (perG[v.to] ?? 1), 1)}`, tone: 'ok' }]
      },
    })
  }

  // 13. Currency converter
  const CURRENCIES = [
    { value: 'USD', label: 'USD · US Dollar' },
    { value: 'EUR', label: 'EUR · Euro' },
    { value: 'GBP', label: 'GBP · British Pound' },
    { value: 'JPY', label: 'JPY · Japanese Yen' },
    { value: 'INR', label: 'INR · Indian Rupee' },
    { value: 'PKR', label: 'PKR · Pakistani Rupee' },
    { value: 'AED', label: 'AED · UAE Dirham' },
    { value: 'CAD', label: 'CAD · Canadian Dollar' },
    { value: 'AUD', label: 'AUD · Australian Dollar' },
    { value: 'CNY', label: 'CNY · Chinese Yuan' },
    { value: 'SAR', label: 'SAR · Saudi Riyal' },
  ]
  families.push({
    id: 'currency_rate',
    title: 'Currency converter',
    hint: 'Convert amounts with a manual exchange rate (stays fully on-device).',
    frame: 'finance',
    fields: [
      { key: 'amount', label: 'Amount', kind: 'number' },
      { key: 'from', label: 'From', kind: 'select', options: CURRENCIES },
      { key: 'to', label: 'To', kind: 'select', options: CURRENCIES },
      { key: 'rate', label: '1 from = ? to', kind: 'number' },
    ],
    compute: (v) => {
      const amount = num(v, 'amount')
      const rate = num(v, 'rate')
      if (![amount, rate].every(Number.isFinite) || rate <= 0) return []
      return [
        { label: `${v.from ?? 'USD'} → ${v.to ?? 'USD'}`, value: `${money(amount * rate)} ${v.to ?? 'USD'}`, tone: 'ok' },
        { label: 'Exchange rate', value: `1 ${v.from ?? 'USD'} = ${money(rate)} ${v.to ?? 'USD'}` },
      ]
    },
  })

  // 14. Date duration
  if (has('date', 'duration', 'days between', 'calendar')) {
    families.push({
      id: 'date_duration',
      title: 'Date duration',
      hint: 'Find the span between two dates in days, weeks, months and years.',
      frame: 'finance',
      fields: [
        { key: 'start', label: 'Start date', kind: 'date' },
        { key: 'end', label: 'End date', kind: 'date' },
      ],
      compute: (v) => {
        const start = new Date(v.start)
        const end = new Date(v.end)
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return []
        const days = Math.round((end.getTime() - start.getTime()) / 86400000)
        return [
          { label: 'Days', value: String(days), tone: 'ok' },
          { label: 'Weeks', value: `${money(days / 7, 1)}` },
          { label: 'Months (avg)', value: `${money(days / 30.44, 1)}` },
          { label: 'Years', value: `${money(days / 365.25, 2)}` },
        ]
      },
    })
  }

  // Fallback: structured values list (no dedicated formula matched)
  families.push({
    id: 'values_list',
    title: 'Structured values',
    hint: 'Add the values you have and this form totals, averages and sorts them for you.',
    frame: 'rows',
    fields: [],
    rows: [
      { key: 'name', label: 'Value' },
      { key: 'amount', label: 'Number' },
    ],
    rowAddLabel: 'Add value',
    rowEmptyText: 'Add values to compute totals and averages.',
    compute: (_v, rows) => {
      const nums = rows.map((r) => parseFloat(r.amount)).filter(Number.isFinite)
      if (!nums.length) return []
      const total = nums.reduce((a, b) => a + b, 0)
      const sorted = [...nums].sort((a, b) => a - b)
      return [
        { label: 'Total', value: money(total), tone: 'ok' },
        { label: 'Average', value: money(total / nums.length) },
        { label: 'Smallest', value: money(sorted[0]) },
        { label: 'Largest', value: money(sorted[sorted.length - 1]) },
      ]
    },
  })

  return families
}

export function smartFamilyId(tool: RegistryTool): string {
  const n = `${tool.name} ${tool.description}`.toLowerCase()
  const has = (...words: string[]) => words.some((w) => n.includes(w))
  if (has('date between', 'days between', 'date range', 'date duration')) return 'date_duration'
  if (has('loan', 'emi', 'mortgage')) return 'loan_emi'
  if (has('tax')) return 'tax'
  if (has('salary', 'hourly pay', 'overtime', 'freelance rate', 'leave balance', 'work hours', 'negotiat', 'annual income')) return 'salary_rates'
  if (has('debt payoff', 'payoff') || has('savings', 'emergency fund', 'budget')) return 'savings_budget'
  if (has('zakat')) return 'zakat'
  if (has('gold')) return 'gold'
  if (has('percent', 'percentage', 'discount', 'markup', 'profit', 'tip', 'sale price')) return 'percent_math'
  if (has('gpa', 'cgpa', 'grade')) return 'grade_gpa'
  if (has('portion', 'serving') || (has('recipe') && has('scale', 'scaler'))) return 'recipe_scale'
  if (has('grocery cost', 'recipe cost', 'cost estimator', 'cost calculator')) return 'item_cost'
  if (has('split')) return 'splitter'
  if (has('bill', 'expense')) return 'pay_tracker'
  if (has('substitut')) return 'ratio_substitute'
  if (has('ingredient', 'ratio', 'conversion')) return 'ratio_preset'
  if (has('currency', 'exchange')) return 'currency_rate'
  return 'values_list'
}

export function pickFamily(tool: RegistryTool): Family {
  const id = smartFamilyId(tool)
  const all = buildFamilies(tool)
  const found = all.find((f) => f.id === id)
  if (found) return found
  const fallback = all.find((f) => f.id === 'values_list')
  return fallback ?? all[0]
}

function FamiliesForm({ family }: { family: Family }) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [rows, setRows] = useState<Array<Record<string, string>>>([])

  const set = (key: string) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setValues((p) => ({ ...p, [key]: e.target.value }))

  const updateRow = (i: number) => (e: ChangeEvent<HTMLInputElement>) =>
    setRows((p) => p.map((r, idx) => (idx === i ? { ...r, [e.target.name]: e.target.value } : r)))

  const addRow = () => setRows((p) => [...p, {}])
  const delRow = (i: number) => setRows((p) => p.filter((_, idx) => idx !== i))

  const results = useMemo(() => family.compute(values, rows), [family, values, rows])

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Inputs</h2>
        <div className="space-y-4">
          {family.fields.map((f) => (
            <label key={f.key} className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-500">{f.label}</span>
              <div className="flex items-center gap-2">
                {f.kind === 'select' ? (
                  <select className={inputCls} value={values[f.key] ?? ''} onChange={set(f.key)}>
                    <option value="">Select…</option>
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.kind === 'date' ? 'date' : 'number'}
                    className={inputCls}
                    value={values[f.key] ?? ''}
                    onChange={set(f.key)}
                    placeholder={f.placeholder}
                    step={f.kind === 'number' ? 'any' : undefined}
                  />
                )}
                {f.suffix && <span className="shrink-0 text-sm font-medium text-slate-400">{f.suffix}</span>}
              </div>
            </label>
          ))}

          {family.rows && (
            <div className="space-y-3">
              {rows.length === 0 && <p className="text-sm text-slate-400">{family.rowEmptyText}</p>}
              {rows.map((r, i) => (
                <div key={i} className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  {family.rows?.map((cd) => (
                    <label key={cd.key} className="min-w-[10rem] flex-1">
                      <span className="mb-1 block text-xs font-semibold text-slate-500">{cd.label}</span>
                      <input
                        name={cd.key}
                        value={r[cd.key] ?? ''}
                        onChange={updateRow(i)}
                        placeholder={cd.placeholder}
                        className={inputCls}
                      />
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={() => delRow(i)}
                    className="mb-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500 transition hover:border-rose-300 hover:text-rose-600"
                    aria-label="Remove row"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addRow} className={btnGhostCls}>
                <Plus className="h-4 w-4" /> {family.rowAddLabel ?? 'Add row'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Results</h2>
        {results.length ? (
          <ul className="space-y-2">
            {results.map((r) => (
              <li
                key={r.label}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                  r.tone === 'ok'
                    ? 'border-emerald-200 bg-emerald-50'
                    : r.tone === 'warn'
                      ? 'border-amber-200 bg-amber-50'
                      : 'border-slate-200 bg-slate-50'
                }`}
              >
                <span className="text-sm font-medium text-slate-600">{r.label}</span>
                <span
                  className={`text-base font-bold ${
                    r.tone === 'ok' ? 'text-emerald-700' : r.tone === 'warn' ? 'text-amber-700' : 'text-slate-800'
                  }`}
                >
                  {r.value}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <Calculator className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
            <p className="text-sm leading-relaxed text-slate-500">
              {family.rows && rows.length === 0
                ? (family.rowEmptyText ?? 'Enter your details above.')
                : 'Fill in the inputs above to see calculated results instantly.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export function SmartToolTemplate({ tool }: { tool: RegistryTool }) {
  const [familyPick, setFamilyPick] = useState<string | null>(null)
  const all = useMemo(() => buildFamilies(tool), [tool])
  const family = useMemo(() => {
    const matched = pickFamily(tool)
    return all.find((f) => f.id === (familyPick ?? matched.id)) ?? matched
  }, [all, familyPick, tool])

  return (
    <TemplateShell tool={tool} description={family.hint}>
      <div className="space-y-6">
        <FamiliesForm key={family.id} family={family} />
        {all.length > 1 && (
          <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
            {all.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFamilyPick(f.id)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  f.id === family.id
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-primary-300 hover:text-primary-600'
                }`}
              >
                {f.title}
              </button>
            ))}
          </div>
        )}
      </div>
    </TemplateShell>
  )
}