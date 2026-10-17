import {
  asNum,
  asSel,
  asStr,
  docres,
  fmtNum,
  n,
  pctres,
  res,
  sel,
  txt,
  type AiToolSpec,
} from './aiSpec'

export const SUBJECT = 'Local Model VRAM & Quantization'

export const MOD03_SPECS: AiToolSpec[] = [
  {
    id: 'llm-vram-calculator',
    name: 'LLM VRAM Sizer & GPU Memory Allocator',
    subject: SUBJECT,
    blurb: 'Calculate exact GPU VRAM required to load and infer open-weight models (Llama 3, Mistral, Qwen, DeepSeek) across quantization levels.',
    tip: 'Add a 20% safety margin on top of raw weights to prevent out-of-memory (OOM) crashes during inference activation spikes.',
    usage: [
      'Select model parameter size (e.g. 7B, 14B, 70B, 405B).',
      'Select target quantization precision (FP16 down to Q2_K).',
      'Input context window length to account for KV cache.',
    ],
    method: [
      'Weight VRAM = (Parameters in Billions * Bits per Weight) / 8 GB.',
      'KV Cache VRAM = 2 * Layers * Heads * Dim * Precision * Context * Batch.',
      'Adds 1.5 GB OS/CUDA baseline runtime overhead.',
    ],
    fields: [
      sel('paramSize', 'Model Parameter Size', [
        '7 Billion (e.g. Llama 3 8B, Mistral 7B)',
        '14 Billion (e.g. Qwen 2.5 14B)',
        '32 Billion (e.g. Qwen 2.5 32B)',
        '70 Billion (e.g. Llama 3.1 70B)',
        '405 Billion (e.g. Llama 3.1 405B)',
      ]),
      sel('quant', 'Quantization Precision', [
        'Q4_K_M (4.5 bits) - Recommended Sweet Spot',
        'Q5_K_M (5.5 bits) - Near FP16 Quality',
        'Q8_0 (8.5 bits) - High Precision',
        'FP16 / BF16 (16.0 bits) - Unquantized Full Precision',
        'Q2_K (2.5 bits) - Extreme Compression',
      ]),
      n('contextLength', 'Target Context Length (tokens)', 8192, 2048, 131072, 1024),
    ],
    compute: (v) => {
      const paramStr = asSel(v, 'paramSize', '7 Billion (e.g. Llama 3 8B, Mistral 7B)')
      const quantStr = asSel(v, 'quant', 'Q4_K_M (4.5 bits) - Recommended Sweet Spot')
      const ctx = asNum(v, 'contextLength', 8192)

      let paramsB = 8
      if (paramStr.startsWith('14')) paramsB = 14
      else if (paramStr.startsWith('32')) paramsB = 32
      else if (paramStr.startsWith('70')) paramsB = 70
      else if (paramStr.startsWith('405')) paramsB = 405

      let bits = 4.5
      if (quantStr.startsWith('Q5')) bits = 5.5
      else if (quantStr.startsWith('Q8')) bits = 8.5
      else if (quantStr.startsWith('FP16')) bits = 16.0
      else if (quantStr.startsWith('Q2')) bits = 2.5

      const weightsGb = (paramsB * bits) / 8
      const kvCacheGb = (ctx / 8192) * (paramsB > 32 ? 4.0 : 1.5)
      const cudaOverhead = 1.2
      const totalVramGb = Math.round((weightsGb + kvCacheGb + cudaOverhead) * 10) / 10

      let recommendedGpu = 'RTX 4060 Ti 16GB / RTX 4070'
      if (totalVramGb > 80) recommendedGpu = '4x A100 80GB or 8x RTX 4090 24GB'
      else if (totalVramGb > 48) recommendedGpu = '2x RTX 4090 24GB or A6000 48GB'
      else if (totalVramGb > 24) recommendedGpu = '2x RTX 3090 / Mac Studio 64GB+'
      else if (totalVramGb > 16) recommendedGpu = 'RTX 3090 24GB / RTX 4090 24GB'

      return [
        res('Total VRAM Required', `${totalVramGb} GB VRAM`, totalVramGb > 24 ? 'warn' : 'good', 'Includes weights, KV cache & CUDA context'),
        res('Weights Size on Disk', `${weightsGb.toFixed(1)} GB`, 'neutral'),
        res('KV Cache at ' + fmtNum(ctx) + ' ctx', `${kvCacheGb.toFixed(1)} GB`, 'neutral'),
        res('Recommended Hardware', recommendedGpu, 'good'),
        pctres('Consumer GPU Fit (24GB)', `${Math.min(100, Math.round((totalVramGb / 24) * 100))}% of 24GB`, Math.round((totalVramGb / 24) * 100), totalVramGb <= 24 ? 'good' : 'warn'),
      ]
    },
  },
  {
    id: 'kv-cache-vram-sizer',
    name: 'KV Cache Memory & Batch Sizing Calculator',
    subject: SUBJECT,
    blurb: 'Calculate the dynamic RAM/VRAM footprint of Key-Value attention caches across concurrent user streams.',
    tip: 'Enabling FlashAttention or FP8 KV cache halves memory consumption without noticeable perplexity loss.',
    usage: [
      'Input concurrent user streams (batch size).',
      'Select model architecture and max context.',
      'Choose KV cache precision (FP16 vs FP8 vs Q4).',
    ],
    method: [
      'Formula: 2 * num_layers * num_kv_heads * head_dim * precision_bytes * seq_len * batch_size.',
    ],
    fields: [
      n('layers', 'Transformer Layers', 32, 16, 128),
      n('kvHeads', 'KV Heads (GQA)', 8, 1, 64),
      n('headDim', 'Head Dimension', 128, 64, 256),
      n('seqLen', 'Context Sequence Length', 8192, 1024, 131072, 1024),
      n('batchSize', 'Concurrent Requests (Batch Size)', 4, 1, 128),
      sel('precision', 'KV Cache Precision', ['FP16 (2 bytes)', 'FP8 (1 byte)', 'Q4 (0.5 byte)']),
    ],
    compute: (v) => {
      const layers = asNum(v, 'layers', 32)
      const heads = asNum(v, 'kvHeads', 8)
      const dim = asNum(v, 'headDim', 128)
      const seq = asNum(v, 'seqLen', 8192)
      const batch = asNum(v, 'batchSize', 4)
      const precStr = asSel(v, 'precision', 'FP16 (2 bytes)')

      let bytesPerVal = 2.0
      if (precStr.startsWith('FP8')) bytesPerVal = 1.0
      else if (precStr.startsWith('Q4')) bytesPerVal = 0.5

      const totalBytes = 2 * layers * heads * dim * bytesPerVal * seq * batch
      const totalMb = Math.round(totalBytes / (1024 * 1024))
      const totalGb = totalMb / 1024

      return [
        res('KV Cache VRAM Footprint', totalGb >= 1.0 ? `${totalGb.toFixed(2)} GB` : `${totalMb} MB`, totalGb > 16 ? 'warn' : 'good'),
        res('Per-Stream Cache Memory', `${(totalMb / batch).toFixed(0)} MB / stream`, 'neutral'),
        res('KV Heads Architecture', heads < 16 ? 'Grouped-Query Attention (GQA)' : 'Multi-Head Attention (MHA)', 'good'),
        pctres('Memory Efficiency', precStr.startsWith('FP8') ? 'High (FP8)' : precStr.startsWith('Q4') ? 'Ultra (Q4)' : 'Standard (FP16)', precStr.startsWith('FP16') ? 50 : 90, 'good'),
      ]
    },
  },
  {
    id: 'offloading-cpu-gpu-layer-allocator',
    name: 'GPU/CPU Layer Offloading Split Planner',
    subject: SUBJECT,
    blurb: 'Calculate the exact number of layers to offload to GPU VRAM vs system RAM for partial hardware acceleration.',
    tip: 'Even offloading 70% of layers to GPU yields a 4x to 8x speedup over pure CPU inference.',
    usage: [
      'Enter available GPU VRAM and system RAM.',
      'Input model parameter size and total layers.',
      'Get exact layer count to set in Ollama / llama.cpp (`--n-gpu-layers`).',
    ],
    method: [
      'Calculates per-layer memory budget = (Model Size / Total Layers).',
      'Allocates maximum integer layers into GPU headroom after CUDA/OS deductions.',
    ],
    fields: [
      n('gpuVram', 'Dedicated GPU VRAM (GB)', 12, 4, 96),
      n('totalLayers', 'Total Model Layers', 32, 16, 80),
      n('modelWeightGb', 'Quantized Model File Size (GB)', 18, 2, 200),
      n('contextGb', 'KV Cache Allocation (GB)', 2.0, 0.5, 32),
    ],
    compute: (v) => {
      const vram = asNum(v, 'gpuVram', 12)
      const layers = asNum(v, 'totalLayers', 32)
      const weightGb = asNum(v, 'modelWeightGb', 18)
      const ctxGb = asNum(v, 'contextGb', 2.0)

      const layerWeightGb = weightGb / layers
      const availableGpuForLayers = Math.max(0, vram - ctxGb - 1.2)
      const gpuLayers = Math.min(layers, Math.floor(availableGpuForLayers / layerWeightGb))
      const cpuLayers = layers - gpuLayers
      const offloadPct = Math.round((gpuLayers / layers) * 100)

      return [
        res('GPU Layers to Offload (-ngl)', `${gpuLayers} / ${layers} layers`, 'good', 'Set in llama.cpp or Ollama'),
        res('CPU Fallback Layers', `${cpuLayers} layers`, cpuLayers > 0 ? 'warn' : 'good', cpuLayers > 0 ? 'Partial CPU offload' : '100% Full GPU acceleration'),
        pctres('Acceleration Ratio', `${offloadPct}% on GPU`, offloadPct, offloadPct >= 100 ? 'good' : 'warn'),
        res('GPU Memory Ingestion', `${(gpuLayers * layerWeightGb + ctxGb + 1.2).toFixed(1)} GB / ${vram} GB`, 'neutral'),
      ]
    },
  },
  {
    id: 'ollama-modelfile-generator',
    name: 'Ollama Modelfile Builder & Parameter Tuner',
    subject: SUBJECT,
    blurb: 'Generate custom Ollama Modelfile syntax with system prompts, temperature, context length, and stop tokens.',
    tip: 'Setting `PARAMETER num_ctx` is required; otherwise Ollama defaults to a cramped 2,048 tokens.',
    usage: [
      'Select base model name (e.g. llama3.1, mistral, qwen2.5).',
      'Set context window, temperature, and top_p.',
      'Copy the production Modelfile configuration.',
    ],
    method: [
      'Outputs official Ollama Modelfile specification syntax with validated parameters.',
    ],
    fields: [
      sel('baseModel', 'Base Model', ['llama3.1:8b', 'qwen2.5:14b', 'mistral-nemo:12b', 'deepseek-coder-v2:16b']),
      n('numCtx', 'Context Window (num_ctx)', 16384, 2048, 131072, 1024),
      n('temp', 'Temperature', 0.7, 0.0, 2.0, 0.05),
      n('topP', 'Top-P', 0.9, 0.1, 1.0, 0.05),
      txt('system', 'System Instructions', 'You are an expert systems software engineer specializing in Rust and WebAssembly.'),
    ],
    compute: (v) => {
      const base = asSel(v, 'baseModel', 'llama3.1:8b')
      const ctx = asNum(v, 'numCtx', 16384)
      const temp = asNum(v, 'temp', 0.7)
      const topP = asNum(v, 'topP', 0.9)
      const sys = asStr(v, 'system', '')

      const modelfile = `FROM ${base}\n\n` +
        `# Runtime Parameters\n` +
        `PARAMETER num_ctx ${ctx}\n` +
        `PARAMETER temperature ${temp}\n` +
        `PARAMETER top_p ${topP}\n` +
        `PARAMETER stop "<|im_end|>"\n` +
        `PARAMETER stop "<|eot_id|>"\n\n` +
        `# System Directive\n` +
        `SYSTEM """\n${sys}\n"""`

      return [
        res('Base Model', base, 'good'),
        res('Configured Context', `${fmtNum(ctx)} tokens`, ctx > 8192 ? 'good' : 'warn'),
        res('Temperature / Top-P', `${temp} / ${topP}`, 'neutral'),
        docres('Generated Modelfile', modelfile),
      ]
    },
  },
]
