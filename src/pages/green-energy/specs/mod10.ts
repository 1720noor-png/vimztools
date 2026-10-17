import {
  asNum,
  fmtMoney,
  fmtNum,
  n,
  pctres,
  res,
  type GreenSpec,
} from './greenSpec'

export const SUBJECT = 'Peak Shaving & Grid Arbitrage'

export const MOD10_SPECS: GreenSpec[] = [
  {
    id: 'commercial-peak-shaving-demand-charge-sizer',
    name: 'Commercial Battery Peak Shaving & Demand Charge Reduction Sizer',
    subject: SUBJECT,
    blurb: 'Calculate monthly utility demand charge savings and required battery kW power rating to clip 15-minute facility peak spikes under industrial tariff structures.',
    tip: 'In many commercial utility territories, monthly kW demand charges can represent 30% to 70% of the entire commercial electric bill.',
    usage: [
      'Enter baseline monthly facility peak demand in kW.',
      'Enter target shaved peak demand in kW.',
      'Input utility demand charge per kW ($/kW-month) and peak spike duration.',
    ],
    method: [
      'Required Battery kW = Baseline_Peak_kW - Target_Clipped_kW.',
      'Required Battery kWh = Shaved_kW * Spike_Duration_Hours / DoD (0.85).',
      'Monthly Demand Savings = Shaved_kW * Demand_Rate_per_kW.',
    ],
    fields: [
      n('baselinePeakKw', 'Baseline Facility Peak Demand (kW)', 450, 50, 5000, 25),
      n('targetPeakKw', 'Target Shaved Peak Demand (kW)', 330, 25, 4500, 25),
      n('demandRateUsd', 'Utility Demand Charge ($/kW·month)', 22.50, 5.0, 75.0, 0.50),
      n('spikeDurationHours', 'Average Peak Spike Duration (Hours)', 2.0, 0.5, 6.0, 0.5),
    ],
    compute: (v) => {
      const base = asNum(v, 'baselinePeakKw', 450)
      const target = asNum(v, 'targetPeakKw', 330)
      const rate = asNum(v, 'demandRateUsd', 22.50)
      const dur = asNum(v, 'spikeDurationHours', 2.0)

      const clippedKw = Math.max(0, base - target)
      const dod = 0.85
      const roundtripEff = 0.88
      const requiredKwh = (clippedKw * dur) / (dod * roundtripEff)

      const monthlySavings = clippedKw * rate
      const annualSavings = monthlySavings * 12

      const clipPct = Math.round((clippedKw / base) * 100)

      return [
        res('Required BESS Inverter Power', `${clippedKw} kW Discharge`, 'good', `Shaves peak from ${base} kW down to ${target} kW`),
        res('Required BESS Energy Storage', `${fmtNum(Math.round(requiredKwh))} kWh`, 'neutral', `Sustains ${dur} hour peak plateau`),
        res('Monthly Demand Savings', fmtMoney(monthlySavings), 'good', `@ $${rate.toFixed(2)}/kW-month tariff`),
        res('Annual Demand Bill Savings', fmtMoney(annualSavings), 'good', 'Direct recurring utility cost reduction'),
        pctres('Demand Peak Reduction Ratio', `${clipPct}% Peak Clipped`, clipPct, 'good'),
      ]
    },
  },
]
