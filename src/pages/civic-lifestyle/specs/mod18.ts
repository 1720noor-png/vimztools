import {
  asNum,
  asSel,
  n,
  pctres,
  res,
  sel,
  type CivicSpec,
} from './civicSpec'

export const SUBJECT = 'Stairway Carpentry & Building Codes'

export const MOD18_SPECS: CivicSpec[] = [
  {
    id: 'staircase-stringer-rise-run-irc-sizer',
    name: 'Staircase Stringer Rise, Run & IRC Code Compliance Sizer',
    subject: SUBJECT,
    blurb: 'Calculate exact unit rise, unit run, total stair tread steps, stringer throat depth, and stringer length complying with International Residential Code (IRC R311.7) rules.',
    tip: 'IRC R311.7 stipulates maximum unit rise of 7.75 inches and minimum unit run of 10.0 inches. The classic Blondel rule states: 2 * Rise + Run should equal 24 to 25 inches for optimal ergonomic comfort.',
    usage: [
      'Measure total vertical rise (finished floor to finished floor) in inches.',
      'Select desired tread run depth (10.0" to 11.5" standard).',
      'Select stringer framing lumber stock (2x12 standard).',
    ],
    method: [
      'Number of Risers = round(Total_Rise / Target_Riser_Height 7.5").',
      'Exact Unit Rise = Total_Rise / Number_of_Risers.',
      'Number of Treads = Number_of_Risers - 1.',
      'Total Horizontal Run = Number_of_Treads * Unit_Run.',
      'Stringer Length = sqrt(Total_Rise^2 + Total_Run^2).',
    ],
    fields: [
      n('totalRiseInches', 'Total Vertical Rise (Finished Floor to Floor)', 108.0, 12.0, 300.0, 0.25),
      n('unitRunInches', 'Individual Tread Run Depth (Inches)', 10.5, 9.5, 14.0, 0.25),
      sel('stringerLumber', 'Stringer Stock Framing Material', ['2x12 Lumber (11.25" actual depth - Standard)', 'Engineered LVL Stringer (11.875" depth)']),
    ],
    compute: (v) => {
      const totalRise = asNum(v, 'totalRiseInches', 108.0)
      const unitRun = asNum(v, 'unitRunInches', 10.5)
      const stock = asSel(v, 'stringerLumber', '2x12')

      const targetRiser = 7.25
      const numRisers = Math.round(totalRise / targetRiser)
      const exactUnitRise = totalRise / numRisers
      const numTreads = numRisers - 1
      const totalRunInches = numTreads * unitRun

      // Pythagorean stringer length
      const stringerHypotenuseInches = Math.sqrt(totalRise * totalRise + totalRunInches * totalRunInches)
      const stringerLengthFeet = Math.ceil(stringerHypotenuseInches / 12.0)

      // Blondel rule check: 2R + T = 24 - 25 inches
      const blondelScore = 2 * exactUnitRise + unitRun
      const stairAngleDeg = Math.atan(totalRise / totalRunInches) * (180.0 / Math.PI)

      const isRiseLegal = exactUnitRise <= 7.75 && exactUnitRise >= 4.0
      const isRunLegal = unitRun >= 10.0
      const isCompliant = isRiseLegal && isRunLegal

      const tone: 'good' | 'warn' | 'bad' | 'neutral' = isCompliant ? 'good' : 'bad'

      return [
        res('Unit Riser Height', `${exactUnitRise.toFixed(3)} inches`, isRiseLegal ? 'good' : 'bad', isRiseLegal ? `Complies with IRC max 7.75" (${numRisers} equal risers)` : 'EXCEEDS IRC 7.75" limit!'),
        res('Unit Tread Depth', `${unitRun.toFixed(2)} inches`, isRunLegal ? 'good' : 'bad', isRunLegal ? `Complies with IRC min 10.0" (${numTreads} horizontal treads)` : 'Below IRC 10.0" min tread!'),
        res('Total Horizontal Stair Run', `${(totalRunInches / 12).toFixed(1)} feet (${totalRunInches.toFixed(1)} inches)`, 'neutral', 'Total floor footprint required'),
        res('Stringer Stock Length Required', `${stringerLengthFeet} Foot ${stock.split(' ')[0]} Board`, 'good', `Diagonal hypotenuse: ${stringerHypotenuseInches.toFixed(1)} inches (${stairAngleDeg.toFixed(1)}° pitch)`),
        pctres('Ergonomic Comfort Rating', blondelScore >= 24 && blondelScore <= 25.5 ? '100% Ideal Stride' : '85% Good Stride', blondelScore >= 24 && blondelScore <= 25.5 ? 100 : 85, tone, `Blondel Index: 2R + T = ${blondelScore.toFixed(1)}"`),
      ]
    },
  },
]
