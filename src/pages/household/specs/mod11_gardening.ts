import {
  type HouseholdSpec,
  type Tone,
  n,
  sel,
  ck,
  res,
  asNum,
  asSel,
  money,
  moneyC,
  num,
  numD,
} from './householdSpec'

const SUB = 'Gardening'
const SUB_ID = 'gardening'

export const gardeningSpecs: HouseholdSpec[] = [
  {
    id: 'garden-water-requirement-calculator',
    name: 'Garden Water Requirement Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate weekly gallons of water needed for raised beds, shrubs, and perennial gardens based on soil and weather.',
    tip: 'Most vegetable gardens thrive on 1 to 1.5 inches of water per week, delivered deeply 2-3 times rather than shallow daily sprinkles.',
    usage: [
      'Enter garden plot area in square feet.',
      'Select weekly watering depth in inches.',
      'Check weekly gallons needed and hose watering duration.',
    ],
    method: [
      'Gallons = Area (sq ft) * Inches Depth * 0.6233 gallons/sqft-inch.',
    ],
    fields: [
      n('areaSqft', 'Garden Area (Square Feet)', { def: 160, min: 10, max: 10000, step: 10 }),
      n('waterInches', 'Target Weekly Water (Inches)', { def: 1.25, min: 0.5, max: 3.0, step: 0.25 }),
      n('hoseFlowGpm', 'Hose / Sprayer Flow Rate (GPM)', { def: 5.0, min: 1.0, max: 15.0, step: 0.5 }),
    ],
    compute: (v) => {
      const area = asNum(v.areaSqft, 160)
      const inches = asNum(v.waterInches, 1.25)
      const gpm = asNum(v.hoseFlowGpm, 5.0)

      const weeklyGal = area * inches * 0.6233
      const dailyAvgGal = weeklyGal / 7
      const totalMinutes = weeklyGal / gpm

      return [
        res('Weekly Water Volume', `${num(Math.round(weeklyGal))} gal`, 'good', `${num(Math.round(weeklyGal * 3.785))} Liters`),
        res('Daily Average', `${num(Math.round(dailyAvgGal))} gal/day`, 'info', 'Smoothed benchmark'),
        res('Total Hose Runtime', `${Math.round(totalMinutes)} minutes/wk`, 'neutral', `Split over 2-3 deep soakings`),
        res('Deep Soak Frequency', 'Water 2 to 3 times weekly', 'good', 'Encourages deep taproot growth'),
      ]
    },
  },
  {
    id: 'plant-watering-frequency-calculator',
    name: 'Plant Watering Frequency Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Determine watering cadence for indoor houseplants and outdoor potted plants based on pot material and light.',
    tip: 'Porous terracotta pots dry out twice as fast as glazed ceramic or plastic pots; adjust watering frequency accordingly.',
    usage: [
      'Select plant type and moisture requirement (Succulent, Tropical, Vegetable).',
      'Select pot material (Terracotta, Plastic, Ceramic).',
      'Select environmental sunlight exposure.',
      'Check recommended watering cadence in days.',
    ],
    method: [
      'Calculates moisture evaporation rate based on pot porosity and transpiration index.',
    ],
    fields: [
      sel('plantType', 'Plant Moisture Profile', [
        'Tropical Houseplants (Monstera, Pothos - Medium moisture)',
        'Drought-Tolerant / Succulent / Cactus (Low moisture)',
        'Foliage Plants / Ferns (High moisture)',
        'Potted Fruiting Vegetables (Tomatoes, Peppers - High transpiration)',
      ], 'Tropical Houseplants (Monstera, Pothos - Medium moisture)'),
      sel('potMaterial', 'Container Pot Material', [
        'Unglazed Terracotta / Clay (Fast evaporation)',
        'Plastic / Resin Nursery Pot (Moderate retention)',
        'Glazed Ceramic with Drainage (High retention)',
      ], 'Unglazed Terracotta / Clay (Fast evaporation)'),
      sel('sunlight', 'Light Exposure', [
        'Bright Direct Sunlight (Hot & dry)',
        'Bright Indirect Light (Standard indoor)',
        'Low / Medium Light (Slow drying)',
      ], 'Bright Indirect Light (Standard indoor)'),
    ],
    compute: (v) => {
      const pt = asSel(v.plantType)
      const pot = asSel(v.potMaterial)
      const sun = asSel(v.sunlight)

      let days = 7
      if (pt.includes('Succulent')) days = 16
      else if (pt.includes('Ferns')) days = 4
      else if (pt.includes('Vegetables')) days = 2

      if (pot.includes('Terracotta')) days = Math.max(1, Math.round(days * 0.75))
      else if (pot.includes('Ceramic')) days = Math.round(days * 1.2)

      if (sun.includes('Direct')) days = Math.max(1, Math.round(days * 0.7))
      else if (sun.includes('Low')) days = Math.round(days * 1.35)

      return [
        res('Watering Cadence', `Every ${days} day${days > 1 ? 's' : ''}`, days <= 3 ? 'warn' : 'good', `${pt.split('(')[0].trim()}`),
        res('Soil Moisture Check', days > 10 ? 'Check top 2 inches dry' : 'Check top 1 inch dry', 'info', 'Use finger or moisture meter'),
        res('Drainage Requirement', 'Pot must have drainage hole', 'bad', 'Standing water causes root rot'),
        res('Seasonal Adjustment', 'Reduce frequency by 30% in winter', 'neutral', 'Plants enter dormancy'),
      ]
    },
  },
  {
    id: 'garden-irrigation-planner',
    name: 'Garden Irrigation Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Map garden watering zones between low-pressure micro-drip emitters, soaker lines, and elevated sprayers.',
    tip: 'Never combine drip emitters and spray sprinklers on the same valve zone; their application rates differ by 500%.',
    usage: [
      'Enter number of garden beds or distinct plantings.',
      'Select irrigation method for each bed.',
      'Check recommended zone division, valve requirements, and water pressure regulator specs.',
    ],
    method: [
      'Calculates total Gallons Per Hour (GPH) and sizes water zones within residential 400 GPH tap limit.',
    ],
    fields: [
      n('raisedBeds', 'Number of Raised Garden Beds (4x8 ft)', { def: 4, min: 1, max: 20, step: 1 }),
      n('emittersPerBed', 'Drip Emitters per Bed', { def: 16, min: 4, max: 64, step: 2 }),
      sel('emitterRate', 'Emitter Flow Rate', [
        '1.0 GPH Emitter (Standard vegetable)',
        '0.5 GPH Emitter (Slow soak / heavy clay)',
        '2.0 GPH Emitter (Fast drainage / sandy soil)',
      ], '1.0 GPH Emitter (Standard vegetable)'),
    ],
    compute: (v) => {
      const beds = asNum(v.raisedBeds, 4)
      const perBed = asNum(v.emittersPerBed, 16)
      const er = asSel(v.emitterRate)

      const gphRate = er.includes('0.5') ? 0.5 : er.includes('2.0') ? 2.0 : 1.0
      const totalEmitters = beds * perBed
      const totalGph = totalEmitters * gphRate
      const totalGpm = totalGph / 60

      const zonesNeeded = Math.ceil(totalGph / 250) // 250 GPH per 1/2" line limit

      return [
        res('Total System Flow', `${Math.round(totalGph)} GPH (${numD(totalGpm, 1)} GPM)`, 'good', `${totalEmitters} total emitters`),
        res('Recommended Zones', `${zonesNeeded} irrigation zone${zonesNeeded > 1 ? 's' : ''}`, 'info', 'Prevents pressure drop'),
        res('Pressure Regulator', '25 PSI Pressure Regulator Required', 'warn', 'Standard tap (60 PSI) blows off fittings'),
        res('Run Time Target', `${Math.round((0.5 / gphRate) * 60)} minutes per cycle`, 'good', 'Provides ~0.5 gallon per plant'),
      ]
    },
  },
  {
    id: 'drip-irrigation-calculator',
    name: 'Drip Irrigation Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate total mainline tubing, 1/4" micro tubing, drip emitters, and barb fittings for drip systems.',
    tip: 'Limit any single run of 1/2-inch poly tubing to a maximum of 200 feet and 220 total GPH to prevent pressure loss at the tail end.',
    usage: [
      'Enter total linear run of 1/2" poly mainline tubing.',
      'Enter total number of plant drippers needed.',
      'Check complete parts manifest including tee connectors, end caps, and backflow preventer.',
    ],
    method: [
      'Calculates parts manifest based on tubing lengths and emitter counts.',
    ],
    fields: [
      n('mainlineFt', '1/2" Mainline Tubing Length (Feet)', { def: 120, min: 10, max: 500, step: 10 }),
      n('dripperCount', 'Total Drippers / Emitters Needed', { def: 45, min: 5, max: 300, step: 5 }),
    ],
    compute: (v) => {
      const mainFt = asNum(v.mainlineFt, 120)
      const drippers = asNum(v.dripperCount, 45)

      const microTubingFt = drippers * 2.5 // ~2.5 ft 1/4" tube per plant
      const barbs14 = drippers
      const groundStakes = drippers + Math.round(mainFt / 5)
      const tees12 = Math.ceil(mainFt / 30)

      return [
        res('1/2" Main Tubing', `${mainFt} feet`, 'good', `${tees12} tee fittings included`),
        res('1/4" Micro Tubing', `${Math.round(microTubingFt)} feet`, 'info', 'Branch lines to each plant stem'),
        res('Drip Emitters & Barbs', `${drippers} emitters + ${barbs14} couplers`, 'good', 'Pressure compensating (PC) emitters'),
        res('Tubing Hold-Down Stakes', `${groundStakes} stakes`, 'neutral', 'Every 5 ft on mainline + 1 per dripper'),
      ]
    },
  },
  {
    id: 'irrigation-pipe-length-calculator',
    name: 'Irrigation Pipe Length Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate PVC or poly pipe footage and friction loss for lawn sprinkler and garden distribution trenches.',
    tip: 'Size irrigation pipes for water velocity under 5 feet per second to prevent damaging water hammer.',
    usage: [
      'Enter trench run distance from water source to farthest valve manifold.',
      'Enter manifold lateral line distances.',
      'Check total pipe footage and recommended pipe diameter (3/4" vs 1").',
    ],
    method: [
      'Pipe Total = Mainline trench + Lateral runs + 10% fitting cut allowance.',
    ],
    fields: [
      n('mainlineDistance', 'Distance from Spigot/Source to Garden (Feet)', { def: 65, min: 5, max: 400, step: 5 }),
      n('lateralRuns', 'Total Lateral Bed Pipe Length (Feet)', { def: 110, min: 10, max: 1000, step: 10 }),
      n('flowGpm', 'Required Zone Water Flow (GPM)', { def: 8, min: 2, max: 25, step: 1 }),
    ],
    compute: (v) => {
      const main = asNum(v.mainlineDistance, 65)
      const lat = asNum(v.lateralRuns, 110)
      const gpm = asNum(v.flowGpm, 8)

      const totalPipeFt = Math.ceil((main + lat) * 1.10)
      const recDiameter = gpm > 10 ? '1-inch Schedule 40 PVC / Poly' : '3/4-inch Schedule 40 PVC / Poly'

      return [
        res('Total Pipe Required', `${totalPipeFt} feet`, 'good', 'Includes 10% fitting cuts & curve buffer'),
        res('Recommended Pipe Size', recDiameter, 'good', `Optimized for ${gpm} GPM flow`),
        res('Trench Depth Guideline', '8 to 12 inches deep', 'neutral', 'Below lawn aeration depth'),
        res('Winter Freeze Tip', 'Install manual drain valve at lowest elevation', 'warn', 'Prevents frozen cracked pipes in winter'),
      ]
    },
  },
  {
    id: 'garden-fertilizer-schedule',
    name: 'Garden Fertilizer Schedule',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Schedule organic and synthetic feeding cycles for tomatoes, leafy greens, root vegetables, and berries.',
    tip: 'Excess nitrogen produces lush green tomato foliage but causes blossom drop and zero fruit development.',
    usage: [
      'Select crop type (Tomatoes, Leafy Greens, Root Vegetables, Berries).',
      'Select fertilizer type (Organic slow-release vs Water-soluble synthetic).',
      'Check feeding schedule throughout planting, flowering, and fruiting.',
    ],
    method: [
      'Maps crop nutrient consumption stages to N-P-K ratios.',
    ],
    fields: [
      sel('cropType', 'Crop Category', [
        'Fruiting Vegetables (Tomatoes, Peppers, Eggplant - High K/P demand)',
        'Leafy Greens (Lettuce, Spinach, Kale - High N demand)',
        'Root Vegetables (Carrots, Beets, Radish - Moderate P/K)',
        'Berry Bushes (Strawberries, Blueberries - Acidic & slow release)',
      ], 'Fruiting Vegetables (Tomatoes, Peppers, Eggplant - High K/P demand)'),
      sel('fertilizerForm', 'Fertilizer Type', [
        'Organic Granular Slow-Release (e.g. 4-4-4 or 5-10-10)',
        'Water-Soluble Liquid (Fish emulsion, seaweed, synthetic)',
      ], 'Organic Granular Slow-Release (e.g. 4-4-4 or 5-10-10)'),
    ],
    compute: (v) => {
      const crop = asSel(v.cropType)
      const form = asSel(v.fertilizerForm)

      const isOrganic = form.includes('Organic')

      return [
        res('Initial Planting Feed', isOrganic ? 'Mix 2 tbsp organic granular in planting hole' : 'Water in with 1/2 strength liquid', 'good', 'Establish root development'),
        res('Active Growth Cadence', isOrganic ? 'Side-dress every 4 to 6 weeks' : 'Liquid feed every 10 to 14 days', 'info', form.split('(')[0].trim()),
        res('Fruiting Stage Adjustment', crop.includes('Fruiting') ? 'Switch to low-nitrogen, high potassium (5-10-10)' : 'Maintain balanced nitrogen', 'good', 'Stimulates bloom and fruit set'),
        res('Watering Precaution', 'Always water thoroughly before and after fertilizing', 'warn', 'Prevents root fertilizer burn'),
      ]
    },
  },
  {
    id: 'fertilizer-cost-calculator',
    name: 'Fertilizer Cost Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate cost per application and compare bulk granular bags against concentrated liquid fertilizers.',
    tip: 'A 40 lb bag of granular organic fertilizer typically costs 70% less per square foot than ready-to-use liquid bottles.',
    usage: [
      'Enter bag or bottle purchase price and weight/volume.',
      'Enter garden area in square feet.',
      'Check cost per feeding application and annual fertilization expense.',
    ],
    method: [
      'Cost per App = (Garden Sq Ft / Coverage Sq Ft) * Package Price.',
    ],
    fields: [
      n('packagePrice', 'Fertilizer Package Price ($)', { def: 24.99, min: 5, max: 150, step: 1 }),
      n('packageCoverageSqft', 'Manufacturer Package Coverage (Sq Ft)', { def: 2000, min: 100, max: 20000, step: 100 }),
      n('gardenAreaSqft', 'Your Garden Area (Sq Ft)', { def: 350, min: 20, max: 5000, step: 10 }),
      n('appsPerYear', 'Applications per Season', { def: 4, min: 1, max: 12, step: 1 }),
    ],
    compute: (v) => {
      const price = asNum(v.packagePrice, 24.99)
      const cov = asNum(v.packageCoverageSqft, 2000)
      const area = asNum(v.gardenAreaSqft, 350)
      const apps = asNum(v.appsPerYear, 4)

      const costPerApp = (area / cov) * price
      const annualCost = costPerApp * apps
      const appsPerPackage = cov / area

      return [
        res('Cost per Single Application', money(costPerApp), 'good', `For ${area} sq ft garden`),
        res('Annual Fertilizer Cost', money(annualCost), 'info', `${apps} seasonal feedings`),
        res('Package Longevity', `~${numD(appsPerPackage, 1)} applications`, 'neutral', `One container lasts ~${numD(appsPerPackage / apps, 1)} years`),
        res('Cost per Square Foot', moneyC(costPerApp / area), 'good', 'Ultra-low micro cost'),
      ]
    },
  },
  {
    id: 'soil-ph-guide',
    name: 'Soil pH Guide',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Diagnose soil acidity and alkalinity and calculate target pH levels for specific vegetable and flower varieties.',
    tip: 'Most garden vegetables thrive between pH 6.0 and 6.8; blueberries and hydrangeas require acidic soil between 4.5 and 5.5.',
    usage: [
      'Enter measured soil pH test result.',
      'Select plant family to grow.',
      'Check whether soil is too acidic, optimal, or alkaline and see amendment instructions.',
    ],
    method: [
      'Compares soil pH against optimal plant nutrient absorption range.',
    ],
    fields: [
      n('currentPh', 'Measured Soil pH', { def: 7.4, min: 4.0, max: 9.0, step: 0.1 }),
      sel('targetPlant', 'Target Plants', [
        'General Vegetables (Optimal pH 6.2 - 6.8)',
        'Tomatoes & Peppers (Optimal pH 6.0 - 6.8)',
        'Acid-Loving: Blueberries, Azaleas (Optimal pH 4.5 - 5.5)',
        'Brassicas: Cabbage, Broccoli (Tolerate pH 6.5 - 7.5)',
      ], 'General Vegetables (Optimal pH 6.2 - 6.8)'),
    ],
    compute: (v) => {
      const ph = asNum(v.currentPh, 7.4)
      const plant = asSel(v.targetPlant)

      let targetMin = 6.2
      let targetMax = 6.8
      if (plant.includes('Acid-Loving')) { targetMin = 4.5; targetMax = 5.5 }
      else if (plant.includes('Brassicas')) { targetMin = 6.5; targetMax = 7.5 }

      let status = 'Optimal Range'
      let amendment = 'Maintain with organic compost'
      if (ph < targetMin) {
        status = 'Too Acidic'
        amendment = 'Apply Agricultural Garden Lime (Dolomite) to raise pH'
      } else if (ph > targetMax) {
        status = 'Too Alkaline'
        amendment = 'Apply Elemental Sulfur or Peat Moss to lower pH'
      }

      return [
        res('Soil pH Status', status, status === 'Optimal Range' ? 'good' : 'warn', `${ph} measured vs ${targetMin}-${targetMax} target`),
        res('Recommended Amendment', amendment, 'good', 'Adjusts soil chemistry gradually'),
        res('Nutrient Availability', status === 'Optimal Range' ? '100% N-P-K bioavailability' : 'Nutrient lockout risk (Iron/Phosphorus bound)', status === 'Optimal Range' ? 'good' : 'bad', 'pH governs root nutrient uptake'),
        res('Retest Timeline', 'Retest soil 60-90 days after amendment', 'info', 'Sulfur and lime react slowly in soil'),
      ]
    },
  },
  {
    id: 'soil-amendment-calculator',
    name: 'Soil Amendment Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate exact pounds of agricultural lime or elemental sulfur needed to adjust garden bed soil pH.',
    tip: 'Never apply more than 5 lbs of elemental sulfur or 10 lbs of lime per 100 square feet in a single application.',
    usage: [
      'Enter current pH and desired target pH.',
      'Enter garden square footage and soil type (Sandy, Loamy, Heavy Clay).',
      'Check pounds of lime or sulfur to broadcast.',
    ],
    method: [
      'Clay soils require twice as much amendment buffer as sandy soils for the same 1.0 pH shift.',
    ],
    fields: [
      n('currentPh', 'Current Soil pH', { def: 7.6, min: 4.5, max: 8.5, step: 0.1 }),
      n('targetPh', 'Desired Target Soil pH', { def: 6.5, min: 5.0, max: 7.5, step: 0.1 }),
      n('areaSqft', 'Garden Area (Square Feet)', { def: 200, min: 20, max: 5000, step: 10 }),
      sel('soilType', 'Soil Texture', [
        'Loamy Soil (Standard balanced)',
        'Sandy Soil (Requires less amendment)',
        'Heavy Clay Soil (High buffering capacity - requires more)',
      ], 'Loamy Soil (Standard balanced)'),
    ],
    compute: (v) => {
      const cur = asNum(v.currentPh, 7.6)
      const tgt = asNum(v.targetPh, 6.5)
      const area = asNum(v.areaSqft, 200)
      const st = asSel(v.soilType)

      const diff = tgt - cur
      const soilFactor = st.includes('Sandy') ? 0.6 : st.includes('Clay') ? 1.5 : 1.0

      if (Math.abs(diff) < 0.2) {
        return [
          res('pH Status', 'Already at Target pH', 'good', 'No amendment needed'),
          res('Area', `${area} sq ft`, 'neutral', 'Current garden size'),
          res('Action', 'Top-dress with 1 inch compost annually', 'good', 'Maintains biological balance'),
          res('Recommendation', 'Test again next spring', 'info', 'Routine check'),
        ]
      }

      if (diff > 0) {
        // Needs Lime to RAISE pH
        const lbsLime = Math.round((diff * 5.0 * soilFactor * (area / 100)) * 10) / 10
        return [
          res('Agricultural Lime Needed', `${lbsLime} lbs`, 'good', 'Dolomitic or calcitic limestone'),
          res('Target pH Shift', `Raise from ${cur} to ${tgt}`, 'info', `+${numD(diff, 1)} pH unit adjustment`),
          res('Application Method', 'Work into top 4-6 inches of soil', 'neutral', 'Water in thoroughly'),
          res('Soil Texture Factor', st.split('(')[0].trim(), 'info', `Buffer multiplier: ${soilFactor}x`),
        ]
      } else {
        // Needs Sulfur to LOWER pH
        const lbsSulfur = Math.round((Math.abs(diff) * 1.2 * soilFactor * (area / 100)) * 10) / 10
        return [
          res('Elemental Sulfur Needed', `${lbsSulfur} lbs`, 'good', 'Garden sulfur pellets / powder'),
          res('Target pH Shift', `Lower from ${cur} to ${tgt}`, 'info', `-${numD(Math.abs(diff), 1)} pH unit adjustment`),
          res('Safe Dosage', lbsSulfur > (area / 100) * 5 ? 'Split into 2 seasonal applications' : 'Single spring application safe', 'warn', 'Prevents root acid shock'),
          res('Reaction Time', 'Takes 3 to 6 months for bacteria to convert sulfur', 'info', 'Best applied in autumn for spring planting'),
        ]
      }
    },
  },
  {
    id: 'compost-to-soil-ratio-calculator',
    name: 'Compost-to-Soil Ratio Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate cubic yards and bags of organic compost needed for 20% to 30% soil enrichment in raised beds.',
    tip: 'Incorporating a 2-inch layer of finished compost into tired garden beds each spring replenishes essential microbes.',
    usage: [
      'Enter garden bed length, width, and depth in inches.',
      'Select desired compost enrichment percentage (20% to 30%).',
      'Check cubic feet/yards of compost and 1 cu ft bags to purchase.',
    ],
    method: [
      'Total Bed Cu Ft = (L * W * Depth in) / 12.',
      'Compost Volume = Bed Cu Ft * Compost Ratio.',
    ],
    fields: [
      n('lengthFeet', 'Bed Length (Feet)', { def: 8, min: 2, max: 50, step: 0.5 }),
      n('widthFeet', 'Bed Width (Feet)', { def: 4, min: 1, max: 20, step: 0.5 }),
      n('bedDepthInches', 'Bed Soil Depth (Inches)', { def: 12, min: 4, max: 36, step: 1 }),
      sel('compostRatio', 'Compost Ratio Mix', [
        'Standard Spring Top-Dress (2-Inch Layer on Top)',
        'New Raised Bed Soil Blend (30% Compost / 50% Topsoil / 20% Perlite)',
        'Heavy Organic Overhaul (40% Compost Blend)',
      ], 'Standard Spring Top-Dress (2-Inch Layer on Top)'),
    ],
    compute: (v) => {
      const l = asNum(v.lengthFeet, 8)
      const w = asNum(v.widthFeet, 4)
      const d = asNum(v.bedDepthInches, 12)
      const cr = asSel(v.compostRatio)

      const bedAreaSqft = l * w
      let compostCuFt = 0

      if (cr.includes('2-Inch Layer')) {
        compostCuFt = bedAreaSqft * (2 / 12)
      } else if (cr.includes('New Raised Bed')) {
        const totalBedCuFt = bedAreaSqft * (d / 12)
        compostCuFt = totalBedCuFt * 0.30
      } else {
        const totalBedCuFt = bedAreaSqft * (d / 12)
        compostCuFt = totalBedCuFt * 0.40
      }

      const cuYds = compostCuFt / 27
      const bags1CuFt = Math.ceil(compostCuFt)

      return [
        res('Compost Needed', `${numD(compostCuFt, 1)} cubic feet`, 'good', `${bags1CuFt} standard (1 cu ft) bags`),
        res('Bulk Volume', `${numD(cuYds, 2)} cubic yards`, 'info', cuYds >= 1.0 ? 'Order bulk dump truck load' : 'Buy bagged compost at nursery'),
        res('Bed Dimensions', `${l} ft x ${w} ft (${bedAreaSqft} sq ft)`, 'neutral', `${d} inches soil depth`),
        res('Biological Benefit', 'Boosts water retention and beneficial mycorrhizae', 'good', 'Reduces summer watering needs by 30%'),
      ]
    },
  },
  {
    id: 'garden-bed-spacing-planner',
    name: 'Garden Bed Spacing Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate plant spacing using traditional in-row spacing or the high-yield Square Foot Gardening (SFG) grid.',
    tip: 'Square Foot Gardening fits 16 carrots, 9 spinach, 4 lettuces, or 1 tomato plant in a single 12" x 12" square.',
    usage: [
      'Enter raised bed length and width in feet.',
      'Select spacing philosophy (Square Foot Gardening vs Traditional In-Row).',
      'Check total planting grids and maximum crop capacity.',
    ],
    method: [
      'SFG: Total 1x1 ft squares = Bed Length (ft) * Bed Width (ft).',
    ],
    fields: [
      n('lengthFt', 'Raised Bed Length (Feet)', { def: 8, min: 2, max: 30, step: 1 }),
      n('widthFt', 'Raised Bed Width (Feet)', { def: 4, min: 2, max: 6, step: 0.5 }),
      sel('spacingStyle', 'Planting Style', [
        'Square Foot Gardening (12" x 12" grid intensive - High yield)',
        'Traditional Rows (Requires wide walking furrows)',
      ], 'Square Foot Gardening (12" x 12" grid intensive - High yield)'),
    ],
    compute: (v) => {
      const l = asNum(v.lengthFt, 8)
      const w = asNum(v.widthFt, 4)
      const style = asSel(v.spacingStyle)

      const totalSquares = Math.round(l * w)
      const isSfg = style.includes('Square Foot')

      return [
        res('Total Planting Grids', `${totalSquares} squares (1x1 ft)`, 'good', isSfg ? 'Square foot intensive grid' : `${l} ft x ${w} ft bed`),
        res('Tomato / Pepper Capacity', `${Math.round(totalSquares * 0.25)} large plants`, 'info', '1 plant per square foot (tall staked)'),
        res('Lettuce / Herb Capacity', `${totalSquares * 4} head lettuces`, 'good', '4 plants per square foot'),
        res('Root Veg (Carrots/Radish)', `${totalSquares * 16} carrots`, 'info', '16 seeds per square foot'),
      ]
    },
  },
  {
    id: 'plant-population-calculator',
    name: 'Plant Population Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate total plant seedlings, seed count, and germination overage needed for garden plots and acreage.',
    tip: 'Always sow 15-20% extra seeds to account for natural non-germination and early pest attrition.',
    usage: [
      'Enter garden plot area in square feet.',
      'Enter spacing between plants (inches).',
      'Enter spacing between rows (inches).',
      'Check total mature plant population and recommended seeds to sow.',
    ],
    method: [
      'Plants = Area (sq ft) / ((Plant Spacing in * Row Spacing in) / 144).',
      'Seeds = Plants * 1.20 (20% germination buffer).',
    ],
    fields: [
      n('plotSqft', 'Garden Plot Area (Square Feet)', { def: 400, min: 20, max: 40000, step: 20 }),
      n('plantSpacingIn', 'Spacing Between Plants in Row (Inches)', { def: 18, min: 2, max: 48, step: 1 }),
      n('rowSpacingIn', 'Spacing Between Rows (Inches)', { def: 24, min: 6, max: 60, step: 2 }),
    ],
    compute: (v) => {
      const area = asNum(v.plotSqft, 400)
      const pIn = asNum(v.plantSpacingIn, 18)
      const rIn = asNum(v.rowSpacingIn, 24)

      const sqftPerPlant = (pIn * rIn) / 144
      const plantCount = Math.floor(area / sqftPerPlant)
      const seedsToSow = Math.ceil(plantCount * 1.20)

      return [
        res('Mature Plant Population', `${num(plantCount)} plants`, 'good', `${numD(sqftPerPlant, 2)} sq ft allocated per plant`),
        res('Recommended Seeds to Sow', `${num(seedsToSow)} seeds`, 'info', 'Includes 20% germination buffer'),
        res('In-Row / Row Spacing', `${pIn}" plant x ${rIn}" row`, 'neutral', 'Ensures sunlight penetration'),
        res('Thinning Target', `Thin to strongest 1 seedling per station`, 'good', 'Avoids crowded root competition'),
      ]
    },
  },
  {
    id: 'container-plant-spacing-calculator',
    name: 'Container Plant Spacing Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Determine how many flowers, herbs, or strawberry plants can comfortably fit in window boxes and round patio planters.',
    tip: 'Window boxes look lush when packed at 4-6 inches apart, but fast-growing herbs require room for root expansion.',
    usage: [
      'Enter container length or top rim diameter in inches.',
      'Select container shape (Round planter vs Rectangular window box).',
      'Select plant vigorousness (Compact herbs vs sprawling petunias).',
      'Check recommended plant count and potting soil volume.',
    ],
    method: [
      'Window box: Length in / Spacing (4-6"). Round pot: Area in² / plant density factor.',
    ],
    fields: [
      n('containerDimensionIn', 'Container Length or Rim Diameter (Inches)', { def: 24, min: 8, max: 72, step: 2 }),
      sel('shape', 'Container Geometry', [
        'Rectangular Window Box / Trough',
        'Round Patio Pot / Barrel',
      ], 'Rectangular Window Box / Trough'),
      sel('plantVigor', 'Plant Selection & Density', [
        'Compact Annual Flowers / Pansies (4"-5" spacing)',
        'Culinary Herbs: Basil, Parsley, Thyme (6"-8" spacing)',
        'Sprawling Vines: Petunias, Sweet Potato Vine (8"-10" spacing)',
        'Strawberries (6" spacing along perimeter)',
      ], 'Culinary Herbs: Basil, Parsley, Thyme (6"-8" spacing)'),
    ],
    compute: (v) => {
      const dim = asNum(v.containerDimensionIn, 24)
      const sh = asSel(v.shape)
      const vigor = asSel(v.plantVigor)

      let spacingIn = 6
      if (vigor.includes('4"-5"')) spacingIn = 4.5
      else if (vigor.includes('8"-10"')) spacingIn = 9

      let count = 4
      if (sh.includes('Rectangular')) {
        count = Math.max(1, Math.round(dim / spacingIn))
      } else {
        const area = Math.PI * Math.pow(dim / 2, 2)
        const areaPerPlant = Math.pow(spacingIn, 2)
        count = Math.max(1, Math.round(area / (areaPerPlant * 1.2)))
      }

      return [
        res('Recommended Plant Count', `${count} plants`, 'good', 'Provides lush full container arrangement'),
        res('Container Dimension', `${dim} inches (${sh.split(' ')[0]})`, 'info', `${spacingIn}" center-to-center spacing`),
        res('Thriller / Filler / Spiller', '1 tall focal + 2 bushy fillers + trailing edges', 'good', 'Professional design recipe'),
        res('Soil Refresh Tip', 'Use 100% fresh potting mix each season', 'neutral', 'Old container soil depletes nutrients'),
      ]
    },
  },
  {
    id: 'pot-size-selector',
    name: 'Pot Size Selector',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Pick the right container volume (gallons and diameter) for tomatoes, citrus trees, herbs, and houseplants.',
    tip: 'Indeterminate slicing tomatoes require at least a 10 to 15-gallon container (16"-18" diameter) to prevent blossom end rot.',
    usage: [
      'Select plant to cultivate.',
      'Check recommended minimum pot diameter, soil gallon volume, and root depth.',
    ],
    method: [
      'Matches botanical root architecture to recommended container dimensions.',
    ],
    fields: [
      sel('targetCrop', 'Plant / Crop Variety', [
        'Tomatoes (Standard slicing / indeterminate - 10-15 Gal)',
        'Peppers / Eggplant (5-7 Gallon Pot / 12"-14" dia)',
        'Culinary Herbs: Rosemary, Mint, Sage (2-3 Gal / 8"-10" dia)',
        'Meyer Lemon / Dwarf Citrus (15-20 Gal / 18"-22" dia)',
        'Bush Beans / Peas (3-5 Gal / 10"-12" dia)',
        'Carrots / Radishes (Deep 10-12" depth container)',
      ], 'Tomatoes (Standard slicing / indeterminate - 10-15 Gal)'),
    ],
    compute: (v) => {
      const crop = asSel(v.targetCrop)
      const name = crop.split('(')[0].trim()

      let gal = '10 to 15 Gallons'
      let dia = '16" to 18" Diameter'
      let depth = '14" to 18" Soil Depth'

      if (crop.includes('Peppers')) {
        gal = '5 to 7 Gallons'; dia = '12" to 14" Diameter'; depth = '12" Soil Depth'
      } else if (crop.includes('Herbs')) {
        gal = '2 to 3 Gallons'; dia = '8" to 10" Diameter'; depth = '8" to 10" Soil Depth'
      } else if (crop.includes('Citrus')) {
        gal = '15 to 25 Gallons'; dia = '18" to 22" Diameter'; depth = '16" to 20" Soil Depth'
      } else if (crop.includes('Beans')) {
        gal = '3 to 5 Gallons'; dia = '10" to 12" Diameter'; depth = '10" Soil Depth'
      }

      return [
        res('Recommended Pot Volume', gal, 'good', name),
        res('Minimum Rim Diameter', dia, 'info', 'Ensures stability against tipping'),
        res('Minimum Root Depth', depth, 'good', 'Healthy taproot expansion'),
        res('Potting Soil Required', `~${gal.split(' ')[0]} gal of lightweight potting mix`, 'neutral', 'Never use heavy native backyard dirt in pots'),
      ]
    },
  },
  {
    id: 'indoor-plant-light-guide',
    name: 'Indoor Plant Light Guide',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Evaluate window exposures (North, South, East, West) and calculate Foot-Candles and LUX for healthy houseplant growth.',
    tip: 'Light intensity drops by 75% when moving a plant just 4 feet away from an unshaded window (Inverse Square Law).',
    usage: [
      'Select window compass direction.',
      'Enter distance from window in feet.',
      'Check foot-candle intensity and matching houseplants.',
    ],
    method: [
      'Models light attenuation via inverse square law from window exposures.',
    ],
    fields: [
      sel('windowOrientation', 'Window Direction', [
        'South-Facing Window (Intense direct sunlight 6+ hrs)',
        'West-Facing Window (Warm afternoon direct sunlight 4-5 hrs)',
        'East-Facing Window (Gentle morning sunlight 3-4 hrs)',
        'North-Facing Window (Gentle indirect light / No direct sun)',
        'Interior Room / No Windows (Artificial LED grow light only)',
      ], 'South-Facing Window (Intense direct sunlight 6+ hrs)'),
      n('distanceFt', 'Plant Distance from Window Glass (Feet)', { def: 3, min: 0.5, max: 15, step: 0.5 }),
    ],
    compute: (v) => {
      const win = asSel(v.windowOrientation)
      const dist = asNum(v.distanceFt, 3)

      let baseFc = 800
      if (win.includes('South')) baseFc = 1600
      else if (win.includes('West')) baseFc = 1200
      else if (win.includes('North')) baseFc = 400
      else if (win.includes('Interior')) baseFc = 100

      const actualFc = Math.max(25, Math.round(baseFc / Math.pow(Math.max(1, dist * 0.8), 1.5)))

      let suitablePlants = 'Fiddle Leaf Fig, Succulents, Cacti, Citrus'
      if (actualFc < 100) suitablePlants = 'Snake Plant, ZZ Plant, Cast Iron Plant'
      else if (actualFc < 300) suitablePlants = 'Pothos, Philodendron, Peace Lily'
      else if (actualFc < 600) suitablePlants = 'Monstera, Calathea, Rubber Tree'

      return [
        res('Estimated Light Intensity', `${actualFc} Foot-Candles`, actualFc >= 300 ? 'good' : 'warn', `~${num(actualFc * 10.76)} LUX`),
        res('Light Category', actualFc >= 800 ? 'High / Direct Sun' : actualFc >= 300 ? 'Medium / Bright Indirect' : 'Low Light', 'good', `${dist} ft from ${win.split(' ')[0]}`),
        res('Ideal Plant Matches', suitablePlants, 'info', 'Thrive at this lux level'),
        res('Grow Light Advice', actualFc < 100 ? 'Supplement with 15W full-spectrum LED bulb' : 'Sufficient natural light', 'neutral', 'Keep grow lights 12" above foliage'),
      ]
    },
  },
  {
    id: 'garden-sunlight-planner',
    name: 'Garden Sunlight Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Classify garden zones into Full Sun (6+ hrs), Partial Sun (4-6 hrs), or Full Shade (< 3 hrs) for proper bed layouts.',
    tip: 'Fruiting vegetables require 6-8+ hours of full sun; leafy greens like spinach and arugula actually prefer 3-4 hours of afternoon shade.',
    usage: [
      'Enter unobstructed direct sunlight hours received by garden bed.',
      'Check garden solar classification and ideal crop groupings.',
    ],
    method: [
      'Classifies into USDA solar horticulture bands: Full Sun (>=6h), Partial Sun/Shade (3-6h), Full Shade (<3h).',
    ],
    fields: [
      n('sunlightHours', 'Direct Sunlight Received Daily (Hours)', { def: 6.5, min: 0, max: 14, step: 0.5 }),
    ],
    compute: (v) => {
      const hrs = asNum(v.sunlightHours, 6.5)

      let category = 'Full Sun'
      let tone: Tone = 'good'
      let bestCrops = 'Tomatoes, Peppers, Corn, Cucumbers, Squash, Melons, Sunflowers'

      if (hrs >= 6.0) {
        category = 'Full Sun (6+ Hours)'
        tone = 'good'
      } else if (hrs >= 4.0) {
        category = 'Partial Sun (4 to 6 Hours)'
        tone = 'info'
        bestCrops = 'Root Veggies (Carrots, Beets, Radish), Peas, Beans, Herbs'
      } else if (hrs >= 2.5) {
        category = 'Partial Shade (2.5 to 4 Hours)'
        tone = 'warn'
        bestCrops = 'Leafy Greens (Lettuce, Spinach, Swiss Chard, Kale), Mint'
      } else {
        category = 'Full Shade (< 2.5 Hours)'
        tone = 'bad'
        bestCrops = 'Hostas, Ferns, Mosses, Heuchera (Most edible crops will struggle)'
      }

      return [
        res('Solar Classification', category, tone, `${hrs} hours recorded`),
        res('Top Recommended Crops', bestCrops, 'good', 'Maximized photosynthetic yield'),
        res('Heat Management', hrs > 8 ? 'Apply organic straw mulch to keep roots cool' : 'Take advantage of cooling shade', 'neutral', 'Prevents soil moisture dry-out'),
        res('Placement Strategy', 'Position tall staked crops on NORTH side of bed', 'info', 'Prevents shading shorter veggies'),
      ]
    },
  },
  {
    id: 'garden-harvest-planner',
    name: 'Garden Harvest Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate expected calendar harvest dates based on Days to Maturity (DTM) and succession planting intervals.',
    tip: 'Sow cilantro, radishes, and salad greens every 14 days for a continuous 4-month non-stop harvest.',
    usage: [
      'Enter seed packet Days to Maturity (DTM).',
      'Select planting date / weeks from now.',
      'Check target harvest window and succession sowing cadence.',
    ],
    method: [
      'Harvest Date = Planting Date + Days to Maturity.',
    ],
    fields: [
      n('daysToMaturity', 'Seed Packet Days to Maturity (DTM)', { def: 65, min: 20, max: 150, step: 5 }),
      n('plantingWeeksAway', 'Weeks from Today until Planting', { def: 2, min: 0, max: 20, step: 1 }),
      ck('successionPlanting', 'Plan Succession Sowing (Staggered harvests)', true),
    ],
    compute: (v) => {
      const dtm = asNum(v.daysToMaturity, 65)
      const plantWeeks = asNum(v.plantingWeeksAway, 2)
      const succ = v.successionPlanting

      const totalDaysToHarvest = (plantWeeks * 7) + dtm
      const weeksToHarvest = totalDaysToHarvest / 7

      return [
        res('Harvest Window', `In ~${Math.round(weeksToHarvest)} weeks`, 'good', `${dtm} days after planting out`),
        res('Succession Interval', succ ? 'Sow fresh seeds every 14 days' : 'Single batch harvest', 'info', succ ? 'Yields continuous crop supply' : 'All matures simultaneously'),
        res('Harvest Duration', 'Typically 3 to 5 weeks continuous picking', 'good', 'Pick regularly to stimulate new flowers'),
        res('Preservation Advice', dtm <= 30 ? 'Eat fresh daily' : 'Prepare canning jars / freezer bags', 'neutral', 'Plan for peak seasonal surplus'),
      ]
    },
  },
  {
    id: 'seed-starting-calendar',
    name: 'Seed Starting Calendar',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate indoor seed starting dates counting backward from your region’s Last Spring Frost Date.',
    tip: 'Starting seeds too early indoors creates weak, leggy seedlings that suffer severe transplant shock outdoors.',
    usage: [
      'Enter weeks until your local Last Spring Frost date.',
      'Select crop variety (Tomatoes, Peppers, Brassicas, Squash).',
      'Check exact weeks before frost to start seeds under grow lights.',
    ],
    method: [
      'Peppers: 8-10 wks before frost. Tomatoes: 6-8 wks. Brassicas: 4-6 wks. Cucumbers/Squash: 2-3 wks.',
    ],
    fields: [
      sel('cropType', 'Vegetable Variety to Start', [
        'Peppers & Eggplant (Start indoors 8-10 weeks before frost)',
        'Tomatoes (Start indoors 6-8 weeks before frost)',
        'Broccoli, Cabbage, Kale (Start indoors 4-6 weeks before frost)',
        'Cucumbers, Melons, Squash (Start indoors 2-3 weeks before frost)',
        'Direct Sow Outdoors (Carrots, Beans, Corn, Peas - Do not start indoors)',
      ], 'Tomatoes (Start indoors 6-8 weeks before frost)'),
      n('weeksToFrost', 'Weeks Until Last Expected Spring Frost', { def: 7, min: 0, max: 20, step: 1 }),
    ],
    compute: (v) => {
      const crop = asSel(v.cropType)
      const curWeeks = asNum(v.weeksToFrost, 7)

      let recWeeks = 6
      if (crop.includes('Peppers')) recWeeks = 9
      else if (crop.includes('Broccoli')) recWeeks = 5
      else if (crop.includes('Cucumbers')) recWeeks = 2
      else if (crop.includes('Direct Sow')) recWeeks = 0

      const diff = curWeeks - recWeeks
      let timingStatus = 'Sow Seeds Indoors Now'
      let tone: 'good' | 'warn' | 'neutral' = 'good'

      if (crop.includes('Direct Sow')) {
        timingStatus = 'Direct sow into warm garden soil after last frost'
        tone = 'neutral'
      } else if (diff > 2) {
        timingStatus = `Wait ${diff} more weeks before starting seeds`
        tone = 'neutral'
      } else if (diff < -2) {
        timingStatus = `Past optimal seed start date (Buy nursery starts)`
        tone = 'warn'
      }

      return [
        res('Seed Starting Action', timingStatus, tone, `${curWeeks} weeks to frost`),
        res('Optimal Seed Start Timing', recWeeks === 0 ? 'Direct sow post-frost' : `${recWeeks} weeks before last frost`, 'info', crop.split('(')[0].trim()),
        res('Germination Temperature', 'Warm soil to 75°F-85°F with a heat mat', 'good', 'Speeds sprouting from 14 days to 4 days'),
        res('Hardening Off Rule', 'Harden off outdoors in shade for 7 days before planting', 'warn', 'Prevents sun scald and wind burn'),
      ]
    },
  },
  {
    id: 'planting-calendar',
    name: 'Planting Calendar',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Categorize your entire vegetable garden into Cool Season spring/fall crops and Warm Season summer crops.',
    tip: 'Cool season crops (peas, lettuce, brassicas) tolerate light frosts and germinate in 45°F-50°F soil.',
    usage: [
      'Select growing season (Early Spring, Warm Summer, Late Fall/Winter).',
      'Check plantable vegetables, soil temperature minimums, and frost tolerance.',
    ],
    method: [
      'Filters vegetable varieties by USDA thermal germination brackets.',
    ],
    fields: [
      sel('seasonSlot', 'Target Planting Season', [
        'Early Spring (4-6 weeks before frost - 45°F+ soil)',
        'Mid Spring (At last frost - 55°F+ soil)',
        'Summer Warm Season (2 weeks after frost - 65°F-75°F soil)',
        'Autumn / Fall Garden (Late summer planting for fall harvest)',
      ], 'Summer Warm Season (2 weeks after frost - 65°F-75°F soil)'),
    ],
    compute: (v) => {
      const s = asSel(v.seasonSlot)

      let crops = 'Tomatoes, Peppers, Cucumbers, Beans, Corn, Squash, Basil'
      let soilTemp = '65°F - 75°F'
      if (s.includes('Early Spring')) {
        crops = 'Peas, Spinach, Radishes, Onions, Kale, Arugula'
        soilTemp = '40°F - 50°F'
      } else if (s.includes('Mid Spring')) {
        crops = 'Carrots, Beets, Lettuce, Swiss Chard, Potatoes, Broccoli'
        soilTemp = '50°F - 60°F'
      } else if (s.includes('Autumn')) {
        crops = 'Garlic (for next summer), Spinach, Winter Greens, Turnips'
        soilTemp = 'Cooling soil'
      }

      return [
        res('Primary Crops to Plant', crops, 'good', s.split('(')[0].trim()),
        res('Soil Temperature Threshold', soilTemp, 'info', 'Verify with $8 soil thermometer'),
        res('Frost Sensitivity', s.includes('Summer') ? 'Tender: Zero frost tolerance' : 'Hardy: Tolerates light frosts down to 28°F', s.includes('Summer') ? 'warn' : 'good', 'Cold resistance profile'),
        res('Companion Tip', 'Plant marigolds and basil alongside tomatoes', 'good', 'Repels hornworms and attracts pollinators'),
      ]
    },
  },
  {
    id: 'garden-budget-calculator',
    name: 'Garden Budget Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Itemize seeds, seed-starting soil, compost, lumber, trellises, and irrigation to plan your seasonal garden budget.',
    tip: 'A well-maintained 100 sq ft vegetable garden yields $600 to $900 worth of fresh organic produce each season.',
    usage: [
      'Enter budgeted expenses across seeds, soil, compost, beds, and irrigation.',
      'Check total seasonal investment and estimated organic produce retail value.',
    ],
    method: [
      'Total Budget = Seeds + Soil + Fertilizer + Trellising + Irrigation.',
      'Produce Value = Square Footage * $7.50/sqft organic yield value.',
    ],
    fields: [
      n('seedsCost', 'Seeds & Nursery Transplants ($)', { def: 45, min: 0, max: 500, step: 5 }),
      n('soilCompostCost', 'Compost & Bagged Soil ($)', { def: 85, min: 0, max: 1000, step: 5 }),
      n('fertilizerCost', 'Organic Fertilizers & Pest Control ($)', { def: 35, min: 0, max: 300, step: 5 }),
      n('trellisHardware', 'Trellises, Stakes & Cages ($)', { def: 40, min: 0, max: 500, step: 5 }),
      n('gardenSqft', 'Total Cultivated Area (Square Feet)', { def: 120, min: 10, max: 2000, step: 10 }),
    ],
    compute: (v) => {
      const seeds = asNum(v.seedsCost, 45)
      const soil = asNum(v.soilCompostCost, 85)
      const fert = asNum(v.fertilizerCost, 35)
      const trellis = asNum(v.trellisHardware, 40)
      const sqft = asNum(v.gardenSqft, 120)

      const totalCost = seeds + soil + fert + trellis
      const estProduceValue = sqft * 7.50 // ~$7.50 organic retail value / sq ft
      const netGain = Math.max(0, estProduceValue - totalCost)

      return [
        res('Total Garden Investment', money(totalCost), 'neutral', 'All seasonal inputs'),
        res('Estimated Harvest Value', money(estProduceValue), 'good', `Equivalent organic grocery store produce`),
        res('Net Grocery Savings', money(netGain), 'good', `${Math.round((netGain / totalCost) * 100)}% return on investment`),
        res('Cost per Square Foot', money(totalCost / sqft) + '/sq ft', 'info', 'Capital intensity index'),
      ]
    },
  },
  {
    id: 'garden-supply-inventory',
    name: 'Garden Supply Inventory',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Audit remaining seed packets, fertilizer stocks, row covers, and seed trays before placing new seed orders.',
    tip: 'Most vegetable seeds remain viable for 2 to 4 years when stored in a cool, dark, airtight mason jar with silica gel.',
    usage: [
      'Enter counts of existing viable seed packets and bags of potting mix.',
      'Check garden supply readiness score and restock priorities.',
    ],
    method: [
      'Inventories seed and soil resources to prevent duplicate purchases.',
    ],
    fields: [
      n('seedPackets', 'Stored Seed Packets (Under 3 years old)', { def: 18, min: 0, max: 150, step: 1 }),
      n('pottingSoilBags', 'Bags of Seed Starting / Potting Soil (cu ft)', { def: 2, min: 0, max: 20, step: 1 }),
      ck('seedlingTrays', 'Have clean seedling 72-cell trays & humidity domes', true),
      ck('rowCoverReady', 'Have floating row cover fabric for insect/frost defense', false),
    ],
    compute: (v) => {
      const seeds = asNum(v.seedPackets, 18)
      const soil = asNum(v.pottingSoilBags, 2)
      const trays = v.seedlingTrays
      const cover = v.rowCoverReady

      return [
        res('Seed Inventory Status', `${seeds} viable packets`, seeds >= 15 ? 'good' : 'neutral', 'Test germination on wet paper towel'),
        res('Potting Soil on Hand', `${soil} cu ft`, soil >= 2 ? 'good' : 'warn', 'Sufficient for ~100 seedling cells'),
        res('Equipment Preparedness', trays ? 'Trays & Domes Ready' : 'Acquire seed starting flats', trays ? 'good' : 'warn', 'Sanitize used trays with 10% bleach'),
        res('Pest / Frost Defense', cover ? 'Protected with Row Covers' : 'Consider buying lightweight Agribon row cover', cover ? 'good' : 'info', 'Shields brassicas from cabbage moths'),
      ]
    },
  },
  {
    id: 'garden-maintenance-checklist',
    name: 'Garden Maintenance Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Weekly garden maintenance routine covering weeding, suckering tomatoes, pest scouting, and deadheading.',
    tip: 'Pruning tomato suckers below the first flower cluster improves airflow and redirects energy into larger fruit.',
    usage: [
      'Work through weekly garden upkeep tasks.',
      'Check off weeding, trellis tying, pest checks, and harvesting.',
      'Track weekly garden health rating.',
    ],
    method: [
      'Weekly compliance score across 6 vital maintenance duties.',
    ],
    fields: [
      ck('weedBeds', 'Hand weeded garden bed perimeter while weeds are small', true),
      ck('scoutPests', 'Scouted undersides of leaves for hornworms, aphids, or squash bugs', true),
      ck('tieVines', 'Tied expanding tomato and cucumber vines to trellises', false),
      ck('deepWater', 'Performed deep root soak (soil moist 4-6" down)', true),
      ck('harvestRipes', 'Harvested all ripe fruit to encourage continuous flowering', false),
      ck('deadheadFlowers', 'Deadheaded spent flower blossoms and yellowing bottom leaves', false),
    ],
    compute: (v) => {
      const tasks = [
        v.weedBeds,
        v.scoutPests,
        v.tieVines,
        v.deepWater,
        v.harvestRipes,
        v.deadheadFlowers,
      ]
      const done = tasks.filter(Boolean).length
      const score = Math.round((done / tasks.length) * 100)

      return [
        res('Weekly Garden Upkeep', `${score}% Complete`, score >= 75 ? 'good' : 'warn', `${done} of ${tasks.length} chores completed`),
        res('Pest Scouting Status', v.scoutPests ? 'Monitored & Safe' : 'SCOUT PESTS: Check leaf undersides', v.scoutPests ? 'good' : 'warn', 'Early detection stops infestations'),
        res('Tomato Trellis Care', v.tieVines ? 'Trellised' : 'Tie vines to prevent ground rot', v.tieVines ? 'good' : 'neutral', 'Keeps fruit off wet soil'),
        res('Harvest Incentive', v.harvestRipes ? 'Harvested regularly' : 'Pick ripe beans/peppers today', v.harvestRipes ? 'good' : 'info', 'Prevent over-ripening on vine'),
      ]
    },
  },
  {
    id: 'lawn-mowing-schedule',
    name: 'Lawn Mowing Schedule',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate cutting height and mowing frequency using the "One-Third Rule" to promote deep drought-resistant grass roots.',
    tip: 'The 1/3 Rule: Never cut off more than 1/3 of the grass blade length in a single mowing to avoid stressing the lawn.',
    usage: [
      'Select turf grass variety (Kentucky Bluegrass, Tall Fescue, Bermuda, St. Augustine).',
      'Select active growing season.',
      'Check recommended mowing height and weekly mowing frequency.',
    ],
    method: [
      'Applies agronomic turfgrass cutting standards and blade sharp intervals.',
    ],
    fields: [
      sel('grassType', 'Lawn Turf Grass Variety', [
        'Tall Fescue (Cool season - 3.0" - 4.0" height)',
        'Kentucky Bluegrass (Cool season - 2.5" - 3.5" height)',
        'Bermudagrass (Warm season - 1.0" - 2.0" height)',
        'St. Augustinegrass (Warm season - 3.0" - 4.0" height)',
        'Zoysiagrass (Warm season - 1.5" - 2.5" height)',
      ], 'Tall Fescue (Cool season - 3.0" - 4.0" height)'),
      sel('seasonGrowth', 'Growth Rate & Season', [
        'Peak Spring Growth (Fast vertical growth - mow every 4-5 days)',
        'Mid-Summer Heat (Slower growth - mow every 7-10 days)',
        'Early Autumn Surge (Mow every 5-7 days)',
      ], 'Peak Spring Growth (Fast vertical growth - mow every 4-5 days)'),
    ],
    compute: (v) => {
      const grass = asSel(v.grassType)
      const season = asSel(v.seasonGrowth)

      let height = '3.5 inches'
      if (grass.includes('Bermuda')) height = '1.5 inches'
      else if (grass.includes('Bluegrass')) height = '3.0 inches'
      else if (grass.includes('Zoysia')) height = '2.0 inches'

      const freqDays = season.includes('Peak Spring') ? '4 to 5 days' : season.includes('Mid-Summer') ? '7 to 10 days' : '5 to 7 days'

      return [
        res('Recommended Cutting Height', height, 'good', grass.split('(')[0].trim()),
        res('Mowing Cadence', `Every ${freqDays}`, 'info', season.split('(')[0].trim()),
        res('Blade Sharpening Rule', 'Sharpen mower blades every 25 hours', 'good', 'Dull blades tear grass, causing brown tips'),
        res('Grasscycling Benefit', 'Leave clippings on lawn with mulching plug', 'good', 'Recycles 25% of annual nitrogen fertilizer'),
      ]
    },
  },
  {
    id: 'lawn-watering-planner',
    name: 'Lawn Watering Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Perform a Tuna Can Audit to calibrate sprinkler runtimes so your lawn receives exactly 1 inch of water per week.',
    tip: 'Place empty tuna or cat food cans on your lawn to measure how many minutes your sprinklers take to deliver 0.5 inches.',
    usage: [
      'Enter lawn surface area in square feet.',
      'Enter sprinkler output depth measured in audit cans after 15 minutes.',
      'Check required sprinkler runtime per zone per week.',
    ],
    method: [
      'Sprinkler Rate (in/hr) = (Measured Can Inches / Audit Minutes) * 60.',
      'Weekly Runtime (mins) = (1.0 inch / Sprinkler Rate) * 60.',
    ],
    fields: [
      n('lawnSqft', 'Lawn Area (Square Feet)', { def: 2500, min: 100, max: 50000, step: 100 }),
      n('auditMinutes', 'Sprinkler Audit Run Time (Minutes)', { def: 15, min: 5, max: 60, step: 5 }),
      n('canDepthInches', 'Water Depth Measured in Tuna Can (Inches)', { def: 0.25, min: 0.05, max: 1.5, step: 0.05 }),
    ],
    compute: (v) => {
      const sqft = asNum(v.lawnSqft, 2500)
      const auditMins = asNum(v.auditMinutes, 15)
      const depthIn = asNum(v.canDepthInches, 0.25)

      const hourlyRate = (depthIn / auditMins) * 60 // inches per hour
      const totalWeeklyMins = Math.round((1.0 / hourlyRate) * 60)
      const minsPerCycle = Math.round(totalWeeklyMins / 2) // 2 cycles/week
      const weeklyGallons = sqft * 1.0 * 0.6233

      return [
        res('Sprinkler Output Rate', `${numD(hourlyRate, 2)} inches/hour`, 'good', 'Measured catch-can rate'),
        res('Total Weekly Runtime', `${totalWeeklyMins} minutes/week`, 'info', 'To deliver 1.0 inch benchmark'),
        res('Recommended Schedule', `2 sessions of ${minsPerCycle} mins each`, 'good', 'Early morning (5:00 AM - 7:00 AM)'),
        res('Total Lawn Water Demand', `${num(Math.round(weeklyGallons))} gal/week`, 'neutral', `${sqft} sq ft turf`),
      ]
    },
  },
]
