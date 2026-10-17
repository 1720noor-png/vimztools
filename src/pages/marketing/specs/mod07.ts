import { n, sel, txt, ck, res, doc, T, asNum, asSel, asStr, asBoolList, clamp, ratio } from '../../office/archetypes/spec'
import type { MarketingSeoSpec } from './marketingSpec'

const SUBJECT = 'Link Building & Outreach'

export const mod07: MarketingSeoSpec[] = [
  {
    id: 'backlink-checker',
    name: 'Backlink Checker',
    archetype: 'index',
    subject: SUBJECT,
    blurb:
      'Rolls up your total links, referring domains, dofollow share and average authority into one readable link-profile score.',
    tip: 'Referral diversity beats raw link count: 60+ unique domains with solid authority moves you more than 5,000 sitewide links.',
    usage: [
      'Export your backlink report from any SEO tool.',
      'Enter the headline aggregates.',
      'Read the profile score and equity verdict.',
    ],
    method: [
      'Referral share weights the true influence of the profile.',
      'Dofollow proportion reflects how much PageRank actually flows.',
      'The profile score blends authority, diversity and toxicity inputs.',
    ],
    fields: [
      txt('domain', 'Domain', 1, 'example.com'),
      n('links', 'Total backlinks', { def: 1200, min: 0 }),
      n('domains', 'Referring domains', { def: 45, min: 0 }),
      n('avda', 'Average domain authority', { def: 42, min: 0, max: 100 }),
      n('dofollow', 'Dofollow links', { def: 640, min: 0 }),
      n('toxic', 'Suspicious links', { def: 3, min: 0 }),
    ],
    compute: (v) => {
      const links = asNum(v.links)
      const domains = asNum(v.domains)
      const avda = asNum(v.avda)
      const dof = asNum(v.dofollow)
      const tox = asNum(v.toxic)
      const div = domains / Math.max(1, links / 10)
      const dofR = clamp(links ? dof / links : 0, 0, 1)
      const toxR = clamp(links ? tox / links : 0, 0, 1)
      const score = Math.round(clamp(avda * 0.45 + div * 16 + dofR * 28 - toxR * 50, 0, 100))
      return [
        res('Profile score', `${score}/100`, score >= 65 ? T.good : score >= 40 ? T.warn : T.bad),
        res('Referral diversity', ratio(div, 1) + 'x', div >= 0.6 ? T.good : T.warn, 'Higher is healthier'),
        res('Dofollow share', (dofR * 100).toFixed(0) + '%', dofR >= 0.5 ? T.good : T.warn),
        res('Toxic share', (toxR * 100).toFixed(2) + '%', toxR < 0.01 ? T.good : T.bad),
        doc('Equity verdict', score >= 65 ? 'Healthy profile \u2014 keep earning diversity.' : score >= 40 ? 'Watch list \u2014 prune toxic links, push dofollow.' : 'At risk \u2014 a cleanup and new-authority push is overdue.'),
      ]
    },
  },
  {
    id: 'backlink-quality-checker',
    name: 'Backlink Quality Checker',
    archetype: 'scorecard',
    subject: SUBJECT,
    blurb:
      'Scores a single backlink on authority, topical fit, anchor match, placement and follow status to say keep, disavow or build more like it.',
    tip: 'A 60-DA link from off-topic real estate moves you less than a 30-DA link from your own niche \u2014 context is the multiplier.',
    usage: [
      'Pick one link from your report.',
      'Input its authority and placement signals.',
      'Read the keep/disavow verdict.',
    ],
    method: [
      'Authority, relevance and formatting each map to weighted points.',
      'Topical fit is the strongest single predictor of pass-through value.',
      'The final tier maps the score to a concrete action.',
    ],
    fields: [
      txt('url', 'Linking URL', 1, 'blog.example.com/guest-post'),
      n('da2', 'Domain authority', { def: 45, min: 0, max: 100 }),
      sel('rel', 'Topical relevance', ['Exact niche', 'Related niche', 'Generic', 'Off-topic'], 'Related niche'),
      sel('anchor', 'Anchor match', ['Exact match', 'Partial', 'Branded', 'Generic', 'Naked URL'], 'Partial'),
      sel('place', 'Placement', ['In-content', 'Sidebar', 'Footer', 'Comment'], 'In-content'),
      n('ref', 'Linking page referrals', { def: 380, min: 0 }),
    ],
    compute: (v) => {
      const da = asNum(v.da2)
      const rel = asSel(v.rel)
      const anc = asSel(v.anchor)
      const place = asSel(v.place)
      const ref = asNum(v.ref)
      const relS = rel === 'Exact niche' ? 1 : rel === 'Related niche' ? 0.8 : rel === 'Generic' ? 0.45 : 0.2
      const ancS = anc === 'Exact match' ? 1 : anc === 'Partial' ? 0.85 : anc === 'Branded' ? 0.7 : anc === 'Generic' ? 0.5 : 0.4
      const placeS = place === 'In-content' ? 1 : place === 'Sidebar' ? 0.6 : place === 'Footer' ? 0.35 : 0.15
      const score = Math.round(clamp((da / 100) * 40 + relS * 26 + ancS * 18 + placeS * 16, 0, 100))
      const tier = score >= 70 ? 'Keep & replicate' : score >= 42 ? 'Medium \u2014 maintain' : 'Low \u2014 disavow or ignore'
      return [
        res('Link quality', `${score}/100`, score >= 70 ? T.good : score >= 42 ? T.warn : T.bad),
        res('Verdict', tier, score >= 70 ? T.good : T.warn),
        res('Traffic potential', ratio(ref / 100, 1) + ' deals/mo'),
      ]
    },
  },
  {
    id: 'link-building-opportunity-finder',
    name: 'Link Building Opportunity Finder',
    archetype: 'bdown',
    subject: SUBJECT,
    blurb:
      'Scans your niche\u2019s linkable asset patterns to surface the highest-yield places to hunt for links next.',
    tip: 'Prioritize "resource pages" and "roundups" in your niche \u2014 they accept guest links faster than internet-newspaper pitches.',
    usage: [
      'Identify your niche and the SERP authority level.',
      'Indicate the publication types you can pitch.',
      'Let the tool output a prioritized hunting list.',
    ],
    method: [
      'Each publication type carries a link-yield base weight.',
      'Authority tolerance and niche temper the addressable count.',
      'The final list ranks types by estimated effort-to-value.',
    ],
    fields: [
      txt('niche7', 'Niche', 2, 'personal finance blogs'),
      sel('auth', 'Target authority tier', ['DA 20-30', 'DA 30-50', 'DA 50+'], 'DA 30-50'),
      ck('types', 'Linkable asset types to hunt', ['Guest posts', 'Roundups', 'Resource pages', 'Upcoming lists', 'Podcast mentions', 'News mentions']),
      n('pages7', 'Prospect pages to research', { def: 40, min: 1, max: 200 }),
    ],
    compute: (v) => {
      const types = ['Guest posts', 'Roundups', 'Resource pages', 'Upcoming lists', 'Podcast mentions', 'News mentions']
      const on = types.filter((_, i) => asBoolList(v.types)[i])
      const yieldW: Record<string, number> = { 'Guest posts': 0.8, 'Roundups': 1, 'Resource pages': 1.1, 'Upcoming lists': 0.9, 'Podcast mentions': 0.6, 'News mentions': 0.5 }
      const row = on.length ? on : ['Resource pages']
      const total = asNum(v.pages7)
      const ranked = [...row].sort((a, b) => (yieldW[b] ?? 0.5) - (yieldW[a] ?? 0.5))
      const estGot = Math.round(total * (row.length ? Math.max(...row.map((t) => yieldW[t] ?? 0.5)) : 0.5) * 0.08)
      return [
        res('Targeted asset types', `${ranked.length}`, T.good),
        res('Prospects to contact', `${total}`, T.good),
        res('Estimated links won', `${estGot}`, estGot > 2 ? T.good : T.warn, 'Expect ~8% success on well-targeted outreach'),
        doc('Hunt order', ranked.map((t, i) => `${i + 1}. ${t} \u2014 yield ${(yieldW[t] ?? 0.5) * 100}%`).join('\n')),
      ]
    },
  },
  {
    id: 'broken-link-finder',
    name: 'Broken Link Finder',
    archetype: 'est',
    subject: SUBJECT,
    blurb:
      'Estimates how many dead outbound links your target pages likely carry, then converts that into a repair-and-pitch workload.',
    tip: 'Broken link building converts best on "resources" pages; fix 10-15 and use them as the pitch for one quality replacement.',
    usage: [
      'Enter the number of pages to scan.',
      'Estimate outbound links and breakage rate.',
      'Use the workload output to plan the campaign.',
    ],
    method: [
      'Breakage probability scales with outbound link volume.',
      'Expected value is computed as pages * links-per-page * breakage rate.',
      'Person-days uses a proven 12 per-hour fix rate.',
    ],
    fields: [
      n('pages8', 'Pages to scan', { def: 50, min: 1 }),
      n('per8', 'Outbound links per page', { def: 25, min: 1, max: 300 }),
      n('rate8', 'Expected breakage (%)', { def: 4, min: 0.5, max: 30 }),
    ],
    compute: (v) => {
      const pages = asNum(v.pages8)
      const per = asNum(v.per8)
      const rate = asNum(v.rate8) / 100
      const found = Math.round(pages * per * rate)
      const hours = Math.round((found / 12) * 100) / 100
      const days = Math.round(hours / 6)
      const reachable = Math.round(found * 0.6)
      return [
        res('Broken links expected', `${found}`, found > 0 ? T.good : T.warn),
        res('Fix & outreach time', `${hours} hours (~${days} days)`),
        res('Recoverable', `${reachable}` + ' replacement pitches', reachable > 5 ? T.good : T.warn),
        doc('Campaign brief', `Scan ${pages} pages, expect ~${found} broken links, prioritise the ${reachable} resource-worthy ones for replacement pitches.`),
      ]
    },
  },
  {
    id: 'anchor-text-generator',
    name: 'Anchor Text Generator',
    archetype: 'log',
    subject: SUBJECT,
    blurb:
      'Produces a safe anchor-text blend for any target URL \u2014 exact, partial, branded, naked and generic \u2014 with the ratios Google rewards.',
    tip: 'Keep exact-match anchors under ~15% of your total profile; a 60/40 branded-vs-exact split reads as natural.',
    usage: [
      'Enter the target keyword and your brand.',
      'Copy the URL you want ranked.',
      'Spread the generated anchors across your link profile.',
    ],
    method: [
      'Each anchor family serves a different ranking and trust signal.',
      'Suggested ratios follow the natural-authority bell curve.',
      'Naked and generic anchors anchor the "natural" zone of the profile.',
    ],
    fields: [
      txt('kw9', 'Target keyword', 2, 'seo audit tool'),
      txt('brand9', 'Brand name', 2, 'vimz'),
      n('tn9', 'Links to plan', { def: 12, min: 1, max: 60 }),
    ],
    compute: (v) => {
      const kw = asStr(v.kw9) || 'seo audit tool'
      const brand = asStr(v.brand9) || 'vimz'
      const t = asNum(v.tn9) || 12
      const exact = Math.round(t * 0.15)
      const partial = Math.round(t * 0.3)
      const branded = Math.round(t * 0.3)
      const naked = Math.round(t * 0.15)
      const generic = Math.max(0, t - exact - partial - branded - naked)
      const list = [
        `\u2022 ${kw} (exact x${exact})`,
        `\u2022 ${kw} \u2014 ${brand} (partial x${partial})`,
        `\u2022 ${brand} (branded x${branded})`,
        `\u2022 ${brand}.com (naked x${naked})`,
        `\u2022 click here / learn more (generic x${generic})`,
      ]
      return [
        res('Exact anchors', `${exact} (${((exact / t) * 100).toFixed(0)}%)`, exact <= Math.round(t * 0.2) ? T.good : T.warn),
        res('Branded share', `${((branded / t) * 100).toFixed(0)}%`, T.good, 'Natural profiles skew branded'),
        doc('Anchor blend', list.join('\n')),
      ]
    },
  },
  {
    id: 'anchor-text-distribution-checker',
    name: 'Anchor Text Distribution Checker',
    archetype: 'scorecard',
    subject: SUBJECT,
    blurb:
      'Compares your current anchor mix against the natural-authority benchmark to flag over-optimization risk before it bites.',
    tip: 'If exact-match exceeds 20% of the profile, dilute with branded, URL and phrase anchors on your next 20 links.',
    usage: [
      'Estimate your current anchor mix percentages.',
      'Run the benchmark comparison.',
      'Re-balance via your next outreach batch.',
    ],
    method: [
      'Benchmark weights model the anchor patterns of natural leaders.',
      'Deviation is measured per family and summed with penalties.',
      'Risk tone triggers when over-fitting crosses the 20% guardrail.',
    ],
    fields: [
      n('ex6', 'Exact-match (%)', { def: 22, min: 0, max: 100 }),
      n('er6', 'Partial/related (%)', { def: 30, min: 0, max: 100 }),
      n('bm6', 'Branded (%)', { def: 28, min: 0, max: 100 }),
      n('nu6', 'Naked URL (%)', { def: 12, min: 0, max: 100 }),
      n('gg6', 'Generic (%)', { def: 8, min: 0, max: 100 }),
    ],
    compute: (v) => {
      const ex = asNum(v.ex6)
      const er = asNum(v.er6)
      const bm = asNum(v.bm6)
      const nu = asNum(v.nu6)
      const gg = asNum(v.gg6)
      const total = ex + er + bm + nu + gg || 1
      const dev = Math.abs(ex / total - 0.12) * 3 + Math.abs(er / total - 0.3) * 2.2 + Math.abs(bm / total - 0.3) * 2 + Math.abs(nu / total - 0.15) * 2 + Math.abs(gg / total - 0.13) * 2
      const risk = Math.round(clamp(dev * 100, 0, 100))
      return [
        res('Over-optimization risk', `${risk}%`, risk < 30 ? T.good : risk < 55 ? T.warn : T.bad),
        res('Exact-match share', `${((ex / total) * 100).toFixed(0)}%`, ex / total <= 0.2 ? T.good : T.warn),
        res('Profile spread', `${ratio(nu / total + bm / total + gg / total, 2)} natural`),
        doc('Rebalancing hint', ex / total > 0.2 ? 'Dilute exact-match anchors with branded and phrase anchors next batch.' : 'Profile within natural guardrails \u2014 keep the mix steady.'),
      ]
    },
  },
  {
    id: 'internal-link-suggestion-tool',
    name: 'Internal Link Suggestion Tool',
    archetype: 'matrix',
    subject: SUBJECT,
    blurb:
      'Matches each page with related pages already on your site so you can pass equity internally without new outreach.',
    tip: 'Link from the taller page (more links in) to the shorter one \u2014 internal linking is how you spread authority without builders.',
    usage: [
      'Enter the target page title.',
      'Paste candidate pages from your sitemap.',
      'Pick the top matches and place contextual anchors.',
    ],
    method: [
      'Token overlap matches pages that share topical vocabulary.',
      'Context preference ranks content-embedded mentions above footers.',
      'Authority flow is estimated per matched link placed in-body.',
    ],
    fields: [
      txt('pt11', 'Target page title', 2, 'On-page SEO checklist'),
      txt('cands11', 'Candidate pages (one per line)', 5, 'Keyword research guide\nSitemap generator\nMeta description checker'),
      sel('ctx11', 'Placement context', ['In-content', 'Related articles', 'Menu', 'Footer'], 'In-content'),
    ],
    compute: (v) => {
      const title = asStr(v.pt11).toLowerCase()
      const cands = (asStr(v.cands11) || 'Home\nAbout').split('\n').map((s) => s.trim()).filter(Boolean)
      const tokens = (t: string) => new Set(t.replace(/[^a-z ]/gi, '').split(/\s+/g).filter(Boolean))
      const tt = tokens(title)
      const scored = cands.map((c) => {
        const ct = tokens(c.toLowerCase())
        const inter = [...tt].filter((w) => ct.has(w)).length
        const sim = tt.size ? inter / tt.size : 0
        return { c, sim }
      }).sort((a, b) => b.sim - a.sim)
      const picks = scored.slice(0, Math.min(5, cands.length)).filter((s) => s.sim > 0 || true)
      const flow = picks.length * (asSel(v.ctx11) === 'In-content' ? 1 : asSel(v.ctx11) === 'Related articles' ? 0.7 : 0.4)
      return [
        res('Suggested links', `${picks.length}`, picks.length >= 3 ? T.good : T.warn),
        res('Equity boost', `+${(flow * 8).toFixed(0)}% model`, flow >= 3 ? T.good : T.warn),
        doc('Place these anchors (High \u2192 Low match)', picks.map((p, i) => `${i + 1}. ${p.c} \u2014 ${(p.sim * 100).toFixed(0)}%`).join('\n')),
      ]
    },
  },
  {
    id: 'link-reclamation-tool',
    name: 'Link Reclamation Tool',
    archetype: 'est',
    subject: SUBJECT,
    blurb:
      'Counts your brand mentions that lack a link and sizes the outreach effort to turn unlinked buzz into flowing equity.',
    tip: '98% of brand mentions go unlinked by default \u2014 a polite "would you link us?" wins most of them.',
    usage: [
      'Track your brand mentions in a monitoring tool.',
      'Split them into linked vs unlinked.',
      'Send the reclamation ask to the unlinked set.',
    ],
    method: [
      'Unlinked mentions are derived from total minus already-linked.',
      'A benchmark of ~40% acceptance is applied for planning.',
      'Effort is scaled by average reply threads per reclamation.',
    ],
    fields: [
      txt('brand12', 'Brand name', 2, 'vimz tools'),
      n('tot12', 'Total mentions', { def: 120, min: 0 }),
      n('linked12', 'Already linked', { def: 9, min: 0 }),
      n('avg12', 'Avg threads per reply', { def: 2, min: 1, max: 6 }),
    ],
    compute: (v) => {
      const total = asNum(v.tot12)
      const linked = asNum(v.linked12)
      const unlinked = Math.max(0, total - linked)
      const ace = Math.round(unlinked * 0.4)
      const hrs = Math.round(unlinked * asNum(v.avg12) * 6 / 60 * 10) / 10
      return [
        res('Unlinked mentions', `${unlinked}`, unlinked > 10 ? T.good : T.warn),
        res('Expected links won', `${ace}`, ace > 5 ? T.good : T.warn, '~40% acceptance benchmark'),
        res('Effort', `${hrs} hours`),
        doc('Playbook', `Email the top ${unlinked} mentioners: thank them, suggest linking ${asStr(v.brand12) || 'your brand'}, expect ~${ace} conversions.`),
      ]
    },
  },
  {
    id: 'guest-post-outreach-generator',
    name: 'Guest Post Outreach Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Builds a cold-but-kind guest-post pitch that names the editor, their blog, your idea and the win for their readers.',
    tip: 'Reference one real article on their site in the first two sentences \u2014 personalization is what gets the yes.',
    usage: [
      'Fill in the publication and the editor.',
      'Describe your demo topic and your angle.',
      'Customize the generated pitch with one named post.',
    ],
    method: [
      'The greeting personalizes with the editor and publication name.',
      'The demo-topic line frames your idea as their reader\u2019s win.',
      'The CTA proposes a narrow first step instead of a big ask.',
    ],
    fields: [
      txt('pub13', 'Publication', 2, 'Marketing Weekly'),
      txt('ed13', 'Editor name', 2, 'Sarah'),
      txt('topic13', 'Proposed topic', 3, 'How we cut PPC waste by 31% with campaign autopsy'),
      txt('angle13', 'Your unique angle', 3, 'A real team\u2019s failed campaign post-mortem'),
    ],
    compute: (v) => {
      const pub = asStr(v.pub13) || 'Marketing Weekly'
      const ed = asStr(v.ed13) || 'editor'
      const topic = asStr(v.topic13) || 'your proposed topic'
      const angle = asStr(v.angle13) || 'a fresh angle'
      const raw = [
        `Subject: Guest post idea for ${pub}: ${topic}`,
        '',
        `Hi ${ed},`,
        '',
        `I\u2019m a big reader of ${pub} \u2014 the piece you ran on creative testing is still my favourite.`,
        `I\u2019d love to contribute \u201c${topic}\u201d, built around ${angle}. It\u2019s actionable for your audience and needs zero promotion.`,
        '',
        `Would a 1,200-word draft with an outline attached work? Happy to match your style guide.`,
        '',
        `Thanks,\nAlex`,
      ].join('\n')
      return [
        res('Pitch length', '~120 words', T.good, 'Cold pitches under 150 words perform best'),
        res('Personalization', '2 hooks', T.good),
        doc('Pitch email', raw),
      ]
    },
  },
  {
    id: 'outreach-email-generator',
    name: 'Outreach Email Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Composes a general link-building outreach email personalized with the prospect, their value prop, your asset and a soft no-pressure ask.',
    tip: 'One highlight, one benefit to them, one tiny ask. Remove every sentence that does not earn its place.',
    usage: [
      'Name the prospect and what you admire.',
      'State the value you can hand them.',
      'Send with the single-question CTA intact.',
    ],
    method: [
      'A personal-first opening lowers the spam wall.',
      'Value-mirroring frames your link as their benefit.',
      'A one-question close makes replying effortless.',
    ],
    fields: [
      txt('pname14', 'Prospect name & role', 2, 'Jordan, Content Lead'),
      txt('company14', 'Their company', 2, 'Brightly'),
      txt('val14', 'What you can offer them', 3, 'A 2-minute original research chart on conversion rates'),
      txt('target14', 'Your page to link', 2, 'vimz.co/2026-conversion-study'),
    ],
    compute: (v) => {
      const who = asStr(v.pname14) || 'Jordan'
      const co = asStr(v.company14) || 'your company'
      const val = asStr(v.val14) || 'a useful asset'
      const target = asStr(v.target14) || 'your resource'
      const raw = [
        `Subject: A small asset for ${co}`,
        '',
        `Hi ${who},`,
        '',
        `I\u2019ve been following ${co}\u2019s content \u2014 really strong stuff on the growth side.`,
        `I put together ${val}, and honestly it fits your readers perfectly. The asset is free and lives at ${target}.`,
        '',
        `No ask other than: if it\u2019s useful, would you consider adding it as a reference in the relevant post?`,
        '',
        `Either way, thanks for the great reading.`,
        '',
        `\u2014 Alex`,
      ].join('\n')
      return [
        res('First-line hook', 'Personal reference', T.good),
        res('Ask size', 'Single soft CTA', T.good, 'One question, zero pressure'),
        doc('Outreach email', raw),
      ]
    },
  },
  {
    id: 'link-building-email-generator',
    name: 'Link Building Email Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Writes a resource-driven email that hands the prospect a linkable asset plus the exact anchor suggestion, making the "yes" trivial.',
    tip: 'Always supply the anchor text and URL in the email \u2014 prospects link faster when the work is already done.',
    usage: [
      'Describe the asset you are giving away.',
      'Give the suggested anchor and URL.',
      'Send to pages already citing weaker resources.',
    ],
    method: [
      'The asset-first framing positions you as helpful, not transactional.',
      'Pre-written anchor and URL remove friction from the edit.',
      'The "weak citation" hook gives editors an easy swap rationale.',
    ],
    fields: [
      txt('site15', 'Your site', 2, 'vimz tools'),
      txt('asset15', 'Linkable asset', 3, 'An open template for Q3 content plans'),
      txt('anchor15', 'Suggested anchor', 2, 'content plan template'),
      txt('pg15', 'Target URL', 2, 'vimz.co/templates/content-plan'),
    ],
    compute: (v) => {
      const site = asStr(v.site15) || 'my site'
      const asset = asStr(v.asset15) || 'a useful template'
      const anchor = asStr(v.anchor15) || 'content plan template'
      const url = asStr(v.pg15) || 'my site'
      const raw = [
        `Subject: ${anchor} \u2014 free template you might reference`,
        '',
        `Hi there,`,
        '',
        `I\u2019m from ${site}. We built ${asset} and it\u2019s free to use \u2014 no signup.`,
        `You currently link to a rougher tool on this topic; a swap to ours would actually help your readers. Anchor suggestion: \u201c${anchor}\u201d \u2192 ${url}`,
        '',
        `If you prefer not to, no worries \u2014 just wanted to offer it.`,
        '',
        `Cheers,\nAlex`,
      ].join('\n')
      return [
        res('Swap hook', 'Weak citation identified', T.good),
        res('Friction', 'Anchors pre-filled', T.good),
        doc('Asset email', raw),
      ]
    },
  },
  {
    id: 'competitor-backlink-analyzer',
    name: 'Competitor Backlink Analyzer',
    archetype: 'bdown',
    subject: SUBJECT,
    blurb:
      'Breaks a rival\u2019s backlink profile down by source type so you can see exactly which link ecosystems are cheap to replay and which are gated.',
    tip: 'Reproduce their top-10 source domains with your twist \u2014 you will reach the same publishers while they sleep on new ones.',
    usage: [
      'Enter a competitor domain.',
      'Weight which source types appear in their profile.',
      'Read which ecosystems are your fastest wins.',
    ],
    method: [
      'Source types are weighted by how gated they are (news & edu are hardest).',
      'Distribution estimates mimic real profiles\u2019 long-tail bias.',
      'Replay effort scores each ecosystem open to you.',
    ],
    fields: [
      txt('comp16', 'Competitor domain', 2, 'rival.com'),
      n('tot16', 'Their total backlinks', { def: 1800, min: 0 }),
      ck('src16', 'Source types visible', ['Blogs', 'Forums', 'Directories', 'News', 'Edu/Gov', 'Resource pages']),
      n('dr16', 'Their referring domains', { def: 190, min: 0 }),
    ],
    compute: (v) => {
      const src = ['Blogs', 'Forums', 'Directories', 'News', 'Edu/Gov', 'Resource pages']
      const on = src.filter((_, i) => asBoolList(v.src16)[i])
      const base: Record<string, number> = { 'Blogs': 0.34, 'Forums': 0.14, 'Directories': 0.22, 'News': 0.08, 'Edu/Gov': 0.03, 'Resource pages': 0.19 }
      const row = on.length ? on : ['Blogs']
      const total = Math.max(asNum(v.tot16), 1)
      const share = row.reduce((a, t) => a + (base[t] ?? 0), 0)
      const est = row.map((t) => ({ t, n: Math.round(total * (base[t] ?? 0)) })).sort((a, b) => b.n - a.n)
      const replay = row.filter((t) => ['Blogs', 'Directories', 'Forums', 'Resource pages'].includes(t)).length
      return [
        res('Role of listed sources', `${(share * 100).toFixed(0)}% of profile`, T.good),
        res('Cheap-to-replay types', `${replay}/${row.length}`, replay >= 2 ? T.good : T.warn),
        res('Referring domains', `${asNum(v.dr16)}`, T.good, 'Diversity is their moat'),
        doc('Replay priority', est.map((e, i) => `${i + 1}. ${e.t} \u2014 ${e.n} links`).join('\n')),
      ]
    },
  },
  {
    id: 'link-exchange-risk-checker',
    name: 'Link Exchange Risk Checker',
    archetype: 'scorecard',
    subject: SUBJECT,
    blurb:
      'Evaluates reciprocal link arrangements on authority, relevance, reciprocal share and site health to catch penalty-prone schemes.',
    tip: 'A single mass reciprocal sponsor can stall your whole profile \u2014 cap cross-links at 15% of any partner site.',
    usage: [
      'Check your partner\u2019s authority and relevance.',
      'Input how reciprocal the relationship is.',
      'Read the engage, limit, or walk verdict.',
    ],
    method: [
      'Reciprocity ratio is the strongest risk driver.',
      'Off-topic and low-health partners compound the penalty signal.',
      'The composite maps cleanly into an action threshold.',
    ],
    fields: [
      txt('partner17', 'Partner domain', 2, 'friend-site.com'),
      n('pda17', 'Partner DA', { def: 41, min: 0, max: 100 }),
      sel('prel17', 'Relevance to you', ['Same niche', 'Adjacent', 'Unrelated'], 'Adjacent'),
      n('recip17', 'Reciprocal ratio (%)', { def: 28, min: 0, max: 100 }),
      sel('health17', 'Site health signals', ['Clean', 'Mixed', 'Spammy'], 'Clean'),
    ],
    compute: (v) => {
      const da = asNum(v.pda17)
      const rel = asSel(v.prel17)
      const rec = asNum(v.recip17)
      const health = asSel(v.health17)
      const relS = rel === 'Same niche' ? 0.2 : rel === 'Adjacent' ? 1 : 2
      const healthS = health === 'Clean' ? 0.5 : health === 'Mixed' ? 1.4 : 3
      const risk = Math.round(clamp(rec * 0.5 + (100 - da) * 0.2 * healthS / 3 + relS * 10, 0, 100))
      const verdict = risk >= 60 ? 'Walk away' : risk >= 35 ? 'Limit \u2014 cap links' : 'Engage'
      return [
        res('Exchange risk', `${risk}%`, risk < 35 ? T.good : risk < 60 ? T.warn : T.bad),
        res('Verdict', verdict, risk < 35 ? T.good : T.warn),
        res('Signal check', health === 'Spammy' ? 'High' : health === 'Mixed' ? 'Moderate' : 'Low', health === 'Clean' ? T.good : T.warn),
      ]
    },
  },
]
