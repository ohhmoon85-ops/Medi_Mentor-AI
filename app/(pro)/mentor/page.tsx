'use client'

import { useState, useRef, useEffect } from 'react'
import { CitationModal } from '@/components/ui/citation-modal'
import type { Citation } from '@/lib/db/schema'

interface MentorMessage {
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
  confidence?: number
  hallucination_flagged?: boolean
}

export default function MentorPage() {
  const [messages, setMessages] = useState<MentorMessage[]>([
    {
      role: 'assistant',
      content: '안녕하세요. 임상 질문이 있으시면 말씀해 주세요. 근거 자료(가이드라인/PubMed)를 기반으로 답변드립니다.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendQuestion() {
    if (!input.trim() || loading) return
    const question = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: question }])
    setLoading(true)

    try {
      const res = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: question,
          persona: 'doctor',
          type: 'mentor',
        }),
      })
      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer,
          citations: data.citations,
          confidence: data.confidence,
          hallucination_flagged: data.hallucination_flagged,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">멘토 모드</h2>
        <p className="text-gray-500 text-sm">RAG 기반 임상 자문 — 모든 답변에 근거 출처가 제시됩니다</p>
      </div>

      {/* 메시지 */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white text-sm mr-2 flex-shrink-0 mt-1">
                ⚕️
              </div>
            )}
            <div className={`max-w-[80%] space-y-2 ${msg.role === 'user' ? '' : ''}`}>
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#003876] text-white rounded-br-sm'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                }`}
              >
                <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
              </div>

              {msg.citations && msg.citations.length > 0 && (
                <div className="flex items-center gap-2 px-1">
                  <CitationModal citations={msg.citations}>
                    📚 근거 {msg.citations.length}건 보기
                  </CitationModal>
                  {msg.confidence !== undefined && (
                    <span className={`text-xs ${msg.confidence >= 0.7 ? 'text-green-600' : 'text-orange-500'}`}>
                      신뢰도: {Math.round(msg.confidence * 100)}%
                    </span>
                  )}
                  {msg.hallucination_flagged && (
                    <span className="text-xs text-red-500">⚠️ 일부 문장 검증됨</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white text-sm mr-2 flex-shrink-0">
              ⚕️
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm text-xs text-gray-400">
              RAG 검색 중...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 입력 */}
      <div className="border-t border-gray-200 pt-3 bg-gray-50">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendQuestion()
              }
            }}
            placeholder="임상 질문을 입력하세요... (예: 급성 담낭염 1차 항생제 선택 기준)"
            rows={2}
            className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button
            onClick={sendQuestion}
            disabled={loading || !input.trim()}
            className="p-3 rounded-xl bg-[#003876] text-white hover:bg-blue-800 disabled:opacity-50 transition-colors flex-shrink-0"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  )
}
