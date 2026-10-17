import {
  type HouseholdSpec,
  n,
  sel,
  ck,
  res,
  asNum,
  asSel,
  money,
  pct,
  num,
  numD,
} from './householdSpec'

const SUB = 'DIY'
const SUB_ID = 'diy'

export const diySpecs: HouseholdSpec[] = [
  {
    id: 'diy-material-quantity-estimator',
    name: 'DIY Material Quantity Estimator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate raw material volumes, surface areas, and recommended cut-waste overage allowances for any home craft project.',
    tip: 'Always order 10% extra for straight cuts and 15% extra for diagonal, herringbone, or complex irregular angles.',
    usage: [
      'Enter total surface area or linear dimensions.',
      'Select material type (Lumber, Tile, Flooring, Sheet goods).',
      'Select layout complexity to set cut-waste buffer.',
      'Check net material and recommended order quantity with overage.',
    ],
    method: [
      'Order Quantity = Net Area * (1 + Waste Percentage / 100).',
    ],
    fields: [
      n('netArea', 'Net Project Area (Square Feet)', { def: 180, min: 5, max: 5000, step: 5 }),
      sel('wasteBuffer', 'Cutting Waste & Scrap Allowance', [
        'Standard Rectangular Room (+10% waste)',
        'Diagonal / Herringbone Pattern (+15% waste)',
        'Complex Nooks & Pillars (+20% waste)',
        'Minimal Straight Cuts (+7% waste)',
      ], 'Standard Rectangular Room (+10% waste)'),
      n('unitCost', 'Estimated Material Cost per Sq Ft ($)', { def: 4.5, min: 0.5, max: 50, step: 0.25 }),
    ],
    compute: (v) => {
      const net = asNum(v.netArea, 180)
      const wb = asSel(v.wasteBuffer)
      const costPerSq = asNum(v.unitCost, 4.5)

      let wastePct = 0.10
      if (wb.includes('15%')) wastePct = 0.15
      else if (wb.includes('20%')) wastePct = 0.20
      else if (wb.includes('7%')) wastePct = 0.07

      const grossArea = net * (1 + wastePct)
      const wasteSqft = grossArea - net
      const totalCost = grossArea * costPerSq

      return [
        res('Recommended Order Quantity', `${num(Math.round(grossArea))} sq ft`, 'good', `Includes ${Math.round(wastePct * 100)}% scrap buffer`),
        res('Net Project Area', `${num(net)} sq ft`, 'neutral', 'Exact finished surface'),
        res('Scrap / Cutting Reserve', `${numD(wasteSqft, 1)} sq ft`, 'info', 'Protects against mis-cuts & breakage'),
        res('Estimated Material Cost', money(totalCost), 'neutral', `@ ${money(costPerSq)}/sq ft`),
      ]
    },
  },
  {
    id: 'diy-project-time-estimator',
    name: 'DIY Project Time Estimator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Estimate total weekend hours and calendar days required for DIY tasks accounting for prep, drying, and clean-up.',
    tip: 'Novice DIYers usually take 2x to 3x longer than professional videos suggest because prep and drying times are omitted.',
    usage: [
      'Select project type and scope.',
      'Select your DIY experience level.',
      'Enter hours available to work per weekend day.',
      'Check estimated total labor hours, dry times, and expected calendar weekends.',
    ],
    method: [
      'Total Time = (Base Task Hours * Experience Multiplier) + Mandatory Drying/Curing Hours.',
    ],
    fields: [
      sel('projectType', 'DIY Project Scope', [
        'Paint Single Room Walls & Trim (~10 base hrs)',
        'Install Vinyl Plank Flooring 200 sq ft (~14 base hrs)',
        'Build Wooden Bookshelf / Bench (~12 base hrs)',
        'Tile Bathroom Backsplash 30 sq ft (~16 base hrs)',
        'Assemble Multi-Piece Flat Pack Furniture (~6 base hrs)',
      ], 'Paint Single Room Walls & Trim (~10 base hrs)'),
      sel('experience', 'Your DIY Experience Level', [
        'Beginner / First Time (2.0x multiplier)',
        'Intermediate / Have basic power tools (1.3x multiplier)',
        'Experienced Handyperson (1.0x baseline)',
      ], 'Intermediate / Have basic power tools (1.3x multiplier)'),
      n('hoursPerDay', 'Available Working Hours per Day', { def: 5, min: 1, max: 12, step: 0.5 }),
    ],
    compute: (v) => {
      const pt = asSel(v.projectType)
      const exp = asSel(v.experience)
      const dailyHours = asNum(v.hoursPerDay, 5)

      let baseHrs = 10
      if (pt.includes('Flooring')) baseHrs = 14
      else if (pt.includes('Bookshelf')) baseHrs = 12
      else if (pt.includes('Tile')) baseHrs = 16
      else if (pt.includes('Assemble')) baseHrs = 6

      const mult = exp.includes('2.0x') ? 2.0 : exp.includes('1.3x') ? 1.3 : 1.0
      const activeWorkHours = baseHrs * mult
      const dryHours = pt.includes('Paint') ? 8 : pt.includes('Tile') ? 24 : 0
      const daysNeeded = Math.ceil(activeWorkHours / dailyHours)
      const weekendsNeeded = Math.ceil(daysNeeded / 2)

      return [
        res('Active Work Time', `${numD(activeWorkHours, 1)} hours`, 'good', `Prep, assembly & clean-up`),
        res('Estimated Working Days', `${daysNeeded} days`, daysNeeded > 4 ? 'warn' : 'good', `@ ${dailyHours} hrs/day`),
        res('Calendar Timeline', `${weekendsNeeded} weekend${weekendsNeeded > 1 ? 's' : ''}`, 'info', 'Realistic calendar pacing'),
        res('Drying / Curing Wait', `${dryHours} hours required`, dryHours > 0 ? 'warn' : 'neutral', 'Do not rush before next step'),
      ]
    },
  },
  {
    id: 'diy-project-budget-planner',
    name: 'DIY Project Budget Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Itemize materials, tool purchases/rentals, fasteners, safety gear, and waste disposal fees for DIY projects.',
    tip: 'Tool rentals and specialty drill bits often add 20-30% to a first-time DIYer\'s materials-only budget.',
    usage: [
      'Enter raw material budget.',
      'Enter tool purchase or rental allowances.',
      'Check total project cost and calculate savings vs professional contractor quotes.',
    ],
    method: [
      'Total DIY = Materials + Fasteners/Consumables + Tool Rentals/Purchases + Waste Disposal.',
      'Savings = Contractor Quote - Total DIY.',
    ],
    fields: [
      n('materialCost', 'Primary Materials Cost ($)', { def: 420, min: 20, max: 15000, step: 10 }),
      n('fastenersCost', 'Fasteners, Adhesives & Sandpaper ($)', { def: 45, min: 0, max: 1000, step: 5 }),
      n('toolCosts', 'New Tool Purchases / Tool Rentals ($)', { def: 75, min: 0, max: 2000, step: 10 }),
      n('safetyDisposal', 'Safety Gear & Waste Disposal ($)', { def: 30, min: 0, max: 500, step: 5 }),
      n('contractorQuote', 'Equivalent Professional Contractor Quote ($)', { def: 1400, min: 100, max: 30000, step: 50 }),
    ],
    compute: (v) => {
      const mat = asNum(v.materialCost, 420)
      const fast = asNum(v.fastenersCost, 45)
      const tools = asNum(v.toolCosts, 75)
      const disp = asNum(v.safetyDisposal, 30)
      const quote = asNum(v.contractorQuote, 1400)

      const totalDiy = mat + fast + tools + disp
      const netSavings = Math.max(0, quote - totalDiy)
      const savingsPct = (netSavings / Math.max(1, quote)) * 100

      return [
        res('Total DIY Project Cost', money(totalDiy), 'good', 'All-inclusive investment'),
        res('Sweat Equity Savings', money(netSavings), 'good', `You save ${pct(savingsPct)} vs contractor`),
        res('Materials vs Tool Share', `${Math.round((mat / totalDiy) * 100)}% materials / ${Math.round((tools / totalDiy) * 100)}% tools`, 'info', 'Tool assets kept for future jobs'),
        res('Verdict', totalDiy < quote * 0.6 ? 'High Financial DIY Win' : 'Moderate Savings DIY', 'good', 'Based on labor differential'),
      ]
    },
  },
  {
    id: 'wood-project-material-calculator',
    name: 'Wood Project Material Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate standard dimensional lumber board counts (2x4, 2x6, 1x4, 1x6) needed for framing, decks, and benches.',
    tip: 'Remember that a nominal 2x4 actually measures 1.5 inches by 3.5 inches in finished dimensional lumber.',
    usage: [
      'Select lumber nominal dimension.',
      'Enter total linear feet needed.',
      'Select stock board length to purchase (8 ft, 10 ft, 12 ft).',
      'Check how many stock boards to buy with cut-kerf waste accounted for.',
    ],
    method: [
      'Boards Needed = Ceil(Total Linear Feet * 1.10 / Stock Board Length).',
    ],
    fields: [
      sel('nominalSize', 'Nominal Lumber Size', [
        '2x4 (Actual 1.5" x 3.5")',
        '2x6 (Actual 1.5" x 5.5")',
        '2x8 (Actual 1.5" x 7.25")',
        '1x4 (Actual 0.75" x 3.5")',
        '1x6 (Actual 0.75" x 5.5")',
        '4x4 Post (Actual 3.5" x 3.5")',
      ], '2x4 (Actual 1.5" x 3.5")'),
      n('totalLinearFeet', 'Total Linear Feet Required', { def: 74, min: 4, max: 2000, step: 2 }),
      sel('stockLength', 'Standard Stock Board Length to Buy', [
        '8-Foot Boards',
        '10-Foot Boards',
        '12-Foot Boards',
        '16-Foot Boards',
      ], '8-Foot Boards'),
      n('costPerBoard', 'Price per Stock Board ($)', { def: 4.85, min: 1, max: 50, step: 0.25 }),
    ],
    compute: (v) => {
      const size = asSel(v.nominalSize)
      const linFt = asNum(v.totalLinearFeet, 74)
      const sl = asSel(v.stockLength)
      const costBoard = asNum(v.costPerBoard, 4.85)

      const stockLen = sl.includes('10-Foot') ? 10 : sl.includes('12-Foot') ? 12 : sl.includes('16-Foot') ? 16 : 8
      const bufferedFt = linFt * 1.10 // 10% kerf and trim waste
      const boardsToBuy = Math.ceil(bufferedFt / stockLen)
      const totalCost = boardsToBuy * costBoard
      const totalPurchasedFt = boardsToBuy * stockLen

      return [
        res('Boards to Purchase', `${boardsToBuy} boards`, 'good', `${stockLen}-foot lengths`),
        res('Total Lumber Cost', money(totalCost), 'neutral', `@ ${money(costBoard)}/board`),
        res('Purchased Linear Feet', `${totalPurchasedFt} linear ft`, 'info', `${linFt} ft net project requirement`),
        res('Actual Lumber Dimensions', size.split('(')[1]?.replace(')', '') || 'Finished dimensional', 'neutral', 'Plan joinery with actual sizes'),
      ]
    },
  },
  {
    id: 'wood-board-feet-calculator',
    name: 'Wood Board Feet Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate hardwood lumber board feet (BF) volume and cost for oak, walnut, maple, and cherry woodworking projects.',
    tip: 'One board foot equals 144 cubic inches of lumber (equivalent to a board 12" wide, 12" long, and 1" thick).',
    usage: [
      'Enter thickness in inches (4/4 = 1", 8/4 = 2").',
      'Enter board width in inches and length in feet.',
      'Enter piece quantity and price per board foot ($/BF).',
      'Check total Board Feet volume and wholesale hardwood cost.',
    ],
    method: [
      'Board Feet = (Thickness (in) * Width (in) * Length (ft) * Quantity) / 12.',
    ],
    fields: [
      n('thicknessInches', 'Thickness in Inches (e.g. 1" for 4/4)', { def: 1.0, min: 0.5, max: 6.0, step: 0.25 }),
      n('widthInches', 'Board Width (Inches)', { def: 6.0, min: 1, max: 24, step: 0.5 }),
      n('lengthFeet', 'Board Length (Feet)', { def: 8.0, min: 1, max: 20, step: 0.5 }),
      n('quantity', 'Quantity of Identical Boards', { def: 4, min: 1, max: 50, step: 1 }),
      n('pricePerBf', 'Hardwood Price per Board Foot ($/BF)', { def: 8.50, min: 1, max: 40, step: 0.50 }),
    ],
    compute: (v) => {
      const t = asNum(v.thicknessInches, 1.0)
      const w = asNum(v.widthInches, 6.0)
      const l = asNum(v.lengthFeet, 8.0)
      const qty = asNum(v.quantity, 4)
      const price = asNum(v.pricePerBf, 8.50)

      const bfPerPiece = (t * w * l) / 12
      const totalBf = bfPerPiece * qty
      const totalCost = totalBf * price

      return [
        res('Total Board Feet', `${numD(totalBf, 2)} BF`, 'good', `${qty} boards total`),
        res('Board Feet per Piece', `${numD(bfPerPiece, 2)} BF`, 'info', `${t}" x ${w}" x ${l} ft`),
        res('Total Hardwood Cost', money(totalCost), 'good', `@ ${money(price)}/BF`),
        res('Rough Lumber Waste Buffer', `${numD(totalBf * 1.20, 2)} BF recommended`, 'neutral', 'Account for jointer/planer flattening'),
      ]
    },
  },
  {
    id: 'wood-cutting-list-generator',
    name: 'Wood Cutting List Generator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Organize cut parts for woodworking projects and calculate standard 8 ft or 10 ft boards needed with blade kerf deduction.',
    tip: 'Always account for the 1/8" (0.125") blade kerf removed by circular saw and miter saw blades on each cut.',
    usage: [
      'Enter total cut pieces needed at various length specs.',
      'Check recommended stock 8-foot lumber boards to purchase.',
      'View cut yield summary and scrap waste percentage.',
    ],
    method: [
      'Sums total piece inches + (cut count * 0.125" kerf). Converts to standard 96" stock boards.',
    ],
    fields: [
      n('piecesLong', 'Long Pieces Needed (e.g. 48" rails)', { def: 4, min: 0, max: 30, step: 1 }),
      n('lengthLongIn', 'Length of Long Pieces (Inches)', { def: 48, min: 10, max: 96, step: 1 }),
      n('piecesShort', 'Short Pieces Needed (e.g. 18" stretchers)', { def: 8, min: 0, max: 50, step: 1 }),
      n('lengthShortIn', 'Length of Short Pieces (Inches)', { def: 18, min: 4, max: 48, step: 1 }),
      n('stockBoardLenFt', 'Stock Board Length (Feet)', { def: 8, min: 6, max: 16, step: 2 }),
    ],
    compute: (v) => {
      const nL = asNum(v.piecesLong, 4)
      const lL = asNum(v.lengthLongIn, 48)
      const nS = asNum(v.piecesShort, 8)
      const lS = asNum(v.lengthShortIn, 18)
      const stockFt = asNum(v.stockBoardLenFt, 8)

      const stockIn = stockFt * 12
      const kerf = 0.125
      const totalCutCount = nL + nS
      const netPieceInches = (nL * lL) + (nS * lS)
      const totalInchesWithKerf = netPieceInches + (totalCutCount * kerf)

      // Bin packing approximation with 12% safety
      const boardsNeeded = Math.ceil((totalInchesWithKerf * 1.12) / stockIn)
      const totalStockInches = boardsNeeded * stockIn
      const wasteInches = totalStockInches - netPieceInches
      const wastePct = (wasteInches / totalStockInches) * 100

      return [
        res('Stock Boards to Buy', `${boardsNeeded} boards`, 'good', `${stockFt}-foot stock lengths`),
        res('Total Cut Pieces', `${totalCutCount} finished parts`, 'info', `${nL} @ ${lL}" + ${nS} @ ${lS}"`),
        res('Kerf Loss', `${numD((totalCutCount * kerf), 1)} inches saw dust`, 'neutral', '1/8" per cut blade allowance'),
        res('Scrap Off-Cut Rate', pct(wastePct), wastePct < 20 ? 'good' : 'warn', `${Math.round(wasteInches / 12)} ft total offcuts`),
      ]
    },
  },
  {
    id: 'plywood-sheet-calculator',
    name: 'Plywood Sheet Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate full 4x8 ft (32 sq ft) plywood or OSB sheets required for cabinetry, subflooring, and wall sheathing.',
    tip: 'A standard 4x8 sheet provides 32 square feet; plan cut layouts carefully to align cabinet face grain direction.',
    usage: [
      'Enter total surface area needed in square feet.',
      'Select cut complexity (Cabinet parts vs large sheathing).',
      'Enter sheet price ($/sheet).',
      'Check sheets required and total expenditure.',
    ],
    method: [
      'Sheets = Ceil(Net Area * (1 + Scrap Pct) / 32).',
    ],
    fields: [
      n('netSqft', 'Net Surface Area Required (sq ft)', { def: 125, min: 10, max: 3000, step: 5 }),
      sel('cutComplexity', 'Project Type & Cut Complexity', [
        'Large Wall / Roof Sheathing (+10% scrap)',
        'Cabinet Boxes / Shelving Parts (+15% scrap)',
        'Intricate Multi-Size Furniture Parts (+22% scrap)',
      ], 'Cabinet Boxes / Shelving Parts (+15% scrap)'),
      n('sheetPrice', 'Price per 4x8 Sheet ($)', { def: 48, min: 15, max: 160, step: 2 }),
    ],
    compute: (v) => {
      const net = asNum(v.netSqft, 125)
      const cc = asSel(v.cutComplexity)
      const price = asNum(v.sheetPrice, 48)

      const scrap = cc.includes('22%') ? 0.22 : cc.includes('10%') ? 0.10 : 0.15
      const grossSqft = net * (1 + scrap)
      const sheets = Math.ceil(grossSqft / 32)
      const totalCost = sheets * price
      const totalPurchasedSqft = sheets * 32

      return [
        res('4x8 Sheets to Buy', `${sheets} sheets`, 'good', '4 ft x 8 ft (32 sq ft each)'),
        res('Total Plywood Cost', money(totalCost), 'neutral', `@ ${money(price)}/sheet`),
        res('Purchased Surface Area', `${totalPurchasedSqft} sq ft`, 'info', `${net} sq ft net required`),
        res('Yield Utilization', pct((net / totalPurchasedSqft) * 100), 'good', 'Efficient sheet usage'),
      ]
    },
  },
  {
    id: 'mdf-sheet-calculator',
    name: 'MDF Sheet Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate Medium-Density Fiberboard (MDF) sheets and sheet weights for painted shelving and interior moldings.',
    tip: 'A full 3/4-inch 4x8 sheet of MDF weighs nearly 95 lbs (43 kg); always have a helper or break it down with a track saw.',
    usage: [
      'Enter total finished MDF surface area.',
      'Select thickness (1/2" vs 3/4").',
      'Check sheets required and total lifting weight.',
    ],
    method: [
      'Sheets = Ceil(Net Area * 1.15 / 32).',
      'Weight = Sheets * (3/4" MDF = 92 lbs, 1/2" MDF = 62 lbs).',
    ],
    fields: [
      n('netSqft', 'Net MDF Area (Square Feet)', { def: 75, min: 10, max: 1500, step: 5 }),
      sel('thickness', 'MDF Board Thickness', [
        '3/4" (Heavy-duty shelving, cabinets ~92 lbs/sheet)',
        '1/2" (Drawer bottoms, wainscoting ~62 lbs/sheet)',
        '1/4" (Backing panels ~32 lbs/sheet)',
      ], '3/4" (Heavy-duty shelving, cabinets ~92 lbs/sheet)'),
      n('sheetPrice', 'Price per 4x8 MDF Sheet ($)', { def: 42, min: 15, max: 120, step: 2 }),
    ],
    compute: (v) => {
      const net = asNum(v.netSqft, 75)
      const th = asSel(v.thickness)
      const price = asNum(v.sheetPrice, 42)

      const weightPerSheet = th.includes('1/2"') ? 62 : th.includes('1/4"') ? 32 : 92
      const grossSqft = net * 1.15
      const sheets = Math.ceil(grossSqft / 32)
      const totalWeight = sheets * weightPerSheet
      const totalCost = sheets * price

      return [
        res('MDF 4x8 Sheets', `${sheets} sheets`, 'good', '4 ft x 8 ft boards'),
        res('Total Material Weight', `${totalWeight} lbs`, totalWeight > 180 ? 'warn' : 'neutral', `${weightPerSheet} lbs per sheet`),
        res('Total MDF Cost', money(totalCost), 'good', `@ ${money(price)}/sheet`),
        res('Handling Safety Tip', 'Wear N95 respirator when cutting MDF', 'warn', 'Fine silica and resin dust hazards'),
      ]
    },
  },
  {
    id: 'paint-mixing-ratio-calculator',
    name: 'Paint Mixing Ratio Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate exact volumetric ratios for thinning paint for HVLP spray guns, mixing 2-part epoxy, or custom tints.',
    tip: 'Latex paint sprayed through an HVLP gun typically requires 10% to 15% water or Floetrol to prevent nozzle clogging.',
    usage: [
      'Enter total target mixed liquid volume (fl oz or ml).',
      'Select mixing formula (HVLP latex thinning, 2:1 epoxy resin, 4:1 automotive clear).',
      'Check exact ounces/milliliters for Part A and Part B/additive.',
    ],
    method: [
      'Part A = Total * (Ratio A / (Ratio A + Ratio B)).',
      'Part B = Total * (Ratio B / (Ratio A + Ratio B)).',
    ],
    fields: [
      n('totalVolumeOz', 'Total Mixed Batch Volume (Fluid Ounces)', { def: 32, min: 2, max: 256, step: 2 }),
      sel('mixingRatio', 'Mix Ratio Formula (Base : Additive)', [
        'HVLP Latex Thinning (10:1 Paint to Water/Floetrol ~10%)',
        'HVLP Heavy Thinning (6:1 Paint to Thinner ~15%)',
        '2-Part Epoxy Resin (1:1 Equal Parts by Volume)',
        '2-Part Epoxy Coating (2:1 Resin to Hardener)',
        'Polyurethane Varnish Thinning (4:1 Varnish to Mineral Spirits)',
      ], 'HVLP Latex Thinning (10:1 Paint to Water/Floetrol ~10%)'),
    ],
    compute: (v) => {
      const totalOz = asNum(v.totalVolumeOz, 32)
      const mr = asSel(v.mixingRatio)

      let rA = 10
      let rB = 1
      if (mr.includes('6:1')) { rA = 6; rB = 1 }
      else if (mr.includes('1:1')) { rA = 1; rB = 1 }
      else if (mr.includes('2:1')) { rA = 2; rB = 1 }
      else if (mr.includes('4:1')) { rA = 4; rB = 1 }

      const sum = rA + rB
      const baseOz = totalOz * (rA / sum)
      const additiveOz = totalOz * (rB / sum)

      const baseMl = Math.round(baseOz * 29.57)
      const addMl = Math.round(additiveOz * 29.57)

      return [
        res('Part A (Base Paint / Resin)', `${numD(baseOz, 1)} fl oz`, 'good', `${baseMl} ml`),
        res('Part B (Thinner / Hardener)', `${numD(additiveOz, 1)} fl oz`, 'info', `${addMl} ml`),
        res('Total Batch Volume', `${totalOz} fl oz`, 'neutral', `${Math.round(totalOz * 29.57)} ml (${numD(totalOz / 128, 2)} Gallons)`),
        res('Mixing Guidance', 'Stir slowly for 3 minutes to avoid micro-bubbles', 'good', 'Check viscosity with Zahn cup if spraying'),
      ]
    },
  },
  {
    id: 'concrete-mix-ratio-calculator',
    name: 'Concrete Mix Ratio Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate classic 1:2:3 cement, sand, and gravel proportion weights for high-strength homemade concrete.',
    tip: 'The standard 1:2:3 ratio (1 part Portland cement, 2 parts sand, 3 parts gravel) yields ~3,000 PSI structural concrete.',
    usage: [
      'Enter total concrete volume needed in cubic feet.',
      'Check Portland cement bags, sand weight, gravel weight, and water needed.',
    ],
    method: [
      '1 cu yard (27 cu ft) concrete requires: 6 bags Portland cement (94 lb), 1,400 lb sand, 1,900 lb gravel, 35 gal water.',
    ],
    fields: [
      n('concreteCuFt', 'Total Concrete Volume Needed (Cubic Feet)', { def: 12, min: 1, max: 100, step: 0.5 }),
      sel('mixStrength', 'Mix Strength & Ratio', [
        'Standard General Purpose (1:2:3 Ratio ~3,000 PSI)',
        'High Strength Footings (1:1.5:3 Ratio ~4,000 PSI)',
        'Mortar for Bricks (1:3 Cement to Sand / No Gravel)',
      ], 'Standard General Purpose (1:2:3 Ratio ~3,000 PSI)'),
    ],
    compute: (v) => {
      const cuFt = asNum(v.concreteCuFt, 12)
      const str = asSel(v.mixStrength)

      const cuYd = cuFt / 27
      const cementBags94 = cuYd * (str.includes('High') ? 7.5 : 6.0)
      const sandLbs = cuYd * (str.includes('Mortar') ? 2200 : 1400)
      const gravelLbs = str.includes('Mortar') ? 0 : cuYd * 1900
      const waterGal = cuYd * 34

      return [
        res('Portland Cement (94 lb bags)', `${numD(cementBags94, 1)} bags`, 'good', `~${Math.round(cementBags94 * 94)} lbs cement`),
        res('Washed Sand', `${num(Math.round(sandLbs))} lbs`, 'info', `~${numD(sandLbs / 2000, 2)} tons`),
        res('Coarse Gravel / Stone', str.includes('Mortar') ? 'None (Mortar mix)' : `${num(Math.round(gravelLbs))} lbs`, 'neutral', str.includes('Mortar') ? 'No gravel' : `~${numD(gravelLbs / 2000, 2)} tons`),
        res('Clean Mixing Water', `~${numD(waterGal, 1)} gallons`, 'warn', 'Add water gradually; excess weakens concrete'),
      ]
    },
  },
  {
    id: 'concrete-volume-estimator',
    name: 'Concrete Volume Estimator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate concrete slab volume in cubic yards and pre-mixed 60 lb or 80 lb Sakrete bags needed.',
    tip: 'Always round up by 10% on concrete orders to account for subgrade unevenness and form board deflection.',
    usage: [
      'Enter slab length, width, and thickness in inches.',
      'Check cubic yards for ready-mix truck delivery vs count of 80 lb pre-mix bags.',
    ],
    method: [
      'Cu Yards = (Length ft * Width ft * (Thickness in / 12)) / 27.',
      '1 Cu Yard = 45 bags of 60 lb or 33.75 bags of 80 lb concrete mix.',
    ],
    fields: [
      n('lengthFeet', 'Slab Length (Feet)', { def: 12, min: 2, max: 100, step: 0.5 }),
      n('widthFeet', 'Slab Width (Feet)', { def: 10, min: 2, max: 60, step: 0.5 }),
      n('thicknessInches', 'Slab Thickness (Inches)', { def: 4.0, min: 2, max: 12, step: 0.5 }),
    ],
    compute: (v) => {
      const l = asNum(v.lengthFeet, 12)
      const w = asNum(v.widthFeet, 10)
      const t = asNum(v.thicknessInches, 4.0)

      const cuFt = l * w * (t / 12)
      const cuYdNet = cuFt / 27
      const cuYdWithWaste = cuYdNet * 1.10

      const bags80 = Math.ceil(cuYdWithWaste * 33.75)
      const bags60 = Math.ceil(cuYdWithWaste * 45)

      return [
        res('Ready-Mix Volume', `${numD(cuYdWithWaste, 2)} cubic yards`, 'good', `${numD(cuFt * 1.10, 1)} cu ft with 10% buffer`),
        res('80 lb Pre-Mix Bags', `${bags80} bags`, bags80 > 40 ? 'warn' : 'good', 'Convenient for DIY mixers'),
        res('60 lb Pre-Mix Bags', `${bags60} bags`, 'info', 'Lighter to lift and load'),
        res('Delivery Recommendation', cuYdWithWaste >= 1.5 ? 'Order Ready-Mix Short Load Truck' : 'Mix Bags on Site (Wheelbarrow)', 'neutral', 'Threshold: ~1.5 cu yards'),
      ]
    },
  },
  {
    id: 'brick-wall-quantity-calculator',
    name: 'Brick Wall Quantity Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate standard modular bricks and mortar bags required for garden walls, firepits, and accent masonry.',
    tip: 'A standard modular brick wall requires approximately 7 bricks per square foot for a single wythe (layer).',
    usage: [
      'Enter wall length and height in feet.',
      'Select wall structure (Single brick layer vs Double structural wythe).',
      'Check bricks needed and premixed mortar bags required.',
    ],
    method: [
      'Bricks = Wall Sq Ft * 7 bricks/sqft * (Wythes) * 1.08 (8% breakage).',
      'Mortar = ~1 bag (80 lb) per 35-40 modular bricks.',
    ],
    fields: [
      n('wallLengthFeet', 'Wall Length (Feet)', { def: 15, min: 2, max: 100, step: 0.5 }),
      n('wallHeightFeet', 'Wall Height (Feet)', { def: 3.5, min: 1, max: 12, step: 0.5 }),
      sel('wallType', 'Wall Thickness / Wythe', [
        'Single Wythe (Decorative / Veneer ~7 bricks/sqft)',
        'Double Wythe (Freestanding structural wall ~14 bricks/sqft)',
      ], 'Single Wythe (Decorative / Veneer ~7 bricks/sqft)'),
      n('brickCost', 'Cost per Brick ($)', { def: 0.75, min: 0.3, max: 3.0, step: 0.05 }),
    ],
    compute: (v) => {
      const len = asNum(v.wallLengthFeet, 15)
      const h = asNum(v.wallHeightFeet, 3.5)
      const wt = asSel(v.wallType)
      const cost = asNum(v.brickCost, 0.75)

      const sqft = len * h
      const bricksPerSqft = wt.includes('Double') ? 14 : 7
      const totalBricks = Math.ceil(sqft * bricksPerSqft * 1.08) // 8% breakage
      const mortarBags80 = Math.ceil(totalBricks / 35)
      const materialCost = (totalBricks * cost) + (mortarBags80 * 8.5)

      return [
        res('Standard Bricks Required', `${num(totalBricks)} bricks`, 'good', `Includes 8% cut/breakage buffer`),
        res('Type N Mortar Bags (80 lb)', `${mortarBags80} bags`, 'info', 'Masonry mortar mix'),
        res('Total Wall Area', `${numD(sqft, 1)} sq ft`, 'neutral', `${len} ft long x ${h} ft high`),
        res('Estimated Material Cost', money(materialCost), 'good', `Bricks + mortar`),
      ]
    },
  },
  {
    id: 'wall-repair-material-calculator',
    name: 'Wall Repair Material Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Estimate spackle, joint compound, mesh tape, and drywall patches needed for wall repairs.',
    tip: 'Use lightweight spackle for small nail holes; use setting-type joint compound (easy sand 45) for large door handle holes.',
    usage: [
      'Enter count of small nail holes and larger doorknob-sized holes.',
      'Check compound volume, mesh patch kits, and sandpaper grits required.',
    ],
    method: [
      'Calculates repair consumables list based on hole dimensions.',
    ],
    fields: [
      n('smallHoles', 'Nail & Picture Frame Holes (< 0.5")', { def: 12, min: 0, max: 100, step: 1 }),
      n('mediumHoles', 'Doorknob / Anchor Holes (1" - 4")', { def: 2, min: 0, max: 20, step: 1 }),
      n('largeHoles', 'Large Drywall Cutouts (> 5")', { def: 0, min: 0, max: 10, step: 1 }),
    ],
    compute: (v) => {
      const small = asNum(v.smallHoles, 12)
      const med = asNum(v.mediumHoles, 2)
      const large = asNum(v.largeHoles, 0)

      const compoundOz = (small * 0.5) + (med * 6) + (large * 24)

      return [
        res('Joint Compound / Spackle', `${Math.round(compoundOz)} fl oz`, 'good', compoundOz > 32 ? '1-Gallon Tub recommended' : '1-Quart Tub sufficient'),
        res('Self-Adhesive Mesh Patches', `${med} patch kits`, med > 0 ? 'warn' : 'good', '4"x4" or 6"x6" aluminum mesh patches'),
        res('Drywall Backer Board', large > 0 ? `${large} drywall cutout pieces needed` : 'None needed', large > 0 ? 'warn' : 'good', 'With wood backer cleats'),
        res('Recommended Sandpaper Grits', '120 grit rough + 220 grit feathering', 'info', 'Use sanding sponge to minimize dust'),
      ]
    },
  },
  {
    id: 'drywall-material-calculator',
    name: 'Drywall Material Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate 4x8 or 4x12 drywall sheets, joint tape, compound buckets, and drywall screws for room finishing.',
    tip: 'Using 4x12 drywall sheets reduces vertical taped seams by 25% compared to 4x8 sheets on long walls.',
    usage: [
      'Enter room length, width, and ceiling height in feet.',
      'Check sheets required for walls and ceiling, joint tape rolls, and 5-gallon compound buckets.',
    ],
    method: [
      'Wall Area = 2 * (L + W) * H. Ceiling Area = L * W. Deduct 10% for windows/doors.',
      'Sheets = Total Area / Sheet Size (32 for 4x8, 48 for 4x12).',
      'Joint compound = ~0.053 gallons per sq ft of drywall.',
    ],
    fields: [
      n('roomLength', 'Room Length (Feet)', { def: 16, min: 8, max: 50, step: 0.5 }),
      n('roomWidth', 'Room Width (Feet)', { def: 12, min: 8, max: 40, step: 0.5 }),
      n('ceilingHeight', 'Ceiling Height (Feet)', { def: 8, min: 8, max: 14, step: 0.5 }),
      sel('sheetSize', 'Drywall Sheet Size', [
        '4x8 Sheets (32 sq ft per sheet)',
        '4x12 Sheets (48 sq ft per sheet - Fewer seams)',
      ], '4x8 Sheets (32 sq ft per sheet)'),
      ck('includeCeiling', 'Include Ceiling Drywall', true),
    ],
    compute: (v) => {
      const l = asNum(v.roomLength, 16)
      const w = asNum(v.roomWidth, 12)
      const h = asNum(v.ceilingHeight, 8)
      const ss = asSel(v.sheetSize)
      const ceil = v.includeCeiling

      const wallGross = 2 * (l + w) * h
      const wallNet = wallGross * 0.90 // 10% door/window deduction
      const ceilingSqft = ceil ? l * w : 0
      const totalSqft = (wallNet + ceilingSqft) * 1.10 // 10% cut scrap

      const sheetSqft = ss.includes('4x12') ? 48 : 32
      const sheetCount = Math.ceil(totalSqft / sheetSqft)
      const compoundGal = Math.ceil((wallNet + ceilingSqft) * 0.053)
      const buckets5Gal = Math.ceil(compoundGal / 4.5)
      const tapeFeet = Math.ceil(sheetCount * 32)
      const screwsCount = Math.ceil(sheetCount * 32) // ~32 screws per sheet

      return [
        res('Drywall Sheets Needed', `${sheetCount} sheets`, 'good', ss.split('(')[0].trim()),
        res('Total Surface Area', `${num(Math.round(wallNet + ceilingSqft))} sq ft`, 'info', `${ceil ? 'Walls + Ceiling' : 'Walls only'}`),
        res('Joint Compound', `${buckets5Gal} buckets (4.5 gal)`, 'good', `~${compoundGal} gallons total`),
        res('Tape & Screws', `${tapeFeet} ft tape / ~${screwsCount} screws`, 'neutral', '1-1/4" coarse drywall screws'),
      ]
    },
  },
  {
    id: 'plaster-quantity-calculator',
    name: 'Plaster Quantity Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate basecoat and finish plaster bags required for historic wall restoration and smooth masonry skim coats.',
    tip: 'A 50 lb (22.7 kg) bag of gypsum finish plaster covers approximately 100-120 square feet at 1/16" thickness.',
    usage: [
      'Enter wall surface area in square feet.',
      'Select plaster application (Thin skim coat vs 2-coat restoration).',
      'Check bags of plaster and clean mixing water required.',
    ],
    method: [
      'Skim coat (1/16"): 1 bag (50 lb) per 110 sq ft.',
      'Basecoat (3/8"): 1 bag (50 lb) per 25 sq ft.',
    ],
    fields: [
      n('wallAreaSqft', 'Wall Surface Area (sq ft)', { def: 250, min: 20, max: 2500, step: 10 }),
      sel('plasterType', 'Plaster Application Type', [
        'Smooth Skim Coat (1/16" thick ~110 sq ft/bag)',
        'Heavy Basecoat / Brown Coat (3/8" thick ~25 sq ft/bag)',
        'Full 2-Coat System (Basecoat + Finish Skim)',
      ], 'Smooth Skim Coat (1/16" thick ~110 sq ft/bag)'),
    ],
    compute: (v) => {
      const area = asNum(v.wallAreaSqft, 250)
      const pt = asSel(v.plasterType)

      let bags = Math.ceil(area / 110)
      if (pt.includes('Heavy Basecoat')) bags = Math.ceil(area / 25)
      else if (pt.includes('Full 2-Coat')) bags = Math.ceil(area / 25) + Math.ceil(area / 110)

      const waterGal = bags * 3.5

      return [
        res('Plaster Bags (50 lb)', `${bags} bags`, 'good', `${num(bags * 50)} lbs total material`),
        res('Application Type', pt.split('(')[0].trim(), 'info', `${area} sq ft coverage`),
        res('Clean Mixing Water', `~${numD(waterGal, 1)} gallons`, 'neutral', 'Use cold, drinkable water'),
        res('Working Pot Life', '30 to 45 minutes', 'warn', 'Mix only what can be applied before stiffening'),
      ]
    },
  },
  {
    id: 'grout-coverage-calculator',
    name: 'Grout Coverage Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate exact pounds of sanded or unsanded tile grout needed based on tile dimensions and joint width.',
    tip: 'Use unsanded grout for narrow joints under 1/8"; use sanded grout for joints 1/8" to 1/2" to prevent cracking.',
    usage: [
      'Enter tile length, width, and thickness in inches.',
      'Enter grout joint width (e.g. 1/16", 1/8", 1/4").',
      'Enter total tiled area in square feet.',
      'Check grout pounds needed and dry bag counts.',
    ],
    method: [
      'Formula: Pounds = ((L + W) / (L * W)) * Joint Width * Thickness * Area * 0.18.',
    ],
    fields: [
      n('tileLengthIn', 'Tile Length (Inches)', { def: 12, min: 1, max: 48, step: 0.5 }),
      n('tileWidthIn', 'Tile Width (Inches)', { def: 12, min: 1, max: 48, step: 0.5 }),
      n('tileThicknessIn', 'Tile Thickness (Inches)', { def: 0.375, min: 0.125, max: 1.0, step: 0.0625 }),
      n('jointWidthIn', 'Grout Joint Width (Inches)', { def: 0.125, min: 0.0625, max: 0.5, step: 0.0625 }),
      n('areaSqft', 'Total Tiled Floor/Wall Area (sq ft)', { def: 120, min: 5, max: 1000, step: 5 }),
    ],
    compute: (v) => {
      const l = asNum(v.tileLengthIn, 12)
      const w = asNum(v.tileWidthIn, 12)
      const t = asNum(v.tileThicknessIn, 0.375)
      const j = asNum(v.jointWidthIn, 0.125)
      const area = asNum(v.areaSqft, 120)

      // Industry formula: lbs = ((L+W)/(L*W)) * J * T * Area * 0.18 * 1.15 (15% waste)
      const factor = ((l + w) / (l * w)) * j * t * area * 0.18 * 1.15
      const groutLbs = Math.max(2, Math.round(factor * 10) / 10)
      const bags25 = Math.ceil(groutLbs / 25)
      const isSanded = j >= 0.125

      return [
        res('Grout Required', `${numD(groutLbs, 1)} lbs`, 'good', `${bags25} x 25-lb bag${bags25 > 1 ? 's' : ''}`),
        res('Recommended Grout Type', isSanded ? 'Sanded Grout (>= 1/8" joints)' : 'Unsanded Grout (< 1/8" joints)', 'good', `Selected joint: ${j}"`),
        res('Tile Dimensions', `${l}" x ${w}" (${t}" thick)`, 'info', `${area} sq ft total`),
        res('Sealer Recommendation', 'Apply penetrating sealer after 72 hrs', 'neutral', 'Prevents food/mildew staining'),
      ]
    },
  },
  {
    id: 'adhesive-coverage-calculator',
    name: 'Adhesive Coverage Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Estimate thinset mortar, construction adhesive cartridges, and flooring glue based on trowel notch size.',
    tip: 'Large format tiles (15"+) require a 1/2" x 1/2" square notch trowel and 50-60 sq ft per 50 lb bag of modified thinset.',
    usage: [
      'Enter total surface area in square feet.',
      'Select trowel notch size or adhesive delivery method.',
      'Check 50 lb thinset mortar bags or 10 oz construction adhesive tubes needed.',
    ],
    method: [
      '1/4x1/4 trowel = 80-90 sq ft/bag. 1/2x1/2 trowel = 45-55 sq ft/bag.',
      'Tube construction adhesive = ~30 linear feet of 1/4" bead per 10 oz tube.',
    ],
    fields: [
      n('surfaceAreaSqft', 'Surface Area (Square Feet)', { def: 150, min: 10, max: 2000, step: 5 }),
      sel('adhesiveType', 'Adhesive & Trowel Application', [
        'Tile Thinset - 1/4" x 1/4" Square Notch (~85 sq ft / 50lb bag)',
        'Tile Thinset - 1/2" x 1/2" Large Format (~50 sq ft / 50lb bag)',
        'Vinyl Flooring Adhesive (~160 sq ft / 1-Gallon Tub)',
        'Construction Adhesive 10 oz Tubes (Subfloors & Paneling)',
      ], 'Tile Thinset - 1/4" x 1/4" Square Notch (~85 sq ft / 50lb bag)'),
    ],
    compute: (v) => {
      const area = asNum(v.surfaceAreaSqft, 150)
      const at = asSel(v.adhesiveType)

      if (at.includes('Construction Adhesive')) {
        const tubes = Math.ceil(area / 18) // ~18 sq ft paneling coverage per tube
        return [
          res('Adhesive Cartridges', `${tubes} tubes (10 oz)`, 'good', 'Heavy-duty polyurethane or subfloor glue'),
          res('Linear Bead Yield', `~${tubes * 30} linear feet`, 'info', '1/4-inch bead diameter'),
          res('Area Covered', `${area} sq ft`, 'neutral', 'Wall panels or subfloor joists'),
          res('Open Working Time', '15 to 20 minutes', 'warn', 'Tack time before press-fit'),
        ]
      } else if (at.includes('Vinyl')) {
        const tubs = Math.ceil(area / 160)
        return [
          res('Adhesive Tubs', `${tubs} gallon${tubs > 1 ? 's' : ''}`, 'good', 'Pressure-sensitive vinyl flooring adhesive'),
          res('Coverage Rate', '160 sq ft / gallon', 'info', 'Fine 1/16" notched trowel'),
          res('Flash Time', 'Wait 20-30 min until tacky/clear', 'good', 'Do not lay tiles in wet glue'),
          res('Clean-Up Solvent', 'Warm soapy water while wet', 'neutral', 'Mineral spirits once cured'),
        ]
      } else {
        const sqftPerBag = at.includes('1/2"') ? 50 : 85
        const bags = Math.ceil((area * 1.10) / sqftPerBag)
        return [
          res('Thinset Mortar (50 lb bags)', `${bags} bags`, 'good', 'Polymer-modified thinset mortar'),
          res('Trowel Notch Specification', at.includes('1/2"') ? '1/2" x 1/2" Square Notch' : '1/4" x 1/4" Square Notch', 'info', `Provides >85% mortar transfer`),
          res('Total Powder Weight', `${bags * 50} lbs`, 'neutral', `${area} sq ft with 10% buffer`),
          res('Back Buttering Tip', at.includes('1/2"') ? 'Flat-trowel back of each tile' : 'Standard flat substrate coverage', 'good', 'Ensures 100% bond strength'),
        ]
      }
    },
  },
  {
    id: 'screw-quantity-estimator',
    name: 'Screw Quantity Estimator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate screw counts and box sizes for outdoor decks, drywall hanging, subfloor fastening, and cabinetry.',
    tip: 'Deck boards require roughly 350 deck screws per 100 square feet (2 screws at every 16" joist intersection).',
    usage: [
      'Select project application (Decking, Subfloor, Drywall, Cabinet mounting).',
      'Enter square footage or linear run.',
      'Check recommended screw count, screw gauge/length, and box purchases.',
    ],
    method: [
      'Decking: 3.5 screws/sqft. Subfloor: 2.5 screws/sqft. Drywall: 1 screw per sqft.',
    ],
    fields: [
      sel('projectApp', 'Project Fastening Application', [
        'Outdoor Decking Boards (350 screws per 100 sq ft)',
        'Subfloor Plywood to Joists (250 screws per 100 sq ft)',
        'Drywall Hanging (100 screws per 100 sq ft / ~32 per sheet)',
        'Cabinet Installation to Wall Studs (4 structural screws/cabinet)',
      ], 'Outdoor Decking Boards (350 screws per 100 sq ft)'),
      n('projectScope', 'Project Size (Sq Ft or Cabinet Count)', { def: 200, min: 10, max: 2000, step: 10 }),
    ],
    compute: (v) => {
      const app = asSel(v.projectApp)
      const scope = asNum(v.projectScope, 200)

      let totalScrews = 700
      let screwType = '#9 or #10 x 2-1/2" Composite or ACQ-Rated Deck Screws'
      if (app.includes('Subfloor')) {
        totalScrews = Math.ceil(scope * 2.5 * 1.05)
        screwType = '#8 x 2" Coarse-Thread Subfloor Screws'
      } else if (app.includes('Drywall')) {
        totalScrews = Math.ceil(scope * 1.0 * 1.08)
        screwType = '#6 x 1-1/4" Coarse Drywall Screws'
      } else if (app.includes('Cabinet')) {
        totalScrews = Math.ceil(scope * 4 * 1.20)
        screwType = '#10 x 3" GRK or T-Star Cabinet Washer Head Screws'
      } else {
        totalScrews = Math.ceil((scope / 100) * 350 * 1.05)
      }

      const lbsEst = Math.ceil(totalScrews / 90) // ~90 2.5" screws per lb

      return [
        res('Estimated Screws Needed', `~${num(totalScrews)} screws`, 'good', 'Includes 5-8% dropped/stripped reserve'),
        res('Weight Purchase Equivalent', `~${lbsEst} lbs`, 'info', `${Math.ceil(totalScrews / 350)} x 5-lb tub(s)`),
        res('Recommended Screw Spec', screwType, 'good', 'Engineered shear strength & coating'),
        res('Driver Bit Guide', 'Use Torx / Star T-25 drive bits', 'neutral', 'Zero cam-out stripping compared to Phillips'),
      ]
    },
  },
  {
    id: 'diy-tool-checklist',
    name: 'DIY Tool Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Essential tools checklist covering basic household repair kits, electrical troubleshooting, and carpentry.',
    tip: 'A magnetic torpedo level, quality 25 ft tape measure, and 16 oz claw hammer form the core foundation of every DIY kit.',
    usage: [
      'Check off your existing tools across measuring, fastening, cutting, and safety.',
      'Check kit completeness score and see missing high-priority items.',
    ],
    method: [
      'Scores readiness across 6 foundational tool categories.',
    ],
    fields: [
      ck('measuringTape', '25-ft Heavy-Duty Tape Measure with sturdy standout', false),
      ck('torpedoLevel', 'Magnetic 9-inch Torpedo Level (Plumb & Level)', false),
      ck('cordlessDrill', '18V / 20V Cordless Drill with driver bit set', false),
      ck('safetyGlasses', 'ANSI Z87 Safety Glasses & Ear Protection', false),
      ck('clawHammer', '16 oz Smooth-Face Claw Hammer', false),
      ck('utilityKnife', 'Retractable Utility Knife with fresh sharp blades', false),
    ],
    compute: (v) => {
      const items = [
        v.measuringTape,
        v.torpedoLevel,
        v.cordlessDrill,
        v.safetyGlasses,
        v.clawHammer,
        v.utilityKnife,
      ]
      const count = items.filter(Boolean).length
      const score = Math.round((count / items.length) * 100)

      return [
        res('DIY Toolkit Readiness', `${score}% Complete`, score >= 80 ? 'good' : 'warn', `${count} of ${items.length} core tools owned`),
        res('Safety Gear Status', v.safetyGlasses ? 'Protected' : 'CRITICAL: Buy Safety Glasses', v.safetyGlasses ? 'good' : 'bad', 'Eye protection is non-negotiable'),
        res('Drill Capability', v.cordlessDrill ? 'Equipped for Fastening' : 'Prioritize Cordless Drill', v.cordlessDrill ? 'good' : 'warn', 'Speeds up 90% of home tasks'),
        res('Next Investment', score === 100 ? 'Oscillating Multi-Tool (Super versatile)' : 'Acquire missing core hand tools', 'info', 'Expands DIY project scope'),
      ]
    },
  },
  {
    id: 'diy-project-planner',
    name: 'DIY Project Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Step-by-step phase planner dividing DIY execution into design, material sourcing, rough-in, finishing, and cleanup.',
    tip: 'Spending 30 extra minutes protecting floors and taping edges saves 2 hours of scraping dried paint later.',
    usage: [
      'Work through chronological phase milestones.',
      'Confirm safety shutoffs and ventilation prior to demo.',
      'Track total project phase progress.',
    ],
    method: [
      'Tracks progress across planning, demo/prep, rough execution, fine finish, and punch-list.',
    ],
    fields: [
      ck('planDrawings', 'Phase 1: Measured room drawings and verified cut list completed', false),
      ck('utilityShutoff', 'Phase 2: Verified water/gas/electric shutoffs if working near lines', false),
      ck('floorProtection', 'Phase 3: Masked trim and laid heavy drop cloths / Ram Board', false),
      ck('roughAssembly', 'Phase 4: Completed structural framing / substrate prep', false),
      ck('finishTrim', 'Phase 5: Applied paint, grout, or clear protective coats', false),
      ck('toolClean', 'Phase 6: Cleaned brushes/blades, wiped tools, and disposed waste', false),
    ],
    compute: (v) => {
      const phases = [
        v.planDrawings,
        v.utilityShutoff,
        v.floorProtection,
        v.roughAssembly,
        v.finishTrim,
        v.toolClean,
      ]
      const done = phases.filter(Boolean).length
      const pctDone = Math.round((done / phases.length) * 100)

      return [
        res('Project Execution Status', `${pctDone}% Done`, pctDone === 100 ? 'good' : pctDone >= 50 ? 'info' : 'warn', `${done} of ${phases.length} milestones complete`),
        res('Next Immediate Phase', !v.planDrawings ? 'Finalize Cut List & Drawings' : !v.utilityShutoff ? 'Confirm Utility Shutoffs' : !v.floorProtection ? 'Protect Floors & Masking' : !v.roughAssembly ? 'Rough Construction' : !v.finishTrim ? 'Finishing & Coating' : 'Tool Maintenance & Cleanup', 'neutral', 'Sequential order prevents rework'),
        res('Safety Alert', v.utilityShutoff ? 'Utility Verified Safe' : 'Ensure breakers / valves are off', v.utilityShutoff ? 'good' : 'bad', 'Prevents electrical shock & water floods'),
        res('Cleanup Discipline', v.toolClean ? 'Tools Stored Properly' : 'Clean wet brushes immediately', 'info', 'Extends tool lifespan by years'),
      ]
    },
  },
  {
    id: 'diy-material-cost-tracker',
    name: 'DIY Material Cost Tracker',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Track cumulative receipts, hardware store runs, and tax/shipping expenses against your DIY budget ceiling.',
    tip: 'Unplanned repeat trips to the hardware store for small fittings often inflate project budgets by 18-25%.',
    usage: [
      'Enter your initial planned budget.',
      'Enter primary lumber/material receipt total.',
      'Enter hardware/fasteners receipt total.',
      'Enter paint/finish and tool purchase receipts.',
      'Check budget variance (under budget vs cost overrun).',
    ],
    method: [
      'Spent = Sum of all receipts. Variance = Planned Budget - Spent.',
    ],
    fields: [
      n('plannedBudget', 'Planned Target Budget ($)', { def: 600, min: 50, max: 20000, step: 25 }),
      n('lumberReceipts', 'Lumber / Primary Materials ($)', { def: 285, min: 0, max: 10000, step: 5 }),
      n('hardwareReceipts', 'Hardware, Screws & Adhesives ($)', { def: 68, min: 0, max: 2000, step: 2 }),
      n('finishesReceipts', 'Paint, Stains & Sealers ($)', { def: 54, min: 0, max: 2000, step: 2 }),
      n('toolReceipts', 'Blades, Bits & Tool Purchases ($)', { def: 42, min: 0, max: 2000, step: 2 }),
    ],
    compute: (v) => {
      const budget = asNum(v.plannedBudget, 600)
      const lum = asNum(v.lumberReceipts, 285)
      const hard = asNum(v.hardwareReceipts, 68)
      const fin = asNum(v.finishesReceipts, 54)
      const tools = asNum(v.toolReceipts, 42)

      const totalSpent = lum + hard + fin + tools
      const variance = budget - totalSpent
      const spentPct = (totalSpent / Math.max(1, budget)) * 100

      return [
        res('Total Spent to Date', money(totalSpent), 'neutral', `${pct(spentPct)} of budget`),
        res('Budget Variance', variance >= 0 ? `+${money(variance)} remaining` : `-${money(Math.abs(variance))} over budget`, variance >= 0 ? 'good' : 'bad', variance >= 0 ? 'Under control' : 'Cost overrun'),
        res('Hardware Store Trips', hard + tools > 100 ? 'Consolidated receipts' : 'Minor auxiliary spending', 'info', `${money(hard + tools)} hardware/tool share`),
        res('Financial Health', spentPct <= 90 ? 'Safe Buffer Intact' : spentPct <= 100 ? 'Near Budget Cap' : 'Exceeded Budget', spentPct <= 100 ? 'good' : 'bad', 'Track every receipt'),
      ]
    },
  },
  {
    id: 'diy-project-progress-tracker',
    name: 'DIY Project Progress Tracker',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate percentage completion across custom project milestones and estimate remaining hours to the finish line.',
    tip: 'The final 10% of a DIY project (caulking, nail holes, touch-up paint) takes 25% of the effort; don’t abandon the punch list!',
    usage: [
      'Enter total estimated project hours.',
      'Enter hours completed so far.',
      'Select number of completed milestone stages.',
      'Check completion percentage, remaining hours, and estimated completion date.',
    ],
    method: [
      'Progress Pct = (Completed Hours / Total Estimated Hours) * 100.',
      'Remaining Hours = Max(0, Total - Completed).',
    ],
    fields: [
      n('totalHours', 'Total Estimated Project Hours', { def: 24, min: 2, max: 200, step: 1 }),
      n('completedHours', 'Hours Logged So Far', { def: 15, min: 0, max: 200, step: 0.5 }),
      n('dailyPace', 'Hours You Can Work per Day', { def: 3, min: 1, max: 10, step: 0.5 }),
    ],
    compute: (v) => {
      const total = asNum(v.totalHours, 24)
      const done = asNum(v.completedHours, 15)
      const pace = asNum(v.dailyPace, 3)

      const remaining = Math.max(0, total - done)
      const pctDone = Math.min(100, Math.round((done / Math.max(1, total)) * 100))
      const daysLeft = Math.ceil(remaining / pace)

      return [
        res('Overall Project Progress', `${pctDone}% Complete`, pctDone >= 75 ? 'good' : pctDone >= 40 ? 'info' : 'warn', `${done} of ${total} hours logged`),
        res('Remaining Work', `${numD(remaining, 1)} hours left`, remaining === 0 ? 'good' : 'neutral', 'Hands-on labor needed'),
        res('Time to Finish Line', `${daysLeft} work day${daysLeft > 1 ? 's' : ''}`, 'good', `@ ${pace} hours/day pace`),
        res('Punch List Reminder', pctDone >= 80 ? 'Prepare caulking & touch-up paint' : 'Focus on primary assembly', 'info', 'Final details make the difference'),
      ]
    },
  },
]
