import {
  asNum,
  asSel,
  n,
  pctres,
  res,
  sel,
  type CivicSpec,
} from './civicSpec'

export const SUBJECT = 'Electrical Engineering & Wire Sizing'

export const MOD13_SPECS: CivicSpec[] = [
  {
    id: 'electrical-wire-gauge-voltage-drop-sizer',
    name: 'Electrical Circuit AWG Wire Gauge & Voltage Drop Sizer',
    subject: SUBJECT,
    blurb: 'Size American Wire Gauge (AWG) copper conductors, branch circuit breaker ampacity, and calculate percentage voltage drop over long electrical conduit runs under NEC 3% guidelines.',
    tip: 'The National Electrical Code (NEC 210.19(A)) recommends limiting branch circuit voltage drop to no more than 3% under continuous load to prevent motor overheating and light dimming.',
    usage: [
      'Select circuit nominal voltage (120V single-phase vs 240V split-phase).',
      'Enter continuous circuit load current in Amps (or total connected Watts).',
      'Enter one-way circuit conductor run distance in feet.',
    ],
    method: [
      'Resistance R per 1000ft: 14 AWG = 3.07 ohm, 12 AWG = 1.93 ohm, 10 AWG = 1.21 ohm, 8 AWG = 0.764 ohm, 6 AWG = 0.491 ohm.',
      'Voltage Drop V_drop = 2 * Distance_Ft * Resistance_per_Ft * Current_Amps.',
      'Voltage Drop % = (V_drop / Nominal_Voltage) * 100.',
    ],
    fields: [
      sel('circuitVoltage', 'Nominal Circuit Voltage', ['120V AC Single-Phase (Standard Outlets)', '240V AC Split-Phase (Dryer, EV, Heat Pump)']),
      n('continuousCurrentAmps', 'Circuit Load Current (Amps)', 16.0, 1.0, 100.0, 1.0),
      n('conductorDistanceFt', 'One-Way Circuit Distance (Feet)', 85, 10, 500, 5),
      sel('conductorGauge', 'Selected Conductor Gauge (AWG)', [
        '12 AWG Copper (20A Circuit / 1.93 ohm/kft)',
        '14 AWG Copper (15A Circuit / 3.07 ohm/kft)',
        '10 AWG Copper (30A Circuit / 1.21 ohm/kft)',
        '8 AWG Copper (40-50A Circuit / 0.764 ohm/kft)',
        '6 AWG Copper (60A Circuit / 0.491 ohm/kft)',
      ]),
    ],
    compute: (v) => {
      const voltStr = asSel(v, 'circuitVoltage', '120V')
      const amps = asNum(v, 'continuousCurrentAmps', 16.0)
      const dist = asNum(v, 'conductorDistanceFt', 85)
      const awgStr = asSel(v, 'conductorGauge', '12 AWG')

      const voltage = voltStr.includes('240V') ? 240 : 120

      let rPerKft = 1.93 // 12 AWG default
      let maxAmpacity = 20
      if (awgStr.includes('14 AWG')) { rPerKft = 3.07; maxAmpacity = 15 }
      else if (awgStr.includes('10 AWG')) { rPerKft = 1.21; maxAmpacity = 30 }
      else if (awgStr.includes('8 AWG')) { rPerKft = 0.764; maxAmpacity = 50 }
      else if (awgStr.includes('6 AWG')) { rPerKft = 0.491; maxAmpacity = 65 }

      const totalConductorLength = dist * 2 // Round-trip hot and neutral
      const totalResistance = (rPerKft / 1000.0) * totalConductorLength
      const vDrop = amps * totalResistance
      const vDropPct = (vDrop / voltage) * 100
      const deliveredVoltage = Math.max(0, voltage - vDrop)

      const isOverloaded = amps > maxAmpacity
      const isDropViolated = vDropPct > 3.0

      const tone: 'good' | 'warn' | 'bad' | 'neutral' = isOverloaded ? 'bad' : isDropViolated ? 'warn' : 'good'

      return [
        res('Circuit Voltage Drop', `${vDrop.toFixed(2)} Volts (${vDropPct.toFixed(2)}%)`, tone, isDropViolated ? 'Exceeds NEC 3.0% maximum recommended drop! Upsize wire gauge.' : 'Passes NEC 3.0% voltage drop threshold'),
        res('Terminal Delivered Voltage', `${deliveredVoltage.toFixed(1)} VAC`, isDropViolated ? 'warn' : 'good', `@ active load end (${dist} ft run)`),
        res('Conductor Ampacity Safety', isOverloaded ? 'OVERLOAD: Wire Gauge Under-Sized!' : 'Within Safe Thermal Limits', isOverloaded ? 'bad' : 'good', `${amps}A continuous load on ${maxAmpacity}A rated conductor`),
        pctres('NEC Voltage Quality Index', `${Math.max(0, Math.min(100, Math.round(100 - (vDropPct * 15))))}% Voltage Stability`, Math.max(0, Math.min(100, Math.round(100 - (vDropPct * 15)))), tone),
      ]
    },
  },
]
