import { ck, clamp, doc as docRes, dt, days, hours, money, mx, mxd, n, num, numD, pct, ratio, res, sel, T, txt } from '../archetypes/spec'
import type { OfficeToolSpec } from '../archetypes/spec'

export const specs: OfficeToolSpec[] = [
  // ---------------- Agile Delivery ----------------
  {
    id: 'agile-velocity-calculator',
    archetype: 'est',
    blurb: 'Turns delivered story points and calendar time into a normalized per-sprint velocity.',
    fields: [n('a', 'Story points delivered (last 3 sprints)', { def: 90 }), n('b', 'Sprints elapsed', { def: 3 }), n('c', 'Avg developer count', { def: 5 }), n('d', 'Sprint length (days)', { def: 10 })],
    compute: (v) => {
      const a = v.a as number, b = Math.max(1, v.b as number), c = Math.max(1, v.c as number), d = Math.max(1, v.d as number)
      const vel = a / b
      const pp = vel / c
      const perDay = vel / d
      return [
        res('Velocity / sprint', `${numD(vel, 1)} pts`, vel >= 30 ? T.good : vel >= 15 ? T.warn : T.bad),
        res('Per developer', `${numD(pp, 1)} pts`, pp >= 6 ? T.good : pp >= 3 ? T.warn : T.bad),
        res('Per day', `${numD(perDay, 1)} pts`),
        res('Forecast capacity', `${numD(vel * 1.2, 1)} pts`, T.neutral, 'Add ~20% buffer before committing to a release plan.'),
      ]
    },
  },
  {
    id: 'sprint-capacity-planner',
    archetype: 'est',
    blurb: 'Computes team capacity in hours and story points from headcount, days and focus factor.',
    fields: [n('a', 'Developers', { def: 5 }), n('b', 'Working days', { def: 10 }), n('c', 'Hours per day', { def: 8 }), n('d', 'Focus factor %', { def: 70 }), n('e', 'Points per 8h pair-day', { def: 2 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = Math.max(1, v.e as number)
      const raw = a * b * c
      const eff = raw * (d / 100)
      const pairDays = eff / 8
      const pts = pairDays * e
      return [
        res('Raw hours', hours(raw)),
        res('Effective hours', hours(eff), d >= 80 ? T.good : d >= 60 ? T.warn : T.bad, 'Meetings and support drag the focus factor below 100%.'),
        res('Pair-day capacity', `${numD(pairDays, 1)} pair-days`),
        res('Story point capacity', `${numD(pts, 1)} pts`, pts >= 40 ? T.good : pts >= 20 ? T.warn : T.neutral),
      ]
    },
  },
  {
    id: 'sprint-burndown-and-burnup-calculator',
    archetype: 'log',
    blurb: 'Tracks remaining and added scope across sprint days to judge whether the team still hits the goal.',
    fields: [mxd('m', 'Sprint log (one row per day)', ['Sprint day', 'Points remaining', 'Points added'], ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10'], [[48, 0], [43, 0], [40, 2], [33, 0], [28, 0], [22, 0], [18, 3], [12, 0], [7, 0], [3, 0]]), n('s', 'Committed points', { def: 50 })],
    compute: (v) => {
      const M = v.m as number[][]
      const start = M[0]?.[0] ?? 0
      const last = M[M.length - 1]?.[0] ?? 0
      const added = M.reduce((s, r) => s + (r[1] || 0), 0)
      const s = Math.max(1, v.s as number)
      const burned = start - last
      const avg = burned / Math.max(1, M.length - 1)
      const daysLeft = avg > 0 ? last / avg : last
      const scope = (start + added) / s
      const done = (((s + added) - last) / (s + added)) * 100
      return [
        res('Burnt so far', `${num(burned, 0)} pts`, burned >= s * 0.4 ? T.good : T.warn),
        res('Scope growth', pct(clamp((scope - 1) * 100, -100, 200), 1), scope <= 1.05 ? T.good : scope <= 1.15 ? T.warn : T.bad, `${added} pts of scope added mid-sprint.`),
        res('Burn rate', `${numD(avg, 2)} pts/day`, avg >= (s + added) / 10 ? T.good : T.warn),
        res('Days to finish', `${numD(daysLeft, 1)}`, last <= 0 ? T.good : daysLeft <= 3 ? T.good : daysLeft <= 6 ? T.warn : T.bad),
        res('Progress', pct(clamp(done, 0, 100), 1), done >= 75 ? T.good : done >= 50 ? T.warn : T.bad),
      ]
    },
  },
  {
    id: 'cumulative-flow-diagram-cfd-scorer',
    archetype: 'log',
    blurb: 'Scores WIP, throughput and lead time from a simple three-state cumulative flow log.',
    fields: [mxd('m', 'CFD log (totals per period)', ['Period', 'Backlog', 'In progress', 'Done'], ['Week 1', 'Week 2', 'Week 3', 'Week 4'], [[60, 15, 5], [50, 18, 12], [42, 16, 22], [35, 14, 31]])],
    compute: (v) => {
      const M = v.m as number[][]
      const nRow = Math.max(1, M.length)
      const wip = M.reduce((s, r) => s + (r[1] || 0), 0) / nRow
      const firstDone = M[0]?.[2] || 0
      const lastDone = M[nRow - 1]?.[2] || 0
      const through = (lastDone - firstDone) / nRow
      const lt = through > 0 ? wip / through : 0
      const backlog = M[nRow - 1]?.[0] || 0
      return [
        res('Avg WIP', `${numD(wip, 1)} items`, wip <= 20 ? T.good : wip <= 35 ? T.warn : T.bad),
        res('Throughput / period', `${numD(through, 1)} items`, through > 0 ? T.good : T.bad),
        res('Implied lead time', `${numD(lt, 1)} periods`, lt <= 2 ? T.good : lt <= 4 ? T.warn : T.bad, 'Little\u2019s law: LT = WIP \u00f7 throughput.'),
        res('Backlog drain', `${num(backlog, 0)} items`, backlog <= firstDone ? T.good : T.warn, 'Backlog falling slower than throughput signals a demand ceiling.'),
      ]
    },
  },
  {
    id: 'agile-story-point-estimation-matrix',
    archetype: 'matrix',
    blurb: 'Scores user stories on complexity, effort and risk to derive a point estimate and unknowns.',
    fields: [mx('m', 'Stories to estimate', ['Complexity /5', 'Effort /5', 'Risk /5'], ['Story A', 'Story B', 'Story C', 'Story D', 'Story E', 'Story F'])],
    compute: (v) => {
      const M = v.m as number[][]
      const rows = M.map((r) => ({ pts: (r[0] || 0) * (r[1] || 0), risk: r[2] || 0 }))
      const total = rows.reduce((s, r) => s + r.pts, 0)
      const avg = total / Math.max(1, rows.length)
      const risky = rows.filter((r) => r.risk >= 4).length
      const s = rows[0]
      const t = rows[1]
      const f = rows[2]
      const lo = rows[3]
      const fi = rows[4]
      const si = rows[5]
      return [
        res('Total estimate', `${numD(total, 1)} pts`, avg <= 5 ? T.good : avg <= 8 ? T.warn : T.bad, 'Healthy stories fit 3\u20135 pts; big tickets need splitting.'),
        res('Avg / story', `${numD(avg, 1)} pts`),
        res('High-risk stories', `${num(risky, 0)}/6`, risky === 0 ? T.good : risky <= 2 ? T.warn : T.bad, 'Treat high-risk tickets as spikes first.'),
        res('Largest story', Math.max(s.pts, t.pts, f.pts, lo.pts, fi.pts, si.pts) >= 8 ? 'Needs splitting' : 'Within range', Math.max(s.pts, t.pts, f.pts, lo.pts, fi.pts, si.pts) >= 8 ? T.warn : T.good),
      ]
    },
  },
  {
    id: 'retrospective-action-item-tracker',
    archetype: 'log',
    blurb: 'Logs retrospective actions with age, priority and blocker count so follow-through stays honest.',
    fields: [mxd('m', 'Action items', ['Action', 'Open days', 'Priority /5', 'Blockers'], ['Team velocity', 'Test coverage', 'On-call rota', 'Definition of done', 'Sprint length'], [[14, 2, 0], [21, 4, 1], [7, 3, 0], [30, 5, 2], [10, 1, 0]]), n('g', 'Goal: all done by day', { def: 30 })],
    compute: (v) => {
      const M = v.m as number[][]
      const open = M.reduce((s, r) => s + (r[0] || 0), 0) / Math.max(1, M.length)
      const stale = M.filter((r) => (r[0] || 0) >= (v.g as number)).length
      const hp = M.filter((r) => (r[1] || 0) >= 4 && (r[0] || 0) > 14).length
      const blocked = M.filter((r) => (r[2] || 0) >= 1).length
      return [
        res('Avg action age', `${numD(open, 1)} days`, open <= 10 ? T.good : open <= 20 ? T.warn : T.bad, 'Actions left open past two sprints lose trust in the retro.'),
        res('Stale items', `${num(stale, 0)}`, stale === 0 ? T.good : stale <= 1 ? T.warn : T.bad),
        res('Stuck high-priority', `${num(hp, 0)}`, hp === 0 ? T.good : T.bad),
        res('Blocked items', `${num(blocked, 0)}`, blocked === 0 ? T.good : T.warn, 'Unblock one before adding new.'),
      ]
    },
  },
  {
    id: 'scrum-of-scrums-coordination-matrix',
    archetype: 'matrix',
    blurb: 'Surfaces cross-team blockers, dependencies and risk so the of-scrums meeting stays focused.',
    fields: [mx('m', 'Teams', ['Blockers open', 'Dependencies wait (days)', 'Risk /5'], ['Platform', 'Billing', 'Mobile', 'Data', 'Security', 'QA'])],
    compute: (v) => {
      const M = v.m as number[][]
      const blockers = M.reduce((s, r) => s + (r[0] || 0), 0)
      const wait = M.reduce((s, r) => s + (r[1] || 0), 0)
      const avgRisk = M.reduce((s, r) => s + (r[2] || 0), 0) / Math.max(1, M.length)
      const labels = ['Platform', 'Billing', 'Mobile', 'Data', 'Security', 'QA']
      const top = M.reduce((bi, r, i) => ((r[2] || 0) > (M[bi][2] || 0) ? i : bi), 0)
      return [
        res('Open blockers', `${num(blockers, 0)}`, blockers === 0 ? T.good : blockers <= 3 ? T.warn : T.bad),
        res('Dependency wait', `${num(wait, 0)} days`, wait <= 10 ? T.good : wait <= 25 ? T.warn : T.bad),
        res('Avg cross-team risk', `${numD(avgRisk, 1)}/5`, avgRisk <= 2 ? T.good : avgRisk <= 3.5 ? T.warn : T.bad),
        res('Hottest team', labels[top], M[top]?.[2] && M[top]?.[2] >= 4 ? T.bad : T.neutral, 'Assign a named liaison to the hottest team\u2019s dependency.'),
      ]
    },
  },
  {
    id: 'kanban-lead-time-vs-cycle-time-calculator',
    archetype: 'est',
    blurb: 'Separates lead time from cycle time to expose the queue that is actually eating your speed.',
    fields: [n('a', 'Avg lead time (days)', { def: 12 }), n('b', 'Avg cycle time (days)', { def: 5 }), n('c', 'Open WIP', { def: 15 }), n('d', 'Throughput (items/day)', { def: 2 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = Math.max(0.01, v.d as number)
      const queue = Math.max(0, a - b)
      const lt = c / d
      return [
        res('Queue time', `${numD(queue, 1)} days`, queue <= 4 ? T.good : queue <= 8 ? T.warn : T.bad, 'Lead = queue + active working time.'),
        res('Little\u2019s-law lead', `${numD(lt, 1)} days`, Math.abs(lt - a) / Math.max(1, a) <= 0.25 ? T.good : T.warn, 'WIP \u00f7 throughput should \u2248 your measured lead time.'),
        res('Idle WIP share', pct((queue / Math.max(1, a)) * 100, 1), queue / Math.max(1, a) <= 0.4 ? T.good : T.bad),
        res('Throughput', `${numD(d, 2)} items/day`),
      ]
    },
  },
  {
    id: 'agile-release-train-art-planner',
    archetype: 'est',
    blurb: 'Sizes a release train\u2019s PI capacity and checks how much planned scope it can absorb.',
    fields: [n('a', 'Teams on the train', { def: 5 }), n('b', 'Iterations / PI', { def: 5 }), n('c', 'Capacity / team / iteration', { def: 12 }), n('d', 'Planned story points', { def: 250 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const cap = a * b * c
      const load = (d / cap) * 100
      const slack = Math.max(0, cap - d)
      return [
        res('PI capacity', `${num(cap, 0)} pts`, cap >= d ? T.good : T.warn),
        res('Load', pct(clamp(load, 0, 100), 1), load <= 85 ? T.good : load <= 100 ? T.warn : T.bad, 'Keep PI load under ~85% for buffer.'),
        res('Slack / buffer', `${num(slack, 0)} pts`, slack >= cap * 0.1 ? T.good : T.warn),
        res('Features at 8 pts', `${num(Math.floor(cap / 8), 0)} features`, T.neutral),
      ]
    },
  },
  {
    id: 'agile-team-happiness-metric-calculator',
    archetype: 'index',
    blurb: 'Rolls autonomy, clarity, growth, recognition and load into a team happiness index.',
    fields: [n('a', 'Autonomy /10', { def: 7 }), n('b', 'Goal clarity /10', { def: 8 }), n('c', 'Growth /10', { def: 6 }), n('d', 'Recognition /10', { def: 6 }), n('e', 'Sustainable pace /10', { def: 8 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const idx = clamp((a + b + c + d + e) / 5 * 10, 0, 100)
      const low = [a, b, c, d, e].filter((x) => x < 5).length
      const pace = e
      return [
        res('Happiness index', pct(idx, 1), idx >= 75 ? T.good : idx >= 55 ? T.warn : T.bad, 'Track this weekly; it predicts attrition better than velocity.'),
        res('Score /10', `${numD(idx / 10, 1)}`, idx >= 75 ? T.good : T.warn),
        res('Failing dimensions', `${num(low, 0)}/5`, low === 0 ? T.good : low <= 1 ? T.warn : T.bad),
        res('Pace risk', pace < 6 ? 'Unhealthy load' : 'Sustainable', pace < 6 ? T.bad : T.good),
      ]
    },
  },
  {
    id: 'epic-to-user-story-breakdown-tool',
    archetype: 'fmt',
    blurb: 'Splits an epic\u2019s point budget into shippable user stories and prints a breakdown draft.',
    fields: [txt('ep', 'Epic title', 1, 'Billing overhaul'), n('a', 'Epic points', { def: 40 }), n('b', 'Target story size', { def: 3 }), n('c', 'Must-have share %', { def: 60 }), sel('f', 'Format', ['User stories', 'Feature bullets', 'BDD scenarios'])],
    compute: (v) => {
      const ep = v.ep as string, a = v.a as number, b = Math.max(1, v.b as number), c = v.c as number, f = v.f as string
      const stories = Math.max(1, Math.round(a / b))
      const must = Math.round(stories * (c / 100))
      const nice = stories - must
      const head = `EPIC: ${ep || '(untitled)'}\nBudget: ${num(a, 0)} pts \u00b7 ${num(stories, 0)} stories at ~${num(b, 0)} pts each\n`
      const body =
        f === 'BDD scenarios'
          ? Array.from({ length: stories }, (_, i) => `${i < must ? 'MUST' : 'SHOULD'} SCENARIO ${i + 1}:\n  Given ...\n  When ...\n  Then ...`).join('\n\n')
          : f === 'Feature bullets'
            ? Array.from({ length: stories }, (_, i) => `${i < must ? '[Must]' : '[Nice]'} Feature ${i + 1} of epic scope`).join('\n')
            : Array.from({ length: stories }, (_, i) => `As a user, I want ${ep ? ep.toLowerCase().split(' ').slice(0, 6).join(' ') : 'this feature'} ${i + 1} so that I get value.`).join('\n')
      const doc = `${head}\n${body}\n\n${num(must, 0)} must-have \u00b7 ${num(nice, 0)} nice-to-have discarded if the sprint runs full.`
      return [res('Story count', `~${num(stories, 0)} stories`, stories <= 15 ? T.good : T.warn, 'More than ~15 stories means the epic is too big to plan.'),
        res('Must-have scope', `${num(must, 0)} / ${num(nice, 0)}`, c <= 80 ? T.good : T.warn), docRes('Breakdown draft', doc)]
    },
  },
  {
    id: 'agile-maturity-assessment-matrix',
    archetype: 'scorecard',
    blurb: 'Weights agile practices and scores them to judge how mature the team really is.',
    fields: [mxd('m', 'Practices', ['Practice', 'Weight %', 'Score /10'], ['Backlog grooming', 'Definition of done', 'Retro effectiveness', 'Technical excellence', 'Cadence & metrics'], [[20, 7], [20, 8], [20, 6], [25, 7], [15, 8]]), sel('l', 'Target level', ['Learning', 'Standardizing', 'Optimizing'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Backlog grooming', 'Definition of done', 'Retro effectiveness', 'Technical excellence', 'Cadence & metrics']
      const w = M.reduce((s, r) => s + (r[0] || 0), 0) || 1
      const score = (M.reduce((s, r) => s + (r[0] || 0) * (r[1] || 0), 0) / w) * 10
      const minI = M.reduce((bi, r, i) => ((r[1] || 0) < (M[bi][1] || 0) ? i : bi), 0)
      const l = v.l as string
      return [
        res('Maturity score', `${numD(score, 1)}/100`, score >= 75 ? T.good : score >= 50 ? T.warn : T.bad, `Target: ${l}.`),
        res('Weakest practice', labels[minI], M[minI]?.[1] && M[minI]?.[1] < 6 ? T.bad : T.warn),
        res('Weight health', pct(Math.min(100, w), 0), w === 100 ? T.good : T.warn),
        res('Evidence-based', score >= 60 && w === 100 ? 'Yes' : 'Work needed', T.neutral, 'A score without sprint data is an opinion.'),
      ]
    },
  },
  {
    id: 'acceptance-criteria-checklist-generator',
    archetype: 'checklist',
    blurb: 'Checks a story\u2019s acceptance criteria against the dimensions that make them testable.',
    fields: [ck('c', 'Criteria covered', ['Functional behavior', 'Edge cases & negatives', 'Error handling', 'Performance bounds', 'Accessibility (a11y)', 'Security & auth', 'Data persistence', 'Analytics events', 'Rollback / revert', 'Docs & copy'])],
    compute: (v) => {
      const items = (v.c as boolean[]) ?? []
      const done = items.filter(Boolean).length
      const missing = ['Functional behavior', 'Edge cases & negatives', 'Error handling', 'Performance bounds', 'Accessibility (a11y)', 'Security & auth', 'Data persistence', 'Analytics events', 'Rollback / revert', 'Docs & copy'].filter((_, i) => !items[i])
      return [
        res('Criteria coverage', pct(clamp((done / 10) * 100, 0, 100), 0), done >= 8 ? T.good : done >= 5 ? T.warn : T.bad),
        res('Dimensions covered', `${done}/10`, T.neutral),
        res('Missing', missing.length ? missing.slice(0, 3).join(', ') : 'None', missing.length ? T.warn : T.good, 'Unwritten criteria become arguments mid-sprint.'),
      ]
    },
  },
  {
    id: 'feature-flag-deployment-tracker',
    archetype: 'tracker',
    blurb: 'Tracks a feature rollout by exposure, ramp speed and the kill-switch posture behind it.',
    fields: [dt('d', 'Launch date'), n('e', 'Exposure %', { def: 25 }), n('k', 'Kill-switch ramp (minutes)', { def: 15 }), sel('s', 'Rollout state', ['Preview', 'Progressive', 'Full', 'Frozen'])],
    compute: (v) => {
      const d = v.d as string, e = v.e as number, k = v.k as number, s = v.s as string
      const dateStr = d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
      const risk = e >= 90 ? (s === 'Full' ? 'Controlled' : 'Risky') : e >= 50 ? 'Ramping' : 'Low'
      return [
        res('Rollout', s, s === 'Full' ? T.neutral : s === 'Frozen' ? T.bad : T.good),
        res('Exposure', pct(clamp(e, 0, 100), 1), e < 100 ? T.warn : T.good, 'Never sit at 100% without a canary budget.'),
        res('Kill-switch', `${num(k, 0)} min`, k <= 30 ? T.good : k <= 120 ? T.warn : T.bad),
        res('Launch date', dateStr, T.neutral),
        res('Risk posture', risk, risk === 'Controlled' ? T.good : risk === 'Ramping' ? T.warn : T.bad),
      ]
    },
  },
  {
    id: 'pair-programming-time-allocator',
    archetype: 'est',
    blurb: 'Splits weekly developer hours into pairing and solo time to keep knowledge sharing honest.',
    fields: [n('a', 'Team size', { def: 5 }), n('b', 'Dev hours / person / week', { def: 38 }), n('c', 'Pairing target %', { def: 25 }), n('d', 'Avg pairing session (hrs)', { def: 1.5 })],
    compute: (v) => {
      const a = Math.max(1, v.a as number), b = v.b as number, c = v.c as number, d = Math.max(0.5, v.d as number)
      const total = a * b
      const pairHrs = total * (c / 100)
      const sessions = pairHrs / d
      const solo = total - pairHrs
      return [
        res('Pairing hours / week', hours(pairHrs), sessions >= 6 ? T.good : sessions >= 2 ? T.warn : T.neutral, 'Aim for a few real sessions, not appearing on paired-KPIs.'),
        res('Sessions / week', `${numD(sessions, 1)}`, T.neutral),
        res('Solo hours / week', hours(solo)),
        res('Coverage', pct(c, 0), c <= 40 ? T.good : T.warn, 'Over 40% pairing eats into deep-work time.'),
      ]
    },
  },
  {
    id: 'minimum-viable-product-mvp-feature-scorer',
    archetype: 'matrix',
    blurb: 'Scores candidate MVP features on value, effort and risk to decide what actually ships.',
    fields: [mxd('m', 'Feature candidates', ['Customer value /10', 'Build effort /5', 'Delivery risk /5'], ['Auth & onboarding', 'Dashboard', 'Payments', 'Reporting', 'Mobile push', 'API access'], [[9, 2, 2], [7, 3, 3], [9, 4, 4], [5, 3, 2], [6, 2, 2], [8, 5, 5]]), n('t', 'Team capacity (points)', { def: 24 }), sel('w', 'Weighing', ['Value \u00f7 Effort', 'RICE-lite'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Auth & onboarding', 'Dashboard', 'Payments', 'Reporting', 'Mobile push', 'API access']
      const t = v.t as number
      const w = v.w as string
      const scores = M.map((r, i) => {
        const eff = Math.max(1, r[1] || 0)
        const base = w.includes('RICE') ? (r[0] || 0) * (r[0] || 0) / eff : (r[0] || 0) / eff
        return { i, s: base - (r[2] || 0) }
      })
      scores.sort((x, y) => y.s - x.s)
      const pick = scores.filter((x) => x.s >= 0)
      const effort = pick.reduce((s, x) => s + (M[x.i][1] || 0), 0)
      return [
        res('Ship list', pick.length ? pick.map((x) => labels[x.i]).join(', ') : 'Nothing clears the bar', pick.length ? T.good : T.bad, `${num(pick.length, 0)} of ${num(M.length, 0)} features fit the MVP.`),
        res('Capacity check', `${num(effort, 1)} pts vs ${num(t, 0)}`, effort <= t ? T.good : T.warn, 'Trim the list until effort fits capacity.'),
        res('Top pick', pick.length ? labels[pick[0].i] : '—', T.neutral),
        res('Cut value', `${num(M.length - pick.length, 0)} cut`, T.neutral),
      ]
    },
  },
  {
    id: 'software-build-success-rate-monitor',
    archetype: 'index',
    blurb: 'Tracks the ratio of green builds and mean time between red to police the pipeline.',
    fields: [n('a', 'Builds run this week', { def: 120 }), n('b', 'Successful builds', { def: 106 }), n('c', 'Avg build duration (min)', { def: 9 }), n('d', 'Flaky / no-op runs', { def: 7 })],
    compute: (v) => {
      const a = Math.max(1, v.a as number), b = v.b as number, c = v.c as number, d = v.d as number
      const rate = clamp((b / a) * 100, 0, 100)
      const reds = a - b - d
      const flakyShare = (d / a) * 100
      return [
        res('Build success rate', pct(rate, 1), rate >= 95 ? T.good : rate >= 85 ? T.warn : T.bad, 'Below ~90% the pipeline stops being trusted.'),
        res('Flaky share', pct(flakyShare, 1), flakyShare <= 5 ? T.good : T.warn, 'Retry-and-pass hides real breaks; quarantine flaky tests.'),
        res('Red builds', `${num(Math.max(0, reds), 0)}`, reds <= 3 ? T.good : reds <= 8 ? T.warn : T.bad),
        res('Pipeline wall time', hours(c * a / 60), c <= 10 ? T.good : c <= 20 ? T.warn : T.bad),
      ]
    },
  },
  // ---------------- Planning & Scheduling ----------------
  {
    id: 'earned-value-management-evm-calculator',
    archetype: 'est',
    blurb: 'Compares earned, planned and actual cost to forecast the completion budget and date.',
    fields: [n('a', 'BAC (budget at completion)', { def: 500000 }), n('b', 'EV (earned value)', { def: 200000 }), n('c', 'PV (planned value)', { def: 250000 }), n('d', 'AC (actual cost)', { def: 220000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const cv = b - d
      const sv = b - c
      const cpi = d ? b / d : 0
      const spi = c ? b / c : 0
      const eac = cpi ? a / cpi : 0
      const vac = eac ? a - eac : 0
      return [
        res('Cost variance', money(cv), cv >= 0 ? T.good : T.bad),
        res('Schedule variance', money(sv), sv >= 0 ? T.good : T.bad),
        res('CPI', ratio(cpi, 2), cpi >= 1 ? T.good : cpi >= 0.9 ? T.warn : T.bad, 'CPI > 1 = spending less than earned.'),
        res('SPI', ratio(spi, 2), spi >= 1 ? T.good : spi >= 0.9 ? T.warn : T.bad),
        res('EAC forecast', money(eac), eac <= a * 1.1 ? T.good : T.warn, `VAC ${vac >= 0 ? '+' : ''}${money(vac)}`),
      ]
    },
  },
  {
    id: 'critical-path-method-cpm-network-calculator',
    archetype: 'matrix',
    blurb: 'Scores task durations and start days to find the longest path and the float on every task.',
    fields: [mxd('m', 'Network tasks', ['Duration (days)', 'Earliest start (day)'], ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'], [[5, 0], [3, 5], [4, 5], [6, 8], [2, 14], [4, 8]]), n('b', 'Buffer %', { def: 10 })],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6']
      const fins = M.map((r) => (r[1] || 0) + (r[0] || 0))
      const total = Math.max(...fins)
      const crit = labels.filter((_, i) => fins[i] >= total - 0.001)
      const float = M.reduce((s, r) => s + Math.max(0, total - ((r[1] || 0) + (r[0] || 0))), 0)
      const b = v.b as number
      const buffered = total * (1 + b / 100)
      return [
        res('Critical path length', `${num(total, 0)} days`, T.neutral, 'The longest chain through the network — add the buffer before commitment.'),
        res('On the critical path', crit.join(', '), crit.length <= 3 ? T.good : T.warn, 'Shave the critical tasks to compress the total.'),
        res('Total float', `${num(float, 0)} days`, float <= total * 0.3 ? T.warn : T.good, 'Low total float means little slack in the plan.'),
        res('Buffered estimate', `${numD(buffered, 1)} days`, T.good, `Including a ${num(b, 0)}% schedule buffer.`),
      ]
    },
  },
  {
    id: 'gantt-chart-timeline-generator',
    archetype: 'timeline',
    blurb: 'Lays deliverables and phases on a calendar with durations so the plan has a real spine.',
    fields: [dt('s', 'Start date'), mx('m', 'Deliverables', ['Deliverable', 'Duration (days)'], ['Kickoff & charter', 'Discovery', 'Design', 'Build', 'QA & hardening', 'Go-live & handover'])],
    compute: (v) => {
      const M = v.m as number[][]
      const total = M.reduce((s, r) => s + (r[0] || 0), 0)
      const longest = Math.max(...M.map((r) => r[0] || 0))
      const s = v.s as string
      const end = s ? new Date(new Date(s + 'T00:00:00').getTime() + total * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : total ? `day ${total}` : '—'
      return [
        res('Total span', days(total)),
        res('Longest deliverable', days(longest), longest <= total * 0.5 ? T.good : T.warn, 'A single phase above half the plan is a milestone risk.'),
        res('Deliverables', `${num(M.length, 0)}`, T.neutral),
        res('Finish date', end, T.neutral),
      ]
    },
  },
  {
    id: 'project-scope-creep-impact-estimator',
    archetype: 'est',
    blurb: 'Prices the cost and schedule drag of unplanned additions against the original baseline.',
    fields: [n('a', 'Baseline budget', { def: 200000 }), n('b', 'Added scope ($)', { def: 35000 }), n('c', 'Added scope (person-weeks)', { def: 6 }), n('d', 'Baseline duration (weeks)', { def: 20 }), n('e', 'Change requests approved', { def: 9 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = Math.max(1, v.d as number), e = v.e as number
      const pctGr = a ? (b / a) * 100 : 0
      const sched = (c / d) * 100
      const avg = b > 0 ? b / e : 0
      return [
        res('Scope growth', pct(pctGr, 1), pctGr <= 10 ? T.good : pctGr <= 25 ? T.warn : T.bad, 'Freezing scope for a 4-week window is the single best control.'),
        res('Schedule drag', `${numD(sched, 1)}%`, sched <= 10 ? T.good : sched <= 20 ? T.warn : T.bad),
        res('Avg / change request', money(avg), T.neutral),
        res('New projected budget', money(a + b), T.neutral),
      ]
    },
  },
  {
    id: 'work-breakdown-structure-wbs-code-generator',
    archetype: 'fmt',
    blurb: 'Turns a task outline into a numbered WBS with codes and point tags for the plan.',
    fields: [txt('t', 'Tasks (one per line)', 8, 'Kickoff\nDefine scope\nBuild core\nQA\nLaunch'), n('l', 'WBS level digits', { def: 2 }), sel('d', 'Include durations', ['Names only', 'Names + effort (pts)'])],
    compute: (v) => {
      const t = v.t as string, l = Math.max(1, Math.floor(v.l as number)), d = v.d as string
      const lines = t.split('\n').map((x) => x.trim()).filter(Boolean)
      const width = Math.max(1, l) + 1
      const doc = lines.map((task, i) => {
        const code = String(i + 1).padStart(width, '0')
        const depth = (line: string) => (line.match(/^\s+/) ? '  ' : '')
        return `${depth(task)}${code}${d.includes('Names only') ? '' : `  [~${num(Math.max(1, (i % 5) + 1), 0)} pts]`}  ${task.trim()}`
      }).join('\n')
      return [res('Codes generated', `${num(lines.length, 0)} items`, lines.length >= 3 ? T.good : T.warn, 'Numbering by level (1.1, 1.2) needs indented lines — indent sub-tasks with spaces.'), docRes('WBS', `WBS v1\n\n${doc}`)]
    },
  },
  {
    id: 'pert-program-evaluation-review-technique-estimator',
    archetype: 'est',
    blurb: 'Blends optimistic, likely and pessimistic estimates into a weighted duration with spread.',
    fields: [n('a', 'Optimistic (days)', { def: 12 }), n('b', 'Most likely (days)', { def: 20 }), n('c', 'Pessimistic (days)', { def: 40 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number
      const e = (a + 4 * b + c) / 6
      const sd = (c - a) / 6
      const varz = sd * sd
      const lo = Math.max(0, e - sd)
      return [
        res('PERT estimate', `${numD(e, 1)} days`, T.neutral, '(O + 4M + P) \u00f7 6'),
        res('Std deviation', `${numD(sd, 1)} days`, sd / Math.max(1, e) <= 0.25 ? T.good : T.warn, 'High spread means the estimate is fuzzy.'),
        res('Variance', `${numD(varz, 2)}`),
        res('68% window', `${numD(lo, 1)}–${numD(e + sd, 1)} days`, T.good),
      ]
    },
  },
  {
    id: 'project-resource-utilization-rate-calculator',
    archetype: 'est',
    blurb: 'Compares allocated project hours to available capacity to expose overallocated resources.',
    fields: [n('a', 'Allocated hours (week)', { def: 40 }), n('b', 'Available hours (week)', { def: 36 }), n('c', 'Avg billable efficiency %', { def: 85 }), n('d', 'Planned ramp (headcount)', { def: 5 })],
    compute: (v) => {
      const a = v.a as number, b = Math.max(1, v.b as number), c = v.c as number, d = v.d as number
      const util = clamp((a / b) * 100, 0, 100)
      const eff = (a * (c / 100)) / d
      return [
        res('Utilization', pct(util, 1), util <= 90 ? T.good : util <= 100 ? T.warn : T.bad, '85\u201390% is healthy; 100%+ is a burnout inbox.'),
        res('Efficiency-adjusted hours', `${numD(a * (c / 100), 1)} hrs`, T.neutral),
        res('Per-person effective', `${numD(eff, 1)} hrs`),
        res('Headroom', `${num(b - a, 1)} hrs`, b - a >= 0 ? T.good : T.bad),
      ]
    },
  },
  {
    id: 'project-cost-performance-index-cpi-calculator',
    archetype: 'est',
    blurb: 'Derives cost efficiency and a realistic completion budget from earned versus actual spend.',
    fields: [n('a', 'BAC', { def: 500000 }), n('b', 'Earned value (EV)', { def: 200000 }), n('c', 'Actual cost (AC)', { def: 240000 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = Math.max(1, v.c as number)
      const cpi = b / c
      const eac = a / cpi
      const etc = eac - c
      const vac = a - eac
      return [
        res('CPI', ratio(cpi, 2), cpi >= 1 ? T.good : cpi >= 0.95 ? T.warn : T.bad, 'Cost efficiency = EV \u00f7 AC.'),
        res('Overrun / underrun', `${vac >= 0 ? '+' : '-'}${money(Math.abs(vac))}`, vac >= 0 ? T.good : T.warn),
        res('EAC', money(eac), eac <= a * 1.1 ? T.good : T.bad),
        res('To complete (ETC)', money(etc), T.neutral, `${money(c)} spent so far.`),
      ]
    },
  },
  {
    id: 'project-schedule-performance-index-spi-calculator',
    archetype: 'est',
    blurb: 'Forecasts the real finish date from earned versus planned value today.',
    fields: [n('a', 'Planned value (PV)', { def: 250000 }), n('b', 'Earned value (EV)', { def: 210000 }), n('c', 'Elapsed (weeks)', { def: 12 }), n('d', 'Baseline duration (weeks)', { def: 26 })],
    compute: (v) => {
      const a = Math.max(1, v.a as number), b = v.b as number, c = v.c as number, d = v.d as number
      const spi = b / a
      const forecast = d / Math.max(0.1, spi)
      const slip = forecast - d
      return [
        res('SPI', ratio(spi, 2), spi >= 1 ? T.good : spi >= 0.9 ? T.warn : T.bad, 'Schedule efficiency = EV \u00f7 PV.'),
        res('Forecast duration', `${numD(forecast, 1)} weeks`, slip <= 2 ? T.good : slip <= 6 ? T.warn : T.bad),
        res('Schedule slip', `${numD(Math.max(0, slip), 1)} weeks`, slip <= 0 ? T.good : T.warn),
        res('Burn by week', `${numD((b / c) * 26 / d, 1)} pts/cohort`, T.neutral, 'Compare early burn to catch drift before month three.'),
      ]
    },
  },
  {
    id: 'project-billing-milestone-allocator',
    archetype: 'bdown',
    blurb: 'Splits the contract value into milestone invoices and computes when cash actually lands.',
    fields: [mxd('m', 'Milestones', ['Milestone', 'Value ($)', 'Acceptance %'], ['Kickoff (on-sign)', 'Discovery complete', 'Build \u2013 50%', 'Build \u2013 100%', 'Go-live'], [[30000, 100], [40000, 100], [60000, 100], [80000, 100], [40000, 100]]), n('r', 'Avg payment lag (days)', { def: 30 })],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Kickoff (on-sign)', 'Discovery complete', 'Build \u2013 50%', 'Build \u2013 100%', 'Go-live']
      const total = M.reduce((s, r) => s + (r[0] || 0), 0)
      const cash = M.filter((r, i) => i === 0 || (r[1] || 0) >= 50).reduce((s, r) => s + (r[0] || 0), 0)
      const waiting = total - cash
      const avg = M.reduce((s, r) => s + (r[0] || 0), 0) / Math.max(1, M.length)
      return [
        res('Contract value', money(total)),
        res('Cash by 50% build', money(cash), cash / Math.max(1, total) >= 0.5 ? T.good : T.warn, 'Ideally 50%+ of revenue is invoiced by mid-build.'),
        res('At-risk on acceptance', money(waiting), waiting / Math.max(1, total) <= 0.4 ? T.good : T.warn, `${labels.findIndex((_, i) => i === M.length - 1) >= 0 ? 'Last milestone' : 'Milestones'} left pending acceptance.`),
        res('Avg milestone', money(avg), T.neutral),
      ]
    },
  },
  {
    id: 'project-dependency-mapper',
    archetype: 'matrix',
    blurb: 'Maps cross-workstream dependencies and their lead times to predict delivery collisions.',
    fields: [mx('m', 'Dependencies', ['Open items', 'Avg lead (days)', 'Impact /5'], ['Platform services', 'Data pipelines', 'Design system', 'QA capacity', 'Procurement', 'Compliance review'])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Platform services', 'Data pipelines', 'Design system', 'QA capacity', 'Procurement', 'Compliance review']
      const open = M.reduce((s, r) => s + (r[0] || 0), 0)
      const lead = M.reduce((s, r) => s + (r[1] || 0), 0)
      const crit = M.filter((r) => (r[2] || 0) >= 4).length
      const top = M.reduce((bi, r, i) => ((r[2] || 0) > (M[bi][2] || 0) ? i : bi), 0)
      return [
        res('Open dependencies', `${num(open, 0)}`, open <= 4 ? T.good : open <= 8 ? T.warn : T.bad),
        res('Queue lead time', `${num(lead, 0)} days`, lead <= 15 ? T.good : lead <= 30 ? T.warn : T.bad),
        res('Critical links', `${num(crit, 0)}/6`, crit === 0 ? T.good : crit <= 2 ? T.warn : T.bad),
        res('Bottleneck', labels[top], T.warn, 'Buy the bottleneck: schedule its queue first.'),
      ]
    },
  },
  {
    id: 'project-portfolio-prioritization-matrix',
    archetype: 'matrix',
    blurb: 'Scores portfolio projects by value, effort and risk to keep the roadmap loaded with winners.',
    fields: [mxd('m', 'Portfolio projects', ['Strategic value /10', 'Effort (months)', 'Delivery risk /5'], ['Project A', 'Project B', 'Project C', 'Project D', 'Project E'], [[8, 6, 2], [6, 4, 3], [9, 8, 4], [7, 3, 2], [5, 2, 1]]), n('t', 'Max concurrent effort (months)', { def: 12 })],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Project A', 'Project B', 'Project C', 'Project D', 'Project E']
      const t = v.t as number
      const scores = M.map((r, i) => ({ i, s: (r[0] || 0) / Math.max(1, r[1] || 0) - (r[2] || 0) * 0.5 }))
      scores.sort((x, y) => y.s - x.s)
      const fittable = scores.filter((x) => M[x.i][1] + M[x.i][2] <= t)
      const top = scores[0]
      const totalEffort = M.reduce((s, r) => s + (r[1] || 0), 0)
      return [
        res('Top pick', labels[top.i], T.good, 'Highest value-per-effort after risk.'),
        res('Portfolio weight', `${num(scores.slice(0, 2).reduce((s, x) => s + M[x.i][1], 0), 1)} / ${num(t, 0)} mo`, scores.slice(0, 2).reduce((s, x) => s + M[x.i][1], 0) <= t ? T.good : T.warn),
        res('Projects in capacity', `${num(fittable.length, 0)}/5`, fittable.length >= 2 ? T.good : T.warn),
        res('Total effort', `${num(totalEffort, 0)} months`, T.neutral, 'Compare against the 12-month planning horizon.'),
      ]
    },
  },
  {
    id: 'resource-levelling-workload-balancer',
    archetype: 'matrix',
    blurb: 'Compares assigned hours to availability per resource and tells you who is overcommitted.',
    fields: [mxd('m', 'Resources', ['Assigned (hrs/wk)', 'Available (hrs/wk)'], ['Alex', 'Bailey', 'Casey', 'Dana', 'Eli'], [[40, 38], [48, 38], [32, 38], [45, 38], [38, 38]])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Alex', 'Bailey', 'Casey', 'Dana', 'Eli']
      const load = M.map((r) => (r[0] || 0) / Math.max(1, r[1] || 0))
      const avg = load.reduce((s, x) => s + x, 0) / Math.max(1, load.length) * 100
      const over = labels.filter((_, i) => load[i] > 1)
      const totalOver = M.reduce((s, r) => s + Math.max(0, (r[0] || 0) - (r[1] || 0)), 0)
      return [
        res('Avg allocation', pct(clamp(avg, 0, 100), 1), avg <= 90 ? T.good : avg <= 100 ? T.warn : T.bad),
        res('Overallocated', over.length ? over.join(', ') : 'None', over.length ? T.bad : T.good),
        res('Hours to rebalance', `${num(totalOver, 0)} hrs`, totalOver === 0 ? T.good : T.warn, 'Shift this many hours before the sprint commitment.'),
        res('Bench (slack)', `${M.reduce((s, r) => s + Math.max(0, (r[1] || 0) - (r[0] || 0)), 0)} hrs`, T.neutral),
      ]
    },
  },
  {
    id: 'project-status-report-rag-status-generator',
    archetype: 'index',
    blurb: 'Combines schedule, budget and risk inputs into a red/amber/green status and a health gauge.',
    fields: [n('a', 'Schedule health %', { def: 85 }), n('b', 'Budget health %', { def: 75 }), n('c', 'Open risks', { def: 6 }), n('d', 'Open blockers', { def: 1 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number
      const health = clamp(a * 0.4 + b * 0.4 + Math.max(0, 100 - c * 6) * 0.2 - d * 10, 0, 100)
      const rag = health >= 80 ? 'GREEN' : health >= 55 ? 'AMBER' : 'RED'
      const tone = rag === 'GREEN' ? T.good : rag === 'AMBER' ? T.warn : T.bad
      return [
        res('Health index', pct(health, 1), tone, 'Weighted from schedule, budget and risk flow.'),
        res('RAG status', rag, tone),
        res('Blockers', `${num(d, 0)} active`, d === 0 ? T.good : T.bad, 'Every blocker needs a named owner + unblock date.'),
        res('Risk register', `${num(c, 0)} open`, c <= 5 ? T.good : c <= 10 ? T.warn : T.bad),
      ]
    },
  },
  {
    id: 'time-and-materials-t-and-m-cap-calculator',
    archetype: 'est',
    blurb: 'Sizes the T&M burn against a cap so you can see the overage before the invoice drops.',
    fields: [n('a', 'Hourly rate ($)', { def: 150 }), n('b', 'Hours planned', { def: 400 }), n('c', 'Hours actual so far', { def: 320 }), n('d', 'Cap budget ($)', { def: 70000 }), n('e', 'Projected remaining hours', { def: 160 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = v.d as number, e = v.e as number
      const planned = a * b
      const spent = a * c
      const projected = spent + a * e
      const over = Math.max(0, projected - d)
      const headroom = d - spent
      return [
        res('Order value', money(planned)),
        res('Spent to date', money(spent), spent <= d ? T.good : T.bad),
        res('Projected total', money(projected), projected <= d * 1.05 ? T.good : projected <= d * 1.2 ? T.warn : T.bad),
        res('Cap headroom', money(headroom), headroom >= 0 ? T.good : T.bad),
        res('Out of cap', money(over), over === 0 ? T.good : T.bad, 'Overage needs a change request before work continues.'),
      ]
    },
  },
  {
    id: 'project-manager-allocation-matrix',
    archetype: 'matrix',
    blurb: 'Scores PM loads across programs so nobody silently carries two full-time programs.',
    fields: [mxd('m', 'Program managers', ['Programs', 'Allocated (hrs/wk)', 'Available (hrs/wk)'], ['PM 1', 'PM 2', 'PM 3', 'PM 4'], [[2, 40, 40], [3, 55, 40], [1, 24, 40], [2, 38, 40]])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['PM 1', 'PM 2', 'PM 3', 'PM 4']
      const loads = M.map((r) => (r[1] || 0) / Math.max(1, r[2] || 0))
      const over = labels.filter((_, i) => loads[i] > 1)
      const maxI = loads.reduce((bi, x, i) => (x > loads[bi] ? i : bi), 0)
      const hcm = (M[0]?.[1] || 0) + (M[1]?.[1] || 0) + (M[2]?.[1] || 0) + (M[3]?.[1] || 0)
      return [
        res('Total PM load', `${num(hcm, 0)} hrs/wk`, T.neutral),
        res('Overallocated PMs', over.length ? over.join(', ') : 'None', over.length ? T.bad : T.good),
        res('Hottest PM', labels[maxI], loads[maxI] >= 1 ? T.warn : T.neutral, 'Reallocate a program before ceremonies slip.'),
        res('Avg utilization', pct(clamp(loads.reduce((s, x) => s + x, 0) / M.length * 100, 0, 100), 1), loads.reduce((s, x) => s + x, 0) / M.length * 100 <= 92 ? T.good : T.warn),
      ]
    },
  },
  // ---------------- Change & Quality ----------------
  {
    id: 'project-change-request-cr-formatter',
    archetype: 'fmt',
    blurb: 'Formats a change request with impact, cost and schedule deltas plus a decision record.',
    fields: [txt('t', 'Change summary', 3, 'Add export to CSV'), sel('i', 'Impact scope', ['Low', 'Medium', 'High', 'Critical']), n('c', 'Cost delta ($)', { def: 12000 }), n('s', 'Schedule delta (days)', { def: 6 }), sel('p', 'Disposition', ['Approved', 'Deferred', 'Rejected', 'Needs sponsor'])],
    compute: (v) => {
      const t = v.t as string, i = v.i as string, c = v.c as number, s = v.s as number, p = v.p as string
      const risk = i === 'Critical' || s >= 10 ? 'HIGH' : i === 'High' || s >= 5 ? 'MEDIUM' : 'LOW'
      const doc = `CHANGE REQUEST (CR)\n\nTITLE: ${t || '(no title)'}\nIMPACT: ${i}\nCOST DELTA: ${money(c)}\nSCHEDULE DELTA: ${num(s, 0)} day(s)\nRISK CALL: ${risk}\nDISPOSITION: ${p}  \u00b7 decision date: ${new Date().toISOString().slice(0, 10)}\n\nScope statement (revised):\n${t}\n\nApproval chain:\n- Sponsor __________\n- PM __________\n- Finance __________`
      return [res('CR risk call', risk, risk === 'LOW' ? T.good : risk === 'MEDIUM' ? T.warn : T.bad, 'Pair every CR with a revised baseline and reprioritize the backlog.'),
        res('Disposition', p, p === 'Approved' ? T.neutral : p === 'Deferred' ? T.warn : T.bad), docRes('Change request', doc)]
    },
  },
  {
    id: 'bug-severity-and-priority-matrix',
    archetype: 'matrix',
    blurb: 'Scores open bugs by severity, priority and effort to triage the queue and size the fix.',
    fields: [mxd('m', 'Open bugs', ['Severity /5', 'Priority /5', 'Effort (hrs)'], ['Bug 1', 'Bug 2', 'Bug 3', 'Bug 4', 'Bug 5', 'Bug 6'], [[4, 4, 8], [3, 2, 4], [5, 5, 16], [2, 1, 2], [4, 3, 6], [3, 4, 10]])],
    compute: (v) => {
      const M = v.m as number[][]
      const p0 = M.filter((r) => (r[0] || 0) >= 4 && (r[1] || 0) >= 4).length
      const effort = M.reduce((s, r) => s + (r[2] || 0), 0)
      const avgSev = M.reduce((s, r) => s + (r[0] || 0), 0) / Math.max(1, M.length)
      return [
        res('P0 bugs', `${num(p0, 0)}`, p0 === 0 ? T.good : p0 <= 1 ? T.warn : T.bad, 'P0 = severity 4+ AND priority 4+.'),
        res('Fix effort', `${num(effort, 0)} hrs`, effort <= 30 ? T.good : effort <= 50 ? T.warn : T.bad),
        res('Avg severity', `${numD(avgSev, 1)}/5`, avgSev <= 3 ? T.good : T.warn),
        res('Sprint fit', effort <= 40 ? 'Fits one sprint' : 'Needs a spike', effort <= 40 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'risk-contingency-reserve-calculator',
    archetype: 'matrix',
    blurb: 'Prices a contingency reserve from probability-weighted risk categories instead of a guess.',
    fields: [mxd('m', 'Risk categories', ['Probability %', 'Impact ($)'], ['Schedule risk', 'Vendor / supply', 'Technical failure', 'Resource loss', 'Scope churn'], [[30, 25000], [20, 15000], [15, 60000], [10, 30000], [25, 20000]]), n('b', 'Project budget ($)', { def: 500000 })],
    compute: (v) => {
      const M = v.m as number[][]
      const b = v.b as number
      const ev = M.map((r) => ((r[0] || 0) / 100) * (r[1] || 0))
      const total = ev.reduce((s, x) => s + x, 0)
      const labels = ['Schedule risk', 'Vendor / supply', 'Technical failure', 'Resource loss', 'Scope churn']
      const top = ev.reduce((bi, x, i) => (x > ev[bi] ? i : bi), 0)
      return [
        res('Contingency reserve', money(total), total / Math.max(1, b) <= 0.15 ? T.good : total / Math.max(1, b) <= 0.25 ? T.warn : T.bad, 'Hold this as a true reserve, not part of the working budget.'),
        res('As % of budget', pct((total / Math.max(1, b)) * 100, 1), T.neutral),
        res('Biggest risk driver', labels[top], M[top]?.[1] && M[top]?.[1] >= 40000 ? T.warn : T.good),
        res('Exposure total', money(M.reduce((s, r) => s + (r[1] || 0), 0)), T.neutral),
      ]
    },
  },
  {
    id: 'defect-density-calculator',
    archetype: 'est',
    blurb: 'Normalizes found defects against code size and test cycles to compare quality across time.',
    fields: [n('a', 'Defects found (release)', { def: 42 }), n('b', 'Code size (KLOC)', { def: 80 }), n('c', 'Test cycles run', { def: 4 }), n('d', 'Critical defects', { def: 3 })],
    compute: (v) => {
      const a = v.a as number, b = Math.max(1, v.b as number), c = Math.max(1, v.c as number), d = v.d as number
      const density = a / b
      const perCycle = a / c
      const critShare = (d / a) * 100
      return [
        res('Defect density', `${numD(density, 2)}/KLOC`, density <= 0.5 ? T.good : density <= 1 ? T.warn : T.bad, 'Industry rule of thumb < 1/KLOC after hardening.'),
        res('Per test cycle', `${numD(perCycle, 1)}`, T.neutral),
        res('Critical share', pct(critShare, 1), critShare <= 8 ? T.good : T.warn),
        res('Escaped count (est)', `${num(Math.max(0, Math.round(a * 0.08 - d)), 0)}`, T.neutral, 'Expect ~8% to slip past test in averagely-gated releases.'),
      ]
    },
  },
  {
    id: 'root-cause-analysis-5-whys-ishikawa-builder',
    archetype: 'fmt',
    blurb: 'Turns a problem description and your why-chain into a clean 5-Whys / Ishikawa styled record.',
    fields: [txt('p', 'Problem statement', 2, 'Payment page timeout rose 4x last week'), txt('w', 'Why chain (one why per line)', 6, 'Calls now hit a slow upstream\nQueue backlog at checkout\nBilling service underprovisioned\nEstimate skipped for the new surge\nNo load test included in DoD'), sel('c', 'Fishbone category', ['Methods', 'Machine', 'Person', 'Materials', 'Measurements'])],
    compute: (v) => {
      const p = v.p as string, w = v.w as string, c = v.c as string
      const whys = w.split('\n').map((x) => x.trim()).filter(Boolean)
      const filled = [p].concat(whys).filter((x) => x !== '').length
      const doc = `ROOT CAUSE ANALYSIS\n\nProblem:\n${p || '(no problem given)'}\n\n5 WHYS:\n${whys.length ? whys.map((why, i) => `${i + 1}. Why? ${why}`).join('\n') : '(add a why chain)'}  \n\nREGENERATE / WRAP UP\n- Why #${Math.max(1, whys.length)} should express a system cause, not blame.\n\nISHIKAWA CATEGORY: ${c}\n\nCountermeasures:\n- \n- `
      return [res('Chain strength', `${filled}/6 lines`, filled >= 4 ? T.good : T.warn, 'Good chains bottom out in process or design — not people.'),
        res('Category', c, T.neutral),
        docRes('RCA record', doc)]
    },
  },
  {
    id: 'project-closure-checklist-builder',
    archetype: 'checklist',
    blurb: 'Verifies the closure gates so the project truly ends and nothing gets billed silently after.',
    fields: [ck('c', 'Closure gates', ['All deliverables accepted & signed', 'Punch list closed', 'Final invoice reconciled', 'Docs & runbooks archived', 'Access & vendor contacts returned', 'Lessons logged to wiki', 'Team released / reassigned', 'Support handover done'])],
    compute: (v) => {
      const items = (v.c as boolean[]) ?? []
      const done = items.filter(Boolean).length
      const missing = ['All deliverables accepted & signed', 'Punch list closed', 'Final invoice reconciled', 'Docs & runbooks archived', 'Access & vendor contacts returned', 'Lessons logged to wiki', 'Team released / reassigned', 'Support handover done'].filter((_, i) => !items[i])
      return [
        res('Closure readiness', pct(clamp((done / 8) * 100, 0, 100), 0), done === 8 ? T.good : done >= 6 ? T.warn : T.bad),
        res('Gates done', `${done}/8`, T.neutral),
        res('Open gates', missing.length ? missing.join('; ') : 'None', missing.length ? T.warn : T.good, 'Close these before you cut the code to prod.'),
      ]
    },
  },
  {
    id: 'six-sigma-dmaic-process-formatter',
    archetype: 'fmt',
    blurb: 'Structures the five DMAIC phases with inputs and outputs so the improvement cycle is complete.',
    fields: [txt('d', 'Define', 2, 'Cut order-processing time from 40 to 20 minutes'), txt('m', 'Measure', 2, 'Baseline: 40 min avg, 12 min std'), txt('a', 'Analyze', 2, 'Queue wait at credit check is 60% of total'), txt('i', 'Improve', 2, 'Async credit check, queued scoring'), txt('c', 'Control', 2, 'Alert on p99 > 30 min, weekly stat process')],
    compute: (v) => {
      const d = v.d as string, m = v.m as string, a = v.a as string, i = v.i as string, c = v.c as string
      const filled = [d, m, a, i, c].filter((x) => x.trim() !== '').length
      const doc = `DMAIC IMPROVEMENT FRAMEWORK\n\nDEFINE (problem & goal):\n${d || '(empty)'}\n\nMEASURE (baseline):\n${m || '(empty)'}\n\nANALYZE (root cause):\n${a || '(empty)'}\n\nIMPROVE (countermeasures):\n${i || '(empty)'}\n\nCONTROL (sustain):\n${c || '(empty)'}`
      return [res('Phases filled', `${filled}/5`, filled === 5 ? T.good : filled >= 3 ? T.warn : T.bad, 'Every phase needs at least one objective, or the cycle is theatre.'),
        docRes('DMAIC plan', doc)]
    },
  },
  {
    id: 'failure-mode-and-effects-analysis-fmea-calculator',
    archetype: 'matrix',
    blurb: 'Scores failure modes by severity, occurrence and detection and ranks them by RPN.',
    fields: [mxd('m', 'Failure modes', ['Severity /10', 'Occurrence /10', 'Detection /10'], ['Payment decline path', 'Checkout timeout', 'Sync corruption', 'Duplicate orders', 'IDP outage', 'Fraud false positive'], [[8, 4, 6], [6, 7, 4], [9, 2, 3], [7, 5, 5], [10, 1, 2], [5, 6, 6]])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Payment decline path', 'Checkout timeout', 'Sync corruption', 'Duplicate orders', 'IDP outage', 'Fraud false positive']
      const rpns = M.map((r) => (r[0] || 0) * (r[1] || 0) * (r[2] || 0))
      const maxR = Math.max(...rpns)
      const hi = rpns.filter((x) => x >= 100).length
      const avg = rpns.reduce((s, x) => s + x, 0) / Math.max(1, rpns.length)
      const top = rpns.indexOf(maxR)
      return [
        res('Highest RPN', `${num(maxR, 0)}`, maxR < 100 ? T.good : maxR < 200 ? T.warn : T.bad, `${labels[top]} \u00b7 attack the top driver first.`),
        res('Mean RPN', `${numD(avg, 1)}`, avg < 60 ? T.good : avg < 120 ? T.warn : T.bad),
        res('High-risk modes', `${num(hi, 0)}/6`, hi === 0 ? T.good : hi <= 2 ? T.warn : T.bad, 'RPN \u2265 100 needs action + re-score.'),
        res('Action priority', top >= M.length - 2 ? 'Software change' : 'Process design', T.neutral),
      ]
    },
  },
  {
    id: 'stakeholder-engagement-assessment-matrix',
    archetype: 'matrix',
    blurb: 'Maps stakeholders by interest and influence to set the right engagement cadence.',
    fields: [mxd('m', 'Stakeholders', ['Interest /5', 'Influence /5', 'Engagement /5'], ['Sponsor', 'Ops lead', 'Legal', 'Customer team', 'End users', 'Finance'], [[5, 5, 4], [4, 4, 3], [3, 5, 2], [4, 3, 3], [3, 2, 2], [4, 4, 5]])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Sponsor', 'Ops lead', 'Legal', 'Customer team', 'End users', 'Finance']
      const avg = M.reduce((s, r) => s + (r[2] || 0), 0) / Math.max(1, M.length)
      const low = M.filter((r) => (r[2] || 0) <= 2).length
      const ga = M.filter((r) => (r[0] || 0) >= 4 && (r[1] || 0) >= 4).length
      const cm = M.filter((r) => (r[0] || 0) >= 4 && (r[1] || 0) < 4).length
      return [
        res('Avg engagement', `${numD(avg, 1)}/5`, avg >= 3.5 ? T.good : avg >= 2.5 ? T.warn : T.bad),
        res('Manage closely', `${num(ga, 0)}`, T.neutral, labels.filter((_, i) => (M[i][0] || 0) >= 4 && (M[i][1] || 0) >= 4).join(', ') || '—'),
        res('Keep informed', `${num(cm, 0)}`, T.neutral),
        res('Under-engaged', `${num(low, 0)}`, low === 0 ? T.good : T.warn, 'Silent stakeholders are a risk to decisions.'),
      ]
    },
  },
  {
    id: 'quality-assurance-qa-pass-fail-ratio-calculator',
    archetype: 'est',
    blurb: 'Sizes pass, fail and blocked test results into the ratios that gate the release.',
    fields: [n('a', 'Tests passed', { def: 812 }), n('b', 'Tests failed', { def: 34 }), n('c', 'Tests blocked', { def: 12 }), n('d', 'Total automated suite', { def: 900 })],
    compute: (v) => {
      const a = v.a as number, b = v.b as number, c = v.c as number, d = Math.max(1, v.d as number)
      const passRate = (a / d) * 100
      const failRate = (b / d) * 100
      const ratio = b > 0 ? a / b : d
      return [
        res('Pass rate', pct(passRate, 1), passRate >= 95 ? T.good : passRate >= 85 ? T.warn : T.bad, 'Gate missing tests the same way you gate failing ones.'),
        res('Fail rate', pct(failRate, 1), failRate <= 5 ? T.good : T.warn),
        res('Pass : fail', `1 : ${numD(ratio < 1 ? 1 / Math.max(0.01, ratio) : ratio, 1)}`, ratio >= 15 ? T.good : ratio >= 8 ? T.warn : T.bad),
        res('Blocked', `${num(c, 0)}`, c <= 5 ? T.good : c <= 12 ? T.warn : T.bad, 'Blocked tests inflate pass rate — get them unstuck.'),
      ]
    },
  },
  {
    id: 'cost-of-poor-quality-copq-calculator',
    archetype: 'bdown',
    blurb: 'Breaks the price of bad quality into failure, appraisal and prevention buckets and ranks them.',
    fields: [mxd('m', 'Quality cost buckets', ['Cost ($)', 'Share %'], ['Internal failure (rework)', 'External failure (warranty/churn)', 'Appraisal (testing & audit)', 'Prevention (training & design)'], [[42000, 100], [58000, 100], [15000, 100], [8000, 100]]), n('r', 'Revenue ($)', { def: 1200000 })],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Internal failure (rework)', 'External failure (warranty/churn)', 'Appraisal (testing & audit)', 'Prevention (training & design)']
      const total = M.reduce((s, r) => s + (r[0] || 0), 0)
      const intF = M[0]?.[0] || 0
      const extF = M[1]?.[0] || 0
      const prev = M[3]?.[0] || 0
      const r = Math.max(1, v.r as number)
      const top = M.reduce((bi, r, i) => ((r[0] || 0) > (M[bi][0] || 0) ? i : bi), 0)
      return [
        res('Total COPQ', money(total), total / r <= 0.1 ? T.good : total / r <= 0.2 ? T.warn : T.bad, 'Below 10% of revenue is achievable with solid QA.'),
        res('COPQ % of revenue', pct((total / r) * 100, 1), T.neutral),
        res('External vs internal', `${money(extF)} vs ${money(intF)}`, extF <= intF ? T.good : T.bad, 'External failure is the most expensive kind — it ships to customers.'),
        res('Prevention share', pct((prev / Math.max(1, total)) * 100, 1), prev / Math.max(1, total) >= 0.15 ? T.good : T.warn, 'Raise prevention; it pulls the other buckets down.'),
        res('Biggest bucket', labels[top], T.warn),
      ]
    },
  },
  {
    id: 'project-risk-exposure-value-calculator',
    archetype: 'matrix',
    blurb: 'Turns each risk\u2019s probability and impact into a monetary exposure for the risk register.',
    fields: [mxd('m', 'Risks', ['Probability %', 'Impact ($)'], ['Key person loss', 'Vendor delay', 'Scope increase', 'Security incident', 'Market shift'], [[25, 80000], [40, 30000], [35, 25000], [10, 200000], [20, 150000]])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Key person loss', 'Vendor delay', 'Scope increase', 'Security incident', 'Market shift']
      const ev = M.map((r) => ((r[0] || 0) / 100) * (r[1] || 0))
      const total = ev.reduce((s, x) => s + x, 0)
      const top = ev.reduce((bi, x, i) => (x > ev[bi] ? i : bi), 0)
      const hi = M.filter((r) => (r[1] || 0) >= 100000).length
      return [
        res('Total exposure', money(total), T.neutral, 'EV = probability \u00d7 impact, summed across the register.'),
        res('Top risk', labels[top], T.warn, `$ ${num(M[top]?.[1] || 0, 0)} impact at ${num(M[top]?.[0] || 0, 0)}%.`),
        res('Hi-impact risks', `${num(hi, 0)}`, hi <= 2 ? T.good : T.warn, 'Aggregate big-ticket risks get their own mitigation line.'),
        res('Register coverage', `${num(M.length, 0)} risks`, M.length >= 5 ? T.good : T.warn),
      ]
    },
  },
  {
    id: 'design-thinking-journey-map-formatter',
    archetype: 'fmt',
    blurb: 'Frames the five design-thinking stages into a journey record with pains and opportunities.',
    fields: [txt('em', 'Empathize (who & pains)', 2, 'New admins can\u2019t find where to configure billing'), txt('de', 'Define (point of view)', 2, 'Admins need discoverable, guided billing setup'), txt('id', 'Ideate (3+ concepts)', 3, 'Wizard \u00b7 progressive disclosure \u00b7 inline help'), txt('pr', 'Prototype (what to show)', 2, 'Clickable wizard with defaults'), txt('te', 'Test (success measure)', 2, 'Setup time < 4 min, success > 90%')],
    compute: (v) => {
      const em = v.em as string, de = v.de as string, id = v.id as string, pr = v.pr as string, te = v.te as string
      const filled = [em, de, id, pr, te].filter((x) => x.trim() !== '').length
      const doc = `DESIGN THINKING JOURNEY MAP\n\n1. EMPATHIZE\n${em || '(empty)'}\n\n2. DEFINE (POV)\n${de || '(empty)'}\n\n3. IDEATE\n${id || '(empty)'}\n\n4. PROTOTYPE\n${pr || '(empty)'}\n\n5. TEST\n${te || '(empty)'}\n\nRANKING: journey steps scored /10 for pain \u2192 opportunity never beats a shipped prototype.`
      return [res('Stages filled', `${filled}/5`, filled === 5 ? T.good : filled >= 3 ? T.warn : T.bad, 'Fastest learning curve here: prototype on paper, test on real users.'),
        docRes('Journey map', doc)]
    },
  },
  {
    id: 'process-cycle-efficiency-pce-calculator',
    archetype: 'index',
    blurb: 'Scores how much of the total lead time is value-adding versus waiting to spotlight the waste.',
    fields: [n('a', 'Value-add time (hours)', { def: 3 }), n('b', 'Total lead time (hours)', { def: 40 })],
    compute: (v) => {
      const a = v.a as number, b = Math.max(1, v.b as number)
      const pce = clamp((a / b) * 100, 0, 100)
      const waste = 100 - pce
      return [
        res('Process cycle efficiency', pct(pce, 1), pce >= 20 ? T.good : pce >= 10 ? T.warn : T.bad, 'Lean benchmarks: 5\u201320% is typical; 50%+ is elite.'),
        res('Waiting / waste share', pct(waste, 1), waste <= 80 ? T.good : T.warn),
        res('Value-add hours', hours(a)),
        res('Queued time', hours(b - a), (b - a) <= a * 4 ? T.good : T.warn, 'Every handoff boundary is where the queue grows.'),
      ]
    },
  },
  {
    id: 'project-post-mortem-lesson-learned-builder',
    archetype: 'fmt',
    blurb: 'Captures what went well, what hurt and the concrete changes in a blame-free post-mortem.',
    fields: [txt('w', 'What went well', 3, 'Weekly demos kept sponsors aligned'), txt('b', 'What went wrong', 3, 'Integration entered too late'), txt('l', 'Lesson / root cause', 2, 'No integration spike in discovery'), txt('a', 'Actions for next time', 3, 'Double-schedule the integration spike'), sel('p', 'Phase', ['Discovery', 'Build', 'Go-live', 'Hypercare'])],
    compute: (v) => {
      const w = v.w as string, b = v.b as string, l = v.l as string, a = v.a as string, p = v.p as string
      const filled = [w, b, l, a].filter((x) => x.trim() !== '').length
      const doc = `POST-MORTEM \u00b7 ${p}\n\nWENT WELL\n${w || '(empty)'}\n\nWENT WRONG\n${b || '(empty)'}\n\nROOT CAUSE / LESSON\n${l || '(empty)'}\n\nACTIONS (owner ______ , due ______)\n${a || '(empty)'}\n\nRule: every lesson maps to a changed behavior, or it stays a lesson.`
      return [res('Completeness', `${filled}/4`, filled === 4 ? T.good : filled >= 3 ? T.warn : T.bad, 'Blame-free framing keeps the honest entries flowing.'),
        docRes('Post-mortem', doc)]
    },
  },
  {
    id: 'defect-removal-efficiency-dre-calculator',
    archetype: 'matrix',
    blurb: 'Scores how many defects each phase removes versus how many slip through to gauge test leverage.',
    fields: [mxd('m', 'Phases', ['Defects injected', 'Defects caught'], ['Requirements', 'Design', 'Code', 'Test', 'UAT / prod escaper'], [[20, 16], [15, 11], [60, 52], [25, 23], [0, 0]])],
    compute: (v) => {
      const M = v.m as number[][]
      const labels = ['Requirements', 'Design', 'Code', 'Test', 'UAT / prod escaper']
      const injected = M.reduce((s, r) => s + (r[0] || 0), 0)
      const caught = M.reduce((s, r) => s + (r[1] || 0), 0)
      const escaped = Math.max(0, injected - caught)
      const dre = injected ? clamp((caught / injected) * 100, 0, 100) : 0
      const last = M[M.length - 1]
      const escProd = last ? (last[0] ?? 0) : escaped
      const eff = M.map((r) => ((r[0] || 0) > 0 ? ((r[1] || 0) / (r[0] || 0)) * 100 : 100))
      const worst = eff.reduce((bi, x, i) => (x < eff[bi] ? i : bi), 0)
      return [
        res('Defect removal efficiency', pct(dre, 1), dre >= 85 ? T.good : dre >= 70 ? T.warn : T.bad, 'Push DRE toward 90%+ before release.'),
        res('Escaped to prod', `${num(escProd, 0)}`, escProd <= injected * 0.05 ? T.good : T.warn),
        res('Weakest phase', labels[worst], eff[worst] < 80 ? T.warn : T.good, `${numD(eff[worst], 1)}% caught there.`),
        res('Injection vs catch', `${num(caught, 0)} / ${num(injected, 0)}`, T.neutral),
      ]
    },
  },
  {
    id: 'pmp-audit-checklist-builder',
    archetype: 'checklist',
    blurb: 'Runs the PMP-style audit gates so every artifact a review must find is on hand.',
    fields: [ck('c', 'Audit evidence', ['Charter & scope SOW', 'WBS & schedule baseline', 'Budget & cost logs', 'Risk register (updated)', 'Change log (approved CRs)', 'Stakeholder & comms plan', 'Quality & test reports', 'Lessons learned log', 'Approvals signed (gate exit)', 'Closure & handover docs'])],
    compute: (v) => {
      const items = (v.c as boolean[]) ?? []
      const done = items.filter(Boolean).length
      const missing = ['Charter & scope SOW', 'WBS & schedule baseline', 'Budget & cost logs', 'Risk register (updated)', 'Change log (approved CRs)', 'Stakeholder & comms plan', 'Quality & test reports', 'Lessons learned log', 'Approvals signed (gate exit)', 'Closure & handover docs'].filter((_, i) => !items[i])
      const prepare = done >= 8 ? 'Ready for audit' : done >= 5 ? 'Preparation needed' : 'Not ready'
      return [
        res('Audit readiness', pct(clamp((done / 10) * 100, 0, 100), 0), done === 10 ? T.good : done >= 8 ? T.good : done >= 5 ? T.warn : T.bad),
        res('Verdict', prepare, prepare === 'Ready for audit' ? T.good : prepare === 'Preparation needed' ? T.warn : T.bad),
        res('Missing artifacts', missing.length ? missing.slice(0, 4).join('; ') : 'None', missing.length ? T.warn : T.good, 'A clean file box is half the audit score.'),
      ]
    },
  },
]