import { ck, days, doc as docRes, dt, hours, money, moneyC, mx, mxd, n, num, numD, pct, ratio, res, sel, T, txt } from '../archetypes/spec'
import type { OfficeToolSpec } from '../archetypes/spec'

function erlangB(A: number, C: number): number {
  let e = 1
  for (let i = 1; i <= C; i++) e = (A * e) / (A * e + i)
  return e
}

export const specs: OfficeToolSpec[] = [
  // ---------------- Infrastructure & Network ----------------
  {
    id: 'network-bandwidth-usage-per-user-estimator',
    archetype: 'est',
    blurb: 'Estimates peak network demand by scaling per-user bandwidth against concurrency at busy hour.',
    fields: [n('a', 'Total users', { def: 200 }), n('b', 'Avg Mbps per user at peak', { def: 4 }), n('c', 'Peak concurrency rate %', { def: 40 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number
      const agg = a * b * (c / 100)
      const peak = agg * 1.25
      return [
        res('Peak aggregate demand', `${num(agg, 1)} Mbps`, T.neutral),
        res('Link to provision', `${num(Math.ceil(peak), 0)} Mbps`, T.good, 'Includes 25% headroom for protocol overhead and bursts.'),
        res('Per-user sustained share', `${numD(agg / Math.max(1, a), 2)} Mbps`, T.neutral),
        res('Concurrency exposure', pct(c, 0), c > 70 ? T.bad : c > 50 ? T.warn : T.good, 'Above 70% concurrency the WAN link is typically oversubscribed.'),
      ]
    },
  },
  {
    id: 'server-rack-space-u-height-calculator',
    archetype: 'est',
    blurb: 'Plans rack footprint by summing server, switch and PDU units against a rack\u2019s U capacity.',
    fields: [n('a', 'Rack size (U)', { def: 42 }), n('b', 'Servers to place', { def: 14 }), n('c', 'U per server', { def: 2 }), n('d', 'U for switches / PDU', { def: 6 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const used = b * c + d
      const util = (used / a) * 100
      const left = a - used
      return [
        res('Used rack units', `${num(used, 0)} U`, util <= 90 ? T.good : T.warn),
        res('Rack utilization', pct(Math.min(100, util), 0), util > 90 ? T.bad : util > 75 ? T.warn : T.good, 'Keep at or below 90% for airflow and cable slack.'),
        res('Remaining units', `${num(Math.max(0, left), 0)} U`, left > 0 ? T.good : T.bad),
        res('Fits current plan', used <= a ? 'Yes — within capacity' : `Over by ${num(left * -1, 0)} U`, used <= a ? T.good : T.bad),
      ]
    },
  },
  {
    id: 'uninterruptible-power-supply-ups-runtime-calculator',
    archetype: 'est',
    blurb: 'Turns battery kWh and connected load into runtime minutes for UPS sizing and load balancing.',
    fields: [n('a', 'Battery capacity (kWh)', { min: 0.5 }), n('b', 'Connected load (kW)', { min: 0.1 }), n('c', 'Load power factor', { def: 0.95, min: 0.5, max: 1, step: 0.05 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number
      const usable = a * c
      const run = usable / b
      const loadShare = (b / a) * 100
      return [
        res('Estimated runtime', `${numD(run, 1)} hr`, run >= 0.5 ? T.good : T.bad, 'At full connected load.'),
        res('Usable capacity', `${numD(usable, 2)} kWh`, T.neutral, 'Capacity derated by the load power factor.'),
        res('Load share of rated', pct(Math.min(150, loadShare), 0), loadShare <= 80 ? T.good : loadShare <= 100 ? T.warn : T.bad, 'Above 80% of rating runtime margins collapse quickly.'),
        res('UPS class to consider', `Double-conversion online for ${num(b, 1)} kW`, T.neutral, 'Online UPS suits server/DC loads; line-interactive covers office gear.'),
      ]
    },
  },
  {
    id: 'data-center-power-usage-effectiveness-pue-calculator',
    archetype: 'index',
    blurb: 'Measures data center efficiency by contrasting total facility energy against what IT equipment consumes.',
    fields: [n('a', 'Total facility energy (kWh)', { def: 1200 }), n('b', 'IT equipment energy (kWh)', { def: 920 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number
      const pue = b > 0 ? a / b : 0
      const eff = pue > 0 ? (1 / pue) * 100 : 0
      return [
        res('IT efficiency', pct(eff, 1), eff >= 80 ? T.good : eff >= 68 ? T.warn : T.bad, 'Share of total energy that reaches the IT load.'),
        res('PUE ratio', pue > 0 ? ratio(pue, 2) : '\u2014', pue <= 1.3 ? T.good : pue <= 1.7 ? T.warn : T.bad, '1.0-1.3 is best-in-class; 1.5-1.7 typical; over 2.0 means inefficient cooling.'),
        res('Overhead energy', pct(b > 0 ? ((a - b) / a) * 100 : 0, 1), T.neutral, 'Everything above the IT load: cooling, conversion, lights.'),
      ]
    },
  },
  {
    id: 'raid-array-capacity-and-redundancy-calculator',
    archetype: 'est',
    blurb: 'Compares usable capacity, parity overhead and fault tolerance across RAID levels.',
    fields: [n('a', 'Drive size (TB)', { def: 4 }), n('b', 'Number of drives', { def: 6 }), sel('r', 'RAID level', ['RAID 0', 'RAID 1', 'RAID 5', 'RAID 6', 'RAID 10'])],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, lv = v.r as string
      let usable = 0, ft = 0, min = 2
      if (lv === 'RAID 0') { usable = b * a }
      else if (lv === 'RAID 1') { usable = a; ft = 1 }
      else if (lv === 'RAID 5') { usable = (b - 1) * a; ft = 1; min = 3 }
      else if (lv === 'RAID 6') { usable = (b - 2) * a; ft = 2; min = 4 }
      else { usable = (b * a) / 2; ft = 1; min = 4 }
      const parity = b * a - usable
      const ok = b >= min
      return [
        res('Usable capacity', `${num(Math.max(0, usable), 1)} TB`, ok ? T.good : T.bad, 'After parity or mirroring overhead.'),
        res('Parity / mirror overhead', `${num(Math.max(0, parity), 1)} TB`, T.neutral),
        res('Fault tolerance', `${ft} drive${ft === 1 ? '' : 's'}`, ft >= 1 ? T.good : T.bad, 'Drives you can lose without data loss.'),
        res('Feasible with this drive count', ok ? `Yes — meets ${min}-drive minimum` : `No — needs ${min} drives`, ok ? T.good : T.bad),
      ]
    },
  },
  {
    id: 'ip-address-subnet-allocation-planner',
    archetype: 'est',
    blurb: 'Finds the smallest subnet prefix that fits a host count with growth buffer, and how it packs.',
    fields: [n('a', 'End hosts to fit', { def: 80 }), n('b', 'Growth buffer %', { def: 50 }), sel('p', 'Current planning prefix', ['/16', '/20', '/24', '/26', '/28', '/30'])],
    compute: (v) => {
      const need = Math.ceil((v.a as number) * (1 + (v.b as number) / 100)) + 2
      let p = 32
      for (let i = 8; i <= 32; i++) {
        if (2 ** (32 - i) - 2 >= need) { p = i; break }
      }
      const chosen = 2 ** (32 - p) - 2
      const cp = parseInt((v.p as string).replace('/', ''), 10)
      const pool = 2 ** (32 - cp) - 2
      const utilization = chosen > 0 ? (need / chosen) * 100 : 100
      const packs = Math.floor(pool / (chosen + 2))
      return [
        res('Required prefix', `/${p}`, T.good, 'Smallest /N that satisfies the adjusted host count.'),
        res('Hosts available', `${num(chosen, 0)}`, T.neutral, 'Usable hosts excluding network and broadcast.'),
        res('Requested vs available', pct(utilization, 0), utilization <= 80 ? T.good : utilization <= 95 ? T.warn : T.bad, 'Keep at least 20% headroom for DHCP reservations.'),
        res(`Packs of /${p} inside ${v.p as string}`, `${num(Math.max(0, packs), 0)} subnets`, packs >= 1 ? T.good : T.bad, 'How many of the chosen prefix fit in the planning block.'),
      ]
    },
  },
  {
    id: 'network-port-security-assignment-matrix',
    archetype: 'matrix',
    blurb: 'Assigns authorized MAC counts and violation policies to switch port zones for a coherent security posture.',
    fields: [mx('m', 'Port security carving', ['Port / zone', 'Authorized hosts', 'Policy code'], ['User edge', 'Server farm', 'Management', 'Guest / IoT', 'DC core'])],
    compute: (v) => {
      const M = v.m as number[][]
      const auth = M.reduce((s, r) => s + (r[0] || 0), 0)
      const avg = auth / M.length
      const codes = M.map((r) => Math.max(0, Math.min(2, Math.round(r[1] || 0))))
      const distinct = new Set(codes).size
      const pc = M.length ? Math.round(codes.reduce((s, c) => s + c, 0) / M.length) : 0
      const pol = ['Shutdown', 'Restrict', 'Protect'][pc]
      return [
        res('Total authorized hosts', num(auth, 0), T.neutral),
        res('Average per zone', num(avg, 1), T.neutral),
        res('Default violation action', pol, pc === 0 ? T.bad : pc === 1 ? T.warn : T.good, '0 = shutdown, 1 = restrict, 2 = protect.'),
        res('Policy consistency', distinct === 1 ? 'Uniform across zones' : `${distinct} policies mixed`, distinct === 1 ? T.good : T.warn, 'Mixed actions make incident response unpredictable.'),
      ]
    },
  },
  {
    id: 'datacenter-cooling-load-calculator',
    archetype: 'est',
    blurb: 'Estimates sensible cooling load for a server room from IT power, floor area and supply temperature.',
    fields: [n('a', 'Room area (sq ft)', { def: 2000 }), n('b', 'IT load (kW)', { def: 60 }), n('c', 'Target supply temp (°F)', { def: 68 }), n('d', 'Ambient return (worst case °F)', { def: 85 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const sens = a * 1.6
      const itLoad = b * 3412
      const total = sens + itLoad
      const tons = total / 12000
      const cfm = b * 160
      const delta = Math.max(1, d - c)
      const needed = b / 3.5
      return [
        res('Total cooling load', `${num(total, 0)} BTU/h`, T.neutral, 'Sensible heat from envelope plus IT equipment at ~3412 BTU per kW.'),
        res('Cooling capacity', `${numD(tons, 1)} tons`, tons >= needed ? T.good : T.bad, `Unit economics: ~${numD(needed, 1)} tons of CRAC for this IT load.`),
        res('Airflow needed', `${num(cfm, 0)} CFM`, T.neutral, 'Roughly 160 CFM per kW of IT load.'),
        res('Delta-T', `${num(delta, 0)}°F`, delta >= 15 ? T.good : T.warn, 'A >15°F delta-T means healthy cooling; a low delta hints at recirculation.'),
      ]
    },
  },
  {
    id: 'voip-sip-trunk-channel-estimator',
    archetype: 'est',
    blurb: 'Solves the Erlang-B blocking formula to size SIP trunk channels for a busy-hour call load.',
    fields: [n('a', 'Busy-hour call attempts (BHCA)', { def: 400 }), n('b', 'Avg call duration (min)', { def: 3 }), n('c', 'Blocking target (P)', { def: 0.01, step: 0.005 }), n('d', 'Current channels provisioned', { def: 25 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const erl = a * (b / 60)
      let ch = 1
      let pb = 1
      for (let i = 1; i <= 512; i++) {
        const blk = erlangB(erl, i)
        if (blk <= c) { ch = i; pb = blk; break }
        if (i === 512) { ch = i; pb = blk }
      }
      const add = Math.max(0, ch - d)
      return [
        res('Traffic load', `${numD(erl, 2)} Erlangs`, T.neutral, 'Busy-hour offered load at the average call duration.'),
        res('Channels required', num(ch, 0), T.good, 'Solved via Erlang-B at the selected grade of service.'),
        res('Blocking at that count', `${numD(pb * 100, 3)}%`, pb <= c ? T.good : T.warn),
        res('Channels to add', num(add, 0), add === 0 ? T.good : T.warn),
        res('Trunk utilization', pct((erl / ch) * 100, 1), T.neutral),
      ]
    },
  },
  {
    id: 'active-directory-organizational-unit-ou-planner',
    archetype: 'fmt',
    blurb: 'Generates a copy-paste AD OU tree with per-OU children scaled to the depth you choose.',
    fields: [txt('c', 'Organization / domain name'), sel('d', 'Structure depth', ['Flat', 'Two-level', 'Three-level']), ck('u', 'Top-level OUs', ['Users', 'Computers', 'Groups', 'Servers', 'Service accounts', 'Policies', 'Externals'])],
    compute: (v) => {
      const org = ((v.c as string) || '').trim().replace(/\s+/g, '-') || 'Contoso'
      const depth = v.d as string
      const selArr = v.u as boolean[]
      const names = ['Users', 'Computers', 'Groups', 'Servers', 'Service accounts', 'Policies', 'Externals']
      const CHILD: Record<string, string[]> = {
        'Users': ['Sales', 'Engineering', 'Finance', 'Operations'],
        'Computers': ['Workstations', 'Laptops', 'Kiosks'],
        'Groups': ['Security groups', 'Distribution lists'],
        'Servers': ['File & print', 'Application', 'Database'],
        'Service accounts': ['gMSA', 'Legacy locals'],
        'Policies': ['Linked GPOs', 'Delegation zones'],
        'Externals': ['Contractors', 'Partners'],
      }
      const SUB: Record<string, string[]> = {
        'Sales': ['Revenue ops', 'Field sales'],
        'Engineering': ['Dev', 'QA', 'Infra'],
        'Finance': ['Controllership', 'Treasury'],
        'Operations': ['Facilities', 'IT ops'],
      }
      let chosen = 0
      let leaves = 0
      let doc = `AO TREE \u2014 ${org}\n\nROOT: ${org}\n`
      names.forEach((nm, i) => {
        if (!selArr[i]) return
        chosen++
        doc += `  \u251C\u2500 ${nm}\n`
        if (depth !== 'Flat') {
          const kids = CHILD[nm] ?? []
          kids.forEach((k) => {
            leaves++
            doc += `    \u251C\u2500 ${k}\n`
            if (depth === 'Three-level') {
              const subs = SUB[k] ?? []
              subs.forEach((s) => {
                leaves++
                doc += `      \u251C\u2500 ${s}\n`
              })
            }
          })
        }
      })
      return [
        res('OU coverage', `${chosen}/7 selected`, chosen >= 5 ? T.good : chosen >= 3 ? T.warn : T.bad, 'Group objects by function, then by geography or business unit.'),
        res('Leaf OUs generated', num(leaves, 0), T.neutral),
        docRes('OU structure', doc),
      ]
    },
  },
  {
    id: 'network-switch-power-over-ethernet-poe-budget',
    archetype: 'est',
    blurb: 'Checks whether a switch\u2019s PoE budget covers the devices wired into it, per port standard.',
    fields: [n('a', 'Switch PoE budget (W)', { def: 370 }), n('b', 'Active PoE ports', { def: 24 }), n('c', 'Avg per-device draw (W)', { def: 15.4 }), sel('s', 'PoE standard', ['PoE (15.4 W max)', 'PoE+ (30 W max)', 'PoE++ (60 W max)'])],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, s = v.s as string
      const stdW = s.includes('30') ? 30 : s.includes('60') ? 60 : 15.4
      const req = b * c
      const util = (req / a) * 100
      const spare = a - req
      const per = req / Math.max(1, b)
      return [
        res('Required PoE budget', `${num(req, 0)} W`, util <= 100 ? T.good : T.bad),
        res('Budget utilization', pct(Math.min(100, util), 1), util > 100 ? T.bad : util > 85 ? T.warn : T.good, 'Keep under 85% for power renegotiation and bursts.'),
        res('Headroom', `${num(Math.max(0, spare), 0)} W`, T.neutral),
        res('Per-port power', `${numD(per, 1)} W`, per <= stdW ? T.good : T.warn, `Standard cap is ${num(stdW, 0)} W/port.`),
      ]
    },
  },
  {
    id: 'wi-fi-access-point-coverage-density-estimator',
    archetype: 'est',
    blurb: 'Determines how many access points are needed, whether coverage- or capacity-constrained.',
    fields: [n('a', 'Coverage area (sq ft)', { def: 15000 }), n('b', 'Estimated concurrent users', { def: 120 }), n('c', 'Users per AP', { def: 45 }), n('d', 'AP effective radius (ft)', { def: 55 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const apArea = Math.PI * d * d * 0.75
      const byArea = Math.ceil(a / apArea)
      const byUsers = Math.ceil(b / c)
      const ap = Math.max(byArea, byUsers)
      return [
        res('APs by coverage', num(byArea, 0), T.neutral, 'Footprint-based with ~75% cell efficiency.'),
        res('APs by user density', num(byUsers, 0), T.neutral, 'Capacity sizing against per-AP concurrent users.'),
        res('Recommended AP count', num(ap, 0), T.good),
        res('Design driver', byArea >= byUsers ? 'Coverage-limited' : 'Capacity-limited', T.neutral, 'Capacity-limited sites usually need more APs and channel planning.'),
      ]
    },
  },
  {
    id: 'datacenter-floor-load-weight-estimator',
    archetype: 'est',
    blurb: 'Verifies a data center floor slab can carry loaded rack rows under its rating.',
    fields: [n('a', 'Loaded rack weight (lbs)', { def: 2200 }), n('b', 'Racks per contiguous row', { def: 6 }), n('c', 'Row floor footprint (sq ft)', { def: 72 }), n('d', 'Floor load rating (lb/sq ft)', { def: 250 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const load = (a * b) / c
      const pctOfRated = (load / d) * 100
      return [
        res('Floor load', `${num(load, 0)} lb/sq ft`, load <= d ? T.good : T.bad),
        res('vs rated capacity', pct(pctOfRated, 0), pctOfRated <= 80 ? T.good : pctOfRated <= 100 ? T.warn : T.bad, 'Stay below 100% of the structural rating.'),
        res('Row total weight', `${num(a * b, 0)} lbs`, T.neutral),
        res('Remaining margin', `${num(Math.max(0, d - load), 0)} lb/sq ft`, load <= d ? T.good : T.bad),
      ]
    },
  },
  {
    id: 'network-fiber-optic-attenuation-estimator',
    archetype: 'est',
    blurb: 'Sums fiber attenuation budget for distance, connectors and splices and compares to the 10G power budget.',
    fields: [n('a', 'Link distance (km)', { def: 2 }), sel('s', 'Fiber type', ['Single-mode OS2 (0.4 dB/km)', 'Multi-mode OM3 (3.0 dB/km)', 'Multi-mode OM4 (2.5 dB/km)']), n('c', 'Connector pairs', { def: 4 }), n('d', 'Splices', { def: 2 })],
    compute: (v) => {
      const a = v.a as number, c = v.c as number, d = v.d as number, s = v.s as string
      const attPerKm = s.includes('OS2') ? 0.4 : s.includes('OM3') ? 3.0 : 2.5
      const link = a * attPerKm
      const conn = c * 0.75
      const spliceLoss = d * 0.1
      const total = link + conn + spliceLoss
      const budget = s.includes('OS2') ? 16 : 8
      const margin = budget - total
      return [
        res('Total link loss', `${numD(total, 2)} dB`, total <= budget ? T.good : T.bad),
        res('10G power budget', `${num(budget, 0)} dB`, T.neutral, '16 dB for single-mode LR, 8 dB for multi-mode SR.'),
        res('Loss budget margin', `${numD(margin, 2)} dB`, margin >= 3 ? T.good : T.warn, 'Keep at least 3 dB of margin for aging connectors and splices.'),
        res('Per-km attenuation', `${numD(attPerKm, 2)} dB/km`, T.neutral),
      ]
    },
  },
  {
    id: 'server-virtualization-consolidation-ratio',
    archetype: 'est',
    blurb: 'Measures how many physical hosts a virtualized estate can retire while keeping failure headroom.',
    fields: [n('a', 'Physical hosts today', { def: 60 }), n('b', 'VMs per host target', { def: 20 }), n('c', 'Current VMs', { def: 500 }), n('d', 'Host headroom %', { def: 20 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const density = c / Math.max(1, a)
      const cap = b * (1 - d / 100)
      const hosts = Math.ceil(c / cap)
      const saved = Math.max(0, a - hosts)
      const newDensity = c / Math.max(1, hosts)
      return [
        res('Current density', `${numD(density, 1)} VM/host`, T.neutral),
        res('Hosts needed (with headroom)', num(hosts, 0), hosts <= a ? T.good : T.warn),
        res('Hosts retired', num(saved, 0), saved > 0 ? T.good : T.bad, 'Power, rack U and cooling savings scale with this number.'),
        res('Target consolidation ratio', `${numD(newDensity, 1)} VM/host`, T.good),
      ]
    },
  },
  // ---------------- Cybersecurity ----------------
  {
    id: 'zero-trust-access-architecture-scorer',
    archetype: 'scorecard',
    blurb: 'Scores the five Zero Trust pillars with your own weights against a chosen maturity framework.',
    fields: [mxd('m', 'Zero Trust pillars', ['Pillar', 'Weight %', 'Score /10'], ['Identity', 'Devices', 'Network', 'Applications', 'Data'], [[30, 6], [20, 7], [15, 5], [20, 8], [15, 6]]), sel('f', 'Framework', ['CISA ZTMM', 'NIST SP 800-207', 'Google BeyondCorp'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Identity', 'Devices', 'Network', 'Applications', 'Data']
      const w = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const wScore = (M.reduce((s, r) => s + (r[0] || 0) * (r[1] || 0), 0) / w) * 10
      const minI = M.reduce((bi, r, i) => ((r[1] || 0) < (M[bi][1] || 0) ? i : bi), 0)
      return [
        res('Zero Trust maturity', `${num(wScore, 0)}/100`, wScore >= 80 ? T.good : wScore >= 60 ? T.warn : T.bad, 'Scores below 60 mean foundational gaps in identity and devices.'),
        res('Weakest pillar', labels[minI], T.warn, `At ${num(M[minI][1] || 0, 0)}/10 vs ${numD(wScore / 10, 1)}/10 average.`),
        res('Weights covered', pct(Math.min(100, w), 0), Math.abs(w - 100) <= 1 ? T.good : T.warn, 'Weights should total 100%.'),
        res('Framework applied', v.f as string, T.neutral),
      ]
    },
  },
  {
    id: 'internal-api-rate-limiting-estimator',
    archetype: 'est',
    blurb: 'Sizes global and burst rate limits from user counts and request patterns to protect internal APIs.',
    fields: [n('a', 'Users', { def: 10000 }), n('b', 'Requests per user per day', { def: 120 }), n('c', 'Peak burst factor', { def: 5 }), n('d', 'Sustained hour share', { def: 0.12 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const daily = a * b
      const perSec = daily / 86400
      const burst = perSec * c
      const rps = (daily / 3600) * d
      return [
        res('Daily request volume', num(daily, 0), T.neutral),
        res('Avg sustained RPS', num(perSec, 1), T.neutral),
        res('Busy-hour RPS', num(rps, 0), T.neutral, 'Carried during the \"loudest\" hour of the day.'),
        res('Burst RPS', num(burst, 0), T.warn, 'Rate limits must sit above this to avoid false denials.'),
        res('Recommended global limit', `${num(Math.ceil(burst * 1.2), 0)} RPS`, T.good, '20% margin above worst-case burst.'),
      ]
    },
  },
  {
    id: 'ssl-tls-certificate-expiration-alert-planner',
    archetype: 'tracker',
    blurb: 'Works back from a certificate expiry date to set alert and renewal-submission triggers.',
    fields: [dt('d', 'Certificate expiry date'), n('n', 'Alert lead time (days)', { def: 45 }), sel('s', 'Certificate type', ['Public (external CA)', 'Private CA', 'Self-signed internal'])],
    compute: (v) => {
      const iso = (v.d as string) || '2026-01-01'
      const lead = Math.max(0, Math.round(v.n as number))
      const s = v.s as string
      const exp = new Date(iso + 'T00:00:00')
      const alert = new Date(exp.getTime() - lead * 864e5)
      const renew = new Date(exp.getTime() - 14 * 864e5)
      const fmt = (dt: Date) => dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      return [
        res('Certificate type', s, T.neutral),
        res('Expiry', fmt(exp), T.neutral),
        res('Alert date (trigger)', fmt(alert), T.warn, 'Renew by this date to stay inside the lead window.'),
        res('Recommended submit date', fmt(renew), T.good, 'Assumes roughly 14 days of CA processing.'),
        res('Lead window', `${num(lead, 0)} days`, lead >= 30 ? T.good : T.warn, 'Industry norm is 30-90 days for public certificates.'),
      ]
    },
  },
  {
    id: 'password-policy-complexity-matrix-builder',
    archetype: 'matrix',
    blurb: 'Weights password policy controls to compute a complexity index and surface the weakest control.',
    fields: [mx('m', 'Policy controls', ['Weight %', 'Strictness /10'], ['Length (12+)', 'Character classes', 'Rotation (90d)', 'Reuse history', 'MFA tie-in'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Length (12+)', 'Character classes', 'Rotation (90d)', 'Reuse history', 'MFA tie-in']
      const w = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const score = M.reduce((s, r) => s + (r[0] || 0) * (r[1] || 0), 0) / w
      const weak = M.reduce((bi, r, i) => ((r[1] || 0) < (M[bi][1] || 0) ? i : bi), 0)
      return [
        res('Complexity index', `${numD(score, 1)}/10`, score >= 8 ? T.good : score >= 6 ? T.warn : T.bad, 'NIST now favors length and MFA over forced rotation.'),
        res('Weakest control', labels[weak], T.warn, 'Target the lowest score first; it usually dominates risk.'),
        res('Coverage', pct(score * 10, 0), score >= 8 ? T.good : score >= 6 ? T.warn : T.bad),
        res('Controls profiled', `${M.length}`, T.neutral),
      ]
    },
  },
  {
    id: 'multi-factor-authentication-mfa-rollout-tracker',
    archetype: 'tracker',
    blurb: 'Projects MFA enrollment completion from a start date, fleet size and daily enrollment rate.',
    fields: [dt('d', 'Rollout start date'), n('u', 'Total target users', { def: 500 }), n('p', 'Users enrolled day 1', { def: 50 }), n('r', 'Daily enrollment capacity', { def: 40 })],
    compute: (v) => {
      const start = (v.d as string) || '2026-01-05'
      const total = Math.max(1, Math.round(v.u as number))
      const day1 = Math.min(total, Math.round(v.p as number))
      const cap = Math.max(1, Math.round(v.r as number))
      const remaining = total - day1
      const daysNeeded = Math.ceil(remaining / cap)
      const end = new Date(start + 'T00:00:00')
      end.setDate(end.getDate() + daysNeeded)
      const cohort = 7
      return [
        res('Users still to enroll', num(remaining, 0), T.neutral),
        res('Rollout duration', days(daysNeeded), T.good, 'Linear pace at the stated daily capacity.'),
        res('Enrollment pace', `${num(cap, 0)} users/day`, T.neutral),
        res('Expected completion', end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), T.good, `${cohort} days sets the pace for weekly cohort checkpoints.`),
        res('Day-1 adoption', pct((day1 / total) * 100, 1), day1 / total > 0.1 ? T.good : T.warn, 'Low day-1 adoption usually means weak executive sponsorship.'),
      ]
    },
  },
  {
    id: 'phishing-simulation-campaign-scorecard',
    archetype: 'scorecard',
    blurb: 'Scores a phishing drill across targeting, phish rate, click behavior and reporting discipline.',
    fields: [mxd('m', 'Campaign metrics', ['Metric', 'Weight %', 'Score /10'], ['Message targeting', 'Phish rate', 'Click rate', 'Report rate', 'Repeat clickers'], [[20, 7], [20, 8], [25, 9], [20, 8], [15, 9]]), sel('b', 'Benchmark group', ['Industry average', 'Business-critical users', 'Board executives'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Message targeting', 'Phish rate', 'Click rate', 'Report rate', 'Repeat clickers']
      const w = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const wScore = (M.reduce((s, r) => s + (r[0] || 0) * (r[1] || 0), 0) / w) * 10
      const primary = M.reduce((bi, r, i) => ((r[0] || 0) > (M[bi][0] || 0) ? i : bi), 0)
      return [
        res('Phishing resistance', `${num(wScore, 0)}/100`, wScore >= 85 ? T.good : wScore >= 70 ? T.warn : T.bad, 'Higher is better: strong recognition and reporting behavior.'),
        res('Highest-weighted metric', labels[primary], T.neutral, 'Feed this back into campaign targeting.'),
        res('Benchmark group', v.b as string, T.neutral),
      ]
    },
  },
  {
    id: 'byod-bring-your-own-device-security-compliance-matrix',
    archetype: 'matrix',
    blurb: 'Compares each BYOD control\u2019s required coverage with the current coverage and ranks the gaps.',
    fields: [mx('m', 'BYOD controls', ['Required %', 'Current %'], ['Device encryption', 'MDM enrollment', 'OS patching', 'Remote wipe', 'App allowlist'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Device encryption', 'MDM enrollment', 'OS patching', 'Remote wipe', 'App allowlist']
      const avg = M.reduce((s, r) => s + Math.min(100, ((r[1] || 0) / Math.max(1, r[0] || 0)) * 100), 0) / Math.max(1, M.length)
      const worst = M.reduce((bi, r, i) => (((r[1] || 0) - (r[0] || 0)) < ((M[bi][1] || 0) - (M[bi][0] || 0)) ? i : bi), 0)
      const metCount = M.filter((r) => (r[1] || 0) >= (r[0] || 0)).length
      const worstGap = Math.max(0, ((M[worst][0] || 0) - (M[worst][1] || 0)) / Math.max(1, M[worst][0] || 0)) * 100
      return [
        res('Overall compliance', pct(avg, 1), avg >= 95 ? T.good : avg >= 80 ? T.warn : T.bad),
        res('Widest gap', labels[worst], T.bad, `${pct(worstGap, 0)} behind target coverage.`),
        res('Controls at or over target', `${metCount}/${M.length}`, metCount === M.length ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'vulnerability-assessment-risk-priority-calculator',
    archetype: 'matrix',
    blurb: 'Prioritizes vulnerabilities by blending CVSS, exploitability and asset criticality into a risk index.',
    fields: [mx('m', 'Vulnerabilities', ['CVSS score', 'Exploitability', 'Asset criticality'], ['Login portal', 'Legacy API', 'VPN concentrator', 'Backup console', 'Client endpoints'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Login portal', 'Legacy API', 'VPN concentrator', 'Backup console', 'Client endpoints']
      const risk = M.map((r) => ((r[0] || 0) + (r[1] || 0) + (r[2] || 0)) / 3)
      const avg = risk.reduce((s, x) => s + x, 0) / Math.max(1, M.length)
      const top = risk.indexOf(Math.max(...risk))
      const high = risk.filter((x) => x >= 7).length
      const tier = risk[top] >= 9 ? 'Critical' : risk[top] >= 7 ? 'High' : risk[top] >= 4 ? 'Medium' : 'Low'
      const sla = tier === 'Critical' ? 'Patch within 7 days (PSIRT escalate)' : tier === 'High' ? 'Patch within 30 days' : tier === 'Medium' ? 'Bundle with next release' : 'Track / accept'
      return [
        res('Highest-priority asset', labels[top], tier !== 'Low' ? T.bad : T.good, `${tier} severity with an average risk index of ${numD(risk[top], 1)}/10.`),
        res('Average risk index', `${numD(avg, 1)}/10`, avg >= 7 ? T.bad : avg >= 4 ? T.warn : T.good),
        res('Critical or high items', num(high, 0), high === 0 ? T.good : T.warn),
        res('Suggested SLA', sla, T.neutral),
      ]
    },
  },
  {
    id: 'dns-propagation-time-estimator',
    archetype: 'est',
    blurb: 'Models how long a DNS change takes to propagate based on TTL planning and cache grids.',
    fields: [sel('t', 'Record type', ['A / AAAA', 'MX', 'TXT / SPF', 'CNAME']), n('a', 'Base TTL (seconds)', { def: 3600 }), n('n', 'TTL lowered before cutover', { def: 300 }), n('c', 'Regional cache grids', { def: 5 }), n('d', 'Old TTL held by resolvers (hr)', { def: 48 })],
    compute: (v) => {
      const ttlBase = Math.max(60, Math.round(v.a as number) || 3600)
      const lowered = Math.max(60, Math.round(v.n as number) || 300)
      const grids = Math.max(1, Math.round(v.c as number) || 5)
      const stale = Math.max(0.5, Math.round(v.d as number))
      const dnsswitch = Math.ceil(ttlBase / 60)
      const fastPath = grids * Math.ceil(lowered / 60)
      return [
        res('Normal-condition propagation', `${num(dnsswitch, 0)} min`, T.neutral, 'Full TTL must expire in every resolver before a change is authority.'),
        res('With lowered TTL', `${num(fastPath, 0)} min`, T.good, 'Lower the TTL a week before cutover for a fast, tidy flip.'),
        res('Stale resolver drain', `${num(stale, 0)} hr`, T.warn, 'Resolvers caching the old value beyond TTL cause split brain.'),
        res('Record type', v.t as string, T.neutral, 'Verify each record class separately: A, MX, TXT/SPF and CNAME.'),
      ]
    },
  },
  {
    id: 'vpn-gateway-tunnel-capacity-calculator',
    archetype: 'est',
    blurb: 'Sizes VPN gateway throughput and core count against concurrent tunnel users and per-user traffic.',
    fields: [n('a', 'Concurrent tunnel users', { def: 500 }), n('b', 'Avg throughput per user (Mbps)', { def: 2 }), n('c', 'Gateway throughput (Gbps)', { def: 1 }), n('d', 'Gateway CPU cores', { def: 8 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const tp = (a * b) / 1000
      const util = (tp / c) * 100
      const perCore = a / Math.max(1, d)
      const maxUsers = Math.floor((c / Math.max(0.1, b)) * 1000)
      return [
        res('Aggregate demand', `${numD(tp, 2)} Gbps`, tp <= c ? T.good : T.bad),
        res('Gateway utilization', pct(util, 0), util > 95 ? T.bad : util > 80 ? T.warn : T.good),
        res('Users per core', num(perCore, 0), perCore <= 200 ? T.good : T.warn, 'Roughly 200 SSL tunnels per core is a typical ceiling.'),
        res('Max solvable concurrency', num(maxUsers, 0), maxUsers >= a ? T.good : T.bad),
      ]
    },
  },
  {
    id: 'cyber-risk-insurance-coverage-estimator',
    archetype: 'est',
    blurb: 'Bridges breach exposure estimates to cyber insurance limits, premium bands and control discounts.',
    fields: [n('a', 'Revenue ($M)', { def: 500 }), n('b', 'Records of personal data (est)', { def: 2000000 }), n('c', 'Security budget ($k)', { def: 400 }), n('d', 'Incidents in past 2 yrs', { def: 1 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const raw = b * 1.5
      const limit = Math.min(raw, a * 1e6 * 0.25)
      const disc = Math.min(20, Math.round(c / 25))
      return [
        res('Estimated exposure', money(limit), T.neutral, 'Blended $1.50/record, capped at 25% of revenue.'),
        res('Suggested policy limit', money(limit), T.good),
        res('Premium band', `${money(limit * 0.03)} \u2013 ${money(limit * 0.06)}`, T.neutral, 'Typical 3-6% of limit for mid-market cyber policies.'),
        res('Control discount', `${num(disc, 0)}% off`, c >= 300 ? T.good : T.warn, 'Strong controls (MFA, backups, patching) justify a steeper discount.'),
        res('Claims history', d === 0 ? 'Clean — standard rating' : `${num(d, 0)} incident(s) — expect uplift or restrictions`, d === 0 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'data-anonymization-verification-matrix',
    archetype: 'matrix',
    blurb: 'Scores anonymization controls per data field on coverage, re-identification risk and retained utility.',
    fields: [mx('m', 'Fields', ['Anonymized? (1=yes)', 'Re-id risk /10', 'Utility retained /10'], ['Customer ID', 'Email', 'Phone', 'Address', 'Purchase history', 'Device tokens'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Customer ID', 'Email', 'Phone', 'Address', 'Purchase history', 'Device tokens']
      const yes = M.filter((r) => (r[0] || 0) >= 1).length
      const avgRisk = M.reduce((s, r) => s + (r[1] || 0), 0) / Math.max(1, M.length)
      const avgUtil = M.reduce((s, r) => s + (r[2] || 0), 0) / Math.max(1, M.length)
      const risky = labels.filter((_, i) => (M[i][1] || 0) >= 7 && (M[i][0] || 0) < 1)
      return [
        res('Fields anonymized', `${yes}/${M.length}`, yes === M.length ? T.good : T.warn),
        res('Avg re-identification risk', `${numD(avgRisk, 1)}/10`, avgRisk <= 3 ? T.good : avgRisk <= 6 ? T.warn : T.bad),
        res('Avg utility retained', `${numD(avgUtil, 1)}/10`, avgUtil >= 6 ? T.good : T.warn, 'Over-scrubbing destroys analytic value; weigh utility vs risk.'),
        res('Residual risky fields', risky.length ? risky.join(', ') : 'None', risky.length ? T.bad : T.good, 'High risk and unanonymized fields need a compensating control.'),
      ]
    },
  },
  {
    id: 'soc-2-type-ii-readiness-scorecard',
    archetype: 'scorecard',
    blurb: 'Scores the five trust services areas to judge SOC 2 Type II audit readiness.',
    fields: [mxd('m', 'Trust services areas', ['Area', 'Weight %', 'Score /10'], ['Security', 'Availability', 'Processing integrity', 'Confidentiality', 'Privacy'], [[40, 6], [15, 7], [15, 6], [15, 5], [15, 4]]), sel('e', 'Examiner type', ['CPA firm (attestation)', 'CMMC/C5 hybrid', 'Internal pre-assessment'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Security', 'Availability', 'Processing integrity', 'Confidentiality', 'Privacy']
      const w = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const wScore = (M.reduce((s, r) => s + (r[0] || 0) * (r[1] || 0), 0) / w) * 10
      const minI = M.reduce((bi, r, i) => ((r[1] || 0) < (M[bi][1] || 0) ? i : bi), 0)
      const weak = M.filter((r) => (r[1] || 0) < 7).length
      return [
        res('SOC 2 readiness', `${num(wScore, 0)}/100`, wScore >= 85 ? T.good : wScore >= 70 ? T.warn : T.bad, 'Type II needs controls designed AND operating effectively over 6-12 months.'),
        res('Weakest principle', labels[minI], T.warn, `Only ${num(M[minI][1] || 0, 0)}/10 \u2014 design evidence is thin here.`),
        res('Evidence gaps', `${weak} area(s) below 7/10`, weak === 0 ? T.good : T.warn),
        res('Examiner type', v.e as string, T.neutral),
      ]
    },
  },
  {
    id: 'shadow-it-discovery-audit-formatter',
    archetype: 'fmt',
    blurb: 'Turns a shadow IT scan into a category-by-category audit checklist with remediation guidance.',
    fields: [txt('o', 'Department / team'), sel('s', 'Scan scope', ['Network ingress', 'SaaS SSO logs', 'Endpoint inventory']), ck('f', 'Found categories', ['Collaboration', 'File sharing', 'Dev tools', 'CRM', 'Payment', 'Analytics'])],
    compute: (v) => {
      const dept = ((v.o as string) || '').trim() || 'Unnamed team'
      const scope = v.s as string
      const f = v.f as boolean[]
      const cats = ['Collaboration', 'File sharing', 'Dev tools', 'CRM', 'Payment', 'Analytics']
      const found = cats.filter((_, i) => f[i])
      let doc = `SHADOW IT DISCOVERY \u2014 ${dept.toUpperCase()}\n\nScan scope: ${scope}\n\nCategory checklist:\n`
      doc += cats.map((c) => `  [${found.includes(c) ? 'x' : ' '}] ${c}`).join('\n')
      doc += '\n\nRemediation: inventory each app, score business value vs risk, then allowlist or decommission via IT.'
      return [
        res('Categories discovered', `${found.length}/${cats.length}`, found.length >= 4 ? T.warn : found.length >= 1 ? T.warn : T.good, 'Each discovered category needs a named owner.'),
        res('Risk posture', found.length >= 4 ? 'High \u2014 expand SSO and DLP enforcement' : found.length ? 'Moderate \u2014 validate entitlements' : 'Clear \u2014 maintain scan cadence', found.length >= 4 ? T.bad : found.length ? T.warn : T.good),
        docRes('Audit formatter', doc),
      ]
    },
  },
  {
    id: 'cyber-security-awareness-training-scorer',
    archetype: 'scorecard',
    blurb: 'Scores security training behaviors to steer content and measure knowledge variance.',
    fields: [mxd('m', 'Awareness areas', ['Area', 'Weight %', 'Score /10'], ['Phishing recognition', 'Password hygiene', 'Social engineering', 'Data handling', 'Reporting behavior'], [[25, 7], [15, 8], [20, 6], [20, 7], [20, 9]]), sel('c', 'Campaign type', ['Annual refresher', 'Quarterly micro-training', 'New-hire onboarding'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Phishing recognition', 'Password hygiene', 'Social engineering', 'Data handling', 'Reporting behavior']
      const w = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const wScore = (M.reduce((s, r) => s + (r[0] || 0) * (r[1] || 0), 0) / w) * 10
      const scores = M.map((r) => r[1] || 0)
      const spread = Math.max(...scores) - Math.min(...scores)
      const minI = scores.indexOf(Math.min(...scores))
      return [
        res('Training maturity', `${num(wScore, 0)}/100`, wScore >= 80 ? T.good : wScore >= 65 ? T.warn : T.bad),
        res('Weakest behavior', labels[minI], T.warn, 'Highest-leverage topic for the next campaign.'),
        res('Knowledge variance', `${numD(spread, 1)} pt spread`, spread <= 2 ? T.good : T.warn, 'Large spread means pockets of high risk.'),
        res('Campaign type', v.c as string, T.neutral),
      ]
    },
  },
  {
    id: 'it-contractor-access-privilege-expiration-log',
    archetype: 'log',
    blurb: 'Logs contractor privilege classes with review cadence and risk to keep offboarding on schedule.',
    fields: [mx('m', 'Privilege classes', ['Review days', 'Risk /10'], ['Network access', 'SaaS entitlements', 'Badge / floor', 'VPN profiles', 'Admin consoles', 'Build & deploy'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Network access', 'SaaS entitlements', 'Badge / floor', 'VPN profiles', 'Admin consoles', 'Build & deploy']
      const avgRisk = M.reduce((s, r) => s + (r[1] || 0), 0) / Math.max(1, M.length)
      const avgDays = M.reduce((s, r) => s + (r[0] || 0), 0) / Math.max(1, M.length)
      const high = labels.filter((_, i) => (M[i][1] || 0) >= 8)
      const covered = M.filter((r) => (r[0] || 0) > 0).length
      return [
        res('Critical exposures', high.length ? high.join(', ') : 'None', high.length ? T.bad : T.good, 'Privileges rated 8+ need immediate review.'),
        res('Classes with a cadence', `${covered}/${M.length}`, covered === M.length ? T.good : T.warn),
        res('Avg review cadence', days(avgDays), avgDays <= 90 ? T.good : T.warn, 'Quarterly reviews are the norm for contractor access.'),
        res('Avg privilege risk', `${numD(avgRisk, 1)}/10`, avgRisk >= 7 ? T.bad : avgRisk >= 5 ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'saas-vendor-risk-security-checklist',
    archetype: 'checklist',
    blurb: 'Steps through the security assurances to demand from every SaaS vendor before onboarding.',
    fields: [ck('c', 'Vendor assurance items', ['SOC 2 report on file', 'Pen-test summary within 12 mo', 'MFA required for admins', 'Data residency meets policy', 'SSO/SCIM provisioned', 'Backup & exit plan defined', 'Subprocessors disclosed', 'Breach notification SLA'])],
    compute: (v) => {
      const items = (v.c as boolean[]) || []
      const done = items.filter(Boolean).length
      const total = items.length
      const pctDone = (done / total) * 100
      const criticalMiss = items.filter((x, i) => !x && i < 3).length
      return [
        res('Vendor assurance', pct(pctDone, 0), pctDone === 100 ? T.good : pctDone >= 75 ? T.warn : T.bad, 'All eight should land before production data moves.'),
        res('Critical gaps', `${criticalMiss} of the first 3 safety-critical items missing`, criticalMiss === 0 ? T.good : T.bad, 'SOC 2, pen test and MFA are non-negotiable.'),
        res('Open items', `${total - done} remaining`, T.neutral),
        res('Recommendation', pctDone === 100 ? 'Approved \u2014 add to the vendor register' : pctDone >= 75 ? 'Conditional approval with remediation dates' : 'Do not onboard until remediated', pctDone >= 75 ? T.warn : T.bad),
      ]
    },
  },
  {
    id: 'it-incident-severity-level-classifier',
    archetype: 'tier',
    blurb: 'Classifies an IT incident by blending impact scope, data sensitivity, availability loss and records involved.',
    fields: [sel('u', 'User impact', ['Single user', 'Department', 'Multiple regions', 'Company-wide']), sel('i', 'Data sensitivity', ['None', 'Internal', 'Confidential', 'Regulated PII']), sel('t', 'Availability loss', ['No outage', 'Minutes', 'Hours', 'Business days']), n('r', 'Confirmed breaches (records)', { def: 0 })],
    compute: (v) => {
      const u = v.u as string, i = v.i as string, t = v.t as string, r = Math.max(0, v.r as number)
      const impact = u === 'Single user' ? 1 : u === 'Department' ? 2 : u === 'Multiple regions' ? 3 : 5
      const sens = i === 'None' ? 0 : i === 'Internal' ? 1 : i === 'Confidential' ? 2 : 3
      const loss = t === 'No outage' ? 0 : t === 'Minutes' ? 1 : t === 'Hours' ? 2 : 3
      const breach = r >= 10000 ? 2 : r >= 1000 ? 1 : 0
      const sev = impact + sens + loss + breach
      const tier = sev >= 9 ? 'Critical' : sev >= 7 ? 'High' : sev >= 4 ? 'Medium' : 'Low'
      const sla = tier === 'Critical' ? 'Immediate bridge — escalate to executives' : tier === 'High' ? 'P1 bridge within 30 min' : tier === 'Medium' ? 'Standard queue with interim update' : 'End-of-day triage'
      return [
        res('Severity tier', tier, sev >= 9 ? T.bad : sev >= 7 ? T.warn : sev >= 4 ? T.warn : T.good, sla),
        res('Impact scope', u, T.neutral),
        res('Data sensitivity', i, sens >= 2 ? T.warn : T.neutral),
        res('Records involved', num(r, 0), r >= 1000 ? T.bad : r > 0 ? T.warn : T.neutral),
        res('Availability loss', t, T.neutral),
      ]
    },
  },
  // ---------------- IT Operations, Assets & Costs ----------------
  {
    id: 'it-asset-disposal-itad-security-certificate-builder',
    archetype: 'fmt',
    blurb: 'Builds a data destruction certificate documenting verified methods for retired IT assets.',
    fields: [txt('o', 'Organization'), txt('v', 'Vendor / facility'), ck('d', 'Destruction methods verified', ['Degaussing', 'Physical shredding', 'Pulverizing', 'Crypto erase']), n('n', 'Units processed', { def: 120 })],
    compute: (v) => {
      const org = ((v.o as string) || '').trim() || 'Organization'
      const vendor = ((v.v as string) || '').trim() || 'Vendor facility'
      const methods = (v.d as boolean[]) || []
      const counts = methods.filter(Boolean).length
      const names = ['Degaussing', 'Physical shredding', 'Pulverizing', 'Crypto erase']
      let doc = 'DATA DESTRUCTION CERTIFICATE\n\n'
      doc += `${org} certifies that ${vendor} processed ${num(v.n as number, 0)} units.\n\n`
      doc += 'Methods verified:\n' + names.map((m, i) => `  [${methods[i] ? 'x' : ' '}] ${m}`).join('\n')
      doc += '\n\nSigned: ' + org + ' \u2014 IT Asset Manager\nDate of release: ______\nRetention: keep with the disposal log for 5 years.'
      return [
        res('Units certified', num(v.n as number, 0), T.neutral),
        res('Verified methods', `${counts}/4`, counts >= 2 ? T.good : T.warn, 'Capture serials per unit on the chain-of-custody badge.'),
        res('Certificate completeness', counts === 4 ? 'Complete \u2014 release for disposal log' : 'Incomplete \u2014 mark pending', counts === 4 ? T.good : T.warn),
        docRes('Certificate', doc),
      ]
    },
  },
  {
    id: 'it-asset-management-itam-hardware-tracker',
    archetype: 'log',
    blurb: 'Logs fleet headcount by asset class and surfaces faulty and spare ratios against a healthy baseline.',
    fields: [mx('m', 'Asset classes', ['In service', 'Faulty', 'Spare'], ['Laptops', 'Desktops', 'Tablets', 'Servers', 'Network gear', 'Monitors'])],
    compute: (v) => {
      const M = v.m as number[][]
      const fleet = M.reduce((s, r) => s + (r[0] || 0) + (r[1] || 0) + (r[2] || 0), 0)
      const active = M.reduce((s, r) => s + (r[0] || 0), 0)
      const faulty = M.reduce((s, r) => s + (r[1] || 0), 0)
      const spare = M.reduce((s, r) => s + (r[2] || 0), 0)
      const faultyRate = fleet ? faulty / fleet : 0
      const spareRate = fleet ? spare / fleet : 0
      return [
        res('Fleet size', num(fleet, 0), T.neutral),
        res('Active in service', num(active, 0), T.neutral),
        res('Faulty rate', pct(faultyRate * 100, 1), faultyRate <= 0.05 ? T.good : T.warn, 'Above 5% faulty suggests lifecycle or QA problems.'),
        res('Spare ratio', pct(spareRate * 100, 0), spareRate >= 0.1 ? T.good : T.warn, 'A ~10% spare buffer keeps the refresh cycle healthy.'),
      ]
    },
  },
  {
    id: 'software-asset-management-sam-audit-tool',
    archetype: 'matrix',
    blurb: 'Cross-checks licensed seats against active users to find non-compliance and unused license spend.',
    fields: [mx('m', 'Applications', ['Licensed seats', 'Active users'], ['Productivity suite', 'CAD / engineering', 'Security tools', 'CRM', 'Data platform'])],
    compute: (v) => {
      const M = v.m as number[][]
      const licensed = M.reduce((s, r) => s + (r[0] || 0), 0)
      const active = M.reduce((s, r) => s + (r[1] || 0), 0)
      const under = M.reduce((s, r) => s + Math.max(0, (r[0] || 0) - (r[1] || 0)), 0)
      const over = M.filter((r) => (r[1] || 0) > (r[0] || 0)).length
      const eff = licensed ? (active / licensed) * 100 : 0
      return [
        res('Licensed seats', num(licensed, 0), T.neutral),
        res('Active users', num(active, 0), T.neutral),
        res('Unused licensed seats', num(under, 0), under === 0 ? T.good : T.warn, 'Licensed but inactive seats are immediate budget recovery.'),
        res('Possible non-compliance', `${over} app(s) with users over licenses`, over === 0 ? T.good : T.bad, 'True-ups are cheaper than license audits.'),
        res('License efficiency', pct(eff, 1), eff >= 85 ? T.good : eff >= 70 ? T.warn : T.bad),
      ]
    },
  },
  {
    id: 'cloud-storage-cost-estimator-aws-azure-gcp',
    archetype: 'est',
    blurb: 'Estimates monthly cloud storage costs across hot, infrequent and archive tiers including egress.',
    fields: [sel('t', 'Tier', ['Standard hot', 'Infrequent', 'Cold / archive']), n('a', 'Data volume (TB)', { def: 50 }), n('b', 'Monthly retrieval share %', { def: 5 }), n('c', 'Egress per month (GB)', { def: 20 })],
    compute: (v) => {
      const t = v.t as string, a = v.a as number, b = v.b as number, c = v.c as number
      const rate = t === 'Standard hot' ? 0.023 : t === 'Infrequent' ? 0.0125 : 0.004
      const storage = a * 1024 * rate
      const retrieval = (b / 100) * a * 1024 * rate
      const egress = c * 0.09
      const month = storage + egress
      return [
        res('Storage cost', money(storage), T.neutral, `~$${rate.toFixed(4)}/GB-month for ${t.toLowerCase()}.`),
        res('Retrieval estimate', money(retrieval), T.neutral, 'Read-backs of cold data can retrigger storage-side charges.'),
        res('Egress', money(egress), c > 50 ? T.warn : T.good, 'Egress is often the biggest surprise \u2014 pin it down.'),
        res('Estimated monthly total', money(month), month > 100000 ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'disaster-recovery-rto-and-rpo-calculator',
    archetype: 'est',
    blurb: 'Checks whether RTO and RPO targets are actually achievable given backup cadence and replication lag.',
    fields: [n('r', 'RTO target (hr)', { def: 4 }), n('p', 'RPO target (hr)', { def: 1 }), n('c', 'Backup cadence (hr)', { def: 24 }), n('d', 'Replication lag (hr)', { def: 0.1 })],
    compute: (v) => {
      const rto = Math.max(0.25, v.r as number)
      const rpo = Math.max(0.25, v.p as number)
      const cad = Math.max(0.25, v.c as number)
      const lag = Math.max(0, v.d as number)
      const maxLoss = cad + lag
      const tier = rto <= 1 ? 'Gold' : rto <= 8 ? 'Silver' : 'Bronze'
      return [
        res('Achievable RPO', `${numD(maxLoss, 1)} hr`, maxLoss <= rpo ? T.good : T.bad, 'Backup interval plus replication lag must stay under the RPO target.'),
        res('RPO target', `${numD(rpo, 1)} hr`, T.neutral),
        res('RTO ceiling', `${num(rto, 0)} hr`, T.neutral, 'Recovery time objective for the app owner to sign off.'),
        res('Replication gap', `${numD(lag, 2)} hr`, lag <= 0.5 ? T.good : T.warn, 'Regularly test failover to confirm the gap is real.'),
        res('SLA tier', tier, T.neutral),
      ]
    },
  },
  {
    id: 'it-helpdesk-sla-resolution-time-calculator',
    archetype: 'est',
    blurb: 'Measures helpdesk performance by within-SLA rate, turnaround and overdue ticket load.',
    fields: [n('a', 'Tickets per month', { def: 800 }), n('b', 'Avg resolution time (hr)', { def: 18 }), n('c', 'SLA target hours', { def: 8 }), n('d', 'Tickets over SLA', { def: 120 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const onSla = Math.max(0, a - d)
      const pctOn = a ? (onSla / a) * 100 : 0
      const perDay = Math.ceil(a / 21.5)
      const mult = b / c
      return [
        res('Within-SLA rate', pct(pctOn, 1), pctOn >= 95 ? T.good : pctOn >= 85 ? T.warn : T.bad, 'Common target: 95% of tickets resolved inside the SLA window.'),
        res('Avg time to resolve', hours(b), b <= c ? T.good : T.warn),
        res('SLA breaches', num(d, 0), d > 0 ? T.warn : T.good, 'Each breach carries a customer-facing commitment.'),
        res('Capacity pacing', `${num(perDay, 0)} tickets/day`, T.neutral, 'Roughly 21.5 working days per month.'),
        res('Turnaround vs window', `${numD(mult, 1)}\u00d7 the target`, b <= c ? T.good : T.bad),
      ]
    },
  },
  {
    id: 'enterprise-software-upgrade-matrix',
    archetype: 'matrix',
    blurb: 'Ranks application upgrades by support expiry, test effort and go/no-go score to sequence the portfolio.',
    fields: [mx('m', 'Applications', ['Support ends (mo)', 'Test effort (days)', 'Go/no-go score /10'], ['ERP', 'CRM', 'HRMS', 'BI platform', 'Legacy reporting'])],
    compute: (v) => {
      const M = v.m as number[][]
      const expiring = M.filter((r) => (r[0] || 0) <= 12).length
      const effort = M.map((r) => r[1] || 0)
      const maxEffort = Math.max(...effort)
      const avgScore = M.reduce((s, r) => s + (r[2] || 0), 0) / Math.max(1, M.length)
      const ready = M.filter((r) => (r[2] || 0) >= 8).length
      return [
        res('Upgrades due within 12 mo', num(expiring, 0), expiring === 0 ? T.good : expiring <= 2 ? T.warn : T.bad, 'Vendor support expiry is the real schedule driver.'),
        res('Largest test effort', `${num(maxEffort, 0)} days`, T.neutral, 'Book test windows before launch commits.'),
        res('Avg go/no-go score', `${numD(avgScore, 1)}/10`, avgScore >= 7 ? T.good : avgScore >= 5 ? T.warn : T.bad),
        res('Ready to schedule', `${ready} app(s) at 8+/10`, ready > 0 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'printer-paper-and-toner-cost-per-page-estimator',
    archetype: 'est',
    blurb: 'Computes true cost per page for printing given toner economics, paper price and color mix.',
    fields: [n('a', 'Toner cartridge cost', { def: 70 }), n('b', 'Page yield (pages)', { def: 3000 }), n('c', 'Paper cost (per 500-sheet ream)', { def: 6 }), n('d', 'Color pages share %', { def: 20 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const monoPerPage = b ? a / b : 0
      const paperPerPage = c / 500
      const cpp = monoPerPage * (1 + 3 * (d / 100)) + paperPerPage
      return [
        res('Mono toner per page', moneyC(monoPerPage), T.neutral),
        res('Paper per page', moneyC(paperPerPage), T.neutral),
        res('Effective cost per page', moneyC(cpp), cpp <= 0.05 ? T.good : cpp <= 0.1 ? T.warn : T.bad, 'Color jobs cost roughly 4x mono toner.'),
        res('Monthly @ 2k pages', money(cpp * 2000), T.neutral, 'Use a managed print service above ~50k pages/year.'),
      ]
    },
  },
  {
    id: 'workstation-depreciation-schedule',
    archetype: 'est',
    blurb: 'Builds a straight-line depreciation view for a workstation fleet from cost, life and residual.',
    fields: [n('a', 'Workstations', { def: 50 }), n('b', 'Avg unit cost', { def: 1200 }), n('c', 'Useful life (yr)', { def: 4 }), n('d', 'Residual %', { def: 0 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = Math.max(1, v.c as number), d = v.d as number
      const cost = a * b
      const residual = (cost * d) / 100
      const yearly = (cost - residual) / c
      const midYear = Math.max(1, Math.round(c / 2))
      const midBook = cost - yearly * midYear
      const rate = (1 - d / 100) / c
      return [
        res('Book value (fresh)', money(cost), T.neutral),
        res('Annual depreciation', money(yearly), T.neutral),
        res(`Book value after ${num(midYear, 0)} yrs`, money(midBook), T.warn, 'Mid-life checkpoint for refresh planning.'),
        res('End-of-life book value', money(residual), T.neutral, `Straight-line over ${num(c, 0)} years.`),
        res('Depreciation rate', pct(rate * 100, 1), T.neutral),
      ]
    },
  },
  {
    id: 'database-backup-storage-growth-calculator',
    archetype: 'est',
    blurb: 'Projects backup storage footprint from change rate, retention copies and compression multiplier.',
    fields: [n('a', 'Database size (GB)', { def: 500 }), n('b', 'Daily change rate %', { def: 1.5 }), n('r', 'Retention copies', { def: 14 }), n('d', 'Compression multiplier', { def: 1 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, r = v.r as number, d = v.d as number
      const incr = a * (b / 100)
      const storage = (a + r * incr) * d
      const growth = storage * 12
      return [
        res('Initial full backup', `${num(a, 0)} GB`, T.neutral),
        res('Daily increment', `${numD(incr, 1)} GB`, T.neutral, 'Change rate times the live dataset.'),
        res('Retention storage', `${num(storage, 0)} GB`, T.neutral, `Full plus ${num(r, 0)} incremental copies.`),
        res('12-month growth', `${num(growth, 0)} GB`, T.warn, 'Archive cold copies after retention; storage doubles with retention.'),
        res('Compression impact', `${numD(storage / Math.max(0.1, d), 0)} GB at \u00d71.0`, T.neutral, 'Dedupe/compression shrinks increments before landing.'),
      ]
    },
  },
  {
    id: 'mobile-device-management-mdm-cost-allocator',
    archetype: 'est',
    blurb: 'Splits MDM license spend across compliant devices and prices the non-compliance gap.',
    fields: [n('a', 'Mobile devices', { def: 300 }), n('b', 'Per-device license ($/mo)', { def: 4 }), n('c', 'Non-compliant devices', { def: 12 }), sel('s', 'Platform mix', ['Mostly iOS', 'Mostly Android', 'Mixed fleet'])],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = Math.min(a, v.c as number), s = v.s as string
      const annual = a * b * 12
      const lost = c * b * 12
      const perCompliant = annual / Math.max(1, a - c)
      return [
        res('Annual MDM spend', money(annual), T.neutral),
        res('Per compliant device', money(perCompliant), T.neutral),
        res(`Cost of ${num(c, 0)} non-compliant`, money(lost), c > 0 ? T.warn : T.good, 'Automate compliance checks to reclaim the gap.'),
        res('Platform pattern', s.includes('iOS') ? 'Apple Business Manager + DEP enrolment' : 'Android Enterprise / Zero-touch', T.neutral, `${s} deployment pattern assumed.`),
      ]
    },
  },
  {
    id: 'source-code-repository-storage-estimator',
    archetype: 'est',
    blurb: 'Estimates repo working-set and history storage from team size, repos and retention policy.',
    fields: [n('a', 'Developers', { def: 40 }), n('b', 'Avg repo size (GB)', { def: 1.2 }), n('c', 'Repos per team', { def: 8 }), n('d', 'History retention (yr)', { def: 3 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const teams = Math.max(1, Math.round(a / 5))
      const repos = teams * c
      const size = repos * b
      const withHistory = size * (1 + d * 0.15)
      const perDev = withHistory / Math.max(1, a)
      return [
        res('Estimated repo count', num(repos, 0), T.neutral, 'One team of ~5 developers owns a repo cluster.'),
        res('Live working set', `${num(size, 1)} GB`, T.neutral),
        res('With history', `${num(withHistory, 1)} GB`, T.good, 'Shallow-clone policies cut this dramatically.'),
        res('Per-developer footprint', `${numD(perDev, 2)} GB`, T.neutral),
      ]
    },
  },
  {
    id: 'it-staffing-to-user-ratio-estimator',
    archetype: 'est',
    blurb: 'Checks IT staffing levels against the supported user base to find coverage gaps or overstaffing.',
    fields: [n('a', 'Total employee users', { def: 1500 }), n('b', 'IT staff count', { def: 15 }), sel('s', 'Support model', ['Break-fix', 'Standardized helpdesk', 'High-automation ITSM'])],
    compute: (v) => {
      const a = v.a as number, b = Math.max(1, v.b as number), s = v.s as string
      const ratio = a / b
      const hires = Math.max(0, Math.ceil(a / 120 - b))
      return [
        res('Users per IT staffer', num(ratio, 1), ratio <= 120 ? T.good : ratio <= 180 ? T.warn : T.bad, '50-100 is white-glove; 100-200 standardized; >250 needs heavy automation.'),
        res('IT staffing level', `${numD(ratio, 1)}:1`, T.neutral),
        res('Support model', s, T.neutral, 'Shift break-fix to proactive ITSM to lift effective capacity.'),
        res('Hires to hit 120:1', num(hires, 0), ratio > 120 ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'legacy-system-migration-risk-matrix',
    archetype: 'scorecard',
    blurb: 'Scores migration readiness across risk areas and pairs it with a strategy to cut blast radius.',
    fields: [mxd('m', 'Migration risk areas', ['Area', 'Weight %', 'Score /10'], ['Data migration', 'System integration', 'User upskilling', 'Downtime & fallback', 'Security & compliance'], [[30, 6], [25, 7], [20, 8], [15, 7], [10, 6]]), sel('s', 'Migration strategy', ['Big bang', 'Phased', 'Parallel run'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Data migration', 'System integration', 'User upskilling', 'Downtime & fallback', 'Security & compliance']
      const w = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const wScore = (M.reduce((s, r) => s + (r[0] || 0) * (r[1] || 0), 0) / w) * 10
      const minI = M.reduce((bi, r, i) => ((r[1] || 0) < (M[bi][1] || 0) ? i : bi), 0)
      const s = v.s as string
      return [
        res('Readiness index', `${num(wScore, 0)}/100`, wScore >= 70 ? T.good : wScore >= 55 ? T.warn : T.bad, 'Below 55 the migration is not ready to schedule.'),
        res('Highest-risk area', labels[minI], T.bad, `Readiness ${num(M[minI][1] || 0, 0)}/10 \u2014 fund remediation first.`),
        res('Strategy', s, T.neutral, s === 'Big bang' ? 'Only for small, low-coupling systems.' : 'Shrink blast radius with controlled waves.'),
      ]
    },
  },
  {
    id: 'workstation-imaging-deployment-time-estimator',
    archetype: 'est',
    blurb: 'Estimates image fleet rollout time from build time, staging slots and technician parallelism.',
    fields: [n('a', 'Workstations to deploy', { def: 120 }), n('b', 'Imaging time per unit (min)', { def: 45 }), n('c', 'Techs', { def: 4 }), n('d', 'Staging parallel slots', { def: 4 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = Math.max(1, v.c as number), d = Math.max(1, v.d as number)
      const slots = Math.min(c, d)
      const waves = Math.ceil(a / slots)
      const total = waves * b
      const serial = Math.ceil(a / c) * b
      const perHour = Math.round((60 / Math.max(1, b)) * slots)
      return [
        res('Imaging waves', num(waves, 0), T.neutral, `Parallel slots limited to ${num(slots, 0)} (min of techs and staging bays).`),
        res('Wall-clock estimate', hours(total), T.good),
        res('Serial tech-time', hours(serial), T.neutral, 'Total labour across the team without parallelism.'),
        res('Throughput', `${num(perHour, 0)} units/hr`, perHour >= 5 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'cloud-egress-fee-risk-estimator',
    archetype: 'est',
    blurb: 'Puts a price on cloud egress and shows the saving from keeping inter-node traffic in-region.',
    fields: [n('a', 'Egress per month (TB)', { def: 8 }), sel('t', 'Provider', ['AWS', 'Azure', 'GCP']), n('c', 'Mostly in-region? (1 = yes, 0 = no)', { def: 0 })],
    compute: (v) => {
      const a = v.a as number, t = v.t as string, c = v.c as number
      const rate = t === 'AWS' ? 0.09 : t === 'Azure' ? 0.087 : 0.12
      const monthly = a * 1024 * rate
      const inside = c === 1 ? monthly * 0.15 : monthly
      return [
        res('Gross egress cost', money(monthly), T.neutral, `~$${num(rate * 1000, 2)}/GB for ${t}.`),
        res('With in-region routing', money(inside), c === 1 ? T.good : T.bad, 'Same-region and AZ hops are effectively free.'),
        res('Annual exposure', money(inside * 12), inside * 12 > 50000 ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'system-downtime-financial-loss-calculator',
    archetype: 'est',
    blurb: 'Quantifies the revenue and labour blast radius of an outage to justify uptime investment.',
    fields: [n('a', 'Revenue per hour (est)', { def: 50000 }), n('b', 'Outage length (hr)', { def: 3 }), n('c', 'Productive users idle', { def: 3000 }), n('d', 'Avg loaded cost per user-hr', { def: 60 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const revLoss = a * b
      const labor = c * d * b * 0.75
      const total = revLoss + labor
      const perMin = total / Math.max(1, b * 60)
      const perUserHr = total / (Math.max(1, c) * Math.max(1, b))
      return [
        res('Revenue at risk', money(revLoss), T.bad),
        res('Idle labour cost', money(labor), T.warn, '75% load factor assumed for partially productive staff.'),
        res('Total blast radius', money(total), total > 100000 ? T.bad : total > 30000 ? T.warn : T.neutral),
        res('Per-minute cost', money(perMin), T.neutral, 'Use this to size uptime warranties and incident spending.'),
        res('Cost per user-hour', money(perUserHr), T.neutral),
      ]
    },
  },
]