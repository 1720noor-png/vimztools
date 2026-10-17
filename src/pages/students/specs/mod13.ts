import { n, sel, txt, ck, dt, res, T, asNum, asSel, asStr, asBoolList, clamp, num, ratio, money } from '../../office/archetypes/spec'
import { sres, docr, type StudentSpec } from './studentSpec'

const SUBJECT = 'Career & Readiness Tools'

const STOP = new Set(['the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'for', 'with', 'on', 'at', 'as', 'is', 'are', 'was', 'were', 'be', 'by', 'from', 'that', 'this', 'it', 'my', 'your', 'our', 'their', 'i', 'we', 'you', 'they', 'me', 'us', 'them', 'he', 'she', 'his', 'her', 'not', 'no', 'do', 'does', 'did', 'have', 'has', 'had', 'but', 'so', 'if', 'than', 'then', 'there', 'here', 'all', 'can', 'will', 'would', 'should', 'could', 'about', 'into', 'over', 'after', 'before', 'up', 'out', 'who', 'what', 'when', 'where', 'which', 'while', 'also', 'more', 'most', 'other', 'some', 'such', 'only', 'own', 'same', 'too', 'very', 'just', 'also', 'through', 'during', 'above', 'below', 'between', 'both', 'each', 'few', 'further', 'once', 'because', 'until', 'against', 'among', 'per', 'via', 'etc'])

function words(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s+#.-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w))
}

function bullets(raw: string): string[] {
  return raw
    .split('\n')
    .map((l) => l.replace(/^\s*[-*•\d.)\s]+/, '').trim())
    .filter((l) => l.length > 3)
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase())
}

const ROLES: Record<string, string[]> = {
  'Data Analyst': ['SQL', 'Excel', 'Python', 'Statistics', 'Data cleaning', 'Dashboards', 'A/B testing', 'Communication'],
  'Software Engineer': ['Algorithms', 'Data structures', 'Version control', 'Testing', 'One programming language', 'System design', 'Code review', 'Debugging'],
  'Nurse': ['Patient assessment', 'Clinical documentation', 'Vital signs', 'Medication administration', 'Infection control', 'Communication with families', 'CPR', 'Infection prevention'],
  'Teacher': ['Lesson planning', 'Classroom management', 'Assessment design', 'Differentiation', 'Subject knowledge', 'Behaviour management', 'Parent communication', 'Curriculum design'],
  'Accountant': ['Financial statements', 'Double-entry bookkeeping', 'Tax compliance', 'Auditing', 'Excel modelling', 'Payroll', 'Reconciliation', 'GAAP/IFRS'],
  'Mechanical Engineer': ['CAD (SolidWorks/Fusion)', 'Thermodynamics', 'Fluid mechanics', 'FEA', 'Tolerance analysis', 'Manufacturing processes', 'Technical drawing', 'Materials selection'],
  'Marketing Manager': ['Campaign planning', 'Segmentation', 'Content strategy', 'Analytics', 'Email marketing', 'Budget management', 'Brand positioning', 'A/B testing'],
  'Graphic Designer': ['Layout & typography', 'Brand identity', 'Adobe Illustrator', 'Adobe Photoshop', 'Colour theory', 'Print production', 'Portfolio curation', 'Client presentation'],
  'Civil Engineer': ['AutoCAD', 'Structural analysis', 'Building codes', 'Site planning', 'Estimation & costing', 'Project scheduling', 'Surveying', 'Risk management'],
  'Psychologist': ['Research methods', 'Statistics', 'Ethics & consent', 'Psychological assessment', 'Therapeutic techniques', 'Report writing', 'CBT', 'Confidentiality'],
}

export const mod13: StudentSpec[] = [
  {
    id: 'resume-builder-career',
    name: 'Resume Builder',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Builds an ATS-safe resume from your experience and skills, with quantified bullet rewrites and a keyword match report.',
    tip: 'Quantify everything. “Improved processes” is invisible; “cut processing time 40%” gets you the interview.',
    usage: ['Enter your target role.', 'Add experience, education and skills.', 'Read the formatted resume and gap report.'],
    method: ['Bullets are rewritten with action verbs.', 'Vague phrases are flagged for quantification.', 'Keywords are matched against the target role.'],
    fields: [txt('name', 'Full name'), txt('role', 'Target role'), txt('exp', 'Experience (one per line: Role | Company | Year | what you did)', 6, 'Data Analyst | Acme Ltd | 2024-2026 | Responsible for weekly sales reports\nShift Supervisor | Retail Co | 2022-2024 | Supervised a team of 8'), txt('edu', 'Education (one per line: Qualification | Institution | Year)', 3, 'BSc Statistics | State University | 2023'), txt('skills', 'Skills (one per line)', 3, 'SQL\nExcel\nPython'), n('wordcap', 'Target length (words)', { def: 400, min: 200, max: 900, step: 50 })],
    compute: (v) => {
      const name = asStr(v.name).trim() || 'Your Name'
      const role = asStr(v.role).trim() || 'Target Role'
      const exp = asStr(v.exp).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const p = l.split('|').map((x) => x.trim())
        return { r: p[0] || 'Role', c: p[1] || '', y: p[2] || '', d: p[3] || '' }
      })
      const edu = asStr(v.edu).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const p = l.split('|').map((x) => x.trim())
        return { q: p[0] || 'Qualification', i: p[1] || '', y: p[2] || '' }
      })
      const skills = bullets(asStr(v.skills))
      const verbs = ['Led', 'Built', 'Delivered', 'Improved', 'Analysed', 'Designed', 'Coordinated', 'Reduced', 'Increased', 'Automated', 'Negotiated', 'Launched']
      const quant = /\d+%|\d+ (?:people|reports|hours|clients|students|users|cases|units)|\d+,\d+|£|\$/
      const unquantified: string[] = []
      const lines = exp.map((e, i) => {
        if (!quant.test(e.d)) unquantified.push(e.d.slice(0, 60))
        return `• ${verbs[i % verbs.length]} ${e.d.charAt(0).toLowerCase()}${e.d.slice(1)}${quant.test(e.d) ? '' : ' [ADD A NUMBER]'}`
      })
      const keywordSet = ROLES[role] || ROLES['Data Analyst']
      const resumeText = words(`${exp.map((e) => `${e.r} ${e.d}`).join(' ')} ${skills.join(' ')} ${role}`)
      const matched = keywordSet.filter((k) => resumeText.includes(k.toLowerCase().split(' ')[0]) || resumeText.includes(k.toLowerCase()))
      const missing = keywordSet.filter((k) => !matched.includes(k))
      const body = [
        `${name.toUpperCase()}`,
        `${role} · email · phone · LinkedIn`,
        '',
        'PROFESSIONAL SUMMARY',
        `${role} with experience across ${exp.length} role(s). Specialist in ${matched.slice(0, 3).join(', ') || skills.slice(0, 3).join(', ')}. Track record of measurable results and cross-team delivery.`,
        '',
        'EXPERIENCE',
        ...exp.map((e) => `${e.r}${e.c ? `, ${e.c}` : ''} (${e.y})\n${lines[exp.indexOf(e)]}`),
        '',
        'EDUCATION',
        ...edu.map((e) => `${e.q}, ${e.i} (${e.y})`),
        '',
        'SKILLS',
        skills.join(' · '),
      ].join('\n')
      const wordCount = body.split(/\s+/).length
      return [
        sres('Resume built', `${num(wordCount, 0)} words`, wordCount <= asNum(v.wordcap) ? T.good : T.warn, wordCount <= asNum(v.wordcap) ? 'within target length' : `${num(wordCount - asNum(v.wordcap), 0)} words over target`, clamp(100 - Math.max(0, (wordCount - asNum(v.wordcap)) / 10), 5, 100)),
        sres('Keyword match', `${num(matched.length, 0)}/${num(keywordSet.length, 0)}`, matched.length / keywordSet.length > 0.6 ? T.good : T.warn, `for ${role}`, (matched.length / keywordSet.length) * 100),
        docr('Formatted resume', body),
        res('Missing keywords', missing.length ? missing.join(', ') : 'none', missing.length ? T.warn : T.good, 'weave these in truthfully — ATS filters on them'),
        res('Needs a number', unquantified.length ? `${num(unquantified.length, 0)} bullet(s) lack metrics: ${unquantified.slice(0, 2).join(' | ')}` : 'all bullets quantified', unquantified.length ? T.bad : T.good),
        res('ATS check', 'no tables, no columns, no headers in the file name — parsers skip them', T.neutral),
      ]
    },
  },
  {
    id: 'cv-builder-career',
    name: 'Academic CV Builder',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Builds a multi-page academic CV for research and academic posts: education, publications, teaching, supervision and grants.',
    tip: 'An academic CV is a record, not a pitch — it can be eight pages. Keep it exhaustive and put the summary in the cover letter instead.',
    usage: ['Enter your education and positions.', 'Add publications, teaching and supervision.', 'Read the structured CV.'],
    method: ['Sections are assembled in academic order.', 'Publication counts are summarised.', 'Length is estimated by section.'],
    fields: [txt('name', 'Full name'), txt('edu', 'Education (one per line: Degree | Institution | Year | result)', 4, 'PhD Physics | MIT | 2022 | summa cum laude\nMSc Physics | Oxford | 2018 | distinction\nBSc Physics | Manchester | 2016 | 2:1'), txt('pubs', 'Publications (one per line: Authors | Year | Title | Journal)', 5, 'Smith J, Doe A | 2023 | Quantum entanglement in cold atoms | Nature Physics\nDoe A, Smith J | 2021 | Topological phases | PRL'), txt('teach', 'Teaching (one per line: course | level | years | students)', 3, 'Thermodynamics | MSc | 2021-2025 | 120'), txt('misc', 'Other (supervision, grants, awards, skills) — one per line', 3, 'Supervised 6 MSc students\nERC Starting Grant 2023\nFluent in Python, MATLAB')],
    compute: (v) => {
      const name = asStr(v.name).trim() || 'Your Name'
      const edu = asStr(v.edu).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const p = l.split('|').map((x) => x.trim())
        return { d: p[0] || '', i: p[1] || '', y: p[2] || '', r: p[3] || '' }
      })
      const pubs = asStr(v.pubs).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const p = l.split('|').map((x) => x.trim())
        return { a: p[0] || '', y: p[1] || '', t: p[2] || '', j: p[3] || '' }
      })
      const teach = asStr(v.teach).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const p = l.split('|').map((x) => x.trim())
        return { c: p[0] || '', l: p[1] || '', y: p[2] || '', s: p[3] || '' }
      })
      const misc = bullets(asStr(v.misc))
      const byYear = new Map<string, number>()
      pubs.forEach((p) => byYear.set(p.y, (byYear.get(p.y) || 0) + 1))
      const body = [
        name.toUpperCase(),
        'Department · Institution · email · ORCID · research interests',
        '',
        'EDUCATION',
        ...edu.map((e) => `${e.y}  ${e.d}, ${e.i}${e.r ? ` — ${e.r}` : ''}`),
        '',
        'RESEARCH POSITIONS',
        '(add fellowships, postdocs and research assistantships here)',
        '',
        'PUBLICATIONS',
        ...pubs.map((p) => `${p.a} (${p.y}). ${p.t}. ${p.j}.`),
        '',
        'TEACHING',
        ...teach.map((t) => `${t.c} (${t.l}) — ${t.y}${t.s ? ` — ${t.s} students` : ''}`),
        '',
        'SUPERVISION, GRANTS, AWARDS & SKILLS',
        ...misc,
      ].join('\n')
      const hindex = pubs.filter((p) => p.a.split(',').some((a) => a.trim().split(' ')[0] === name.split(' ')[0])).length
      return [
        sres('CV sections', num(edu.length + pubs.length + teach.length + misc.length, 0) + ' entries', T.good, `${num(pubs.length, 0)} publications, ${num(teach.length, 0)} courses`),
        sres('Publication output', num(pubs.length, 0) + ' papers', T.neutral, `first-author estimate: ${num(hindex, 0)}`, (pubs.length / Math.max(1, teach.length || 1)) * 10),
        docr('Academic CV', body),
        docr('Publication trend', [...byYear.entries()].sort().map(([y, c]) => `${y}: ${c} publication${c > 1 ? 's' : ''}`).join('\n')),
        res('Length', 'an academic CV may run 4–8 pages — completeness beats brevity here', T.neutral),
        res('Missing sections', edu.length && !pubs.length ? 'no publications listed' : !teach.length ? 'no teaching listed — add it even for research posts' : 'add research positions and grants', T.warn),
      ]
    },
  },
  {
    id: 'cover-letter-generator-career',
    name: 'Cover Letter Generator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Generates a targeted cover letter from the job description and your background, with matched keywords and a hook line.',
    tip: 'Name the specific thing in the job ad you are responding to. Generic letters are the first filter — the hiring manager reads yours for ten seconds.',
    usage: ['Paste the job description.', 'Add your top two achievements.', 'Read the letter and the match report.'],
    method: ['Job description keywords are extracted.', 'Achievements are mapped to requirements.', 'The letter follows a four-paragraph structure.'],
    fields: [txt('name', 'Your name'), txt('role', 'Job title'), txt('company', 'Company'), txt('jd', 'Job description (paste the ad)', 6, 'We are looking for a data analyst to join our insights team. You will build dashboards in SQL, work with stakeholders, and present findings to senior leadership. Experience with Python and A/B testing is desirable. Degree in statistics or related field.'), txt('ach', 'Your achievements (one per line)', 4, 'Built 20 SQL dashboards used weekly by 3 departments\nRan A/B tests on checkout flow, lifting conversion 12%\nPresented monthly findings to the executive team'), sel('tone', 'Tone', ['Formal', 'Professional but warm', 'Enthusiastic'], 'Professional but warm')],
    compute: (v) => {
      const role = asStr(v.role).trim() || 'the role'
      const company = asStr(v.company).trim() || 'your company'
      const jd = asStr(v.jd)
      if (!jd) return [sres('Cover letter', 'Paste the job description first', T.warn)]
      const ach = bullets(asStr(v.ach))
      const jdWords = [...new Set(words(jd))]
      const achWords = new Set(words(ach.join(' ')))
      const matched = jdWords.filter((w) => achWords.has(w))
      const missing = jdWords.filter((w) => !achWords.has(w)).slice(0, 12)
      const tone = asSel(v.tone)
      const openers: Record<string, string> = {
        Formal: `I am writing to apply for the position of ${role} at ${company}.`,
        'Professional but warm': `I was genuinely interested to see the ${role} role at ${company} — the mix of analysis and stakeholder work is exactly where I do my best work.`,
        Enthusiastic: `I would love to bring my energy and analytical background to ${company} as ${role}.`,
      }
      const body = [
        openers[tone] || openers['Professional but warm'],
        '',
        ach.length
          ? `In my most recent work I have ${ach[0].charAt(0).toLowerCase()}${ach[0].slice(1).replace(/^[A-Z]/, '')}${ach[1] ? `, and ${ach[1].charAt(0).toLowerCase()}${ach[1].slice(1)}` : ''}. ${ach[2] ? `Beyond that, ${ach[2].charAt(0).toLowerCase()}${ach[2].slice(1)}` : ''} These are the outcomes I would bring to ${role} at ${company}.`
          : `I bring a strong background in this area and a track record of delivering measurable results.`,
        '',
        `Your advert emphasises ${matched.slice(0, 4).map((m) => m).join(', ') || 'the core responsibilities'}. That has been the centre of my work${matched.length ? `, particularly ${matched.slice(0, 2).join(' and ')}` : ''}. ${missing.length ? `I would also welcome developing further depth in ${missing.slice(0, 2).join(' and ')}.` : ''}`,
        '',
        `I would welcome the chance to discuss how I could contribute to ${company}. Thank you for your time and consideration.`,
        '',
        'Yours sincerely,',
        asStr(v.name).trim() || '[Your name]',
      ].join('\n')
      const wordCount = body.split(/\s+/).length
      return [
        sres('Cover letter generated', `${num(wordCount, 0)} words`, wordCount >= 150 && wordCount <= 350 ? T.good : T.warn, wordCount > 350 ? 'too long — trim to one page' : wordCount < 150 ? 'too short — add a specific achievement' : 'ideal one-page length', clamp(100 - Math.abs(300 - wordCount) / 8, 10, 100)),
        sres('Keyword overlap', `${num(matched.length, 0)} matched`, matched.length > 3 ? T.good : T.warn, `from ${num(jdWords.length, 0)} ad keywords`, Math.min(100, (matched.length / Math.max(1, jdWords.length)) * 200)),
        docr('Cover letter', body),
        res('Keywords in the ad you miss', missing.length ? missing.join(', ') : 'none', missing.length ? T.warn : T.good, 'address at least two in the letter naturally'),
        res('Structure', 'hook → evidence → link to their need → close. No more than 350 words.', T.neutral),
        res('Never', 'do not repeat your resume line by line — complement it', T.warn),
      ]
    },
  },
  {
    id: 'linkedin-bio-generator-career',
    name: 'LinkedIn Bio Generator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Crafts a LinkedIn headline and about section from your role and skills, with keyword density and recruiter-speak guidance.',
    tip: 'Your headline is a search field, not a job title. Include the two or three things recruiters search for.',
    usage: ['Enter your role and key skills.', 'Choose the profile focus.', 'Read the headline, about text and keywords.'],
    method: ['Headline is built from role plus top skills.', 'About section follows the present–past–future shape.', 'Keywords are checked for density.'],
    fields: [sel('role', 'Your profile focus', ['Data Analyst', 'Software Engineer', 'Nurse', 'Teacher', 'Accountant', 'Marketing Manager', 'Graphic Designer', 'PhD Researcher / Academic'], 'Data Analyst'), txt('skills', 'Top 5 skills (one per line)', 3, 'SQL\nPython\nDashboards\nStakeholder communication'), txt('goal', 'What do you want to be found for?', 2, 'Data analyst who turns messy data into decisions'), n('years', 'Years of experience', { def: 3, min: 0, step: 1 })],
    compute: (v) => {
      const role = asSel(v.role)
      const skills = bullets(asStr(v.skills))
      const goal = asStr(v.goal).trim()
      const years = Math.round(asNum(v.years))
      const base = ROLES[role] || ROLES['Data Analyst']
      const merged = [...new Set([...skills, ...base])]
      const headline = `${goal || role} | ${merged.slice(0, 3).join(' · ')}`.slice(0, 220)
      const about = [
        `${role} with ${years} year${years === 1 ? '' : 's'} of experience.`,
        '',
        `I work at the intersection of ${merged.slice(0, 2).join(' and ')} — turning unclear problems into decisions people can act on.`,
        '',
        `What I do:`,
        ...merged.slice(0, 5).map((s) => `• ${titleCase(s)}`),
        '',
        'What I am looking for:',
        `• ${goal ? goal : 'a role where ' + merged[0].toLowerCase() + ' creates real impact'}`,
        '• A team that values clear thinking and honest measurement over vanity metrics',
        '',
        'Open to: roles, freelance work, and conversations about hard data problems.',
      ].join('\n')
      const allText = `${headline} ${about}`.toLowerCase()
      const hits = base.filter((k) => allText.includes(k.toLowerCase().split(' ')[0]))
      return [
        sres('Headline', headline, headline.length <= 220 ? T.good : T.warn, `${num(headline.length, 0)} of 220 characters`, (headline.length / 220) * 100),
        sres('Recruiter keywords present', `${num(hits.length, 0)}/${num(base.length, 0)}`, hits.length / base.length > 0.5 ? T.good : T.neutral, 'searchable terms for this role', (hits.length / base.length) * 100),
        docr('LinkedIn about section', about),
        res('Photo & banner', 'use a professional headshot; banner should be a one-line statement of your focus', T.neutral),
        res('Featured section', `feature ${skills.length ? skills[0] : 'your'} work with a one-sentence result — this is what gets clicked`, T.neutral),
        res('Activity', 'post a monthly note on your field; recruiters filter for active profiles', T.neutral),
      ]
    },
  },
  {
    id: 'interview-question-generator-career',
    name: 'Interview Question Generator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Generates behavioural, technical and situational interview questions for your role, with what each question really tests.',
    tip: 'Answer in STAR: Situation, Task, Action, Result. Most candidates give the Situation and then ramble — the Result is the whole point.',
    usage: ['Choose your role and question types.', 'Set the number of questions.', 'Read questions with what they test.'],
    method: ['Questions are drawn from role-specific banks.', 'Each has a competency tag.', 'STAR coaching is attached.'],
    fields: [sel('role', 'Role', ['Data Analyst', 'Software Engineer', 'Nurse', 'Teacher', 'Accountant', 'Marketing Manager', 'Graphic Designer', 'PhD Researcher / Academic'], 'Data Analyst'), ck('types', 'Question types', ['Behavioural (past experience)', 'Technical / role-specific', 'Situational (hypothetical)', 'Weakness & self-awareness', 'Teamwork & conflict']), n('count', 'Questions to generate', { def: 12, min: 3, max: 25, step: 1 })],
    compute: (v) => {
      const role = asSel(v.role)
      const chosen = asBoolList(v.types).filter(Boolean).length
      if (!chosen) return [sres('Questions', 'Select at least one question type', T.warn)]
      const count = clamp(Math.round(asNum(v.count)) || 12, 3, 25)
      const banks: Record<string, { q: string; tests: string }[]> = {
        Behavioural: [
          { q: 'Tell me about a time you disagreed with a senior colleague. What did you do?', tests: 'Conflict handling — does it show evidence or deference?' },
          { q: 'Describe a project you are proud of. Walk me through your contribution specifically.', tests: 'Ownership — is the candidate the subject or supporting actor?' },
          { q: 'Tell me about a failure. What changed because of it?', tests: 'Accountability and growth, not blame-shifting' },
          { q: 'Give an example of working under a tight deadline where quality mattered.', tests: 'Prioritisation under pressure' },
        ],
        Technical: [
          { q: `What are the core skills you would bring to a ${role} role on day one?`, tests: 'Self-awareness about skill gaps' },
          { q: `How would you approach a task where you have no existing process for ${role.toLowerCase()} work?`, tests: 'Structured problem-solving approach' },
          { q: 'What is something you know well that most people in this role get wrong?', tests: 'Depth of genuine expertise' },
        ],
        Situational: [
          { q: 'You notice a serious error that has already reached a client. What do you do in the next hour?', tests: 'Escalation judgement — speed versus blame' },
          { q: 'You are given a task you know is the wrong approach, but your manager requested it. How do you respond?', tests: 'Diplomatic pushback and evidence' },
          { q: 'A teammate is struggling and it is affecting your deadline. What do you do?', tests: 'Balance of support and accountability' },
        ],
        Weakness: [
          { q: 'What is a weakness you are actively working on, and what have you changed so far?', tests: 'Self-awareness with evidence of change' },
          { q: 'Tell me about feedback that stung but was useful.', tests: 'Coachability and receptivity' },
        ],
        Teamwork: [
          { q: 'Describe a time you had to rely on someone you did not get on with.', tests: 'Professionalism under personal friction' },
          { q: 'How do you handle being the newest person on a team that already has established roles?', tests: 'Humility and initiative' },
        ],
      }
      const typeLabels: [string, keyof typeof banks][] = [
        ['Behavioural (past experience)', 'Behavioural'],
        ['Technical / role-specific', 'Technical'],
        ['Situational (hypothetical)', 'Situational'],
        ['Weakness & self-awareness', 'Weakness'],
        ['Teamwork & conflict', 'Teamwork'],
      ]
      const pool: { q: string; tests: string; t: string }[] = []
      typeLabels.forEach(([label, key]) => {
        if (!asBoolList(v.types)[typeLabels.findIndex((x) => x[0] === label)]) return
        banks[key].forEach((b) => pool.push({ ...b, t: key }))
      })
      const out: string[] = []
      for (let i = 0; i < count; i++) {
        const it = pool[i % pool.length]
        out.push(`Q${i + 1} [${it.t}] ${it.q}\n   What it tests: ${it.tests}\n   Answer in STAR: Situation · Task · Action · Result`)
      }
      return [
        sres('Questions generated', num(out.length, 0), T.good, `${num(new Set(pool.map((p) => p.t)).size, 0)} question types for ${role}`),
        docr('Interview questions', out.join('\n\n')),
        res('Answer framework', 'STAR — spend 20% on Situation, 60% on Action, 20% on Result', T.neutral, 'most people invert this and lose the point'),
        res('Preparation', num(Math.ceil(out.length / 3), 0) + ' stories cover all of these — prepare stories, not answers', T.good),
        res('Questions to ask them', 'prepare 3: how success is measured, why the role is open, what the biggest challenge is', T.neutral),
      ]
    },
  },
  {
    id: 'career-path-finder-career',
    name: 'Career Path Finder',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Maps career paths from your current role and interests, showing adjacent roles, transition difficulty and salary direction.',
    tip: 'Move to a role that uses 70% of what you already do. A total reset is possible but expensive — you pay the junior salary again.',
    usage: ['Enter your current role and interests.', 'Set your constraints.', 'Read the ranked adjacent paths.'],
    method: ['Adjacent roles are scored by skill overlap.', 'Transition effort reflects missing skills.', 'Constraints filter the list.'],
    fields: [sel('cur', 'Current role', ['Data Analyst', 'Software Engineer', 'Nurse', 'Teacher', 'Accountant', 'Marketing Manager', 'Graphic Designer', 'Student / New graduate'], 'Data Analyst'), txt('interests', 'Interests (one per line)', 3, 'Mentoring\nAutomation\nVisualisation'), sel('pref', 'Preferred direction', ['Stay technical', 'Move to leadership', 'Move to commercial', 'Move to a new domain', 'No preference'], 'No preference')],
    compute: (v) => {
      const cur = asSel(v.cur)
      const interests = bullets(asStr(v.interests))
      const pref = asSel(v.pref)
      const map: Record<string, string[]> = {
        'Data Analyst': ['Analytics Engineer', 'Data Scientist', 'Product Manager', 'Business Intelligence Lead', 'Research Analyst', 'Machine Learning Engineer', 'Head of Data'],
        'Software Engineer': ['Engineering Manager', 'Solutions Architect', 'DevOps Engineer', 'Technical Product Manager', 'Site Reliability Engineer', 'Security Engineer', 'Principal Engineer'],
        Nurse: ['Nurse Practitioner', 'Clinical Educator', 'Nurse Manager', 'Healthcare Administrator', 'Public Health Analyst', 'Research Nurse', 'Specialist Practitioner'],
        Teacher: ['Head of Department', 'Curriculum Designer', 'Educational Consultant', 'Learning & Development Manager', 'School Principal', 'EdTech Product Manager', 'Academic Researcher'],
        Accountant: ['Financial Controller', 'Management Accountant', 'Forensic Accountant', 'Tax Advisor', 'Finance Manager', 'Internal Auditor', 'CFO'],
        'Marketing Manager': ['Head of Growth', 'Brand Manager', 'Product Marketing Manager', 'Marketing Director', 'PR Manager', 'Growth Analyst', 'Founder'],
        'Graphic Designer': ['Art Director', 'Brand Designer', 'UX Designer', 'Motion Designer', 'Creative Director', 'Design Manager', 'Content Producer'],
        'Student / New graduate': ['Graduate Analyst', 'Management Associate', 'Research Assistant', 'Associate Consultant', 'Junior Developer', 'Teaching Assistant', 'Project Coordinator'],
      }
      const paths = map[cur] || map['Data Analyst']
      const curSkills = ROLES[cur] || []
      const prefMatch: Record<string, string> = {
        'Analytics Engineer': 'Stay technical',
        'Data Scientist': 'Stay technical',
        'Machine Learning Engineer': 'Stay technical',
        'Principal Engineer': 'Stay technical',
        'Security Engineer': 'Stay technical',
        'Engineering Manager': 'Move to leadership',
        'Head of Data': 'Move to leadership',
        'Nurse Manager': 'Move to leadership',
        'Head of Department': 'Move to leadership',
        'Finance Manager': 'Move to leadership',
        'Head of Growth': 'Move to leadership',
        'Marketing Director': 'Move to leadership',
        'Art Director': 'Move to leadership',
        'Product Manager': 'Move to commercial',
        'Growth Analyst': 'Move to commercial',
        'Technical Product Manager': 'Move to commercial',
        'Product Marketing Manager': 'Move to commercial',
        'Public Health Analyst': 'Move to a new domain',
        'EdTech Product Manager': 'Move to a new domain',
        'Academic Researcher': 'Move to a new domain',
        'Research Assistant': 'Move to a new domain',
        'Forensic Accountant': 'Move to a new domain',
      }
      const scored = paths.map((p) => {
        const targetSkills = ROLES[p] || []
        const overlap = targetSkills.filter((s) => curSkills.some((c) => c.toLowerCase().includes(s.toLowerCase().split(' ')[0]))).length
        const overlapPct = targetSkills.length ? (overlap / targetSkills.length) * 100 : 40
        const interestHit = interests.some((i) => words(p).includes(i.toLowerCase()) || p.toLowerCase().includes(i.toLowerCase()))
        const fitsPref = pref === 'No preference' || prefMatch[p] === pref
        return { p, overlapPct, interestHit, fitsPref, effort: 100 - overlapPct }
      })
      const ranked = scored.sort((a, b) => (b.fitsPref === a.fitsPref ? b.overlapPct - a.overlapPct : b.fitsPref ? 1 : -1))
      const top = ranked[0]
      return [
        sres('Top adjacent path', top.p, T.good, `${ratio(top.overlapPct, 0)}% skill overlap with ${cur}`, top.overlapPct),
        sres('Paths mapped', num(paths.length, 0), T.neutral, `preference: ${pref}`),
        docr('Ranked paths', ranked.map((r, i) => `${i + 1}. ${r.p} — ${ratio(r.overlapPct, 0)}% skill reuse, ${r.effort < 30 ? 'low transition cost' : r.effort < 55 ? 'moderate retraining' : 'significant pivot'}${r.interestHit ? ', matches your interests' : ''}`).join('\n')),
        res('Transition advice', top.overlapPct > 60 ? 'a lateral move — you keep your level and most of your skill set' : top.overlapPct > 35 ? 'a step sideways with 2–3 skills to build first' : 'a genuine pivot — budget 6–12 months and expect a step back in level', top.overlapPct > 60 ? T.good : T.warn),
        res('70% rule', 'choose a path where you reuse at least 70% of your current skills — anything less is a career restart', T.neutral),
      ]
    },
  },
  {
    id: 'career-goal-planner-career',
    name: 'Career Goal Planner',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Turns a vague career aspiration into SMART goals with milestones, deadlines, skills gaps and a progress tracker.',
    tip: 'Write the goal so a stranger could tell whether you achieved it. “Be better at coding” is not a goal; “ship two production features” is.',
    usage: ['Describe your goal and timeframe.', 'Add the skills you need.', 'Read the milestone plan.'],
    method: ['The goal is tested against SMART criteria.', 'Milestones are spaced across the timeframe.', 'Skill gaps become action items.'],
    fields: [txt('goal', 'Your career goal'), sel('years', 'Timeframe', ['6 months', '1 year', '2 years', '3 years', '5 years'], '2 years'), ck('smart', 'Check what you can commit to', ['Specific — I can state exactly what', 'Measurable — I know when it is done', 'Achievable — within my control', 'Relevant — it moves my career', 'Time-bound — I have a deadline']), txt('skills', 'Skills you need to develop (one per line)', 3, 'Kubernetes\nSystem design\nPublic speaking')],
    compute: (v) => {
      const goal = asStr(v.goal).trim()
      if (!goal) return [sres('Career plan', 'Describe your goal first', T.warn)]
      const smart = asBoolList(v.smart).filter(Boolean).length
      const YEAR_MAP: Record<string, number> = { '6 months': 0.5, '1 year': 1, '2 years': 2, '3 years': 3, '5 years': 5 }
      const years = YEAR_MAP[asSel(v.years)] || 2
      const skills = bullets(asStr(v.skills))
      const months = Math.round(years * 12)
      const phases = [
        { name: 'Foundation (months 1–3)', goal: 'Build the missing knowledge — one course or project per gap skill' },
        { name: 'Application (months 4–8)', goal: 'Prove it: a portfolio project, a certification or a real piece of work' },
        { name: 'Positioning (months 9–12)', goal: 'Rewrite your profile, refresh your CV, and tell five people you are looking' },
      ].slice(0, Math.max(1, Math.min(3, Math.ceil(months / 4))))
      const lines = phases.map((p) => `${p.name}: ${p.goal}`).join('\n')
      const milestones = skills.map((s, i) => `Month ${Math.max(1, Math.round(((i + 1) / (skills.length + 1)) * months))}: demonstrate ${s}`)
      return [
        sres('SMART score', `${num(smart, 0)}/5`, smart >= 4 ? T.good : smart >= 3 ? T.warn : T.bad, smart >= 4 ? 'well-specified goal' : 'sharpen it — vague goals fail silently', (smart / 5) * 100),
        sres('Timeframe', `${ratio(years, 1)} years (${num(months, 0)} months)`, T.neutral, `phased into ${num(phases.length, 0)} stages`),
        docr('Phase plan', lines),
        docr('Skill milestones', milestones.length ? milestones.join('\n') : 'no skills listed — add the ones your target role requires'),
        res('Missing SMART element', smart < 5 ? ['Specific', 'Measurable', 'Achievable', 'Relevant', 'Time-bound'][smart] || 'review the checklist' : 'none — the goal passes all five tests', smart < 5 ? T.warn : T.good),
        res('Review', 'book a 30-minute review at the midpoint and adjust — plans that are never reviewed are not plans', T.neutral),
      ]
    },
  },
  {
    id: 'skills-assessment-career',
    name: 'Skills Self-Assessment',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Scores your self-rated skills, finds gaps against a target role, and returns a prioritised learning plan.',
    tip: 'Rate honestly against people already in the role, not against your own baseline. Inflated self-ratings hide the gaps that cost you the job.',
    usage: ['Rate each skill 1–10.', 'Choose your target role.', 'Read your gaps and the learning plan.'],
    method: ['Self-ratings are averaged per cluster.', 'Target requirements are compared.', 'The largest gaps are prioritised.'],
    fields: [
      n('s1', 'Technical depth in my field (1–10)', { def: 5, min: 1, max: 10, step: 1 }),
      n('s2', 'Data and analysis skills (1–10)', { def: 5, min: 1, max: 10, step: 1 }),
      n('s3', 'Written communication (1–10)', { def: 5, min: 1, max: 10, step: 1 }),
      n('s4', 'Presenting and verbal communication (1–10)', { def: 5, min: 1, max: 10, step: 1 }),
      n('s5', 'Project management (1–10)', { def: 5, min: 1, max: 10, step: 1 }),
      n('s6', 'Collaboration and teamwork (1–10)', { def: 5, min: 1, max: 10, step: 1 }),
      n('s7', 'Problem solving under pressure (1–10)', { def: 5, min: 1, max: 10, step: 1 }),
      n('s8', 'Breadth of domain knowledge (1–10)', { def: 5, min: 1, max: 10, step: 1 }),
      n('s9', 'Leadership and initiative (1–10)', { def: 5, min: 1, max: 10, step: 1 }),
      n('s10', 'Commercial or business awareness (1–10)', { def: 5, min: 1, max: 10, step: 1 }),
      sel('target', 'Target role', ['Data Analyst', 'Software Engineer', 'Nurse', 'Teacher', 'Accountant', 'Marketing Manager', 'Graphic Designer'], 'Data Analyst'),
      n('weekHours', 'Hours per week you can study', { def: 5, min: 1, step: 1 }),
    ],
    compute: (v) => {
      const clusters = [
        'Technical depth', 'Data & analysis', 'Written communication', 'Presenting', 'Project management',
        'Teamwork', 'Problem solving', 'Domain breadth', 'Leadership', 'Business awareness',
      ]
      const rated = clusters
        .map((cluster, i) => ({ cluster, v: Math.round(clamp(asNum(v[`s${i + 1}`]) || 5, 1, 10)) }))
      const mean = rated.reduce((s, a) => s + a.v, 0) / rated.length
      const targetSkills = ROLES[asSel(v.target)] || []
      const top3 = [...rated].sort((a, b) => b.v - a.v).slice(0, 3)
      const low3 = [...rated].sort((a, b) => a.v - b.v).slice(0, 3)
      const hours = asNum(v.weekHours) || 5
      const lowHours = low3.map((a) => `${a.cluster}: ${ratio((10 - a.v) * 4, 0)} h of deliberate practice (${ratio(((10 - a.v) * 4) / hours, 1)} h/week for ${ratio((10 - a.v), 0)} weeks)`)
      return [
        sres('Overall self-rating', ratio(mean, 1) + ' / 10', mean >= 7 ? T.good : mean >= 5 ? T.neutral : T.warn, `${num(rated.length, 0)} skills rated`, (mean / 10) * 100),
        sres('Strongest areas', top3.map((a) => a.cluster).join(', '), T.good, `rated ${top3.map((a) => num(a.v, 0)).join(', ')}`),
        sres('Development areas', low3.map((a) => a.cluster).join(', '), T.warn, `rated ${low3.map((a) => num(a.v, 0)).join(', ')}`),
        docr('Learning plan', lowHours.join('\n')),
        docr('Full scorecard', rated.map((a) => `${String(a.v).padStart(2, ' ')}/10  ${a.cluster}`).join('\n')),
        res('Target role skills', targetSkills.join(' · '), T.neutral, `compare these with your lowest scores: ${low3.map((a) => a.cluster).join(', ')}`),
        res('Reality check', 'ask two people already in the role to rate the same ten skills — calibration beats self-assessment', T.neutral),
        res('Time to close gaps', `${num(Math.round(low3.reduce((s, a) => s + (10 - a.v) * 4, 0) / hours / 4), 0)} weeks at ${ratio(hours, 0)} h/week`, T.neutral),
      ]
    },
  },
  {
    id: 'interview-prep-timer',
    name: 'Interview Preparation Planner',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Builds a dated interview preparation schedule with practice blocks, story preparation and mock interview slots.',
    tip: 'Rehearse out loud. Reading your answers feels fluent; saying them is where the weak phrasing shows up.',
    usage: ['Set the interview date.', 'Enter hours available per day.', 'Read the day-by-day plan.'],
    method: ['Days are counted back from the interview.', 'Story preparation is front-loaded.', 'Mock interviews sit three days out.'],
    fields: [dt('date', 'Interview date'), n('days', 'Days to prepare', { def: 7, min: 1, max: 60, step: 1 }), n('hours', 'Hours per day', { def: 2, min: 0.5, step: 0.5 }), ck('prep', 'What needs preparing?', ['Company research', 'STAR stories', 'Technical refresh', 'Questions to ask them', 'Salary expectations', 'Questions on their product', 'Mock interview'])],
    compute: (v) => {
      const days = Math.max(1, Math.round(asNum(v.days)))
      const hours = asNum(v.hours) || 2
      const items = asBoolList(v.prep).filter(Boolean).length
      if (!items) return [sres('Plan', 'Select at least one preparation item', T.warn)]
      const date = asStr(v.date)
      const phases = [
        { from: 1, to: Math.ceil(days * 0.4), label: 'Content', tasks: 'Company research, role reading, technical refresh on the gaps' },
        { from: Math.ceil(days * 0.4) + 1, to: Math.ceil(days * 0.8), label: 'Stories', tasks: 'Build 5–6 STAR stories and say them out loud, timed' },
        { from: Math.ceil(days * 0.8) + 1, to: days - 1, label: 'Mocks', tasks: 'Two mock interviews, salary research, logistics confirmed' },
        { from: days, to: days, label: 'Interview day', tasks: 'No cramming. Light review of your stories only' },
      ].filter((p) => p.from <= days)
      const lines = phases.map((p) => `${p.from <= p.to ? `Day ${p.from}–${p.to}` : `Day ${p.from}`} — ${p.label}: ${p.tasks}`).join('\n')
      const totalH = days * hours
      return [
        sres('Total prep time', `${ratio(totalH, 0)} hours`, totalH >= 15 ? T.good : totalH >= 8 ? T.warn : T.bad, `${num(days, 0)} days × ${ratio(hours, 1)} h`, clamp((totalH / 30) * 100, 2, 100)),
        sres('Preparation items', num(items, 0), T.neutral, 'each needs at least one dedicated block'),
        docr('Day-by-day plan', lines),
        res('Night before', 'stop studying at least two hours before bed — you need sleep more than a sixth topic', T.warn),
        res('Morning of', 'review your company notes for ten minutes, then stop', T.neutral),
        res('Rule', 'rehearse aloud, standing, timed to real interview pace', T.neutral, date ? `interview on ${date}` : ''),
      ]
    },
  },
  {
    id: 'salary-negotiation-planner',
    name: 'Salary Negotiation Planner',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Prepares your salary negotiation: target range, counter script, total package comparison and walk-away points.',
    tip: 'Negotiate the whole package, not just base. A lower base with better equity and 5 more holiday days may be worth more over five years.',
    usage: ['Enter the offer and your target.', 'Add your location and experience.', 'Read the range, script and package comparison.'],
    method: ['A market range is estimated from inputs.', 'Total package is annualised.', 'A counter script is generated.'],
    fields: [n('offer', 'Current base offer', { def: 42000, min: 0, step: 500 }), n('target', 'Your target base', { def: 48000, min: 0, step: 500 }), n('years', 'Years of experience', { def: 3, min: 0, step: 1 }), sel('loc', 'Location cost level', ['Low cost', 'Mid cost', 'High cost', 'Very high cost'], 'Mid cost'), n('bonus', 'Bonus (% of base)', { def: 8, min: 0, max: 100, step: 1 }), n('pension', 'Pension contribution (%)', { def: 5, min: 0, max: 50, step: 1 }), n('holidays', 'Holiday days', { def: 25, min: 0, step: 1 })],
    compute: (v) => {
      const offer = asNum(v.offer)
      const target = asNum(v.target)
      const years = asNum(v.years)
      const locMult: Record<string, number> = { 'Low cost': 0.85, 'Mid cost': 1, 'High cost': 1.18, 'Very high cost': 1.4 }
      const mult = locMult[asSel(v.loc)] || 1
      const base = 32000 + years * 2600
      const market = base * mult
      const low = market * 0.9
      const high = market * 1.12
      const gap = target - offer
      const gapPct = offer ? (gap / offer) * 100 : 0
      const packageOffer = offer * (1 + (asNum(v.bonus) + asNum(v.pension)) / 100) + asNum(v.holidays) * 250
      const packageTarget = target * (1 + (asNum(v.bonus) + asNum(v.pension)) / 100) + asNum(v.holidays) * 250
      const script = [
        `"Thank you for the offer — I am genuinely interested. Based on my experience with ${num(years, 0)} years in this field and the market range for this role, I was hoping we could look at ${money(target)}. Is there flexibility?"`,
        `If pressed: "I am at ${money(offer)} currently, so this is a ${ratio(Math.abs(gapPct), 0)}% difference. I would be happy to discuss the whole package rather than base alone."`,
        `If they cannot move: "I understand. Could we revisit this at the six-month review, or is there flexibility on holiday, remote days, or training budget instead?"`,
      ].join('\n')
      return [
        sres('Estimated market range', `${money(Math.round(low / 100) * 100)} – ${money(Math.round(high / 100) * 100)}`, offer < low ? T.good : offer >= low && offer <= high ? T.neutral : T.warn, `${asSel(v.loc).toLowerCase()} · ${num(years, 0)} years experience`, clamp(((offer - low) / Math.max(1, high - low)) * 100, 2, 100)),
        sres('Gap to your target', `${money(Math.round(gap / 100) * 100)} (${ratio(gapPct, 1)}%)`, gap > offer * 0.1 ? T.warn : gap > 0 ? T.neutral : T.good, gap > offer * 0.15 ? 'a large ask — justify it with evidence' : gap > 0 ? 'a reasonable ask' : 'you are already at or above target'),
        sres('Total package (offer)', money(Math.round(packageOffer)), T.neutral, `base + ${ratio(asNum(v.bonus), 0)}% bonus + ${ratio(asNum(v.pension), 0)}% pension + ${num(asNum(v.holidays), 0)} days (valued at 250/day)`),
        docr('Counter script', script),
        res('At target, package', money(Math.round(packageTarget)), T.neutral, `5-year difference: ${money(Math.round((packageTarget - packageOffer) * 5))}`),
        res('Rules', 'negotiate after you have an offer, stay positive, and never give a number first', T.warn),
      ]
    },
  },
  {
    id: 'networking-tracker-career',
    name: 'Networking Tracker',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Tracks your professional contacts, follow-ups owed and relationship strength, and suggests when to reach out.',
    tip: 'Give before you ask. Three unsolicited messages offering something useful turn contacts into advocates; three requests turn them off.',
    usage: ['Add contacts and when you last spoke.', 'Set the follow-up interval.', 'Read who needs contact now.'],
    method: ['Days since last contact are computed.', 'Overdue contacts are flagged.', 'Relationship strength scores outreach priority.'],
    fields: [txt('contacts', 'Contacts (one per line: name | role | company | weeks since contact | relationship 1-5)', 8, 'Priya | Data Science Lead | Acme | 8 | 4\nTom | Recruiter | BigTech | 2 | 2\nSara | Former supervisor | University | 20 | 5\nAhmed | Peer | Startup | 1 | 3'), n('interval', 'Follow-up interval (weeks)', { def: 6, min: 1, step: 1 })],
    compute: (v) => {
      const rows = asStr(v.contacts).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const p = l.split(/[|,\t]/).map((x) => x.trim())
        return { name: p[0] || 'Contact', role: p[1] || '', co: p[2] || '', weeks: parseFloat(p[3]) || 0, rel: parseFloat(p[4]) || 2 }
      })
      if (!rows.length) return [sres('Network', 'Add lines as "name | role | company | weeks | strength"', T.warn)]
      const interval = Math.max(1, asNum(v.interval))
      const overdue = rows.filter((r) => r.weeks > interval)
      const lines = rows.sort((a, b) => b.weeks / Math.max(1, b.rel) - a.weeks / Math.max(1, a.rel)).map((r) => `${r.weeks > interval ? 'OVERDUE' : 'ok     '} ${r.name} (${r.role}${r.co ? `, ${r.co}` : ''}) — ${num(r.weeks, 0)} weeks, strength ${num(r.rel, 0)}/5${r.weeks > interval * 1.5 ? ' — contact now' : ''}`)
      const strong = rows.filter((r) => r.rel >= 4)
      return [
        sres('Contacts needing outreach', num(overdue.length, 0), overdue.length ? T.warn : T.good, overdue.length ? `over ${ratio(interval, 0)} weeks` : 'all up to date', clamp(100 - (overdue.length / rows.length) * 100, 5, 100)),
        sres('Network size', num(rows.length, 0), T.neutral, `${num(strong.length, 0)} strong relationships`),
        docr('Contact status', lines.join('\n')),
        res('Priority order', rows.slice().sort((a, b) => b.rel - a.rel || b.weeks - a.weeks).slice(0, 3).map((r) => r.name).join(' → '), T.neutral, 'strong ties first, then stalest'),
        res('Outreach template', `"Hope you are well — I was thinking about ${words(rows[0].role).join(' ') || 'your'} work and remembered a problem you had with X. I now know a way around it — happy to share if useful."`, T.good),
        res('Cadence', `message every ${ratio(interval, 0)} weeks with something useful, never with a request`, T.neutral),
      ]
    },
  },
  {
    id: 'portfolio-builder-career',
    name: 'Portfolio Outline Builder',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Structures a portfolio with project slots, case-study templates, presentation order and an impact checklist.',
    tip: 'Three deep case studies beat twelve thumbnails. Each one should show the problem, your decision and the measurable result.',
    usage: ['Add your projects.', 'Set the portfolio type.', 'Read the structure and the case template.'],
    method: ['Projects are ordered by impact.', 'Each gets a case-study template.', 'A presentation checklist is produced.'],
    fields: [sel('type', 'Portfolio type', ['Design (visual)', 'Analytical / data', 'Writing / research', 'Software / code', 'Teaching / training'], 'Design (visual)'), txt('projects', 'Projects (one per line: project | your role | outcome)', 6, 'Brand refresh for a café | Lead designer | 22% rise in walk-ins\nSales dashboard | Built alone | saved 6 h/week\nResearch report on housing | Sole author | cited in council policy'), n('count', 'Projects to feature', { def: 3, min: 1, max: 12, step: 1 })],
    compute: (v) => {
      const rows = asStr(v.projects).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const p = l.split(/[|,\t]/).map((x) => x.trim())
        return { name: p[0] || 'Project', role: p[1] || '', out: p[2] || '' }
      })
      if (!rows.length) return [sres('Portfolio', 'Add projects as "project | role | outcome"', T.warn)]
      const type = asSel(v.type)
      const count = clamp(Math.round(asNum(v.count)) || 3, 1, 12)
      const scored = rows.map((r) => ({ ...r, impact: /\d/.test(r.out) ? 3 : r.out ? 2 : 1 })).sort((a, b) => b.impact - a.impact).slice(0, count)
      const typeNotes: Record<string, string> = {
        'Design (visual)': 'show the problem visually, then before/after, then the reasoning behind your choices',
        'Analytical / data': 'lead with the decision your analysis informed, then the method, then the result',
        'Writing / research': 'open with the question and your thesis; show sources and structure, not just excerpts',
        'Software / code': 'lead with what it does and why it exists; include architecture and one interesting technical decision',
        'Teaching / training': 'show learner outcomes, curriculum design choices, and any measurable improvement',
      }
      const order = scored.map((r, i) => `${i + 1}. ${r.name} — ${r.role}${r.out ? ` — ${r.out}` : ''}${r.impact < 3 ? ' ⚠ no measurable outcome, add one' : ''}`)
      return [
        sres('Projects to feature', num(scored.length, 0), scored.length >= 3 ? T.good : T.warn, scored.length >= 3 ? 'three deep cases is the sweet spot' : 'add more depth rather than more items'),
        sres('Outcomes documented', `${num(scored.filter((r) => r.impact === 3).length, 0)}/${num(scored.length, 0)}`, scored.every((r) => r.impact === 3) ? T.good : T.warn, 'projects with numbers are twice as persuasive', (scored.filter((r) => r.impact === 3).length / scored.length) * 100),
        docr('Recommended order', order.join('\n')),
        docr('Case study template', ['1. The problem (2 sentences — what was broken or missing)', '2. Your role (what was yours, not the team’s)', '3. The approach (2–3 decisions, and why)', '4. The result (with a number)', '5. What you would do differently', '', `Type note: ${typeNotes[type]}`].join('\n')),
        res('Length', '150–300 words plus visuals per case — recruiters spend under a minute per project', T.neutral),
        res('Presentation', type === 'Design (visual)' ? 'scrolling site or PDF — never an attachment' : 'a single clean PDF or a Notion page is fine', T.neutral),
      ]
    },
  },
  {
    id: 'skills-gap-analyzer-career',
    name: 'Skills Gap Analyzer',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Diffs your current skills against a target job description and outputs a prioritised learning plan with timelines.',
    tip: 'Target the gaps that appear in every job ad for that role, not the ones that interest you. Frequency in ads is the market signal.',
    usage: ['Paste the job description.', 'List your current skills.', 'Read the gap ranking.'],
    method: ['Required and preferred keywords are extracted.', 'Your skills are matched against them.', 'Gaps are ranked by ad frequency.'],
    fields: [txt('jd', 'Job description (paste the ad)', 6, 'We are looking for a data analyst. You will write SQL, build dashboards in Tableau, and present to non-technical stakeholders. Experience with dbt and Airflow is a plus. You have a degree in a quantitative field. Strong Excel required.'), txt('mine', 'Your current skills (one per line)', 4, 'SQL\nExcel\nStatistics\nPower BI'), n('hours', 'Study hours per week', { def: 6, min: 1, step: 1 })],
    compute: (v) => {
      const jd = asStr(v.jd)
      if (!jd) return [sres('Gap analysis', 'Paste the job description first', T.warn)]
      const mine = new Set(bullets(asStr(v.mine)).map((s) => s.toLowerCase()))
      const skills = [...new Set(jd.match(/\b[A-Z][a-zA-Z+#]{2,}(?:\s[A-Z][a-zA-Z+#]{2,})?/g) || [])]
        .filter((s) => !['The', 'You', 'Our', 'We', 'This', 'Your', 'With', 'They', 'There', 'About'].includes(s))
      const matched = skills.filter((s) => mine.has(s.toLowerCase()) || [...mine].some((m) => m.includes(s.toLowerCase()) || s.toLowerCase().includes(m)))
      const missing = skills.filter((s) => !matched.includes(s))
      const hours = asNum(v.hours) || 6
      const plan = missing.map((s, i) => `${s}: ${ratio(30 + i * 5, 0)} h → ${ratio((30 + i * 5) / hours, 1)} weeks at ${ratio(hours, 0)} h/week`)
      return [
        sres('Skills matched', `${num(matched.length, 0)}/${num(skills.length, 0)}`, matched.length / Math.max(1, skills.length) > 0.6 ? T.good : T.warn, `skill coverage ${ratio((matched.length / Math.max(1, skills.length)) * 100, 0)}%`, (matched.length / Math.max(1, skills.length)) * 100),
        sres('Critical gaps', num(missing.length, 0), missing.length > 3 ? T.warn : T.good, missing.length ? 'learn these before applying' : 'strong match — apply now'),
        docr('Matched skills', matched.length ? matched.join(', ') : 'none matched — check your skill list is specific'),
        docr('Learning plan', plan.length ? plan.join('\n') : 'no gaps found'),
        res('Matched list', matched.join(', ') || '—', T.neutral, 'lead your CV with these'),
        res('Reality check', 'the ad lists what they want — you can stretch, but do not claim skills you cannot demonstrate in an interview', T.warn),
      ]
    },
  },
  {
    id: 'internship-finder-career',
    name: 'Internship Search Planner',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Plans an internship search: target list, application cadence, tracking of applications and follow-up deadlines.',
    tip: 'Apply to fewer roles, better. Ten targeted applications with tailored CVs beat fifty with the same one — and you will not run out of energy.',
    usage: ['Set your target role and locations.', 'Enter your weekly application capacity.', 'Read the cadence and tracker.'],
    method: ['Applications are spread over a window.', 'Capacity limits the daily count.', 'Follow-up deadlines are generated.'],
    fields: [sel('role', 'Target internship type', ['Data Analyst', 'Software Engineer', 'Nurse', 'Teacher', 'Accounting', 'Marketing', 'Design', 'Research'], 'Data Analyst'), txt('sources', 'Where you will find roles (one per line)', 3, 'Company careers pages\nLinkedIn\nGraduate schemes\nUnisplacement board'), n('perweek', 'Applications you can send per week', { def: 6, min: 1, step: 1 }), n('weeks', 'Search window (weeks)', { def: 10, min: 2, step: 1 }), n('response', 'Expected response rate (%)', { def: 15, min: 1, max: 100, step: 5 })],
    compute: (v) => {
      const per = Math.max(1, Math.round(asNum(v.perweek)))
      const weeks = Math.max(2, Math.round(asNum(v.weeks)))
      const resp = asNum(v.response) / 100
      const total = per * weeks
      const expectedInterviews = Math.round(total * resp * 0.4)
      const expectedOffer = Math.round(total * resp * 0.4 * 0.3)
      const sources = bullets(asStr(v.sources))
      const lines = Array.from({ length: Math.min(weeks, 12) }, (_, i) => `Week ${i + 1}: ${num(per, 0)} applications${i === 0 ? ' — apply to your best-fit roles first' : i === weeks - 1 ? ' — close out remaining and follow up' : ''}`).join('\n')
      return [
        sres('Total applications', num(total, 0), T.good, `${num(per, 0)}/week × ${num(weeks, 0)} weeks`),
        sres('Expected interviews', num(expectedInterviews, 0), T.neutral, `at a ${ratio(resp * 100, 0)}% response rate and 40% interview conversion`, (expectedInterviews / Math.max(1, total)) * 100 * 10),
        sres('Expected offers', num(expectedOffer, 0), expectedOffer >= 1 ? T.good : T.warn, expectedOffer >= 1 ? 'your volume is sufficient' : 'increase volume or improve targeting', (expectedOffer / Math.max(1, total)) * 100 * 30),
        docr('Weekly cadence', lines),
        docr('Sources to work', sources.length ? sources.map((s, i) => `${i + 1}. ${s}`).join('\n') : 'add sources — company pages convert best'),
        res('Follow-up rule', 'one polite follow-up 7–10 days after each application, then stop', T.neutral),
        res('Targeting', 'aim for 60% of applications at roles you would genuinely accept', T.neutral),
      ]
    },
  },
  {
    id: 'freelance-rate-calculator-career',
    name: 'Freelance Rate Calculator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Calculates the day rate you need to charge, accounting for unpaid work, expenses, holidays, tax and profit margin.',
    tip: 'Divide your salary target by billable days, not calendar days. A freelancer bills about 60% of the year — the rest is admin and pitching.',
    usage: ['Set your income target and expenses.', 'Enter billable days and billable hours.', 'Read the rate and the real hourly.'],
    method: ['Target net income is set.', 'Total costs are added.', 'Rate = costs ÷ billable days.'],
    fields: [n('target', 'Income target (net, per year)', { def: 45000, min: 0, step: 1000 }), n('billdays', 'Billable days per year', { def: 180, min: 1, step: 1 }), n('billhours', 'Billable hours per day', { def: 6, min: 1, step: 0.5 }), n('expenses', 'Annual expenses (software, insurance, gear)', { def: 6000, min: 0, step: 500 }), n('tax', 'Tax provision (%)', { def: 25, min: 0, max: 60, step: 1 }), n('profit', 'Profit margin you want (%)', { def: 20, min: 0, max: 50, step: 1 })],
    compute: (v) => {
      const target = asNum(v.target)
      const days = Math.max(1, asNum(v.billdays))
      const hours = asNum(v.billhours) || 1
      const exp = asNum(v.expenses)
      const tax = asNum(v.tax) / 100
      const profit = asNum(v.profit) / 100
      const grossNeeded = (target / (1 - tax)) * (1 + profit)
      const withExp = grossNeeded + exp
      const dayRate = withExp / days
      const hourRate = dayRate / hours
      const monthsWorked = (days / 12) * (1 - tax) * (1 - profit)
      return [
        sres('Day rate to charge', money(Math.round(dayRate)), dayRate < 300 ? T.warn : T.good, `for a ${money(Math.round(target))} net income`, clamp((dayRate / 600) * 100, 5, 100)),
        sres('Effective hourly rate', money(Math.round(hourRate)) + '/h', hourRate < 45 ? T.bad : hourRate < 60 ? T.warn : T.good, `${ratio(hours, 1)} billable hours in a ${ratio(dayRate, 0)} day`),
        res('Gross revenue needed', money(Math.round(withExp)), T.neutral, `after ${ratio(tax * 100, 0)}% tax provision, ${ratio(profit * 100, 0)}% profit and ${money(Math.round(exp))} expenses`),
        res('Calendar reality', `${num(Math.round(days), 0)} billable days = ${ratio(monthsWorked, 1)} “employed” months at your target`, T.neutral, 'the rest is pitching, admin and gaps'),
        res('Bottom rate', `${money(Math.round(dayRate * 0.8))} — accept above this for interesting work, hold firm above ${money(Math.round(dayRate))}`, T.neutral),
        res('Invoice discipline', 'deposit terms of 30–50% — unpaid invoices are the main cause of freelance failure', T.warn),
      ]
    },
  },
  {
    id: 'resume-gap-analyzer',
    name: 'Resume Gap Analyzer',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Audits your resume text for missing impact, weak verbs, bullet length, keyword gaps and section completeness.',
    tip: 'A resume is a claims document. If a bullet contains no verb and no number, it is decoration — cut it or make it specific.',
    usage: ['Paste your resume text.', 'Read the score and issues.', 'Fix the top three and re-score.'],
    method: ['Bullets are checked for verbs and metrics.', 'Section completeness is tested.', 'A weighted score is returned.'],
    fields: [txt('resume', 'Resume text (paste it)', 10, 'JOB TITLE\nResponsible for managing sales reports and supporting the team\nHelped with client accounts\n\nEDUCATION\nBSc Business Administration\n\nSKILLS\nTeamwork, communication')],
    compute: (v) => {
      const text = asStr(v.resume)
      if (text.length < 40) return [sres('Audit', 'Paste your resume text (at least a few lines)', T.warn)]
      const bullets = text.split('\n').map((l) => l.replace(/^[\s\-*•\d.)\s]+/, '').trim()).filter((l) => l.length > 8)
      const weak = /\b(responsible for|helped with|assisted|worked on|involved in|tasks included|helped)\b/i
      const strongVerbs = /^(Led|Built|Designed|Managed|Delivered|Increased|Reduced|Launched|Analysed|Developed|Implemented|Coordinated|Automated|Negotiated|Improved|Owned|Spearheaded|Established)/i
      const issues: string[] = []
      const noVerb = bullets.filter((b) => !strongVerbs.test(b))
      const noMetric = bullets.filter((b) => !/\d/.test(b))
      if (noVerb.length) issues.push(`${noVerb.length} bullet(s) start with a weak verb or none — lead with a strong verb`)
      if (noMetric.length) issues.push(`${noMetric.length} bullet(s) contain no number — add a metric`)
      if (weak.test(text)) issues.push('contains filler phrases like "responsible for" or "helped with"')
      if (!/education/i.test(text)) issues.push('no education section found')
      if (!/experience|employment|work history/i.test(text)) issues.push('no experience section found')
      if (!/skills/i.test(text)) issues.push('no skills section found')
      if (bullets.some((b) => b.split(' ').length > 35)) issues.push('some bullets are longer than 35 words — cut them')
      const strengths = [
        strongVerbs.test(text) ? 'uses strong action verbs' : '',
        /\d/.test(text) ? 'contains measurable results' : '',
        /education/i.test(text) ? 'education section present' : '',
        /skills/i.test(text) ? 'skills section present' : '',
        text.split(/\s+/).length <= 600 ? 'length is resume-appropriate' : 'longer than one page for most experience levels',
      ].filter(Boolean)
      const score = clamp(100 - issues.length * 12 - (noMetric.length / Math.max(1, bullets.length)) * 30, 5, 100)
      return [
        sres('Resume score', `${num(score, 0)}/100`, score > 80 ? T.good : score > 55 ? T.warn : T.bad, `${num(issues.length, 0)} issue(s) found`, score),
        sres('Bullets analysed', num(bullets.length, 0), T.neutral, `${num(noMetric.length, 0)} without metrics, ${num(noVerb.length, 0)} without strong verbs`, 100 - (noMetric.length / Math.max(1, bullets.length)) * 100),
        docr('Issues to fix', issues.length ? issues.map((i, idx) => `${idx + 1}. ${i}`).join('\n') : 'no structural issues found — check the content quality instead'),
        docr('What works', strengths.map((s) => `✓ ${s}`).join('\n')),
        res('Top priority', issues[0] || 'review each bullet for whether it proves anything', issues.length ? T.warn : T.good),
        res('Length', `${num(text.split(/\s+/).length, 0)} words — aim for 350–600 for under 10 years experience`, T.neutral),
      ]
    },
  },
  {
    id: 'professional-headline-generator',
    name: 'Professional Headline Generator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Generates professional headline variants for LinkedIn, email signatures and business cards by audience and goal.',
    tip: 'Write the headline for someone who is searching for you, not for someone who already knows you.',
    usage: ['Enter your role, specialty and goal.', 'Choose the audience.', 'Read the variants.'],
    method: ['Headline = role + specialty + proof point.', 'Variants differ by audience.', 'Length is checked per platform.'],
    fields: [sel('role', 'Your role', ['Data Analyst', 'Software Engineer', 'Nurse', 'Teacher', 'Accountant', 'Marketing Manager', 'Graphic Designer', 'PhD Researcher / Academic'], 'Data Analyst'), txt('special', 'Your specialty or niche', 2, 'causal inference for retail demand'), n('years', 'Years of experience', { def: 5, min: 0, step: 1 }), n('achievement', 'Best measurable achievement (e.g. 22% lift)', { def: 22, step: 1 }), sel('aud', 'Primary audience', ['Recruiters', 'Your manager', 'Clients / customers', 'The wider professional network'], 'Recruiters')],
    compute: (v) => {
      const role = asSel(v.role)
      const spec = asStr(v.special).trim() || ROLES[role][0]
      const years = Math.round(asNum(v.years))
      const ach = Math.round(asNum(v.achievement))
      const aud = asSel(v.aud)
      const variants: Record<string, string[]> = {
        Recruiters: [
          `${role} specialising in ${spec} — ${years} years, ${ach}% measurable impact`,
          `${role} · ${spec} · open to ${titleCase(ROLES[role][0])} and ${titleCase(ROLES[role][1])} roles`,
          `${spec.charAt(0).toUpperCase() + spec.slice(1)} specialist · ${role} · ${ach}% results, ${years} years in the field`,
        ],
        'Your manager': [
          `${role} — focused on ${spec}`,
          `${role} | delivering on ${spec}`,
          `${role}, ${years} years, currently working on ${spec}`,
        ],
        'Clients / customers': [
          `${role} helping teams get results from ${spec}`,
          `${spec.charAt(0).toUpperCase() + spec.slice(1)} that pays for itself — ${ach}% proven`,
          `${role} | ${spec} | results, not reports`,
        ],
        'The wider professional network': [
          `${role} writing about ${spec}`,
          `${role} · ${spec} · sharing what works`,
          `${role} interested in ${spec} and how teams apply it`,
        ],
      }
      const out = variants[aud] || variants.Recruiters
      return [
        sres('Recommended headline', out[0], out[0].length <= 220 ? T.good : T.warn, `${num(out[0].length, 0)} characters — LinkedIn allows 220`, clamp(100 - out[0].length / 4, 5, 100)),
        sres('Variants generated', num(out.length, 0), T.neutral, `for ${aud.toLowerCase()}`),
        docr('All variants', out.map((x, i) => `${i + 1}. ${x}`).join('\n')),
        res('Formula', 'role + specialty + proof. Three elements maximum — more reads as a paragraph.', T.neutral),
        res('Test it', 'search your own headline in a job board search — if you do not appear, rewrite it', T.neutral),
        res('Update rhythm', 'revisit every 12 months or after a promotion or major project', T.neutral),
      ]
    },
  },
  {
    id: 'reference-request-generator',
    name: 'Reference Request Generator',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Drafts a professional reference request with a clear brief of the role, reminding referees what to emphasise.',
    tip: 'Give referees your CV and the job ad. A referee who has to guess what the role needs will write something generic, and generic gets you nothing.',
    usage: ['Enter the role and referee background.', 'Set your relationship and date.', 'Read the request and the brief.'],
    method: ['The request states the role and deadline.', 'It reminds the referee of shared work.', 'A CV and job-ad reminder is included.'],
    fields: [txt('role', 'Role you are applying for'), txt('ref', 'Reference name and background'), sel('rel', 'Your relationship', ['Former manager', 'Current manager', 'Colleague / peer', 'Professor / supervisor', 'Client', 'Volunteer coordinator'], 'Former manager'), dt('due', 'When do you need the reference?'), n('days', 'Working days left', { def: 7, min: 1, step: 1 })],
    compute: (v) => {
      const role = asStr(v.role).trim()
      const ref = asStr(v.ref).trim()
      if (!role || !ref) return [sres('Request', 'Add the role and referee name', T.warn)]
      const rel = asSel(v.rel)
      const days = Math.max(1, Math.round(asNum(v.days)))
      const due = asStr(v.due)
      const tone = rel === 'Professor / supervisor' ? 'formal' : rel === 'Client' ? 'respectful and brief' : 'warm and direct'
      const ask = [
        `Subject: Reference request — ${role}`,
        '',
        `Dear ${ref.split(' ')[0]},`,
        '',
        `I am applying for a ${role} position and the application asks for a reference. Would you be comfortable providing one? I would be grateful for it by ${due || `about ${days} days from now`}.`,
        '',
        `A little context so the reference is useful: I am applying for ${role}, and I have attached my CV and the job description. The areas where your perspective would be most useful are:`,
        rel === 'Professor / supervisor' ? '• my academic performance, independent work and intellectual curiosity\n• how I approached complex problems\n• my reliability with deadlines' : rel === 'Former manager' ? '• how I performed in my role day to day\n• examples of initiative and problem-solving\n• how I worked with colleagues' : '• specific examples of the work we did together\n• how I communicated and collaborated\n• anything I did that had a measurable result',
        '',
        `If you are happy, please just reply to this message with a few paragraphs — most referees write something in their own words rather than a formal letter, and that is usually fine.`,
        '',
        'Thank you — I really appreciate it.',
        '',
        '[Your name]',
      ].join('\n')
      return [
        sres('Request drafted', `${num(days, 0)} working days`, days >= 5 ? T.good : T.warn, days >= 5 ? 'comfortable lead time' : 'tight — send today and follow up in two days', clamp((days / 14) * 100, 5, 100)),
        sres('Tone', tone, T.neutral, `relationship: ${rel.toLowerCase()}`),
        docr('Reference request email', ask),
        res('Always attach', 'your CV and the job description — a referee cannot advocate for a role they have not read', T.warn),
        res('Backup plan', 'ask for two more potential referees than you need; the first may decline', T.neutral),
        res('If declined', 'ask whether they would give a reference by phone instead, or move to the second name', T.neutral),
      ]
    },
  },
  {
    id: 'career-decision-matrix',
    name: 'Career Decision Matrix',
    archetype: 'est',
    subject: SUBJECT,
    blurb: 'Scores two or more options against your weighted criteria, surfacing trade-offs and the deciding factor.',
    tip: 'Weight the criteria before you score the options. Deciding what matters first stops you rationalising a choice you already made.',
    usage: ['List your options and criteria.', 'Set criterion weights.', 'Read the weighted scores and the swing factor.'],
    method: ['Each option is scored per criterion.', 'Scores are weighted by importance.', 'Sensitivity reveals the deciding factor.'],
    fields: [txt('options', 'Options (one per line)', 3, 'Stay in current role\nMove to a bigger company\nGo independent'), txt('crit', 'Criteria with weights (one per line: criterion | weight 1-5)', 5, 'Salary | 5\nGrowth | 4\nStability | 3\nFlexibility | 2\nInterest | 5'), txt('scores', 'Your scores 1–10 (one per line: option | criterion1 | criterion2 ...)', 5, 'Stay in current role | 5 | 4 | 9 | 6 | 4\nMove to a bigger company | 7 | 8 | 5 | 3 | 7\nGo independent | 8 | 7 | 2 | 10 | 9'), n('threshold', 'Score above which an option is viable', { def: 6, min: 1, max: 10, step: 0.5 })],
    compute: (v) => {
      const options = bullets(asStr(v.options))
      const crit = asStr(v.crit).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
        const p = l.split(/[|,\t]/).map((x) => x.trim())
        return { name: p[0] || 'Criterion', w: parseFloat(p[1]) || 1 }
      })
      if (options.length < 2 || !crit.length) return [sres('Matrix', 'Add at least 2 options and 1 weighted criterion', T.warn)]
      const totalW = crit.reduce((s, c) => s + c.w, 0) || 1
      const rows = asStr(v.scores).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => l.split(/[|,\t]/).map((x) => x.trim()))
      const results = rows.map((r) => {
        const vals = crit.map((c, i) => ({ c, s: parseFloat(r[i + 1]) || 0 }))
        const weighted = vals.reduce((s, x) => s + x.s * x.c.w, 0) / totalW
        return { name: r[0] || 'Option', weighted, vals }
      })
      if (results.length < 2) return [sres('Matrix', 'Score each option on the same criteria, in the same order', T.warn)]
      const ranked = [...results].sort((a, b) => b.weighted - a.weighted)
      const top = ranked[0]
      const thr = asNum(v.threshold) || 6
      const swingCrit = crit.map((c) => ({ name: c.name, gap: Math.max(...results.map((r) => (r.vals.find((x) => x.c.name === c.name)?.s || 0) - Math.min(...results.map((r2) => (r2.vals.find((x) => x.c.name === c.name)?.s || 0))))) })).sort((a, b) => b.gap - a.gap)
      return [
        sres('Top option', top.name, top.weighted >= thr ? T.good : T.warn, `weighted score ${ratio(top.weighted, 2)} / 10`, (top.weighted / 10) * 100),
        sres('Options compared', num(results.length, 0), T.neutral, `${num(crit.length, 0)} criteria`),
        docr('Weighted scores', ranked.map((r, i) => `${i + 1}. ${r.name}: ${ratio(r.weighted, 2)}${r.weighted >= thr ? '' : ' (below your threshold)'} — ${r.vals.map((x) => `${x.c.name} ${num(x.s, 0)}×${num(x.c.w, 0)}`).join(', ')}`).join('\n')),
        sres('Deciding factor', swingCrit[0].name, T.warn, `largest score spread (${num(swingCrit[0].gap, 0)} points) — this is what decides it`, clamp(100 - swingCrit[0].gap * 8, 5, 100)),
        res('Runner-up', `${ranked[1].name} at ${ratio(ranked[1].weighted, 2)} — ${ratio(top.weighted - ranked[1].weighted, 2)} behind`, T.neutral),
        res('Honest check', 'if the top option is barely ahead, the criteria weights are doing the deciding — revisit them', T.neutral),
      ]
    },
  },
]
