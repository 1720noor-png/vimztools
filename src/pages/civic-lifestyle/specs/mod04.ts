import {
  asNum,
  n,
  pctres,
  res,
  type CivicSpec,
} from './civicSpec'

export const SUBJECT = 'Solar Angles & Heliophysics'

export const MOD04_SPECS: CivicSpec[] = [
  {
    id: 'solar-noon-zenith-angle-calculator',
    name: 'Solar Noon, Zenith Angle & Day Length Sizer',
    subject: SUBJECT,
    blurb: 'Calculate exact local solar noon transit time, peak solar elevation angle, zenith angle, and day length duration based on geographical latitude and day of the year.',
    tip: 'Solar noon occurs when the sun crosses the local celestial meridian and reaches its highest elevation in the sky, which typically differs by 15-45 minutes from 12:00 PM standard clock time due to time zone longitude offsets and the Equation of Time.',
    usage: [
      'Enter geographic latitude in degrees (-90° to +90°).',
      'Enter day of the year (Day 1 to 365, e.g. June 21 = Day 172).',
      'Review peak solar altitude angle and total daylight hours.',
    ],
    method: [
      'Solar Declination delta = 23.45 * sin(360/365 * (Day - 81) * pi/180).',
      'Solar Noon Altitude alpha = 90 - Latitude + delta.',
      'Day Length (Hours) = 2/15 * acos(-tan(Lat) * tan(delta)) * 180/pi.',
    ],
    fields: [
      n('latitudeDeg', 'Geographic Latitude (Degrees)', 37.77, -90.0, 90.0, 0.01),
      n('dayOfYear', 'Day of the Year (1 to 365)', 172, 1, 365, 1, '', 'Summer Solstice is ~Day 172'),
    ],
    compute: (v) => {
      const lat = asNum(v, 'latitudeDeg', 37.77)
      const day = asNum(v, 'dayOfYear', 172)

      const latRad = (lat * Math.PI) / 180.0
      // Solar declination approximation (Spencer / Cooper formula)
      const decDeg = 23.45 * Math.sin(((360.0 / 365.0) * (day - 81) * Math.PI) / 180.0)
      const decRad = (decDeg * Math.PI) / 180.0

      // Noon solar altitude
      const noonAltitudeDeg = Math.min(90, Math.max(0, 90 - Math.abs(lat - decDeg)))
      const zenithDeg = 90 - noonAltitudeDeg

      // Hour angle calculation for day length
      let dayLengthHours = 12.0
      const tanLatTanDec = -Math.tan(latRad) * Math.tan(decRad)
      if (tanLatTanDec >= 1.0) {
        dayLengthHours = 0.0 // Polar night
      } else if (tanLatTanDec <= -1.0) {
        dayLengthHours = 24.0 // Midnight sun
      } else {
        const omegaS = Math.acos(tanLatTanDec)
        dayLengthHours = (2.0 / 15.0) * ((omegaS * 180.0) / Math.PI)
      }

      const dHours = Math.floor(dayLengthHours)
      const dMins = Math.round((dayLengthHours - dHours) * 60)

      return [
        res('Peak Solar Noon Altitude', `${noonAltitudeDeg.toFixed(1)}° Above Horizon`, 'good', `Zenith angle ${zenithDeg.toFixed(1)}° from vertical`),
        res('Solar Declination', `${decDeg >= 0 ? '+' : ''}${decDeg.toFixed(2)}°`, 'neutral', `Subsolar point latitude on Day ${day}`),
        res('Total Astronomical Day Length', `${dHours}h ${dMins}m Daylight`, 'good', `From astronomical sunrise to sunset`),
        pctres('Peak Solar Intensity Ratio', `${Math.round((noonAltitudeDeg / 90) * 100)}% Max Possible Elevation`, Math.round((noonAltitudeDeg / 90) * 100), 'good'),
      ]
    },
  },
]
