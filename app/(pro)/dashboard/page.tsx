'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // 개발 모드 우회 — 환경변수로 게이트 비활성화 (출시 시점 unset/false 시 정상 게이트 복귀)
    if (process.env.NEXT_PUBLIC_PRO_DEV_MODE === 'true') return
    if (typeof window !== 'undefined' && !sessionStorage.getItem('pro_verified')) {
      router.replace('/verify')
    }
  }, [router])

  const tools = [
    {
      href: '/pro/ddx',
      emoji: '🔍',
      title: '감별진단 (DDx)',
      desc: 'RAG 기반 감별진단 리스트 생성',
      shortcut: 'D',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    },
    {
      href: '/pro/red-flags',
      emoji: '🚩',
      title: 'Red Flag 확인',
      desc: '절대 놓치면 안 되는 위험 신호',
      shortcut: 'R',
      color: 'bg-red-50 border-red-200 hover:bg-red-100',
    },
    {
      href: '/pro/workup',
      emoji: '🔬',
      title: '검사 알고리즘',
      desc: '임상 결정 나무 기반 검사 순서',
      shortcut: 'W',
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    },
    {
      href: '/pro/prescribe',
      emoji: '💊',
      title: '처방 자문',
      desc: '처방 후보 + DDI 검증',
      shortcut: 'P',
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
    },
    {
      href: '/pro/mentor',
      emoji: '🎓',
      title: '멘토 모드',
      desc: 'RAG 기반 임상 자문 응답',
      shortcut: 'M',
      color: 'bg-amber-50 border-amber-200 hover:bg-amber-100',
    },
    {
      href: '/pro/soap',
      emoji: '📝',
      title: 'SOAP 노트',
      desc: '음성 기반 SOAP 노트 자동 작성',
      shortcut: 'S',
      color: 'bg-teal-50 border-teal-200 hover:bg-teal-100',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">임상 지원 도구</h2>
        <p className="text-gray-500 text-sm mt-1">근거 기반 의사결정 보조 시스템</p>
      </div>

      {/* 단축키 안내 */}
      <div className="bg-gray-100 rounded-xl px-4 py-2 text-xs text-gray-500 flex flex-wrap gap-3">
        <span className="font-semibold">단축키:</span>
        <span><kbd className="bg-white px-1.5 py-0.5 rounded border text-xs">D</kbd> DDx</span>
        <span><kbd className="bg-white px-1.5 py-0.5 rounded border text-xs">R</kbd> Red Flag</span>
        <span><kbd className="bg-white px-1.5 py-0.5 rounded border text-xs">P</kbd> 처방</span>
        <span><kbd className="bg-white px-1.5 py-0.5 rounded border text-xs">M</kbd> 멘토</span>
        <span><kbd className="bg-white px-1.5 py-0.5 rounded border text-xs">Esc</kbd> 모달 닫기</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className={`rounded-2xl border p-5 transition-colors flex items-start gap-3 ${tool.color}`}
          >
            <span className="text-3xl flex-shrink-0">{tool.emoji}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800">{tool.title}</h3>
                <kbd className="text-xs bg-white px-1.5 py-0.5 rounded border text-gray-400">
                  {tool.shortcut}
                </kbd>
              </div>
              <p className="text-sm text-gray-500 mt-1">{tool.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700">
        <strong>⚠️ 주의:</strong> 모든 AI 출력은 근거 자료와 함께 제시됩니다.
        임상적 최종 판단은 반드시 의료인 본인이 내려야 합니다.
      </div>
    </div>
  )
}
