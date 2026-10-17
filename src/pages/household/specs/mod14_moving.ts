import {
  type HouseholdSpec,
  n,
  sel,
  txt,
  ck,
  res,
  asNum,
  asSel,
  asStr,
  money,
  num,
} from './householdSpec'

const SUB = 'Moving'
const SUB_ID = 'moving'

export const movingSpecs: HouseholdSpec[] = [
  {
    id: 'moving-cost-calculator',
    name: 'Moving Cost Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Compare DIY rental truck costs against professional full-service movers for local or long-distance moves.',
    tip: 'Booking professional movers on mid-week days (Tuesday-Thursday) mid-month is often 20% cheaper than month-end weekends.',
    usage: [
      'Select move distance (Local < 50 mi vs Long Distance).',
      'Select home size in bedrooms.',
      'Select moving style (DIY rental truck vs Full-Service Movers).',
      'Check total estimated moving cost and labor hours.',
    ],
    method: [
      'DIY: Truck Rental Base + Mileage ($0.99/mi) + Gas + Equipment + Pizza/Helpers.',
      'Pro: Hourly rate ($120-$180/hr for 3 movers) or Weight x Distance tariff.',
    ],
    fields: [
      sel('homeSize', 'Home Size', [
        '1 Bedroom Apartment (~2,500 lbs)',
        '2 Bedroom Home / Apt (~4,500 lbs)',
        '3 Bedroom House (~8,000 lbs)',
        '4+ Bedroom House (~12,000+ lbs)',
      ], '2 Bedroom Home / Apt (~4,500 lbs)'),
      sel('moveType', 'Moving Strategy', [
        'DIY Rental Truck (U-Haul / Penske + Friend Labor)',
        'Hybrid (Rental Truck + Hired Loading Labor)',
        'Full-Service Professional Movers (Pack, Load, Transport)',
      ], 'DIY Rental Truck (U-Haul / Penske + Friend Labor)'),
      n('distanceMiles', 'Move Transit Distance (Miles)', { def: 35, min: 2, max: 3000, step: 5 }),
    ],
    compute: (v) => {
      const home = asSel(v.homeSize)
      const strat = asSel(v.moveType)
      const miles = asNum(v.distanceMiles, 35)

      let baseCost = 250
      if (home.includes('1 Bedroom')) baseCost = 180
      else if (home.includes('3 Bedroom')) baseCost = 450
      else if (home.includes('4+ Bedroom')) baseCost = 700

      let totalEst = 0
      if (strat.includes('DIY Rental')) {
        const truckFee = baseCost * 0.4
        const mileageCost = miles * 1.15
        const gas = (miles / 10) * 4.0 // 10 MPG truck
        totalEst = truckFee + mileageCost + gas + 120 // supplies + food
      } else if (strat.includes('Hybrid')) {
        const truckFee = baseCost * 0.4
        const mileageCost = miles * 1.15
        const labor = baseCost * 2.2
        totalEst = truckFee + mileageCost + labor + 80
      } else {
        // Full service
        if (miles < 100) {
          // local hourly
          const hours = home.includes('1 Bed') ? 4 : home.includes('2 Bed') ? 6 : home.includes('3 Bed') ? 8 : 11
          totalEst = hours * 165 + 100 // travel fee
        } else {
          // long distance weight based
          const weight = home.includes('1 Bed') ? 2500 : home.includes('2 Bed') ? 4500 : home.includes('3 Bed') ? 8000 : 12000
          totalEst = (weight * 0.85) + (miles * 1.8)
        }
      }

      return [
        res('Estimated Moving Cost', money(totalEst), 'good', strat.split('(')[0].trim()),
        res('Move Distance', `${miles} miles`, 'info', miles > 100 ? 'Interstate / Long Distance' : 'Local Move'),
        res('Home Size', home.split('(')[0].trim(), 'neutral', home.split('(')[1]?.replace(')', '') || 'Standard household'),
        res('Budget Contingency', money(totalEst * 0.15) + ' reserve', 'warn', 'Hold 15% for unexpected fuel, parking, or tolls'),
      ]
    },
  },
  {
    id: 'moving-truck-size-calculator',
    name: 'Moving Truck Size Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate the right U-Haul or Penske truck size (10ft, 15ft, 20ft, 26ft) based on rooms and cubic footage.',
    tip: 'When in doubt, always rent the next size up; having a truck 10% too small requires an exhausting second trip.',
    usage: [
      'Select your home size and furnish density.',
      'Check recommended truck rental length, cubic feet, and load capacity.',
    ],
    method: [
      'Studio/1 Bed = 10-12 ft (400 cu ft). 2-3 Bed = 15-20 ft (800-1000 cu ft). 3-4 Bed = 26 ft (1600+ cu ft).',
    ],
    fields: [
      sel('homeSize', 'Home Size & Furniture Volume', [
        'Studio / Small 1 Bedroom (Light furnishings ~400 cu ft)',
        '1-2 Bedroom Apartment (~750 cu ft)',
        '2-3 Bedroom Home (~1,100 cu ft)',
        '3-4 Bedroom Large Home (~1,600+ cu ft)',
      ], '1-2 Bedroom Apartment (~750 cu ft)'),
    ],
    compute: (v) => {
      const home = asSel(v.homeSize)

      let truck = '15-Foot Truck'
      let cuFt = '764 cu ft capacity'
      let payload = '6,385 lbs payload'
      let gasMil = '10 MPG'

      if (home.includes('Studio')) {
        truck = '10-Foot Truck'
        cuFt = '402 cu ft capacity'
        payload = '2,810 lbs payload'
        gasMil = '12 MPG'
      } else if (home.includes('2-3 Bedroom')) {
        truck = '20-Foot Truck'
        cuFt = '1,015 cu ft capacity'
        payload = '5,700 lbs payload'
        gasMil = '9 MPG'
      } else if (home.includes('3-4 Bedroom')) {
        truck = '26-Foot Commercial Truck'
        cuFt = '1,682 cu ft capacity'
        payload = '9,600 lbs payload'
        gasMil = '7-8 MPG'
      }

      return [
        res('Recommended Truck Size', truck, 'good', 'Comfortably fits load in 1 trip'),
        res('Internal Cargo Volume', cuFt, 'info', home.split('(')[0].trim()),
        res('Payload Weight Limit', `${payload} (${gasMil})`, 'neutral', 'Safe axle weight rating & fuel economy'),
        res('Ramp Included', truck.includes('10-Foot') ? 'No Ramp (Low load deck)' : 'Pull-out Aluminum Loading Ramp included', 'good', 'Speeds loading heavy furniture'),
      ]
    },
  },
  {
    id: 'moving-box-quantity-calculator',
    name: 'Moving Box Quantity Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate total small, medium, large, and wardrobe boxes needed based on bedrooms and lifestyle density.',
    tip: 'Always pack heavy items (books, canned goods) in SMALL boxes; large boxes get too heavy to lift safely.',
    usage: [
      'Enter number of bedrooms in home.',
      'Select clutter/possession density (Minimalist, Average, Packrat).',
      'Check breakdown of small, medium, large, and wardrobe boxes to order.',
    ],
    method: [
      'Average 1-bedroom needs ~30-40 boxes. Each additional bedroom adds ~20-25 boxes.',
    ],
    fields: [
      n('bedrooms', 'Number of Bedrooms', { def: 2, min: 1, max: 6, step: 1 }),
      sel('density', 'Household Possession Density', [
        'Minimalist / Lean Possessions (-20% boxes)',
        'Average Household (Standard box count)',
        'Collector / Packrat / Extensive Books (+30% boxes)',
      ], 'Average Household (Standard box count)'),
    ],
    compute: (v) => {
      const beds = asNum(v.bedrooms, 2)
      const d = asSel(v.density)

      const mult = d.includes('Minimalist') ? 0.8 : d.includes('Collector') ? 1.3 : 1.0
      const totalBoxes = Math.round((25 + (beds * 22)) * mult)

      const small = Math.round(totalBoxes * 0.40)
      const med = Math.round(totalBoxes * 0.35)
      const large = Math.round(totalBoxes * 0.18)
      const wardrobe = Math.round(beds * 2.5)

      return [
        res('Total Boxes Needed', `~${totalBoxes} boxes`, 'good', `${beds} bedroom home`),
        res('Small Boxes (1.5 cu ft)', `${small} boxes`, 'info', 'Books, tools, canned goods, heavy items'),
        res('Medium Boxes (3.0 cu ft)', `${med} boxes`, 'good', 'Pots, pans, kitchenware, toys'),
        res('Large & Wardrobe', `${large} large + ${wardrobe} wardrobe boxes`, 'info', 'Bedding, pillows, hanging clothes'),
      ]
    },
  },
  {
    id: 'moving-box-size-planner',
    name: 'Moving Box Size Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Match household items (books, cookware, electronics, clothing) to the right cardboard box volume and weight limits.',
    tip: 'Keep any packed box under 50 lbs (23 kg) to prevent handle tearing and back injuries.',
    usage: [
      'Select household item category to pack.',
      'Check recommended box size, packing paper cushioning, and maximum weight limit.',
    ],
    method: [
      'Matches item density and fragility to cardboard crush ratings.',
    ],
    fields: [
      sel('itemCategory', 'Items to Pack', [
        'Books & Paper Records (Dense & heavy -> Small 1.5 cu ft)',
        'Kitchen Dishes & Glassware (Fragile -> Dish Barrel Cell Box)',
        'Pots, Pans & Small Appliances (Medium 3.0 cu ft)',
        'Linens, Pillows & Blankets (Bulky/Light -> Large 4.5 cu ft)',
        'Hanging Closet Clothes (Wardrobe Box with Metal Bar)',
      ], 'Kitchen Dishes & Glassware (Fragile -> Dish Barrel Cell Box)'),
    ],
    compute: (v) => {
      const item = asSel(v.itemCategory)

      return [
        res('Recommended Box Type', item.split('->')[1]?.replace(')', '').trim() || 'Standard box', 'good', item.split('(')[0].trim()),
        res('Max Safe Weight Limit', item.includes('Linens') ? '35 lbs' : '45-50 lbs max', 'info', 'Protects box structural integrity'),
        res('Cushioning Strategy', item.includes('Kitchen') ? 'Double-wall corrugated + cell dividers + unprinted newsprint' : 'Crumpled paper on bottom and top', 'good', 'Zero shifting when shaken'),
        res('Labeling Best Practice', 'Write ROOM and TOP PRIORITY on 2 sides + top', 'neutral', 'Easy to read while stacked'),
      ]
    },
  },
  {
    id: 'packing-time-calculator',
    name: 'Packing Time Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate total hours and weeks needed to pack your home based on room count and available packing hours per day.',
    tip: 'Packing an average home takes roughly 4 to 6 hours per room; begin packing non-essentials 4 weeks before moving day.',
    usage: [
      'Enter number of rooms in your home (including garage and kitchen).',
      'Enter hours available to pack per day.',
      'Check total packing hours and recommended countdown calendar weeks.',
    ],
    method: [
      'Total Packing Hours = (Bedrooms * 5) + (Kitchen * 10) + (Living * 6) + (Bath/Garage * 8).',
    ],
    fields: [
      n('totalRooms', 'Total Rooms to Pack (Include Kitchen & Garage)', { def: 6, min: 1, max: 15, step: 1 }),
      n('packingHoursPerDay', 'Available Packing Hours per Day', { def: 2, min: 0.5, max: 10, step: 0.5 }),
    ],
    compute: (v) => {
      const rooms = asNum(v.totalRooms, 6)
      const dailyHrs = asNum(v.packingHoursPerDay, 2)

      // Approx 6 hrs per room avg (kitchen is 10, closets 4)
      const totalHours = Math.round(rooms * 6.5)
      const daysNeeded = Math.ceil(totalHours / dailyHrs)
      const weeksNeeded = Math.ceil(daysNeeded / 5)

      return [
        res('Total Packing Labor', `${totalHours} hours`, 'good', `Across ${rooms} rooms`),
        res('Calendar Timeline', `~${weeksNeeded} weeks`, weeksNeeded > 4 ? 'warn' : 'info', `@ ${dailyHrs} hours/day`),
        res('Kitchen Allocation', '~10 dedicated hours', 'warn', 'Most fragile and labor-intensive room'),
        res('Start Recommendation', `Begin packing non-essentials ${Math.max(3, weeksNeeded)} weeks prior`, 'good', 'Avoids sleepless all-nighters before move'),
      ]
    },
  },
  {
    id: 'packing-progress-tracker',
    name: 'Packing Progress Tracker',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Track boxes packed against total estimated box target to monitor moving day countdown progress.',
    tip: 'Leave your everyday kitchen essentials and 1 set of bedding unpacked until the final 24 hours.',
    usage: [
      'Enter target total box count.',
      'Enter boxes taped and packed so far.',
      'Check completion percentage and remaining boxes.',
    ],
    method: [
      'Progress = (Boxes Packed / Target Boxes) * 100.',
    ],
    fields: [
      n('targetBoxes', 'Estimated Total Boxes Needed', { def: 65, min: 10, max: 300, step: 5 }),
      n('boxesPacked', 'Boxes Packed & Taped to Date', { def: 38, min: 0, max: 300, step: 1 }),
    ],
    compute: (v) => {
      const target = asNum(v.targetBoxes, 65)
      const packed = asNum(v.boxesPacked, 38)

      const remaining = Math.max(0, target - packed)
      const pctDone = Math.min(100, Math.round((packed / target) * 100))

      return [
        res('Packing Completion', `${pctDone}% Complete`, pctDone >= 70 ? 'good' : 'warn', `${packed} of ${target} boxes packed`),
        res('Boxes Remaining', `${remaining} boxes left`, remaining === 0 ? 'good' : 'neutral', 'Keep packing pace steady'),
        res('Pacing Status', pctDone >= 60 ? 'On Track for Move Day' : 'Accelerate Packing Pace', pctDone >= 60 ? 'good' : 'warn', 'Prevents last-minute chaos'),
        res('Staging Advice', 'Stack packed boxes against perimeter walls of each room', 'info', 'Leaves central walkways clear'),
      ]
    },
  },
  {
    id: 'room-by-room-packing-planner',
    name: 'Room-by-Room Packing Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Orderly packing order: Storage/Attic first, Guest room second, Living room third, Kitchen & Bath last.',
    tip: 'Pack storage rooms (attic, garage, spare closet) first because you won\'t need those items during the final month.',
    usage: [
      'Review the standard 4-stage chronological packing sequence.',
      'Check off completed room phases.',
    ],
    method: [
      'Stage 1: Storage/Decor. Stage 2: Guest/Books. Stage 3: Wardrobe/Living. Stage 4: Daily Kitchen/Bath.',
    ],
    fields: [
      ck('stage1Storage', 'Stage 1 (4 Wks Out): Attic, garage, holiday decor, spare closets', true),
      ck('stage2Guest', 'Stage 2 (3 Wks Out): Guest bedrooms, books, board games, formal china', true),
      ck('stage3Living', 'Stage 3 (2 Wks Out): Artwork, extra clothing, living room electronics', false),
      ck('stage4Daily', 'Stage 4 (Final 3 Days): Everyday kitchenware, daily toiletries, beds', false),
    ],
    compute: (v) => {
      const stages = [
        v.stage1Storage,
        v.stage2Guest,
        v.stage3Living,
        v.stage4Daily,
      ]
      const count = stages.filter(Boolean).length

      return [
        res('Phased Progress', `${count} of 4 stages complete`, count >= 3 ? 'good' : 'warn', 'Chronological room sequencing'),
        res('Current Priority Room', !v.stage1Storage ? 'Attic / Garage / Holiday' : !v.stage2Guest ? 'Guest Rooms & Books' : !v.stage3Living ? 'Art & Living Room' : 'Everyday Kitchen & Linens', 'neutral', 'Prevents living out of boxes too early'),
        res('Kitchen Buffer Tip', 'Transition to paper plates 3 days before moving', 'good', 'Allows 100% of kitchen dishes to be packed'),
        res('Open-First Box', 'Keep 1 clear plastic bin for immediate essentials', 'info', 'Toilet paper, box cutter, hand soap, towels'),
      ]
    },
  },
  {
    id: 'moving-inventory-generator',
    name: 'Moving Inventory Generator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Create a numbered master manifest (Box #1 to #80) with room codes and high-value item tags.',
    tip: 'Number every box with a thick black marker on 3 sides; cross off numbers on your master sheet as they enter the new home.',
    usage: [
      'Enter box number and destination room.',
      'Enter brief description of contents.',
      'Mark if contains high-value or fragile items.',
    ],
    method: [
      'Formats standardized moving manifest records.',
    ],
    fields: [
      n('boxNumber', 'Box Number (#)', { def: 14, min: 1, max: 250, step: 1 }),
      sel('roomCode', 'Destination Room', [
        'KIT - Kitchen',
        'MBR - Master Bedroom',
        'LIV - Living Room',
        'BTH - Bathroom',
        'OFC - Home Office',
        'GAR - Garage / Storage',
      ], 'KIT - Kitchen'),
      txt('contentsSummary', 'Contents Summary', 'Stainless steel cookware, frying pans, spatulas'),
      ck('isFragile', 'Contains fragile / glass items', false),
    ],
    compute: (v) => {
      const numBox = asNum(v.boxNumber, 14)
      const room = asSel(v.roomCode)
      const cont = asStr(v.contentsSummary, 'Household goods')
      const frag = v.isFragile

      return [
        res('Manifest Code', `Box #${numBox} [${room.split(' ')[0]}]`, 'good', room.split('-')[1]?.trim() || 'Room'),
        res('Contents Logged', cont, 'neutral', 'Documented on master inventory'),
        res('Handling Note', frag ? 'FRAGILE - TOP LOAD ONLY' : 'Standard Stackable', frag ? 'bad' : 'good', frag ? 'Do not stack heavy boxes on top' : 'Sturdy base box'),
        res('Cross-Off Checklist', `Check off #${numBox} upon unloading into new home`, 'info', 'Prevents lost boxes on moving truck'),
      ]
    },
  },
  {
    id: 'moving-inventory-value-calculator',
    name: 'Moving Inventory Value Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate full replacement value of household goods to determine whether to purchase Full Value Protection insurance.',
    tip: 'Standard mover liability pays only $0.60 per pound per item; a broken $1,000 30-lb TV only receives an $18 payout without insurance!',
    usage: [
      'Enter estimated replacement value of furniture, electronics, kitchenware, and wardrobe.',
      'Check total household declared value and compare Full Value Protection vs Released Value ($0.60/lb).',
    ],
    method: [
      'Standard valuation: ~$8.00 - $10.00 per pound of household goods.',
    ],
    fields: [
      n('furnitureValue', 'Furniture & Mattresses Replacement Value ($)', { def: 18000, min: 1000, max: 150000, step: 500 }),
      n('electronicsValue', 'TVs, Computers & Electronics ($)', { def: 6500, min: 500, max: 50000, step: 250 }),
      n('clothingGoods', 'Clothing, Kitchenware & Decor ($)', { def: 12000, min: 1000, max: 100000, step: 500 }),
    ],
    compute: (v) => {
      const furn = asNum(v.furnitureValue, 18000)
      const elec = asNum(v.electronicsValue, 6500)
      const goods = asNum(v.clothingGoods, 12000)

      const totalVal = furn + elec + goods
      const fullValPremiumEst = Math.round(totalVal * 0.012) // ~1.2% policy premium

      return [
        res('Total Declared Value', money(totalVal), 'good', 'Estimated replacement cost'),
        res('Full Value Protection Cost', `~${money(fullValPremiumEst)}`, 'info', '1% to 1.5% premium typical'),
        res('Basic Released Value Risk', 'Default $0.60 / lb payout', 'bad', 'Severe coverage gap on lightweight electronics'),
        res('High-Value Items', 'Transport jewelry, heirlooms, and laptops in personal car', 'warn', 'Never place irreplaceable heirlooms on truck'),
      ]
    },
  },
  {
    id: 'moving-budget-planner',
    name: 'Moving Budget Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Track all moving costs across truck/movers, boxes/tape, deposits, move-out cleaning, and utility setup fees.',
    tip: 'Moving out of rentals often involves temporary double-rent or overlapping utility bills; plan for a 1-month overlap.',
    usage: [
      'Enter primary truck or professional mover fee.',
      'Enter packing supplies, move-out cleaning, and new utility deposits.',
      'Check total moving cash required and reserve buffer.',
    ],
    method: [
      'Total Cash Needed = Moving Service + Supplies + Cleaning + Deposits + Overlap + 10% contingency.',
    ],
    fields: [
      n('moverFee', 'Movers or Truck Rental ($)', { def: 1450, min: 50, max: 20000, step: 50 }),
      n('suppliesCost', 'Boxes, Tape, Bubble Wrap & Pads ($)', { def: 180, min: 0, max: 1000, step: 10 }),
      n('cleaningFee', 'Move-Out Deep Cleaning / Carpet Clean ($)', { def: 250, min: 0, max: 1000, step: 25 }),
      n('utilityDeposits', 'New Utility Connection Fees & Deposits ($)', { def: 150, min: 0, max: 1000, step: 10 }),
      n('overlapRent', 'Overlapping Rent / Double Housing Days ($)', { def: 400, min: 0, max: 4000, step: 50 }),
    ],
    compute: (v) => {
      const mover = asNum(v.moverFee, 1450)
      const sup = asNum(v.suppliesCost, 180)
      const clean = asNum(v.cleaningFee, 250)
      const dep = asNum(v.utilityDeposits, 150)
      const rent = asNum(v.overlapRent, 400)

      const baseTotal = mover + sup + clean + dep + rent
      const contingency = baseTotal * 0.10
      const totalCashNeeded = baseTotal + contingency

      return [
        res('Total Moving Outlay', money(totalCashNeeded), 'good', `Includes 10% reserve buffer (${money(contingency)})`),
        res('Primary Transport Share', money(mover), 'info', `${Math.round((mover / baseTotal) * 100)}% of total`),
        res('Ancillary Fees & Deposits', money(clean + dep + rent), 'neutral', 'Cleaning, fees, and rent overlap'),
        res('Mover Tipping Guideline', mover > 600 ? `$20 - $40 per mover for 3-4 man crew` : 'Optional', 'good', 'Have cash on moving day'),
      ]
    },
  },
  {
    id: 'moving-day-timeline',
    name: 'Moving Day Timeline',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Hour-by-hour operational schedule for moving day from 7:00 AM truck arrival to evening bed assembly.',
    tip: 'Disassemble and reassemble beds first at the new home so you have an immediate sleeping spot when exhaustion hits.',
    usage: [
      'Select moving day start hour.',
      'Review chronological schedule for loading, walkthrough, travel, and unloading.',
    ],
    method: [
      'Sequences standard moving day operational blocks.',
    ],
    fields: [
      sel('arrivalHour', 'Movers / Truck Arrival Time', [
        '8:00 AM Arrival (Recommended early start)',
        '9:00 AM Arrival',
        '1:00 PM Afternoon Shift',
      ], '8:00 AM Arrival (Recommended early start)'),
    ],
    compute: (v) => {
      const arr = asSel(v.arrivalHour)

      return [
        res('Morning Kickoff', `${arr.split(' ')[0]} - Breakfast & final staging`, 'good', 'Be 100% packed before truck arrives'),
        res('Loading Window (8:00 - 11:30 AM)', 'Movers load heavy furniture & staged boxes', 'info', 'Guide movers and answer questions'),
        res('Final Walkthrough (12:00 PM)', 'Check all closets, attic, dishwasher & lock up', 'warn', 'Take timestamped photos of empty home'),
        res('Unloading Priority (2:00 PM+)', 'Mattresses & bed frames assembled FIRST', 'good', 'Guarantees rest at the end of moving day'),
      ]
    },
  },
  {
    id: 'moving-day-checklist',
    name: 'Moving Day Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Critical day-of checklist: floor protection runners, cash for tips, meter readings, and final thermostat check.',
    tip: 'Photograph your electric and water meter dials on moving day to avoid paying for the new occupant\'s usage.',
    usage: [
      'Check off key moving day action items.',
      'Verify meter readings, keys handover, and floor runners.',
    ],
    method: [
      'Validates all day-of moving requirements.',
    ],
    fields: [
      ck('floorProtectionDown', 'Laid down neoprene floor runners or cardboard to protect floors', true),
      ck('cashTipReady', 'Have cash envelopes ready for mover tips and lunch pizza', true),
      ck('meterReadingsPhotographed', 'Photographed electric, gas, and water meters with time stamp', true),
      ck('finalSweepWalkthrough', 'Checked every single closet, cabinet, and under-appliance gap', false),
      ck('keysHandedOver', 'Left keys, garage openers, and appliance manuals on kitchen counter', false),
    ],
    compute: (v) => {
      const items = [
        v.floorProtectionDown,
        v.cashTipReady,
        v.meterReadingsPhotographed,
        v.finalSweepWalkthrough,
        v.keysHandedOver,
      ]
      const count = items.filter(Boolean).length

      return [
        res('Moving Day Readiness', `${count} of 5 completed`, count >= 4 ? 'good' : 'warn', 'Day-of execution'),
        res('Meter Documentation', v.meterReadingsPhotographed ? 'Meters Photographed' : 'SNAP METER PHOTOS NOW', v.meterReadingsPhotographed ? 'good' : 'bad', 'Prevents final billing disputes'),
        res('Floor Protection', v.floorProtectionDown ? 'Floors Shielded' : 'Protect hardwoods with runners', v.floorProtectionDown ? 'good' : 'warn', 'Avoids scuffs and mud stains'),
        res('Keys & Remotes', v.keysHandedOver ? 'Transferred' : 'Consolidate keys on kitchen island', 'info', 'Hand over to landlord or agent'),
      ]
    },
  },
  {
    id: 'address-change-checklist',
    name: 'Address Change Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Checklist to update official address across USPS, DMV driver\'s license, banks, voter registration, and payroll.',
    tip: 'Submit your USPS Official Mail Forwarding request online 10-14 days before your move to prevent missed mail.',
    usage: [
      'Work through federal, state, financial, and subscription address updates.',
      'Track address transfer completion.',
    ],
    method: [
      'Organizes address change across 6 critical institutions.',
    ],
    fields: [
      ck('uspsForwarding', 'USPS Official Change of Address submitted (usps.com/move)', true),
      ck('dmvLicense', 'State DMV driver’s license and vehicle registration updated', false),
      ck('banksCreditCards', 'Bank accounts, credit cards, and investment brokerages updated', true),
      ck('employerPayroll', 'Employer HR & payroll tax withholding address updated', true),
      ck('voterReg', 'Voter registration updated for new voting precinct', false),
      ck('onlineRetailers', 'Amazon, food delivery, and subscription boxes delivery address changed', false),
    ],
    compute: (v) => {
      const items = [
        v.uspsForwarding,
        v.dmvLicense,
        v.banksCreditCards,
        v.employerPayroll,
        v.voterReg,
        v.onlineRetailers,
      ]
      const done = items.filter(Boolean).length
      const score = Math.round((done / items.length) * 100)

      return [
        res('Address Update Progress', `${score}% Complete`, score >= 75 ? 'good' : 'warn', `${done} of ${items.length} accounts updated`),
        res('DMV Legal Requirement', v.dmvLicense ? 'Compliant' : 'DMV requires update within 30 days of move', v.dmvLicense ? 'good' : 'warn', 'Avoids traffic ticket fines'),
        res('Delivery Caution', v.onlineRetailers ? 'Shopping Apps Updated' : 'Update Amazon 1-Click address immediately', 'info', 'Prevents packages shipping to old house'),
        res('Tax Withholding Note', v.employerPayroll ? 'Payroll Updated' : 'Notify HR for state tax withholding', 'good', 'Crucial for multi-state moves'),
      ]
    },
  },
  {
    id: 'utility-transfer-checklist',
    name: 'Utility Transfer Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Schedule disconnect dates at old address and connect dates at new address for power, gas, water, and fiber internet.',
    tip: 'Schedule utilities to overlap by 1 day so you have electricity and water at both places on moving day.',
    usage: [
      'Schedule disconnect and connect dates for electric, gas, water, trash, and high-speed internet.',
      'Check utility transition safety.',
    ],
    method: [
      'Tracks service transfer across 5 essential utilities.',
    ],
    fields: [
      ck('electricScheduled', 'Electricity: Scheduled disconnect at old home & connect at new home', true),
      ck('waterScheduled', 'Water / Sewer: Municipal accounts transferred with 1-day overlap', true),
      ck('gasScheduled', 'Natural Gas: Account transferred and pilot light appointment set', false),
      ck('internetScheduled', 'Internet / WiFi: Tech installation or self-install kit ordered', true),
      ck('trashScheduled', 'Trash / Recycling bins ordered for new address', false),
    ],
    compute: (v) => {
      const items = [
        v.electricScheduled,
        v.waterScheduled,
        v.gasScheduled,
        v.internetScheduled,
        v.trashScheduled,
      ]
      const done = items.filter(Boolean).length
      const score = Math.round((done / items.length) * 100)

      return [
        res('Utility Transition Status', `${score}% Scheduled`, score >= 80 ? 'good' : 'warn', `${done} of ${items.length} utilities mapped`),
        res('Internet Lead Time', v.internetScheduled ? 'Fiber / Cable Booked' : 'Book ISP 2 weeks prior', v.internetScheduled ? 'good' : 'warn', 'Tech appointments book fast'),
        res('Gas Safety', v.gasScheduled ? 'Gas Active' : 'Schedule gas tech for heater/stove lighting', v.gasScheduled ? 'good' : 'info', 'Gas companies often require on-site adult'),
        res('Overlap Rule', '1-day overlap prevents packing in the dark', 'good', 'Keeps AC running during moving day'),
      ]
    },
  },
  {
    id: 'new-home-setup-planner',
    name: 'New Home Setup Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'First 48-hour new home setup plan: rekey exterior locks, change toilet seats, test smoke alarms, and locate shutoffs.',
    tip: 'Always rekey or replace exterior door lock cylinders on day one; you never know who has keys from previous owners.',
    usage: [
      'Check off critical immediate security and sanitation upgrades at new home.',
      'Track new home move-in security rating.',
    ],
    method: [
      'Validates first-48-hour new property baseline security.',
    ],
    fields: [
      ck('rekeyLocks', 'Rekeyed or installed new deadbolt locks on all exterior entry doors', true),
      ck('locateShutoffs', 'Physically located main water shut-off valve, electrical breaker box, and gas meter', true),
      ck('changeToiletSeats', 'Replaced existing toilet seats with fresh antimicrobial seats', false),
      ck('testSmokeCO', 'Tested all smoke and carbon monoxide detectors and inserted fresh batteries', true),
      ck('hvacFilterNew', 'Installed brand new clean HVAC air filter in furnace / return air vent', false),
    ],
    compute: (v) => {
      const items = [
        v.rekeyLocks,
        v.locateShutoffs,
        v.changeToiletSeats,
        v.testSmokeCO,
        v.hvacFilterNew,
      ]
      const count = items.filter(Boolean).length
      const score = Math.round((count / items.length) * 100)

      return [
        res('New Home Safety Score', `${score}% Secured`, score >= 80 ? 'good' : 'warn', `${count} of ${items.length} initial safeguards verified`),
        res('Lock Security', v.rekeyLocks ? 'Deadbolts Secured' : 'PRIORITY: Rekey exterior door locks', v.rekeyLocks ? 'good' : 'bad', 'Previous contractors/realtors may have keys'),
        res('Emergency Shutoffs', v.locateShutoffs ? 'Shutoffs Mapped' : 'Find main water valve today', v.locateShutoffs ? 'good' : 'warn', 'Crucial before unpacking begins'),
        res('HVAC Air Quality', v.hvacFilterNew ? 'Fresh Filter' : 'Replace air filter to eliminate prior owner pet dander', 'info', 'Improves indoor air immediately'),
      ]
    },
  },
  {
    id: 'first-night-home-checklist',
    name: 'First Night Home Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Essential "Open First" survival kit checklist: bed linens, towels, toiletries, phone chargers, scissors, and medicine.',
    tip: 'Pack your "First Night Box" in a clear plastic bin and transport it in your personal car, not on the moving truck.',
    usage: [
      'Check off first night essentials so you can sleep peacefully on night one without opening random boxes.',
    ],
    method: [
      'Validates first night survival readiness.',
    ],
    fields: [
      ck('bedLinensPillows', 'Bed sheets, pillows, and cozy blankets ready to dress bed', true),
      ck('showerKitTowels', 'Shower curtain, rings, bath towels, soap, shampoo, and toilet paper', true),
      ck('chargersFlashlight', 'Phone chargers, portable battery bank, and LED flashlight', true),
      ck('toolBoxCutter', 'Utility box cutter, screwdriver, and trash bags', true),
      ck('pajamasMeds', 'Change of clothes, pajamas, and critical prescription medications', true),
    ],
    compute: (v) => {
      const items = [
        v.bedLinensPillows,
        v.showerKitTowels,
        v.chargersFlashlight,
        v.toolBoxCutter,
        v.pajamasMeds,
      ]
      const count = items.filter(Boolean).length

      return [
        res('First Night Readiness', `${count} of 5 ready`, count === 5 ? 'good' : 'warn', count === 5 ? 'All survival essentials packed' : 'Gather missing night-one items'),
        res('Shower Curtain Warning', v.showerKitTowels ? 'Shower Ready' : 'Don\'t forget shower curtain rings & liner', v.showerKitTowels ? 'good' : 'bad', 'Prevents flooded bathroom floor on night one'),
        res('Box Cutter Accessibility', v.toolBoxCutter ? 'Tools on Hand' : 'Keep box cutter in pocket', 'good', 'First tool needed to open other boxes'),
        res('Dinner Recommendation', 'Order favorite takeout pizza or sushi', 'neutral', 'Skip cooking on night one'),
      ]
    },
  },
  {
    id: 'first-week-home-checklist',
    name: 'First Week Home Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Checklist for week one: unpack kitchen, meet immediate neighbors, test appliances, and find local grocery/pharmacy.',
    tip: 'Introduce yourself to your next-door neighbors in the first week; they are your best source of local neighborhood tips.',
    usage: [
      'Work through first-week settling tasks.',
      'Check off kitchen unpacking, trash day schedules, and local store mapping.',
    ],
    method: [
      'Structures the first 7 days in a new home.',
    ],
    fields: [
      ck('unpackKitchen', 'Kitchen 100% unpacked and operational for family meals', true),
      ck('trashRecyclingDays', 'Confirmed municipal trash and recycling weekly pickup days', true),
      ck('meetNeighbors', 'Introduced family to next-door neighbors on both sides', false),
      ck('testAppliances', 'Ran test cycles on dishwasher, washing machine, and dryer', true),
      ck('locateErPharmacy', 'Located nearest 24/7 emergency room, urgent care, and pharmacy', false),
    ],
    compute: (v) => {
      const items = [
        v.unpackKitchen,
        v.trashRecyclingDays,
        v.meetNeighbors,
        v.testAppliances,
        v.locateErPharmacy,
      ]
      const count = items.filter(Boolean).length

      return [
        res('First Week Progress', `${count} of 5 milestones achieved`, count >= 4 ? 'good' : 'warn', 'Settling into new home'),
        res('Kitchen Milestone', v.unpackKitchen ? 'Kitchen Cooking Operational' : 'Prioritize kitchen unpacking', v.unpackKitchen ? 'good' : 'info', 'Restores normal family routine'),
        res('Community Medical', v.locateErPharmacy ? 'Emergency Routes Known' : 'Map nearest urgent care & ER now', v.locateErPharmacy ? 'good' : 'warn', 'Critical knowledge before sickness strikes'),
        res('Cardboard Disposal', 'Flatten boxes and schedule bulk cardboard recycling pickup', 'neutral', 'Reclaims garage and living space'),
      ]
    },
  },
  {
    id: 'new-home-essentials-checklist',
    name: 'New Home Essentials Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Essential items often forgotten when moving from an apartment into a house: garden hose, ladder, lawnmower, plunger.',
    tip: 'Buy a toilet plunger and fire extinguisher on day one BEFORE you desperately need them.',
    usage: [
      'Audit single-family home essential gear.',
      'Check off ladder, garden hose, plunger, fire extinguishers, and lawn care.',
    ],
    method: [
      'Inventories foundational homeowner equipment.',
    ],
    fields: [
      ck('plungersExtinguishers', 'Heavy-duty flange toilet plungers for every bath + ABC fire extinguishers', true),
      ck('gardenHoseNozzle', '50-100 ft garden hose with spray nozzle for exterior cleaning', false),
      ck('stepladder', '6-ft fiberglass stepladder for changing lightbulbs and smoke detectors', true),
      ck('lawnMowerSnow', 'Lawn mower or string trimmer / snow shovel based on climate', false),
      ck('gardenTools', 'Outdoor rake, shovel, and broom for driveway and leaf care', false),
    ],
    compute: (v) => {
      const items = [
        v.plungersExtinguishers,
        v.gardenHoseNozzle,
        v.stepladder,
        v.lawnMowerSnow,
        v.gardenTools,
      ]
      const count = items.filter(Boolean).length
      const score = Math.round((count / items.length) * 100)

      return [
        res('Homeowner Gear Readiness', `${score}% Equipped`, score >= 75 ? 'good' : 'warn', `${count} of ${items.length} tools owned`),
        res('Life Safety', v.plungersExtinguishers ? 'Extinguishers & Plungers Ready' : 'BUY FIRE EXTINGUISHER & PLUNGER', v.plungersExtinguishers ? 'good' : 'bad', 'Essential safety gear'),
        res('Exterior Maintenance', v.gardenHoseNozzle && v.stepladder ? 'Equipped for upkeep' : 'Budget for ladder & hose', 'info', 'Required for basic property maintenance'),
        res('Budget Allocation', `Estimated starter kit cost: ~$350 - $500 total`, 'neutral', 'One-time multi-year investment'),
      ]
    },
  },
  {
    id: 'new-apartment-checklist',
    name: 'New Apartment Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Apartment-specific setup: renter’s insurance policy verification, elevator booking, parking permits, and mail keys.',
    tip: 'Most luxury apartment buildings require a Certificate of Insurance (COI) from your movers before allowing building entry.',
    usage: [
      'Check off renter\'s insurance verification, freight elevator reservation, and parking decals.',
      'Verify apartment move-in compliance.',
    ],
    method: [
      'Validates multi-family leasing and move-in requirements.',
    ],
    fields: [
      ck('rentersInsuranceActive', 'Renter’s insurance policy active with property management listed as interested party', true),
      ck('freightElevatorBooked', 'Freight elevator reserved for specific 3-hour moving window', true),
      ck('parkingPermitSecured', 'Assigned parking decal / garage gate transponder secured', true),
      ck('mailboxKeyTested', 'Tested USPS mail key and package parcel locker system code', false),
    ],
    compute: (v) => {
      const items = [
        v.rentersInsuranceActive,
        v.freightElevatorBooked,
        v.parkingPermitSecured,
        v.mailboxKeyTested,
      ]
      const count = items.filter(Boolean).length

      return [
        res('Apartment Move-In Readiness', `${count} of 4 verified`, count === 4 ? 'good' : 'warn', 'Building access compliance'),
        res('Elevator Reservation', v.freightElevatorBooked ? 'Elevator Locked In' : 'BOOK ELEVATOR WITH LEASING OFFICE', v.freightElevatorBooked ? 'good' : 'bad', 'Avoids severe moving day delay penalties'),
        res('Renter\'s Insurance', v.rentersInsuranceActive ? 'Coverage Active' : 'Proof required before key handoff', v.rentersInsuranceActive ? 'good' : 'bad', 'Protects against liability and water leaks'),
        res('Quiet Hours Rule', 'Respect building quiet hours (typically after 8:00 PM)', 'neutral', 'Start on good terms with neighbors'),
      ]
    },
  },
  {
    id: 'rental-move-in-checklist',
    name: 'Rental Move-In Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Conduct a thorough condition inspection walkthrough, documenting pre-existing scuffs, carpet stains, and nail holes.',
    tip: 'Take 50+ timestamped photos and a continuous walkthrough video of every room before placing a single furniture piece.',
    usage: [
      'Complete initial walkthrough before bringing in boxes.',
      'Check off photographic documentation of blinds, baseboards, appliances, and tile.',
    ],
    method: [
      'Creates photographic paper trail to safeguard security deposits.',
    ],
    fields: [
      ck('timestampPhotos', 'Photographed every wall, window blind, carpet stain, and door with timestamp', true),
      ck('writtenChecklistSigned', 'Submitted official signed Move-In Inspection form to landlord within 48 hrs', true),
      ck('smokeAlarmsOperational', 'Verified smoke alarms and carbon monoxide detectors beep properly', true),
      ck('windowsLatchesTested', 'Tested all window locks, latches, and window screen mesh', false),
    ],
    compute: (v) => {
      const items = [
        v.timestampPhotos,
        v.writtenChecklistSigned,
        v.smokeAlarmsOperational,
        v.windowsLatchesTested,
      ]
      const count = items.filter(Boolean).length

      return [
        res('Move-In Inspection Status', `${count} of 4 completed`, count >= 3 ? 'good' : 'warn', 'Security deposit protection'),
        res('Photo Evidence Status', v.timestampPhotos ? 'Timestamp Photos Secured' : 'TAKE PHOTOS BEFORE UNPACKING', v.timestampPhotos ? 'good' : 'bad', 'Legal proof against false damage deductions'),
        res('Landlord Notice', v.writtenChecklistSigned ? 'Inspection Form Submitted' : 'Submit form within 48-72 hour lease window', v.writtenChecklistSigned ? 'good' : 'warn', 'Email written copy for timestamped record'),
        res('Pre-Existing Scuffs', 'Note even tiny scuffs on kitchen cabinets and baseboards', 'info', 'Zero dispute upon move-out'),
      ]
    },
  },
  {
    id: 'rental-move-out-checklist',
    name: 'Rental Move-Out Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Step-by-step checklist to restore rental property to move-in condition and secure 100% of your security deposit.',
    tip: 'Patch all picture hanging nail holes with lightweight spackle and wipe baseboards clean to pass the final inspection.',
    usage: [
      'Follow landlord move-out cleaning and repair specifications.',
      'Check off wall patching, oven degreasing, refrigerator defrost, and key return.',
    ],
    method: [
      'Validates all standard lease surrender conditions.',
    ],
    fields: [
      ck('nailHolesPatched', 'All picture nail holes spackled flat and wiped smooth with damp cloth', true),
      ck('ovenDeepCleaned', 'Oven interior, stove drip pans, and range hood filter degreased', false),
      ck('fridgeDefrostedWiped', 'Refrigerator shelves washed, crumbs vacuumed, and freezer wiped dry', true),
      ck('carpetSteamCleaned', 'Carpet professionally vacuumed or steam cleaned (keep receipt)', false),
      ck('allKeysReturned', 'All keys, gate fobs, and mailbox keys returned with signed receipt', true),
    ],
    compute: (v) => {
      const items = [
        v.nailHolesPatched,
        v.ovenDeepCleaned,
        v.fridgeDefrostedWiped,
        v.carpetSteamCleaned,
        v.allKeysReturned,
      ]
      const count = items.filter(Boolean).length
      const score = Math.round((count / items.length) * 100)

      return [
        res('Move-Out Ready Score', `${score}% Complete`, score >= 80 ? 'good' : 'warn', `${count} of ${items.length} lease tasks finished`),
        res('Oven & Kitchen Inspection', v.ovenDeepCleaned ? 'Degreased' : 'CLEAN OVEN: Common $150 cleaning deduction', v.ovenDeepCleaned ? 'good' : 'warn', 'Landlords check oven glass & burners first'),
        res('Joint Walkthrough', 'Request in-person walkthrough with property manager on last day', 'good', 'Sign off on condition together'),
        res('Deposit Return Timeline', 'Landlords must legally return deposit within 14-30 days by law', 'info', 'Provide your new forwarding address in writing'),
      ]
    },
  },
  {
    id: 'security-deposit-checklist',
    name: 'Security Deposit Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate expected deposit refund, review statutory state return deadlines (14-30 days), and draft demand letters.',
    tip: 'Under most state landlord-tenant laws, normal "wear and tear" cannot be legally deducted from your security deposit.',
    usage: [
      'Enter total security deposit held by landlord ($).',
      'Enter days since lease termination.',
      'Check statutory return status and legal deduction rules.',
    ],
    method: [
      'Tracks statutory refund deadlines and itemized deduction rights.',
    ],
    fields: [
      n('depositAmount', 'Security Deposit Held ($)', { def: 1800, min: 200, max: 10000, step: 50 }),
      n('daysSinceMoveOut', 'Days Elapsed Since Move-Out & Key Return', { def: 18, min: 0, max: 90, step: 1 }),
      ck('forwardingAddressGiven', 'Provided new written forwarding address to landlord', true),
    ],
    compute: (v) => {
      const dep = asNum(v.depositAmount, 1800)
      const days = asNum(v.daysSinceMoveOut, 18)
      const fwd = v.forwardingAddressGiven

      const isLate = days > 30

      return [
        res('Deposit Balance', money(dep), 'good', 'Funds legally held in escrow'),
        res('Statutory Timeline Status', isLate ? 'PAST DUE: Landlord may owe statutory penalties' : `Day ${days} of 30-Day Legal Window`, isLate ? 'bad' : 'info', 'Most states mandate return within 21-30 days'),
        res('Forwarding Address', fwd ? 'Forwarding Address Logged' : 'SEND FORWARDING ADDRESS VIA CERTIFIED MAIL', fwd ? 'good' : 'bad', 'Clock only starts once landlord has address'),
        res('Itemized Accounting Rule', 'Landlord MUST provide itemized receipts for any deductions', 'good', 'Cannot charge estimated lump sums'),
      ]
    },
  },
  {
    id: 'home-decluttering-planner',
    name: 'Home Decluttering Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Apply the 4-Box Method (Keep, Donate, Sell, Trash) to lighten moving truck weight and save on moving fees.',
    tip: 'Moving items you haven\'t used in over a year costs $1.50 per pound; purge before you pack, never after.',
    usage: [
      'Enter estimated percentage of household items sorted so far.',
      'Check decluttering progress and moving weight reduction.',
    ],
    method: [
      'Applies the 4-Box sorting system to eliminate moving dead weight.',
    ],
    fields: [
      n('itemsPurgedCount', 'Items Purged (Donated, Sold, or Recycled)', { def: 140, min: 0, max: 1000, step: 10 }),
      sel('targetRoom', 'Room Currently Decluttering', [
        'Wardrobe / Clothes Closets (Donate clothes unworn in 12 mo)',
        'Kitchen Cabinets (Purge duplicate gadgets, chipped mugs)',
        'Garage / Storage Shed (Hazardous paints, old sports gear)',
        'Books, Media & Paper Records (Shred expired tax forms >7 yrs)',
      ], 'Wardrobe / Clothes Closets (Donate clothes unworn in 12 mo)'),
    ],
    compute: (v) => {
      const purged = asNum(v.itemsPurgedCount, 140)
      const room = asSel(v.targetRoom)

      const estWeightSavedLbs = Math.round(purged * 2.2)
      const estBoxesSaved = Math.round(purged / 15)

      return [
        res('Total Items Purged', `${purged} items eliminated`, 'good', room.split('(')[0].trim()),
        res('Truck Weight Saved', `~${num(estWeightSavedLbs)} lbs lighter`, 'good', 'Lowers transport cost & fuel burn'),
        res('Boxes Eliminated', `~${estBoxesSaved} fewer boxes to pack`, 'info', 'Saves packing time and tape'),
        res('The 20/20 Rule', 'If you can replace it for under $20 in under 20 mins, let it go', 'neutral', 'Overcomes decluttering hesitation'),
      ]
    },
  },
  {
    id: 'donation-value-tracker',
    name: 'Donation Value Tracker',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Itemize thrift donation fair market values (Goodwill / Salvation Army valuation guide) for IRS tax deductions.',
    tip: 'Clothing in good condition typically has an IRS thrift value of $4-$8 for shirts and $6-$12 for jeans/coats.',
    usage: [
      'Enter clothing items, furniture pieces, and kitchen goods donated.',
      'Check total IRS fair market donation value for non-cash charitable tax deductions.',
    ],
    method: [
      'Calculates tax deduction based on Salvation Army Valuation Guide benchmarks.',
    ],
    fields: [
      n('clothingBags', 'Bags / Boxes of Quality Clothing Donated', { def: 4, min: 0, max: 30, step: 1 }),
      n('furniturePieces', 'Solid Furniture Pieces Donated (Chairs, Tables)', { def: 2, min: 0, max: 20, step: 1 }),
      n('smallAppliances', 'Small Working Electronics / Appliances Donated', { def: 3, min: 0, max: 15, step: 1 }),
    ],
    compute: (v) => {
      const bags = asNum(v.clothingBags, 4)
      const furn = asNum(v.furniturePieces, 2)
      const apps = asNum(v.smallAppliances, 3)

      const clothVal = bags * 85 // ~$85 value per large bag of clothes
      const furnVal = furn * 65  // ~$65 avg thrift value
      const appVal = apps * 25   // ~$25 avg thrift value
      const totalTaxDeduction = clothVal + furnVal + appVal

      return [
        res('Total Charitable Valuation', money(totalTaxDeduction), 'good', 'IRS non-cash charitable deduction'),
        res('Clothing & Linens', money(clothVal), 'info', `${bags} bags donated`),
        res('Furniture & Household', money(furnVal + appVal), 'neutral', `${furn} furniture + ${apps} appliances`),
        res('Tax Receipt Rule', totalTaxDeduction > 250 ? 'Obtain written donor receipt from charity' : 'Self-log on Schedule A', 'warn', 'Required if itemizing deductions'),
      ]
    },
  },
  {
    id: 'storage-unit-size-calculator',
    name: 'Storage Unit Size Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate self-storage unit dimensions (5x5, 5x10, 10x10, 10x20) needed to store household goods between homes.',
    tip: 'A 10x10 storage unit (100 sq ft) holds the contents of an entire standard 2-bedroom apartment.',
    usage: [
      'Select what you need to store (Boxes only, 1-bed apartment, 2-bed home, full house).',
      'Check recommended unit size, square footage, and climate-control recommendations.',
    ],
    method: [
      '5x5 = 25 sqft (walk-in closet). 5x10 = 50 sqft. 10x10 = 100 sqft. 10x20 = 200 sqft (1-car garage).',
    ],
    fields: [
      sel('storageScope', 'Items to Store', [
        'Closet Overflow / ~25 Boxes (5x5 Unit - 25 sq ft)',
        'Studio / 1-Bedroom Apartment (5x10 Unit - 50 sq ft)',
        '2-Bedroom Home / Multi-Room Furniture (10x10 Unit - 100 sq ft)',
        '3-4 Bedroom House with Appliances (10x20 Unit - 200 sq ft)',
      ], '2-Bedroom Home / Multi-Room Furniture (10x10 Unit - 100 sq ft)'),
      ck('needsClimateControl', 'Storing wood furniture, electronics, artwork, or leather (Needs Climate Control)', true),
    ],
    compute: (v) => {
      const scope = asSel(v.storageScope)
      const climate = v.needsClimateControl

      return [
        res('Recommended Unit Size', scope.split('(')[1]?.split('-')[0].trim() || '10x10 Unit', 'good', scope.split('(')[0].trim()),
        res('Unit Floor Area', scope.split('-')[1]?.replace(')', '').trim() || '100 sq ft', 'info', 'Standard 8-ft ceiling height'),
        res('Climate Control Recommendation', climate ? 'MANDATORY Climate Control' : 'Standard Drive-Up Unit OK', climate ? 'warn' : 'good', climate ? 'Prevents wood warping, mold & electronics corrosion' : 'Safe for metal, plastic & tools'),
        res('Packing Strategy', 'Leave a 2-ft center walking aisle from front to back', 'good', 'Access back boxes without unpacking unit'),
      ]
    },
  },
  {
    id: 'storage-cost-calculator',
    name: 'Storage Cost Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate cumulative storage rental fees, administration charges, insurance, and lock fees over multiple months.',
    tip: 'Self-storage costs add up fast; 6 months of a $160/month unit costs nearly $1,000—often more than the stored items are worth!',
    usage: [
      'Enter monthly storage unit rental rate ($/mo).',
      'Enter planned rental duration in months.',
      'Include storage insurance and lock fees.',
      'Check total cumulative holding cost.',
    ],
    method: [
      'Total Cost = (Monthly Rate + Insurance) * Months + Admin/Lock Fee.',
    ],
    fields: [
      n('monthlyRent', 'Monthly Unit Rental Rate ($)', { def: 145, min: 25, max: 800, step: 5 }),
      n('storageMonths', 'Anticipated Storage Duration (Months)', { def: 4, min: 1, max: 36, step: 1 }),
      n('monthlyInsurance', 'Monthly Storage Insurance ($)', { def: 14, min: 0, max: 50, step: 1 }),
      n('adminLockFee', 'One-Time Admin & Disc Lock Fee ($)', { def: 35, min: 0, max: 100, step: 5 }),
    ],
    compute: (v) => {
      const rent = asNum(v.monthlyRent, 145)
      const months = asNum(v.storageMonths, 4)
      const ins = asNum(v.monthlyInsurance, 14)
      const admin = asNum(v.adminLockFee, 35)

      const monthlyOngoing = rent + ins
      const totalCost = (monthlyOngoing * months) + admin

      return [
        res('Total Cumulative Cost', money(totalCost), 'good', `Over ${months} months duration`),
        res('Monthly Holding Cost', money(monthlyOngoing) + '/month', 'info', `Rent (${money(rent)}) + Ins (${money(ins)})`),
        res('Break-Even Reality Check', `Ensure stored goods value exceeds ${money(totalCost)}`, totalCost > 800 ? 'warn' : 'good', 'Avoid storing low-value furniture long term'),
        res('Lock Security Tip', 'Use a round disc padlock with shielded shackle', 'good', 'Bolt-cutter resistant design'),
      ]
    },
  },
  {
    id: 'box-label-generator',
    name: 'Box Label Generator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Generate standardized, high-visibility box labeling format with room codes, contents, and urgency flags.',
    tip: 'Label the side of the box, not just the top; when boxes are stacked, top labels become completely hidden.',
    usage: [
      'Select destination room.',
      'Enter top 3 contents items.',
      'Select priority (Unpack First vs Storage).',
      'Generate printable box label summary.',
    ],
    method: [
      'Formats standardized color-coded text box label.',
    ],
    fields: [
      sel('room', 'Destination Room', [
        'KITCHEN (Blue)',
        'MASTER BEDROOM (Green)',
        'LIVING ROOM (Yellow)',
        'BATHROOM (Orange)',
        'KIDS ROOM / OFFICE (Purple)',
        'GARAGE / BASEMENT (Red)',
      ], 'KITCHEN (Blue)'),
      txt('contents', 'Primary Contents', 'Coffee maker, mugs, toaster, filters'),
      sel('priority', 'Unpacking Priority', [
        'OPEN FIRST / DAY 1 PRIORITY',
        'STANDARD PRIORITY',
        'LOW PRIORITY / LONG TERM STORAGE',
      ], 'OPEN FIRST / DAY 1 PRIORITY'),
    ],
    compute: (v) => {
      const rm = asSel(v.room)
      const cont = asStr(v.contents, 'Household goods')
      const prio = asSel(v.priority)

      const isFirst = prio.includes('OPEN FIRST')

      return [
        res('Destination Room', rm, 'good', 'Directs movers on delivery day'),
        res('Unpack Priority', prio, isFirst ? 'bad' : 'neutral', isFirst ? 'Place in kitchen immediate staging zone' : 'Standard stack'),
        res('Contents Manifest', cont, 'info', 'No guessing what is inside'),
        res('Placement Instruction', 'Stick labels on TWO ADJACENT SIDES + TOP', 'good', 'Visible from any angle in a stack'),
      ]
    },
  },
  {
    id: 'moving-box-label-maker',
    name: 'Moving Box Label Maker',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Quick label builder formatting box ID number, room destination, handling flags, and fragileness.',
    tip: 'Use colored duct tape or neon stickers per room so movers can sort boxes by color without reading every label.',
    usage: [
      'Enter box number and room.',
      'Select handling flags (Fragile, Heavy, Do Not Stack).',
      'Check formatted label manifest entry.',
    ],
    method: [
      'Standardizes professional mover labeling conventions.',
    ],
    fields: [
      n('boxNum', 'Box Number (#)', { def: 23, min: 1, max: 300, step: 1 }),
      txt('destinationRoom', 'Destination Room', 'Living Room - Media'),
      ck('flagFragile', 'FRAGILE - Contains glass / electronics', true),
      ck('flagHeavy', 'HEAVY (> 40 lbs) - Team Lift', false),
    ],
    compute: (v) => {
      const numB = asNum(v.boxNum, 23)
      const room = asStr(v.destinationRoom, 'Living Room')
      const frag = v.flagFragile
      const hvy = v.flagHeavy

      return [
        res('Box Identification', `BOX #${numB}`, 'good', room),
        res('Handling Warning', frag && hvy ? 'FRAGILE & HEAVY' : frag ? 'FRAGILE' : hvy ? 'HEAVY - TEAM LIFT' : 'STANDARD', frag ? 'bad' : hvy ? 'warn' : 'good', 'Prevents breakage & back strain'),
        res('Color Coding Tip', 'Use bright tape on corners to match door signs', 'info', 'Speeds unloading by 40%'),
        res('Top Side Up', 'Always mark arrows indicating right-side up', 'neutral', 'Keeps liquids & lamps safe'),
      ]
    },
  },
  {
    id: 'room-label-generator',
    name: 'Room Label Generator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Printable door signs for your new home (e.g. "KITCHEN", "BEDROOM 1 - MAX") so movers drop boxes in the right room.',
    tip: 'Tape matching colored room signs on the doors of your new home so movers don\'t have to ask "Where does this go?" 100 times.',
    usage: [
      'Select room door sign to format.',
      'Enter occupant or specific room name.',
      'Review room delivery instructions for movers.',
    ],
    method: [
      'Generates mover navigation signage.',
    ],
    fields: [
      sel('roomSign', 'Room Sign Type', [
        'MASTER BEDROOM (Upstairs Left)',
        'BEDROOM 2 (Upstairs Right)',
        'KITCHEN / PANTRY (Main Floor)',
        'HOME OFFICE / DEN (Main Floor)',
        'BASEMENT / STORAGE (Lower Level)',
      ], 'MASTER BEDROOM (Upstairs Left)'),
      txt('doorInstructions', 'Special Delivery Instructions', 'Stack boxes along closet wall; leave bed frame space clear'),
    ],
    compute: (v) => {
      const sign = asSel(v.roomSign)
      const inst = asStr(v.doorInstructions, 'Stack neatly')

      return [
        res('Door Sign Header', sign.split('(')[0].trim(), 'good', sign.split('(')[1]?.replace(')', '') || 'New Home'),
        res('Delivery Notes', inst, 'info', 'Movers read upon entering doorway'),
        res('Sign Placement', 'Tape sign at eye level (5 ft) on door frame with blue painter\'s tape', 'good', 'Won\'t damage paint upon removal'),
        res('Efficiency Gain', 'Saves 45 minutes of mover confusion and wandering', 'neutral', 'Smooth delivery flow'),
      ]
    },
  },
  {
    id: 'unpacking-planner',
    name: 'Unpacking Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Schedule room unpacking order across Days 1, 2, 3, and Week 1 to avoid living among half-opened boxes for months.',
    tip: 'Break down and recycle empty cardboard boxes immediately as you unpack each room to maintain visible psychological progress.',
    usage: [
      'Select unpacking phase (Day 1 Survival, Day 2 Kitchen/Bath, Day 3 Clothes, Week 1 Decor).',
      'Check recommended room focus and milestones.',
    ],
    method: [
      'Phased unpacking methodology from immediate life support to aesthetic styling.',
    ],
    fields: [
      sel('unpackPhase', 'Unpacking Target Phase', [
        'Day 1 (Beds, Linens, Shower Curtains, Toiletries, Pet food)',
        'Day 2 (Kitchen, Everyday Cookware, Dishwasher, Refrigerator)',
        'Day 3 (Clothes Closets, Dressers, Primary Home Office)',
        'Week 1-2 (Living Room, Books, Wall Art, Rugs, Decor)',
      ], 'Day 1 (Beds, Linens, Shower Curtains, Toiletries, Pet food)'),
    ],
    compute: (v) => {
      const phase = asSel(v.unpackPhase)

      return [
        res('Unpacking Focus', phase.split('(')[0].trim(), 'good', 'Structured transition rhythm'),
        res('Milestone Scope', phase.split('(')[1]?.replace(')', '') || 'Room setup', 'info', 'Focus on 1 room at a time'),
        res('Anti-Procrastination Rule', 'Empty every box completely before opening another', 'good', 'Avoids "half-unpacked box limbo"'),
        res('Box Recycling Goal', 'Flatten 10 boxes after every work session', 'neutral', 'Reclaims floor space rapidly'),
      ]
    },
  },
]
