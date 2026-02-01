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
    <div className="flex flex-col h-screen font-sans">
      {/* Header */}
      <header className="px-6 py-4 bg-[#1a1a1a] border-b border-[#2a2a2a] text-center">
        <h1 className="text-lg font-semibold text-white">Onboarding Buddy</h1>
        <p className="text-sm text-gray-500 mt-1">Dein Assistent für den Einstieg ins Unternehmen</p>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={
              msg.role === 'user'
                ? 'self-end max-w-[75%] bg-[#2563eb] text-white px-4 py-3 rounded-2xl rounded-br-sm shadow'
                : 'self-start max-w-[75%] bg-[#1a1a1a] text-gray-200 border border-[#2a2a2a] px-4 py-3 rounded-2xl rounded-bl-sm shadow'
            }
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
          </div>
        ))}

        {loading && (
          <div className="self-start max-w-[75%] bg-[#1a1a1a] border border-[#2a2a2a] px-4 py-3 rounded-2xl rounded-bl-sm shadow">
            <span className="text-sm text-gray-500 italic flex items-center gap-1">
              <span className="animate-pulse">●</span>
              <span className="animate-pulse [animation-delay:0.2s]">●</span>
              <span className="animate-pulse [animation-delay:0.4s]">●</span>
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 bg-[#1a1a1a] border-t border-[#2a2a2a] flex gap-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Stelle eine Frage..."
          className="flex-1 px-4 py-3 rounded-xl border border-[#333] bg-[#0a0a0a] text-gray-200 text-sm outline-none focus:border-[#2563eb] transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="px-6 py-3 rounded-xl bg-[#2563eb] text-white text-sm font-semibold hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          Senden
        </button>
      </div>
    </div>
  )
}
