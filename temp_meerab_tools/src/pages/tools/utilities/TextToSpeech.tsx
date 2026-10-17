import { useEffect, useState } from 'react'
import { AudioLines, Play, Pause, Square, Volume2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextArea } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'

export default function TextToSpeech() {
  const [text, setText] = useState('Welcome to vimz Tools! This text-to-speech reader uses the Web Speech API built into your browser. No audio is ever recorded or transmitted — it plays directly on your device.')
  const [speaking, setSpeaking] = useState(false)
  const [paused, setPaused] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState('')
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [volume, setVolume] = useState(1)

  useEffect(() => {
    const load = () => setVoices(window.speechSynthesis.getVoices())
    load()
    window.speechSynthesis.onvoiceschanged = load
  }, [])

  useEffect(() => {
    if (voices.length && !selectedVoice) {
      const preferred = voices.find(
        (v) => v.lang.startsWith('en') && v.localService,
      ) || voices[0]
      setSelectedVoice(preferred.name)
    }
  }, [voices, selectedVoice])

  const speak = () => {
    if (!text.trim()) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.rate = rate
    utter.pitch = pitch
    utter.volume = volume
    const voice = voices.find((v) => v.name === selectedVoice)
    if (voice) utter.voice = voice
    utter.onend = () => { setSpeaking(false); setPaused(false) }
    utter.onerror = () => { setSpeaking(false); setPaused(false) }
    window.speechSynthesis.speak(utter)
    setSpeaking(true)
    setPaused(false)
  }

  const pause = () => {
    if (paused) { window.speechSynthesis.resume(); setPaused(false) }
    else { window.speechSynthesis.pause(); setPaused(true) }
  }

  const stop = () => {
    window.speechSynthesis.cancel()
    setSpeaking(false)
    setPaused(false)
  }

  const enVoices = voices.filter((v) => v.lang.startsWith('en'))
  const otherVoices = voices.filter((v) => !v.lang.startsWith('en'))

  return (
    <>
      <Seo
        title="Text-to-Speech Voice Reader - vimz Tools"
        description="Read text aloud with natural voices from the Web Speech API. Choose voice, speed and pitch — fully private."
      />
      <ToolShell
        title="Text-to-Speech Voice Reader"
        description="Type or paste text and hear it read aloud with natural-sounding voices. Uses your browser's built-in Web Speech API — nothing is recorded or transmitted."
        icon={<AudioLines className="h-6 w-6" />}
        breadcrumb="Student Tools"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <TextArea
              rows={10}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste the text you want read aloud..."
              className="min-h-[240px] text-base leading-relaxed"
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={speak} disabled={!text.trim()}>
                {speaking && !paused ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {speaking && !paused ? 'Speaking...' : 'Read aloud'}
              </Button>
              {speaking && (
                <>
                  <Button variant="secondary" onClick={pause}>
                    <Pause className="h-4 w-4" /> {paused ? 'Resume' : 'Pause'}
                  </Button>
                  <Button variant="danger" onClick={stop}>
                    <Square className="h-4 w-4" /> Stop
                  </Button>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs text-slate-500">
              <Volume2 className="h-4 w-4 text-primary-500" />
              {text.trim().split(/\s+/).filter(Boolean).length} words ·{' '}
              {speaking && !paused ? 'playing now' : 'ready'}
            </div>
          </div>

          <div className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <AudioLines className="h-4 w-4 text-primary-600" /> Voice settings
            </h3>
            <Field label="Voice">
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              >
                {enVoices.length > 0 && <optgroup label="English">{enVoices.map((v) => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}</optgroup>}
                {otherVoices.length > 0 && <optgroup label="Other">{otherVoices.map((v) => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}</optgroup>}
                {voices.length === 0 && <option value="">Loading voices...</option>}
              </select>
            </Field>
            <Field label={`Speed: ${rate.toFixed(1)}×`}>
              <input type="range" min={0.5} max={2.5} step={0.1} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full accent-primary-600" />
            </Field>
            <Field label={`Pitch: ${pitch.toFixed(1)}`}>
              <input type="range" min={0} max={2} step={0.1} value={pitch} onChange={(e) => setPitch(Number(e.target.value))} className="w-full accent-primary-600" />
            </Field>
            <Field label={`Volume: ${Math.round(volume * 100)}%`}>
              <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-full accent-primary-600" />
            </Field>
          </div>
        </div>
      </ToolShell>
    </>
  )
}