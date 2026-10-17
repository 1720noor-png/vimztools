import {
  asNum,
  asSel,
  n,
  pctres,
  res,
  sel,
  type AiToolSpec,
} from './aiSpec'

export const SUBJECT = 'LoRA & Parameter-Efficient Tuning'

export const MOD14_SPECS: AiToolSpec[] = [
  {
    id: 'lora-rank-alpha-trainable-params-calculator',
    name: 'LoRA Rank, Alpha & Trainable Parameters Calculator',
    subject: SUBJECT,
    blurb: 'Calculate trainable parameter counts and percentage of frozen weights across LoRA ranks (r) and target linear projection layers.',
    tip: 'Rule of thumb: Set lora_alpha equal to 2x lora_rank (e.g. rank=16, alpha=32) for stable gradient scaling.',
    usage: [
      'Select base model parameter count (7B, 14B, 70B).',
      'Select LoRA Rank (r = 4, 8, 16, 32, 64).',
      'Select target modules (Attention only vs All Linear).',
    ],
    method: [
      'LoRA Trainable Params = 2 * r * d_model * NumTargetMatrices * NumLayers.',
      'Trainable % = (LoRA Params / Total Base Params) * 100.',
    ],
    fields: [
      sel('baseParams', 'Base Model Parameters', [
        '8 Billion (Llama 3 8B, d_model=4096, 32 layers)',
        '14 Billion (Qwen 2.5 14B, d_model=5120, 48 layers)',
        '70 Billion (Llama 3 70B, d_model=8192, 80 layers)',
      ]),
      sel('loraRank', 'LoRA Rank (r)', ['r = 16 (Recommended)', 'r = 8 (Lightweight)', 'r = 32 (Complex Tasks)', 'r = 64 (Dense Code / Math)']),
      sel('targets', 'Target Modules', [
        'All Linear (q, k, v, o, gate, up, down - 7 matrices)',
        'Attention Only (q, v - 2 matrices)',
        'All Attention (q, k, v, o - 4 matrices)',
      ]),
    ],
    compute: (v) => {
      const baseStr = asSel(v, 'baseParams', '8 Billion (Llama 3 8B, d_model=4096, 32 layers)')
      const rankStr = asSel(v, 'loraRank', 'r = 16 (Recommended)')
      const targetStr = asSel(v, 'targets', 'All Linear (q, k, v, o, gate, up, down - 7 matrices)')

      let totalBaseB = 8.0
      let dModel = 4096
      let layers = 32

      if (baseStr.startsWith('14')) {
        totalBaseB = 14.0
        dModel = 5120
        layers = 48
      } else if (baseStr.startsWith('70')) {
        totalBaseB = 70.0
        dModel = 8192
        layers = 80
      }

      let r = 16
      if (rankStr.startsWith('r = 8')) r = 8
      else if (rankStr.startsWith('r = 32')) r = 32
      else if (rankStr.startsWith('r = 64')) r = 64

      let numMatrices = 7
      if (targetStr.startsWith('Attention Only')) numMatrices = 2
      else if (targetStr.startsWith('All Attention')) numMatrices = 4

      // Params = 2 * r * dModel * matrices * layers
      const trainableParams = 2 * r * dModel * numMatrices * layers
      const trainableMillion = trainableParams / 1_000_000
      const trainablePct = (trainableParams / (totalBaseB * 1_000_000_000)) * 100
      const adapterFileMb = Math.round((trainableParams * 2) / (1024 * 1024))

      return [
        res('Trainable Parameters', `${trainableMillion.toFixed(2)} Million`, 'good', `Out of ${totalBaseB}B total parameters`),
        pctres('Trainable Weight Ratio', `${trainablePct.toFixed(3)}% of Model`, Math.min(100, trainablePct * 20), 'good', 'Frozen base model preserves foundation knowledge'),
        res('LoRA Alpha Recommendation', `alpha = ${r * 2}`, 'good', 'Recommended 2:1 ratio to rank'),
        res('Adapter File Size (FP16)', `${adapterFileMb} MB`, 'good', 'Compact checkpoint size'),
      ]
    },
  },
  {
    id: 'qlora-vram-training-requirement-sizer',
    name: 'QLoRA 4-Bit Training VRAM & GPU Sizer',
    subject: SUBJECT,
    blurb: 'Calculate the minimum GPU VRAM required to fine-tune models using 4-bit NormalFloat (NF4) QLoRA with paged optimizers.',
    tip: 'QLoRA enables fine-tuning a 70B model on two 24GB GPUs (e.g. 2x RTX 3090/4090) instead of an $80k cluster.',
    usage: [
      'Select model parameter size.',
      'Enter batch size per device and sequence length.',
      'Inspect VRAM requirements for base weights, gradients, optimizer states, and activations.',
    ],
    method: [
      'Base weights in 4-bit = Params * 0.5 GB.',
      'LoRA weights + Gradients in FP16 = LoRA_Params * 4 bytes.',
      'Paged AdamW 8-bit optimizer state.',
      'Gradient checkpointing activation footprint.',
    ],
    fields: [
      sel('modelSize', 'Base Model Parameter Class', ['8 Billion Parameters (Llama 3 8B)', '14 Billion Parameters (Qwen 14B)', '70 Billion Parameters (Llama 3 70B)']),
      n('batchSize', 'Batch Size per GPU', 2, 1, 16),
      n('seqLength', 'Training Sequence Length', 2048, 512, 8192, 512),
    ],
    compute: (v) => {
      const modelStr = asSel(v, 'modelSize', '8 Billion Parameters (Llama 3 8B)')
      const batch = asNum(v, 'batchSize', 2)
      const seq = asNum(v, 'seqLength', 2048)

      let paramsB = 8
      if (modelStr.startsWith('14')) paramsB = 14
      else if (modelStr.startsWith('70')) paramsB = 70

      const baseWeightGb = paramsB * 0.55
      const activationsGb = (seq / 2048) * batch * (paramsB > 32 ? 4.5 : 2.0)
      const loraOptGb = paramsB > 32 ? 3.5 : 1.2
      const cudaOverhead = 1.5

      const totalVramGb = Math.round((baseWeightGb + activationsGb + loraOptGb + cudaOverhead) * 10) / 10

      let recommendedHardware = '1x RTX 3090 / 4090 (24GB)'
      if (totalVramGb > 48) recommendedHardware = '2x A100 80GB or 4x RTX 4090 24GB'
      else if (totalVramGb > 24) recommendedHardware = '2x RTX 3090 / 4090 24GB or 1x A6000 48GB'

      return [
        res('Minimum GPU VRAM Needed', `${totalVramGb} GB VRAM`, totalVramGb > 24 ? 'warn' : 'good'),
        res('Hardware Recommendation', recommendedHardware, 'good'),
        res('4-Bit NF4 Base Weights', `${baseWeightGb.toFixed(1)} GB`, 'neutral'),
        res('Activation Memory (with grad checkpointing)', `${activationsGb.toFixed(1)} GB`, 'neutral'),
        pctres('Single 24GB GPU Feasibility', totalVramGb <= 24 ? 'Fits on 1x 24GB GPU' : 'Requires Multi-GPU', Math.min(100, Math.round((totalVramGb / 24) * 100)), totalVramGb <= 24 ? 'good' : 'warn'),
      ]
    },
  },
]
