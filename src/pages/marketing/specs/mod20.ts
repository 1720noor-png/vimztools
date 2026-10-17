import { n, sel, txt, res, doc, T, asNum, asSel, asStr } from '../../office/archetypes/spec'
import type { MarketingSeoSpec } from './marketingSpec'

const SUBJECT = 'AI Marketing Tools'

export const mod20: MarketingSeoSpec[] = [
  {
    id: 'ai-marketing-prompt-generator',
    name: 'AI Marketing Prompt Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Builds a copy-paste AI prompt for any marketing task \u2014 role, task, audience, constraints and output frame in one template.',
    tip: 'Prompts fail on vagueness, not on model ability. Paste in the role + the output frame and the model stops guessing format.',
    usage: [
      'Pick the task from the menu.',
      'Fill audience and tone.',
      'Paste the assembled prompt into your AI tool.',
    ],
    method: [
      'The prompt is assembled from the task\u2019s own command line.',
      'Audience and tone arguments pin the output to reality.',
      'An output frame shapes the response format.',
    ],
    fields: [
      sel('task20', 'Task', ['Ad copy', 'Blog draft', 'Social caption', 'Email', 'Pitch'], 'Ad copy'),
      txt('off20', 'Offer / product', 2, 'AI bookkeeping for freelancers'),
      txt('aud20', 'Audience', 2, 'side-hustlers terrified of tax day'),
      sel('ton20', 'Tone', ['Warm & witty', 'Expert & calm', 'Bold & punchy'], 'Warm & witty'),
      sel('len20', 'Length', ['Short (1-2 lines)', 'Medium paragraph', 'Long form'], 'Short (1-2 lines)'),
    ],
    compute: (v) => {
      const task = asSel(v.task20)
      const offer = asStr(v.off20) || 'your product'
      const aud = asStr(v.aud20) || 'your audience'
      const tone = asSel(v.ton20)
      const len = asSel(v.len20)
      const raw = [
        `You are a senior ${task.toLowerCase()} copywriter.`,
        `Task: write ${task.toLowerCase()} for: ${offer}.`,
        `Audience: ${aud}.`,
        `Tone: ${tone}.`,
        `Length: ${len}.`,
        `Output frame: headline/CTA first line, body under 60 words, end with one tangible claim I can keep.`,
        `Rules: no hype adjectives, no "game-changer", specific over clever.`,
      ].join('\n')
      return [
        res('Prompt length', raw.split('\n').length + ' lines', T.good),
        res('Constraint', 'No-hype rule pinned', T.good),
        res('Ready', 'Copy-paste', T.good),
        doc('AI prompt', raw),
      ]
    },
  },
  {
    id: 'ai-content-brief-generator',
    name: 'AI Content Brief Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Writes a writer-ready content brief \u2014 audience, angle, structure, sources and word count \u2014 the only document AI articles should start from.',
    tip: 'A brief without a "who you are speaking to" line produces generic essays. Pin the reader in the brief, not in the writer\u2019s head.',
    usage: [
      'Name the topic and the reader.',
      'Set the angle that differs from the top result.',
      'Export the brief to your writer or the AI.',
    ],
    method: [
      'Reader-first framing precedes any structure.',
      'The angle is checked against a generic-shelf hazard.',
      'Structure and source rules keep output original.',
    ],
    fields: [
      txt('topic20', 'Topic', 2, 'how to price freelance retainers'),
      txt('reader20', 'Reader', 2, 'first-time freelancers charging hourly and stuck'),
      txt('angle20', 'Angle', 2, 'the 3-tier retainer ladder that doubles income'),
      sel('goal20', 'Conversion goal', ['Newsletter signup', 'Booking call', 'Pure SEO'], 'Newsletter signup'),
    ],
    compute: (v) => {
      const topic = asStr(v.topic20) || 'your topic'
      const reader = asStr(v.reader20) || 'the reader'
      const angle = asStr(v.angle20) || 'a fresh angle'
      const goal = asSel(v.goal20)
      const generic = /ultimate|complete|everything|best practice/.test(topic.toLowerCase()) || /everything|all|best/i.test(angle)
      const raw = [
        `BRIEF \u2014 ${topic}`,
        `\u2022 Reader: ${reader}.`,
        `\u2022 Angle: ${angle} \u2014 must beat the #1 result, not repeat it.`,
        `\u2022 Structure: pain up front \u2192 3 concrete steps \u2192 1 worked example \u2192 CTA.`,
        `\u2022 Goal: ${goal}.`,
        `\u2022 Rules: one source-verified number per section minimum; no fluff intro; 1,200-1,500 words.`,
      ].join('\n')
      return [
        res('Reader pinned', reader.split(' ').length <= 9 ? 'Yes' : 'Tighten', reader.split(' ').length <= 9 ? T.good : T.warn),
        res('Angle unique', generic ? 'Sounds generic' : 'Differentiates', generic ? T.warn : T.good),
        res('Goal', goal, T.good),
        doc('Content brief', raw),
      ]
    },
  },
  {
    id: 'ai-ad-copy-generator',
    name: 'AI Ad Copy Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Composes ad copy through an AIDA-compressed flow \u2014 attention, interest, desire, action \u2014 sized for feed and search formats.',
    tip: 'Lead with the single strongest follow-on claim, not the offer name \u2014 attention is the scarce unit, spend it on the payoff.',
    usage: [
      'Enter the offer and the payoff.',
      'Add the proof or limit.',
      'Run three strength-varied variants.',
    ],
    method: [
      'Each variant opens on the payoff, not the name.',
      'Urgency limits are only used when true.',
      'Length is tuned to ad surface norms.',
    ],
    fields: [
      txt('offer20', 'Offer', 2, '14-day free trial, credit card optional'),
      txt('pay20', 'Payoff', 2, 'close your month in 20 minutes'),
      txt('proof20', 'Proof/limit', 2, '7,000 freelancers onboard'),
      sel('surf20', 'Surface', ['Social feed', 'Search', 'DIsplay banner'], 'Social feed'),
    ],
    compute: (v) => {
      const offer = asStr(v.offer20) || 'your offer'
      const pay = asStr(v.pay20) || 'your payoff'
      const proof = asStr(v.proof20) || 'your proof'
      const surf = asSel(v.surf20)
      const feed = [`${cap20(pay)}. ${cap20(proof)}.`, `${cap20(pay)} \u2014 ${offer.toLowerCase()}.`, `${cap20(pay)} \u2014 and yes, it works: ${proof}.`]
      const search = [`${pay} | Free trial`, `${cap20(pay)}. Sheets, gone.`]
      const display = [`${cap20(pay)}`, `Stop spreadsheet nights`]
      const set = surf === 'Search' ? search : surf === 'DIsplay banner' ? display : feed
      return [
        res('Lead with payoff', pay.split(' ').length <= 9 ? 'Yes' : 'Cut words', pay.split(' ').length <= 9 ? T.good : T.warn),
        res('Variants', `${set.length}`, T.good),
        res('Surface', surf, T.good),
        doc('Ad copy', set.map((c, i) => `Variant ${i + 1}: ${c}\nOffer line: ${offer}`).join('\n\n')),
      ]
    },
  },
  {
    id: 'ai-seo-content-generator',
    name: 'AI SEO Content Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Bundles an SEO-mapped article outline with keyword placement, FAQ seeds and meta lines for your primary keyword.',
    tip: 'Write the meta and outline before the article \u2014 they force the keyword decisions that make the drafting 2x faster.',
    usage: [
      'Enter the primary keyword.',
      'Add secondary terms.',
      'Use the outline + meta as your skeleton.',
    ],
    method: [
      'Primary keyword anchors the H1 and meta title.',
      'Secondary terms seed H2/H3 and FAQ blocks.',
      'Draft order is dictated by question intent, not word count.',
    ],
    fields: [
      txt('kw20', 'Primary keyword', 2, 'freelance pricing guide'),
      txt('sec20', 'Secondary keywords', 2, 'hourly rate, retainer pricing, scope creep'),
      sel('intent20', 'Intent', ['Informational', 'Commercial', 'Transactional'], 'Commercial'),
      n('wcount20', 'Target words', { def: 1500, min: 300 }),
    ],
    compute: (v) => {
      const kw = asStr(v.kw20) || 'primary keyword'
      const secs = (asStr(v.sec20) || '').split(',').map((s) => s.trim()).filter(Boolean)
      const intent = asSel(v.intent20)
      const wc = asNum(v.wcount20)
      const outline = [
        `H1: ${cap20(kw)} (for ${intent.toLowerCase()} searchers)`,
        `H2: The exact decision they came to make \u2014 answered in 2 sentences.`,
        ...secs.slice(0, 4).map((s, i) => `H${i + 3}: ${cap20(s)} \u2014 with a concrete example.`),
        `H2: Common mistakes (the proof you did not paraphrase).`,
        `H2: FAQ \u2014 3 questions people actually search.`,
        `Meta title (<60c): ${cap20(kw)} \u2014 Real Numbers`,
        `Meta description (<155c): decisions, not fluff.`,
      ].join('\n')
      const density = secs.filter((s) => kw.split(' ').some((w) => s.includes(w))).length
      return [
        res('Intent', intent, T.good),
        res('Outline', secs.length + 3 + ' headings', secs.length >= 2 ? T.good : T.warn),
        res('Word budget', wc.toLocaleString() + ' words', wc >= 800 ? T.good : T.warn),
        res('Secondary fit', `${density} overlap with primary`, T.good),
        doc('SEO skeleton', outline),
      ]
    },
  },
  {
    id: 'ai-social-post-generator',
    name: 'AI Social Post Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Spins one idea into platform-shaped posts \u2014 hook, story and CTA tailored to the character and vibe of each channel.',
    tip: 'One idea, three posts. Cross-posting identical text trains algorithms to hide you; re-cut the hook per platform instead.',
    usage: [
      'Give the core idea or lesson.',
      'Pick the platform.',
      'Post platform-native, then reply in-thread for reach.',
    ],
    method: [
      'The hook is re-cut per platform cadence.',
      'Character budgets follow platform norms.',
      'A thread-action suggestion boosts first-hour engagement.',
    ],
    fields: [
      sel('plt20', 'Platform', ['LinkedIn', 'TikTok', 'X', 'Instagram'], 'LinkedIn'),
      txt('idea20', 'Core idea', 2, 'revenue per 10 hours beats revenue per hour'),
      txt('soProof20', 'One data point', 2, 'my best week: $1,100 for 9 hours'),
      sel('cta20', 'CTA', ['Ask a question', 'Share your version', 'Read the guide'], 'Share your version'),
    ],
    compute: (v) => {
      const plt = asSel(v.plt20)
      const idea = asStr(v.idea20) || 'your core idea'
      const proof = asStr(v.soProof20) || 'your proof'
      const cta = asSel(v.cta20)
      const hooks = {
        LinkedIn: `The real number nobody tracks: ${idea}.\n\n${proof}. That is why I changed how I bill.\n\n${cta} \u2192 I read every reply.`,
        TikTok: `${idea} \u2014 yes, really.\n\n${proof}.\n\nSound on for the breakdown.`,
        X: `${idea}.\n\n${proof}.\n\nHot take or too far?`,
        Instagram: `${idea} \u2728\n\n${proof} \u2014 swipe to see the math.`,
      }[plt]
      const chars = (hooks || '').length
      return [
        res('Hook punch', idea.split(' ').length <= 11 ? 'Short' : 'Trim', idea.split(' ').length <= 11 ? T.good : T.warn),
        res('Characters', chars + '/10k', chars <= 5000 ? T.good : T.warn),
        res('CTA', cta, T.good),
        doc('Post', hooks + `\n\nEngage move: reply to the first 5 comments within 20 minutes.`),
      ]
    },
  },
  {
    id: 'ai-email-generator',
    name: 'AI Email Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Drafts a full marketing email \u2014 subject, preview, body and CTA \u2014 for the goal and reader you specify.',
    tip: 'Subject line does 40% of the job, but preview text does the other 15% \u2014 never leave the preview as the last sentence of the body.',
    usage: [
      'Pick the email job.',
      'Name the reader and the change you invite.',
      'Run and then shorten \u2014 120 words or fewer.',
    ],
    method: [
      'Subject, preview and body are written from the goal.',
      'A subject score weighs curiosity and specificity.',
      'The CTA is single and unmissable.',
    ],
    fields: [
      sel('job20', 'Email job', ['Welcome', 'Offer', 'Newsletter', 'Re-engage', 'Launch'], 'Newsletter'),
      txt('reader20e', 'Reader snapshot', 2, 'subscribers who downloaded the pricing guide'),
      txt('msg20', 'Core message', 2, 'early-bird 20% off the masterclass ends Friday'),
      txt('cta20e', 'CTA', 2, 'reserve your seat'),
    ],
    compute: (v) => {
      const job = asSel(v.job20)
      const reader = asStr(v.reader20e) || 'the reader'
      const msg = asStr(v.msg20) || 'your message'
      const cta = asStr(v.cta20e) || 'take the step'
      const subject = job === 'Welcome' ? 'the reason you signed up' : `${cap20(msg).split('.').slice(0, 1)[0]} \u2014 before it is gone`
      const preview = `For ${reader.split(' ')[0]}s: ${msg.split(' ').slice(0, 6).join(' ')}...`
      const body = [
        `${cap20(reader)}.`,
        `Here is the honest version: ${msg}.`,
        `That is the whole message \u2014 one line, one ask, zero filler.`,
        `\u2192 ${cta}`,
        '',
        'If this is not for you, no hard feelings. You can turn these off in one click.',
      ].join('\n')
      return [
        res('Subject', subject, subject.length <= 40 ? T.good : T.warn),
        res('Preview', preview.slice(0, 90), T.good),
        res('Word count', body.split(/\s+/).length + ' words', body.split(/\s+/).length <= 140 ? T.good : T.warn),
        doc('Email', `Subject: ${subject}\nPreview: ${preview}\n\n${body}`),
      ]
    },
  },
  {
    id: 'ai-product-description-generator',
    name: 'AI Product Description Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Builds a conversion-focused product description from attributes \u2014 benefit-led bullets, sensory copy and a sizing honesty clause.',
    tip: 'The best product copy translates a spec into a feeling: "1500 lumens" becomes "you will see lint on the carpet you forgot existed".',
    usage: [
      'Enter the product and its star feature.',
      'Add the feeling it creates.',
      'Use bullets + honesty clause for the PDP.',
    ],
    method: [
      'Specs are translated into sensory benefits, one per bullet.',
      'A 6-word opener holds the strongest payoff.',
      'The honesty clause disarms post-purchase regret.',
    ],
    fields: [
      txt('prod20d', 'Product', 2, 'rechargeable desk lamp'),
      txt('feat20d', 'Star feature', 2, '1700 lumens, 12-hour runtime'),
      txt('feel20d', 'Feeling it creates', 2, 'a desk that finally feels lit'),
      txt('dims20d', 'Relevant spec', 2, 'folds flat, 540g, USB-C'),
    ],
    compute: (v) => {
      const prod = asStr(v.prod20d) || 'the product'
      const feat = asStr(v.feat20d) || 'a stand-out feature'
      const feel = asStr(v.feel20d) || 'the feeling'
      const spec = asStr(v.dims20d) || 'the spec'
      const raw = [
        `Meet ${cap20(prod)} \u2014 ${feel}.`,
        '',
        `\u2022 Goodbye to squinting: ${feat}.`,
        `\u2022 ${cap20(spec)} \u2014 fits where the old one never did.`,
        `\u2022 One charge, all week of real use.`,
        '',
        `The honest version: it is a ${prod} \u2014 it will not fix your posture. But it will make you want the desk light on.`,
      ].join('\n')
      return [
        res('Benefit first', feel.split(' ').length <= 8 ? 'Yes' : 'Trim', feel.split(' ').length <= 8 ? T.good : T.warn),
        res('Spec copy', spec.split(' ').length <= 7 ? 'Concrete' : 'Tighten', T.good),
        res('Honesty clause', 'Included', T.good),
        doc('Description', raw),
      ]
    },
  },
  {
    id: 'ai-blog-outline-generator',
    name: 'AI Blog Outline Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Scaffolds a blog outline that reads like an answer, not an essay \u2014 thesis, sections, sub-questions and a close that continues the conversation.',
    tip: 'Outline with a question under every section header. A header that is a question forces you to answer it \u2014 titles get you nowhere.',
    usage: [
      'State the article\u2019s thesis.',
      'List the 3 sub-questions it must answer.',
      'Draft each section by answering its question only.',
    ],
    method: [
      'Every H2 carries an implicit question to answer.',
      'Sub-heads break the question into proof steps.',
      'The close links to the next action, not a summary.',
    ],
    fields: [
      txt('thesis20', 'Thesis', 2, 'SMBs lose on price wars; they win on speed'),
      txt('qone20', 'Sub-question 1', 2, 'why is speed a pricing strategy?'),
      txt('qtwo20', 'Sub-question 2', 2, 'what does fast delivery cost to build?'),
      txt('qthree20', 'Sub-question 3', 2, 'how do you signal speed before the first order?'),
    ],
    compute: (v) => {
      const thesis = asStr(v.thesis20) || 'your thesis'
      const qs = [asStr(v.qone20), asStr(v.qtwo20), asStr(v.qthree20)].filter(Boolean)
      const outline = [
        `H1: ${cap20(thesis)} \u2014 in one concrete claim.`,
        '',
        ...qs.map((q, i) => `H${i + 2}: Answering ${q.replace(/\?|\./g, '').toLowerCase()}?`),
        '   \u2022 the mistake first, then the fix',
        '   \u2022 one worked example per section',
        '',
        `H5: What to do with the answer \u2014 a 3-step close that continues the conversation (not "in conclusion").`,
      ].join('\n')
      const answered = qs.length === 3
      return [
        res('Sub-questions', qs.length + '/3', answered ? T.good : T.warn),
        res('Thesis sharp', thesis.split(' ').length <= 12 ? 'Yes' : 'Split it', thesis.split(' ').length <= 12 ? T.good : T.warn),
        res('Closer', 'Next-action, no summary', T.good),
        doc('Outline', outline),
      ]
    },
  },
  {
    id: 'ai-content-repurposing-tool',
    name: 'AI Content Repurposing Tool',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Maps one long-form asset into a batched repurpose plan \u2014 chapters, clips, posts and quotes \u2014 with the format play per channel.',
    tip: 'The 80/20 of repurposing: cut the 3 sharpest moments into short-form first \u2014 everything else is good but later.',
    usage: [
      'Define the source asset and its length.',
      'Choose the strongest moment.',
      'Schedule the batch plan by format.',
    ],
    method: [
      'The asset is split into quote, clip and post fractions.',
      'The strongest-moment priority is scored.',
      'Each channel gets its native format, not a re-post.',
    ],
    fields: [
      sel('src20', 'Source asset', ['Podcast / video', 'Long article', 'Webinar', 'Whitepaper'], 'Podcast / video'),
      n('minutes20', 'Length (minutes)', { def: 40, min: 5 }),
      txt('best20', 'Strongest moment', 2, 'the story about the client who cried'),
      txt('audAud20', 'Audience for repurposes', 2, 'founders who skim on the commute'),
    ],
    compute: (v) => {
      const src = asSel(v.src20)
      const minutes = asNum(v.minutes20)
      const best = asStr(v.best20) || 'the sharpest moment'
      const aud = asStr(v.audAud20) || 'your audience'
      const clips = Math.min(6, Math.max(1, Math.round(minutes / 8)))
      const ts = Math.min(40, Math.round(minutes / 3))
      const plan = [
        `\u2022 Shorts/clips: ${clips} from the sharpest ${ts} min.`,
        `\u2022 Carousel: the 3 hardest statements (${best}).`,
        `\u2022 Newsletter: the 6-paragraph think-piece version.`,
        `\u2022 Thread/X: 5 pull-quotes + the counter-argument.`,
        `Audience framing: ${aud}.`,
      ].join('\n')
      return [
        res('Clips yield', clips + ' shorts', clips >= 3 ? T.good : T.warn),
        res('Hero moment', best.split(' ').length <= 10 ? 'Picked' : 'Choose 1', best.split(' ').length <= 10 ? T.good : T.warn),
        res('Formats', '4 native variants', T.good),
        doc('Batch plan', `${src} \u2192 ${plan}`),
      ]
    },
  },
  {
    id: 'ai-marketing-idea-generator',
    name: 'AI Marketing Idea Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Fires marketing idea combinations from your audience, channel and angle \u2014 scored for effort and likely reach.',
    tip: 'The 70/20/10 rule: 70% proven plays, 20% tested-adjacent, 10% moonshots. Fill the calendar with 70s, flex with the 20s.',
    usage: [
      'Enter audience and channel.',
      'Pick the angle menu.',
      'Score ideas and ship the 70/20 mix.',
    ],
    method: [
      'Ideas are paired from audience \u00d7 channel \u00d7 angle.',
      'Each is scored for effort and reach potential.',
      'A 70/20/10 recommendation is drawn from scores.',
    ],
    fields: [
      txt('audAuto20', 'Audience', 2, 'parents of toddlers'),
      txt('chanIdea20', 'Channel', 2, 'Instagram + newsletter'),
      sel('angleIdea20', 'Angle', ['Before/after', 'Mistakes list', 'Data surprise', 'Behind the scenes'], 'Mistakes list'),
      sel('sizeIdea20', 'Team size', ['Solo', 'Small team', 'Agency'], 'Solo'),
    ],
    compute: (v) => {
      const aud = asStr(v.audAuto20) || 'your audience'
      const chan = asStr(v.chanIdea20) || 'your channel'
      const angle = asSel(v.angleIdea20)
      const size = asSel(v.sizeIdea20)
      const easy = `The ${angle.toLowerCase()} nobody has time for \u2014 for ${aud} on ${chan}.`
      const medium = `A mini-series: 5 editions of "${cap20(aud)} confess" \u2014 one mistake per edition, one fix each.`
      const moon = 'A collab swap with two adjacent creators + a one-day co-live. High reach, high prep.'
      const mix = size === 'Solo' ? '70% easy + 30% mini-series for the first 30 days' : size === 'Small team' ? '70/20/10 across the three tracks' : 'Run all three in parallel, QA weekly'
      return [
        res('Easy play', easy.split(' ').length <= 14 ? 'Clean' : 'Trim', T.good),
        res('Moonshot', 'Collab co-live', T.good),
        res('Mix', mix, T.good),
        doc('Idea stack', `1) ${easy}\n2) ${medium}\n3) ${moon}\n\nCommit: ${mix}.`),
      ]
    },
  },
  {
    id: 'ai-campaign-idea-generator',
    name: 'AI Campaign Idea Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Generates campaign concepts structured as hook + mechanism + emotion from your product and the feeling you want to own.',
    tip: 'A campaign is a bet on an emotion, not a vehicle. Name the emotion first; the format follows, not the other way round.',
    usage: [
      'Name the product and its season.',
      'Pick a primary emotion.',
      'Test the concept aloud: would it make YOU share?',
    ],
    method: [
      'Concepts bind a hook, mechanism and emotion per idea.',
      'The emotion-first rule keeps formats subordinate.',
      'A share-test question gates each concept.',
    ],
    fields: [
      sel('season20', 'Season / trigger', ['Launch', 'Holiday', 'Retention moment', 'Evergreen'], 'Evergreen'),
      txt('prodC20', 'Product / audience', 2, 'subscription coffee \u2014 work-from-home drinkers'),
      sel('emo20', 'Primary emotion', ['Delight', 'Relief', 'Pride', 'Nostalgia'], 'Delight'),
      txt('proofC20', 'Proof you can show', 2, 'average 4.8\u2605, 12k brews a month'),
    ],
    compute: (v) => {
      const trig = asSel(v.season20)
      const prod = asStr(v.prodC20) || 'your product'
      const emo = asSel(v.emo20)
      const proof = asStr(v.proofC20) || 'your proof'
      const hooks = {
        Launch: `The counter-argument to ${prod}, in 30 seconds.`,
        Holiday: `Give ${prod} as the gift that keeps luxuriating.`,
        Retention: `A surprise ${emo.toLowerCase()} boost for the people already subscribing.`,
        Evergreen: `Watch what ${proof.split(' ')[0]} people do every morning.`,
      }[trig]
      const concept = `Hook: ${hooks}\nMechanism: interactive counter that ends by revealing ${proof}\nEmotion: ${emo}.`
      return [
        res('Emotion first', emo, T.good),
        res('Triggers', trig, T.good),
        res('Share-test', concept.split(' ').length <= 32 ? 'Say it aloud now' : 'Cut the clutter', concept.split(' ').length <= 32 ? T.good : T.warn),
        doc('Concept', concept),
      ]
    },
  },
  {
    id: 'ai-customer-persona-generator',
    name: 'AI Customer Persona Generator',
    archetype: 'fmt',
    subject: SUBJECT,
    blurb:
      'Produces an AI-ready persona prompt and a distilled persona card, so any downstream generator starts from the same customer truth.',
    tip: 'Feed your AI a persona prompt once and paste it into every brief \u2014 consistency beats brilliance when the whole team uses one voice.',
    usage: [
      'Fill the persona essentials.',
      'Copy the prompt into your AI tool of choice.',
      'Reuse it in every campaign brief.',
    ],
    method: [
      'The persona prompt is assembled from your essentials.',
      'Pain language is kept to the customer\u2019s words.',
      'A reuse rule makes the persona single-source for the team.',
    ],
    fields: [
      txt('whoC20', 'Who / where', 2, 'ops coordinators at mid-size agencies'),
      txt('painC20', 'Their pain, in their words', 2, 'nobody tells me when things slip'),
      txt('wantC20', 'What they want now', 2, 'a dashboard that flags risks before Friday'),
      sel('buyC20', 'How they buy', ['Referral', 'Self-serve trial', 'Procurement'], 'Referral'),
    ],
    compute: (v) => {
      const who = asStr(v.whoC20) || 'your persona'
      const pain = asStr(v.painC20) || 'their pain'
      const want = asStr(v.wantC20) || 'what they want'
      const buy = asSel(v.buyC20)
      const prompt = [
        `Act as a senior insights analyst. Build a persona card for: ${who}.`,
        `Their own words for the pain: "${pain}".`,
        `Desired outcome today: ${want}.`,
        `Buying behavior: ${buy}.`,
        `Return: name, role, 3 pains, 2 goals, the channel they trust, and the objection we must answer first.`,
      ].join('\n')
      return [
        res('Persona prompt', prompt.split('\n').length + ' lines', T.good),
        res('Voice captured', pain.split(' ').length <= 12 ? 'Customer-voiced' : 'Marketeer-voiced', pain.split(' ').length <= 12 ? T.good : T.warn),
        res('Buy behavior', buy, T.good),
        doc('AI prompt + card', `${prompt}\n\nCard: ${who}, says "${pain}", wants ${want}, trusts ${buy}.`),
      ]
    },
  },
]

function cap20(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}