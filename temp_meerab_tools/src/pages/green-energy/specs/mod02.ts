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

export const SUBJECT = 'Battery Storage & BESS Sizing'

export const MOD02_SPECS: GreenSpec[] = [
  {
    id: 'bess-capacity-c-rate-sizer',
    name: 'Battery Energy Storage (BESS) Capacity & C-Rate Sizer',
    subject: SUBJECT,
    blurb: 'Calculate usable battery energy storage capacity (kWh), continuous discharge power (kW), and C-rate based on critical load backup requirements and depth of discharge (DoD).',
    tip: 'Lithium Iron Phosphate (LFP) chemistries support 80-90% Depth of Discharge with 6,000+ cycle lifetimes, outperforming traditional NMC batteries in stationary storage.',
    usage: [
      'Enter essential critical backup loads in Watts or kW.',
      'Specify required emergency autonomy hours.',
      'Select battery chemistry (LFP vs NMC) and target DoD.',
    ],
    method: [
      'Gross kWh = (Critical_kW * Hours) / (DoD * Inverter_Efficiency 0.94 * Battery_Roundtrip_Efficiency 0.90).',
      'C-Rate = Continuous_Discharge_kW / Usable_kWh.',
    ],
    fields: [
      n('criticalLoadKw', 'Critical Backup Load (kW)', 3.5, 0.5, 50, 0.5),
      n('backupHours', 'Required Backup Autonomy (Hours)', 12, 1, 96, 1),
      sel('batteryChemistry', 'Battery Cell Chemistry', ['LFP (Lithium Iron Phosphate - 90% DoD)', 'NMC (Nickel Manganese Cobalt - 80% DoD)', 'Lead-Acid AGM (50% DoD)']),
      n('inverterKw', 'Inverter Continuous Power Rating (kW)', 7.6, 2.0, 30.0, 0.5),
    ],
    compute: (v) => {
      const loadKw = asNum(v, 'criticalLoadKw', 3.5)
      const hours = asNum(v, 'backupHours', 12)
      const chem = asSel(v, 'batteryChemistry', 'LFP')
      const invKw = asNum(v, 'inverterKw', 7.6)

      const dod = chem.includes('LFP') ? 0.90 : chem.includes('NMC') ? 0.80 : 0.50
      const roundtripEff = chem.includes('LFP') ? 0.92 : chem.includes('NMC') ? 0.90 : 0.78
      const invEff = 0.95

      const totalEnergyNeededKwh = loadKw * hours
      const nameplateCapacityKwh = totalEnergyNeededKwh / (dod * roundtripEff * invEff)
      const usableKwh = nameplateCapacityKwh * dod

      const cRate = loadKw / usableKwh
      const dischargeLimitHit = loadKw > invKw

      return [
        res('Required Nameplate Capacity', `${nameplateCapacityKwh.toFixed(1)} kWh`, 'good', `${(dod * 100).toFixed(0)}% Depth of Discharge limit`),
        res('Usable Energy Buffer', `${usableKwh.toFixed(1)} kWh`, 'neutral', `Delivers ${hours} hours @ ${loadKw.toFixed(1)} kW continuous`),
        res('Operational C-Rate', `${cRate.toFixed(2)}C`, cRate <= 0.5 ? 'good' : 'warn', cRate <= 0.5 ? 'Gentle cell discharge rate' : 'Moderate stress discharge rate'),
        pctres('Inverter Load Factor', `${Math.round((loadKw / invKw) * 100)}% of Max`, Math.round((loadKw / invKw) * 100), dischargeLimitHit ? 'bad' : 'good', dischargeLimitHit ? 'Exceeds continuous inverter output rating!' : 'Within inverter thermal envelope'),
      ]
    },
  },
  {
    id: 'battery-lfp-calendar-cycle-degradation-calculator',
    name: 'Battery Cycle Life & Capacity Retention Degradation Model',
    subject: SUBJECT,
    blurb: 'Estimate state-of-health (SoH) capacity fade over 10-20 years combining calendar aging (ambient temperature & average SoC) and daily cycling degradation.',
    tip: 'Maintaining resting battery state-of-charge below 80% and cell temperatures below 25°C can double stationary battery lifespan.',
    usage: [
      'Enter initial installed battery capacity in kWh.',
      'Specify expected daily equivalent full cycles (EFC).',
      'Select operating ambient temperature profile.',
    ],
    method: [
      'Annual Cycle Fade = Daily_Cycles * 365 * 0.000035 (LFP chemistry baseline).',
      'Annual Calendar Fade = exp(0.04 * (Temp_C - 20)) * 0.008.',
      'Retention = max(0, 1 - (Annual_Cycle_Fade + Annual_Calendar_Fade) * Years).',
    ],
    fields: [
      n('initialCapacityKwh', 'Initial Installed Capacity (kWh)', 13.5, 3.0, 100.0, 0.5),
      n('dailyCycles', 'Daily Equivalent Full Cycles (EFC)', 1.0, 0.2, 3.0, 0.1),
      sel('operatingTemp', 'Operating Temperature Environment', ['Moderate Climate (20°C / 68°F)', 'Warm Climate / Garage (30°C / 86°F)', 'Hot / Unconditioned Outdoor (40°C / 104°F)']),
      n('projectionYears', 'Projection Timeline (Years)', 10, 1, 20, 1),
    ],
    compute: (v) => {
      const initialKwh = asNum(v, 'initialCapacityKwh', 13.5)
      const dailyCycles = asNum(v, 'dailyCycles', 1.0)
      const tempStr = asSel(v, 'operatingTemp', 'Moderate')
      const years = asNum(v, 'projectionYears', 10)

      const tempC = tempStr.includes('40°C') ? 40 : tempStr.includes('30°C') ? 30 : 20
      const calFadePerYear = 0.008 * Math.exp(0.04 * (tempC - 20))
      const cycleFadePerYear = dailyCycles * 365 * 0.000035

      const totalFadeFraction = Math.min(0.6, (calFadePerYear + cycleFadePerYear) * years)
      const retentionPct = Math.max(40, (1 - totalFadeFraction) * 100)
      const remainingKwh = initialKwh * (retentionPct / 100)
      const totalCyclesCompleted = Math.round(dailyCycles * 365 * years)

      const warrantyThreshold = 70
      const isBreached = retentionPct < warrantyThreshold

      return [
        pctres('Projected State of Health (SoH)', `${retentionPct.toFixed(1)}% Capacity`, Math.round(retentionPct), isBreached ? 'warn' : 'good', `After ${years} years & ${fmtNum(totalCyclesCompleted)} cycles`),
        res('Remaining Usable Capacity', `${remainingKwh.toFixed(1)} kWh`, 'neutral', `Down from initial ${initialKwh.toFixed(1)} kWh`),
        res('Warranty Status (70% SoH Standard)', isBreached ? 'Threshold Reached (End of Warranty)' : 'Well Above Warranty Floor', isBreached ? 'warn' : 'good'),
        res('Total Lifetime Energy Discharged', `${fmtNum(Math.round(totalCyclesCompleted * initialKwh * 0.85))} kWh`, 'good', 'Delivered over lifetime'),
      ]
    },
  },
]
