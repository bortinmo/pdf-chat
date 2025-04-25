'use client'

import { useChat } from '@ai-sdk/react'
import { useEffect } from 'react'

export default function Chat() {
  const { messages, setMessages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({ api: '/api/chat' })

  // hydrate history on the first render
  useEffect(() => {
    fetch('/api/history')
      .then(r => r.json())
      .then((rows: any[]) => {
        const history = rows.flatMap(row => [
          {
            id: `q-${row.id}`,
            role: 'user',
            content: row.question,
          },
          {
            id: `a-${row.id}`,
            role: 'assistant',
            content: row.answer,
          },
        ] as const)
        setMessages(history)
      })
      .catch(console.error)
  }, [setMessages])


  return (
    <main className="flex flex-col max-w-2xl mx-auto h-screen p-4">
      <section className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map(m => (
          <p
            key={m.id}
            className={m.role === 'user' ? 'text-right font-semibold' : 'italic'}
          >
            {m.content}
          </p>
        ))}
        {isLoading && <p className="italic text-gray-400">…thinking</p>}
      </section>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask anything…"
        />
        <button
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-40"
          disabled={isLoading}
        >
          Send
        </button>
      </form>
    </main>
  )
}
