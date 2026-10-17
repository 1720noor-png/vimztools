import {
  Bot,
  Brain,
  Cpu,
  Database,
  FileCode,
  Gauge,
  Layers,
  LineChart,
  MessageSquare,
  Mic,
  Network,
  Scale,
  ShieldAlert,
  Sparkles,
  Sliders,
  Terminal,
  Type,
  Video,
  Wand2,
  Workflow,
  type LucideIcon,
} from 'lucide-react'
import type { Tool } from '../../lib/catalog'
import { aiToolSpecs } from './specs'

export const AI_CATEGORY = 'ai-tools'
export const AI_CATEGORY_NAME = 'AI & Machine Learning'

export interface AiSubcategory {
  id: string
  title: string
  tagline: string
  description: string
  icon: LucideIcon
  toolIds: string[]
}

export const AI_SUBCATEGORIES: AiSubcategory[] = [
  {
    id: 'ai-prompt-engineering',
    title: 'Prompt Engineering & Refinement',
    tagline: 'Few-shot delimiters, CoT & clarity audits',
    description: 'Construct calibrated prompts, few-shot examples, chain-of-thought scaffolds, and ambiguity-free directives.',
    icon: Sparkles,
    toolIds: [],
  },
  {
    id: 'ai-token-context',
    title: 'LLM Token Counter & Context Sizer',
    tagline: 'BPE tokens, context saturation & window budgets',
    description: 'Sizer for GPT-4o, Claude 3.5, and Gemini context fill ratios, sliding windows, and caching thresholds.',
    icon: Type,
    toolIds: [],
  },
  {
    id: 'ai-local-models',
    title: 'Local Model VRAM & Quantization',
    tagline: 'VRAM allocator, KV cache & Modelfiles',
    description: 'Calculate GPU VRAM requirements across GGUF quantization levels, offloading splits, and Ollama settings.',
    icon: Cpu,
    toolIds: [],
  },
  {
    id: 'ai-embeddings-vectors',
    title: 'Embedding & Vector Space Math',
    tagline: 'Cosine similarity, HNSW & Matryoshka',
    description: 'Compute dot products, vector dimensions, Matryoshka truncation savings, and embedding batch costs.',
    icon: Network,
    toolIds: [],
  },
  {
    id: 'ai-rag-chunking',
    title: 'RAG & Document Chunking',
    tagline: 'Overlap ratios, RRF fusion & rerankers',
    description: 'Simulate sliding-window chunking, Reciprocal Rank Fusion scores, and cross-encoder reranking budgets.',
    icon: Layers,
    toolIds: [],
  },
  {
    id: 'ai-synthetic-data',
    title: 'Synthetic Data & Mock Generators',
    tagline: 'Edge cases, PII masking & mock schemas',
    description: 'Synthesize adversarial prompt tests, realistic user profiles, and privacy-compliant PII maskers.',
    icon: Database,
    toolIds: [],
  },
  {
    id: 'ai-fine-tuning',
    title: 'Fine-Tuning Dataset Formatter',
    tagline: 'ChatML JSONL, DPO pairs & train splits',
    description: 'Format single-line ChatML JSONL training sets, Direct Preference Optimization pairs, and train/val splits.',
    icon: FileCode,
    toolIds: [],
  },
  {
    id: 'ai-eval-benchmarks',
    title: 'AI Evaluation & Benchmark Metrics',
    tagline: 'ROUGE, pass@k & confusion matrices',
    description: 'Evaluate lexical overlap, HumanEval-style pass@k probabilities, and multi-class classification metrics.',
    icon: LineChart,
    toolIds: [],
  },
  {
    id: 'ai-inference-cost',
    title: 'Model Inference Latency & Cost',
    tagline: 'TTFT, streaming throughput & bill forecaster',
    description: 'Calculate Time to First Token, inter-token streaming latency, and self-hosted GPU break-even points.',
    icon: Gauge,
    toolIds: [],
  },
  {
    id: 'ai-safety-guardrails',
    title: 'Prompt Injection & Safety Guardrails',
    tagline: 'Jailbreak scanners & delimiter sanitizers',
    description: 'Scan inputs for override signatures, sanitize malicious tags, and guard against system prompt leakage.',
    icon: ShieldAlert,
    toolIds: [],
  },
  {
    id: 'ai-agents-react',
    title: 'Agentic ReAct & Tool Call Planning',
    tagline: 'ReAct loop costs & tool schema overhead',
    description: 'Forecast quadratic context expansion across autonomous multi-step loops and tool definition budgets.',
    icon: Workflow,
    toolIds: [],
  },
  {
    id: 'ai-vision-multimodal',
    title: 'Vision & Multimodal Token Sizing',
    tagline: 'High/low detail tiles & video FPS tokens',
    description: 'Calculate image tile token decomposition for GPT-4o vision and video frame extraction token budgets.',
    icon: Video,
    toolIds: [],
  },
  {
    id: 'ai-speech-audio',
    title: 'Audio Whisper & Speech Math',
    tagline: 'Whisper duration costs & TTS character budgets',
    description: 'Calculate speech-to-text fees, word yields, and text-to-speech character costs across leading engines.',
    icon: Mic,
    toolIds: [],
  },
  {
    id: 'ai-lora-peft',
    title: 'LoRA & Parameter-Efficient Tuning',
    tagline: 'Rank/alpha params & QLoRA 4-bit VRAM',
    description: 'Calculate trainable parameter percentages, alpha scaling, and minimum GPU VRAM for QLoRA fine-tuning.',
    icon: Brain,
    toolIds: [],
  },
  {
    id: 'ai-sampling-decoding',
    title: 'Sampling (Temperature/Top-P/Top-K)',
    tagline: 'Softmax temperature & nucleus cutoff',
    description: 'Simulate probability sharpening under varying temperatures and Top-P cumulative mass truncations.',
    icon: Sliders,
    toolIds: [],
  },
  {
    id: 'ai-prompt-compression',
    title: 'Prompt Compression & Token Pruner',
    tagline: 'Fluff removal & code comment stripping',
    description: 'Strip conversational fillers, stopwords, and code docstrings to reduce token bills without losing intent.',
    icon: Wand2,
    toolIds: [],
  },
  {
    id: 'ai-function-calling',
    title: 'Function Calling & Structured JSON',
    tagline: 'Tool calling schemas & malformed JSON repair',
    description: 'Generate OpenAI Strict Mode tool definitions and automatically repair truncated or malformed LLM JSON.',
    icon: Terminal,
    toolIds: [],
  },
  {
    id: 'ai-system-prompts',
    title: 'AI System Prompt Generator',
    tagline: 'Enterprise support & coding copilot prompts',
    description: 'Generate high-fidelity, boundary-enforced system prompts for support bots and coding copilots.',
    icon: MessageSquare,
    toolIds: [],
  },
  {
    id: 'ai-hallucination-scoring',
    title: 'Hallucination & Calibration Scorer',
    tagline: 'Citation verification & Brier calibration',
    description: 'Verify factual number/entity citations against source text and measure probability calibration error.',
    icon: Scale,
    toolIds: [],
  },
  {
    id: 'ai-vectordb-capacity',
    title: 'Vector DB Capacity & RAM Planner',
    tagline: 'Cluster pod sizers & DiskANN vs HNSW',
    description: 'Size vector database cluster nodes, RAM capacities, and evaluate SSD-backed DiskANN tradeoffs.',
    icon: Bot,
    toolIds: [],
  },
]

// Populate toolIds into subcategories by matching subject
for (const sub of AI_SUBCATEGORIES) {
  sub.toolIds = aiToolSpecs
    .filter((s) => s.subject.toLowerCase() === sub.title.toLowerCase())
    .map((s) => s.id)
}

export function findAiSubcategory(idOrTitle: string): AiSubcategory | undefined {
  const norm = idOrTitle.toLowerCase()
  return AI_SUBCATEGORIES.find((s) => s.id === norm || s.title.toLowerCase() === norm)
}

export const AI_TOTAL_TOOLS = aiToolSpecs.length

export const AI_TOOLS: Tool[] = aiToolSpecs.map((spec) => ({
  id: spec.id,
  name: spec.name,
  categoryId: AI_CATEGORY,
  category: AI_CATEGORY_NAME,
  description: spec.blurb,
  keywords: [
    'ai',
    'llm',
    'machine learning',
    'prompt',
    ...spec.name.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2),
  ],
  path: `/tools/ai-tools/${spec.id}`,
  icon: 'Cpu',
  subcategory: spec.subject,
}))
