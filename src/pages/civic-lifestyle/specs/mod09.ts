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

export const SUBJECT = 'Flooring & Tile Estimation'

export const MOD09_SPECS: CivicSpec[] = [
  {
    id: 'floor-wall-tile-quantity-waste-sizer',
    name: 'Floor & Wall Tile Quantity, Box Count & Waste Sizer',
    subject: SUBJECT,
    blurb: 'Calculate exact tile counts, retail boxes required, square footage coverage, and cut waste buffers for grid, offset brick, and herringbone tile layouts.',
    tip: 'Straight grid layouts require a 10% cut waste allowance, while 45° diagonal or herringbone patterns require 15% to 20% waste due to triangular edge cuts.',
    usage: [
      'Enter room length and width in feet (or total square feet).',
      'Select individual tile dimensions in inches (e.g. 12"x24", 4"x12" Subway, 12"x12").',
      'Select installation pattern to set the cutting waste factor.',
    ],
    method: [
      'Room Area = Length * Width (sq ft).',
      'Tile Area (sq ft) = (Tile_Width_Inches * Tile_Length_Inches) / 144.',
      'Gross Area with Waste = Room_Area * (1 + Waste_Pct).',
      'Total Tiles = ceil(Gross_Area / Tile_Area).',
    ],
    fields: [
      n('roomLengthFt', 'Room / Floor Length (Feet)', 14.0, 2.0, 100.0, 0.5),
      n('roomWidthFt', 'Room / Floor Width (Feet)', 11.5, 2.0, 100.0, 0.5),
      sel('tileDimensions', 'Tile Size Specification', [
        '12" x 24" Large Format (2.0 sq ft / tile)',
        '12" x 12" Square Standard (1.0 sq ft / tile)',
        '3" x 6" Subway Tile (0.125 sq ft / tile)',
        '24" x 24" Modern Slab (4.0 sq ft / tile)',
      ]),
      sel('layoutPattern', 'Tile Laying Pattern', [
        'Straight Grid / Stacked (10% Cut Waste)',
        'Offset / Running Brick 1/3 (12% Cut Waste)',
        'Herringbone / 45° Diagonal (15% Cut Waste)',
      ]),
      n('sqFtPerBox', 'Retail Box Packaging Size (Sq Ft / Box)', 16.0, 5.0, 50.0, 0.5),
    ],
    compute: (v) => {
      const len = asNum(v, 'roomLengthFt', 14.0)
      const wid = asNum(v, 'roomWidthFt', 11.5)
      const sizeStr = asSel(v, 'tileDimensions', '12" x 24"')
      const pat = asSel(v, 'layoutPattern', 'Straight')
      const boxSqFt = asNum(v, 'sqFtPerBox', 16.0)

      const netRoomSqFt = len * wid

      let wastePct = 0.10
      if (pat.includes('Offset')) wastePct = 0.12
      else if (pat.includes('Herringbone')) wastePct = 0.15

      const grossSqFt = netRoomSqFt * (1 + wastePct)

      let tileSqFt = 2.0
      if (sizeStr.includes('12" x 12"')) tileSqFt = 1.0
      else if (sizeStr.includes('3" x 6"')) tileSqFt = 0.125
      else if (sizeStr.includes('24" x 24"')) tileSqFt = 4.0

      const exactTiles = Math.ceil(grossSqFt / tileSqFt)
      const boxesToBuy = Math.ceil(grossSqFt / boxSqFt)
      const totalPurchasedSqFt = boxesToBuy * boxSqFt

      return [
        res('Boxes to Purchase', `${boxesToBuy} Boxes (${totalPurchasedSqFt.toFixed(1)} sq ft)`, 'good', `@ ${boxSqFt} sq ft per manufacturer box`),
        res('Exact Individual Tile Count', `${fmtNum(exactTiles)} Tiles`, 'neutral', `Includes ${(wastePct * 100).toFixed(0)}% cut waste allowance`),
        res('Net Floor Area', `${netRoomSqFt.toFixed(1)} sq ft`, 'neutral', `Dimensions ${len} ft x ${wid} ft`),
        pctres('Cut Waste Reserve', `${(wastePct * 100).toFixed(0)}% Cutting Waste Factor`, Math.round(wastePct * 100), 'good', pat),
      ]
    },
  },
]
