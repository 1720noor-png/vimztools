import { n, sel, txt, dt, ck, res, T, asNum, asSel, asStr, asBoolList, clamp, num, ratio } from '../../office/archetypes/spec'
import { sres, docr, type StudentSpec } from './studentSpec'

const SUBJECT = 'Presentation & Public Speaking'

const FILLER = ['um', 'uh', 'like', 'you know', 'i mean', 'basically', 'actually', 'literally', 'sort of', 'kind of', 'just', 'really', 'very', 'quite', 'so yeah', 'right', 'anyway', 'whatever', 'stuff', 'things like that']

function linesOf(raw: string): string[] {
  return raw
    .split('\n')
    .map((l) => l.replace(/\r$/, ''))
    .filter((l) => l.trim().length > 0)
}

function sentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8)
}

function words(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '')
  if (!w) return 0
  const g = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').match(/[aeiouy]{1,2}/g)
  return Math.max(1, g ? g.length : 1)
}

export const mod16: StudentSpec[] = [
  {
    id: 'speech-length-calculator-speaking',
    name: 'Speech Length Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Calculates how long your speech will take to deliver, with a per-slide budget and filler-word impact.',
    tip: 'Nervous speakers speak 30% faster than rehearsed ones. If your script reads as 10 minutes, it will be 12 — cut a fifth before you rehearse, not after.',
    usage: ['Paste your speech text.', 'Set your delivery pace and buffer.', 'Read the time budget.'],
    method: ['Words are counted and converted by pace.', 'Filler phrases are detected and timed.', 'A per-slide budget is produced.'],
    fields: [sel('pace', 'Your delivery pace', ['Very fast (150+ wpm)', 'Fast (140 wpm)', 'Normal (130 wpm)', 'Measured (120 wpm)', 'Slow / presenting to text (100 wpm)'], 'Normal (130 wpm)'), n('slides', 'Number of slides', { def: 10, min: 1, max: 60, step: 1 }), n('target', 'Target length (minutes)', { def: 10, min: 1, max: 120, step: 1 }), txt('speech', 'Your speech text', 12, 'Good morning everyone and thank you for coming. Um, so today I want to talk about something that is really quite important in our field. Basically, it is about how we can use data to make better decisions. You know, everyone says data is important but not everyone knows how to actually do it. So let me start with the problem.')],
    compute: (v) => {
      const text = asStr(v.speech).trim()
      if (text.length < 20) return [sres('Speech length', 'Paste your speech text first', T.warn)]
      const paces: Record<string, number> = { 'Very fast (150+ wpm)': 155, 'Fast (140 wpm)': 140, 'Normal (130 wpm)': 130, 'Measured (120 wpm)': 120, 'Slow / presenting to text (100 wpm)': 100 }
      const wpm = paces[asSel(v.pace)] || 130
      const slides = Math.max(1, asNum(v.slides))
      const target = Math.max(1, asNum(v.target))
      const w = text.split(/\s+/).filter(Boolean)
      const rawMin = w.length / wpm
      let fillerCount = 0
      FILLER.forEach((f) => {
        const c = (text.toLowerCase().match(new RegExp(`\\b${f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g')) || []).length
        fillerCount += c
      })
      const fillerSec = (fillerCount * 0.7) / 60
      const totalMin = rawMin + fillerSec
      const perSlide = totalMin / slides
      const over = totalMin - target
      const syl = w.reduce((s, x) => s + countSyllables(x), 0)
      const paceCheck = syl / w.length
      const advice: string[] = []
      if (over > 0) advice.push(`You are ${num(over, 1)} minutes over. Remove ${num(Math.ceil((over * wpm) / 10) * 10, 0)} words — that is roughly one whole sentence per slide.`)
      if (over < -0.5) advice.push(`You are ${num(Math.abs(over), 1)} minutes under. Add one concrete example or a short pause after each key figure; silence reads as confidence.`)
      if (fillerCount > 5) advice.push(`${num(fillerCount, 0)} filler phrase(s) add ${num(fillerSec * 60, 0)} seconds. Record yourself once and count them — awareness removes most of them within a week.`)
      if (paceCheck > 1.55) advice.push('Your sentences use a lot of multi-syllable words. Read one aloud: if you run out of breath mid-sentence, split it.')
      if (perSlide > 1.5) advice.push(`${ratio(perSlide, 1)} minutes per slide is long. A slide should support a point for 45–90 seconds, not become a script to read from.`)
      const cleaned = FILLER.reduce((acc, f) => acc.replace(new RegExp(`\\b${f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b,?\\s*`, 'gi'), ''), text)
      const cleanMin = cleaned.split(/\s+/).filter(Boolean).length / wpm
      return [
        sres('Estimated length', `${num(totalMin, 1)} minutes`, Math.abs(over) < 0.5 ? T.good : over > 0 ? T.bad : T.warn, `${num(w.length, 0)} words at ${num(wpm, 0)} wpm`, clamp(100 - (totalMin / Math.max(1, target)) * 60, 5, 100)),
        sres('Target', `${num(target, 0)} minutes`, Math.abs(over) < 0.5 ? T.good : T.warn, over > 0 ? `${num(over, 1)} min over` : `${num(Math.abs(over), 1)} min under`),
        sres('Per slide', `${num(perSlide * 60, 0)} seconds`, perSlide > 1.5 ? T.warn : T.good, `${num(slides, 0)} slides · aim for 45–90 seconds each`, clamp(100 - (perSlide / 2) * 100, 5, 100)),
        sres('Filler words', num(fillerCount, 0), fillerCount > 8 ? T.bad : fillerCount > 3 ? T.warn : T.good, `adding ${num(fillerSec * 60, 0)} seconds`, clamp(100 - fillerCount * 8, 5, 100)),
        docr('Filler breakdown', FILLER.map((f) => {
          const c = (text.toLowerCase().match(new RegExp(`\\b${f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g')) || []).length
          return c ? `${f.padEnd(16)} ${c}` : null
        }).filter(Boolean).join('\n') || 'no filler phrases detected — that is unusually clean'),
        res('Actions', advice.length ? advice.join('\n') : 'length and pace are fine — focus on delivery now', Math.abs(over) < 0.5 && fillerCount <= 3 ? T.good : T.warn),
        res('Rehearse with a timer', 'three full run-throughs with a stopwatch. The first is for content, the second for timing, the third for nerves.', T.neutral),
        res('If you are running long', `dropping to ${num(wpm + 15, 0)} wpm is worth about ${num((w.length / (wpm + 15) - rawMin) * 60, 0)} seconds — but speed is a worse fix than cutting`, T.warn),
        sres('Cleaned length', `${num(cleanMin, 1)} minutes`, T.neutral, `with filler words removed (${num(Math.max(0, totalMin - cleanMin) * 60, 0)} seconds saved)`),
      ]
    },
  },
  {
    id: 'slide-outline-builder-speaking',
    name: 'Slide Outline Builder',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Builds a slide-by-slide deck structure from your topic, with assertion titles and per-slide speaking notes.',
    tip: 'If your slide title is a topic label ("Results"), your audience has to guess the point. If it is a sentence ("Defects fell 18% with static analysis"), they already have it.',
    usage: ['Describe your topic and key message.', 'Set the slide count.', 'Read the outline with assertion titles.'],
    method: ['A narrative spine is generated.', 'Slides are allocated time by role.', 'Assertion titles are drafted.'],
    fields: [txt('topic', 'Your topic', 2, 'Why our onboarding process loses new users in week one'), txt('key', 'The one thing they must remember', 2, 'Our first-week experience is the problem, not our marketing'), sel('style', 'Deck style', ['Argumentative (persuade)', 'Informative (teach)', 'Reportive (status update)', 'Pitch (commercial)'], 'Argumentative (persuade)'), n('count', 'Number of slides', { def: 12, min: 4, max: 40, step: 1 }), n('mins', 'Talk length (minutes)', { def: 12, min: 2, max: 120, step: 1 })],
    compute: (v) => {
      const topic = asStr(v.topic).trim()
      if (!topic) return [sres('Outline', 'Describe your topic first', T.warn)]
      const key = asStr(v.key).trim() || 'your central message'
      const count = clamp(Math.round(asNum(v.count)) || 12, 4, 40)
      const mins = Math.max(2, asNum(v.mins))
      const style = asSel(v.style)
      const perSlide = (mins * 60) / count
      const T2 = topic.charAt(0).toUpperCase() + topic.slice(1)
      const SPINES: Record<string, { sections: { n: string; pct: number; titles: string[]; note: string }[] }> = {
        Argumentative: {
          sections: [
            { n: 'Open', pct: 0.1, titles: [`${T2} — and why it should concern you`, 'The one thing I want you to remember', 'How I will convince you'], note: 'open with the conclusion, not with the agenda. State your claim in the first 30 seconds.' },
            { n: 'Context', pct: 0.12, titles: ['What we know about week-one retention', 'Where the drop-off actually happens', 'The cost of the current situation'], note: 'one chart, one point. Do not make this a literature review.' },
            { n: 'Diagnosis', pct: 0.22, titles: ['We tested four hypotheses', 'Three were wrong', 'The problem is X, and here is the evidence'], note: 'this is the substance of the talk. Show your data and be honest about what it cannot show.' },
            { n: 'Recommendation', pct: 0.28, titles: ['What we should do instead', 'How it works, step by step', 'What it costs and what it saves'], note: 'be concrete. "Improve onboarding" is not a recommendation; "move the setup step to day 0" is.' },
            { n: 'Close', pct: 0.18, titles: ['What happens if we do nothing', 'The decision we need from you', key, 'Questions'], note: 'end on the ask, then stop talking. Do not trail off into "so yeah, anyway".' },
          ],
        },
        Informative: {
          sections: [
            { n: 'Open', pct: 0.1, titles: [`${T2}`, 'By the end you will be able to…', 'The three ideas that matter'], note: 'for a teaching talk, promise the audience a specific capability, not a topic.' },
            { n: 'Foundations', pct: 0.25, titles: ['The concept in one picture', 'Where it came from', 'The vocabulary you need'], note: 'define every term the first time. Assume no prior knowledge.' },
            { n: 'Mechanism', pct: 0.28, titles: ['How it works', 'A worked example', 'The step people usually get wrong'], note: 'the worked example is the slide they will remember. Give it a full minute.' },
            { n: 'Application', pct: 0.2, titles: ['When to use this', 'Common mistakes', 'A case from our own work'], note: 'move from theory to their practice as early as the audience can bear it.' },
            { n: 'Close', pct: 0.17, titles: ['The three things to remember', 'Where to read more', 'Questions'], note: 'recap explicitly. Most audiences retain the first and last five minutes best.' },
          ],
        },
        Reportive: {
          sections: [
            { n: 'Summary', pct: 0.15, titles: ['Where we are against plan', 'The headline: one number', 'What changed since last month'], note: 'lead with the status. A status update that buries the bad news loses trust.' },
            { n: 'Progress', pct: 0.3, titles: ['Completed', 'In progress', 'Blocked'], note: 'one slide per column. Be specific about dates and owners.' },
            { n: 'Analysis', pct: 0.3, titles: ['What the data shows', 'What we learned this month', 'What we got wrong'], note: 'the "what we got wrong" slide is the one that builds credibility for everything else.' },
            { n: 'Next', pct: 0.25, titles: ['Priorities for next month', 'Decisions needed', 'Owners and dates'], note: 'every action needs a name and a date, or it will not happen.' },
          ],
        },
        Pitch: {
          sections: [
            { n: 'Hook', pct: 0.08, titles: [T2, 'The problem they already feel', 'The size of the problem'], note: 'name their pain specifically. A generic problem statement means a generic pitch.' },
            { n: 'Solution', pct: 0.25, titles: ['What we built', 'How it works in 30 seconds', 'Why it is different'], note: 'demo beats slides. If you can show it in 30 seconds, do that instead of this slide.' },
            { n: 'Proof', pct: 0.25, titles: ['The result in one number', 'A customer in their words', 'What it costs them if nothing changes'], note: 'one strong number beats five weak ones. Attribute every claim.' },
            { n: 'Commercials', pct: 0.25, titles: ['Pricing', 'What is included', 'The first step'], note: 'do not apologise for the price. State it, then state the value.' },
            { n: 'Close', pct: 0.17, titles: ['The ask', key, 'Questions'], note: 'state exactly what you want them to do next, and by when.' },
          ],
        },
      }
      const spine = SPINES[style] || SPINES.Argumentative
      const totalPct = spine.sections.reduce((s, x) => s + x.pct, 0)
      const scaled = spine.sections.map((s) => ({ ...s, pct: (s.pct / totalPct) * 100 }))
      const arranged = scaled.map((sec) => ({ sec, titles: sec.titles.slice() }))
      const baseTotal = arranged.reduce((s2, a) => s2 + a.titles.length, 0)
      const expandable = arranged.filter((a) => a.sec.n !== 'Close')
      let extra = count - baseTotal
      let addIdx = 0
      while (extra > 0 && expandable.length) {
        const target = expandable[addIdx % expandable.length]
        target.titles.push(`${target.sec.n} — evidence, example or detail`)
        addIdx++
        extra--
      }
      let overflow = baseTotal - count
      let trimmed = 0
      while (overflow > 0) {
        const target = arranged.slice(1, -1).find((a) => a.titles.length > 1) || arranged.find((a) => a.titles.length > 1)
        if (!target) break
        target.titles.pop()
        overflow--
        trimmed++
      }
      const lines: string[] = []
      let slide = 1
      let produced = 0
      arranged.forEach((a) => {
        const secMins = (mins * a.sec.pct) / 100
        lines.push(`\n${a.sec.n.toUpperCase()} — ${ratio(a.sec.pct, 0)}% of the talk, ${num(secMins, 1)} min`)
        lines.push(`  note: ${a.sec.note}`)
        const each = a.titles.length ? secMins / a.titles.length : secMins
        a.titles.forEach((t) => {
          lines.push(`  Slide ${slide}: ${t}   [${num(Math.min(perSlide, each) * 60, 0)}s]`)
          slide++
          produced++
        })
      })
      const over = count > Math.round(mins * 1.5)
      return [
        sres('Deck structure', `${num(produced, 0)} slides`, over ? T.warn : T.good, `${num(mins, 0)} minutes · ${num(perSlide, 0)} seconds per slide`, clamp(100 - (perSlide / 120) * 100, 5, 100)),
        sres('Narrative', style, T.neutral, `${num(scaled.length, 0)} sections, open → context → substance → close`),
        sres('Words on screen', `${num(Math.round((produced * 12) / 100) * 100, 0)} words`, produced * 12 > 400 ? T.warn : T.good, `~12 words per slide is the readability ceiling`, clamp(100 - ((produced * 12) / 600) * 100, 5, 100)),
        docr('Slide-by-slide outline', lines.join('\n')),
        docr('Assertion titles', arranged.flatMap((a) => a.titles).map((t, i) => `${i + 1}. ${t}`).join('\n')),
        res('Title test', 'read only your slide titles in order. If they tell the story without your narration, the deck works. If they are labels like "Data" or "Overview", rewrite them as claims.', T.warn),
        res('Slide density', over ? `${num(produced, 0)} slides in ${num(mins, 0)} minutes is ${num(perSlide, 0)} seconds each — cut to one slide per ${num(perSlide * 1.5, 0)} seconds or plan to rush` : 'slide count is realistic for the time available', over ? T.warn : T.good),
        trimmed ? res('Slides merged', `you asked for ${num(count, 0)} slides but this spine needs ${num(baseTotal, 0)}. ${num(trimmed, 0)} middle slide(s) were merged into their neighbours — your opening and close were kept intact.`, T.warn) : res('Supporting slides', 'the extra slides added to this outline are placeholders. Replace each with a real chart, example or quote, or delete it.', T.neutral),
        res('Build the last slide first', 'the final slide is the hardest to write and the one everyone cuts for time. Write it first.', T.neutral),
      ]
    },
  },
  {
    id: 'question-handling-coach-speaking',
    name: 'Question Handling Coach',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Builds a Q&A bank with difficult question types, response frameworks and recovery lines for when you go blank.',
    tip: 'You are not expected to know everything. You are expected to not bluff. "I do not know, but here is how I would find out" is a strong answer to most hard questions.',
    usage: ['Describe your talk and audience.', 'Choose the hard question types.', 'Read the frameworks and model answers.'],
    method: ['Question types are matched to your audience.', 'Frameworks are attached per type.', 'Recovery phrases for going blank are included.'],
    fields: [sel('aud', 'Audience', ['Subject peers', 'Non-specialist colleagues', 'Senior leadership', 'Examiners / academic panel', 'External clients or partners'], 'Non-specialist colleagues'), sel('qtype', 'Hardest question type', ['Technical challenge', 'Cost / resource question', 'Why not the obvious alternative', 'Question about a limitation or failure', 'Hostile or sceptical challenge', 'Question you genuinely cannot answer'], 'Technical challenge'), txt('talk', 'What is your talk about?', 3, 'Migrating our student records from a legacy on-premise database to a managed cloud service'), txt('weak', 'What is the weakest part of your work?', 2, 'We have no rollback plan if the migration fails midway')],
    compute: (v) => {
      const talk = asStr(v.talk).trim()
      if (!talk) return [sres('Q&A prep', 'Describe your talk first', T.warn)]
      const aud = asSel(v.aud)
      const type = asSel(v.qtype)
      const weak = asStr(v.weak).trim() || 'the parts I ran out of time to test properly'
      const FRAMEWORKS: Record<string, { name: string; steps: string[]; opener: string }> = {
        'Technical challenge': { name: 'Acknowledge → Show the mechanism → Give the evidence → Offer the limit', steps: ['Repeat the question, which buys you three seconds', 'Name the specific mechanism you are claiming', 'Point to the slide or the number that supports it', 'State honestly where it stops working'], opener: '"That is the right question to ask. The mechanism is…"' },
        'Cost / resource question': { name: 'Direct answer → Breakdown → Comparison → Caveat', steps: ['Give the number immediately — never make them ask twice', 'Split it into the two or three components', 'Compare it against the current cost or an alternative', 'State what the estimate excludes'], opener: '"It is X, of which Y is the licence and Z is the engineering time. Compared with the current…"' },
        'Why not the obvious alternative': { name: 'Concede the alternative is reasonable → Name the disqualifier → Explain the trade', steps: ['Agree it is a legitimate option', 'Name the one requirement it fails', 'Explain what you would need to change to make it viable', 'Confirm you have considered it'], opener: '"That was our starting point. It works until you need…"' },
        'Question about a limitation or failure': { name: 'Own it first → State the impact honestly → Show the mitigation → State what you would do', steps: ['Say it plainly before they do', 'Say what it means for them, not just for you', 'Show what you have already done about it', 'Say what you would do with more time'], opener: `"You are right, and the impact is ${weak}. Here is what is in place and here is what is not."` },
        'Hostile or sceptical challenge': { name: 'Stay level → Restate their concern precisely → Agree with the valid part → Address the invalid part calmly', steps: ['Do not defend your tone, defend the content', 'Repeat their concern in your own words, generously', 'Agree with whatever is true — it disarms them', 'Disagree with the remainder using evidence, not adjectives'], opener: '"That is a fair challenge, and the part about X is exactly right. Where I would push back is…"' },
        'Question you genuinely cannot answer': { name: 'Say no clearly → Say why → Offer a route to the answer', steps: ['Say "I do not know" without apologising', 'Say whether it is outside your expertise or simply unknown to you', 'Offer to find out and come back', 'Do not speculate on the spot'], opener: '"I do not know. That is outside what I have measured. I can look it up and email the group this week."' },
      }
      const fw = FRAMEWORKS[type] || FRAMEWORKS['Technical challenge']
      const AUDIENCE_FAVOURS: Record<string, { likes: string; dislikes: string; ask: string }> = {
        'Subject peers': { likes: 'specific methods and honest limitations', dislikes: 'oversimplification and vague claims', ask: '"How did you handle X?"' },
        'Non-specialist colleagues': { likes: 'consequences, examples and plain language', dislikes: 'unexplained jargon and detail without purpose', ask: '"What does this mean for my work?"' },
        'Senior leadership': { likes: 'cost, risk, timing and a clear ask', dislikes: 'technical detail and long preambles', ask: '"What do you need from me?"' },
        'Examiners / academic panel': { likes: 'defensible methodology and stated limitations', dislikes: 'overclaiming and unfalsifiable statements', ask: '"How would you know if this were wrong?"' },
        'External clients or partners': { likes: 'reliability, delivery and risk mitigation', dislikes: 'internal politics and academic framing', ask: '"Who is accountable if it fails?"' },
      }
      const af = AUDIENCE_FAVOURS[aud] || AUDIENCE_FAVOURS['Non-specialist colleagues']
      const extra = [
        { q: `Can you summarise what you just said in one sentence?`, a: 'Prepare this answer in advance and say it identically every time. It is the question you will be asked most.' },
        { q: 'What would you do differently if you started again?', a: 'Give one specific, real regret. Generic answers here read as a lack of reflection.' },
        { q: 'Who else on the team worked on this?', a: 'Credit collaborators by name. Examiners and senior audiences both notice this.' },
        { q: 'What is the biggest risk in your proposal?', a: 'Name it, quantify it, and say what you would do about it. Never deflect to "no significant risks".' },
        { q: 'When will we know whether this worked?', a: 'Give a metric, a baseline and a date. This is the question that converts a talk into a decision.' },
        { q: 'What are you not covering today?', a: 'Listing your exclusions confidently signals control. Do not apologise for them.' },
        { q: 'Can you send us the material?', a: 'Say yes and commit to a time. "I will circulate everything by Friday" is a complete answer.' },
      ]
      const blank = [
        'Take a breath and drink water — two seconds of silence reads as thought, not as failure.',
        'Repeat the question. It buys three seconds and confirms you understood it.',
        '"Let me give you a concrete example" — then say anything true. The example carries you back.',
        '"There are two parts to that" — then answer one of them slowly.',
        'Write the question on the board while you think. Looking at the room is what makes silence feel infinite.',
      ]
      const scripts = [
        `Q: [the question]`,
        `A framework — ${fw.name}:`,
        ...fw.steps.map((s, i) => `  ${i + 1}. ${s}`),
        ``,
        `Opener: ${fw.opener}`,
      ].join('\n')
      return [
        sres('Main framework', fw.name, T.good, `for ${type.toLowerCase()} questions`, 100),
        sres('Audience', aud, T.neutral, `they ask: ${af.ask}`),
        sres('Anticipated questions', num(extra.length + 1, 0), T.good, 'one framework plus the standard seven'),
        docr('Framework', scripts),
        docr('Question bank', extra.map((e, i) => `Q${i + 1}. ${e.q}\n   A: ${e.a}`).join('\n\n')),
        docr('When you go blank', blank.map((b, i) => `${i + 1}. ${b}`).join('\n')),
        res('What this audience rewards', af.likes, T.good, `and they discount ${af.dislikes}`),
        res('Your stated weak point', `"${weak}" — say this before someone finds it. Naming your own limitation makes every other claim you make more credible.`, T.warn),
        res('Technique', 'answer, then stop. The most common failure is trailing off after the answer, which invites a re-ask. Finish the sentence and be silent.', T.neutral),
      ]
    },
  },
  {
    id: 'presentation-storyline-builder-speaking',
    name: 'Presentation Storyline Builder',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Structures your content into a narrative arc with a hook, rising tension, a turn and a memorable close.',
    tip: 'Structure beats content. The same three facts told as a story with a problem, a surprise and a conclusion will outperform a technically superior but unordered list every time.',
    usage: ['Describe your content and your audience concern.', 'Choose your narrative arc.', 'Read the storyline.'],
    method: ['A classic arc is selected.', 'Your content is mapped to arc beats.', 'Hooks and the closing line are drafted.'],
    fields: [sel('arc', 'Narrative arc', ['Problem → solution → benefit', 'Question → investigation → answer', 'Status quo → disruption → new world', 'Story of one person', 'Before and after'], 'Problem → solution → benefit'), txt('content', 'Your key content points (one per line)', 6, 'Onboarding emails are opened by 40% of users\nWeek-one engagement is half that of week two\nNew users hit setup on day three and stall\nThe fix is a guided day-zero checklist'), txt('aud', 'What does your audience already know?', 2, 'They know the product. They assume onboarding is fine. They have never seen the funnel data.')],
    compute: (v) => {
      const content = linesOf(asStr(v.content))
      if (content.length < 2) return [sres('Storyline', 'Add at least two content points', T.warn)]
      const arc = asSel(v.arc)
      const known = asStr(v.aud).trim()
      const ARCS: Record<string, { beats: { name: string; share: number; role: string }[]; closers: string[] }> = {
        'Problem → solution → benefit': {
          beats: [
            { name: 'Hook', share: 0.1, role: 'Open with the most vivid instance of the problem. A real number or a real person, not a definition.' },
            { name: 'Problem', share: 0.25, role: 'Show the problem at its largest. Make the audience feel the cost in their own terms.' },
            { name: 'Tension', share: 0.12, role: 'Reveal why the obvious fix has not worked. This is the beat people skip and it is the one that makes them listen.' },
            { name: 'Solution', share: 0.28, role: 'Present the solution as a direct answer to the specific problem just described, not a product tour.' },
            { name: 'Benefit', share: 0.15, role: 'Quantify the benefit. One number that ties back to the cost in the problem beat.' },
            { name: 'Close', share: 0.1, role: 'Restate the problem, state the benefit, make the ask. Three sentences, then stop.' },
          ],
          closers: ['"We lose [number] users in week one. This plan gets [number] of them back. I need [resource] to start in [month]."'],
        },
        'Question → investigation → answer': {
          beats: [
            { name: 'Question', share: 0.12, role: 'Pose a question the audience genuinely cannot answer yet. Make it specific enough that a wrong answer is obviously wrong.' },
            { name: 'Why it matters', share: 0.1, role: 'Say what changes if the question is answered wrongly. This is what makes them care about the answer.' },
            { name: 'Investigation', share: 0.3, role: 'Walk through how you looked for the answer, including the paths that failed. The failure is what proves the work.' },
            { name: 'Surprise', share: 0.18, role: 'The answer nobody expected. Pause before you say it.' },
            { name: 'Answer', share: 0.2, role: 'State the answer plainly, then say what it means.' },
            { name: 'Close', share: 0.1, role: 'Return to the original question and answer it in one sentence.' },
          ],
          closers: ['"So: the question was whether X. The answer is Y — and here is what we do about it."'],
        },
        'Status quo → disruption → new world': {
          beats: [
            { name: 'Status quo', share: 0.22, role: 'Describe how it works now, in terms the audience will recognise. Do not be neutral — quietly note what it costs.' },
            { name: 'First crack', share: 0.16, role: 'Something small that already does not work. This plants the doubt without you having to argue for it.' },
            { name: 'Disruption', share: 0.24, role: 'The shift. Make it concrete: a specific event, number or decision, not an abstraction.' },
            { name: 'New world', share: 0.2, role: 'What is different now, and who it is different for. Include a downside — it makes the upside credible.' },
            { name: 'What it costs', share: 0.1, role: 'Be explicit about the cost of the transition. This is the slide that buys you permission to proceed.' },
            { name: 'Close', share: 0.08, role: 'One image of the new normal. No numbers, no caveats.' },
          ],
          closers: ['"This is what [concrete thing] looks like on Monday morning."'],
        },
        'Story of one person': {
          beats: [
            { name: 'Introduce', share: 0.12, role: 'One person, one specific situation, one sentence of context. No role titles.' },
            { name: 'Situation', share: 0.2, role: 'What they were trying to do and why it was harder than it should have been.' },
            { name: 'Obstacle', share: 0.22, role: 'The moment it broke. Be specific: what went wrong, in their words if you have them.' },
            { name: 'Turn', share: 0.2, role: 'What changed. This is where the product, the process or the idea enters — as the answer, not as a pitch.' },
            { name: 'After', share: 0.16, role: 'The outcome for this person, with a number if you have one.' },
            { name: 'Generalise', share: 0.1, role: 'One sentence: "this is not unusual, it is [pattern]". Then stop.' },
          ],
          closers: ['"[Name] is not the exception. They are the median. That is the opportunity."'],
        },
        'Before and after': {
          beats: [
            { name: 'Before', share: 0.2, role: 'Show the current state with the same visual treatment you will use for the after. Symmetry makes the change visible.' },
            { name: 'How we got here', share: 0.15, role: 'The decisions that produced the before. Two or three, not a history lesson.' },
            { name: 'The change', share: 0.2, role: 'What is different, in one clear diagram. This is the core of the talk.' },
            { name: 'After', share: 0.22, role: 'The same visual as the before. Let the audience do the subtraction.' },
            { name: 'What it took', share: 0.13, role: 'Effort, time, money. Stated plainly.' },
            { name: 'Close', share: 0.1, role: 'What we would do next from the after state.' },
          ],
          closers: ['"Same team, same budget, [number] difference. Here is what we would do next."'],
        },
      }
      const a = ARCS[arc] || ARCS['Problem → solution → benefit']
      const per = a.beats.length
      const assigned = content.slice(0, per)
      const storyline = a.beats.map((b, i) => {
        const item = assigned[i]
        return `${b.name.toUpperCase()} — ${ratio(b.share * 100, 0)}% of the talk\n  role: ${b.role}\n${item ? `  your content: ${item}` : '  (add content here)'}${item ? '' : '\n  ⚠ this beat has nothing to carry it — find material or merge it into a neighbour'}`
      })
      const gaps = per - content.length
      const hooks = [
        `Open with the number: "${content[0].slice(0, 70)}" — and then say what it costs.`,
        `Open with a question the audience cannot answer: "${content[0] ? 'Is ' + content[0].toLowerCase().replace(/[.?]$/, '') + ' actually working?' : 'Is what we are doing actually working?'}"`,
        `Open with a 10-second story: name a person, a moment, a problem. No slides for the first ten seconds.`,
        `Open with the thing that went wrong: "Last month we found out that ${(content[1] || content[0] || 'something we assumed was fine').toLowerCase()}."`,
        `Open with a picture, then speak. Ten seconds of silence before the first word buys total attention.`,
      ]
      return [
        sres('Arc selected', arc, T.good, `${num(per, 0)} beats · ${ratio(100, 0)}% of the talk covered`),
        sres('Content coverage', `${num(content.length, 0)}/${num(per, 0)}`, gaps > 0 ? T.warn : T.good, gaps > 0 ? `${num(gaps, 0)} beat(s) have nothing to carry them` : 'every beat has content', clamp((content.length / per) * 100, 5, 100)),
        sres('Audience starting point', known ? 'defined' : 'not defined', known ? T.good : T.warn, known ? known.slice(0, 70) : 'tell me what they already believe, or the arc cannot be tuned', known ? 80 : 30),
        docr('Storyline', storyline.join('\n\n')),
        docr('Hook options', hooks.map((h, i) => `${i + 1}. ${h}`).join('\n\n')),
        docr('Closing lines', a.closers.map((c) => `• ${c}`).join('\n')),
        res('Arc rule', 'never present the solution before the problem is felt. A solution introduced too early is a feature list; the same solution after the problem is a relief.', T.warn),
        res('Delete test', 'if you can remove a beat and the story still works, remove it. Talks almost always have one beat too many.', T.neutral),
        res('Close properly', 'stop talking after the last sentence. The most common way a strong ending is ruined is the nervous "so, yeah, any questions?"', T.neutral),
      ]
    },
  },
  {
    id: 'pitch-deck-checklist-speaking',
    name: 'Pitch Deck Checklist',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Audits a pitch or funding deck section by section against what investors and panels actually score.',
    tip: 'The first slide should make sense with the sound off. If your deck needs narration, it will lose half the people in the room before you start.',
    usage: ['Describe your deck sections.', 'Choose the audience and stage.', 'Read the audit and the missing pieces.'],
    method: ['Sections are scored against the decision-maker\'s criteria.', 'Missing elements are identified.', 'A revised section order is produced.'],
    fields: [sel('stage', 'Funding stage', ['Pre-seed / idea', 'Seed', 'Series A+', 'Internal project approval', 'Academic grant application'], 'Seed'), sel('aud', 'Decision makers', ['Investors', 'Non-executive board', 'Senior management', 'Grant reviewers', 'Procurement panel'], 'Investors'), txt('sections', 'Your deck sections (one per line)', 10, 'Problem\nSolution\nMarket size\nBusiness model\nTeam\nTraction\nFinancials\nThe ask'), n('mins', 'Meeting length (minutes)', { def: 20, min: 5, max: 90, step: 5 })],
    compute: (v) => {
      const secs = linesOf(asStr(v.sections)).map((s) => s.replace(/^\s*[\d.)\s-]+/, '').trim())
      if (secs.length < 2) return [sres('Deck audit', 'List your deck sections first', T.warn)]
      const stage = asSel(v.stage)
      const aud = asSel(v.aud)
      const mins = Math.max(5, asNum(v.mins))
      const sl = secs.map((s) => s.toLowerCase())
      const has = (k: string) => sl.some((s) => s.includes(k))
      const REQUIRED: Record<string, { key: string; label: string; why: string; weight: number }[]> = {
        'Investors / Investors': [
          { key: 'problem', label: 'Problem', why: 'without a real problem there is no investment case', weight: 15 },
          { key: 'solution', label: 'Solution', why: 'one sentence, no jargon, no product tour', weight: 15 },
          { key: 'market', label: 'Market size', why: 'bottom-up beats top-down; a TAM slide from a report usually reads as unserious', weight: 10 },
          { key: 'business model', label: 'Business model', why: 'how money actually arrives, with a real number', weight: 10 },
          { key: 'traction', label: 'Traction', why: 'the single most weighted section after the team; any real usage, revenue or retention data', weight: 20 },
          { key: 'team', label: 'Team', why: 'why you specifically can do this', weight: 15 },
          { key: 'ask', label: 'The ask', why: 'amount, runway and what it buys. Vague asks get vague answers', weight: 10 },
          { key: 'competition', label: 'Competition', why: 'shows you know the landscape; a slide claiming there is none is a red flag', weight: 5 },
        ],
        'Senior management / Non-executive board': [
          { key: 'recommendation', label: 'Recommendation up front', why: 'the decision first, the reasoning second — BLUF', weight: 20 },
          { key: 'cost', label: 'Cost', why: 'total cost of ownership, not just licence cost', weight: 20 },
          { key: 'benefit', label: 'Benefit', why: 'quantified, with the assumption stated', weight: 20 },
          { key: 'risk', label: 'Risks and mitigation', why: 'a plan with no risk section reads as an untested plan', weight: 20 },
          { key: 'decision', label: 'The decision requested', why: 'what you need approved, by whom, by when', weight: 20 },
        ],
        'Grant reviewers / Academic grant application': [
          { key: 'need', label: 'Need / problem', why: 'the unmet need, with evidence of unmet-ness', weight: 15 },
          { key: 'objective', label: 'Objectives', why: 'specific, measurable, achievable in the period', weight: 15 },
          { key: 'method', label: 'Methodology', why: 'how you will generate the evidence, including the analysis plan', weight: 20 },
          { key: 'team', label: 'Team and capability', why: 'who does what, with the track record that proves each part', weight: 15 },
          { key: 'timeline', label: 'Timeline and milestones', why: 'with deliverables, not just phases', weight: 10 },
          { key: 'budget', label: 'Budget', why: 'justified line by line; a 20% contingency is expected, not apologised for', weight: 10 },
          { key: 'impact', label: 'Impact and dissemination', why: 'what changes, for whom, and how others will know', weight: 15 },
        ],
        'Procurement panel / External clients or partners': [
          { key: 'requirement', label: 'Requirement coverage', why: 'a table mapping every requirement to how you meet it', weight: 25 },
          { key: 'approach', label: 'Approach and scope', why: 'what you will do, in their language not yours', weight: 15 },
          { key: 'capability', label: 'Capability evidence', why: 'similar work, references, certifications', weight: 20 },
          { key: 'price', label: 'Commercials', why: 'transparent breakdown, not a one-line total', weight: 20 },
          { key: 'risk', label: 'Risk and exit', why: 'how you would exit cleanly if it goes wrong', weight: 10 },
          { key: 'timeline', label: 'Delivery timeline', why: 'with dependencies you do not control called out', weight: 10 },
        ],
      }
      const key = aud === 'Non-executive board' ? 'Senior management / Non-executive board' : aud === 'Grant reviewers' ? 'Grant reviewers / Academic grant application' : aud === 'Procurement panel' ? 'Procurement panel / External clients or partners' : 'Investors / Investors'
      const req = REQUIRED[key] || REQUIRED['Investors / Investors']
      const matched = req.filter((r) => has(r.key))
      const missing = req.filter((r) => !has(r.key))
      const totalW = req.reduce((s, r) => s + r.weight, 0)
      const gotW = matched.reduce((s, r) => s + r.weight, 0)
      const score = Math.round((gotW / totalW) * 100)
      const secsPerSlide = mins / secs.length
      const perSlide: Record<string, number> = { problem: 3, solution: 3, traction: 4, team: 2, market: 2, ask: 2, risk: 3, cost: 3, benefit: 2, 'business model': 2, competition: 2, methodology: 4, method: 4, budget: 2, impact: 2, requirement: 3, capability: 2, price: 3, approach: 3, timeline: 2, recommendation: 2, decision: 2, need: 2, objective: 2, risks: 3, 'delivery timeline': 2, 'budget and justification': 2, 'track record': 2, 'project summary': 1, 'objectives and outcomes': 2, 'timetable': 2, 'evaluation and impact': 2, 'commercials and pricing': 2, 'your experience and approach': 2, 'school of thought': 1 }
      const timing = secs.map((s) => {
        const key2 = Object.keys(perSlide).find((k) => s.includes(k))
        return `${s.padEnd(28)} ${num((key2 ? perSlide[key2] : 1.5) * 60, 0).padStart(4, ' ')}s`
      })
      const totalT = secs.reduce((sum, s) => {
        const key2 = Object.keys(perSlide).find((k) => s.includes(k))
        return sum + (key2 ? perSlide[key2] : 1.5)
      }, 0)
      return [
        sres('Deck completeness', `${score}%`, score > 80 ? T.good : score > 55 ? T.warn : T.bad, `${matched.length} of ${req.length} decision-critical sections present`, score),
        sres('Missing sections', num(missing.length, 0), missing.length > 3 ? T.bad : missing.length ? T.warn : T.good, missing.length ? missing.map((m) => m.label).join(', ') : 'nothing critical is missing', clamp(100 - missing.length * 15, 5, 100)),
        sres('Time budget', `${num(totalT, 1)} of ${num(mins, 0)} min used`, totalT > mins ? T.bad : totalT < mins * 0.7 ? T.warn : T.good, `${num(secsPerSlide, 1)} min per section`, clamp(100 - (totalT / Math.max(1, mins)) * 70, 5, 100)),
        docr('Section audit', req.map((r) => `${has(r.key) ? '✓' : '✗'} ${r.label}${has(r.key) ? '' : ' — MISSING'} (${r.weight}% weight)\n   ${r.why}`).join('\n')),
        docr('Suggested time per section', timing.join('\n')),
        docr('What to add', missing.length ? missing.map((m) => `${m.label}\n   ${m.why}\n   Suggestion: ${m.key === 'competition' ? 'a 2x2 positioning table, or say explicitly that there is no competition and explain why that is not a risk' : m.key === 'traction' ? 'a chart of one metric over time; if you have no traction, show the experiment you ran and what it found' : m.key === 'ask' ? 'specific amount, months of runway, and the three things it buys' : m.key === 'risk' ? 'top three risks with likelihood, impact and mitigation — one line each' : 'add a single slide answering this question directly'}`).join('\n\n') : 'no sections missing'),
        res('Reading order', 'these decision-makers read in this order and stop when they have what they need. Put your strongest section first, not your chronology.', T.neutral),
        res('The 3-second test', 'someone reading only slide titles should get the whole story. Read your titles in order and see whether they make sense.', T.warn),
        res('Stage note', stage === 'Pre-seed / idea' ? 'at this stage the deck is about the team and the insight; traction is not required, a credible insight is.' : stage === 'Seed' ? 'traction matters more than anything except the team — spend half your slides there.' : 'metrics, cohort retention and unit economics are the entire conversation.', T.neutral),
      ]
    },
  },
  {
    id: 'body-language-checker-speaking',
    name: 'Body Language Checker',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Scores your self-reported delivery habits against what audiences actually respond to in presentations.',
    tip: 'Your posture is read in the first seven seconds, before you have said anything. Stand still, hands visible, and pause — that alone changes how credible you sound.',
    usage: ['Rate your current delivery habits.', 'Choose your presentation type.', 'Read the score and the specific fixes.'],
    method: ['Delivery habits are scored against presentation-type demands.', 'Each weak habit gets a specific correction.', 'A prioritised rehearsal list is returned.'],
    fields: [ck('habits', 'Which of these do you currently do?', ['I stand still and centred when speaking', 'My hands are visible and away from my face', 'I look at different parts of the room', 'I pause instead of filling silence with "um"', 'My gestures match what I am saying', 'I face the audience, not the screen', 'My voice is audible at the back of the room', 'I have a deliberate opening line prepared', 'I use my whole body, not just my hands', 'I appear relaxed even when nervous']), sel('ptype', 'Presentation type', ['Classroom talk', 'Conference talk', 'Executive briefing', 'Sales pitch', 'Thesis or viva'], 'Conference talk')],
    compute: (v) => {
      const h = asBoolList(v.habits).map(Boolean)
      if (!h.some(Boolean)) return [sres('Body language', 'Select the habits you currently do', T.warn)]
      const HABITS = ['Stance is still and centred', 'Hands visible, away from face', 'Eye contact moves across the room', 'Pauses instead of filler sounds', 'Gestures match the message', 'Facing the audience, not the screen', 'Voice carries to the back row', 'Prepared opening line', 'Uses whole body, not just hands', 'Appears relaxed when nervous']
      const present = HABITS.filter((_, i) => h[i])
      const missing = HABITS.filter((_, j) => !h[j])
      const ptype = asSel(v.ptype)
      const WEIGHTS: Record<string, number[]> = {
        'Classroom talk': [5, 5, 6, 7, 3, 8, 9, 6, 2, 6],
        'Conference talk': [5, 4, 8, 7, 6, 8, 9, 8, 5, 7],
        'Executive briefing': [4, 4, 7, 8, 3, 9, 8, 9, 2, 9],
        'Sales pitch': [6, 5, 8, 7, 8, 8, 9, 9, 6, 8],
        'Thesis or viva': [3, 3, 8, 7, 2, 9, 8, 7, 2, 9],
      }
      const w = WEIGHTS[ptype] || WEIGHTS['Conference talk']
      const totalW = w.reduce((s, x) => s + x, 0)
      const gotW = w.reduce((s, x, i) => s + (h[i] ? x : 0), 0)
      const score = Math.round((gotW / totalW) * 100)
      const ranked = missing.map((m) => ({ m, impact: w[HABITS.indexOf(m)] })).sort((a, b) => b.impact - a.impact)
      const FIXES: Record<string, string> = {
        'Stance is still and centred': 'feet shoulder-width, weight even, shoulders back. Rocking reads as anxiety to an audience even when you feel fine.',
        'Hands visible, away from face': 'default position is loosely clasped at waist height. Pockets, crossed arms and face-touching all signal disengagement.',
        'Eye contact moves across the room': 'pick three zones. Hold each for one full sentence, then move. One point of contact feels like a confrontation; sweeping feels like a search.',
        'Pauses instead of filler sounds': 'a two-second silence sounds like three seconds to you and like confidence to the room. Practise a deliberate pause after every key claim.',
        'Gestures match the message': 'gesture on the verb, not the noun. "We grew 40 percent" with your hand rising on "grew". Mismatched gestures contradict your words.',
        'Facing the audience, not the screen': 'turn your body to the screen only to point, then turn back. Reading your slides aloud is the fastest way to lose a room.',
        'Voice carries to the back row': 'project from the stomach, not the throat. Test it: someone at the back should not need to strain. Volume goes down as you speed up — they do not.',
        'Prepared opening line': 'memorise your first two sentences word for word. The first 30 seconds carry the most weight and the most adrenaline.',
        'Uses whole body, not just hands': 'shift your weight and step when you change topic. Movement at topic boundaries signals structure to the audience.',
        'Appears relaxed when nervous': 'exhale slowly for four counts before you start. Adrenaline is energy — release it deliberately rather than trying to suppress it.',
      }
      return [
        sres('Delivery score', `${score}/100`, score > 80 ? T.good : score > 55 ? T.warn : T.bad, `${present.length} of ${HABITS.length} habits for a ${ptype.toLowerCase()}`, score),
        sres('Your strengths', present.slice(0, 3).join(', ') || 'none yet', present.length ? T.good : T.warn, 'keep these — they are the foundation'),
        sres('Biggest gap', ranked[0]?.m || 'none', ranked[0] && ranked[0].impact >= 7 ? T.warn : T.neutral, ranked[0] ? `importance ${ranked[0].impact}/10 for this type` : 'all habits covered'),
        docr('Rehearsal list', ranked.map((r, i) => `${i + 1}. ${r.m} (impact ${r.impact}/10)\n   ${FIXES[r.m]}`).join('\n\n') || 'all habits covered — focus on content and timing now'),
        docr('Habits you already have', present.length ? present.map((p) => `✓ ${p}`).join('\n') : 'none selected'),
        res('What this format demands', `For a ${ptype.toLowerCase()}, the weighted priorities are ${w.map((x, i) => `${HABITS[i].toLowerCase()} (${x})`).sort((a, b) => Number(b.match(/\((\d+)\)/)?.[1] || 0) - Number(a.match(/\((\d+)\)/)?.[1] || 0)).slice(0, 3).join(', ')}.`, T.neutral),
        res('Record yourself', 'one phone recording per rehearsal week. You will not enjoy it and it is the fastest feedback available. Watch with the sound off first — that is what the audience sees.', T.good),
        res('The 7% rule', 'in a room of 14 people, 7 of them will not be looking at you at any given moment. Do not deliver your talk to one face.', T.neutral),
      ]
    },
  },
  {
    id: 'audience-question-predictor-speaking',
    name: 'Audience Question Predictor',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Predicts the questions your specific audience will ask, ranked by how likely and how hard they are to answer.',
    tip: 'The question you cannot answer is always the one about your own limitations. Prepare it first and it stops being a threat.',
    usage: ['Describe your talk and audience.', 'Set their level of knowledge.', 'Read the ranked question predictions.'],
    method: ['Audience profile drives question types.', 'Likelihood is estimated from the audience\'s knowledge gap.', 'Questions are ranked by difficulty and risk.'],
    fields: [sel('know', 'Audience knowledge level', ['Knows nothing about the topic', 'Knows the basics', 'Works in the adjacent field', 'Expert in exactly this area'], 'Knows the basics'), txt('talk', 'What is your talk about?', 3, 'How we reduced student dropout by building an early-warning system from attendance and grade data'), sel('setting', 'Setting', ['Conference session', 'Classroom', 'Internal review', 'Public event'], 'Conference session'), txt('weak', 'What is the weakest part of your work?', 2, 'The early-warning model has never been validated on a different institution')],
    compute: (v) => {
      const talk = asStr(v.talk).trim()
      if (!talk) return [sres('Prediction', 'Describe your talk first', T.warn)]
      const know = asSel(v.know)
      const setting = asSel(v.setting)
      const weak = asStr(v.weak).trim() || 'the parts that have only been tested in one place'
      const KNOW: Record<string, { depth: number; focus: string[] }> = {
        'Knows nothing about the topic': { depth: 0, focus: ['What problem does this solve?', 'What does it cost?', 'Who is affected and how many?', 'What happens if it is wrong?'] },
        'Knows the basics': { depth: 1, focus: ['How is this different from what we already do?', 'What is the evidence base?', 'What are the limitations?', 'How much does it cost?'] },
        'Works in the adjacent field': { depth: 2, focus: ['Does this generalise beyond one institution?', 'How does this interact with [their area]?', 'What is the technical basis for the prediction?', 'What is the false positive rate?'] },
        'Expert in exactly this area': { depth: 3, focus: ['How did you handle [the specific known confound]?', 'Why did you not use [the method they would expect]?', 'What is your effect size and confidence interval?', 'What is the selection bias in your sample?'] },
      }
      const k = KNOW[know] || KNOW['Knows the basics']
      const SETTING: Record<string, { extra: string[]; hostile: number; timePerQ: number }> = {
        'Conference session': { extra: ['Is this published anywhere?', 'Who else is doing this work?', 'What is the next experiment?'], hostile: 2, timePerQ: 1.5 },
        'Classroom': { extra: ['How do I apply this to my own situation?', 'What if I do not have the data?', 'Is this on the exam?'], hostile: 0, timePerQ: 1 },
        'Internal review': { extra: ['What is the operational burden on my team?', 'What happens to my current process?', 'Who signs this off?'], hostile: 3, timePerQ: 2 },
        'Public event': { extra: ['Is this safe for students?', 'What does this cost per student?', 'Can I see it myself?'], hostile: 1, timePerQ: 1 },
      }
      const st = SETTING[setting] || SETTING['Conference session']
      const questions: { q: string; type: string; likely: number; hard: number; prep: string }[] = [
        { q: 'What is the biggest limitation of this work?', type: 'Limitation', likely: 10, hard: 8, prep: `Answer directly: "${weak}". Then say what would remove that limitation. Never deflect here.` },
        { q: 'How big is the effect, and how confident are you in it?', type: 'Evidence', likely: 9 - k.depth * 2, hard: 6 + k.depth, prep: 'Give the number and the interval. If you have no interval, say what you would need to compute one.' },
        { q: 'What happens when it is wrong?', type: 'Risk', likely: 8 - st.hostile, hard: 7, prep: 'Describe the worst realistic case and the early warning that would catch it.' },
        { q: 'How much does this cost to run?', type: 'Commercial', likely: 8, hard: 4, prep: 'Give the total annual figure and the per-unit figure. If it is not costed, say what you would need to know.' },
        { q: 'Why not simply do X instead?', type: 'Alternative', likely: 7 + st.hostile, hard: 7, prep: 'Name the obvious alternative, concede it is reasonable, name the one requirement it fails.' },
        { q: 'Does this generalise beyond your setting?', type: 'Generalisability', likely: 6 + k.depth * 2, hard: 8, prep: 'State exactly what is specific to your setting and what is structural. Do not overclaim transferability.' },
        { q: 'What is the false positive rate?', type: 'Technical', likely: 4 + k.depth * 2, hard: 9, prep: 'Have the number ready. If you have not measured it, say so and say how you would.' },
        { q: 'Who owns this when it goes wrong?', type: 'Operational', likely: st.hostile >= 3 ? 9 : 3, hard: 5, prep: 'Name the accountable role. This is a governance question, not a technical one.' },
        { q: 'What would you do next?', type: 'Forward', likely: 9, hard: 3, prep: 'Name one specific next step with a date. This is the easiest question to score well on — do not waste it.' },
        ...k.focus.map((f, i) => ({ q: f, type: 'Audience-specific', likely: 9 - i, hard: 4 + k.depth, prep: `This audience will ask this because they ${k.depth === 0 ? 'do not know the context' : k.depth === 1 ? 'need the practical relevance' : k.depth === 2 ? 'care about transferability' : 'are testing the methodology'}. Answer in their vocabulary.` })),
        ...st.extra.map((f, i) => ({ q: f, type: 'Setting-specific', likely: 6 - i, hard: 3 + st.hostile, prep: 'Keep this short and concrete. Setting-specific questions reward a fast, unhesitating answer.' })),
      ]
      const ranked = questions.sort((a, b) => (b.likely * (10 - b.hard)) / 20 - (a.likely * (10 - a.hard)) / 20)
      const top5 = ranked.slice(0, 5)
      return [
        sres('Likely questions', num(ranked.length, 0), T.good, `${know.toLowerCase()} · ${setting.toLowerCase()}`),
        sres('Top prediction', top5[0]?.q || '—', T.warn, `${num(top5[0]?.likely || 0, 0)}/10 likelihood`, (top5[0]?.likely || 0) * 10),
        sres('Hardest to answer', ranked.filter((q) => q.hard >= 8).length ? ranked.filter((q) => q.hard >= 8).sort((a, b) => b.hard - a.hard)[0].q : 'none above difficulty 8', T.warn, 'prepare this one first'),
        docr('Ranked predictions', ranked.map((q, i) => `${i + 1}. ${q.q}\n   type: ${q.type} · likelihood ${q.likely}/10 · difficulty ${q.hard}/10\n   how to answer: ${q.prep}`).join('\n\n')),
        docr('Your five to prepare', top5.map((q, i) => `${i + 1}. ${q.q}\n   → ${q.prep}`).join('\n\n')),
        res('Rule of three', `write a one-paragraph answer to each of your top three and read them aloud. You are not memorising them — you are making sure the answer exists before you need it.`, T.good),
        res('Unanswerable question', 'if you genuinely cannot answer, say so and say when you will. One honest "I do not know, I will find out and email you" beats three sentences of confident invention.', T.good),
        res('Timing', `budget about ${ratio(st.timePerQ, 1)} minutes per question. With a ${setting.toLowerCase()}, run over is the most common failure — leave a minute of slack.`, T.neutral),
      ]
    },
  },
  {
    id: 'slide-readability-tester-speaking',
    name: 'Slide Readability Tester',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Checks your slide text for readability: font size, words per slide, contrast risk, contrast length and line length.',
    tip: 'Your last three slides are always the ones the audience reads instead of listening. Put anything you want remembered on those, never anything you want spoken.',
    usage: ['Paste your slide text.', 'Set the smallest font you use.', 'Read the readability audit.'],
    method: ['Words and lines per slide are measured.', 'Font sizes and contrast rules are checked.', 'Slides are ranked by readability risk.'],
    fields: [n('minfont', 'Smallest font size on your slides (pt)', { def: 18, min: 8, max: 48, step: 1 }), txt('slides', 'Slide text (blank line between slides)', 14, 'Onboarding funnel\nWeek 1: 100% sign up\nWeek 2: 48% active\nWeek 3: 31% active\nWeek 4: 22% active\n\nOur analysis shows that a very large proportion of newly registered users never return to the platform after their initial session which is a significant problem for the business and we should do something about it soon.\n\nThe solution\nWe move setup to day 0\nChecklist of 3 steps\nIn-app guide\nEmail nudge at hour 4')],
    compute: (v) => {
      const text = asStr(v.slides).trim()
      if (text.length < 20) return [sres('Readability', 'Paste your slide text first', T.warn)]
      const minFont = asNum(v.minfont) || 18
      const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)
      const audit = blocks.map((b, i) => {
        const lines = b.split('\n').map((l) => l.trim()).filter(Boolean)
        const w = b.split(/\s+/).filter(Boolean)
        const longest = lines.reduce((m, l) => Math.max(m, l.length), 0)
        const issues: string[] = []
        let risk = 0
        if (w.length > 30) { issues.push(`${w.length} words — a slide should be readable in 3 seconds, which is about 20 words`); risk += 3 }
        if (w.length > 60) risk += 2
        if (lines.length > 7) { issues.push(`${lines.length} lines — more than 7 lines is a page, not a slide`); risk += 2 }
        if (longest > 60) { issues.push(`a line of ${longest} characters wraps on most projectors — keep lines under 60`); risk += 2 }
        if (b.includes(';')) { issues.push('contains semicolons — split into separate points instead'); risk += 1 }
        if (/[a-z]{25,}/.test(b)) { issues.push('contains a very long word — check it renders at your font size'); risk += 1 }
        if (w.length > 20 && !/\d/.test(b)) { issues.push('no number anywhere on a data-dense slide — add the figure or cut the text'); risk += 1 }
        if (minFont < 18) { issues.push(`smallest font is ${minFont}pt — anything under 18pt is unreadable beyond the front rows`); risk += minFont < 14 ? 3 : 2 }
        if (minFont < 12) risk += 3
        const titleLike = lines[0] && lines[0].length < 45 && lines.length <= 4
        return { i: i + 1, words: w.length, lines: lines.length, longest, issues, risk, titleLike, text: b }
      })
      const worst = audit.slice().sort((a, b) => b.risk - a.risk)
      const avgWords = audit.reduce((s, a) => s + a.words, 0) / audit.length
      const score = clamp(100 - worst.reduce((s, a) => s + a.risk * (a.words / Math.max(1, avgWords)), 0) * 1.6, 5, 100)
      return [
        sres('Readability score', `${Math.round(score)}/100`, score > 80 ? T.good : score > 55 ? T.warn : T.bad, `${num(blocks.length, 0)} slides, ${num(Math.round(avgWords), 0)} words per slide on average`, score),
        sres('Slide density', `${num(Math.round(avgWords), 0)} words/slide`, avgWords > 30 ? T.bad : avgWords > 20 ? T.warn : T.good, 'the 20-word rule: everything beyond that is being read, not heard', clamp(100 - (avgWords / 40) * 100, 5, 100)),
        sres('Smallest font', `${num(minFont, 0)}pt`, minFont >= 20 ? T.good : minFont >= 18 ? T.warn : T.bad, minFont >= 20 ? 'safe for any room' : minFont >= 18 ? 'borderline for large rooms' : 'will be illegible at the back', clamp((minFont / 24) * 100, 5, 100)),
        docr('Slide-by-slide audit', audit.map((a) => `Slide ${a.i}: ${a.words} words, ${a.lines} lines, longest line ${a.longest} chars\n${a.issues.length ? a.issues.map((x) => `   ⚠ ${x}`).join('\n') : '   ✓ readable'}`).join('\n\n')),
        docr('Worst offenders', worst.slice(0, 3).map((a) => `SLIDE ${a.i} (risk ${a.risk})\n${a.text}`).join('\n\n---\n\n')),
        res('The 20-word rule', 'if a slide has more than 20 words, it is a document. Split it, move the detail to a handout, and say the rest out loud.', T.warn),
        res('Font floors', 'title 32pt+, body 20pt+, footnotes 16pt minimum. If your content does not fit at 20pt, the content is wrong, not the font.', T.neutral),
        res('Contrast is not decoration', 'dark text on light background, or the reverse. Never light grey on white, never a photo behind text, never red and green as the only distinction.', T.warn),
        res('Reading the slide aloud', `if you read your slide text to the audience, you have added nothing — the slide is doing your job for you and they are doing your reading for you.`, T.neutral),
      ]
    },
  },
  {
    id: 'presentation-timer-planner-speaking',
    name: 'Rehearsal Timer Planner',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Plans a structured rehearsal schedule across your remaining days, with timed run-throughs and a dress rehearsal.',
    tip: 'Three full run-throughs. The first is for content, the second is for timing, the third is for nerves. Two run-throughs is a speech you are hoping goes well.',
    usage: ['Set the talk date and length.', 'Set how much time you have to prepare.', 'Read the rehearsal schedule.'],
    method: ['Rehearsal sessions are back-scheduled from the event.', 'Each session has a distinct purpose.', 'A checklist for the final 24 hours is produced.'],
    fields: [dt('date', 'Presentation date'), n('days', 'Days until the talk', { def: 10, min: 1, max: 90, step: 1 }), n('mins', 'Talk length (minutes)', { def: 15, min: 3, max: 180, step: 1 }), n('perday', 'Minutes you can practise per day', { def: 45, min: 10, max: 480, step: 5 }), sel('setup', 'Room and setup', ['Talk at the venue the day before', 'Venue known, rehearsal elsewhere', 'Venue unknown, rehearse at home', 'Recorded talk, asynchronous'], 'Venue known, rehearsal elsewhere')],
    compute: (v) => {
      const days = Math.max(1, asNum(v.days))
      const mins = Math.max(3, asNum(v.mins))
      const perday = Math.max(10, asNum(v.perday))
      const date = asStr(v.date)
      const setup = asSel(v.setup)
      const totalNeeded = mins * 3
      const totalAvail = perday * days
      const sessions: { day: number; purpose: string; detail: string }[] = []
      if (days >= 7) {
        sessions.push({ day: 1, purpose: 'Content', detail: 'Write or finalise the script. No timing pressure — get the argument right first.' })
        sessions.push({ day: 2, purpose: 'Slides', detail: 'Build the deck. For each slide write the assertion title. Delete any slide you cannot justify.' })
        sessions.push({ day: Math.max(3, days - 5), purpose: 'Run-through 1 (content)', detail: 'Full run with a timer. Do not stop for mistakes — find out where you lose your thread.' })
        sessions.push({ day: Math.max(4, days - 4), purpose: 'Fixes', detail: 'Cut 15% of the content. Almost always too long on the first timed run.' })
        sessions.push({ day: Math.max(5, days - 3), purpose: 'Run-through 2 (timing)', detail: 'Full run, timed. Target 90% of your slot so you finish with room to breathe.' })
        sessions.push({ day: Math.max(6, days - 2), purpose: 'Q&A rehearsal', detail: 'Rehearse the top 8 predicted questions out loud with a colleague.' })
        sessions.push({ day: Math.max(7, days - 1), purpose: 'Dress rehearsal', detail: setup.startsWith('Talk at the venue') ? 'Full run at the venue with the real equipment. Walk the room and stand at the front.' : 'Full run, standing, in clothes you will wear, with the clicker in your hand.' })
        sessions.push({ day: days, purpose: 'Warm-up only', detail: 'Say your opening line and your closing line out loud twice. Read nothing new. Then stop.' })
      } else if (days >= 3) {
        sessions.push({ day: 1, purpose: 'Content and slides', detail: 'Finalise the argument and build the deck in one sitting. Do not polish wording.' })
        sessions.push({ day: Math.max(2, days - 1), purpose: 'Run-through 1 and 2', detail: `Two full timed runs today, ${num(perday, 0)} minutes apart. Cut aggressively after the first.` })
        sessions.push({ day: days, purpose: 'Dress rehearsal', detail: 'One run in your presenting clothes, then the opening and closing lines twice. Nothing new after this.' })
      } else {
        sessions.push({ day: 1, purpose: 'Emergency trim', detail: `Write the minimum viable talk: opening, three key points, closing. Target ${num(Math.round(mins * 0.8), 0)} minutes — better a short good talk than a long unprepared one.` })
        sessions.push({ day: days, purpose: 'Two runs', detail: 'Run it twice with a timer, then rehearse only the opening and the Q&A you will get.' })
      }
      const usable = perday
      const lines = sessions.map((s) => {
        const dLabel = date && s.day === days ? ` (${date} — event day)` : s.day === days ? ' (event day)' : ''
        return `Day ${s.day}${dLabel} — ${s.purpose}\n   ${s.detail}\n   budget: ${num(Math.min(usable, Math.max(15, mins * 0.8)), 0)} min`
      })
      const ready = totalAvail >= totalNeeded
      return [
        sres('Rehearsal plan', `${num(sessions.length, 0)} sessions`, days >= 7 ? T.good : days >= 3 ? T.warn : T.bad, `${num(perday, 0)} min/day · ${num(days, 0)} days`, clamp((days / 14) * 100, 5, 100)),
        sres('Time available', `${num(totalAvail, 0)} min`, ready ? T.good : T.warn, `${num(totalNeeded, 0)} min needed for 3 full run-throughs`, clamp((Math.min(1, totalAvail / Math.max(1, totalNeeded)) * 100), 5, 100)),
        docr('Schedule', lines.join('\n\n')),
        docr('Final 24 hours', [`1. Run the talk once, standing, timed`, `2. Note the three things to fix and nothing else`, `3. Rehearse the opening line until it is automatic`, `4. Prepare one printed page of numbers or key facts`, `5. Charge the clicker, pack the adapter, check the file on the venue's machine`, `6. Sleep. A short rested talk beats a long exhausted one.`].join('\n')),
        res('Adequacy', ready ? 'you have time for three run-throughs — that is the minimum that works' : `only ${num(Math.floor(totalAvail / Math.max(1, mins)), 0)} full run(s) possible. Cut the talk to ${num(Math.floor(totalAvail / 3), 0)} minutes so you can still rehearse it three times.`, ready ? T.good : T.bad),
        res('Record every run', 'each one, audio or video. You will not enjoy run one. By run three you will hear the difference and it will not be obvious to anyone else.', T.good),
        res('Never rehearse in your head', 'mental rehearsal feels fluent and is not. It has to be out loud, standing, with your hands moving.', T.warn),
        res('Venue rehearsal', setup === 'Venue unknown, rehearse at home' ? 'an unknown room changes your pacing — the room you rehearse in is the room you will overfill in your head. Arrive early and stand at the front before you present.' : 'if you can, present to one person before the real audience. The silence of a real room is the thing you cannot rehearse at home.', T.neutral),
      ]
    },
  },
  {
    id: 'impromptu-speaking-prompter-speaking',
    name: 'Impromptu Speaking Prompter',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Generates an impromptu speech frame and a 60-second answer for a random prompt, with structure and timing.',
    tip: 'You will never think of the perfect structure under pressure. Decide now that every answer is: point, reason, example, close — and just execute it.',
    usage: ['Set the occasion and time limit.', 'Choose your prompt difficulty.', 'Read the frame and the closing line.'],
    method: ['A prompt is selected from a bank.', 'The PREP structure is mapped to the time limit.', 'An opening line and a closing line are generated.'],
    fields: [sel('occ', 'Occasion', ['After-dinner or social', 'Wedding speech', 'Toast / award acceptance', 'Q&A panel', 'Teaching a class', 'Job interview answer', 'Elevator pitch', 'Conference lightning talk'], 'Q&A panel'), n('secs', 'Time limit (seconds)', { def: 60, min: 15, max: 600, step: 15 }), sel('diff', 'Difficulty', ['Gentle (abstract prompt)', 'Moderate (opinion prompt)', 'Hard (provocative prompt)'], 'Moderate (opinion prompt)'), txt('subject', 'Topic or your role (optional context)', 2, 'Data literacy in the undergraduate curriculum')],
    compute: (v) => {
      const secs = Math.max(15, asNum(v.secs))
      const diff = asSel(v.diff)
      const occ = asSel(v.occ)
      const ctx = asStr(v.subject).trim()
      const GENTLE = ['What is something you changed your mind about recently?', 'What advice would you give your first-year self?', 'What is a small thing that makes a big difference?', 'What book, talk or idea changed how you work?', 'What is the best meal you have had and why?', 'What is a skill you wish schools taught?']
      const MODERATE = ['Should grades be the main measure of learning?', 'Is it better to specialise or to generalise?', 'What does a good workplace actually look like?', 'Should students be required to do more practical work?', 'Is speed or quality more important in professional life?', 'What should be taught that is not currently taught?']
      const HARD = ['Is formal education worth the debt it creates?', 'Has remote work made teams worse?', 'Should AI tools be allowed in assessed work?', 'Is competition a good thing in education?', 'Who is responsible when an algorithm causes harm?', 'Do grades measure anything worth measuring?']
      const bank = diff.startsWith('Hard') ? HARD : diff.startsWith('Gentle') ? GENTLE : MODERATE
      const prompt = bank[Math.floor((secs * 7) / 100) % bank.length]
      const wps = 130
      const budget = Math.round((secs * wps) / 60)
      const OCC: Record<string, { frame: string[]; open: string; close: string }> = {
        'After-dinner or social': { frame: ['Open with a light, self-deprecating observation', 'One story that makes people laugh', 'Turn the story into a point about the people in the room', 'Warm close that includes everyone'], open: '"Before I say anything sensible, I should confess something…"', close: '"So — raise your glasses to [occasion/people]. I will stop before I get sentimental."' },
        'Wedding speech': { frame: ['Thank them by name in the first ten seconds', 'One story from when you first met them', 'One story that reveals a flaw or a surprise', 'A specific wish for their life together, not a generic one'], open: '"I have known [name] for [n] years, and I still maintain that the best decision they ever made was…"', close: '"To [name] and [name]. May your life together be as good as the two of you separately."' },
        'Toast / award acceptance': { frame: ['Name the specific people who made it possible', 'One genuine story of a setback', 'What the award actually changed for you', 'Thank the unglamorous people by name'], open: '"I want to start by saying this is not my award, it belongs to four people who are not on this stage."', close: '"Thank you. I will spend the next year trying to be worth this."' },
        'Q&A panel': { frame: ['Restate the question in one sentence', 'Answer directly in the first sentence', 'One piece of evidence or example', 'Acknowledge what you do not know', 'Stop — do not fill the silence'], open: '"If I understand the question correctly, you are asking whether…"', close: `"That is what I know so far. I would want to check the data on [x] before being firmer than that."` },
        'Teaching a class': { frame: ['Hook with a question or a contradiction', 'Name what they already know and build on it', 'One worked example, slowly', 'A misconception they commonly have', 'A task they attempt right now'], open: `"Here is a question. [question]. Everyone write down your answer before I tell you the standard one."`, close: '"That is the idea. What you have not seen yet is where it breaks — that is next week."' },
        'Job interview answer': { frame: ['Answer in a headline first', 'The specific situation', 'What you personally did, with a number', 'The measurable result', 'What you would do differently'], open: '"The short answer is: yes. Specifically, I…"', close: '"That is the version I would repeat today, with the fix I mentioned."' },
        'Elevator pitch': { frame: ['Who has the problem', 'What you do about it', 'Why you are the one to do it', 'One number or proof point', 'A single clear ask'], open: `"If you are [specific person], you know the pain of [specific problem]."`, close: `"I am [who]. We do [what]. It works because [proof]. Worth fifteen minutes?"` },
        'Conference lightning talk': { frame: ['One surprising fact in the first 5 seconds', 'The one idea', 'One example, concrete', 'What it means for the audience', 'The ask or the take-away'], open: `"[Number]% of [thing] — and almost none of them know why."`, close: '"That is the idea. Everything else is detail in the paper."' },
      }
      const o = OCC[occ] || OCC['Q&A panel']
      const beats = secs < 45 ? o.frame.slice(0, 2) : secs < 120 ? o.frame.slice(0, 3) : o.frame
      const script = [
        `PROMPT: ${prompt}`,
        `OCCASION: ${occ} · ${num(secs, 0)} seconds (~${num(budget, 0)} words)`,
        ``,
        beats.map((b, i) => `${num(Math.round(secs * (i / beats.length)), 0)}s — ${b}`).join('\n'),
        ``,
        `OPEN WITH: ${o.open}`,
        `CLOSE WITH: ${o.close}`,
      ].join('\n')
      const fill: Record<string, string> = {
        'Q&A panel': 'If you do not know: "I do not know. I would need to check [specific thing] — I can do that and come back to you."',
        'Job interview answer': 'If you are stuck: "The most important part of that was [specific action]. Let me be concrete about it." — then describe the action, not the context.',
        'Wedding speech': 'If you freeze: name them. "Can you hear me, [name]?" It re-engages the room and buys you ten seconds.',
        'Conference lightning talk': 'If you lose your place: jump to the example. The example is what they remember anyway.',
        'After-dinner or social': 'If you draw a blank: ask the room a question. It buys time and makes you look generous.',
        'Teaching a class': 'If you lose a thread: ask a student to repeat the last thing you said. It re-teaches it and recovers you.',
        'Toast / award acceptance': 'If you become emotional: stop, take the sip, and jump to the next beat. Short speeches forgive emotion.',
        'Elevator pitch': 'If you ramble: stop mid-sentence, say "the short version is", and give the thirty-second version instead.',
      }
      return [
        sres('Prompt', prompt, T.good, `${diff.toLowerCase()} · ${num(secs, 0)} seconds`, 100),
        sres('Word budget', `${num(budget, 0)} words`, secs <= 60 ? T.good : T.neutral, `at ${num(wps, 0)} words per minute`),
        sres('Structure beats', num(beats.length, 0), T.good, secs < 45 ? 'two beats only — anything more and you will not land them' : 'compressed to fit the slot', clamp((beats.length / 4) * 100, 10, 100)),
        docr('Speech frame', script),
        docr('Recovery line', fill[occ] || fill['Q&A panel']),
        res('The one rule', 'decide your structure before you speak, not during. Point → reason → example → close works for almost every impromptu situation.', T.good),
        res('Nerves are data', 'your heart rate and voice will feel worse than they sound. The audience hears you as slightly nervous, not extremely. You are the only one who can hear the shake.', T.neutral),
        ctx ? res('Use your context', `you mentioned "${ctx.slice(0, 60)}" — work it into the example. Specific content is what separates a memorable answer from a competent one.`, T.good) : res('Add context', 'tell me your role or topic and I can tailor the example — a generic example is the most forgettable part of an answer.', T.warn),
        res('Practise this', 'set a 60-second timer, ask someone for a random prompt, and do it five times. Impromptu improves only through repetition, like any other skill.', T.neutral),
      ]
    },
  },
  {
    id: 'keynote-outline-planner-speaking',
    name: 'Keynote Outline Planner',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Plans a long-form keynote with segments, audience shifts, energy management and a strong opening and close.',
    tip: 'A keynote is three separate talks with a coffee break in the middle. Give people a reason to return after the break, or they do not.',
    usage: ['Describe your keynote theme.', 'Set the length and audience.', 'Read the segment plan.'],
    method: ['The keynote is split into energy segments.', 'Each segment gets a purpose and a transition.', 'Opening and closing are drafted in full.'],
    fields: [txt('theme', 'Keynote theme', 3, 'What changes when software is written by people who are not software engineers'), n('mins', 'Total length (minutes)', { def: 45, min: 10, max: 180, step: 5 }), sel('aud', 'Audience', ['Mixed seniority', 'Executives only', 'Technical practitioners', 'Students', 'General public'], 'Mixed seniority'), sel('setting', 'Format', ['Single unbroken talk', 'Two segments with a break', 'Three segments with breaks', 'Talk plus interview', 'Workshop with presentation'], 'Two segments with a break')],
    compute: (v) => {
      const theme = asStr(v.theme).trim()
      if (!theme) return [sres('Keynote plan', 'Describe your keynote theme first', T.warn)]
      const mins = Math.max(10, asNum(v.mins))
      const aud = asSel(v.aud)
      const setting = asSel(v.setting)
      const segments = setting.startsWith('One') ? 1 : setting.startsWith('Two') ? 2 : setting.startsWith('Three') ? 3 : 2
      const perSeg = mins / segments
      const AUD: Record<string, { technical: number; business: number; story: number; example: number }> = {
        'Mixed seniority': { technical: 0.3, business: 0.3, story: 0.25, example: 0.15 },
        'Executives only': { technical: 0.05, business: 0.45, story: 0.25, example: 0.25 },
        'Technical practitioners': { technical: 0.5, business: 0.1, story: 0.2, example: 0.2 },
        'Students': { technical: 0.2, business: 0.15, story: 0.35, example: 0.3 },
        'General public': { technical: 0.05, business: 0.15, story: 0.45, example: 0.35 },
      }
      const mix = AUD[aud] || AUD['Mixed seniority']
      const segTemplates = [
        { name: 'Segment 1 — Hook and problem', beats: ['A concrete story, not a definition', 'The problem in their terms', 'Why now, why this audience', 'The question the keynote answers'], energy: 'high and rising' },
        { name: 'Segment 2 — Evidence and turn', beats: ['The mechanism, simply explained', 'Three data points, no more', 'The surprising finding', 'The counter-argument you anticipated'], energy: 'steady, with one deliberate pause after the surprise' },
        { name: 'Segment 3 — Implications and close', beats: ['What this means for them specifically', 'What you would do Monday morning', 'The honest limitation', 'The closing image, not a summary'], energy: 'rising to a final held silence' },
      ]
      const plan = Array.from({ length: segments }, (_, i) => segTemplates[i]).map((s, i) => {
        const segMins = perSeg
        const tMin = segMins * mix.technical
        const tStory = segMins * mix.story
        const tBiz = segMins * mix.business
        const tEx = segMins * mix.example
        return `${s.name.toUpperCase()} — ${num(segMins, 0)} min${i > 0 ? ' (after the break)' : ''}\n  energy: ${s.energy}\n  timing: story ${num(tStory, 0)}m · technical ${num(tMin, 0)}m · business ${num(tBiz, 0)}m · examples ${num(tEx, 0)}m\n  beats:\n${s.beats.map((b) => `    - ${b}`).join('\n')}`
      })
      const open = `"Here is what I am going to argue, so you can decide when you disagree: ${theme.toLowerCase()}."\n\nThen: ten seconds of silence. Then the first concrete story.`
      const close = `"Three years ago, ${theme.toLowerCase()} was an opinion. Now it is a decision you already made without noticing.\n\nThat is all I have."\n\nStop. Do not say thank you until after the first question.`
      const energyPlan = [
        `Minutes 0–3: highest energy of the whole talk. The opening determines whether the room is with you.`,
        `Minutes ${Math.round(perSeg * 0.7)}–${Math.round(perSeg * 0.8)}: energy dip. This is where you change your voice, move position, or ask a question.`,
        `Immediately after the break: restart energy deliberately. Stand differently, open with a question, do not recap.`,
        `Final 90 seconds: slow down. Slow speech reads as authority.`,
      ]
      return [
        sres('Keynote plan', `${num(segments, 0)} segment(s)`, T.good, `${num(mins, 0)} min total · ${num(perSeg, 0)} min per segment`, clamp(100 - (mins / 180) * 60, 5, 100)),
        sres('Audience mix', aud, T.neutral, `${ratio(mix.story * 100, 0)}% story · ${ratio(mix.technical * 100, 0)}% technical · ${ratio(mix.business * 100, 0)}% business`),
        sres('Content ratio', `${num(Math.round(perSeg * mix.story + perSeg * mix.example), 0)} of ${num(mins, 0)} min narrative`, mix.story < 0.2 ? T.warn : T.good, mix.story < 0.2 ? 'this audience mix is light on story — abstract talks lose rooms' : 'good narrative balance', clamp((mix.story + mix.example) * 100 * 2, 5, 100)),
        docr('Segment plan', plan.join('\n\n')),
        docr('Opening', open),
        docr('Closing', close),
        docr('Energy management', energyPlan.map((e) => `• ${e}`).join('\n')),
        res('Break strategy', setting === 'Single unbroken talk' ? 'no break means attention will fall at 20 minutes. Change your voice, move, and put a question to the room at that point.' : `tell the audience what happens after the break in one sentence before the break — it doubles the return rate.`, T.neutral),
        res('The last 90 seconds', 'the ending is remembered most clearly and rehearsed least. Write it out word for word, like your opening, and run it five times.', T.good),
        res('What not to do', 'do not summarise your slides at the end. The room has read them. End on an image, a question, or a single sentence.', T.warn),
      ]
    },
  },
  {
    id: 'handout-designer-speaking',
    name: 'Handout Designer',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Turns your talk content into a one-page takeaway handout with ranked key points, a memory hook and a reading-level check.',
    tip: 'Nobody keeps a transcript. They keep one page with five things on it. Write the handout first, then give the talk that supports it.',
    usage: ['Paste your talk content.', 'Set how many takeaways you need.', 'Read the ranked takeaways and the layout.'],
    method: ['Sentences are ranked as takeaway candidates.', 'Numbers and action verbs raise a candidate.', 'A memory hook and reading level are computed.'],
    fields: [
      sel('aud', 'Who gets the handout', ['Colleagues who will act on it', 'Students who need a reference', 'A panel or committee', 'External partners', 'A general audience'], 'Colleagues who will act on it'),
      n('take', 'Key takeaways to include', { def: 5, min: 3, max: 8, step: 1 }),
      txt('content', 'Your talk content (bullets or prose)', 12, 'Onboarding emails are opened by 40% of users but only 18% finish setup.\nWeek-one engagement is half that of week two.\nNew users hit setup on day three and stall there.\nWe moved setup to day 0 and added a three-step checklist.\nEarly testing cut drop-off by 12% with no change to the product.\nThe change cost us one sprint and no new tooling.'),
      ck('extras', 'What to include', ['Discussion questions', 'A one-page action checklist', 'Key numbers and dates', 'A glossary of terms', 'Links or references', 'A note on what I got wrong']),
    ],
    compute: (v) => {
      const text = asStr(v.content).trim()
      if (text.length < 30) return [sres('Handout', 'Paste your talk content first', T.warn)]
      const aud = asSel(v.aud)
      const want = clamp(Math.round(asNum(v.take)) || 5, 3, 8)
      const extras = asBoolList(v.extras).map(Boolean)
      const units: string[] = []
      linesOf(text).forEach((l) => {
        const sents = sentences(l)
        if (sents.length) sents.forEach((s) => units.push(s.replace(/^[-*•\d.\s)]+/, '').trim()))
        else units.push(l.replace(/^[-*•\d.\s)]+/, '').trim())
      })
      const cands = units.filter((u) => u.length > 12).map((u) => {
        const w = words(u)
        const digits = (u.match(/\d[\d.,]*%?/g) || []).length
        const action = /\b(should|must|need to|we (cut|moved|added|found|will|changed|shipped)|recommend|stop|start|avoid|measure|costs?)\b/i.test(u)
        const score = Math.max(0, Math.min(10, (digits > 0 ? 3 : 0) + (action ? 3 : 0) + (w.length >= 8 && w.length <= 28 ? 2 : 0) + (w.length > 32 ? -2 : 0) + (w.length < 5 ? -2 : 0)))
        return { text: u, w, digits, action, score }
      })
      if (!cands.length) return [sres('Handout', 'No usable sentences found — add more detail to your content', T.warn)]
      const ranked = cands.slice().sort((a, b) => b.score - a.score || a.w.length - b.w.length)
      const chosen: typeof ranked = []
      const seen = new Set<string>()
      ranked.forEach((c) => {
        if (chosen.length >= want) return
        const sig = c.w.slice(0, 4).join(' ')
        if (seen.has(sig)) return
        seen.add(sig)
        chosen.push(c)
      })
      for (let i = 0; i < ranked.length && chosen.length < want; i++) {
        if (!chosen.includes(ranked[i])) chosen.push(ranked[i])
      }
      const SKIP = new Set(['we', 'the', 'a', 'an', 'our', 'it', 'this', 'that', 'they', 'i', 'but', 'and', 'so', 'if', 'in', 'on', 'to', 'of'])
      const hook = chosen.map((c) => {
        const first = c.w.find((x) => !SKIP.has(x) && /[a-z]/.test(x))
        return first ? first[0].toUpperCase() : '?'
      })
      const body = chosen.map((c) => c.text).join(' ')
      const allW = words(body)
      const syl = allW.reduce((s, x) => s + countSyllables(x), 0)
      const sentCount = Math.max(1, sentences(body).length)
      const wps = allW.length / sentCount
      const spw = syl / Math.max(1, allW.length)
      const grade = 0.39 * wps + 11.8 * spw - 15.59
      const flesch = 206.835 - 1.015 * wps - 84.6 * spw
      const withNum = chosen.filter((c) => c.digits > 0).length
      const actionLed = chosen.filter((c) => c.action).length
      const extraOn = extras.filter(Boolean).length
      const chars = body.length + chosen.length * 10 + extraOn * 220 + 240
      const score = clamp(Math.round((chosen.length / want) * 40 + Math.min(1, withNum / Math.max(1, Math.ceil(want / 2))) * 25 + Math.min(1, actionLed / Math.max(1, Math.ceil(want / 3))) * 20 + Math.min(1, extraOn / 3) * 15), 5, 100)
      const jargon = Array.from(new Set(words(text).filter((w) => w.length >= 10 && words(text).filter((x) => x === w).length === 1))).sort((a, b) => b.length - a.length).slice(0, 8)
      const layout = [
        `${aud}`,
        ``,
        `KEY TAKEAWAYS`,
        ...chosen.map((c, i) => `${i + 1}. ${c.text}`),
        ...(extras[0] ? [``, `DISCUSSION QUESTIONS`, ...chosen.slice(0, 3).map((c) => `• Does "${c.text.replace(/[.]$/, '').toLowerCase()}" hold in your context too?`), `• What is the first number you would check to find out?`, `• What would have to be true for the opposite to be the case?`] : []),
        ...(extras[1] ? [``, `ACTION CHECKLIST`, ...chosen.filter((c) => c.action).slice(0, 5).map((c) => `☐ ${c.text.replace(/^we /i, '')}`)] : []),
        ...(extras[2] ? [``, `KEY NUMBERS`, ...chosen.filter((c) => c.digits > 0).map((c) => `• ${(c.text.match(/.{0,40}\d[\d.,]*%?.{0,40}/) || [c.text])[0]}`)] : []),
        ...(extras[3] ? [``, `GLOSSARY`, ...(jargon.length ? jargon.map((w) => `• ${w}`) : ['• no unexplained long words detected in the source content'])] : []),
        ...(extras[4] ? [``, `REFERENCES`, `• full paper or deck: [link]`, `• datasets used: [link]`, `• related reading: [link]`] : []),
        ...(extras[5] ? [``, `A NOTE ON WHAT I GOT WRONG`, `• [state one real limitation and what you learned from it]`] : []),
      ].join('\n')
      return [
        sres('Handout quality', `${score}/100`, score > 80 ? T.good : score > 55 ? T.warn : T.bad, `${chosen.length} of ${want} takeaways · ${num(withNum, 0)} with numbers · ${num(actionLed, 0)} action-led`, score),
        sres('Fits one page', `${num(chars, 0)} characters`, chars > 2600 ? T.warn : T.good, chars > 2600 ? 'too dense — a handout that needs two pages gets read on neither' : 'comfortable one-pager', clamp(100 - (chars / 3000) * 100, 5, 100)),
        sres('Reading level', `grade ${num(Math.max(1, grade), 1)}`, grade > 14 ? T.warn : grade > 10 ? T.warn : T.good, `Flesch ${num(flesch, 0)} · ${num(wps, 1)} words per sentence`, clamp(100 - Math.max(0, grade - 6) * 5, 5, 100)),
        sres('Memory hook', hook.join(''), hook.includes('?') ? T.warn : T.good, hook.includes('?') ? 'one takeaway starts with a filler word — the first letters will not spell anything' : 'first letters of your takeaways, in order — say them out loud and they stick'),
        docr('Handout layout', layout),
        docr('Ranked takeaway candidates', ranked.map((c, i) => `${i + 1}. [score ${c.score}${c.digits ? ' · has number' : ''}${c.action ? ' · action-led' : ''}] ${c.text}`).join('\n')),
        res('Write it first', 'if you cannot compress your talk into five lines, you do not yet know what your talk is about. The handout is the test.', T.warn),
        res('Every takeaway must be actionable', `a takeaway your audience cannot do anything with is a fact. For ${aud.toLowerCase()}, each line should end in a decision, a number or a question.`, T.warn),
        res('Pass it out at the end', 'not at the start. A handout at the start is read instead of listened to, and you lose the room in the first three minutes.', T.neutral),
        res('Include the limitation', 'one honest line about what your work cannot show makes every other number on the page believable. It is the cheapest credibility available.', T.good),
      ]
    },
  },
]
