import {
  asNum,
  asSel,
  fmtNum,
  n,
  pctres,
  res,
  sel,
  type CivicSpec,
} from './civicSpec'

export const SUBJECT = 'Energy Efficiency & Appliance Economics'

export const MOD20_SPECS: CivicSpec[] = [
  {
    id: 'appliance-annual-electricity-cost-sizer',
    name: 'Home Appliance Electricity Operating Cost & Energy Star Sizer',
    subject: SUBJECT,
    blurb: 'Calculate hourly, monthly, and annual electric utility operating costs, phantom standby vampire draw, and 10-year lifetime operating expenses across common household appliances.',
    tip: 'Phantom or vampire standby power consumption from electronics, smart chargers, and idle televisions accounts for 5% to 10% of total residential electric utility bills.',
    usage: [
      'Select common household appliance preset or enter custom wattage rating.',
      'Enter average daily usage hours.',
      'Enter local electricity utility rate in $/kWh.',
    ],
    method: [
      'Daily kWh = (Wattage * Daily_Hours) / 1000.',
      'Annual kWh = Daily_kWh * 365.',
      'Annual Cost ($) = Annual_kWh * Electric_Rate_per_kWh.',
      '10-Year Lifecycle Cost = Annual_Cost * 10.',
    ],
    fields: [
      sel('appliancePreset', 'Household Appliance Preset', [
        'Central Air Conditioner (3500 Watts / 8 hrs daily)',
        'Electric Clothes Dryer (3000 Watts / 1 hr daily)',
        'Space Heater (1500 Watts / 6 hrs daily)',
        'Gaming PC & Dual Monitors (450 Watts / 5 hrs daily)',
        'Modern Refrigerator (150 Watts running / 24 hrs cycle)',
        'OLED Smart TV (120 Watts / 4 hrs daily)',
      ]),
      n('applianceWatts', 'Active Power Draw (Watts)', 1500, 10, 15000, 25),
      n('dailyHoursUsed', 'Average Daily Usage (Hours/Day)', 6.0, 0.1, 24.0, 0.5),
      n('electricRateKwh', 'Electric Utility Rate ($/kWh)', 0.18, 0.05, 0.65, 0.01),
      n('standbyWatts', 'Phantom Standby Vampire Draw (Watts)', 8.0, 0.0, 50.0, 0.5),
    ],
    compute: (v) => {
      const preset = asSel(v, 'appliancePreset', 'Space Heater')
      const watts = asNum(v, 'applianceWatts', 1500)
      const hours = asNum(v, 'dailyHoursUsed', 6.0)
      const rate = asNum(v, 'electricRateKwh', 0.18)
      const standbyW = asNum(v, 'standbyWatts', 8.0)

      const activeKwhDaily = (watts * hours) / 1000.0
      const standbyHours = Math.max(0, 24 - hours)
      const standbyKwhDaily = (standbyW * standbyHours) / 1000.0
      const totalDailyKwh = activeKwhDaily + standbyKwhDaily

      const annualKwh = totalDailyKwh * 365.0
      const annualActiveCost = activeKwhDaily * 365.0 * rate
      const annualStandbyCost = standbyKwhDaily * 365.0 * rate
      const totalAnnualCost = annualKwh * rate
      const tenYearCost = totalAnnualCost * 10.0

      const standbyPct = Math.round((annualStandbyCost / totalAnnualCost) * 100)

      return [
        res('Annual Operating Electricity Cost', `$${totalAnnualCost.toFixed(2)} / year`, 'good', `Active: $${annualActiveCost.toFixed(2)} + Standby: $${annualStandbyCost.toFixed(2)}`),
        res('10-Year Lifetime Operating Expense', `$${fmtNum(Math.round(tenYearCost))}`, 'neutral', 'Excludes initial equipment purchase price'),
        res('Annual Energy Consumed', `${fmtNum(Math.round(annualKwh))} kWh / year`, 'good', `${totalDailyKwh.toFixed(2)} kWh per day`),
        res('Phantom Standby Vampire Drain', `$${annualStandbyCost.toFixed(2)} / year`, standbyPct > 15 ? 'warn' : 'neutral', `${fmtNum(Math.round(standbyKwhDaily * 365))} kWh while plugged in idle`),
        pctres('Active vs Standby Efficiency', `${100 - standbyPct}% Useful Work`, 100 - standbyPct, 'good', preset.split(' (')[0]),
      ]
    },
  },
]
