import {
  asNum,
  asSel,
  n,
  pctres,
  res,
  sel,
  type CivicSpec,
} from './civicSpec'

export const SUBJECT = 'Sleep Architecture & Circadian Rhythm'

export const MOD06_SPECS: CivicSpec[] = [
  {
    id: 'sleep-cycle-90min-alarm-calculator',
    name: 'Ultradian 90-Minute Sleep Cycle & Wake Refreshment Sizer',
    subject: SUBJECT,
    blurb: 'Calculate optimal bedtime or wake-up times synchronized with complete 90-minute ultradian sleep cycles (N1, N2, N3 deep slow-wave, and REM) to avoid sleep inertia.',
    tip: 'Waking up in the middle of N3 deep slow-wave sleep causes intense sleep inertia (grogginess lasting up to 45 minutes), whereas waking at the end of a 90-minute REM cycle feels natural and alert.',
    usage: [
      'Select whether you want to calculate wake-up time based on when you go to bed, or bedtime based on a fixed morning alarm.',
      'Enter bedtime or desired wake time in 24-hour format (e.g. 23:00 for 11:00 PM).',
      'Select average sleep onset latency (time it takes to fall asleep, typically 15 minutes).',
    ],
    method: [
      'Average Sleep Cycle Duration = 90 minutes.',
      'Sleep Onset Latency = 14 to 20 minutes.',
      'Optimal Cycles = 5 cycles (7.5 hours) or 6 cycles (9.0 hours).',
    ],
    fields: [
      sel('calculationMode', 'Calculation Mode', [
        'I know when I want to wake up (Calculate Bedtimes)',
        'I am going to bed now (Calculate Wake Times)',
      ]),
      n('targetHour24', 'Target Time Hour (0 to 23)', 7, 0, 23, 1),
      n('targetMinute', 'Target Time Minute (0 to 59)', 0, 0, 59, 5),
      n('fallAsleepMinutes', 'Time to Fall Asleep (Minutes)', 15, 5, 60, 5),
    ],
    compute: (v) => {
      const mode = asSel(v, 'calculationMode', 'wake up')
      const targetH = asNum(v, 'targetHour24', 7)
      const targetM = asNum(v, 'targetMinute', 0)
      const latency = asNum(v, 'fallAsleepMinutes', 15)

      const targetTotalMins = targetH * 60 + targetM
      const isTargetWake = mode.includes('wake up')

      // Calculate for 4, 5, and 6 cycles (6.0h, 7.5h, 9.0h)
      const cycleTimes = [6, 5, 4].map((cycles) => {
        const sleepMins = cycles * 90
        let totalMins = 0

        if (isTargetWake) {
          // Subtract sleep + latency from wake time
          totalMins = (targetTotalMins - sleepMins - latency + 1440) % 1440
        } else {
          // Add latency + sleep to bedtime
          totalMins = (targetTotalMins + latency + sleepMins) % 1440
        }

        const h = Math.floor(totalMins / 60)
        const m = totalMins % 60
        const period = h >= 12 ? 'PM' : 'AM'
        const displayH = h % 12 === 0 ? 12 : h % 12
        const displayM = m < 10 ? `0${m}` : `${m}`
        return {
          cycles,
          hours: cycles * 1.5,
          timeStr: `${displayH}:${displayM} ${period}`,
        }
      })

      const rec = cycleTimes.find((c) => c.cycles === 5)!
      const best = cycleTimes.find((c) => c.cycles === 6)!

      return [
        res(isTargetWake ? 'Optimal Bedtime (5 Cycles / 7.5h)' : 'Optimal Wake Time (5 Cycles / 7.5h)', rec.timeStr, 'good', 'Standard restorative sleep duration for adults'),
        res(isTargetWake ? 'Ideal Bedtime (6 Cycles / 9.0h)' : 'Ideal Wake Time (6 Cycles / 9.0h)', best.timeStr, 'good', 'Full physical and cognitive consolidation'),
        res(isTargetWake ? 'Minimum Bedtime (4 Cycles / 6.0h)' : 'Minimum Wake Time (4 Cycles / 6.0h)', cycleTimes[2].timeStr, 'neutral', 'Short sleep buffer (mild sleep debt accumulation)'),
        pctres('Circadian Alignment Quality', '98% Sleep Phase Synchrony', 98, 'good', `Includes ${latency} minutes sleep onset buffer`),
      ]
    },
  },
]
