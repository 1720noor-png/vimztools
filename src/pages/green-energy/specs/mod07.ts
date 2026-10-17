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

export const SUBJECT = 'Building Envelope & Thermal Insulation'

export const MOD07_SPECS: GreenSpec[] = [
  {
    id: 'building-envelope-r-value-u-factor-sizer',
    name: 'Building Assembly R-Value to U-Factor & Thermal Bridging Sizer',
    subject: SUBJECT,
    blurb: 'Calculate effective assembly U-factor, parallel-path framing thermal bridging losses, and heating season heat loss (BTU/hr) across wall, roof, and window assemblies.',
    tip: 'Wood studs constitute 20-25% of a typical framed wall area. Without continuous exterior insulation, framing thermal bridging reduces effective R-value by over 30%.',
    usage: [
      'Enter wall or roof cavity insulation nominal R-value.',
      'Enter continuous exterior insulation R-value.',
      'Specify framing fraction (typically 22-25% for 16-inch on-center studs).',
    ],
    method: [
      'Cavity Path R = R_exterior + R_sheathing (0.6) + R_cavity + R_drywall (0.45).',
      'Framing Path R = R_exterior + R_sheathing (0.6) + R_stud (4.4 for 2x4, 6.9 for 2x6) + R_drywall (0.45).',
      'Effective U-factor = (Framing_Fraction / R_framing) + ((1 - Framing_Fraction) / R_cavity).',
      'Effective Assembly R-Value = 1 / Effective_U_factor.',
    ],
    fields: [
      sel('studType', 'Wall Framing Member', ['2x6 Wood Studs (5.5" depth)', '2x4 Wood Studs (3.5" depth)', 'Steel Studs (Cold-Formed 16ga)']),
      n('cavityRValue', 'Cavity Batt / Cellulose Insulation (R-Value)', 20, 0, 40, 1),
      n('continuousExteriorR', 'Continuous Exterior Foam Board (R-Value)', 5, 0, 30, 1),
      n('assemblySqFt', 'Total Wall Surface Area (Sq Ft)', 2400, 200, 25000, 100),
      n('designTempDelta', 'Winter Design Temperature Delta (°F)', 50, 10, 90, 5),
    ],
    compute: (v) => {
      const stud = asSel(v, 'studType', '2x6')
      const cavR = asNum(v, 'cavityRValue', 20)
      const extR = asNum(v, 'continuousExteriorR', 5)
      const area = asNum(v, 'assemblySqFt', 2400)
      const deltaT = asNum(v, 'designTempDelta', 50)

      const studR = stud.includes('2x6') ? 6.88 : stud.includes('2x4') ? 4.38 : 0.85
      const framingFrac = stud.includes('Steel') ? 0.28 : 0.23 // 23% wood, 28% steel

      const otherR = extR + 0.62 + 0.45 // sheathing + drywall
      const totalCavityR = otherR + cavR
      const totalFramingR = otherR + studR

      const uEff = (framingFrac / totalFramingR) + ((1 - framingFrac) / totalCavityR)
      const rEff = 1 / uEff
      const nominalR = extR + cavR

      const heatLossBtuPerHour = uEff * area * deltaT
      const bridgingLossPct = Math.round(((nominalR - rEff) / nominalR) * 100)

      return [
        res('Effective Assembly R-Value', `R-${rEff.toFixed(1)}`, 'good', `Nominal R-${nominalR.toFixed(1)} before framing bridging`),
        res('Assembly U-Factor', `U-${uEff.toFixed(3)} BTU/(hr·°F·ft²)`, uEff <= 0.05 ? 'good' : 'neutral'),
        pctres('Thermal Bridging Derate', `${bridgingLossPct}% Performance Loss`, bridgingLossPct, bridgingLossPct > 25 ? 'warn' : 'good', 'Mitigated by continuous exterior insulation'),
        res('Design Heat Loss Rate', `${fmtNum(Math.round(heatLossBtuPerHour))} BTU/hr`, 'neutral', `At ${deltaT}°F indoor/outdoor temp differential`),
      ]
    },
  },
]
