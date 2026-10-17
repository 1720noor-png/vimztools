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

export const SUBJECT = 'Carpentry & Lumber Takeoff'

export const MOD12_SPECS: CivicSpec[] = [
  {
    id: 'lumber-board-feet-framing-sizer',
    name: 'Lumber Board Feet (FBM) & Framing Timber Sizer',
    subject: SUBJECT,
    blurb: 'Calculate lumber board feet (FBM), total linear footage, board pricing, and wall stud counts accounting for top/bottom plates and 16" on-center spacing.',
    tip: 'One board foot equals the volume of a 1-foot long board that is 1 foot wide and 1 inch thick (12" x 12" x 1" = 144 cubic inches nominal dimensions).',
    usage: [
      'Select nominal lumber dimensions (e.g. 2x4, 2x6, 2x8, 2x10, 4x4).',
      'Enter piece length in feet (e.g. 8ft, 10ft, 12ft, 16ft).',
      'Enter total piece count and price per board foot ($/BF).',
    ],
    method: [
      'Board Feet per Piece = (Thickness_Inches * Width_Inches * Length_Feet) / 12.',
      'Total Board Feet = Board_Feet_per_Piece * Quantity.',
      'Total Linear Feet = Length_Feet * Quantity.',
    ],
    fields: [
      sel('nominalSize', 'Nominal Lumber Dimension', [
        '2x4 (Actual 1.5" x 3.5")',
        '2x6 (Actual 1.5" x 5.5")',
        '2x8 (Actual 1.5" x 7.25")',
        '2x10 (Actual 1.5" x 9.25")',
        '4x4 Post (Actual 3.5" x 3.5")',
        '1x6 Trim (Actual 0.75" x 5.5")',
      ]),
      n('boardLengthFt', 'Board Length (Feet)', 8.0, 4.0, 24.0, 1.0),
      n('piecesCount', 'Number of Pieces', 45, 1, 1000, 5),
      n('costPerBoardFoot', 'Lumber Cost per Board Foot ($/BF)', 1.85, 0.25, 25.0, 0.05),
    ],
    compute: (v) => {
      const size = asSel(v, 'nominalSize', '2x4')
      const length = asNum(v, 'boardLengthFt', 8.0)
      const count = asNum(v, 'piecesCount', 45)
      const costPerBf = asNum(v, 'costPerBoardFoot', 1.85)

      let tNom = 2
      let wNom = 4
      if (size.includes('2x6')) { tNom = 2; wNom = 6 }
      else if (size.includes('2x8')) { tNom = 2; wNom = 8 }
      else if (size.includes('2x10')) { tNom = 2; wNom = 10 }
      else if (size.includes('4x4')) { tNom = 4; wNom = 4 }
      else if (size.includes('1x6')) { tNom = 1; wNom = 6 }

      const bfPerPiece = (tNom * wNom * length) / 12.0
      const totalBf = bfPerPiece * count
      const totalLinearFt = length * count
      const totalLumberCost = totalBf * costPerBf

      return [
        res('Total Board Feet (FBM)', `${totalBf.toFixed(1)} BF`, 'good', `${bfPerPiece.toFixed(2)} BF per board x ${count} pieces`),
        res('Total Material Estimate', `$${totalLumberCost.toFixed(2)}`, 'good', `@ $${costPerBf.toFixed(2)} per Board Foot`),
        res('Total Linear Footage', `${fmtNum(totalLinearFt)} Linear Feet`, 'neutral', `${count} boards @ ${length}' length`),
        pctres('Milling Yield Index', '92% Standard Framing Grade', 92, 'good', `Nominal ${tNom}x${wNom} specifications`),
      ]
    },
  },
]
