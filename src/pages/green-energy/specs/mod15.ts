import {
  asNum,
  asSel,
  fmtNum,
  n,
  pctres,
  res,
  sel,
  type GreenSpec,
} from './greenSpec'

export const SUBJECT = 'Green Hydrogen & Fuel Cells'

export const MOD15_SPECS: GreenSpec[] = [
  {
    id: 'green-hydrogen-water-electrolysis-kwh-kg-sizer',
    name: 'Green Hydrogen Water Electrolysis & LCOH Production Sizer',
    subject: SUBJECT,
    blurb: 'Calculate daily green hydrogen yield (kg H2 and Nm³), demineralized water requirements (liters), electrical energy consumption (MWh), and Levelized Cost of Hydrogen ($/kg LCOH).',
    tip: 'Producing 1 kg of green hydrogen via PEM or alkaline water electrolysis requires approximately 50-55 kWh of electricity and 9-10 liters of pure demineralized water.',
    usage: [
      'Enter electrolyzer stack nameplate capacity in Megawatts (MW).',
      'Select electrolysis technology (PEM vs Alkaline vs Solid Oxide SOEC).',
      'Input renewable power cost ($/MWh) and annual utilization hours.',
    ],
    method: [
      'Specific Energy = 52.5 kWh/kg H2 (PEM), 50.0 kWh/kg H2 (Alkaline), 42.0 kWh/kg H2 (SOEC high temp).',
      'Daily H2 Production (kg) = (Electrolyzer_MW * 1000 * 24 * Capacity_Factor) / Specific_Energy.',
      'Water Needed = H2_kg * 9.5 Liters.',
      'Levelized Cost LCOH ($/kg) = (Electricity_Cost_per_kg) + Capex_Opex_Addon ($1.65/kg).',
    ],
    fields: [
      n('electrolyzerMw', 'Electrolyzer Capacity (MW)', 5.0, 0.5, 100.0, 0.5),
      sel('electrolyzerTech', 'Electrolyzer Technology', [
        'PEM (Proton Exchange Membrane - Fast Dynamic Response)',
        'Alkaline AEL (Mature Industrial - Lower Capex)',
        'Solid Oxide SOEC (High Temperature Steam - Max Efficiency)',
      ]),
      n('renewablePowerCostMwh', 'Renewable Power Cost ($/MWh)', 35.0, 15.0, 120.0, 2.5),
      n('annualOperatingHours', 'Operating Equivalent Hours per Year', 5000, 1000, 8760, 250),
    ],
    compute: (v) => {
      const mw = asNum(v, 'electrolyzerMw', 5.0)
      const tech = asSel(v, 'electrolyzerTech', 'PEM')
      const powerCostMwh = asNum(v, 'renewablePowerCostMwh', 35.0)
      const hours = asNum(v, 'annualOperatingHours', 5000)

      let kwhPerKg = 53.0
      let stackEff = 0.65
      if (tech.includes('Alkaline')) { kwhPerKg = 50.5; stackEff = 0.68 }
      else if (tech.includes('Solid Oxide')) { kwhPerKg = 42.0; stackEff = 0.81 }

      const annualMwh = mw * hours
      const annualH2Kg = (annualMwh * 1000) / kwhPerKg
      const dailyH2Kg = annualH2Kg / 365
      const waterLitersPerDay = dailyH2Kg * 9.5

      const electricityCostPerKg = (kwhPerKg / 1000) * powerCostMwh
      const capexOpexAmortizedPerKg = tech.includes('PEM') ? 1.85 : tech.includes('Alkaline') ? 1.45 : 2.40
      const lcohTotal = electricityCostPerKg + capexOpexAmortizedPerKg

      return [
        res('Daily Green H2 Output', `${fmtNum(Math.round(dailyH2Kg))} kg H2 / day (${fmtNum(Math.round(dailyH2Kg * 11.12))} Nm³)`, 'good', 'Zero greenhouse gas emissions'),
        res('Levelized Cost of H2 (LCOH)', `$${lcohTotal.toFixed(2)} / kg H2`, lcohTotal <= 3.50 ? 'good' : 'warn', `$${electricityCostPerKg.toFixed(2)} electricity + $${capexOpexAmortizedPerKg.toFixed(2)} capital/O&M`),
        res('Feedstock Pure Water Demand', `${fmtNum(Math.round(waterLitersPerDay))} L / day (${fmtNum(Math.round(waterLitersPerDay * 0.264172))} gal)`, 'neutral', '9.5 L water per kg H2 split'),
        pctres('Stack LHV Energy Efficiency', `${(stackEff * 100).toFixed(0)}% Electrical-to-Chemical`, Math.round(stackEff * 100), 'good', `Lower Heating Value basis (33.33 kWh/kg)`),
        res('Annual Clean Fuel Produced', `${fmtNum(Math.round(annualH2Kg / 1000))} Metric Tons H2 / year`, 'good', `From ${fmtNum(Math.round(annualMwh))} MWh clean power`),
      ]
    },
  },
]
