import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { sendMessageToAssistant } from '@services/ai/aiAssistantService.js'

const DEFAULT_SUGGESTIONS = [
  'Mera 8% return hai, kitne saal me paisa double hoga?',
  'I attended 36 out of 45 classes, can I miss next class and stay at 75%?',
  'What is an annual salary of $100,000 as an hourly wage?',
  'Split a $140 bill with 18% tip between 4 friends'
]

export default function AiChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Salam! I am the Vimz.ai Intelligent Assistant. Ask me any calculation or tool question in English or Roman Urdu! (e.g. *"Mera paisa kab double hoga"*, *"attendance short check karo"*)'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [apiKey, setApiKey] = useState(() => {
    try {
      return localStorage.getItem('vimz_gemini_api_key') || ''
    } catch {
      return ''
    }
  })

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      inputRef.current?.focus()
    }
  }, [messages, isOpen])

  const handleSaveApiKey = (key) => {
    setApiKey(key)
    try {
      if (key) {
        localStorage.setItem('vimz_gemini_api_key', key)
      } else {
        localStorage.removeItem('vimz_gemini_api_key')
      }
    } catch {
      /* ignore */
    }
    setShowSettings(false)
  }

  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim()
    if (!text || loading) return

    const userMsg = { role: 'user', text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await sendMessageToAssistant(text, { apiKey: apiKey || undefined })
      const botMsg = {
        role: 'assistant',
        text: res.reply,
        toolCall: res.toolCall,
        toolSlug: res.toolSlug,
        mode: res.mode,
        data: res.data
      }
      setMessages((prev) => [...prev, botMsg])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Error processing request: ${err.message}. You can try asking another question or use tools directly from the directory.`
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <aside aria-label="AI Assistant" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1200 }}>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="btn primary"
          aria-label="Open AI Assistant"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            borderRadius: '9999px',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>✨</span>
          <span>AI Assistant</span>
        </button>
      )}

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-chat-title"
          style={{
            width: 'min(420px, calc(100vw - 32px))',
            height: 'min(620px, calc(100vh - 48px))',
            background: 'var(--bg-panel, #ffffff)',
            color: 'var(--text-main, #0f172a)',
            borderRadius: '16px',
            border: '1px solid var(--border-color, #e2e8f0)',
            boxShadow: '0 20px 48px rgba(0, 0, 0, 0.18)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--border-color, #e2e8f0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-header, #f8fafc)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.3rem' }}>✨</span>
              <div>
                <h3 id="ai-chat-title" style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700 }}>
                  Vimz.ai Assistant
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>
                  {apiKey ? '🟢 Gemini 3.8 Flash Online' : '⚡ Deterministic Zero-Cost Engine ($0)'}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className="btn ghost"
                onClick={() => setShowSettings(!showSettings)}
                title="API Settings"
                style={{ padding: '6px 10px', fontSize: '0.85rem' }}
              >
                ⚙️
              </button>
              <button
                type="button"
                className="btn ghost"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                style={{ padding: '6px 10px', fontSize: '0.9rem' }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Settings Subpanel */}
          {showSettings && (
            <div
              style={{
                padding: '12px 16px',
                background: 'var(--bg-sub, #f1f5f9)',
                borderBottom: '1px solid var(--border-color, #e2e8f0)',
                fontSize: '0.82rem'
              }}
            >
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px' }}>
                Optional Gemini API Key:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="password"
                  placeholder="AIzaSy... (leave blank for free mode)"
                  defaultValue={apiKey}
                  id="gemini-key-input"
                  style={{ flex: 1, padding: '6px 10px', fontSize: '0.82rem', borderRadius: '6px' }}
                />
                <button
                  type="button"
                  className="btn primary"
                  style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  onClick={() => {
                    const val = document.getElementById('gemini-key-input')?.value || ''
                    handleSaveApiKey(val.trim())
                  }}
                >
                  Save
                </button>
              </div>
              <p style={{ margin: '6px 0 0', color: 'var(--text-muted, #64748b)', fontSize: '0.75rem' }}>
                Without an API key, the assistant runs in 100% free deterministic mode using our pure engines!
              </p>
            </div>
          )}

          {/* Message List */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {messages.map((m, i) => {
              const isUser = m.role === 'user'
              return (
                <div
                  key={i}
                  style={{
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '88%',
                    background: isUser ? 'var(--accent, #6366f1)' : 'var(--bg-card, #f8fafc)',
                    color: isUser ? '#ffffff' : 'inherit',
                    padding: '10px 14px',
                    borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    border: isUser ? 'none' : '1px solid var(--border-color, #e2e8f0)',
                    fontSize: '0.88rem',
                    lineHeight: 1.45,
                    wordBreak: 'break-word'
                  }}
                >
                  <div>{m.text}</div>

                  {/* Golden Rule Execution Badge */}
                  {m.toolCall && (
                    <div
                      style={{
                        marginTop: '8px',
                        paddingTop: '6px',
                        borderTop: isUser ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--border-color, #e2e8f0)',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '6px'
                      }}
                    >
                      <span style={{ opacity: 0.85 }}>⚡ Executed: {m.toolCall}</span>
                      {m.toolSlug && (
                        <Link
                          to={`/tools/${m.toolSlug}`}
                          onClick={() => setIsOpen(false)}
                          style={{
                            color: isUser ? '#ffffff' : 'var(--accent, #6366f1)',
                            fontWeight: 600,
                            textDecoration: 'underline'
                          }}
                        >
                          Open Full Tool →
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            {loading && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  padding: '10px 14px',
                  borderRadius: '14px',
                  background: 'var(--bg-card, #f8fafc)',
                  border: '1px solid var(--border-color, #e2e8f0)',
                  fontSize: '0.85rem',
                  color: 'var(--text-muted, #64748b)'
                }}
              >
                Thinking & extracting parameters...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions (if only greeting message) */}
          {messages.length === 1 && (
            <div style={{ padding: '0 16px 8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', fontWeight: 600 }}>
                Try asking:
              </span>
              {DEFAULT_SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(s)}
                  style={{
                    textAlign: 'left',
                    padding: '6px 10px',
                    fontSize: '0.78rem',
                    background: 'var(--bg-sub, #f1f5f9)',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: 'var(--text-main, #334155)',
                    transition: 'background 0.15s ease'
                  }}
                >
                  💡 {s}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div
            style={{
              padding: '12px 16px',
              borderTop: '1px solid var(--border-color, #e2e8f0)',
              background: 'var(--bg-panel, #ffffff)',
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Type your question or numbers..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #cbd5e1)',
                fontSize: '0.88rem'
              }}
            />
            <button
              type="button"
              className="btn primary"
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              style={{ padding: '10px 16px', borderRadius: '8px', fontWeight: 600 }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
