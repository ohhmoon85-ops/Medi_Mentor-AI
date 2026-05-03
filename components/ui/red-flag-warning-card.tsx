'use client'

import { useEffect, useRef, useState } from 'react'
import type { RedFlagWarning } from '@/app/api/triage/route'

interface Props {
  warning: RedFlagWarning
  seniorMode?: boolean
}

const SEVERITY_CONFIG = {
  critical: {
    bg: 'bg-red-50',
    border: 'border-red-500',
    titleColor: 'text-red-700',
    textColor: 'text-red-700',
    badgeColor: 'bg-red-600 text-white',
    icon: '🚨',
    label: '즉시 응급',
    header: '긴급 — 119에 즉시 연락하세요',
  },
  urgent: {
    bg: 'bg-red-50',
    border: 'border-red-300',
    titleColor: 'text-red-600',
    textColor: 'text-red-600',
    badgeColor: 'bg-red-500 text-white',
    icon: '⚠️',
    label: '응급',
    header: '응급 — 응급실 방문이 필요할 수 있습니다',
  },
  high: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    titleColor: 'text-yellow-800',
    textColor: 'text-yellow-700',
    badgeColor: 'bg-yellow-500 text-white',
    icon: '⚠️',
    label: '주의 필요',
    header: '주의 — 외래 진료를 권장합니다',
  },
}

function playBeep() {
  if (typeof window === 'undefined') return
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 800
    gain.gain.value = 0.3
    osc.start()
    osc.stop(ctx.currentTime + 0.2)
    osc.onended = () => ctx.close()
  } catch {
    // silent fail — 자동 재생 차단 또는 미지원 환경
  }
}

export function RedFlagWarningCard({ warning, seniorMode = false }: Props) {
  const cfg = SEVERITY_CONFIG[warning.severity]
  const [muted, setMuted] = useState(false)
  const hasPlayedRef = useRef(false)

  // 음소거 상태 초기 로드 (SSR hydration mismatch 방지를 위해 useEffect에서)
  useEffect(() => {
    setMuted(localStorage.getItem('redFlagAudioMuted') === 'true')
  }, [])

  // 청각 출력 — mount 시 1회만 (hasPlayedRef로 React Strict Mode 이중 호출 방지)
  useEffect(() => {
    if (hasPlayedRef.current) return
    hasPlayedRef.current = true

    // localStorage 직접 읽기: state 업데이트 타이밍과 독립적으로 최신값 보장
    const isMuted = localStorage.getItem('redFlagAudioMuted') === 'true'

    if (warning.severity === 'critical') {
      if (!isMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          const utter = new SpeechSynthesisUtterance(warning.patient_message)
          utter.lang = 'ko-KR'
          utter.rate = 0.85
          window.speechSynthesis.cancel()
          window.speechSynthesis.speak(utter)
        } catch {
          // silent fail
        }
      }
    } else if (warning.severity === 'urgent') {
      if (!isMuted) playBeep()
    }
    // high: 무음
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggleMute() {
    const next = !muted
    setMuted(next)
    localStorage.setItem('redFlagAudioMuted', String(next))
    if (next && typeof window !== 'undefined') window.speechSynthesis?.cancel()
  }

  const isCritical = warning.severity === 'critical'

  // 폰트 크기: critical 항상 18px+(text-lg), urgent/high 16px+(text-base), seniorMode +50%
  const textSize = seniorMode ? 'text-xl' : isCritical ? 'text-lg' : 'text-base'
  const titleSize = seniorMode ? 'text-2xl' : isCritical ? 'text-xl' : 'text-lg'
  const iconSize = seniorMode ? 'text-5xl' : isCritical ? 'text-4xl' : 'text-3xl'
  const padding = seniorMode ? 'p-6' : isCritical ? 'p-5' : 'p-4'

  return (
    <div className={`${cfg.bg} border-2 ${cfg.border} rounded-2xl ${padding} space-y-3`}>
      {/* 헤더 */}
      <div className="flex items-start gap-3">
        <span className={`${iconSize} flex-shrink-0`}>{cfg.icon}</span>
        <div className="flex-1 min-w-0">
          <span className={`${cfg.badgeColor} text-xs font-bold px-2 py-0.5 rounded-full`}>
            {cfg.label}
          </span>
          <h3 className={`${titleSize} font-bold ${cfg.titleColor} mt-0.5 leading-snug`}>
            {cfg.header}
          </h3>
        </div>
        {/* 음소거 버튼: critical/urgent만 표시 (high는 청각 출력 없으므로 불필요) */}
        {warning.severity !== 'high' && (
          <button
            onClick={toggleMute}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 p-2 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
            title={muted ? '음소거 해제' : '음소거'}
            aria-label={muted ? '음소거 해제' : '음소거'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        )}
      </div>

      {/* 환자 메시지 */}
      <p className={`${textSize} ${cfg.textColor} leading-relaxed`}>
        {warning.patient_message}
      </p>

      {/* Don't Miss 진단 목록 (일상어) */}
      {warning.dont_miss_diagnoses.length > 0 && (
        <div className="space-y-1">
          <p className={`${textSize} font-semibold ${cfg.titleColor}`}>
            배제가 필요한 응급 상태:
          </p>
          <ul className={`${textSize} ${cfg.textColor} space-y-0.5`}>
            {warning.dont_miss_diagnoses.map((d, i) => (
              <li key={i}>• {d}</li>
            ))}
          </ul>
        </div>
      )}

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
      {/* 행동 버튼 — severity별 크기·구성 차등 */}
      <div className="flex gap-2 pt-1">
        {/* critical: 119 버튼 최대 크기 (48px+, 터치 타겟 확보) */}
        {isCritical && (
          <a
            href="tel:119"
            className={`flex-1 bg-red-600 text-white text-center font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 ${
              seniorMode ? 'text-2xl py-5 min-h-[64px]' : 'text-lg py-4 min-h-[48px]'
            }`}
          >
            📞 119 전화하기
          </a>
        )}

        {/* urgent: 119 버튼 표준 크기 */}
        {warning.severity === 'urgent' && (
          <a
            href="tel:119"
            className={`flex-1 bg-red-600 text-white text-center font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2 ${
              seniorMode ? 'text-xl py-4 min-h-[56px]' : 'text-base py-3 min-h-[40px]'
            }`}
          >
            📞 119 전화하기
          </a>
        )}

        {/* 응급실 찾기 (critical/urgent) / 가까운 의원 찾기 (high) */}
        {warning.severity !== 'high' ? (
          <a
            href="/care/hospitals"
            className={`flex-1 bg-white border-2 ${cfg.border} ${cfg.titleColor} text-center ${textSize} font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors`}
          >
            🗺️ 응급실 찾기
          </a>
        ) : (
          <a
            href="/care/hospitals"
            className={`flex-1 bg-white border-2 ${cfg.border} ${cfg.titleColor} text-center ${textSize} font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors`}
          >
            🏥 가까운 의원 찾기
          </a>
        )}
      </div>

      {/* 면책 표시 */}
      <p className="text-xs text-gray-400 text-center pt-1">
        이는 의학적 진단이 아닙니다. AI 안내는 참고 용도로만 사용하세요.
      </p>
    </div>
  )
}
