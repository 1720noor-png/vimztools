import {
  asNum,
  asSel,
  fmtMoney,
  n,
  pctres,
  res,
  sel,
  type AiToolSpec,
} from './aiSpec'

export const SUBJECT = 'Vector DB Capacity & RAM Planner'

export const MOD20_SPECS: AiToolSpec[] = [
  {
    id: 'vectordb-pod-capacity-planner',
    name: 'Vector Database Pod & Cluster Sizing Planner',
    subject: SUBJECT,
    blurb: 'Calculate required cluster nodes, CPU cores, and RAM for production vector deployments (Pinecone, Qdrant, Milvus, Weaviate).',
    tip: 'Ensure at least 25% RAM buffer above raw vector + HNSW graph footprint to prevent Linux OOM-killer evictions.',
    usage: [
      'Enter total vector record count (e.g. 2,000,000).',
      'Select embedding dimensions (768, 1536, 3072).',
      'Input target concurrent queries per second (QPS).',
    ],
    method: [
      'RAM = Vectors * (Dims * 4 + M * 8 + MetadataBytes) * 1.35.',
      'Nodes = ceil(TotalRAM / NodeRAM).',
    ],
    fields: [
      n('vectors', 'Total Vectors to Host', 2000000, 10000, 100000000, 100000),
      sel('dims', 'Embedding Dimensions', ['1536 (OpenAI / standard)', '768 (BGE / Nomic)', '3072 (Large embeddings)', '384 (Light embeddings)']),
      n('qpsTarget', 'Target Search QPS', 150, 10, 5000, 25),
      sel('podRam', 'Node / Pod RAM Size', ['32 GB RAM per Node', '64 GB RAM per Node', '128 GB RAM per Node']),
    ],
    compute: (v) => {
      const count = asNum(v, 'vectors', 2000000)
      const dimStr = asSel(v, 'dims', '1536 (OpenAI / standard)')
      const qps = asNum(v, 'qpsTarget', 150)
      const podStr = asSel(v, 'podRam', '32 GB RAM per Node')

      let dims = 1536
      if (dimStr.startsWith('768')) dims = 768
      else if (dimStr.startsWith('3072')) dims = 3072
      else if (dimStr.startsWith('384')) dims = 384

      let nodeRamGb = 32
      if (podStr.startsWith('64')) nodeRamGb = 64
      else if (podStr.startsWith('128')) nodeRamGb = 128

      const rawBytes = count * (dims * 4 + 128) // Vector + metadata
      const hnswBytes = rawBytes * 1.5
      const totalRamBytes = hnswBytes * 1.25 // 25% buffer
      const totalRamGb = Math.ceil(totalRamBytes / (1024 * 1024 * 1024))

      const nodesNeeded = Math.max(1, Math.ceil(totalRamGb / (nodeRamGb * 0.85)))
      const estMonthlyCost = nodesNeeded * (nodeRamGb === 32 ? 140 : nodeRamGb === 64 ? 260 : 490)

      return [
        res('Total Cluster RAM Required', `${totalRamGb} GB RAM`, totalRamGb > 64 ? 'warn' : 'good', 'Includes HNSW index & OS buffer'),
        res('Recommended Nodes / Pods', `${nodesNeeded}x ${nodeRamGb}GB Nodes`, 'good', 'Provides high-availability redundancy'),
        res('Estimated Infrastructure Cost', `${fmtMoney(estMonthlyCost)} / month`, 'neutral'),
        pctres('QPS Sizing Capacity', `${qps} QPS Target`, Math.min(100, Math.round((qps / (nodesNeeded * 100)) * 100)), 'good', `Supported across ${nodesNeeded} replica nodes`),
      ]
    },
  },
  {
    id: 'disk-ann-vs-hnsw-memory-tradeoff-sizer',
    name: 'DiskANN vs HNSW Memory & Performance Tradeoff Sizer',
    subject: SUBJECT,
    blurb: 'Compare SSD-backed DiskANN vs pure in-memory HNSW vector indexes: evaluate 80% RAM savings vs 2ms search latency tradeoff.',
    tip: 'DiskANN keeps only the compressed graph in RAM while fetching vectors from NVMe SSD, saving thousands in cloud RAM fees.',
    usage: [
      'Enter total vectors (e.g. 5,000,000).',
      'Select dimension (1536 or 768).',
      'Compare in-memory RAM cost vs NVMe SSD hosting costs.',
    ],
    method: [
      'HNSW: 100% vectors + graph in RAM (~2.2KB / vector).',
      'DiskANN: ~256 bytes in RAM per vector; remainder streamed from NVMe SSD.',
    ],
    fields: [
      n('vectors', 'Total Vectors', 5000000, 100000, 100000000, 500000),
      sel('dims', 'Vector Dimensions', ['1536 Dimensions', '768 Dimensions']),
    ],
    compute: (v) => {
      const count = asNum(v, 'vectors', 5000000)
      const dimStr = asSel(v, 'dims', '1536 Dimensions')
      const dims = dimStr.startsWith('768') ? 768 : 1536

      const bytesPerVec = dims * 4
      const hnswRamGb = Math.round(((count * (bytesPerVec * 1.6)) / (1024 * 1024 * 1024)) * 10) / 10
      const diskAnnRamGb = Math.round(((count * 256) / (1024 * 1024 * 1024)) * 10) / 10
      const diskAnnSsdGb = Math.round(((count * bytesPerVec) / (1024 * 1024 * 1024)) * 10) / 10

      const ramSavingsPct = Math.round(((hnswRamGb - diskAnnRamGb) / hnswRamGb) * 100)

      return [
        res('HNSW In-Memory RAM', `${hnswRamGb} GB RAM`, 'warn', 'Sub-millisecond query latency (~1ms)'),
        res('DiskANN RAM Requirement', `${diskAnnRamGb} GB RAM`, 'good', 'Plus ' + diskAnnSsdGb + ' GB NVMe SSD storage'),
        pctres('RAM Cost Reduction', `${ramSavingsPct}% RAM Savings`, ramSavingsPct, 'good', 'Massive infrastructure cost reduction'),
        res('Latency Tradeoff', 'HNSW: ~1.2ms vs DiskANN: ~3.5ms', 'neutral', 'Negligible impact for LLM RAG pipelines'),
      ]
    },
  },
]
