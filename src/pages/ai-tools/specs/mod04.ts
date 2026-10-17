import {
  asNum,
  asSel,
  asStr,
  fmtBytes,
  fmtMoney,
  fmtNum,
  n,
  pctres,
  res,
  sel,
  txt,
  type AiToolSpec,
} from './aiSpec'

export const SUBJECT = 'Embedding & Vector Space Math'

export const MOD04_SPECS: AiToolSpec[] = [
  {
    id: 'cosine-similarity-vector-calculator',
    name: 'Vector Cosine Similarity & Distance Calculator',
    subject: SUBJECT,
    blurb: 'Compute exact Dot Product, Euclidean Distance, and Cosine Similarity between two comma-separated dense embedding vectors.',
    tip: 'Normalized vectors (length 1.0) allow Cosine Similarity to equal the Dot Product, which accelerates search by 3x.',
    usage: [
      'Enter Vector A as comma-separated floating point numbers.',
      'Enter Vector B with matching dimensionality.',
      'Inspect Cosine Similarity (-1 to +1) and Euclidean distance.',
    ],
    method: [
      'Cosine = (A · B) / (||A|| * ||B||).',
      'Euclidean = sqrt(sum((A_i - B_i)^2)).',
      'Dot Product = sum(A_i * B_i).',
    ],
    fields: [
      txt('vecA', 'Vector A (comma-separated)', '0.24, 0.81, -0.45, 0.12, 0.93, -0.05, 0.62, 0.33'),
      txt('vecB', 'Vector B (comma-separated)', '0.21, 0.79, -0.40, 0.15, 0.88, -0.02, 0.59, 0.38'),
    ],
    compute: (v) => {
      const aRaw = asStr(v, 'vecA', '').split(/,|\s+/).map(Number).filter((n) => !isNaN(n))
      const bRaw = asStr(v, 'vecB', '').split(/,|\s+/).map(Number).filter((n) => !isNaN(n))

      if (aRaw.length === 0 || bRaw.length === 0 || aRaw.length !== bRaw.length) {
        return [
          res('Validation Status', 'Mismatched Dimensions', 'bad', `Vector A: ${aRaw.length} dims, Vector B: ${bRaw.length} dims. Dimensions must match!`),
        ]
      }

      let dot = 0
      let normA = 0
      let normB = 0
      let sqDiffSum = 0

      for (let i = 0; i < aRaw.length; i++) {
        dot += aRaw[i] * bRaw[i]
        normA += aRaw[i] * aRaw[i]
        normB += bRaw[i] * bRaw[i]
        sqDiffSum += Math.pow(aRaw[i] - bRaw[i], 2)
      }

      normA = Math.sqrt(normA)
      normB = Math.sqrt(normB)
      const euclidean = Math.sqrt(sqDiffSum)
      const cosine = normA > 0 && normB > 0 ? dot / (normA * normB) : 0
      const cosinePct = Math.max(0, Math.min(100, Math.round(((cosine + 1) / 2) * 100)))

      const similarityRating = cosine >= 0.85 ? 'High Semantic Match' : cosine >= 0.6 ? 'Moderate Relevance' : 'Low Semantic Overlap'
      const tone = cosine >= 0.85 ? 'good' : cosine >= 0.6 ? 'neutral' : 'warn'

      return [
        pctres('Cosine Similarity', `${cosine.toFixed(4)} (${cosinePct}%)`, cosinePct, tone, similarityRating),
        res('Dot Product (A · B)', dot.toFixed(4), 'neutral'),
        res('Euclidean Distance', euclidean.toFixed(4), 'neutral', 'L2 distance'),
        res('Vector Dimensionality', `${aRaw.length} Dimensions`, 'good'),
      ]
    },
  },
  {
    id: 'embedding-dimensionality-cost-sizer',
    name: 'Vector Database Storage & RAM Sizer',
    subject: SUBJECT,
    blurb: 'Calculate raw storage and memory requirements for storing millions of embedding vectors across popular dimensions (384 to 3072).',
    tip: 'In-memory vector indexes (like HNSW) require 1.5x to 2x more RAM than the raw vector size on disk.',
    usage: [
      'Input total number of document / chunk vectors.',
      'Select embedding model dimension (e.g. OpenAI 1536, Cohere 1024, BGE-Small 384).',
      'Select vector data type (FP32, FP16, INT8).',
    ],
    method: [
      'Formula: Vectors * Dimensions * BytesPerValue.',
      'Includes HNSW graph overhead (~1.5x multiplier).',
    ],
    fields: [
      n('vectorCount', 'Total Number of Vectors', 500000, 1000, 100000000, 10000),
      sel('dims', 'Embedding Dimensions', [
        '1536 (OpenAI text-embedding-3-small / ada-002)',
        '3072 (OpenAI text-embedding-3-large)',
        '768 (BGE-Base, Nomic Embed, Google Gecko)',
        '384 (MiniLM-L6, BGE-Small - Ultra Fast)',
        '1024 (Cohere Embed v3, BGE-Large)',
      ]),
      sel('dtype', 'Vector Precision Data Type', [
        'Float32 (4 bytes / dim) - Standard Uncompressed',
        'Float16 (2 bytes / dim) - Half Precision',
        'Int8 (1 byte / dim) - Scalar Quantized',
      ]),
    ],
    compute: (v) => {
      const count = asNum(v, 'vectorCount', 500000)
      const dimStr = asSel(v, 'dims', '1536 (OpenAI text-embedding-3-small / ada-002)')
      const dtypeStr = asSel(v, 'dtype', 'Float32 (4 bytes / dim) - Standard Uncompressed')

      let dims = 1536
      if (dimStr.startsWith('3072')) dims = 3072
      else if (dimStr.startsWith('768')) dims = 768
      else if (dimStr.startsWith('384')) dims = 384
      else if (dimStr.startsWith('1024')) dims = 1024

      let bytesPerDim = 4
      if (dtypeStr.startsWith('Float16')) bytesPerDim = 2
      else if (dtypeStr.startsWith('Int8')) bytesPerDim = 1

      const rawBytes = count * dims * bytesPerDim
      const hnsRamBytes = rawBytes * 1.6

      return [
        res('Raw Vectors Size', fmtBytes(rawBytes), 'good', `${fmtNum(count)} vectors @ ${dims} dims`),
        res('RAM with HNSW Index', fmtBytes(hnsRamBytes), hnsRamBytes > 32 * 1024 * 1024 * 1024 ? 'warn' : 'good', 'Includes graph edges & neighbor lists'),
        res('Single Vector Footprint', `${fmtBytes(dims * bytesPerDim)} / vector`, 'neutral'),
        pctres('Storage Optimization', dtypeStr.startsWith('Int8') ? '75% Savings (Int8)' : dtypeStr.startsWith('Float16') ? '50% Savings (Float16)' : 'Baseline (Float32)', dtypeStr.startsWith('Int8') ? 75 : dtypeStr.startsWith('Float16') ? 50 : 25, 'good'),
      ]
    },
  },
  {
    id: 'matryoshka-truncation-loss-estimator',
    name: 'Matryoshka Embedding Truncation & Cost Optimizer',
    subject: SUBJECT,
    blurb: 'Estimate storage savings and benchmark accuracy retention when truncating Matryoshka representations (e.g. 1536 -> 512 dims).',
    tip: 'Matryoshka models retain over 98% of semantic retrieval accuracy even after truncating 66% of trailing dimensions.',
    usage: [
      'Select full vector dimension (1536 or 3072).',
      'Select truncated target dimension (256, 512, 1024).',
      'Review memory savings vs semantic retention curve.',
    ],
    method: [
      'Empirical MTEB benchmark retention curves for OpenAI text-embedding-3 and Nomic Matryoshka models.',
    ],
    fields: [
      sel('fullDim', 'Original Full Dimension', ['1536 (text-embedding-3-small)', '3072 (text-embedding-3-large)']),
      sel('truncDim', 'Truncated Target Dimension', ['512 Dimensions (Recommended)', '256 Dimensions (Ultra Light)', '1024 Dimensions (High Precision)']),
    ],
    compute: (v) => {
      const fullStr = asSel(v, 'fullDim', '1536 (text-embedding-3-small)')
      const truncStr = asSel(v, 'truncDim', '512 Dimensions (Recommended)')

      const full = fullStr.startsWith('3072') ? 3072 : 1536
      let trunc = 512
      if (truncStr.startsWith('256')) trunc = 256
      else if (truncStr.startsWith('1024')) trunc = 1024

      const savingsPct = Math.round(((full - trunc) / full) * 100)
      let accuracyRetention = 98.5
      if (trunc === 256) accuracyRetention = 96.2
      else if (trunc === 1024) accuracyRetention = 99.4

      return [
        res('Storage & RAM Savings', `${savingsPct}% Reduction`, 'good', `${full} dims -> ${trunc} dims`),
        pctres('Semantic Accuracy Retention', `${accuracyRetention}% MTEB Score`, accuracyRetention, 'good', 'Near zero loss in search quality'),
        res('Search Speedup', `${(full / trunc).toFixed(1)}x Faster Dot Products`, 'good'),
      ]
    },
  },
  {
    id: 'embedding-batch-api-cost-estimator',
    name: 'Document Corpus Embedding API Cost Estimator',
    subject: SUBJECT,
    blurb: 'Calculate total API cost and generation duration when embedding knowledge bases, document repositories, or codebases.',
    tip: 'Batch requests of 500-2000 chunks reduce HTTP roundtrip latency by up to 80%.',
    usage: [
      'Enter total document word count or chunk count.',
      'Select embedding model provider and pricing tier.',
      'Get total batch cost, token volume, and estimated embed duration.',
    ],
    method: [
      'Calculates total tokens based on content density.',
      'Multiplies by official API rate card per million tokens.',
    ],
    fields: [
      n('totalChunks', 'Total Document Chunks', 100000, 100, 10000000, 1000),
      n('avgChunkTokens', 'Average Tokens per Chunk', 400, 50, 2000),
      sel('provider', 'Embedding Provider & Model', [
        'OpenAI text-embedding-3-small ($0.02 / 1M tokens)',
        'OpenAI text-embedding-3-large ($0.13 / 1M tokens)',
        'Cohere Embed v3 ($0.10 / 1M tokens)',
        'Voyage AI voyage-3 ($0.12 / 1M tokens)',
      ]),
    ],
    compute: (v) => {
      const chunks = asNum(v, 'totalChunks', 100000)
      const avgTokens = asNum(v, 'avgChunkTokens', 400)
      const provider = asSel(v, 'provider', 'OpenAI text-embedding-3-small ($0.02 / 1M tokens)')

      let ratePerMillion = 0.02
      if (provider.includes('3-large')) ratePerMillion = 0.13
      else if (provider.includes('Cohere')) ratePerMillion = 0.10
      else if (provider.includes('Voyage')) ratePerMillion = 0.12

      const totalTokens = chunks * avgTokens
      const totalCost = (totalTokens / 1_000_000) * ratePerMillion
      const estMinutes = Math.ceil(totalTokens / 200000)

      return [
        res('Total Tokens to Embed', `${fmtNum(totalTokens)} tokens`, 'neutral'),
        res('Estimated API Cost', fmtMoney(totalCost, 2), 'good'),
        res('Estimated Duration (Batched)', `${estMinutes} minutes`, 'neutral', 'Assuming ~200k tokens/min throughput'),
        pctres('Cost Efficiency', totalCost < 10 ? 'Negligible Cost' : 'Moderate', totalCost < 10 ? 95 : 70, 'good'),
      ]
    },
  },
]
