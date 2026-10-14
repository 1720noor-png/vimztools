import { useMemo, useState } from 'react'
import { Field } from '../../components/ui.jsx'
import { calculateTextStats } from '@tool-core/writing/wordCounter.js'
import useAutoFillParams from '@hooks/useAutoFillParams.js'

export default function WordCounter() {
  const params = useAutoFillParams({ text: '', src: '', input: '' })
  const [text, setText] = useState(params.text || params.src || params.input || '')
  const s = useMemo(() => calculateTextStats(text), [text])

  return (
    <div>
      <Field label="Paste or type your text">
        <textarea rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder="Start typing…" />
      </Field>
      <div className="actions"><button className="btn ghost" onClick={() => setText('')}>Clear</button></div>
      <div className="out" role="status">
        <p>Words: <strong>{s.words}</strong></p>
        <p>Characters: <strong>{s.chars}</strong> ({s.charsNoSpace} without spaces)</p>
        <p>Sentences: <strong>{s.sentences}</strong> · Paragraphs: <strong>{s.paragraphs}</strong></p>
        <p>Estimated reading time: <strong>{s.readingTimeFormatted}</strong> · Speaking time: <strong>{s.speakingTimeFormatted}</strong></p>
      </div>
      <p className="hint">Counted locally as you type — nothing is uploaded.</p>
    </div>
  )
}
