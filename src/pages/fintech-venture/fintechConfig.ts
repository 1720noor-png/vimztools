import type { LucideIcon } from 'lucide-react'
import {
  ArrowUpDown,
  Award,
  BarChart2,
  Briefcase,
  Building,
  Calculator,
  Clock,
  Coins,
  DollarSign,
  FileText,
  Globe,
  Home,
  Layers,
  Percent,
  PieChart,
  Receipt,
  Send,
  ShieldAlert,
  Sliders,
  TrendingUp,
} from 'lucide-react'
import type { Tool } from '../../lib/catalog'
import { fintechSpecs } from './specs'

export interface FintechSubcategory {
  id: string
  title: string
  tagline: string
  description: string
  icon: LucideIcon
  accent: string
  toolIds: string[]
}

export const FINTECH_CATEGORY = 'fintech-venture'
export const FINTECH_CATEGORY_NAME = 'Fintech & Venture Economics'

export const fintechSubcategories: FintechSubcategory[] = [
  {
    id: 'startup-runway',
    title: 'Startup Runway & Burn Dynamics',
    tagline: 'Net burn rate, drop-dead zero-cash date & YC post-money SAFE modeler',
    description: 'Calculate monthly gross/net burn rates, cash runway survival months, and model SAFE note dilution.',
    icon: TrendingUp,
    accent: '#0D9488',
    toolIds: ['startup-runway-zero-cash-date-calculator', 'post-money-safe-dilution-modeler'],
  },
  {
    id: 'cap-table',
    title: 'Cap Table & Equity Dilution',
    tagline: 'Priced equity rounds, option pool shuffle & post-closing ownership',
    description: 'Model investor share issuance, price per share, and unallocated option pool shuffle dilution across Series A/B rounds.',
    icon: PieChart,
    accent: '#0D9488',
    toolIds: ['priced-equity-round-dilution-sizer'],
  },
  {
    id: 'saas-metrics',
    title: 'SaaS Unit Economics & Rule of 40',
    tagline: 'LTV, CAC, CAC payback velocity, ARPA gross margin & Magic Number',
    description: 'Calculate Customer Lifetime Value, Customer Acquisition Cost, and payback velocity to benchmark enterprise unit economics.',
    icon: BarChart2,
    accent: '#0D9488',
    toolIds: ['saas-unit-economics-ltv-cac-payback-sizer'],
  },
  {
    id: 'arr-waterfall',
    title: 'ARR / MRR Waterfall & Churn Dynamics',
    tagline: 'Beginning ARR, New Bookings, Expansion, Contraction, Churn & NRR',
    description: 'Decompose recurring revenue across cohorts to calculate Net Retention Rate (NRR) and Gross Retention Rate (GRR).',
    icon: ArrowUpDown,
    accent: '#0D9488',
    toolIds: ['arr-waterfall-net-retention-nrr-sizer'],
  },
  {
    id: 'dcf-valuation',
    title: 'DCF Valuation & WACC Capital Cost',
    tagline: '5-year Free Cash Flow to Firm (FCFF), WACC & Gordon Growth Terminal Value',
    description: 'Calculate intrinsic enterprise valuation and implied equity share price from discounted cash flows and capital costs.',
    icon: Calculator,
    accent: '#0D9488',
    toolIds: ['dcf-wacc-enterprise-valuation-sizer'],
  },
  {
    id: 'black-scholes',
    title: 'Option Pricing & Derivatives Greeks',
    tagline: 'Black-Scholes analytical Call/Put pricing, Delta, Gamma, Theta & Vega',
    description: 'Calculate theoretical option fair market value and first/second order risk Greeks for financial derivatives.',
    icon: Sliders,
    accent: '#0D9488',
    toolIds: ['black-scholes-option-greeks-calculator'],
  },
  {
    id: 'bond-yield',
    title: 'Fixed Income & Bond Analytics',
    tagline: 'Yield to Maturity (YTM), clean/dirty pricing, MacAulay & Modified Duration',
    description: 'Calculate internal rate of return Yield to Maturity, coupon yield, duration risk, and DV01 sensitivity.',
    icon: Percent,
    accent: '#0D9488',
    toolIds: ['bond-ytm-macaulay-duration-sizer'],
  },
  {
    id: 'crypto-impermanent-loss',
    title: 'DeFi & AMM Impermanent Loss',
    tagline: 'Constant Product (x*y=k) price divergence loss & LP trading fee offset',
    description: 'Calculate exact impermanent loss percentage and net dollar P&L when providing liquidity to automated market maker pools.',
    icon: Coins,
    accent: '#0D9488',
    toolIds: ['amm-impermanent-loss-lp-yield-sizer'],
  },
  {
    id: 'private-equity-lbo',
    title: 'Private Equity LBO & Leverage',
    tagline: 'Sponsor equity check, senior/mezzanine leverage, debt paydown & net IRR',
    description: 'Model 5-year leveraged buyout capital structures, EBITDA expansion, debt deleveraging, and Multiple on Invested Capital.',
    icon: Briefcase,
    accent: '#0D9488',
    toolIds: ['pe-lbo-returns-moic-irr-sizer'],
  },
  {
    id: 'credit-risk-pd',
    title: 'Credit Risk & Default Probability',
    tagline: 'Altman Z-Score corporate distress, insolvency forecasting & credit rating',
    description: 'Calculate multi-factor Altman Z-Score across balance sheet ratios to classify corporate default risk into Safe or Distress zones.',
    icon: ShieldAlert,
    accent: '#0D9488',
    toolIds: ['altman-z-score-bankruptcy-credit-sizer'],
  },
  {
    id: 'currency-fx-hedging',
    title: 'FX Hedging & Forward Contracts',
    tagline: 'Covered Interest Rate Parity forward points & currency hedge cost',
    description: 'Calculate guaranteed forward exchange rates and hedging costs under CIP across EUR/USD, GBP/USD, and USD/JPY.',
    icon: Globe,
    accent: '#0D9488',
    toolIds: ['fx-forward-covered-interest-parity-sizer'],
  },
  {
    id: 'tax-loss-harvesting',
    title: 'Tax-Loss Harvesting & Wash Sale Rules',
    tagline: 'IRS Section 1091 30-day window, disallowed loss & adjusted cost basis',
    description: 'Calculate disallowed tax losses, adjusted replacement cost basis, and immediate tax shield savings from loss harvesting.',
    icon: Receipt,
    accent: '#0D9488',
    toolIds: ['wash-sale-rule-tax-loss-harvesting-sizer'],
  },
  {
    id: 'mortgage-analytics',
    title: 'Mortgage Analytics & Amortization',
    tagline: 'Accelerated bi-weekly payments, extra principal & interest saved sizer',
    description: 'Calculate interest savings, principal payoff speed, and years shaved off home mortgages with accelerated payments.',
    icon: Home,
    accent: '#0D9488',
    toolIds: ['mortgage-biweekly-accelerated-payoff-sizer'],
  },
  {
    id: 'real-estate-cap-rate',
    title: 'Real Estate Cap Rate & Valuation',
    tagline: 'Commercial NOI, Cap Rate capitalization, DSCR & cash flow after debt',
    description: 'Calculate Net Operating Income (NOI), Capitalization Rate (Cap Rate), Debt Service Coverage Ratio, and property value.',
    icon: Building,
    accent: '#0D9488',
    toolIds: ['commercial-cre-noi-cap-rate-sizer'],
  },
  {
    id: 'retirement-withdrawal',
    title: 'Retirement & Safe Withdrawal Rate',
    tagline: 'Trinity Study 4% rule, sequence of returns & 30-year portfolio longevity',
    description: 'Calculate sustainable annual retirement distributions, inflation-adjusted spending budgets, and portfolio survival probabilities.',
    icon: Clock,
    accent: '#0D9488',
    toolIds: ['trinity-study-safe-withdrawal-rate-sizer'],
  },
  {
    id: 'employee-equity-tax',
    title: 'Employee Stock Options & AMT Tax',
    tagline: 'ISO vs NSO exercise spread, Alternative Minimum Tax (AMT) & 409A FMV',
    description: 'Calculate exercise costs, AMT preference spread exposure, ordinary income tax for NSOs, and net post-tax cash proceeds.',
    icon: Award,
    accent: '#0D9488',
    toolIds: ['iso-nso-stock-option-amt-tax-sizer'],
  },
  {
    id: 'venture-fund-waterfall',
    title: 'Venture Capital Waterfall & Carried Interest',
    tagline: 'Whole-fund European vs American waterfall, 8% hurdle & 80/20 GP carry',
    description: 'Model LP return of capital, preferred return hurdle, GP catch-up, and 80/20 carried interest profit distribution splits.',
    icon: DollarSign,
    accent: '#0D9488',
    toolIds: ['vc-fund-distribution-waterfall-carry-sizer'],
  },
  {
    id: 'working-capital-ccc',
    title: 'Working Capital & Cash Conversion Cycle',
    tagline: 'Days Sales Outstanding (DSO), Inventory (DIO), Payables (DPO) & CCC',
    description: 'Calculate Days Sales Outstanding, Days Inventory, and Cash Conversion Cycle in days to unlock trapped balance sheet cash.',
    icon: Layers,
    accent: '#0D9488',
    toolIds: ['cash-conversion-cycle-ccc-working-capital-sizer'],
  },
  {
    id: 'invoice-factoring',
    title: 'Invoice Factoring & Working Capital Debt',
    tagline: 'A/R advance cash rate, factor discount fee & effective annualized APR',
    description: 'Calculate immediate advance cash, factor fees, reserve rebate payouts, and true annualized effective borrowing cost.',
    icon: FileText,
    accent: '#0D9488',
    toolIds: ['invoice-factoring-effective-apr-sizer'],
  },
  {
    id: 'cross-border-payments',
    title: 'Cross-Border Payments & FX Spread',
    tagline: 'Mid-market interbank rate, hidden markup spread & wire fee exposure',
    description: 'Expose total true transaction costs across international wire transfers by calculating hidden foreign exchange markup spreads.',
    icon: Send,
    accent: '#0D9488',
    toolIds: ['cross-border-remittance-hidden-markup-sizer'],
  },
]

export function findFintechSubcategory(id: string): FintechSubcategory | undefined {
  return fintechSubcategories.find((s) => s.id === id)
}

export const FINTECH_TOOLS: Tool[] = fintechSpecs.map((spec) => {
  const sub = fintechSubcategories.find((s) => s.toolIds.includes(spec.id))
  return {
    id: spec.id,
    name: spec.name,
    categoryId: FINTECH_CATEGORY,
    category: FINTECH_CATEGORY_NAME,
    description: spec.blurb,
    keywords: [
      'fintech',
      'finance',
      'venture',
      'startup',
      'valuation',
      'investment',
      ...(sub ? [sub.id, sub.title.toLowerCase()] : []),
      ...spec.name.toLowerCase().split(/\s+/),
    ],
    path: `/fintech-venture/${sub?.id ?? 'general'}/${spec.id}`,
    icon: 'TrendingUp',
    subcategory: spec.subject,
  }
})
