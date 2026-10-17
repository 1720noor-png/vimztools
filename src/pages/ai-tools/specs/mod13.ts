import {
  asNum,
  asSel,
  fmtMoney,
  fmtNum,
  n,
  pctres,
  res,
  sel,
  type AiToolSpec,
} from './aiSpec'

export const SUBJECT = 'Audio Whisper & Speech Math'

export const MOD13_SPECS: AiToolSpec[] = [
  {
    id: 'whisper-audio-duration-cost-calculator',
    name: 'OpenAI Whisper Audio Transcription Cost & Time Sizer',
    subject: SUBJECT,
    blurb: 'Calculate transcription fees, word yield, and processing duration across audio recording lengths.',
    tip: 'Compressing audio to 64kbps mono MP3 before uploading saves bandwidth with zero degradation in Whisper WER.',
    usage: [
      'Enter total audio recording duration in minutes or hours.',
      'Select transcription engine (OpenAI Whisper Cloud vs Local Faster-Whisper).',
      'Inspect cost, word yield, and turnaround time.',
    ],
    method: [
      'OpenAI Whisper API rate = $0.006 per minute ($0.36 / hour).',
      'Average human speech rate = ~140 words / minute.',
    ],
    fields: [
      n('durationMinutes', 'Audio Duration (Minutes)', 75, 1, 10000, 5),
      sel('engine', 'Whisper Execution Model', [
        'OpenAI Whisper Cloud API ($0.006 / min)',
        'Local Faster-Whisper large-v3 (Local GPU - Free)',
        'Deepgram Nova-2 ($0.0043 / min)',
        'AssemblyAI Conformer-2 ($0.0065 / min)',
      ]),
    ],
    compute: (v) => {
      const mins = asNum(v, 'durationMinutes', 75)
      const engine = asSel(v, 'engine', 'OpenAI Whisper Cloud API ($0.006 / min)')

      let ratePerMin = 0.006
      if (engine.includes('Faster-Whisper')) ratePerMin = 0.0
      else if (engine.includes('Deepgram')) ratePerMin = 0.0043
      else if (engine.includes('AssemblyAI')) ratePerMin = 0.0065

      const totalCost = mins * ratePerMin
      const estWords = mins * 140
      const estTokens = Math.round(estWords * 1.3)
      const durationHours = (mins / 60).toFixed(1)

      return [
        res('Transcription Cost', fmtMoney(totalCost, 2), 'good', `${mins} minutes (${durationHours} hours)`),
        res('Estimated Word Yield', `~${fmtNum(estWords)} words`, 'neutral', 'At ~140 words/min speech rate'),
        res('Downstream LLM Context Required', `~${fmtNum(estTokens)} tokens`, 'neutral'),
        pctres('Engine Efficiency', engine.includes('Faster-Whisper') ? '100% Free (Self-Hosted)' : 'Managed API', 90, 'good'),
      ]
    },
  },
  {
    id: 'text-to-speech-tts-character-budgeter',
    name: 'Text-to-Speech (TTS) Character & Cost Budgeter',
    subject: SUBJECT,
    blurb: 'Calculate speech synthesis character consumption and cost across OpenAI TTS, ElevenLabs, and Cartesia.',
    tip: 'Strip Markdown formatting, emojis, and code blocks before sending text to TTS to save character credits.',
    usage: [
      'Enter total character count of text to be spoken.',
      'Select TTS provider and voice quality tier.',
      'Review output audio duration and total invoice.',
    ],
    method: [
      'OpenAI TTS: $15.00 / 1M chars (Standard), $30.00 / 1M chars (HD).',
      'ElevenLabs: ~$0.30 / 1k chars.',
      'Average speaking rate: ~15 characters per second.',
    ],
    fields: [
      n('charCount', 'Input Character Count', 45000, 100, 10000000, 1000),
      sel('ttsEngine', 'TTS Provider Tier', [
        'OpenAI TTS Standard ($15 / 1M chars)',
        'OpenAI TTS HD ($30 / 1M chars)',
        'ElevenLabs Creator Plan (~$0.24 / 1k chars)',
        'Deepgram Aura ($15 / 1M chars)',
      ]),
    ],
    compute: (v) => {
      const chars = asNum(v, 'charCount', 45000)
      const engine = asSel(v, 'ttsEngine', 'OpenAI TTS Standard ($15 / 1M chars)')

      let ratePerMillion = 15.0
      if (engine.includes('TTS HD')) ratePerMillion = 30.0
      else if (engine.includes('ElevenLabs')) ratePerMillion = 240.0
      else if (engine.includes('Deepgram')) ratePerMillion = 15.0

      const cost = (chars / 1_000_000) * ratePerMillion
      const estAudioSec = Math.round(chars / 15)
      const estAudioMin = (estAudioSec / 60).toFixed(1)

      return [
        res('Speech Generation Cost', fmtMoney(cost, 2), cost > 20 ? 'warn' : 'good'),
        res('Output Audio Duration', `~${estAudioMin} minutes (${estAudioSec}s)`, 'neutral'),
        res('Speech Rate Assumption', '~15 characters / second', 'neutral'),
        pctres('Character Allowance Impact', `${fmtNum(chars)} Characters`, Math.min(100, Math.round((chars / 100000) * 100)), 'neutral'),
      ]
    },
  },
]
