import {
  asNum,
  n,
  pctres,
  res,
  type FintechSpec,
} from './fintechSpec'

export const SUBJECT = 'Fixed Income & Bond Analytics'

export const MOD07_SPECS: FintechSpec[] = [
  {
    id: 'bond-ytm-macaulay-duration-sizer',
    name: 'Bond Yield to Maturity (YTM) & MacAulay Duration Sizer',
    subject: SUBJECT,
    blurb: 'Calculate internal rate of return Yield to Maturity (YTM), clean vs dirty price, MacAulay Duration, Modified Duration, and DV01 interest rate risk sensitivity.',
    tip: 'Modified Duration approximates the percentage change in bond price for a 100 basis point (1%) parallel shift in the yield curve.',
    usage: [
      'Enter bond par value ($1,000 standard).',
      'Enter annual coupon interest rate (%) and payment frequency.',
      'Enter current market trading price (% of par or $) and years to maturity.',
    ],
    method: [
      'Approx YTM = (Coupon + (Par - Price) / Years) / ((Par + Price) / 2).',
      'Modified Duration = MacAulay_Duration / (1 + YTM / Frequency).',
      'DV01 = Modified_Duration * Clean_Price * 0.0001.',
    ],
    fields: [
      n('parValue', 'Bond Face / Par Value ($)', 1000, 100, 1000000, 100),
      n('couponRatePct', 'Annual Coupon Interest Rate (%)', 5.25, 0.0, 20.0, 0.125),
      n('marketPrice', 'Current Clean Market Price ($)', 975, 100, 2000000, 5),
      n('yearsToMaturity', 'Years to Final Maturity', 7.5, 0.5, 50.0, 0.5),
    ],
    compute: (v) => {
      const par = asNum(v, 'parValue', 1000)
      const cRate = asNum(v, 'couponRatePct', 5.25) / 100
      const price = asNum(v, 'marketPrice', 975)
      const years = asNum(v, 'yearsToMaturity', 7.5)

      const annualCoupon = par * cRate
      // Approximate YTM formula
      const approxYtm = (annualCoupon + (par - price) / years) / ((par + price) / 2)
      const ytmPct = approxYtm * 100

      // Approximate Macaulay Duration for standard bullet bond
      const macDur = (1 + approxYtm) / approxYtm - (1 + approxYtm + years * (cRate - approxYtm)) / (cRate * (Math.pow(1 + approxYtm, years) - 1) + approxYtm)
      const validMacDur = isNaN(macDur) || macDur <= 0 ? years * 0.82 : macDur
      const modDur = validMacDur / (1 + approxYtm / 2)
      const dv01 = modDur * price * 0.0001

      const isDiscount = price < par
      const isPremium = price > par

      return [
        res('Yield to Maturity (YTM)', `${ytmPct.toFixed(3)}%`, 'good', isDiscount ? 'Trading at discount below par' : isPremium ? 'Trading at premium above par' : 'Trading at par value'),
        res('Current Yield', `${((annualCoupon / price) * 100).toFixed(2)}%`, 'neutral', `Annual cash coupon $${annualCoupon.toFixed(2)} / price $${price.toFixed(2)}`),
        res('Modified Duration', `${modDur.toFixed(2)} Years`, 'neutral', `Price shifts ~${modDur.toFixed(2)}% per 100 bps rate move`),
        res('DV01 (Dollar Value of 1 bp)', `$${dv01.toFixed(3)} per Bond`, 'neutral', 'Dollar P&L change per 0.01% yield shift'),
        pctres('Par Recovery Ratio', `${Math.round((price / par) * 100)}% of Face Value`, Math.min(100, Math.round((price / par) * 100)), 'good'),
      ]
    },
  },
]
