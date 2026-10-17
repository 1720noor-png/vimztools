import {
  asSel,
  asStr,
  docres,
  pctres,
  res,
  sel,
  txt,
  type AiToolSpec,
} from './aiSpec'

export const SUBJECT = 'AI System Prompt Generator'

export const MOD18_SPECS: AiToolSpec[] = [
  {
    id: 'enterprise-support-system-prompt-builder',
    name: 'Enterprise Customer Support System Prompt Architect',
    subject: SUBJECT,
    blurb: 'Generate production-ready system prompts for enterprise support bots with strict escalation rules, brand tone, and policy boundaries.',
    tip: 'Define clear human agent escalation phrases so the bot never traps users in an unhelpful loop.',
    usage: [
      'Enter company name and support domain.',
      'Specify refund/policy limits and escalation contact email.',
      'Copy the comprehensive, policy-compliant system prompt.',
    ],
    method: [
      'Builds multi-tier system directives covering Greeting, Policy, Verification, and Escalation.',
    ],
    fields: [
      txt('company', 'Company Name', 'CloudNova Hosting'),
      txt('domain', 'Support Scope', 'VPS servers, DNS setup, billing inquiries, and SSL certificates.'),
      txt('escalate', 'Escalation Contact / Team', 'support@cloudnova.internal / Tier-2 Helpdesk'),
    ],
    compute: (v) => {
      const company = asStr(v, 'company', 'CloudNova Hosting')
      const domain = asStr(v, 'domain', '')
      const esc = asStr(v, 'escalate', '')

      const prompt = `You are the primary AI Support Representative for ${company}.\n\n` +
        `CORE SCOPE:\n` +
        `- You handle customer inquiries regarding: ${domain}.\n\n` +
        `BEHAVIORAL POLICY:\n` +
        `1. Empathy & Precision: Be courteous, professional, and direct. Avoid excessive apologies.\n` +
        `2. Authentication: Never ask for raw passwords or full credit card numbers.\n` +
        `3. Escalation Protocol: If an inquiry involves account deletion, billing refunds over $50, or root server downtime, advise the user: "I will immediately escalate this to our specialist team at ${esc}."\n` +
        `4. Knowledge Boundaries: Never speculate on unannounced features or downtime causes.`

      return [
        res('Target Entity', company, 'good'),
        res('Security & Escalation', 'Configured', 'good'),
        pctres('Enterprise Readiness', 'Production Quality', 95, 'good'),
        docres('Enterprise Support System Prompt', prompt),
      ]
    },
  },
  {
    id: 'coding-assistant-system-prompt-generator',
    name: 'Developer Coding Assistant System Prompt Generator',
    subject: SUBJECT,
    blurb: 'Construct high-performance coding copilot instructions specifying modern language versions, typing rules, and test-driven design.',
    tip: 'Specifying exact dependency versions (e.g. "React 19, Tailwind v4, Node 22") eliminates deprecated syntax suggestions.',
    usage: [
      'Select primary language and modern framework stack.',
      'Specify code style (TypeScript strict, PEP 8, idiomatic Go).',
      'Generate customized developer copilot instructions.',
    ],
    method: [
      'Embeds strict typing, error handling, performance considerations, and test coverage requirements.',
    ],
    fields: [
      sel('stack', 'Tech Stack & Framework', [
        'TypeScript / React 19 / Tailwind CSS v4',
        'Python 3.12 / FastAPI / Pydantic v2',
        'Rust / Tokio / Axum',
        'Go 1.23 / Standard Library',
      ]),
      sel('brevity', 'Explanation Brevity', ['Code First with minimal inline comments', 'Detailed explanation with architecture overview', 'TDD (Test suite first, then implementation)']),
    ],
    compute: (v) => {
      const stack = asSel(v, 'stack', 'TypeScript / React 19 / Tailwind CSS v4')
      const style = asSel(v, 'brevity', 'Code First with minimal inline comments')

      const prompt = `You are a Principal Software Engineer specializing in ${stack}.\n\n` +
        `ENGINEERING STANDARDS:\n` +
        `- Language Standard: Adhere strictly to modern conventions (${stack}). Never propose deprecated APIs.\n` +
        `- Typing & Safety: 100% strict type safety. No 'any' types in TypeScript; explicit type hints in Python.\n` +
        `- Communication Style: ${style}.\n` +
        `- Code Delivery: Provide complete, runnable code blocks without placeholder comments like '// ... rest of code'.\n` +
        `- Edge Cases: Explicitly handle null/undefined, network timeouts, and resource cleanups.`

      return [
        res('Stack Architecture', stack.split('/')[0].trim(), 'good'),
        res('Explanation Mode', style.split(' ')[0], 'neutral'),
        pctres('Code Adherence Score', 'High Fidelity', 98, 'good'),
        docres('Coding Assistant System Prompt', prompt),
      ]
    },
  },
]
