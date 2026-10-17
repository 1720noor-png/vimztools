import {
  asNum,
  fmtMoney,
  fmtNum,
  n,
  pctres,
  res,
  type GreenSpec,
} from './greenSpec'

export const SUBJECT = 'Data Center Efficiency & PUE Sizer'

export const MOD14_SPECS: GreenSpec[] = [
  {
    id: 'data-center-pue-cooling-efficiency-sizer',
    name: 'Data Center PUE, Carbon Intensity & Free-Cooling Sizer',
    subject: SUBJECT,
    blurb: 'Calculate Power Usage Effectiveness (PUE), chiller facility overhead power (kW), water consumption (WUE), and annual carbon footprint of server IT workloads.',
    tip: 'Hyperscale facilities achieve PUEs as low as 1.10 using direct-to-chip liquid cooling and air economizers, whereas traditional enterprise server rooms often average 1.55 to 1.80.',
    usage: [
      'Enter total IT compute server load in Megawatts (MW) or kW.',
      'Enter facility design PUE (Power Usage Effectiveness ratio).',
      'Input industrial electricity tariff and carbon grid factor.',
    ],
    method: [
      'Total Facility Power MW = IT_Load_MW * PUE.',
      'Cooling & Overhead Power MW = Total_Facility_Power - IT_Load.',
      'Annual Energy MWh = Total_Facility_Power * 8760.',
      'Annual Energy Cost = MWh * 1000 * Electric_Rate.',
    ],
    fields: [
      n('itLoadMw', 'IT Server Compute Load (MW)', 2.5, 0.1, 50.0, 0.1),
      n('facilityPue', 'Facility PUE Ratio', 1.45, 1.05, 2.50, 0.01),
      n('targetPue', 'Target Optimized PUE (Liquid / Economizer)', 1.18, 1.05, 1.60, 0.01),
      n('electricRateKwh', 'Electric Utility Rate ($/kWh)', 0.11, 0.04, 0.35, 0.01),
      n('gridCarbonKgPerKwh', 'Grid Carbon Intensity (kg CO2e/kWh)', 0.38, 0.05, 0.85, 0.01),
    ],
    compute: (v) => {
      const itMw = asNum(v, 'itLoadMw', 2.5)
      const currentPue = asNum(v, 'facilityPue', 1.45)
      const optPue = asNum(v, 'targetPue', 1.18)
      const rate = asNum(v, 'electricRateKwh', 0.11)
      const gridCarbon = asNum(v, 'gridCarbonKgPerKwh', 0.38)

      const currentTotalMw = itMw * currentPue
      const optTotalMw = itMw * optPue
      const savedMw = Math.max(0, currentTotalMw - optTotalMw)

      const currentAnnualMwh = currentTotalMw * 8760
      const savedAnnualMwh = savedMw * 8760

      const annualElectricCost = currentAnnualMwh * 1000 * rate
      const annualCostSavings = savedAnnualMwh * 1000 * rate
      const annualCo2AvoidedTons = (savedAnnualMwh * 1000 * gridCarbon) / 1000

      const overheadWastePct = Math.round(((currentPue - 1.0) / currentPue) * 100)

      return [
        res('Current Facility Power Draw', `${currentTotalMw.toFixed(2)} MW Total`, currentPue > 1.5 ? 'warn' : 'good', `${(currentTotalMw - itMw).toFixed(2)} MW consumed by cooling & transformers`),
        res('Annual Power Utility Spend', fmtMoney(annualElectricCost), 'neutral', `${fmtNum(Math.round(currentAnnualMwh))} MWh / year`),
        res('Optimized PUE Annual Savings', fmtMoney(annualCostSavings), 'good', `Moving PUE from ${currentPue.toFixed(2)} to ${optPue.toFixed(2)}`),
        res('Annual Carbon Abatement', `${fmtNum(Math.round(annualCo2AvoidedTons))} Metric Tons CO2e`, 'good', 'Zero server workload impact'),
        pctres('Infrastructure Overhead Ratio', `${overheadWastePct}% Facility Overhead`, overheadWastePct, overheadWastePct > 30 ? 'warn' : 'good', 'Fraction of total power going to non-compute cooling'),
      ]
    },
  },
]
