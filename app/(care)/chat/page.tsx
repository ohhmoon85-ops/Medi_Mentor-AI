'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { UserInfo } from '@/components/care/user-info-form'
import { AnswerSourceFooter } from '@/components/care/answer-source-footer'
import { AcuityBadge } from '@/components/ui/acuity-badge'
import { RedFlagWarningCard } from '@/components/ui/red-flag-warning-card'
import type { AcuityLevel } from '@/lib/triage/mts-engine'
import type { RedFlagWarning } from '@/app/api/triage/route'
import { getRandomSymptomExample } from '@/lib/constants/symptom-examples'
import { classifyRedFlags, detectRedFlags, getPatientMessage } from '@/lib/safety/red-flag-classifier'
import { PREGNANCY_PATTERN, MINOR_PATTERN } from '@/lib/safety/red-flag-data'

const RED_FLAG_DEBOUNCE_MS = 1500
const RED_FLAG_MIN_INPUT_LENGTH = 5

interface Message {
  role: 'user' | 'assistant'
  content: string
  /** G4-1: 결론 메시지 (응급도 분류 완료) 일 때만 설정. KTAS Level 1~5 (= medimentor L1~L5) */
  ktasLevel?: 1 | 2 | 3 | 4 | 5
}

interface CapturedDemographics {
  pregnancy: boolean
  isMinor: boolean
  age: number | null
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
  const [redFlagWarning, setRedFlagWarning] = useState<RedFlagWarning | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [seniorMode, setSeniorMode] = useState(false)
  const [capturedDemographics, setCapturedDemographics] = useState<CapturedDemographics>({
    pregnancy: false,
    isMinor: false,
    age: null,
  })
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const symptomExample = useMemo(() => getRandomSymptomExample(), [])

  // 60+ 모드: localStorage에서 초기값 로드
  useEffect(() => {
    const stored = localStorage.getItem('senior_mode')
    if (stored === 'true') setSeniorMode(true)
  }, [])

  // G3-8 user_info: 없으면 /care/info로 redirect, 있으면 state + capturedDemographics 초기화
  const router = useRouter()
  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = window.localStorage.getItem('medimentor_care_user_info_v1')
    if (!raw) {
      router.replace('/care/info')
      return
    }
    try {
      const info = JSON.parse(raw) as UserInfo
      setUserInfo(info)
      const age = typeof info.age === 'number' ? info.age : null
      setCapturedDemographics((prev) => ({
        pregnancy: prev.pregnancy || Boolean(info.pregnancy),
        isMinor:   prev.isMinor   || (age !== null && age < 18),
        age:       age ?? prev.age,
      }))

      // G3-8 후속: user_info 있으면 봇 첫 메시지를 짧게 (인구학 재질문 회피)
      const hasUsefulInfo = info.sex !== null || age !== null || info.pregnancy || (info.conditions?.length ?? 0) > 0
      if (hasUsefulInfo) {
        setMessages([{
          role: 'assistant',
          content: '안녕하세요! 어디가 불편하신가요? 😊',
        }])
      }
    } catch {
      // JSON 파싱 실패 시 무시 (자유 입력만 사용)
    }
  }, [router])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, redFlagWarning])

  // B-1 디바운싱: 입력 정지 후 RED_FLAG_DEBOUNCE_MS ms 경과 시 클라이언트사이드 red_flag 검출
  useEffect(() => {
    const trimmed = input.trim()
    if (trimmed.length < RED_FLAG_MIN_INPUT_LENGTH) return

    const timer = setTimeout(() => {
      // [1단계] 즉시 응급 키워드 필터
      const rfResult = classifyRedFlags(trimmed)

      if (rfResult.acuityOverride === 1) {
        setRedFlagWarning({
          severity: 'critical',
          category: '즉시 응급',
          patient_message: rfResult.emergencyMessage ?? '지금 즉시 119에 신고하거나 응급실로 이동하세요.',
          dont_miss_diagnoses: [],
          recommended_action: 'CALL_119',
        })
        return
      }

      // [2단계] Don't Miss 매트릭스 — 누적 인구학(서버 LLM) + 텍스트 패턴(method 2) 병합
      const pregnancy = capturedDemographics.pregnancy || PREGNANCY_PATTERN.test(trimmed)
      const isMinor = capturedDemographics.isMinor || MINOR_PATTERN.test(trimmed)
      const dfResult = detectRedFlags({ rawSymptoms: trimmed, pregnancy, isMinor })

      let warning: RedFlagWarning | null = null

      if (dfResult.is_red_flag && dfResult.matched_category) {
        const severity = dfResult.urgency === 'immediate' ? 'critical' : 'urgent'
        warning = {
          severity,
          category: dfResult.matched_category,
          patient_message: getPatientMessage(dfResult),
          dont_miss_diagnoses: dfResult.dont_miss_diagnoses.map((e) => e.dont_miss_lay_term),
          recommended_action: severity === 'critical' ? 'CALL_119' : 'GO_ER',
        }
      } else if (rfResult.acuityOverride === 2) {
        warning = {
          severity: 'urgent',
          category: '응급 증상',
          patient_message: rfResult.emergencyMessage ?? '가장 가까운 응급실 또는 응급의료기관으로 이동하세요.',
          dont_miss_diagnoses: [],
          recommended_action: 'GO_ER',
        }
      }

      if (warning) {
        // 기존 경고보다 심각할 때만 교체 — 함수형 업데이트로 stale closure 방지
        setRedFlagWarning((prev) => {
          const SEVERITY_ORDER: Record<string, number> = { critical: 3, urgent: 2, high: 1 }
          const incoming = SEVERITY_ORDER[warning!.severity] ?? 0
          const current = prev ? (SEVERITY_ORDER[prev.severity] ?? 0) : 0
          return incoming >= current ? warning : prev
        })
      }
    }, RED_FLAG_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [input, capturedDemographics])

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
          userInfo,
        }),
      })

      const data = await res.json()

      // G4-1: triage 결론 시점 메시지에 KTAS Level 첨부 → AnswerSourceFooter 마운트 트리거
      const acuity = data.triage?.acuity_level
      const ktasLevel: 1 | 2 | 3 | 4 | 5 | undefined =
        acuity === 1 || acuity === 2 || acuity === 3 || acuity === 4 || acuity === 5
          ? acuity
          : undefined

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply, ktasLevel },
      ])

      if (data.triage) {
        setTriage(data.triage)
      }

      // 서버가 LLM+텍스트로 확정한 인구학 정보를 OR 누적 — 한 번 true는 유지
      if (data.demographics) {
        setCapturedDemographics((prev) => ({
          pregnancy: prev.pregnancy || data.demographics.pregnancy,
          isMinor: prev.isMinor || data.demographics.isMinor,
          age: data.demographics.age ?? prev.age,
        }))
      }

      // red_flag_warning: 기존 경고보다 더 심각하면 교체, 없으면 제거하지 않음
      if (data.red_flag_warning) {
        const SEVERITY_ORDER = { critical: 3, urgent: 2, high: 1 }
        const incoming = SEVERITY_ORDER[data.red_flag_warning.severity as keyof typeof SEVERITY_ORDER] ?? 0
        const current = redFlagWarning ? (SEVERITY_ORDER[redFlagWarning.severity] ?? 0) : 0
        if (incoming >= current) {
          setRedFlagWarning(data.red_flag_warning)
        }
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
      {/* critical 경고: 스크롤 영역 밖 상단 고정 — 스크롤해도 항상 노출 */}
      {redFlagWarning?.severity === 'critical' && (
        <div className="flex-shrink-0 pb-2">
          <RedFlagWarningCard warning={redFlagWarning} seniorMode={seniorMode} />
        </div>
      )}

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
            <div className="flex flex-col max-w-[80%] gap-2">
              <div
                className={`rounded-2xl px-4 py-3 text-base leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#003876] text-white rounded-br-sm'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                }`}
              >
                {msg.content}
              </div>
              {msg.role === 'assistant' && msg.ktasLevel && (
                <AnswerSourceFooter ktasLevel={msg.ktasLevel} />
              )}
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

        {/* urgent/high 경고: 메시지 스트림 내 인라인 */}
        {redFlagWarning && redFlagWarning.severity !== 'critical' && (
          <RedFlagWarningCard warning={redFlagWarning} seniorMode={seniorMode} />
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
            placeholder={`증상을 입력하세요... (예: ${symptomExample.text})`}
            rows={2}
            className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2 text-base text-gray-900 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="p-3 rounded-xl bg-[#003876] text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            ➤
          </button>
          {/*
           * 119 응급 호출 버튼
           *
           * 동작 정책: 옵션 B (원탭 호출, 자동 다이얼 금지)
           * - tel:119 표준 링크를 통해 OS 표준 전화 발신 인터페이스로 위임
           * - 사용자가 OS 다이얼링 화면에서 발신 버튼을 명시적으로 눌러야 호출 발생
           * - 자동 다이얼 코드 사용 안 함
           *
           * 법적 근거:
           * - 응급의료법 및 통신비밀보호법상 자동 통화 발신은 사용자 동의 필요
           * - tel: 프로토콜은 OS 레벨에서 사용자 동의 절차 보장 (W3C HTML 표준)
           * - false positive 시 무고한 119 호출 방지를 위해 보수적 정책 채택
           *
           * 임상적 근거:
           * - critical/urgent 시 환자가 1탭으로 119 호출 가능 (응급 골든타임 보장)
           * - 카드 내부 + 입력창 옆 두 위치에 동일 동작 버튼 노출 (접근성 강화)
           * - 황 교수님 임상 자문 컨펌 (2026-05-02)
           */}
          {/* critical/urgent 시 입력창 옆 119 버튼 상시 노출 (high·null은 미표시) */}
          {redFlagWarning && redFlagWarning.severity !== 'high' && (
            <a
              href="tel:119"
              aria-label="119 응급 호출"
              className={`flex-shrink-0 bg-red-600 text-white rounded-xl font-bold flex flex-col items-center justify-center gap-0.5 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                redFlagWarning.severity === 'critical'
                  ? seniorMode
                    ? 'min-w-[56px] min-h-[56px] text-base animate-pulse'
                    : 'min-w-[48px] min-h-[48px] text-sm animate-pulse'
                  : seniorMode
                    ? 'min-w-[52px] min-h-[52px] text-base'
                    : 'min-w-[44px] min-h-[44px] text-xs'
              }`}
            >
              <span>📞</span>
              <span>119</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
