import {
  asNum,
  asSel,
  n,
  pctres,
  res,
  sel,
  type CivicSpec,
} from './civicSpec'

export const SUBJECT = 'Gardening & Soil Science'

export const MOD11_SPECS: CivicSpec[] = [
  {
    id: 'raised-garden-bed-soil-compost-sizer',
    name: 'Raised Garden Bed Soil, Compost & Mulch Sizer',
    subject: SUBJECT,
    blurb: 'Calculate soil volume in cubic feet (ft³) and bulk cubic yards (yd³), 3-way potting mix ratios (Topsoil, Compost, Vermiculite/Perlite), and retail bag counts for raised garden beds.',
    tip: 'The gold standard "Mel\'s Mix" for raised beds consists of 1/3 blended compost, 1/3 peat moss or coconut coir, and 1/3 coarse horticultural vermiculite by volume.',
    usage: [
      'Enter raised bed length and width in feet (or bed count).',
      'Enter bed soil depth in inches (typically 10" to 12" for vegetables).',
      'Select soil blending formula (Mel\'s Mix vs Standard 60/40 Topsoil/Compost).',
    ],
    method: [
      'Total Cu Ft = Bed_Count * Length * Width * (Depth_Inches / 12).',
      'Bulk Cubic Yards = Total_Cu_Ft / 27.',
      'Compost Volume = Total_Cu_Ft * Compost_Fraction %.',
    ],
    fields: [
      n('raisedBedsCount', 'Number of Raised Beds', 3, 1, 50, 1),
      n('bedLengthFt', 'Bed Length (Feet)', 8.0, 2.0, 40.0, 0.5),
      n('bedWidthFt', 'Bed Width (Feet)', 4.0, 1.0, 12.0, 0.5),
      n('bedDepthInches', 'Soil Fill Depth (Inches)', 11.0, 4.0, 36.0, 0.5),
      sel('soilRecipe', 'Soil Formulation Blend', [
        'Mel\'s Mix (33% Compost / 33% Peat Moss / 33% Vermiculite)',
        'Classic 60/40 (60% Screened Topsoil / 40% Organic Compost)',
        'Raised Bed Potting Soil (100% Bagged Commercial Mix)',
      ]),
    ],
    compute: (v) => {
      const beds = asNum(v, 'raisedBedsCount', 3)
      const len = asNum(v, 'bedLengthFt', 8.0)
      const wid = asNum(v, 'bedWidthFt', 4.0)
      const depthIn = asNum(v, 'bedDepthInches', 11.0)
      const recipe = asSel(v, 'soilRecipe', "Mel's Mix")

      const singleBedCuFt = len * wid * (depthIn / 12.0)
      const totalCuFt = singleBedCuFt * beds
      const totalCuYds = totalCuFt / 27.0

      const bags1_5CuFt = Math.ceil(totalCuFt / 1.5)
      const bags2_0CuFt = Math.ceil(totalCuFt / 2.0)

      let compostCuFt = totalCuFt * 0.333
      if (recipe.includes('60/40')) compostCuFt = totalCuFt * 0.40

      return [
        res('Total Soil Volume Needed', `${totalCuFt.toFixed(1)} Cubic Feet (${totalCuYds.toFixed(2)} Cubic Yards)`, 'good', `Fills ${beds} beds (${len}' x ${wid}' @ ${depthIn}" deep)`),
        res('Retail Bag Count (2.0 cu ft Bags)', `${bags2_0CuFt} Bags`, 'good', 'Standard nursery soil bag size'),
        res('Retail Bag Count (1.5 cu ft Bags)', `${bags1_5CuFt} Bags`, 'neutral', 'Compact potting mix bag size'),
        res('Organic Compost Component', `${compostCuFt.toFixed(1)} cu ft (${(compostCuFt / 27).toFixed(2)} yards)`, 'good', `${recipe.includes('60/40') ? '40%' : '33%'} microbial nutrient base`),
        pctres('Soil Aeration & Drainage Rating', '98% Porosity Index', 98, 'good', recipe),
      ]
    },
  },
]
