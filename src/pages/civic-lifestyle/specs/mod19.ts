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

export const SUBJECT = 'Emergency Preparedness & Generator Sizing'

export const MOD19_SPECS: CivicSpec[] = [
  {
    id: 'backup-generator-running-surge-wattage-sizer',
    name: 'Home Backup Generator Running & Starting Surge Wattage Sizer',
    subject: SUBJECT,
    blurb: 'Calculate required generator continuous running wattage and motor locked-rotor amp (LRA) starting surge wattage for refrigerators, well pumps, furnace blowers, and medical devices.',
    tip: 'Electric induction motors (refrigerators, well pumps, sump pumps, air conditioners) require 2x to 3x their continuous running wattage for 2-3 seconds during compressor startup.',
    usage: [
      'Select key household critical appliances to power during a blackout.',
      'Enter refrigerator/freezer running and starting surge watts.',
      'Enter well pump or sump pump ratings and essential lighting circuits.',
    ],
    method: [
      'Total Continuous Running Watts = sum(Appliance_Running_Watts).',
      'Max Starting Surge Watts = Continuous_Watts + max(Motor_Startup_Surge_Watts).',
      'Recommended Generator Capacity = Continuous_Watts * 1.20 (20% continuous headroom).',
    ],
    fields: [
      n('refrigeratorWatts', 'Refrigerator / Freezer Running Watts', 700, 100, 2000, 50),
      n('refrigeratorSurgeWatts', 'Refrigerator Starting Surge Watts', 2200, 500, 6000, 100),
      n('wellPumpWatts', 'Well Pump / Sump Pump Running Watts', 1100, 0, 4000, 50),
      n('wellPumpSurgeWatts', 'Well Pump Starting Surge Watts', 3300, 0, 10000, 100),
      n('furnaceBlowerWatts', 'Furnace Fan / Blower Watts', 800, 0, 3000, 50),
      n('lightsElectronicsWatts', 'LED Lights & Router/Modem/Electronics', 400, 50, 2000, 25),
      sel('fuelSource', 'Generator Fuel Preference', ['Dual-Fuel (Gasoline & 20-lb Propane LPG)', 'Tri-Fuel (Gasoline, Propane & Natural Gas NG)', 'Gasoline Inverter (Quiet Clean Power)']),
    ],
    compute: (v) => {
      const fridgeRun = asNum(v, 'refrigeratorWatts', 700)
      const fridgeSurge = asNum(v, 'refrigeratorSurgeWatts', 2200)
      const pumpRun = asNum(v, 'wellPumpWatts', 1100)
      const pumpSurge = asNum(v, 'wellPumpSurgeWatts', 3300)
      const furnaceRun = asNum(v, 'furnaceBlowerWatts', 800)
      const lightsRun = asNum(v, 'lightsElectronicsWatts', 400)
      const fuel = asSel(v, 'fuelSource', 'Dual-Fuel')

      const totalRunningWatts = fridgeRun + pumpRun + furnaceRun + lightsRun
      // Single largest motor starting surge occurs at one time
      const maxSingleMotorDelta = Math.max(
        Math.max(0, fridgeSurge - fridgeRun),
        Math.max(0, pumpSurge - pumpRun),
      )
      const peakStartingSurgeWatts = totalRunningWatts + maxSingleMotorDelta
      const recommendedContinuousRating = Math.ceil((totalRunningWatts * 1.25) / 250) * 250
      const recommendedPeakRating = Math.max(recommendedContinuousRating + 1000, Math.ceil(peakStartingSurgeWatts / 250) * 250)

      return [
        res('Recommended Generator Size', `${fmtNum(recommendedContinuousRating)}W Running / ${fmtNum(recommendedPeakRating)}W Peak`, 'good', 'Provides 25% continuous safety headroom'),
        res('Total Continuous Running Load', `${fmtNum(totalRunningWatts)} Watts (${(totalRunningWatts / 120).toFixed(1)}A @ 120V)`, 'neutral', 'All selected essential appliances active'),
        res('Peak Motor Startup Surge', `${fmtNum(peakStartingSurgeWatts)} Starting Watts`, 'warn', 'Accounts for largest inductive motor compressor kick-in'),
        res('Recommended Inlet Breaker', `${recommendedContinuousRating >= 7500 ? '50 Amp / 240V' : '30 Amp / 240V'} Generator Inlet`, 'good', 'Standard L14-30 or CS6365 power inlet box'),
        pctres('Headroom Capacity Margin', '80% Continuous Safe Load', 80, 'good', fuel.split(' ')[0]),
      ]
    },
  },
]
