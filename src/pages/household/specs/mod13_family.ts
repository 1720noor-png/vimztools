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
  pct,
  numD,
} from './householdSpec'

const SUB = 'Family'
const SUB_ID = 'family'

export const familySpecs: HouseholdSpec[] = [
  {
    id: 'family-calendar',
    name: 'Family Calendar',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Coordinate weekly sports practices, music lessons, school events, and parent work travel on a unified schedule.',
    tip: 'Color-code each family member on a shared calendar to spot double-bookings and transit conflicts instantly.',
    usage: [
      'Enter number of active family members.',
      'Enter weekly extracurricular activities across the family.',
      'Check weekly schedule density and taxi-transit load.',
    ],
    method: [
      'Calculates total weekly extracurricular hours and logistic load index.',
    ],
    fields: [
      n('familyMembers', 'Number of Family Members', { def: 4, min: 2, max: 10, step: 1 }),
      n('weeklyActivities', 'Total Weekly Activities / Practices', { def: 9, min: 0, max: 35, step: 1 }),
      n('carpoolHours', 'Weekly Chaperone / Driving Hours', { def: 6, min: 0, max: 30, step: 0.5 }),
    ],
    compute: (v) => {
      const members = asNum(v.familyMembers, 4)
      const acts = asNum(v.weeklyActivities, 9)
      const drive = asNum(v.carpoolHours, 6)

      const actsPerChild = Math.round((acts / Math.max(1, members - 2)) * 10) / 10
      const isOverloaded = acts >= 12

      return [
        res('Schedule Load', isOverloaded ? 'High Activity Density' : 'Balanced Schedule', isOverloaded ? 'warn' : 'good', `${acts} total weekly commitments`),
        res('Carpool Transit Time', `${numD(drive, 1)} hours/week`, drive > 8 ? 'warn' : 'info', `~${Math.round((drive / 7) * 60)} mins/day on the road`),
        res('Activities per Kid', `~${actsPerChild} activities`, actsPerChild > 3 ? 'warn' : 'good', 'Recommend max 2-3 per child for sanity'),
        res('Family Dinner Nights', isOverloaded ? 'Protect 2-3 dinner nights' : 'Aim for 4+ shared family dinners', 'good', 'Vital for emotional connection'),
      ]
    },
  },
  {
    id: 'family-schedule-planner',
    name: 'Family Schedule Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Structure weekly family routines across work hours, school drop-offs, homework, family dinners, and bedtimes.',
    tip: 'Buffer 15 minutes between afternoon activities to prevent rushing and car anxiety for both parents and kids.',
    usage: [
      'Select weekdays vs weekend focus.',
      'Review daily time-block allocations from 6:30 AM to 9:30 PM.',
      'Check schedule balance score.',
    ],
    method: [
      'Models standard 4-block daily family rhythm.',
    ],
    fields: [
      sel('scheduleType', 'Schedule Scope', [
        'Weekday School & Work Rhythm',
        'Weekend Activities & Leisure Rhythm',
      ], 'Weekday School & Work Rhythm'),
      ck('bufferBlocks', 'Built in 15-minute transition buffer blocks between activities', true),
      ck('sacredDinner', 'Designated sacred screen-free family dinner time', true),
    ],
    compute: (v) => {
      const type = asSel(v.scheduleType)
      const buf = v.bufferBlocks
      const din = v.sacredDinner

      return [
        res('Rhythm Type', type, 'good', 'Structured daily workflow'),
        res('Stress Mitigation', buf ? 'Transition Buffers Active' : 'Tight Transitions (High stress risk)', buf ? 'good' : 'warn', 'Prevents rushing and forgotten gear'),
        res('Screen-Free Dinner', din ? 'Protected Family Time' : 'Unscheduled dinner', din ? 'good' : 'neutral', 'Enhances communication'),
        res('Bedtime Routine Target', 'Start wind-down 45 minutes before lights out', 'info', 'Improves sleep latency'),
      ]
    },
  },
  {
    id: 'family-appointment-planner',
    name: 'Family Appointment Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Batch medical, dental, orthodontic, and vision checkups to minimize missed school and work hours.',
    tip: 'Schedule sibling dental cleanings back-to-back in the same appointment block to cut clinic trips in half.',
    usage: [
      'Select appointment category (Pediatric dental, Optometry, Annual physical).',
      'Enter number of children to schedule.',
      'Check recommended scheduling cadence and batching strategy.',
    ],
    method: [
      'Recommends semi-annual vs annual recall intervals.',
    ],
    fields: [
      sel('appointmentType', 'Appointment Category', [
        'Dental Cleaning & Checkup (Every 6 months)',
        'Annual Pediatric Well-Child Exam (Every 12 months)',
        'Optometry / Vision Exam (Annual)',
        'Orthodontist Adjustment (Every 6-8 weeks)',
      ], 'Dental Cleaning & Checkup (Every 6 months)'),
      n('childCount', 'Number of Children', { def: 2, min: 1, max: 6, step: 1 }),
    ],
    compute: (v) => {
      const app = asSel(v.appointmentType)
      const count = asNum(v.childCount, 2)

      return [
        res('Appointment Category', app.split('(')[0].trim(), 'good', `Cadence: ${app.split('(')[1]?.replace(')', '') || 'Regular'}`),
        res('Batching Recommendation', count > 1 ? `Request back-to-back sibling block for ${count} kids` : 'Standard single appointment', 'info', 'Saves 50% travel time'),
        res('Optimal Booking Time', 'First appointment of morning (8:00 AM) or 3:30 PM', 'good', 'Avoids long clinic waiting room delays'),
        res('Insurance Verification', 'Verify in-network coverage 48 hours prior', 'neutral', 'Prevents unexpected billing surprises'),
      ]
    },
  },
  {
    id: 'family-task-manager',
    name: 'Family Task Manager',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Organize household to-do lists by priority, assignees, and target completion deadlines.',
    tip: 'Limiting each family member to 3 high-priority daily tasks dramatically increases completion rates.',
    usage: [
      'Enter open household task counts across Urgent, High, and Low priority.',
      'Check completion backlog and recommended daily execution focus.',
    ],
    method: [
      'Prioritizes tasks using the Eisenhower Matrix (Urgent vs Important).',
    ],
    fields: [
      n('urgentTasks', 'Urgent / Due Today Tasks', { def: 3, min: 0, max: 20, step: 1 }),
      n('highPriorityTasks', 'High Priority (Due this week)', { def: 6, min: 0, max: 30, step: 1 }),
      n('lowPriorityTasks', 'Low Priority / Someday Backlog', { def: 12, min: 0, max: 50, step: 1 }),
    ],
    compute: (v) => {
      const urg = asNum(v.urgentTasks, 3)
      const hi = asNum(v.highPriorityTasks, 6)
      const low = asNum(v.lowPriorityTasks, 12)

      const total = urg + hi + low
      const isOverloaded = urg > 5

      return [
        res('Today\'s Direct Focus', `${urg} urgent tasks`, isOverloaded ? 'warn' : 'good', 'Tackle before noon'),
        res('Weekly Pipeline', `${hi} high-priority tasks`, 'info', 'Spread across the week'),
        res('Total Household Backlog', `${total} total tasks`, 'neutral', `${low} in low-priority backlog`),
        res('Productivity Tip', 'Pick your "One Big Thing" each morning before checking email', 'good', 'Drives meaningful momentum'),
      ]
    },
  },
  {
    id: 'family-responsibility-planner',
    name: 'Family Responsibility Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Equitably divide mental load and household executive responsibilities between partners (Fair Play method).',
    tip: 'The "Fair Play" principle: One partner owns the full Conception, Planning, and Execution (CPE) of each card.',
    usage: [
      'Select household domains (Meal planning, School forms, Doctor visits, Home repair, Budget).',
      'Assign full ownership to Partner A or Partner B.',
      'Check equity balance percentage.',
    ],
    method: [
      'Calculates executive mental load distribution ratio.',
    ],
    fields: [
      n('partnerATasks', 'Cards / Domains Owned by Partner A', { def: 14, min: 0, max: 40, step: 1 }),
      n('partnerBTasks', 'Cards / Domains Owned by Partner B', { def: 12, min: 0, max: 40, step: 1 }),
    ],
    compute: (v) => {
      const a = asNum(v.partnerATasks, 14)
      const b = asNum(v.partnerBTasks, 12)

      const total = a + b
      const aPct = Math.round((a / Math.max(1, total)) * 100)
      const bPct = 100 - aPct
      const isFair = Math.abs(aPct - bPct) <= 15

      return [
        res('Workload Equity', isFair ? 'Balanced Partnership' : 'Unequal Mental Load', isFair ? 'good' : 'warn', `${aPct}% vs ${bPct}% distribution`),
        res('Partner A Ownership', `${a} domains (${aPct}%)`, 'info', 'Full CPE ownership'),
        res('Partner B Ownership', `${b} domains (${bPct}%)`, 'info', 'Full CPE ownership'),
        res('Fair Play Rule', 'Ownership means Conception + Planning + Execution', 'good', 'No nagging or delegating small steps'),
      ]
    },
  },
  {
    id: 'family-chore-assignment',
    name: 'Family Chore Assignment',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Assign age-appropriate chores for toddlers, elementary kids, preteens, and teenagers.',
    tip: 'Preschoolers (ages 3-5) love wiping baseboards and sorting laundry socks; start chore habits early.',
    usage: [
      'Select child age group.',
      'Check recommended age-appropriate chores and daily time expectations.',
    ],
    method: [
      'Maps developmental motor skills to appropriate household contributions.',
    ],
    fields: [
      sel('ageGroup', 'Child Age Category', [
        'Ages 3-5 (Preschool: Put away toys, sort socks, wipe spills ~10 min)',
        'Ages 6-8 (Early Elementary: Unload dishwasher silverware, feed pet, make bed ~15 min)',
        'Ages 9-11 (Pre-Teen: Take out trash, sweep kitchen, vacuum living room ~25 min)',
        'Ages 12-16 (Teen: Clean bathroom, wash dinner dishes, do personal laundry ~35 min)',
      ], 'Ages 6-8 (Early Elementary: Unload dishwasher silverware, feed pet, make bed ~15 min)'),
    ],
    compute: (v) => {
      const ag = asSel(v.ageGroup)

      return [
        res('Age Group Selected', ag.split('(')[0].trim(), 'good', 'Developmentally matched chores'),
        res('Core Chores', ag.split(':')[1]?.split('~')[0].trim() || 'Daily family contribution', 'info', 'Builds responsibility & life skills'),
        res('Daily Expectation', ag.split('~')[1]?.replace(')', '').trim() || '15-20 minutes', 'good', 'Keeps chore time quick and achievable'),
        res('Parent Coaching Tip', 'Praise effort and consistency, not perfection', 'neutral', 'Avoid re-doing their work in front of them'),
      ]
    },
  },
  {
    id: 'chore-points-calculator',
    name: 'Chore Points Calculator',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Assign point values to household tasks based on effort, difficulty, and frequency for a gamified chore system.',
    tip: 'Assigning higher point values to unpopular chores (like cleaning the cat litter) naturally motivates completion.',
    usage: [
      'Enter points earned across daily quick chores, medium chores, and heavy weekend deep-cleans.',
      'Check total weekly points and reward tier unlocked.',
    ],
    method: [
      'Points = (Quick Chores * 5) + (Medium Chores * 15) + (Deep Chores * 30).',
    ],
    fields: [
      n('quickChores', 'Quick Daily Chores (5 pts each: Make bed, feed pet)', { def: 14, min: 0, max: 50, step: 1 }),
      n('mediumChores', 'Medium Chores (15 pts each: Empty dishwasher, vacuum)', { def: 5, min: 0, max: 20, step: 1 }),
      n('deepChores', 'Deep Chores (30 pts each: Wash car, mow lawn, clean bath)', { def: 2, min: 0, max: 10, step: 1 }),
    ],
    compute: (v) => {
      const q = asNum(v.quickChores, 14)
      const m = asNum(v.mediumChores, 5)
      const d = asNum(v.deepChores, 2)

      const totalPoints = (q * 5) + (m * 15) + (d * 30)
      let tier = 'Bronze Level'
      if (totalPoints >= 200) tier = 'Gold Champion Tier'
      else if (totalPoints >= 120) tier = 'Silver Achiever Tier'

      return [
        res('Total Weekly Points', `${totalPoints} points`, 'good', tier),
        res('Daily Habits Share', `${q * 5} pts`, 'info', `${q} quick chores`),
        res('Heavy Lifting Share', `${d * 30} pts`, 'good', `${d} deep cleaning tasks`),
        res('Reward Eligibility', totalPoints >= 120 ? 'Qualifies for weekend reward privilege' : 'Keep completing chores to reach Silver tier (120 pts)', 'neutral', 'Redeem for screen time or allowance'),
      ]
    },
  },
  {
    id: 'kids-chore-reward-planner',
    name: 'Kids Chore Reward Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Convert earned chore points into weekly pocket money allowance or screen time gaming privileges.',
    tip: 'Distinguish between citizen chores (unpaid expected contributions) and optional bonus chores for earning money.',
    usage: [
      'Enter total weekly chore points earned.',
      'Enter cash allowance conversion rate ($ per point) or screen minutes per point.',
      'Check weekly payout and bonus rewards.',
    ],
    method: [
      'Allowance = Points * Conversion Rate.',
    ],
    fields: [
      n('pointsEarned', 'Weekly Chore Points Earned', { def: 140, min: 0, max: 500, step: 5 }),
      n('centsPerPoint', 'Reward Value per Point (Cents)', { def: 8, min: 1, max: 50, step: 1 }),
      ck('requireSavings', 'Mandatory 20% savings / charity allocation rule', true),
    ],
    compute: (v) => {
      const pts = asNum(v.pointsEarned, 140)
      const cents = asNum(v.centsPerPoint, 8)
      const savRule = v.requireSavings

      const totalCash = (pts * cents) / 100
      const savings = savRule ? totalCash * 0.20 : 0
      const spendCash = totalCash - savings

      return [
        res('Weekly Earnings', money(totalCash), 'good', `${pts} points @ ${cents}¢/pt`),
        res('Spendable Cash', money(spendCash), 'good', 'Available for immediate discretionary spending'),
        res('Piggy Bank Savings', money(savings), 'info', savRule ? '20% long-term savings fund' : 'Zero saved'),
        res('Financial Literacy Lesson', 'Teach Give / Save / Spend jars', 'good', 'Builds lifelong money management skills'),
      ]
    },
  },
  {
    id: 'family-meal-schedule',
    name: 'Family Meal Schedule',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Map Monday through Sunday dinner themes (Taco Tuesday, Slow Cooker Wednesday, Pizza Friday) for stress-free meal prep.',
    tip: 'Assigning fixed theme nights reduces meal planning decision fatigue by 80% every week.',
    usage: [
      'Review classic weekly family dinner theme template.',
      'Check ingredient prep overlap and batch-cooking efficiency.',
    ],
    method: [
      'Categorizes 7-day culinary rotation for balanced nutrition and prep ease.',
    ],
    fields: [
      sel('themeMonday', 'Monday Theme', ['Meatless Pasta / Bowls', 'Sheet Pan Chicken & Veggies', 'Slow Cooker Stew'], 'Meatless Pasta / Bowls'),
      sel('themeTuesday', 'Tuesday Theme', ['Taco / Fajita Night', 'Enchiladas', 'Grain Bowl Salad'], 'Taco / Fajita Night'),
      sel('themeFriday', 'Friday Theme', ['Homemade Pizza & Movie Night', 'Burgers & Fries', 'Takeout Support Local'], 'Homemade Pizza & Movie Night'),
    ],
    compute: (v) => {
      const mon = asSel(v.themeMonday)
      const tue = asSel(v.themeTuesday)
      const fri = asSel(v.themeFriday)

      return [
        res('Weekly Theme Anchor', `${mon.split(' ')[0]} / ${tue.split(' ')[0]} / ${fri.split(' ')[0]}`, 'good', 'Predictable family favorites'),
        res('Batch Cooking Opportunity', 'Cook double rice on Tuesday for Thursday stir fry', 'info', 'Cuts cook time in half'),
        res('Kid Engagement', 'Assign kids to assemble their own taco / pizza toppings', 'good', 'Reduces picky eating resistance'),
        res('Prep Ahead Tip', 'Chop Sunday veggies into sealed glass containers', 'neutral', '20-minute weeknight dinners'),
      ]
    },
  },
  {
    id: 'family-activity-planner',
    name: 'Family Activity Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Plan low-cost weekend family outings across nature hikes, museum free days, bike rides, and board game nights.',
    tip: 'Check your local public library for free community museum and state park pass loans.',
    usage: [
      'Select activity category (Outdoor nature, Cultural/Educational, Home cozy, Sports).',
      'Enter planned activity budget.',
      'Check packing supplies and outing duration.',
    ],
    method: [
      'Curates activity logistics based on family outing dynamics.',
    ],
    fields: [
      sel('activityCategory', 'Activity Style', [
        'Outdoor Nature Hike & Picnic (Free / Low Cost)',
        'Local Museum / Zoo Visit ($30 - $80)',
        'Family Bike Ride & Ice Cream Stop ($15 - $25)',
        'Indoor Board Game & Hot Cocoa Tournament (Home Free)',
      ], 'Outdoor Nature Hike & Picnic (Free / Low Cost)'),
      n('budget', 'Allocated Outing Budget ($)', { def: 20, min: 0, max: 200, step: 5 }),
    ],
    compute: (v) => {
      const cat = asSel(v.activityCategory)
      const b = asNum(v.budget, 20)

      return [
        res('Selected Outing', cat.split('(')[0].trim(), 'good', 'Quality family bonding'),
        res('Outing Budget Target', money(b), 'info', 'Snacks, entry, and treats'),
        res('Packing Essentials', 'Water bottles, first aid band-aids, wet wipes, protein snacks', 'good', 'Prevents mid-outing meltdowns'),
        res('Memory Tip', 'Take one group selfie and put phones away for the rest of the trip', 'neutral', '100% engaged presence'),
      ]
    },
  },
  {
    id: 'family-event-planner',
    name: 'Family Event Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Coordinate logistics, invitations, catering portions, and itineraries for family reunions and anniversary parties.',
    tip: 'Plan 1 pound of total cooked food (protein + sides) per adult guest at large family gatherings.',
    usage: [
      'Enter total guest headcount (adults + children).',
      'Select venue type (Backyard BBQ, Rented park pavilion, Restaurant hall).',
      'Check food quantities, beverage gallons, and seating requirements.',
    ],
    method: [
      'Calculates food, drink, and ice quantities based on standard catering formulas.',
    ],
    fields: [
      n('headcount', 'Total Attending Guests', { def: 28, min: 5, max: 150, step: 1 }),
      n('durationHours', 'Event Duration (Hours)', { def: 4, min: 1, max: 10, step: 0.5 }),
    ],
    compute: (v) => {
      const count = asNum(v.headcount, 28)
      const hours = asNum(v.durationHours, 4)

      const foodLbs = Math.round(count * 1.1)
      const drinksPerPerson = hours * 1.25
      const totalDrinks = Math.ceil(count * drinksPerPerson)
      const iceLbs = count * 1.5 // 1.5 lb ice per person

      return [
        res('Total Food Needed', `~${foodLbs} lbs prepared food`, 'good', 'Proteins, starches, and salads combined'),
        res('Beverage Servings', `${totalDrinks} drinks`, 'info', `~${drinksPerPerson} drinks per person over ${hours} hrs`),
        res('Ice Requirement', `${Math.round(iceLbs)} lbs of ice`, 'good', `${Math.ceil(iceLbs / 20)} x 20-lb bags`),
        res('Trash & Recycling', `${Math.ceil(count / 15)} heavy-duty bins`, 'neutral', 'Station recycling next to trash'),
      ]
    },
  },
  {
    id: 'birthday-budget-planner',
    name: 'Birthday Budget Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Allocate birthday party funds across venue rental, cake/food, party favors, decor, and the birthday gift.',
    tip: 'Venue rentals and entertainment often eat up 60% of party budgets; host at a park or home to maximize fun per dollar.',
    usage: [
      'Enter total birthday target budget.',
      'View recommended category allocations across food, venue, decor, and gifts.',
    ],
    method: [
      'Budget breakdown: Food/Cake 35%, Venue/Activities 30%, Decor/Favors 15%, Birthday Gift 20%.',
    ],
    fields: [
      n('totalBudget', 'Total Birthday Budget ($)', { def: 350, min: 50, max: 3000, step: 25 }),
      n('guestCount', 'Expected Kid Guests', { def: 12, min: 2, max: 40, step: 1 }),
    ],
    compute: (v) => {
      const b = asNum(v.totalBudget, 350)
      const guests = asNum(v.guestCount, 12)

      const food = b * 0.35
      const venue = b * 0.30
      const decor = b * 0.15
      const gift = b * 0.20
      const costPerKid = b / guests

      return [
        res('Food & Birthday Cake', money(food), 'good', '35% of budget'),
        res('Venue & Entertainment', money(venue), 'info', `30% (~${money(costPerKid)}/guest)`),
        res('Birthday Gift Fund', money(gift), 'good', '20% allocated for special gift'),
        res('Decor & Goodie Bags', money(decor), 'neutral', `~${money(decor / guests)} per favor bag`),
      ]
    },
  },
  {
    id: 'birthday-guest-planner',
    name: 'Birthday Guest Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Manage birthday RSVP tracking, food allergy restrictions, and parent chaperone headcounts.',
    tip: 'The classic etiquette rule for kids parties: invite the child\'s age + 1 (e.g., 6 guests for a 5-year-old).',
    usage: [
      'Enter invitations sent and RSVPs confirmed.',
      'Enter expected adult chaperones.',
      'Check final confirmed headcount and cake sheet size needed.',
    ],
    method: [
      'Calculates confirmed attendees and cake slice requirements.',
    ],
    fields: [
      n('invitesSent', 'Total Invitations Sent', { def: 16, min: 2, max: 50, step: 1 }),
      n('confirmedKids', 'Confirmed Kid RSVPs', { def: 11, min: 0, max: 50, step: 1 }),
      n('adultChaperones', 'Attending Parents / Adults', { def: 6, min: 0, max: 30, step: 1 }),
    ],
    compute: (v) => {
      const sent = asNum(v.invitesSent, 16)
      const kids = asNum(v.confirmedKids, 11)
      const adults = asNum(v.adultChaperones, 6)

      const totalMouths = kids + adults
      const rsvpRate = Math.round((kids / sent) * 100)

      return [
        res('Total Confirmed Headcount', `${totalMouths} people`, 'good', `${kids} kids + ${adults} adults`),
        res('RSVP Response Rate', pct(rsvpRate), rsvpRate >= 70 ? 'good' : 'warn', `${sent - kids} awaiting reply`),
        res('Cake Size Required', totalMouths <= 15 ? '9-inch Round Cake' : totalMouths <= 28 ? 'Quarter Sheet Cake (24 slices)' : 'Half Sheet Cake (48 slices)', 'info', 'Ensure slice for every guest'),
        res('Dietary Caution', 'Ask parents about nut, dairy, or gluten allergies in advance', 'warn', 'Have allergy-safe alternative cupcakes'),
      ]
    },
  },
  {
    id: 'party-planning-checklist',
    name: 'Party Planning Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Timeline checklist counting down from 4 weeks prior to party day covering invites, cake, games, and thank-yous.',
    tip: 'Send party invitations exactly 3 to 4 weeks prior; any earlier gets forgotten, any later causes scheduling conflicts.',
    usage: [
      'Follow the chronological 4-week countdown.',
      'Check off invitations, menu confirmation, party games, and favor bags.',
      'Track party readiness percentage.',
    ],
    method: [
      'Timeline checklist across 4 weeks, 2 weeks, 2 days, and party morning.',
    ],
    fields: [
      ck('invitesSent4Wk', '4 Weeks Out: Sent digital or paper invitations with clear RSVP date', true),
      ck('themeBooked2Wk', '2 Weeks Out: Reserved venue/entertainment and planned party games', true),
      ck('suppliesBought1Wk', '1 Week Out: Purchased paper plates, napkins, candles, and favors', false),
      ck('foodConfirmed2Day', '2 Days Out: Ordered cake and finalized grocery food prep list', false),
      ck('partyMorningReady', 'Party Morning: Prepped food trays, charged camera, and hung balloons', false),
    ],
    compute: (v) => {
      const tasks = [
        v.invitesSent4Wk,
        v.themeBooked2Wk,
        v.suppliesBought1Wk,
        v.foodConfirmed2Day,
        v.partyMorningReady,
      ]
      const count = tasks.filter(Boolean).length
      const score = Math.round((count / tasks.length) * 100)

      return [
        res('Party Readiness', `${score}% Ready`, score >= 75 ? 'good' : 'warn', `${count} of ${tasks.length} milestones complete`),
        res('Next Priority', !v.invitesSent4Wk ? 'Send Invitations ASAP' : !v.themeBooked2Wk ? 'Book Venue & Plan Games' : !v.suppliesBought1Wk ? 'Buy Plates & Favors' : 'Finalize Cake & Grocery Prep', 'neutral', 'Stay ahead of the clock'),
        res('Game Length Rule', 'Plan 3-4 structured games of 10-15 minutes each', 'good', 'Avoid running games too long'),
        res('Thank-You Notes', 'Send digital photo thank-yous within 1 week after', 'info', 'Express gratitude for gifts'),
      ]
    },
  },
  {
    id: 'family-travel-checklist',
    name: 'Family Travel Checklist',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Pre-departure master checklist covering travel documents, medicine bags, chargers, and house security prep.',
    tip: 'Take photos of all family passports and boarding passes on your phone in case physical documents are lost.',
    usage: [
      'Work through travel departure checkpoints.',
      'Check off passports, prescription meds, travel insurance, and house prep.',
    ],
    method: [
      'Validates all essential departure logistics.',
    ],
    fields: [
      ck('passportsValid', 'Passports valid for at least 6 months past return travel date', true),
      ck('prescriptionsPacked', 'Packed 3 extra days of all critical medications in carry-on bag', true),
      ck('chargersPacked', 'Packed portable battery power bank and device charging cables', true),
      ck('houseSecured', 'Locked all windows/doors, paused mail, and set thermostat to eco mode', false),
      ck('snackBagReady', 'Kid distraction bag: Coloring books, headphones, non-melting snacks', false),
    ],
    compute: (v) => {
      const items = [
        v.passportsValid,
        v.prescriptionsPacked,
        v.chargersPacked,
        v.houseSecured,
        v.snackBagReady,
      ]
      const done = items.filter(Boolean).length
      const score = Math.round((done / items.length) * 100)

      return [
        res('Travel Readiness', `${score}% Ready`, score >= 80 ? 'good' : 'warn', `${done} of ${items.length} checks passing`),
        res('Medication Rule', v.prescriptionsPacked ? 'Medications in Carry-On' : 'NEVER PACK MEDS IN CHECKED BAGS', v.prescriptionsPacked ? 'good' : 'bad', 'Checked luggage can be lost/delayed'),
        res('Home Security', v.houseSecured ? 'Home Secured' : 'Lock doors, set alarm & pause mail', v.houseSecured ? 'good' : 'warn', 'Prevents burglary & frozen pipes'),
        res('Flight Comfort', v.snackBagReady ? 'Kid Bag Ready' : 'Pack headphones & gum/lollipops for ear pressure', 'info', 'Smooth flight experience'),
      ]
    },
  },
  {
    id: 'family-packing-list',
    name: 'Family Packing List',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate exact clothing items required per person based on trip duration (days) and laundry availability.',
    tip: 'Pack 1 extra outfit per child under age 8 above the number of trip days to cover juice spills and mud puddles.',
    usage: [
      'Enter trip duration in days.',
      'Select laundry access (Hotel coin laundry / Airbnb washer vs No laundry).',
      'Check recommended shirts, underwear, and pants per family member.',
    ],
    method: [
      'With laundry: Pack for 5 days max. Without laundry: Days + 1 outfits.',
    ],
    fields: [
      n('tripDays', 'Trip Duration (Days)', { def: 7, min: 1, max: 30, step: 1 }),
      sel('laundryAccess', 'Laundry Facility at Destination', [
        'No Laundry Access (Pack for full trip duration)',
        'Washer / Dryer Available (Pack for 4-5 days and wash mid-trip)',
      ], 'No Laundry Access (Pack for full trip duration)'),
      n('familySize', 'Family Members Traveling', { def: 4, min: 1, max: 10, step: 1 }),
    ],
    compute: (v) => {
      const days = asNum(v.tripDays, 7)
      const lnd = asSel(v.laundryAccess)
      const people = asNum(v.familySize, 4)

      const packDays = lnd.includes('Washer') ? Math.min(5, days) : days
      const shirtsPerPerson = packDays + 1
      const underwearPerPerson = packDays + 2
      const pantsPerPerson = Math.ceil(packDays * 0.6)

      return [
        res('Outfits per Person', `${shirtsPerPerson} shirts / ${underwearPerPerson} underwear`, 'good', `${pantsPerPerson} pants/shorts each`),
        res('Laundry Strategy', lnd.includes('Washer') ? 'Wash 1 load mid-trip (Cuts luggage by 50%)' : 'Pack full allotment', 'info', `${days}-day trip`),
        res('Total Family Outfits', `${shirtsPerPerson * people} total shirts`, 'neutral', `${people} travelers`),
        res('Packing Cube Tip', 'Assign 1 color packing cube to each family member', 'good', 'Unpack in 30 seconds'),
      ]
    },
  },
  {
    id: 'school-routine-planner',
    name: 'School Routine Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate morning wake-up alarm times backwards from school bell time to ensure unhurried, calm arrivals.',
    tip: 'Lay out clothes and pack backpacks the night before to eliminate 75% of morning departure stress.',
    usage: [
      'Enter school start / first bell time.',
      'Enter commute driving/bus time in minutes.',
      'Enter morning get-ready duration (breakfast, dressing, teeth).',
      'Check recommended wake-up alarm time.',
    ],
    method: [
      'Wake Time = Bell Time - (Commute Mins + Buffer Mins + Getting Ready Mins).',
    ],
    fields: [
      n('schoolBellMinutes', 'School First Bell Time (e.g. 8:00 AM = 480 mins)', { def: 480, min: 420, max: 540, step: 5 }),
      n('commuteMinutes', 'Commute Driving / Bus Transit Time (Minutes)', { def: 20, min: 5, max: 60, step: 5 }),
      n('prepMinutes', 'Morning Dressing & Breakfast Time (Minutes)', { def: 45, min: 20, max: 90, step: 5 }),
      n('bufferMinutes', 'Departure Buffer Cushion (Minutes)', { def: 15, min: 5, max: 30, step: 5 }),
    ],
    compute: (v) => {
      const bell = asNum(v.schoolBellMinutes, 480)
      const com = asNum(v.commuteMinutes, 20)
      const prep = asNum(v.prepMinutes, 45)
      const buf = asNum(v.bufferMinutes, 15)

      const totalLeadTime = com + prep + buf
      const wakeMins = bell - totalLeadTime

      const wakeHr = Math.floor(wakeMins / 60)
      const wakeMin = wakeMins % 60
      const wakeStr = `${wakeHr}:${wakeMin < 10 ? '0' : ''}${wakeMin} AM`

      const leaveMins = bell - (com + buf)
      const leaveHr = Math.floor(leaveMins / 60)
      const leaveMin = leaveMins % 60
      const leaveStr = `${leaveHr}:${leaveMin < 10 ? '0' : ''}${leaveMin} AM`

      return [
        res('Wake-Up Alarm Time', wakeStr, 'good', `${totalLeadTime} minutes before bell`),
        res('Out-the-Door Departure', leaveStr, 'warn', 'Guarantees on-time arrival'),
        res('Transit + Buffer', `${com + buf} minutes`, 'info', `${buf} min traffic buffer included`),
        res('Night-Before Rule', 'Backpacks zipped and by front door by 8:30 PM', 'good', 'Zero morning search panic'),
      ]
    },
  },
  {
    id: 'family-morning-routine',
    name: 'Family Morning Routine',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Chronological morning milestone tracker covering waking, protein breakfast, hygiene, and out-the-door checklists.',
    tip: 'A high-protein breakfast (eggs, Greek yogurt) prevents mid-morning energy crashes in school classrooms.',
    usage: [
      'Review morning milestone sequence.',
      'Check off bed making, hygiene, breakfast, and backpack checks.',
    ],
    method: [
      'Validates morning family readiness milestones.',
    ],
    fields: [
      ck('wakeHydrate', '6:30 AM: Wake up promptly & drink a tall glass of water', true),
      ck('getDressed', '6:45 AM: Dressed in clothes laid out night before', true),
      ck('proteinBreakfast', '7:00 AM: Nourishing breakfast with protein & fruit', true),
      ck('teethHair', '7:20 AM: Teeth brushed 2 minutes & hair styled', false),
      ck('lunchBackpack', '7:30 AM: Lunchboxes & water bottles packed in backpacks', false),
    ],
    compute: (v) => {
      const items = [
        v.wakeHydrate,
        v.getDressed,
        v.proteinBreakfast,
        v.teethHair,
        v.lunchBackpack,
      ]
      const count = items.filter(Boolean).length

      return [
        res('Morning Flow Status', `${count} of 5 milestones checked`, count >= 4 ? 'good' : 'warn', 'Calm morning rhythm'),
        res('Critical Chokepoint', !v.lunchBackpack ? 'Pack lunches night before' : 'Lunches ready', v.lunchBackpack ? 'good' : 'info', 'Packing lunches in morning is #1 delay cause'),
        res('Screen Ban', 'Keep screens/TV off until out the door', 'good', 'Prevents transition meltdowns'),
        res('Parent Mindset', 'Calm parents create calm children', 'neutral', 'Take 3 deep breaths before nudging kids'),
      ]
    },
  },
  {
    id: 'family-evening-routine',
    name: 'Family Evening Routine',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Design a tranquil evening wind-down routine covering homework check, screen shutdown, reading, and lights out.',
    tip: 'Shutting off all blue-light screens 60 minutes before bed allows melatonin production to surge naturally.',
    usage: [
      'Select children\'s target bedtime.',
      'Check countdown milestones for dinner, homework, screen shutdown, and bedtime stories.',
    ],
    method: [
      'Maps bedtime wind-down steps from target sleep hour.',
    ],
    fields: [
      sel('targetBedtime', 'Kids Target Bedtime', [
        '7:30 PM (Ages 3-5 ~11-13 hrs sleep)',
        '8:00 PM (Ages 6-8 ~10-11 hrs sleep)',
        '8:30 PM (Ages 9-11 ~9-11 hrs sleep)',
        '9:30 PM (Teens ~8-10 hrs sleep)',
      ], '8:00 PM (Ages 6-8 ~10-11 hrs sleep)'),
      ck('screensOffHourPrior', 'All screens and tablets powered down 60 minutes before bed', true),
    ],
    compute: (v) => {
      const bt = asSel(v.targetBedtime)
      const screenOff = v.screensOffHourPrior

      return [
        res('Target Bedtime', bt.split('(')[0].trim(), 'good', bt.split('(')[1]?.replace(')', '') || 'Healthy sleep'),
        res('Screen Shutdown Time', bt.includes('8:00') ? '7:00 PM sharp' : '60 minutes before lights out', screenOff ? 'good' : 'warn', 'Blue light blocks melatonin'),
        res('Bath & Reading Block', 'Warm bath + 20 minutes shared reading', 'good', 'Lowers core body temperature for sleep'),
        res('Bedroom Environment', 'Cool (66°F-68°F), dark, and quiet with white noise', 'neutral', 'Optimizes REM sleep quality'),
      ]
    },
  },
  {
    id: 'kids-daily-routine-planner',
    name: 'Kids Daily Routine Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Build a printable visual daily routine chart for toddlers and elementary children with pictures and check-boxes.',
    tip: 'Visual routine charts give young children a sense of autonomy and eliminate repetitive parental nagging.',
    usage: [
      'Select routine phase (Morning, After-School, Bedtime).',
      'Check recommended milestone sequence for visual charts.',
    ],
    method: [
      'Structures visual step sequences for early childhood autonomy.',
    ],
    fields: [
      sel('routinePhase', 'Routine Phase', [
        'Morning Routine (Wake, Potty, Dress, Eat, Teeth, Shoes)',
        'After-School Routine (Shoes off, Wash hands, Snack, Homework, Unpack)',
        'Bedtime Routine (Bath, Pajamas, Teeth, Stories, Hugs, Lights Out)',
      ], 'Morning Routine (Wake, Potty, Dress, Eat, Teeth, Shoes)'),
    ],
    compute: (v) => {
      const rp = asSel(v.routinePhase)

      return [
        res('Visual Chart Phase', rp.split('(')[0].trim(), 'good', 'Display at child eye level'),
        res('Routine Steps', rp.split('(')[1]?.replace(')', '') || 'Sequential routine', 'info', 'Use icons or photos of child completing task'),
        res('Reward Token', 'Move magnet or clip upon completing each step', 'good', 'Engaging interactive feedback'),
        res('Consistency Benefit', 'Reduces power struggles by making the chart the "boss"', 'neutral', 'Builds independent executive function'),
      ]
    },
  },
  {
    id: 'screen-time-planner',
    name: 'Screen Time Planner',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Calculate recommended screen time limits based on AAP (American Academy of Pediatrics) pediatric age guidelines.',
    tip: 'The AAP recommends under 1 hour/day of high-quality programming for ages 2-5, and consistent limits for older kids.',
    usage: [
      'Select child age group.',
      'Enter current daily screen time hours.',
      'Check AAP recommended limit and healthy replacement activities.',
    ],
    method: [
      'Applies American Academy of Pediatrics digital media guidelines.',
    ],
    fields: [
      sel('childAge', 'Child Age Group', [
        'Under 18 Months (Zero screens except video chatting)',
        'Ages 2 to 5 Years (Max 1 hour / day high quality)',
        'Ages 6 to 12 Years (Consistent 1 to 1.5 hours / day)',
        'Teens 13+ (Max 2 hours non-homework recreation)',
      ], 'Ages 6 to 12 Years (Consistent 1 to 1.5 hours / day)'),
      n('currentScreenHours', 'Current Daily Recreational Screen Time (Hours)', { def: 2.5, min: 0, max: 10, step: 0.5 }),
    ],
    compute: (v) => {
      const age = asSel(v.childAge)
      const cur = asNum(v.currentScreenHours, 2.5)

      let limit = 1.0
      if (age.includes('Under 18')) limit = 0
      else if (age.includes('6 to 12')) limit = 1.5
      else if (age.includes('Teens')) limit = 2.0

      const excess = Math.max(0, cur - limit)
      const isExcessive = excess > 0

      return [
        res('AAP Recommended Limit', `${limit} hours/day`, 'good', age.split('(')[0].trim()),
        res('Current Usage Assessment', isExcessive ? `+${numD(excess, 1)} hrs over recommendation` : 'Within Healthy Guidelines', isExcessive ? 'warn' : 'good', `${cur} hours reported`),
        res('Screen-Free Zones', 'Bedrooms and dinner tables must be 100% screen-free', 'bad', 'Charge phones in kitchen overnight'),
        res('Replacement Activity', 'Encourage outdoor free play, sports, reading, or lego building', 'info', 'Essential for motor and social skills'),
      ]
    },
  },
  {
    id: 'family-screen-time-tracker',
    name: 'Family Screen Time Tracker',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Track family members\' recreational device hours and schedule collective "Screen-Free Sunday" digital detoxes.',
    tip: 'Parental modeling is the #1 predictor of kids\' screen habits; if parents are on phones, kids demand devices.',
    usage: [
      'Enter weekly recreational hours for parents and kids.',
      'Check collective family screen load and schedule a digital detox day.',
    ],
    method: [
      'Calculates cumulative weekly screen hours and percentage of waking life.',
    ],
    fields: [
      n('kidHoursWeekly', 'Average Weekly Screen Hours per Child', { def: 18, min: 0, max: 70, step: 1 }),
      n('parentHoursWeekly', 'Average Weekly Recreational Screen Hours per Parent', { def: 22, min: 0, max: 70, step: 1 }),
    ],
    compute: (v) => {
      const kid = asNum(v.kidHoursWeekly, 18)
      const parent = asNum(v.parentHoursWeekly, 22)

      const kidDaily = kid / 7
      const parentDaily = parent / 7
      const wakingHoursWeekly = 105 // ~15 hrs awake/day * 7

      return [
        res('Kids Daily Average', `${numD(kidDaily, 1)} hrs/day`, kidDaily > 2 ? 'warn' : 'good', `${kid} hrs/week`),
        res('Parents Daily Average', `${numD(parentDaily, 1)} hrs/day`, parentDaily > 2.5 ? 'warn' : 'good', `${parent} hrs/week`),
        res('Waking Life Consumed', `${Math.round((kid / wakingHoursWeekly) * 100)}% of child's waking hours`, 'info', 'Excludes school hours'),
        res('Family Detox Challenge', 'Try "Screen-Free Sundays" (No gaming or tablets)', 'good', 'Replaces digital dopamine with real connection'),
      ]
    },
  },
  {
    id: 'family-emergency-contact-sheet',
    name: 'Family Emergency Contact Sheet',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Create a laminated emergency card with pediatrician, poison control, trusted neighbors, and utility emergency numbers.',
    tip: 'Designate an out-of-state relative as your family emergency contact; local cell circuits often jam during regional disasters.',
    usage: [
      'Enter pediatrician name and phone.',
      'Enter out-of-state emergency contact.',
      'Enter trusted nearby neighbor with house key.',
      'Generate emergency contact card for refrigerator and kids\' backpacks.',
    ],
    method: [
      'Formats standard FEMA family emergency communications card.',
    ],
    fields: [
      txt('pediatricianPhone', 'Pediatrician Name & Phone', 'Dr. Miller (555-0144)'),
      txt('poisonControl', 'Poison Control Hotline', '1-800-222-1222 (National US)'),
      txt('outOfStateContact', 'Out-of-State Emergency Relative', 'Aunt Sarah (Dallas, TX - 555-0988)'),
      txt('trustedNeighbor', 'Trusted Local Neighbor (Has Key)', 'Bob & Linda (Next door - 555-0112)'),
    ],
    compute: (v) => {
      const ped = asStr(v.pediatricianPhone, 'Pediatrician')
      const poison = asStr(v.poisonControl, '1-800-222-1222')
      const oos = asStr(v.outOfStateContact, 'Out of state relative')
      const neigh = asStr(v.trustedNeighbor, 'Neighbor')

      return [
        res('Pediatrician', ped, 'good', 'Primary child medical care'),
        res('Poison Control', poison, 'bad', 'Post directly on refrigerator'),
        res('Out-of-State Check-In', oos, 'info', 'Central check-in if local cell towers fail'),
        res('Keyholder Neighbor', neigh, 'good', 'Authorized for emergency home entry'),
      ]
    },
  },
  {
    id: 'family-document-organizer',
    name: 'Family Document Organizer',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'Catalog birth certificates, social security cards, passports, insurance policies, and wills in a fireproof safe.',
    tip: 'Store vital family identity documents in a fireproof, waterproof grab-and-go safe near your primary exit.',
    usage: [
      'Audit essential family vital records.',
      'Check off birth certificates, social security cards, vehicle titles, and estate documents.',
      'Check document readiness score.',
    ],
    method: [
      'Scores completeness across 5 categories of vital family records.',
    ],
    fields: [
      ck('birthCerts', 'Original government birth certificates for all family members', true),
      ck('ssnCards', 'Official Social Security Cards / Tax ID cards in safe', true),
      ck('passportsCurrent', 'Valid passports with at least 6 months expiration buffer', true),
      ck('willsEstatePlan', 'Signed Will, Healthcare Power of Attorney & Guardianship papers', false),
      ck('fireproofSafe', 'All physical documents housed in UL-rated fireproof / waterproof safe', false),
    ],
    compute: (v) => {
      const items = [
        v.birthCerts,
        v.ssnCards,
        v.passportsCurrent,
        v.willsEstatePlan,
        v.fireproofSafe,
      ]
      const count = items.filter(Boolean).length
      const score = Math.round((count / items.length) * 100)

      return [
        res('Document Readiness', `${score}% Organized`, score >= 80 ? 'good' : 'warn', `${count} of ${items.length} records verified`),
        res('Estate & Guardianship', v.willsEstatePlan ? 'Legally Documented' : 'CRITICAL: Formalize will & child guardianship', v.willsEstatePlan ? 'good' : 'bad', 'Ensures custody protection for children'),
        res('Fireproof Protection', v.fireproofSafe ? 'Protected Safe' : 'Acquire UL 30-min fire safe', v.fireproofSafe ? 'good' : 'warn', 'Prevents destruction in house fires'),
        res('Digital Backup Tip', 'Scan encrypted PDF copies to password-protected cloud drive', 'info', 'Accessible worldwide from phone'),
      ]
    },
  },
  {
    id: 'household-responsibility-matrix',
    name: 'Household Responsibility Matrix',
    sub: SUB,
    subId: SUB_ID,
    blurb: 'RACI matrix (Responsible, Accountable, Consulted, Informed) for household operations, finances, and parenting.',
    tip: 'When both partners think the other is taking out the trash, the trash never goes out; assign ONE single Accountable person.',
    usage: [
      'Assign single accountability for Meal Planning, Bill Pay, Trash/Recycling, and Car Maintenance.',
      'Check clarity rating and eliminate duplicated or orphaned chores.',
    ],
    method: [
      'Applies organizational RACI framework to household operations.',
    ],
    fields: [
      sel('accountableMeals', 'Meal Planning & Groceries', ['Partner A', 'Partner B', 'Alternating Weeks'], 'Partner A'),
      sel('accountableBills', 'Bill Pay & Financial Tracking', ['Partner A', 'Partner B', 'Joint Monthly Meeting'], 'Partner B'),
      sel('accountableMaintenance', 'Home Maintenance & Repair Calls', ['Partner A', 'Partner B', 'Equal Split'], 'Partner A'),
      sel('accountableKidsSchedule', 'School Calendar & Kid Extracurriculars', ['Partner A', 'Partner B', 'Shared'], 'Partner B'),
    ],
    compute: (v) => {
      const m = asSel(v.accountableMeals)
      const b = asSel(v.accountableBills)
      const rep = asSel(v.accountableMaintenance)
      const kid = asSel(v.accountableKidsSchedule)

      return [
        res('Groceries & Cooking', m, 'good', 'Primary accountable owner'),
        res('Household Finances', b, 'good', 'Primary accountable owner'),
        res('Home Maintenance', rep, 'info', 'Repairs & contractor oversight'),
        res('School Coordination', kid, 'info', 'Permission slips & activities'),
      ]
    },
  },
]
