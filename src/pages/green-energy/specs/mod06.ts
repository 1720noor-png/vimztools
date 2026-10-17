import {
  asNum,
  fmtNum,
  n,
  pctres,
  res,
  type GreenSpec,
} from './greenSpec'

export const SUBJECT = 'Carbon Accounting & GHG Protocols'

export const MOD06_SPECS: GreenSpec[] = [
  {
    id: 'ghg-protocol-scope1-2-3-carbon-calculator',
    name: 'Corporate GHG Protocol Scope 1, 2 & 3 Carbon Footprint Sizer',
    subject: SUBJECT,
    blurb: 'Calculate organization-wide carbon dioxide equivalent (tCO2e) emissions across direct fuel combustion (Scope 1), purchased grid electricity (Scope 2), and supply chain logistics (Scope 3).',
    tip: 'For most service and tech enterprises, Scope 3 upstream supply chain and business travel accounts for more than 75% of total corporate emissions.',
    usage: [
      'Input natural gas or fleet fuel consumption (Scope 1).',
      'Input annual purchased grid electricity in MWh (Scope 2).',
      'Input estimated business travel, employee commuting, and cloud hosting spend (Scope 3).',
    ],
    method: [
      'Scope 1 tCO2e = (Therms_Gas * 0.0053) + (Gallons_Fuel * 0.0089).',
      'Scope 2 tCO2e = MWh_Electricity * Grid_Intensity_Factor (0.38 tCO2e/MWh).',
      'Scope 3 tCO2e = Flights_Miles * 0.00015 + Commute_Miles * 0.00028 + Cloud_Spend * 0.00005.',
    ],
    fields: [
      n('gasTherms', 'Scope 1: Natural Gas Burned (Therms)', 15000, 0, 500000, 500),
      n('fleetGallons', 'Scope 1: Fleet Diesel/Gas (Gallons)', 8500, 0, 200000, 250),
      n('electricMwh', 'Scope 2: Purchased Electricity (MWh)', 450, 10, 50000, 25),
      n('flightMiles', 'Scope 3: Commercial Air Travel (Passenger Miles)', 120000, 0, 5000000, 5000),
      n('cloudSpendUsd', 'Scope 3: Cloud & SaaS Infrastructure Spend ($)', 75000, 0, 2000000, 2500),
    ],
    compute: (v) => {
      const therms = asNum(v, 'gasTherms', 15000)
      const gallons = asNum(v, 'fleetGallons', 8500)
      const mwh = asNum(v, 'electricMwh', 450)
      const flightMiles = asNum(v, 'flightMiles', 120000)
      const cloudSpend = asNum(v, 'cloudSpendUsd', 75000)

      const scope1 = (therms * 0.0053) + (gallons * 0.0089)
      const scope2 = mwh * 0.38 // Average US eGRID factor
      const scope3 = (flightMiles * 0.00015) + (cloudSpend * 0.00005)

      const totalTco2e = scope1 + scope2 + scope3
      const s1Pct = Math.round((scope1 / totalTco2e) * 100)
      const s2Pct = Math.round((scope2 / totalTco2e) * 100)
      const s3Pct = Math.round((scope3 / totalTco2e) * 100)

      return [
        res('Total Corporate Emissions', `${totalTco2e.toFixed(1)} tCO2e`, totalTco2e > 500 ? 'warn' : 'good', 'Metric tons CO2 equivalent / year'),
        res('Scope 1: Direct Combustion', `${scope1.toFixed(1)} tCO2e (${s1Pct}%)`, 'neutral', 'Facility heating & fleet vehicles'),
        res('Scope 2: Purchased Electricity', `${scope2.toFixed(1)} tCO2e (${s2Pct}%)`, 'neutral', 'Location-based grid emissions'),
        res('Scope 3: Value Chain & Cloud', `${scope3.toFixed(1)} tCO2e (${s3Pct}%)`, 'neutral', 'Flights & SaaS compute services'),
        pctres('Grid Decarbonization Opportunity', `${s2Pct}% Scope 2 Grid Share`, s2Pct, 'good', 'Addressable immediately via onsite solar or Green PPAs'),
        res('Carbon Neutrality Offset Cost', `$${fmtNum(Math.round(totalTco2e * 25))}`, 'neutral', '@ $25/ton high-durability carbon removal credits'),
      ]
    },
  },
]
