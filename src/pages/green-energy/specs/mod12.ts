import {
  asNum,
  fmtMoney,
  fmtNum,
  n,
  pctres,
  res,
  type GreenSpec,
} from './greenSpec'

export const SUBJECT = 'Commercial Lighting & LED Retrofit'

export const MOD12_SPECS: GreenSpec[] = [
  {
    id: 'commercial-led-lighting-retrofit-payback-calculator',
    name: 'Commercial LED Retrofit kWh Energy & ROI Payback Sizer',
    subject: SUBJECT,
    blurb: 'Calculate annual kWh electrical energy savings, HVAC cooling load reduction, maintenance lamp replacement savings, and simple payback period for upgrading fluorescent or HID lighting to solid-state LEDs.',
    tip: 'In conditioned buildings, every 100 Watts of lighting reduction saves an additional ~30 Watts of chiller/air conditioning cooling electrical power.',
    usage: [
      'Enter total fixture count to be retrofitted.',
      'Enter existing fixture wattage (e.g. 128W 4-lamp T8, 400W Metal Halide).',
      'Enter replacement LED fixture wattage (e.g. 36W LED panel, 150W LED high-bay).',
    ],
    method: [
      'Wattage Saved per Fixture = Existing_Watts - LED_Watts.',
      'Annual kWh Saved = (Wattage_Saved * Fixtures * Operating_Hours * 1.30 HVAC_Factor) / 1000.',
      'Payback Months = Total_Retrofit_Project_Cost / (Monthly_Energy_Savings + Monthly_Maint_Savings).',
    ],
    fields: [
      n('fixtureCount', 'Total Fixtures to Retrofit', 180, 10, 5000, 10),
      n('existingWatts', 'Existing Fixture Wattage (Watts)', 112, 20, 1000, 5),
      n('ledWatts', 'Replacement LED Wattage (Watts)', 34, 5, 400, 2),
      n('operatingHoursPerYear', 'Annual Operating Hours (Hours/Year)', 3800, 500, 8760, 100),
      n('electricRateKwh', 'Commercial Electricity Rate ($/kWh)', 0.16, 0.05, 0.45, 0.01),
      n('retrofitCostPerFixture', 'Installed Cost per Fixture ($)', 65, 10, 500, 5),
    ],
    compute: (v) => {
      const count = asNum(v, 'fixtureCount', 180)
      const oldWatts = asNum(v, 'existingWatts', 112)
      const newWatts = asNum(v, 'ledWatts', 34)
      const hours = asNum(v, 'operatingHoursPerYear', 3800)
      const rate = asNum(v, 'electricRateKwh', 0.16)
      const costPerFix = asNum(v, 'retrofitCostPerFixture', 65)

      const wattsSaved = Math.max(1, oldWatts - newWatts)
      const directKwhSaved = (wattsSaved * count * hours) / 1000
      const hvacKwhSaved = directKwhSaved * 0.28 // cooling load interaction factor
      const totalKwhSaved = directKwhSaved + hvacKwhSaved

      const annualElectricSavings = totalKwhSaved * rate
      const annualMaintSavings = count * 12 // avoided ballast/lamp burnouts ($12/fix/yr)
      const totalAnnualSavings = annualElectricSavings + annualMaintSavings

      const totalProjectCost = count * costPerFix
      const simplePaybackYears = totalProjectCost / totalAnnualSavings
      const paybackMonths = simplePaybackYears * 12
      const wattageCutPct = Math.round((wattsSaved / oldWatts) * 100)

      return [
        res('Annual Utility Cost Savings', fmtMoney(annualElectricSavings), 'good', `+ ${fmtMoney(annualMaintSavings)} avoided lamp replacements`),
        res('Simple Payback Period', `${paybackMonths.toFixed(1)} Months (${simplePaybackYears.toFixed(2)} years)`, paybackMonths <= 24 ? 'good' : 'neutral', `Total capital outlay ${fmtMoney(totalProjectCost)}`),
        res('Annual Electrical Energy Avoided', `${fmtNum(Math.round(totalKwhSaved))} kWh / year`, 'good', `Includes ${fmtNum(Math.round(hvacKwhSaved))} kWh reduced HVAC chiller load`),
        pctres('Lighting Power Density Reduction', `${wattageCutPct}% Wattage Cut`, wattageCutPct, 'good', `From ${oldWatts}W down to ${newWatts}W per luminaire`),
      ]
    },
  },
]
