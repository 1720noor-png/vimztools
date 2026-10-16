import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { sendMessageToAssistant } from '@services/ai/aiAssistantService.js'
import { aiChatApi } from '@/api/client.js'

const DEFAULT_SUGGESTIONS = [
  'Mera 8% return hai, kitne saal me paisa double hoga?',
  'I attended 36 out of 45 classes, can I miss next class and stay at 75%?',
  'What is an annual salary of $100,000 as an hourly wage?',
  'Convert 100 C to Fahrenheit'
]

export default function AiChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [sessionId] = useState(() => {
    try {
      let id = localStorage.getItem('vimz_ai_session_id')
      if (!id) {
        id = typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : 'sess_' + Math.random().toString(36).substring(2, 15)
        localStorage.setItem('vimz_ai_session_id', id)
      }
      return id
    } catch {
      return 'sess_' + Math.random().toString(36).substring(2, 15)
    }
  })

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Salam! I am the Vimz.ai Intelligent Assistant. Ask me any calculation or tool question in English or Roman Urdu! (e.g. *"Mera paisa kab double hoga"*, *"convert 10 km to miles"*, *"convert 100 C to Fahrenheit"*)'
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

  // Fetch persisted history on mount if available
  useEffect(() => {
    aiChatApi.getHistory(sessionId)
      .then((res) => {
        if (res?.messages && res.messages.length > 0) {
          const loaded = res.messages.map((m) => ({
            role: m.role,
            text: m.content,
            toolCall: m.tool_name ? { name: m.tool_name, args: m.tool_args } : null,
            toolSlug: m.tool_slug,
            link: m.link,
            data: m.tool_result,
            level: m.level
          }))
          setMessages(loaded)
        }
      })
      .catch(() => {
        // Fallback gracefully without blocking
      })
  }, [sessionId])

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

  const handleClearChat = async () => {
    try {
      await aiChatApi.clearHistory(sessionId)
    } catch {
      /* ignore */
    }
    setMessages([
      {
        role: 'assistant',
        text: 'Chat history cleared. Salam! Ask me any calculation or tool question in English or Roman Urdu!'
      }
    ])
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
        link: res.link,
        mode: res.mode,
        data: res.data
      }
      setMessages((prev) => [...prev, botMsg])

      // Persist turn to backend database (non-blocking)
      aiChatApi.recordChat({
        session_id: sessionId,
        message: text,
        reply: res.reply,
        tool_name: res.toolCall?.name || res.tool,
        tool_slug: res.toolSlug,
        tool_args: res.toolCall?.args || res.args,
        tool_result: res.data,
        link: res.link,
        level: res.level || 'L2'
      }).catch(() => {
        // Fallback smoothly if offline
      })
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
          className="ai-modal-content"
          style={{
            width: 'min(420px, calc(100vw - 32px))',
            height: 'min(620px, calc(100vh - 48px))',
            background: 'var(--neu-bg, #E8EAF2)',
            color: 'var(--neu-fg, #20213A)',
            borderRadius: '28px',
            border: 'none',
            boxShadow: 'var(--neu-extruded-lg)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              borderBottom: 'none',
              boxShadow: 'var(--neu-extruded-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--neu-bg, #E8EAF2)'
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
                onClick={handleClearChat}
                title="Clear chat history"
                style={{ padding: '6px 10px', fontSize: '0.85rem' }}
              >
                🗑️
              </button>
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
                  onBlur={(e) => handleSaveApiKey(e.target.value.trim())}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    fontSize: '0.82rem'
                  }}
                />
              </div>
              <p style={{ margin: '6px 0 0', color: 'var(--text-muted, #64748b)', fontSize: '0.75rem' }}>
                Keys remain in your local browser only. Zero server transmission.
              </p>
            </div>
          )}

          {/* Messages Container */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              background: 'var(--neu-bg, #E8EAF2)',
              boxShadow: 'var(--neu-inset-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {messages.map((m, idx) => {
              const isUser = m.role === 'user'
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '85%',
                      padding: '12px 16px',
                      borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      background: isUser ? 'var(--brand)' : 'var(--neu-bg, #E8EAF2)',
                      color: isUser ? '#ffffff' : 'var(--neu-fg, #20213A)',
                      border: 'none',
                      boxShadow: isUser ? 'var(--neu-accent-extruded)' : 'var(--neu-extruded-sm)',
                      fontSize: '0.88rem',
                      lineHeight: 1.45,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  >
                    {m.text}

                    {/* Level 1 Deep-Link to Interactive Tool */}
                    {m.link && (
                      <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed rgba(100, 116, 139, 0.3)' }}>
                        <Link
                          to={m.link}
                          onClick={() => setIsOpen(false)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: isUser ? '#e0e7ff' : '#4f46e5',
                            fontWeight: 600,
                            textDecoration: 'underline',
                            fontSize: '0.82rem'
                          }}
                        >
                          👉 Open tool with pre-filled inputs
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted, #64748b)', fontSize: '0.82rem' }}>
                <span className="spinner-dots">● ● ●</span>
                <span>Calculating pure formula...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions (Shown when only welcome message exists) */}
          {messages.length <= 1 && (
            <div style={{ padding: '0 16px 12px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {DEFAULT_SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(s)}
                  style={{
                    fontSize: '0.74rem',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    background: 'var(--bg-sub, #f8fafc)',
                    color: 'var(--text-main, #334155)',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Chat Input Bar */}
          <div
            style={{
              padding: '14px 18px',
              borderTop: 'none',
              boxShadow: '0 -4px 16px var(--neu-shadow-dark)',
              background: 'var(--neu-bg, #E8EAF2)',
              display: 'flex',
              gap: '10px'
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything (e.g. 10 km to miles)..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '11px 16px',
                borderRadius: '16px',
                border: 'none',
                background: 'var(--neu-bg, #E8EAF2)',
                boxShadow: 'var(--neu-inset)',
                color: 'var(--neu-fg, #20213A)',
                fontSize: '0.88rem'
              }}
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="btn primary"
              style={{ padding: '10px 18px', fontSize: '0.88rem' }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
