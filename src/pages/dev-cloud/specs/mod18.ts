import {
  asNum,
  asStr,
  fmtMoney,
  fmtNum,
  n,
  pctres,
  res,
  txt,
  type DevCloudSpec,
} from './devCloudSpec'

export const SUBJECT = 'Code Quality & Complexity'

export const MOD18_SPECS: DevCloudSpec[] = [
  {
    id: 'cyclomatic-complexity-estimator',
    name: 'McCabe Cyclomatic Code Complexity Scanner',
    subject: SUBJECT,
    blurb: 'Calculate cyclomatic complexity score by analyzing decision branches (`if`, `else if`, `for`, `while`, `switch case`, ternary operators, `&&`, `||`).',
    tip: 'Keep cyclomatic complexity under 10 per function; scores above 15 require urgent decomposition and have an exponentially higher defect rate.',
    usage: [
      'Paste your function or method code.',
      'Review calculated cyclomatic complexity score and branch count.',
      'Inspect maintainability rating and test coverage requirements.',
    ],
    method: [
      'McCabe formula: M = E - N + 2P (equivalent to 1 + decision points).',
      'Parses if, elif, for, while, case, catch, &&, ||, and ternary (? :) operators.',
    ],
    fields: [
      txt('code', 'Function Source Code', 'function processOrder(order, user) {\n  if (!order || !user) {\n    return null;\n  }\n  if (order.status === "pending") {\n    if (user.isVip && order.total > 100) {\n      applyDiscount(order, 0.15);\n    } else if (order.total > 50) {\n      applyDiscount(order, 0.05);\n    }\n  } else if (order.status === "cancelled") {\n    logCancellation(order);\n    return false;\n  }\n  return true;\n}', 10),
    ],
    compute: (v) => {
      const code = asStr(v, 'code', '')

      // Match decision points
      const patterns = [
        /\bif\b/g,
        /\belse\s+if\b/g,
        /\bfor\b/g,
        /\bwhile\b/g,
        /\bcase\b/g,
        /\bcatch\b/g,
        /&&/g,
        /\|\|/g,
        /\?(?![\.?])/g, // ternary
      ]

      let decisionPoints = 0
      for (const p of patterns) {
        const matches = code.match(p)
        if (matches) decisionPoints += matches.length
      }

      const complexity = 1 + decisionPoints

      let rating = 'Simple, Low Risk'
      let tone: 'good' | 'warn' | 'bad' = 'good'
      if (complexity > 20) {
        rating = 'Untestable, Extreme Risk'
        tone = 'bad'
      } else if (complexity > 10) {
        rating = 'Moderate Complexity, Needs Refactoring'
        tone = 'warn'
      }

      const minUnitTests = complexity

      return [
        res('Cyclomatic Complexity Score', `${complexity}`, tone, `1 baseline + ${decisionPoints} decision points`),
        res('Maintainability Rating', rating, tone),
        res('Min. Unit Tests Required', `${minUnitTests} test cases`, 'neutral', 'Required for 100% path coverage'),
        pctres('Refactoring Urgency', complexity > 10 ? 'High Refactor Priority' : 'Acceptable Architecture', Math.min(100, Math.round((complexity / 20) * 100)), tone),
      ]
    },
  },
  {
    id: 'technical-debt-interest-calculator',
    name: 'Technical Debt Financial & Engineering Velocity Sizer',
    subject: SUBJECT,
    blurb: 'Quantify the compounding time and financial cost of technical debt across engineering sprints and developer salaries.',
    tip: 'Teams spending >25% of sprint velocity fixing legacy debt bugs see an average 40% drop in new feature release frequency.',
    usage: [
      'Enter engineering team size and average developer annual salary.',
      'Enter estimated percentage of sprint time lost to tech debt friction.',
      'Inspect quarterly and annual debt interest cost in engineering dollars.',
    ],
    method: [
      'Annual Cost = Team_Size * Avg_Salary * Debt_Percentage.',
    ],
    fields: [
      n('teamSize', 'Engineering Team Size (Devs)', 12, 1, 500, 1),
      n('avgSalary', 'Average Annual Salary ($)', 135000, 30000, 400000, 5000),
      n('debtPct', 'Sprint Time Consumed by Tech Debt (%)', 25, 5, 80, 5),
    ],
    compute: (v) => {
      const devs = asNum(v, 'teamSize', 12)
      const salary = asNum(v, 'avgSalary', 135000)
      const pct = asNum(v, 'debtPct', 25) / 100

      const annualPayroll = devs * salary
      const annualDebtCost = annualPayroll * pct
      const quarterlyDebtCost = annualDebtCost / 4
      const hoursLostPerWeek = Math.round(devs * 40 * pct)

      const tone = pct > 0.25 ? 'bad' : pct > 0.15 ? 'warn' : 'good'

      return [
        res('Annual Tech Debt Tax', fmtMoney(annualDebtCost), tone, `Consuming ${Math.round(pct * 100)}% of total engineering capacity`),
        res('Quarterly Cost Drag', fmtMoney(quarterlyDebtCost), 'neutral'),
        res('Developer Hours Lost', `${fmtNum(hoursLostPerWeek)} hours / week`, tone, 'Spent wrestling legacy workarounds'),
        pctres('Engineering Velocity Drag', `${Math.round(pct * 100)}% Capacity Lost`, Math.round(pct * 100), tone),
        res('Total Engineering Payroll', fmtMoney(annualPayroll), 'neutral', `Across ${devs} engineers`),
      ]
    },
  },
]
