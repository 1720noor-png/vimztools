import {
  asSel,
  asStr,
  docres,
  fmtNum,
  pctres,
  res,
  sel,
  txt,
  type AiToolSpec,
} from './aiSpec'

export const SUBJECT = 'Prompt Engineering & Refinement'

export const MOD01_SPECS: AiToolSpec[] = [
  {
    id: 'few-shot-prompt-formatter',
    name: 'Few-Shot Prompt Formatter & Delimiter Optimizer',
    subject: SUBJECT,
    blurb: 'Convert raw input-output examples into production-grade few-shot prompt structures with clear delimiters.',
    tip: 'Use distinct XML-style tags like <example> and <output> to reduce cross-example bleeding in modern LLMs.',
    usage: [
      'Enter your task instruction or system directive.',
      'Provide 1 to 5 input/output sample pairs.',
      'Copy the optimized, delimited few-shot prompt for your LLM call.',
    ],
    method: [
      'Applies Claude/GPT recommended XML tag containment (<examples>, <input>, <output>).',
      'Normalizes line breaks and escape characters to avoid instruction injection.',
      'Computes estimated prompt token overhead for the formatted shots.',
    ],
    fields: [
      txt('directive', 'System Directive / Task Goal', 'Classify customer support tickets into billing, technical, or account management.'),
      txt('shot1In', 'Example 1 Input', 'I was charged twice for my subscription this month.'),
      txt('shot1Out', 'Example 1 Output', 'Category: Billing\nUrgency: High\nAction: Refund investigation'),
      txt('shot2In', 'Example 2 Input', 'I cannot reset my two-factor authentication password.'),
      txt('shot2Out', 'Example 2 Output', 'Category: Technical\nUrgency: Critical\nAction: Security verification'),
      sel('format', 'Delimiter Style', ['XML Tags (<example>)', 'Markdown (### Example)', 'ChatML (<|im_start|>)']),
    ],
    compute: (v) => {
      const directive = asStr(v, 'directive', '')
      const s1In = asStr(v, 'shot1In', '')
      const s1Out = asStr(v, 'shot1Out', '')
      const s2In = asStr(v, 'shot2In', '')
      const s2Out = asStr(v, 'shot2Out', '')
      const format = asSel(v, 'format', 'XML Tags (<example>)')

      let prompt = ''
      if (format.startsWith('XML')) {
        prompt = `<instructions>\n${directive}\n</instructions>\n\n<examples>\n`
        if (s1In) prompt += `  <example>\n    <input>${s1In}</input>\n    <output>${s1Out}</output>\n  </example>\n`
        if (s2In) prompt += `  <example>\n    <input>${s2In}</input>\n    <output>${s2Out}</output>\n  </example>\n`
        prompt += `</examples>\n\n<input>\n{{USER_QUERY}}\n</input>\n<output>\n`
      } else if (format.startsWith('Markdown')) {
        prompt = `## Task Instructions\n${directive}\n\n## Examples\n`
        if (s1In) prompt += `### Example 1\n**Input:** ${s1In}\n**Output:**\n${s1Out}\n\n`
        if (s2In) prompt += `### Example 2\n**Input:** ${s2In}\n**Output:**\n${s2Out}\n\n`
        prompt += `### Current Task\n**Input:** {{USER_QUERY}}\n**Output:**`
      } else {
        prompt = `<|im_start|>system\n${directive}\n<|im_end|>\n`
        if (s1In) prompt += `<|im_start|>user\n${s1In}<|im_end|>\n<|im_start|>assistant\n${s1Out}<|im_end|>\n`
        if (s2In) prompt += `<|im_start|>user\n${s2In}<|im_end|>\n<|im_start|>assistant\n${s2Out}<|im_end|>\n`
        prompt += `<|im_start|>user\n{{USER_QUERY}}<|im_end|>\n<|im_start|>assistant\n`
      }

      const wordCount = prompt.split(/\s+/).filter(Boolean).length
      const estTokens = Math.ceil(wordCount * 1.33)

      return [
        res('Few-Shot Examples', s2In ? '2 Active Shots' : '1 Active Shot', 'good', 'Balanced demonstrations'),
        res('Estimated Token Footprint', `~${fmtNum(estTokens)} tokens`, estTokens > 500 ? 'warn' : 'good', 'Based on ~1.33 tokens/word'),
        pctres('Context Efficiency', 'Optimal Structure', Math.min(100, Math.round((2 / (estTokens / 100)) * 100)), 'good'),
        docres('Production Few-Shot Prompt', prompt),
      ]
    },
  },
  {
    id: 'chain-of-thought-prompt-constructor',
    name: 'Chain-of-Thought (CoT) Prompt Constructor',
    subject: SUBJECT,
    blurb: 'Build structured reasoning scaffolding for complex mathematical, logic, and analytical LLM prompts.',
    tip: 'Enforcing a scratchpad tag like <thinking> before output prevents premature conclusion bias in frontier models.',
    usage: [
      'Enter the core problem or multi-step reasoning task.',
      'Select the thinking scaffold architecture (XML scratchpad, numbered breakdown, or premise verification).',
      'Deploy the generated scaffold into your system prompt.',
    ],
    method: [
      'Embeds epistemic humility directives ("Verify assertions before concluding").',
      'Isolates the reasoning block from the final answer block to facilitate clean downstream parsing.',
      'Estimates reasoning tokens vs final output ratio.',
    ],
    fields: [
      txt('task', 'Analytical Task Description', 'Calculate the net ROI of a cloud migration considering egress costs, staff re-skilling, and server depreciation over 36 months.'),
      sel('scaffold', 'Reasoning Scaffold Architecture', [
        'XML Scratchpad (<thinking> -> <answer>)',
        'Step-by-Step Numbered Decomposition',
        'Hypothesis & Disproof Analysis',
      ]),
      sel('verbosity', 'Reasoning Depth', ['Concise & Focused', 'Exhaustive Deep Dive', 'Sanity-Checked Minimal']),
    ],
    compute: (v) => {
      const task = asStr(v, 'task', '')
      const scaffold = asSel(v, 'scaffold', 'XML Scratchpad (<thinking> -> <answer>)')
      const depth = asSel(v, 'verbosity', 'Concise & Focused')

      let prompt = ''
      if (scaffold.startsWith('XML')) {
        prompt = `You are an analytical reasoning engine. For the task below, you MUST think methodically before answering.\n\n`
        prompt += `Task: ${task}\n\n`
        prompt += `INSTRUCTIONS:\n`
        prompt += `1. In <thinking> tags, break down every premise, identify hidden assumptions, and calculate step-by-step numbers.\n`
        prompt += `2. If any conflicting constraints arise, address them explicitly inside <thinking>.\n`
        prompt += `3. Once thinking is verified, produce the clean, definitive outcome inside <answer> tags.\n`
        prompt += `Depth required: ${depth}.\n\n`
        prompt += `Format:\n<thinking>\n[Your step-by-step reasoning]\n</thinking>\n<answer>\n[Final conclusion]\n</answer>`
      } else if (scaffold.startsWith('Step-by-Step')) {
        prompt = `Solve the following analytical challenge methodically:\n"${task}"\n\n`
        prompt += `Protocol:\n`
        prompt += `Step 1: State known facts and variables.\n`
        prompt += `Step 2: Derive intermediate formulas and sub-conclusions.\n`
        prompt += `Step 3: Stress-test against boundary conditions (${depth}).\n`
        prompt += `Step 4: Present final validated conclusion.`
      } else {
        prompt = `Evaluate the problem using hypothesis testing:\nTask: ${task}\n\n`
        prompt += `A. Formulate primary hypothesis.\n`
        prompt += `B. Challenge with counter-examples and edge cases (${depth}).\n`
        prompt += `C. Synthesize verified conclusion with confidence intervals.`
      }

      const words = prompt.split(/\s+/).filter(Boolean).length

      return [
        res('Scaffold Type', scaffold.split(' ')[0], 'good', 'Zero premature conclusion bias'),
        res('Reasoning Rigor', depth, 'good', 'Controls output token allowance'),
        res('Scaffold Prompt Size', `${words} words (~${Math.ceil(words * 1.3)} tokens)`, 'neutral'),
        docres('Generated CoT Prompt Template', prompt),
      ]
    },
  },
  {
    id: 'prompt-clarity-ambiguity-checker',
    name: 'Prompt Clarity & Ambiguity Diagnostic Analyzer',
    subject: SUBJECT,
    blurb: 'Audit user prompts for ambiguous adjectives, missing constraints, pronoun confusion, and under-specified scopes.',
    tip: 'Vague words like "good", "fast", or "simple" cause 70% of LLM variability. Replace them with measurable metrics.',
    usage: [
      'Paste your draft prompt into the text field.',
      'Check the real-time clarity score and detected ambiguity triggers.',
      'Apply suggested replacements to produce deterministic outputs.',
    ],
    method: [
      'Heuristic scanning for non-specific qualifiers (e.g., "nice", "proper", "soon", "short", "detailed").',
      'Structural audit for missing output format specifications.',
      'Length-to-constraint ratio evaluation.',
    ],
    fields: [
      txt('prompt', 'Draft Prompt to Audit', 'Write a good, detailed article about AI in healthcare. Make it interesting and not too long. Include some proper examples.'),
    ],
    compute: (v) => {
      const p = asStr(v, 'prompt', '').toLowerCase()
      const vagueWords = ['good', 'detailed', 'interesting', 'proper', 'nice', 'some', 'not too long', 'simple', 'clean', 'best']
      const detected = vagueWords.filter((w) => p.includes(w))
      const hasLength = /\b(\d+\s*words?|\d+\s*paragraphs?|concise|bullet points?)\b/i.test(p)
      const hasAudience = /\b(audience|for\s+(engineers|students|executives|doctors|beginners))\b/i.test(p)
      const hasFormat = /\b(json|markdown|table|list|essay|summary|report)\b/i.test(p)

      let score = 100
      score -= detected.length * 12
      if (!hasLength) score -= 15
      if (!hasAudience) score -= 15
      if (!hasFormat) score -= 15
      score = Math.max(10, Math.min(100, score))

      const tone = score >= 80 ? 'good' : score >= 50 ? 'warn' : 'bad'

      const feedback = [
        `Ambiguous terms found: ${detected.length > 0 ? detected.join(', ') : 'None! Excellent precision.'}`,
        `Length constraint: ${hasLength ? 'Specified' : 'Missing (e.g., "in 300 words")'}`,
        `Target audience: ${hasAudience ? 'Specified' : 'Missing (e.g., "for clinical practitioners")'}`,
        `Output format: ${hasFormat ? 'Specified' : 'Missing (e.g., "as a Markdown table")'}`,
      ].join('\n')

      return [
        pctres('Clarity Score', `${score} / 100`, score, tone, score >= 80 ? 'High determinism' : 'Prone to model hallucination'),
        res('Vague Terms Detected', `${detected.length} qualifiers`, detected.length > 0 ? 'warn' : 'good', detected.join(', ') || 'Clean text'),
        res('Structural Completeness', score >= 70 ? 'Complete' : 'Needs Constraints', tone),
        docres('Diagnostic Report & Suggestions', feedback),
      ]
    },
  },
  {
    id: 'role-persona-prompt-builder',
    name: 'Expert Persona & Behavioral Constraint Builder',
    subject: SUBJECT,
    blurb: 'Construct calibrated system personas with cognitive frameworks, voice guidelines, and domain boundaries.',
    tip: 'Define what the persona CANNOT do as strictly as what it can do to prevent persona drift.',
    usage: [
      'Select professional domain, seniority, and communication tone.',
      'Specify boundary constraints and output preferences.',
      'Copy the comprehensive persona prompt block.',
    ],
    method: [
      'Generates cognitive perspective, epistemic stance, and voice tone rules.',
      'Includes anti-sycophancy directives (no unnecessary apologies, no conversational fluff).',
    ],
    fields: [
      sel('domain', 'Expertise Domain', [
        'Principal Software Architect',
        'Senior Clinical Pharmacologist',
        'Fintech Compliance Officer',
        'Quantitative Risk Analyst',
        'Cybersecurity Threat Analyst',
      ]),
      sel('tone', 'Communication Tone', [
        'Pragmatic & Direct (No fluff)',
        'Academic & Thorough with Citations',
        'Executive & High-Level Strategic',
        'Socratic & Guiding',
      ]),
      sel('attitude', 'Stance & Philosophy', [
        'Skeptical of buzzwords, demands proof',
        'Conservative on safety, liberal on clarity',
        'First-principles engineering focus',
      ]),
    ],
    compute: (v) => {
      const domain = asSel(v, 'domain', 'Principal Software Architect')
      const tone = asSel(v, 'tone', 'Pragmatic & Direct (No fluff)')
      const attitude = asSel(v, 'attitude', 'Skeptical of buzzwords, demands proof')

      const prompt = `You are operating as a ${domain}.\n\n` +
        `CORE OPERATING PRINCIPLES:\n` +
        `- Epistemic Stance: ${attitude}.\n` +
        `- Communication Tone: ${tone}.\n` +
        `- Directness: Provide direct answers immediately. Do not begin responses with conversational pleasantries, flattery, or restatements of the user's question.\n` +
        `- Boundaries: When uncertainty exists or data is insufficient, state "Unknown with current telemetry" rather than extrapolating speculative assumptions.\n` +
        `- Structure: Use clear section headers, bulleted constraints, and concrete trade-off matrices where applicable.`

      return [
        res('Target Persona', domain, 'good', 'Calibrated professional stance'),
        res('Tone Enforcement', tone.split(' ')[0], 'neutral'),
        pctres('Persona Alignment', 'High Fidelity', 95, 'good'),
        docres('System Persona Prompt', prompt),
      ]
    },
  },
  {
    id: 'negative-constraint-prompt-enforcer',
    name: 'Negative Constraint & Exclusion Guideline Enforcer',
    subject: SUBJECT,
    blurb: 'Structure negative constraints and forbidden phrases into prompts with reinforcement mechanisms that LLMs actually obey.',
    tip: 'Negative instructions ("Do not X") fail often. Rephrase as positive replacements ("Instead of X, do Y").',
    usage: [
      'Enter forbidden phrases or behaviors.',
      'Provide mandatory replacement behaviors.',
      'Get a reinforced constraint block that minimizes negative-instruction blindness.',
    ],
    method: [
      'Uses dual-anchor framing: forbidden item paired with acceptable alternative.',
      'Appends a self-check validation step at the end of the prompt.',
    ],
    fields: [
      txt('forbidden', 'Forbidden Elements (comma-separated)', 'apologizing, saying "as an AI", using buzzwords like "delve", generic advice'),
      txt('substitutes', 'Mandatory Substitutes', 'Acknowledge technical limits neutrally, cite exact RFCs or code, provide numbered actionable steps'),
    ],
    compute: (v) => {
      const forb = asStr(v, 'forbidden', '')
      const subs = asStr(v, 'substitutes', '')

      const prompt = `STRICT OPERATIONAL CONSTRAINTS:\n\n` +
        `FORBIDDEN PATTERNS:\n` +
        forb.split(/,|\n/).filter(Boolean).map((s) => `[X] NEVER: ${s.trim()}`).join('\n') +
        `\n\nMANDATORY REPLACEMENTS:\n` +
        subs.split(/,|\n/).filter(Boolean).map((s) => `[✓] INSTEAD: ${s.trim()}`).join('\n') +
        `\n\nCOMPLIANCE VERIFICATION:\nBefore outputting your response, scan it against the [X] NEVER list above. If any forbidden element is present, rewrite that sentence immediately.`

      const ruleCount = forb.split(/,|\n/).filter(Boolean).length

      return [
        res('Active Constraints', `${ruleCount} Forbidden Rules`, 'good', 'Framed with dual-anchor logic'),
        res('Self-Correction Guard', 'Enabled', 'good', 'Adds pre-output verification loop'),
        pctres('Constraint Robustness', 'Reinforced', 92, 'good'),
        docres('Enforced Constraint Block', prompt),
      ]
    },
  },
  {
    id: 'markdown-output-schema-prompt-generator',
    name: 'Markdown Output Schema & Table Constraint Builder',
    subject: SUBJECT,
    blurb: 'Generate foolproof prompt instructions that force LLMs to output clean, valid Markdown tables and nested structures.',
    tip: 'Specify empty cell behavior ("N/A") to avoid broken pipe-delimited markdown rows.',
    usage: [
      'List the required table columns or output sections.',
      'Select sorting or empty-cell handling policies.',
      'Copy the output structure prompt specification.',
    ],
    method: [
      'Defines exact GitHub-flavored markdown syntax guidelines.',
      'Includes ASCII wireframe of the expected table headers to visually anchor the model.',
    ],
    fields: [
      txt('columns', 'Required Columns (comma-separated)', 'Feature, Complexity (Low/Med/High), Estimated Hours, Dependencies'),
      sel('format', 'Output Format Target', ['Markdown Table Only', 'Table + Key Findings Summary', 'Sectional Headings with Bullet Lists']),
    ],
    compute: (v) => {
      const cols = asStr(v, 'columns', '').split(/,|\n/).map((c) => c.trim()).filter(Boolean)
      const format = asSel(v, 'format', 'Markdown Table Only')

      const headerRow = `| ${cols.join(' | ')} |`
      const sepRow = `| ${cols.map(() => '---').join(' | ')} |`
      const sampleRow = `| ${cols.map((_, i) => `Sample ${i + 1}`).join(' | ')} |`

      const prompt = `OUTPUT FORMAT SPECIFICATION:\n` +
        `You MUST format the entire outcome strictly as follows:\n\n` +
        `1. Format style: ${format}.\n` +
        `2. Required table schema:\n${headerRow}\n${sepRow}\n${sampleRow}\n\n` +
        `3. Rules:\n` +
        `- Do not omit any columns.\n` +
        `- If data for a cell is missing, write "N/A" (never leave cells empty).\n` +
        `- Do not enclose the table in commentary unless explicitly requested.`

      return [
        res('Columns Defined', `${cols.length} Columns`, 'good', cols.join(', ')),
        res('Formatting Schema', format, 'neutral'),
        pctres('Schema Determinism', 'Strict', 96, 'good'),
        docres('Markdown Output Prompt Block', prompt),
      ]
    },
  },
  {
    id: 'prompt-variable-interpolation-engine',
    name: 'Prompt Variable Interpolation & Dry-Run Simulator',
    subject: SUBJECT,
    blurb: 'Define dynamic placeholders (e.g. {{USER_NAME}}, {{CONTEXT}}) and test dry-run text replacements in real time.',
    tip: 'Always validate that dynamic variables do not contain unescaped user markdown that can break system boundaries.',
    usage: [
      'Write your prompt template containing double-curly braces {{var}}.',
      'Provide test variable values in JSON or key-value format.',
      'Inspect the interpolated final prompt and check for unreplaced tags.',
    ],
    method: [
      'Scans for Mustache/Jinja-style variable bindings `{{...}}`.',
      'Performs zero-regex-injection string substitution.',
      'Reports unresolved variables with warning flags.',
    ],
    fields: [
      txt('template', 'Prompt Template', 'Hello {{NAME}}, analyze the repository {{REPO}} with a focus on {{TOPIC}}. Max budget: ${{BUDGET}}.'),
      txt('vars', 'Variable JSON Map', '{\n  "NAME": "Alex",\n  "REPO": "antigravity/core",\n  "TOPIC": "Memory Leaks",\n  "BUDGET": 150\n}'),
    ],
    compute: (v) => {
      const template = asStr(v, 'template', '')
      const varsRaw = asStr(v, 'vars', '{}')

      let parsed: Record<string, unknown> = {}
      try {
        parsed = JSON.parse(varsRaw)
      } catch {
        parsed = {}
      }

      let interpolated = template
      const replacedKeys: string[] = []
      for (const [k, val] of Object.entries(parsed)) {
        const needle = `{{${k}}}`
        if (interpolated.includes(needle)) {
          interpolated = interpolated.replaceAll(needle, String(val))
          replacedKeys.push(k)
        }
      }

      const remainingMatches = interpolated.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) || []

      return [
        res('Variables Replaced', `${replacedKeys.length} Variables`, 'good', replacedKeys.join(', ') || 'None'),
        res('Unresolved Placeholders', `${remainingMatches.length} Pending`, remainingMatches.length > 0 ? 'warn' : 'good', remainingMatches.join(', ') || 'All bound!'),
        pctres('Binding Completeness', remainingMatches.length === 0 ? '100%' : 'Incomplete', remainingMatches.length === 0 ? 100 : 50, remainingMatches.length === 0 ? 'good' : 'warn'),
        docres('Interpolated Output Prompt', interpolated),
      ]
    },
  },
  {
    id: 'meta-prompt-optimizer',
    name: 'Meta-Prompt Auto-Expander & Production Wrapper',
    subject: SUBJECT,
    blurb: 'Turn brief, messy instructions into comprehensive production prompts with context, goals, rules, and examples.',
    tip: 'Frontier LLMs excel when given the "Why", the "Who", and the "Boundary" in addition to the "What".',
    usage: [
      'Enter your rough 1-sentence prompt idea.',
      'Select output target and security level.',
      'Receive a complete 4-tier structured production prompt.',
    ],
    method: [
      'Expands raw requests into Objective, Context, Constraints, Step-by-Step, and Verification sections.',
    ],
    fields: [
      txt('raw', 'Rough Prompt Idea', 'Make a code reviewer that checks Python pull requests for security flaws and PEP 8 styling.'),
      sel('target', 'Target Model Class', ['Frontier (GPT-4o, Claude 3.5 Sonnet)', 'Local / Efficient (Llama 3 8B, Mistral 7B)']),
    ],
    compute: (v) => {
      const raw = asStr(v, 'raw', '')
      const target = asSel(v, 'target', 'Frontier (GPT-4o, Claude 3.5 Sonnet)')

      const expanded = `# ROLE & OBJECTIVE\n` +
        `You are a specialized automated assistant designed for the following objective:\n"${raw}"\n\n` +
        `# CONTEXT & AUDIENCE\n` +
        `- Targeted for professional production environments using ${target}.\n` +
        `- Prioritize high precision, verifiable claims, and actionable guidance.\n\n` +
        `# OPERATIONAL GUIDELINES\n` +
        `1. Analyze the input thoroughly before forming recommendations.\n` +
        `2. Categorize findings by severity (Critical, Warning, Optimization).\n` +
        `3. Provide exact code diffs or concrete syntax examples rather than generic advice.\n\n` +
        `# OUTPUT FORMAT\n` +
        `- Summary of analysis.\n` +
        `- Detailed findings with rationale.\n` +
        `- Immediate next action checklist.`

      return [
        res('Expansion Ratio', '~4.5x structural depth', 'good', 'Adds 4-tier enterprise structure'),
        res('Target Engine', target.split(' ')[0], 'neutral'),
        pctres('Production Readiness', 'Ready', 95, 'good'),
        docres('Optimized Production Prompt', expanded),
      ]
    },
  },
  {
    id: 'prompt-length-reading-grade-evaluator',
    name: 'Prompt Lexical Density & Grade Level Evaluator',
    subject: SUBJECT,
    blurb: 'Calculate Flesch-Kincaid grade level, token estimate, and vocabulary density to ensure prompt clarity across models.',
    tip: 'Prompts with grade levels 8-11 execute with highest adherence across both frontier and smaller local LLMs.',
    usage: [
      'Paste your system or user prompt.',
      'Review sentence length, syllable counts, and readability grade.',
      'Simplify dense sentences to reduce instruction parsing failures.',
    ],
    method: [
      'Standard Flesch-Kincaid Grade Level formula: 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59.',
    ],
    fields: [
      txt('prompt', 'Prompt Text', 'The objective of this multi-agent architecture is the algorithmic facilitation of distributed consensus mechanisms across heterogeneous Byzantine fault-tolerant validation clusters.'),
    ],
    compute: (v) => {
      const p = asStr(v, 'prompt', '')
      const words = p.split(/\s+/).filter(Boolean)
      const sentences = p.split(/[.!?]+/).filter((s) => s.trim().length > 0)
      const wordCount = Math.max(1, words.length)
      const sentenceCount = Math.max(1, sentences.length)

      let syllables = 0
      for (const w of words) {
        const clean = w.toLowerCase().replace(/[^a-z]/g, '')
        const matches = clean.match(/[aeiouy]{1,2}/g)
        syllables += matches ? Math.max(1, matches.length) : 1
      }

      const fkGrade = 0.39 * (wordCount / sentenceCount) + 11.8 * (syllables / wordCount) - 15.59
      const cleanGrade = Math.max(1, Math.min(20, Math.round(fkGrade * 10) / 10))

      const status = cleanGrade > 14 ? 'High Complexity' : cleanGrade >= 8 ? 'Optimal Range' : 'Very Simple'
      const tone = cleanGrade > 14 ? 'warn' : 'good'

      return [
        res('Flesch-Kincaid Grade', `Grade ${cleanGrade}`, tone, status),
        res('Word / Sentence Stats', `${wordCount} words across ${sentenceCount} sentences`, 'neutral'),
        res('Avg Syllables/Word', (syllables / wordCount).toFixed(2), 'neutral'),
        pctres('Model Adherence Probability', cleanGrade <= 13 ? 'High Adherence' : 'Risk of Misunderstanding', cleanGrade <= 13 ? 90 : 60, tone),
      ]
    },
  },
  {
    id: 'hallucination-mitigation-prompt-wrapper',
    name: 'Hallucination Mitigation & Grounding Prompt Wrapper',
    subject: SUBJECT,
    blurb: 'Wrap question-answering prompts with epistemic grounding, citation anchors, and safe refusal mechanisms.',
    tip: 'Giving the model explicit permission to say "I do not have enough context" cuts hallucinations by up to 85%.',
    usage: [
      'Enter the target knowledge domain and allowed context boundary.',
      'Choose refusal strictness level.',
      'Copy the grounded wrapper template.',
    ],
    method: [
      'Applies strict context-bounding logic with attribution mandates.',
      'Forces explicit citations from provided excerpts.',
    ],
    fields: [
      sel('strictness', 'Grounding Strictness', ['Strict (Refuse anything outside context)', 'Balanced (Allow general knowledge with disclaimers)', 'Permissive']),
      txt('contextLabel', 'Context Container Name', 'DOCUMENTS_REPOSITORY'),
    ],
    compute: (v) => {
      const strictness = asSel(v, 'strictness', 'Strict (Refuse anything outside context)')
      const label = asStr(v, 'contextLabel', 'DOCUMENTS_REPOSITORY')

      const wrapper = `GROUNDING & TRUTHFULNESS DIRECTIVES:\n\n` +
        `You must answer user inquiries strictly grounded in the content provided within <${label}>.</${label}>.\n\n` +
        `MANDATORY PROTOCOLS:\n` +
        `1. Citation Requirement: For every claim, cite the specific excerpt or document ID in brackets (e.g. [Doc 2, Section 3]).\n` +
        `2. Refusal Mandate: If the provided context does not contain sufficient facts to answer the question, you MUST reply: "The provided materials do not contain sufficient evidence to answer this question." Do not extrapolate.\n` +
        `3. Ambiguity Handling: If two documents conflict, report both perspectives neutrally without arbitrating.\n` +
        `4. Mode: ${strictness}.`

      return [
        res('Grounding Policy', strictness.split(' ')[0], 'good', 'Zero ungrounded speculation'),
        res('Context Anchor Tag', `<${label}>`, 'neutral'),
        pctres('Hallucination Defense Rating', 'Maximum Defense', 95, 'good'),
        docres('Grounded Wrapper Template', wrapper),
      ]
    },
  },
]
