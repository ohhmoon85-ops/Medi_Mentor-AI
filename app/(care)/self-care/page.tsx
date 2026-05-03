'use client'

import { useState, useMemo } from 'react'
import { getRandomSymptomExample } from '@/lib/constants/symptom-examples'

interface SelfCareGuide {
  symptom: string
  doNow: string[]
  avoid: string[]
  whenToVisit: string[]
  prepItems: string[]
}

export default function SelfCarePage() {
  const [symptom, setSymptom] = useState('')
  const [guide, setGuide] = useState<SelfCareGuide | null>(null)
  const [loading, setLoading] = useState(false)
  const symptomExample = useMemo(() => getRandomSymptomExample(), [])

  async function getGuide() {
    if (!symptom.trim() || loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: symptom, type: 'self_care', persona: 'patient' }),
      })
      const data = await res.json()
      setGuide(data.guide)
    } catch {
      setGuide(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-800">자가관리 가이드</h2>
        <p className="text-gray-500 text-sm mt-1">가벼운 증상을 집에서 관리하는 방법을 안내해 드립니다</p>
      </div>

      <div className="flex gap-2">
        <input
          value={symptom}
          onChange={(e) => setSymptom(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && getGuide()}
          placeholder={`증상 입력 (예: ${symptomExample.text})`}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button
          onClick={getGuide}
          disabled={loading || !symptom.trim()}
          className="bg-[#003876] text-white px-5 py-3 rounded-xl font-semibold disabled:opacity-50 hover:bg-blue-800 transition-colors"
        >
          {loading ? '...' : '검색'}
        </button>
      </div>

      {guide && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <h3 className="font-bold text-green-800 mb-2">✅ 지금 해도 좋은 것</h3>
            <ul className="space-y-1">
              {guide.doNow.map((item, i) => (
                <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                  <span>•</span>{item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <h3 className="font-bold text-red-800 mb-2">❌ 하지 말아야 할 것</h3>
            <ul className="space-y-1">
              {guide.avoid.map((item, i) => (
                <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                  <span>•</span>{item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
            <h3 className="font-bold text-orange-800 mb-2">🏥 병원에 가야 할 때</h3>
            <ul className="space-y-1">
              {guide.whenToVisit.map((item, i) => (
                <li key={i} className="text-sm text-orange-700 flex items-start gap-2">
                  <span>•</span>{item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <h3 className="font-bold text-blue-800 mb-2">📋 준비물</h3>
            <ul className="space-y-1">
              {guide.prepItems.map((item, i) => (
                <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                  <span>•</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!guide && !loading && (
        <div className="text-center py-8 text-gray-400">
          <div className="text-4xl mb-2">🌿</div>
          <p className="text-sm">증상을 입력하면 자가관리 방법을 안내해 드립니다</p>
        </div>
      )}
    </div>
  )
}
