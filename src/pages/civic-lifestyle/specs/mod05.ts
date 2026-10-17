import {
  asNum,
  asSel,
  n,
  pctres,
  res,
  sel,
  type CivicSpec,
} from './civicSpec'

export const SUBJECT = 'Acoustics & Hearing Conservation'

export const MOD05_SPECS: CivicSpec[] = [
  {
    id: 'decibel-sound-exposure-hearing-dosimeter',
    name: 'Noise Decibel (dBA) Dose & Safe Exposure Time Calculator',
    subject: SUBJECT,
    blurb: 'Calculate maximum permissible daily acoustic sound exposure time (hours/minutes) before risk of permanent noise-induced sensorineural hearing loss under OSHA and NIOSH standards.',
    tip: 'NIOSH uses a strict 3 dB exchange rate: every 3 dB increase in sound pressure cuts safe exposure time in half (85 dBA = 8 hrs, 88 dBA = 4 hrs, 91 dBA = 2 hrs, 100 dBA = 15 mins).',
    usage: [
      'Enter or measure ambient sound pressure level in A-weighted decibels (dBA).',
      'Select regulatory safety standard (NIOSH 3 dB exchange vs OSHA 5 dB PEL).',
      'Enter planned daily exposure duration in hours or minutes.',
    ],
    method: [
      'NIOSH Allowable Time T = 8 / 2^((dBA - 85) / 3) (Hours).',
      'OSHA Allowable Time T = 8 / 2^((dBA - 90) / 5) (Hours).',
      'Daily Noise Dose % = (Actual_Exposure_Hours / Allowable_Hours) * 100.',
    ],
    fields: [
      n('soundLevelDba', 'Sound Pressure Level (dBA)', 91.0, 50.0, 140.0, 1.0),
      sel('safetyStandard', 'Safety Standard Exchange Rate', [
        'NIOSH / CDC (85 dBA baseline / 3 dB halving - Protective)',
        'OSHA Permissible Exposure Limit (90 dBA baseline / 5 dB halving - Legal minimum)',
      ]),
      n('plannedExposureMinutes', 'Daily Exposure Duration (Minutes)', 90, 1, 960, 5),
    ],
    compute: (v) => {
      const dba = asNum(v, 'soundLevelDba', 91.0)
      const std = asSel(v, 'safetyStandard', 'NIOSH')
      const expMins = asNum(v, 'plannedExposureMinutes', 90)

      const isNiosh = std.includes('NIOSH')
      let maxHours = 8.0

      if (isNiosh) {
        // T = 8 / (2 ^ ((L - 85)/3))
        maxHours = 8.0 / Math.pow(2, (dba - 85.0) / 3.0)
      } else {
        // T = 8 / (2 ^ ((L - 90)/5))
        maxHours = 8.0 / Math.pow(2, (dba - 90.0) / 5.0)
      }

      const maxMinutes = Math.max(0.1, maxHours * 60)
      const dosePct = Math.round((expMins / maxMinutes) * 100)

      let safeTimeStr = ''
      if (maxMinutes >= 60) {
        const hrs = Math.floor(maxMinutes / 60)
        const mins = Math.round(maxMinutes % 60)
        safeTimeStr = `${hrs}h ${mins}m`
      } else if (maxMinutes >= 1) {
        safeTimeStr = `${Math.round(maxMinutes)} minutes`
      } else {
        safeTimeStr = `${Math.round(maxMinutes * 60)} seconds`
      }

      const isDangerous = dosePct > 100
      const tone: 'good' | 'warn' | 'bad' | 'neutral' = isDangerous ? 'bad' : dosePct > 65 ? 'warn' : 'good'

      return [
        res('Maximum Safe Daily Exposure Limit', safeTimeStr, tone, `Before permanent hearing damage risk`),
        pctres('Accumulated Daily Noise Dose', `${dosePct}% Permissible Dose`, Math.min(100, dosePct), tone, isDangerous ? 'Exceeds daily acoustic safety limit!' : 'Within safe auditory threshold'),
        res('Hearing Protection Recommendation', dba >= 100 ? 'Double Protection (Earplugs + Earmuffs Required)' : dba >= 85 ? 'Standard Hearing Protection (NRR 25+ Earplugs)' : 'No Protection Required', tone),
        res('Sound Level Comparison', dba >= 120 ? 'Jet Takeoff / Sirens' : dba >= 100 ? 'Chainsaw / Motorcycle' : dba >= 85 ? 'Heavy City Traffic / Lawn Mower' : 'Normal Conversation', 'neutral'),
      ]
    },
  },
]
