'use client'

import { useState, useRef, useEffect } from 'react'
import { AcuityBadge } from '@/components/ui/acuity-badge'
import type { AcuityLevel } from '@/lib/triage/mts-engine'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface TriageData {
  acuity_level: AcuityLevel
  recommended_department: string
  alternative_departments: string[]
  red_flags: string[]
  rationale: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '안녕하세요! 어디가 불편하신가요? 증상을 말씀해 주시면 필요한 정보를 안내해 드릴게요. 😊',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [triage, setTriage] = useState<TriageData | null>(null)
  const [isListening, setIsListening] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages,
        }),
      })

      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply },
      ])

      if (data.triage) {
        setTriage(data.triage)
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '죄송합니다. 잠시 후 다시 시도해 주세요.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  function startVoiceInput() {
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('이 브라우저는 음성 입력을 지원하지 않습니다.')
      return
    }

    type SpeechRecognitionCtor = new () => {
      lang: string
      continuous: boolean
      interimResults: boolean
      onstart: (() => void) | null
      onend: (() => void) | null
      onresult: ((event: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null
      start: () => void
    }

    const win = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor
      webkitSpeechRecognition?: SpeechRecognitionCtor
    }
    const SpeechRecognitionCtor = win.SpeechRecognition || win.webkitSpeechRecognition

    if (!SpeechRecognitionCtor) return

    const recognition = new SpeechRecognitionCtor()
    recognition.lang = 'ko-KR'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput((prev) => prev + transcript)
    }

    recognition.start()
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-[#003876] flex items-center justify-center text-white text-sm mr-2 flex-shrink-0 mt-1">
                🏥
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-base leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#003876] text-white rounded-br-sm'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-[#003876] flex items-center justify-center text-white text-sm mr-2 flex-shrink-0">
              🏥
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <span className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}

        {/* 트리아지 결과 카드 */}
        {triage && (
          <div className="bg-white border-2 border-blue-100 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <AcuityBadge level={triage.acuity_level} />
              <span className="font-semibold text-gray-700">{triage.recommended_department}</span>
            </div>
            {triage.red_flags.length > 0 && (
              <div className="bg-red-50 rounded-xl p-3">
                <p className="text-sm font-semibold text-red-700 mb-1">⚠️ 주의 증상</p>
                <ul className="text-sm text-red-600 space-y-0.5">
                  {triage.red_flags.map((f, i) => <li key={i}>• {f}</li>)}
                </ul>
              </div>
            )}
            <p className="text-sm text-gray-600">{triage.rationale}</p>
            {triage.alternative_departments.length > 0 && (
              <p className="text-xs text-gray-400">
                대안 진료과: {triage.alternative_departments.join(', ')}
              </p>
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 입력 영역 */}
      <div className="border-t border-gray-200 pt-3 bg-white">
        <div className="flex gap-2 items-end">
          <button
            onClick={startVoiceInput}
            className={`p-3 rounded-xl border ${
              isListening
                ? 'bg-red-500 text-white border-red-500 animate-pulse'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
            } transition-colors flex-shrink-0`}
            title="음성 입력"
          >
            🎤
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="증상을 입력하세요... (예: 무릎이 계단 내려갈 때 시큰거려요)"
            rows={2}
            className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="p-3 rounded-xl bg-[#003876] text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  )
}
