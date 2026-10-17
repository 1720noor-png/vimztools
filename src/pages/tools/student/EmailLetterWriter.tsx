import { useMemo, useState } from 'react'
import { Mail, Wand2 } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, Select, TextArea, TextInput } from '../../../components/ui/Fields'
import CodeBlock from '../../../components/ui/CodeBlock'
import Seo from '../../../components/ui/Seo'

type Purpose = 'request' | 'complaint' | 'application' | 'thankyou'
type Tone = 'formal' | 'warm'

const OPENERS: Record<Purpose, { formal: string; warm: string }> = {
  request: {
    formal: 'I am writing to formally request',
    warm: 'Hi, I hope your week is going well. Could I kindly ask for',
  },
  complaint: {
    formal: 'I am writing to raise a concern regarding',
    warm: 'Hi, I wanted to flag an issue I have noticed with',
  },
  application: {
    formal: 'I am writing to apply for the position of',
    warm: 'Hi, I would love to be considered for',
  },
  thankyou: {
    formal: 'I am writing to express my sincere thanks for',
    warm: 'Hi, I just wanted to say a big thank you for',
  },
}

const CLOSERS: Record<Tone, string> = {
  formal: 'Thank you for your time and consideration. I look forward to your reply and remain at your disposal for any further information required.',
  warm: 'Thanks again for your help - I really appreciate it. Let me know if I can return the favour anytime. All the best!',
}

export default function EmailLetterWriter() {
  const [purpose, setPurpose] = useState<Purpose>('request')
  const [tone, setTone] = useState<Tone>('formal')
  const [sender, setSender] = useState('')
  const [recipient, setRecipient] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [ran, setRan] = useState(false)

  const email = useMemo(() => {
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
    const opener = OPENERS[purpose][tone]
    const topic = body.trim() || 'the matter described below'
    const greeting = tone === 'formal' ? `Dear ${recipient || 'Sir or Madam'},` : `Hi ${recipient || 'there'},`
    void ran
    const middle = `\n\n${opener} ${topic}. I would be grateful if ${tone === 'formal' ? 'we could take this forward at your earliest convenience' : 'you could let me know when works for you'}.\n\nI have included the key details below so you can follow up easily, and I am happy to provide anything further on request.\n\n${CLOSERS[tone]}`
    const sign = tone === 'formal' ? 'Yours faithfully,' : 'Best regards,'
    const closing = `\n\n${sign}\n${sender || '[Your name]'}`
    const subj = subject || `${cap(purpose)} - ${cap(topic.split('.')[0])}`
    return { subject: subj, text: `To: ${recipient || '[recipient]'}\nSubject: ${subj}\n\n${greeting}${middle}${closing}` }
  }, [purpose, tone, sender, recipient, subject, body, ran])

  return (
    <>
      <Seo
        title="Email & Letter Writer - vimz Tools"
        description="Draft professional emails and letters for requests, applications, feedback and thanks."
      />
      <ToolShell
        title="Email & Letter Writer"
        description="Draft a professional email or letter in seconds, formal or warm."
        icon={<Mail className="h-6 w-6" />}
        breadcrumb="Student Tools"
        instruction="Pick a purpose and tone, add names for context, then generate the draft."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Purpose">
                <Select value={purpose} onChange={(e) => setPurpose(e.target.value as Purpose)}>
                  <option value="request">Request</option>
                  <option value="complaint">Complaint</option>
                  <option value="application">Application</option>
                  <option value="thankyou">Thank you</option>
                </Select>
              </Field>
              <Field label="Tone">
                <Select value={tone} onChange={(e) => setTone(e.target.value as Tone)}>
                  <option value="formal">Formal</option>
                  <option value="warm">Warm</option>
                </Select>
              </Field>
            </div>
            <Field label="Recipient">
              <TextInput value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="e.g. Dr Mensah" />
            </Field>
            <Field label="Your name">
              <TextInput value={sender} onChange={(e) => setSender(e.target.value)} placeholder="e.g. Ama Owusu" />
            </Field>
            <Field label="Subject (optional)">
              <TextInput value={subject} onChange={(e) => setSubject(e.target.value)} />
            </Field>
            <Field label="What it is about">
              <TextArea rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="e.g. transferring into the afternoon lab group" />
            </Field>
            <Button onClick={() => setRan((r) => !r)} disabled={!body.trim() && !subject}>
              <Wand2 className="h-4 w-4" /> Write draft
            </Button>
          </div>

          <div className="space-y-4">
            {email ? (
              <>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">Subject</p>
                  <p className="text-sm font-semibold text-slate-800">{email.subject}</p>
                </div>
                <pre className="whitespace-pre-wrap rounded-2xl border border-slate-200 bg-white p-5 font-sans text-sm leading-relaxed text-slate-700">
                  {email.text}
                </pre>
                <CodeBlock title="Copyable email" code={email.text} lang="plain" />
              </>
            ) : null}
          </div>
        </div>
      </ToolShell>
    </>
  )
}