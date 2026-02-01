import { useState, useCallback, useRef } from 'react'

export interface Message {
  id: string
  role: 'user' | 'bot'
  text: string
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const sessionId = useRef(crypto.randomUUID())

  const sendMessage = useCallback(async (text: string) => {
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch(import.meta.env.VITE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatInput: text, sessionId: sessionId.current }),
      })
      const data = await res.json()
      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: 'bot',
        text: data.output || 'Keine Antwort erhalten.',
      }
      setMessages(prev => [...prev, botMsg])
    } catch {
      setMessages(prev => [
        ...prev,
        { id: crypto.randomUUID(), role: 'bot', text: 'Fehler bei der Verbindung zum Server.' },
      ])
    } finally {
      setLoading(false)
    }
  }, [])

  return { messages, loading, sendMessage }
}
