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

export const SUBJECT = 'ESG Climate Disclosures & CSRD Metrics'

export const MOD20_SPECS: GreenSpec[] = [
  {
    id: 'csrd-esrs-e1-climate-disclosure-score-sizer',
    name: 'CSRD / ESRS E1 Climate Transition Plan & Carbon Intensity Sizer',
    subject: SUBJECT,
    blurb: 'Score enterprise readiness under European Corporate Sustainability Due Diligence (CSRD / ESRS E1), calculating revenue carbon intensity (tCO2e / $M revenue) and SBTi 1.5°C alignment trajectory.',
    tip: 'Under ESRS E1, companies must publish audited CapEx alignment with EU Taxonomy and establish validated Science-Based Targets (SBTi) covering 95% of Scope 1 & 2 emissions.',
    usage: [
      'Enter total corporate annual revenue in Million USD/EUR.',
      'Enter total gross GHG emissions (Scope 1 + 2 + 3) in metric tons CO2e.',
      'Select decarbonization target trajectory (1.5°C Paris Aligned vs Well-Below 2°C).',
    ],
    method: [
      'Carbon Intensity = Total_tCO2e / Revenue_Millions ($M).',
      'Target Annual Reduction = 4.2% per year for SBTi 1.5°C pathway.',
      '2030 Target Absolute Emissions = Current_Emissions * (1 - 0.042)^Years.',
    ],
    fields: [
      n('annualRevenueMillions', 'Annual Corporate Revenue ($ Millions)', 180, 5, 20000, 5),
      n('totalEmissionsTco2e', 'Total Annual Emissions (Scope 1+2+3 tCO2e)', 24000, 100, 2000000, 500),
      sel('sbtiPathway', 'SBTi Net-Zero Ambition Level', [
        '1.5°C Absolute Contraction (4.2% Annual Linear Reduction)',
        'Well-Below 2°C (2.5% Annual Linear Reduction)',
        'Intensity-Based Convergence ($/tCO2e)',
      ]),
      n('euTaxonomyCapexPct', 'EU Taxonomy Eligible Green CapEx (%)', 18, 0, 100, 1),
    ],
    compute: (v) => {
      const rev = asNum(v, 'annualRevenueMillions', 180)
      const emissions = asNum(v, 'totalEmissionsTco2e', 24000)
      const path = asSel(v, 'sbtiPathway', '1.5°C')
      const capexPct = asNum(v, 'euTaxonomyCapexPct', 18)

      const intensity = emissions / rev
      const annualReductionRate = path.includes('1.5°C') ? 0.042 : 0.025
      const yearsTo2030 = 6
      const target2030Emissions = emissions * Math.pow(1 - annualReductionRate, yearsTo2030)
      const requiredReductionTons = emissions - target2030Emissions

      const isHighIntensity = intensity > 200

      return [
        res('Economic Carbon Intensity', `${intensity.toFixed(1)} tCO2e / $M Revenue`, isHighIntensity ? 'warn' : 'good', 'ESRS E1 mandatory KPI reporting metric'),
        res('2030 Target Absolute Ceiling', `${fmtNum(Math.round(target2030Emissions))} tCO2e / year`, 'good', `Requires eliminating ${fmtNum(Math.round(requiredReductionTons))} tCO2e by 2030`),
        res('EU Taxonomy CapEx Alignment', `${capexPct}% Green Capital`, capexPct >= 20 ? 'good' : 'warn', 'Eligible sustainable activities under CSRD Art. 8'),
        pctres('SBTi 1.5°C Alignment Trajectory', path.includes('1.5°C') ? '92% Robust Ambition' : '65% Moderate Ambition', path.includes('1.5°C') ? 92 : 65, 'good', 'Validated against GHG Protocol & Science Based Targets'),
        res('Shadow Carbon Price Exposure', fmtMoney(emissions * 65), 'neutral', '@ $65/ton internal corporate shadow carbon fee'),
      ]
    },
  },
]
