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

const SUB = 'Home Planning'
const SUB_ID = 'home-planning'

export const homePlanningSpecs: HouseholdSpec[] = [
  {
    id: 'room-furniture-capacity-planner',
    name: 'Room Furniture Capacity Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate maximum comfortable furniture footprint for a room while preserving recommended walking clearance.',
    tip: 'Architects recommend furniture occupy no more than 60% of total floor area to avoid a cramped feeling.',
    usage: [
      'Enter room length and width in feet.',
      'Select room function (Living room, Bedroom, Dining room, Office).',
      'Check recommended max furniture footprint and walkway area.',
    ],
    method: [
      'Total Area = Length * Width.',
      'Max Furniture Footprint = Area * Target Coverage (55-60%).',
      'Circulation Area = Area - Furniture Area.',
    ],
    fields: [
      n('lengthFt', 'Room Length (Feet)', { def: 16, min: 6, max: 50, step: 0.5 }),
      n('widthFt', 'Room Width (Feet)', { def: 13, min: 6, max: 40, step: 0.5 }),
      sel('roomType', 'Room Purpose', [
        'Living Room (55% max furniture, spacious walkways)',
        'Master Bedroom (60% max furniture, bed-centric)',
        'Secondary Bedroom / Office (65% furniture density)',
        'Dining Room (50% max furniture, ample chair pushback)',
      ], 'Living Room (55% max furniture, spacious walkways)'),
    ],
    compute: (v) => {
      const len = asNum(v.lengthFt, 16)
      const wid = asNum(v.widthFt, 13)
      const type = asSel(v.roomType)
      const totalArea = len * wid

      const maxPct = type.includes('50%') ? 0.50 : type.includes('65%') ? 0.65 : type.includes('60%') ? 0.60 : 0.55
      const furnitureSqft = totalArea * maxPct
      const walkingSqft = totalArea - furnitureSqft

      return [
        res('Total Room Area', `${num(Math.round(totalArea))} sq ft`, 'neutral', `${numD(totalArea * 0.0929, 1)} m²`),
        res('Max Furniture Footprint', `${num(Math.round(furnitureSqft))} sq ft`, 'good', `Cap at ${Math.round(maxPct * 100)}% coverage`),
        res('Required Circulation Space', `${num(Math.round(walkingSqft))} sq ft`, 'info', 'Dedicated to open traffic paths'),
        res('Recommended Major Pieces', `${Math.round(furnitureSqft / 25)} to ${Math.round(furnitureSqft / 18)} items`, 'good', 'Based on standard 20 sq ft avg piece'),
      ]
    },
  },
  {
    id: 'room-walking-space-calculator',
    name: 'Room Walking Space Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Verify walking pathway widths and accessibility clearance between walls, sofas, tables, and doors.',
    tip: 'Primary high-traffic hallways require 36 inches minimum; secondary paths between coffee tables need 18 inches.',
    usage: [
      'Enter distance between furniture piece and nearest wall or opposite object.',
      'Select pathway hierarchy (Primary walkway vs intimate coffee table gap).',
      'Check clearance compliance with international interior design codes.',
    ],
    method: [
      'Primary: >= 36" (ADA compliant 36"-42").',
      'Secondary: >= 24"-30".',
      'Coffee table to sofa: 14"-18".',
    ],
    fields: [
      n('clearanceInches', 'Measured Passage Width (Inches)', { def: 32, min: 10, max: 80, step: 1 }),
      sel('pathwayType', 'Path Type & Location', [
        'Main Room Thoroughfare / Entryway (36"+ required)',
        'Secondary Pathway between Furniture (24"-30" required)',
        'Sofa to Coffee Table Gap (14"-18" standard)',
        'Dining Chair Pushback to Wall (36"-42" required)',
      ], 'Main Room Thoroughfare / Entryway (36"+ required)'),
    ],
    compute: (v) => {
      const inches = asNum(v.clearanceInches, 32)
      const pt = asSel(v.pathwayType)

      let reqMin = 36
      let reqMax = 48
      if (pt.includes('Secondary')) { reqMin = 24; reqMax = 30 }
      else if (pt.includes('Coffee Table')) { reqMin = 14; reqMax = 18 }
      else if (pt.includes('Dining Chair')) { reqMin = 36; reqMax = 42 }

      const isCompliant = inches >= reqMin
      const statusTone = isCompliant ? 'good' : 'warn'

      return [
        res('Clearance Assessment', isCompliant ? 'Compliant & Comfortable' : 'Constricted Pathway', statusTone, `${inches} inches measured`),
        res('Standard Target Width', `${reqMin}" - ${reqMax}"`, 'info', `${pt.split('(')[0].trim()}`),
        res('Difference from Minimum', `${inches >= reqMin ? '+' : ''}${inches - reqMin} inches`, statusTone, inches < reqMin ? 'May impede traffic' : 'Spacious flow'),
        res('Accessibility Rating', inches >= 36 ? 'Wheelchair / Luggage Friendly' : 'Single Person Walkway Only', 'neutral', 'ADA guideline threshold = 36"'),
      ]
    },
  },
  {
    id: 'furniture-arrangement-planner',
    name: 'Furniture Arrangement Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Plan balanced living room layout arrangements around focal points like fireplaces, windows, or entertainment consoles.',
    tip: 'Anchor living room seating around a single dominant focal point rather than pointing chairs in conflicting directions.',
    usage: [
      'Select focal point type and room shape.',
      'Enter room dimensions.',
      'Check recommended seating arrangement (L-shape, U-shape, parallel conversation, floating).',
    ],
    method: [
      'Calculates focal distance and recommends perimeter vs floating layout based on room width >= 14 ft.',
    ],
    fields: [
      sel('focalPoint', 'Primary Room Focal Point', [
        'Wall-Mounted Television / Media Unit',
        'Fireplace / Hearth',
        'Large Scenic Window / View',
        'Open Conversation / No Screen',
      ], 'Wall-Mounted Television / Media Unit'),
      sel('roomShape', 'Room Shape', [
        'Rectangular (1.3 to 1.7 aspect ratio)',
        'Square (1.0 to 1.2 aspect ratio)',
        'Long Narrow Corridor (2.0+ aspect ratio)',
        'Open Concept Great Room',
      ], 'Rectangular (1.3 to 1.7 aspect ratio)'),
      n('widthFeet', 'Room Width (Feet)', { def: 14, min: 9, max: 35, step: 0.5 }),
    ],
    compute: (v) => {
      const fp = asSel(v.focalPoint)
      const shape = asSel(v.roomShape)
      const w = asNum(v.widthFeet, 14)

      const floatingLayout = w >= 13
      const seatingStyle = shape.includes('Narrow') ? 'Linear Sofa + Single Accent Chair'
        : shape.includes('Square') ? 'Parallel Sofas or U-Shape Sectional'
        : shape.includes('Open Concept') ? 'Floating Sectional Zone Divider'
        : 'L-Shaped Sectional with Focal Orientation'

      return [
        res('Seating Layout', seatingStyle, 'good', 'Optimal balance for space'),
        res('Placement Strategy', floatingLayout ? 'Floating (Pull off walls 12"-18")' : 'Perimeter Hugging (Maximizes central space)', 'info', `Based on ${w} ft room width`),
        res('Rug Dimension Target', w >= 14 ? '9 ft x 12 ft' : '8 ft x 10 ft', 'neutral', 'Front legs on rug rule'),
        res('Traffic Flow Guide', 'Direct perimeter path behind sofa', 'good', `Keeps ${fp.split('/')[0].trim()} sightline clear`),
      ]
    },
  },
  {
    id: 'bed-placement-planner',
    name: 'Bed Placement Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Determine the best wall placement for King, Queen, or Twin beds considering nightstands and side clearances.',
    tip: 'Leave at least 28-30 inches on both sides of a double bed so both occupants can make the bed and exit comfortably.',
    usage: [
      'Select mattress size (Twin, Full, Queen, King, Cal King).',
      'Select wall width where bed will be positioned.',
      'Include nightstand widths.',
      'Check remaining side clearance and door swing clearance.',
    ],
    method: [
      'Bed Width: Twin 38", Full 54", Queen 60", King 76", Cal King 72".',
      'Remaining Wall Clearance = Wall Width - (Bed Width + Nightstands).',
    ],
    fields: [
      sel('mattress', 'Mattress Size', [
        'Twin (38" wide x 75" long)',
        'Full / Double (54" wide x 75" long)',
        'Queen (60" wide x 80" long)',
        'King (76" wide x 80" long)',
        'California King (72" wide x 84" long)',
      ], 'Queen (60" wide x 80" long)'),
      n('wallWidthFeet', 'Headboard Wall Width (Feet)', { def: 12, min: 7, max: 25, step: 0.5 }),
      n('nightstandWidthInches', 'Nightstand Width (Inches each)', { def: 24, min: 12, max: 40, step: 1 }),
      n('nightstandCount', 'Number of Nightstands', { def: 2, min: 0, max: 2, step: 1 }),
    ],
    compute: (v) => {
      const mat = asSel(v.mattress)
      let bedWidthIn = 60
      if (mat.includes('Twin')) bedWidthIn = 38
      else if (mat.includes('Full')) bedWidthIn = 54
      else if (mat.includes('King (76')) bedWidthIn = 76
      else if (mat.includes('California King')) bedWidthIn = 72

      const wallIn = asNum(v.wallWidthFeet, 12) * 12
      const nsIn = asNum(v.nightstandWidthInches, 24)
      const nsCount = asNum(v.nightstandCount, 2)

      const totalEnsembleWidth = bedWidthIn + (nsIn * nsCount)
      const leftoverIn = wallIn - totalEnsembleWidth
      const sideClearance = nsCount > 0 ? (wallIn - bedWidthIn) / 2 : leftoverIn / 2

      return [
        res('Bed Ensemble Width', `${totalEnsembleWidth}" (${numD(totalEnsembleWidth / 12, 1)} ft)`, 'neutral', `Bed + ${nsCount} nightstands`),
        res('Side Walkway Clearance', `${Math.round(sideClearance)}"`, sideClearance >= 28 ? 'good' : 'warn', sideClearance >= 28 ? 'Comfortable walk space' : 'Tight side passage (< 28")'),
        res('Remaining Wall Margin', `${Math.round(leftoverIn)}" total`, leftoverIn >= 0 ? 'good' : 'bad', leftoverIn < 0 ? 'Overcrowds wall' : 'Flanks nightstands nicely'),
        res('Command Position', 'Facing entry door diagonally', 'info', 'Avoids direct foot-to-door alignment'),
      ]
    },
  },
  {
    id: 'sofa-placement-planner',
    name: 'Sofa Placement Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Size sectional sofas, loveseats, and 3-seaters to ensure balanced proportions and easy walkway circulation.',
    tip: 'Sectional chaise lounges should generally sit on the open side of the room to prevent blocking natural traffic flow.',
    usage: [
      'Enter sofa length and depth.',
      'Enter living room width and length.',
      'Check sofa room proportion percentage and recommended coffee table dimensions.',
    ],
    method: [
      'Sofa should be ~2/3 the length of the adjacent wall or rug.',
      'Coffee table length should be 1/2 to 2/3 the length of the sofa.',
    ],
    fields: [
      n('sofaLengthInches', 'Sofa Overall Length (Inches)', { def: 88, min: 50, max: 150, step: 2 }),
      n('sofaDepthInches', 'Sofa Depth (Inches)', { def: 38, min: 28, max: 70, step: 1 }),
      n('wallLengthFeet', 'Wall Length behind Sofa (Feet)', { def: 14, min: 7, max: 30, step: 0.5 }),
    ],
    compute: (v) => {
      const sofaLen = asNum(v.sofaLengthInches, 88)
      const wallLenIn = asNum(v.wallLengthFeet, 14) * 12
      const propPct = (sofaLen / wallLenIn) * 100

      const recCoffeeMin = Math.round(sofaLen * 0.5)
      const recCoffeeMax = Math.round(sofaLen * 0.67)

      return [
        res('Sofa-to-Wall Ratio', pct(propPct), propPct >= 60 && propPct <= 75 ? 'good' : 'neutral', propPct > 80 ? 'Heavy for wall' : 'Well proportioned'),
        res('Ideal Coffee Table Length', `${recCoffeeMin}" to ${recCoffeeMax}"`, 'good', '1/2 to 2/3 sofa length'),
        res('Coffee Table Gap', '14" to 18" gap', 'info', 'Reach drinks without bumping shins'),
        res('Side Table Height Target', 'Within 2" of sofa arm', 'neutral', 'Ergonomic lamp reach'),
      ]
    },
  },
  {
    id: 'dining-table-space-planner',
    name: 'Dining Table Space Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate dining room perimeter clearances for chairs, host seating, and dining buffet sideboards.',
    tip: 'Allow 36 inches from dining table edge to wall for chairs to slide back; allow 48 inches if people must walk behind diners.',
    usage: [
      'Select table shape (Rectangular, Round, Oval, Square).',
      'Enter table length and width in inches.',
      'Select perimeter clearance level.',
      'Check required minimum dining room dimensions.',
    ],
    method: [
      'Required Room Length = Table Length + (2 * Perimeter Clearance).',
      'Required Room Width = Table Width + (2 * Perimeter Clearance).',
    ],
    fields: [
      sel('tableShape', 'Table Shape', [
        'Rectangular 6-Person (72" x 36")',
        'Rectangular 8-Person (96" x 40")',
        'Round 4-Person (48" diameter)',
        'Round 6-Person (60" diameter)',
        'Custom Dimensions',
      ], 'Rectangular 6-Person (72" x 36")'),
      n('tableLengthInches', 'Table Length / Diameter (Inches)', { def: 72, min: 36, max: 140, step: 2 }),
      n('tableWidthInches', 'Table Width (Inches)', { def: 36, min: 28, max: 60, step: 2 }),
      sel('clearanceLevel', 'Clearance Level', [
        'Standard (36" chair slide-back)',
        'Spacious / Service Path (42" pass-behind)',
        'Tight / Casual Nook (30" minimum)',
      ], 'Standard (36" chair slide-back)'),
    ],
    compute: (v) => {
      const ts = asSel(v.tableShape)
      let lenIn = asNum(v.tableLengthInches, 72)
      let widIn = asNum(v.tableWidthInches, 36)
      if (ts.includes('Rectangular 8')) { lenIn = 96; widIn = 40 }
      else if (ts.includes('Round 4')) { lenIn = 48; widIn = 48 }
      else if (ts.includes('Round 6')) { lenIn = 60; widIn = 60 }

      const cl = asSel(v.clearanceLevel)
      const buffer = cl.includes('42"') ? 42 : cl.includes('30"') ? 30 : 36

      const reqLenIn = lenIn + (buffer * 2)
      const reqWidIn = widIn + (buffer * 2)

      const reqLenFt = numD(reqLenIn / 12, 1)
      const reqWidFt = numD(reqWidIn / 12, 1)
      const rugLenFt = numD((lenIn + 48) / 12, 1)
      const rugWidFt = numD((widIn + 48) / 12, 1)

      return [
        res('Minimum Room Dimensions', `${reqLenFt} ft x ${reqWidFt} ft`, 'good', `${Math.round((reqLenIn * reqWidIn) / 144)} sq ft area`),
        res('Clearance Margin', `${buffer}" all around`, 'info', `${cl.split('(')[0].trim()}`),
        res('Recommended Rug Size', `${rugLenFt} ft x ${rugWidFt} ft`, 'neutral', 'Keeps all 4 chair legs on rug'),
        res('Place Setting Width', '24" per diner', 'good', 'Comfortable elbow room'),
      ]
    },
  },
  {
    id: 'tv-viewing-distance-calculator',
    name: 'TV Viewing Distance Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate cinema-grade and ergonomic TV viewing distance and screen mounting height based on SMPTE and THX standards.',
    tip: 'For 4K UHD TVs, optimal viewing distance is 1.2 to 1.5 times the screen diagonal; eye level should hit the center third of the screen.',
    usage: [
      'Enter television screen size in diagonal inches (e.g., 55, 65, 75, 85).',
      'Select resolution (4K UHD vs 1080p Full HD).',
      'Check recommended viewing distance in feet and meters, plus optimal mounting height.',
    ],
    method: [
      '4K SMPTE Distance (30-degree field of view) = Screen Size * 1.6 / 12.',
      '4K THX Distance (40-degree field of view) = Screen Size * 1.2 / 12.',
      'Mounting height = Seated eye level (~40"-42") to center of TV screen.',
    ],
    fields: [
      n('screenSizeInches', 'TV Screen Size (Diagonal Inches)', { def: 65, min: 32, max: 100, step: 5 }),
      sel('resolution', 'Screen Resolution', [
        '4K UHD (3840 x 2160) - Recommended closer immersion',
        '1080p Full HD (1920 x 1080) - Requires slightly further distance',
      ], '4K UHD (3840 x 2160) - Recommended closer immersion'),
      n('seatedEyeLevelInches', 'Seated Eye Level Height (Inches)', { def: 42, min: 34, max: 50, step: 1 }),
    ],
    compute: (v) => {
      const diag = asNum(v.screenSizeInches, 65)
      const resSel = asSel(v.resolution)
      const eyeLvl = asNum(v.seatedEyeLevelInches, 42)

      const is4k = resSel.includes('4K')
      const minFeet = is4k ? (diag * 1.0) / 12 : (diag * 1.4) / 12
      const idealFeet = is4k ? (diag * 1.3) / 12 : (diag * 1.6) / 12
      const maxFeet = is4k ? (diag * 1.6) / 12 : (diag * 2.0) / 12

      // Approx screen height = diag * 0.49
      const screenHeight = diag * 0.49
      const mountFloorToCenter = eyeLvl
      const mountFloorToBottom = mountFloorToCenter - (screenHeight / 2)

      return [
        res('Ideal Viewing Distance', `${numD(idealFeet, 1)} ft (${numD(idealFeet * 0.3048, 2)} m)`, 'good', `Range: ${numD(minFeet, 1)} - ${numD(maxFeet, 1)} ft`),
        res('Screen Center Height', `${Math.round(mountFloorToCenter)}" from floor`, 'good', 'Alters directly to seated eye level'),
        res('Bottom Edge of Screen', `${Math.round(mountFloorToBottom)}" from floor`, 'info', 'Top of TV media console height guide'),
        res('Field of View Immersion', is4k ? '36° - 40° Cinematic THX' : '30° SMPTE Standard', 'neutral', 'Retina clarity threshold'),
      ]
    },
  },
  {
    id: 'desk-space-planner',
    name: 'Desk Space Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Size home office work desks for laptop setups, multi-monitor productivity, and ergonomic chair clearance.',
    tip: 'A dual-monitor workstation requires at least a 60-inch wide by 30-inch deep desktop surface for proper arm support.',
    usage: [
      'Select computer and screen configuration (Single laptop, Dual 27" monitors, Ultrawide).',
      'Select peripheral requirements (Full keyboard, writing pad, desktop tower).',
      'Check recommended desk dimensions and total floor footprint.',
    ],
    method: [
      'Laptop solo: 40" x 24". Dual monitor: 60" x 30". Triple/Ultrawide: 72" x 32".',
      'Chair rollback depth: Desk depth + 36" clearance.',
    ],
    fields: [
      sel('monitorSetup', 'Computer & Screen Setup', [
        'Single Laptop Only',
        'Single External Monitor (24"-27") + Laptop',
        'Dual External Monitors (2 x 27")',
        '34"+ Curved Ultrawide Display',
        'Triple Monitor Creative / Trading Station',
      ], 'Dual External Monitors (2 x 27")'),
      sel('gearDensity', 'Writing / Gear Space', [
        'Keyboard & Mouse Only (Compact)',
        'Standard (Notebook / documents next to keyboard)',
        'Spacious (Speakers, microphone boom, paperwork)',
      ], 'Standard (Notebook / documents next to keyboard)'),
    ],
    compute: (v) => {
      const ms = asSel(v.monitorSetup)
      const gd = asSel(v.gearDensity)

      let widthIn = 60
      let depthIn = 30
      if (ms.includes('Single Laptop')) { widthIn = 40; depthIn = 24 }
      else if (ms.includes('Single External')) { widthIn = 48; depthIn = 28 }
      else if (ms.includes('Ultrawide')) { widthIn = 60; depthIn = 30 }
      else if (ms.includes('Triple')) { widthIn = 72; depthIn = 34 }

      if (gd.includes('Spacious')) {
        widthIn = Math.min(84, widthIn + 12)
        depthIn = Math.min(36, depthIn + 4)
      }

      const totalDepthWithChair = depthIn + 36 // 36" chair pushback

      return [
        res('Recommended Desk Size', `${widthIn}" W x ${depthIn}" D`, 'good', `${numD((widthIn * depthIn) / 144, 1)} sq ft work surface`),
        res('Total Floor Footprint', `${widthIn}" W x ${totalDepthWithChair}" D`, 'info', `${numD((widthIn * totalDepthWithChair) / 144, 1)} sq ft including chair rollback`),
        res('Monitor Viewing Distance', `${depthIn - 6}" to screens`, 'good', 'Prevents digital eye strain'),
        res('Standing Desk Suitability', widthIn <= 72 ? 'Standard Dual Motor Frame' : 'Heavy Duty Triple Leg Frame', 'neutral', 'Frame structural capacity'),
      ]
    },
  },
  {
    id: 'home-office-space-calculator',
    name: 'Home Office Space Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate the total square footage needed for a fully equipped, ergonomic work-from-home office.',
    tip: 'IRS home office deduction requires exclusive and regular business use; a dedicated 80-120 sq ft room is ideal.',
    usage: [
      'Select desk setup and filing/bookshelf storage requirements.',
      'Include guest seating or meeting armchairs.',
      'Check recommended dedicated room area and IRS tax deduction potential.',
    ],
    method: [
      'Desk zone: 35 sq ft. Storage/bookshelf zone: 20 sq ft. Circulation: 25 sq ft.',
      'IRS Simplified deduction = Sq Ft * $5.00/sqft (max 300 sq ft = $1,500).',
    ],
    fields: [
      sel('officeRole', 'Work Type & Gear Demands', [
        'Software / Digital Solo (Desk + Ergonomic Chair + 1 Shelf)',
        'Executive / Consulting (Desk + 2 Guest Chairs + Credenza)',
        'Creative / Design / Crafting (Large drafting table + Shelving banks)',
        'Minimalist Remote (Laptop desk in alcove)',
      ], 'Software / Digital Solo (Desk + Ergonomic Chair + 1 Shelf)'),
      n('bookshelves', 'Number of Bookcases / Storage Cabinets', { def: 2, min: 0, max: 6, step: 1 }),
      ck('includeGuestSeating', 'Include Guest / Client Armchairs', false),
    ],
    compute: (v) => {
      const role = asSel(v.officeRole)
      const shelves = asNum(v.bookshelves, 2)
      const guests = v.includeGuestSeating

      let baseSqft = 50
      if (role.includes('Executive')) baseSqft = 90
      else if (role.includes('Creative')) baseSqft = 110
      else if (role.includes('Minimalist')) baseSqft = 35

      const storageSqft = shelves * 12
      const guestSqft = guests ? 30 : 0
      const totalSqft = baseSqft + storageSqft + guestSqft

      // Simplified IRS deduction
      const deduction = Math.min(300, totalSqft) * 5.0

      return [
        res('Recommended Room Size', `${totalSqft} sq ft`, 'good', `e.g. ~${Math.round(Math.sqrt(totalSqft))} ft x ${Math.round(Math.sqrt(totalSqft) + 2)} ft`),
        res('Storage Allocation', `${storageSqft} sq ft`, 'info', `${shelves} storage units`),
        res('IRS Simplified Deduction', money(deduction), 'good', `Potential annual tax deduction ($5/sqft)`),
        res('Acoustic Recommendation', totalSqft > 80 ? 'Area rug + soft curtains' : 'Felt desk divider', 'neutral', 'Minimizes microphone echo'),
      ]
    },
  },
  {
    id: 'bedroom-storage-planner',
    name: 'Bedroom Storage Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Audit bedroom storage balance between dressers, nightstand drawers, under-bed boxes, and hanging wardrobes.',
    tip: 'Under-bed storage containers can recapture up to 25 cubic feet of dead space in a typical master bedroom.',
    usage: [
      'Select dresser type and number of drawers.',
      'Select under-bed storage utilization.',
      'Check total cubic feet of organized bedroom storage volume.',
    ],
    method: [
      'Dresser drawer = ~2.2 cu ft avg. Under-bed storage = ~18-28 cu ft.',
    ],
    fields: [
      n('dresserDrawers', 'Total Dresser Drawers in Room', { def: 6, min: 0, max: 18, step: 1 }),
      n('nightstandDrawers', 'Total Nightstand Drawers', { def: 4, min: 0, max: 6, step: 1 }),
      sel('underBedStorage', 'Under-Bed Storage Utilization', [
        'None (Empty clearance / no storage)',
        'Two Shallow Rolling Bins (~12 cu ft)',
        'Four High-Capacity Under-Bed Drawers (~24 cu ft)',
        'Full Hydraulic Lift Storage Bed (~35 cu ft)',
      ], 'Two Shallow Rolling Bins (~12 cu ft)'),
    ],
    compute: (v) => {
      const dd = asNum(v.dresserDrawers, 6)
      const nd = asNum(v.nightstandDrawers, 4)
      const ub = asSel(v.underBedStorage)

      const dresserVol = dd * 2.2
      const nightstandVol = nd * 0.9
      let underBedVol = 0
      if (ub.includes('Two Shallow')) underBedVol = 12
      else if (ub.includes('Four High-Capacity')) underBedVol = 24
      else if (ub.includes('Hydraulic')) underBedVol = 35

      const totalVol = dresserVol + nightstandVol + underBedVol

      return [
        res('Total Bedroom Storage', `${numD(totalVol, 1)} cu ft`, 'good', 'Available non-closet storage'),
        res('Dresser Capacity', `${numD(dresserVol, 1)} cu ft`, 'info', `${dd} drawers`),
        res('Under-Bed Contribution', `${underBedVol} cu ft`, underBedVol > 0 ? 'good' : 'neutral', `${Math.round((underBedVol / Math.max(1, totalVol)) * 100)}% of bedroom total`),
        res('Folded Garment Capacity', `~${Math.round(totalVol * 14)} folded items`, 'good', 'T-shirts, sweaters, linens'),
      ]
    },
  },
  {
    id: 'kitchen-storage-planner',
    name: 'Kitchen Storage Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Plan kitchen cabinet linear footage, pantry shelving, and appliance garage zones by culinary activity.',
    tip: 'Store everyday plates and glasses within 1 step of the dishwasher to cut unload time in half.',
    usage: [
      'Enter linear feet of upper and lower kitchen cabinets.',
      'Select cooking passion level (Occasional cook vs avid gourmet).',
      'Check storage adequacy and specialized pantry capacity.',
    ],
    method: [
      'Standard kitchen requires 20-30 linear feet of base and upper cabinets.',
      'Gourmet kitchens require 35+ linear feet.',
    ],
    fields: [
      n('baseCabinetFeet', 'Base Cabinet Linear Feet', { def: 18, min: 6, max: 50, step: 1 }),
      n('upperCabinetFeet', 'Upper Wall Cabinet Linear Feet', { def: 14, min: 4, max: 40, step: 1 }),
      sel('cookStyle', 'Cooking Frequency & Gear Level', [
        'Simple / Minimalist (Basic pots, dinnerware for 4)',
        'Standard Family (Multi-cooker, blender, dinnerware for 8)',
        'Gourmet / Baker (Stand mixer, food processor, extensive spices & pans)',
      ], 'Standard Family (Multi-cooker, blender, dinnerware for 8)'),
    ],
    compute: (v) => {
      const baseFt = asNum(v.baseCabinetFeet, 18)
      const upperFt = asNum(v.upperCabinetFeet, 14)
      const style = asSel(v.cookStyle)

      const totalLinear = baseFt + upperFt
      let reqLinear = 28
      if (style.includes('Simple')) reqLinear = 20
      else if (style.includes('Gourmet')) reqLinear = 40

      const isSufficient = totalLinear >= reqLinear
      const diff = totalLinear - reqLinear

      return [
        res('Total Cabinet Run', `${totalLinear} linear feet`, isSufficient ? 'good' : 'warn', `${baseFt} ft base + ${upperFt} ft upper`),
        res('Storage Sufficiency', isSufficient ? 'Well-Stocked Capacity' : 'Storage Constrained', isSufficient ? 'good' : 'warn', `${Math.abs(diff)} ft ${diff >= 0 ? 'surplus' : 'deficit'}`),
        res('Small Appliance Reserve', `${Math.round(baseFt * 0.3)} dedicated ft`, 'info', 'For air fryer, mixer, toaster'),
        res('Ergonomic Zone Layout', 'Prep zone between sink & range', 'good', 'NKBA work triangle standard'),
      ]
    },
  },
  {
    id: 'bathroom-storage-planner',
    name: 'Bathroom Storage Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Optimize vanity drawers, medicine cabinets, towel linen towers, and over-toilet shelving units.',
    tip: 'An over-the-toilet storage étagère adds 4 to 6 square feet of vertical shelving without consuming floor area.',
    usage: [
      'Select vanity size and drawer configuration.',
      'Specify number of bathroom daily users.',
      'Check towel and toiletry storage adequacy.',
    ],
    method: [
      'Each resident requires ~1.5 cu ft personal toiletry space + 4 folded bath towels.',
    ],
    fields: [
      sel('vanityType', 'Vanity Size & Style', [
        'Single Vanity 30" (Cabinet door with open bottom)',
        'Single Vanity 36"-48" (Combination doors & 3-4 drawers)',
        'Double Vanity 60"-72" (Dual sinks, 4-6 drawers)',
        'Wall-Mounted Floating Vanity (Minimalist shallow drawers)',
      ], 'Single Vanity 36"-48" (Combination doors & 3-4 drawers)'),
      n('users', 'People Sharing this Bathroom', { def: 2, min: 1, max: 6, step: 1 }),
      ck('overToiletStorage', 'Add Over-Toilet Shelf / Etagere', true),
      ck('linenCloset', 'Dedicated Bathroom Linen Closet Available', false),
    ],
    compute: (v) => {
      const vt = asSel(v.vanityType)
      const users = asNum(v.users, 2)
      const overToilet = v.overToiletStorage
      const linen = v.linenCloset

      let capacityScore = 40
      if (vt.includes('Double')) capacityScore = 80
      else if (vt.includes('36"-48"')) capacityScore = 60
      else if (vt.includes('Floating')) capacityScore = 30

      if (overToilet) capacityScore += 25
      if (linen) capacityScore += 45

      const reqScore = users * 35
      const ratio = capacityScore / reqScore

      return [
        res('Storage Capacity Rating', ratio >= 1.0 ? 'Adequate for All Users' : 'Cramped / Shared Bottleneck', ratio >= 1.0 ? 'good' : 'warn', `${capacityScore} pts vs ${reqScore} pts needed`),
        res('Bath Towel Capacity', linen ? '16+ Towels (Linen Closet)' : overToilet ? '6-8 Towels' : '2-4 Towels', 'info', `${users * 2} active towels needed`),
        res('Personal Drawer Allocation', vt.includes('Double') ? `${Math.round(4 / users)} drawers/person` : 'Shared central drawer', 'neutral', 'For daily hygiene gear'),
        res('Top Tip', overToilet ? 'Store baskets on over-toilet unit' : 'Install over-toilet shelving to add 35% space', 'good', 'Zero footprint upgrade'),
      ]
    },
  },
  {
    id: 'closet-capacity-calculator',
    name: 'Closet Capacity Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate hanging rod capacity and shelf volume for reach-in and walk-in wardrobe closets.',
    tip: 'Double-hanging rods (one at 42" and one at 84") instantly double hanging space for shirts and folded pants.',
    usage: [
      'Enter closet width in feet.',
      'Select closet type (Reach-in vs Walk-in).',
      'Select rod configuration (Single rod vs Double hang).',
      'Check total hanger count capacity and shelf storage volume.',
    ],
    method: [
      'Standard hangers require 1.25" to 1.5" of rod space each.',
      'Double hang doubles the linear rod feet.',
    ],
    fields: [
      n('closetWidthFeet', 'Closet Width (Feet)', { def: 6, min: 3, max: 20, step: 0.5 }),
      sel('closetType', 'Closet Architecture', [
        'Standard Reach-In Closet (24" deep)',
        'Walk-In Closet - Single Sided',
        'Walk-In Closet - Double Sided',
        'Walk-In Closet - U-Shaped (3 walls)',
      ], 'Standard Reach-In Closet (24" deep)'),
      sel('rodConfig', 'Rod Arrangement', [
        'Single High Rod with Upper Shelf',
        'Double Hang (Two tier rods for shirts/pants)',
        'Split: 50% Double Hang + 50% Long Dress Hang',
      ], 'Split: 50% Double Hang + 50% Long Dress Hang'),
    ],
    compute: (v) => {
      const w = asNum(v.closetWidthFeet, 6)
      const ct = asSel(v.closetType)
      const rc = asSel(v.rodConfig)

      let usableWidthFt = w
      if (ct.includes('Double Sided')) usableWidthFt = w * 2
      else if (ct.includes('U-Shaped')) usableWidthFt = w * 2.4

      let rodMultiplier = 1.0
      if (rc.includes('Double Hang (Two tier')) rodMultiplier = 2.0
      else if (rc.includes('Split:')) rodMultiplier = 1.5

      const totalRodInches = usableWidthFt * 12 * rodMultiplier
      const maxHangers = Math.round(totalRodInches / 1.35) // 1.35" per garment avg
      const upperShelfSqft = usableWidthFt * 1.0 // 12" shelf

      return [
        res('Hanging Capacity', `${maxHangers} garments`, 'good', `${Math.round(totalRodInches / 12)} linear feet of rod`),
        res('Upper Shelf Area', `${numD(upperShelfSqft, 1)} sq ft`, 'info', 'Ideal for luggage and seasonal boxes'),
        res('Double Hang Benefit', rc.includes('Single') ? 'Switch to double hang for +50-80% capacity' : 'Optimized multi-tier hanging', 'good', 'Maximizes vertical space'),
        res('Shoe Storage Potential', `~${Math.round(usableWidthFt * 3)} pairs`, 'neutral', 'Along floor level'),
      ]
    },
  },
  {
    id: 'drawer-capacity-calculator',
    name: 'Drawer Capacity Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate clothing capacity per dresser drawer using standard flat folds vs vertical Marie Kondo file folding.',
    tip: 'Vertical file folding allows you to store 30% to 50% more garments in the same drawer while keeping every item visible.',
    usage: [
      'Enter drawer width, depth, and height in inches.',
      'Select folding technique (Traditional flat stack vs Vertical file fold).',
      'Check t-shirt, jeans, or sock capacity per drawer.',
    ],
    method: [
      'Drawer Volume = (W * D * H) / 1728 cu ft.',
      'File folding packs ~1 t-shirt per 1.2" of width and depth.',
    ],
    fields: [
      n('drawerWidthInches', 'Drawer Internal Width (Inches)', { def: 28, min: 10, max: 48, step: 1 }),
      n('drawerDepthInches', 'Drawer Internal Depth (Inches)', { def: 16, min: 10, max: 24, step: 1 }),
      n('drawerHeightInches', 'Drawer Internal Height (Inches)', { def: 7, min: 4, max: 14, step: 0.5 }),
      sel('foldingMethod', 'Garment Folding Method', [
        'Vertical File Folding (KonMari style - Recommended)',
        'Traditional Flat Stacking',
      ], 'Vertical File Folding (KonMari style - Recommended)'),
    ],
    compute: (v) => {
      const w = asNum(v.drawerWidthInches, 28)
      const d = asNum(v.drawerDepthInches, 16)
      const h = asNum(v.drawerHeightInches, 7)
      const method = asSel(v.foldingMethod)

      const cuFt = (w * d * h) / 1728
      const isFile = method.includes('Vertical')

      // A 28x16 drawer fits 2 rows of folded shirts. Each row ~24 shirts file folded vs ~14 stacked
      const shirtMultiplier = isFile ? 1.0 : 0.65
      const estShirts = Math.round((w / 1.2) * (d / 12) * shirtMultiplier)
      const estJeans = Math.round(estShirts * 0.45)
      const estSocks = Math.round(estShirts * 2.2)

      return [
        res('Drawer Internal Volume', `${numD(cuFt, 2)} cu ft`, 'neutral', `${w}" W x ${d}" D x ${h}" H`),
        res('T-Shirt Capacity', `~${estShirts} shirts`, 'good', isFile ? 'All clearly visible' : 'Bottom shirts hidden'),
        res('Jeans / Pants Capacity', `~${estJeans} pairs`, 'info', 'Folded or rolled'),
        res('Socks / Underwear', `~${estSocks} pairs`, 'good', 'Organized in dividers'),
      ]
    },
  },
  {
    id: 'cabinet-storage-calculator',
    name: 'Cabinet Storage Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate internal volume and shelf weight limits for wall cabinets, garage lockers, and sideboards.',
    tip: 'Standard 3/4-inch plywood shelves span up to 36 inches without sagging under normal 40 lb kitchen dish loads.',
    usage: [
      'Enter cabinet width, height, and depth in inches.',
      'Enter number of adjustable shelves.',
      'Check total cubic feet of storage and recommended shelf load capacity.',
    ],
    method: [
      'Volume = (W * H * D) / 1728 cu ft.',
      'Shelf Span Sag Rule: Shelves > 32" require center support for heavy canned goods.',
    ],
    fields: [
      n('cabinetWidth', 'Cabinet Width (Inches)', { def: 36, min: 12, max: 72, step: 2 }),
      n('cabinetHeight', 'Cabinet Height (Inches)', { def: 42, min: 18, max: 96, step: 2 }),
      n('cabinetDepth', 'Cabinet Depth (Inches)', { def: 14, min: 8, max: 30, step: 1 }),
      n('shelfCount', 'Number of Interior Shelves', { def: 3, min: 1, max: 8, step: 1 }),
    ],
    compute: (v) => {
      const w = asNum(v.cabinetWidth, 36)
      const h = asNum(v.cabinetHeight, 42)
      const d = asNum(v.cabinetDepth, 14)
      const shelves = asNum(v.shelfCount, 3)

      const totalVolCuFt = (w * h * d) / 1728
      const shelfAreaSqft = (w * d * shelves) / 144
      const maxWeightPerShelf = w > 36 ? 35 : w > 30 ? 45 : 60

      return [
        res('Total Internal Volume', `${numD(totalVolCuFt, 1)} cu ft`, 'good', `${num(Math.round(totalVolCuFt * 28.3))} Liters`),
        res('Total Shelf Surface', `${numD(shelfAreaSqft, 1)} sq ft`, 'info', `${shelves} internal shelves`),
        res('Safe Load per Shelf', `${maxWeightPerShelf} lbs`, w > 36 ? 'warn' : 'good', w > 36 ? 'Recommend center stiffener cleat' : 'Safe for heavy stoneware'),
        res('Vertical Shelf Spacing', `${numD(h / (shelves + 1), 1)}" avg gap`, 'neutral', 'Height between shelves'),
      ]
    },
  },
  {
    id: 'room-lighting-calculator',
    name: 'Room Lighting Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate required Lumens and LED wattage for living rooms, kitchens, reading areas, and home offices.',
    tip: 'Kitchens and task zones need 40-50 foot-candles (lumens/sqft), while cozy living rooms only require 15-20.',
    usage: [
      'Enter room length and width in feet.',
      'Select room task activity (Ambient living, Office task, Kitchen prep, Bathroom vanity).',
      'Check total required lumens and equivalent modern LED bulb count.',
    ],
    method: [
      'Required Lumens = Room Sq Ft * Target Foot-Candles.',
      'LED Watts = Total Lumens / 90 lumens per Watt.',
      'Standard 60W equivalent LED bulb = ~800 lumens.',
    ],
    fields: [
      n('lengthFt', 'Room Length (Feet)', { def: 15, min: 6, max: 40, step: 0.5 }),
      n('widthFt', 'Room Width (Feet)', { def: 12, min: 6, max: 30, step: 0.5 }),
      sel('activityLevel', 'Room Function & Lighting Need', [
        'Living Room / Bedroom (15-20 Lumens/sq ft - Relaxed ambient)',
        'Dining Room / Hallways (25-30 Lumens/sq ft - General ambient)',
        'Home Office / Study (40-50 Lumens/sq ft - Focus task)',
        'Kitchen Prep / Bathroom Vanity (60-70 Lumens/sq ft - High task)',
      ], 'Living Room / Bedroom (15-20 Lumens/sq ft - Relaxed ambient)'),
    ],
    compute: (v) => {
      const len = asNum(v.lengthFt, 15)
      const wid = asNum(v.widthFt, 12)
      const act = asSel(v.activityLevel)
      const area = len * wid

      let footCandles = 20
      if (act.includes('Dining')) footCandles = 28
      else if (act.includes('Home Office')) footCandles = 45
      else if (act.includes('Kitchen Prep')) footCandles = 65

      const totalLumens = area * footCandles
      const ledWatts = Math.round(totalLumens / 90)
      const bulbs800 = Math.ceil(totalLumens / 800)

      return [
        res('Required Total Lumens', `${num(totalLumens)} lumens`, 'good', `${footCandles} lumens/sq ft`),
        res('Equivalent LED Power', `~${ledWatts} W total`, 'info', 'High-efficiency LED fixtures'),
        res('Standard 800lm Bulbs', `${bulbs800} bulbs`, 'neutral', 'Equivalent to standard 9W LED / 60W incandescent'),
        res('Color Temperature Guide', act.includes('Kitchen') || act.includes('Office') ? '3500K - 4000K (Bright Neutral)' : '2700K (Warm Soft White)', 'good', 'Optimizes mood & circadian rhythm'),
      ]
    },
  },
  {
    id: 'light-fixture-spacing-calculator',
    name: 'Light Fixture Spacing Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate recessed can light spacing, ceiling grid placement, and wall standoff distances.',
    tip: 'Divide ceiling height by 2 to determine the general spacing between recessed downlights (e.g. 8 ft ceiling = 4 ft apart).',
    usage: [
      'Enter room length and width.',
      'Enter ceiling height in feet.',
      'Select recessed can aperture size (4-inch vs 6-inch).',
      'Check recommended number of fixtures, grid spacing, and distance from walls.',
    ],
    method: [
      'Standard Rule: Spacing between lights = Ceiling Height / 2.',
      'Spacing to wall = Half of fixture-to-fixture spacing.',
    ],
    fields: [
      n('roomLengthFt', 'Room Length (Feet)', { def: 18, min: 8, max: 50, step: 0.5 }),
      n('roomWidthFt', 'Room Width (Feet)', { def: 14, min: 8, max: 40, step: 0.5 }),
      n('ceilingHeightFt', 'Ceiling Height (Feet)', { def: 9, min: 7.5, max: 18, step: 0.5 }),
    ],
    compute: (v) => {
      const len = asNum(v.roomLengthFt, 18)
      const wid = asNum(v.roomWidthFt, 14)
      const h = asNum(v.ceilingHeightFt, 9)

      const spacingBetween = h / 2
      const spacingWall = spacingBetween / 2

      const cols = Math.max(2, Math.round(len / spacingBetween))
      const rows = Math.max(2, Math.round(wid / spacingBetween))
      const totalFixtures = cols * rows

      return [
        res('Total Recessed Fixtures', `${totalFixtures} lights`, 'good', `${cols} rows x ${rows} columns`),
        res('Fixture-to-Fixture Spacing', `${numD(spacingBetween, 1)} ft apart`, 'info', 'Uniform light distribution'),
        res('Standoff from Wall', `${numD(spacingWall, 1)} ft from wall`, 'good', 'Prevents harsh wall scalloping shadows'),
        res('Beam Angle Target', h > 10 ? 'Narrow 40° Beam' : 'Wide 90°-110° Flood', 'neutral', `Matched to ${h} ft ceiling`),
      ]
    },
  },
  {
    id: 'room-decor-budget-calculator',
    name: 'Room Decor Budget Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Allocate a room furnishing and interior decoration budget across rugs, window treatments, lighting, and accents.',
    tip: 'Allocate 40-50% of your decor budget to your primary anchor furniture piece (sofa or bed) for maximum longevity.',
    usage: [
      'Enter total decor budget amount.',
      'Select decor style tier (Budget DIY, Mid-Market retail, High-End Designer).',
      'View category percentage allocations for furniture, rugs, lighting, and art.',
    ],
    method: [
      'Anchor Furniture: 45%. Rugs & Textiles: 15%. Lighting: 12%. Wall Art & Mirrors: 12%. Accessories: 10%. Buffer: 6%.',
    ],
    fields: [
      n('totalBudget', 'Total Room Decor Budget ($)', { def: 3500, min: 250, max: 30000, step: 100 }),
      sel('styleTier', 'Furnishing Quality Tier', [
        'Affordable / Fast Retail (IKEA, Target, Wayfair)',
        'Mid-Range Quality (West Elm, CB2, Pottery Barn)',
        'High-End / Custom Designer (Restoration Hardware, Custom upholstery)',
      ], 'Mid-Range Quality (West Elm, CB2, Pottery Barn)'),
    ],
    compute: (v) => {
      const b = asNum(v.totalBudget, 3500)
      const tier = asSel(v.styleTier)

      const anchor = b * 0.45
      const textiles = b * 0.15
      const lighting = b * 0.12
      const art = b * 0.12
      const decor = b * 0.10
      const contingency = b * 0.06

      return [
        res('Anchor Furniture (Sofa/Bed)', money(anchor), 'good', `${tier.split('(')[0].trim()} - 45% of budget`),
        res('Rugs, Curtains & Pillows', money(textiles), 'info', '15% for cozy acoustics'),
        res('Lighting & Lamps', money(lighting), 'neutral', '12% for layered lighting'),
        res('Wall Art & Decor Accessories', money(art + decor), 'info', `22% decor + ${money(contingency)} reserve`),
      ]
    },
  },
  {
    id: 'room-renovation-budget-planner',
    name: 'Room Renovation Budget Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Plan remodel costs across demolition, materials, labor, permits, and mandatory 15-20% contingency reserves.',
    tip: 'Always hold a 15% to 20% contingency fund; hidden electrical, plumbing, or subfloor issues emerge in almost every remodel.',
    usage: [
      'Enter target renovation budget.',
      'Select room type (Kitchen, Master Bath, Guest Bath, Basement, Bedroom).',
      'Select DIY vs professional contractor labor.',
      'Check breakdown across materials, labor, permits, and contingency reserves.',
    ],
    method: [
      'Contractor: Labor ~50%, Materials ~32%, Permits ~3%, Contingency 15%.',
      'DIY: Labor 0%, Materials ~80%, Tools ~5%, Contingency 15%.',
    ],
    fields: [
      n('budget', 'Total Renovation Target Budget ($)', { def: 12000, min: 1000, max: 100000, step: 500 }),
      sel('contractorMode', 'Labor Strategy', [
        'Full General Contractor & Subcontractors',
        'Partial DIY (DIY painting & demo, hire plumbing/electrical)',
        '100% DIY (All self-performed)',
      ], 'Full General Contractor & Subcontractors'),
      sel('roomType', 'Room to Renovate', [
        'Master Bathroom Renovation',
        'Kitchen Remodel',
        'Basement Finishing',
        'Bedroom / Living Room Overhaul',
      ], 'Master Bathroom Renovation'),
    ],
    compute: (v) => {
      const b = asNum(v.budget, 12000)
      const mode = asSel(v.contractorMode)

      let laborPct = 0.48
      let matPct = 0.34
      let contPct = 0.15
      let permitPct = 0.03

      if (mode.includes('100% DIY')) {
        laborPct = 0
        matPct = 0.78
        contPct = 0.15
        permitPct = 0.07
      } else if (mode.includes('Partial DIY')) {
        laborPct = 0.28
        matPct = 0.52
        contPct = 0.16
        permitPct = 0.04
      }

      const labor = b * laborPct
      const materials = b * matPct
      const contingency = b * contPct
      const permits = b * permitPct

      return [
        res('Materials & Fixtures', money(materials), 'good', `${Math.round(matPct * 100)}% allocation`),
        res('Labor / Contractor Fees', money(labor), labor > 0 ? 'warn' : 'good', `${Math.round(laborPct * 100)}% allocation`),
        res('Mandatory Contingency', money(contingency), 'bad', `${Math.round(contPct * 100)}% rainy day reserve`),
        res('Permits & Disposal', money(permits), 'neutral', 'Dumpster & municipal permits'),
      ]
    },
  },
  {
    id: 'home-space-utilization-calculator',
    name: 'Home Space Utilization Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Assess how efficiently your home square footage is utilized versus neglected under-used spaces.',
    tip: 'Formal dining rooms and guest bedrooms typically sit empty 92% of the year; consider multi-functional hybrid setups.',
    usage: [
      'Enter total home interior square footage.',
      'Enter estimated square footage of rooms rarely used (< 2 hrs/week).',
      'Check active space utilization rate and carrying cost of underutilized rooms.',
    ],
    method: [
      'Utilization Rate = ((Total - Rare) / Total) * 100.',
      'Underutilized Carrying Cost = (Rare / Total) * Annual Mortgage/Taxes.',
    ],
    fields: [
      n('totalHomeSqft', 'Total Home Finished Area (sq ft)', { def: 2200, min: 400, max: 10000, step: 50 }),
      n('underusedSqft', 'Underutilized Space (sq ft)', { def: 350, min: 0, max: 3000, step: 25 }),
      n('annualHomeCost', 'Annual Housing Cost (Mortgage/Taxes/Ins) ($)', { def: 24000, min: 5000, max: 120000, step: 1000 }),
    ],
    compute: (v) => {
      const total = asNum(v.totalHomeSqft, 2200)
      const rare = asNum(v.underusedSqft, 350)
      const cost = asNum(v.annualHomeCost, 24000)

      const active = Math.max(0, total - rare)
      const utilPct = (active / total) * 100
      const costOfDeadSpace = (rare / total) * cost

      return [
        res('Space Utilization Rate', pct(utilPct), utilPct >= 85 ? 'good' : 'warn', `${num(active)} sq ft actively enjoyed`),
        res('Neglected Space', `${rare} sq ft`, rare > 300 ? 'warn' : 'good', `${pct(100 - utilPct)} of home area`),
        res('Cost of Underused Space', money(costOfDeadSpace), 'bad', 'Annual housing dollars supporting rare spaces'),
        res('Hybrid Strategy', rare > 200 ? 'Convert formal room to hybrid office/library' : 'Well balanced layout', 'info', 'Multi-functional design'),
      ]
    },
  },
  {
    id: 'furniture-buying-checklist',
    name: 'Furniture Buying Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Step-by-step pre-purchase checklist covering stairwell clearance, doorway dimensions, and fabric performance codes.',
    tip: 'Always measure elevator doors, tight stair turns, and hallway diagonal clearance before purchasing large sectionals.',
    usage: [
      'Work through critical pre-purchase dimension checks.',
      'Confirm fabric abrasion rub count and pet durability.',
      'Verify return policy and white glove delivery fees.',
    ],
    method: [
      'Calculates checklist completion readiness score.',
    ],
    fields: [
      ck('measureDoorways', 'Measured front door, interior doors, and stairwell diagonal clearances', false),
      ck('tapeFloor', 'Taped out piece footprint on room floor with painter’s tape for 24 hours', false),
      ck('checkFabric', 'Verified fabric rub count (double rubs > 15,000) and stain resistance', false),
      ck('frameConstruction', 'Confirmed kiln-dried hardwood frame & corner-blocked joinery', false),
      ck('returnPolicy', 'Checked delivery charges, restock fees, and return shipping window', false),
      ck('cushionFill', 'Confirmed cushion core density (minimum 2.0 lb high-resilience foam)', false),
    ],
    compute: (v) => {
      const items = [
        v.measureDoorways,
        v.tapeFloor,
        v.checkFabric,
        v.frameConstruction,
        v.returnPolicy,
        v.cushionFill,
      ]
      const passed = items.filter(Boolean).length
      const score = Math.round((passed / items.length) * 100)

      return [
        res('Pre-Purchase Readiness', `${score}% Ready`, score >= 80 ? 'good' : 'warn', `${passed} of ${items.length} checks confirmed`),
        res('Doorway Clearance Status', v.measureDoorways ? 'Verified Safe' : 'CRITICAL: Measure Doorways', v.measureDoorways ? 'good' : 'bad', 'Prevents delivery day rejection'),
        res('Scale & Proportion Test', v.tapeFloor ? 'Visualized on Floor' : 'Tape on floor recommended', v.tapeFloor ? 'good' : 'warn', 'Prevents oversized regret'),
        res('Durability Verification', v.frameConstruction && v.checkFabric ? 'Long-term Quality' : 'Review materials & warranty', 'info', 'Ensures multi-year lifespan'),
      ]
    },
  },
  {
    id: 'room-setup-checklist',
    name: 'Room Setup Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Interactive chronological setup checklist for moving into and organizing a brand new room from scratch.',
    tip: 'Always clean baseboards and paint ceilings/walls before unrolling rugs or moving large furniture into place.',
    usage: [
      'Follow the logical sequential order from prep to final decor touches.',
      'Check off completed phases (Painting, Rug placement, Anchor furniture, Layered lighting).',
      'Track total room completion percentage.',
    ],
    method: [
      'Phase progress tracker across cleaning, painting, rug, anchor pieces, lighting, and styling.',
    ],
    fields: [
      ck('deepClean', 'Phase 1: Deep clean baseboards, windows, and vacuum bare subfloor', false),
      ck('paintWalls', 'Phase 2: Complete paint and accent wall trim before furniture arrival', false),
      ck('layRug', 'Phase 3: Position rug pad and main area rug first in center of space', false),
      ck('anchorFurniture', 'Phase 4: Position heavy anchor furniture (sofa, bed, dining table)', false),
      ck('cableManagement', 'Phase 5: Route and conceal power cables behind consoles and desks', false),
      ck('lightingHanging', 'Phase 6: Hang curtains high & wide, mount wall art, and set lamps', false),
    ],
    compute: (v) => {
      const tasks = [
        v.deepClean,
        v.paintWalls,
        v.layRug,
        v.anchorFurniture,
        v.cableManagement,
        v.lightingHanging,
      ]
      const done = tasks.filter(Boolean).length
      const completionPct = Math.round((done / tasks.length) * 100)

      return [
        res('Room Setup Progress', `${completionPct}% Complete`, completionPct === 100 ? 'good' : completionPct > 50 ? 'info' : 'warn', `${done} of ${tasks.length} phases done`),
        res('Current Priority', !v.deepClean ? 'Clean Bare Floors' : !v.paintWalls ? 'Paint & Wall Trim' : !v.layRug ? 'Unroll Main Rug' : !v.anchorFurniture ? 'Position Anchor Pieces' : 'Mount Art & Textiles', 'neutral', 'Optimal sequence avoids double work'),
        res('Curtain Tip', 'Hang rods 4"-6" above window frame', 'good', 'Makes ceilings feel taller'),
        res('Art Height Tip', 'Center art at 57"-60" from floor', 'info', 'Standard gallery eye level'),
      ]
    },
  },
]
