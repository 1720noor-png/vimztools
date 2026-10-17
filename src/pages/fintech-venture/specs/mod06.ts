import {
  asNum,
  asSel,
  n,
  pctres,
  res,
  sel,
  type FintechSpec,
} from './fintechSpec'

export const SUBJECT = 'Option Pricing & Derivatives Greeks'

// Cumulative standard normal distribution approximation (Abramowitz & Stegun)
function normalCdf(x: number): number {
  const b1 = 0.319381530
  const b2 = -0.356563782
  const b3 = 1.781477937
  const b4 = -1.821255978
  const b5 = 1.330274429
  const p = 0.2316419
  const c = 0.3989422804014337 // 1 / sqrt(2 * pi)

  if (x >= 0) {
    const t = 1.0 / (1.0 + p * x)
    return 1.0 - c * Math.exp(-x * x / 2.0) * t * (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1)
  } else {
    const t = 1.0 / (1.0 - p * x)
    return c * Math.exp(-x * x / 2.0) * t * (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1)
  }
}

function normalPdf(x: number): number {
  return (1.0 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x)
}

export const MOD06_SPECS: FintechSpec[] = [
  {
    id: 'black-scholes-option-greeks-calculator',
    name: 'Black-Scholes European Option Pricing & Greeks Sizer',
    subject: SUBJECT,
    blurb: 'Calculate theoretical fair market value and first/second order risk Greeks (Delta, Gamma, Theta, Vega, Rho) for Call and Put options using the analytical Black-Scholes-Merton model.',
    tip: 'Delta represents the hedge ratio and probability of expiring in-the-money. Gamma peaks for at-the-money options nearing expiry, causing rapid delta acceleration.',
    usage: [
      'Enter underlying asset spot price ($S) and strike price ($K).',
      'Enter days to expiration (DTE) and annualized risk-free interest rate (%).',
      'Enter annualized implied volatility (IV %).',
    ],
    method: [
      'd1 = (ln(S / K) + (r + sigma^2 / 2) * T) / (sigma * sqrt(T)).',
      'd2 = d1 - sigma * sqrt(T).',
      'Call = S * N(d1) - K * exp(-r * T) * N(d2).',
      'Put = K * exp(-r * T) * N(-d2) - S * N(-d1).',
    ],
    fields: [
      n('spotPrice', 'Underlying Spot Price ($S)', 150.0, 1.0, 100000.0, 1.0),
      n('strikePrice', 'Option Strike Price ($K)', 150.0, 1.0, 100000.0, 1.0),
      n('daysToExpiration', 'Days to Expiration (DTE)', 45, 1, 1095, 1),
      n('impliedVolPct', 'Annualized Implied Volatility IV (%)', 32.0, 1.0, 300.0, 0.5),
      n('riskFreeRatePct', 'Risk-Free Treasury Rate r (%)', 4.5, 0.0, 20.0, 0.1),
      sel('optionType', 'Option Contract Type', ['Call Option (Right to Buy)', 'Put Option (Right to Sell)']),
    ],
    compute: (v) => {
      const S = asNum(v, 'spotPrice', 150.0)
      const K = asNum(v, 'strikePrice', 150.0)
      const dte = asNum(v, 'daysToExpiration', 45)
      const iv = asNum(v, 'impliedVolPct', 32.0) / 100
      const r = asNum(v, 'riskFreeRatePct', 4.5) / 100
      const optType = asSel(v, 'optionType', 'Call')

      const T = dte / 365.0
      const sqrtT = Math.sqrt(T)

      const d1 = (Math.log(S / K) + (r + (iv * iv) / 2.0) * T) / (iv * sqrtT)
      const d2 = d1 - iv * sqrtT

      const Nd1 = normalCdf(d1)
      const Nd2 = normalCdf(d2)
      const NminusD1 = normalCdf(-d1)
      const NminusD2 = normalCdf(-d2)
      const pdfD1 = normalPdf(d1)

      const callPrice = S * Nd1 - K * Math.exp(-r * T) * Nd2
      const putPrice = K * Math.exp(-r * T) * NminusD2 - S * NminusD1

      const isCall = optType.includes('Call')
      const theoreticalPrice = isCall ? callPrice : putPrice

      const delta = isCall ? Nd1 : Nd1 - 1.0
      const gamma = pdfD1 / (S * iv * sqrtT)
      const vega = (S * pdfD1 * sqrtT) / 100 // per 1% change in vol
      const thetaPerDay = isCall
        ? (-(S * pdfD1 * iv) / (2 * sqrtT) - r * K * Math.exp(-r * T) * Nd2) / 365
        : (-(S * pdfD1 * iv) / (2 * sqrtT) + r * K * Math.exp(-r * T) * NminusD2) / 365

      const moneynessPct = Math.round(Math.abs(delta) * 100)

      return [
        res(`Theoretical ${isCall ? 'Call' : 'Put'} Price`, `$${theoreticalPrice.toFixed(2)}`, 'good', `Fair market value per share ($${(theoreticalPrice * 100).toFixed(0)} / 100-share contract)`),
        res('Delta (Hedge Ratio)', `${delta >= 0 ? '+' : ''}${delta.toFixed(3)}`, 'neutral', `${moneynessPct}% estimated probability of expiring ITM`),
        res('Gamma (Delta Acceleration)', `${gamma.toFixed(4)}`, 'neutral', 'Rate of delta change per $1 move in underlying'),
        res('Theta (Daily Time Decay)', `$${thetaPerDay.toFixed(3)} / day`, 'warn', 'Daily premium erosion due to passage of time'),
        res('Vega (Sensitivity to 1% IV)', `$${vega.toFixed(3)}`, 'neutral', 'Price change per +1% shift in implied volatility'),
        pctres('Moneyness Probability', `${moneynessPct}% In-The-Money Probability`, moneynessPct, 'good'),
      ]
    },
  },
]
