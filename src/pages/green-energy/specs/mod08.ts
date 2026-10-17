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

export const SUBJECT = 'Micro-Hydro Power & Water Turbines'

export const MOD08_SPECS: GreenSpec[] = [
  {
    id: 'micro-hydro-turbine-power-head-flow-calculator',
    name: 'Micro-Hydro Electric Turbine Head & Flow Sizer',
    subject: SUBJECT,
    blurb: 'Calculate continuous electrical generation (Watts and kW) from gross hydraulic head (vertical drop) and water flow rate (GPM or L/s), accounting for penstock friction pipe losses.',
    tip: 'Unlike solar or wind, micro-hydro runs 24 hours a day, 365 days a year, delivering an exceptional 80-95% capacity factor from running streams.',
    usage: [
      'Enter vertical head (elevation drop from intake to turbine) in feet.',
      'Enter usable stream flow rate in Gallons Per Minute (GPM).',
      'Select turbine runner type (Pelton, Turgo, Crossflow, Kaplan).',
    ],
    method: [
      'Net Head = Gross_Head * (1 - Friction_Loss 0.12).',
      'Hydraulic Power P = (Flow_GPM * Net_Head_Ft) / 5308 (kW).',
      'Electrical Output = P * Turbine_Eff * Generator_Eff.',
    ],
    fields: [
      n('grossHeadFt', 'Gross Vertical Head Drop (Feet)', 65, 5, 600, 5),
      n('flowGpm', 'Usable Stream Flow Rate (GPM)', 180, 10, 5000, 10),
      sel('turbineType', 'Turbine Runner Technology', [
        'Pelton Wheel (High Head > 50ft, Low/Med Flow)',
        'Turgo Wheel (Medium Head 30-150ft)',
        'Crossflow / Banki (Medium Head & High Flow)',
        'Propeller / Kaplan (Low Head < 20ft, High Flow)',
      ]),
      n('penstockLengthFt', 'Penstock Pipe Run Length (Feet)', 350, 20, 3000, 25),
    ],
    compute: (v) => {
      const head = asNum(v, 'grossHeadFt', 65)
      const flow = asNum(v, 'flowGpm', 180)
      const runner = asSel(v, 'turbineType', 'Pelton')
      const pipeLen = asNum(v, 'penstockLengthFt', 350)

      // Friction loss estimate: ~2.5 ft loss per 100 ft pipe at moderate velocities
      const frictionLossFt = Math.min(head * 0.25, (pipeLen / 100) * 1.8)
      const netHeadFt = Math.max(1, head - frictionLossFt)

      const runnerEff = runner.includes('Pelton') ? 0.82 : runner.includes('Turgo') ? 0.80 : runner.includes('Crossflow') ? 0.76 : 0.72
      const generatorEff = 0.88

      // Electric Watts = (Flow_gpm * NetHead_ft * 0.188) * combined_eff * 5.38... or standard: P = (Q * H) / 5308 in kW
      const theoreticalKw = (flow * netHeadFt) / 5308
      const electricalKw = theoreticalKw * runnerEff * generatorEff
      const annualKwh = electricalKw * 8760 * 0.90 // 90% run-of-river runtime

      return [
        res('Continuous Electric Output', `${electricalKw >= 1 ? electricalKw.toFixed(2) + ' kW' : (electricalKw * 1000).toFixed(0) + ' W'}`, 'good', '24/7 continuous baseload generation'),
        res('Net Hydraulic Head', `${netHeadFt.toFixed(1)} ft (${frictionLossFt.toFixed(1)} ft pipe friction loss)`, 'neutral'),
        res('Annual Clean Generation', `${fmtNum(Math.round(annualKwh))} kWh / year`, 'good', `Equivalent to ~${Math.round(annualKwh / 10000)} typical residential homes`),
        pctres('System Water-to-Wire Efficiency', `${Math.round(runnerEff * generatorEff * 100)}% Conversion`, Math.round(runnerEff * generatorEff * 100), 'good'),
      ]
    },
  },
]
