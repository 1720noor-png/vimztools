/**
 * Pure Engine: Pakistan Income Tax Calculator (FBR Salaried Individuals)
 * Computes progressive tax slabs, monthly withholding, and net take-home salary.
 */

export const FBR_SALARIED_SLABS = [
  { min: 0, max: 600000, fixed: 0, rate: 0, desc: 'Up to Rs. 600,000: 0% Tax Exempt' },
  { min: 600000, max: 1200000, fixed: 0, rate: 0.05, desc: 'Rs. 600,001 – 1,200,000: 5% of excess over 600K' },
  { min: 1200000, max: 2200000, fixed: 30000, rate: 0.15, desc: 'Rs. 1,200,001 – 2,200,000: Rs. 30,000 + 15% of excess over 1.2M' },
  { min: 2200000, max: 3200000, fixed: 180000, rate: 0.25, desc: 'Rs. 2,200,001 – 3,200,000: Rs. 180,000 + 25% of excess over 2.2M' },
  { min: 3200000, max: 4100000, fixed: 430000, rate: 0.30, desc: 'Rs. 3,200,001 – 4,100,000: Rs. 430,000 + 30% of excess over 3.2M' },
  { min: 4100000, max: Infinity, fixed: 700000, rate: 0.35, desc: 'Above Rs. 4,100,000: Rs. 700,000 + 35% of excess over 4.1M' }
]

export function calculatePakistanTax(options = {}) {
  let annualIncome = 0

  if (options.monthlySalary !== undefined && options.monthlySalary !== null && options.monthlySalary !== '') {
    const monthly = Number(options.monthlySalary)
    if (isNaN(monthly) || monthly < 0) {
      throw new Error('Monthly salary must be a non-negative number')
    }
    annualIncome = monthly * 12
  } else if (options.annualIncome !== undefined && options.annualIncome !== null && options.annualIncome !== '') {
    annualIncome = Number(options.annualIncome)
    if (isNaN(annualIncome) || annualIncome < 0) {
      throw new Error('Annual income must be a non-negative number')
    }
  } else {
    throw new Error('Please provide either monthlySalary or annualIncome')
  }

  let annualTax = 0
  let matchedSlab = FBR_SALARIED_SLABS[0]

  for (const slab of FBR_SALARIED_SLABS) {
    if (annualIncome > slab.min) {
      matchedSlab = slab
      const taxableExcess = annualIncome - slab.min
      annualTax = slab.fixed + taxableExcess * slab.rate
    }
  }

  const monthlySalary = annualIncome / 12
  const monthlyTax = annualTax / 12
  const annualTakeHome = annualIncome - annualTax
  const monthlyTakeHome = monthlySalary - monthlyTax
  const effectiveTaxRate = annualIncome > 0 ? (annualTax / annualIncome) * 100 : 0

  return {
    annualIncome: Math.round(annualIncome),
    monthlySalary: Math.round(monthlySalary),
    annualTax: Math.round(annualTax),
    monthlyTax: Math.round(monthlyTax),
    annualTakeHome: Math.round(annualTakeHome),
    monthlyTakeHome: Math.round(monthlyTakeHome),
    effectiveTaxRate: Number(effectiveTaxRate.toFixed(2)),
    taxSlab: matchedSlab.desc,
    formattedSummary: `Monthly Tax: Rs. ${Math.round(monthlyTax).toLocaleString()} | Take-Home: Rs. ${Math.round(monthlyTakeHome).toLocaleString()}`
  }
}
