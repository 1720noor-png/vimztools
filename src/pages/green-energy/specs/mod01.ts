import {
  asNum,
  asSel,
  fmtMoney,
  fmtNum,
  n,
  pctres,
  res,
  sel,
  type GreenSpec,
} from './greenSpec'

export const SUBJECT = 'Solar Photovoltaic & Panel Sizing'

export const MOD01_SPECS: GreenSpec[] = [
  {
    id: 'solar-pv-array-capacity-calculator',
    name: 'Rooftop Solar PV Array Sizer & Annual kWh Yield Estimator',
    subject: SUBJECT,
    blurb: 'Calculate solar system capacity in kilowatt-peak (kWp), required roof surface area, and annual clean electricity generation based on regional solar irradiance.',
    tip: 'A standard residential solar panel produces ~400 Watts and requires approximately 21 sq ft (1.95 m²) of unobstructed roof area.',
    usage: [
      'Enter target monthly household electricity consumption in kWh.',
      'Enter average daily peak sun hours for your geographic region (typically 3.5 to 5.5 hours/day).',
      'Review required system size in kWp, panel count, and annual utility bill savings.',
    ],
    method: [
      'Target kWp = (Monthly_kWh * 12) / (Peak_Sun_Hours * 365 * System_Derate_Factor 0.82).',
      'Panel Count = ceil((Target_kWp * 1000) / Panel_Wattage).',
    ],
    fields: [
      n('monthlyKwh', 'Monthly Electric Consumption (kWh)', 950, 100, 10000, 50),
      n('sunHours', 'Daily Peak Sun Hours', 4.5, 2.0, 7.5, 0.1),
      sel('panelWattage', 'Solar Panel Wattage Rating', ['400W High-Efficiency Monocrystalline', '430W Commercial Grade', '370W Standard Residential']),
      n('utilityRate', 'Grid Electricity Cost ($/kWh)', 0.18, 0.05, 0.65, 0.01),
    ],
    compute: (v) => {
      const monthlyKwh = asNum(v, 'monthlyKwh', 950)
      const sunHours = asNum(v, 'sunHours', 4.5)
      const panelStr = asSel(v, 'panelWattage', '400W')
      const rate = asNum(v, 'utilityRate', 0.18)

      const annualTargetKwh = monthlyKwh * 12
      const derate = 0.82 // System efficiency losses: wiring, inverter, temperature, dust

      const targetKwp = annualTargetKwh / (sunHours * 365 * derate)
      const panelWatts = panelStr.startsWith('430') ? 430 : panelStr.startsWith('370') ? 370 : 400

      const panelCount = Math.ceil((targetKwp * 1000) / panelWatts)
      const actualKwp = (panelCount * panelWatts) / 1000
      const annualGenKwh = Math.round(actualKwp * sunHours * 365 * derate)

      const roofSqFt = panelCount * 21.5
      const annualSavings = annualGenKwh * rate

      return [
        res('Recommended System Size', `${actualKwp.toFixed(2)} kWp (${panelCount} panels)`, 'good', `${panelWatts}W Monocrystalline Modules`),
        res('Annual Clean Generation', `${fmtNum(annualGenKwh)} kWh / year`, 'good', `Offsets ${Math.round((annualGenKwh / annualTargetKwh) * 100)}% of power consumption`),
        res('Required Roof Space', `${fmtNum(roofSqFt)} sq ft (${Math.round(roofSqFt * 0.0929)} m²)`, roofSqFt > 800 ? 'warn' : 'good', 'Unshaded south or west facing roof'),
        res('Estimated Annual Savings', fmtMoney(annualSavings), 'good', `At $${rate.toFixed(2)}/kWh grid rate`),
        pctres('Grid Independence Offset', `${Math.round((annualGenKwh / annualTargetKwh) * 100)}% Self-Powered`, Math.min(100, Math.round((annualGenKwh / annualTargetKwh) * 100)), 'good'),
      ]
    },
  },
  {
    id: 'solar-inverter-dc-ac-ratio-sizer',
    name: 'Solar Inverter DC-to-AC Oversizing & Clipping Sizer',
    subject: SUBJECT,
    blurb: 'Calculate optimum DC/AC inverter loading ratio (ILR) to optimize financial yield and evaluate inverter clipping trade-offs.',
    tip: 'Oversizing solar DC capacity by 1.20x to 1.25x relative to the AC inverter maximizes morning and evening power generation with minimal midday clipping.',
    usage: [
      'Enter total DC solar array capacity in kW.',
      'Enter rated AC continuous inverter capacity in kW.',
      'Inspect DC/AC loading ratio and clipping risk rating.',
    ],
    method: [
      'DC/AC Ratio = DC_Array_kW / AC_Inverter_kW.',
      'Optimal industry target: 1.15 to 1.30.',
    ],
    fields: [
      n('dcKw', 'Total Solar DC Array (kW)', 10.0, 1.0, 1000.0, 0.5),
      n('acKw', 'Continuous Inverter AC Rating (kW)', 8.0, 1.0, 800.0, 0.5),
    ],
    compute: (v) => {
      const dc = asNum(v, 'dcKw', 10.0)
      const ac = asNum(v, 'acKw', 8.0)

      const ratio = dc / ac
      let verdict = 'Optimal Commercial Balance'
      let tone: 'good' | 'warn' | 'bad' = 'good'

      if (ratio < 1.05) {
        verdict = 'Underutilized Inverter (Higher CapEx)'
        tone = 'warn'
      } else if (ratio > 1.35) {
        verdict = 'Heavy Midday Clipping (Excess Energy Loss)'
        tone = 'bad'
      } else if (ratio >= 1.15 && ratio <= 1.30) {
        verdict = 'Sweet Spot (Maximizes annual kWh per dollar)'
        tone = 'good'
      }

      const estClippingLossPct = ratio > 1.3 ? Math.round((ratio - 1.3) * 15 * 10) / 10 : 0.5

      return [
        res('DC-to-AC Loading Ratio (ILR)', `${ratio.toFixed(2)}x Ratio`, tone, verdict),
        res('Inverter Utilization Status', verdict, tone),
        res('Estimated Midday Clipping Loss', `${estClippingLossPct}% annual generation`, estClippingLossPct > 2 ? 'warn' : 'good'),
        pctres('Inverter Optimization', `${Math.round(ratio * 100)}% DC Overpaneling`, Math.min(100, Math.round((ratio / 1.3) * 100)), tone),
      ]
    },
  },
]
