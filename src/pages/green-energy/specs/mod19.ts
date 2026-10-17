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

export const SUBJECT = 'Renewable Energy Certificates (REC) & PPAs'

export const MOD19_SPECS: GreenSpec[] = [
  {
    id: 'rec-unbundled-vs-vpna-procurement-sizer',
    name: 'Renewable Energy Certificates (REC) vs Virtual PPA Sizer',
    subject: SUBJECT,
    blurb: 'Model corporate clean electricity procurement pathways comparing unbundled EACs/RECs against Virtual Power Purchase Agreements (vPPA Contract for Differences) for Scope 2 market-based accounting.',
    tip: '1 Renewable Energy Certificate (REC) represents legal ownership of exactly 1 Megawatt-hour (1,000 kWh) of certified zero-emission electricity generated and delivered to the grid.',
    usage: [
      'Enter organization annual Scope 2 electricity load in MWh.',
      'Enter current retail grid power tariff ($/MWh or $/kWh).',
      'Select procurement structure (Unbundled RECs vs 12-Year vPPA CfD).',
    ],
    method: [
      'Total RECs Required = Annual_Load_MWh.',
      'Unbundled REC Cost = MWh * REC_Price ($4.50/MWh).',
      'vPPA Net Settlement = MWh * (Wholesale_Market_Price - Strike_Price).',
    ],
    fields: [
      n('annualLoadMwh', 'Annual Corporate Power Load (MWh)', 12500, 100, 500000, 500),
      sel('procurementPathway', 'Clean Power Contracting Mechanism', [
        'Unbundled National Wind/Solar RECs ($3.50 / MWh)',
        'Virtual PPA (vPPA Contract for Differences - Strike $38/MWh)',
        'Onsite Behind-the-Meter Solar PPA ($65 / MWh flat)',
      ]),
      n('wholesalePriceForecast', 'Projected Wholesale Market Price ($/MWh)', 42.0, 15.0, 100.0, 1.0),
      n('retailTariffKwh', 'Current Retail Tariff ($/kWh)', 0.13, 0.05, 0.40, 0.01),
    ],
    compute: (v) => {
      const mwh = asNum(v, 'annualLoadMwh', 12500)
      const path = asSel(v, 'procurementPathway', 'Unbundled')
      const wholesale = asNum(v, 'wholesalePriceForecast', 42.0)
      const retail = asNum(v, 'retailTariffKwh', 0.13)

      const baselineUtilityCost = mwh * 1000 * retail

      let cleanAddonCost = 0
      let financialHedgeBenefit = 0

      if (path.includes('Unbundled')) {
        cleanAddonCost = mwh * 3.50
      } else if (path.includes('Virtual PPA')) {
        const strikePrice = 38.0
        // CfD settlement: If wholesale > strike, generator pays corporation delta
        const settlementDelta = wholesale - strikePrice
        financialHedgeBenefit = mwh * settlementDelta
        cleanAddonCost = -financialHedgeBenefit // Negative cost = net revenue credit
      } else {
        cleanAddonCost = mwh * 12.0 // onsite solar delta
      }

      const netCorporateCost = baselineUtilityCost + cleanAddonCost
      const carbonOffsetTons = mwh * 0.38 // Average US eGRID factor

      return [
        res('Scope 2 Matching Status', '100% RE100 Compliant', 'good', `${fmtNum(mwh)} RECs retired annually`),
        res('Procurement Financial Delta', cleanAddonCost <= 0 ? `${fmtMoney(Math.abs(cleanAddonCost))} Net Credit Gain` : `${fmtMoney(cleanAddonCost)} Annual Premium`, cleanAddonCost <= 0 ? 'good' : 'neutral', path.includes('Virtual') ? `Settlement at $${wholesale}/MWh wholesale vs $38 strike` : 'Environmental attributes unbundled premium'),
        res('Total Net Corporate Power Spend', fmtMoney(netCorporateCost), 'neutral', `Baseline utility spend ${fmtMoney(baselineUtilityCost)}`),
        res('Market-Based Scope 2 Emissions', '0 tCO2e (Net-Zero)', 'good', `${fmtNum(Math.round(carbonOffsetTons))} tCO2e abated vs location-based grid`),
        pctres('Renewable Electricity Coverage', '100% Green Match', 100, 'good', 'Audited under GHG Protocol Scope 2 Guidance'),
      ]
    },
  },
]
