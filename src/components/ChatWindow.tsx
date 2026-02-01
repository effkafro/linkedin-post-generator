import { useState, useRef, useEffect } from 'react'
import { useChat } from '../hooks/useChat'

export default function ChatWindow() {
  const { messages, loading, sendMessage } = useChat()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSend = () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    sendMessage(text)
  }

  return (
    <div className="flex flex-col h-screen font-sans bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="px-6 py-4 bg-card border-b border-border shadow-sm text-center relative z-10">
        <h1 className="text-lg font-semibold tracking-tight">Onboarding Buddy</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Dein Assistent für den Einstieg ins Unternehmen</p>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6 flex flex-col gap-6">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'
              }`}
          >
            <div
              className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-none'
                  : 'bg-card border border-border text-card-foreground rounded-bl-none'
                }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="self-start items-start flex flex-col max-w-[75%]">
            <div className="px-5 py-4 rounded-2xl rounded-bl-none bg-card border border-border shadow-sm">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce"></span>
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-card border-t border-border mt-auto">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Stelle eine Frage..."
            className="flex-1 h-12 w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6 shadow-sm"
          >
            Senden
          </button>
        </div>
      </div>
    </div>
  )
}
