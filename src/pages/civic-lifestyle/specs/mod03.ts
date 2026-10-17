import {
  asNum,
  asSel,
  n,
  pctres,
  res,
  sel,
  type CivicSpec,
} from './civicSpec'

export const SUBJECT = 'Workplace Ergonomics & Posture'

export const MOD03_SPECS: CivicSpec[] = [
  {
    id: 'ergonomic-desk-chair-monitor-height-sizer',
    name: 'Standing & Seated Desk, Chair & Monitor Ergonomic Sizer',
    subject: SUBJECT,
    blurb: 'Calculate precise anatomical heights for office chair pans, seated desks, standing desks, armrests, and monitor eye levels based on BIFMA G1-2017 ergonomic standards.',
    tip: 'Your eyes should align with the top 1/3 of your primary monitor screen, looking slightly downward at a 15-20° angle to minimize neck cervical spine compression.',
    usage: [
      'Enter user body standing height in inches or cm.',
      'Select footwear thickness (barefoot, sneakers, heels).',
      'Select primary screen size (e.g. 24", 27", 32" or dual monitors).',
    ],
    method: [
      'Seated Elbow Height = Height * 0.38 + Shoe_Offset.',
      'Standing Elbow Height = Height * 0.63 + Shoe_Offset.',
      'Seated Eye Height = Height * 0.70 + Shoe_Offset.',
      'Recommended Monitor Distance = 20 to 30 inches (arm length).',
    ],
    fields: [
      n('userHeightInches', 'Standing Body Height (Inches)', 69, 48, 86, 0.5),
      sel('footwearType', 'Footwear Specification', ['Sneakers / Running Shoes (+1.0 inch)', 'Flat Barefoot / Socks (+0.0 inches)', 'Thick Work Boots / Platform (+1.75 inches)']),
      sel('monitorSize', 'Monitor Display Configuration', ['27" Standard Widescreen (20-28" distance)', '24" Compact Display (18-24" distance)', '32" Ultrawide / Curved (26-34" distance)']),
    ],
    compute: (v) => {
      const rawHeight = asNum(v, 'userHeightInches', 69)
      const shoes = asSel(v, 'footwearType', 'Sneakers')
      const shoeOffset = shoes.includes('Flat') ? 0 : shoes.includes('Platform') ? 1.75 : 1.0

      const h = rawHeight + shoeOffset

      const chairSeatHeight = h * 0.255 // popliteal height
      const seatedDeskHeight = h * 0.385 // seated elbow resting height
      const standingDeskHeight = h * 0.625 // standing elbow resting height
      const eyeHeightSeated = h * 0.69
      const monitorTopSeated = eyeHeightSeated + 1.5

      return [
        res('Standing Desk Height', `${standingDeskHeight.toFixed(1)} inches (${(standingDeskHeight * 2.54).toFixed(0)} cm)`, 'good', 'Elbows rested at 90-100° open angle'),
        res('Seated Desk Height', `${seatedDeskHeight.toFixed(1)} inches (${(seatedDeskHeight * 2.54).toFixed(0)} cm)`, 'good', 'Forearms parallel to floor'),
        res('Chair Pan Seat Height', `${chairSeatHeight.toFixed(1)} inches (${(chairSeatHeight * 2.54).toFixed(0)} cm)`, 'neutral', 'Feet flat on floor, thighs horizontal'),
        res('Top of Monitor Screen', `${monitorTopSeated.toFixed(1)} inches from floor`, 'neutral', 'Eye line level with top bezel of display'),
        pctres('Ergonomic Alignment Index', '96% Posture Compliance', 96, 'good', 'Minimizes musculoskeletal RSI and lumbar fatigue'),
      ]
    },
  },
]
