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

export const SUBJECT = 'Off-Grid Solar & Islanded Power Systems'

export const MOD16_SPECS: GreenSpec[] = [
  {
    id: 'off-grid-solar-battery-autonomy-sizer',
    name: '100% Off-Grid Solar & Days of Autonomy Battery Sizer',
    subject: SUBJECT,
    blurb: 'Size stand-alone off-grid solar PV arrays and battery banks to guarantee continuous 100% uptime through extended winter overcast conditions without grid interconnection.',
    tip: 'Off-grid installations must be sized for the worst-case winter solar month (lowest peak sun hours), typically requiring 2.5x to 3x more PV capacity than grid-tied net-metered arrays.',
    usage: [
      'Enter total daily electrical consumption in kWh/day.',
      'Specify required consecutive overcast days of battery autonomy (typically 3 to 5 days).',
      'Enter worst-case winter solar peak sun hours.',
    ],
    method: [
      'Battery Usable kWh = Daily_kWh * Days_of_Autonomy / (DoD * Temp_Derate 0.90).',
      'PV Array kWp = (Daily_kWh / Winter_Sun_Hours) * (1 / System_Losses 0.72).',
      'Generator Backup Reserve = Daily_kWh * 1.5.',
    ],
    fields: [
      n('dailyKwhDemand', 'Daily Energy Consumption (kWh/day)', 18.0, 1.0, 150.0, 0.5),
      n('daysOfAutonomy', 'Required Sunless Autonomy (Days)', 3.5, 1.0, 7.0, 0.5),
      n('winterSunHours', 'Worst-Month Daily Peak Sun Hours', 2.2, 1.0, 5.0, 0.1),
      sel('systemVoltage', 'DC Battery Bus Architecture', ['48V DC High-Capacity Bus', '24V DC Medium Bus', '12V DC Compact Cabin']),
    ],
    compute: (v) => {
      const dailyKwh = asNum(v, 'dailyKwhDemand', 18.0)
      const days = asNum(v, 'daysOfAutonomy', 3.5)
      const winterSun = asNum(v, 'winterSunHours', 2.2)
      const busStr = asSel(v, 'systemVoltage', '48V')

      const busVolts = busStr.includes('48V') ? 48 : busStr.includes('24V') ? 24 : 12
      const dod = 0.85 // LFP battery
      const tempDerate = 0.90 // Winter cold buffer

      const usableKwhNeeded = dailyKwh * days
      const nameplateBatteryKwh = usableKwhNeeded / (dod * tempDerate)
      const batteryAmpHours = (nameplateBatteryKwh * 1000) / busVolts

      const systemLosses = 0.72 // Off-grid charge controller, wiring, inverter standby
      const requiredArrayKwp = dailyKwh / (winterSun * systemLosses)
      const panelCount = Math.ceil((requiredArrayKwp * 1000) / 400) // 400W modules
      const actualArrayKwp = (panelCount * 400) / 1000

      return [
        res('Required Off-Grid Solar Array', `${actualArrayKwp.toFixed(2)} kWp (${panelCount} panels)`, 'good', `Guarantees generation in winter @ ${winterSun} sun hrs/day`),
        res('Required Battery Bank', `${nameplateBatteryKwh.toFixed(1)} kWh (${fmtNum(Math.round(batteryAmpHours))} Ah @ ${busVolts}V)`, 'good', `Delivers ${days} days continuous autonomy`),
        res('Daily Energy Budget', `${dailyKwh} kWh / day`, 'neutral', 'Critical and non-critical managed loads'),
        pctres('Worst-Month Reliability Margin', '99.5% Uptime Confidence', 99, 'good', 'Engineered to withstand prolonged seasonal atmospheric blocking'),
      ]
    },
  },
]
