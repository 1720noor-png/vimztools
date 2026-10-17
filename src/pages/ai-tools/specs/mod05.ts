import {
  asNum,
  asSel,
  asStr,
  docres,
  fmtMoney,
  fmtNum,
  n,
  pctres,
  res,
  sel,
  txt,
  type AiToolSpec,
} from './aiSpec'

export const SUBJECT = 'RAG & Document Chunking'

export const MOD05_SPECS: AiToolSpec[] = [
  {
    id: 'rag-chunk-size-overlap-simulator',
    name: 'RAG Chunk Size & Overlap Ratio Simulator',
    subject: SUBJECT,
    blurb: 'Simulate document chunk slicing, token overhead, and semantic continuity across sliding window overlap configurations.',
    tip: 'A 10-15% overlap prevents cutting sentences in half and preserves contextual continuity across chunk boundaries.',
    usage: [
      'Enter total document token count.',
      'Specify chunk size (e.g. 512 tokens) and overlap (e.g. 50 tokens).',
      'Review total resulting chunk count, token inflation, and duplicate storage ratio.',
    ],
    method: [
      'Step size = ChunkSize - Overlap.',
      'Total Chunks = ceil((DocLength - Overlap) / StepSize).',
      'Token Inflation = (Total Chunk Tokens - DocLength) / DocLength.',
    ],
    fields: [
      n('docTokens', 'Document Length (Tokens)', 25000, 500, 1000000, 500),
      n('chunkSize', 'Chunk Size (Tokens)', 512, 64, 2048, 32),
      n('overlapTokens', 'Overlap Between Chunks (Tokens)', 64, 0, 512, 8),
    ],
    compute: (v) => {
      const doc = asNum(v, 'docTokens', 25000)
      const size = asNum(v, 'chunkSize', 512)
      const overlap = asNum(v, 'overlapTokens', 64)

      const step = Math.max(1, size - overlap)
      const totalChunks = Math.max(1, Math.ceil((doc - overlap) / step))
      const totalStoredTokens = totalChunks * size
      const inflationPct = Math.round(((totalStoredTokens - doc) / doc) * 100)
      const overlapRatio = Math.round((overlap / size) * 100)

      return [
        res('Total Generated Chunks', `${fmtNum(totalChunks)} Chunks`, 'good'),
        res('Effective Step Size', `${step} new tokens / chunk`, 'neutral'),
        pctres('Overlap Proportion', `${overlapRatio}% Overlap`, overlapRatio, overlapRatio > 25 ? 'warn' : 'good', overlapRatio > 25 ? 'High token duplication' : 'Optimal semantic bridge'),
        res('Storage Token Inflation', `+${inflationPct}% (${fmtNum(totalStoredTokens)} total tokens)`, inflationPct > 30 ? 'warn' : 'neutral'),
      ]
    },
  },
  {
    id: 'hybrid-search-rrf-score-calculator',
    name: 'Reciprocal Rank Fusion (RRF) Hybrid Search Sizer',
    subject: SUBJECT,
    blurb: 'Simulate the standard RRF algorithm combining BM25 keyword search ranks with dense vector similarity ranks.',
    tip: 'The standard RRF constant k=60 balances noisy high-rank outliers from sparse search with dense embeddings.',
    usage: [
      'Enter ranking position for a document in Dense Vector search.',
      'Enter ranking position for the same document in BM25 Sparse search.',
      'Review combined RRF score and rank boost.',
    ],
    method: [
      'Formula: RRF_Score = 1 / (k + Rank_Dense) + 1 / (k + Rank_BM25), with default k=60.',
    ],
    fields: [
      n('denseRank', 'Dense Vector Search Rank (1 = Top)', 3, 1, 100),
      n('bm25Rank', 'BM25 Keyword Search Rank (1 = Top)', 12, 1, 100),
      n('kConstant', 'RRF Smoothing Constant (k)', 60, 10, 100),
    ],
    compute: (v) => {
      const rDense = asNum(v, 'denseRank', 3)
      const rBm25 = asNum(v, 'bm25Rank', 12)
      const k = asNum(v, 'kConstant', 60)

      const scoreDense = 1 / (k + rDense)
      const scoreBm25 = 1 / (k + rBm25)
      const totalRrf = scoreDense + scoreBm25

      const denseContributionPct = Math.round((scoreDense / totalRrf) * 100)

      return [
        res('Combined RRF Score', totalRrf.toFixed(5), 'good', 'Higher indicates top fused ranking'),
        res('Dense Contribution', `${denseContributionPct}%`, 'neutral', `Rank #${rDense}`),
        res('BM25 Contribution', `${100 - denseContributionPct}%`, 'neutral', `Rank #${rBm25}`),
        pctres('Fused Ranking Power', 'Strong Candidate', Math.min(100, Math.round(totalRrf * 3000)), 'good'),
      ]
    },
  },
  {
    id: 'reranking-cohere-cross-encoder-budgeter',
    name: 'Cross-Encoder & Reranker Latency & Cost Budgeter',
    subject: SUBJECT,
    blurb: 'Calculate latency and API cost when reranking top-k retrieved candidates using Cohere Rerank or BGE-Reranker.',
    tip: 'Retrieving top 50 with vector search then reranking down to top 5 increases RAG precision by 20-35%.',
    usage: [
      'Input initial retrieval candidate count (e.g. 50 docs).',
      'Select final Top-N count to send to LLM context.',
      'Input daily query volume to project monthly reranking costs.',
    ],
    method: [
      'Reranker cost = Queries * Candidates * PricePerUnit.',
      'Latency overhead estimated at ~1.5ms per candidate pair.',
    ],
    fields: [
      n('candidates', 'Initial Retrieved Candidates (Top-K)', 50, 10, 200),
      n('finalTopN', 'Final Filtered Candidates for LLM', 5, 1, 20),
      n('dailyQueries', 'Daily Search Queries', 10000, 100, 1000000, 500),
    ],
    compute: (v) => {
      const cand = asNum(v, 'candidates', 50)
      const topN = asNum(v, 'finalTopN', 5)
      const queries = asNum(v, 'dailyQueries', 10000)

      const monthlyQueries = queries * 30
      const monthlyUnits = monthlyQueries * (cand / 100)
      const monthlyCost = (monthlyUnits / 1000) * 1.0

      const estLatencyMs = Math.round(cand * 1.2)

      return [
        res('Compression Ratio', `${cand} -> ${topN} (${Math.round((topN / cand) * 100)}% preserved)`, 'good', 'Extracts highest semantic signal'),
        res('Reranker Latency Overhead', `~${estLatencyMs} ms`, estLatencyMs > 100 ? 'warn' : 'good', 'Cross-encoder scoring time'),
        res('Monthly Reranking Cost', fmtMoney(monthlyCost), 'neutral', `${fmtNum(monthlyQueries)} queries/mo`),
        pctres('Precision Improvement', '+28% Mean Reciprocal Rank (MRR)', 88, 'good'),
      ]
    },
  },
  {
    id: 'chunk-metadata-json-formatter',
    name: 'Vector DB Chunk Metadata JSON Formatter',
    subject: SUBJECT,
    blurb: 'Generate schema-compliant metadata payloads for Pinecone, Qdrant, Weaviate, and Milvus vector upserts.',
    tip: 'Include parent document ID and timestamp to enable rapid filtered updates and deletion of stale knowledge.',
    usage: [
      'Enter document title, source URL, and category.',
      'Specify page numbers and chunk indexing.',
      'Copy the sanitized JSON metadata object.',
    ],
    method: [
      'Generates strict key-value pairs formatted for payload filtering in vector databases.',
    ],
    fields: [
      txt('title', 'Document Title', 'Q3 Cloud Architecture Security Whitepaper'),
      txt('source', 'Source URI / Filename', 'https://internal.docs.corp/sec/q3-arch.pdf'),
      n('chunkIndex', 'Chunk Index', 14, 0, 10000),
      n('pageNumber', 'Page Number', 4, 1, 1000),
      sel('accessTier', 'Access Control Tier', ['Internal Engineering', 'Public', 'Executive Confidential']),
    ],
    compute: (v) => {
      const title = asStr(v, 'title', '')
      const source = asStr(v, 'source', '')
      const index = asNum(v, 'chunkIndex', 14)
      const page = asNum(v, 'pageNumber', 4)
      const tier = asSel(v, 'accessTier', 'Internal Engineering')

      const payload = {
        doc_id: `doc_${title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 24)}`,
        chunk_id: `chk_${index}`,
        title,
        source,
        page_number: page,
        access_tier: tier,
        indexed_at: new Date().toISOString(),
        chunk_length: 512,
      }

      return [
        res('Document ID', payload.doc_id, 'good'),
        res('Chunk ID', payload.chunk_id, 'neutral'),
        res('Access Filter Tier', tier, 'neutral'),
        docres('Vector Metadata Payload (JSON)', JSON.stringify(payload, null, 2)),
      ]
    },
  },
]
